// generations.js: the s08 generations stage (brief 5.12, 11.1 row s08, T33): seven sheets on clear acrylic stands,
// 260 mm apart in a shallow curve, GEN 1 (virgin fibre: bright, crisp) to GEN 7 (recycled six times: greyer, a cloudier
// formation in the back-light, less translucent, wavier, softer edges), each over a soft pool of light; and a two-pan
// precision balance (graphite-enamel beam, brass pans) weighing a folded sheet (4.99 g) against a sealed glass jar
// labelled 4.64 g CO2e, its beam tipping a hair toward the sheet.
//
//   const gens = system.createGenerations();     // { object, gens, balance, update(dt), dispose() }
//   scene.add(gens.object);                       // origin: the floor at the row's centre; +z toward the camera
//   gens.gens[i] = { n, sheet, label, setLit(k) } // label: a Vector3 under the sheet (for the DOM "GEN n"); setLit: 0..1 pool
//   gens.balance.tilt(k);                         // -1: the sheet's pan dips; +1: the jar's; 0: rest (a hair toward the sheet)
//   gens.balance.object, .pans.sheet, .pans.jar   // (move the balance with .object; pans for hit-testing hover)
//   gens.update(dt);                              // every frame: the beam's ease and the pans hanging from it
//
// Ageing per generation g = 0..6: gain 1.06 -> 0.74, formation mottle 0.12 -> 0.8, translucency 0.32 -> 0.1, cockle x1 -> x4,
// a softer, brighter cut edge. Cost: 7 light sheets (48 x 68 segments, the paper shader: 7 draws + shadows), stands 1,
// pools 7, balance ~6. The rig's back-light needs a wide cone to reach the whole row evenly (angle ~1.2 rad).
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const clean = (g) => { const n = g.index ? g.toNonIndexed() : g; for (const k of Object.keys(n.attributes)) if (!['position', 'normal', 'uv'].includes(k)) n.deleteAttribute(k); return n; };

function jarLabel() {
  const c = document.createElement('canvas'); c.width = 512; c.height = 128; const x = c.getContext('2d');
  x.fillStyle = '#ece6d8'; x.fillRect(0, 0, 512, 128); x.strokeStyle = 'rgba(42,41,38,0.6)'; x.lineWidth = 2; x.strokeRect(150, 14, 212, 100);
  x.fillStyle = '#2a2926'; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.font = '500 40px "Hanken Grotesk", Arial, sans-serif'; x.fillText('4.64 g', 256, 52);
  x.font = '500 20px "Hanken Grotesk", Arial, sans-serif'; x.fillText('CO₂e', 256, 92);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}

class Balance {
  constructor() {
    this.object = new THREE.Group(); this.object.name = 'generations.balance';
    const graphite = new THREE.MeshPhysicalMaterial({ color: '#2b2d32', roughness: 0.34, clearcoat: 0.7, clearcoatRoughness: 0.2 });
    const brass = new THREE.MeshPhysicalMaterial({ color: '#c9a35f', metalness: 1, roughness: 0.24 });
    const H = 0.27, A = 0.16; this.H = H; this.A = A;
    const stand = new THREE.Mesh(mergeGeometries([clean(new THREE.CylinderGeometry(0.075, 0.08, 0.022, 48).translate(0, 0.011, 0)), clean(new THREE.CylinderGeometry(0.03, 0.04, 0.016, 32).translate(0, 0.03, 0))]), graphite);
    const pillar = new THREE.Mesh(mergeGeometries([clean(new THREE.CylinderGeometry(0.0065, 0.0075, H - 0.03, 20).translate(0, 0.03 + (H - 0.03) / 2, 0)),
      clean(new THREE.BoxGeometry(0.03, 0.014, 0.016).translate(0, H, 0)), clean(new THREE.TorusGeometry(0.05, 0.0018, 6, 40, Math.PI * 0.35).rotateZ(Math.PI * 1.325).translate(0, H - 0.005, 0.009))]), brass);
    this.beam = new THREE.Group(); this.beam.position.set(0, H + 0.006, 0);
    const beam = new THREE.Mesh(mergeGeometries([clean(new THREE.BoxGeometry(2 * A, 0.011, 0.011)), clean(new THREE.CylinderGeometry(0.004, 0.004, 0.03, 12).rotateX(Math.PI / 2))]), graphite);
    const tips = new THREE.Mesh(mergeGeometries([clean(new THREE.SphereGeometry(0.0075, 16, 12).translate(-A, 0, 0)), clean(new THREE.SphereGeometry(0.0075, 16, 12).translate(A, 0, 0)),
      clean(new THREE.BoxGeometry(0.003, 0.07, 0.003).translate(0, -0.04, 0.009))]), brass);   // the end knobs and the pointer
    this.beam.add(beam, tips);
    // the pans: shallow brass dishes on three fine rods, hanging from the beam's ends (always level)
    const dish = new THREE.LatheGeometry([[0, 0], [0.03, 0.001], [0.05, 0.006], [0.056, 0.013], [0.0565, 0.014]].map(([r, y]) => new THREE.Vector2(r, y)), 48);
    const pan = () => {
      const g = new THREE.Group(), rods = [];
      for (let i = 0; i < 3; i++) { const a = i * Math.PI * 2 / 3 + Math.PI / 6, p = new THREE.Vector3(Math.cos(a) * 0.054, 0.013, Math.sin(a) * 0.054), top = new THREE.Vector3(0, 0.13, 0);
        const d = top.clone().sub(p), rod = new THREE.CylinderGeometry(0.0008, 0.0008, d.length(), 6).translate(0, d.length() / 2, 0);
        rod.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize())); rods.push(clean(rod.translate(p.x, p.y, p.z))); }
      g.add(new THREE.Mesh(mergeGeometries([clean(dish.clone()), ...rods]), brass));
      return g;
    };
    this.pans = { sheet: pan(), jar: pan() };
    // on the sheet's pan: one A4 sheet folded into a small packet; on the other: the sealed jar of its footprint
    const packet = new THREE.Mesh(clean(new THREE.BoxGeometry(0.074, 0.0045, 0.052).translate(0, 0.0045, 0)), new THREE.MeshStandardMaterial({ color: '#f3f1eb', roughness: 0.85 }));
    packet.rotation.y = 0.35; this.pans.sheet.add(packet);
    const glass = new THREE.MeshPhysicalMaterial({ color: '#e9f1f3', transparent: true, opacity: 0.24, roughness: 0.04, clearcoat: 1, side: THREE.DoubleSide, depthWrite: false });
    const jar = new THREE.Group(), R = 0.029, JH = 0.074;
    jar.add(new THREE.Mesh(mergeGeometries([clean(new THREE.CylinderGeometry(R, R, JH, 48, 1, true).translate(0, 0.002 + JH / 2, 0)), clean(new THREE.CircleGeometry(R, 48).rotateX(-Math.PI / 2).translate(0, 0.003, 0))]), glass));
    jar.add(new THREE.Mesh(clean(new THREE.CylinderGeometry(R + 0.0012, R + 0.0012, 0.012, 48).translate(0, 0.002 + JH + 0.005, 0)), new THREE.MeshStandardMaterial({ color: '#b9bdc3', metalness: 1, roughness: 0.32 })));
    jar.add(new THREE.Mesh(new THREE.CylinderGeometry(R + 0.0004, R + 0.0004, 0.03, 48, 1, true).translate(0, 0.002 + JH * 0.48, 0), new THREE.MeshStandardMaterial({ map: jarLabel(), roughness: 0.9 })));
    jar.position.y = 0.006; jar.rotation.y = Math.PI + 0.22; this.pans.jar.add(jar);   // the label's text toward the viewer
    this.object.add(stand, pillar, this.beam, this.pans.sheet, this.pans.jar);
    this.object.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    this.rest = 0.03; this.angle = this.rest; this.want = this.rest;     // a hair toward the sheet (4.99 g > 4.64 g)
    this._place();
  }
  /** -1: the sheet's pan dips; +1: the jar's pan dips; 0: rest (a hair toward the sheet) */
  tilt(k = 0) { this.want = this.rest - THREE.MathUtils.clamp(k, -1, 1) * 0.055; return this; }
  _place() {
    this.beam.rotation.z = this.angle;
    const c = Math.cos(this.angle), s = Math.sin(this.angle), y = this.beam.position.y;
    this.pans.sheet.position.set(-this.A * c, y - this.A * s - 0.13, 0); this.pans.jar.position.set(this.A * c, y + this.A * s - 0.13, 0);
  }
  update(dt) { this.angle += (this.want - this.angle) * (1 - Math.exp(-dt * 4)); this._place(); }
}

export class Generations {
  constructor(sys, { spacing = 0.26, curve = 0.12, balanceAt = [1.0, 0, 0.2] } = {}) {
    this.sys = sys; this.object = new THREE.Group(); this.object.name = 'paper.generations';
    this.gens = [];
    const stands = [], poolTex = (() => {
      const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'), g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
      g.addColorStop(0, 'rgba(255,240,215,0.8)'); g.addColorStop(0.4, 'rgba(255,232,200,0.35)'); g.addColorStop(1, 'rgba(255,225,190,0)'); x.fillStyle = g; x.fillRect(0, 0, 128, 128);
      return new THREE.CanvasTexture(c);
    })();
    for (let g = 0; g < 7; g++) {
      const x = (g - 3) * spacing, z = -curve * ((g - 3) / 3) ** 2, k = g / 6;
      const sheet = sys.createSheet({ name: 'gen' + (g + 1), seed: 300 + g, segments: [48, 68] });
      sheet.object.position.set(x, 0.1485 + 0.013, z); sheet.object.rotation.y = -x * 0.12;
      sheet.set({ gain: 1.06 - 0.32 * k, translucency: 0.32 - 0.22 * k, cockle: 0.00045 * (1 + 3 * k), shadowRecv: 0.6 });
      sheet.uniforms.uFormP.value.z = 0.12 + 0.68 * k;                       // a cloudier formation: shorter, coarser fibres
      sheet.uniforms.uEdgeP.value.set(1.4 + 2.2 * k, 0.18 + 0.2 * k, 0.1 + 0.18 * k, 0.85);   // softer, fluffier cut edges
      this.object.add(sheet.object);
      stands.push(clean(new THREE.BoxGeometry(0.09, 0.013, 0.036).translate(x, 0.0065, z)));
      const pool = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.36).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: poolTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.3 }));
      pool.position.set(x, 0.0012, z + 0.05); pool.renderOrder = 4; this.object.add(pool);
      this.gens.push({ n: g + 1, sheet, label: new THREE.Vector3(x, -0.01, z + 0.04), pool, setLit(v) { pool.material.opacity = 0.3 + 0.35 * THREE.MathUtils.clamp(v, 0, 1); } });
    }
    this.stands = new THREE.Mesh(mergeGeometries(stands), new THREE.MeshPhysicalMaterial({ color: '#dfe9ef', transparent: true, opacity: 0.4, roughness: 0.05, clearcoat: 1 }));
    this.stands.name = 'generations.stands'; this.object.add(this.stands);
    this.balance = new Balance(); this.balance.object.position.set(...balanceAt); this.balance.object.rotation.y = -0.18; this.object.add(this.balance.object);   // the beam nearly square to the view, so its tilt reads
  }
  update(dt = 1 / 60) { this.balance.update(dt); return this; }
  dispose() {
    for (const g of this.gens) { g.sheet.dispose(); g.pool.geometry.dispose(); g.pool.material.dispose(); }
    this.balance.object.traverse((o) => { if (o.isMesh) { o.geometry.dispose(); if (o.material.map) o.material.map.dispose(); o.material.dispose(); } });
    this.stands.geometry.dispose(); this.stands.material.dispose(); this.object.removeFromParent();
  }
}
