// ink-front.js: SCRUBBABLE ink-bleed microscope view. No simulation state: ink coverage is a closed-form function of
// (position, progress t) so scroll can drive it forwards and backwards. A ragged capillary blot grows ~sqrt(t) and
// 'wicks' further along individual fibres that cross it (the feathery tendrils). Fibres are drawn in the same loop.
import * as THREE from 'three';
const VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;
const FRAG = /* glsl */`
precision highp float; varying vec2 vUv;
uniform float uT;                 // 0..1 ink progress (drive from scroll)
uniform vec2 uView;               // visible field of view in mm (e.g. 1.6 x 1.6)
uniform vec3 uInk, uPaper; uniform float uAspect;
float h11(float n){ return fract(sin(n * 127.1) * 43758.5453); }
vec2 h12(float n){ return fract(sin(vec2(n * 127.1, n * 311.7)) * 43758.5453); }
float h21(vec2 p){ p = fract(p * vec2(.1031, .1030)); p += dot(p, p.yx + 33.33); return fract((p.x + p.y) * p.x); }
float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.-2.*f); return mix(mix(h21(i), h21(i+vec2(1,0)), f.x), mix(h21(i+vec2(0,1)), h21(i+vec2(1,1)), f.x), f.y); }
float fbm(vec2 p){ return 0.55 * vn(p) + 0.3 * vn(p * 2.1 + 3.7) + 0.15 * vn(p * 4.3 + 8.1); }
void main(){
  vec2 p = (vUv - 0.5) * uView * vec2(uAspect, 1.0);               // mm
  float r = length(p), a = atan(p.y, p.x);
  // ragged capillary blot
  float R = 0.16 + 0.34 * sqrt(uT);                                    // mm
  float rag = 1.0 + 0.55 * (fbm(vec2(cos(a), sin(a)) * 2.6 + 4.0) - 0.5) + 0.35 * (fbm(p * 14.0) - 0.5);
  float blot = 1.0 - smoothstep(R * rag * 0.92, R * rag * 1.04, r);
  // fibres: both the visible network and the wicking channels
  float fibreLine = 0.0, wick = 0.0;
  for (int i = 0; i < 70; i++) {
    float fi = float(i);
    vec2 c = (h12(fi * 3.1) - 0.5) * uView * 1.3;                      // fibre centre (mm)
    float ang = h11(fi * 1.7) * 3.14159; vec2 d = vec2(cos(ang), sin(ang)), n = vec2(-d.y, d.x);
    float len = 0.5 + 1.1 * h11(fi * 5.3);                              // mm
    vec2 q = p - c; float along = dot(q, d), perp = dot(q, n);
    float w = 0.012 + 0.012 * h11(fi * 9.1);                            // half width mm (12-24 um)
    float inSeg = smoothstep(len * 0.5, len * 0.45, abs(along));
    float line = exp(-perp * perp / (w * w)) * inSeg; fibreLine = max(fibreLine, line * 0.9);
    // does this fibre pass through the blot? distance of the fibre line to the centre
    float lineDist = abs(dot(-c, n)); float reach = sqrt(max(R * R - lineDist * lineDist, 0.0));   // half-chord inside the blot
    float s = dot(-c, d);                                              // along-coordinate of the blot centre
    float wickLen = (0.15 + 0.9 * h11(fi * 7.7)) * uT * step(lineDist, R * 0.95);
    float lo = s - reach - wickLen, hi = s + reach + wickLen;           // fibre stretch that carries ink
    float carry = smoothstep(lo - 0.02, lo + 0.02, along) * (1.0 - smoothstep(hi - 0.02, hi + 0.02, along));
    wick = max(wick, line * carry);
  }
  float body = max(blot, wick);
  float density = 0.55 + 0.45 * exp(-r / (R * 0.8 + 0.001));           // darker where the drop landed
  vec3 paper = uPaper * (0.94 + 0.06 * vn(p * 40.0)) * (1.0 - 0.12 * fibreLine);   // fibres slightly darker/lighter lines
  vec3 col = mix(paper, uInk * (0.7 + 0.3 * (1.0 - density)), clamp(body * density * 1.25, 0.0, 1.0));
  col *= 1.0 - 0.18 * smoothstep(0.55, 1.1, length((vUv - 0.5) * 2.0));  // microscope vignette
  gl_FragColor = vec4(col, 1.0);
}`;
export function createInkFront() {
  const tri = new THREE.BufferGeometry(); tri.setAttribute('position', new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3)); tri.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 2, 0, 0, 2], 2));
  const mat = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, depthTest: false, uniforms: { uT: { value: 0 }, uView: { value: new THREE.Vector2(1.6, 1.6) }, uAspect: { value: 1 }, uInk: { value: new THREE.Color(0.02, 0.06, 0.32) }, uPaper: { value: new THREE.Color(0.80, 0.79, 0.76) } } });
  const mesh = new THREE.Mesh(tri, mat); mesh.frustumCulled = false; return mesh;
}
