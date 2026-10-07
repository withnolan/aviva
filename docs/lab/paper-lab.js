// paper-lab.js: look-dev sandbox for the aviva sheet. Every control is a URL parameter, so every state can be
// screenshotted headlessly:
//   node work/scripts/lab-shot.mjs --out work/screenshots/lab/x.png "http://localhost:8080/lab/paper.html?state=hero"
// or with tools/shoot.mjs --steps 0 --first-wait 6000. window.lab.apply('a=1&b=2') re-renders without a reload
// (used by work/scripts/paper-contact.mjs). window.__ready === true once the frame is final.
//
// Params (all optional; `state=` loads a bundle first, explicit params override it):
//   camera   cam=az,el,dist (deg, deg, m)  target=x,y,z  fov=30  dpr=1
//   sheet    pos=x,y,z  rot=rx,ry,rz (deg)  seg=w,h  tier=0|1|2
//   shape    bend=k axis=deg twist=rad/m flutter=m ffreq ftime cockle=m  plane=0..7 halving=0..2 sixfold=0..6
//            dogear=0..1 peel=0..1 curl=corner,t,r,deg  ecurl=edge,at,r,deg  fan=0..1  crumple=0..1  thick=mm
//            tear=p1,p2top,p2bottom  sep=0..1 (moves torn pieces apart)  crease=1 (remembered midline crease)
//   look     trans=0..1 wm=0..1 show=0..1 dot=0..1 bleed=0..1 grade=0..1 macro=0..1 gain=1 tooth=strength
//   paint    draw=demo|line|scribble  erase=1 (erase half, leaving the 12 % ghost)
//   light    light=name[,name2,w2]  key=lux env exp back=lux keydir=x,y,z keydist=m soft=pcf
//   studio   bg=#hex  floor=y|none  print=1 printw=m printz=m  contact=0|1  cop=contact,soft  ground=ink
//   misc     hud=1 (print params)  boat=1 moon=1 cord=1
import * as THREE from 'three';
import { createPaperSystem, TOKENS } from '../js/paper/index.js';

const STATES = {
  flat: 'cam=-14,6,1.22&pos=0,0.5,0&rot=0,-14,0&bend=0.7&light=studio',
  front: 'cam=0,0,1.22&pos=0,0.5,0&light=studio',
  hero: 'cam=0,68,1.18&target=0,0,0.02&pos=0,0.0004,0&rot=-90,0,0&light=s01&print=1&printw=0.9&printz=0&show=0.16&cockle=0.0002',
  heroair: 'cam=0,68,1.18&target=0,0,0.02&pos=0,0.04,0&rot=-90,0,-8&light=s01&print=1&printw=0.9&printz=0&show=0.16&flutter=0.006&ftime=2',
  slope: 'cam=0,12,1.25&pos=0,0.5,0&rot=-35,0,0&light=s03',
  bend: 'cam=-18,10,1.25&pos=0,0.5,0&rot=0,-18,0&bend=1.6&light=s06',
  edge: 'cam=0,0,1.1&pos=0,0.5,0&rot=0,84,0&light=s02',
  edgeon: 'cam=0,0,1.1&pos=0,0.5,0&rot=0,90,0&light=s02',
  curl: 'cam=-10,20,1.25&pos=0,0.5,0&rot=-12,0,0&curl=br,1,0.02,60&light=card3',
  think: 'cam=0,12,1.25&pos=0,0.5,0&rot=-35,0,0&curl=tr,1,0.015,25&light=s03',
  dogear: 'cam=0,0,1.22&pos=0,0.5,0&rot=0,-12,0&dogear=1&light=s09',
  peel: 'cam=0,40,1.25&target=0,0.05,0&pos=0,0.0004,0&rot=-90,0,0&peel=0.45&light=s01&print=1&printw=0.9',
  plane: 'cam=35,22,0.95&pos=0,0.5,0&rot=-90,0,30&plane=7&light=card2',
  planestep: 'cam=0,30,1.1&pos=0,0.5,0&rot=-60,0,0&plane=3.5&light=studio',
  halving: 'cam=0,25,1.05&pos=0,0.45,0&rot=-30,0,0&halving=1.5&light=s05',
  halved: 'cam=0,25,0.9&pos=0,0.45,0&rot=-30,0,0&halving=2&light=s05',
  fan: 'cam=0,8,0.9&pos=0,0.5,0&rot=0,0,180&fan=1&light=card6',
  pleat: 'cam=20,25,1.1&pos=0,0.5,0&rot=-30,0,0&fan=0.5&light=card6',
  crumple: 'cam=20,25,0.55&pos=0,0.4,0&crumple=1&light=studio',
  crumpling: 'cam=20,25,0.75&pos=0,0.4,0&crumple=0.55&light=studio',
  tear: 'cam=0,0,1.22&pos=0,0.5,0&tear=0.6,0,0&light=s05',
  torn: 'cam=0,0,1.22&pos=0,0.5,0&tear=1,0,0&sep=1&light=s05',
  quarters: 'cam=0,0,1.22&pos=0,0.5,0&tear=1,1,1&sep=1&light=s05',
  tearback: 'cam=0,0,1.22&pos=0,0.5,0&tear=1,0,0&sep=0.3&light=backlit&trans=0.3',
  backlit: 'cam=0,0,1.22&pos=0,0.5,0&rot=0,-10,0&bend=1.2&light=card1',
  watermark: 'cam=0,0,1.22&pos=0,0.5,0&light=s06v2&wm=1',
  dot: 'cam=0,0,0.32&target=0.06,0.38,0&pos=0,0.5,0&dot=1&light=studio',
  inkglow: 'cam=0,0,1.25&pos=0,0.5,0&dot=1&light=s08&ground=ink',
  macro: 'cam=0,8,0.022&target=0,0.5,0&pos=0,0.5,0&fov=22&light=s07&macro=1',
  macro3: 'cam=0,8,0.03&target=0,0.5,0&pos=0,0.5,0&fov=22&light=s07&macro=1',
  bleed: 'cam=0,0,0.03&target=0,0.5,0&pos=0,0.5,0&fov=22&light=s07&macro=1&bleed=0.45&grade=1',
  pencil: 'cam=0,12,0.6&target=0,0.5,0&pos=0,0.5,0&rot=-35,0,0&light=s03&draw=demo',
  pencilmacro: 'cam=0,10,0.09&target=0,0.535,0&pos=0,0.5,0&light=raking&draw=demo',
  eraser: 'cam=0,12,0.6&target=0,0.5,0&pos=0,0.5,0&rot=-35,0,0&light=s03&draw=demo&erase=1',
  line: 'cam=0,12,0.75&target=0,0.5,0&pos=0,0.5,0&rot=-35,0,0&light=s03&draw=line',
  sixfold: 'cam=30,35,0.25&target=-0.09,0.43,0&pos=0,0.5,0&rot=-90,0,0&sixfold=6&thick=0.1&light=studio',
};

/* ------------------------------------------------------------------ params */
let P = new URLSearchParams(location.search);
function resolve(search) {
  const q = new URLSearchParams(search);
  const st = q.get('state');
  const out = new URLSearchParams(st && STATES[st] ? STATES[st] : STATES.flat);
  for (const [k, v] of q) out.set(k, v);
  return out;
}
const num = (k, d) => (P.has(k) && P.get(k) !== '' ? parseFloat(P.get(k)) : d);
const vec = (k, d) => (P.has(k) ? P.get(k).split(',').map(Number) : d);
const str = (k, d) => (P.has(k) ? P.get(k) : d);
const rad = THREE.MathUtils.degToRad;

/* ------------------------------------------------------------------ renderer + system */
const canvas = document.getElementById('c');
P = resolve(location.search);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance', preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, num('dpr', 2)));
renderer.setSize(innerWidth, innerHeight, false);
if (document.fonts && document.fonts.ready) { try { await Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1500))]); } catch {} }

const t0 = performance.now();
const paper = await createPaperSystem(renderer, { tier: num('tier', 2) });
const scene = new THREE.Scene();
paper.install(scene);
const camera = new THREE.PerspectiveCamera(30, innerWidth / innerHeight, 0.005, 60);
const sheet = paper.createSheet({ segments: P.has('seg') ? vec('seg') : null, name: 'hero' });
scene.add(sheet.object);
await paper.loadFloorPrint('../assets/logo/wordmark-floor.png').then((ok) => ok && console.log('[lab] using wordmark-floor.png'));
const genMs = performance.now() - t0;

let paint = null;
async function ensurePaint() { if (!paint) { paint = await paper.createPaint(); sheet.attachPaint(paint); } return paint; }

/* ------------------------------------------------------------------ apply */
async function apply(search) {
  if (search !== undefined) P = resolve(search);
  window.__ready = false;
  const T = new THREE.Vector3(...vec('target', [0, 0.5, 0]));
  const [az, el, dist] = vec('cam', [0, 0, 1.22]);
  camera.fov = num('fov', 30); camera.aspect = innerWidth / innerHeight; camera.near = Math.max(0.002, dist * 0.05); camera.far = 60; camera.updateProjectionMatrix();
  camera.position.set(T.x + dist * Math.sin(rad(az)) * Math.cos(rad(el)), T.y + dist * Math.sin(rad(el)), T.z + dist * Math.cos(rad(az)) * Math.cos(rad(el)));
  camera.lookAt(T);

  // studio
  const ground = str('ground', 'studio');
  paper.setColors({ studio: P.has('bg') ? str('bg') : (ground === 'ink' ? TOKENS.ink : TOKENS.studio) });
  document.documentElement.style.setProperty('--studio', P.has('bg') ? str('bg') : (ground === 'ink' ? TOKENS.ink : TOKENS.studio));
  const floor = str('floor', '0');
  paper.backdrop.visible = floor !== 'none';
  paper.contact.enabled = num('contact', 1) > 0 && floor !== 'none';
  paper.setFloorPrint({ center: [num('printx', 0), num('printz', 0)], width: num('printw', 0.96), visible: num('print', 0) > 0 });

  // sheet transform + state
  sheet.object.position.set(...vec('pos', [0, 0.5, 0]));
  const r = vec('rot', [0, 0, 0]); sheet.object.rotation.set(rad(r[0]), rad(r[1]), rad(r[2]));
  const curl = P.has('curl') ? (() => { const [c, t, rr, a] = str('curl').split(','); return { corner: c, t: +t, r: +rr, angle: rad(+a) }; })()
    : P.has('ecurl') ? (() => { const [e, at, rr, a] = str('ecurl').split(','); return { edge: e, at: +at, r: +rr, angle: rad(+a) }; })() : null;
  const tear = P.has('tear') ? (() => { const [p1, a, b] = vec('tear'); return { p1, p2: [a || 0, b || 0] }; })() : null;
  const bleedT = num('bleed', 0);
  if (num('macro', 0) > 0 || bleedT > 0) paper.ensureMacro();
  if (bleedT > 0) paper.ensureFibreGeo();
  paper.shared.uToothP.value.y = num('tooth', 1.3);
  sheet.reset();
  sheet.set({
    bend: num('bend', 0), bendAxis: rad(num('axis', 90)), twist: num('twist', 0),
    flutter: num('flutter', 0), flutterFreq: num('ffreq', 9), flutterTime: num('ftime', 0), cockle: num('cockle', 0.00045),
    plane: num('plane', 0), halving: num('halving', 0), sixfold: num('sixfold', 0), dogEar: num('dogear', 0), peel: num('peel', 0), curl,
    fan: num('fan', 0), crumple: num('crumple', 0), thickness: num('thick', 0.1) / 1000,
    translucency: num('trans', 0.24), watermark: num('wm', 0), showThrough: num('show', 0), inkDot: num('dot', 0),
    bleed: bleedT > 0 || num('grade', 0) > 0 ? { t: bleedT, at: [0, 0], radiusMM: num('bleedr', 6), amount: bleedT > 0 ? 1 : 0, grade: num('grade', 0) } : null,
    macro: num('macro', 0), gain: num('gain', 1), tear,
    creases: num('crease', 0) > 0 ? [{ n: [0, 1], d: 0, strength: num('crease', 1) }] : null,
  });
  // torn pieces apart
  const sep = num('sep', 0);
  if (tear && sep > 0) {
    for (const p of sheet.pieces) {
      const [cx, cy] = p.center, len = Math.hypot(cx, cy) || 1;
      p.object.position.set(cx + (cx / len) * 0.03 * sep, cy + (cy / len) * 0.03 * sep, 0);
      p.object.rotation.z = (p.key.includes('L') ? 1 : p.key.includes('R') ? -1 : (p.key === 'T' ? -1 : 1)) * 0.06 * sep;
    }
  }
  // paint
  const draw = str('draw', '');
  if (draw) { const pl = await ensurePaint(); pl.clear(); demoStroke(pl, draw); if (num('erase', 0) > 0) demoErase(pl); pl.flush(); sheet.set({ paint: true }); }
  else if (paint) sheet.set({ paint: false });

  // lights
  const lp = str('light', 'studio').split(',');
  paper.lights.set(lp.length >= 3 ? [[lp[0], 1 - +lp[2]], [lp[1], +lp[2]]] : lp[0]);
  const L = paper.lights.state = JSON.parse(JSON.stringify(paper.lights.state, (k, v) => (v && v.isVector3 ? { __v: [v.x, v.y, v.z] } : v && v.isColor ? '#' + v.getHexString() : v)), (k, v) => (v && v.__v ? new THREE.Vector3(...v.__v) : v));
  if (P.has('key')) L.key.intensity = num('key');
  if (P.has('keydir')) L.key.dir = new THREE.Vector3(...vec('keydir')).normalize();
  if (P.has('keydist')) L.key.dist = num('keydist');
  if (P.has('soft')) L.key.softness = num('soft');
  if (P.has('shadow')) L.key.shadow = num('shadow');
  if (P.has('back')) L.back.intensity = num('back');
  if (P.has('env')) L.env = num('env');
  if (P.has('exp')) L.exposure = num('exp');
  if (P.has('cop')) { const [a, b] = vec('cop'); L.contact = { contact: a, soft: b }; }
  paper.lights.aim(new THREE.Vector3(...vec('aim', vec('pos', [0, 0.5, 0]))));

  // render: a couple of frames (contact shadow, async crumple / textures)
  if (num('crumple', 0) > 0) { await paper.loadCrumple(); sheet.set({ crumple: num('crumple', 0) }); }
  for (let i = 0; i < 3; i++) { frame(); await new Promise((r) => requestAnimationFrame(r)); }
  const info = renderer.info;
  window.__info = { calls: info.render.calls, tris: info.render.triangles, geometries: info.memory.geometries, textures: info.memory.textures, programs: info.programs ? info.programs.length : 0, genMs: Math.round(genMs), sysMs: Math.round(paper.genMs), seg: sheet.segments, px: +(sheet.pixelSize * 1000).toFixed(3) };
  document.getElementById('hud').textContent = num('hud', 0) ? decodeURIComponent(P.toString()).replace(/&/g, '  ') : '';
  window.__ready = true;
}

const dbgScene = new THREE.Scene(), dbgCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
const dbgMat = new THREE.ShaderMaterial({ uniforms: { t: { value: null }, mode: { value: 0 }, rep: { value: 1 } }, depthTest: false,
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
  fragmentShader: `precision highp float; varying vec2 vUv; uniform sampler2D t; uniform int mode; uniform float rep;
  void main(){ vec4 c = texture2D(t, vUv * rep); vec3 o;
    if (mode == 0) { vec3 n = normalize(vec3(c.rg * 2.0 - 1.0, 0.35)); o = vec3(0.5 + 0.5 * dot(n, normalize(vec3(-0.7, 0.5, 0.5)))); }   // normal, lit
    else if (mode == 1) o = vec3(c.b); else if (mode == 2) o = vec3(c.a); else if (mode == 3) o = vec3(c.r); else o = c.rgb;
    gl_FragColor = vec4(o, 1.0); }` });
dbgScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), dbgMat));
function frame() {
  const dbg = str('debug', '');
  if (dbg) {
    const [name, mode, rep] = dbg.split(',');
    if (name === 'macro' || name === 'geo') paper.ensureMacro();
    if (name === 'geo') paper.ensureFibreGeo();
    dbgMat.uniforms.t.value = { tooth: paper.textures.tooth, macro: paper.textures.macro, formation: paper.textures.formation, geo: paper.textures.fibreGeo, watermark: paper.textures.watermark, print: paper.shared.uFloorPrint.value }[name];
    dbgMat.uniforms.mode.value = +(mode || 0); dbgMat.uniforms.rep.value = +(rep || 1);
    const tm = renderer.toneMapping; renderer.toneMapping = THREE.NoToneMapping; renderer.render(dbgScene, dbgCam); renderer.toneMapping = tm; return;
  }
  paper.update(scene, camera, 1 / 60);
  renderer.info.reset();
  renderer.render(scene, camera);
}

/* ------------------------------------------------------------------ demo strokes */
function demoStroke(pl, kind) {
  if (kind === 'line') { pl.strokeFromPath(pl.constructor.handwritingPath({ seed: 3 }), { x: 0.16, y: 0.62, width: 0.68 }); return; }
  let t = 0; const S = (pts, dt) => { pl.begin(pts[0][0], pts[0][1], t); for (let i = 1; i < pts.length; i++) { t += dt; pl.move(pts[i][0], pts[i][1], t); } pl.end(); t += 300; };
  const sp = []; for (let i = 0; i < 170; i++) { const a = i * 0.17, rr = 0.008 + i * 0.0015; sp.push([0.5 + rr * Math.cos(a), 0.7 + rr * Math.sin(a) * 0.72]); } S(sp, 9);
  const wv = []; for (let i = 0; i < 130; i++) wv.push([0.16 + i * 0.0053, 0.42 + Math.sin(i * 0.23) * 0.012]); S(wv, 15);
  const sc = []; for (let i = 0; i < 90; i++) sc.push([0.3 + (i % 2) * 0.24 + Math.sin(i) * 0.012, 0.27 - i * 0.0016]); S(sc, 4);
}
function demoErase(pl) { pl.setTool('eraser'); let t = 1e5; const pts = []; for (let i = 0; i < 60; i++) pts.push([0.22 + (i % 2) * 0.62, 0.5 + 0.35 * (i / 60) - 0.05]); pl.begin(pts[0][0], pts[0][1], t); for (const p of pts.slice(1)) { t += 30; pl.move(p[0], p[1], t); } pl.end(); pl.setTool('pencil'); }

/* ------------------------------------------------------------------ keys (interactive use) */
const help = document.getElementById('help');
help.textContent = 'paper lab  ·  [ ] state  ·  arrows orbit  ·  - = zoom  ·  l light  ·  h hud';
const names = Object.keys(STATES); let si = Math.max(0, names.indexOf(P.get('state') || 'flat'));
const lightNames = ['studio', 's01', 's02', 's03', 's05', 's06', 's06v2', 's07', 's08', 's09', 's10', 's12', 's14', 'card1', 'card2', 'card3', 'card4', 'card5', 'card6', 'card7', 'card8', 'backlit', 'raking'];
addEventListener('keydown', (e) => {
  const q = new URLSearchParams(P); let [az, el, d] = vec('cam', [0, 0, 1.22]);
  if (e.key === ']' || e.key === '[') { si = (si + (e.key === ']' ? 1 : names.length - 1)) % names.length; history.replaceState(null, '', '?state=' + names[si]); apply('?state=' + names[si]); return; }
  if (e.key === 'ArrowLeft') az -= 5; else if (e.key === 'ArrowRight') az += 5; else if (e.key === 'ArrowUp') el += 5; else if (e.key === 'ArrowDown') el -= 5;
  else if (e.key === '-') d *= 1.1; else if (e.key === '=') d /= 1.1;
  else if (e.key === 'l') { const i = (lightNames.indexOf(q.get('light') || 'studio') + 1) % lightNames.length; q.set('light', lightNames[i]); }
  else if (e.key === 'h') q.set('hud', num('hud', 0) ? '0' : '1');
  else return;
  q.set('cam', [az, el, d.toFixed(4)].join(',')); history.replaceState(null, '', '?' + q.toString()); apply('?' + q.toString());
});
addEventListener('resize', () => { renderer.setSize(innerWidth, innerHeight, false); apply(); });

window.lab = { apply, paper, sheet, scene, camera, renderer, STATES };
await apply();
