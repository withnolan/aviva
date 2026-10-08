// build-fig5.mjs: Figure 5 of the research paper, three brightfield "micrographs" of ink spreading through an 80 g/m²
// sheet at t = 0.05, 0.35 and 1.0, rendered from the same closed-form ink-front model as the site's absorption view
// (work/scripts/paper-proto/ink-front.js): a ragged capillary blot of radius R = 0.16 + 0.34 √t mm, wicking further
// along the individual fibres that cross it, a darker core, a lighter body and a faint damp halo ahead of the edge.
// This version is for print: a 1.6 mm field at 1000 px, a fibre mat in three depth layers (only the top one in focus),
// ribbon fibres that twist, lumens and pits, Beer–Lambert colour in linear light, the brand ink at full strength.
// Same sample (same seed) in all three panels: it is one drop, photographed three times.
//
// Usage: node work/scripts/design/build-fig5.mjs [--size 1000] [--out docs/research/src/figures] [--q 86]
// Output: fig5-t0.05.jpg fig5-t0.35.jpg fig5-t1.0.jpg (PNG → JPEG with ImageMagick `convert`).
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { execFileSync } from 'node:child_process';

const argv = process.argv.slice(2);
const opt = (n, d) => { const i = argv.indexOf(`--${n}`); return i === -1 ? d : argv[i + 1]; };
const N = +opt('size', 1000), OUT = opt('out', 'docs/research/src/figures'), Q = +opt('q', 86);
const FIELD = 1.6, PX = N / FIELD;                         // mm across, px per mm
const TIMES = [0.05, 0.35, 1.0];

// ---------- deterministic helpers
function mulberry32(a) { return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const rnd = mulberry32(20261007);
const gauss = () => { let u = 0, v = 0; while (!u) u = rnd(); while (!v) v = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
const hash2 = (x, y) => { let h = (x * 374761393 + y * 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
const vnoise = (x, y) => { const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi; const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash2(xi, yi), b = hash2(xi + 1, yi), c = hash2(xi, yi + 1), d = hash2(xi + 1, yi + 1); return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v; };
const fbm = (x, y, oct = 4) => { let s = 0, a = 0.5, f = 1, n = 0; for (let i = 0; i < oct; i++) { s += a * vnoise(x * f + i * 17.3, y * f - i * 9.1); n += a; a *= 0.5; f *= 2.03; } return s / n; };
const smooth = (e0, e1, x) => { const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);

// separable blur ≈ Gaussian (three box passes)
function blur(src, sigma) {
  if (sigma <= 0.25) return src;
  const w = Math.max(1, Math.round(Math.sqrt((12 * sigma * sigma) / 3 + 1)));   // box width for 3 passes
  const r = (w - 1) >> 1 || 1;
  let a = Float32Array.from(src), b = new Float32Array(src.length);
  for (let pass = 0; pass < 3; pass++) {
    for (let y = 0; y < N; y++) {                       // horizontal
      const row = y * N; let acc = 0;
      for (let x = -r; x <= r; x++) acc += a[row + Math.min(N - 1, Math.max(0, x))];
      for (let x = 0; x < N; x++) { b[row + x] = acc / (2 * r + 1); acc += a[row + Math.min(N - 1, x + r + 1)] - a[row + Math.max(0, x - r)]; }
    }
    for (let x = 0; x < N; x++) {                       // vertical
      let acc = 0;
      for (let y = -r; y <= r; y++) acc += b[Math.min(N - 1, Math.max(0, y)) * N + x];
      for (let y = 0; y < N; y++) { a[y * N + x] = acc / (2 * r + 1); acc += b[Math.min(N - 1, y + r + 1) * N + x] - b[Math.max(0, y - r) * N + x]; }
    }
  }
  return a;
}

// ---------- the fibre mat: three depth layers; only layer 0 is in focus
const LAYERS = [{ n: 90, sigma: 0.55, opacity: 0.15, edge: 0.27 }, { n: 140, sigma: 1.7, opacity: 0.11, edge: 0.16 }, { n: 230, sigma: 4.4, opacity: 0.08, edge: 0.09 }];
const MD = 0.18;                                         // machine direction (rad): fibres lean this way
const fibres = [];
for (let li = 0; li < LAYERS.length; li++) {
  for (let i = 0; i < LAYERS[li].n; i++) {
    const soft = rnd() < 0.36;                            // softwood: longer, wider, pitted; hardwood: short, narrow
    const L = soft ? 1.6 + rnd() * 1.6 : 0.6 + rnd() * 0.7;
    const hw = soft ? 0.0105 + rnd() * 0.0085 : 0.0055 + rnd() * 0.0045;   // half-width, mm
    const ang = MD + gauss() * 0.62, cx = -0.25 + rnd() * (FIELD + 0.5), cy = -0.25 + rnd() * (FIELD + 0.5);
    const dx = Math.cos(ang) * L / 2, dy = Math.sin(ang) * L / 2, nx = -Math.sin(ang), ny = Math.cos(ang);
    const b1 = gauss() * 0.08 * L, b2 = gauss() * 0.08 * L;
    const P = [[cx - dx, cy - dy], [cx - dx / 3 + nx * b1, cy - dy / 3 + ny * b1], [cx + dx / 3 + nx * b2, cy + dy / 3 + ny * b2], [cx + dx, cy + dy]];
    fibres.push({ li, soft, L, hw, P, twistP: 0.22 + rnd() * 0.4, twistPh: rnd() * Math.PI, wick: rnd(), opacity: LAYERS[li].opacity * (0.75 + rnd() * 0.5) });
  }
}
const bez = (P, t) => { const u = 1 - t; return [u * u * u * P[0][0] + 3 * u * u * t * P[1][0] + 3 * u * t * t * P[2][0] + t * t * t * P[3][0], u * u * u * P[0][1] + 3 * u * u * t * P[1][1] + 3 * u * t * t * P[2][1] + t * t * t * P[3][1]]; };

// rasterise every fibre once: per-layer density, edge (refraction line), lumen; and per-fibre pixel lists for the ink
const dens = LAYERS.map(() => new Float32Array(N * N)), edge = LAYERS.map(() => new Float32Array(N * N)), lumen = LAYERS.map(() => new Float32Array(N * N));
const pres = new Float32Array(N * N);
const dist = new Float32Array(N * N).fill(1e9), sAt = new Float32Array(N * N);
for (const f of fibres) {
  // centreline samples (px)
  const M = Math.max(8, Math.ceil(f.L * PX / 1.5));
  const pts = [], sArr = [0];
  for (let k = 0; k <= M; k++) { const [x, y] = bez(f.P, k / M); pts.push([x * PX, y * PX]); }
  for (let k = 1; k <= M; k++) sArr.push(sArr[k - 1] + Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]) / PX);
  f.pts = pts; f.sArr = sArr; f.len = sArr[M];
  const hwMax = f.hw * PX + 3;
  let x0 = N, y0 = N, x1 = -1, y1 = -1;
  for (const [x, y] of pts) { x0 = Math.min(x0, x - hwMax); y0 = Math.min(y0, y - hwMax); x1 = Math.max(x1, x + hwMax); y1 = Math.max(y1, y + hwMax); }
  x0 = Math.max(0, Math.floor(x0)); y0 = Math.max(0, Math.floor(y0)); x1 = Math.min(N - 1, Math.ceil(x1)); y1 = Math.min(N - 1, Math.ceil(y1));
  if (x1 < x0 || y1 < y0) { f.pix = []; continue; }
  for (let k = 0; k < M; k++) {
    const [ax, ay] = pts[k], [bx, by] = pts[k + 1], ex = bx - ax, ey = by - ay, l2 = ex * ex + ey * ey || 1e-6;
    const sx0 = Math.max(x0, Math.floor(Math.min(ax, bx) - hwMax)), sx1 = Math.min(x1, Math.ceil(Math.max(ax, bx) + hwMax));
    const sy0 = Math.max(y0, Math.floor(Math.min(ay, by) - hwMax)), sy1 = Math.min(y1, Math.ceil(Math.max(ay, by) + hwMax));
    for (let y = sy0; y <= sy1; y++) for (let x = sx0; x <= sx1; x++) {
      const px = x + 0.5 - ax, py = y + 0.5 - ay; let t = (px * ex + py * ey) / l2; t = t < 0 ? 0 : t > 1 ? 1 : t;
      const qx = px - t * ex, qy = py - t * ey, d = Math.sqrt(qx * qx + qy * qy), idx = y * N + x;
      if (d < dist[idx]) { dist[idx] = d; sAt[idx] = sArr[k] + t * (sArr[k + 1] - sArr[k]); }
    }
  }
  const pix = [];
  const ends = 0.04;                                       // fibre ends taper over 40 µm
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    const idx = y * N + x, d = dist[idx];
    if (d > 1e8) continue;
    dist[idx] = 1e9;                                       // reset for the next fibre
    const s = sAt[idx];
    const taper = smooth(0, ends, s) * smooth(0, ends, f.len - s);
    const tw = 0.42 + 0.58 * Math.abs(Math.cos(Math.PI * s / f.twistP + f.twistPh));   // ribbon twist
    const hwp = f.hw * PX * tw * (0.35 + 0.65 * taper);
    if (d > hwp + 2.5) continue;
    const cov = clamp01((hwp + 0.6 - d) / 1.2);
    const e = Math.exp(-(((d - hwp) / 0.95) ** 2)) * (0.55 + 0.45 * tw);
    const lu = f.soft ? Math.exp(-((d / (0.32 * hwp + 0.01)) ** 2)) * tw : 0;
    let pit = 0;
    if (f.soft && cov > 0.5) { const sp = 0.055, ph = ((s / sp) % 1 + 1) % 1, dc = Math.hypot((ph - 0.5) * sp * PX, d * 0.9); const pr = 0.28 * hwp; pit = Math.exp(-(((dc - pr) / 0.9) ** 2)) * 0.5; }
    dens[f.li][idx] += cov * f.opacity;
    edge[f.li][idx] = Math.max(edge[f.li][idx], e * LAYERS[f.li].edge + pit * 0.22);
    lumen[f.li][idx] = Math.max(lumen[f.li][idx], lu * 0.5);
    pres[idx] += cov * (f.li === 0 ? 1 : f.li === 1 ? 0.7 : 0.45);
    if (cov > 0.02) pix.push(idx, cov, s);
  }
  f.pix = pix;
}
// blurred layers (depth of field)
const densB = dens.map((a, i) => blur(a, LAYERS[i].sigma)), edgeB = edge.map((a, i) => blur(a, LAYERS[i].sigma)), lumB = lumen.map((a, i) => blur(a, LAYERS[i].sigma));
const presB = blur(pres, 2.2), presB2 = blur(pres, 4.5);
let pm = 0; for (let i = 0; i < pres.length; i++) pm += presB[i]; pm /= pres.length;
// formation: the deep mat below the visible layers, as a cloudy transmittance
const form = new Float32Array(N * N);
for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const u = x / PX, v = y / PX; form[y * N + x] = 0.55 * fbm(u * 5.5, v * 5.5, 5) + 0.45 * fbm(u * 19 + 3, v * 19 - 7, 3); }

// ---------- linear-light colour
const toLin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const toSRGB = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);
const hexLin = (h) => [1, 3, 5].map((i) => toLin(parseInt(h.slice(i, i + 2), 16) / 255));
const BG = hexLin('#F2F4F4');                              // brightfield illumination, a touch cool
const INK = hexLin('#2E2A8E');                             // the brand ink: C = 1 over clear field gives exactly this
const A = INK.map((c, i) => -Math.log(c / BG[i]));         // absorbance per unit concentration (Beer–Lambert)

function render(t) {
  const R = 0.16 + 0.34 * Math.sqrt(t);                     // mm, the ink-front.js law
  const cx = FIELD * 0.5, cy = FIELD * 0.5;
  const blot = new Float32Array(N * N), halo = new Float32Array(N * N);
  const presStd = 0.5 * pm + 1e-3;
  const ragAt = (u, v) => { const ddx = u - cx, ddy = v - cy, a = Math.atan2(ddy, ddx);
    return 1 + 0.12 * (fbm(Math.cos(a) * 2.6 + 4, Math.sin(a) * 2.6 + 4, 4) - 0.5) + 0.09 * (fbm(Math.cos(a) * 9 + 1, Math.sin(a) * 9 - 3, 3) - 0.5)
      + 0.2 * (fbm(u * 14, v * 14, 3) - 0.5) + 0.12 * (fbm(u * 40 + 5, v * 40 - 2, 2) - 0.5); };
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const idx = y * N + x, u = (x + 0.5) / PX, v = (y + 0.5) / PX, r = Math.hypot(u - cx, v - cy);
    const fibrous = 1 + 0.1 * Math.max(-1.5, Math.min(1.5, (presB2[idx] - pm) / presStd));    // capillaries pull ink further
    const edgeR = R * ragAt(u, v) * fibrous;
    const b = 1 - smooth(edgeR * 0.94, edgeR * 1.03, r);
    const core = 0.84 + 0.26 * Math.exp(-((r / (0.6 * R)) ** 2)) + 0.07 * smooth(edgeR * 0.72, edgeR * 0.97, r);   // darkest where the drop landed; a faint drying margin
    blot[idx] = b * core * (0.8 + 0.2 * clamp01(presB[idx] / (2 * pm)));                    // fibres hold more dye than voids
    halo[idx] = (1 - b) * (1 - smooth(edgeR, edgeR + 0.035 + 0.05 * t, r)) * 0.09;          // the damp halo
  }
  // wicking along the fibres that cross the blot
  const wick = LAYERS.map(() => new Float32Array(N * N));
  for (const f of fibres) {
    if (!f.pix.length) continue;
    const M = f.pts.length - 1, inside = new Uint8Array(M + 1);
    let any = false;
    for (let k = 0; k <= M; k++) { const u = f.pts[k][0] / PX, v = f.pts[k][1] / PX; if (Math.hypot(u - cx, v - cy) < R * ragAt(u, v) * 0.97) { inside[k] = 1; any = true; } }
    if (!any) continue;
    const wl = (0.02 + 0.15 * f.wick * f.wick) * (0.4 + 0.6 * t) * (f.soft ? 1.15 : 0.8) * (f.li === 2 ? 0.6 : 1);   // mm: most fibres barely feather
    // distance along the fibre to the nearest inside sample
    const dS = new Float32Array(M + 1).fill(1e9);
    for (let k = 0; k <= M; k++) if (inside[k]) dS[k] = 0; else if (k > 0) dS[k] = dS[k - 1] + (f.sArr[k] - f.sArr[k - 1]);
    for (let k = M - 1; k >= 0; k--) dS[k] = Math.min(dS[k], dS[k + 1] + (f.sArr[k + 1] - f.sArr[k]));
    const sStep = f.len / M, W = wick[f.li];
    for (let j = 0; j < f.pix.length; j += 3) {
      const idx = f.pix[j], cov = f.pix[j + 1], s = f.pix[j + 2];
      const k = Math.min(M, Math.max(0, Math.round(s / sStep))), d = dS[k];
      if (d >= wl) continue;
      const c = cov * Math.pow(1 - d / wl, 2.1) * (0.8 + 0.2 * f.wick);
      if (c > W[idx]) W[idx] = c;
    }
  }
  const wickB = wick.map((a, i) => blur(a, LAYERS[i].sigma * 0.9));
  const blotB = blur(blot, 1.1), haloB = blur(halo, 3);
  // compose
  const rgb = Buffer.alloc(N * N * 3);
  const nrnd = mulberry32(99);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const idx = y * N + x;
    const rr = Math.hypot(x - N / 2, y - N / 2) / (N * 0.5);
    const vig = 1 - 0.3 * smooth(0.5, 1.12, rr);
    const dTot = densB[0][idx] + densB[1][idx] + densB[2][idx];
    const eTot = edgeB[0][idx] + 0.7 * edgeB[1][idx] + 0.45 * edgeB[2][idx];
    const lTot = lumB[0][idx] + 0.5 * lumB[1][idx];
    const fibreT = Math.exp(-dTot * 0.92) * (1 - 0.32 * Math.min(1, eTot)) * (1 + 0.07 * lTot) * (0.86 + 0.14 * form[idx]);
    const C = Math.max(blotB[idx], 0.95 * wickB[0][idx], 0.85 * wickB[1][idx], 0.7 * wickB[2][idx]) + haloB[idx];
    const noise = 1 + (nrnd() - 0.5) * 0.022;
    for (let c = 0; c < 3; c++) {
      let v = BG[c] * vig * fibreT * Math.exp(-A[c] * C) * noise;
      v = toSRGB(Math.min(1, Math.max(0, v)));
      rgb[idx * 3 + c] = Math.round(v * 255);
    }
  }
  return rgb;
}

// ---------- PNG writer (RGB, 8 bit)
function png(rgb) {
  const raw = Buffer.alloc((N * 3 + 1) * N);
  for (let y = 0; y < N; y++) { raw[y * (N * 3 + 1)] = 0; rgb.copy(raw, y * (N * 3 + 1) + 1, y * N * 3, (y + 1) * N * 3); }
  const crcT = new Int32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; return c; });
  const crc = (b) => { let c = -1; for (const x of b) c = crcT[(c ^ x) & 255] ^ (c >>> 8); return (c ^ -1) >>> 0; };
  const chunk = (type, data) => { const l = Buffer.alloc(4); l.writeUInt32BE(data.length); const td = Buffer.concat([Buffer.from(type), data]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([l, td, c]); };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(N, 0); ihdr.writeUInt32BE(N, 4); ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: 6 })), chunk('IEND', Buffer.alloc(0))]);
}

fs.mkdirSync(OUT, { recursive: true });
for (const t of TIMES) {
  const name = `fig5-t${t === 1 ? '1.0' : t}`;
  const tmp = path.join(OUT, name + '.png');
  fs.writeFileSync(tmp, png(render(t)));
  execFileSync('convert', [tmp, '-strip', '-sampling-factor', '4:4:4', '-quality', String(Q), path.join(OUT, name + '.jpg')]);
  fs.unlinkSync(tmp);
  console.log(name + '.jpg', (fs.statSync(path.join(OUT, name + '.jpg')).size / 1024).toFixed(0), 'KB');
}
