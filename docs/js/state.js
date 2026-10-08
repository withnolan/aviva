// state.js: the scene state, rebuilt every frame with the "reset-then-claim" pattern (tech research §4.2).
//
//   state.reset();                         // 1. every channel back to "unclaimed"
//   state.w = 0.7; state.set('A.x', 36);   // 2. each section that is on screen claims values with its weight
//   state.resolve();                       // 3. value = Σ w·v / Σ w per channel (or the default if nobody claimed it)
//   springs.step(state, dt);               // 4. the rendered values chase the targets (critically damped)
//
// Because nothing is stateful between frames, scrubbing backwards is exact and neighbouring sections cross-fade
// for free. Enum channels (modes) resolve to the value with the largest weight. Light presets are claimed by name
// and blended by the paper module's blendPresets([[name, w], …]).

// [name, default, ω (rad/s; 0 = no spring, follows the target directly), ζ (damping ratio, 1 = critical)]
const CHANNELS = [
  // camera rig
  ['cam.pitch', 0, 5], ['cam.yaw', 0, 5], ['cam.roll', 0, 5], ['cam.floor', 0, 4.5], ['cam.push', 0, 5],
  ['cam.fov', 30, 5], ['cam.panX', 0, 6], ['cam.panY', 0, 6],
  // ground, studio
  ['bg.ink', 0, 0], ['bg.dark', 0, 4], ['bg.warm', 0, 3], ['world.print', 0, 6], ['world.shadow', 1, 6],
  // ink: drop, absorption front, the screen-space bleed, grade
  ['ink.dropOn', 0, 0], ['ink.drop', 0, 0], ['ink.front', 0, 0], ['ink.grade', 0, 8], ['ink.bleed', 0, 0],
  // the hero sheet A (screen-space pose: x/y in % of the viewport, size = long side of an A4 at that depth in % of
  // the viewport height, rotations in degrees per brief 2B; world pose for the floor beats; deformations)
  ['A.on', 1, 0], ['A.op', 1, 10], ['A.x', 50, 7], ['A.y', 52, 7], ['A.size', 46, 7],
  ['A.rx', 0, 7], ['A.ry', 0, 7], ['A.rz', 0, 7], ['A.dz', 0, 7],
  ['A.world', 0, 9], ['A.wx', 0, 14], ['A.wy', 0, 14], ['A.wz', 0, 14], ['A.wrx', 0, 14], ['A.wry', 0, 14], ['A.wrz', 0, 14],
  ['A.scale', 1, 9, 0.8], ['A.bend', 0, 8], ['A.flutter', 0, 6], ['A.peel', 0, 10], ['A.curl', 0, 9], ['A.dogEar', 0, 9],
  ['A.halving', 0, 10], ['A.plane', 0, 0], ['A.crumple', 0, 0], ['A.show', 0, 10], ['A.trans', 0.24, 6], ['A.wm', 0, 6],
  ['A.map', 0, 6], ['A.dot', 0, 6], ['A.paint', 0, 0], ['A.macro', 0, 6], ['A.thick', 0.0001, 8], ['A.gain', 1, 6],
  ['A.creaseMid', 0, 0], ['A.creaseDog', 0, 0],
  // the second instance B (Arena, the release-notes "known issue")
  ['B.on', 0, 0], ['B.op', 1, 10], ['B.x', 65, 7], ['B.y', 50, 7], ['B.size', 40, 7], ['B.rx', 0, 7], ['B.ry', 0, 7],
  ['B.rz', 0, 7], ['B.dz', 0, 7], ['B.crumple', 0, 0], ['B.bend', 0, 8],
  // tearing (s05)
  ['T.on', 0, 0], ['T.p1', 0, 12], ['T.p2', 0, 12], ['T.split1', 0, 7], ['T.split2', 0, 7], ['T.fall', 0, 6],
  // the drying line (s04): the falling sheet F (it becomes output 1), the line, its offset, card 8's drop
  ['O.on', 0, 0], ['O.line', 0, 8], ['O.lineY', 118, 7], ['O.offset', 0, 7], ['O.drop', 0, 8], ['O.catch', 0, 0],
  ['F.on', 0, 0], ['F.x', 50, 9], ['F.y', -20, 9], ['F.size', 30, 9], ['F.rx', 0, 9], ['F.ry', 0, 9], ['F.rz', 0, 9], ['F.dz', 0, 9],
  // the fit-width numerals "4.99 g" (a WebGL type plane)
  ['N.on', 0, 0], ['N.op', 0, 8], ['N.y', 50, 7],
  // the dart plane flight (s14): 0 → 1 along the path; fade for reduced motion
  ['P.fly', 0, 0], ['P.fade', 1, 0],
];
// enum channels: [name, default]
const ENUMS = [
  ['A.curlCorner', 'tr'], ['A.paintFace', -1], ['T.line', 0], ['D.mode', 'none'], ['ground', 'paper'], ['scene', 'stage'],
  // generation of the sheet on screen: a new value means "a different sheet", so its springs snap (no flight)
  ['A.gen', ''], ['B.gen', ''],
];

// Presence channels: a section that does not claim one implicitly claims its default, so a sheet owned by one
// section (the drying line, the twin, the tear pieces) hands over at the exact midpoint of the blend window.
const PRESENCE = new Set(['A.on', 'B.on', 'T.on', 'O.on', 'F.on', 'N.on', 'ink.dropOn']);

export class SceneState {
  constructor() {
    const n = CHANNELS.length;
    this.names = CHANNELS.map((c) => c[0]);
    this.index = new Map(this.names.map((k, i) => [k, i]));
    this.def = Float64Array.from(CHANNELS, (c) => c[1]);
    this.omega = Float64Array.from(CHANNELS, (c) => c[2]);
    this.zeta = Float64Array.from(CHANNELS, (c) => c[3] ?? 1);
    this.presence = Uint8Array.from(CHANNELS, (c) => (PRESENCE.has(c[0]) ? 1 : 0));
    this.sum = new Float64Array(n);
    this.wsum = new Float64Array(n);
    this.target = Float64Array.from(this.def);   // resolved targets
    this.enumIndex = new Map(ENUMS.map((e, i) => [e[0], i]));
    this.enumDef = ENUMS.map((e) => e[1]);
    this.enumVal = this.enumDef.slice();
    this.enumW = new Float64Array(ENUMS.length);
    this.lightW = new Map();                       // preset name → summed weight this frame
    this.w = 1;                                    // the weight of the section currently claiming
  }
  reset() {
    this.sum.fill(0); this.wsum.fill(0);
    this.enumVal = this.enumDef.slice(); this.enumW.fill(0);
    this.lightW.clear();
  }
  /** claim a numeric channel with the current weight (this.w) */
  set(name, value, w = this.w) {
    const i = this.index.get(name);
    if (i === undefined) { if (!this._warned) { console.warn('[state] unknown channel', name); this._warned = true; } return this; }
    if (w <= 0) return this;
    this.sum[i] += value * w; this.wsum[i] += w;
    return this;
  }
  /** claim several channels: s.many('A.', { x: 50, y: 52 }) */
  many(prefix, obj, w = this.w) { for (const k in obj) this.set(prefix + k, obj[k], w); return this; }
  setEnum(name, value, w = this.w) {
    const i = this.enumIndex.get(name);
    if (i === undefined || w <= 0) return this;
    if (w >= this.enumW[i]) { this.enumW[i] = w; this.enumVal[i] = value; }
    return this;
  }
  /** claim a light preset (a name from the paper module's LIGHT_PRESETS) */
  light(name, w = this.w) { if (w > 0) this.lightW.set(name, (this.lightW.get(name) || 0) + w); return this; }
  /** total = the summed weight of every section on screen this frame (≈ 1) */
  resolve(total = 1) {
    const { sum, wsum, target, def, presence } = this;
    const T = Math.max(1e-9, total);
    for (let i = 0; i < target.length; i++) {
      if (presence[i]) target[i] = (sum[i] + Math.max(0, T - wsum[i]) * def[i]) / Math.max(T, wsum[i]);
      else target[i] = wsum[i] > 1e-9 ? sum[i] / wsum[i] : def[i];
    }
    return this;
  }
  get(name) { return this.target[this.index.get(name)]; }
  enum(name) { return this.enumVal[this.enumIndex.get(name)]; }
}

/** The rendered state: critically damped springs chasing SceneState.target. */
export class Springs {
  constructor(state) {
    this.s = state;
    this.x = Float64Array.from(state.target);
    this.v = new Float64Array(state.target.length);
    this.moving = true;
    this.direct = false;          // reduced motion: follow the targets (lightly smoothed, no overshoot)
    this.lights = new Map();      // damped light preset weights
    this.gens = {};
  }
  snap(prefix) {
    const { s } = this;
    for (let i = 0; i < s.names.length; i++) {
      if (!prefix || s.names[i].startsWith(prefix)) { this.x[i] = s.target[i]; this.v[i] = 0; }
    }
  }
  step(dt) {
    const { s, x, v } = this, T = s.target;
    let moving = false;
    // a sheet that becomes visible appears where it should be: snap its channels (no flight from a stale pose)
    for (const p of SNAP_GROUPS) {
      const i = s.index.get(p + 'on');
      if (T[i] > 0.5 && x[i] <= 0.5) this.snap(p);
    }
    for (const X of ['A', 'B']) {
      const gv = s.enum(X + '.gen');
      if (this.gens[X] !== undefined && this.gens[X] !== gv) this.snap(X + '.');
      this.gens[X] = gv;
    }
    const h = Math.min(dt, 0.25);                 // slow frames still advance in real time (sub-stepped below)
    const sub = Math.max(1, Math.ceil(h / (1 / 120)));
    const k = h / sub;
    for (let i = 0; i < T.length; i++) {
      let w = s.omega[i];
      if (this.direct && w > 0) w = 22;
      if (w <= 0) { x[i] = T[i]; v[i] = 0; continue; }
      const z = this.direct ? 1 : s.zeta[i];
      for (let n = 0; n < sub; n++) {
        const a = w * w * (T[i] - x[i]) - 2 * z * w * v[i];
        v[i] += a * k; x[i] += v[i] * k;
      }
      if (Math.abs(T[i] - x[i]) > 1e-4 * (Math.abs(T[i]) + 1) || Math.abs(v[i]) > 1e-4) moving = true;
      else { x[i] = T[i]; v[i] = 0; }
    }
    // light preset weights: damp toward this frame's claims (λ = 4/s), forget presets that faded out
    const L = this.lights, lambda = this.direct ? 30 : 4;
    for (const [name, w] of s.lightW) if (!L.has(name)) L.set(name, 0), (moving = true);
    for (const [name, cur] of L) {
      const tgt = s.lightW.get(name) || 0;
      const nv = cur + (tgt - cur) * (1 - Math.exp(-lambda * h));
      if (Math.abs(nv - tgt) > 1e-3) moving = true;
      if (tgt === 0 && nv < 1e-3) L.delete(name); else L.set(name, Math.abs(nv - tgt) <= 1e-3 ? tgt : nv);
    }
    this.moving = moving;
    return moving;
  }
  get(name) { return this.x[this.s.index.get(name)]; }
  lightList() { const out = []; for (const [n, w] of this.lights) if (w > 1e-3) out.push([n, w]); return out; }
}
const SNAP_GROUPS = ['A.', 'B.', 'F.', 'N.', 'O.'];
