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
  const m = new THREE.MeshPhysicalMaterial({ color: '#1F1B6E', roughness: 0.12, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.08 });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.0022, 24, 16), m);
  mesh.name = 'prop.drop'; mesh.visible = false;
  return mesh;
}

/**
 * The s07 pipette (T14): a glass dropper at real size (m), its tip at the origin pointing down (−y), its axis up (+y):
 * a 1 mm capillary tip, a taper to a 7 mm barrel, a graphite rubber bulb. The glass is a cheap fresnel shader (dark
 * refracting edges, a soft key streak, almost clear across the middle: how glass reads over white paper); a column of
 * ink stands in the capillary under a concave meniscus. Only the lower 40 mm or so is ever in the macro frame.
 *   pipette.group (place it: tip position, camera's quaternion); pipette.setInk(level 0..1)
 */
export function createPipette() {
  const group = new THREE.Group(); group.name = 'prop.pipette'; group.visible = false;
  // outer profile (radius, height), from the tip up: a short capillary, the taper, the 7 mm barrel (in frame above it)
  const OUT = [[0.0007, 0], [0.0008, 0.0006], [0.0009, 0.004], [0.0012, 0.007], [0.0022, 0.011], [0.0032, 0.015], [0.0036, 0.019], [0.0036, 0.085]];
  const glassGeo = new THREE.LatheGeometry(OUT.map(([r, y]) => new THREE.Vector2(r, y)), 40);
  const glass = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, side: THREE.DoubleSide,
    uniforms: { uEdge: { value: new THREE.Color('#3c4350') }, uTint: { value: new THREE.Color('#e9eef2') } },
    vertexShader: /* glsl */`varying vec3 vN; varying vec3 vV;
      void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); vV = -mv.xyz; vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: /* glsl */`uniform vec3 uEdge, uTint; varying vec3 vN; varying vec3 vV;
      void main(){
        vec3 n = normalize(vN), v = normalize(vV);
        float f = 1.0 - abs(dot(n, v));                         // 0 facing the camera, 1 at the silhouette
        float edge = smoothstep(0.42, 0.96, f);                 // refraction darkens the walls seen edge-on (a few px wide)
        float streak = smoothstep(0.45, 0.7, -n.x) * (1.0 - smoothstep(0.78, 0.95, -n.x)) * (1.0 - edge);  // the key's streak (left)
        float lip = smoothstep(0.3, 0.55, n.x) * (1.0 - smoothstep(0.7, 0.9, n.x)) * 0.4;                 // a weaker one right
        vec3 col = mix(uTint, uEdge, edge * edge);
        col = mix(col, vec3(1.0), max(streak, lip));
        float a = 0.1 + 0.62 * edge + 0.6 * streak + 0.3 * lip;
        gl_FragColor = vec4(col, clamp(a, 0.0, 0.85));
      }`,
  });
  const tube = new THREE.Mesh(glassGeo, glass); tube.renderOrder = 3;
  // the ink in the capillary: a column inside the glass, topped by a concave meniscus
  const inkMat = new THREE.MeshPhysicalMaterial({ color: '#1F1B6E', roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.1 });
  const IN = [[0.0004, 0.0004], [0.00055, 0.004], [0.0008, 0.007], [0.0017, 0.0108]];   // the bore, up to the meniscus
  const ink = new THREE.Mesh(new THREE.LatheGeometry(IN.map(([r, y]) => new THREE.Vector2(r, y)), 24), inkMat);
  const men = new THREE.Mesh(new THREE.CircleGeometry(1, 24).rotateX(-Math.PI / 2), inkMat);   // the meniscus (scaled to the bore)
  const bead = new THREE.Mesh(new THREE.SphereGeometry(0.00048, 16, 10), inkMat);           // the ink at the very tip
  bead.position.y = 0.0001;
  // the rubber bulb: graphite, matte, a little sheen
  const BULB = [[0.0038, 0.082], [0.0046, 0.084], [0.0062, 0.092], [0.0066, 0.104], [0.0058, 0.114], [0.0036, 0.119], [0.0001, 0.1205]];
  const bulb = new THREE.Mesh(new THREE.LatheGeometry(BULB.map(([r, y]) => new THREE.Vector2(r, y)), 32),
    new THREE.MeshPhysicalMaterial({ color: GRAPHITE, roughness: 0.55, sheen: 0.4, sheenColor: new THREE.Color('#6b6a66') }));
  group.add(ink, men, bead, tube, bulb);
  const api = {
    group,
    /** ink column height 0..1 (1: full to the taper; it drops a little when the drop leaves) */
    setInk(level) {
      const y = 0.003 + 0.0078 * Math.max(0, Math.min(1, level));
      ink.scale.set(1, y / 0.0108, 1);
      let r = IN[IN.length - 1][0];                            // the bore's radius at the meniscus
      for (let i = 1; i < IN.length; i++) if (y <= IN[i][1]) { const [r0, y0] = IN[i - 1], [r1, y1] = IN[i]; r = r0 + ((r1 - r0) * (y - y0)) / (y1 - y0); break; }
      men.position.y = y - 0.00008; men.scale.setScalar(r * 0.97);
    },
  };
  api.setInk(1);
  return api;
}

/**
 * s08 (T34): the generations stage's floor: lit ink, not a flat wash. A wide plane under the row whose colour rises from
 * the ink token at its edges (it melts into the ink background) to a lighter, lit ink under the row. Not tone-mapped:
 * its edges are exactly the CSS ink ground.
 */
export function createInkFloor({ ink = '#1F1B6E', lit = '#2F2B8C', deep = '#1A165F' } = {}) {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 640;
  const x = c.getContext('2d');
  x.fillStyle = ink; x.fillRect(0, 0, c.width, c.height);
  const g = x.createRadialGradient(512, 430, 10, 512, 440, 400);           // the far edge (canvas top) stays the token
  g.addColorStop(0, lit); g.addColorStop(0.32, lit); g.addColorStop(0.62, ink); g.addColorStop(1, ink);
  x.fillStyle = g; x.fillRect(0, 0, c.width, c.height);
  const v = x.createLinearGradient(0, 640, 0, 380);           // the near edge falls a touch darker (a vignette toward the viewer)
  v.addColorStop(0, deep); v.addColorStop(1, 'rgba(26,22,95,0)');
  x.fillStyle = v; x.fillRect(0, 380, c.width, 260);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(7.2, 4.5).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: t, toneMapped: false }));
  mesh.position.set(0, -0.0008, -0.55); mesh.renderOrder = -2; mesh.name = 'prop.inkFloor';
  return mesh;
}

/** The Bleed: a screen-space ragged ink front (fibre-guided noise), drawn over the scene. coverage 0..1. */
export function createBleed() {
  const material = new THREE.ShaderMaterial({
    transparent: true, depthTest: false, depthWrite: false, toneMapped: false,
    uniforms: {
      uCov: { value: 0 }, uAspect: { value: 1.6 }, uCenter: { value: new THREE.Vector2(0.5, 0.5) },
      uColor: { value: new THREE.Vector3(0.122, 0.106, 0.431) },      // #1F1B6E, already in display space
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
