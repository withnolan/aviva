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
  const plate = new THREE.ExtrudeGeometry(sh, { depth: 0.00025, bevelEnabled: false }).rotateX(-Math.PI / 2);
  const tab = new THREE.BoxGeometry(s * 0.45, 0.00025, 0.0022).rotateX(-0.9).translate(0, 0.0009, r * 0.82);
  return mergeGeometries([clean(plate), clean(tab)]);
}

export class WeightsCase {
  constructor(sys, { lid = 1.8 } = {}) {
    this.sys = sys;
    this.object = new THREE.Group(); this.object.name = 'paper.weights';
    const M = this.materials = {
      walnut: new THREE.MeshPhysicalMaterial({ color: '#4a2f1f', roughness: 0.42, clearcoat: 0.7, clearcoatRoughness: 0.18 }),
      felt: new THREE.MeshPhysicalMaterial({ color: '#2b2c2f', roughness: 1, sheen: 1, sheenColor: new THREE.Color('#6b6e74'), sheenRoughness: 0.6 }),
      brass: new THREE.MeshPhysicalMaterial({ color: '#d8b46a', metalness: 1, roughness: 0.16, envMapIntensity: 1.6 }),
      nickel: new THREE.MeshPhysicalMaterial({ color: '#cfd0cb', metalness: 1, roughness: 0.24, envMapIntensity: 1.5 }),
      steel: new THREE.MeshPhysicalMaterial({ color: '#9ea3a9', metalness: 1, roughness: 0.32, envMapIntensity: 1.1 }),
    };
    const C = CASE, top = C.h;
    // the case: base and four walls (walnut), the felt bed sunk 6 mm below the rim
    const wood = mergeGeometries([box(C.w, 0.012, C.d, 0, 0.006, 0),
      box(C.w, C.h, C.wall, 0, C.h / 2, C.d / 2 - C.wall / 2), box(C.w, C.h, C.wall, 0, C.h / 2, -C.d / 2 + C.wall / 2),
      box(C.wall, C.h, C.d, C.w / 2 - C.wall / 2, C.h / 2, 0), box(C.wall, C.h, C.d, -C.w / 2 + C.wall / 2, C.h / 2, 0)]);
    this.case = new THREE.Mesh(wood, M.walnut);
    const bedY = top - 0.006;
    this.felt = new THREE.Mesh(box(C.w - 2 * C.wall, bedY - 0.012, C.d - 2 * C.wall, 0, (bedY + 0.012) / 2, 0), M.felt);
    // the lid, hinged on the back edge, felt inside
    this.lid = new THREE.Group(); this.lid.position.set(0, top, -C.d / 2);
    const lidWood = new THREE.Mesh(box(C.w, 0.01, C.d, 0, 0.005, C.d / 2), M.walnut);
    const lidFelt = new THREE.Mesh(box(C.w - 2 * C.wall, 0.001, C.d - 2 * C.wall, 0, -0.0004, C.d / 2), M.felt);
    this.lid.add(lidWood, lidFelt);
    this.object.add(this.case, this.felt, this.lid);
    // the eight weights in their seats: the knob weights in round wells at the left, the leaves in a row at the right
    const knob = knobGeometry(), seats = [[-0.04, -0.012], [-0.04, 0.016], [-0.008, -0.016], [0.016, -0.016], [0.04, -0.016], [-0.008, 0.016], [0.016, 0.016], [0.04, 0.016]];
    this.weights = WEIGHTS.map((W, i) => {
      const g = W.kind === 'knob' ? knob : leafGeometry(W.shape, W.s);
      const m = new THREE.Mesh(g, W.kind === 'knob' ? M.brass : M.nickel); m.name = 'weight.' + W.name;
      m.position.set(seats[i][0], bedY - (W.kind === 'knob' ? 0.004 : -0.0001), seats[i][1]);
      if (W.kind === 'leaf') m.rotation.y = (i % 3 - 1) * 0.12;
      this.object.add(m);
      return { ...W, object: m, home: { position: m.position.clone(), quaternion: m.quaternion.clone() } };
    });
    this.total = this.weights.reduce((t, w) => t + w.mg, 0);   // 4990 mg
    // tweezers: two flat steel blades joined at the back, the tips nearly closed, lying beside the case
    const blade = (s) => clean(new THREE.BoxGeometry(0.105, 0.0008, 0.0026).rotateY(s * 0.022).translate(0, 0.0004, s * 0.0011));
    this.tweezers = new THREE.Mesh(mergeGeometries([blade(1), blade(-1), box(0.008, 0.0018, 0.0045, -0.051, 0.0009, 0)]), M.steel);
    this.tweezers.position.set(0.02, 0, C.d / 2 + 0.028); this.tweezers.rotation.y = 0.12;
    this.object.add(this.tweezers);
    // a soft contact shadow under the case and the tweezers (a blurred mask on the floor; the case is not a paper caster)
    const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d');
    x.filter = 'blur(18px)'; x.fillStyle = '#000'; x.fillRect(40, 52, 176, 152);
    const t = new THREE.CanvasTexture(c);
    this.shadow = new THREE.Mesh(new THREE.PlaneGeometry(C.w * 1.5, C.d * 1.7).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: t, transparent: true, opacity: 0.55, depthWrite: false, color: '#2a2622' }));
    this.shadow.position.set(0.004, 0.0004, 0.006); this.shadow.renderOrder = -1; this.object.add(this.shadow);
    this.object.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    this.shadow.castShadow = false;
    this.setLid(lid);
  }
  /** the lid's opening angle (rad): 0 shut, ~1.8 open and leaning back */
  setLid(a) { this.lid.rotation.x = -a; return this; }
  dispose() { this.object.traverse((o) => { if (o.isMesh) o.geometry.dispose(); }); for (const m of Object.values(this.materials)) m.dispose(); this.object.removeFromParent(); }
}
