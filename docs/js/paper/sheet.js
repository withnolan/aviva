// sheet.js: one sheet of aviva A4 (or any A-size), driven by a small state object.
//
//   const sheet = system.createSheet({ segments: [128, 182] });
//   scene.add(sheet.object);                       // position / rotate / scale sheet.object freely (metres)
//   sheet.set({ bend: 2, flutter: 0.008, plane: 3.5, showThrough: 0.14, inkDot: 1 });   // only the keys you pass change
//   // each frame: system.update(scene, camera) calls sheet.update(camera)
//
// State keys (all optional; ranges and costs in README.md):
//   bend (1/m) | { k, axis, twist }   bendAxis (rad, default PI/2 = bend line vertical)   twist (rad/m)
//   flutter (m) flutterFreq (1/m) flutterTime (s; auto-advances when flutterAuto)       cockle (m)
//   folds [fold2D...]   plane 0..7   halving 0..2   sixfold 0..6   dogEar 0..1 (+dogEarCorner)   peel 0..1
//   curl { corner:'tr'|..., or edge:'bottom'|..., t|at, r, angle, size, taper, toward }
//   fan 0..1 | { period, gamma, open, pivot }        crumple 0..1 (baked; swaps in the crumple mesh)
//   thickness (m, 0.0001 real)   translucency 0..1   watermark 0..1   showThrough 0..1
//   inkDot 0..1 (+ inkDotAt [x,y] m, inkDotRadius m)   bleed { t, at:[x,y], radiusMM, amount, grade }
//   macro 0..1   paint true|false (+ paintFace 1|-1|0)   overlay { texture, opacity, face }
//   creases [{ n:[nx,ny], d, strength }] (<= 4, remembered folds)   gain   visible
//   tear { p1: 0..1, p2: 0..1 | [top, bottom], gap (m), jag (m) }   -> pieces: sheet.piece('T'|'B'|'TL'|'TR'|'BL'|'BR')
import * as THREE from 'three';
import { createSheetGeometry, releaseSheetGeometry } from './geometry.js';
import { makeSheetUniforms, createPaperMaterial, createPaperDepthMaterial, createCasterMaterial, createPickMaterial, MAX_CREASES } from './material.js';
import { MAX_FOLDS } from './glsl.js';
import * as F from './folds.js';

const DEFAULT_STATE = () => ({
  bend: 0, bendAxis: Math.PI / 2, twist: 0, flutter: 0, flutterFreq: 9, flutterTime: 0, flutterAuto: false, cockle: 0.0003,
  folds: null, plane: 0, halving: 0, sixfold: 0, dogEar: 0, dogEarCorner: 'tr', peel: 0, curl: null, fan: 0, crumple: 0,
  thickness: 0.0001, translucency: 0.24, watermark: 0, showThrough: 0, inkDot: 0, inkDotAt: [0.072, -0.118], inkDotRadius: 0.0015,
  bleed: null, macro: 0, paint: false, paintFace: 1, overlay: null, creases: null, gain: 1, visible: true, tear: null,
});

let SEED = 1;

export class Sheet {
  constructor(sys, { width = 0.21, height = 0.297, segments = null, name = 'sheet', castShadow = true, contact = true, seed = SEED++ } = {}) {
    this.sys = sys; this.name = name; this.size = { w: width, h: height };
    const seg = segments || sys.segmentsFor(width);
    this.segments = seg;
    this.geometry = createSheetGeometry(seg[0], seg[1], this.size);
    this.uniforms = makeSheetUniforms(sys.shared, this.size);
    this.uniforms.uDeformEps.value = 0.5 * width / seg[0];
    // every sheet gets its own patch of formation (no two sheets look identical)
    const rnd = mulberry(seed * 9301 + 49297);
    this.uniforms.uFormP.value.x = rnd(); this.uniforms.uFormP.value.y = rnd();
    this.uniforms.uCockle.value.z = rnd() * 50;
    this.object = new THREE.Group(); this.object.name = 'paper.' + name;
    this.castShadow = castShadow; this.contact = contact;
    this.state = DEFAULT_STATE();
    this.pieces = [];
    this._pieceMode = 0;     // 0 whole, 1 halves (T/B), 2 quarters
    this._makePieces(0);
    this._folds = [];
    this._dirtyFolds = true;
    this.pixelSize = 0.0005; this.halfThick = 0.00005;
    this.crumpleMesh = null; this._crumpleLoading = null;
    this.paint = null;
  }

  /* ------------------------------------------------------------------ pieces (tearing) */
  _newPiece(key, uniforms, center) {
    const object = new THREE.Group(); object.name = `paper.${this.name}.${key}`;
    object.position.set(center[0], center[1], 0);
    const mesh = new THREE.Mesh(this.geometry, createPaperMaterial(uniforms, { variant: 'slab' }));
    mesh.position.set(-center[0], -center[1], 0);
    mesh.frustumCulled = false; mesh.castShadow = this.castShadow; mesh.receiveShadow = true;
    mesh.customDepthMaterial = createPaperDepthMaterial(uniforms, 'slab');
    object.add(mesh);
    let caster = null;
    if (this.contact && this.sys.contact) {
      caster = new THREE.Mesh(this.geometry, createCasterMaterial(uniforms, this.sys.contact.uniforms, 'slab'));
      caster.frustumCulled = false; caster.layers.set(this.sys.contact.layer); mesh.add(caster);
    }
    return { key, object, mesh, caster, uniforms, center, pick: null };
  }
  _makePieces(mode) {
    for (const p of this.pieces) { this.object.remove(p.object); p.mesh.material.dispose(); p.mesh.customDepthMaterial.dispose(); if (p.caster) p.caster.material.dispose(); if (p.pick) p.pick.material.dispose(); }
    this.pieces = []; this._pieceMode = mode;
    const W = this.size.w, H = this.size.h;
    const own = () => ({ ...this.uniforms, uTear0: { value: new THREE.Vector4() }, uTear1: { value: new THREE.Vector4() }, uTearFx0: { value: new THREE.Vector4(1, 0, 0.0016, 55) }, uTearFx1: { value: new THREE.Vector4(1, 0, 0.0016, 55) } });
    if (mode === 0) this.pieces.push(this._newPiece('A', this.uniforms, [0, 0]));
    if (mode === 1) { this.pieces.push(this._newPiece('T', own(), [0, H / 4])); this.pieces.push(this._newPiece('B', own(), [0, -H / 4])); }
    if (mode === 2) for (const [k, c] of [['TL', [-W / 4, H / 4]], ['TR', [W / 4, H / 4]], ['BL', [-W / 4, -H / 4]], ['BR', [W / 4, -H / 4]]]) this.pieces.push(this._newPiece(k, own(), c));
    for (const p of this.pieces) this.object.add(p.object);
  }
  /** a piece by key: 'A' (whole), 'T' / 'B' (after tear 1), 'TL' 'TR' 'BL' 'BR' (after tear 2) */
  piece(key) { return this.pieces.find((p) => p.key === key) || null; }
  get mesh() { return this.pieces[0].mesh; }

  /* ------------------------------------------------------------------ state */
  set(s = {}) {
    const S = this.state;
    for (const k in s) {
      if (k === 'bend' && typeof s.bend === 'object' && s.bend) { S.bend = s.bend.k ?? 0; if (s.bend.axis !== undefined) S.bendAxis = s.bend.axis; if (s.bend.twist !== undefined) S.twist = s.bend.twist; continue; }
      S[k] = s[k];
    }
    if (['folds', 'plane', 'halving', 'sixfold', 'dogEar', 'dogEarCorner', 'peel', 'curl'].some((k) => k in s)) this._dirtyFolds = true;
    this._apply(s);
    return this;
  }
  reset() { this.state = DEFAULT_STATE(); this._dirtyFolds = true; this._apply(this.state); if (this._pieceMode) this._makePieces(0); return this; }

  _apply(s) {
    const S = this.state, U = this.uniforms;
    U.uBend.value.set(S.bend, S.bendAxis, S.twist, 0);
    U.uFlutter.value.x = S.flutter; U.uFlutter.value.y = S.flutterFreq; U.uFlutter.value.z = S.flutterTime;
    U.uCockle.value.x = S.cockle;
    if ('fan' in s) {
      const f = typeof S.fan === 'number' ? (S.fan > 0 ? F.fan(S.fan) : null) : S.fan;
      if (f) U.uPleat.value.set(f.period ?? 0.015, f.gamma ?? 0.6, f.open ?? 0, f.pivot ?? 0.05); else U.uPleat.value.y = 0;
    }
    U.uTransP.value.x = S.translucency; U.uTransP.value.w = S.watermark;
    U.uShow.value.x = S.showThrough;
    U.uInkDot.value.set(S.inkDotAt[0], S.inkDotAt[1], S.inkDotRadius, S.inkDot);
    const b = S.bleed;
    if (b) { U.uBleed.value.set(b.at ? b.at[0] : 0, b.at ? b.at[1] : 0, b.t ?? 0, b.radiusMM ?? 8); U.uBleedP.value.set(b.amount ?? 1, b.grade ?? 0, 0, 0); }
    else U.uBleedP.value.set(0, 0, 0, 0);
    U.uMacroP.value.z = S.macro;
    U.uPaintP.value.x = S.paint && this.paint ? 1 : 0; U.uPaintP.value.y = S.paintFace;
    if (this.paint) U.uPaint.value = this.paint.texture;
    if (S.overlay && S.overlay.texture) { U.uOverlay.value = S.overlay.texture; U.uOverlayP.value.set(S.overlay.opacity ?? 1, S.overlay.face ?? 1, 0, 0); } else U.uOverlayP.value.x = 0;
    for (let i = 0; i < MAX_CREASES; i++) {
      const c = S.creases && S.creases[i];
      if (c) { const n = new THREE.Vector2(...c.n).normalize(); U.uCrease.value[i].set(n.x, n.y, c.d ?? 0, c.strength ?? 1); } else U.uCrease.value[i].w = 0;
    }
    U.uGain.value = S.gain;
    for (const p of this.pieces) p.object.visible = S.visible && !(S.crumple > 0 && this.crumpleMesh);
    if ('tear' in s) this._applyTear(S.tear);
    if ('crumple' in s || 'visible' in s) this._applyCrumple();
  }

  _applyTear(T) {
    const want = !T ? 0 : ((typeof T.p2 === 'number' ? T.p2 > 0 : Array.isArray(T.p2) && (T.p2[0] > 0 || T.p2[1] > 0)) ? 2 : (T.p1 > 0 ? 1 : 0));
    if (want !== this._pieceMode) this._makePieces(want);
    if (!want) return;
    const W = this.size.w, H = this.size.h, gap = T.gap ?? 0.0012, jag = T.jag ?? 0.0016, jf = T.jagFreq ?? 55;
    const p1 = THREE.MathUtils.clamp(T.p1 ?? 1, 0, 1);
    const p2 = Array.isArray(T.p2) ? T.p2 : [T.p2 ?? 0, T.p2 ?? 0];
    // line 1: y = 0, the tear runs left -> right (along = x from -W/2); line 2: x = 0, bottom -> top of each half (along = -y ... see below)
    const front1 = -W / 2 + p1 * (W + 0.02) - 0.004;
    for (const p of this.pieces) {
      const U = p.uniforms;
      const top = p.key[0] === 'T';
      U.uTear0.value.set(0, 1, 0, top ? 1 : -1);
      U.uTearFx0.value.set(front1, gap * (p1 >= 1 ? 1 : 0.6), jag, jf);
      if (this._pieceMode === 2) {
        const right = p.key[1] === 'R';
        // line 2 is x = 0. Its 'along' coordinate is dot(r, (-n.y, n.x)) = dot(r, (0, 1)) = y: within each half the tear runs
        // from the outer edge toward the old midline (top half: from y = +H/2 down... we run it from the half's far edge)
        const prog = top ? p2[0] : p2[1];
        // along = y; the top half spans y in [0, H/2], the bottom half [-H/2, 0]: the tear starts at the half's outer edge
        const start = top ? H / 2 : -H / 2, end = 0, front = start + (end - start) * THREE.MathUtils.clamp(prog, 0, 1) * 1.04;
        // tearKeep tears where along < front; for the top half we want along > front torn, so flip the line normal
        if (top) { U.uTear1.value.set(-1, 0, 0, right ? -1 : 1); U.uTearFx1.value.set(-front, gap, jag, jf); }
        else { U.uTear1.value.set(1, 0, 0, right ? 1 : -1); U.uTearFx1.value.set(front, gap, jag, jf); }
      } else U.uTear1.value.set(0, 0, 0, 0);
    }
  }

  async _applyCrumple() {
    const t = this.state.crumple;
    if (t > 0 && !this.crumpleMesh && !this._crumpleLoading) {
      this._crumpleLoading = this.sys.loadCrumple().then((data) => { if (data) this._buildCrumple(data); this._crumpleLoading = null; this._applyCrumple(); }).catch((e) => { console.warn('[paper] crumple', e); this._crumpleLoading = null; });
      return;
    }
    if (this.crumpleMesh) {
      this.crumpleMesh.visible = t > 0 && this.state.visible;
      for (const p of this.pieces) p.object.visible = this.state.visible && !(t > 0);
      if (t > 0) this.sys.crumple.setProgress(this.crumpleMesh, t);
    }
  }
  _buildCrumple(data) {
    const m = this.sys.crumple.createMesh(data, this.uniforms, this.contact ? this.sys.contact : null);
    m.castShadow = this.castShadow; m.receiveShadow = true;
    this.crumpleMesh = m; this.object.add(m);
  }
  /** the radius of the finished ball (m), for rolling */
  get crumpleRadius() { return this.sys.crumple ? this.sys.crumple.radius : 0.035; }

  /* ------------------------------------------------------------------ folds */
  _collectFolds() {
    const S = this.state, out = [], size = this.size;
    if (S.plane > 0) out.push(...F.dartPlane(S.plane, { size }));
    if (S.halving > 0) out.push(...F.halving(S.halving, { size }));
    if (S.sixfold > 0) out.push(...F.sixfold(S.sixfold, { size }).folds);
    if (S.folds) out.push(...S.folds);
    if (S.dogEar > 0) out.push(...F.dogEar(S.dogEar, { corner: S.dogEarCorner, sheet: size }));
    if (S.curl) {
      const c = S.curl;
      if (c.edge) out.push(...F.edgeCurl({ edge: c.edge, at: c.at ?? c.t ?? 0.2, r: c.r ?? 0.02, angle: c.angle ?? Math.PI * 0.6, toward: c.toward ?? 1, sheet: size }));
      else out.push(...F.cornerCurl(c.t ?? 1, { corner: c.corner || 'tr', size: c.size ?? 0.06, r: c.r ?? 0.015, angle: c.angle ?? 0.44, taper: c.taper ?? 0, toward: c.toward ?? 1, sheet: size }));
    }
    if (S.peel > 0) out.push(...F.peel(S.peel, { sheet: size }));
    this._folds = out.slice(0, MAX_FOLDS);
    this._dirtyFolds = false;
  }
  _uploadFolds() {
    const U = this.uniforms, f = this._folds, minR = this.halfThick * 1.45;
    U.uFoldCount.value = f.length;
    for (let i = 0; i < MAX_FOLDS; i++) {
      const x = f[i];
      if (!x) { U.uFoldA.value[i].w = 0; continue; }
      U.uFoldQ.value[i].copy(x.q); if (x.minRadius !== false) U.uFoldQ.value[i].w = Math.max(x.q.w, minR);
      U.uFoldA.value[i].copy(x.a); U.uFoldA.value[i].w = x.a.w * (x.t ?? 1);
      U.uFoldM.value[i].copy(x.m); U.uFoldR.value[i].copy(x.r);
    }
  }

  /* ------------------------------------------------------------------ per frame */
  update(camera, dt = 0) {
    const S = this.state, U = this.uniforms;
    if (S.flutterAuto) { S.flutterTime += dt; U.uFlutter.value.z = S.flutterTime; }
    if (camera) {
      const wp = this.object.getWorldPosition(_wp);
      const dist = Math.max(0.005, wp.distanceTo(camera.getWorldPosition(_cp)));
      const H = this.sys.bufferHeight();
      const s = this.object.getWorldScale(_ws).x || 1;
      this.pixelSize = (camera.isPerspectiveCamera ? 2 * dist * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) / camera.zoom : (camera.top - camera.bottom) / camera.zoom) / H / s;
    }
    this.halfThick = 0.5 * Math.max(S.thickness, 1.2 * this.pixelSize);
    U.uHalfThick.value = this.halfThick;
    if (this._dirtyFolds) this._collectFolds();
    this._uploadFolds();
  }

  /* ------------------------------------------------------------------ helpers */
  /** attach a PaintLayer (system.createPaint) so the pencil shows on this sheet */
  attachPaint(paint) { this.paint = paint; this.uniforms.uPaint.value = paint.texture; this.set({ paint: true }); return this; }
  /** world position of a rest-space point (m) on the FLAT sheet (for DOM labels: KEPT., dimension lines) */
  restToWorld(x, y, out = new THREE.Vector3()) { return this.pieces[0].mesh.localToWorld(out.set(x, y, 0)); }
  dispose() {
    this._makePieces(0); const p = this.pieces[0];
    p.mesh.material.dispose(); p.mesh.customDepthMaterial.dispose(); if (p.caster) p.caster.material.dispose();
    if (this.crumpleMesh) { this.crumpleMesh.material.dispose(); }
    releaseSheetGeometry(this.geometry); this.object.removeFromParent();
    this.sys._forget(this);
  }
}
const _wp = new THREE.Vector3(), _cp = new THREE.Vector3(), _ws = new THREE.Vector3();
function mulberry(a) { return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
