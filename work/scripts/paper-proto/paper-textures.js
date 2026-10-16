// paper-textures.js: procedural, tileable paper-fibre textures (no image files). Sketch for aviva, three 0.186.
// makeFibreTile(): height field of random curved fibres + tooth -> RG8 normal map (packed, three 0.186 supports RGFormat normal maps)
// makeFormationTile(): low-frequency "formation" cloudiness (R), roughness variation (G), thickness/transmission (B)
import * as THREE from 'three';

function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

// tileable value noise on an n x n lattice (period n)
function tileNoise(size, period, rnd) {
  const lat = new Float32Array(period * period); for (let i = 0; i < lat.length; i++) lat[i] = rnd();
  const out = new Float32Array(size * size), sm = (t) => t * t * (3 - 2 * t);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const fx = x / size * period, fy = y / size * period, x0 = Math.floor(fx), y0 = Math.floor(fy), tx = sm(fx - x0), ty = sm(fy - y0);
    const a = lat[(y0 % period) * period + x0 % period], b = lat[(y0 % period) * period + (x0 + 1) % period];
    const c = lat[((y0 + 1) % period) * period + x0 % period], d = lat[((y0 + 1) % period) * period + (x0 + 1) % period];
    out[y * size + x] = (a + (b - a) * tx) + ((c + (d - c) * tx) - (a + (b - a) * tx)) * ty;
  }
  return out;
}

function blur(src, size, radius) { // separable box blur x3 ~ gaussian, wrap-around
  if (radius < 1) return src; const tmp = new Float32Array(src.length), out = Float32Array.from(src); const w = 2 * radius + 1;
  for (let pass = 0; pass < 3; pass++) {
    for (let y = 0; y < size; y++) { let acc = 0; for (let k = -radius; k <= radius; k++) acc += out[y * size + ((k + size) % size)];
      for (let x = 0; x < size; x++) { tmp[y * size + x] = acc / w; acc += out[y * size + ((x + radius + 1) % size)] - out[y * size + ((x - radius + size) % size)]; } }
    for (let x = 0; x < size; x++) { let acc = 0; for (let k = -radius; k <= radius; k++) acc += tmp[((k + size) % size) * size + x];
      for (let y = 0; y < size; y++) { out[y * size + x] = acc / w; acc += tmp[((y + radius + 1) % size) * size + x] - tmp[((y - radius + size) % size) * size + x]; } }
  }
  return out;
}

/**
 * @param {object} o  size px, tileMM (physical size of the tile), fibresPerMM2, lenMM [min,max], widthMM, grain (0..1 bias to machine direction), seed
 * @returns {THREE.DataTexture} RG8 tangent-space normal map (packed XY, Z reconstructed by three) + .userData.height Float32Array
 */
export function makeFibreTile({ size = 1024, tileMM = 30, fibresPerMM2 = 16, lenMM = [0.8, 3.2], widthMM = 0.03, grain = 0.35, tooth = 0.35, strength = 2.2, seed = 7 } = {}) {
  const rnd = mulberry32(seed), pxmm = size / tileMM, H = new Float32Array(size * size);
  const count = Math.round(fibresPerMM2 * tileMM * tileMM), sigma = Math.max(0.6, widthMM * pxmm * 0.5);
  const R = Math.ceil(sigma * 2.2);
  const splat = (x, y, v) => { const xi = Math.round(x), yi = Math.round(y);
    for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) { const w = Math.exp(-(dx * dx + dy * dy) / (2 * sigma * sigma)); const px = ((xi + dx) % size + size) % size, py = ((yi + dy) % size + size) % size; H[py * size + px] += v * w; } };
  for (let i = 0; i < count; i++) {
    const L = (lenMM[0] + (lenMM[1] - lenMM[0]) * rnd() ** 1.6) * pxmm;
    const ang = (rnd() < grain ? 0 : rnd() * Math.PI) + (rnd() - 0.5) * 0.5;         // machine-direction bias: a share of fibres aligned with the grain (x axis)
    const bend = (rnd() - 0.5) * 0.9, x0 = rnd() * size, y0 = rnd() * size, v = 0.35 + rnd() * 0.65, steps = Math.max(2, Math.floor(L / (sigma * 0.9)));
    for (let s = 0; s <= steps; s++) { const t = s / steps, a = ang + bend * (t - 0.5); const px = x0 + Math.cos(ang) * (t - 0.5) * L + Math.sin(ang) * bend * L * 0.25 * (t * t - 0.25), py = y0 + Math.sin(ang) * (t - 0.5) * L - Math.cos(ang) * bend * L * 0.25 * (t * t - 0.25);
      splat(px, py, v * (1 - Math.abs(t - 0.5) * 0.9) * (a * 0 + 1)); }
  }
  // tooth: fine isotropic noise
  const n1 = tileNoise(size, size / 3 | 0, rnd), n2 = tileNoise(size, size / 9 | 0, rnd);
  let maxH = 0; for (let i = 0; i < H.length; i++) if (H[i] > maxH) maxH = H[i];
  for (let i = 0; i < H.length; i++) H[i] = H[i] / (maxH * 0.6 + 1e-6) + tooth * (0.6 * (n1[i] - 0.5) + 0.4 * (n2[i] - 0.5));
  const Hs = blur(H, size, 1);
  const data = new Uint8Array(size * size * 2);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const xl = Hs[y * size + (x - 1 + size) % size], xr = Hs[y * size + (x + 1) % size], yu = Hs[((y - 1 + size) % size) * size + x], yd = Hs[((y + 1) % size) * size + x];
    let nx = -(xr - xl) * strength, ny = -(yd - yu) * strength; const l = Math.hypot(nx, ny, 1); nx /= l; ny /= l;
    data[(y * size + x) * 2] = Math.round((nx * 0.5 + 0.5) * 255); data[(y * size + x) * 2 + 1] = Math.round((ny * 0.5 + 0.5) * 255);
  }
  const tex = new THREE.DataTexture(data, size, size, THREE.RGFormat, THREE.UnsignedByteType);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.magFilter = THREE.LinearFilter; tex.minFilter = THREE.LinearMipmapLinearFilter; tex.generateMipmaps = true; tex.anisotropy = 8;
  tex.colorSpace = THREE.NoColorSpace; tex.needsUpdate = true; tex.userData.height = Hs; return tex;
}

/** RGBA8, 256^2 by default: R = formation (cloudiness), G = roughness multiplier (three reads .g for roughnessMap), B = thickness (for backlit transmission), A = 1 */
export function makeFormationTile({ size = 256, seed = 11 } = {}) {
  const rnd = mulberry32(seed), a = tileNoise(size, 4, rnd), b = tileNoise(size, 8, rnd), c = tileNoise(size, 24, rnd), d = tileNoise(size, 64, rnd);
  const data = new Uint8Array(size * size * 4);
  for (let i = 0; i < size * size; i++) {
    const f = 0.45 * a[i] + 0.3 * b[i] + 0.17 * c[i] + 0.08 * d[i];          // 0..1, mean ~0.5
    data[i * 4] = Math.round(f * 255);
    data[i * 4 + 1] = Math.round((0.9 + (d[i] - 0.5) * 0.12 + (c[i] - 0.5) * 0.08) * 255);   // roughness ~0.9 +-0.07
    data[i * 4 + 2] = Math.round(THREE.MathUtils.clamp(0.5 + (f - 0.5) * 1.8, 0, 1) * 255);  // thickness: cloudier = thicker = darker when backlit
    data[i * 4 + 3] = 255;
  }
  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat, THREE.UnsignedByteType);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.magFilter = THREE.LinearFilter; tex.minFilter = THREE.LinearMipmapLinearFilter; tex.generateMipmaps = true; tex.colorSpace = THREE.NoColorSpace; tex.needsUpdate = true; return tex;
}

/* ======================================================================================================
 * GPU version (recommended): the same idea evaluated per pixel in a fragment shader, tileable, analytic gradient.
 * 1024^2 in a few ms on a real GPU instead of ~0.5-3 s on the CPU. Returns a render-target texture with mipmaps.
 * ====================================================================================================== */
const FIB_VERT = /* glsl */`varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;
const FIB_FRAG = /* glsl */`
precision highp float; varying vec2 vUv;
uniform float uCells;     // cells per tile edge (cell ~ 0.5-1 mm)
uniform float uSigma;     // fibre half-width in cell units
uniform float uLenMin, uLenMax;  // fibre length in cell units
uniform float uGrain;     // 0..1 share of fibres aligned with the machine direction (x)
uniform float uTooth, uStrength, uSeed;
#define FIB 7
vec4 hash4(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * vec3(.1031, .1030, .0973) + uSeed); p3 += dot(p3, p3.yzx + 33.33); vec4 q = fract((p3.xxyz + p3.yzzx) * p3.zyxy); return fract(q + dot(q, q.wzyx + 19.19)); }
float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.-2.*f); return mix(mix(hash4(i).x, hash4(i+vec2(1,0)).x, f.x), mix(hash4(i+vec2(0,1)).x, hash4(i+vec2(1,1)).x, f.x), f.y); }
float tnoise(vec2 p, float per){ // tileable value noise, period 'per'
  vec2 i = floor(p), f = fract(p); f = f*f*(3.-2.*f);
  vec2 a = mod(i, per), b = mod(i + 1., per);
  return mix(mix(hash4(vec2(a.x,a.y)).x, hash4(vec2(b.x,a.y)).x, f.x), mix(hash4(vec2(a.x,b.y)).x, hash4(vec2(b.x,b.y)).x, f.x), f.y); }
void main(){
  vec2 p = vUv * uCells, ip = floor(p); float h = 0.0; vec2 g = vec2(0.0);
  for (int j = -3; j <= 3; j++) for (int i = -3; i <= 3; i++) {
    vec2 cell = ip + vec2(float(i), float(j)), wc = mod(cell, uCells);
    for (int k = 0; k < FIB; k++) {
      vec4 r = hash4(wc * float(FIB) + float(k) + 0.5);
      vec4 s = hash4(wc * 17.3 + float(k) * 3.7 + 11.0);
      vec2 c = cell + r.xy;
      float ang = (s.x < uGrain ? 0.0 : s.y * 6.2831853) + (s.z - 0.5) * 0.45;
      float len = mix(uLenMin, uLenMax, r.z * r.z);
      vec2 d = vec2(cos(ang), sin(ang));
      vec2 pa = p - c; float t = clamp(dot(pa, d), -0.5 * len, 0.5 * len);
      vec2 q = pa - d * t; float dist2 = dot(q, q);
      float taper = 1.0 - 0.6 * abs(t) / (0.5 * len);
      float w = (0.35 + 0.65 * r.w) * taper * exp(-dist2 / (uSigma * uSigma));
      h += w; g += w * (-2.0 * q / (uSigma * uSigma));
    } }
  // tooth (fine isotropic noise), gradient by differences, in units of cells
  float e = 0.02; float n0 = tnoise(p * 9.0, uCells * 9.0), nx = tnoise((p + vec2(e,0)) * 9.0, uCells * 9.0), ny = tnoise((p + vec2(0,e)) * 9.0, uCells * 9.0);
  g += uTooth * vec2(nx - n0, ny - n0) / e * 9.0 * 0.12;
  vec3 n = normalize(vec3(-g * uStrength * 0.18, 1.0));
  gl_FragColor = vec4(n.xy * 0.5 + 0.5, 0.0, 1.0);
}`;

/** Render a fibre normal tile on the GPU. renderer: THREE.WebGLRenderer. Output: RG8 (packed normal) mip-mapped RT texture. */
export function makeFibreTileGPU(renderer, { size = 1024, tileMM = 30, cellMM = 0.8, fibresNote = '7 per cell', lenMM = [0.7, 2.6], widthMM = 0.03, grain = 0.35, tooth = 0.6, strength = 1.0, seed = 3.0 } = {}) {
  const cells = Math.round(tileMM / cellMM), cellMMx = tileMM / cells;
  const rt = new THREE.WebGLRenderTarget(size, size, { format: THREE.RGFormat, type: THREE.UnsignedByteType, depthBuffer: false, generateMipmaps: true, minFilter: THREE.LinearMipmapLinearFilter, magFilter: THREE.LinearFilter, wrapS: THREE.RepeatWrapping, wrapT: THREE.RepeatWrapping, colorSpace: THREE.NoColorSpace });
  rt.texture.anisotropy = 8;
  const mat = new THREE.ShaderMaterial({ vertexShader: FIB_VERT, fragmentShader: FIB_FRAG, depthTest: false, depthWrite: false, uniforms: {
    uCells: { value: cells }, uSigma: { value: Math.max(widthMM / cellMMx * 0.5, 0.5 / size * cells * 1.2) }, uLenMin: { value: lenMM[0] / cellMMx }, uLenMax: { value: lenMM[1] / cellMMx },
    uGrain: { value: grain }, uTooth: { value: tooth }, uStrength: { value: strength }, uSeed: { value: seed } } });
  const tri = new THREE.BufferGeometry(); tri.setAttribute('position', new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3)); tri.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 2, 0, 0, 2], 2));
  const mesh = new THREE.Mesh(tri, mat); mesh.frustumCulled = false; const scene = new THREE.Scene(); scene.add(mesh); const cam = new THREE.Camera();
  const prevRT = renderer.getRenderTarget(), prevTM = renderer.toneMapping; renderer.toneMapping = THREE.NoToneMapping;
  renderer.setRenderTarget(rt); renderer.render(scene, cam); renderer.setRenderTarget(prevRT); renderer.toneMapping = prevTM;
  tri.dispose(); mat.dispose(); return rt.texture;
}
