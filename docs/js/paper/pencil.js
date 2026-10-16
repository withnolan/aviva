// pencil.js: the one HB pencil of the aviva world (decision #24: HB-pencil yellow, lacquered, graphite tip).
// Used for claim card c4 (a pencil lying across the sheet) and anywhere the 3D layer needs the pencil.
//
//   import { createPencil } from './js/paper/index.js';
//   const pencil = createPencil({ color: TOKENS.pencil });
//   scene.add(pencil.object);           // the graphite point is at the local origin, the body runs along +x
//   pencil.object.position.copy(tipWorld); pencil.object.quaternion.copy(q);
//
// One BufferGeometry, one MeshPhysicalMaterial (patched): a rounded hexagonal body (7.2 mm across the flats) in a glossy
// yellow lacquer with a clear coat; the sharpened end is the body radius clipped by a cone, so the paint ends in the
// real scalloped line where the cone cuts the six corners first; cedar wood with a fine grain; a graphite core with a
// slightly rounded point; a cut back end that shows the wood ring and the lead. An optional stamp ("AVIVA HB") in
// graphite foil on one flat. ~2.6k triangles; no textures except the stamp (a 512 x 64 canvas).
import * as THREE from 'three';

const TAU = Math.PI * 2;

function stampTexture(text) {
  const W = 1024, H = 96;
  const c = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(W, H) : Object.assign(document.createElement('canvas'), { width: W, height: H });
  const x = c.getContext('2d');
  x.clearRect(0, 0, W, H);
  x.fillStyle = '#fff';
  x.font = '400 54px "Hanken Grotesk", "Helvetica Neue", Arial, sans-serif';
  x.textBaseline = 'middle';
  if ('letterSpacing' in x) x.letterSpacing = '6px';
  x.fillText(text, 24, H / 2 + 2);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.NoColorSpace; t.anisotropy = 8; t.generateMipmaps = true; t.minFilter = THREE.LinearMipmapLinearFilter;
  return t;
}

/**
 * @param {object} o
 *   length (m, 0.175) · flats (m across the flats, 0.0072) · corner (m, corner rounding 0.0007) · cone (m, sharpened
 *   length 0.022) · core (m, lead radius 0.001) · tipRadius (m, 0.00025) · color / wood / lead (hex)
 *   stamp (string or '' for none) · stampColor (hex) · segments (around, per hex side: 6)
 * @returns {{ object: THREE.Group, mesh: THREE.Mesh, length: number, tip: THREE.Vector3, dispose(): void }}
 */
export function createPencil({
  length = 0.175, flats = 0.0072, corner = 0.0007, cone = 0.022, core = 0.001, tipRadius = 0.00025,
  color = '#F2B820', wood = '#DDB98F', lead = '#3B3C3F', stamp = 'AVIVA   HB', stampColor = '#2A2926', segments = 6,
} = {}) {
  // ---- the rounded-hexagon profile: r(theta) of a hexagon with rounded corners, sampled finely
  const apo = flats / 2;                                   // apothem (centre to flat)
  const around = 6 * segments * 2;
  const profile = [];
  for (let i = 0; i < around; i++) {
    const th = (i / around) * TAU;
    // distance to a hexagon whose flats face th = 0, 60, 120 ... (flat 0 faces +y: it carries the stamp)
    const sector = ((th + TAU / 12) % (TAU / 6)) - TAU / 12;              // -30..30 deg from the flat's normal
    let r = apo / Math.cos(sector);
    // rounded corners: blend toward a circle near the corner
    const cornerR = apo / Math.cos(TAU / 12);
    const k = THREE.MathUtils.smoothstep(Math.abs(sector), TAU / 12 - (corner / apo) * 1.4, TAU / 12);
    r = THREE.MathUtils.lerp(r, Math.min(r, cornerR - corner * 0.55), k);
    profile.push({ th, r, flat: Math.abs(sector) < TAU / 12 - 0.12 ? Math.round(th / (TAU / 6)) % 6 : -1 });
  }
  const rMax = Math.max(...profile.map((p) => p.r));
  // ---- rings along x: the cone (dense), the body, the back face
  const tanA = (rMax - tipRadius) / cone;                  // cone slope
  const xs = [];
  const tipRound = tipRadius * 1.2;
  for (let i = 0; i <= 8; i++) xs.push(tipRound * (1 - Math.cos((i / 8) * Math.PI / 2)));   // rounded point
  for (let i = 1; i <= 72; i++) xs.push(tipRound + (cone * 1.04 - tipRound) * (i / 72));
  for (let i = 1; i <= 24; i++) xs.push(cone * 1.04 + (length - cone * 1.04) * (i / 24));
  const pos = [], nrm = [], uv = [], mat = [], idx = [];
  const radiusAt = (x, r) => {
    let rc;
    if (x < tipRound) rc = tipRadius * Math.sin(Math.acos(1 - x / tipRound)) ;   // the rounded point
    else rc = tipRadius + (x - tipRound) * tanA;
    return Math.min(r, rc);
  };
  const ringCount = xs.length;
  for (let j = 0; j < ringCount; j++) {
    const x = xs[j];
    for (let i = 0; i <= around; i++) {
      const p = profile[i % around];
      const r = radiusAt(x, p.r);
      const cy = Math.cos(p.th), cz = Math.sin(p.th);
      pos.push(x, r * cy, r * cz);
      const isLead = r <= core * 1.02 ? 1 : 0;
      const isWood = !isLead && r < p.r - 1e-6 ? 1 : 0;
      mat.push(isLead ? 2 : isWood ? 1 : 0, p.flat === 0 ? 1 : 0);
      uv.push(x / length, i / around);
      nrm.push(0, cy, cz);
    }
  }
  for (let j = 0; j < ringCount - 1; j++) for (let i = 0; i < around; i++) {
    const a = j * (around + 1) + i, b = a + 1, c = a + around + 1, d = c + 1;
    idx.push(a, b, c, b, d, c);                             // outward-facing
  }
  // back face (a flat cut): centre fan, wood ring with the lead in the middle
  const base = pos.length / 3;
  pos.push(length, 0, 0); nrm.push(1, 0, 0); uv.push(1, 0.5); mat.push(3, 0);
  for (let i = 0; i <= around; i++) {
    const p = profile[i % around];
    pos.push(length, p.r * Math.cos(p.th), p.r * Math.sin(p.th)); nrm.push(1, 0, 0); uv.push(1, i / around); mat.push(3, 0);
  }
  for (let i = 0; i < around; i++) idx.push(base, base + 1 + i, base + 2 + i);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setAttribute('aMat', new THREE.Float32BufferAttribute(mat, 2));
  g.setIndex(idx);
  g.computeVertexNormals();                                // smooth normals across the rounded hex and the cone
  const N = g.getAttribute('normal');
  for (let j = 0; j < ringCount; j++) {                    // weld the seam (column 0 and column `around` coincide)
    const a = j * (around + 1), b = a + around;
    const nx = N.getX(a) + N.getX(b), ny = N.getY(a) + N.getY(b), nz = N.getZ(a) + N.getZ(b), l = Math.hypot(nx, ny, nz) || 1;
    N.setXYZ(a, nx / l, ny / l, nz / l); N.setXYZ(b, nx / l, ny / l, nz / l);
  }
  for (let i = base; i < pos.length / 3; i++) N.setXYZ(i, 1, 0, 0);   // the back face keeps its flat normal
  g.computeBoundingSphere();

  const U = {
    uLacquer: { value: new THREE.Color(color) }, uWood: { value: new THREE.Color(wood) }, uLead: { value: new THREE.Color(lead) },
    uStamp: { value: stamp ? stampTexture(stamp) : null }, uStampOn: { value: stamp ? 1 : 0 }, uStampColor: { value: new THREE.Color(stampColor) },
    uLen: { value: length }, uCore: { value: core }, uApo: { value: apo },
  };
  const m = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.42, metalness: 0, clearcoat: 0.55, clearcoatRoughness: 0.22, specularIntensity: 0.45, envMapIntensity: 0.8 });
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, U);
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nattribute vec2 aMat; varying vec2 vMat; varying vec3 vPObj;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvMat = aMat; vPObj = position;');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', `#include <common>
varying vec2 vMat; varying vec3 vPObj;
uniform vec3 uLacquer, uWood, uLead, uStampColor; uniform sampler2D uStamp; uniform float uStampOn, uLen, uCore, uApo;
float pc_h(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float pc_n(vec2 x){ vec2 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f); return mix(mix(pc_h(i), pc_h(i + vec2(1,0)), f.x), mix(pc_h(i + vec2(0,1)), pc_h(i + vec2(1,1)), f.x), f.y); }
float pcWood, pcLead, pcLac;`)
      .replace('#include <color_fragment>', `
float rr = length(vPObj.yz);
bool backFace = vMat.x > 2.5;
pcLead = backFace ? 1.0 - smoothstep(uCore * 0.95, uCore * 1.05, rr) : smoothstep(1.5, 1.7, vMat.x);
pcWood = backFace ? 1.0 - pcLead : smoothstep(0.35, 0.65, vMat.x) * (1.0 - pcLead);
pcLac = 1.0 - pcWood - pcLead;
if (backFace) { float rim = smoothstep(uApo * 0.9, uApo * 0.97, rr); pcLac = rim; pcWood *= 1.0 - rim; }
// cedar: fine growth lines along the pencil, a little darker toward the lead (sharpener burnish)
float grain = pc_n(vec2(vPObj.x * 260.0, atan(vPObj.z, vPObj.y) * 9.0)) * 0.6 + pc_n(vec2(vPObj.x * 40.0, atan(vPObj.z, vPObj.y) * 3.0)) * 0.4;
if (backFace) grain = pc_n(vec2(rr * 5200.0, 1.3)) * 0.7 + 0.3 * pc_n(vPObj.yz * 3000.0);
vec3 woodC = uWood * (0.86 + 0.22 * grain) * (backFace ? 0.92 : mix(0.82, 1.0, smoothstep(uCore, uCore * 3.5, rr)));
vec3 lacC = uLacquer;
if (uStampOn > 0.5 && vMat.y > 0.5) {
  // the stamp: along the flat that faces +y, 40 mm from the back end, reading toward the point
  vec2 suv = vec2((uLen - vPObj.x - 0.03) / 0.05, (vPObj.z / (uApo * 0.577)) * 0.5 + 0.5);
  if (suv.x > 0.0 && suv.x < 1.0 && suv.y > 0.0 && suv.y < 1.0) { float a = texture2D(uStamp, vec2(suv.x, 1.0 - suv.y)).a; lacC = mix(lacC, uStampColor, a * 0.9); }
}
diffuseColor.rgb = lacC * pcLac + woodC * pcWood + uLead * pcLead;`)
      .replace('#include <roughnessmap_fragment>', `float roughnessFactor = roughness * pcLac + 0.78 * pcWood + 0.42 * pcLead;`)
      .replace('#include <metalnessmap_fragment>', `float metalnessFactor = 0.45 * pcLead;`)
      .replace('#include <lights_physical_fragment>', `#include <lights_physical_fragment>
material.clearcoat *= pcLac;`);
  };
  m.customProgramCacheKey = () => 'aviva-pencil-v1';
  const mesh = new THREE.Mesh(g, m); mesh.name = 'paper.pencil'; mesh.castShadow = true;
  const object = new THREE.Group(); object.name = 'paper.pencilProp'; object.add(mesh);
  return {
    object, mesh, length, tip: new THREE.Vector3(0, 0, 0), uniforms: U,
    setColor(hex) { U.uLacquer.value.set(hex); return this; },
    dispose() { g.dispose(); m.dispose(); if (U.uStamp.value) U.uStamp.value.dispose(); },
  };
}
