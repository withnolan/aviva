// textures.js: every paper texture, generated on the GPU at load time (no image downloads).
//
//   makeFibreTile(renderer)    30 mm tile, RGBA8: RG = tangent-space normal (packed), B = height, A = fibre mask
//                              "tooth": felt + short fibre streaks. The detail you see at 5 cm to 1 m.
//   makeMacroTile(renderer)    6 mm tile, RGBA8: RG normal, B height (cavity / AO), A per-fibre brightness
//                              individual cellulose fibres (ribbons 20-50 um wide), for the camera at 1-3 cm.
//   makeFibreGeoTile(renderer) the same fibres as geometry (centre offset, angle, half length): the ink front wicks along them.
//   makeFormationMap(renderer) one map for the whole sheet (periodic, so per-sheet variants can offset it), RGBA8:
//                              R = formation (the cloudy flocs you see against the light), G = roughness multiplier,
//                              B = optical thickness for transmission, A = fine "fill" noise.
//   makeCanvasTexture / makeTextTexture / makeLogomarkTexture: 2D masks for the floor wordmark, the watermark and type planes.
//
// All data textures are NoColorSpace, mipmapped, RepeatWrapping. Heights go through a 16-bit-in-RGBA8 intermediate
// so the normal pass gets smooth gradients without float render targets.
import * as THREE from 'three';

const VERT = /* glsl */`varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;

let _tri = null;
function fullscreenTriangle() {
  if (_tri) return _tri;
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 2, 0, 0, 2], 2));
  _tri = g; return g;
}

/** Render `material` over the whole of `target` (null = canvas). Restores renderer state. */
export function gpuPass(renderer, material, target) {
  const mesh = new THREE.Mesh(fullscreenTriangle(), material); mesh.frustumCulled = false;
  const scene = new THREE.Scene(); scene.add(mesh);
  const cam = new THREE.Camera();
  const prevRT = renderer.getRenderTarget(), prevTM = renderer.toneMapping, prevAC = renderer.autoClear, prevXR = renderer.xr.enabled;
  renderer.toneMapping = THREE.NoToneMapping; renderer.autoClear = false; renderer.xr.enabled = false;
  renderer.setRenderTarget(target); renderer.render(scene, cam);
  renderer.setRenderTarget(prevRT); renderer.toneMapping = prevTM; renderer.autoClear = prevAC; renderer.xr.enabled = prevXR;
}

function rt(w, h, { mip = true, filter = THREE.LinearFilter, wrap = THREE.RepeatWrapping } = {}) {
  const t = new THREE.WebGLRenderTarget(w, h, {
    type: THREE.UnsignedByteType, format: THREE.RGBAFormat, depthBuffer: false, stencilBuffer: false,
    generateMipmaps: mip, minFilter: mip ? THREE.LinearMipmapLinearFilter : filter, magFilter: filter,
    wrapS: wrap, wrapT: wrap, colorSpace: THREE.NoColorSpace,
  });
  return t;
}

/* ---------- shared GLSL: hashes and tileable gradient noise ---------- */
export const NOISE_GLSL = /* glsl */`
float hash12(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
vec2 hash22(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * vec3(.1031, .1030, .0973)); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.xx + p3.yz) * p3.zy); }
vec4 hash42(vec2 p){ vec4 p4 = fract(vec4(p.xyxy) * vec4(.1031, .1030, .0973, .1099)); p4 += dot(p4, p4.wzxy + 33.33); return fract((p4.xxyz + p4.yzzw) * p4.zywx); }
// periodic gradient noise, period 'per' (in lattice cells), output ~[-1,1]
float pnoise(vec2 p, vec2 per, float seed){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  vec2 a = mod(i, per), b = mod(i + 1.0, per);
  float ga = hash12(a + seed) * 6.2831853, gb = hash12(vec2(b.x, a.y) + seed) * 6.2831853;
  float gc = hash12(vec2(a.x, b.y) + seed) * 6.2831853, gd = hash12(b + seed) * 6.2831853;
  float va = dot(vec2(cos(ga), sin(ga)), f), vb = dot(vec2(cos(gb), sin(gb)), f - vec2(1.0, 0.0));
  float vc = dot(vec2(cos(gc), sin(gc)), f - vec2(0.0, 1.0)), vd = dot(vec2(cos(gd), sin(gd)), f - vec2(1.0, 1.0));
  return 1.6 * mix(mix(va, vb, u.x), mix(vc, vd, u.x), u.y);
}
vec2 encode16(float v){ v = clamp(v, 0.0, 1.0) * 65535.0; float hi = floor(v / 256.0); return vec2(hi, v - hi * 256.0) / 255.0; }
float decode16(vec2 e){ return (e.x * 255.0 * 256.0 + e.y * 255.0) / 65535.0; }
`;

/* ---------- normal pass: height (16 bit in RG) -> RG normal, B height, A passthrough ---------- */
const NORMAL_FRAG = /* glsl */`
precision highp float; varying vec2 vUv;
uniform sampler2D uH; uniform vec2 uTexel; uniform float uStrength;
${NOISE_GLSL}
float H(vec2 o){ return decode16(texture2D(uH, vUv + o * uTexel).rg); }
void main(){
  float hl = H(vec2(-1, 0)), hr = H(vec2(1, 0)), hd = H(vec2(0, -1)), hu = H(vec2(0, 1));
  float hl2 = H(vec2(-2, 0)), hr2 = H(vec2(2, 0)), hd2 = H(vec2(0, -2)), hu2 = H(vec2(0, 2));
  vec2 g = vec2((hr - hl) * 0.6667 + (hr2 - hl2) * 0.0833 * 2.0, (hu - hd) * 0.6667 + (hu2 - hd2) * 0.0833 * 2.0) * 0.5;
  vec3 n = normalize(vec3(-g * uStrength, 1.0));
  vec4 c = texture2D(uH, vUv);
  gl_FragColor = vec4(n.xy * 0.5 + 0.5, decode16(c.rg), c.b);
}`;

function heightToNormal(renderer, heightRT, size, strength) {
  const out = rt(size, size);
  out.texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  const m = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: NORMAL_FRAG, depthTest: false, depthWrite: false,
    uniforms: { uH: { value: heightRT.texture }, uTexel: { value: new THREE.Vector2(1 / size, 1 / size) }, uStrength: { value: strength } } });
  gpuPass(renderer, m, out); m.dispose();
  return out;
}

/* ---------- 30 mm tooth tile: what 80 g/m2 copy paper shows between 5 cm and 1 m ----------
 * Copy paper is calendered: its relief is a FINE fibrous felt (fibres 15-35 um wide, ~1 mm long, laid mostly flat,
 * a little more along the machine direction x), not bumps. Larger relief is very low: the "felt marks" of the press
 * felt and the cloudy formation (1.5-4 mm), which is all that survives the mip chain at hero distance, where it reads
 * as the faint mottle of a real sheet under raking light. Three layers, all tileable:
 *   fibrous felt  dense short fibres splatted from 0.35 mm cells (soft ridges ~2 texels wide, saturating overlaps)
 *   fine felt     gradient noise at 0.9 / 0.45 / 0.22 mm (prime periods per axis: no shared lattice, no grid at any mip)
 *   felt marks    two gentle octaves at 4.3 / 2.3 mm, amplitude uLow (tuned by eye at hero distance)
 * then a calender (peaks pressed flat). Output: 16-bit height in RG for the normal pass, B = fibre mask.
 */
const TOOTH_FRAG = /* glsl */`
precision highp float; varying vec2 vUv;
uniform float uTileMM, uSeed, uFibreAmt, uGrain, uLow, uFelt;
${NOISE_GLSL}
void main(){
  vec2 uv = vUv;
  // felt marks (low, broad) and fine felt (high frequency)
  float lo = 0.62 * pnoise(uv * vec2(7.0, 7.0) + vec2(0.37, 0.71), vec2(7.0, 7.0), uSeed)
           + 0.38 * pnoise(uv * vec2(13.0, 11.0) + vec2(0.13, 0.29), vec2(13.0, 11.0), uSeed + 17.0);
  float fe = 0.45 * pnoise(uv * vec2(37.0, 31.0) + vec2(0.61, 0.07), vec2(37.0, 31.0), uSeed + 31.0)
           + 0.35 * pnoise(uv * vec2(67.0, 71.0) + vec2(0.29, 0.53), vec2(67.0, 71.0), uSeed + 47.0)
           + 0.20 * pnoise(uv * vec2(137.0, 131.0) + vec2(0.83, 0.41), vec2(137.0, 131.0), uSeed + 59.0);
  // the fibrous felt
  float cells = floor(uTileMM / 0.35 + 0.5), cmm = uTileMM / cells, fib = 0.0, top = 0.0;
  vec2 p = uv * cells, ip = floor(p);
  for (int j = -2; j <= 2; j++) for (int i = -2; i <= 2; i++) {
    vec2 cell = ip + vec2(float(i), float(j)), wc = mod(cell, cells);
    for (int k = 0; k < 5; k++) {
      vec4 r = hash42(wc * 3.0 + float(k) * 7.31 + uSeed);
      vec4 s = hash42(wc * 5.0 + float(k) * 3.17 + uSeed + 11.0);
      vec2 c = cell + r.xy;
      float ang = (s.x < uGrain ? (s.y - 0.5) * 0.5 : s.y * 3.14159) + (s.z - 0.5) * 0.35;
      vec2 d = vec2(cos(ang), sin(ang)), n = vec2(-d.y, d.x);
      float len = mix(0.35, 0.95, r.z) / cmm;                    // half length 0.35-0.95 mm, in cells
      vec2 q = p - c; float t = dot(q, d);
      if (abs(t) > len) continue;
      float w = dot(q, n) - 0.18 * (s.w - 0.5) * (t * t - len * len) / len;   // a slight bow
      float wid = (0.025 + 0.015 * r.w) / cmm;                  // half width 25-40 um, in cells (~2 texels: no aliasing)
      float a = w / wid; if (abs(a) > 3.0) continue;
      float tip = smoothstep(len, len * 0.7, abs(t));
      float ridge = exp(-a * a) * tip * (0.45 + 0.55 * s.w);
      fib += ridge; top = max(top, ridge);
    }
  }
  fib = 1.0 - exp(-fib * 0.85);                                  // overlapping fibres saturate (flattened)
  float h = 0.5 + uLow * lo + uFelt * fe + uFibreAmt * (fib - 0.4);
  h = h - 0.45 * max(h - 0.62, 0.0);                             // calender: the peaks are pressed flat
  gl_FragColor = vec4(encode16(clamp(h, 0.0, 1.0)), top, 1.0);
}`;

/**
 * @returns {THREE.Texture} RGBA8, 1 texel = tileMM/size. RG normal, B height, A fibre mask.
 * low = felt-mark relief (what reads at hero distance), felt = fine felt, fibre = fibrous felt.
 */
export function makeFibreTile(renderer, { size = 1024, tileMM = 30, seed = 3, strength = 14, fibre = 0.2, felt = 0.16, low = 0.06, grain = 0.35 } = {}) {
  const h = rt(size, size, { mip: false });
  const m = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: TOOTH_FRAG, depthTest: false, depthWrite: false,
    uniforms: { uTileMM: { value: tileMM }, uSeed: { value: seed }, uFibreAmt: { value: fibre }, uGrain: { value: grain }, uLow: { value: low }, uFelt: { value: felt } } });
  gpuPass(renderer, m, h); m.dispose();
  const out = heightToNormal(renderer, h, size, strength * size / 1024);
  h.dispose();
  out.texture.name = 'paper.fibreTile';
  out.texture.userData.tileMM = tileMM;
  return out.texture;
}

/* ---------- macro tile: cellulose fibres as stacked, twisted, collapsed ribbons (6 mm tile) ----------
 * One fibre loop, two outputs (define GEO):
 *   height pass:   RG = 16-bit height, B = per-fibre brightness, A = fibre mask
 *   geometry pass: the TOP fibre at each texel: RG = its centre offset from the texel (mm, +-uMaxOff), B = angle / pi,
 *                  A = half length / uMaxHalf. The ink front (glsl.js INK_FRONT) wicks along exactly these fibres.
 */
const MACRO_FRAG = /* glsl */`
precision highp float; varying vec2 vUv;
uniform float uTileMM, uSeed, uGrain, uCellMM, uMaxOff, uMaxHalf;
${NOISE_GLSL}
#define FIB 4
void main(){
  float cells = floor(uTileMM / uCellMM + 0.5), cmm = uTileMM / cells;
  vec2 p = vUv * cells, ip = floor(p);
  // fines and filler: a low felt under the fibres, with a few round filler grains
  float base = 0.16 + 0.05 * pnoise(vUv * 60.0, vec2(60.0), uSeed + 3.0) + 0.03 * pnoise(vUv * 240.0, vec2(240.0), uSeed + 5.0);
  vec2 fp = vUv * cells * 6.0; vec2 fi = floor(fp); vec2 fo = hash22(mod(fi, cells * 6.0) + uSeed) ; float fr = length(fract(fp) - fo);
  base += 0.05 * smoothstep(0.16, 0.0, fr) * step(0.7, hash12(mod(fi, cells * 6.0) + 9.0));
  float h = base, bright = 0.5, mask = 0.0;
  vec4 geo = vec4(0.5, 0.5, 0.0, 0.0);
  for (int j = -3; j <= 3; j++) for (int i = -3; i <= 3; i++) {
    vec2 cell = ip + vec2(float(i), float(j)), wc = mod(cell, cells);
    for (int k = 0; k < FIB; k++) {
      vec4 r = hash42(wc * 3.0 + float(k) * 7.31 + uSeed);
      vec4 s = hash42(wc * 5.0 + float(k) * 3.17 + uSeed + 11.0);
      vec2 c = cell + r.xy;
      float ang = (s.x < uGrain ? 0.0 : s.y * 3.14159) + (s.z - 0.5) * 0.7;
      vec2 d = vec2(cos(ang), sin(ang)), n = vec2(-d.y, d.x);
      float len = mix(1.1, 3.0, r.z * r.z);                   // half length in cells
      vec2 q = p - c; float t = dot(q, d);
      if (abs(t) > len) continue;
      float bend = (s.w - 0.5) * 0.4;
      float w = dot(q, n) - bend * (t * t - len * len) / len;
      float twist = abs(cos(t * (1.0 + 1.8 * s.z) + r.x * 6.0));
      float halfW = (0.035 + 0.05 * r.w) * (0.45 + 0.55 * twist) * (0.3 / cmm);   // 10-26 um half width
      float a = abs(w) / halfW; if (a > 1.0) continue;
      float tipFade = smoothstep(len, len * 0.82, abs(t));
      float layer = hash12(wc * 13.0 + float(k)) * 0.62 + 0.24;
      // flattened tube with a collapsed lumen (a groove down the middle), fine fibrils along the length
      float prof = sqrt(max(1.0 - a * a, 0.0)) * (1.0 - 0.32 * exp(-a * a * 10.0) * twist) * tipFade;
      prof *= 1.0 + 0.06 * sin(w / halfW * 9.0 + t * 0.7);
      float hh = layer + 0.2 * prof;
      if (hh > h) {
        h = hh; bright = 0.35 + 0.65 * hash12(wc * 7.0 + float(k) * 1.3); mask = tipFade;
        vec2 off = (c - p) * cmm;                              // fibre centre relative to this texel (mm)
        geo = vec4(clamp(off / uMaxOff, -1.0, 1.0) * 0.5 + 0.5, fract(ang / 3.14159265), clamp(len * cmm / uMaxHalf, 0.0, 1.0));
      }
    }
  }
#ifdef GEO
  gl_FragColor = mask > 0.05 ? geo : vec4(0.5, 0.5, 0.0, 0.0);
#else
  gl_FragColor = vec4(encode16(clamp(h, 0.0, 1.0)), bright, mask);
#endif
}`;

/** 6 mm macro tile: RG normal, B height, A per-fibre brightness. */
export function makeMacroTile(renderer, { size = 1024, tileMM = 6, seed = 9, strength = 7, grain = 0.4, cellMM = 0.25 } = {}) {
  const h = rt(size, size, { mip: false });
  const m = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: MACRO_FRAG, depthTest: false, depthWrite: false,
    uniforms: { uTileMM: { value: tileMM }, uSeed: { value: seed }, uGrain: { value: grain }, uCellMM: { value: cellMM }, uMaxOff: { value: 1.0 }, uMaxHalf: { value: 1.0 } } });
  gpuPass(renderer, m, h); m.dispose();
  const out = heightToNormal(renderer, h, size, strength * size / 1024);
  h.dispose();
  out.texture.name = 'paper.macroTile';
  out.texture.userData.tileMM = tileMM;
  return out.texture;
}

/** The fibre-geometry map of the same macro tile (same seed / params!). NEAREST, no mips. */
export function makeFibreGeoTile(renderer, { size = 1024, tileMM = 6, seed = 9, grain = 0.4, cellMM = 0.25, maxOff = 1.0, maxHalf = 1.0 } = {}) {
  const out = rt(size, size, { mip: false, filter: THREE.NearestFilter });
  const m = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: MACRO_FRAG, depthTest: false, depthWrite: false, defines: { GEO: '' },
    uniforms: { uTileMM: { value: tileMM }, uSeed: { value: seed }, uGrain: { value: grain }, uCellMM: { value: cellMM }, uMaxOff: { value: maxOff }, uMaxHalf: { value: maxHalf } } });
  gpuPass(renderer, m, out); m.dispose();
  out.texture.name = 'paper.fibreGeo';
  out.texture.userData = { tileMM, maxOff, maxHalf };
  return out.texture;
}

/* ---------- formation map (whole sheet, periodic) ---------- */
const FORMATION_FRAG = /* glsl */`
precision highp float; varying vec2 vUv;
uniform vec2 uSheetMM; uniform float uSeed, uFlocMM, uContrast;
${NOISE_GLSL}
float fbm(vec2 uv, float baseMM, int oct, float seed){
  float h = 0.0, amp = 0.5, norm = 0.0;
  for (int o = 0; o < 6; o++) {
    if (o >= oct) break;
    float wl = baseMM / pow(2.03, float(o));
    vec2 per = max(vec2(1.0), floor(uSheetMM / wl * vec2(0.85, 1.0) + 0.5));   // flocs a little longer along x (machine direction)
    h += amp * pnoise(uv * per + vec2(0.31, 0.17) * float(o + 1), per, seed + float(o) * 23.0); norm += amp; amp *= 0.62;
  }
  return h / norm;
}
// Look-through formation of a machine-made copy paper: soft, interconnected flocs of 1-3 mm with thin "voids" between
// them (a little longer along the machine direction x), over a very gentle large-scale variation. Moderate contrast:
// the shader turns R into a few % of albedo and B into +-15 % transmission. Every channel has mean ~0.5.
void main(){
  vec2 uv = vUv;
  float floc = fbm(uv, uFlocMM, 3, uSeed);                  // the flocs
  float fine = fbm(uv, uFlocMM * 0.32, 2, uSeed + 50.0);    // their ragged edges
  float broad = fbm(uv, 32.0, 2, uSeed + 70.0);             // a gentle large-scale variation
  float f = floc + 0.35 * fine;
  f = f + 0.35 * f * abs(f);                                // flocs and voids: a slightly heavier-tailed cloud
  float R = clamp(0.5 + uContrast * (f + 0.3 * broad), 0.0, 1.0);
  float rough = clamp(0.5 + 0.5 * fbm(uv, 4.0, 3, uSeed + 90.0), 0.0, 1.0);
  float B = clamp(0.5 + uContrast * 1.1 * (f + 0.15 * broad), 0.0, 1.0);
  float fill = clamp(0.5 + 0.6 * fbm(uv, 0.9, 2, uSeed + 130.0), 0.0, 1.0);
  gl_FragColor = vec4(R, rough, B, fill);
}`;

export function makeFormationMap(renderer, { width = 512, height = 724, sheetMM = [210, 297], seed = 11, flocMM = 2.6, contrast = 0.42 } = {}) {
  const out = rt(width, height);
  const m = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FORMATION_FRAG, depthTest: false, depthWrite: false,
    uniforms: { uSheetMM: { value: new THREE.Vector2(sheetMM[0], sheetMM[1]) }, uSeed: { value: seed }, uFlocMM: { value: flocMM }, uContrast: { value: contrast } } });
  gpuPass(renderer, m, out); m.dispose();
  out.texture.name = 'paper.formation';
  return out.texture;
}

/* ---------- 2D masks via canvas ---------- */
/** draw(ctx, w, h) paints white-on-transparent (alpha = coverage). Returns a mipmapped CanvasTexture (alpha used as the mask). */
export function makeCanvasTexture(width, height, draw, { name = 'paper.mask', srgb = false } = {}) {
  const c = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(width, height) : Object.assign(document.createElement('canvas'), { width, height });
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, width, height);
  draw(ctx, width, height);
  const t = new THREE.CanvasTexture(c);
  t.name = name;
  t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  t.generateMipmaps = true; t.minFilter = THREE.LinearMipmapLinearFilter; t.magFilter = THREE.LinearFilter;
  t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; t.anisotropy = 8;
  t.needsUpdate = true;
  return t;
}

/**
 * A text mask, e.g. the floor wordmark or the "4.99 g" type plane.
 * Returns { texture, aspect } where aspect = width / height of the inked box (the canvas is padded so mip blur has room).
 */
export function makeTextTexture({ text = 'aviva', font = '300 400px "Helvetica Neue", Helvetica, Arial, sans-serif', tracking = -0.02, height = 512, pad = 0.12 } = {}) {
  const probe = (typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(8, 8) : document.createElement('canvas')).getContext('2d');
  const fontPx = parseFloat(font.match(/(\d+(?:\.\d+)?)px/)[1]);
  probe.font = font;
  const chars = [...text];
  const track = tracking * fontPx;
  let w = 0; const adv = chars.map((ch) => { const m = probe.measureText(ch).width; w += m + track; return m; }); w -= track;
  const m = probe.measureText(text);
  const asc = m.actualBoundingBoxAscent || fontPx * 0.75, desc = m.actualBoundingBoxDescent || fontPx * 0.05;
  const inkH = asc + desc, scale = height * (1 - 2 * pad) / inkH;
  const W = Math.ceil((w * scale) + height * 2 * pad), H = height;
  const texW = Math.min(4096, 2 ** Math.ceil(Math.log2(W)));
  const tex = makeCanvasTexture(texW, H, (ctx) => {
    ctx.save(); ctx.scale(texW / W, 1);
    ctx.fillStyle = '#fff'; ctx.font = font; ctx.textBaseline = 'alphabetic';
    ctx.translate(height * pad, height * pad + asc * scale); ctx.scale(scale, scale);
    let x = 0; chars.forEach((ch, i) => { ctx.fillText(ch, x, 0); x += adv[i] + track; });
    ctx.restore();
  }, { name: 'paper.text:' + text });
  return { texture: tex, aspect: W / H, inkAspect: (w * scale) / (inkH * scale), pad };
}

/**
 * The aviva logomark: four crop marks around an empty 1 : sqrt(2) rectangle (nothing inside).
 * `weight` = line width relative to the rectangle's short side. Soft edges (blur) suit a paper watermark.
 */
export function makeLogomarkTexture({ size = 512, weight = 0.035, markLen = 0.22, gap = 0.07, blur = 0.012 } = {}) {
  const tex = makeCanvasTexture(size, size, (ctx, W, H) => {
    const rh = H * 0.62, rw = rh / Math.SQRT2;           // the trim box (portrait 1 : sqrt2)
    const x0 = (W - rw) / 2, y0 = (H - rh) / 2, x1 = x0 + rw, y1 = y0 + rh;
    const L = rw * markLen, G = rw * gap;
    ctx.strokeStyle = '#fff'; ctx.lineWidth = rw * weight; ctx.lineCap = 'butt';
    if (blur > 0) ctx.filter = `blur(${(rw * blur).toFixed(1)}px)`;
    ctx.beginPath();
    for (const [cx, cy, sx, sy] of [[x0, y0, -1, -1], [x1, y0, 1, -1], [x0, y1, -1, 1], [x1, y1, 1, 1]]) {
      ctx.moveTo(cx + sx * G, cy); ctx.lineTo(cx + sx * (G + L), cy);   // horizontal mark, outside the corner
      ctx.moveTo(cx, cy + sy * G); ctx.lineTo(cx, cy + sy * (G + L));   // vertical mark
    }
    ctx.stroke();
  }, { name: 'paper.logomark' });
  return tex;
}
