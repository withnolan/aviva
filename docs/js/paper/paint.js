// paint.js: the pencil on the sheet (s03 "Intelligence not included", s14 "Fine-tuned on you").
//
//   const paint = await system.createPaint();      // a PaintLayer, flushed by system.update() every frame
//   sheet.attachPaint(paint);                      // the sheet shows it (state key paint: true / false, paintFace)
//   paint.begin(u, v); paint.move(u, v); paint.end();     // sheet uv: u right, v up (0..1); times are optional (ms)
//   paint.setTool('eraser');                       // erases the graphite, leaves a faint ghost (the impression)
//   paint.strokeFromPath(PaintLayer.handwritingPath({ seed: 3 }), { x: 0.16, y: 0.62, width: 0.68 });  // keyboard path
//
// A GPU brush into a render target (never a CanvasTexture: re-uploading a 1536 x 2172 canvas per move is jank):
// strokes are smoothed (midpoint quadratics), resampled every 0.3 mm and drawn as instanced capsules, one draw per
// frame. The capsule is measured in millimetres, so the line is round whatever the sheet's aspect. Graphite catches on
// the paper's own tooth (the same 30 mm tile the sheet uses), so the line has real grain and gets darker where you go
// over it again. Channels: R = graphite density, A = impression (what the eraser cannot remove; the sheet shows 12 %).
import * as THREE from 'three';

const MAX_SEG = 4096;            // capsules per flush (a fast scribble at 60 fps needs ~40)

const VERT = /* glsl */`
precision highp float;
attribute vec2 position;                       // unit quad corners (-1..1)
attribute vec4 aSeg;                           // A.xy, B.xy (mm)
attribute vec2 aP;                             // radius (mm), alpha
uniform vec2 uSize;                            // sheet size (mm)
varying vec2 vMM; varying vec4 vSeg; varying vec2 vP;
void main(){
  vec2 A = aSeg.xy, B = aSeg.zw, d = B - A; float L = length(d);
  vec2 t = L > 1e-5 ? d / L : vec2(1.0, 0.0), n = vec2(-t.y, t.x);
  float r = aP.x + 0.25;                       // + a texel of margin for the soft edge
  vec2 mm = mix(A, B, position.x * 0.5 + 0.5) + t * position.x * r + n * position.y * r;
  vMM = mm; vSeg = aSeg; vP = aP;
  gl_Position = vec4(mm / uSize * 2.0 - 1.0, 0.0, 1.0);
}`;

const FRAG = /* glsl */`
precision highp float;
varying vec2 vMM; varying vec4 vSeg; varying vec2 vP;
uniform sampler2D uTooth; uniform float uToothMM, uHard, uEraser, uGrainAmt; uniform vec2 uSize;
float h12(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
void main(){
  vec2 A = vSeg.xy, B = vSeg.zw, pa = vMM - A, ba = B - A;
  float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-8), 0.0, 1.0);
  float d = length(pa - ba * h), r = vP.x;
  float core = 1.0 - smoothstep(r * uHard, r, d);
  if (core <= 0.0) discard;
  if (uEraser > 0.5) { gl_FragColor = vec4(0.0, 0.0, 0.0, core * vP.y); return; }
  // the paper's tooth, in the same frame as the sheet's shader (rest metres / tile): graphite sticks to the ridges
  vec2 tuv = (vMM - 0.5 * uSize) / uToothMM;
  float ht = texture2D(uTooth, tuv).b * 0.62 + texture2D(uTooth, tuv * 0.7692 + vec2(0.43, 0.19)).b * 0.38;
  float press = vP.y;
  float grain = smoothstep(0.62 - 0.32 * press, 0.86 - 0.2 * press, ht + 0.12 * (h12(floor(vMM * 9.0)) - 0.5));
  float a = core * press * mix(1.0, grain, uGrainAmt) * (0.88 + 0.24 * h12(vMM * 37.0));
  gl_FragColor = vec4(1.0, 1.0, 1.0, clamp(a, 0.0, 1.0));
}`;

function mulberry(a) { return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

export class PaintLayer {
  /**
   * @param {THREE.WebGLRenderer} renderer
   * @param {object} o width (px, 1536; 1024 on phones), sheet {w,h} (m), tooth (the system's tooth tile), toothMM (30),
   *   radius (mm, pencil 0.42), alpha (0.42 per pass), eraserRadius (mm, 3.2), mips (true: needed when the sheet is
   *   small on screen; false saves the mip regeneration while it is large)
   */
  constructor(renderer, { width = 1536, sheet = { w: 0.21, h: 0.297 }, tooth = null, toothMM = 30, radius = 0.42, alpha = 0.42, eraserRadius = 3.2, mips = true } = {}) {
    this.renderer = renderer;
    this.sizeMM = new THREE.Vector2(sheet.w * 1000, sheet.h * 1000);
    const height = Math.round(width * sheet.h / sheet.w);
    this.rt = new THREE.WebGLRenderTarget(width, height, {
      type: THREE.UnsignedByteType, format: THREE.RGBAFormat, depthBuffer: false, stencilBuffer: false,
      generateMipmaps: mips, minFilter: mips ? THREE.LinearMipmapLinearFilter : THREE.LinearFilter, magFilter: THREE.LinearFilter, colorSpace: THREE.NoColorSpace,
    });
    this.rt.texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    this.texture = this.rt.texture; this.texture.name = 'paper.paint';
    this.radius = radius; this.alpha = alpha; this.eraserRadius = eraserRadius;
    this.tool = 'pencil'; this.version = 0; this.hasInk = false; this.strokes = 0;
    // instanced capsules
    const quad = new THREE.InstancedBufferGeometry();
    quad.setAttribute('position', new THREE.Float32BufferAttribute([-1, -1, 1, -1, 1, 1, -1, 1], 2));
    quad.setIndex([0, 1, 2, 0, 2, 3]);
    this.aSeg = new THREE.InstancedBufferAttribute(new Float32Array(MAX_SEG * 4), 4).setUsage(THREE.DynamicDrawUsage);
    this.aP = new THREE.InstancedBufferAttribute(new Float32Array(MAX_SEG * 2), 2).setUsage(THREE.DynamicDrawUsage);
    quad.setAttribute('aSeg', this.aSeg); quad.setAttribute('aP', this.aP);
    quad.instanceCount = 0;
    quad.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e6);   // 2D positions: never let three compute bounds
    quad.boundingBox = new THREE.Box3(new THREE.Vector3(-1e6, -1e6, -1e6), new THREE.Vector3(1e6, 1e6, 1e6));
    const blank = new THREE.DataTexture(new Uint8Array([128, 128, 160, 255]), 1, 1); blank.needsUpdate = true;
    this.uniforms = {
      uSize: { value: this.sizeMM }, uTooth: { value: tooth || blank }, uToothMM: { value: toothMM },
      uHard: { value: 0.35 }, uEraser: { value: 0 }, uGrainAmt: { value: 0.85 },
    };
    this.pencilMat = new THREE.RawShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms: this.uniforms, depthTest: false, depthWrite: false, transparent: true,
      blending: THREE.CustomBlending, blendEquation: THREE.AddEquation, blendSrc: THREE.SrcAlphaFactor, blendDst: THREE.OneMinusSrcAlphaFactor,
      blendEquationAlpha: THREE.AddEquation, blendSrcAlpha: THREE.OneFactor, blendDstAlpha: THREE.OneMinusSrcAlphaFactor });
    // the eraser removes graphite (rgb) and keeps the impression (alpha)
    this.eraserMat = new THREE.RawShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms: { ...this.uniforms, uEraser: { value: 1 } }, depthTest: false, depthWrite: false, transparent: true,
      blending: THREE.CustomBlending, blendEquation: THREE.AddEquation, blendSrc: THREE.ZeroFactor, blendDst: THREE.OneMinusSrcAlphaFactor,
      blendEquationAlpha: THREE.AddEquation, blendSrcAlpha: THREE.ZeroFactor, blendDstAlpha: THREE.OneFactor });
    this.geo = quad;
    this.mesh = new THREE.Mesh(quad, this.pencilMat); this.mesh.frustumCulled = false;
    this.scene = new THREE.Scene(); this.scene.add(this.mesh); this.cam = new THREE.Camera();
    this.queue = { pencil: [], eraser: [] };
    this._pts = []; this._last = null; this._pr = 0.75; this._down = false;
    this._clear();
  }

  /* ------------------------------------------------------------------ strokes (sheet uv, v up) */
  setTool(t) { this.tool = t === 'eraser' ? 'eraser' : 'pencil'; return this; }
  setEraser(on) { return this.setTool(on ? 'eraser' : 'pencil'); }
  begin(u, v, t = performance.now(), pressure = null) {
    const p = this._mm(u, v);
    this._pts = [p]; this._last = p; this._lt = t; this._down = true;
    this._pr = pressure ?? 0.7;
    this._emit(p, p, this._pr);                         // a dot where the pencil lands
  }
  /** continue the stroke; pressure (0..1) from a stylus, else it comes from the speed (slow = dark, wide) */
  move(u, v, t = performance.now(), pressure = null) {
    if (!this._down) { this.begin(u, v, t, pressure); return; }
    const p = this._mm(u, v), last = this._pts[this._pts.length - 1];
    const dist = Math.hypot(p.x - last.x, p.y - last.y);
    if (dist < 0.25) return;                            // ignore sub-0.25 mm jitter
    const dt = Math.max(1, t - this._lt), speed = dist / dt;   // mm / ms
    const target = pressure ?? THREE.MathUtils.clamp(1.12 - 0.85 * speed, 0.35, 1);
    this._pr += (target - this._pr) * 0.35;
    this._lt = t;
    this._pts.push(p);
    const n = this._pts.length;
    if (n >= 3) {
      const p0 = this._pts[n - 3], p1 = this._pts[n - 2], p2 = this._pts[n - 1];
      const m0 = n === 3 ? p0 : { x: (p0.x + p1.x) / 2, y: (p0.y + p1.y) / 2 }, m1 = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
      this._quad(m0, p1, m1, this._pr);
    }
  }
  /** the placeholder's name for move() */
  to(u, v, pressure) { this.move(u, v, performance.now(), pressure); }
  end() {
    if (!this._down) return;
    const n = this._pts.length;
    if (n >= 2) { const p1 = this._pts[n - 2], p2 = this._pts[n - 1], m = n >= 3 ? { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 } : p1; this._line(m, p2, this._pr * 0.8); }
    this._down = false; this._pts = []; this.strokes++;
  }
  clear() { this.queue.pencil.length = 0; this.queue.eraser.length = 0; this._clear(); this.hasInk = false; this.version++; }

  /**
   * Draw a prepared path (PaintLayer.handwritingPath) at (x, y) (uv of the start of the baseline), `width` in uv
   * (negative = mirrored, for writing on the verso). opts: { pressure, from, to } (fractions of the path's length).
   */
  strokeFromPath(path, { x = 0.16, y = 0.62, width = 0.68, pressure = 0.82, from = 0, to = 1 } = {}) {
    const W = this.sizeMM.x, H = this.sizeMM.y, sc = Math.abs(width) * W / path.width, flip = width < 0 ? -1 : 1;
    const total = path.length, a = from * total, b = to * total;
    let acc = 0;
    for (const s of path.strokes) {
      let started = false;
      for (let i = 0; i < s.length; i++) {
        const [px, py, pp] = s[i];
        if (i > 0) acc += Math.hypot(px - s[i - 1][0], py - s[i - 1][1]);
        if (acc < a || acc > b) { if (started) { this.end(); started = false; } continue; }
        const u = x + flip * px * sc / W, v = y + py * sc / H;
        const pr = pressure * (pp ?? 1);
        if (!started) { this.begin(u, v, 0, pr); started = true; } else this._segTo(u, v, pr);
      }
      if (started) this.end();
    }
    this.version++;
  }
  /** the placeholder API: draw the baked line progressively (from..to of its length); opts { row, mirror, seed } */
  bakedLine(from, to, { row = 0, mirror = false, seed = 3 } = {}) {
    const key = seed + row * 17;
    if (!this._baked || this._baked.key !== key) this._baked = { key, path: PaintLayer.handwritingPath({ seed: key }) };
    this.strokeFromPath(this._baked.path, { x: mirror ? 0.84 : 0.16, y: 0.62 - row * 0.07, width: mirror ? -0.68 : 0.68, from, to });
  }

  /* ------------------------------------------------------------------ GPU */
  /** draw everything queued since the last flush (system.update calls this every frame) */
  flush() {
    const q = this.queue;
    if (!q.pencil.length && !q.eraser.length) return false;
    const r = this.renderer, prevRT = r.getRenderTarget(), prevAC = r.autoClear, prevTM = r.toneMapping, prevXR = r.xr.enabled;
    r.autoClear = false; r.toneMapping = THREE.NoToneMapping; r.xr.enabled = false;
    r.setRenderTarget(this.rt);
    for (const tool of ['eraser', 'pencil']) {
      const list = q[tool]; if (!list.length) continue;
      this.mesh.material = tool === 'eraser' ? this.eraserMat : this.pencilMat;
      for (let off = 0; off < list.length; off += MAX_SEG) {
        const n = Math.min(MAX_SEG, list.length - off), S = this.aSeg.array, Pp = this.aP.array;
        for (let i = 0; i < n; i++) { const s = list[off + i]; S.set(s.seg, i * 4); Pp[i * 2] = s.r; Pp[i * 2 + 1] = s.a; }
        this.aSeg.needsUpdate = true; this.aP.needsUpdate = true;
        this.aSeg.clearUpdateRanges(); this.aSeg.addUpdateRange(0, n * 4); this.aP.clearUpdateRanges(); this.aP.addUpdateRange(0, n * 2);
        this.geo.instanceCount = n;
        r.render(this.scene, this.cam);
      }
      list.length = 0;
    }
    r.setRenderTarget(prevRT); r.autoClear = prevAC; r.toneMapping = prevTM; r.xr.enabled = prevXR;
    return true;
  }
  dispose() { this.rt.dispose(); this.geo.dispose(); this.pencilMat.dispose(); this.eraserMat.dispose(); }

  /* ------------------------------------------------------------------ internals */
  _mm(u, v) { return { x: u * this.sizeMM.x, y: v * this.sizeMM.y }; }
  _clear() {
    const r = this.renderer, prev = r.getRenderTarget(), pc = r.getClearColor(new THREE.Color()), pa = r.getClearAlpha();
    r.setRenderTarget(this.rt); r.setClearColor(0x000000, 0); r.clear(true, false, false);
    r.setRenderTarget(prev); r.setClearColor(pc, pa);
  }
  _segTo(u, v, pr) {             // straight polyline input (prepared paths): resampled, no smoothing lag
    const p = this._mm(u, v), last = this._last;
    this._line(last, p, pr); this._last = p;
  }
  _quad(a, c, b, pr) {           // quadratic Bezier a -> b with control c, resampled every ~0.3 mm
    const len = Math.hypot(c.x - a.x, c.y - a.y) + Math.hypot(b.x - c.x, b.y - c.y);
    const n = Math.max(1, Math.ceil(len / 0.3));
    let prev = a;
    for (let i = 1; i <= n; i++) {
      const t = i / n, mt = 1 - t;
      const p = { x: mt * mt * a.x + 2 * mt * t * c.x + t * t * b.x, y: mt * mt * a.y + 2 * mt * t * c.y + t * t * b.y };
      this._emit(prev, p, pr); prev = p;
    }
    this._last = b;
  }
  _line(a, b, pr) {
    const len = Math.hypot(b.x - a.x, b.y - a.y), n = Math.max(1, Math.ceil(len / 0.3));
    let prev = a;
    for (let i = 1; i <= n; i++) { const t = i / n, p = { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }; this._emit(prev, p, pr); prev = p; }
  }
  _emit(a, b, pr) {
    const eraser = this.tool === 'eraser';
    const r = eraser ? this.eraserRadius : this.radius * (0.6 + 0.4 * pr);
    const al = eraser ? 0.5 : this.alpha * (0.45 + 0.55 * pr);
    (eraser ? this.queue.eraser : this.queue.pencil).push({ seg: [a.x, a.y, b.x, b.y], r, a: al });
    if (!eraser) this.hasInk = true;
    this.version++;
  }

  /**
   * A line of quick, illegible pencil handwriting (never the visitor's text), in a box 1 wide: { strokes, width,
   * height, length }. Each stroke is a word: [[x, y, pressure], ...] with y up from the baseline (x-height ~ 0.018).
   */
  static handwritingPath({ seed = 3, words = 6 } = {}) {
    const rnd = mulberry(seed * 7919 + 17);
    const XH = 1;                                          // x-height (units)
    // letter skeletons in x-height units: [x, y] key points (cursive, joined), advance = last x
    const G = {
      e: [[0, 0.1], [0.45, 0.45], [0.42, 0.85], [0.12, 0.62], [0.2, 0.08], [0.62, 0.12]],
      l: [[0, 0.1], [0.42, 1.25], [0.36, 2.0], [0.12, 1.5], [0.26, 0.15], [0.62, 0.12]],
      n: [[0, 0.1], [0.12, 0.95], [0.18, 0.0], [0.38, 0.88], [0.6, 0.85], [0.66, 0.05], [0.86, 0.12]],
      u: [[0, 0.9], [0.06, 0.15], [0.3, 0.02], [0.52, 0.9], [0.52, 0.12], [0.76, 0.12]],
      o: [[0, 0.5], [0.3, 0.92], [0.55, 0.5], [0.32, 0.02], [0.08, 0.45], [0.36, 0.86], [0.78, 0.78]],
      a: [[0.5, 0.78], [0.18, 0.86], [0.02, 0.4], [0.24, 0.02], [0.5, 0.55], [0.52, 0.9], [0.56, 0.1], [0.8, 0.14]],
      r: [[0, 0.1], [0.15, 0.85], [0.35, 0.72], [0.45, 0.85], [0.5, 0.1], [0.7, 0.14]],
      s: [[0, 0.1], [0.4, 0.88], [0.18, 0.55], [0.48, 0.28], [0.24, 0.0], [0.62, 0.1]],
      t: [[0, 0.1], [0.32, 1.45], [0.22, 0.12], [0.58, 0.14]],
      i: [[0, 0.1], [0.2, 0.88], [0.24, 0.1], [0.46, 0.14]],
      d: [[0.48, 0.8], [0.15, 0.86], [0.0, 0.4], [0.22, 0.02], [0.48, 0.5], [0.6, 1.9], [0.56, 0.1], [0.82, 0.14]],
      h: [[0, 0.1], [0.32, 1.7], [0.2, 1.9], [0.12, 0.0], [0.34, 0.85], [0.56, 0.8], [0.6, 0.05], [0.82, 0.12]],
      m: [[0, 0.1], [0.1, 0.9], [0.14, 0.0], [0.3, 0.85], [0.46, 0.0], [0.62, 0.86], [0.8, 0.82], [0.84, 0.05], [1.02, 0.12]],
    };
    const keys = Object.keys(G), weights = { e: 4, a: 3, o: 3, n: 3, r: 2, s: 2, t: 2, i: 2, l: 2, u: 2, d: 1, h: 1, m: 1 };
    const bag = keys.flatMap((k) => Array(weights[k] || 1).fill(k));
    const slant = 0.24 + rnd() * 0.08;                    // italic shear
    const strokes = []; let x = 0, length = 0, maxY = 0, crossings = [];
    for (let w = 0; w < words; w++) {
      const nL = 2 + Math.floor(rnd() * 5);
      const key = [];                                     // key points of the word
      const size = 0.9 + rnd() * 0.25;
      for (let l = 0; l < nL; l++) {
        const g = G[bag[Math.floor(rnd() * bag.length)]];
        const wob = 0.85 + rnd() * 0.3, hs = (0.85 + rnd() * 0.3) * size;
        for (let k = (l === 0 ? 0 : 1); k < g.length; k++) {
          const [gx, gy] = g[k];
          key.push([x + gx * wob * size + (rnd() - 0.5) * 0.06, gy * hs * XH + (rnd() - 0.5) * 0.05]);
        }
        x += g[g.length - 1][0] * wob * size;
      }
      // Catmull-Rom through the key points, sampled densely, then sheared (slant) and given a pressure envelope
      const pts = [];
      for (let i = 0; i < key.length - 1; i++) {
        const p0 = key[Math.max(0, i - 1)], p1 = key[i], p2 = key[i + 1], p3 = key[Math.min(key.length - 1, i + 2)];
        for (let s = 0; s < 8; s++) {
          const t = s / 8, t2 = t * t, t3 = t2 * t;
          const cx = 0.5 * ((2 * p1[0]) + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3);
          const cy = 0.5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3);
          pts.push([cx, cy]);
        }
      }
      pts.push(key[key.length - 1]);
      const n = pts.length;
      const stroke = pts.map(([px, py], i) => { const e = Math.min(1, i / 6, (n - 1 - i) / 5); return [px + py * slant, py, 0.55 + 0.45 * e * (0.85 + 0.15 * Math.sin(i * 0.3))]; });
      for (let i = 1; i < stroke.length; i++) length += Math.hypot(stroke[i][0] - stroke[i - 1][0], stroke[i][1] - stroke[i - 1][1]);
      for (const p of stroke) maxY = Math.max(maxY, p[1]);
      strokes.push(stroke);
      if (rnd() < 0.35) crossings.push([x - 0.5, 1.15]);   // a t-bar or an i-dot, added after the word
      x += 0.9 + rnd() * 0.5;                             // the space between words
    }
    for (const [cx, cy] of crossings) {
      const bar = [[cx - 0.22 + cy * slant, cy, 0.6], [cx + cy * slant, cy + 0.04, 0.85], [cx + 0.28 + cy * slant, cy + 0.02, 0.6]];
      strokes.push(bar); length += 0.5;
    }
    const width = x;
    // normalise: the whole line is 1 wide; heights keep the proportion
    for (const s of strokes) for (const p of s) { p[0] /= width; p[1] /= width; }
    return { strokes, width: 1, height: maxY / width, length: length / width };
  }
}
