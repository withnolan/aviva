// paint.js: draw on the sheet with a pencil, GPU brush into a render target (no CanvasTexture re-uploads).
// Input is rest-space UV (0..1 across the sheet) from picking.js (any pose) or from a plain ray/plane hit (flat pose).
import * as THREE from 'three';

const BRUSH_V = /* glsl */`
attribute vec2 aA; attribute vec2 aB; attribute vec2 aPr;       // per-segment: endpoints (uv) and pressure at each end
uniform vec2 uMM; uniform float uRadiusMM;
varying vec2 vP; varying vec2 vA; varying vec2 vB; varying vec2 vPr;
void main(){
  vec2 pad = vec2(uRadiusMM * 1.6) / uMM;
  vec2 lo = min(aA, aB) - pad, hi = max(aA, aB) + pad;
  vec2 uv = mix(lo, hi, position.xy * 0.5 + 0.5);
  vP = uv; vA = aA; vB = aB; vPr = aPr; gl_Position = vec4(uv * 2.0 - 1.0, 0.0, 1.0); }`;
const BRUSH_F = /* glsl */`
precision highp float; varying vec2 vP; varying vec2 vA; varying vec2 vB; varying vec2 vPr;
uniform vec2 uMM; uniform float uRadiusMM; uniform sampler2D uTooth; uniform vec3 uColor; uniform float uHard;
void main(){
  vec2 p = vP * uMM, a = vA * uMM, b = vB * uMM, pa = p - a, ba = b - a;
  float t = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-6), 0.0, 1.0);
  float d = length(pa - ba * t);
  float pr = mix(vPr.x, vPr.y, t);
  float r = uRadiusMM * (0.55 + 0.45 * pr);
  float core = 1.0 - smoothstep(r * uHard, r, d);
  vec2 g = texture2D(uTooth, p / 30.0).rg * 2.0 - 1.0;                  // paper tile = 30 mm: graphite catches on the ridges
  float grain = 0.5 + 1.6 * (g.x * 0.7 + g.y * 0.7) + 0.5 * fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  gl_FragColor = vec4(uColor, core * clamp(pr * smoothstep(0.15, 0.85, grain), 0.0, 1.0) * 0.55);
}`;

export class PaintLayer {
  constructor(renderer, { width = 1536, toothTexture, mm = [210, 297], color = [0.045, 0.045, 0.05], radiusMM = 0.45, maxSegs = 4096 } = {}) {
    const height = Math.round(width * mm[1] / mm[0]);
    this.r = renderer; this.mm = mm; this.radiusMM = radiusMM; this.maxSegs = maxSegs; this.n = 0;
    this.rt = new THREE.WebGLRenderTarget(width, height, { depthBuffer: false, colorSpace: THREE.NoColorSpace, generateMipmaps: true, minFilter: THREE.LinearMipmapLinearFilter, magFilter: THREE.LinearFilter });
    this.rt.texture.anisotropy = 8;
    const g = new THREE.InstancedBufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute([-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, 1, 0], 3)); g.setIndex([0, 1, 2, 0, 2, 3]);
    this.aA = new THREE.InstancedBufferAttribute(new Float32Array(maxSegs * 2), 2); this.aB = new THREE.InstancedBufferAttribute(new Float32Array(maxSegs * 2), 2); this.aPr = new THREE.InstancedBufferAttribute(new Float32Array(maxSegs * 2), 2);
    [this.aA, this.aB, this.aPr].forEach((x) => x.setUsage(THREE.DynamicDrawUsage)); g.setAttribute('aA', this.aA); g.setAttribute('aB', this.aB); g.setAttribute('aPr', this.aPr); this.geo = g;
    this.mat = new THREE.ShaderMaterial({ vertexShader: BRUSH_V, fragmentShader: BRUSH_F, transparent: true, depthTest: false, depthWrite: false, blending: THREE.NormalBlending,
      uniforms: { uMM: { value: new THREE.Vector2(...mm) }, uRadiusMM: { value: radiusMM }, uTooth: { value: toothTexture }, uColor: { value: new THREE.Color(...color) }, uHard: { value: 0.35 } } });
    this.mesh = new THREE.Mesh(g, this.mat); this.mesh.frustumCulled = false; this.scene = new THREE.Scene(); this.scene.add(this.mesh); this.cam = new THREE.Camera(); this.pts = null; this.clear();
  }
  get texture() { return this.rt.texture; }
  clear() { const r = this.r, p = r.getRenderTarget(), c = r.getClearAlpha(), col = new THREE.Color(); r.getClearColor(col); r.setClearColor(0x000000, 0); r.setRenderTarget(this.rt); r.clear(); r.setRenderTarget(p); r.setClearColor(col, c); }   // "unlimited undo (pencil only)": one call
  _queue(a, b, p0, p1) { if (this.n >= this.maxSegs) this.flush(); const i = this.n++; this.aA.setXY(i, a.x, a.y); this.aB.setXY(i, b.x, b.y); this.aPr.setXY(i, p0, p1); }
  /** call once per frame (after the pointer events): ONE instanced draw for all new segments, ONE mip regeneration */
  flush() {
    if (!this.n) return; this.geo.instanceCount = this.n; this.aA.needsUpdate = this.aB.needsUpdate = this.aPr.needsUpdate = true;
    const r = this.r, prev = r.getRenderTarget(), ac = r.autoClear, tm = r.toneMapping; r.autoClear = false; r.toneMapping = THREE.NoToneMapping;
    r.setRenderTarget(this.rt); r.render(this.scene, this.cam); r.setRenderTarget(prev); r.autoClear = ac; r.toneMapping = tm; this.n = 0;
  }
  /** stroke API: begin(u,v,t), move(u,v,t), end(). Quadratic Bezier through midpoints (C1-smooth, lags one sample); pressure from speed (slow = darker, wider). */
  begin(u, v, t) { this.pts = [new THREE.Vector2(u, v)]; this.times = [t]; this.pressure = 0.8; }
  move(u, v, t) {
    const P = this.pts, n = P.length, cur = new THREE.Vector2(u, v), last = P[n - 1];
    const dmm = Math.hypot((cur.x - last.x) * this.mm[0], (cur.y - last.y) * this.mm[1]); if (dmm < 0.25) return;           // ignore sub-0.25 mm jitter
    const speed = dmm / Math.max(t - this.times[n - 1], 1);                                                               // mm per ms
    const target = THREE.MathUtils.clamp(1.15 - speed * 0.9, 0.35, 1.0), pr0 = this.pressure; this.pressure += (target - this.pressure) * 0.35;
    P.push(cur); this.times.push(t);
    if (P.length >= 3) {
      const p0 = P[P.length - 3], p1 = P[P.length - 2], p2 = P[P.length - 1], m0 = p0.clone().add(p1).multiplyScalar(0.5), m1 = p1.clone().add(p2).multiplyScalar(0.5);
      const len = Math.hypot((m1.x - m0.x) * this.mm[0], (m1.y - m0.y) * this.mm[1]), N = Math.max(1, Math.ceil(len / 0.6));
      let prevPt = m0;
      for (let i = 1; i <= N; i++) { const s = i / N, a = (1 - s) * (1 - s), b = 2 * (1 - s) * s, c = s * s; const pt = new THREE.Vector2(a * m0.x + b * p1.x + c * m1.x, a * m0.y + b * p1.y + c * m1.y); this._queue(prevPt, pt, THREE.MathUtils.lerp(pr0, this.pressure, (i - 1) / N), THREE.MathUtils.lerp(pr0, this.pressure, s)); prevPt = pt; }
    }
  }
  end() { this.pts = null; }
}
