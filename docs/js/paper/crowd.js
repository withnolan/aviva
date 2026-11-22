// crowd.js: the s10 audience (brief 11.1 row s10, T16): 300 white origami cranes on six stepped felt risers at the
// stage edges. ONE InstancedMesh for the cranes, one mesh for the risers and one for their brass nosings. All motion
// runs in the vertex shader: an idle breath, the wing-wave applause that ripples through the crowd from the stage
// outward, and heads that turn toward the cursor with per-crane lag and amount. The crowd's own soft light (a warm wrap
// fill from the stage and a grazing rim) is computed in its fragment shader, so it adds no lights to the scene.
//
//   const crowd = system.createCraneCrowd(arena.crowd, { count: 300 });   // place in the arena's frame
//   arena.object.add(crowd.object);
//   crowd.applaud();            // a ripple of wing flaps (a vote just landed); call again any time
//   crowd.lookAt(x, y, z);      // the point the heads turn toward (arena space; e.g. the cursor on the stage plane)
//   crowd.update(dt);           // every frame: the clock and the eased look target
//   crowd.uniforms.uFill / uRim // the crowd's own fill and rim (linear colours x intensity), uFillDir (world, toward the light)
//
// Options: count (300), size (0.105: the front tier's crane scale in m, about its wingspan; the back tier is x0.75), seed.
// Legibility: the classic crane silhouette (a puffed diamond body, wings raised ~44 deg, a neck blade reaching out ~48 deg
// with the head hooked down at its tip, a tail blade ~42 deg to a point), 2-4 tones per part, turned near profile to the
// camera; the front tier sparse (about 8 a side, so single cranes read), the back tiers packed, smaller and dimmer (a crowd).
// Cost: 24 triangles a crane (7.2 k for 300), 3 draw calls, no extra lights or programs.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// the folded crane, ~1.3 units long, facing +z, resting on its belly point at the origin.
// aPart: 0 body, 1 left wing (+x), 2 right wing, 3 neck + head, 4 tail; a per-facet tone (vertex colour) so every fold reads
function craneGeometry() {
  const pos = [], parts = [], col = [];
  const T = (a, b, c, p, tone) => { pos.push(...a, ...b, ...c); for (let i = 0; i < 3; i++) { parts.push(p); col.push(tone, tone, tone * 0.985); } };
  // a folded blade (neck, head, tail): a base edge a-b in the mirror plane, a tip, its two sides puffed out by w
  const blade = (a, b, tip, w, p, t) => {
    const my = (a[1] + b[1]) / 2, mz = (a[2] + b[2]) / 2, mp = [w, my, mz], mn = [-w, my, mz];
    T(a, mp, tip, p, t[0]); T(mp, b, tip, p, t[1]); T(b, mn, tip, p, t[2]); T(mn, a, tip, p, t[3]);
  };
  // the body: a puffed diamond, upper facets lit, the belly darker
  const Tp = [0, 0.25, -0.01], Fp = [0, 0.15, 0.17], Bp = [0, 0.15, -0.18], Sl = [0.095, 0.11, -0.005], Sr = [-0.095, 0.11, -0.005], Bt = [0, 0, -0.005];
  T(Fp, Tp, Sl, 0, 0.96); T(Tp, Bp, Sl, 0, 0.9); T(Tp, Fp, Sr, 0, 0.92); T(Bp, Tp, Sr, 0, 0.86);
  T(Fp, Sl, Bt, 0, 0.78); T(Sl, Bp, Bt, 0, 0.72); T(Sr, Fp, Bt, 0, 0.75); T(Bp, Sr, Bt, 0, 0.68);
  // the wings: rooted along the body's top ridge, raised ~44 deg, two facets either side of the crease to the tip
  const rF = [0, 0.172, 0.13], rB = [0, 0.168, -0.15];
  for (const sx of [1, -1]) {
    const W = [0.45 * sx, 0.63, -0.08], p = sx > 0 ? 1 : 2;
    T(rF, W, Tp, p, sx > 0 ? 1.0 : 0.93); T(Tp, W, rB, p, sx > 0 ? 0.87 : 0.81);
  }
  // the neck reaching out from the body's front, the head reverse-folded off its tip, hooked down ~55 deg
  const nT = [0, 0.66, 0.59];
  blade([0, 0.18, 0.09], [0, 0.1, 0.16], nT, 0.024, 3, [0.98, 0.84, 0.76, 0.9]);
  blade(nT, [0, 0.537, 0.495], [0, 0.43, 0.66], 0.018, 3, [0.96, 0.8, 0.74, 0.88]);
  // the tail reaching out from the body's back to a point
  blade([0, 0.09, -0.17], [0, 0.18, -0.09], [0, 0.6, -0.65], 0.024, 4, [0.8, 0.96, 0.88, 0.74]);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('aPart', new THREE.Float32BufferAttribute(parts, 1));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.computeVertexNormals();
  return g;
}

const VERT_PARS = /* glsl */`
attribute float aPart; attribute vec4 aCrane;     // x: ripple delay (s), y: look amount, z: phase, w: lag 0..1
uniform float uTime; uniform float uClap; uniform vec3 uLook; uniform vec3 uLookLag;
mat3 rotY(float a){ float c = cos(a), s = sin(a); return mat3(c,0,-s, 0,1,0, s,0,c); }
mat3 rotZ(float a){ float c = cos(a), s = sin(a); return mat3(c,s,0, -s,c,0, 0,0,1); }
`;
const VERT_BODY = /* glsl */`
  // the applause: a burst of 4 flaps that reaches this crane after its delay, decaying
  float tc = uTime - uClap - aCrane.x;
  float clap = tc > 0.0 ? exp(-tc * 1.6) * (0.5 + 0.5 * sin(tc * 22.0 - 1.57)) : 0.0;
  float idle = 0.06 * sin(uTime * 1.3 + aCrane.z);
  mat3 R = mat3(1.0);
  if (aPart > 0.5 && aPart < 1.5) R = rotZ(-(idle + 0.9 * clap));                       // left wing about the ridge
  else if (aPart > 1.5 && aPart < 2.5) R = rotZ(idle + 0.9 * clap);                     // right wing
  else if (aPart > 2.5 && aPart < 3.5) {
    // the head turns toward the cursor: the target in this crane's frame, mixed with a lagging copy
    vec3 tgt = mix(uLook, uLookLag, aCrane.w);
    vec3 lp = (inverse(mat3(instanceMatrix)) * (tgt - instanceMatrix[3].xyz));
    float yaw = clamp(atan(lp.x, lp.z), -0.9, 0.9) * aCrane.y;
    vec3 base = vec3(0.0, 0.14, 0.125);
    transformed = rotY(yaw) * (transformed - base) + base;
  }
  transformed = R * (transformed - vec3(0.0, 0.2, 0.0)) + vec3(0.0, 0.2, 0.0);
`;
const FRAG_PARS = /* glsl */`uniform vec3 uFillDir; uniform vec3 uFill; uniform vec3 uRim;`;
const FRAG_LIGHT = /* glsl */`
  {  // the crowd's own light: a warm wrap fill from the stage and a grazing rim that keeps neighbours apart
    vec3 fd = normalize((viewMatrix * vec4(uFillDir, 0.0)).xyz);
    float wrap = clamp((dot(normal, fd) + 0.4) / 1.4, 0.0, 1.0);
    float rim = pow(1.0 - clamp(dot(normal, normalize(vViewPosition)), 0.0, 1.0), 3.0);
    totalEmissiveRadiance += diffuseColor.rgb * (uFill * wrap + uRim * rim);
  }`;

const TIERS = 6;

export class CraneCrowd {
  constructor(sys, crowd, { count = 300, size = 0.105, seed = 7 } = {}) {
    this.sys = sys; this.count = count; this.object = new THREE.Group(); this.object.name = 'paper.crowd';
    let a = seed; const rnd = () => { a = (a * 16807) % 2147483647; return (a - 1) / 2147483646; };
    const C = crowd || { left: [-1.2, -0.62], right: [0.62, 1.2], tiers: [0.05, 0.16, 0.27, 0.38, 0.49], z: [-0.45, -0.05] };
    const geo = craneGeometry();
    const mat = new THREE.MeshPhysicalMaterial({ color: '#f8f7f3', vertexColors: true, roughness: 0.8, sheen: 0.5, sheenColor: new THREE.Color('#fff3e0'), side: THREE.DoubleSide, flatShading: true, envMapIntensity: 0.6 });
    const U = this.uniforms = {
      uTime: { value: 0 }, uClap: { value: -100 }, uLook: { value: new THREE.Vector3(0, 0.3, 0.6) }, uLookLag: { value: new THREE.Vector3(0, 0.3, 0.6) },
      uFillDir: { value: new THREE.Vector3(0, 0.55, 1).normalize() }, uFill: { value: new THREE.Color('#fff1de').multiplyScalar(0.4) }, uRim: { value: new THREE.Color('#ffd2a0').multiplyScalar(0.4) },
    };
    mat.onBeforeCompile = (sh) => {
      Object.assign(sh.uniforms, U);
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\n' + VERT_PARS)
        .replace('#include <begin_vertex>', '#include <begin_vertex>\n' + VERT_BODY);   // flat shading: normals from the moved facets
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\n' + FRAG_PARS)
        .replace('#include <lights_fragment_end>', '#include <lights_fragment_end>\n' + FRAG_LIGHT);
    };
    mat.customProgramCacheKey = () => 'aviva-cranes-v2';
    const mesh = new THREE.InstancedMesh(geo, mat, count); mesh.name = 'crowd.cranes'; mesh.castShadow = false; mesh.receiveShadow = true;
    const ac = new Float32Array(count * 4), m = new THREE.Matrix4(), q = new THREE.Quaternion(), p = new THREE.Vector3(), s = new THREE.Vector3(), e = new THREE.Euler(), tone = new THREE.Color();
    // six tiers in a band deeper and higher than arena.crowd's five, rows widening toward the back (with the view)
    const yA = C.tiers[0], yB = C.tiers[C.tiers.length - 1] + 0.14, zA = C.z[1], zB = C.z[0] - 0.4, dz = (zA - zB) / (TIERS - 1), widen = 0.06;
    const zBack = zB - dz / 2 - 0.02, felt = [], brass = [];
    let n = 0;
    for (const side of ['left', 'right']) {
      const sgn = side === 'left' ? -1 : 1, xi = side === 'left' ? C.left[1] : C.right[0], xo = side === 'left' ? C.left[0] : C.right[1];
      // the front tier sparse (single cranes read), the back ones packed: rows weighted by width and depth
      const perSide = side === 'left' ? Math.floor(count / 2) : count - Math.floor(count / 2);
      const wts = [...Array(TIERS)].map((_, t) => (Math.abs(xo - xi) + widen * t) * (1 + 0.6 * t)), wsum = wts.reduce((u, v) => u + v, 0);
      const rows = wts.map((v) => Math.round(perSide * v / wsum)); rows[TIERS - 1] += perSide - rows.reduce((u, v) => u + v, 0);
      for (let t = 0; t < TIERS; t++) {
        const u = t / (TIERS - 1), y = yA + (yB - yA) * u, z = zA - dz * t, xe = xo + sgn * widen * t, cx = (xi + xe) / 2, w = Math.abs(xe - xi) + 0.08;
        // the riser: solid felt from the pit to this step, back to the band's back wall; a brass nosing on its front edge
        felt.push(new THREE.BoxGeometry(w, y + 0.045, z + dz / 2 - zBack).translate(cx, (y - 0.045) / 2, (z + dz / 2 + zBack) / 2));
        brass.push(new THREE.BoxGeometry(w, 0.004, 0.005).translate(cx, y - 0.002, z + dz / 2 + 0.0015));
        const nr = Math.max(0, rows[t]);
        for (let k = 0; k < nr && n < count; k++, n++) {
          const x = xi + (xe - xi) * ((k + 0.5 + (rnd() - 0.5) * 0.6) / nr);
          p.set(x, y + 0.0005, z + (rnd() - 0.5) * 0.05);
          const toStage = Math.atan2(-p.x, -p.z);                            // watch the lecterns: near profile to the camera
          e.set((rnd() - 0.5) * 0.12, toStage + (rnd() - 0.5) * 0.7, (rnd() - 0.5) * 0.1); q.setFromEuler(e);
          const k2 = size * (1 - 0.25 * u) * (0.9 + rnd() * 0.2); s.set(k2, k2, k2);
          mesh.setMatrixAt(n, m.compose(p, q, s));
          mesh.setColorAt(n, tone.setScalar((1 - 0.42 * u) * (0.92 + 0.08 * rnd())));   // the back rows sit further from the light
          // the ripple starts at the stage edge and travels outward along the tiers
          ac[n * 4] = Math.abs(x - xi) * 0.9 + t * 0.06 + rnd() * 0.05; ac[n * 4 + 1] = 0.55 + rnd() * 0.45; ac[n * 4 + 2] = rnd() * 6.28; ac[n * 4 + 3] = rnd();
        }
      }
    }
    geo.setAttribute('aCrane', new THREE.InstancedBufferAttribute(ac, 4));
    mesh.count = n; mesh.instanceMatrix.needsUpdate = true; if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true; mesh.computeBoundingSphere();
    this.mesh = mesh;
    // the risers: ink felt (a soft sheen at grazing angles) with a brass nosing on each step, as the stage
    this.risers = new THREE.Mesh(mergeGeometries(felt), new THREE.MeshPhysicalMaterial({ color: '#07061a', roughness: 1, sheen: 0.35, sheenColor: new THREE.Color('#2a2566'), sheenRoughness: 0.6, envMapIntensity: 0.05 }));
    this.nosing = new THREE.Mesh(mergeGeometries(brass), new THREE.MeshPhysicalMaterial({ color: '#d4b06a', metalness: 1, roughness: 0.25 }));
    this.risers.receiveShadow = true; this.risers.name = 'crowd.risers'; this.nosing.name = 'crowd.nosing';
    this.object.add(this.risers, this.nosing, mesh);
    this._look = new THREE.Vector3().copy(U.uLook.value);
  }
  /** a ripple of wing flaps through the crowd, from the stage outward (~1.3 s) */
  applaud() { this.uniforms.uClap.value = this.uniforms.uTime.value; return this; }
  /** where the heads turn (arena space) */
  lookAt(x, y, z = 0.4) { this._look.set(x, y, z); return this; }
  update(dt = 1 / 60) {
    const U = this.uniforms; U.uTime.value += dt;
    U.uLook.value.lerp(this._look, 1 - Math.exp(-dt * 6));           // eased
    U.uLookLag.value.lerp(U.uLook.value, 1 - Math.exp(-dt * 2));     // the slow ones
    return this;
  }
  dispose() {
    for (const o of [this.mesh, this.risers, this.nosing]) { o.geometry.dispose(); o.material.dispose(); }
    this.object.removeFromParent();
  }
}
