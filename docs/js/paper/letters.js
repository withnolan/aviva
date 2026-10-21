// letters.js: the hero (brief 10.3, decision #31): AVIVA spelled by five folded A4 sheets standing in the white studio,
// and the graphite "4" that turns the last A into "A4".
//
//   const hero = system.createLetters();                  // five Sheets + the "4", laid out for the rest frame
//   scene.add(hero.object);                                // its origin = the floor point under the I (the hero's centre)
//   hero.set(1, { fold: 0.6, x: -0.08, lift: 0.12 });      // per-letter state (index 0..4 = A V I V A), all optional
//   hero.setFour({ opacity: 1 });
//   const cam = hero.restCamera(innerWidth / innerHeight); // { position, target, pitch, dist, fov } of the H4 rest frame
//   // system.update(scene, camera, dt) applies every letter's state each frame
//
// Per-letter state (T3 fold-in, T4 unfold and merge animate these; nothing else needs touching):
//   fold   0..1   0 = the flat sheet, 1 = the letter (folds.letterPose: every value stands on the floor)
//   pose   0..1   1 = the letter's standing orientation; 0 = `airQuat` (e.g. falling face-on, portrait); slerped
//   airQuat       THREE.Quaternion for pose < 1 (default: upright, recto toward +z, i.e. the camera)
//   x, z  (m)     on the floor, in the letters' frame (rest layout from 10.3 by default)
//   lift  (m)     extra height above the floor (falling, the H9 lift); 0 = standing on the floor
//   yaw   (rad)   an extra turn about the vertical (H6 turns +-PI/2 to face the camera; the cursor lean); 0 = end-on
//   flutter (m), visible, and any other Sheet state key via `sheet` (e.g. { sheet: { inkDot: 1 } })
// The "4" (setFour): x (m), opacity 0..1, lift (m), visible. A matte graphite numeral in the site typeface on a thin
// upright plane at cap height, with its own contact shadow and shadow-map depth (alpha-aware).
import * as THREE from 'three';
import { letterPose } from './folds.js';
import { makeCanvasTexture } from './textures.js';
import { createStaticCasterMaterial } from './material.js';

/**
 * 10.3: cap height ~141 mm (A, V), gaps 0.22 x the cap height, the "4" after the last A. Every position is on the
 * letters' FRONT plane (z = depth/2, the end of each sheet nearest the camera), because that outline is what the eye
 * reads as the letter: at 1440 x 900 the front outlines land at x 23.5 / 39.5 / 50 / 60.5 / 76.5 %, the "4" at 90 %.
 * aimDeg: every letter except the I is turned about its front outline so that it is seen from aimDeg to the left of its
 * end (the key's side): each A shows its key-lit outer panel and a shaded inside, each V a lit panel and a shaded
 * inside, on both halves of the word (seen straight, the left half shows only fill-lit faces and fades into the white).
 */
export const LETTER_LAYOUT = { word: 'AVIVA', capMM: 141, gapK: 0.22, letterMM: 92, depthMM: 210, fourMM: 100, fourGapMM: 4, capVh: 0.30, baselineY: 0.66, pitchDeg: -6, fov: 30, aimDeg: 12, marginK: 0.955 };

function restX(chars = [...LETTER_LAYOUT.word], aimDeg = LETTER_LAYOUT.aimDeg) {
  const L = LETTER_LAYOUT, W = L.letterMM / 1000, g = L.gapK * L.capMM / 1000, h = L.depthMM / 2000;
  // front-outline centres along the row (m), the I at 0 (the general case: every letter W wide, the I zero wide)
  const widths = chars.map((c) => (c.toUpperCase() === 'I' ? 0 : W));
  const iI = Math.max(0, chars.findIndex((c) => c.toUpperCase() === 'I'));
  const front = new Array(chars.length).fill(0);
  for (let i = iI + 1; i < chars.length; i++) front[i] = front[i - 1] + widths[i - 1] / 2 + g + widths[i] / 2;
  for (let i = iI - 1; i >= 0; i--) front[i] = front[i + 1] - widths[i + 1] / 2 - g - widths[i] / 2;
  // the rest camera's horizontal distance to the front plane (16:10), for each letter's natural view angle
  const D = ((L.capMM / 1000) / L.capVh) / (2 * Math.tan(THREE.MathUtils.degToRad(L.fov / 2))) * Math.cos(THREE.MathUtils.degToRad(L.pitchDeg));
  const aim = THREE.MathUtils.degToRad(aimDeg);
  const yaws = front.map((x, i) => (chars[i].toUpperCase() === 'I' ? 0 : aim - Math.atan2(x, D)));
  // the sheets' centres: the front outline stays put, the sheet swings behind it (ridge direction = (sin yaw, 0, cos yaw))
  const xs = front.map((x, i) => x - h * Math.sin(yaws[i])), zs = yaws.map((y) => h - h * Math.cos(y));
  const last = front[front.length - 1] + widths[widths.length - 1] / 2;
  return { xs, zs, yaws, front, frontZ: h, four: { x: last + L.fourGapMM / 1000 + (L.fourMM / 1000) / 2, z: h - 0.001 } };
}

// the "4": the glyph's coverage in G (white on opaque black, so G is exactly the coverage the alpha test cuts at), cropped
// to its scanned ink box plus a pad (measureText's box is not the ink: the plane must be exactly the cap height)
async function fourTexture(fontFamily = '"Hanken Grotesk"', weight = 300) {
  try {
    if (typeof document !== 'undefined' && document.fonts && !document.fonts.check(`${weight} 100px ${fontFamily}`)) {
      const f = new FontFace('Hanken Grotesk', `url(${new URL('../../assets/fonts/hanken-grotesk-var-latin.woff2', import.meta.url).href})`, { weight: '300 500' });
      document.fonts.add(await f.load());
    }
  } catch { /* fall back to the system face */ }
  const fs = 640, pad = 20, big = Math.ceil(fs * 1.5);
  const c0 = Object.assign(document.createElement('canvas'), { width: big, height: big });
  const x0 = c0.getContext('2d', { willReadFrequently: true });
  x0.fillStyle = '#000'; x0.fillRect(0, 0, big, big);
  x0.font = `${weight} ${fs}px ${fontFamily}, "Helvetica Neue", Arial, sans-serif`; x0.fillStyle = '#fff'; x0.textBaseline = 'alphabetic';
  x0.fillText('4', fs * 0.25, fs * 1.15);
  const d = x0.getImageData(0, 0, big, big).data;
  let minX = big, minY = big, maxX = -1, maxY = -1;
  for (let y = 0; y < big; y++) for (let x = 0; x < big; x++) if (d[(y * big + x) * 4 + 1] >= 128) {
    if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y;
  }
  if (maxX < 0) { minX = 0; minY = 0; maxX = big - 1; maxY = big - 1; }
  const iw = maxX - minX + 1, ih = maxY - minY + 1, w = iw + pad * 2, h = ih + pad * 2;
  const c = Object.assign(document.createElement('canvas'), { width: w, height: h });
  const x = c.getContext('2d'); x.fillStyle = '#000'; x.fillRect(0, 0, w, h);
  x.drawImage(c0, minX - pad, minY - pad, w, h, 0, 0, w, h);
  const tex = new THREE.CanvasTexture(c);
  tex.name = 'paper.four'; tex.colorSpace = THREE.NoColorSpace; tex.anisotropy = 8;
  tex.generateMipmaps = true; tex.minFilter = THREE.LinearMipmapLinearFilter; tex.magFilter = THREE.LinearFilter;
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping; tex.needsUpdate = true;
  return { tex, aspect: w / h, padFrac: pad / h, inkH: ih / h, inkW: iw / w };
}

export class Letters {
  /**
   * @param {object} sys the paper system
   * @param {object} o word ('AVIVA'), four (true), apexDeg (36), segments ([96, 136] per sheet), crossbar (false: a
   *   faint pre-crease at 42 % of each A leg, 10.3 "keep it only if it reads"), graphite (hex for the "4")
   */
  constructor(sys, { word = LETTER_LAYOUT.word, four = true, apexDeg = 36, segments = [96, 136], crossbar = false, graphite = '#2A2926' } = {}) {
    this.sys = sys; this.word = word; this.apex = THREE.MathUtils.degToRad(apexDeg);
    this.object = new THREE.Group(); this.object.name = 'paper.letters';
    this.chars = [...word];
    const R = restX(this.chars);
    this.items = this.chars.map((ch, i) => {
      const sheet = sys.createSheet({ name: 'letter' + i + ch, segments, seed: 101 + i * 7 });
      this.object.add(sheet.object);
      if (crossbar && ch.toUpperCase() === 'A') sheet.set({ creases: [{ n: [0, 1], d: 0.0624, strength: 0.6 }, { n: [0, 1], d: -0.0624, strength: 0.6 }] });
      return { char: ch.toUpperCase(), sheet, state: { fold: 1, pose: 1, airQuat: new THREE.Quaternion(), x: R.xs[i] ?? 0, z: R.zs[i] ?? 0, lift: 0, yaw: R.yaws[i] ?? 0, flutter: 0, visible: true }, _key: '' };
    });
    // the "4"
    this.four = null;
    if (four) {
      const plane = new THREE.PlaneGeometry(1, 1);
      const mat = new THREE.MeshStandardMaterial({ color: graphite, roughness: 0.82, metalness: 0, side: THREE.DoubleSide, alphaTest: 0.5, alphaToCoverage: true, transparent: false });
      const mesh = new THREE.Mesh(plane, mat); mesh.name = 'paper.four'; mesh.castShadow = true; mesh.visible = false;
      const depth = new THREE.MeshDepthMaterial({ alphaTest: 0.5, side: THREE.DoubleSide }); mesh.customDepthMaterial = depth;
      this.object.add(mesh);
      let caster = null;
      if (sys.contact) {
        const cm = createStaticCasterMaterial(sys.contact.uniforms);
        cm.uniforms.tAlpha = { value: null };
        cm.vertexShader = cm.vertexShader.replace('void main() {', 'varying vec2 vUvA;\nvoid main() {\n  vUvA = uv;');
        cm.fragmentShader = cm.fragmentShader.replace('varying float vH;', 'varying float vH; varying vec2 vUvA; uniform sampler2D tAlpha;').replace('void main() {', 'void main() {\n  if (texture2D(tAlpha, vUvA).g < 0.5) discard;');
        caster = new THREE.Mesh(plane, cm); caster.layers.set(sys.contact.layer); caster.frustumCulled = false; mesh.add(caster);
      }
      this.four = { mesh, caster, aspect: 0.6, state: { x: R.four.x, z: R.four.z, lift: 0, opacity: 1, visible: true } };
      fourTexture().then(({ tex, aspect, padFrac, inkH, inkW }) => {
        mat.alphaMap = tex; mat.needsUpdate = true; depth.alphaMap = tex; depth.needsUpdate = true;
        if (caster) caster.material.uniforms.tAlpha.value = tex;
        // the plane's height so that the glyph's ink (not the padding) is exactly the cap height
        this.four.aspect = aspect; this.four.inkH = inkH; this.four.padFrac = padFrac; this.four.inkW = inkW; this.four.ready = true;
        this._applyFour();
      });
    }
    sys.letters = this;
    this.update();
  }

  /** per-letter state (index or char position); see the header */
  set(i, s = {}) { const it = this.items[i]; if (!it) return this; const { sheet: sheetState, ...rest } = s; Object.assign(it.state, rest); if (sheetState) it.sheet.set(sheetState); this._applyItem(it, i); return this; }
  setAll(s = {}) { this.items.forEach((_, i) => this.set(i, s)); return this; }
  setFour(s = {}) { if (this.four) { Object.assign(this.four.state, s); this._applyFour(); } return this; }
  /**
   * The 10.3 rest layout, in metres and radians: { xs, zs, yaws } per letter (the sheets' centres and their rest turn
   * toward the key), front (the front outlines' x), frontZ, four: { x, z }. aimDeg overrides LETTER_LAYOUT.aimDeg.
   */
  restLayout(aimDeg) { return restX(this.chars, aimDeg); }
  /** back to the rest frame: every letter folded, standing, at its 10.3 mark and rest turn; the "4" visible */
  rest({ aimDeg } = {}) {
    const R = restX(this.chars, aimDeg);
    this.items.forEach((it, i) => this.set(i, { fold: 1, pose: 1, x: R.xs[i] ?? 0, z: R.zs[i] ?? 0, lift: 0, yaw: R.yaws[i] ?? 0, flutter: 0, visible: true }));
    this.setFour({ x: R.four.x, z: R.four.z, opacity: 1, visible: true, lift: 0 });
    return this;
  }

  /**
   * The H4 rest-frame camera (10.3): the front outlines' cap height 30 % of the viewport height, their baseline at 66 %,
   * the I at 50 %, pitch -6 deg, fov 30. Wider than 16:10 keeps the height; narrower pulls back so the word and the "4"
   * fit. { distK, pitchDeg } give the H0 pre-settle pose (10.3: distK 1.06, pitchDeg -9), aimed at the same point.
   * @returns {{ position: THREE.Vector3, target: THREE.Vector3, pitch: number (deg), dist: number, fov: number }} in the letters' frame
   */
  restCamera(aspect = 1.6, { distK = 1, pitchDeg = LETTER_LAYOUT.pitchDeg } = {}) {
    const L = LETTER_LAYOUT, t = Math.tan(THREE.MathUtils.degToRad(L.fov / 2)), R = restX(this.chars);
    // the viewport height on the front plane: cap height = 30 %, unless a narrow screen needs more room for the "4"
    const reach = R.four.x + L.fourMM / 2000;                      // from the I (screen centre) to the 4's right edge
    const viewH = Math.max((L.capMM / 1000) / L.capVh, (2 * reach / L.marginK) / Math.max(0.3, aspect));
    const dist = (viewH / (2 * t)) * distK, pitch = THREE.MathUtils.degToRad(pitchDeg);
    const axisY = (L.baselineY - 0.5) * viewH;                     // the view axis meets the front plane this high
    const target = new THREE.Vector3(0, axisY, R.frontZ);
    const position = new THREE.Vector3(0, axisY - Math.sin(pitch) * dist, R.frontZ + Math.cos(pitch) * dist);
    return { position, target, pitch: pitchDeg, dist, fov: L.fov };
  }

  /* ------------------------------------------------------------------ internals */
  _applyItem(it, i) {
    const S = it.state, sh = it.sheet;
    if (!S.visible) { sh.set({ visible: false }); return; }
    // the fold and its standing pose; the I stays exactly edge-on (yaw only if asked)
    const P = letterPose(it.char, S.fold, { apex: this.apex, yaw: Math.PI / 2 + S.yaw });
    const key = S.fold.toFixed(4);
    if (key !== it._key) { sh.set({ folds: P.folds }); it._key = key; }
    if (!sh.state.visible) sh.set({ visible: true });
    if (S.flutter !== sh.state.flutter) sh.set({ flutter: S.flutter });
    const q = sh.object.quaternion;
    if (S.pose >= 1) q.copy(P.quaternion); else q.copy(S.airQuat).slerp(P.quaternion, Math.max(0, S.pose));
    sh.object.position.set(S.x, P.lift * Math.min(1, Math.max(0, S.pose)) + S.lift, S.z);
  }
  _applyFour() {
    const F = this.four; if (!F) return;
    const S = F.state, m = F.mesh;
    m.visible = !!(S.visible && S.opacity > 0.002 && F.ready);
    if (!F.ready) return;
    const capH = LETTER_LAYOUT.capMM / 1000, planeH = capH / (F.inkH || 1), planeW = planeH * F.aspect;
    m.scale.set(planeW, planeH, 1);
    // stand the glyph's baseline on the floor (the padding below the ink hangs under it)
    m.position.set(S.x, planeH * 0.5 - planeH * (F.padFrac || 0) + S.lift, S.z);
    m.material.opacity = S.opacity; m.material.transparent = S.opacity < 0.999; m.material.alphaTest = S.opacity < 0.999 ? 0.02 : 0.5;
  }
  /** per frame (system.update calls it): nothing to animate on its own; the state is applied on set() */
  update() { this.items.forEach((it, i) => this._applyItem(it, i)); this._applyFour(); }
  dispose() { for (const it of this.items) it.sheet.dispose(); if (this.four) { this.four.mesh.geometry.dispose(); this.four.mesh.material.dispose(); } this.object.removeFromParent(); }
}
