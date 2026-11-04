// line.js: the s04 drying loft (brief 11.1 row s04, T13): a graphite line strung across the loft, with brushed-steel
// clips, outputs hanging from it that swing and settle like weighted paper, a line that sags and bounces with them,
// and a breeze (the cursor) that pushes the outputs near it.
//
//   const line = system.createLine({ span: 2.4, sag: 0.03 });    // origin: the line's left anchor; it runs along +x
//   scene.add(line.object);
//   line.add(sheet.object, { x: 0.4, hang: 0.16, sheet });       // hang any Object3D from a clip at x (m along the line);
//                                                                //   hang = clip -> the object's origin; a Sheet bows as it swings
//   line.wind(x, z, strength);   // a gust at x (line space, m), pushing along z: strength ~ cursor speed (m/s), signed
//   line.update(dt);             // every frame (cheap: two damped pendulums per item, one spring for the line)
//   line.reset();                // everything at rest
//
// Physics per item: a pendulum about the line (swing toward / away from the camera) and a stiffer roll in the picture
// plane, g/L stiffness, air damping (paper settles in ~3-4 swings); the line is a spring loaded by the swings.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const G = 9.81;
const clean = (g) => { const n = g.index ? g.toNonIndexed() : g; for (const k of Object.keys(n.attributes)) if (!['position', 'normal', 'uv'].includes(k)) n.deleteAttribute(k); return n; };

function clipGeometry() {
  // a small steel bulldog clip: two jaws and a wire loop over the line
  return mergeGeometries([
    clean(new THREE.BoxGeometry(0.028, 0.016, 0.0028).translate(0, -0.009, 0.0021)),
    clean(new THREE.BoxGeometry(0.028, 0.016, 0.0028).translate(0, -0.009, -0.0021)),
    clean(new THREE.TorusGeometry(0.005, 0.0008, 6, 16, Math.PI).rotateY(Math.PI / 2).translate(0, -0.001, 0)),
  ]);
}

export class DryingLine {
  constructor(sys, { span = 2.4, sag = 0.03, radius = 0.0012, color = '#2A2926' } = {}) {
    this.sys = sys; this.span = span; this.sag = sag; this.radius = radius;
    this.object = new THREE.Group(); this.object.name = 'paper.line';
    this.items = [];
    this.lineMat = new THREE.MeshStandardMaterial({ color, roughness: 0.55, metalness: 0.2 });
    this.clipMat = new THREE.MeshPhysicalMaterial({ color: '#c4c8cc', metalness: 1, roughness: 0.32, anisotropy: 0.7 });
    this.clipGeo = clipGeometry();
    this.bounce = { y: 0, v: 0 }; this._built = null;
    this.lineMesh = new THREE.Mesh(new THREE.BufferGeometry(), this.lineMat); this.lineMesh.castShadow = true;
    this.object.add(this.lineMesh);
    this._rebuild();
  }
  /** the line's height at x (line space): a parabolic sag, deepened by the bounce */
  yAt(x) { const u = x / this.span; return -4 * u * (1 - u) * (this.sag + this.bounce.y); }
  /** hang an Object3D at x: { hang (m, clip -> its origin), sheet (a Sheet, bows as it swings), mass (1) } */
  add(object, { x = 0.5, hang = 0.15, sheet = null, mass = 1 } = {}) {
    const pivot = new THREE.Group(); pivot.position.set(x, this.yAt(x), 0);
    const clip = new THREE.Mesh(this.clipGeo, this.clipMat); clip.castShadow = true; pivot.add(clip);
    object.position.set(0, -hang, 0); pivot.add(object); this.object.add(pivot);
    const it = { object, pivot, x, hang, sheet, mass, a: 0, av: 0, r: 0, rv: 0 };
    this.items.push(it); return it;
  }
  /** a gust at x pushing along z (line space); strength (m/s, signed) is how fast the cursor crossed */
  wind(x, z = 0, strength = 1) {
    for (const it of this.items) {
      const f = Math.exp(-(((it.x - x) / 0.24) ** 2));
      it.av += strength * f * 1.3 / Math.sqrt(it.hang + 0.05);
      it.rv += strength * f * 0.8 * Math.sign(it.x - x || 1);
    }
    return this;
  }
  reset() { for (const it of this.items) { it.a = it.av = it.r = it.rv = 0; } this.bounce.y = this.bounce.v = 0; this.update(0); return this; }
  update(dt = 1 / 60) {
    const h = Math.min(Math.max(dt, 0), 1 / 30), steps = Math.ceil(h / (1 / 240)), s = steps ? h / steps : 0;
    for (let k = 0; k < steps; k++) {
      let load = 0;
      for (const it of this.items) {
        const w2 = G / (it.hang + 0.06);
        it.av += (-w2 * Math.sin(it.a) - 1.1 * it.av) * s; it.a += it.av * s;         // swing (air damping: ~4 swings)
        it.rv += (-w2 * 2.2 * it.r - 2.4 * it.rv) * s; it.r += it.rv * s;            // roll in the picture plane
        load += it.mass * it.av * it.av * 0.0006;                                      // the swing's tug on the line
      }
      this.bounce.v += (-60 * this.bounce.y - 4 * this.bounce.v + load) * s; this.bounce.y += this.bounce.v * s;
    }
    for (const it of this.items) {
      it.pivot.position.set(it.x, this.yAt(it.x), 0);
      it.pivot.rotation.set(it.a, 0, it.r);
      // paper is not rigid: the sheet bows against its own swing, lagging behind it
      if (it.sheet) it.sheet.set({ bend: THREE.MathUtils.clamp(-it.av * 1.6, -6, 6), bendAxis: 0 });
    }
    if (this._built === null || Math.abs(this._built - this.bounce.y) > 2e-5) this._rebuild();
    return this;
  }
  _rebuild() {
    const pts = []; for (let i = 0; i <= 32; i++) { const x = (i / 32) * this.span; pts.push(new THREE.Vector3(x, this.yAt(x), 0)); }
    this.lineMesh.geometry.dispose();
    this.lineMesh.geometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 48, this.radius, 6, false);
    this._built = this.bounce.y;
  }
  dispose() { this.lineMesh.geometry.dispose(); this.clipGeo.dispose(); this.lineMat.dispose(); this.clipMat.dispose(); this.object.removeFromParent(); }
}
