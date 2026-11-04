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

// the classic folded crane, ~1 unit long, facing +z: a diamond body, wings raised in a V, a long neck rising forward
// with the head bent down, a pointed tail rising back. aPart: 0 body, 1 left wing, 2 right wing, 3 neck + head, 4 tail;
// a per-facet tone (colour) so each fold reads even under flat light
function craneGeometry() {
  const pos = [], parts = [], col = [];
  const T = (a, b, c, p, tone = 1) => { pos.push(...a, ...b, ...c); for (let i = 0; i < 3; i++) { parts.push(p); col.push(tone, tone, tone * 0.985); } };
  const top = [0, 0.27, 0], Fb = [0, 0.2, 0.17], Rb = [0, 0.2, -0.17], Lx = [0.075, 0.1, 0], Rx = [-0.075, 0.1, 0], bot = [0, 0.02, 0];
  // the body: a folded diamond (four upper and four lower facets)
  T(Fb, top, Lx, 0, 0.97); T(top, Rb, Lx, 0, 0.9); T(top, Fb, Rx, 0, 0.94); T(Rb, top, Rx, 0, 0.86);
  T(Fb, Lx, bot, 0, 0.8); T(Lx, Rb, bot, 0, 0.74); T(Rx, Fb, bot, 0, 0.78); T(Rb, Rx, bot, 0, 0.7);
  // the wings: raised in a V, each two facets split along its fold
  for (const sx of [1, -1]) {
    const p = sx > 0 ? 1 : 2, root0 = [0, 0.26, 0.1], root1 = [0, 0.26, -0.12], tip = [0.5 * sx, 0.78, -0.08], mid = [0.26 * sx, 0.5, 0.06];
    T(root0, mid, root1, p, sx > 0 ? 1.0 : 0.93); T(root1, mid, tip, p, sx > 0 ? 0.9 : 0.84); T(root0, tip, mid, p, sx > 0 ? 0.96 : 0.88);
  }
  // the neck rising forward, the head bent down at its tip
  const n0 = [0.02, 0.18, 0.16], n1 = [-0.02, 0.18, 0.16], n2 = [0, 0.24, 0.2], nt = [0, 0.72, 0.5], hd = [0, 0.6, 0.66];
  T(n0, nt, n2, 3, 0.95); T(n2, nt, n1, 3, 0.85); T(n0, n1, nt, 3, 0.9);
  T(nt, [0.012, 0.69, 0.52], hd, 3, 0.92); T(nt, hd, [-0.012, 0.69, 0.52], 3, 0.82);
  // the tail rising back to a point
  const t0 = [0.02, 0.18, -0.16], t1 = [-0.02, 0.18, -0.16], t2 = [0, 0.24, -0.2], tt = [0, 0.7, -0.56];
  T(t0, t2, tt, 4, 0.94); T(t2, t1, tt, 4, 0.84); T(t1, t0, tt, 4, 0.88);
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
    vec3 base = vec3(0.0, 0.2, 0.17);
    transformed = rotY(yaw) * (transformed - base) + base;
  }
  transformed = R * (transformed - vec3(0.0, 0.26, 0.0)) + vec3(0.0, 0.26, 0.0);
`;

export class CraneCrowd {
  constructor(sys, crowd, { count = 300, size = 0.105, seed = 7, tiers: nTiers = 6 } = {}) {
    this.sys = sys; this.count = count; this.object = new THREE.Group(); this.object.name = 'paper.crowd';
    let a = seed; const rnd = () => { a = (a * 16807) % 2147483647; return (a - 1) / 2147483646; };
    const C = crowd || { left: [-1.2, -0.62], right: [0.62, 1.2], tiers: [0.05, 0.16, 0.27, 0.38, 0.49], z: [-0.45, -0.05] };
    const geo = craneGeometry();
    const mat = new THREE.MeshPhysicalMaterial({ color: '#f6f4ee', vertexColors: true, roughness: 0.8, sheen: 0.5, sheenColor: new THREE.Color('#fff3e0'), side: THREE.DoubleSide, flatShading: true, envMapIntensity: 0.6 });
    const U = this.uniforms = { uTime: { value: 0 }, uClap: { value: -100 }, uLook: { value: new THREE.Vector3(0, 0.3, 0.6) }, uLookLag: { value: new THREE.Vector3(0, 0.3, 0.6) } };
    mat.onBeforeCompile = (sh) => {
      Object.assign(sh.uniforms, U);
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\n' + VERT_PARS)
        .replace('#include <begin_vertex>', '#include <begin_vertex>\n' + VERT_BODY);   // flat shading: normals from the moved facets
    };
    mat.customProgramCacheKey = () => 'aviva-cranes-v1';
    const mesh = new THREE.InstancedMesh(geo, mat, count); mesh.name = 'crowd.cranes'; mesh.castShadow = false; mesh.receiveShadow = true;
    const ac = new Float32Array(count * 4), m = new THREE.Matrix4(), q = new THREE.Quaternion(), p = new THREE.Vector3(), s = new THREE.Vector3(), e = new THREE.Euler();
    const tiers = nTiers, perSide = Math.floor(count / 2), perRow = Math.ceil(perSide / tiers);
    const yA = C.tiers[0], yB = C.tiers[C.tiers.length - 1] + 0.14, zA = C.z[1], zB = C.z[0] - 0.4;
    const felt = [], brass = [];
    let n = 0;
    for (const side of ['left', 'right']) {
      const [x0, x1] = C[side], sgn = side === 'left' ? -1 : 1;
      for (let t = 0; t < tiers; t++) {
        const u = t / Math.max(1, tiers - 1), y = yA + (yB - yA) * u, z = zA + (zB - zA) * u, depth = (zA - zB) / tiers + 0.02;
        felt.push(new THREE.BoxGeometry(x1 - x0 + 0.08, y + 0.012, depth).translate((x0 + x1) / 2, (y - 0.012) / 2, z - depth / 2 + 0.05));
        brass.push(new THREE.BoxGeometry(x1 - x0 + 0.08, 0.004, 0.004).translate((x0 + x1) / 2, y - 0.001, z + 0.05));
        for (let k = 0; k < perRow && n < count; k++, n++) {
          const x = x0 + (x1 - x0) * ((k + 0.5 + (rnd() - 0.5) * 0.5) / perRow);
          p.set(x, y + 0.001, z + (rnd() - 0.5) * 0.05);
          const toStage = Math.atan2(-p.x, 1.2 - p.z);                       // face the stage, turned toward the camera
          e.set((rnd() - 0.5) * 0.14, toStage + (rnd() - 0.5) * 1.1, (rnd() - 0.5) * 0.12); q.setFromEuler(e);
          const k2 = size * (1 - 0.25 * u) * (0.88 + rnd() * 0.24); s.set(k2, k2, k2);
          mesh.setMatrixAt(n, m.compose(p, q, s));
          ac[n * 4] = Math.abs(x - sgn * 0.62) * 0.9 + t * 0.06 + rnd() * 0.05; ac[n * 4 + 1] = 0.55 + rnd() * 0.45; ac[n * 4 + 2] = rnd() * 6.28; ac[n * 4 + 3] = rnd();
        }
      }
    }
    geo.setAttribute('aCrane', new THREE.InstancedBufferAttribute(ac, 4));
    mesh.count = n; mesh.instanceMatrix.needsUpdate = true; mesh.computeBoundingSphere();
    this.mesh = mesh;
    // the risers: ink felt with a brass nosing on each step, as the stage
    this.risers = new THREE.Mesh(mergeGeometries(felt), new THREE.MeshPhysicalMaterial({ color: '#0b0930', roughness: 1, sheen: 1, sheenColor: new THREE.Color('#3a3478'), sheenRoughness: 0.5, envMapIntensity: 0.05 }));
    this.nosing = new THREE.Mesh(mergeGeometries(brass), new THREE.MeshPhysicalMaterial({ color: '#d4b06a', metalness: 1, roughness: 0.25 }));
    this.risers.receiveShadow = true;
    // the crowd's own light: a soft warm-white front fill and a warm rim from behind (the spots' spill)
    this.fill = new THREE.DirectionalLight('#fff4e6', 0.55); this.fill.position.set(0, 1.4, 2.5);
    this.rim = new THREE.DirectionalLight('#ffd9a8', 1.1); this.rim.position.set(0, 1.6, -2.0);
    this.object.add(this.risers, this.nosing, mesh, this.fill, this.rim);
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
  dispose() { this.mesh.geometry.dispose(); this.mesh.material.dispose(); this.risers.geometry.dispose(); this.risers.material.dispose(); this.nosing.geometry.dispose(); this.nosing.material.dispose(); this.object.removeFromParent(); }
}
