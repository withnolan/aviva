// flock.js: the s14 finale's flock (brief 11.1 row s14, T38): 24 paper dart planes crossing the sky after the release,
// flying as boids (separation, alignment, cohesion) toward a target, banking into their turns with a slight flutter,
// and steering around the cursor. The plane is the real dartPlane(7) fold of an A4 sheet, baked once on the CPU with
// folds.foldPoint (the shader's fold maths) into ONE instanced mesh; the flock is simulated on the CPU (24 x 24 checks)
// and written into the instance matrices. 1 draw call.
//
//   const flock = system.createFlock({ count: 24 });   // { object, launch(from, to), target(), avoid(), update(dt), done }
//   scene.add(flock.object);                           // world space
//   flock.launch([-2.4, 1.0, -1.2], [2.6, 1.4, -1.4]); // a loose cluster leaves `from` heading for `to` (after the release)
//   flock.avoid(x, y, z, r);                           // the cursor in world space (e.g. on a plane through the flock); r 0 = off
//   flock.update(dt);                                  // every frame
//   flock.done                                         // true once every plane is past `to` (hide it then)
//
// Options: { count: 24, speed: 1.3 (m/s), size: 1 (x a real A4 plane, 297 mm nose to tail), seed }
// Cost: 1 draw call, 5 k triangles a plane (121 k for 24; flat-shaded creases), CPU ~0.05 ms a frame.
import * as THREE from 'three';
import * as F from './folds.js';

function bakeDart(nx = 42, ny = 60) {
  // fold radii ~ half a bake cell (the live sheet's 1.1 mm assume a ~1 mm mesh): smooth creases, no sawtooth
  const folds = F.dartPlane(7, { r: 0.004 }), W = F.A4.w;
  for (const f of folds) f.q.w = Math.max(f.q.w, 0.0035);
  const H = F.A4.h, pos = [], idx = [], p = [0, 0, 0];
  for (let j = 0; j <= ny; j++) for (let i = 0; i <= nx; i++) { F.foldPoint([-W / 2 + (W * i) / nx, -H / 2 + (H * j) / ny], folds, p); pos.push(p[0], p[1], p[2]); }
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) { const a = j * (nx + 1) + i, b = a + 1, c = a + nx + 1, d = c + 1; idx.push(a, b, d, a, d, c); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx);
  // to the flight frame (measured with foldPoint: span along the sheet's z, keel toward -x, nose +y): nose -> +z,
  // up (+x, away from the keel) -> +y, span -> x; a proper rotation
  g.applyMatrix4(new THREE.Matrix4().set(0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1));
  g.computeBoundingBox(); const c = g.boundingBox.getCenter(new THREE.Vector3()); g.translate(-c.x, -c.y, -c.z);
  g.computeVertexNormals();
  return g;
}

export class Flock {
  constructor(sys, { count = 24, speed = 1.3, size = 1, seed = 3, from = [-2.4, 1.0, -1.2], to = [2.6, 1.4, -1.4] } = {}) {
    this.sys = sys; this.count = count; this.speed = speed; this.object = new THREE.Group(); this.object.name = 'paper.flock';
    const geo = bakeDart(); if (size !== 1) geo.scale(size, size, size);
    const mat = new THREE.MeshStandardMaterial({ color: '#f4f2ed', roughness: 0.8, side: THREE.DoubleSide, flatShading: true });
    this.mesh = new THREE.InstancedMesh(geo, mat, count); this.mesh.frustumCulled = false; this.mesh.castShadow = false; this.mesh.name = 'flock.planes';
    this.object.add(this.mesh);
    let a = seed; this._rnd = () => { a = (a * 16807) % 2147483647; return (a - 1) / 2147483646; };
    this.b = Array.from({ length: count }, () => ({ p: new THREE.Vector3(), v: new THREE.Vector3(), roll: 0, ph: this._rnd() * 6.28 }));
    this.goal = new THREE.Vector3(); this.from = new THREE.Vector3(); this.av = new THREE.Vector3(); this.avR = 0; this.t = 0; this.done = false;
    this._m = new THREE.Matrix4(); this._q = new THREE.Quaternion(); this._x = new THREE.Vector3(); this._y = new THREE.Vector3(); this._z = new THREE.Vector3(); this._s = new THREE.Vector3(1, 1, 1);
    this.launch(from, to);
  }
  /** a loose cluster leaves `from` for `to` */
  launch(from = this.from.toArray(), to = this.goal.toArray()) {
    this.from.set(...from); this.goal.set(...to); this.t = 0; this.done = false;
    const dir = this.goal.clone().sub(this.from).normalize(), R = this._rnd;
    for (const b of this.b) {
      b.p.set(this.from.x + (R() - 0.5) * 0.9 - dir.x * R() * 0.8, this.from.y + (R() - 0.5) * 0.5, this.from.z + (R() - 0.5) * 0.9);
      b.v.copy(dir).multiplyScalar(this.speed * (0.85 + R() * 0.3)); b.v.y += (R() - 0.5) * 0.2; b.roll = 0;
    }
    this._write(); return this;
  }
  target(x, y, z) { this.goal.set(x, y, z); return this; }
  /** steer around this point (world space, e.g. the cursor); r is the keep-out radius (m), 0 switches it off */
  avoid(x, y, z, r = 0.45) { this.av.set(x, y, z); this.avR = r; return this; }
  update(dt = 1 / 60) {
    const n = Math.max(1, Math.ceil(Math.min(dt, 0.1) / (1 / 60))), h = Math.min(dt, 0.1) / n;
    for (let k = 0; k < n; k++) this._step(h);
    this._write(); return this;
  }
  _step(h) {
    this.t += h; const B = this.b, sep = new THREE.Vector3(), ali = new THREE.Vector3(), coh = new THREE.Vector3(), acc = new THREE.Vector3(), d = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);
    let past = 0; const dirAll = this.goal.clone().sub(this.from).normalize();
    for (const b of B) {
      sep.set(0, 0, 0); ali.set(0, 0, 0); coh.set(0, 0, 0); let na = 0, nc = 0;
      for (const o of B) {
        if (o === b) continue; d.subVectors(b.p, o.p); const r = d.length();
        if (r < 0.42 && r > 1e-4) sep.addScaledVector(d, 1 / (r * r));
        if (r < 1.1) { ali.add(o.v); na++; }
        if (r < 1.5) { coh.add(o.p); nc++; }
      }
      acc.set(0, 0, 0).addScaledVector(sep, 0.05);
      if (na) acc.addScaledVector(ali.divideScalar(na).sub(b.v), 0.7);
      if (nc) acc.addScaledVector(coh.divideScalar(nc).sub(b.p), 0.45);
      // the goal: fly on past it in the same direction (the flock crosses and leaves)
      const ahead = d.subVectors(this.goal, b.p).dot(dirAll) > 0;
      if (ahead) acc.addScaledVector(d.subVectors(this.goal, b.p).normalize().multiplyScalar(this.speed).sub(b.v), 0.55); else { past++; acc.addScaledVector(dirAll.clone().multiplyScalar(this.speed).sub(b.v), 0.3); }
      // the cursor: a soft keep-out sphere, strongest at its centre
      if (this.avR > 0) { d.subVectors(b.p, this.av); const r = d.length(), R = this.avR * 1.7; if (r < R && r > 1e-4) acc.addScaledVector(d.normalize(), 7 * (1 - r / R) ** 2 * this.speed); }
      if (acc.length() > 3.2) acc.setLength(3.2);
      b.v.addScaledVector(acc, h); const sp = b.v.length(), lo = this.speed * 0.65, hi = this.speed * 1.35; if (sp < lo) b.v.setLength(lo); else if (sp > hi) b.v.setLength(hi);
      b.p.addScaledVector(b.v, h);
      // bank into the turn: the sideways part of the acceleration rolls the plane
      const right = this._x.crossVectors(b.v, up).normalize(), lat = acc.dot(right);
      b.roll += (THREE.MathUtils.clamp(lat * 0.35, -0.75, 0.75) - b.roll) * (1 - Math.exp(-h * 4));
    }
    this.done = past === B.length;
  }
  _write() {
    const up = new THREE.Vector3(0, 1, 0), M = this._m, X = this._x, Y = this._y, Z = this._z, qr = new THREE.Quaternion(), ax = new THREE.Vector3();
    this.b.forEach((b, i) => {
      Z.copy(b.v).normalize(); X.crossVectors(up, Z).normalize(); Y.crossVectors(Z, X);
      M.makeBasis(X, Y, Z); this._q.setFromRotationMatrix(M);
      const flutterR = 0.05 * Math.sin(this.t * 9 + b.ph), flutterP = 0.03 * Math.sin(this.t * 7.3 + b.ph * 1.7);
      qr.setFromAxisAngle(ax.set(0, 0, 1), b.roll + flutterR); this._q.multiply(qr); qr.setFromAxisAngle(ax.set(1, 0, 0), -0.06 + flutterP); this._q.multiply(qr);
      M.compose(b.p, this._q, this._s); this.mesh.setMatrixAt(i, M);
    });
    this.mesh.instanceMatrix.needsUpdate = true;
  }
  dispose() { this.mesh.geometry.dispose(); this.mesh.material.dispose(); this.object.removeFromParent(); }
}
