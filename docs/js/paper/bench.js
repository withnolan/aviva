// bench.js: the s02 metrology bench (brief 5.12, 11.1 row s02, T7): a polished black granite surface plate, a digital
// outside micrometer in its stand, and a 10-sheet stack, lit for a premium product still on the charcoal ground.
//
//   const bench = system.createBench();                 // { object, granite, micrometer, stack, focus, frame(), dispose() }
//   scene.add(bench.object);
//   // the bench's frame: origin = the bottom-edge centre of the floating hero sheet in its edge-on pose (s02 1.6-2.2 vh),
//   // x right, y up, z toward the camera (put it under the sheet with the camera's yaw)
//   bench.micrometer.set({ open: 0.0125, slide: 0 });    // open: the anvil-spindle gap (m, 0.0001 = closed on the sheet,
//                                                        //   0.025 max); slide 0 = parked 12 cm toward the camera, 1 = on
//                                                        //   the sheet's edge (slide in only once the sheet is edge-on)
//   bench.micrometer.setReadout('12.500');               // the LCD (grey, dark segments), e.g. counting down to '0.100'
//   bench.stack.set({ count: 10 });                      // the 10-sheet stack (1.0 mm), flat on the granite
//   const cam = bench.frame(aspect);                     // the s02 framing in bench space: { position, target, fov, focus }
//   // bench.focus = { readout, edge } (bench space): the rack-focus targets for T8 (1.6 vh readout -> 2.2 vh edge)
//
// Cost: granite 1 draw call (procedural speckle, no textures but a small AO canvas), micrometer 4 (enamel frame + stand +
// LCD housing, LCD face, fixed chrome, moving chrome), the stack 2 (its block and top sheet); every prop casts the key's
// shadow. One extra PMREM (128 px faces) at creation: a cool overhead soft box and a left strip for the metal and stone.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export const BENCH = {
  plate: { w: 1.25, d: 0.75, h: 0.1, front: 0.36 },   // the surface plate (m); its front edge this far in front of the sheet
  axisY: 0.022,          // the measuring axis, above the sheet's bottom edge (the micrometer holds the sheet up)
  micZ: 0.085,           // the micrometer's frame plane: 20 mm behind the sheet's front edge (z = +0.105)
  parkZ: 0.12,           // slide 0: parked this much further toward the camera, clear of the turning sheet
  stack: { x: -0.29, z: 0.03, rot: -0.14 },
  colors: { enamel: '#34373b', housing: '#26282b', stand: '#3b3e42', button: '#17181a', chrome: '#d9dbdd', granite: '#0f1012' },
};
// the granite's top, below the sheet's bottom edge: the stand's base + the frame's bow below the axis
const STAND_BASE = 0.022, BOW_OUT = 0.040, CLAMP = 0.006;
export const BENCH_TOP_Y = BENCH.axisY - BOW_OUT - CLAMP - STAND_BASE;     // -0.046

/* ------------------------------------------------------------------ the bench's own light probe */
function benchEnvironment(renderer) {
  const s = new THREE.Scene();
  const room = new THREE.Mesh(new THREE.BoxGeometry(20, 12, 20), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.018, 0.019, 0.021), side: THREE.BackSide }));
  room.position.y = 4; s.add(room);
  const box = (w, h, pos, k, tint) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(tint[0] * k, tint[1] * k, tint[2] * k), side: THREE.DoubleSide }));
    m.position.set(...pos); m.lookAt(0, 0, 0); s.add(m);
  };
  box(7, 5, [0, 8, 1.2], 7.5, [0.94, 0.97, 1]);        // the cool overhead soft box (~5600 K), a little in front
  box(1.2, 7, [-8, 2.2, -1.5], 5.5, [0.92, 0.95, 1]);  // the left strip: the rim on the sheet's edge and the chrome
  box(1.0, 6, [7.5, 2.5, 2.5], 1.4, [1, 0.98, 0.95]);  // a faint warm strip right (keeps the chrome's right side alive)
  box(10, 2, [0, 0.6, 9], 0.35, [1, 1, 1]);             // a low card in front, very dim: the granite's front glint
  const pm = new THREE.PMREMGenerator(renderer);
  const rt = pm.fromScene(s, 0.02);
  s.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
  pm.dispose();
  return rt;
}

/* ------------------------------------------------------------------ geometry helpers */
function roundedRectShape(x0, y0, x1, y1, r) {
  const s = new THREE.Shape();
  s.moveTo(x0 + r, y0); s.lineTo(x1 - r, y0); s.quadraticCurveTo(x1, y0, x1, y0 + r);
  s.lineTo(x1, y1 - r); s.quadraticCurveTo(x1, y1, x1 - r, y1); s.lineTo(x0 + r, y1); s.quadraticCurveTo(x0, y1, x0, y1 - r);
  s.lineTo(x0, y0 + r); s.quadraticCurveTo(x0, y0, x0 + r, y0);
  return s;
}
/** a box with rounded edges: extrude a rounded rectangle (x, y) through z with a bevel */
function roundedBox(x0, y0, z0, x1, y1, z1, r, bevel = r * 0.6) {
  const g = new THREE.ExtrudeGeometry(roundedRectShape(x0 + bevel, y0 + bevel, x1 - bevel, y1 - bevel, Math.max(0.0002, r - bevel)),
    { depth: Math.max(0.0001, z1 - z0 - 2 * bevel), bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 3, curveSegments: 6 });
  g.translate(0, 0, z0 + bevel);
  return g;
}
const tint = (g, hex) => {
  const c = new THREE.Color(hex), n = g.attributes.position.count, a = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { a[i * 3] = c.r; a[i * 3 + 1] = c.g; a[i * 3 + 2] = c.b; }
  g.setAttribute('color', new THREE.BufferAttribute(a, 3)); return g;
};
const clean = (g) => { const n = g.index ? g.toNonIndexed() : g; for (const k of Object.keys(n.attributes)) if (!['position', 'normal', 'uv', 'color'].includes(k)) n.deleteAttribute(k); if (!n.attributes.uv) n.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(n.attributes.position.count * 2), 2)); return n; };
/** a cylinder along +x from x0 to x1; knurl > 0: that many axial ridges (radius +-knurl) between kx0 and kx1 */
function rod(x0, x1, r, { seg = 48, knurl = 0, ridges = 96, kx0 = x0, kx1 = x1, cap = true } = {}) {
  const g = new THREE.CylinderGeometry(r, r, x1 - x0, knurl ? ridges * 2 : seg, knurl ? 8 : 1, !cap);
  if (knurl) {
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), z = p.getZ(i), y = p.getY(i) + (x1 - x0) / 2 + x0, rr = Math.hypot(x, z);
      if (rr < 1e-6 || y < kx0 - 1e-6 || y > kx1 + 1e-6) continue;
      const a = Math.atan2(z, x), tooth = Math.abs(((a / (2 * Math.PI)) * ridges) % 1 - 0.5) * 2;    // 0..1 triangle wave
      const k = (r + knurl * (tooth * 2 - 1)) / rr; p.setX(i, x * k); p.setZ(i, z * k);
    }
    g.computeVertexNormals();
  }
  g.rotateZ(-Math.PI / 2); g.translate((x0 + x1) / 2, 0, 0);
  return g;
}

/* ------------------------------------------------------------------ the micrometer */
// Local frame: origin at the contact point on the measuring axis, the axis along +x (anvil -x, spindle +x), the
// C-frame in the XY plane with its bow down, its front face toward +z. A 0-25 mm digital outside micrometer.
function frameShape() {
  const s = new THREE.Shape();
  s.moveTo(-0.030, 0.0105); s.lineTo(-0.030, -0.014);
  s.bezierCurveTo(-0.030, -0.034, -0.012, -0.0405, 0.007, -0.0405);          // the bow (outer)
  s.bezierCurveTo(0.028, -0.0405, 0.044, -0.034, 0.044, -0.014);
  s.lineTo(0.044, 0.003); s.quadraticCurveTo(0.044, 0.0125, 0.0345, 0.0125); s.lineTo(0.0255, 0.0125);  // the spindle boss
  s.lineTo(0.0255, -0.009);
  s.bezierCurveTo(0.0255, -0.022, 0.018, -0.026, 0.009, -0.026);             // the throat (inner)
  s.bezierCurveTo(-0.001, -0.026, -0.0075, -0.022, -0.0075, -0.009);
  s.lineTo(-0.0075, 0.0105); s.lineTo(-0.030, 0.0105);
  return s;
}

function makeLcdCanvas() {
  const c = document.createElement('canvas'); c.width = 320; c.height = 128;
  return c;
}
// seven-segment digits, slanted 6 deg; segments a b c d e f g
const SEG = { 0: 'abcdef', 1: 'bc', 2: 'abdeg', 3: 'abcdg', 4: 'bcfg', 5: 'acdfg', 6: 'acdefg', 7: 'abc', 8: 'abcdefg', 9: 'abcdfg', '-': 'g', ' ': '' };
function drawLcd(c, text) {
  const x = c.getContext('2d'), W = c.width, H = c.height;
  const bg = x.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#b4b9ac'); bg.addColorStop(1, '#a4aa9c');
  x.fillStyle = bg; x.fillRect(0, 0, W, H);
  const dw = 44, dh = 82, th = 9, gap = 12, top = 22, slant = 0.1;
  const chars = String(text).replace(/[^0-9.\- ]/g, '');
  const digits = [], dots = [];
  for (const ch of chars) { if (ch === '.') { dots.push(digits.length - 1); continue; } digits.push(ch); }
  const n = Math.max(digits.length, 1), x0 = W - 58 - n * (dw + gap);
  const seg = (ox, name, on) => {
    const L = ox, R = ox + dw, T = top, M = top + dh / 2, B = top + dh, sk = (y) => (B - y) * slant;
    const pts = {
      a: [[L + th, T], [R - th, T], [R - th * 1.5, T + th], [L + th * 1.5, T + th]],
      d: [[L + th * 1.5, B - th], [R - th * 1.5, B - th], [R - th, B], [L + th, B]],
      g: [[L + th, M - th / 2], [R - th, M - th / 2], [R - th * 0.6, M], [R - th, M + th / 2], [L + th, M + th / 2], [L + th * 0.6, M]],
      f: [[L, T + th], [L + th, T + th * 1.5], [L + th, M - th], [L, M - th / 2]],
      b: [[R - th, T + th * 1.5], [R, T + th], [R, M - th / 2], [R - th, M - th]],
      e: [[L, M + th / 2], [L + th, M + th], [L + th, B - th * 1.5], [L, B - th]],
      c: [[R - th, M + th], [R, M + th / 2], [R, B - th], [R - th, B - th * 1.5]],
    }[name];
    x.beginPath(); pts.forEach(([px, py], k) => (k ? x.lineTo(px + sk(py), py) : x.moveTo(px + sk(py), py))); x.closePath();
    x.fillStyle = on ? '#1d201c' : 'rgba(40, 46, 38, 0.07)'; x.fill();
  };
  digits.forEach((d, i) => { const ox = x0 + i * (dw + gap); for (const sname of 'abcdefg') seg(ox, sname, (SEG[d] || '').includes(sname)); });
  for (const i of dots) { x.fillStyle = '#1d201c'; x.fillRect(x0 + i * (dw + gap) + dw + 2, top + dh - th, th, th); }
  x.fillStyle = '#1d201c'; x.font = '600 20px "Hanken Grotesk", Arial, sans-serif'; x.textBaseline = 'alphabetic';
  x.fillText('mm', W - 50, top + dh); x.font = '600 14px "Hanken Grotesk", Arial, sans-serif'; x.fillText('INC', 14, 22);
}

function buildMicrometer(env) {
  const C = BENCH.colors, group = new THREE.Group(); group.name = 'bench.micrometer';
  // enamel: the C-frame, the stand (base + clamp), the LCD housing and its buttons (vertex colours, ONE draw call)
  const frame = new THREE.ExtrudeGeometry(frameShape(), { depth: 0.0076, bevelEnabled: true, bevelThickness: 0.0012, bevelSize: 0.0011, bevelSegments: 3, curveSegments: 18 });
  frame.translate(0, 0, -0.005);
  const base = roundedBox(-0.046, -BOW_OUT - CLAMP - STAND_BASE, -0.036, 0.062, -BOW_OUT - CLAMP, 0.036, 0.004);
  const clamp = roundedBox(-0.004, -BOW_OUT - CLAMP - 0.001, -0.0105, 0.018, -BOW_OUT + 0.009, 0.0105, 0.0025);
  const housing = roundedBox(0.017, -0.037, 0.0035, 0.053, -0.008, 0.0125, 0.003);
  const btn = (x) => rod(-0.0011, 0.0011, 0.0029, { seg: 24 }).rotateY(-Math.PI / 2).translate(x, -0.0315, 0.0136);
  const enamel = mergeGeometries([tint(clean(frame), C.enamel), tint(clean(base), C.stand), tint(clean(clamp), C.stand), tint(clean(housing), C.housing), tint(clean(btn(0.027)), C.button), tint(clean(btn(0.043)), C.button)]);
  const enamelMat = new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: 0.38, metalness: 0.08, clearcoat: 0.55, clearcoatRoughness: 0.22, envMap: env, envMapIntensity: 1 });
  const enamelMesh = new THREE.Mesh(enamel, enamelMat); enamelMesh.name = 'bench.micrometer.enamel';
  // the LCD face: reflective grey, dark segments (a canvas, redrawn by setReadout)
  const lcdCanvas = makeLcdCanvas(); drawLcd(lcdCanvas, '0.100');
  const lcdTex = new THREE.CanvasTexture(lcdCanvas); lcdTex.colorSpace = THREE.SRGBColorSpace; lcdTex.anisotropy = 8;
  const lcd = new THREE.Mesh(new THREE.PlaneGeometry(0.0285, 0.0114), new THREE.MeshPhysicalMaterial({ map: lcdTex, roughness: 0.5, clearcoat: 1, clearcoatRoughness: 0.04, envMap: env, envMapIntensity: 0.8 }));
  lcd.position.set(0.035, -0.0205, 0.01261); lcd.name = 'bench.micrometer.lcd';
  // fixed chrome: the anvil and the sleeve (with its index line, cut as a shallow groove)
  const chromeMat = new THREE.MeshPhysicalMaterial({ color: C.chrome, metalness: 1, roughness: 0.2, envMap: env, envMapIntensity: 1.25 });
  const fixed = mergeGeometries([clean(rod(-0.0076, -0.00005, 0.00318, { seg: 40 })), clean(rod(0.0436, 0.0805, 0.0091, { seg: 64 })), clean(rod(0.0436, 0.0465, 0.0102, { seg: 64 }))]);
  const fixedMesh = new THREE.Mesh(fixed, chromeMat); fixedMesh.name = 'bench.micrometer.chrome';
  // moving chrome (the spindle, the thimble with its knurl and graduated bevel, the ratchet): slides with `open`
  const moving = mergeGeometries([
    clean(rod(0.0, 0.03, 0.00318, { seg: 40 })),                                    // the spindle (its face at x = 0)
    clean(rod(0.0745, 0.081, 0.0098, { seg: 64 })),                                 // the thimble's graduated bevel
    clean(rod(0.081, 0.1185, 0.0101, { knurl: 0.00028, ridges: 110, kx0: 0.093, kx1: 0.1185 })),
    clean(rod(0.1185, 0.1205, 0.0072, { seg: 48 })),
    clean(rod(0.1205, 0.1345, 0.0062, { knurl: 0.00022, ridges: 60 })),             // the ratchet stop
  ]);
  const movingMesh = new THREE.Mesh(moving, chromeMat); movingMesh.name = 'bench.micrometer.spindle';
  const movingGroup = new THREE.Group(); movingGroup.add(movingMesh);
  group.add(enamelMesh, lcd, fixedMesh, movingGroup);
  group.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  lcd.castShadow = false;
  const state = { open: 0.0125, slide: 1, readout: '0.100' };
  const api = {
    object: group, state,
    /** { open (m, gap between the faces: 0.0001 closed on the 0.1 mm sheet .. 0.025), slide (0 parked .. 1 on the sheet) } */
    set({ open = state.open, slide = state.slide } = {}) {
      state.open = Math.min(0.025, Math.max(0.0001, open)); state.slide = Math.min(1, Math.max(0, slide));
      movingGroup.position.x = -0.00005 + state.open;
      // the thimble turns 360 deg per 0.5 mm of travel
      movingMesh.rotation.x = -(state.open / 0.0005) * Math.PI * 2;
      group.position.set(0, BENCH.axisY, BENCH.micZ + BENCH.parkZ * (1 - state.slide));
      return api;
    },
    /** the LCD's digits (e.g. '12.500' ... '0.100'); cheap: one 320 x 128 canvas upload */
    setReadout(text) { if (text === state.readout) return api; state.readout = text; drawLcd(lcdCanvas, text); lcdTex.needsUpdate = true; return api; },
    meshes: { enamel: enamelMesh, lcd, chrome: fixedMesh, spindle: movingMesh },
    dispose() { for (const m of [enamelMesh, lcd, fixedMesh, movingMesh]) { m.geometry.dispose(); m.material.dispose(); } lcdTex.dispose(); },
  };
  return api.set({});
}

/* ------------------------------------------------------------------ the granite */
const GRANITE_PARS = /* glsl */`
varying vec3 vGObj; varying vec3 vGN;
uniform sampler2D uGAO; uniform vec4 uGAORect; uniform vec2 uGMicOff;
float gH(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
vec2 gH2(vec2 p) { return fract(sin(vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)))) * 43758.5453); }
// cellular grains: x = distance to the nearest grain centre, y = that grain's random id, z = the border (F2 - F1)
vec3 gCell(vec2 p) {
  vec2 i = floor(p), f = fract(p); float d1 = 8.0, d2 = 8.0, id = 0.0;
  for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) {
    vec2 g = vec2(float(x), float(y)), o = gH2(i + g) * 0.85 + 0.075, r = g + o - f; float d = dot(r, r);
    if (d < d1) { d2 = d1; d1 = d; id = gH(i + g + 17.0); } else if (d < d2) d2 = d;
  }
  return vec3(sqrt(d1), id, sqrt(d2) - sqrt(d1));
}
`;
// the granite's albedo / roughness / glint from its mineral grains, on the face's plane (mm units), band-limited
const GRANITE_FRAG = /* glsl */`
  vec3 an = abs(vGN);
  vec2 gp = (an.y > 0.5 ? vGObj.xz : (an.x > 0.5 ? vGObj.zy : vGObj.xy)) * 1000.0;      // mm
  float px = max(length(fwidth(gp)), 1e-4);                                                 // mm per pixel
  vec3 c1 = gCell(gp / 0.95), c2 = gCell(gp / 0.38 + 31.0);
  float fel = step(0.93, c1.y), qtz = step(0.80, c1.y) * (1.0 - fel), mica = step(0.75, c2.y) * step(c2.y, 0.79);
  vec3 alb = vec3(0.022, 0.023, 0.025) * (0.75 + 0.5 * c2.y);                             // black pyroxene / biotite
  alb = mix(alb, vec3(0.30, 0.31, 0.32) * (0.75 + 0.45 * gH(vec2(c1.y * 91.0))), fel);    // feldspar flecks
  alb = mix(alb, vec3(0.085, 0.088, 0.092), qtz);                                          // glassy grey quartz
  // grains finer than ~2 px average out (no shimmer): fade to the stone's mean colour
  float band = smoothstep(0.35, 1.2, px / 0.95);
  alb = mix(alb, vec3(0.042, 0.043, 0.046), band);
  diffuseColor.rgb = alb;
  float gRough = mix(mix(0.2, 0.14, qtz), 0.07, mica * (1.0 - band));
  // the bench's contact occlusion (stack, the micrometer's stand), top face only
  float gao = 1.0;
  if (an.y > 0.5 && vGN.y > 0.0) {
    vec2 auv = (vGObj.xz - uGAORect.xy) / uGAORect.zw;
    vec4 aoS = texture2D(uGAO, auv), aoM = texture2D(uGAO, auv - uGMicOff / uGAORect.zw);
    gao = (1.0 - aoS.r) * (1.0 - aoM.g);
  }
  diffuseColor.rgb *= gao;
`;

function aoCanvas(rect) {
  // R: the stack's footprint (static), G: the micrometer stand's (moves with the slide); white = occluded
  const c = document.createElement('canvas'); c.width = 1024; c.height = 640;
  const x = c.getContext('2d'), sx = c.width / rect.z, sy = c.height / rect.w, P = (wx, wz) => [(wx - rect.x) * sx, (wz - rect.y) * sy];
  x.fillStyle = '#000'; x.fillRect(0, 0, c.width, c.height);
  x.globalCompositeOperation = 'lighter';
  // the stack: a thin dark seam all round its footprint (a 1 mm slab barely occludes beyond its edge)
  const S = BENCH.stack; x.save(); x.translate(...P(S.x, S.z)); x.rotate(-S.rot);
  x.filter = 'blur(3px)'; x.strokeStyle = 'rgba(210, 0, 0, 1)'; x.lineWidth = 5; x.strokeRect(-0.105 * sx, -0.1485 * sy, 0.21 * sx, 0.297 * sy); x.restore();
  // the stand base: a soft occlusion around and under it
  x.save(); x.translate(...P(0.008, BENCH.micZ)); x.filter = 'blur(10px)'; x.fillStyle = 'rgba(0, 190, 0, 1)';
  x.fillRect(-0.056 * sx, -0.038 * sy, 0.114 * sx, 0.076 * sy); x.restore();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.NoColorSpace; t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
  return t;
}

function buildGranite(env) {
  const P = BENCH.plate, top = BENCH_TOP_Y;
  const g = roundedBox(-P.w / 2, top - P.h, P.front - P.d, P.w / 2, top, P.front, 0.006, 0.003);
  // ExtrudeGeometry builds along z: reorder so the rounded rectangle is the plate's front profile (x, y) and z its depth
  const rect = new THREE.Vector4(-0.5, P.front - P.d, 1.0, P.d * (640 / 1024) / (P.d / 1.0) * P.d / P.d);
  rect.set(-0.5, -0.32, 1.0, 0.625);                     // the AO canvas covers x -0.5..0.5, z -0.32..0.305 (1024 x 640)
  const ao = aoCanvas(rect);
  const mat = new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: 0.2, metalness: 0, clearcoat: 0.65, clearcoatRoughness: 0.09, envMap: env, envMapIntensity: 1, specularIntensity: 0.7 });
  const U = { uGAO: { value: ao }, uGAORect: { value: rect }, uGMicOff: { value: new THREE.Vector2(0, 0) } };
  mat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, U);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vGObj; varying vec3 vGN;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvGObj = position; vGN = normal;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\n' + GRANITE_PARS)
      .replace('#include <color_fragment>', '#include <color_fragment>\n' + GRANITE_FRAG)
      .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\nroughnessFactor = gRough;');
  };
  mat.customProgramCacheKey = () => 'aviva-granite-v1';
  const mesh = new THREE.Mesh(g, mat); mesh.name = 'bench.granite'; mesh.receiveShadow = true; mesh.castShadow = false;
  return { mesh, uniforms: U };
}

/* ------------------------------------------------------------------ the bench */
export class Bench {
  constructor(sys, { stackCount = 10 } = {}) {
    this.sys = sys;
    this.env = benchEnvironment(sys.renderer);
    this.object = new THREE.Group(); this.object.name = 'paper.bench';
    const G = buildGranite(this.env.texture);
    this.granite = G.mesh; this._gU = G.uniforms; this.object.add(this.granite);
    this.micrometer = buildMicrometer(this.env.texture); this.object.add(this.micrometer.object);
    const mset = this.micrometer.set;
    this.micrometer.set = (o) => { mset(o); this._gU.uGMicOff.value.set(0, BENCH.parkZ * (1 - this.micrometer.state.slide)); return this.micrometer; };
    this.micrometer.set({});
    // the 10-sheet stack, flat on the granite
    this.stack = sys.createStack({ max: Math.max(stackCount, 10), fly: 0 });
    this.stack.set({ count: stackCount });
    const S = BENCH.stack; this.stack.object.position.set(S.x, BENCH_TOP_Y + 0.00002, S.z); this.stack.object.rotation.y = S.rot;
    this.object.add(this.stack.object);
    /** rack-focus targets in bench space (T8): the LCD readout and the sheet's front edge at the measuring height */
    this.focus = { readout: new THREE.Vector3(0.035, BENCH.axisY - 0.0205, BENCH.micZ + 0.0126), edge: new THREE.Vector3(0, BENCH.axisY + 0.1, 0.105) };
  }
  /** the s02 framing in bench space (the sheet at (50 %, 50 %), 52 vh% tall, a level camera; brief 2B s02 1.6-2.2 vh) */
  frame(aspect = 1.6, { sizeVh = 52, fov = 30 } = {}) {
    const d = 0.297 / ((sizeVh / 100) * 2 * Math.tan(THREE.MathUtils.degToRad(fov / 2)));
    return { position: new THREE.Vector3(0, 0.1485, d), target: new THREE.Vector3(0, 0.1485, 0), fov, dist: d, focus: this.focus };
  }
  dispose() {
    this.granite.geometry.dispose(); this.granite.material.dispose(); this._gU.uGAO.value.dispose();
    this.micrometer.dispose(); this.stack.dispose && this.stack.dispose(); this.env.dispose(); this.object.removeFromParent();
  }
}
