// index.js: createPaperSystem(renderer, options), the one entry point of the aviva paper module.
//
//   import { createPaperSystem } from './js/paper/index.js';
//   const paper = await createPaperSystem(renderer, { tier: 2 });
//   paper.install(scene);                       // backdrop, lights, environment, background colour
//   const sheet = paper.createSheet();          // { object, set(state), update(), piece(), attachPaint(), dispose() }
//   scene.add(sheet.object);
//   // every frame, after your scroll / spring updates:
//   paper.lights.set('s01').aim(sheet.object.position);
//   paper.update(scene, camera, dt);            // lights, per-sheet thickness, contact shadows, paint flush
//   renderer.render(scene, camera);
//
// See README.md for the full API, units (metres; A4 = 0.21 x 0.297) and the cost of each feature.
import * as THREE from 'three';
import { makeFibreTile, makeMacroTile, makeFibreGeoTile, makeFormationMap, makeTextTexture, makeLogomarkTexture, makeCanvasTexture } from './textures.js';
import { buildEnvironment, createBackdrop } from './studio.js';
import { LightRig, LIGHT_PRESETS, blendPresets } from './lights.js';
import { ContactShadows } from './contact.js';
import { Sheet } from './sheet.js';
import { sheetSegments } from './geometry.js';
import * as folds from './folds.js';

export { LIGHT_PRESETS, blendPresets, folds, Sheet };

export const TOKENS = { paper: '#F7F5F0', studio: '#ECEBE7', graphite: '#2A2926', ink: '#283090', inkDeep: '#1B2066' };

export const PAPER_TONEMAP_GLSL = /* glsl */`
vec3 CustomToneMapping( vec3 color ) {
  color *= toneMappingExposure;
  float peak = max( color.r, max( color.g, color.b ) );
  const float K = 0.82;
  if ( peak <= K ) return color;
  float d = 1.0 - K;
  float newPeak = K + d * ( 1.0 - exp( - ( peak - K ) / d ) );
  color *= newPeak / peak;
  float g = 1.0 - 1.0 / ( 0.6 * ( peak - newPeak ) + 1.0 );
  return mix( color, vec3( newPeak ), g );
}`;
let _tmInstalled = false;
export function installPaperToneMapping() {
  if (_tmInstalled) return; _tmInstalled = true;
  const c = THREE.ShaderChunk.tonemapping_pars_fragment;
  THREE.ShaderChunk.tonemapping_pars_fragment = c.replace(/vec3 CustomToneMapping\( vec3 color \) \{ return color; \}/, PAPER_TONEMAP_GLSL);
}

/** Cheap device tiering (no benchmark download): 0 low phone, 1 phone / tablet, 2 desktop. */
export function detectTier() {
  const coarse = typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches;
  const mobile = coarse || /Android|iPhone|iPad|Mobile/i.test(navigator.userAgent || '');
  const lowMem = (navigator.deviceMemory ?? 8) <= 4 || (navigator.hardwareConcurrency ?? 8) <= 4;
  return mobile ? (lowMem ? 0 : 1) : 2;
}
export const TIERS = [
  { name: 'low', segW: 70, tooth: 512, macro: 512, formation: [256, 362], shadow: 0, contact: 256, paint: 1024, dpr: 1.0 },
  { name: 'mobile', segW: 84, tooth: 1024, macro: 1024, formation: [512, 724], shadow: 1024, contact: 512, paint: 1024, dpr: 1.5 },
  { name: 'desktop', segW: 128, tooth: 1024, macro: 1024, formation: [512, 724], shadow: 2048, contact: 512, paint: 1536, dpr: 2.0 },
];

export async function createPaperSystem(renderer, opts = {}) {
  const tierIndex = opts.tier ?? detectTier();
  const tier = { ...TIERS[tierIndex], ...(opts.tierOverrides || {}) };
  const colors = { ...TOKENS, ...(opts.colors || {}) };
  const floorY = opts.floorY ?? 0;
  const t0 = performance.now();

  // tone mapping: 'paper' (default) is linear to a 0.82 knee, then a smooth hue-preserving shoulder. Whites keep their
  // detail (tooth, formation, show-through) instead of being flattened in PBR Neutral's shoulder (which also subtracts a
  // 0.04 toe). It is installed as THREE.CustomToneMapping; pass { toneMapping: 'neutral' } to keep three's Neutral.
  if ((opts.toneMapping ?? 'paper') === 'paper') { installPaperToneMapping(); renderer.toneMapping = THREE.CustomToneMapping; }
  else renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = tier.shadow > 0;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  /* ---------- textures (all procedural, generated on the GPU) */
  const tex = {};
  tex.tooth = makeFibreTile(renderer, { size: tier.tooth });
  tex.formation = makeFormationMap(renderer, { width: tier.formation[0], height: tier.formation[1] });
  tex.macro = null; tex.fibreGeo = null;          // lazy: ensureMacro()
  tex.watermark = makeLogomarkTexture({ size: 512 });
  const blank = new THREE.DataTexture(new Uint8Array([0, 0, 0, 0]), 1, 1); blank.needsUpdate = true;
  tex.floorPrint = makeTextTexture({ text: 'aviva', font: `300 400px ${opts.font || '"Hanken Grotesk", "Helvetica Neue", Helvetica, Arial, sans-serif'}`, tracking: -0.035, height: 512, pad: 0.1 }).texture;

  const lin = (hex) => new THREE.Color(hex);
  const shared = {
    uBlank: { value: blank },
    uPaperColor: { value: lin(colors.paper).multiplyScalar(opts.albedo ?? 0.97) },
    uGraphite: { value: lin(colors.graphite).multiplyScalar(0.62) },
    uInkColor: { value: lin(colors.ink) }, uInkDeep: { value: lin(colors.inkDeep) },
    uTransTint: { value: new THREE.Color(1.0, 0.9, 0.76) },
    uTooth: { value: tex.tooth }, uToothP: { value: new THREE.Vector4(0.03, opts.toothStrength ?? 1.3, 0.37, 0.61) },
    uMacro: { value: blank }, uMacroP: { value: new THREE.Vector4(0.006, 0.9, 0, 1024) },
    uFormation: { value: tex.formation },
    uWatermark: { value: tex.watermark },
    uFloorPrint: { value: tex.floorPrint }, uFloorRect: { value: new THREE.Vector4(-0.5, 0.2, 1, -0.4) },
    uShowTint: { value: lin(colors.graphite).lerp(new THREE.Color(0.55, 0.57, 0.6), 0.55) },
    uFibreGeo: { value: blank }, uFibreGeoP: { value: new THREE.Vector4(6, 1, 1, 0) },
  };

  /* ---------- environment, backdrop, lights, contact shadows */
  const envRT = buildEnvironment(renderer);
  const backdrop = createBackdrop({ studio: colors.studio, graphite: colors.graphite, floorY, shared });
  const lights = new LightRig({ shadowSize: tier.shadow });
  const contact = new ContactShadows(renderer, { res: tier.contact, floorY });
  contact.bind(backdrop);

  const sheets = new Set();
  const size = new THREE.Vector2();
  let crumpleSys = null, crumplePromise = null;

  const sys = {
    THREE, tier, tierIndex, colors, renderer, shared, textures: tex, backdrop, lights, contact, floorY,
    environment: envRT.texture, sheets, genMs: 0,
    bufferHeight() { renderer.getDrawingBufferSize(size); return size.y || 1; },
    segmentsFor(width = 0.21) { return sheetSegments(tier.segW * width / 0.21); },

    /** add the studio to a scene (backdrop, lights, environment, clear colour) */
    install(scene) {
      scene.environment = envRT.texture; scene.environmentIntensity = 0.5;
      scene.background = new THREE.Color(colors.studio);
      scene.add(backdrop, lights.group);
      this.scene = scene; return this;
    },
    /** new sheet; options { width, height, segments:[w,h], castShadow, contact, name } */
    createSheet(o = {}) { const s = new Sheet(sys, o); sheets.add(s); return s; },
    _forget(s) { sheets.delete(s); },

    /** colours: { paper, studio, graphite, ink, inkDeep } (hex). The backdrop stays exactly the studio token. */
    setColors(c = {}) {
      Object.assign(colors, c);
      if (c.paper) shared.uPaperColor.value.set(c.paper).multiplyScalar(opts.albedo ?? 0.97);
      if (c.graphite) { shared.uGraphite.value.set(c.graphite).multiplyScalar(0.62); backdrop.userData.uniforms.uPrintColor.value.set(c.graphite); }
      if (c.ink) shared.uInkColor.value.set(c.ink);
      if (c.inkDeep) shared.uInkDeep.value.set(c.inkDeep);
      if (c.studio) { backdrop.userData.uniforms.uStudio.value.set(c.studio); if (this.scene && this.scene.background && this.scene.background.isColor) this.scene.background.set(c.studio); }
    },
    /** the floor print (the giant wordmark): texture (alpha = ink) placed on the floor, centre (x, z) and width in metres */
    setFloorPrint({ texture = null, center = [0, 0], width = 1.0, opacity = 1, visible = true } = {}) {
      if (texture) shared.uFloorPrint.value = texture;
      const t = shared.uFloorPrint.value, img = t.image, aspect = img ? img.width / img.height : 2.5;
      const w = width, h = w / aspect;
      shared.uFloorRect.value.set(center[0] - w / 2, center[1] + h / 2, w, -h);
      const U = backdrop.userData.uniforms; U.uPrintP.value.set(opacity, visible ? 1 : 0, 0, 0);
      return { width: w, depth: h };
    },
    /** load docs/assets/logo/wordmark-floor.png if it exists (alpha = ink); falls back to the generated placeholder */
    async loadFloorPrint(url) {
      try {
        const r = await fetch(url, { method: 'GET' }); if (!r.ok) return false;
        const bmp = await createImageBitmap(await r.blob(), { imageOrientation: 'flipY' });   // v = 0 at the bottom, like a canvas texture
        const t = new THREE.Texture(bmp); t.colorSpace = THREE.NoColorSpace; t.generateMipmaps = true; t.minFilter = THREE.LinearMipmapLinearFilter; t.anisotropy = 8; t.flipY = false; t.needsUpdate = true;
        shared.uFloorPrint.value = t; return true;
      } catch { return false; }
    },
    /** macro fibres + the fibre-geometry map for the ink front (lazy: ~2 x one full-screen pass at load) */
    ensureMacro() {
      if (!tex.macro) {
        tex.macro = makeMacroTile(renderer, { size: tier.macro });
        shared.uMacro.value = tex.macro; shared.uMacroP.value.w = tier.macro;
      }
      return tex.macro;
    },
    ensureFibreGeo() {
      if (!tex.fibreGeo) { tex.fibreGeo = makeFibreGeoTile(renderer, { size: tier.macro }); shared.uFibreGeo.value = tex.fibreGeo; shared.uFibreGeoP.value.w = 1; }
      return tex.fibreGeo;
    },
    /** the baked crumple (docs/assets/paper/crumple.bin), loaded on first use */
    loadCrumple() {
      if (crumplePromise) return crumplePromise;
      crumplePromise = import('./crumple.js').then(async (m) => { crumpleSys = await m.loadCrumple(sys, opts.crumpleUrl); sys.crumple = crumpleSys; return crumpleSys ? crumpleSys.data : null; })
        .catch((e) => { console.warn('[paper] no baked crumple:', e.message); return null; });
      return crumplePromise;
    },
    crumple: null,

    /** per frame: lights -> contact shadow -> sheets. dt in seconds. */
    update(scene, camera, dt = 1 / 60) {
      lights.apply({ camera, renderer, scene, backdrop, contact });
      for (const s of sheets) { s.shadowOffset(lights.shadowOffset || 3); s.update(camera, dt); }
      if (contact.enabled) {
        contact.setLight(lights.keyDirection(_kd), 1);
        contact.follow(lights.focus.x, lights.focus.z);
        contact.update(scene);
        contact.syncBackdrop();
      }
      if (this.paints) for (const p of this.paints) p.flush();
    },
    paints: new Set(),
    async createPaint(o = {}) { const { PaintLayer } = await import('./paint.js'); const p = new PaintLayer(renderer, { width: tier.paint, tooth: tex.tooth, ...o }); this.paints.add(p); return p; },
    dispose() {
      for (const s of [...sheets]) s.dispose();
      Object.values(tex).forEach((t) => t && t.dispose && t.dispose());
      envRT.dispose(); contact.dispose(); backdrop.geometry.dispose(); backdrop.material.dispose();
    },
  };
  const _kd = new THREE.Vector3();
  sys.setFloorPrint({ center: [0, 0], width: 1.0, visible: false });
  sys.genMs = performance.now() - t0;
  return sys;
}
