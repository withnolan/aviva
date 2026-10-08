// contact.js: soft, light contact shadows on the studio floor that harden only near contact.
//
// Every caster (a twin of each sheet mesh, on its own layer) is projected straight onto a floor-aligned render target
// by its own vertex shader (material.js createCasterMaterial), sheared along the key light so a floating sheet's
// shadow slides away from the light. It writes three height-dependent terms with MAX blending (a cheap stand-in for a
// penumbra that grows with the distance to the occluder, i.e. contact hardening):
//   R  contact  exp(-h / 1.8 mm)                       blurred ~1.2 mm  the thin line where paper touches the floor
//   G  mid      exp(-h / 16 mm) (1 - exp(-h / 3 mm))   blurred ~6 mm    a sheet a few mm to a few cm up
//   B  soft     exp(-h / 14 cm) (1 - exp(-h / 2.5 cm)) blurred ~28 mm   the broad, light penumbra of a sheet in the air
// A sheet lying flat therefore casts only the thin contact line, offset a little away from the key (as a real sheet's
// edge is never perfectly flat), and the shadow grows softer and lighter as the sheet rises.
// The backdrop (studio.js) combines them: 1 - (1 - c * Pc)(1 - m * Pm)(1 - s * Ps), tinted cool-grey.
import * as THREE from 'three';

const BLUR_VERT = /* glsl */`varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;
const BLUR_FRAG = /* glsl */`
precision highp float; varying vec2 vUv;
uniform sampler2D tSrc; uniform vec2 uDir; uniform vec4 uMask;    // texel step * radius; channel mask
// 13-tap gaussian (sigma ~ 2.6 taps): radius in texels set by uDir
void main(){
  vec4 s = texture2D(tSrc, vUv) * 0.1597;
  float w[6]; w[0] = 0.1511; w[1] = 0.1296; w[2] = 0.0997; w[3] = 0.0686; w[4] = 0.0423; w[5] = 0.0233;
  for (int i = 0; i < 6; i++) { float o = float(i + 1); s += (texture2D(tSrc, vUv + uDir * o) + texture2D(tSrc, vUv - uDir * o)) * w[i]; }
  gl_FragColor = (s / 0.9889) * uMask;
}`;

export class ContactShadows {
  constructor(renderer, { res = 512, halfExtent = 0.45, floorY = 0, layer = 5, contactBlurMM = 1.2, midBlurMM = 6, softBlurMM = 28 } = {}) {
    this.renderer = renderer; this.layer = layer; this.res = res; this.casters = new Set();
    this.contactBlurMM = contactBlurMM; this.midBlurMM = midBlurMM; this.softBlurMM = softBlurMM;
    const opt = { type: THREE.UnsignedByteType, format: THREE.RGBAFormat, depthBuffer: false, generateMipmaps: false, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, colorSpace: THREE.NoColorSpace };
    this.raw = new THREE.WebGLRenderTarget(res, res, opt);
    this.a = new THREE.WebGLRenderTarget(res, res, opt); this.a2 = new THREE.WebGLRenderTarget(res, res, opt);
    const r2 = Math.max(64, res >> 1), r4 = Math.max(64, res >> 2);
    this.m = new THREE.WebGLRenderTarget(r2, r2, opt); this.m2 = new THREE.WebGLRenderTarget(r2, r2, opt);
    this.b = new THREE.WebGLRenderTarget(r4, r4, opt); this.b2 = new THREE.WebGLRenderTarget(r4, r4, opt);
    this.uniforms = {
      uCS: { value: new THREE.Vector4(0, 0, halfExtent, floorY) },
      uCSShear: { value: new THREE.Vector4(0, 0, 0.0018, 0.016) },   // xy shear, z contact falloff (m), w mid falloff (m)
      uCSRange: { value: new THREE.Vector4(0.45, 0.14, 0.025, 0.003) }, // x max height, y soft falloff, z soft rise, w mid rise (m)
    };
    this.strength = { contact: 0.34, mid: 0.2, soft: 0.13 };
    this.scene = new THREE.Scene(); this.cam = new THREE.Camera(); this.cam.layers.set(layer);
    this.blurMat = new THREE.ShaderMaterial({ vertexShader: BLUR_VERT, fragmentShader: BLUR_FRAG, depthTest: false, depthWrite: false, uniforms: { tSrc: { value: null }, uDir: { value: new THREE.Vector2() }, uMask: { value: new THREE.Vector4(1, 1, 1, 1) } } });
    const tri = new THREE.BufferGeometry();
    tri.setAttribute('position', new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3));
    tri.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 2, 0, 0, 2], 2));
    this.quad = new THREE.Mesh(tri, this.blurMat); this.quad.frustumCulled = false; this.quadScene = new THREE.Scene(); this.quadScene.add(this.quad);
    this.enabled = true; this.dirty = true;
    // per-lobe lean away from the key, as if the sheet were h0 above the floor (a real sheet's edge always lifts a little)
    this.lean = { contact: 0.0011, mid: 0.004, soft: 0.008 };
    this.leanVec = { contact: new THREE.Vector2(), mid: new THREE.Vector2(), soft: new THREE.Vector2() };
    this.tint = new THREE.Color(0.56, 0.565, 0.585);
  }
  get textureA() { return this.a.texture; }
  get textureB() { return this.b.texture; }
  get textureM() { return this.m.texture; }
  /** strengths (0..1): contact line, mid lobe, soft lobe. setStrength(contact, soft) keeps working (mid = soft x 1.5). */
  setStrength(contact, soft, mid) { this.strength.contact = contact; this.strength.soft = soft; this.strength.mid = mid ?? Math.min(1, soft * 1.5); }
  /** centre the shadow window on a world xz point (the hero sheet) */
  follow(x, z) { const U = this.uniforms.uCS.value; if (U.x !== x || U.y !== z) { U.x = x; U.y = z; this.dirty = true; } }
  setFloor(y) { this.uniforms.uCS.value.w = y; this.dirty = true; }
  /** dirToLight: world direction from the subject toward the key. The shadow shifts by -h * (Lx, Lz) / Ly. */
  setLight(dirToLight, amount = 1) {
    const ly = Math.max(dirToLight.y, 0.25);
    const sx = -dirToLight.x / ly * amount, sz = -dirToLight.z / ly * amount;
    const S = this.uniforms.uCSShear.value; S.x = THREE.MathUtils.clamp(sx, -2.5, 2.5); S.y = THREE.MathUtils.clamp(sz, -2.5, 2.5);
    for (const k of ['contact', 'mid', 'soft']) this.leanVec[k].set(S.x * this.lean[k], S.y * this.lean[k]);
  }
  _blur(src, dst, tmp, blurMM, mask) {
    const r = this.renderer, U = this.blurMat.uniforms;
    const extentMM = this.uniforms.uCS.value.z * 2 * 1000;
    const step = Math.max(blurMM / extentMM / 2.6, 0.35 / dst.width);   // uv units per tap
    U.uMask.value.set(1, 1, 1, 1);
    U.tSrc.value = src.texture; U.uDir.value.set(step, 0); r.setRenderTarget(tmp); r.render(this.quadScene, this.cam);
    if (mask) U.uMask.value.copy(mask);
    U.tSrc.value = tmp.texture; U.uDir.value.set(0, step); r.setRenderTarget(dst); r.render(this.quadScene, this.cam);
  }
  /** render the casters of `scene` (objects on this.layer) and blur. Cheap; call when anything moved. */
  update(scene) {
    if (!this.enabled) return;
    const r = this.renderer, prevRT = r.getRenderTarget(), prevAlpha = r.getClearAlpha(), prevTM = r.toneMapping, prevAC = r.autoClear;
    const prevColor = r.getClearColor(_c); const bg = scene.background;
    r.toneMapping = THREE.NoToneMapping; scene.background = null; r.autoClear = true;
    r.setClearColor(0x000000, 0);
    this.quadScene.layers.set(this.layer); this.quad.layers.set(this.layer);
    r.setRenderTarget(this.raw); r.clear(); r.render(scene, this.cam);
    this._blur(this.raw, this.a, this.a2, this.contactBlurMM);
    this._blur(this.raw, this.m, this.m2, this.midBlurMM);
    // soft lobe: blur into the quarter-res target, twice for a wide, smooth falloff
    this._blur(this.raw, this.b, this.b2, this.softBlurMM * 0.72);
    this._blur(this.b, this.b, this.b2, this.softBlurMM * 0.7);
    r.setRenderTarget(prevRT); r.setClearColor(prevColor, prevAlpha); r.toneMapping = prevTM; r.autoClear = prevAC; scene.background = bg;
    this.dirty = false;
  }
  /** connect to the backdrop material */
  bind(backdrop) {
    const U = backdrop.userData.uniforms;
    U.uContactA.value = this.a.texture; U.uContactB.value = this.b.texture; U.uContactM.value = this.m.texture; U.uCS = this.uniforms.uCS;
    this._backdrop = backdrop;
  }
  syncBackdrop() {
    if (!this._backdrop) return; const U = this._backdrop.userData.uniforms;
    U.uShadowP.value.set(this.strength.contact, this.strength.soft, this.enabled ? 1 : 0, this.strength.mid);
    U.uLeanA.value.set(this.leanVec.contact.x, this.leanVec.contact.y, this.leanVec.mid.x, this.leanVec.mid.y);
    U.uSoftShift.value.copy(this.leanVec.soft);
    U.uShadowTint.value.copy(this.tint);
  }
  dispose() { [this.raw, this.a, this.a2, this.m, this.m2, this.b, this.b2].forEach((t) => t.dispose()); this.blurMat.dispose(); this.quad.geometry.dispose(); }
}
const _c = new THREE.Color();
