// lights.js: the light rig and its presets (brief Part 5.4 / 5.5), with weighted blending.
//
// Rig = key (SpotLight, the only shadow caster) + fill (DirectionalLight) + back (SpotLight behind the subject:
// light through the paper) + rim (DirectionalLight), plus environment intensity, exposure, the backdrop's light pool
// and the contact-shadow strength. Directions are given in VIEW space by default (x right, y up, z toward the camera),
// so "key from the top left" stays top left whatever the camera does; `space: 'world'` is also accepted.
// `intensity` is the illuminance AT THE TARGET: the spot's candela is scaled by distance^2 internally, so moving a light
// never changes the exposure, only the gradient across the sheet (closer = stronger falloff).
import * as THREE from 'three';

const C = (hex) => new THREE.Color(hex);
const D = (x, y, z) => new THREE.Vector3(x, y, z).normalize();

/* ------------------------------------------------------------------------------------------------ presets */
// key.dist is in metres from the target; angle (rad) is the spot cone; softness = PCF radius; shadow 0..1.
const base = {
  space: 'view',
  key: { dir: D(-0.58, 0.62, 0.52), dist: 1.5, color: '#fff4e8', intensity: 2.6, angle: 0.62, penumbra: 1, shadow: 1, softness: 6 },
  fill: { dir: D(0.85, 0.15, 0.5), color: '#eef3ff', intensity: 0.32 },
  back: { dir: D(0.15, 0.35, -1), dist: 1.6, color: '#fff2df', intensity: 0, angle: 0.75, penumbra: 1 },
  rim: { dir: D(-0.9, 0.2, -0.4), color: '#ffffff', intensity: 0 },
  env: 0.5, exposure: 1.0,
  backdrop: { gain: 1, pool: 0.07, poolColor: '#fff8f0', poolOffset: [-0.25, 0.25, -0.6], poolRadius: 1.4 },
  contact: { contact: 0.42, soft: 0.2 },
};

const merge = (a, b) => {
  const o = Array.isArray(a) ? [...a] : { ...a };
  for (const k in b) o[k] = (b[k] && typeof b[k] === 'object' && !(b[k] instanceof THREE.Vector3) && !Array.isArray(b[k])) ? merge(a[k] || {}, b[k]) : b[k];
  return o;
};
const P = (over) => merge(base, over);

export const LIGHT_PRESETS = {
  studio: P({}),
  // s00 neutral, technical: flat studio
  s00: P({ key: { intensity: 2.2, dir: D(-0.3, 0.5, 0.8), dist: 2.4 }, fill: { intensity: 0.5 }, env: 0.6 }),
  // s01 morning in a white room: warm key top-left raking 60 deg, cool fill right, soft contact shadow (camera pitched -68 deg)
  s01: P({ key: { dir: D(-0.62, 0.74, 0.25), dist: 1.3, color: '#fff0dc', intensity: 2.7, softness: 7 }, fill: { dir: D(0.9, 0.2, 0.4), color: '#e8f0ff', intensity: 0.38 }, env: 0.48 }),
  // s02 precise: the key swings to a left rim so the 0.1 mm edge reads; background ~4 % darker
  s02: P({ key: { dir: D(-0.95, 0.25, -0.15), dist: 1.4, intensity: 2.4, color: '#fffaf2' }, rim: { dir: D(-1, 0.1, -0.3), intensity: 1.2 }, fill: { intensity: 0.22 }, env: 0.42, backdrop: { gain: 0.96 } }),
  // s03 a desk at night (still white): warmer, closer key, soft falloff, low fill
  s03: P({ key: { dir: D(-0.45, 0.7, 0.55), dist: 0.75, color: '#ffe6c4', intensity: 2.6, angle: 0.9, softness: 8 }, fill: { intensity: 0.16 }, env: 0.38, backdrop: { pool: 0.09, poolColor: '#ffeedd' } }),
  // s05 the measuring room: neutral ~5600 K, crisp shadows, pure white
  s05: P({ key: { dir: D(-0.5, 0.65, 0.58), dist: 2.2, color: '#fbfbff', intensity: 2.5, softness: 2.5 }, fill: { color: '#ffffff', intensity: 0.42 }, env: 0.55 }),
  // s06 archival: soft, slightly cool; back-light only for v2.0 (use s06v2)
  s06: P({ key: { dir: D(-0.55, 0.55, 0.62), dist: 1.8, color: '#f4f6ff', intensity: 2.3, softness: 8 }, fill: { color: '#eef2ff', intensity: 0.36 }, env: 0.5 }),
  s06v2: P({ key: { dir: D(-0.55, 0.55, 0.62), dist: 1.8, color: '#f4f6ff', intensity: 0.7 }, back: { dir: D(0.1, 0.25, -1), intensity: 3.4, color: '#fff1dc' }, fill: { intensity: 0.15 }, env: 0.25 }),
  // s07 the microscope: grazing key ~80 deg from the normal, from the left
  s07: P({ key: { dir: D(-0.98, 0.05, 0.18), dist: 0.9, color: '#fff8ee', intensity: 3.0, angle: 0.8, softness: 3 }, fill: { intensity: 0.08 }, env: 0.22 }),
  // s08 glow on ink: back-light dominant, soft front fill
  s08: P({ key: { intensity: 0.55, color: '#f2f4ff' }, back: { dir: D(0.05, 0.3, -1), intensity: 3.6, color: '#fff0d8' }, fill: { intensity: 0.2 }, env: 0.3, contact: { contact: 0, soft: 0 } }),
  // s09 evening on ink: soft overhead key + low back-light
  s09: P({ key: { dir: D(-0.15, 0.95, 0.25), dist: 1.6, intensity: 2.0, color: '#fff4e6', softness: 9 }, back: { dir: D(0, -0.15, -1), intensity: 1.2 }, fill: { intensity: 0.18 }, env: 0.36 }),
  // s10 a fair fight: two identical soft spots (the developer duplicates the key per sheet if needed)
  s10: P({ key: { dir: D(0, 0.75, 0.66), dist: 1.6, intensity: 2.5, angle: 0.95, softness: 8 }, fill: { intensity: 0.3 }, env: 0.45 }),
  // s11 catalogue / s12 the print room: neutral, crisp
  s11: P({}),
  s12: P({ key: { dir: D(-0.5, 0.6, 0.62), dist: 2.0, color: '#fdfcfa', intensity: 2.55, softness: 3 }, fill: { intensity: 0.4 } }),
  // s14 the end of the day: a low, warm, golden key from the right
  s14: P({ key: { dir: D(0.9, 0.22, 0.38), dist: 1.4, color: '#ffc98a', intensity: 2.9, softness: 6 }, fill: { dir: D(-0.8, 0.3, 0.5), color: '#dfe6ff', intensity: 0.25 }, back: { dir: D(0.6, 0.2, -1), intensity: 0.8, color: '#ffcf96' }, env: 0.32, backdrop: { pool: 0.1, poolColor: '#ffe9cf', poolOffset: [0.8, 0.2, -0.6] } }),

  // drying line (s04), card by card (brief 5.4)
  card1: P({ key: { intensity: 0.6, color: '#eef2ff' }, back: { dir: D(0.05, 0.45, -1), intensity: 3.2, color: '#f0f4ff' }, fill: { intensity: 0.16 }, env: 0.28 }),            // cool back-light: glow + formation clouds
  card2: P({ key: { dir: D(0.94, 0.2, 0.28), dist: 1.6, color: '#ffe9cc', intensity: 2.9, softness: 2 }, fill: { intensity: 0.18 }, env: 0.36 }),                                    // warm raking key from the right, crisp wing shadows
  card3: P({ key: { dir: D(0, 0.97, 0.22), dist: 1.3, intensity: 2.6, softness: 10 }, fill: { intensity: 0.22 }, env: 0.4 }),                                                      // soft overhead key, deep soft shadow under the curl
  card4: P({ key: { dir: D(-0.96, 0.12, 0.25), dist: 1.8, color: '#dfe9ff', intensity: 2.5, softness: 5 }, fill: { color: '#fff3e0', intensity: 0.18 }, env: 0.34 }),             // low, cool light from the left (late-afternoon water light)
  card5: P({ key: { dir: D(0, 0.35, 0.94), dist: 3.0, color: '#ffffff', intensity: 2.0, shadow: 0 }, fill: { dir: D(0, -0.2, 1), intensity: 0.7, color: '#ffffff' }, env: 0.7 }), // bright, even, shadowless "office" light
  card6: P({ key: { dir: D(-0.1, 0.96, 0.28), dist: 1.4, color: '#ffeccf', intensity: 2.8, softness: 2 }, fill: { intensity: 0.2 }, env: 0.38 }),                                  // warm top light, pleats cast fine stripes
  card7: P({ key: { dir: D(-0.97, 0.06, 0.2), dist: 3.0, color: '#ffffff', intensity: 3.0, angle: 0.3, softness: 0.6 }, fill: { intensity: 0.1 }, env: 0.26 }),                     // hard side light, one long sharp shadow
  card8: P({ key: { dir: D(-0.2, 0.75, 0.62), dist: 1.2, color: '#ffd9a8', intensity: 3.1, angle: 0.24, penumbra: 0.55, softness: 4 }, fill: { intensity: 0.08 }, env: 0.18, backdrop: { pool: 0.16, poolColor: '#ffe2bf', poolRadius: 0.55, poolOffset: [0, 0.1, -0.9] } }),  // a warm gallery spotlight

  // look-dev utilities
  backlit: P({ key: { intensity: 0.0 }, back: { dir: D(0.05, 0.25, -1), intensity: 4.0 }, fill: { intensity: 0.0 }, env: 0.12, contact: { contact: 0, soft: 0 } }),
  raking: P({ key: { dir: D(-0.97, 0.12, 0.2), dist: 1.0, intensity: 3.2, softness: 3 }, fill: { intensity: 0.06 }, env: 0.18 }),
};

/* ------------------------------------------------------------------------------------------------ blending */
const NUM = (x) => typeof x === 'number';
function blendObj(list, key) {          // list: [[obj, w], ...]
  const first = list.find(([o]) => o && o[key] !== undefined); if (!first) return undefined;
  const v0 = first[0][key];
  if (NUM(v0)) { let s = 0, ws = 0; for (const [o, w] of list) if (o && NUM(o[key])) { s += o[key] * w; ws += w; } return ws ? s / ws : v0; }
  if (typeof v0 === 'string') {           // colour
    const c = new THREE.Color(0, 0, 0); let ws = 0;
    for (const [o, w] of list) if (o && o[key] !== undefined) { const t = C(o[key]); c.r += t.r * w; c.g += t.g * w; c.b += t.b * w; ws += w; }
    return ws ? c.multiplyScalar(1 / ws) : C(v0);
  }
  if (v0 instanceof THREE.Vector3) { const v = new THREE.Vector3(); for (const [o, w] of list) if (o && o[key]) v.addScaledVector(o[key], w); return v.lengthSq() > 1e-8 ? v.normalize() : v0.clone(); }
  if (Array.isArray(v0)) { const r = v0.map(() => 0); let ws = 0; for (const [o, w] of list) if (o && o[key]) { o[key].forEach((x, i) => (r[i] += x * w)); ws += w; } return r.map((x) => x / (ws || 1)); }
  if (typeof v0 === 'object') { const out = {}; const keys = new Set(); for (const [o] of list) if (o && o[key]) Object.keys(o[key]).forEach((k) => keys.add(k)); const sub = list.map(([o, w]) => [o && o[key], w]); for (const k of keys) out[k] = blendObj(sub, k); return out; }
  return v0;
}
/** Weighted blend of presets: blendPresets([['s01', 0.3], ['s02', 0.7]]) (names or objects). */
export function blendPresets(list) {
  const L = list.map(([p, w]) => [typeof p === 'string' ? LIGHT_PRESETS[p] : p, Math.max(0, w)]).filter(([p, w]) => p && w > 0);
  if (!L.length) return LIGHT_PRESETS.studio;
  const out = {}; for (const k of ['key', 'fill', 'back', 'rim', 'env', 'exposure', 'backdrop', 'contact']) out[k] = blendObj(L, k);
  out.space = L[0][0].space; return out;
}

/* ------------------------------------------------------------------------------------------------ the rig */
export class LightRig {
  constructor({ shadowSize = 2048 } = {}) {
    this.group = new THREE.Group(); this.group.name = 'paper.lights';
    this.target = new THREE.Object3D(); this.group.add(this.target);
    this.key = new THREE.SpotLight(0xffffff, 1, 0, 0.6, 1, 2);
    this.key.castShadow = shadowSize > 0;
    if (shadowSize > 0) {
      this.key.shadow.mapSize.set(shadowSize, shadowSize);
      this.key.shadow.bias = -0.00008; this.key.shadow.normalBias = 0.0006; this.key.shadow.radius = 6;
      this.key.shadow.camera.near = 0.2; this.key.shadow.camera.far = 6;
    }
    this.key.target = this.target;
    this.back = new THREE.SpotLight(0xffffff, 0, 0, 0.75, 1, 2); this.back.target = this.target;
    this.fill = new THREE.DirectionalLight(0xffffff, 0.3); this.fill.target = this.target;
    this.rim = new THREE.DirectionalLight(0xffffff, 0); this.rim.target = this.target;
    this.group.add(this.key, this.back, this.fill, this.rim);
    this.state = LIGHT_PRESETS.studio;
    this.focus = new THREE.Vector3();
    this._q = new THREE.Quaternion(); this._v = new THREE.Vector3();
  }
  /** preset name, preset object, or a list for blending [[name|obj, weight], ...] */
  set(p) { this.state = Array.isArray(p) ? blendPresets(p) : (typeof p === 'string' ? (LIGHT_PRESETS[p] || LIGHT_PRESETS.studio) : p); return this; }
  /** world position the lights aim at (usually the hero sheet's centre) */
  aim(v) { this.focus.copy(v); return this; }

  /** apply to the three lights, the renderer, the scene and the system (call every frame before rendering) */
  apply({ camera, renderer, scene, backdrop, contact }) {
    const S = this.state, q = this._q;
    if (S.space === 'world' || !camera) q.identity(); else camera.getWorldQuaternion(q);
    const toWorld = (d) => this._v.copy(d.isVector3 ? d : D(...d)).applyQuaternion(q);
    this.target.position.copy(this.focus); this.target.updateMatrixWorld();
    const spot = (L, s, dflt) => {
      const dist = s.dist ?? dflt;
      L.position.copy(this.focus).addScaledVector(toWorld(s.dir), dist);
      L.color.copy(s.color.isColor ? s.color : C(s.color));
      L.intensity = (s.intensity || 0) * dist * dist;
      L.angle = s.angle ?? 0.6; L.penumbra = s.penumbra ?? 1; L.decay = 2; L.distance = 0;
      L.visible = L.intensity > 0;
    };
    spot(this.key, S.key, 1.5); spot(this.back, S.back, 1.6);
    if (this.key.castShadow) {
      this.key.shadow.radius = S.key.softness ?? 6;
      this.key.shadow.intensity = S.key.shadow ?? 1;
      const d = S.key.dist ?? 1.5; this.key.shadow.camera.near = Math.max(0.05, d * 0.35); this.key.shadow.camera.far = d * 3 + 1;
    }
    const dir = (L, s) => {
      L.position.copy(this.focus).addScaledVector(toWorld(s.dir), 3);
      L.color.copy(s.color.isColor ? s.color : C(s.color)); L.intensity = s.intensity || 0; L.visible = L.intensity > 0;
    };
    dir(this.fill, S.fill); dir(this.rim, S.rim);
    if (scene) scene.environmentIntensity = S.env;
    if (renderer) renderer.toneMappingExposure = S.exposure;
    if (backdrop) {
      const U = backdrop.userData.uniforms, b = S.backdrop || {};
      U.uGain.value = b.gain ?? 1;
      const off = b.poolOffset || [0, 0, 0];
      const o = this._v.set(off[0], off[1], off[2]); if (S.space !== 'world' && camera) o.applyQuaternion(q);
      U.uPool.value[0].set(this.focus.x + o.x, this.focus.y + o.y, this.focus.z + o.z, b.poolRadius ?? 1.4);
      const pc = b.poolColor ? (b.poolColor.isColor ? b.poolColor : C(b.poolColor)) : C('#ffffff');
      U.uPoolC.value[0].set(pc.r, pc.g, pc.b, b.pool ?? 0);
    }
    if (contact && S.contact) contact.setStrength(S.contact.contact, S.contact.soft);
    return this;
  }
  /** world-space direction FROM the target TOWARD the key light (used to shear the contact shadow) */
  keyDirection(out = new THREE.Vector3()) { return out.copy(this.key.position).sub(this.focus).normalize(); }
}
