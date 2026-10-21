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

/** 10.3: cap height ~141 mm (A, V), gaps 0.22 x the cap height, the "4" after the last A */
export const LETTER_LAYOUT = { word: 'AVIVA', capMM: 141, gapK: 0.22, letterMM: 92, fourMM: 88, capVh: 0.30, baselineY: 0.66, pitchDeg: -6, fov: 30 };

function restX() {
  // centres along the row (m), the I at 0: A V I V A, gaps = 0.22 x cap height between the letters' outer extents
  const W = LETTER_LAYOUT.letterMM / 1000, g = LETTER_LAYOUT.gapK * LETTER_LAYOUT.capMM / 1000;
  const v = g + W / 2, a = v + W / 2 + g + W / 2;
  return { xs: [-a, -v, 0, v, a], four: a + W / 2 + g + (LETTER_LAYOUT.fourMM / 1000) / 2 };
}

// the "4": white-on-transparent glyph, tight bounds (so the plane is exactly the glyph's cap height)
async function fourTexture(fontFamily = '"Hanken Grotesk"', weight = 300) {
  try {
    if (typeof document !== 'undefined' && document.fonts && !document.fonts.check(`${weight} 100px ${fontFamily}`)) {
      const f = new FontFace('Hanken Grotesk', `url(${new URL('../../assets/fonts/hanken-grotesk-var-latin.woff2', import.meta.url).href})`, { weight: '300 500' });
      document.fonts.add(await f.load());
    }
  } catch { /* fall back to the system face */ }
  const fs = 520, probe = document.createElement('canvas').getContext('2d');
  probe.font = `${weight} ${fs}px ${fontFamily}, "Helvetica Neue", Arial, sans-serif`;
  const m = probe.measureText('4');
  const asc = m.actualBoundingBoxAscent || fs * 0.7, desc = m.actualBoundingBoxDescent || 0;
  const left = m.actualBoundingBoxLeft || 0, right = m.actualBoundingBoxRight || m.width;
  const pad = 16, w = Math.ceil(left + right) + pad * 2, h = Math.ceil(asc + desc) + pad * 2;
  const tex = makeCanvasTexture(w, h, (ctx) => {
    ctx.fillStyle = '#fff'; ctx.font = probe.font; ctx.textBaseline = 'alphabetic';
    ctx.fillText('4', pad + left, pad + asc);
  }, { name: 'paper.four' });
  tex.flipY = true; tex.needsUpdate = true;
  return { tex, aspect: w / h, padFrac: pad / h, inkH: (asc + desc) / h };
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
    const { xs, four: fx } = restX();
    this.items = [...word].map((ch, i) => {
      const sheet = sys.createSheet({ name: 'letter' + i + ch, segments, seed: 101 + i * 7 });
      this.object.add(sheet.object);
      if (crossbar && ch.toUpperCase() === 'A') sheet.set({ creases: [{ n: [0, 1], d: 0.0624, strength: 0.6 }, { n: [0, 1], d: -0.0624, strength: 0.6 }] });
      return { char: ch.toUpperCase(), sheet, state: { fold: 1, pose: 1, airQuat: new THREE.Quaternion(), x: xs[i] ?? 0, z: 0, lift: 0, yaw: 0, flutter: 0, visible: true }, _key: '' };
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
      this.four = { mesh, caster, aspect: 0.6, state: { x: fx, z: 0, lift: 0, opacity: 1, visible: true } };
      fourTexture().then(({ tex, aspect, padFrac, inkH }) => {
        mat.alphaMap = tex; mat.needsUpdate = true; depth.alphaMap = tex; depth.needsUpdate = true;
        if (caster) caster.material.uniforms.tAlpha.value = tex;
        // the plane's height so that the glyph's ink (not the padding) is exactly the cap height
        this.four.aspect = aspect; this.four.inkH = inkH; this.four.padFrac = padFrac; this.four.ready = true;
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
  /** the 10.3 rest layout (x of every letter and the "4"); returns { xs, four } in metres */
  restLayout() { return restX(); }
  /** back to the rest frame: every letter folded, standing, at its 10.3 mark; the "4" visible */
  rest() { const { xs, four } = restX(); this.items.forEach((it, i) => this.set(i, { fold: 1, pose: 1, x: xs[i] ?? 0, z: 0, lift: 0, yaw: 0, flutter: 0, visible: true })); this.setFour({ x: four, opacity: 1, visible: true, lift: 0 }); return this; }

  /**
   * The H4 rest-frame camera (10.3): cap height 30 % of the viewport height, baseline at 66 %, the I at 50 %, pitch -6 deg,
   * fov 30. Wider than 1.6 keeps the height; narrower pulls back so the whole word and the "4" fit (8 % margins).
   * @returns {{ position: THREE.Vector3, target: THREE.Vector3, pitch: number (deg), dist: number, fov: number }} in the letters' frame
   */
  restCamera(aspect = 1.6) {
    const L = LETTER_LAYOUT, t = Math.tan(THREE.MathUtils.degToRad(L.fov / 2));
    // viewport height at the letters' depth: cap height = 30 %, unless a narrow screen needs more room for the "4"
    const reach = restX().four + L.fourMM / 2000;                  // from the I (screen centre) to the 4's right edge
    const viewH = Math.max((L.capMM / 1000) / L.capVh, (2 * reach / 0.92) / Math.max(0.3, aspect));
    const dist = viewH / (2 * t), pitch = THREE.MathUtils.degToRad(L.pitchDeg);
    const axisY = (L.baselineY - 0.5) * viewH;                     // the view axis meets the letters' plane this high
    const target = new THREE.Vector3(0, axisY, 0);
    const position = new THREE.Vector3(0, axisY - Math.sin(pitch) * dist, Math.cos(pitch) * dist);
    return { position, target, pitch: L.pitchDeg, dist, fov: L.fov };
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
