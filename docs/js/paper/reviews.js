// reviews.js: the s09 "office after hours" set (brief 5.12, 11.1 row s09, T19): the six riso standees (T18) as card
// cut-outs 1.5 mm thick with white cut edges and a folded easel foot, in a shallow arc on the dark floor (the centre left
// free for the sheet); a soft volumetric downlight and a warm floor pool over each; a tent card in front of each,
// rated by its corners (the shredder's is dog-eared).
//
//   const reviews = system.createReviewSet();   // { object, standees, ready, lookAt(), focus(), setLight(), hit(), update() }
//   scene.add(reviews.object);                   // origin: the floor under the sheet; +z toward the camera
//   await reviews.ready;                         // (optional) the six illustrations have loaded
//   reviews.lookAt(x, y, z);                     // the standees turn on springs to face this point (set space; e.g. the cursor
//                                                //   projected on the floor), lookAt(null) = rest
//   reviews.focus(i);                            // one quote at a time: standee i's light up, the others down; -1 = all evenly lit
//   reviews.setLight(i, k);                      // or drive each downlight yourself, 0..1 (eased), e.g. fading up in turn
//   reviews.hit(raycaster);                      // -> the standee index under the pointer, or -1 (hover / focus)
//   reviews.update(dt);                          // every frame: the springs
//   reviews.standees[i] = { name, object, height, light }   // object: its group (turns about its base)
//
// Options: { spread: 0.75 (m, the outer standees' x), depth: -0.5 (z of the inner ones), curve: 0.15, scale: 1, base }
// Cost: 30 draw calls (per standee: print, white card + foot, cone, pool, tent card), no scene lights, 6 textures (~0.7 MB).
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export const REVIEWERS = [
  { key: 'printer', name: 'THE PRINTER', h: 0.32 }, { key: 'biscuit', name: 'BISCUIT', h: 0.3 }, { key: 'novelist', name: 'A NOVELIST', h: 0.36 },
  { key: 'shredder', name: 'THE SHREDDER', h: 0.38, dogEar: true }, { key: 'pencil', name: 'AN HB PENCIL', h: 0.44 }, { key: 'bin', name: 'THE RECYCLING BIN', h: 0.34 },
];
const PAPER = new THREE.Color('#f3f1eb'), WARM = new THREE.Color(1.0, 0.9, 0.74);

// the downlight's soft cone (as arena.js): brightest on its axis and near the lamp, fading toward its rim and the floor
const CONE_VERT = 'varying vec3 vL; varying vec3 vN; varying vec3 vV; void main(){ vL = position; vec4 w = modelMatrix * vec4(position, 1.0); vN = normalize(mat3(modelMatrix) * normal); vV = normalize(cameraPosition - w.xyz); gl_Position = projectionMatrix * viewMatrix * w; }';
const CONE_FRAG = `uniform vec3 uColor; uniform float uK; uniform float uH; varying vec3 vL; varying vec3 vN; varying vec3 vV;
float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
void main(){ float along = clamp((uH * 0.5 - vL.y) / uH, 0.0, 1.0);
  float rim = pow(abs(dot(normalize(vN), normalize(vV))), 1.8);
  float a = rim * (0.25 + 0.75 * (1.0 - along)) * smoothstep(0.0, 0.18, along) * uK;
  a *= 0.94 + 0.12 * h(floor(gl_FragCoord.xy));
  gl_FragColor = vec4(uColor * a, 1.0); }`;

function radial(stops) {
  const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'), g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  for (const [o, s] of stops) g.addColorStop(o, s); x.fillStyle = g; x.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c);
}

function tentTexture(name, dogEar) {
  // the tent card's face: the reviewer's name in small capitals, a hairline, four crop-mark corners (a dog-ear costs one)
  const W = 512, H = 300, c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
  x.fillStyle = '#f3f1eb'; x.fillRect(0, 0, W, H);
  x.strokeStyle = 'rgba(42,41,38,0.7)'; x.lineWidth = 3; const m = 26, k = 34;
  for (const [cx, cy, sx, sy] of [[m, m, 1, 1], [W - m, m, -1, 1], [m, H - m, 1, -1], [W - m, H - m, -1, -1]]) {
    if (dogEar && sx < 0 && sy > 0) continue;   // the folded corner has no mark
    x.beginPath(); x.moveTo(cx, cy + sy * k); x.lineTo(cx, cy); x.lineTo(cx + sx * k, cy); x.stroke();
  }
  x.fillStyle = '#2a2926'; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.font = `500 ${name.length > 14 ? 30 : 36}px "Hanken Grotesk", "DM Mono", Arial, sans-serif`; x.fillText(name.split('').join(String.fromCharCode(8202)), W / 2, H / 2);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}

export class ReviewSet {
  constructor(sys, { spread = 0.75, depth = -0.5, curve = 0.15, scale = 1, base = new URL('../../assets/illustrations/standees/', import.meta.url).href } = {}) {
    this.sys = sys; this.object = new THREE.Group(); this.object.name = 'paper.reviews';
    this.standees = []; this._look = null; this._focus = -1;
    const loader = new THREE.TextureLoader(), loads = [];
    const xs = [-spread, -spread * 0.66, -spread * 0.33, spread * 0.33, spread * 0.66, spread];
    const pool = radial([[0, 'rgba(255,236,205,0.85)'], [0.35, 'rgba(255,226,190,0.42)'], [0.75, 'rgba(255,215,175,0.08)'], [1, 'rgba(255,210,170,0)']]);
    REVIEWERS.forEach((R, i) => {
      const x = xs[i], z = depth + curve * (x / spread) ** 2, h = R.h * scale;
      const tex = loader.load(base + R.key + '.webp'); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
      loads.push(new Promise((res) => { const t0 = tex; const chk = () => (t0.image && t0.image.width ? res() : setTimeout(chk, 50)); chk(); }));
      const g = new THREE.Group(); g.position.set(x, 0, z);
      const yaw0 = Math.atan2(-x, 1.6 - z);                    // face the room's front, a little inward
      g.rotation.y = yaw0;
      const lit = { value: 0.6 };
      // the print (front) and the white card behind it (three layers to the 1.5 mm back), both cut by the print's alpha
      const w = h * (R.key === 'pencil' ? 440 : R.key === 'biscuit' ? 860 : R.key === 'printer' ? 820 : R.key === 'novelist' ? 800 : 760) / 1024;
      const spot = (sh) => {
        sh.uniforms.uLit = lit;
        sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform float uLit;')
          .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n  totalEmissiveRadiance += diffuseColor.rgb * vec3(1.0, 0.93, 0.82) * uLit * 0.75 * (0.55 + 0.45 * vMapUv.y);');
      };
      const front = new THREE.Mesh(new THREE.PlaneGeometry(w, h).translate(0, h / 2, 0), new THREE.MeshStandardMaterial({ map: tex, alphaTest: 0.5, roughness: 0.82 }));
      front.material.onBeforeCompile = spot; front.material.customProgramCacheKey = () => 'aviva-standee-front';
      const plane = (zz) => new THREE.PlaneGeometry(w, h).translate(0, h / 2, zz);
      // the folded easel foot: a strut from the back at 35 % height down to a flap on the floor (UVs on the opaque centre)
      const fw = Math.min(0.08, w * 0.35), fh = h * 0.35, fd = 0.11;
      const strut = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-fw / 2, fh, -0.0016), new THREE.Vector3(fw / 2, fh, -0.0016), new THREE.Vector3(-fw / 2, 0.0005, -fd), new THREE.Vector3(fw / 2, 0.0005, -fd)]);
      strut.setIndex([0, 2, 1, 1, 2, 3]); strut.computeVertexNormals();
      const flap = new THREE.PlaneGeometry(fw, 0.03).rotateX(-Math.PI / 2).translate(0, 0.0006, -fd + 0.015);
      for (const gg of [strut, flap]) gg.setAttribute('uv', new THREE.Float32BufferAttribute(new Array(gg.attributes.position.count * 2).fill(0.5), 2));
      const whiteGeo = mergeGeometries([plane(-0.0005), plane(-0.001), plane(-0.0015), strut.toNonIndexed(), flap.toNonIndexed()].map((q) => (q.index ? q.toNonIndexed() : q)));
      const white = new THREE.Mesh(whiteGeo, new THREE.MeshStandardMaterial({ map: tex, alphaTest: 0.5, roughness: 0.9, side: THREE.DoubleSide }));
      white.material.onBeforeCompile = (sh) => { spot(sh); sh.fragmentShader = sh.fragmentShader.replace('#include <map_fragment>', '#include <map_fragment>\n  diffuseColor.rgb = vec3(0.9, 0.89, 0.86);'); };
      white.material.customProgramCacheKey = () => 'aviva-standee-white';
      front.userData.index = i; g.add(front, white);
      // the downlight: a cone from the ceiling to the floor, a warm pool on the floor
      const H = 1.5, cone = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.2, H, 40, 1, true), new THREE.ShaderMaterial({
        uniforms: { uColor: { value: WARM.clone() }, uK: { value: 0.3 }, uH: { value: H } }, vertexShader: CONE_VERT, fragmentShader: CONE_FRAG,
        transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
      cone.position.set(x, H / 2, z + 0.02); cone.renderOrder = 5;
      const poolM = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.42).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: pool, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.3 }));
      poolM.position.set(x, 0.0012, z + 0.06); poolM.renderOrder = 4;
      // the tent card on the floor in front: two leaning faces (an A-frame), the name on the front
      const tw = 0.085, th = 0.05, lean = 0.32;
      const e = th * Math.sin(lean), face = () => new THREE.PlaneGeometry(tw, th).translate(0, th / 2, 0).rotateX(-lean).translate(0, 0, e);
      const tentGeo = mergeGeometries([face(), face().rotateY(Math.PI)]);   // an A-frame: front and back faces meet at the top
      const tent = new THREE.Mesh(tentGeo, new THREE.MeshStandardMaterial({ map: tentTexture(R.name, R.dogEar), roughness: 0.85, side: THREE.DoubleSide }));
      tent.material.onBeforeCompile = (sh) => { sh.uniforms.uLit = lit; sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform float uLit;').replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n  totalEmissiveRadiance += diffuseColor.rgb * vec3(1.0, 0.93, 0.82) * uLit * 0.5;'); };
      tent.material.customProgramCacheKey = () => 'aviva-tent';
      tent.position.set(x * 0.92, 0, z + 0.17); tent.rotation.y = yaw0;
      if (R.dogEar) {   // the dog-eared corner: a small triangle folded over the face's top right
        const d = 0.016, tri = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(tw / 2, th, 0.0006), new THREE.Vector3(tw / 2 - d, th, 0.0006), new THREE.Vector3(tw / 2, th - d, 0.0006)]);
        tri.computeVertexNormals(); const ear = new THREE.Mesh(tri.rotateX(-lean).translate(0, 0, e), new THREE.MeshStandardMaterial({ color: '#e4e1d9', roughness: 0.9, side: THREE.DoubleSide }));
        tent.add(ear);
      }
      this.object.add(g, cone, poolM, tent);
      this.standees.push({ name: R.name, key: R.key, object: g, front, height: h, yaw0, yaw: yaw0, vel: 0, k: 9 + i * 1.7, lit, light: 0.6, target: 0.6, cone, pool: poolM });
    });
    this.ready = Promise.all(loads);
    this._apply();
  }
  _apply() {
    for (const s of this.standees) {
      s.lit.value = 0.08 + 0.92 * s.light;
      s.cone.material.uniforms.uK.value = 0.55 * s.light * s.light; s.cone.visible = s.light > 0.05;   // dimmed cones all but vanish
      s.pool.material.opacity = 0.42 * s.light;
    }
  }
  /** the standees turn to face this point (arena-style springs, clamped to +-0.6 rad from their rest pose); null: rest */
  lookAt(x, y, z) { this._look = x === null || x === undefined ? null : new THREE.Vector3(x, y, z); return this; }
  /** one quote at a time: standee i lit, the others dimmed; -1 lights all evenly */
  focus(i = -1) { this._focus = i; this.standees.forEach((s, j) => { s.target = i < 0 ? 0.6 : j === i ? 1 : 0.18; }); return this; }
  /** a downlight's level 0..1 (eased in update) */
  setLight(i, k) { const s = this.standees[i]; if (s) s.target = Math.max(0, Math.min(1, k)); return this; }
  /** the standee under the ray, or -1 */
  hit(raycaster) { const h = raycaster.intersectObjects(this.standees.map((s) => s.front), false)[0]; return h ? h.object.userData.index : -1; }
  update(dt = 1 / 60) {
    for (const s of this.standees) {
      let want = s.yaw0;
      if (this._look) { const p = s.object.position; want = THREE.MathUtils.clamp(Math.atan2(this._look.x - p.x, this._look.z - p.z), s.yaw0 - 0.6, s.yaw0 + 0.6); }
      const a = s.k * s.k * (want - s.yaw) - 2 * s.k * 0.8 * s.vel; s.vel += a * dt; s.yaw += s.vel * dt; s.object.rotation.y = s.yaw;
      s.light += (s.target - s.light) * (1 - Math.exp(-dt * 5));
    }
    this._apply();
    return this;
  }
  dispose() { this.object.traverse((o) => { if (o.isMesh) { o.geometry.dispose(); if (o.material.map) o.material.map.dispose(); o.material.dispose(); } }); this.object.removeFromParent(); }
}
