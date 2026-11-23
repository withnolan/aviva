// printer.js: the s06 machine room's dot-matrix printer (brief 5.12, 11.1 row s06, T27, decision #48): a 1980s printer in
// warm-grey plastic (bevelled case, smoked ribbon window, tractor housings, a knurled platen knob, a green LED), and the
// fanfold strip (tractor holes along both edges, a perforation every 297 mm) feeding out of the top slot, over backwards
// and down into a zig-zag pile behind it. The print is true 1-bit dot-matrix: each line is rasterised to pins and
// stamped as round dots; images (the margin doodles) get an ordered Bayer dither at the same pin pitch.
//
//   const printer = system.createPrinter();       // { object, feed(p), setContent({ entries, spacing }), head, dispose() }
//   scene.add(printer.object);                    // origin: the floor under the printer's centre; +z = its front
//   printer.setContent({ entries: [{ text: 'v0.1  179-141 BCE  Initial release.', image: svgImg }, ...], spacing: 0.07 });
//   printer.feed(p);                              // 0..1: how much of the content has come out (the last line at the head at 1)
//   printer.head                                  // { position (printer space) } of the print line, for the DOM "NOW PRINTING" label
//
// Cost: the case 1 draw + details 4, the strip 1, the pile 1 (instanced). The strip texture is a ~1 m window of paper at
// 3.4 px/mm (802 x 4096), redrawn only when the feed moves 0.2 m past its last draw; between redraws the texture slides.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const W = 0.236, P = 0.297, MARGIN = 0.013, HOLE_PITCH = 0.0127;   // continuous A4: 210 mm + two 13 mm tractor strips
const PXMM = 3.4, CW = Math.round(W * 1000 * PXMM), WIN = 4096, WIN_M = WIN / (PXMM * 1000), STEP = 0.2;
const PITCH = 0.62;                                                 // pin pitch (mm) for the printed glyphs

function roundedBox(w, h, d, r) {
  const s = new THREE.Shape(), x0 = -w / 2, y0 = -h / 2, c = r;
  s.moveTo(x0 + c, y0); s.lineTo(-x0 - c, y0); s.quadraticCurveTo(-x0, y0, -x0, y0 + c); s.lineTo(-x0, -y0 - c); s.quadraticCurveTo(-x0, -y0, -x0 - c, -y0);
  s.lineTo(x0 + c, -y0); s.quadraticCurveTo(x0, -y0, x0, -y0 - c); s.lineTo(x0, y0 + c); s.quadraticCurveTo(x0, y0, x0 + c, y0);
  const g = new THREE.ExtrudeGeometry(s, { depth: d - 2 * r * 0.6, bevelEnabled: true, bevelThickness: r * 0.6, bevelSize: r * 0.5, bevelSegments: 3, curveSegments: 4 });
  return g.translate(0, 0, -(d - 2 * r * 0.6) / 2);
}
const clean = (g) => { const n = g.index ? g.toNonIndexed() : g; for (const k of Object.keys(n.attributes)) if (!['position', 'normal', 'uv'].includes(k)) n.deleteAttribute(k); return n; };

export class Printer {
  constructor(sys, { entries = null, spacing = 0.07 } = {}) {
    this.sys = sys; this.object = new THREE.Group(); this.object.name = 'paper.printer';
    // ---- the case: 420 x 100 x 300 mm, warm-grey plastic, bevelled; a darker top cover over the mechanism
    const plastic = new THREE.MeshPhysicalMaterial({ color: '#c3bcae', roughness: 0.58, clearcoat: 0.15, clearcoatRoughness: 0.6 });
    const darker = new THREE.MeshPhysicalMaterial({ color: '#a69f92', roughness: 0.55 });
    const smoke = new THREE.MeshPhysicalMaterial({ color: '#2b2724', roughness: 0.12, clearcoat: 1, metalness: 0 });
    const black = new THREE.MeshStandardMaterial({ color: '#45423d', roughness: 0.6 });
    const body = new THREE.Mesh(roundedBox(0.42, 0.1, 0.3, 0.012).translate(0, 0.05, 0), plastic);
    // the top cover (front half) and the rear paper shelf, with the paper slot between them at z = -0.035
    const cover = new THREE.Mesh(clean(roundedBox(0.4, 0.028, 0.15, 0.008).translate(0, 0.112, 0.06)), darker);
    const shelf = new THREE.Mesh(clean(roundedBox(0.4, 0.012, 0.09, 0.005).translate(0, 0.104, -0.1)), darker);
    const ribbon = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.003, 0.075).translate(-0.06, 0.1265, 0.06), smoke);   // the smoked ribbon window
    // tractor housings either side of the slot, the knurled platen knob (right), the vent and the front panel
    const det = [new THREE.BoxGeometry(0.03, 0.026, 0.07).translate(-0.132, 0.118, -0.035), new THREE.BoxGeometry(0.03, 0.026, 0.07).translate(0.132, 0.118, -0.035),
      new THREE.CylinderGeometry(0.024, 0.024, 0.022, 28).rotateZ(Math.PI / 2).translate(0.222, 0.07, -0.03),
      ...[0, 1, 2, 3, 4, 5].map((i) => new THREE.BoxGeometry(0.004, 0.022, 0.003).translate(-0.17 + i * 0.009, 0.05, 0.1505)),
      new THREE.BoxGeometry(0.018, 0.008, 0.004).translate(0.168, 0.042, 0.151), new THREE.BoxGeometry(0.018, 0.008, 0.004).translate(0.193, 0.042, 0.151)].map(clean);
    const details = new THREE.Mesh(mergeGeometries(det), black);
    const led = new THREE.Mesh(new THREE.SphereGeometry(0.0028, 12, 8).translate(0.18, 0.066, 0.1505), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.35, 1.0, 0.45).multiplyScalar(1.6), toneMapped: false }));
    this.object.add(body, cover, shelf, ribbon, details, led);
    this.object.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    led.castShadow = false;
    // ---- the strip's path (printer space, x = 0): up out of the slot leaning back 8 deg, over a 70 mm arc, down behind
    const head = new THREE.Vector3(0, 0.095, -0.035), lean = THREE.MathUtils.degToRad(8), L1 = 0.3, R = 0.07, pileZ = -0.035 - L1 * Math.sin(lean) - R * (1 + Math.cos(lean)) - 0.0;
    this.head = { position: head.clone().setY(0.12) };
    const pathAt = (d) => {
      if (d <= L1) return new THREE.Vector3(0, head.y + d * Math.cos(lean), head.z - d * Math.sin(lean));
      const p1y = head.y + L1 * Math.cos(lean), p1z = head.z - L1 * Math.sin(lean), arc = R * (Math.PI - lean);
      if (d <= L1 + arc) { const ph = lean + (d - L1) / R; return new THREE.Vector3(0, p1y + R * (Math.sin(ph) - Math.sin(lean)), p1z + R * (Math.cos(ph) - Math.cos(lean))); }
      const p2y = p1y - R * Math.sin(lean), p2z = p1z + R * (-1 - Math.cos(lean));
      return new THREE.Vector3(0, p2y - (d - L1 - arc), p2z);
    };
    const pileTop = 0.012, dLand = L1 + R * (Math.PI - lean) + (head.y + L1 * Math.cos(lean) - R * Math.sin(lean) - pileTop);
    this._dLand = dLand;
    // ---- the strip mesh: fixed rows along the path, their v = path distance; the feed slides the texture
    const rows = 260, pos = [], uv = [], idx = [], d0 = -0.03;
    for (let i = 0; i <= rows; i++) {
      const d = d0 + (dLand - d0) * (i / rows), p = d < 0 ? new THREE.Vector3(0, head.y + d, head.z) : pathAt(d);
      pos.push(-W / 2, p.y, p.z, W / 2, p.y, p.z); uv.push(0, d, 1, d);
      if (i < rows) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    }
    const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); sg.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); sg.setIndex(idx); sg.computeVertexNormals();
    this._canvas = document.createElement('canvas'); this._canvas.width = CW; this._canvas.height = WIN;
    this.texture = new THREE.CanvasTexture(this._canvas); this.texture.colorSpace = THREE.SRGBColorSpace; this.texture.anisotropy = 8;
    this.texture.matrixAutoUpdate = false;    // v (metres along the path) -> canvas rows, set in feed()
    const paperMat = new THREE.MeshStandardMaterial({ map: this.texture, alphaTest: 0.5, roughness: 0.92, side: THREE.DoubleSide });
    this.strip = new THREE.Mesh(sg, paperMat); this.strip.castShadow = this.strip.receiveShadow = true; this.strip.name = 'printer.strip';
    // ---- the zig-zag pile behind: folded pages (instanced), each page a little askew; the count grows with the feed
    const pageTex = this._pageTexture();
    const page = new THREE.BoxGeometry(W, 0.0011, P), pileMat = new THREE.MeshStandardMaterial({ map: pageTex, roughness: 0.92 });
    this.pile = new THREE.InstancedMesh(page, pileMat, 40); this.pile.count = 0; this.pile.castShadow = this.pile.receiveShadow = true;
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(); let a = 5; const rnd = () => { a = (a * 16807) % 2147483647; return (a - 1) / 2147483646; };
    for (let i = 0; i < 40; i++) { e.set((rnd() - 0.5) * 0.02, (rnd() - 0.5) * 0.03, (rnd() - 0.5) * 0.02); q.setFromEuler(e); m.compose(new THREE.Vector3((rnd() - 0.5) * 0.004, 0.0008 + i * 0.0017, pileZ - P / 2 + 0.01 + (i % 2 ? 0.004 : -0.004)), q, new THREE.Vector3(1, 1, 1)); this.pile.setMatrixAt(i, m); }
    this.object.add(this.strip, this.pile);
    this._F = null; this._origin = null;
    this.setContent({ entries: entries || [], spacing });
    this.feed(0);
  }
  /** the content: one dot-matrix line per entry (optionally with a margin image), `spacing` m apart, from the strip's start */
  setContent({ entries = [], spacing = 0.07, lead = 0.06 } = {}) {
    this.entries = entries; this.spacing = spacing; this.lead = lead; this.length = lead + Math.max(0, entries.length - 1) * spacing + 0.03;
    this._origin = null; if (this._F !== null) this.feed(this._p ?? 0);
    return this;
  }
  /** 0..1: how much of the content has fed out (at 1 the last line sits at the print head) */
  feed(p = 0) {
    this._p = p; const F = p * this.length;   // F: paper (m) past the head, measured from the content's start
    this._F = F;
    if (this._origin === null || F - this._origin > STEP || F < this._origin) this._draw(F);
    // the strip row at path distance d shows paper u = F - d; the canvas runs from the oldest paper (top row, highest on
    // the strip) down: row y = (u - uMin) * px/m, so texture v (flipY: 1 at the top) = 1 - (F - d - uMin) * k
    const k = PXMM * 1000 / WIN, uMin = this._top - WIN_M;
    this.texture.matrix.set(1, 0, 0, 0, k, 1 - (F - uMin) * k, 0, 0, 1);
    // the pile: pages that have passed the landing point
    const passed = F + 0.6 - this._dLand;   // 0.6 m of blank leader is already threaded when the section starts
    this.pile.count = Math.max(1, Math.min(40, Math.floor(passed / P) + 2));
    return this;
  }
  _draw(F) {
    // the canvas window: paper u in [top - WIN_M, top], the canvas top row = the larger u (nearer the head)
    this._origin = F; this._top = F + STEP + 0.04;   // the visible strip spans u in [F - 0.88, F + 0.03] until the next redraw
    const x = this._canvas.getContext('2d'), k = PXMM * 1000, top = this._top, bottom = top - WIN_M;
    const Y = (u) => (u - bottom) * k;   // older paper (smaller u) nearer the canvas top = higher on the strip: upright glyphs
    x.clearRect(0, 0, CW, WIN); x.fillStyle = '#f5f3ee'; x.fillRect(0, 0, CW, WIN);
    // tractor holes (cut out), the margin perforations, a cross perforation every page
    x.globalCompositeOperation = 'destination-out';
    for (let u = Math.ceil(bottom / HOLE_PITCH) * HOLE_PITCH; u < top; u += HOLE_PITCH) for (const cx of [MARGIN / 2, W - MARGIN / 2]) { x.beginPath(); x.arc(cx * k, Y(u), 0.002 * k, 0, Math.PI * 2); x.fill(); }
    x.globalCompositeOperation = 'source-over';
    x.strokeStyle = 'rgba(120,118,112,0.55)'; x.lineWidth = 1; x.setLineDash([0.0012 * k, 0.0009 * k]);
    x.beginPath(); for (const cx of [MARGIN, W - MARGIN]) { x.moveTo(cx * k, 0); x.lineTo(cx * k, WIN); } x.stroke();
    x.beginPath(); for (let u = Math.ceil(bottom / P) * P; u < top; u += P) { x.moveTo(0, Y(u)); x.lineTo(CW, Y(u)); } x.stroke(); x.setLineDash([]);
    // the printed lines: u_i = lead + i * spacing (only those already past the head are inked: u <= F + a hair)
    this.entries.forEach((en, i) => {
      const u = this.lead + i * this.spacing; if (u < bottom - 0.02 || u > top + 0.02) return;
      this._pins(x, en.text || '', (MARGIN + 0.012) * k, Y(u));
      if (en.image && en.image.width) this._dither(x, en.image, (W - MARGIN - 0.055) * k, Y(u) - 0.026 * k, 0.045 * k, 0.04 * k);
    });
    this.texture.needsUpdate = true;
  }
  _pins(x, text, px, py) {
    // rasterise the line at 9 px (a 9-pin head), threshold it to 1 bit, and stamp each pin as a round dot
    const c = this._rc || (this._rc = document.createElement('canvas')); c.width = 640; c.height = 12;
    const r = c.getContext('2d'); r.clearRect(0, 0, 640, 12); r.fillStyle = '#000'; r.font = 'bold 9px "DM Mono", ui-monospace, monospace'; r.textBaseline = 'top'; r.fillText(text, 0, 1);
    const d = r.getImageData(0, 0, 640, 12).data, s = PITCH / 1000 * PXMM * 1000;
    x.fillStyle = 'rgba(34,33,31,0.9)';
    for (let j = 0; j < 12; j++) for (let i = 0; i < 640; i++) if (d[(j * 640 + i) * 4 + 3] > 110) {
      const ink = 0.78 + 0.22 * Math.random(); x.globalAlpha = ink;
      x.beginPath(); x.arc(px + i * s, py - 6 * s + j * s, s * 0.52, 0, Math.PI * 2); x.fill();
    }
    x.globalAlpha = 1;
  }
  _dither(x, img, px, py, w, h) {
    // an ordered (Bayer 4x4) 1-bit dither of the image at the pin pitch
    const s = PITCH / 1000 * PXMM * 1000, cols = Math.round(w / s), rowsN = Math.round(h / s);
    const c = document.createElement('canvas'); c.width = cols; c.height = rowsN; const r = c.getContext('2d'); r.fillStyle = '#fff'; r.fillRect(0, 0, cols, rowsN); r.drawImage(img, 0, 0, cols, rowsN);
    const d = r.getImageData(0, 0, cols, rowsN).data, B = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
    x.fillStyle = 'rgba(34,33,31,0.85)';
    for (let j = 0; j < rowsN; j++) for (let i = 0; i < cols; i++) {
      const o = (j * cols + i) * 4, lum = (d[o] * 0.3 + d[o + 1] * 0.59 + d[o + 2] * 0.11) / 255;
      if (lum < (B[(j % 4) * 4 + (i % 4)] + 0.5) / 16) { x.beginPath(); x.arc(px + i * s, py + j * s, s * 0.5, 0, Math.PI * 2); x.fill(); }
    }
  }
  _pageTexture() {
    // the pile's pages: paper with the tractor holes and margin perforations (no print; you see their edges)
    const c = document.createElement('canvas'); c.width = 236; c.height = 297; const x = c.getContext('2d');
    x.fillStyle = '#f2f0eb'; x.fillRect(0, 0, 236, 297); x.fillStyle = '#9a978f';
    for (let y = 6; y < 297; y += 12.7) for (const cx of [6.5, 229.5]) { x.beginPath(); x.arc(cx, y, 2, 0, Math.PI * 2); x.fill(); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  }
  dispose() { this.object.traverse((o) => { if (o.isMesh) { o.geometry.dispose(); if (o.material.map) o.material.map.dispose(); o.material.dispose(); } }); this.object.removeFromParent(); }
}
