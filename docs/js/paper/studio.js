// studio.js: the endless white studio.
//   makeStudioEnvironment()  a soft-box room rendered once into a PMREM (image-based light for the paper)
//   createBackdrop(...)      ONE mesh: floor + curved sweep + wall, unlit custom shader with EXACT token colours
//                            (not tone-mapped, so the far field equals the CSS ground), soft light pools that follow
//                            the light rig, the floor print (the giant wordmark), and the two-lobe contact shadow.
import * as THREE from 'three';

/** Soft boxes with HDR values in a dim room; PMREM blurs them into gentle gradients on the sheet. */
export function makeStudioEnvironment({ warm = [1, 0.985, 0.962], cool = [0.92, 0.955, 1] } = {}) {
  const s = new THREE.Scene();
  const room = new THREE.Mesh(new THREE.BoxGeometry(24, 14, 24), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.42, 0.415, 0.41), side: THREE.BackSide }));
  room.position.y = 5; s.add(room);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(24, 24), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.78, 0.775, 0.76) }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = -1.6; s.add(floor);
  const box = (w, h, pos, intensity, tint) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(tint[0] * intensity, tint[1] * intensity, tint[2] * intensity), side: THREE.DoubleSide }));
    m.position.set(...pos); m.lookAt(0, 0, 0); s.add(m);
  };
  box(9, 6, [-6, 7, 5], 5.0, warm);        // the big key soft box, top left, in front
  box(4, 9, [8.5, 3, 3], 1.7, cool);       // cool strip, right
  box(12, 3, [0, 9, -7], 2.4, [1, 1, 1]);  // top-back bar (rim on curls and folds)
  box(7, 7, [0, 11, 0], 1.3, [1, 0.99, 0.97]);   // overhead fill
  box(10, 4, [0, -1.2, 6], 0.9, [1, 0.99, 0.975]); // floor bounce in front
  return s;
}

export function buildEnvironment(renderer, opts) {
  const pmrem = new THREE.PMREMGenerator(renderer);
  const scene = makeStudioEnvironment(opts);
  const rt = pmrem.fromScene(scene, 0.035);
  scene.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
  pmrem.dispose();
  return rt;
}

/* ------------------------------------------------------------------------------------------------ backdrop */
// profile in (z, y): an endless floor that sweeps up into a wall behind the subject
function sweepGeometry({ floorY = 0, wallZ = -2.6, radius = 1.6, near = 40, height = 30, width = 90, arcSeg = 24 } = {}) {
  const prof = [];
  prof.push([near, floorY]); prof.push([near * 0.25, floorY]); prof.push([wallZ + radius + 1.0, floorY]); prof.push([wallZ + radius, floorY]);
  for (let i = 1; i <= arcSeg; i++) { const a = (i / arcSeg) * Math.PI / 2; prof.push([wallZ + radius - Math.sin(a) * radius, floorY + radius - Math.cos(a) * radius]); }
  prof.push([wallZ, floorY + radius + 2]); prof.push([wallZ, floorY + height]);
  const xs = [-width / 2, -width / 6, -2, 0, 2, width / 6, width / 2];
  const pos = [], idx = [];
  for (const [z, y] of prof) for (const x of xs) pos.push(x, y, z);
  const nx = xs.length;
  for (let j = 0; j < prof.length - 1; j++) for (let i = 0; i < nx - 1; i++) {
    const a = j * nx + i, b = a + 1, c = a + nx, d = c + 1; idx.push(a, b, d, a, d, c);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx);
  g.computeBoundingSphere(); return g;
}

const BACKDROP_VERT = /* glsl */`
varying vec3 vWorld;
void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vWorld = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`;
const BACKDROP_FRAG = /* glsl */`
#include <common>
#include <dithering_pars_fragment>
varying vec3 vWorld;
uniform vec3 uStudio;            // linear studio colour == the clear colour
uniform vec3 uFloorTint;         // multiplier on the floor part (1 = same as the wall)
uniform float uGain;             // whole-backdrop gain (s02: the background behind the edge drops ~4 %)
uniform vec4 uPool[3];           // xyz world centre, w radius (m)
uniform vec4 uPoolC[3];          // rgb tint, a gain (0 = off)
uniform sampler2D uContactA; uniform sampler2D uContactB;
uniform vec4 uCS;                // xy centre (world xz), z half extent, w floor y
uniform vec4 uShadowP;           // x contact opacity, y soft opacity, z on (0/1)
uniform vec2 uSoftShift;         // world xz shift of the soft lobe, away from the key (m)
uniform vec3 uShadowTint;        // colour multiplier at full shadow
uniform sampler2D uFloorPrint; uniform vec4 uFloorRect; uniform vec4 uPrintP;   // x opacity, y on
uniform vec3 uPrintColor;
void main(){
  vec3 col = uStudio;
  float onFloor = 1.0 - smoothstep(0.002, 0.05, vWorld.y - uCS.w);
  col *= mix(vec3(1.0), uFloorTint, onFloor);
  vec3 pool = vec3(0.0);
  for (int i = 0; i < 3; i++) {
    if (uPoolC[i].a == 0.0) continue;
    vec3 d = (vWorld - uPool[i].xyz) / uPool[i].w;
    pool += uPoolC[i].rgb * uPoolC[i].a * exp(-dot(d, d));
  }
  col *= (1.0 + pool) * uGain;
  if (uPrintP.y > 0.5) {
    vec2 wuv = (vWorld.xz - uFloorRect.xy) / uFloorRect.zw;
    if (wuv.x > 0.0 && wuv.y > 0.0 && wuv.x < 1.0 && wuv.y < 1.0) {
      float ink = texture2D(uFloorPrint, wuv).a * onFloor * uPrintP.x;
      col = mix(col, uPrintColor * (1.0 + pool * 0.35), ink);
    }
  }
  if (uShadowP.z > 0.5 && onFloor > 0.0) {
    vec2 c = (vWorld.xz - uCS.xy) / uCS.z;
    if (abs(c.x) < 1.0 && abs(c.y) < 1.0) {
      vec2 suv = vec2(c.x, -c.y) * 0.5 + 0.5;
      float edge = smoothstep(1.0, 0.85, max(abs(c.x), abs(c.y)));
      vec2 c2 = (vWorld.xz - uSoftShift - uCS.xy) / uCS.z; vec2 suv2 = vec2(c2.x, -c2.y) * 0.5 + 0.5;
      float a = texture2D(uContactA, suv).r * uShadowP.x, b = texture2D(uContactB, suv2).g * uShadowP.y;
      float sh = (1.0 - (1.0 - a) * (1.0 - b)) * edge * onFloor;
      col *= mix(vec3(1.0), uShadowTint, sh);
    }
  }
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
  #include <dithering_fragment>
}`;

export function createBackdrop({ studio = '#ECEBE7', graphite = '#2A2926', floorY = 0, shared } = {}) {
  const uniforms = {
    uStudio: { value: new THREE.Color(studio) },
    uFloorTint: { value: new THREE.Color(1, 1, 1) },
    uGain: { value: 1 },
    uPool: { value: [new THREE.Vector4(0, 0, 0, 1), new THREE.Vector4(0, 0, 0, 1), new THREE.Vector4(0, 0, 0, 1)] },
    uPoolC: { value: [new THREE.Vector4(0, 0, 0, 0), new THREE.Vector4(0, 0, 0, 0), new THREE.Vector4(0, 0, 0, 0)] },
    uContactA: { value: null }, uContactB: { value: null },
    uCS: { value: new THREE.Vector4(0, 0, 0.45, floorY) },
    uShadowP: { value: new THREE.Vector4(0.5, 0.3, 0, 0) },
    uSoftShift: { value: new THREE.Vector2(0, 0) },
    uShadowTint: { value: new THREE.Color(0.5, 0.49, 0.47) },
    uFloorPrint: shared.uFloorPrint, uFloorRect: shared.uFloorRect,
    uPrintP: { value: new THREE.Vector4(1, 0, 0, 0) },
    uPrintColor: { value: new THREE.Color(graphite) },
  };
  const mat = new THREE.ShaderMaterial({ uniforms, vertexShader: BACKDROP_VERT, fragmentShader: BACKDROP_FRAG, toneMapped: false, dithering: true, depthWrite: true });
  const mesh = new THREE.Mesh(sweepGeometry({ floorY }), mat);
  mesh.name = 'paper.backdrop'; mesh.renderOrder = -10; mesh.frustumCulled = false;
  mesh.userData.uniforms = uniforms;
  return mesh;
}
