// cleanup.js: the s13b cleanup (brief 11.1 row s13b, T37): the visitor's debris (crumpled balls, torn quarters, the boat,
// the plane) falls into, or beside, a wire-mesh office bin on the studio floor, under a small custom rigid-body solver
// (sphere colliders, gravity, the floor, the bin's tapered wall inside and out, body contacts, damping, sleep), and the
// cursor nudges it with a push field. Every item is a real sheet of the paper system (baked crumple, tear pieces, the
// boat mesh, the folded plane), so it matches the rest of the site.
//
//   const cleanup = system.createCleanup();      // { object, drop(kind), push(x, y, z, r, s), update(dt), count, ready }
//   scene.add(cleanup.object);                   // origin: the floor; the bin at binAt
//   await cleanup.ready;                         // the baked crumple has loaded
//   cleanup.drop('crumple' | 'quarter' | 'boat' | 'plane', { into })   // into: true / false / undefined (60 % go in)
//   cleanup.push(x, y, z, r, strength);          // the pointer's push for this update (world space; r m; strength m/s)
//   cleanup.update(dt);  cleanup.count           // every frame; the number of items so far
//
// Cost: one paper sheet per item (a torn sheet serves four quarters; light meshes), the bin 3 draws; the solver is
// O(n^2) over a few dozen bodies with sleeping, well under 0.1 ms.
import * as THREE from 'three';
import { buildDart } from './flock.js';

const KINDS = {
  crumple: { r: 0.034, wall: 0.034, rest: 0.034, roll: true },    // wall: the item's reach for the bin's wall (its half-extent)
  quarter: { r: 0.046, wall: 0.08, rest: 0.0015, flat: true },
  boat: { r: 0.058, wall: 0.075, rest: 0.0375 },
  plane: { r: 0.07, wall: 0.155, rest: 0.03, outside: true },   // 306 mm: longer than the bin is wide, so it lands beside it
};
const BOAT_C = new THREE.Vector3(0, 0.111, 0);   // the boat's body centre in its sheet's frame
let _dart = null, _dartMat = null;                // the plane: the flock's crisp 16-triangle dart (shared)
const _q = new THREE.Quaternion(), _v = new THREE.Vector3(), _w = new THREE.Vector3(), UP = new THREE.Vector3(0, 1, 0);

function meshTexture() {
  // the wire mesh: a diamond lattice (white = wire) for an alpha map
  const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
  x.fillStyle = '#000'; x.fillRect(0, 0, 128, 128); x.strokeStyle = '#fff'; x.lineWidth = 5;
  x.beginPath(); x.moveTo(0, 0); x.lineTo(128, 128); x.moveTo(128, 0); x.lineTo(0, 128); x.moveTo(-64, 64); x.lineTo(64, -64); x.moveTo(64, 192); x.lineTo(192, 64);
  x.moveTo(-64, 64); x.lineTo(64, 192); x.moveTo(64, -64); x.lineTo(192, 64); x.stroke();
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(22, 7); t.colorSpace = THREE.NoColorSpace; t.anisotropy = 8; return t;
}
function labelTexture() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 96; const x = c.getContext('2d');
  x.fillStyle = '#e8f06a'; x.fillRect(0, 0, 256, 96); x.strokeStyle = 'rgba(42,41,38,0.55)'; x.lineWidth = 3; x.strokeRect(8, 8, 240, 80);
  x.fillStyle = '#2a2926'; x.font = '600 40px "Hanken Grotesk", Arial, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('P A P E R', 128, 50);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

export class Cleanup {
  constructor(sys, { binAt = [0.2, 0, -0.06], radius = 0.14, height = 0.29, seed = 13 } = {}) {
    this.sys = sys; this.object = new THREE.Group(); this.object.name = 'paper.cleanup';
    let a = seed; this._rnd = () => { a = (a * 16807) % 2147483647; return (a - 1) / 2147483646; };
    this.bin = { c: new THREE.Vector3(...binAt), R0: radius * 0.86, R1: radius, H: height };
    // the bin: a tapered wire-mesh basket (graphite steel), rolled rims, a solid base and a yellow PAPER label
    const B = this.bin, steel = new THREE.MeshStandardMaterial({ color: '#3b3d42', metalness: 0.6, roughness: 0.42 });
    const wall = new THREE.Mesh(new THREE.CylinderGeometry(B.R1, B.R0, B.H, 64, 1, true).translate(0, B.H / 2, 0),
      new THREE.MeshStandardMaterial({ color: '#3b3d42', metalness: 0.6, roughness: 0.42, alphaMap: meshTexture(), alphaTest: 0.5, side: THREE.DoubleSide }));
    const rims = new THREE.Mesh(new THREE.TorusGeometry(B.R1, 0.004, 8, 64).rotateX(Math.PI / 2).translate(0, B.H, 0), steel);
    const foot = new THREE.Mesh(new THREE.TorusGeometry(B.R0, 0.005, 8, 64).rotateX(Math.PI / 2).translate(0, 0.004, 0), steel);
    const base = new THREE.Mesh(new THREE.CircleGeometry(B.R0, 48).rotateX(-Math.PI / 2).translate(0, 0.005, 0), steel);
    const lab = new THREE.Mesh(new THREE.CylinderGeometry(B.R1 * 0.93 + 0.002, B.R1 * 0.93 + 0.002, 0.045, 24, 1, true, -0.38, 0.76).translate(0, B.H * 0.62, 0),
      new THREE.MeshStandardMaterial({ map: labelTexture(), roughness: 0.8, side: THREE.DoubleSide }));
    for (const m of [wall, rims, foot, base, lab]) { m.position.add(B.c); m.castShadow = true; m.receiveShadow = true; this.object.add(m); }
    this.bodies = []; this._spare = []; this._push = null;
    this.ready = sys.loadCrumple ? sys.loadCrumple() : Promise.resolve();
  }
  get count() { return this.bodies.length; }
  _R(y) { const B = this.bin, t = THREE.MathUtils.clamp(y / B.H, 0, 1); return B.R0 + (B.R1 - B.R0) * t; }
  /** add one item, dropped from above into (or beside) the bin */
  drop(kind = 'crumple', { into } = {}) {
    const K = KINDS[kind]; if (!K) return null;
    const R = this._rnd, B = this.bin; if (into === undefined) into = R() < 0.6; if (K.outside) into = false;
    let vis;
    if (kind === 'quarter') {
      if (!this._spare.length) {
        const s = this.sys.createSheet({ name: 'debrisTorn', segments: [64, 91] }); s.set({ tear: { p1: 1, p2: [1, 1], gap: 0.0015 } });
        s.update(null); this.object.add(s.object); this._spare = [...s.pieces]; for (const p of this._spare) p.object.visible = false;
      }
      const piece = this._spare.pop(); piece.object.visible = true; vis = { piece };
    } else if (kind === 'plane') {
      _dart = _dart || buildDart(); _dartMat = _dartMat || new THREE.MeshStandardMaterial({ color: '#f4f2ed', vertexColors: true, roughness: 0.8, side: THREE.DoubleSide, flatShading: true });
      const m = new THREE.Mesh(_dart, _dartMat); m.castShadow = m.receiveShadow = true; m.name = 'debris.plane'; this.object.add(m); vis = { mesh: m };
    } else {
      const s = this.sys.createSheet({ name: 'debris' + kind, segments: [64, 91] });
      s.set(kind === 'crumple' ? { crumple: 1 } : { boat: 1 }); this.object.add(s.object); vis = { sheet: s };
    }
    const ang = into ? R() * Math.PI * 2 : Math.PI * (0.08 + R() * 0.84), d = into ? R() * Math.max(0, B.R0 - K.wall) * 0.8 : B.R1 + K.wall + 0.02 + R() * 0.18;   // misses land on the front (+z) side, toward the viewer
    const yaw = R() * Math.PI * 2, b = {
      kind, K, vis, inside: into, ground: false, asleep: false, still: 0,
      p: new THREE.Vector3(B.c.x + Math.cos(ang) * d, B.H + 0.2 + R() * 0.25, B.c.z + Math.sin(ang) * d),
      v: new THREE.Vector3((R() - 0.5) * 0.3, -0.2, (R() - 0.5) * 0.3), w: new THREE.Vector3((R() - 0.5) * 8, (R() - 0.5) * 8, (R() - 0.5) * 8),
      q: new THREE.Quaternion().setFromEuler(new THREE.Euler(R() * 6.28, R() * 6.28, R() * 6.28)),
      rest: kind === 'quarter' ? new THREE.Quaternion().setFromEuler(new THREE.Euler(R() < 0.5 ? -Math.PI / 2 : Math.PI / 2, yaw, 0, 'YXZ'))
        : kind === 'boat' ? new THREE.Quaternion().setFromAxisAngle(UP, yaw)
        : kind === 'plane' ? new THREE.Quaternion().setFromAxisAngle(UP, yaw).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), 0.42))   // on its keel, one wing down
        : null,
    };
    this.bodies.push(b); this._write(b); return b;
  }
  /** the pointer's push for this update: bodies within r (m) of (x, y, z) are shoved away, strongest at the centre */
  push(x, y, z, r = 0.15, strength = 0.8) { this._push = { p: new THREE.Vector3(x, y, z), r, s: strength }; return this; }
  update(dt = 1 / 60) {
    dt = Math.min(dt, 0.1);
    if (this._push) for (const b of this.bodies) {
      _v.subVectors(b.p, this._push.p); _v.y = Math.max(0, _v.y) * 0.3; const d = _v.length();
      if (d < this._push.r && d > 1e-4) { b.v.addScaledVector(_v.normalize(), this._push.s * (1 - d / this._push.r)); b.v.y += 0.4 * this._push.s * (1 - d / this._push.r); b.asleep = false; b.still = 0; }
    }
    this._push = null;
    const n = Math.ceil(dt / (1 / 240)), h = dt / n;
    for (let k = 0; k < n; k++) this._step(h);
    for (const b of this.bodies) this._write(b);
    return this;
  }
  _step(h) {
    const B = this.bin, bs = this.bodies;
    for (const b of bs) {
      if (b.asleep) continue;
      b.v.y -= 9.81 * h; b.v.multiplyScalar(Math.exp(-0.35 * h)); b.p.addScaledVector(b.v, h); b.ground = false;
      // the bin's wall: below the rim a body stays on the side it came from
      const dx = b.p.x - B.c.x, dz = b.p.z - B.c.z, dist = Math.hypot(dx, dz) || 1e-6, yb = b.p.y - B.c.y;
      if (yb < B.H + b.K.r * 0.3) {
        const Rw = this._R(yb), lim = b.inside ? Rw - b.K.wall : Rw + b.K.wall * 0.9;
        if (b.inside ? dist > lim : dist < lim) {
          const nx = dx / dist, nz = dz / dist, s = lim - dist; b.p.x += nx * s; b.p.z += nz * s;
          const vr = b.v.x * nx + b.v.z * nz; if (b.inside ? vr > 0 : vr < 0) { b.v.x -= 1.3 * vr * nx; b.v.z -= 1.3 * vr * nz; }
        }
      } else b.inside = dist < B.R1 - b.K.r * 0.3;
      // the floor (inside: the bin's base)
      const fy = (b.inside && dist < B.R1 ? B.c.y + 0.006 : 0) + b.K.rest;
      if (b.p.y < fy) { b.p.y = fy; if (b.v.y < 0) b.v.y *= -0.18; b.v.x *= 1 - 6 * h; b.v.z *= 1 - 6 * h; b.ground = true; }
    }
    // body contacts (sphere colliders, a little soft so flat items can nestle)
    for (let i = 0; i < bs.length; i++) for (let j = i + 1; j < bs.length; j++) {
      const a = bs[i], c = bs[j]; if (a.asleep && c.asleep) continue;
      _v.subVectors(a.p, c.p); const d = _v.length(), m = (a.K.r + c.K.r) * 0.8;
      if (d >= m || d < 1e-6) continue;
      _v.divideScalar(d); const pen = m - d, wa = c.asleep ? 1 : a.asleep ? 0 : 0.5, wc = 1 - wa;
      a.p.addScaledVector(_v, pen * wa); c.p.addScaledVector(_v, -pen * wc);
      const rel = _w.subVectors(a.v, c.v).dot(_v);
      if (rel < 0) { const imp = -1.15 * rel; a.v.addScaledVector(_v, imp * wa); c.v.addScaledVector(_v, -imp * wc); if (Math.abs(rel) > 0.25) { a.asleep = c.asleep = false; } }
      if (_v.y > 0.5) a.ground = true; if (_v.y < -0.5) c.ground = true;
    }
    for (const b of bs) {
      if (b.asleep) continue;
      // orientation: crumples roll on what they rest on; the others tumble in the air and settle into their rest pose
      if (b.K.roll) {
        if (b.ground) b.w.crossVectors(UP, b.v).divideScalar(b.K.r); else b.w.multiplyScalar(Math.exp(-0.5 * h));
      } else if (b.ground && b.rest) {
        b.q.slerp(b.rest, 1 - Math.exp(-h * 9)); b.w.multiplyScalar(Math.exp(-12 * h));
      }
      const wl = b.w.length(); if (wl > 1e-5) { _q.setFromAxisAngle(_w.copy(b.w).divideScalar(wl), wl * h); b.q.premultiply(_q); }
      // sleep once it has been still on something for a moment
      if (b.ground && b.v.lengthSq() < 0.0009) { b.still += h; if (b.still > 0.6) { b.asleep = true; b.v.set(0, 0, 0); b.w.set(0, 0, 0); if (b.rest) b.q.copy(b.rest); } } else b.still = 0;
    }
  }
  _write(b) {
    if (b.vis.piece) { const P = b.vis.piece; P.object.quaternion.copy(b.q); P.object.position.copy(b.p); return; }   // a piece's object sits at its own centre
    const o = b.vis.mesh || b.vis.sheet.object; o.quaternion.copy(b.q);
    const off = b.kind === 'boat' ? BOAT_C : null;
    if (off) o.position.copy(b.p).sub(_v.copy(off).applyQuaternion(b.q)); else o.position.copy(b.p);
  }
  dispose() {
    for (const b of this.bodies) if (b.vis.sheet) b.vis.sheet.dispose();
    this.object.traverse((o) => { if (o.isMesh && o.parent === this.object && !o.name.startsWith('paper.') && o.name !== 'debris.plane') { o.geometry.dispose(); if (o.material.map) o.material.map.dispose(); if (o.material.alphaMap) o.material.alphaMap.dispose(); o.material.dispose(); } });
    this.object.removeFromParent();
  }
}
