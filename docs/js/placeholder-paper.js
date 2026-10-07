// placeholder-paper.js: a stand-in for the visual-designer's paper module (docs/js/paper/), with the SAME API
// shape, so the skeleton can be judged for pacing before the real sheet is wired in (Phase 4 swaps it in
// sheet-adapter.js).
//
//   const sys = await createPlaceholderSystem(renderer, { tier });
//   sys.install(scene);                         // background, environment, lights, floor print, contact blob
//   const sheet = sys.createSheet({ name: 'hero', surface: true });
//   sheet.set({ bend: 1.5, plane: 3.5, showThrough: 0.14, inkDot: 1, tear: { p1: 1, p2: 0 } });
//   sheet.piece('T').object.position.set(…)     // after a tear: pieces T/B, then TL/TR/BL/BR (sheet-local metres)
//   sys.lights.set([['s01', 0.7], ['s02', 0.3]]).aim(sheet.object.position);
//   sys.update(scene, camera, dt);
//
// Everything is CPU-side and cheap: a 42 × 60 grid deformed in JS with the same "hinge with a bend radius" fold
// primitive the research prototype proved (tech research §2.2), a cylindrical bend, flutter, pleats and a crumple
// ball. Folding presets (plane 0–7, halving, dog-ear, peel, corner curl, fan) use the module's state keys.
// Surface marks (pencil, the ink dot, the watermark, the show-through) are painted into a small canvas texture.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export const A4 = { w: 0.21, h: 0.297 };
const TOKENS = { paper: '#F7F5F0', studio: '#ECEBE7', graphite: '#2A2926', ink: '#2E2A8E' };

/* ------------------------------------------------------------------------------------------------ folds */
// fold2D: a crease line in the sheet's own plane: point p, direction dir, `side` points to the part that moves,
// toward +1 lifts it toward +z (the viewer / up), angle in radians, radius = bend radius (m), mask = rest half-plane.
function fold2D({ p, dir, side, toward = 1, angle = Math.PI, radius = 0.0004, mask = null, t = 1 }) {
  const d = new THREE.Vector3(dir[0], dir[1], 0).normalize();
  const m = new THREE.Vector3(-d.y, d.x, 0);
  if (m.x * side[0] + m.y * side[1] < 0) m.negate();
  const a = d.clone();
  if (new THREE.Vector3().crossVectors(a, m).z < 0) a.negate();
  const u = new THREE.Vector3().crossVectors(a, m).normalize();
  return { q: new THREE.Vector3(p[0], p[1], 0), r: radius, a, m, u, th: toward * angle * t, mask };
}
const _d = new THREE.Vector3();
function applyFold(p, rx, ry, f) {
  const th = f.th;
  if (Math.abs(th) < 1e-5) return;
  if (f.mask && rx * f.mask[0] + ry * f.mask[1] + f.mask[2] < 0) return;
  _d.copy(p).sub(f.q);
  const s = _d.dot(f.m);
  if (s <= 0) return;
  const sg = Math.sign(th), t = Math.abs(th), r = Math.max(f.r, 1e-4);
  const g = _d.dot(f.a), h = _d.dot(f.u) * sg;
  const phi = Math.min(s / r, t), tail = Math.max(s - r * t, 0);
  // u' = u * sign(theta): fold toward +u for valley, −u for mountain
  const ux = f.u.x * sg, uy = f.u.y * sg, uz = f.u.z * sg;
  const mx = f.m.x, my = f.m.y, mz = f.m.z;
  const ct = Math.cos(t), st = Math.sin(t), cp = Math.cos(phi), sp = Math.sin(phi);
  const tTx = mx * ct + ux * st, tTy = my * ct + uy * st, tTz = mz * ct + uz * st;
  const nx = ux * cp - mx * sp, ny = uy * cp - my * sp, nz = uz * cp - mz * sp;
  p.set(
    f.q.x + f.a.x * g + mx * r * sp + ux * r * (1 - cp) + tTx * tail + nx * h,
    f.q.y + f.a.y * g + my * r * sp + uy * r * (1 - cp) + tTy * tail + ny * h,
    f.q.z + f.a.z * g + mz * r * sp + uz * r * (1 - cp) + tTz * tail + nz * h,
  );
}
const clamp01 = (x) => Math.max(0, Math.min(1, x));

// the 7-fold dart plane (prototype dartPlaneFolds), t = 0..7
function dartPlane(t, W = A4.w, H = A4.h) {
  const hh = H / 2, r = 0.0004, s = Math.sin(Math.PI / 8), c = Math.cos(Math.PI / 8);
  const k = (i) => clamp01(t - i);
  const wingW = 0.045, nose = [0, hh], tail = [-wingW, -hh], dir = [tail[0] - nose[0], tail[1] - nose[1]];
  return [
    fold2D({ p: [0, hh], dir: [1, -1], side: [1, 1], toward: 1, radius: r, t: k(0) }),
    fold2D({ p: [0, hh], dir: [-1, -1], side: [-1, 1], toward: 1, radius: r, t: k(1) }),
    fold2D({ p: [0, hh], dir: [s, -c], side: [c, s], toward: 1, radius: r, t: k(2) }),
    fold2D({ p: [0, hh], dir: [-s, -c], side: [-c, s], toward: 1, radius: r, t: k(3) }),
    fold2D({ p: [0, 0], dir: [0, 1], side: [1, 0], toward: -1, radius: r, t: k(4) }),
    fold2D({ p: nose, dir, side: [-1, 0], toward: 1, angle: Math.PI * 0.5, radius: 0.0012, mask: [-1, 0, 0], t: k(5) }),
    fold2D({ p: nose, dir, side: [-1, 0], toward: -1, angle: Math.PI * 0.5, radius: 0.0012, mask: [1, 0, 0], t: k(6) }),
  ];
}
// boat / hat stand-in: fold in half (top half behind), the two top corners down to the centre, a brim up.
function boat(t = 1, W = A4.w, H = A4.h) {
  const k = (i) => clamp01(t * 4 - i), r = 0.0005;
  return [
    fold2D({ p: [0, 0], dir: [1, 0], side: [0, 1], toward: -1, radius: r, t: k(0) }),
    fold2D({ p: [0, 0], dir: [1, 1], side: [-1, 1], toward: 1, radius: r, t: k(1) }),
    fold2D({ p: [0, 0], dir: [1, -1], side: [1, 1], toward: 1, radius: r, t: k(2) }),
    fold2D({ p: [0, -H / 2 + 0.032], dir: [1, 0], side: [0, -1], toward: 1, radius: r, t: k(3) }),
  ];
}

/* ------------------------------------------------------------------------------------------------ geometry */
function gridGeometry(x0, y0, w, h, sw, sh) {
  const n = (sw + 1) * (sh + 1);
  const pos = new Float32Array(n * 3), uv = new Float32Array(n * 2), rest = new Float32Array(n * 2), idx = [];
  let o = 0;
  for (let j = 0; j <= sh; j++) for (let i = 0; i <= sw; i++, o++) {
    const x = x0 + (i / sw) * w, y = y0 + (j / sh) * h;
    rest[o * 2] = x; rest[o * 2 + 1] = y;
    pos[o * 3] = x; pos[o * 3 + 1] = y;
    uv[o * 2] = x / A4.w + 0.5; uv[o * 2 + 1] = y / A4.h + 0.5;
  }
  for (let j = 0; j < sh; j++) for (let i = 0; i < sw; i++) {
    const a = j * (sw + 1) + i, b = a + 1, c = a + sw + 1, d = c + 1;
    idx.push(a, b, d, a, d, c);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage));
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 0.4);
  // perimeter loop for the edge hairline
  const loop = [];
  for (let i = 0; i <= sw; i++) loop.push(i);
  for (let j = 1; j <= sh; j++) loop.push(j * (sw + 1) + sw);
  for (let i = sw - 1; i >= 0; i--) loop.push(sh * (sw + 1) + i);
  for (let j = sh - 1; j >= 1; j--) loop.push(j * (sw + 1));
  const lg = new THREE.BufferGeometry();
  lg.setAttribute('position', g.getAttribute('position'));
  lg.setIndex(loop);
  return { g, lg, rest, sw, sh };
}

/* ------------------------------------------------------------------------------------------------ surface (canvas) */
function makeBaseCanvas(w = 512, h = 724, seed = 3) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const x = c.getContext('2d');
  x.fillStyle = '#f7f5f0'; x.fillRect(0, 0, w, h);
  // faint formation clouds + tooth: a few hundred soft blots and short fibres (placeholder only)
  let s = seed; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 260; i++) {
    const cx = r() * w, cy = r() * h, rad = 6 + r() * 30;
    const gr = x.createRadialGradient(cx, cy, 0, cx, cy, rad);
    const a = 0.018 + r() * 0.02;
    gr.addColorStop(0, `rgba(120,112,98,${a})`); gr.addColorStop(1, 'rgba(120,112,98,0)');
    x.fillStyle = gr; x.fillRect(cx - rad, cy - rad, rad * 2, rad * 2);
  }
  x.lineWidth = 0.6;
  for (let i = 0; i < 900; i++) {
    const cx = r() * w, cy = r() * h, ang = (r() - 0.5) * 1.2, len = 3 + r() * 9;
    x.strokeStyle = `rgba(90,86,78,${0.04 + r() * 0.05})`;
    x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx + Math.cos(ang) * len, cy + Math.sin(ang) * len); x.stroke();
  }
  return c;
}

class Surface {
  // the hero sheet's marks: base paper + show-through + map lines + watermark + pencil + ink front + ink dot
  constructor(base, w = 640, h = 905) {
    this.base = base;
    this.canvas = document.createElement('canvas'); this.canvas.width = w; this.canvas.height = h;
    this.ctx = this.canvas.getContext('2d');
    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.colorSpace = THREE.SRGBColorSpace;
    this.texture.anisotropy = 4;
    this.paint = null; this.print = null;
    this.key = '';
  }
  draw(S, paintVersion) {
    const k = [S.showThrough.toFixed(3), S.watermark.toFixed(2), (S.map || 0).toFixed(2), S.inkDot.toFixed(2),
      S.bleed ? S.bleed.t.toFixed(3) : 0, S.paint ? 1 : 0, paintVersion, this.print ? 1 : 0].join('|');
    if (k === this.key) return false;
    this.key = k;
    const { ctx: x, canvas: c } = this, w = c.width, h = c.height;
    x.globalAlpha = 1; x.filter = 'none'; x.globalCompositeOperation = 'source-over';
    x.drawImage(this.base, 0, 0, w, h);
    // show-through: the part of the floor wordmark under a sheet lying centred on the floor spot (hero pose)
    if (S.showThrough > 0.001 && this.print && this.print.image) {
      const img = this.print.image, P = this.print;
      const iw = img.width, ih = img.height;
      // sheet footprint in print UV (the print is P.width wide, centred at P.center, its top edge toward −z)
      // the sheet lies centred on the floor spot (0, 0), top edge toward −z; image row 0 is the print's far edge
      const pw = P.width, ph = P.width * ih / iw;
      const sx = (-A4.w / 2 - (P.center[0] - pw / 2)) / pw * iw, sw = A4.w / pw * iw;
      const sy = (-A4.h / 2 - (P.center[1] - ph / 2)) / ph * ih, sh = A4.h / ph * ih;
      x.save();
      x.globalAlpha = Math.min(1, S.showThrough * 4.2);
      x.filter = 'blur(1.6px)';
      x.globalCompositeOperation = 'multiply';
      x.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
      x.restore();
    }
    if ((S.map || 0) > 0.01) {   // v0.1: faint graphite map lines
      x.save(); x.globalAlpha = 0.3 * S.map; x.strokeStyle = '#2a2926'; x.lineWidth = 1.1;
      const pts = [[0.12, 0.7, 0.3, 0.62, 0.45, 0.66, 0.6, 0.55, 0.82, 0.58], [0.2, 0.3, 0.32, 0.38, 0.5, 0.33, 0.66, 0.4, 0.8, 0.36], [0.4, 0.1, 0.42, 0.3, 0.38, 0.5, 0.44, 0.75, 0.4, 0.92]];
      for (const l of pts) { x.beginPath(); for (let i = 0; i < l.length; i += 2) { const px = l[i] * w, py = (1 - l[i + 1]) * h; i ? x.lineTo(px, py) : x.moveTo(px, py); } x.stroke(); }
      x.restore();
    }
    if (S.watermark > 0.01) {    // v2.0: the crop-mark logomark, seen against the light
      x.save(); x.globalAlpha = 0.22 * S.watermark; x.strokeStyle = '#8f8a80'; x.lineWidth = 6;
      const cx = w / 2, cy = h * 0.5, bw = w * 0.22, bh = bw * 297 / 210, L = bw * 0.22, g = bw * 0.08;
      const corners = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
      for (const [sx, sy] of corners) {
        const px = cx + sx * bw / 2, py = cy + sy * bh / 2;
        x.beginPath(); x.moveTo(px + sx * g, py); x.lineTo(px + sx * (g + L), py); x.stroke();
        x.beginPath(); x.moveTo(px, py + sy * g); x.lineTo(px, py + sy * (g + L)); x.stroke();
      }
      x.restore();
    }
    if (S.paint && this.paint) {
      x.save(); x.globalCompositeOperation = 'multiply'; x.drawImage(this.paint.canvas, 0, 0, w, h); x.restore();
    }
    if (S.bleed && S.bleed.t > 0.001) {   // ink front stand-in: a ragged blot with tendrils (the module's shader replaces it)
      const t = S.bleed.t, at = S.bleed.at || [0, 0];
      const cx = (at[0] / A4.w + 0.5) * w, cy = (1 - (at[1] / A4.h + 0.5)) * h;
      const R = (0.004 + 0.25 * Math.sqrt(t)) * w;
      x.save();
      x.fillStyle = 'rgba(46,42,142,0.92)';
      x.beginPath();
      for (let i = 0; i <= 64; i++) {
        const ang = (i / 64) * Math.PI * 2;
        const rr = R * (1 + 0.16 * Math.sin(ang * 5 + 1.3) + 0.09 * Math.sin(ang * 11 + 0.2) + 0.05 * Math.sin(ang * 23));
        const px = cx + Math.cos(ang) * rr, py = cy + Math.sin(ang) * rr;
        i ? x.lineTo(px, py) : x.moveTo(px, py);
      }
      x.fill();
      x.strokeStyle = 'rgba(46,42,142,0.55)'; x.lineWidth = 1.2;
      for (let i = 0; i < 26; i++) {
        const ang = i * 2.39996, len = R * (1.1 + 0.6 * ((i * 37) % 10) / 10);
        x.beginPath(); x.moveTo(cx + Math.cos(ang) * R * 0.7, cy + Math.sin(ang) * R * 0.7);
        x.lineTo(cx + Math.cos(ang + 0.08) * len, cy + Math.sin(ang + 0.08) * len); x.stroke();
      }
      x.restore();
    }
    if (S.inkDot > 0.01) {
      const at = S.inkDotAt, px = (at[0] / A4.w + 0.5) * w, py = (1 - (at[1] / A4.h + 0.5)) * h;
      const rad = (S.inkDotRadius / A4.w) * w;
      x.save(); x.globalAlpha = S.inkDot; x.fillStyle = '#2E2A8E';
      x.beginPath(); x.arc(px, py, rad, 0, Math.PI * 2); x.fill(); x.restore();
    }
    this.texture.needsUpdate = true;
    return true;
  }
}

/* ------------------------------------------------------------------------------------------------ paint (pencil) */
// Canvas 2D pencil layer in sheet UV (u right, v up). The module's GPU brush replaces it in Phase 4.
export class PlaceholderPaint {
  constructor(w = 640, h = 905) {
    this.canvas = document.createElement('canvas'); this.canvas.width = w; this.canvas.height = h;
    this.ctx = this.canvas.getContext('2d');
    this.ctx.lineCap = 'round'; this.ctx.lineJoin = 'round';
    this.version = 0; this.hasInk = false; this.eraser = false;
    this._last = null; this._p = 0.7; this._t = 0;
    this.strokes = 0;
  }
  _xy(u, v) { return [u * this.canvas.width, (1 - v) * this.canvas.height]; }
  begin(u, v) { this._last = this._xy(u, v); this._t = performance.now(); this._p = 0.75; }
  to(u, v, pressure) {
    if (!this._last) return this.begin(u, v);
    const [x, y] = this._xy(u, v), [lx, ly] = this._last;
    const dist = Math.hypot(x - lx, y - ly);
    if (dist < 0.6) return;
    const now = performance.now(), dt = Math.max(1, now - this._t);
    const speed = dist / dt;                                 // px/ms
    const target = pressure ?? Math.max(0.35, Math.min(1, 1.15 - 0.5 * speed));
    this._p += (target - this._p) * 0.35;
    const c = this.ctx;
    if (this.eraser) {
      c.globalCompositeOperation = 'destination-out';
      c.strokeStyle = 'rgba(0,0,0,0.88)'; c.lineWidth = 16;
    } else {
      c.globalCompositeOperation = 'source-over';
      c.strokeStyle = `rgba(52,51,48,${0.5 + 0.45 * this._p})`; c.lineWidth = 1.4 + 1.6 * this._p;
    }
    c.beginPath(); c.moveTo(lx, ly); c.lineTo(x, y); c.stroke();
    if (!this.eraser) {        // graphite grain: a few speckles along the segment
      c.fillStyle = 'rgba(40,40,38,0.25)';
      for (let i = 0; i < dist / 3; i++) { const t = Math.random(); c.fillRect(lx + (x - lx) * t + (Math.random() - 0.5) * 2, ly + (y - ly) * t + (Math.random() - 0.5) * 2, 0.8, 0.8); }
      this.hasInk = true;
    }
    this._last = [x, y]; this._t = now; this.version++;
  }
  end() { if (this._last) this.strokes++; this._last = null; }
  setEraser(on) { this.eraser = !!on; }
  /** wipe the layer (Regenerate: a fresh sheet) */
  clear() {
    this.ctx.globalCompositeOperation = 'source-over';
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this._last = null; this.hasInk = false; this.strokes = 0; this.version++;
  }
  /** the pre-baked "quick handwriting" line for the keyboard path; progress 0..1 draws it progressively.
   *  mirror: the drawing face is the verso (seen from behind, u runs right to left), so the line still reads
   *  left to right for the visitor. */
  bakedLine(from, to, { row = 0, mirror = false } = {}) {
    const P = BAKED_LINE, n = P.length;
    const i0 = Math.floor(from * (n - 1)), i1 = Math.floor(to * (n - 1));
    const oy = -row * 0.07, U = (u) => (mirror ? 1 - u : u);
    const wasEraser = this.eraser; this.eraser = false;
    for (let i = Math.max(1, i0); i <= i1; i++) {
      const [u0, v0] = P[i - 1], [u1, v1] = P[i];
      if (i === Math.max(1, i0) && !this._last) this.begin(U(u0), v0 + oy);
      this._t = performance.now() - 30;
      this.to(U(u1), v1 + oy, 0.8);
    }
    this.eraser = wasEraser;
    if (to >= 1) this.end();
  }
}
// a scribbly cursive-like line in UV, generated once (never renders the visitor's text)
const BAKED_LINE = (() => {
  const pts = []; const r = (i) => { const s = Math.sin(i * 12.9898) * 43758.5453; return s - Math.floor(s); };
  let u = 0.17;
  for (let i = 0; i < 220; i++) {
    const t = i / 219; u = 0.17 + t * 0.62;
    const word = Math.floor(t * 6), inGap = (t * 6 - word) > 0.86;
    const amp = inGap ? 0.002 : 0.012 + 0.006 * r(word);
    const v = 0.58 + amp * Math.sin(i * 1.15 + word) + (inGap ? 0 : 0.004 * Math.sin(i * 0.37));
    pts.push([u + 0.004 * Math.sin(i * 1.15 + 1.2), v]);
  }
  return pts;
})();

/* ------------------------------------------------------------------------------------------------ the sheet */
const DEFAULT_STATE = () => ({
  bend: 0, bendAxis: Math.PI / 2, twist: 0, flutter: 0, flutterFreq: 9, flutterTime: 0, plane: 0, halving: 0, dogEar: 0,
  dogEarCorner: 'tr', peel: 0, curl: null, fan: 0, crumple: 0, thickness: 0.0001, translucency: 0.24, watermark: 0,
  showThrough: 0, inkDot: 0, inkDotAt: [0.072, -0.118], inkDotRadius: 0.0015, bleed: null, macro: 0, paint: false,
  paintFace: 1, map: 0, gain: 1, visible: true, tear: null, boat: 0, opacity: 1,
});

class PlaceholderSheet {
  constructor(sys, { name = 'sheet', width = A4.w, height = A4.h, segments = [42, 60], surface = false } = {}) {
    this.sys = sys; this.name = name; this.size = { w: width, h: height };
    this.seg = segments;
    this.object = new THREE.Group(); this.object.name = 'placeholder.' + name;
    this.state = DEFAULT_STATE();
    this.surface = surface ? new Surface(sys.baseCanvas) : null;
    if (this.surface) this.surface.print = sys.printInfo;
    this.material = new THREE.MeshStandardMaterial({
      color: 0xffffff, map: this.surface ? this.surface.texture : sys.baseTexture, roughness: 0.86, metalness: 0,
      side: THREE.DoubleSide, emissive: new THREE.Color(TOKENS.paper), emissiveIntensity: 0, transparent: false,
    });
    this.edgeMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false });
    this.pieces = []; this._mode = -1;
    this._makePieces(0);
    this._dirty = true; this.paint = null; this._time = 0;
  }
  _newPiece(key, x0, y0, w, h, center) {
    const sw = Math.max(2, Math.round(this.seg[0] * w / this.size.w)), sh = Math.max(2, Math.round(this.seg[1] * h / this.size.h));
    const geo = gridGeometry(x0, y0, w, h, sw, sh);
    const object = new THREE.Group(); object.name = `${this.object.name}.${key}`;
    object.position.set(center[0], center[1], 0);
    const mesh = new THREE.Mesh(geo.g, this.material);
    mesh.position.set(-center[0], -center[1], 0);
    mesh.frustumCulled = false;
    const edge = new THREE.LineLoop(geo.lg, this.edgeMaterial);
    edge.position.copy(mesh.position); edge.frustumCulled = false;
    object.add(mesh, edge);
    return { key, object, mesh, edge, geo, center };
  }
  _makePieces(mode) {
    if (mode === this._mode) return;
    for (const p of this.pieces) { this.object.remove(p.object); p.geo.g.dispose(); p.geo.lg.dispose(); }
    this.pieces = []; this._mode = mode;
    const W = this.size.w, H = this.size.h;
    if (mode === 0) this.pieces.push(this._newPiece('A', -W / 2, -H / 2, W, H, [0, 0]));
    if (mode === 1) {
      this.pieces.push(this._newPiece('T', -W / 2, 0, W, H / 2, [0, H / 4]));
      this.pieces.push(this._newPiece('B', -W / 2, -H / 2, W, H / 2, [0, -H / 4]));
    }
    if (mode === 2) {
      for (const [k, x0, y0, c] of [['TL', -W / 2, 0, [-W / 4, H / 4]], ['TR', 0, 0, [W / 4, H / 4]], ['BL', -W / 2, -H / 2, [-W / 4, -H / 4]], ['BR', 0, -H / 2, [W / 4, -H / 4]]]) {
        this.pieces.push(this._newPiece(k, x0, y0, W / 2, H / 2, c));
      }
    }
    for (const p of this.pieces) this.object.add(p.object);
    this._dirty = true;
  }
  piece(key) { return this.pieces.find((p) => p.key === key) || null; }
  get mesh() { return this.pieces[0].mesh; }
  attachPaint(p) { this.paint = p; if (this.surface) this.surface.paint = p; }

  set(s = {}) {
    for (const k in s) {
      if (k === 'bend' && s.bend && typeof s.bend === 'object') { this.state.bend = s.bend.k ?? 0; continue; }
      this.state[k] = s[k];
    }
    if ('tear' in s) {
      const T = s.tear;
      const mode = !T ? 0 : (T.p2 > 0 ? 2 : (T.p1 > 0 ? 1 : 0));
      this._makePieces(mode);
    }
    this._dirty = true;
    return this;
  }

  _folds() {
    const S = this.state, W = this.size.w, H = this.size.h, F = [];
    if (S.plane > 0) F.push(...dartPlane(S.plane, W, H));
    if (S.boat > 0) F.push(...boat(S.boat, W, H));
    if (S.halving > 0) {
      F.push(fold2D({ p: [0, 0], dir: [1, 0], side: [0, 1], toward: 1, radius: 0.0004, t: Math.min(1, S.halving) }));
      if (S.halving > 1) F.push(fold2D({ p: [0, 0], dir: [0, 1], side: [1, 0], toward: 1, radius: 0.0004, t: S.halving - 1 }));
    }
    if (S.dogEar > 0) {
      const sx = S.dogEarCorner.includes('r') ? 1 : -1, sy = S.dogEarCorner.includes('t') ? 1 : -1;
      F.push(fold2D({ p: [sx * (W / 2 - 0.03), sy * H / 2], dir: [sx, -sy], side: [sx, sy], toward: 1, angle: 165 * Math.PI / 180, radius: 0.0006, t: S.dogEar }));
    }
    if (S.peel > 0) {    // a bottom-edge peel sweeping up the sheet (s02 lifts it off the floor)
      const y = -H / 2 + S.peel * H * 0.9;
      F.push(fold2D({ p: [0, y], dir: [1, 0], side: [0, -1], toward: 1, angle: Math.PI * 0.55 * Math.min(1, S.peel * 2.5), radius: 0.025 }));
    }
    const C = S.curl;
    if (C && (C.t ?? 1) > 0) {
      const corner = C.corner || 'tr', sx = corner.includes('r') ? 1 : -1, sy = corner.includes('t') ? 1 : -1, sz = C.size ?? 0.06;
      F.push(fold2D({ p: [sx * (W / 2 - sz), sy * H / 2], dir: [sx, -sy], side: [sx, sy], toward: C.toward ?? 1,
        angle: (C.angle ?? 25) * Math.PI / 180, radius: C.r ?? 0.015, t: C.t ?? 1 }));
    }
    return F;
  }

  _deformPiece(p, folds) {
    const S = this.state, { rest } = p.geo, pos = p.geo.g.attributes.position.array, n = rest.length / 2;
    const v = this._v || (this._v = new THREE.Vector3());
    const k = S.bend, fl = S.flutter, ft = S.flutterTime, ff = S.flutterFreq;
    const fan = S.fan, cr = S.crumple;
    const R = 0.032, crs = cr > 0 ? cr * cr * (3 - 2 * cr) : 0;
    for (let i = 0; i < n; i++) {
      let x = rest[i * 2], y = rest[i * 2 + 1], z = 0;
      if (fan > 0) {         // accordion pleats along x, then opened into a fan
        const period = 0.015, g = 0.62 * fan, ph = x / period, tri = Math.abs(((ph % 2) + 2) % 2 - 1);
        z = (tri - 0.5) * period * Math.sin(g);
        x = x * Math.cos(g);
        const open = 3.4 * fan * 0.7, ang = x * open, rr = 0.05 + (y + this.size.h / 2);
        if (open > 0.01) { const nx = Math.sin(ang) * rr, ny = Math.cos(ang) * rr - 0.05 - this.size.h / 2; x = nx; y = ny; }
      }
      v.set(x, y, z);
      for (let f = 0; f < folds.length; f++) applyFold(v, rest[i * 2], rest[i * 2 + 1], folds[f]);
      x = v.x; y = v.y; z = v.z;
      if (Math.abs(k) > 1e-4) {   // cylindrical bend about a vertical line through the centre
        const an = x * k; const nx = Math.sin(an) / k, nz = (1 - Math.cos(an)) / k;
        x = nx; z = z * Math.cos(an) - nz;
      }
      if (fl > 1e-5) {
        z += fl * (Math.sin(x * ff * 6.3 + ft * 2.1) * 0.6 + Math.sin(y * ff * 4.1 - ft * 1.7 + 1.3) * 0.4) * (0.35 + 0.65 * Math.abs(y / (this.size.h / 2)));
      }
      if (crs > 0) {             // a ball: octahedral map of the rectangle onto a lumpy sphere
        let ox = rest[i * 2] / (this.size.w / 2), oy = rest[i * 2 + 1] / (this.size.h / 2), oz = 1 - Math.abs(ox) - Math.abs(oy);
        if (oz < 0) { const tx = (1 - Math.abs(oy)) * Math.sign(ox), ty = (1 - Math.abs(ox)) * Math.sign(oy); ox = tx; oy = ty; }
        const L = Math.hypot(ox, oy, oz) || 1; ox /= L; oy /= L; oz /= L;
        const bump = 1 + 0.18 * Math.sin(ox * 9.1 + oy * 4.3) * Math.sin(oy * 7.7 - oz * 5.1) + 0.08 * Math.sin(oz * 17 + ox * 13);
        const rr = R * bump * (1 - 0.15 * (1 - crs));
        x = x + (ox * rr - x) * crs; y = y + (oy * rr - y) * crs; z = z + (oz * rr - z) * crs;
      }
      pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z;
    }
    p.geo.g.attributes.position.needsUpdate = true;
    p.geo.g.computeVertexNormals();
  }

  update(camera, dt = 0) {
    const S = this.state;
    if (S.flutter > 1e-5) { this._time += dt; S.flutterTime = this._time; this._dirty = true; }
    if (this._dirty) {
      const folds = this._folds();
      for (const p of this.pieces) this._deformPiece(p, folds);
      this._dirty = false;
    }
    this.object.visible = S.visible !== false;
    this.material.opacity = S.opacity ?? 1;
    this.material.transparent = (S.opacity ?? 1) < 0.999;
    this.material.depthWrite = !this.material.transparent;
    // backlit glow stand-in for translucency (the module does real light-through-paper)
    const back = this.sys.backLight * (S.translucency ?? 0.24) * 1.6;
    this.material.emissiveIntensity = back + (S.gain - 1) * 0.5;
    if (this.surface) this.surface.draw(S, this.paint ? this.paint.version : 0);
    // the 0.1 mm edge: show a hairline only when the sheet is near edge-on to the camera
    if (camera) {
      this.object.getWorldQuaternion(_q); _n.set(0, 0, 1).applyQuaternion(_q);
      this.object.getWorldPosition(_p); _v2.copy(camera.position).sub(_p).normalize();
      const edgeOn = 1 - Math.abs(_n.dot(_v2));
      this.edgeMaterial.opacity = Math.min(1, Math.max(0, (edgeOn - 0.9) / 0.08)) * (S.opacity ?? 1);
    }
  }
  dispose() { for (const p of this.pieces) { p.geo.g.dispose(); p.geo.lg.dispose(); } this.material.dispose(); this.edgeMaterial.dispose(); }
}
const _q = new THREE.Quaternion(), _n = new THREE.Vector3(), _p = new THREE.Vector3(), _v2 = new THREE.Vector3();

/* ------------------------------------------------------------------------------------------------ simple light rig */
// Used only if the module's lights.js cannot be imported. Directions are in view space (x right, y up, z to the camera).
const SIMPLE_PRESETS = {
  studio: { key: [-0.58, 0.62, 0.52, 2.6, '#fff4e8'], fill: [0.85, 0.15, 0.5, 0.32], back: 0, env: 0.5 },
};
class SimpleRig {
  constructor() {
    this.group = new THREE.Group();
    this.key = new THREE.DirectionalLight(0xffffff, 2.6); this.fill = new THREE.DirectionalLight(0xffffff, 0.3);
    this.back = new THREE.DirectionalLight(0xffffff, 0);
    this.target = new THREE.Object3D(); this.group.add(this.target, this.key, this.fill, this.back);
    for (const l of [this.key, this.fill, this.back]) l.target = this.target;
    this.focus = new THREE.Vector3(); this.state = SIMPLE_PRESETS.studio;
  }
  set() { return this; }
  aim(v) { this.focus.copy(v); return this; }
  apply({ camera, scene }) {
    const q = camera.quaternion, S = this.state;
    this.target.position.copy(this.focus);
    this.key.position.set(S.key[0], S.key[1], S.key[2]).applyQuaternion(q).multiplyScalar(3).add(this.focus);
    this.fill.position.set(S.fill[0], S.fill[1], S.fill[2]).applyQuaternion(q).multiplyScalar(3).add(this.focus);
    this.key.intensity = S.key[3]; this.fill.intensity = S.fill[3];
    if (scene) scene.environmentIntensity = S.env;
  }
  keyDirection(out = new THREE.Vector3()) { return out.copy(this.key.position).sub(this.focus).normalize(); }
}

/* ------------------------------------------------------------------------------------------------ the system */
export async function createPlaceholderSystem(renderer, opts = {}) {
  const tier = opts.tier ?? 2;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = false;

  // lights: the module's rig and presets if available (same moods per section), else a simple rig
  let lights = null, presets = null;
  try {
    const L = await import('./paper/lights.js');
    lights = new L.LightRig({ shadowSize: 0 });
    presets = L.LIGHT_PRESETS;
  } catch (e) {
    console.warn('[placeholder] using a simple light rig:', e.message);
    lights = new SimpleRig();
  }

  const baseCanvas = makeBaseCanvas();
  const baseTexture = new THREE.CanvasTexture(baseCanvas);
  baseTexture.colorSpace = THREE.SRGBColorSpace; baseTexture.anisotropy = 4;

  const pmrem = new THREE.PMREMGenerator(renderer);
  const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
  pmrem.dispose();

  // the floor print (giant wordmark) + a soft contact blob, both on the floor plane y = 0
  const printInfo = { image: null, width: 0.96, center: [0, -0.01] };
  const printMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 1, depthWrite: false, toneMapped: false });
  const print = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), printMat);
  print.rotation.x = -Math.PI / 2; print.position.y = 0.0002; print.renderOrder = -2; print.visible = false;
  const blobTex = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
    const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, 'rgba(0,0,0,0.55)'); g.addColorStop(0.55, 'rgba(0,0,0,0.22)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = g; x.fillRect(0, 0, 128, 128); const t = new THREE.CanvasTexture(c); return t;
  })();
  const blob = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false, opacity: 0, color: 0x2a2620, toneMapped: false }));
  blob.rotation.x = -Math.PI / 2; blob.position.y = 0.0004; blob.renderOrder = -1;
  const studioGroup = new THREE.Group(); studioGroup.name = 'placeholder.studio'; studioGroup.add(print, blob);

  const sheets = new Set();
  const sys = {
    kind: 'placeholder', THREE, tier, renderer, lights, presets, baseCanvas, baseTexture, printInfo, sheets,
    environment: envRT.texture, backLight: 0, studio: studioGroup,
    install(scene) {
      scene.environment = envRT.texture; scene.environmentIntensity = 0.5;
      scene.background = new THREE.Color(TOKENS.studio);
      scene.add(studioGroup, lights.group);
      this.scene = scene; return this;
    },
    createSheet(o = {}) { const s = new PlaceholderSheet(sys, o); sheets.add(s); return s; },
    setColors() {},
    setFloorPrint({ texture = null, center = printInfo.center, width = printInfo.width, opacity = 1, visible = true } = {}) {
      if (texture) { printMat.map = texture; printMat.needsUpdate = true; }
      printInfo.center = center; printInfo.width = width;
      const img = printMat.map && printMat.map.image, aspect = img ? img.width / img.height : 2.54;
      print.scale.set(width, width / aspect, 1); print.position.x = center[0]; print.position.z = center[1];
      printMat.opacity = opacity; print.visible = visible && !!printMat.map && opacity > 0.002;
      return { width, depth: width / aspect };
    },
    async loadFloorPrint(url) {
      try {
        const tex = await new THREE.TextureLoader().loadAsync(url);
        tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
        printMat.map = tex; printMat.needsUpdate = true; printInfo.image = tex.image;
        for (const s of sheets) if (s.surface) s.surface.key = '';
        return true;
      } catch { return false; }
    },
    /** contact blob under a sheet near the floor: strength 0..1, footprint in metres */
    contactBlob(x, z, height, strength, w = 0.24, h = 0.32) {
      const lift = Math.max(0, height);
      const spread = 1 + lift * 9;
      blob.position.set(x + lift * 0.25, 0.0004, z + lift * 0.15);
      blob.scale.set(w * spread * 1.15, h * spread * 1.08, 1);
      blob.material.opacity = strength * Math.max(0, 1 - lift * 4.5) * 0.85;
      blob.visible = blob.material.opacity > 0.003;
    },
    ensureMacro() { return null; },
    async createPaint() { return new PlaceholderPaint(); },
    update(scene, camera, dt = 1 / 60) {
      lights.apply({ camera, renderer, scene, backdrop: null, contact: null });
      this.backLight = lights.back ? lights.back.intensity / Math.max(0.01, (lights.state.back?.dist ?? 1.6) ** 2) : 0;
      for (const s of sheets) s.update(camera, dt);
    },
    dispose() { for (const s of sheets) s.dispose(); envRT.dispose(); baseTexture.dispose(); },
  };
  return sys;
}
