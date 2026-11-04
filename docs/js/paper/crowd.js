// crowd.js: the s10 audience (brief 11.1 row s10, T16): 300 white paper cranes on stepped risers at the stage edges,
// ONE InstancedMesh (+ one mesh for the risers). All motion runs in the vertex shader: an idle breath, the wing-wave
// applause that ripples through the crowd from the stage outward, and heads that turn toward the cursor with
// per-crane lag and amount.
//
//   const crowd = system.createCraneCrowd(arena.crowd, { count: 300 });   // place in the arena's frame
//   arena.object.add(crowd.object);
//   crowd.applaud();            // a ripple of wing flaps (a vote just landed); call again any time
//   crowd.lookAt(x, y, z);      // the point the heads turn toward (arena space; e.g. the cursor on the stage plane)
//   crowd.update(dt);           // every frame: the clock and the eased look target
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// a folded crane, 1 unit long (scaled to ~40 mm): body ridge along +z (head forward), parts in aPart:
// 0 body, 1 left wing, 2 right wing, 3 neck + head, 4 tail
function craneGeometry() {
  const tris = [], parts = [];
  const T = (a, b, c, p) => { tris.push(...a, ...b, ...c); parts.push(p, p, p); };
  const B = [0, 0.12, 0], F = [0, 0.1, 0.18], R = [0, 0.1, -0.18], K = [0.05, 0, 0], K2 = [-0.05, 0, 0];
  T(K, F, B, 0); T(K, B, R, 0); T(K2, B, F, 0); T(K2, R, B, 0);                               // the body: a folded diamond
  T(B, [0.55, 0.32, -0.06], F, 1); T(B, R, [0.55, 0.32, -0.06], 1);                           // left wing (two facets)
  T(B, F, [-0.55, 0.32, -0.06], 2); T(B, [-0.55, 0.32, -0.06], R, 2);                         // right wing
  T(F, [0.015, 0.42, 0.34], [0, 0.12, 0.2], 3); T([0, 0.12, 0.2], [0.015, 0.42, 0.34], [-0.015, 0.1, 0.19], 3);   // the neck
  T([0.015, 0.42, 0.34], [0, 0.38, 0.46], [0, 0.4, 0.36], 3);                                 // the head, bent forward
  T(R, [0, 0.4, -0.4], [0.012, 0.12, -0.2], 4); T([0.012, 0.12, -0.2], [0, 0.4, -0.4], [-0.012, 0.1, -0.19], 4);   // the tail
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(tris, 3));
  g.setAttribute('aPart', new THREE.Float32BufferAttribute(parts, 1));
  g.computeVertexNormals();
  return g;
}

const VERT_PARS = /* glsl */`
attribute float aPart; attribute vec4 aCrane;     // x: ripple delay (s), y: look amount, z: phase, w: lag 0..1
uniform float uTime; uniform float uClap; uniform vec3 uLook; uniform vec3 uLookLag;
mat3 rotX(float a){ float c = cos(a), s = sin(a); return mat3(1,0,0, 0,c,s, 0,-s,c); }
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
    vec3 base = vec3(0.0, 0.11, 0.19);
    transformed = rotY(yaw) * (transformed - base) + base;
  }
  transformed = R * (transformed - vec3(0.0, 0.12, 0.0)) + vec3(0.0, 0.12, 0.0);
`;

export class CraneCrowd {
  constructor(sys, crowd, { count = 300, size = 0.075, seed = 7 } = {}) {
    this.sys = sys; this.count = count; this.object = new THREE.Group(); this.object.name = 'paper.crowd';
    let a = seed; const rnd = () => { a = (a * 16807) % 2147483647; return (a - 1) / 2147483646; };
    const C = crowd || { left: [-1.2, -0.62], right: [0.62, 1.2], tiers: [0.05, 0.16, 0.27, 0.38, 0.49], z: [-0.45, -0.05] };
    const geo = craneGeometry();
    const mat = new THREE.MeshPhysicalMaterial({ color: '#f1efe9', roughness: 0.85, sheen: 0.4, sheenColor: new THREE.Color('#ffffff'), side: THREE.DoubleSide, flatShading: true });
    const U = this.uniforms = { uTime: { value: 0 }, uClap: { value: -100 }, uLook: { value: new THREE.Vector3(0, 0.3, 0.6) }, uLookLag: { value: new THREE.Vector3(0, 0.3, 0.6) } };
    mat.onBeforeCompile = (sh) => {
      Object.assign(sh.uniforms, U);
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\n' + VERT_PARS)
        .replace('#include <begin_vertex>', '#include <begin_vertex>\n' + VERT_BODY);   // flat shading: normals from the moved facets
    };
    mat.customProgramCacheKey = () => 'aviva-cranes-v1';
    const mesh = new THREE.InstancedMesh(geo, mat, count); mesh.name = 'crowd.cranes'; mesh.castShadow = false; mesh.receiveShadow = true;
    const ac = new Float32Array(count * 4), m = new THREE.Matrix4(), q = new THREE.Quaternion(), p = new THREE.Vector3(), s = new THREE.Vector3(), e = new THREE.Euler();
    const tiers = C.tiers.length, perSide = Math.floor(count / 2), perRow = Math.ceil(perSide / tiers);
    const risers = [];
    let n = 0;
    for (const side of ['left', 'right']) {
      const [x0, x1] = C[side], sgn = side === 'left' ? -1 : 1;
      for (let t = 0; t < tiers; t++) {
        const y = C.tiers[t], z = C.z[1] - (C.z[1] - C.z[0]) * (t / Math.max(1, tiers - 1));
        risers.push(new THREE.BoxGeometry(x1 - x0 + 0.06, y + 0.012, 0.12).translate((x0 + x1) / 2, (y - 0.012) / 2, z - 0.02));
        for (let k = 0; k < perRow && n < count; k++, n++) {
          const x = x0 + (x1 - x0) * ((k + 0.5 + (rnd() - 0.5) * 0.4) / perRow);
          p.set(x, y + 0.001, z + (rnd() - 0.5) * 0.03);
          const toStage = Math.atan2(-p.x, 0.8 - p.z);                        // face the stage, a little toward the camera
          e.set((rnd() - 0.5) * 0.12, toStage + (rnd() - 0.5) * 0.35, (rnd() - 0.5) * 0.1); q.setFromEuler(e);
          const k2 = size * (0.82 + rnd() * 0.36); s.set(k2, k2, k2);
          mesh.setMatrixAt(n, m.compose(p, q, s));
          // the ripple starts at the stage edge and travels outward along the tiers
          ac[n * 4] = Math.abs(x - sgn * 0.62) * 0.9 + t * 0.06 + rnd() * 0.05; ac[n * 4 + 1] = 0.55 + rnd() * 0.45; ac[n * 4 + 2] = rnd() * 6.28; ac[n * 4 + 3] = rnd();
        }
      }
    }
    geo.setAttribute('aCrane', new THREE.InstancedBufferAttribute(ac, 4));
    mesh.count = n; mesh.instanceMatrix.needsUpdate = true; mesh.computeBoundingSphere();
    this.mesh = mesh;
    this.risers = new THREE.Mesh(mergeGeometries(risers), new THREE.MeshPhysicalMaterial({ color: '#06051a', roughness: 0.9, envMapIntensity: 0.05 }));
    this.risers.receiveShadow = true;
    this.object.add(this.risers, mesh);
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
  dispose() { this.mesh.geometry.dispose(); this.mesh.material.dispose(); this.risers.geometry.dispose(); this.risers.material.dispose(); this.object.removeFromParent(); }
}
