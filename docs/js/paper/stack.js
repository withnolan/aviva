// stack.js: a stack of AVIVA sheets that grows (s12 tiers, decision #28: AVIVA 1 sheet, Notebook Pro 80, Ream Pro Max 500).
//
//   const stack = system.createStack({ max: 500, fly: 24 });
//   scene.add(stack.object);                        // its origin is the centre of the bottom sheet (put it on the floor)
//   stack.set({ count: 80 });                       // a settled stack of 80 sheets (fractional counts animate the height)
//   stack.set({ fan: t, from: 80, to: 500 });       // the fan-in, scrubbable: sheets fan in and settle as t goes 0 -> 1
//   // system.update(scene, camera, dt) updates it every frame
//
// Three parts, so even the 500-sheet ream costs about one sheet:
//   block       ONE mesh for the settled sheets (4 walls + a bottom): a procedural ream edge, 0.1 mm per sheet, with a
//               dark seam between sheets, a tiny tilt and tone per sheet and slightly different groups of sheets, all
//               anti-aliased so the lines average into the smooth, faintly banded side of a real ream at distance
//   top sheet   a full Sheet (the paper material, its edge, the pencil and the ink dot if attached) on top of the block
//   fan         ONE InstancedMesh (one draw call, shadows and contact shadows included) for the sheets in the air:
//               each falls like a leaf along its own arc, bowing and fluttering less and less, and lands exactly on the
//               top of the block, which grows under it
import * as THREE from 'three';
import { createSheetGeometry, releaseSheetGeometry } from './geometry.js';
import { makeSheetUniforms, createPaperMaterial, createPaperDepthMaterial, createCasterMaterial, createStaticCasterMaterial } from './material.js';

const ease = (x) => { x = Math.min(Math.max(x, 0), 1); return x * x * (3 - 2 * x); };
const easeOut = (x) => { x = Math.min(Math.max(x, 0), 1); return 1 - (1 - x) * (1 - x); };
function mulberry(a) { return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

/* ------------------------------------------------------------------------------------------------ the block */
// 4 walls + bottom of a unit-height box (y 0..1; the mesh is scaled to the stack height). uv.x = along the edge (m).
function blockGeometry(W, H) {
  const pos = [], nrm = [], uv = [], idx = [];
  const quad = (a, b, c, d, n, len) => {
    const o = pos.length / 3;
    for (const [p, u] of [[a, 0], [b, len], [c, len], [d, 0]]) { pos.push(...p); nrm.push(...n); uv.push(u, p[1]); }
    idx.push(o, o + 1, o + 2, o, o + 2, o + 3);
  };
  const x0 = -W / 2, x1 = W / 2, z0 = -H / 2, z1 = H / 2;
  quad([x0, 0, z1], [x1, 0, z1], [x1, 1, z1], [x0, 1, z1], [0, 0, 1], W);     // front (+z)
  quad([x1, 0, z0], [x0, 0, z0], [x0, 1, z0], [x1, 1, z0], [0, 0, -1], W);    // back
  quad([x1, 0, z1], [x1, 0, z0], [x1, 1, z0], [x1, 1, z1], [1, 0, 0], H);     // right
  quad([x0, 0, z0], [x0, 0, z1], [x0, 1, z1], [x0, 1, z0], [-1, 0, 0], H);    // left
  quad([x0, 0, z0], [x1, 0, z0], [x1, 0, z1], [x0, 0, z1], [0, -1, 0], W);    // bottom
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  return g;
}

const EDGE_FRAG_PARS = /* glsl */`
varying vec2 vEdge;
uniform float uCount, uSeed; uniform vec3 uPaperC;
float se_h(float x){ return fract(sin(x * 127.1 + uSeed * 7.13) * 43758.5453); }
float se_n(float x){ float i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f); return mix(se_h(i), se_h(i + 1.0), f); }
float se_h2(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float seSheet, seAA, seTilt;
`;
const EDGE_FRAG_COLOR = /* glsl */`
// the ream edge: one stripe per sheet (vEdge.y * uCount), measured from the bottom sheet
seSheet = vEdge.y * uCount;
float seI = floor(seSheet), seF = fract(seSheet);
float sePx = max(fwidth(seSheet), 1e-4);                       // sheets per pixel
// band-limited: every per-sheet feature is a cosine (or a per-sheet value) whose amplitude is the gaussian filter of
// the pixel footprint, so the 0.1 mm lines fade to their mean before they can alias (no moire at any distance)
float seAtt = exp(-14.0 * sePx * sePx);
seAA = 1.0 - seAtt;
float seGrp = se_n(seSheet / 19.0) * 0.6 + se_n(seSheet / 53.0 + 3.0) * 0.4;   // groups of sheets cut / laid a little differently
float seTone = 1.0 + (se_h(seI) - 0.5) * 0.07 * seAtt;
float seSeam = 1.0 - 0.11 * (1.0 + cos(6.2831853 * seF)) * seAtt;            // the shadowed seam between two sheets
float seRough = 1.0 + 0.05 * (se_h2(vec2(floor(vEdge.x * 4000.0), seI)) - 0.5) * seAtt * exp(-30.0 * fwidth(vEdge.x * 4000.0) * fwidth(vEdge.x * 4000.0));
float seEdge = 0.945 * seSeam * seTone * seRough * (1.0 + (seGrp - 0.5) * 0.05);
seTilt = (se_h(seI * 1.73 + 5.0) - 0.5) * 0.35 * seAtt;        // each sheet lies a hair off the others
diffuseColor.rgb = uPaperC * seEdge;
`;
const EDGE_FRAG_NORMAL = /* glsl */`
#include <normal_fragment_maps>
{ vec3 upV = normalize((viewMatrix * vec4(0.0, 1.0, 0.0, 0.0)).xyz); normal = normalize(normal + upV * seTilt); }
`;

/* ------------------------------------------------------------------------------------------------ the stack */
export class Stack {
  /**
   * @param {object} sys the paper system
   * @param {object} o max (sheets the stack can show, 500), fly (instances in the air at once, 24), width / height
   *   (m, A4), sheetThickness (m, 0.0001 = 80 g/m2), segments ([w, h] of the falling sheets, [28, 40]), seed
   */
  constructor(sys, { max = 500, fly = 24, width = 0.21, height = 0.297, sheetThickness = 0.0001, segments = [28, 40], seed = 11, name = 'stack' } = {}) {
    this.sys = sys; this.name = name; this.max = max; this.flyN = fly; this.size = { w: width, h: height };
    this.sheetT = sheetThickness; this.seed = seed;
    this.object = new THREE.Group(); this.object.name = 'paper.' + name;
    this.state = { count: 1, fan: 1, from: 1, to: 1, spread: 1, flutter: 1 };
    // block
    const paperLin = sys.shared.uPaperColor.value;
    this.blockUniforms = { uCount: { value: 1 }, uSeed: { value: seed }, uPaperC: { value: paperLin } };
    const bm = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.92, metalness: 0, sheen: 0.6, sheenColor: new THREE.Color(0.2, 0.195, 0.18), sheenRoughness: 0.6, specularIntensity: 0.25 });
    bm.onBeforeCompile = (sh) => {
      Object.assign(sh.uniforms, this.blockUniforms);
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec2 vEdge;').replace('#include <uv_vertex>', '#include <uv_vertex>\nvEdge = uv;');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\n' + EDGE_FRAG_PARS)
        .replace('#include <color_fragment>', EDGE_FRAG_COLOR).replace('#include <normal_fragment_maps>', EDGE_FRAG_NORMAL);
    };
    bm.customProgramCacheKey = () => 'aviva-stack-edge-v1';
    this.block = new THREE.Mesh(blockGeometry(width, height), bm);
    this.block.name = 'paper.' + name + '.block'; this.block.castShadow = true; this.block.receiveShadow = true; this.block.frustumCulled = false;
    this.object.add(this.block);
    if (sys.contact) {
      this.blockCaster = new THREE.Mesh(this.block.geometry, createStaticCasterMaterial(sys.contact.uniforms));
      this.blockCaster.layers.set(sys.contact.layer); this.blockCaster.frustumCulled = false; this.block.add(this.blockCaster);
    }
    // the top sheet: a full sheet, face up (rest +y = away, -z)
    this.topSheet = sys.createSheet({ name: name + '.top', width, height, seed: seed + 3 });
    this.topSheet.object.rotation.x = -Math.PI / 2;
    this.topSheet.set({ rest: 0.18 });                     // the top of a ream lies almost flat: only a hint of curl
    this.object.add(this.topSheet.object);
    // the fan: instanced falling sheets
    const base = createSheetGeometry(segments[0], segments[1], this.size);
    this.flyGeo = base.clone(); this.flyGeo.boundingSphere = base.boundingSphere.clone(); this.flyGeo.boundingBox = base.boundingBox.clone();
    releaseSheetGeometry(base);
    this.aInst = new THREE.InstancedBufferAttribute(new Float32Array(fly * 4), 4).setUsage(THREE.DynamicDrawUsage);
    this.flyGeo.setAttribute('aInst', this.aInst);
    this.flyUniforms = makeSheetUniforms(sys.shared, this.size);
    this.flyUniforms.uDeformEps.value = 0.5 * width / segments[0];
    this.flyUniforms.uBend.value.set(0, Math.PI / 2, 0, 0);
    this.flyUniforms.uFlutter.value.set(0, 8, 0, seed);
    this.flyUniforms.uCockle.value.x = 0.0003;
    this.fan = new THREE.InstancedMesh(this.flyGeo, createPaperMaterial(this.flyUniforms, { variant: 'slab', instanced: true }), fly);
    this.fan.name = 'paper.' + name + '.fan'; this.fan.frustumCulled = false; this.fan.castShadow = true; this.fan.receiveShadow = true;
    this.fan.customDepthMaterial = createPaperDepthMaterial(this.flyUniforms, 'slab', { instanced: true });
    this.fan.count = 0;
    this.object.add(this.fan);
    if (sys.contact) {
      this.fanCaster = new THREE.InstancedMesh(this.flyGeo, createCasterMaterial(this.flyUniforms, sys.contact.uniforms, 'slab', { instanced: true }), fly);
      this.fanCaster.instanceMatrix = this.fan.instanceMatrix; this.fanCaster.frustumCulled = false; this.fanCaster.layers.set(sys.contact.layer); this.fanCaster.count = 0;
      this.fan.add(this.fanCaster);
    }
    // per-instance flight parameters (seeded: the same fan every time, so it scrubs with scroll)
    const rnd = mulberry(seed * 977 + 5);
    this.flights = Array.from({ length: fly }, (_, i) => {
      const side = i % 2 ? 1 : -1;
      return {
        yaw0: side * (0.3 + 0.45 * rnd()), drop: 0.09 + 0.07 * rnd(), off: [side * (0.05 + 0.08 * rnd()), 0.03 * (rnd() - 0.5)],
        rock: 0.22 + 0.16 * rnd(), freq: 1.1 + 0.5 * rnd(), ph: rnd() * 6.28, bow: 2 + 2.5 * rnd(), fl: 0.004 + 0.004 * rnd(),
      };
    });
    this._m = new THREE.Matrix4(); this._q = new THREE.Quaternion(); this._e = new THREE.Euler(); this._p = new THREE.Vector3(); this._s = new THREE.Vector3(1, 1, 1);
    this.height = sheetThickness;
    this._apply();
    sys.stacks.add(this);
  }

  /** count (sheets), or the fan-in: fan 0..1 from `from` to `to` sheets; spread (0..1.5) widens the fan; flutter scales it */
  set(s = {}) { Object.assign(this.state, s); if ('count' in s && !('fan' in s)) { this.state.fan = 1; this.state.from = this.state.to = s.count; } this._apply(); return this; }

  /** sheets on the block at fan progress t (the arrivals are evenly spread over t 0.05..0.95) */
  _countAt(t) { const S = this.state; return S.from + (S.to - S.from) * ease((t - 0.03) / 0.92); }

  _apply() {
    const S = this.state, T = this.sheetT, n = Math.min(this.max, Math.max(1, this._countAt(S.fan)));
    // the block holds every sheet but the top one; the top sheet sits on it
    const below = Math.max(0, n - 1), h = below * T;
    this.height = h + T;
    this.block.visible = below > 0.5;
    this.block.scale.y = Math.max(h, 1e-6);
    this.blockUniforms.uCount.value = below;
    this.topSheet.object.position.y = h + T * 0.5;
    // the fan
    const F = this.flyN, k = Math.min(F, Math.max(0, Math.round(S.to - S.from)));
    let vis = 0, wobble = 0;
    for (let i = 0; i < k; i++) {
      // flight i lands when the block reaches its height; it is in the air for 0.26 of the fan
      const land = 0.05 + 0.9 * ((i + 1) / (k + 1)), dur = 0.26, u = (S.fan - (land - dur)) / dur;
      if (u >= 1) { wobble = Math.max(wobble, Math.exp(-(S.fan - land) / 0.035)); continue; }
      if (u <= 0) continue;
      const f = this.flights[i], e = easeOut(u), sp = S.spread, damp = Math.pow(1 - u, 1.4);
      const top = (Math.min(this.max, this._countAt(land)) - 1) * T + T * 0.5;
      this._p.set(f.off[0] * (1 - e) * sp, top + f.drop * (1 - ease(u)) + 0.0004 * (1 - u), f.off[1] * (1 - e) * sp);
      const rock = f.rock * damp * Math.sin(6.283 * f.freq * u + f.ph) * S.flutter;
      this._e.set(-Math.PI / 2 + rock * 0.8, f.yaw0 * (1 - e) * sp, rock * 0.6, 'YXZ');
      this._q.setFromEuler(this._e);
      this._m.compose(this._p, this._q, this._s);
      this.fan.setMatrixAt(vis, this._m);
      this.aInst.setXYZW(vis, f.bow * damp * damp, f.fl * damp * S.flutter, u * 3.2 + i * 1.7, 0);
      vis++;
    }
    this.fan.count = vis; if (this.fanCaster) this.fanCaster.count = vis;
    this.fan.instanceMatrix.needsUpdate = true; this.aInst.needsUpdate = true;
    // the top sheet settles with a slight flutter after each landing
    this.topSheet.set({ flutter: 0.0012 * wobble * S.flutter, flutterTime: S.fan * 40 });
  }

  /** per frame (system.update calls it): the falling sheets' effective thickness */
  update(camera) {
    if (camera && this.fan.count > 0) {
      const wp = this.object.getWorldPosition(this._p), d = Math.max(0.01, wp.distanceTo(camera.position));
      const px = 2 * d * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) / this.sys.bufferHeight();
      this.flyUniforms.uHalfThick.value = 0.5 * Math.max(this.sheetT, 1.2 * px);
    }
  }
  dispose() {
    this.block.geometry.dispose(); this.block.material.dispose(); if (this.blockCaster) this.blockCaster.material.dispose();
    this.flyGeo.dispose(); this.fan.material.dispose(); this.fan.customDepthMaterial.dispose(); if (this.fanCaster) this.fanCaster.material.dispose();
    this.topSheet.dispose(); this.object.removeFromParent(); this.sys.stacks.delete(this);
  }
}
