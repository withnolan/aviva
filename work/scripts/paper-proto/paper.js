// paper.js: a deformable A4 sheet in real-time three.js 0.186 (sketch / look-dev prototype for aviva).
// Rest coordinates are metres, x in [-W/2, W/2], y in [-H/2, H/2], z = 0. Everything is deformed in the vertex shader:
//   rest -> folds / curls (one primitive: hinge with bend radius) -> bend -> twist -> flutter -> crumple(wad) -> object matrix
// Normals come from forward differences of the same function (3 evaluations per vertex), so every operation is automatically normal-correct.
import * as THREE from 'three';
import { makeFibreTile, makeFibreTileGPU, makeFormationTile } from './paper-textures.js';

export const A4 = { w: 0.210, h: 0.297 };
export const MAX_FOLDS = 12, N_FACETS = 44;

/* ---------- geometry: top surface + bottom surface + 4 edge walls in ONE BufferGeometry ---------- */
export function createPaperGeometry(segW = 84, segH = 119, size = A4) {
  const pos = [], uv = [], shell = [], idx = [];
  const push = (x, y, u, v, side, ox, oy, wv) => { pos.push(x, y, 0); uv.push(u, v); shell.push(side, ox, oy, wv); return pos.length / 3 - 1; };
  const grid = (side, uoff, voff) => {   // side +1 top (ccw seen from +z), -1 bottom (cw)
    const base = pos.length / 3;
    for (let j = 0; j <= segH; j++) for (let i = 0; i <= segW; i++) {
      const fx = i / segW, fy = j / segH; push((fx - 0.5) * size.w, (fy - 0.5) * size.h, fx + uoff, fy + voff, side, 0, 0, 0); }
    for (let j = 0; j < segH; j++) for (let i = 0; i < segW; i++) {
      const a = base + j * (segW + 1) + i, b = a + 1, c = a + segW + 1, d = c + 1;
      if (side > 0) idx.push(a, b, d, a, d, c); else idx.push(a, d, b, a, c, d); }
  };
  grid(1, 0, 0); grid(-1, 0.37, 0.61);
  // walls: perimeter loop, each vertex doubled (top row wv=+1, bottom row wv=-1), outward normal in rest plane
  const hw = size.w / 2, hh = size.h / 2, sides = [
    { n: segW, p: (t) => [-hw + t * size.w, -hh], o: [0, -1] }, { n: segH, p: (t) => [hw, -hh + t * size.h], o: [1, 0] },
    { n: segW, p: (t) => [hw - t * size.w, hh], o: [0, 1] }, { n: segH, p: (t) => [-hw, hh - t * size.h], o: [-1, 0] } ];
  for (const s of sides) {
    const base = pos.length / 3;
    for (let k = 0; k <= s.n; k++) { const [x, y] = s.p(k / s.n); push(x, y, 0.5, 0.5, 0, s.o[0], s.o[1], 1); push(x, y, 0.5, 0.5, 0, s.o[0], s.o[1], -1); }
    for (let k = 0; k < s.n; k++) { const a = base + k * 2, b = a + 1, c = a + 2, d = a + 3; idx.push(a, b, d, a, d, c); } // a=top,b=bottom (k), c=top,d=bottom (k+1)
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setAttribute('aShell', new THREE.Float32BufferAttribute(shell, 4));
  g.setIndex(idx);
  g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 0.5);   // deformations move vertices: never frustum-cull on the rest-pose sphere
  g.boundingBox = new THREE.Box3(new THREE.Vector3(-.5, -.5, -.5), new THREE.Vector3(.5, .5, .5));
  return g;
}

/* ---------- GLSL: the deformation chunk (shared by the visible material, the depth material and the contact-shadow material) ---------- */
export const DEFORM_GLSL = /* glsl */`
#define MAX_FOLDS ${MAX_FOLDS}
#define N_FACETS ${N_FACETS}
#define N_CREASES 14
uniform vec2  uSheet;
uniform float uThickness;          // metres (exaggerated) ; min on-screen thickness is applied on top
uniform float uPixelSize;          // metres per pixel at the sheet (CPU-computed) -> guarantees a >= ~1.2px visible edge
uniform int   uFoldCount;
uniform vec4  uFoldQ[MAX_FOLDS];   // xyz: point on hinge, w: bend radius (m)
uniform vec4  uFoldA[MAX_FOLDS];   // xyz: hinge axis (unit), w: angle (rad). sign(angle) picks the direction (u = cross(a,m)*sign)
uniform vec4  uFoldM[MAX_FOLDS];   // xyz: unit direction (perp. to axis) pointing to the MOVING side, w: 1 = use rest mask
uniform vec4  uFoldR[MAX_FOLDS];   // rest-space mask: apply only if dot(rest.xy, xy) + z > 0
uniform vec4  uBend;               // x: curvature (1/m), y: axis angle (rad) of the bend line, z: twist (rad/m along y), w: flutter amplitude (m)
uniform vec4  uPleat;              // x: pleat period (m, mountain-to-valley distance), y: fold angle gamma 0..pi/2 (0 = flat, pi/2 = closed), z: fan opening (rad per m along x), w: fan pivot distance below the sheet (m)
uniform vec4  uFlutter;            // x: time, y: frequency, z: seed
uniform float uCrumple;            // 0..1
uniform vec4  uFacet[N_FACETS];    // xyz unit normal, w plane distance (m): baked in JS with a seeded RNG
uniform float uWadRadius;
uniform vec4 uCrease[N_CREASES];   // xyz unit normal of a great-circle crease, w = depth
uniform float uDeformEps;          // forward-difference step in rest space (~0.5 cell)

// --- tiny noise kit ---
float h13(vec3 p){ p = fract(p * .1031); p += dot(p, p.zyx + 31.32); return fract((p.x + p.y) * p.z); }
float vnoise(vec3 x){ vec3 i = floor(x), f = fract(x); f = f*f*(3.-2.*f);
  return mix(mix(mix(h13(i),h13(i+vec3(1,0,0)),f.x), mix(h13(i+vec3(0,1,0)),h13(i+vec3(1,1,0)),f.x), f.y),
             mix(mix(h13(i+vec3(0,0,1)),h13(i+vec3(1,0,1)),f.x), mix(h13(i+vec3(0,1,1)),h13(i+vec3(1,1,1)),f.x), f.y), f.z); }
float edgeVoronoi(vec3 p){ // F2-F1 : ridges between cells (cheap 27-tap version)
  vec3 ip = floor(p), fp = fract(p); float d1 = 8., d2 = 8.;
  for (int k = -1; k <= 1; k++) for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) {
    vec3 g = vec3(i,j,k); vec3 o = vec3(h13(ip+g), h13(ip+g+19.7), h13(ip+g+43.1)); float d = length(g + o - fp);
    if (d < d1) { d2 = d1; d1 = d; } else if (d < d2) d2 = d; }
  return d2 - d1; }

// --- the ONE primitive: hinge with bend radius. A crease is r ~ 0.4 mm, a page curl is r ~ 20 mm, a roll is angle >> pi. ---
void applyFold(inout vec3 p, vec3 rest, vec4 Q, vec4 A, vec4 M, vec4 R) {
  float th = A.w; if (abs(th) < 1e-5) return;
  if (M.w > 0.5 && dot(rest.xy, R.xy) + R.z < 0.0) return;
  vec3 a = A.xyz, m = M.xyz;
  vec3 u = normalize(cross(a, m)) * sign(th);
  float t = abs(th), r = max(Q.w, 1e-4);
  vec3 d = p - Q.xyz; float s = dot(d, m); if (s <= 0.0) return;
  float g = dot(d, a), h = dot(d, u);
  float phi = min(s / r, t), tail = max(s - r * t, 0.0);
  vec3 tT = m * cos(t) + u * sin(t);
  vec3 nPhi = u * cos(phi) - m * sin(phi);
  p = Q.xyz + a * g + m * (r * sin(phi)) + u * (r * (1.0 - cos(phi))) + tT * tail + nPhi * h;
}
vec3 octaToSphere(vec2 e){ vec3 v = vec3(e.xy, 1.0 - abs(e.x) - abs(e.y));
  if (v.z < 0.0) v.xy = (1.0 - abs(v.yx)) * vec2(v.x >= 0.0 ? 1.0 : -1.0, v.y >= 0.0 ? 1.0 : -1.0); return normalize(v); }
// the crumpled "wad": the sheet wrapped onto a faceted ball (octahedral map): convex polyhedron facets + long V-shaped crease lines (great circles) + fine ridges
vec3 wadPoint(vec2 rest, float c){
  vec3 dir = octaToSphere(rest / (0.5 * uSheet));
  vec3 dw = normalize(dir + 0.10 * (vec3(vnoise(dir*1.7), vnoise(dir*1.7+7.1), vnoise(dir*1.7+13.7)) - 0.5));
  float r = 1e9;
  for (int i = 0; i < N_FACETS; i++) { float cs = dot(dw, uFacet[i].xyz); if (cs > 0.03) r = min(r, uFacet[i].w / cs); }
  r = min(r, 1.25);
  float dent = 0.0;
  for (int i = 0; i < N_CREASES; i++) { float d = abs(dot(dw, uCrease[i].xyz)); dent += uCrease[i].w / (1.0 + pow(d / 0.045, 1.5) * 1.0); }
  r *= 1.0 - min(dent, 0.22);
  r *= 1.0 + 0.012 * (vnoise(dir * 14.0) - 0.5);
  return dir * r * uWadRadius;
}
vec3 deformPoint(vec2 rest, out float crumpleW) {
  vec3 R0 = vec3(rest, 0.0), p = R0;
  for (int i = 0; i < MAX_FOLDS; i++) { if (i >= uFoldCount) break; applyFold(p, R0, uFoldQ[i], uFoldA[i], uFoldM[i], uFoldR[i]); }
  // accordion pleats (hand fan / paper fan): triangular wave, arc-length preserving, then optional radial 'fan' mapping
  if (uPleat.y > 1e-4) {
    float w = uPleat.x, g = uPleat.y, sx = p.x + 0.5 * uSheet.x, i = floor(sx / w), f = sx - i * w; float up = mod(i, 2.0) < 0.5 ? 1.0 : -1.0;
    float x0 = i * w * cos(g), z0 = (up > 0.0 ? 0.0 : w * sin(g));
    p.x = x0 + f * cos(g) - 0.5 * uSheet.x * cos(g); p.z += z0 + up * f * sin(g);
    if (uPleat.z > 1e-4) { float ang = p.x * uPleat.z, rr = uPleat.w + (p.y + 0.5 * uSheet.y); p.x = sin(ang) * rr; p.y = cos(ang) * rr - uPleat.w - 0.5 * uSheet.y; }
  }
  // global bend about a line through the origin with direction (cos y, sin y): arc-length preserving, p.z lifts
  if (abs(uBend.x) > 1e-4) { vec2 ax = vec2(cos(uBend.y), sin(uBend.y)), nrm = vec2(-ax.y, ax.x); float s = dot(p.xy, nrm), k = uBend.x, an = s * k;
    vec2 along = ax * dot(p.xy, ax); p.xy = along + nrm * (sin(an) / k); p.z += (1.0 - cos(an)) / k; }
  if (abs(uBend.z) > 1e-4) { float a = p.y * uBend.z; float cs = cos(a), sn = sin(a); p.xz = vec2(cs * p.x - sn * p.z, sn * p.x + cs * p.z); }
  if (uBend.w > 0.0) { p.z += uBend.w * (vnoise(vec3(p.xy * uFlutter.y, uFlutter.x)) - 0.5) * 2.0; }
  crumpleW = smoothstep(0.0, 1.0, uCrumple);
  if (uCrumple > 0.0) {
    vec3 wad = wadPoint(rest, uCrumple);
    float mid = sin(3.14159 * uCrumple);
    vec3 crinkle = (vec3(vnoise(vec3(rest * 45.0, 1.)), vnoise(vec3(rest * 45.0, 7.)), vnoise(vec3(rest * 45.0, 13.))) - 0.5) * 0.010 * mid;
    p = mix(p, wad, crumpleW) + crinkle;
  }
  return p;
}
void deformSurface(vec2 rest, out vec3 P, out vec3 N, out float cw) {
  float e = uDeformEps, c0, c1, c2; P = deformPoint(rest, c0);
  vec3 Pu = deformPoint(rest + vec2(e, 0.0), c1), Pv = deformPoint(rest + vec2(0.0, e), c2);
  N = normalize(cross(Pu - P, Pv - P)); cw = c0;
}
`;

const TEAR_GLSL = /* glsl */`
uniform vec4 uTear;      // xy: unit normal of the tear line in REST space, z: offset (m), w: piece side (+1 / -1), 0 = no tear
uniform vec2 uTearJag;   // x: jaggedness amplitude (m), y: frequency (1/m)
varying vec2 vRest;
float th2(vec2 p){ p = fract(p * vec2(.1031, .1030)); p += dot(p, p.yx + 33.33); return fract((p.x + p.y) * p.x); }
float tn2(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.-2.*f); return mix(mix(th2(i), th2(i+vec2(1,0)), f.x), mix(th2(i+vec2(0,1)), th2(i+vec2(1,1)), f.x), f.y); }
float tearField(vec2 r){ return dot(r, uTear.xy) - uTear.z + uTearJag.x * ((tn2(r * uTearJag.y) - 0.5) * 2.0 + 0.5 * (tn2(r * uTearJag.y * 4.1) - 0.5)); }
`;

export const VERT_BEGIN = /* glsl */`
vec3 pP, pN; float pCW;
deformSurface(position.xy, pP, pN, pCW);
float pT = 0.5 * max(uThickness, uPixelSize * 1.2);       // half thickness, never thinner than ~1.2 px on screen
vec3 objectNormal; vec3 deformed;
if (aShell.x != 0.0) { deformed = pP + pN * (aShell.x * pT); objectNormal = pN * aShell.x; }
else { float pc; vec3 o = deformPoint(position.xy + aShell.yz * uDeformEps, pc) - pP; o = normalize(o - pN * dot(o, pN)); deformed = pP + pN * (aShell.w * pT); objectNormal = o; }
vWorldWad = pCW; vRest = position.xy; vShell = aShell.x;
#ifdef USE_TANGENT
  vec3 objectTangent = vec3( tangent.xyz );
#endif
`;

/* ---------- material: MeshPhysicalMaterial + onBeforeCompile ---------- */
export function createPaperMaterial({ fibre, formation, macro, shared } = {}) {
  const u = shared;   // shared uniforms object (also used by depth material)
  const mat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#f4f2ec'), roughness: 0.92, metalness: 0, ior: 1.45, specularIntensity: 0.35,
    sheen: 1, sheenColor: new THREE.Color(0.20, 0.19, 0.17), sheenRoughness: 0.7,
    normalMap: fibre, normalScale: new THREE.Vector2(0.55, 0.55), roughnessMap: formation, envMapIntensity: 1.0, side: THREE.FrontSide,
  });
  fibre.repeat.set(A4.w / 0.03, A4.h / 0.03);   // NB: for RT textures set repeat on the texture too (works: texture.matrix is built from repeat)         // fibre tile = 30 mm
  formation.repeat.set(A4.w / 0.105, A4.h / 0.105);   // formation tile = 105 mm
  mat.customProgramCacheKey = () => 'aviva-paper-v1';
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, u, {
      uFormationMap: { value: formation }, uFormationRepeat: { value: formation.repeat }, uMacroMap: { value: macro }, uMacroRepeat: { value: new THREE.Vector2(A4.w / 0.0030, A4.h / 0.0030) },
      uMacro: { value: 0 }, uPaint: { value: null }, uPaintOn: { value: 0 }, uFibreRepeat: { value: fibre.repeat }, uTrans: { value: 0.22 }, uTransTint: { value: new THREE.Color('#ffe9c8') },
    });
    mat.userData.shader = shader;
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nattribute vec4 aShell;\nvarying float vWorldWad; varying vec2 vRest; varying float vShell;\n' + DEFORM_GLSL)
      .replace('#include <beginnormal_vertex>', VERT_BEGIN)
      .replace('#include <begin_vertex>', 'vec3 transformed = deformed;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>
varying float vWorldWad; varying float vShell;
uniform sampler2D uPaint; uniform float uPaintOn; uniform vec2 uSheet;
${TEAR_GLSL}
uniform sampler2D uFormationMap; uniform vec2 uFormationRepeat; uniform sampler2D uMacroMap; uniform vec2 uMacroRepeat; uniform float uMacro; uniform vec2 uFibreRepeat; uniform float uTrans; uniform vec3 uTransTint;`)
      .replace('#include <clipping_planes_fragment>', `#include <clipping_planes_fragment>
      float tearBand = 0.0;
      if (uTear.w != 0.0) {
        float d = tearField(vRest) * uTear.w;                              // >= 0 : this piece's side
        float fuzz = (th2(vRest * 3100.0) - 0.5) * 0.0008;                // ragged, fibrous edge
        if (d + fuzz < 0.0) discard;
        tearBand = 1.0 - smoothstep(0.0, 0.0016, d);
      }`)
      .replace('#include <color_fragment>', `#include <color_fragment>
      diffuseColor.rgb = mix(diffuseColor.rgb, vec3(1.0), tearBand * 0.55);   // torn edges show raw, brighter fibre
      if (uPaintOn > 0.5 && vShell > 0.5) { vec4 pc = texture2D(uPaint, vRest / uSheet + 0.5); diffuseColor.rgb = mix(diffuseColor.rgb, pc.rgb, pc.a); }`)
      // macro fibre layer: extra normal detail, faded by screen-space footprint so it only shows when zoomed in (no shimmer at normal distance)
      .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
      {
        vec2 baseUv = vNormalMapUv / uFibreRepeat;                       // 0..1 over the whole sheet
        vec2 muv = baseUv * uMacroRepeat; vec2 dm = fwidth(muv);
        float texelsPerPixel = max(dm.x, dm.y) * 1024.0;                  // macro tile is 1024 px
        float fade = uMacro * (1.0 - smoothstep(0.6, 2.5, texelsPerPixel));
        if (fade > 0.001) {
          vec2 mm = texture2D(uMacroMap, muv).rg * 2.0 - 1.0;
          normal = normalize(normal + (tbn[0] * mm.x + tbn[1] * mm.y) * 1.1 * fade);
        }
      }`)
      // light through paper: thin-surface translucency (unshadowed by own mesh), formation-modulated
      .replace('#include <lights_fragment_end>', `#include <lights_fragment_end>
      {
        vec4 fm = texture2D(uFormationMap, vRoughnessMapUv);
        float thick = mix(0.75, 1.25, fm.b);                              // thicker patches transmit less
        vec3 Nb = -normal, V = normalize(vViewPosition), trans = vec3(0.0);
        #if NUM_DIR_LIGHTS > 0
        for (int i = 0; i < NUM_DIR_LIGHTS; i++) {
          vec3 L = directionalLights[i].direction;
          float back = saturate(dot(Nb, L));                               // light arriving on the far side
          float fwd = pow(saturate(dot(V, -normalize(L + normal * 0.25))), 3.0);   // glow when looking toward the light through the sheet
          trans += directionalLights[i].color * (0.65 * back + 0.9 * fwd * step(0.0, dot(Nb, L)));
        }
        #endif
        #if defined( USE_ENVMAP )
          trans += getIBLIrradiance(Nb) * 0.35;
        #endif
        reflectedLight.indirectDiffuse += trans * uTrans / thick * uTransTint * material.diffuseColor * RECIPROCAL_PI;
      }`);
  };
  return mat;
}

/* depth material for shadow maps: SAME deformation so shadows follow the bent / folded sheet */
export function createPaperDepthMaterial(shared) {
  const m = new THREE.MeshDepthMaterial({ depthPacking: THREE.BasicDepthPacking });
  m.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, shared);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nattribute vec4 aShell;\nvarying float vWorldWad; varying vec2 vRest; varying float vShell;\n' + DEFORM_GLSL)
      .replace('#include <begin_vertex>', VERT_BEGIN.replace('vec3 objectNormal; vec3 deformed;', 'vec3 objectNormal; vec3 deformed;') + '\nvec3 transformed = deformed;')
      .replace('#include <beginnormal_vertex>', '');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\n' + TEAR_GLSL)
      .replace('void main() {', 'void main() {\n  if (uTear.w != 0.0) { float d = tearField(vRest) * uTear.w; if (d + (th2(vRest * 3100.0) - 0.5) * 0.0008 < 0.0) discard; }');
  };
  m.customProgramCacheKey = () => 'aviva-paper-depth-v1';
  return m;
}

/* ---------- JS side: fold authoring + animation state ---------- */
export function makeShared() {
  const arr4 = (n) => Array.from({ length: n }, () => new THREE.Vector4(0, 0, 0, 0));  /* NB: new THREE.Vector4() defaults to w = 1 */
  return {
    uSheet: { value: new THREE.Vector2(A4.w, A4.h) }, uThickness: { value: 0.0006 }, uPixelSize: { value: 0.0 }, uFoldCount: { value: 0 },
    uFoldQ: { value: arr4(MAX_FOLDS) }, uFoldA: { value: arr4(MAX_FOLDS) }, uFoldM: { value: arr4(MAX_FOLDS) }, uFoldR: { value: arr4(MAX_FOLDS) },
    uBend: { value: new THREE.Vector4(0, 0, 0, 0) }, uPleat: { value: new THREE.Vector4(0.015, 0, 0, 0) }, uTear: { value: new THREE.Vector4(1, 0, 0, 0) }, uTearJag: { value: new THREE.Vector2(0.004, 90) }, uFlutter: { value: new THREE.Vector4(0, 6, 1, 0) }, uCrumple: { value: 0 },
    uFacet: { value: arr4(N_FACETS) }, uWadRadius: { value: 0.031 }, uCrease: { value: arr4(14) }, uDeformEps: { value: 0.0008 },
  };
}

export function bakeFacets(shared, seed = 3) {
  let a = seed; const rnd = () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  for (let i = 0; i < 14; i++) { const z = rnd() * 2 - 1, th = rnd() * Math.PI * 2, rr = Math.sqrt(1 - z * z); shared.uCrease.value[i].set(rr * Math.cos(th), rr * Math.sin(th), z, 0.05 + 0.07 * rnd()); }
  for (let i = 0; i < N_FACETS; i++) { const z = rnd() * 2 - 1, th = rnd() * Math.PI * 2, rr = Math.sqrt(1 - z * z); const d = 0.74 + 0.26 * rnd() ** 0.6; shared.uFacet.value[i].set(rr * Math.cos(th), rr * Math.sin(th), z, d); }
}

/**
 * Fold authoring in the plane of the flat-folded sheet (all fold lines of origami steps lie in XY).
 * line: point p=[x,y] + dir=[dx,dy] ; side: vector pointing to the part that MOVES ; toward: +1 valley (flap goes toward +z / viewer), -1 mountain
 * angle: radians (0..PI typical) ; radius: bend radius in metres ; restMask: optional [nx,ny,d] to restrict to rest-space half-plane (needed when two stacked layers must move differently)
 */
export function fold2D({ p, dir, side, toward = 1, angle = Math.PI, radius = 0.0004, restMask = null }) {
  const d = new THREE.Vector3(dir[0], dir[1], 0).normalize();
  let m = new THREE.Vector3(-d.y, d.x, 0); if (m.x * side[0] + m.y * side[1] < 0) m.negate();
  let a = d.clone(); if (new THREE.Vector3().crossVectors(a, m).z < 0) a.negate();
  return { q: new THREE.Vector4(p[0], p[1], 0, radius), a: new THREE.Vector4(a.x, a.y, a.z, toward * angle), m: new THREE.Vector4(m.x, m.y, m.z, restMask ? 1 : 0), r: new THREE.Vector4(...(restMask || [0, 0, 0]), 0), baseAngle: angle };
}
/** upload a list of folds (each with .t 0..1 progress, or pre-scaled angle) into the uniforms */
export function setFolds(shared, folds) {
  shared.uFoldCount.value = Math.min(folds.length, MAX_FOLDS);
  for (let i = 0; i < MAX_FOLDS; i++) {
    const f = folds[i]; if (!f) { shared.uFoldA.value[i].set(0, 0, 1, 0); continue; }
    const t = f.t ?? 1; shared.uFoldQ.value[i].copy(f.q); shared.uFoldA.value[i].copy(f.a); shared.uFoldA.value[i].w = f.a.w * t;
    shared.uFoldM.value[i].copy(f.m); shared.uFoldR.value[i].copy(f.r);
  }
}

/** Dart paper plane on an A4 (210 x 297 mm), as 7 half-space folds. Positions in metres; coordinates are in the sheet's own frame. */
export function dartPlaneFolds() {
  const W = A4.w, H = A4.h, hw = W / 2, hh = H / 2, k = Math.SQRT1_2, r = 0.0004;
  const f = [];
  // 1,2: top corners to the centre line (valley, onto the sheet)
  f.push(fold2D({ p: [0, hh], dir: [1, -1], side: [1, 1], toward: 1, radius: r }));
  f.push(fold2D({ p: [0, hh], dir: [-1, -1], side: [-1, 1], toward: 1, radius: r }));
  // 3,4: fold the new slanted edges to the centre line. Crease = bisector, 22.5 deg off the centre line, from the apex.
  const s = Math.sin(Math.PI / 8), c = Math.cos(Math.PI / 8);
  f.push(fold2D({ p: [0, hh], dir: [s, -c], side: [c, s], toward: 1, radius: r }));
  f.push(fold2D({ p: [0, hh], dir: [-s, -c], side: [-c, s], toward: 1, radius: r }));
  // 5: fold in half along the centre line, mountain (right half goes behind)
  f.push(fold2D({ p: [0, 0], dir: [0, 1], side: [1, 0], toward: -1, radius: r }));
  // 6,7: wings. Hinge from the nose (0,hh) to the tail at x=-wingW. Front layer (rest x<0) up (+z), back layer (rest x>0) down (-z).
  const wingW = 0.045, nose = [0, hh], tail = [-wingW, -hh];
  const dir = [tail[0] - nose[0], tail[1] - nose[1]];
  f.push(fold2D({ p: nose, dir, side: [-1, 0], toward: 1, angle: Math.PI * 0.5, radius: 0.0012, restMask: [-1, 0, 0] }));
  f.push(fold2D({ p: nose, dir, side: [-1, 0], toward: -1, angle: Math.PI * 0.5, radius: 0.0012, restMask: [1, 0, 0] }));
  return f;
}
export function halvingFolds() { // A4 -> A5 -> A6 (sqrt2 ratio: each fold lands the edges exactly on top of each other)
  return [fold2D({ p: [0, 0], dir: [1, 0], side: [0, 1], toward: 1, radius: 0.0004 }), fold2D({ p: [0, 0], dir: [0, 1], side: [1, 0], toward: 1, radius: 0.0004 })];
}

/** convenience: assemble everything */
export function createPaper({ renderer, segW = 84, segH = 119, fibreSize = 1024 } = {}) {
  const shared = makeShared(); bakeFacets(shared);
  shared.uDeformEps.value = 0.5 * A4.w / segW;
  const t0 = performance.now();
  const gpu = !!renderer;
  const fibre = gpu ? makeFibreTileGPU(renderer, { size: fibreSize, tileMM: 30, cellMM: 0.9, lenMM: [0.8, 2.6], seed: 3 }) : makeFibreTile({ size: fibreSize, tileMM: 30, fibresPerMM2: 14, seed: 7 });
  const macro = gpu ? makeFibreTileGPU(renderer, { size: 1024, tileMM: 3, cellMM: 0.3, lenMM: [0.5, 1.4], widthMM: 0.03, tooth: 0.4, strength: 1.0, seed: 9 }) : makeFibreTile({ size: 1024, tileMM: 3, fibresPerMM2: 60, lenMM: [0.4, 1.8], widthMM: 0.03, tooth: 0.25, strength: 2.6, seed: 21 });
  const formation = makeFormationTile({ size: 256 });
  const texMs = performance.now() - t0;
  const material = createPaperMaterial({ fibre, formation, macro, shared });
  const geometry = createPaperGeometry(segW, segH);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false; mesh.castShadow = true; mesh.receiveShadow = true;
  mesh.customDepthMaterial = createPaperDepthMaterial(shared);
  return { mesh, material, shared, geometry, textures: { fibre, macro, formation }, texMs };
}
