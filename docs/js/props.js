// props.js: the few scene objects that are not the sheet: the fit-width "4.99 g" type plane (s04), the drying
// line and its clips (s04), the ink drop (s07) and the screen-space Bleed (s07, the signature transition).
// All positions are set each frame by choreo.js in screen space (see scene.js: screenToWorld).
import * as THREE from 'three';

const GRAPHITE = '#2A2926';

/** A text plane drawn into a canvas (the numerals). Redraw after fonts load. */
export function createTypePlane(text, { font = '"Hanken Grotesk", "Helvetica Neue", Arial, sans-serif', weight = 300 } = {}) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: true, alphaTest: 0.02, toneMapped: false, opacity: 1 });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
  mesh.name = 'prop.numerals'; mesh.renderOrder = 1; mesh.visible = false;
  const plane = { mesh, aspect: 3, draw };
  function draw() {
    const fs = 420;
    ctx.font = `${weight} ${fs}px ${font}`;
    const m = ctx.measureText(text);
    const asc = m.actualBoundingBoxAscent || fs * 0.72, desc = m.actualBoundingBoxDescent || fs * 0.2;
    const left = m.actualBoundingBoxLeft || 0, right = m.actualBoundingBoxRight || m.width;
    const w = Math.ceil(left + right) + 8, h = Math.ceil(asc + desc) + 8;
    canvas.width = w; canvas.height = h;
    ctx.font = `${weight} ${fs}px ${font}`;
    ctx.fillStyle = GRAPHITE;
    ctx.textBaseline = 'alphabetic';
    if ('letterSpacing' in ctx) ctx.letterSpacing = `${-0.035 * fs}px`;
    ctx.fillText(text, left + 4, asc + 4);
    texture.needsUpdate = true;
    plane.aspect = w / h;
  }
  draw();
  return plane;
}

/** The drying line: a thin graphite cord and minimalist spring clips. */
export function createDryingLine(count = 8) {
  const group = new THREE.Group(); group.name = 'prop.line'; group.visible = false;
  const mat = new THREE.MeshStandardMaterial({ color: GRAPHITE, roughness: 0.55, metalness: 0.1 });
  const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.0006, 0.0006, 1, 8, 1), mat);
  cord.rotation.z = Math.PI / 2;
  group.add(cord);
  const clipGeo = new THREE.BoxGeometry(0.018, 0.026, 0.004);
  const clips = [];
  for (let i = 0; i < count; i++) {
    const c = new THREE.Mesh(clipGeo, mat);
    c.visible = false; group.add(c); clips.push(c);
  }
  return { group, cord, clips, material: mat };
}

/** The ink drop: a small, slightly elongated glossy droplet. */
export function createDrop() {
  const m = new THREE.MeshPhysicalMaterial({ color: '#2E2A8E', roughness: 0.12, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.08 });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.0022, 24, 16), m);
  mesh.name = 'prop.drop'; mesh.visible = false;
  return mesh;
}

/** The Bleed: a screen-space ragged ink front (fibre-guided noise), drawn over the scene. coverage 0..1. */
export function createBleed() {
  const material = new THREE.ShaderMaterial({
    transparent: true, depthTest: false, depthWrite: false, toneMapped: false,
    uniforms: {
      uCov: { value: 0 }, uAspect: { value: 1.6 }, uCenter: { value: new THREE.Vector2(0.5, 0.5) },
      uColor: { value: new THREE.Vector3(0.180, 0.165, 0.557) },      // #2E2A8E, already in display space
      uFlat: { value: 0 }, uSeed: { value: 3.1 },
    },
    vertexShader: /* glsl */`varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
    fragmentShader: /* glsl */`
      precision highp float;
      varying vec2 vUv;
      uniform float uCov, uAspect, uFlat, uSeed; uniform vec2 uCenter; uniform vec3 uColor;
      float h(vec2 p){ p = fract(p * vec2(123.34, 456.21) + uSeed); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
        return mix(mix(h(i), h(i+vec2(1,0)), f.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), f.x), f.y); }
      float fbm(vec2 p){ float s = 0.0, a = 0.5; for (int i = 0; i < 5; i++){ s += a * n(p); p = p * 2.03 + 1.7; a *= 0.5; } return s; }
      void main(){
        if (uFlat > 0.5) { gl_FragColor = vec4(uColor, uCov); return; }
        vec2 q = (vUv - uCenter) * vec2(uAspect, 1.0);
        float d = length(q);
        // fibre streaks: anisotropic noise along a few directions = tendrils running ahead of the front
        vec2 r1 = mat2(0.94, -0.34, 0.34, 0.94) * q, r2 = mat2(0.5, 0.87, -0.87, 0.5) * q;
        float fib = max(fbm(r1 * vec2(26.0, 2.2)), fbm(r2 * vec2(24.0, 2.0)));
        float rag = fbm(q * 3.2) - 0.5;
        float field = d + rag * 0.42 - (fib - 0.55) * 0.34;
        float R = mix(-0.25, 1.75, uCov);
        float a = smoothstep(R + 0.025, R - 0.025, field);
        // islands: white areas left behind shrink with fibrous edges
        float isl = fbm(q * 5.0 + 11.0);
        a = max(a, smoothstep(0.62 - uCov * 0.7, 0.55 - uCov * 0.7, isl) * step(0.35, uCov));
        a *= step(0.001, uCov);
        gl_FragColor = vec4(uColor * (0.92 + 0.08 * fib), a);
      }`,
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 2, 0, 0, 2], 2));
  const mesh = new THREE.Mesh(g, material); mesh.frustumCulled = false;
  const scene = new THREE.Scene(); scene.add(mesh);
  const camera = new THREE.Camera();
  return { scene, camera, mesh, material, get active() { return material.uniforms.uCov.value > 0.001; } };
}
