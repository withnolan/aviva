// bleed.js: The Bleed's screen-space carry (brief 5.3, s07 3.4 -> 4.0 vh): the ink leaves the sheet and takes the page.
//
//   const bleed = system.createBleed();           // same shape as the site's props.createBleed(): a drop-in
//   bleed.material.uniforms.uCov.value = cov;     // 0..1, scrubbed by scroll (0.4 at the hand-over, 1 = all ink)
//   bleed.material.uniforms.uAspect.value = w / h;
//   if (bleed.active) { renderer.autoClear = false; renderer.render(bleed.scene, bleed.camera); }   // after the scene
//
// One full-screen triangle, one fragment shader, no state: coverage is a closed-form function of (pixel, uCov), so it
// scrubs backwards as well as forwards. The front is the sheet's own ink-front language at screen scale:
//   - a ragged blot growing from uCenter (fbm-warped distance), whose edge is pushed ahead along a FIBRE FIELD
//     (thin streaks in four orientations, a little longer along the paper's machine direction), so tendrils run out
//     first and the front is never a clean circle or a straight wipe;
//   - from ~40 % coverage the white that is left breaks into ISLANDS that shrink with feathered, fibrous edges;
//   - a darker core (deep ink) behind the front, a faint damp halo ahead of it.
// Colours are display-space (sRGB) and the overlay is not tone-mapped, so a full screen equals the CSS ink ground.
// uFlat = 1 (reduced motion): a plain cross-fade.
import * as THREE from 'three';

const FRAG = /* glsl */`
precision highp float;
varying vec2 vUv;
uniform float uCov, uAspect, uFlat, uSeed, uScale;
uniform vec2 uCenter;
uniform vec3 uColor, uDeep, uHalo;
float bh(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * .1031 + uSeed * 0.013); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float bn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(bh(i), bh(i + vec2(1, 0)), f.x), mix(bh(i + vec2(0, 1)), bh(i + vec2(1, 1)), f.x), f.y); }
float bfbm(vec2 p){ float s = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { s += a * bn(p); p = p * 2.03 + 1.7; a *= 0.5; } return s; }
// fibres: streaks in four orientations (two near the machine direction), each a thresholded, stretched noise
float fibres(vec2 q){
  float f = 0.0;
  for (int k = 0; k < 4; k++) {
    float a = float(k) * 0.785 + (k < 2 ? 0.0 : 0.2) + uSeed * 0.1;
    vec2 d = vec2(cos(a), sin(a)), r = vec2(dot(q, d), dot(q, vec2(-d.y, d.x)));
    float n = bn(vec2(r.x * 9.0, r.y * 160.0) + float(k) * 17.3) * 0.7 + bn(vec2(r.x * 20.0, r.y * 320.0) + float(k) * 5.1) * 0.3;
    f = max(f, smoothstep(0.66, 0.92, n) * (k < 2 ? 1.0 : 0.65));
  }
  return f;
}
void main(){
  if (uFlat > 0.5) { gl_FragColor = vec4(uColor, uCov); return; }
  if (uCov <= 0.0005) { gl_FragColor = vec4(0.0); return; }
  vec2 q = (vUv - uCenter) * vec2(uAspect, 1.0) / uScale;
  float fib = fibres(q * 1.3);
  float d = length(q) * (1.0 + 0.32 * (bfbm(q * 2.6) - 0.5)) - 0.09 * (bfbm(q * 9.0) - 0.5);
  float c = clamp(uCov, 0.0, 1.0);
  // the front's radius (screen heights) from the area it should cover: uCov ~ the inked fraction of the screen
  // (0.4 at the hand-over from the sheet), opening up toward the corners at the end
  float R = sqrt(c * uAspect / 3.14159) * (1.0 + 0.4 * c * c) + 0.01;
  float w = 0.012 + 0.02 * c;
  float body = smoothstep(R + w, R - w, d);
  // fibres carry diluted ink ahead of the blot: thin, feathery, lighter tendrils that fade with their length
  float reach = fib * 0.075 * (0.4 + 0.6 * smoothstep(0.0, 0.3, c));
  float tendril = smoothstep(R + reach + w, R + w * 0.5, d) * step(0.001, fib) * (1.0 - body) * 0.55;
  float field = d - reach;
  // islands: what is left of the white breaks up and shrinks, with fibrous, feathered edges (never a clean shape)
  float isl = bfbm(q * 3.2 + 11.0) + 0.12 * (fib - 0.5) + 0.05 * (bn(q * 40.0) - 0.5);
  float it = mix(0.95, 0.22, smoothstep(0.45, 1.0, c));          // threshold: rises as coverage climbs
  float islandInk = smoothstep(it + 0.035, it - 0.035, isl) * smoothstep(0.42, 0.55, c) * smoothstep(R + 0.45, R - 0.1, field);
  float a = max(max(body, islandInk), tendril);
  a = mix(a, 1.0, smoothstep(0.93, 1.0, c));                     // the last specks go: a clean ink ground at the end
  // colour: deep core behind the front, the ink body, a pale damp halo just ahead
  float depth = smoothstep(R - 0.02, R - 0.35, field);
  vec3 col = mix(uColor, uDeep, 0.55 * depth * (1.0 - smoothstep(0.85, 1.0, c)));
  col = mix(col, uColor, smoothstep(0.9, 1.0, c));               // the final ground is exactly the token
  float halo = (1.0 - a) * smoothstep(R + 0.12, R + w, field) * (1.0 - c) * 0.22;
  gl_FragColor = vec4(mix(uHalo, col, a / max(a + halo, 1e-4)), clamp(a + halo, 0.0, 1.0));
}`;

const srgb = (hex) => { const c = new THREE.Color(); c.setStyle(hex, THREE.SRGBColorSpace); const o = {}; c.getRGB(o, THREE.SRGBColorSpace); return new THREE.Vector3(o.r, o.g, o.b); };

/**
 * @param {object} o ink / inkDeep (hex, the ground the page ends on and the core), halo (hex), seed, scale (1: the
 *   blot's size relative to the screen height), center ([x, y] uv, where the drop touched)
 * @returns {{ scene, camera, mesh, material, active: boolean, setColors(ink, deep) }}
 */
export function createBleed({ ink = '#1F1B6E', inkDeep = '#120F45', halo = '#C9CCE6', seed = 3.1, scale = 1, center = [0.5, 0.5] } = {}) {
  const material = new THREE.ShaderMaterial({
    transparent: true, depthTest: false, depthWrite: false, toneMapped: false,
    uniforms: {
      uCov: { value: 0 }, uAspect: { value: 1.6 }, uCenter: { value: new THREE.Vector2(...center) },
      uColor: { value: srgb(ink) }, uDeep: { value: srgb(inkDeep) }, uHalo: { value: srgb(halo) },
      uFlat: { value: 0 }, uSeed: { value: seed }, uScale: { value: scale },
    },
    vertexShader: /* glsl */`varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
    fragmentShader: FRAG,
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 2, 0, 0, 2], 2));
  const mesh = new THREE.Mesh(g, material); mesh.frustumCulled = false; mesh.renderOrder = 999;
  const scene = new THREE.Scene(); scene.add(mesh);
  const camera = new THREE.Camera();
  return {
    scene, camera, mesh, material,
    get active() { return material.uniforms.uCov.value > 0.0005; },
    setColors(inkHex, deepHex) { if (inkHex) material.uniforms.uColor.value.copy(srgb(inkHex)); if (deepHex) material.uniforms.uDeep.value.copy(srgb(deepHex)); },
    dispose() { g.dispose(); material.dispose(); },
  };
}
