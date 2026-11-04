// weights.js: the s04 calibration-weights case (brief 5.12, 11.1 row s04, T12): eight weights that add up to the sheet's
// 4.99 g (2 + 2 g brass knob weights; 500, 200, 200, 50, 20, 20 mg nickel-silver leaf weights), in a fitted walnut case
// lined with graphite felt, its lid open; a pair of tweezers beside it.
//
//   const kase = system.createWeightsCase();      // { object, weights, tweezers, lid, total, setLid(a), dispose() }
//   scene.add(kase.object);                        // origin: the centre of the case's base, on the floor; +z = the front
//   kase.weights[i] = { name: '2 g', mg: 2000, object, home: { position, quaternion } }   // lift one out:
//   kase.weights[0].object.position.y += 0.03;     //   (home is its seat; restore it with .copy(home.position))
//   kase.setLid(1.75);                             // the lid's opening angle (rad; 0 shut)
//
// Cost: case + lid (1, walnut), felt (1), 8 weights (8, so each can move), tweezers (1).
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

function roundedBox(w, h, d, r, x = 0, y = 0, z = 0) {
  // a box with rounded, bevelled edges: a rounded rectangle (w x h) extruded through d with a bevel of r
  const b = Math.min(r, w / 2 - 1e-5, h / 2 - 1e-5, d / 2 - 1e-5), sh = new THREE.Shape(), x0 = -w / 2 + b, y0 = -h / 2 + b, x1 = w / 2 - b, y1 = h / 2 - b, c = b * 0.6;
  sh.moveTo(x0 + c, y0); sh.lineTo(x1 - c, y0); sh.quadraticCurveTo(x1, y0, x1, y0 + c); sh.lineTo(x1, y1 - c); sh.quadraticCurveTo(x1, y1, x1 - c, y1);
  sh.lineTo(x0 + c, y1); sh.quadraticCurveTo(x0, y1, x0, y1 - c); sh.lineTo(x0, y0 + c); sh.quadraticCurveTo(x0, y0, x0 + c, y0);
  const g = new THREE.ExtrudeGeometry(sh, { depth: d - 2 * b, bevelEnabled: true, bevelThickness: b, bevelSize: b * 0.9, bevelSegments: 3, curveSegments: 4 });
  g.translate(x, y, z - d / 2 + b); return clean2(g);
}
const clean2 = (g) => { const n = g.index ? g.toNonIndexed() : g; for (const k of Object.keys(n.attributes)) if (!['position', 'normal', 'uv'].includes(k)) n.deleteAttribute(k); return n; };
function walnutTexture() {
  // procedural walnut: wavy dark grain lines over a warm base, with pores; tiled along the case
  const c = document.createElement('canvas'); c.width = 512; c.height = 256; const x = c.getContext('2d');
  x.fillStyle = '#5a3a26'; x.fillRect(0, 0, 512, 256);
  for (let i = 0; i < 90; i++) {
    const y0 = Math.random() * 256, a = 3 + Math.random() * 9, f = 0.005 + Math.random() * 0.01, ph = Math.random() * 6;
    x.strokeStyle = `rgba(${30 + Math.random() * 30},${16 + Math.random() * 14},${8 + Math.random() * 8},${0.25 + Math.random() * 0.45})`;
    x.lineWidth = 0.6 + Math.random() * 2.4; x.beginPath();
    for (let px = 0; px <= 512; px += 8) { const py = y0 + Math.sin(px * f + ph) * a + Math.sin(px * f * 3.1 + ph) * a * 0.3; px ? x.lineTo(px, py) : x.moveTo(px, py); }
    x.stroke();
  }
  for (let i = 0; i < 1800; i++) { x.fillStyle = 'rgba(25,12,6,0.35)'; x.fillRect(Math.random() * 512, Math.random() * 256, 1.5, 0.6); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(9, 9); t.anisotropy = 8;
  return t;
}
function soft(canvasDraw, size = 128) { const c = document.createElement('canvas'); c.width = c.height = size; canvasDraw(c.getContext('2d'), size); const t = new THREE.CanvasTexture(c); return t; }
function stampTexture(text) {
  // the stamped mass on a leaf weight: a bump map (dark = pressed in), mapped over the leaf's face
  return soft((x, n) => { x.fillStyle = '#fff'; x.fillRect(0, 0, n, n); x.fillStyle = '#000'; x.font = `600 ${Math.round(n * 0.3)}px Arial, sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, n / 2, n * 0.48); x.font = `600 ${Math.round(n * 0.16)}px Arial, sans-serif`; x.fillText('mg', n / 2, n * 0.72); }, 128);
}

export const WEIGHTS = [
  { name: '2 g', mg: 2000, kind: 'knob' }, { name: '2 g', mg: 2000, kind: 'knob' },
  { name: '500 mg', mg: 500, kind: 'leaf', shape: 5, s: 0.0125 }, { name: '200 mg', mg: 200, kind: 'leaf', shape: 4, s: 0.0105 },
  { name: '200 mg', mg: 200, kind: 'leaf', shape: 4, s: 0.0105 }, { name: '50 mg', mg: 50, kind: 'leaf', shape: 5, s: 0.0082 },
  { name: '20 mg', mg: 20, kind: 'leaf', shape: 4, s: 0.0068 }, { name: '20 mg', mg: 20, kind: 'leaf', shape: 4, s: 0.0068 },
];
const CASE = { w: 0.13, d: 0.085, h: 0.024, wall: 0.008 };
const clean = (g) => { const n = g.index ? g.toNonIndexed() : g; for (const k of Object.keys(n.attributes)) if (!['position', 'normal', 'uv'].includes(k)) n.deleteAttribute(k); return n; };
const box = (w, h, d, x, y, z) => clean(new THREE.BoxGeometry(w, h, d).translate(x, y, z));

function knobGeometry() {
  // an OIML-style knob weight (2 g brass: ~6 mm across): body, neck and ball knob, turned on a lathe
  const pts = [[0, 0], [0.0031, 0], [0.0032, 0.0003], [0.0032, 0.0068], [0.0029, 0.0073], [0.0013, 0.0078], [0.0012, 0.0086],
    [0.0021, 0.0091], [0.0022, 0.0098], [0.0016, 0.0108], [0.0006, 0.0112], [0, 0.0113]].map(([r, y]) => new THREE.Vector2(r, y));
  return new THREE.LatheGeometry(pts, 40);
}
function leafGeometry(n, s) {
  // a flat leaf weight (polygon, 0.25 mm sheet) with one edge turned up as a tab for the tweezers
  const sh = new THREE.Shape(), r = s / 2;
  for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2 + Math.PI / 2 + (n === 4 ? Math.PI / 4 : 0); const p = [Math.cos(a) * r, Math.sin(a) * r]; i ? sh.lineTo(...p) : sh.moveTo(...p); }
  const plate = new THREE.ExtrudeGeometry(sh, { depth: 0.0001, bevelEnabled: true, bevelThickness: 0.00008, bevelSize: 0.00012, bevelSegments: 2 }).rotateX(-Math.PI / 2);
  const tab = new THREE.BoxGeometry(s * 0.45, 0.00025, 0.0022).rotateX(-0.9).translate(0, 0.0009, r * 0.82);
  return mergeGeometries([clean(plate), clean(tab)]);
}

export class WeightsCase {
  constructor(sys, { lid = 1.8 } = {}) {
    this.sys = sys;
    this.object = new THREE.Group(); this.object.name = 'paper.weights';
    const M = this.materials = {
      walnut: new THREE.MeshPhysicalMaterial({ map: walnutTexture(), color: '#ffffff', roughness: 0.48, clearcoat: 0.85, clearcoatRoughness: 0.12, envMapIntensity: 0.9 }),
      felt: new THREE.MeshPhysicalMaterial({ color: '#2a2b2f', roughness: 1, sheen: 1, sheenColor: new THREE.Color('#8c9099'), sheenRoughness: 0.45, envMapIntensity: 0.3 }),
      brass: new THREE.MeshPhysicalMaterial({ color: '#e0bd72', metalness: 1, roughness: 0.14, envMapIntensity: 1.8 }),
      nickel: new THREE.MeshPhysicalMaterial({ color: '#d6d7d2', metalness: 1, roughness: 0.2, envMapIntensity: 1.7 }),
      well: new THREE.MeshBasicMaterial({ color: '#000000', transparent: true, opacity: 0.55, depthWrite: false }),
      steel: new THREE.MeshPhysicalMaterial({ color: '#c3c7cc', metalness: 1, roughness: 0.3, anisotropy: 0.85, envMapIntensity: 1.5 }),
    };
    // a room probe for the metal and the varnish: real reflections whatever the section's environment
    const pm = new THREE.PMREMGenerator(sys.renderer); this.env = pm.fromScene(new RoomEnvironment(), 0.03); pm.dispose();
    for (const m of Object.values(M)) if (m.isMeshStandardMaterial) m.envMap = this.env.texture;
    const C = CASE, top = C.h;
    // the case: base and four walls (walnut), the felt bed sunk 6 mm below the rim
    const R = 0.0022, wood = mergeGeometries([roundedBox(C.w, 0.012, C.d, R, 0, 0.006, 0),
      roundedBox(C.w, C.h, C.wall, R, 0, C.h / 2, C.d / 2 - C.wall / 2), roundedBox(C.w, C.h, C.wall, R, 0, C.h / 2, -C.d / 2 + C.wall / 2),
      roundedBox(C.wall, C.h, C.d, R, C.w / 2 - C.wall / 2, C.h / 2, 0), roundedBox(C.wall, C.h, C.d, R, -C.w / 2 + C.wall / 2, C.h / 2, 0)]);
    this.case = new THREE.Mesh(wood, M.walnut);
    const bedY = top - 0.006;
    this.felt = new THREE.Mesh(box(C.w - 2 * C.wall, bedY - 0.012, C.d - 2 * C.wall, 0, (bedY + 0.012) / 2, 0), M.felt);
    // the lid, hinged on the back edge, felt inside
    this.lid = new THREE.Group(); this.lid.position.set(0, top, -C.d / 2);
    const lidWood = new THREE.Mesh(roundedBox(C.w, 0.01, C.d, 0.0022, 0, 0.005, C.d / 2), M.walnut);
    const lidFelt = new THREE.Mesh(box(C.w - 2 * C.wall, 0.001, C.d - 2 * C.wall, 0, -0.0004, C.d / 2), M.felt);
    this.lid.add(lidWood, lidFelt);
    // two brass hinges on the back edge
    const hinge = mergeGeometries([-1, 1].map((s) => clean(new THREE.CylinderGeometry(0.0022, 0.0022, 0.016, 16).rotateZ(Math.PI / 2).translate(s * 0.04, top + 0.0004, -C.d / 2 - 0.0012))));
    this.hinges = new THREE.Mesh(hinge, M.brass); this.object.add(this.hinges);
    this.object.add(this.case, this.felt, this.lid);
    // the eight weights in their seats: the knob weights in round wells at the left, the leaves in a row at the right
    const knob = knobGeometry(), seats = [[-0.04, -0.012], [-0.04, 0.016], [-0.008, -0.016], [0.016, -0.016], [0.04, -0.016], [-0.008, 0.016], [0.016, 0.016], [0.04, 0.016]];
    this.weights = WEIGHTS.map((W, i) => {
      const g = W.kind === 'knob' ? knob : leafGeometry(W.shape, W.s);
      let mat = W.kind === 'knob' ? M.brass : M.nickel;
      if (W.kind === 'leaf') {   // its stamped mass, pressed into the face (a bump map in the leaf's own shape coordinates)
        const t = stampTexture(String(W.mg)); t.repeat.set(1 / W.s, 1 / W.s); t.offset.set(0.5, 0.5); mat = M.nickel.clone(); mat.bumpMap = t; mat.bumpScale = 0.35; mat.roughness = 0.26;
      }
      const m = new THREE.Mesh(g, mat); m.name = 'weight.' + W.name;
      // its well: a weight-shaped recess in the felt (a soft dark AO pocket just above the bed)
      const wr = W.kind === 'knob' ? 0.0046 : W.s * 0.62;
      const well = new THREE.Mesh(new THREE.CircleGeometry(wr, W.kind === 'knob' ? 32 : W.shape).rotateX(-Math.PI / 2), M.well);
      if (W.kind === 'leaf') well.rotation.y = (i % 3 - 1) * 0.12 + (W.shape === 4 ? Math.PI / 4 : Math.PI / 2);
      well.position.set(seats[i][0], bedY + 0.00008, seats[i][1]); this.object.add(well);
      m.position.set(seats[i][0], bedY - (W.kind === 'knob' ? 0.0015 : -0.00012), seats[i][1]);
      if (W.kind === 'leaf') m.rotation.y = (i % 3 - 1) * 0.12;
      this.object.add(m);
      return { ...W, object: m, home: { position: m.position.clone(), quaternion: m.quaternion.clone() } };
    });
    this.total = this.weights.reduce((t, w) => t + w.mg, 0);   // 4990 mg
    // tweezers: two flat steel blades joined at the back, the tips nearly closed, lying beside the case
    // tweezers: two tapered, brushed blades joined at the back, their tips curved down and nearly touching
    const blade = (s) => {
      const sh = new THREE.Shape(); sh.moveTo(-0.055, -0.0032); sh.lineTo(0.035, -0.0022); sh.lineTo(0.05, -0.0007); sh.lineTo(0.05, 0.0007); sh.lineTo(0.035, 0.0022); sh.lineTo(-0.055, 0.0032); sh.lineTo(-0.055, -0.0032);
      const g = new THREE.ExtrudeGeometry(sh, { depth: 0.0006, bevelEnabled: true, bevelThickness: 0.00015, bevelSize: 0.0002, bevelSegments: 1 }).rotateX(-Math.PI / 2);
      const p = g.attributes.position;
      for (let i = 0; i < p.count; i++) { const x = p.getX(i), k = Math.max(0, (x - 0.03) / 0.02); p.setY(i, p.getY(i) - 0.0018 * k * k + 0.0016 * Math.max(0, (x + 0.05) / 0.085) * (1 - k)); p.setZ(i, p.getZ(i) + s * (0.0042 * Math.max(0, 1 - (x + 0.055) / 0.105))); }
      g.computeVertexNormals(); return clean(g);
    };
    this.tweezers = new THREE.Mesh(mergeGeometries([blade(1), blade(-1), box(0.007, 0.0022, 0.012, -0.0545, 0.0011, 0)]), M.steel);
    this.tweezers.position.set(0.012, 0.0003, C.d / 2 + 0.024); this.tweezers.rotation.y = 0.22;
    this.object.add(this.tweezers);
    // a soft contact shadow under the case and the tweezers (a blurred mask on the floor; the case is not a paper caster)
    const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d');
    x.filter = 'blur(18px)'; x.fillStyle = '#000'; x.fillRect(40, 52, 176, 152);
    const t = new THREE.CanvasTexture(c);
    this.shadow = new THREE.Mesh(new THREE.PlaneGeometry(C.w * 1.5, C.d * 1.7).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: t, transparent: true, opacity: 0.55, depthWrite: false, color: '#2a2622' }));
    this.shadow.position.set(0.004, 0.0004, 0.006); this.shadow.renderOrder = -1; this.object.add(this.shadow);
    this.object.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    this.shadow.castShadow = false; this.object.traverse((o) => { if (o.material === M.well) { o.castShadow = false; o.receiveShadow = false; } });
    this.setLid(lid);
  }
  /** the lid's opening angle (rad): 0 shut, ~1.8 open and leaning back */
  setLid(a) { this.lid.rotation.x = -a; return this; }
  dispose() { this.env.dispose(); this.object.traverse((o) => { if (o.isMesh) o.geometry.dispose(); }); for (const m of Object.values(this.materials)) m.dispose(); this.object.removeFromParent(); }
}
