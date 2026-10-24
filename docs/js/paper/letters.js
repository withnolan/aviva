// letters.js: the hero (brief 10.3, decision #31): AVIVA spelled by five folded A4 sheets standing in the white studio,
// and the graphite "4" that turns the last A into "A4".
//
//   const hero = system.createLetters();                  // five Sheets + the "4", already in the H4 rest frame
//   scene.add(hero.object);                                // its origin = the floor point under the I (the hero's centre)
//   const cam = hero.restCamera(innerWidth / innerHeight); // { position, target, pitch, dist, fov } of the H4 rest frame
//   const st = hero.restStage();                           // { aim, contactHalf, shadowExtent } for that frame:
//   system.lights.set('letters'); system.lights.aim(st.aim);
//   system.contact.uniforms.uCS.value.z = st.contactHalf; system.lights.shadowExtent = st.shadowExtent;
//   hero.set(1, { fold: 0.6, lift: 0.12 });                // per-letter state (index 0..4 = A V I V A), all optional
//   hero.setFour({ opacity: 1 });
//   // system.update(scene, camera, dt) applies every letter's state each frame
//
// Per-letter state (T3 fold-in, T4 unfold and merge animate these; nothing else needs touching). The rest values come
// from hero.restLayout(): { xs, zs, yaws } per letter, front (the front outlines' x), frontZ, four: { x, z }.
//   fold   0..1   0 = the flat sheet, 1 = the letter (folds.letterPose: every value stands on the floor)
//   pose   0..1   1 = the letter's standing orientation; 0 = `airQuat` (e.g. falling face-on, portrait); slerped
//   airQuat       THREE.Quaternion for pose < 1 (default: upright, recto toward +z, i.e. the camera)
//   x, z  (m)     the sheet's centre on the floor, in the letters' frame (rest: restLayout().xs / zs)
//   lift  (m)     extra height above the floor (falling, the H9 lift); 0 = standing on the floor
//   yaw   (rad)   the turn about the vertical; 0 = exactly end-on. Rest: restLayout().yaws, each A and V turned toward
//                 the key so it is seen from 12 deg left of its end (LETTER_LAYOUT.aimDeg), the I by 0.4 deg (its lit
//                 layer, not the slot between its layers, faces the camera). H6 animates it to +-PI/2 (face the camera)
//   flutter (m), visible, and any other Sheet state key via `sheet` (e.g. { sheet: { inkDot: 1 } })
// The "4" (setFour): x, z (m), opacity 0..1, lift (m), visible. A matte graphite numeral in the site typeface on a thin
// upright plane on the letters' front plane, its ink exactly the cap height, with a shadow-map depth (alpha-aware), a
// sheared contact caster (its soft cast shadow) and an occlusion footprint round its foot (_buildFootprint).
import * as THREE from 'three';
import { letterPose } from './folds.js';
import { createStaticCasterMaterial } from './material.js';

/**
 * 10.3: cap height ~141 mm (A, V), gaps 0.22 x the cap height, the "4" after the last A. Every position is on the
 * letters' FRONT plane (z = depth/2, the end of each sheet nearest the camera), because that outline is what the eye
 * reads as the letter: at 1440 x 900 the front outlines land at x 23.5 / 39.5 / 50 / 60.5 / 76.5 %, the "4" at 90 %.
 * aimDeg: every letter except the I is turned about its front outline so that it is seen from aimDeg to the left of its
 * end (the key's side): each A shows its key-lit outer panel and a shaded inside, each V a lit panel and a shaded
 * inside, on both halves of the word (seen straight, the left half shows only fill-lit faces and fades into the white).
 */
export const LETTER_LAYOUT = { word: 'AVIVA', capMM: 141, gapK: 0.22, letterMM: 92, depthMM: 210, fourMM: 100, fourGapMM: 4, capVh: 0.30, baselineY: 0.66, pitchDeg: -6, fov: 30, aimDeg: 12, iAimDeg: 0.4, marginK: 0.955 };

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
  // the I stays on the centre line, turned just enough (iAimDeg) that its key-lit outer layer, not the dark slot between
  // its two layers, faces the camera: a bright hairline
  const yaws = front.map((x, i) => (chars[i].toUpperCase() === 'I' ? THREE.MathUtils.degToRad(L.iAimDeg) : aim - Math.atan2(x, D)));
  // the sheets' centres: the front outline stays put, the sheet swings behind it (ridge direction = (sin yaw, 0, cos yaw))
  const xs = front.map((x, i) => x - h * Math.sin(yaws[i])), zs = yaws.map((y) => h - h * Math.cos(y));
  const last = front[front.length - 1] + widths[widths.length - 1] / 2;
  return { xs, zs, yaws, front, frontZ: h, four: { x: last + L.fourGapMM / 1000 + (L.fourMM / 1000) / 2, z: h - 0.001 } };
}
/** the 10.3 rest layout for a word (Letters.restLayout without an instance) */
export const letterRestLayout = (word = LETTER_LAYOUT.word, aimDeg) => restX([...word], aimDeg);

/**
 * 10.3 H2-H4 on the intro clock (events.js INTRO: 0 = H1 "loaded", nominal 2.2 s after the loader's first frame).
 * H2: the sheets drop in reading order, `gap` apart, each falling `fall` s from `dropFrom` m (its centre of mass); the
 * fold runs over the last 60 % of the fall and the turn to end-on over the last 55 %; on landing the letter rocks and its
 * legs splay (zeta 0.7, <= 1.5 deg) and its contact shadow blooms over `bloom` s. H3: the "4" draws on over `four`.
 * H4: the camera pushes in (x1.06 -> x1.00, pitch -9 -> -6) over `push`.
 */
export const LETTER_INTRO = {
  start: 0.4, gap: 0.12, fall: 1.1, settle: 0.8, bloom: 0.12, four: [2.1, 2.5], push: [2.6, 4.8],
  dropMargin: 0.012,    // at its drop each sheet's lower edge is this far above the pre-settle frame at its depth
  foldAt: [0.35, 0.72], // the fold, face-on (its flap swings straight back, never sideways into a neighbour)
  turnAt: [0.4, 0.92],  // the turn to end-on, overlapping the fold, so the fold is seen at an angle as it closes
  // Five 210 mm sheets land 31 mm apart, 0.12 s after each other: in the air they keep out of each other's way in
  // depth. Each falls above its mark in its letter's layer (the I in front, the A's on their marks' plane, the V's
  // behind, spread a little so they clear each other), folds face-on, turns end-on, and only then, narrow, slides
  // onto its mark (letters-sim.mjs checks that no two sheets ever cross).
  layers: { A: 0, V: -0.25, I: 0.25 }, vSpread: 0.04,
  slideAt: [0.7, 1.0],  // the slide from the layer onto the mark, as fractions of the fall
  entryYawDeg: 0,       // the sheets fall face-on (recto to the camera)
  rollDeg: 4, pitchDeg: 14, // the air's sway: a picture-plane roll and a falling-leaf pitch (toward / away
                        // from the camera, so each face catches the key differently), dying as the sheet folds
  bend: [2.6, 3.0],     // the air flexing the sheet (1/m): a steady bow and a breathing swing, gone before the turn
  twist: 1.0,           // and a slow twist (rad/m)
};
const DEG = Math.PI / 180, clamp01 = (x) => Math.min(1, Math.max(0, x));
const sstep = (a, b, x) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const smoother = (x) => { x = clamp01(x); return x * x * x * (x * (x * 6 - 15) + 10); };
// The drop: the sheet drops into the frame edge-first and fast, catches the air and floats while it starts to fold
// (the flat sheet's drag), then drops again as it folds and turns edge-on (less drag) and lands with weight.
// FALL_D(f): the fraction of the drop done at f of the fall, from that speed profile.
const FALL_D = (() => {
  const N = 256, v = (f) => 2.6 * (1 - sstep(0.05, 0.4, f)) + 0.5 + 1.6 * sstep(0.45, 0.97, f);
  const D = new Float32Array(N + 1); let acc = 0;
  for (let i = 1; i <= N; i++) { acc += (0.5 * (v((i - 1) / N) + v(i / N))) / N; D[i] = acc; }
  for (let i = 0; i <= N; i++) D[i] /= acc;
  return (f) => { const x = clamp01(f) * N, i = Math.min(N - 1, Math.floor(x)); return D[i] + (D[i + 1] - D[i]) * (x - i); };
})();
/** a damped impulse response (zeta 0.7) scaled to a unit first peak: the landing rock and splay */
function settleK(s, hz, zeta = 0.7) {
  if (s <= 0) return 0;
  const w = 2 * Math.PI * hz, k = Math.sqrt(1 - zeta * zeta), wd = w * k, sp = Math.atan2(k, zeta) / wd;
  return (Math.exp(-zeta * w * s) * Math.sin(wd * s)) / (Math.exp(-zeta * w * sp) * Math.sin(wd * sp));
}
// per letter: sway phases, the roll's sign, the landing rock (deg, signed) and splay (deg)
// (pitch: each sheet's mean lean while it falls, deg: + top away from the camera, catching more of the key)
const INTRO_VAR = [
  { ph: 0.3, ph2: 1.9, roll: 1, pitch: 9, tilt: 1.2, splay: 2.4 }, { ph: 2.4, ph2: 0.7, roll: -1, pitch: -7, tilt: -0.9, splay: 2.0 },
  { ph: 4.1, ph2: 2.8, roll: 1, pitch: 5, tilt: 0.6, splay: 1.4 }, { ph: 1.2, ph2: 4.4, roll: -1, pitch: -9, tilt: 1.0, splay: 2.0 },
  { ph: 5.3, ph2: 3.6, roll: 1, pitch: 7, tilt: -1.3, splay: 2.4 },
];
const _X = new THREE.Vector3(1, 0, 0), _Y = new THREE.Vector3(0, 1, 0), _qa = new THREE.Quaternion(), _qb = new THREE.Quaternion(), _qc = new THREE.Quaternion();
const _e = new THREE.Euler(), _vc = new THREE.Vector3(), _ax = new THREE.Vector3(), _vp = new THREE.Vector3();

/** the top edge of the H0-H2 pre-settle frame (16:10; restCamera distK 1.06, pitch -9) at depth z, as a height (m) */
function preFrameTop(z) {
  const L = LETTER_LAYOUT, half = DEG * L.fov / 2, viewH = (L.capMM / 1000) / L.capVh, dist = (viewH / (2 * Math.tan(half))) * 1.06, p = -9 * DEG;
  const cy = (L.baselineY - 0.5) * viewH - Math.sin(p) * dist, cz = L.depthMM / 2000 + Math.cos(p) * dist;
  return cy + (cz - z) * Math.tan(half + p);
}
const _FIN = new Map();
/** a letter's final frame split into the turn about the vertical (psi) and the stance about its crease (alpha) */
function finalFrame(ch, yaw, apex) {
  const k = ch + yaw.toFixed(5) + '|' + apex.toFixed(5);
  let F = _FIN.get(k); if (F) return F;
  const P = letterPose(ch, 1, { apex, yaw: Math.PI / 2 + yaw }), psi = Math.PI / 2 + yaw;
  const qx = new THREE.Quaternion().setFromAxisAngle(_Y, -psi).multiply(P.quaternion);   // a rotation about x
  F = { psi, alpha: 2 * Math.atan2(qx.x, qx.w), cy: P.lift + P.centroid.clone().applyQuaternion(P.quaternion).y };
  _FIN.set(k, F); return F;
}

/**
 * The state of letter i (char ch) at intro clock c, for Letters.set (pure: the choreography of H2, testable without a
 * renderer). R = restLayout(); apex in rad. The air phase poses the sheet through airQuat with pose 0, so `lift` is
 * the height of the sheet's origin (its crease) and x, z are the origin's; the centre of mass follows the drop.
 */
export function letterIntroState(ch, i, n, c, R, apex) {
  const I = LETTER_INTRO, tau = c - (I.start + I.gap * i), V = INTRO_VAR[i % INTRO_VAR.length];
  if (tau < 0) return { visible: false };
  const yawR = R.yaws[i] ?? 0, xR = R.xs[i] ?? 0, zR = R.zs[i] ?? 0;
  if (tau >= I.fall) {                                     // landed: the rock, the splay and the bloom, then the rest
    const s = tau - I.fall, on = s < I.settle;
    return { visible: true, fold: 1, pose: 1, x: xR, z: zR, lift: 0, yaw: yawR, flutter: 0, bend: 0, twist: 0,
      tilt: on ? V.tilt * DEG * settleK(s, 2.4) : 0, splay: on ? V.splay * DEG * settleK(s, 3.0) : 0, contactK: sstep(0, I.bloom, s) };
  }
  const f = tau / I.fall, fin = finalFrame(ch, yawR, apex);
  const u = clamp01((f - I.foldAt[0]) / (I.foldAt[1] - I.foldAt[0]));   // the fold (letterPose smoothsteps it)
  const w = smoother((f - I.turnAt[0]) / (I.turnAt[1] - I.turnAt[0]));  // the turn to end-on and the letter's stance
  const slide = smoother((f - I.slideAt[0]) / (I.slideAt[1] - I.slideAt[0]));   // from the layer onto the mark
  const live = 1 - sstep(0.42, 0.9, f);                    // the air's sway dies as the sheet folds and turns
  const ang = 2 * Math.PI * 0.75 * tau + V.ph;
  const roll = V.roll * I.rollDeg * DEG * Math.cos(ang) * live;
  const pitch = (V.pitch + I.pitchDeg * Math.sin(2 * Math.PI * 0.95 * tau + V.ph2)) * DEG * live;
  // face-on and swaying -> the stance about the crease (alpha) -> the turn about the vertical (from the entry yaw to psi)
  const psi0 = Math.sign(fin.psi) * I.entryYawDeg * DEG, psi = psi0 + (fin.psi - psi0) * w;
  const q = new THREE.Quaternion().setFromAxisAngle(_Y, psi).multiply(_qb.setFromAxisAngle(_X, fin.alpha * w)).multiply(_qc.setFromEuler(_e.set(pitch, 0, roll)));
  // the centre of mass: drops (FALL_D) above the mark's front outline in its layer, drifts with the roll, then slides
  const P = letterPose(ch, u, { apex, yaw: Math.PI / 2 + yawR });
  const cw = P.centroid.clone().applyQuaternion(q);
  const xF = R.front[i] ?? xR, layer = I.layers[ch] ?? 0, xE = xF + (ch === 'V' ? Math.sign(xF) * I.vSpread : 0);
  const y0 = preFrameTop(layer) + 0.1485 + I.dropMargin, D = FALL_D(f), ym = y0 + (fin.cy - y0) * D;
  const xm = xE + (xR - xE) * slide + 0.010 * Math.sin(ang) * live, zm = layer + (zR - layer) * slide;
  const air = 1 - sstep(0.42, 0.62, f);                   // the sheet's flex in the air, relaxed as it turns
  return { visible: true, fold: u, pose: 0, airQuat: q, x: xm - cw.x, z: zm - cw.z, lift: ym - cw.y, yaw: yawR,
    flutter: 0.004 * (1 - sstep(0.25, 0.55, f)), flutterTime: tau, tilt: 0, splay: 0, contactK: 0,
    bend: air * (I.bend[0] + I.bend[1] * Math.sin(2 * Math.PI * 0.9 * tau + V.ph2)), twist: air * I.twist * Math.sin(2 * Math.PI * 0.7 * tau + V.ph) };
}

/** where a letter's sheet stands for state S (pure): { P (letterPose), quaternion, position } (Letters._applyItem) */
export function letterTransform(ch, S, apex, q = new THREE.Quaternion(), pos = new THREE.Vector3()) {
  const isI = ch === 'I', splay = S.splay || 0;
  const P = letterPose(ch, S.fold, { apex: apex + (isI ? 0 : splay), open: isI ? splay : 0, yaw: Math.PI / 2 + S.yaw });
  if (S.pose >= 1) q.copy(P.quaternion); else q.copy(S.airQuat).slerp(P.quaternion, Math.max(0, S.pose));
  pos.set(S.x, P.lift * Math.min(1, Math.max(0, S.pose)) + S.lift, S.z);
  if (S.tilt) {
    // rock about the ridge (crease) direction through the base centre on the floor; an A lifts onto one foot
    _ax.set(Math.sin(S.yaw), 0, Math.cos(S.yaw));
    _qa.setFromAxisAngle(_ax, S.tilt); q.premultiply(_qa);
    _vp.set(pos.x - S.x, pos.y, pos.z - S.z).applyQuaternion(_qa);
    pos.set(S.x + _vp.x, _vp.y + (ch === 'A' ? (LETTER_LAYOUT.letterMM / 2000) * Math.abs(Math.sin(S.tilt)) : 0), S.z + _vp.z);
  }
  return { P, quaternion: q, position: pos };
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
  // the footprint: per column of the ink box, the lowest ink above the baseline (0 = on the floor, 1 = cap height, -1 none)
  const cols = 48, profile = new Float32Array(cols).fill(-1);
  for (let j = 0; j < cols; j++) {
    const x0c = minX + Math.floor((j * iw) / cols), x1c = minX + Math.floor(((j + 1) * iw) / cols);
    let low = -1;
    for (let x = x0c; x < Math.max(x1c, x0c + 1); x++) for (let y = maxY; y >= minY; y--) if (d[(y * big + x) * 4 + 1] >= 128) { low = Math.max(low, y); break; }
    if (low >= 0) profile[j] = (maxY - low) / ih;
  }
  const c = Object.assign(document.createElement('canvas'), { width: w, height: h });
  const x = c.getContext('2d'); x.fillStyle = '#000'; x.fillRect(0, 0, w, h);
  x.drawImage(c0, minX - pad, minY - pad, w, h, 0, 0, w, h);
  const tex = new THREE.CanvasTexture(c);
  tex.name = 'paper.four'; tex.colorSpace = THREE.NoColorSpace; tex.anisotropy = 8;
  tex.generateMipmaps = true; tex.minFilter = THREE.LinearMipmapLinearFilter; tex.magFilter = THREE.LinearFilter;
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping; tex.needsUpdate = true;
  return { tex, aspect: w / h, padFrac: pad / h, inkH: ih / h, inkW: iw / w, profile };
}

export class Letters {
  /**
   * @param {object} sys the paper system
   * @param {object} o word ('AVIVA'), four (true), apexDeg (36), segments ([96, 136] per sheet), crossbar (false: a
   *   faint pre-crease at 42 % of each A leg, 10.3 "keep it only if it reads"), graphite (hex for the "4")
   */
  constructor(sys, { word = LETTER_LAYOUT.word, four = true, apexDeg = 36, segments = [96, 136], crossbar = false, graphite = '#2A2926', shadowTaps = 40 } = {}) {
    this.sys = sys; this.word = word; this.apex = THREE.MathUtils.degToRad(apexDeg);
    this.object = new THREE.Group(); this.object.name = 'paper.letters';
    this.chars = [...word];
    const R = restX(this.chars);
    this.items = this.chars.map((ch, i) => {
      const sheet = sys.createSheet({ name: 'letter' + i + ch, segments, seed: 101 + i * 7, shadowTaps });
      this.object.add(sheet.object);
      // the I is a 2 px hairline: the left V's shadow would grey its lower half (10.3: "a crisp, bright hairline")
      if (ch.toUpperCase() === 'I') sheet.set({ shadowRecv: 0.3 });
      if (crossbar && ch.toUpperCase() === 'A') sheet.set({ creases: [{ n: [0, 1], d: 0.0624, strength: 0.6 }, { n: [0, 1], d: -0.0624, strength: 0.6 }] });
      return { char: ch.toUpperCase(), sheet, state: { fold: 1, pose: 1, airQuat: new THREE.Quaternion(), x: R.xs[i] ?? 0, z: R.zs[i] ?? 0, lift: 0, yaw: R.yaws[i] ?? 0, flutter: 0, flutterTime: 0, tilt: 0, splay: 0, contactK: 1, bend: 0, twist: 0, visible: true }, _key: '' };
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
      fourTexture().then(({ tex, aspect, padFrac, inkH, inkW, profile }) => {
        mat.alphaMap = tex; mat.needsUpdate = true; depth.alphaMap = tex; depth.needsUpdate = true;
        if (caster) caster.material.uniforms.tAlpha.value = tex;
        // the plane's height so that the glyph's ink (not the padding) is exactly the cap height
        this.four.aspect = aspect; this.four.inkH = inkH; this.four.padFrac = padFrac; this.four.inkW = inkW; this.four.ready = true;
        if (sys.contact) this._buildFootprint(profile);
        this._applyFour();
      });
    }
    sys.letters = this;
    this.update();
  }

  /** per-letter state (index or char position); see the header */
  set(i, s = {}) {
    const it = this.items[i]; if (!it) return this;
    const { sheet: sheetState, airQuat, ...rest } = s;
    Object.assign(it.state, rest); if (airQuat) it.state.airQuat.copy(airQuat);
    if (sheetState) it.sheet.set(sheetState);
    this._applyItem(it, i); return this;
  }
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
    this.items.forEach((it, i) => this.set(i, { fold: 1, pose: 1, x: R.xs[i] ?? 0, z: R.zs[i] ?? 0, lift: 0, yaw: R.yaws[i] ?? 0, flutter: 0, tilt: 0, splay: 0, contactK: 1, bend: 0, twist: 0, visible: true }));
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

  /**
   * The light and contact-shadow window that frames the rest layout (the key is front-left, so the shadows fall right
   * of and behind the row): lights.aim(aim); system.contact.uniforms.uCS.value.z = contactHalf; lights.shadowExtent.
   */
  restStage() {
    const L = LETTER_LAYOUT, R = restX(this.chars);
    const left = R.front[0] - L.letterMM / 2000 - 0.045, right = R.four.x + L.fourMM / 2000 + 0.15;
    const half = (right - left) / 2 + 0.03;
    // the key's shadow window also covers the sheets falling in from above the frame (H2): +0.3 m
    return { aim: new THREE.Vector3((left + right) / 2, 0.06, 0), contactHalf: half, shadowExtent: 2 * half + 0.3 };
  }

  /**
   * The H2-H3 intro on the intro clock c (seconds, E.intro.clock; LETTER_INTRO): every letter and the "4" posed for c.
   * A pure function of c, so it scrubs and fast-forwards; from c >= landed(4) + settle it is exactly the rest frame.
   * H2, per sheet: hidden until its drop; falls face-on and portrait (recto to the camera), swaying and fluttering
   * (flutter 4 mm -> 0); folds over the last 60 % of the fall and turns to end-on over the last 55 %; lands on its mark,
   * rocks and splays (zeta 0.7), and its contact shadow blooms in over 120 ms. H3: the "4" draws on.
   * @returns {{ landed: number[] (s since each letter landed, < 0 before), done: boolean }}
   */
  intro(c) {
    const I = LETTER_INTRO, R = this._rest || (this._rest = restX(this.chars)), n = this.items.length;
    this.items.forEach((it, i) => this.set(i, letterIntroState(it.char, i, n, c, R, this.apex)));
    // H3: the "4" draws on (opacity until the stroke reveal lands)
    if (this.four) { const d = sstep(I.four[0], I.four[1], c); this.setFour({ x: R.four.x, z: R.four.z, lift: 0, visible: d > 0, opacity: d, draw: d }); }
    const landed = this.items.map((_, i) => c - this.landsAt(i));
    return { landed, done: landed.every((s) => s >= I.settle) && c >= I.four[1] };
  }
  /** the H0-H4 camera for intro clock c: the pre-settle pose (x1.06, pitch -9) until H4, then the push-in (ease-out) */
  introCamera(c, aspect = 1.6) {
    const I = LETTER_INTRO, k = 1 - (1 - clamp01((c - I.push[0]) / (I.push[1] - I.push[0]))) ** 3;
    return this.restCamera(aspect, { distK: 1.06 + (1 - 1.06) * k, pitchDeg: -9 + (LETTER_LAYOUT.pitchDeg + 9) * k });
  }
  /** the clock time at which letter i lands (H2; its outline in the drawing fades over the next 200 ms) */
  landsAt(i) { return LETTER_INTRO.start + LETTER_INTRO.gap * i + LETTER_INTRO.fall; }

  /* ------------------------------------------------------------------ internals */
  // The "4" is a vertical plane, which the top-down contact map sees edge-on (the plane's own caster gives its sheared
  // cast shadow): its ambient occlusion comes from a footprint on the floor. Under every column a strip sits at the
  // ink's lowest height (the crossbar's arm: a faint, wide occlusion straight below it); round each foot that stands on
  // the floor, a patch whose encoded height grows with the distance from the foot (0.4 mm at the foot, 50 mm at 25 mm
  // out), so the contact, mid and soft lobes fall off smoothly round the base, in front of the plane where the camera
  // sees it (the floor there is seen at ~11 deg: a contact line alone would be sub-pixel). No lean: occlusion, not shadow.
  _buildFootprint(profile) {
    const F = this.four, capH = LETTER_LAYOUT.capMM / 1000, planeH = capH / (F.inkH || 1), inkWm = planeH * F.aspect * (F.inkW || 1);
    const n = profile.length, pos = [], hs = [], idx = [], X = (j) => -inkWm / 2 + (j / n) * inkWm;
    const quad = (xa, xb, t, hh) => { const b = pos.length / 3; pos.push(xa, 0, -t, xb, 0, -t, xa, 0, t, xb, 0, t); hs.push(hh, hh, hh, hh); idx.push(b, b + 2, b + 1, b + 1, b + 2, b + 3); };
    const R = 0.025, NX = 18, NZ = 10;
    const patch = (x0, x1) => {
      const b = pos.length / 3;
      for (let k = 0; k <= NZ; k++) for (let i = 0; i <= NX; i++) {
        const x = x0 - R + ((x1 - x0 + 2 * R) * i) / NX, z = -R + (2 * R * k) / NZ;
        const dx = Math.max(0, x0 - x, x - x1), dd = Math.min(1, Math.hypot(dx, z) / R);
        pos.push(x, 0, z); hs.push(0.0004 + 0.05 * dd * dd);
      }
      for (let k = 0; k < NZ; k++) for (let i = 0; i < NX; i++) { const a = b + k * (NX + 1) + i, c = a + NX + 1; idx.push(a, c, a + 1, a + 1, c, c + 1); }
    };
    let run = -1;
    for (let j = 0; j <= n; j++) {
      const touching = j < n && profile[j] >= 0 && profile[j] * capH < 0.002;
      if (j < n && profile[j] >= 0 && !touching) quad(X(j), X(j + 1), 0.003, profile[j] * capH);
      if (touching && run < 0) run = j;
      if (!touching && run >= 0) { patch(X(run), X(j)); run = -1; }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('aH', new THREE.Float32BufferAttribute(hs, 1)); g.setIndex(idx);
    const m = createStaticCasterMaterial(this.sys.contact.uniforms);
    m.vertexShader = m.vertexShader.replace('void main() {', 'attribute float aH;\nvoid main() {')
      .replace('gl_Position = casterClip((modelMatrix * vec4(position, 1.0)).xyz);',
        'vec3 wpF = (modelMatrix * vec4(position, 1.0)).xyz; wpF.y += aH; wpF.xz -= uCSShear.xy * max(wpF.y - uCS.w, 0.0);\n  gl_Position = casterClip(wpF);');
    const foot = new THREE.Mesh(g, m); foot.name = 'paper.four.footprint'; foot.layers.set(this.sys.contact.layer); foot.frustumCulled = false;
    this.object.add(foot); F.footprint = foot;
  }
  _applyItem(it, i) {
    const S = it.state, sh = it.sheet;
    if (!S.visible) { if (sh.state.visible) sh.set({ visible: false }); return; }
    const { P } = letterTransform(it.char, S, this.apex, sh.object.quaternion, sh.object.position);
    const key = S.fold.toFixed(4) + '|' + (S.splay || 0).toFixed(5), up = {};
    if (key !== it._key) { up.folds = P.folds; it._key = key; }
    if (!sh.state.visible) up.visible = true;
    if (S.flutter !== sh.state.flutter) up.flutter = S.flutter;
    if (S.flutter && S.flutterTime !== sh.state.flutterTime) up.flutterTime = S.flutterTime;
    if ((S.contactK ?? 1) !== sh.state.contactK) up.contactK = S.contactK ?? 1;
    if ((S.bend || 0) !== sh.state.bend) up.bend = S.bend || 0;
    if ((S.twist || 0) !== sh.state.twist) up.twist = S.twist || 0;
    for (const k in up) { sh.set(up); break; }
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
    if (F.footprint) { F.footprint.position.set(S.x, S.lift, S.z); F.footprint.visible = m.visible && S.opacity > 0.5; }
  }
  /** per frame (system.update calls it): nothing to animate on its own; the state is applied on set() */
  update() { this.items.forEach((it, i) => this._applyItem(it, i)); this._applyFour(); }
  dispose() { for (const it of this.items) it.sheet.dispose(); if (this.four) { this.four.mesh.geometry.dispose(); this.four.mesh.material.dispose(); if (this.four.footprint) { this.four.footprint.geometry.dispose(); this.four.footprint.material.dispose(); } } this.object.removeFromParent(); }
}
