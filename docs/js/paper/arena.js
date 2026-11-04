// arena.js: the s10 arena (brief 5.12, 11.1 row s10, T15) on the ink ground: a satin ink stage, two graphite lecterns
// with paper-white A / B panels and a small easel each (where the two sheets stand for the vote), two warm spotlights
// with soft additive light cones, and the split-flap board's graphite housing above centre.
//
//   const arena = system.createArena({ demoSheets: false });
//   scene.add(arena.object);                   // origin: the stage floor at centre; +z toward the audience / camera
//   arena.easels.A / .B                        // { position, quaternion }: where sheet A / B stands (bottom-edge centre)
//   arena.setSpot('A', k)                      // a spotlight's cone and pool, 0..1 (the vote: the winner's spot up)
//   arena.boardWindow                          // { center, width, height } (arena space): the window the DOM board fills
//   arena.crowd                                // { left, right }: x ranges and the tier heights kept clear for T16's cranes
//
// Cost: stage 1, lecterns 2 + panels 2, easels 1, cones 2, pools 2, board housing 1.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const clean = (g) => { const n = g.index ? g.toNonIndexed() : g; for (const k of Object.keys(n.attributes)) if (!['position', 'normal', 'uv'].includes(k)) n.deleteAttribute(k); return n; };
const box = (w, h, d, x, y, z) => clean(new THREE.BoxGeometry(w, h, d).translate(x, y, z));
export const ARENA = { lecternX: 0.34, lectern: { w: 0.2, h: 0.32, d: 0.14 }, board: { y: 0.98, w: 0.46, h: 0.16 }, spotY: 1.3 };
function roundedBox(w, h, d, r, x = 0, y = 0, z = 0) {
  const b = Math.min(r, w / 2 - 1e-5, h / 2 - 1e-5, d / 2 - 1e-5), sh = new THREE.Shape(), x0 = -w / 2 + b, y0 = -h / 2 + b, x1 = w / 2 - b, y1 = h / 2 - b, c = b * 0.6;
  sh.moveTo(x0 + c, y0); sh.lineTo(x1 - c, y0); sh.quadraticCurveTo(x1, y0, x1, y0 + c); sh.lineTo(x1, y1 - c); sh.quadraticCurveTo(x1, y1, x1 - c, y1);
  sh.lineTo(x0 + c, y1); sh.quadraticCurveTo(x0, y1, x0, y1 - c); sh.lineTo(x0, y0 + c); sh.quadraticCurveTo(x0, y0, x0 + c, y0);
  const g = new THREE.ExtrudeGeometry(sh, { depth: d - 2 * b, bevelEnabled: true, bevelThickness: b, bevelSize: b * 0.9, bevelSegments: 3, curveSegments: 4 });
  return clean(g.translate(x, y, z - d / 2 + b));
}
// the backdrop: a deep ink radial gradient (#1F1B6E -> #120F45 -> near-black), a soft vignette and a faint haze band
const BACK_FRAG = `varying vec2 vUv; float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
void main(){ vec2 p = (vUv - vec2(0.5, 0.58)) * vec2(1.7, 1.0); float r = length(p);
  vec3 ink = vec3(0.0137, 0.0116, 0.157), deep = vec3(0.0063, 0.0052, 0.06), black = vec3(0.0015, 0.0013, 0.008);
  vec3 c = mix(ink, deep, smoothstep(0.05, 0.42, r)); c = mix(c, black, smoothstep(0.38, 0.85, r));
  c += vec3(0.02, 0.018, 0.05) * exp(-pow((vUv.y - 0.36) / 0.09, 2.0)) * (1.0 - smoothstep(0.2, 0.7, abs(vUv.x - 0.5)));   // haze above the stage
  c *= 0.97 + 0.06 * h(floor(gl_FragCoord.xy));
  gl_FragColor = vec4(c, 1.0); }`;

function panelTexture(letter) {
  // an engraved plate: paper-white enamel, a hairline border, the letter in Hanken Grotesk Light
  const c = document.createElement('canvas'); c.width = 320; c.height = 256; const x = c.getContext('2d');
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  const draw = () => {
    x.fillStyle = '#efede7'; x.fillRect(0, 0, 320, 256);
    x.strokeStyle = 'rgba(42,41,38,0.55)'; x.lineWidth = 2; x.strokeRect(14, 14, 292, 228);
    x.fillStyle = '#2A2926'; x.font = '300 150px "Hanken Grotesk", Arial, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(letter, 160, 136);
    x.font = '500 16px "Hanken Grotesk", Arial, sans-serif'; x.fillText('AVIVA A4', 160, 222); t.needsUpdate = true;
  };
  draw();
  try {
    const url = new URL('../../assets/fonts/hanken-grotesk-var-latin.woff2', import.meta.url).href;
    if (!document.fonts.check('300 100px "Hanken Grotesk"')) new FontFace('Hanken Grotesk', `url(${url})`, { weight: '300 500' }).load().then((f) => { document.fonts.add(f); draw(); }).catch(() => {});
  } catch { /* keep the fallback face */ }
  return t;
}
// a soft volumetric light cone: brightest on its axis and near the lamp, fading toward its rim and the floor
const CONE_VERT = 'varying vec3 vL; varying vec3 vN; varying vec3 vV; void main(){ vL = position; vec4 w = modelMatrix * vec4(position, 1.0); vN = normalize(mat3(modelMatrix) * normal); vV = normalize(cameraPosition - w.xyz); gl_Position = projectionMatrix * viewMatrix * w; }';
const CONE_FRAG = `uniform vec3 uColor; uniform float uK; uniform float uH; varying vec3 vL; varying vec3 vN; varying vec3 vV;
float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
void main(){ float along = clamp((uH * 0.5 - vL.y) / uH, 0.0, 1.0);           // 0 at the lamp .. 1 at the floor
  float rim = pow(abs(dot(normalize(vN), normalize(vV))), 1.6);                 // soft at the silhouette (volume look)
  float a = rim * (1.0 - along) * (0.35 + 0.65 * (1.0 - along)) * uK;
  a *= 0.94 + 0.12 * h(floor(gl_FragCoord.xy));                                  // a fine dither: no banding (#48)
  gl_FragColor = vec4(uColor * a, 1.0); }`;

export class Arena {
  constructor(sys, { demoSheets = false } = {}) {
    this.sys = sys; this.object = new THREE.Group(); this.object.name = 'paper.arena';
    const A = ARENA, L = A.lectern;
    const M = this.materials = {
      stage: new THREE.MeshPhysicalMaterial({ color: '#06051a', roughness: 0.22, metalness: 0.0, specularIntensity: 0.12, envMapIntensity: 0.0, transparent: true, opacity: 0.93 }),
      graphite: new THREE.MeshPhysicalMaterial({ color: '#2a2b30', roughness: 0.38, metalness: 0.15, clearcoat: 0.5, clearcoatRoughness: 0.25, envMapIntensity: 0.5 }),
      matte: new THREE.MeshPhysicalMaterial({ color: '#232428', roughness: 0.82, metalness: 0.05, envMapIntensity: 0.3 }),
      brass: new THREE.MeshPhysicalMaterial({ color: '#d4b06a', metalness: 1, roughness: 0.22, envMapIntensity: 1.2 }),
      mirror: new THREE.MeshBasicMaterial({ color: '#141238' }),
    };
    // the stage: a low satin platform with a bevelled lip, the ink floor reflecting the spots
    const back = new THREE.Mesh(new THREE.PlaneGeometry(7, 3.6), new THREE.ShaderMaterial({ vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }', fragmentShader: BACK_FRAG, depthWrite: false }));
    back.position.set(0, 1.2, -1.6); back.renderOrder = -10; this.object.add(back); this.backdrop = back;
    // the stage: a satin ink platform with bevelled edges and a brass nosing; slightly see-through over a dark
    // mirrored copy of the set (a cheap, soft reflection of the lecterns)
    this.stage = new THREE.Mesh(roundedBox(2.4, 0.04, 1.1, 0.008, 0, -0.02, 0), M.stage); this.stage.receiveShadow = true;
    const nosing = new THREE.Mesh(box(2.38, 0.004, 0.004, 0, -0.004, 0.552), M.brass);
    this.mirror = new THREE.Group(); this.mirror.scale.y = -1; this.mirror.position.y = -0.002;
    const pit = new THREE.Mesh(new THREE.PlaneGeometry(9, 6).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#04030c' }));
    pit.position.y = -0.045; this.object.add(pit);
    this.object.add(this.mirror, this.stage, nosing);
    this.easels = {}; this.spots = {}; this.panels = {};
    for (const [key, sx] of [['A', -1], ['B', 1]]) {
      const x = sx * A.lecternX, g = new THREE.Group(); g.position.set(x, 0, 0); g.rotation.y = -sx * 0.12;   // turned a touch toward centre
      // the lectern: a tapered graphite body, a top shelf, a paper-white front panel with its letter
      const body = new THREE.Mesh(mergeGeometries([roundedBox(L.w, L.h, L.d, 0.008, 0, L.h / 2, 0), roundedBox(L.w + 0.03, 0.014, L.d + 0.03, 0.005, 0, L.h + 0.007, 0), roundedBox(L.w + 0.02, 0.016, L.d + 0.02, 0.005, 0, 0.008, 0)]), M.graphite);
      const trim = new THREE.Mesh(mergeGeometries([box(L.w + 0.032, 0.003, L.d + 0.032, 0, L.h + 0.0005, 0), box(L.w + 0.022, 0.003, L.d + 0.022, 0, 0.0165, 0)]), M.brass);
      const plate = new THREE.Mesh(roundedBox(L.w * 0.5, L.h * 0.34, 0.003, 0.0012, 0, L.h * 0.58, L.d / 2 + 0.0015), M.brass);
      const panel = new THREE.Mesh(new THREE.PlaneGeometry(L.w * 0.46, L.h * 0.3), new THREE.MeshPhysicalMaterial({ map: panelTexture(key), roughness: 0.45, metalness: 0.0, clearcoat: 0.6 }));
      panel.position.set(0, L.h * 0.58, L.d / 2 + 0.0032); g.add(trim, plate);
      // a small brass easel on the shelf: two legs and a ledge; the sheet stands on the ledge, leaning back 12 deg
      const top = L.h + 0.014, easel = new THREE.Mesh(mergeGeometries([
        clean(new THREE.BoxGeometry(0.006, 0.2, 0.006).translate(0, 0.1, 0).rotateX(-0.21).translate(-0.07, top, -0.01)),
        clean(new THREE.BoxGeometry(0.006, 0.2, 0.006).translate(0, 0.1, 0).rotateX(-0.21).translate(0.07, top, -0.01)),
        box(0.17, 0.008, 0.02, 0, top + 0.012, 0.02)]), M.brass);
      g.add(body, panel, easel); this.object.add(g);
      const mg = g.clone(true); mg.traverse((o) => { if (o.isMesh) { o.material = M.mirror; o.castShadow = false; } }); this.mirror.add(mg);
      body.castShadow = body.receiveShadow = easel.castShadow = true;
      const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.21, -sx * 0.12, 0, 'YXZ'));
      this.easels[key] = { position: new THREE.Vector3(x, top + 0.017, 0.022), quaternion: q };
      this.panels[key] = panel;
      // its spotlight: a soft cone from high above, and a warm pool on the stage
      const H = A.spotY - 0.02, cone = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.19, H, 48, 1, true),
        new THREE.ShaderMaterial({ uniforms: { uColor: { value: new THREE.Color(1.0, 0.93, 0.8) }, uK: { value: 0.55 }, uH: { value: H } }, vertexShader: CONE_VERT, fragmentShader: CONE_FRAG,
          transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
      cone.position.set(x, H / 2 + 0.02, 0.02); cone.renderOrder = 5;
      const pc = document.createElement('canvas'); pc.width = pc.height = 128; const px = pc.getContext('2d'), gr = px.createRadialGradient(64, 64, 4, 64, 64, 62);
      gr.addColorStop(0, 'rgba(255,225,180,0.9)'); gr.addColorStop(0.6, 'rgba(255,215,160,0.35)'); gr.addColorStop(1, 'rgba(255,210,150,0)'); px.fillStyle = gr; px.fillRect(0, 0, 128, 128);
      const pool = new THREE.Mesh(new THREE.PlaneGeometry(0.75, 0.6).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(pc), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.5 }));
      pool.position.set(x, 0.0015, 0.04);
      const gc = document.createElement('canvas'); gc.width = gc.height = 128; const gx = gc.getContext('2d'), gg = gx.createRadialGradient(64, 64, 0, 64, 64, 64);
      gg.addColorStop(0, 'rgba(255,248,232,1)'); gg.addColorStop(0.12, 'rgba(255,236,205,0.8)'); gg.addColorStop(0.4, 'rgba(255,220,180,0.18)'); gg.addColorStop(1, 'rgba(255,210,170,0)'); gx.fillStyle = gg; gx.fillRect(0, 0, 128, 128);
      const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(gc), blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
      glow.scale.set(0.22, 0.22, 1); glow.position.set(x, A.spotY - 0.01, 0.02); glow.renderOrder = 6;
      const lamp = new THREE.Mesh(roundedBox(0.05, 0.05, 0.07, 0.006, x, A.spotY + 0.03, 0.02), M.matte);
      this.object.add(cone, pool, glow, lamp); this.spots[key] = { cone, pool, glow };
    }
    // the split-flap board's housing above centre: a graphite frame with a recessed black window for the DOM board
    const B = A.board, fr = 0.03;
    this.board = new THREE.Mesh(mergeGeometries([box(B.w + 2 * fr, fr, 0.06, 0, B.y + B.h / 2 + fr / 2, -0.25), box(B.w + 2 * fr, fr, 0.06, 0, B.y - B.h / 2 - fr / 2, -0.25),
      box(fr, B.h, 0.06, -B.w / 2 - fr / 2, B.y, -0.25), box(fr, B.h, 0.06, B.w / 2 + fr / 2, B.y, -0.25), box(B.w, B.h, 0.01, 0, B.y, -0.275),
      box(0.006, 0.7, 0.006, -B.w / 2 + 0.05, B.y + 0.45, -0.25), box(0.006, 0.7, 0.006, B.w / 2 - 0.05, B.y + 0.45, -0.25)]), M.matte);
    const bz = 0.003, bezel = new THREE.Mesh(mergeGeometries([box(B.w + bz * 2, bz, 0.004, 0, B.y + B.h / 2 + bz / 2, -0.219), box(B.w + bz * 2, bz, 0.004, 0, B.y - B.h / 2 - bz / 2, -0.219),
      box(bz, B.h, 0.004, -B.w / 2 - bz / 2, B.y, -0.219), box(bz, B.h, 0.004, B.w / 2 + bz / 2, B.y, -0.219)]), M.brass);
    this.object.add(this.board, bezel);
    this.boardWindow = { center: new THREE.Vector3(0, B.y, -0.268), width: B.w, height: B.h };
    this.crowd = { left: [-1.2, -0.62], right: [0.62, 1.2], tiers: [0.05, 0.16, 0.27, 0.38, 0.49], z: [-0.45, -0.05] };
    if (demoSheets) {
      for (const k of ['A', 'B']) { const s = sys.createSheet({ name: 'arena' + k }); const E = this.easels[k]; s.object.quaternion.copy(E.quaternion); s.object.position.copy(E.position).add(new THREE.Vector3(0, 0.1485, 0).applyQuaternion(E.quaternion)); this.object.add(s.object); }
    }
  }
  /** a spotlight's strength 0..1 (cone and pool) */
  setSpot(key, k) { const S = this.spots[key]; if (S) { S.cone.material.uniforms.uK.value = 0.55 * k; S.pool.material.opacity = 0.38 * k; S.glow.material.opacity = k; S.cone.visible = S.pool.visible = S.glow.visible = k > 0.002; } return this; }
  dispose() { this.object.traverse((o) => { if (o.isMesh) { o.geometry.dispose(); if (o.material.map) o.material.map.dispose(); o.material.dispose(); } }); this.object.removeFromParent(); }
}
