// ink.js: "ink bleeding through paper fibres" for the microscope view: anisotropic diffusion on a ping-pong half-float render target.
// C = ink concentration. Diffusivity is a tensor aligned with a smooth fibre-orientation field, scaled by fibre density, with a capillary
// threshold (spreading stalls when C is small) -> feathery, fibre-following edges instead of a round blot.
import * as THREE from 'three';

const VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;
const FIELD = /* glsl */`
float h21(vec2 p){ p = fract(p * vec2(.1031, .1030)); p += dot(p, p.yx + 33.33); return fract((p.x + p.y) * p.x); }
float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.-2.*f); return mix(mix(h21(i), h21(i+vec2(1,0)), f.x), mix(h21(i+vec2(0,1)), h21(i+vec2(1,1)), f.x), f.y); }
vec3 fibreField(vec2 uv){      // returns (cos th, sin th, density)
  float th = 6.2831853 * (0.6 * vn(uv * 7.0) + 0.4 * vn(uv * 23.0 + 5.0));
  float dens = 0.35 + 0.65 * smoothstep(0.25, 0.75, vn(uv * 41.0 + 9.0) * 0.6 + vn(uv * 130.0) * 0.4);
  return vec3(cos(th), sin(th), dens); }`;
const STEP = /* glsl */`
precision highp float; varying vec2 vUv; uniform sampler2D uC; uniform vec2 uTexel; uniform float uDt, uAniso;
uniform vec4 uDrop; uniform float uTime;   // xy centre (uv), z radius (uv), w amount; set w=0 when idle
${FIELD}
void main(){
  float c = texture2D(uC, vUv).r;
  float cE = texture2D(uC, vUv + vec2(uTexel.x, 0)).r, cW = texture2D(uC, vUv - vec2(uTexel.x, 0)).r, cN = texture2D(uC, vUv + vec2(0, uTexel.y)).r, cS = texture2D(uC, vUv - vec2(0, uTexel.y)).r;
  float cNE = texture2D(uC, vUv + uTexel).r, cNW = texture2D(uC, vUv + vec2(-uTexel.x, uTexel.y)).r, cSE = texture2D(uC, vUv + vec2(uTexel.x, -uTexel.y)).r, cSW = texture2D(uC, vUv - uTexel).r;
  vec3 f = fibreField(vUv); vec2 d = f.xy;
  float base = 0.45 * f.z, an = uAniso * f.z;                            // isotropic part + part along the fibre
  float Dxx = base + an * d.x * d.x, Dyy = base + an * d.y * d.y, Dxy = an * d.x * d.y;
  float cmx = max(max(c, cE), max(max(cW, cN), cS)); float cap = smoothstep(0.004, 0.05, cmx * (0.6 + 0.8 * f.z));                    // capillary threshold: thin ink front creeps, thick ink flows
  float lap = Dxx * (cE - 2.0 * c + cW) + Dyy * (cN - 2.0 * c + cS) + 0.5 * Dxy * (cNE - cNW - cSE + cSW);
  float nc = c + uDt * lap * cap;
  float dd = length((vUv - uDrop.xy) * vec2(1.0, 1.0)); nc += uDrop.w * (1.0 - smoothstep(uDrop.z * 0.2, uDrop.z, dd));   // nib touches paper
  gl_FragColor = vec4(min(nc, 1.5), 0.0, 0.0, 1.0);
}`;
const SHOW = /* glsl */`
precision highp float; varying vec2 vUv; uniform sampler2D uC; uniform vec3 uInk, uPaper;
${FIELD}
void main(){
  float c = texture2D(uC, vUv).r; vec3 f = fibreField(vUv);
  float fibre = 0.9 + 0.1 * vn(vUv * 260.0);
  float a = smoothstep(0.03, 0.55, c * (0.7 + 0.6 * f.z));                // fibres soak more ink where dense
  vec3 col = mix(uPaper * fibre, uInk * (0.75 + 0.25 * (1.0 - f.z)), a);
  col = mix(col, uInk * 0.55, smoothstep(0.7, 1.4, c) * 0.5);            // pooled ink in the middle
  gl_FragColor = vec4(col, 1.0); }`;

export class InkSim {
  constructor(renderer, size = 512) {
    this.r = renderer; this.size = size;
    const opt = { type: THREE.HalfFloatType, format: THREE.RGBAFormat, depthBuffer: false, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, colorSpace: THREE.NoColorSpace };
    this.a = new THREE.WebGLRenderTarget(size, size, opt); this.b = new THREE.WebGLRenderTarget(size, size, opt);
    const tri = new THREE.BufferGeometry(); tri.setAttribute('position', new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3)); tri.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 2, 0, 0, 2], 2));
    this.step = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: STEP, depthTest: false, uniforms: { uC: { value: null }, uTexel: { value: new THREE.Vector2(1 / size, 1 / size) }, uDt: { value: 0.14 }, uAniso: { value: 1.4 }, uDrop: { value: new THREE.Vector4(0, 0, 0.01, 0) }, uTime: { value: 0 } } });
    this.show = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: SHOW, depthTest: false, uniforms: { uC: { value: null }, uInk: { value: new THREE.Color(0.012, 0.03, 0.2) }, uPaper: { value: new THREE.Color(0.86, 0.85, 0.82) } } });
    this.mesh = new THREE.Mesh(tri, this.step); this.mesh.frustumCulled = false; this.scene = new THREE.Scene(); this.scene.add(this.mesh); this.cam = new THREE.Camera();
  }
  drop(u, v, radius = 0.012, amount = 1.0) { this.step.uniforms.uDrop.value.set(u, v, radius, amount); }
  /** run n explicit steps (stability: uDt * (Dxx + Dyy) < 0.5 with these constants) */
  advance(n = 4) { const r = this.r, prev = r.getRenderTarget(); this.mesh.material = this.step;
    for (let i = 0; i < n; i++) { this.step.uniforms.uC.value = this.a.texture; r.setRenderTarget(this.b); r.render(this.scene, this.cam); [this.a, this.b] = [this.b, this.a]; this.step.uniforms.uDrop.value.w = 0; }
    r.setRenderTarget(prev); }
  /** draw the result (full screen) or use this.a.texture on any material */
  render(target = null) { this.mesh.material = this.show; this.show.uniforms.uC.value = this.a.texture; const r = this.r, prev = r.getRenderTarget(); r.setRenderTarget(target); r.render(this.scene, this.cam); r.setRenderTarget(prev); }
}
