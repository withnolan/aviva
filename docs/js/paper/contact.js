// contact.js: soft, light contact shadows on the studio floor that harden only near contact.
//
// Every caster (a twin of each sheet mesh, on its own layer) is projected straight onto a floor-aligned render target
// by its own vertex shader (material.js createCasterMaterial), sheared along the key light so a floating sheet's
// shadow slides away from the light. It writes two terms with MAX blending:
//   R  contact = exp(-h / 2.5 mm)    -> blurred a little  -> the thin dark line where paper touches the floor
//   G  soft    = exp(-h / 9 cm)      -> blurred a lot     -> the broad, light penumbra that fades as the sheet rises
// The backdrop shader (studio.js) combines them: 1 - (1 - a * contactOpacity) * (1 - b * softOpacity).
import * as THREE from 'three';

const BLUR_VERT = /* glsl */`varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;
const BLUR_FRAG = /* glsl */`
precision highp float; varying vec2 vUv;
uniform sampler2D tSrc; uniform vec2 uDir;    // texel step * radius
// 13-tap gaussian (sigma ~ 2.6 taps): radius in texels set by uDir
void main(){
  vec4 s = texture2D(tSrc, vUv) * 0.1597;
  float w[6]; w[0] = 0.1511; w[1] = 0.1296; w[2] = 0.0997; w[3] = 0.0686; w[4] = 0.0423; w[5] = 0.0233;
  for (int i = 0; i < 6; i++) { float o = float(i + 1); s += (texture2D(tSrc, vUv + uDir * o) + texture2D(tSrc, vUv - uDir * o)) * w[i]; }
  gl_FragColor = s / 0.9889;
}`;

export class ContactShadows {
  constructor(renderer, { res = 512, halfExtent = 0.45, floorY = 0, layer = 5, contactBlurMM = 1.6, softBlurMM = 22 } = {}) {
    this.renderer = renderer; this.layer = layer; this.res = res; this.casters = new Set();
    this.contactBlurMM = contactBlurMM; this.softBlurMM = softBlurMM;
    const opt = { type: THREE.UnsignedByteType, format: THREE.RGBAFormat, depthBuffer: false, generateMipmaps: false, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, colorSpace: THREE.NoColorSpace };
    this.raw = new THREE.WebGLRenderTarget(res, res, opt);
    this.a = new THREE.WebGLRenderTarget(res, res, opt); this.a2 = new THREE.WebGLRenderTarget(res, res, opt);
    const r2 = Math.max(64, res >> 1);
    this.b = new THREE.WebGLRenderTarget(r2, r2, opt); this.b2 = new THREE.WebGLRenderTarget(r2, r2, opt);
    this.uniforms = {
      uCS: { value: new THREE.Vector4(0, 0, halfExtent, floorY) },
      uCSShear: { value: new THREE.Vector4(0, 0, 0.0025, 0.09) },
      uCSRange: { value: new THREE.Vector4(0.45, 0, 0, 0) },
    };
    this.strength = { contact: 0.42, soft: 0.2 };
    this.scene = new THREE.Scene(); this.cam = new THREE.Camera(); this.cam.layers.set(layer);
    this.blurMat = new THREE.ShaderMaterial({ vertexShader: BLUR_VERT, fragmentShader: BLUR_FRAG, depthTest: false, depthWrite: false, uniforms: { tSrc: { value: null }, uDir: { value: new THREE.Vector2() } } });
    const tri = new THREE.BufferGeometry();
    tri.setAttribute('position', new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3));
    tri.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 2, 0, 0, 2], 2));
    this.quad = new THREE.Mesh(tri, this.blurMat); this.quad.frustumCulled = false; this.quadScene = new THREE.Scene(); this.quadScene.add(this.quad);
    this.enabled = true; this.dirty = true;
    this.softLean = 0.006; this.softShift = new THREE.Vector2();
  }
  get textureA() { return this.a.texture; }
  get textureB() { return this.b.texture; }
  setStrength(contact, soft) { this.strength.contact = contact; this.strength.soft = soft; }
  /** centre the shadow window on a world xz point (the hero sheet) */
  follow(x, z) { const U = this.uniforms.uCS.value; if (U.x !== x || U.y !== z) { U.x = x; U.y = z; this.dirty = true; } }
  setFloor(y) { this.uniforms.uCS.value.w = y; this.dirty = true; }
  /** dirToLight: world direction from the subject toward the key. The shadow shifts by -h * (Lx, Lz) / Ly. */
  setLight(dirToLight, amount = 1) {
    const ly = Math.max(dirToLight.y, 0.25);
    const sx = -dirToLight.x / ly * amount, sz = -dirToLight.z / ly * amount;
    const S = this.uniforms.uCSShear.value; S.x = THREE.MathUtils.clamp(sx, -2.5, 2.5); S.y = THREE.MathUtils.clamp(sz, -2.5, 2.5);
    // the soft lobe also leans away from the light, even for a sheet lying flat (as if lit from h0 above)
    const h0 = this.softLean, len = Math.hypot(dirToLight.x, dirToLight.z) || 1;
    this.softShift.set(-dirToLight.x / len * h0 * Math.min(1, len / ly), -dirToLight.z / len * h0 * Math.min(1, len / ly));
  }
  _blur(src, dst, tmp, blurMM) {
    const r = this.renderer, U = this.blurMat.uniforms;
    const extentMM = this.uniforms.uCS.value.z * 2 * 1000;
    const step = Math.max(blurMM / extentMM / 2.6, 0.35 / dst.width);   // uv units per tap
    U.tSrc.value = src.texture; U.uDir.value.set(step, 0); r.setRenderTarget(tmp); r.render(this.quadScene, this.cam);
    U.tSrc.value = tmp.texture; U.uDir.value.set(0, step); r.setRenderTarget(dst); r.render(this.quadScene, this.cam);
  }
  /** render the casters of `scene` (objects on this.layer) and blur. Cheap; call when anything moved. */
  update(scene) {
    if (!this.enabled) return;
    const r = this.renderer, prevRT = r.getRenderTarget(), prevAlpha = r.getClearAlpha(), prevTM = r.toneMapping, prevAC = r.autoClear;
    const prevColor = r.getClearColor(new THREE.Color()); const bg = scene.background;
    r.toneMapping = THREE.NoToneMapping; scene.background = null; r.autoClear = true;
    r.setClearColor(0x000000, 0);
    this.quadScene.layers.set(this.layer); this.quad.layers.set(this.layer);
    r.setRenderTarget(this.raw); r.clear(); r.render(scene, this.cam);
    this._blur(this.raw, this.a, this.a2, this.contactBlurMM);
    // soft lobe: blur into the half-res target, twice for a wide, smooth falloff
    this._blur(this.raw, this.b, this.b2, this.softBlurMM * 0.75);
    this._blur(this.b, this.b, this.b2, this.softBlurMM * 0.65);
    r.setRenderTarget(prevRT); r.setClearColor(prevColor, prevAlpha); r.toneMapping = prevTM; r.autoClear = prevAC; scene.background = bg;
    this.dirty = false;
  }
  /** connect to the backdrop material */
  bind(backdrop) {
    const U = backdrop.userData.uniforms;
    U.uContactA.value = this.a.texture; U.uContactB.value = this.b.texture; U.uCS = this.uniforms.uCS;
    this._backdrop = backdrop;
  }
  syncBackdrop() {
    if (!this._backdrop) return; const U = this._backdrop.userData.uniforms;
    U.uShadowP.value.set(this.strength.contact, this.strength.soft, this.enabled ? 1 : 0, 0);
    U.uSoftShift.value.copy(this.softShift);
  }
  dispose() { [this.raw, this.a, this.a2, this.b, this.b2].forEach((t) => t.dispose()); this.blurMat.dispose(); this.quad.geometry.dispose(); }
}
