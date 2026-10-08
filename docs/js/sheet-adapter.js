// sheet-adapter.js: the ONE place that decides which paper system draws the sheet, and the one API the rest of the
// site talks to. Default: the visual-designer's module (docs/js/paper/). If it fails to load or throws, the
// placeholder (js/placeholder-paper.js) takes over; ?paper=placeholder forces the placeholder.
//
//   paper.kind                                   'real' | 'placeholder'
//   paper.install(scene)
//   paper.createSheet({ name, hero, low })       → { object, size, set(state), piece(key), attachPaint(paint), raw }
//   paper.createPaint()                          → { begin(u,v), to(u,v,p), end(), setEraser(on), clear(), bakedLine(a,b,o), hasInk, version }
//   paper.lights.set([[preset, w], …]).aim(v)    (cached: re-blends only when the list changes)
//   paper.update(scene, camera, dt)
//   paper.setFloorPrint({ center, width, opacity, visible })   paper.loadFloorPrint(url)
//   paper.setGround(color)                       the studio colour (backdrop + clear colour), every frame
//   paper.pick(sheet, raycaster)                 → { u, v, face } | null   (ray–plane in the sheet's frame)
//   paper.prepare(renderer, scene, camera)       precompile every material variant behind the loader
//   paper.ensureMacro()                          the s07 fibre layers (real module; no-op on the placeholder)
//
// Sheet state keys are the module's (sheet.js), plus these normalisations:
//   opacity 0..1 (real: material alpha) · curl { corner, t, r, deg, size } (degrees on both systems)
//   boat 0..1 (real: built from fold2D) · crumple 0..1 (real: the baked crumple when FEATURES.paperCrumple,
//   else a fold-based stand-in) · paint / paintFace / map (real: drawn into the sheet's overlay texture)
import * as THREE from 'three';
import { FLAGS, FEATURES } from './config.js';

export async function createPaper(renderer, { tier = 2 } = {}) {
  if (FLAGS.paper !== 'placeholder') {
    try {
      const m = await import('./paper/index.js');
      const sys = await m.createPaperSystem(renderer, { tier });
      return wrapReal(sys, m, renderer);
    } catch (e) {
      console.warn('[aviva] paper module unavailable, using the placeholder sheet:', e && e.message);
    }
  }
  const P = await import('./placeholder-paper.js');
  const sys = await P.createPlaceholderSystem(renderer, { tier });
  return wrapPlaceholder(sys, renderer);
}

/* ------------------------------------------------------------------------------------------------ shared */
const _inv = new THREE.Matrix4(), _ray = new THREE.Ray();
function pick(sheet, raycaster) {
  const o = sheet.object;
  if (!o.visible) return null;
  o.updateMatrixWorld(true);
  _inv.copy(o.matrixWorld).invert();
  _ray.copy(raycaster.ray).applyMatrix4(_inv);
  const dz = _ray.direction.z;
  if (Math.abs(dz) < 1e-6) return null;
  const t = -_ray.origin.z / dz;
  if (t < 0) return null;
  const x = _ray.origin.x + _ray.direction.x * t, y = _ray.origin.y + _ray.direction.y * t;
  const W = sheet.size.w, H = sheet.size.h;
  const u = x / W + 0.5, v = y / H + 0.5;
  if (u < 0 || u > 1 || v < 0 || v > 1) return null;
  return { u, v, face: dz < 0 ? 1 : -1 };
}

function cachedLights(lights) {
  let key = '';
  return {
    get raw() { return lights; },
    set(list) {
      let k = '';
      for (const [n, w] of list) k += n + ':' + w.toFixed(3) + ';';
      if (k !== key) { key = k; lights.set(list.length ? list : [['studio', 1]]); }
      return this;
    },
    aim(v) { lights.aim(v); return this; },
    get focus() { return lights.focus; },
  };
}

/** Keep every light of the rig in the scene (an unlit preset just has intensity 0): the number of lights and of shadow
 *  casters is part of three's shader key, so toggling visibility would recompile every paper material mid-scroll. */
function pinLights(rig) {
  if (!rig) return;
  for (const l of [rig.key, rig.fill, rig.back, rig.rim]) if (l) l.visible = true;
  if (rig.key && rig.shadowEnabled) rig.key.castShadow = true;
}

/** precompile: three compiles only visible objects, and `transparent` is part of the program key, so compile
 *  everything twice (opaque, then transparent) with every object made visible for the call. */
function prepare(renderer, scene, camera, setAllTransparent) {
  const hidden = [];
  scene.traverse((o) => { if (!o.visible) { hidden.push(o); o.visible = true; } });
  const parallel = renderer.extensions.has('KHR_parallel_shader_compile');
  const run = () => (parallel ? renderer.compileAsync(scene, camera) : Promise.resolve(renderer.compile(scene, camera)));
  return run()
    .then(() => { if (setAllTransparent) { setAllTransparent(true); return run(); } return null; })
    .finally(() => { if (setAllTransparent) setAllTransparent(false); for (const o of hidden) o.visible = false; });
}

/* ------------------------------------------------------------------------------------------------ placeholder */
function wrapPlaceholder(sys, renderer) {
  const lights = cachedLights(sys.lights);
  const wrapped = [];
  const paper = {
    kind: 'placeholder', raw: sys, lights,
    install: (scene) => { sys.install(scene); paper.scene = scene; return paper; },
    createSheet({ name = 'sheet', hero = false, low = false } = {}) {
      const s = sys.createSheet({ name, surface: hero, segments: low ? [28, 40] : [42, 60] });
      const w = {
        raw: s, object: s.object, size: s.size,
        set(st) {
          if (st.curl && st.curl.deg !== undefined) st = { ...st, curl: { ...st.curl, angle: st.curl.deg } };
          s.set(st); return w;
        },
        piece: (k) => s.piece(k),
        attachPaint: (p) => s.attachPaint(p),
      };
      wrapped.push(w);
      return w;
    },
    createPaint: () => sys.createPaint(),
    update: (scene, camera, dt) => { sys.update(scene, camera, dt); pinLights(sys.lights); },
    setFloorPrint: (o) => sys.setFloorPrint(o),
    loadFloorPrint: (url) => sys.loadFloorPrint(url),
    setGround(color) { if (paper.scene) paper.scene.background.copy(color); },
    presets: sys.presets || {},
    contactBlob: (...a) => sys.contactBlob(...a),
    pick,
    ensureMacro() {},
    prepare: (r, scene, camera) => prepare(r, scene, camera, (on) => {
      for (const w of wrapped) { const m = w.raw.material; m.transparent = on; m.needsUpdate = true; }
    }),
    dispose: () => sys.dispose(),
  };
  return paper;
}

/* ------------------------------------------------------------------------------------------------ the real module */
function wrapReal(sys, m, renderer) {
  const F = m.folds;
  const lights = cachedLights(sys.lights);
  const wrapped = [];
  const U = sys.backdrop && sys.backdrop.userData.uniforms;
  let paintRef = null;

  const paper = {
    kind: 'real', raw: sys, lights, tier: sys.tier,
    install: (scene) => { sys.install(scene); paper.scene = scene; return paper; },
    createSheet({ name = 'sheet', hero = false, low = false } = {}) {
      const segs = low ? [64, 90] : null;
      const s = sys.createSheet({ name, segments: segs, castShadow: true, contact: true });
      s.set({ flutterAuto: true });
      const w = realSheet(s, { F, hero, getPaint: () => paintRef });
      wrapped.push(w);
      return w;
    },
    async createPaint() {
      // the module's GPU pencil (paint.js) has the same method names as the placeholder's canvas pencil
      if (FEATURES.paperPaint && sys.createPaint) {
        try {
          const p = await sys.createPaint();
          if (p && p.begin && p.bakedLine) {
            // PaintLayer.clear() empties the render target's base level but not its mip levels, so a small sheet kept
            // showing the old strokes: an invisible eraser dab off the sheet forces one render, which rebuilds the mips
            const clear = p.clear.bind(p);
            p.clear = () => { clear(); const tool = p.tool; p.setTool('eraser'); p.begin(-2, -2); p.end(); p.setTool(tool); };
            return p;
          }
        } catch (e) { console.warn('[aviva] module paint failed:', e && e.message); }
      }
      const { PlaceholderPaint } = await import('./placeholder-paper.js');
      paintRef = new PlaceholderPaint();
      return paintRef;
    },
    update(scene, camera, dt) {
      for (const w of wrapped) w._flush();
      sys.update(scene, camera, dt);
      pinLights(sys.lights);
    },
    setFloorPrint: (o) => sys.setFloorPrint(o),
    loadFloorPrint: (url) => sys.loadFloorPrint(url),
    setGround(color) {
      if (sys.setGround) { sys.setGround(color); return; }
      if (U && U.uStudio) U.uStudio.value.copy(color);
      if (paper.scene && paper.scene.background && paper.scene.background.isColor) paper.scene.background.copy(color);
    },
    presets: m.LIGHT_PRESETS,
    contactBlob() {},
    pick,
    ensureMacro() {
      try { sys.ensureMacro && sys.ensureMacro(); sys.ensureFibreGeo && sys.ensureFibreGeo(); } catch (e) { console.warn('[aviva] macro textures:', e && e.message); }
    },
    prepare: (r, scene, camera) => prepare(r, scene, camera, (on) => { for (const w of wrapped) w._setTransparent(on, true); }),
    dispose: () => sys.dispose(),
  };
  return paper;
}

/** the module's sheet, with the adapter's keys translated */
function realSheet(s, { F, hero, getPaint }) {
  const st = { opacity: 1, boat: 0, crumple: 0, paint: false, paintFace: -1, map: 0 };
  let foldsKey = '', overlay = null, transparent = false;

  function materials(fn) {
    s.object.traverse((o) => { if (o.isMesh && o.material && o.material.userData && o.material.userData.variant) fn(o.material, o); });
  }
  function setTransparent(on, force) {
    if (!force && on === transparent) return;
    transparent = on;
    materials((mat) => { mat.transparent = on; mat.depthWrite = !on; mat.needsUpdate = true; });
  }
  function applyOpacity() {
    const op = st.opacity;
    setTransparent(op < 0.999);
    materials((mat) => { mat.opacity = op; });
  }
  function applyFolds() {
    const list = [];
    if (st.boat > 0) list.push(...boatFolds(F, st.boat));
    let k = 1;
    if (st.crumple > 0 && !FEATURES.paperCrumple) { list.push(...crumpleFolds(F, st.crumple)); k = 1 - 0.55 * smooth(st.crumple); }
    const key = st.boat.toFixed(3) + '|' + (FEATURES.paperCrumple ? 0 : st.crumple).toFixed(3);
    for (const p of s.pieces) p.object.scale.setScalar(k);
    if (key !== foldsKey) { foldsKey = key; s.set({ folds: list.length ? list : null }); }
  }

  const w = {
    raw: s, object: s.object, size: s.size, hero,
    set(next) {
      const pass = {};
      let folds = false, ov = false;
      for (const k in next) {
        const v = next[k];
        if (k === 'opacity') { st.opacity = v; continue; }
        if (k === 'boat') { st.boat = v || 0; folds = true; continue; }
        if (k === 'crumple') { st.crumple = v || 0; if (FEATURES.paperCrumple) pass.crumple = v; else folds = true; continue; }
        if (k === 'paint') { st.paint = !!v; if (w._modulePaint) pass.paint = !!v; else ov = true; continue; }
        if (k === 'paintFace') { st.paintFace = v; if (w._modulePaint) pass.paintFace = v; else ov = true; continue; }
        if (k === 'map') { st.map = v || 0; ov = true; continue; }
        if (k === 'still') continue;
        if (k === 'curl') { pass.curl = v ? { corner: v.corner, t: v.t, r: v.r, size: v.size, angle: (v.deg ?? 25) * Math.PI / 180, toward: v.toward } : null; continue; }
        pass[k] = v;
      }
      if (Object.keys(pass).length) s.set(pass);
      if ('tear' in next) applyOpacity();           // torn pieces are new meshes: give them the current alpha
      if ('opacity' in next) applyOpacity();
      if (folds) applyFolds();
      if (ov) w._ovDirty = true;
      return w;
    },
    piece: (k) => s.piece(k),
    attachPaint(p) {
      if (p && p.canvas) { w._ovDirty = true; return; }      // the placeholder pencil: drawn into the overlay
      if (p) { w._modulePaint = true; s.attachPaint(p); s.set({ paint: st.paint, paintFace: st.paintFace }); }
    },
    _modulePaint: false,
    _ovDirty: true,
    _flush() {
      // the overlay: the canvas pencil (when the module has no GPU paint layer yet) and the v0.1 map lines
      const paint = w._modulePaint ? null : getPaint();
      const wantPaint = st.paint && paint, wantMap = st.map > 0.01;
      if (!wantPaint && !wantMap) { if (overlay && overlay.on) { overlay.on = false; s.set({ overlay: null }); } return; }
      if (!overlay) overlay = makeOverlay();
      const key = (wantPaint ? paint.version : -1) + '|' + st.map.toFixed(2) + '|' + st.paintFace;
      if (key !== overlay.key || w._ovDirty) {
        overlay.key = key; w._ovDirty = false;
        overlay.draw(wantPaint ? paint : null, st.map);
        const face = wantPaint && wantMap ? 0 : wantPaint ? st.paintFace : 1;
        s.set({ overlay: { texture: overlay.texture, opacity: 1, face } });
        overlay.on = true;
      }
    },
    _setTransparent: (on, force) => setTransparent(on, force),
  };
  return w;
}

const smooth = (t) => { t = Math.min(1, Math.max(0, t)); return t * t * (3 - 2 * t); };

/** paper boat stand-in (the module has no boat yet): half down behind, two corners to the centre, brim up */
function boatFolds(F, t, W = 0.21, H = 0.297) {
  const k = (i) => Math.min(1, Math.max(0, t * 4 - i)), r = 0.0005;
  return [
    F.fold2D({ p: [0, 0], dir: [1, 0], side: [0, 1], toward: -1, radius: r, t: k(0) }),
    F.fold2D({ p: [0, 0], dir: [1, 1], side: [-1, 1], toward: 1, radius: r, t: k(1) }),
    F.fold2D({ p: [0, 0], dir: [1, -1], side: [1, 1], toward: 1, radius: r, t: k(2) }),
    F.fold2D({ p: [0, -H / 2 + 0.032], dir: [1, 0], side: [0, -1], toward: 1, radius: r, t: k(3) }),
  ];
}

/** crumple stand-in (until the baked crumple lands): six staggered soft creases in alternating directions */
const CRUMPLE_LINES = [
  { p: [0.012, 0.03], dir: [1, 0.35], side: [0, 1], toward: 1 },
  { p: [-0.02, -0.04], dir: [1, -0.6], side: [0, -1], toward: -1 },
  { p: [0.03, -0.01], dir: [0.2, 1], side: [1, 0], toward: 1 },
  { p: [-0.035, 0.02], dir: [-0.3, 1], side: [-1, 0], toward: -1 },
  { p: [0.0, 0.07], dir: [1, -0.15], side: [0, 1], toward: 1 },
  { p: [0.0, -0.075], dir: [1, 0.2], side: [0, -1], toward: -1 },
];
function crumpleFolds(F, t) {
  return CRUMPLE_LINES.map((L, i) => F.fold2D({ ...L, angle: Math.PI * 0.82, radius: 0.009 + 0.003 * (i % 3), t: smooth(t * 1.6 - i * 0.12), minRadius: false }));
}

/** the overlay texture (sheet uv: u right, v up), drawn with the canvas pencil and the faint v0.1 map lines */
function makeOverlay(w = 640, h = 905) {
  const canvas = document.createElement('canvas'); canvas.width = w; canvas.height = h;
  const x = canvas.getContext('2d');
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = 4;
  const MAP = [[0.12, 0.7, 0.3, 0.62, 0.45, 0.66, 0.6, 0.55, 0.82, 0.58], [0.2, 0.3, 0.32, 0.38, 0.5, 0.33, 0.66, 0.4, 0.8, 0.36], [0.4, 0.1, 0.42, 0.3, 0.38, 0.5, 0.44, 0.75, 0.4, 0.92]];
  return {
    canvas, texture, key: '', on: false,
    draw(paint, map) {
      x.globalCompositeOperation = 'source-over'; x.globalAlpha = 1;
      x.clearRect(0, 0, w, h);
      if (map > 0.01) {
        x.save(); x.globalAlpha = 0.32 * map; x.strokeStyle = '#2a2926'; x.lineWidth = 1.2; x.lineJoin = 'round'; x.lineCap = 'round';
        for (const l of MAP) { x.beginPath(); for (let i = 0; i < l.length; i += 2) { const px = l[i] * w, py = (1 - l[i + 1]) * h; i ? x.lineTo(px, py) : x.moveTo(px, py); } x.stroke(); }
        x.restore();
      }
      if (paint && paint.canvas) x.drawImage(paint.canvas, 0, 0, w, h);
      texture.needsUpdate = true;
    },
  };
}
