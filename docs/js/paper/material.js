// material.js: the aviva paper material (MeshPhysicalMaterial patched with onBeforeCompile) and its helpers:
// the shadow-depth material, the contact-shadow caster and the GPU-pick material. All of them run the same
// deformation, so shadows, contact shadows and pointer hits follow the bent / folded sheet.
//
// Variants:  'slab'    the deformable sheet (geometry.js), all deformations in the vertex shader
//            'crumple' the baked crumple mesh (three morph targets; aRest attribute; AO in vertex colours)
//            'static'  rigid paper objects (the boat): position + normal + aRest
//
// Every sheet owns one uniforms object (makeSheetUniforms). Textures and colours shared by all sheets are the same
// { value } objects from the system, so one change updates every sheet. Materials of the same variant share one
// compiled program (customProgramCacheKey), each with its own uniforms.
import * as THREE from 'three';
import { DEFORM_PARS, DEFORM_VERTEX, VERTEX_VARYINGS, TEAR_PARS, PAPER_FRAG_PARS, INK_FRONT, MAX_FOLDS } from './glsl.js';

const v4 = (x = 0, y = 0, z = 0, w = 0) => new THREE.Vector4(x, y, z, w);   // NB: new Vector4() defaults to w = 1

/* ------------------------------------------------------------------------------------------------ smooth PCF for paper
 * three 0.186's PCF takes 5 taps rotated by interleaved-gradient noise per pixel: on a raking-lit white sheet that
 * shows as a regular dither. The paper gets 16 hardware-PCF taps on a fixed Vogel disk (smooth, no noise). Acne is
 * handled in the shadow map itself (slope-scaled polygon offset that grows with the kernel, see lights.js).
 */
function paperShadowChunk(taps = 16) {
  const src = THREE.ShaderChunk.shadowmap_pars_fragment;
  const a = src.indexOf('float getShadow( sampler2DShadow shadowMap');
  if (a < 0) return src;
  const end = src.indexOf('return mix( 1.0, shadow, shadowIntensity );', a);
  if (end < 0) return src;
  const close = src.indexOf('}', end);
  const fn = `float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
    float shadow = 1.0;
    shadowCoord.xyz /= shadowCoord.w;
    shadowCoord.z += shadowBias;
    bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
    if ( inFrustum && shadowCoord.z <= 1.0 ) {
      float radius = shadowRadius / shadowMapSize.x;
      float acc = 0.0;
      for ( int i = 0; i < ${taps}; i ++ ) {
        float r = sqrt( ( float( i ) + 0.5 ) / ${taps}.0 ), th = float( i ) * 2.399963229728653;
        acc += texture( shadowMap, vec3( shadowCoord.xy + vec2( cos( th ), sin( th ) ) * r * radius, shadowCoord.z ) );
      }
      shadow = acc / ${taps}.0;
    }
    return mix( 1.0, shadow, shadowIntensity );
  `;
  return src.slice(0, a) + fn + src.slice(close);
}
let SHADOW_CHUNK = null;
const arr4 = (n) => Array.from({ length: n }, () => v4());
export const MAX_CREASES = 4;

/** Per-sheet uniforms. `shared` = the system's shared uniform objects (textures, colours). */
export function makeSheetUniforms(shared, size = { w: 0.21, h: 0.297 }) {
  return {
    ...shared,
    uSheet: { value: new THREE.Vector2(size.w, size.h) },
    uHalfThick: { value: 0.00005 }, uDeformEps: { value: 0.0008 },
    uFoldCount: { value: 0 }, uFoldQ: { value: arr4(MAX_FOLDS) }, uFoldA: { value: arr4(MAX_FOLDS) }, uFoldM: { value: arr4(MAX_FOLDS) }, uFoldR: { value: arr4(MAX_FOLDS) },
    uBend: { value: v4() }, uPleat: { value: v4(0.015, 0, 0, 0.05) }, uFlutter: { value: v4(0, 9, 0, 0) }, uCockle: { value: v4(0.00045, 16, 3.7, 0) },
    uFormP: { value: v4(0, 0, 0.08, 0.37) },
    uEdgeP: { value: v4(1.4, 0.18, 0.1, 0.5) },
    uTransP: { value: v4(0.22, 0.35, 0.3, 0) },
    uWatermarkRect: { value: v4(0, -0.035, 0.034, 0.048) },
    uPaint: { value: shared.uBlank.value }, uPaintP: { value: v4(0, 1, 0.12, 0.92) },
    uOverlay: { value: shared.uBlank.value }, uOverlayP: { value: v4(0, 1, 0, 0) },
    uInkDot: { value: v4(0.072, -0.118, 0.0015, 0) },
    uBleed: { value: v4(0, 0, 0, 8) }, uBleedP: { value: v4(0, 0, 0, 0) },
    uShow: { value: v4(0, 0, 0.006, 1.9) },
    uCrease: { value: arr4(MAX_CREASES) },
    uTear0: { value: v4() }, uTear1: { value: v4() }, uTearFx0: { value: v4(1, 0, 0.0016, 55) }, uTearFx1: { value: v4(1, 0, 0.0016, 55) },
    uGain: { value: 1 }, uFacet: { value: 0.65 },
  };
}

/* ------------------------------------------------------------------------------------------------ fragment snippets */
const FRAG_PARS_EXTRA = /* glsl */`
uniform float uFacet;                                     // crumple: 0 smooth .. 1 faceted shading
uniform sampler2D uOverlay; uniform vec4 uOverlayP;      // decal in sheet uv (graphite map lines etc.): x opacity, y face
uniform vec4 uCrease[${MAX_CREASES}];                     // remembered creases: xy rest normal, z offset (m), w strength
uniform vec4 uBleedP;                                     // x amount, y absorption grade, z -, w -
${INK_FRONT}
`;

// runs right after clipping: face, metres-per-pixel, tear discard
const FRAG_CLIP = /* glsl */`
#ifdef PAPER_CRUMPLE
  float paperFace = gl_FrontFacing ? 1.0 : -1.0;
#else
  float paperFace = vShell > 0.5 ? 1.0 : (vShell < -0.5 ? -1.0 : 0.0);
#endif
float paperPx = max(length(fwidth(vRest)) * 0.7071, 1e-7);      // metres (rest) per pixel
float tearBand = 0.0;
if (uTear0.w != 0.0 || uTear1.w != 0.0) { if (tearKeep(vRest, paperPx, tearBand) < 0.0) discard; }
`;

// albedo: formation mottling, tooth cavity, walls, torn fibres, pencil, ink dot, show-through, the ink front
const FRAG_COLOR = /* glsl */`
vec2 paperUv = vRest / uSheet + 0.5;
vec4 paperForm = texture2D(uFormation, paperUv + uFormP.xy + (paperFace < 0.0 ? vec2(uFormP.w, uFormP.w * 1.618) : vec2(0.0)));
vec2 paperToothUv = vRest / uToothP.x + (paperFace < 0.0 ? uToothP.zw : vec2(0.0));
// two samples at incommensurate scales: the 30 mm tile never visibly repeats across the sheet
vec4 paperTooth = texture2D(uTooth, paperToothUv) * 0.62 + texture2D(uTooth, paperToothUv * 0.7692 + vec2(0.43, 0.19)) * 0.38;
vec4 paperMacroS = vec4(0.5, 0.5, 0.5, 0.5); float paperMacroFade = 0.0;
if (uMacroP.z > 0.0) {
  vec2 muv = vRest / uMacroP.x + (paperFace < 0.0 ? vec2(0.31, 0.57) : vec2(0.0));
  vec2 dm = fwidth(muv) * uMacroP.w;
  paperMacroFade = uMacroP.z * (1.0 - smoothstep(0.8, 3.2, max(dm.x, dm.y)));
  if (paperMacroFade > 0.001) paperMacroS = texture2D(uMacro, muv);
}
vec3 alb = uPaperColor * (1.0 + (paperForm.r - 0.5) * uFormP.z + (paperForm.a - 0.5) * uFormP.z * 0.4);   // formation mottle + fine fill
alb *= 1.0 + (paperTooth.b - 0.5) * 0.05;                                   // micro-shadowing in the tooth valleys
alb *= 1.0 + ((paperMacroS.b - 0.5) * 0.16 + (paperMacroS.a - 0.5) * 0.06) * paperMacroFade;   // fibre cavities / fibre-to-fibre tone
if (paperFace == 0.0) alb = min(alb * (1.0 + uEdgeP.z), vec3(1.0));          // the cut edge: raw fibres, a touch brighter
#ifndef PAPER_CRUMPLE
else {                                                                      // a crisp, slightly brighter rim on the face (~1 px)
  vec2 ad = 0.5 * uSheet - abs(vRest);
  float rim = 1.0 - smoothstep(0.4 * paperPx, 1.3 * paperPx, min(ad.x, ad.y));
  alb = min(alb * (1.0 + uEdgeP.z * 0.5 * rim), vec3(1.0));
}
#endif
alb = mix(alb, min(alb * 1.05 + 0.03, vec3(0.98)), tearBand * uEdgeP.w);     // torn edge: raw, whiter fibres
// remembered creases: a faint line where the sheet was folded and unfolded
for (int i = 0; i < ${MAX_CREASES}; i++) {
  if (uCrease[i].w <= 0.0) continue;
  float cd = abs(dot(vRest, uCrease[i].xy) - uCrease[i].z);
  alb *= 1.0 - 0.07 * uCrease[i].w * exp(-pow(cd / max(0.00022, paperPx * 0.8), 2.0));
}
// pencil (graphite density r, impression a: the eraser leaves a ghost)
float paperGraphite = 0.0;
if (uPaintP.x > 0.5 && (uPaintP.y == 0.0 || paperFace * uPaintP.y > 0.5)) {
  vec4 pc = texture2D(uPaint, paperUv);
  paperGraphite = clamp(max(pc.r, uPaintP.z * pc.a), 0.0, 1.0);
  alb = mix(alb, uGraphite, paperGraphite * uPaintP.w);
}
if (uOverlayP.x > 0.0 && (uOverlayP.y == 0.0 || paperFace * uOverlayP.y > 0.5)) {
  vec4 oc = texture2D(uOverlay, paperUv);
  alb = mix(alb, oc.rgb, oc.a * uOverlayP.x);
}
// the 3 mm ink dot: soaked through (lighter on the verso)
float paperRim; float paperDot = inkDotCover(vRest, paperRim) * (paperFace < 0.0 ? 0.72 : 1.0);
alb = mix(alb, mix(uInkColor, uInkDeep, paperRim * 0.55), paperDot);
// the ink front (The Bleed), at fibre scale, plus the cool absorption grade
if (uBleedP.x > 0.0 || uBleedP.y > 0.0) {
  alb = mix(alb, vec3(0.70, 0.72, 0.76) * (0.9 + 0.22 * paperMacroS.a + 0.1 * (paperMacroS.b - 0.5)), uBleedP.y);
  if (uBleedP.x > 0.0) {
    vec3 f = inkFront((vRest - uBleed.xy) * 1000.0, uBleed.z, uBleed.w);
    alb = mix(alb, alb * vec3(0.80, 0.86, 1.0), f.y * 0.55 * uBleedP.x);
    alb = mix(alb, mix(uInkColor * 1.08, uInkDeep * 0.85, f.z), f.x * uBleedP.x);
    paperDot = max(paperDot, f.x * uBleedP.x);
  }
}
// show-through: the floor print seen softly through the sheet when it rests on it (gap-driven, brief 5.2)
if (uShow.x > 0.0) {
  float gap = vPaperWorld.y - uShow.y;
  float contact = 1.0 - smoothstep(0.0, uShow.z, gap);
  if (contact > 0.0) {
    vec2 wuv = (vPaperWorld.xz - uFloorRect.xy) / uFloorRect.zw;
    float lod = clamp(log2(1.0 + max(gap, 0.0) / 0.0004), 0.0, 6.0) + uShow.w;   // seen through fibres: always a little soft
    float ink = textureLod(uFloorPrint, wuv, lod).a;
    float k = uShow.x * 1.75 * mix(0.72, 1.28, paperForm.r) * contact;        // seen through fibres: cloudy, never printed-on
    alb = mix(alb, uShowTint, clamp(ink * k, 0.0, 1.0));
  }
}
diffuseColor.rgb = alb;
`;

const FRAG_ROUGH = /* glsl */`
float roughnessFactor = roughness * (0.94 + 0.12 * paperForm.g);
roughnessFactor = mix(roughnessFactor, 0.62, paperDot * 0.7);
`;

// normal detail: tooth (30 mm tile), macro fibres, the bevelled cut edge, remembered creases
const FRAG_NORMAL = /* glsl */`
#ifdef PAPER_CRUMPLE
// crumpled paper is flat facets between sharp ridges: lean the smooth (interpolated) normal toward the true face normal
{
  vec3 fN = normalize(cross(dFdx(vViewPosition), dFdy(vViewPosition)));
  fN *= dot(fN, normal) < 0.0 ? -1.0 : 1.0;
  normal = normalize(mix(normal, fN, uFacet));
}
#endif
if (paperFace != 0.0) {
  mat3 ptbn = paperTBN(-vViewPosition, normal, vRest);
  vec2 tn = (paperTooth.rg * 2.0 - 1.0) * uToothP.y;
  if (paperMacroFade > 0.001) tn += (paperMacroS.rg * 2.0 - 1.0) * uMacroP.y * paperMacroFade;
  #ifndef PAPER_CRUMPLE
  vec2 ad = 0.5 * uSheet - abs(vRest);
  float bw = max(uEdgeP.x * paperPx, 0.00008);
  tn += vec2(sign(vRest.x) * (1.0 - smoothstep(0.0, bw, ad.x)), sign(vRest.y) * (1.0 - smoothstep(0.0, bw, ad.y))) * uEdgeP.y;
  #endif
  for (int i = 0; i < ${MAX_CREASES}; i++) {
    if (uCrease[i].w <= 0.0) continue;
    float cs = dot(vRest, uCrease[i].xy) - uCrease[i].z, w = max(0.00035, paperPx * 1.2);
    tn += uCrease[i].xy * (-cs / w) * exp(-pow(cs / w, 2.0)) * 0.9 * uCrease[i].w;
  }
  normal = normalize(ptbn * vec3(tn, 1.0));
}
#ifndef PAPER_CRUMPLE
else {
  // the 0.1 mm cut edge: light that enters the lit face scatters out of the cut, so the edge shades like the face the
  // key light falls on (tilted a little outward): a crisp, bright hairline from any side, and at edge-on (s02)
  vec3 fn = normalize(vPaperFaceN);
  vec3 kv = normalize((viewMatrix * vec4(uKeyDir, 0.0)).xyz);
  float ks = dot(fn, kv); fn *= ks < 0.0 ? -1.0 : 1.0;
  normal = normalize(normal * 0.45 + fn * 0.9);
}
#endif
`;

const FRAG_PHYS = /* glsl */`
material.roughness = mix(material.roughness, 0.4, paperGraphite * 0.85);
material.specularColor = mix(material.specularColor, vec3(0.11), paperGraphite);
material.specularColorBlended = mix(material.specularColorBlended, vec3(0.11), paperGraphite);
`;

// light through the paper: warm, cloudy (formation-modulated), not shadowed by the sheet itself
const FRAG_TRANS = /* glsl */`
if (uTransP.x > 0.0) {
  float thick = mix(0.82, 1.18, paperForm.b);
  if (uTransP.w > 0.0) {
    vec2 wuv = (vRest - uWatermarkRect.xy) / uWatermarkRect.zw + 0.5;
    if (wuv.x > 0.0 && wuv.y > 0.0 && wuv.x < 1.0 && wuv.y < 1.0) thick *= 1.0 - 0.5 * uTransP.w * texture2D(uWatermark, wuv).a;
  }
  float block = 1.0 - 0.9 * clamp(max(paperDot, paperGraphite * 0.6), 0.0, 1.0);
  vec3 Nb = -normal, tr = vec3(0.0);
  #if NUM_DIR_LIGHTS > 0
  for (int i = 0; i < NUM_DIR_LIGHTS; i++) {
    vec3 L = directionalLights[i].direction; float b = saturate(dot(Nb, L));
    tr += directionalLights[i].color * b * (1.0 + uTransP.y * pow(saturate(dot(geometryViewDir, -L)), 8.0) * 3.0);
  }
  #endif
  #if NUM_SPOT_LIGHTS > 0
  for (int i = 0; i < NUM_SPOT_LIGHTS; i++) {
    IncidentLight il; getSpotLightInfo(spotLights[i], geometryPosition, il);
    float b = saturate(dot(Nb, il.direction));
    tr += il.color * b * (1.0 + uTransP.y * pow(saturate(dot(geometryViewDir, -il.direction)), 8.0) * 3.0);
  }
  #endif
  #if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_CUBE_UV )
  tr += getIBLIrradiance(Nb) * uTransP.z;
  #endif
  reflectedLight.indirectDiffuse += tr * (uTransP.x / thick) * uTransTint * material.diffuseColor * block * RECIPROCAL_PI;
}
`;

const FRAG_AO = /* glsl */`
#ifdef PAPER_CRUMPLE
  float paperAO = gl_FrontFacing ? vColor.r : vColor.g;
  paperAO = clamp(paperAO, 0.0, 1.0);
  reflectedLight.indirectDiffuse *= paperAO * paperAO;
  reflectedLight.directDiffuse *= mix(1.0, paperAO, 0.55);
  reflectedLight.indirectSpecular *= paperAO;
#endif
`;

/* ------------------------------------------------------------------------------------------------ vertex snippets */
const VERT_SLAB = /* glsl */`
${DEFORM_VERTEX}
vPaperFaceN = normalize(normalMatrix * paperN);
vec3 objectNormal = paperNormal;
#ifdef USE_TANGENT
  vec3 objectTangent = vec3(1.0, 0.0, 0.0);
#endif
`;
const VERT_CRUMPLE_PARS = /* glsl */`
attribute vec2 aRest;
varying vec2 vRest; varying float vShell; varying vec3 vPaperWorld; varying vec3 vPaperFaceN;
uniform vec2 uSheet;
`;

function patchVertex(shader, variant) {
  let vs = shader.vertexShader;
  if (variant === 'slab') {
    vs = vs.replace('#include <common>', '#include <common>\n' + VERTEX_VARYINGS + 'varying vec3 vPaperFaceN;\n' + DEFORM_PARS)
      .replace('#include <beginnormal_vertex>', VERT_SLAB)
      .replace('#include <begin_vertex>', 'vec3 transformed = paperPos;');
  } else {
    vs = vs.replace('#include <common>', '#include <common>\n' + VERT_CRUMPLE_PARS)
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvRest = aRest; vShell = 1.0; vPaperFaceN = vec3(0.0, 0.0, 1.0);');
  }
  vs = vs.replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvPaperWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;');
  shader.vertexShader = vs;
}

function patchFragment(shader) {
  shader.fragmentShader = shader.fragmentShader
    .replace('#include <common>', '#include <common>\n' + PAPER_FRAG_PARS + FRAG_PARS_EXTRA)
    .replace('#include <shadowmap_pars_fragment>', SHADOW_CHUNK || (SHADOW_CHUNK = paperShadowChunk(16)))
    .replace('#include <clipping_planes_fragment>', '#include <clipping_planes_fragment>\n' + FRAG_CLIP)
    .replace('#include <color_fragment>', FRAG_COLOR)
    .replace('#include <roughnessmap_fragment>', FRAG_ROUGH)
    .replace('#include <normal_fragment_maps>', FRAG_NORMAL)
    .replace('#include <lights_physical_fragment>', '#include <lights_physical_fragment>\n' + FRAG_PHYS)
    .replace('#include <lights_fragment_end>', '#include <lights_fragment_end>\n' + FRAG_TRANS)
    .replace('#include <aomap_fragment>', '#include <aomap_fragment>\n' + FRAG_AO)
    .replace('#include <opaque_fragment>', 'outgoingLight *= uGain;\n#include <opaque_fragment>');
}

/**
 * The paper material.
 * @param {object} uniforms makeSheetUniforms(...) result (per sheet)
 * @param {object} opt { variant: 'slab'|'crumple'|'static', color, roughness, sheen }
 */
export function createPaperMaterial(uniforms, { variant = 'slab', roughness = 0.9, sheen = 0.8, sheenRoughness = 0.62, specularIntensity = 0.3 } = {}) {
  const mat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff, roughness, metalness: 0, ior: 1.45, specularIntensity,
    sheen, sheenColor: new THREE.Color(0.22, 0.215, 0.2), sheenRoughness,
    side: variant === 'slab' ? THREE.FrontSide : THREE.DoubleSide,
    vertexColors: variant === 'crumple',
  });
  if (variant === 'crumple') mat.defines = { PAPER_CRUMPLE: '' };
  mat.userData.uniforms = uniforms; mat.userData.variant = variant;
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    patchVertex(shader, variant);
    patchFragment(shader);
    mat.userData.shader = shader;
  };
  mat.customProgramCacheKey = () => 'aviva-paper-' + variant + '-v5';
  return mat;
}

/* ------------------------------------------------------------------------------------------------ shadow depth */
const DEPTH_FRAG_DISCARD = /* glsl */`
  float pxm_ = max(length(fwidth(vRest)) * 0.7071, 1e-7); float band_ = 0.0;
  if ((uTear0.w != 0.0 || uTear1.w != 0.0) && tearKeep(vRest, pxm_, band_) < 0.0) discard;
`;
export function createPaperDepthMaterial(uniforms, variant = 'slab') {
  // slope-scaled offset: no self-shadow acne on a sheet lit at a raking angle
  const m = new THREE.MeshDepthMaterial({ depthPacking: THREE.BasicDepthPacking, side: variant === 'slab' ? THREE.FrontSide : THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: 2.0, polygonOffsetUnits: 3.0 });
  m.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    if (variant === 'slab') {
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\n' + VERTEX_VARYINGS + DEFORM_PARS)
        .replace('#include <begin_vertex>', DEFORM_VERTEX + '\nvec3 transformed = paperPos;')
        .replace('#include <beginnormal_vertex>', '');
    } else {
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\n' + VERT_CRUMPLE_PARS)
        .replace('#include <begin_vertex>', '#include <begin_vertex>\nvRest = aRest;');
    }
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec2 vRest;\n' + TEAR_PARS)
      .replace('void main() {', 'void main() {\n' + DEPTH_FRAG_DISCARD);
  };
  m.customProgramCacheKey = () => 'aviva-paper-depth-' + variant + '-v3';
  return m;
}

/* ------------------------------------------------------------------------------------------------ contact-shadow caster */
// Projects the sheet straight onto the floor's shadow map (world xz), sheared along the key light so a floating sheet's
// shadow slides away from the light. Writes R = contact term (only very near the floor), G = soft term (fades with height).
// MAX blending: overlapping layers never darken beyond one sheet.
const CASTER_VERT_COMMON = /* glsl */`
uniform vec4 uCS;        // xy: centre (world xz), z: half extent (m), w: floor height (world y)
uniform vec4 uCSShear;   // xy: shear (dx/dh, dz/dh) toward away-from-light, z: contact falloff (m), w: mid falloff (m)
uniform vec4 uCSRange;   // x: max height, y: soft falloff, z: soft rise, w: mid rise (m)
varying float vH;
vec4 casterClip(vec3 wp) {
  float h = max(wp.y - uCS.w, 0.0); vH = h;
  vec2 xz = wp.xz + uCSShear.xy * h;
  vec2 c = (xz - uCS.xy) / uCS.z;
  return vec4(c.x, -c.y, 0.0, 1.0);
}
`;
const CASTER_FRAG = /* glsl */`
precision highp float;
uniform vec4 uCSShear; uniform vec4 uCSRange; varying float vH; varying vec2 vRest;
${TEAR_PARS}
void main() {
  float pxm_ = max(length(fwidth(vRest)) * 0.7071, 1e-7); float band_ = 0.0;
  if ((uTear0.w != 0.0 || uTear1.w != 0.0) && tearKeep(vRest, pxm_, band_) < 0.0) discard;
  float fade = 1.0 - smoothstep(uCSRange.x * 0.6, uCSRange.x, vH);
  float c = exp(-vH / uCSShear.z);                                         // contact: only within a few mm
  float m = exp(-vH / uCSShear.w) * (1.0 - exp(-vH / uCSRange.w));        // mid: a sheet a few mm .. cm up
  float s = exp(-vH / uCSRange.y) * (1.0 - exp(-vH / uCSRange.z)) * fade; // soft: a sheet in the air
  gl_FragColor = vec4(c, m, s, 1.0);
}`;

export function createCasterMaterial(uniforms, csUniforms, variant = 'slab') {
  const vs = variant === 'slab'
    ? /* glsl */`${VERTEX_VARYINGS}${DEFORM_PARS}${CASTER_VERT_COMMON}
void main() {
  ${DEFORM_VERTEX}
  gl_Position = casterClip((modelMatrix * vec4(paperPos, 1.0)).xyz);
}`
    : /* glsl */`#include <common>
#include <morphtarget_pars_vertex>
attribute vec2 aRest; varying vec2 vRest;
${CASTER_VERT_COMMON}
void main() {
  #include <begin_vertex>
  #include <morphtarget_vertex>
  vRest = aRest;
  gl_Position = casterClip((modelMatrix * vec4(transformed, 1.0)).xyz);
}`;
  const m = new THREE.ShaderMaterial({
    uniforms: { ...uniforms, ...csUniforms }, vertexShader: vs, fragmentShader: CASTER_FRAG,
    depthTest: false, depthWrite: false, side: THREE.DoubleSide, transparent: true,
    blending: THREE.CustomBlending, blendEquation: THREE.MaxEquation, blendSrc: THREE.OneFactor, blendDst: THREE.OneFactor,
    blendEquationAlpha: THREE.MaxEquation, blendSrcAlpha: THREE.OneFactor, blendDstAlpha: THREE.OneFactor,
  });
  m.extensions = { derivatives: true };
  return m;
}

/* ------------------------------------------------------------------------------------------------ GPU picking */
// Writes the rest-space uv as 12-bit pairs in RGBA8: R = u >> 4, G = v >> 4, B = (u & 15) << 4 | (v & 15); A = 255 front / 128 back.
const PICK_FRAG = /* glsl */`
precision highp float;
varying vec2 vRest; varying float vSide; uniform vec2 uSheet;
${TEAR_PARS}
void main() {
  float pxm_ = max(length(fwidth(vRest)) * 0.7071, 1e-7); float band_ = 0.0;
  if ((uTear0.w != 0.0 || uTear1.w != 0.0) && tearKeep(vRest, pxm_, band_) < 0.0) discard;
  float side = vSide;
  #ifdef PAPER_CRUMPLE
  side = gl_FrontFacing ? 1.0 : -1.0;
  #endif
  if (side == 0.0) discard;
  vec2 q = floor(clamp(vRest / uSheet + 0.5, 0.0, 1.0) * 4095.0 + 0.5);
  float uh = floor(q.x / 16.0), vh = floor(q.y / 16.0), ul = q.x - uh * 16.0, vl = q.y - vh * 16.0;
  gl_FragColor = vec4(uh, vh, ul * 16.0 + vl, side > 0.0 ? 255.0 : 128.0) / 255.0;
}`;
export function createPickMaterial(uniforms, variant = 'slab') {
  const vs = variant === 'slab'
    ? /* glsl */`${VERTEX_VARYINGS}${DEFORM_PARS}
varying float vSide;
void main() {
  ${DEFORM_VERTEX}
  vSide = aShell.x;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(paperPos, 1.0);
}`
    : /* glsl */`#include <common>
#include <morphtarget_pars_vertex>
attribute vec2 aRest; varying vec2 vRest; varying float vSide;
void main() {
  #include <begin_vertex>
  #include <morphtarget_vertex>
  vRest = aRest; vSide = 1.0;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
}`;
  const m = new THREE.ShaderMaterial({ uniforms, vertexShader: vs, fragmentShader: PICK_FRAG, side: variant === 'slab' ? THREE.FrontSide : THREE.DoubleSide });
  if (variant !== 'slab') m.defines = { PAPER_CRUMPLE: '' };
  return m;
}
