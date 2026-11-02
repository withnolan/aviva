// build-standees.mjs: the six s09 reviewer standees (brief 3.10, 5.12, 11.9 T18; decision #48) as two-colour
// risograph prints on die-cut card: a graphite key plate, an ink (#1F1B6E) plate and a highlighter accent plate,
// each halftoned (graphite 45°, ink 15°, accent 75°), grained, slightly misregistered and overprinted (multiply)
// on paper white, then cut out with a clean 26 px white margin and a flat base for the 3D foot (T19).
// Output: docs/assets/illustrations/standees/<name>.webp (alpha, 1024 px tall) and a contact sheet.
// Usage (site server on :8080): node work/scripts/design/build-standees.mjs [contact.png]
import { launch } from './snap.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const OUT = 'docs/assets/illustrations/standees';
const TMP = fs.mkdtempSync('/tmp/standees-');
fs.mkdirSync(OUT, { recursive: true });

// ───────────────────────── runs in the page ─────────────────────────
const PAGE = () => {
  const H = 1024, GY = 962, BASE = 1000, M = 26;
  const tone = (d) => { const v = Math.round(255 * (1 - d)); return `rgb(${v},${v},${v})`; };
  const plate = (W) => { const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, W, H); x.lineJoin = 'round'; x.lineCap = 'round'; return x; };
  const P = (d) => new Path2D(d);
  const rr = (x, y, w, h, r) => { const p = new Path2D(); p.roundRect(x, y, w, h, r); return p; };
  const el = (cx, cy, rx, ry) => { const p = new Path2D(); p.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); return p; };
  const poly = (pts) => P('M' + pts.map((q) => q.join(' ')).join('L') + 'Z');

  // a drawing context bundling the plates; f = fill density, s = stroke
  function sheet(W) {
    const L = { key: plate(W), ink: plate(W), acc: plate(W), sil: plate(W), W };
    L.fill = (pl, p, d) => { L[pl].fillStyle = tone(d); L[pl].fill(p); };
    L.stroke = (pl, p, w, d = 1) => { L[pl].strokeStyle = tone(d); L[pl].lineWidth = w; L[pl].stroke(p); };
    L.sil.fillStyle = '#000'; L.sil.strokeStyle = '#000';
    L.body = (p, inkD = 0, kw = 5) => { L.sil.fill(p); L.fill('ink', p, inkD); L.fill('key', p, 0); L.fill('acc', p, 0); if (kw) L.stroke('key', p, kw); };
    L.text = (pl, s, x, y, font, d = 1, ls = '0px', rot = 0) => { const c = L[pl]; c.save(); c.translate(x, y); c.rotate(rot); c.font = font; c.letterSpacing = ls; c.textAlign = 'center'; c.fillStyle = tone(d); c.fillText(s, 0, 0); c.restore(); };
    L.shadow = (cx, rx) => { const p = el(cx, GY + 2, rx, 14); L.sil.fill(p); L.fill('ink', p, 0.38); };
    return L;
  }

  const ART = {
    printer() {
      const L = sheet(820), c = 410;
      L.shadow(c, 330);
      // the sheet that went through first time, rising from the output tray
      const sh = P('M262 286L286 78Q430 66 574 78L598 286Z');
      L.body(sh, 0, 4); L.fill('ink', P('M262 286L272 210L588 210L598 286Z'), 0.1);
      for (const fx of [150, 640]) L.body(rr(fx, 930, 50, 30, 6), 0, 0), L.fill('key', rr(fx, 930, 50, 30, 6), 1);
      const top = P('M128 250L692 250L720 300L100 300Z'); L.body(top, 0.07);
      L.body(P('M210 262L610 262L630 292L190 292Z'), 0.6, 3.5);
      L.body(sh, 0, 4); L.fill('ink', P('M262 286L270 236L590 236L598 286Z'), 0.12); L.stroke('key', sh, 4);
      L.body(rr(100, 298, 620, 636, 26), 0.17);
      L.stroke('key', P('M100 610H720'), 4);
      L.stroke('key', rr(128, 420, 564, 170, 14), 3.5);
      for (let i = 0; i < 6; i++) L.stroke('key', P(`M146 ${446 + i * 20}H250`), 5);
      L.body(rr(548, 326, 150, 72, 8), 0.5, 3.5);
      const lcd = rr(562, 340, 84, 44, 4); L.fill('ink', lcd, 0); L.fill('acc', lcd, 0.9); L.stroke('key', lcd, 3);
      L.text('key', 'READY', 604, 368, '600 15px "Hanken Grotesk"', 1, '1px');
      for (const by of [348, 376]) L.fill('key', el(674, by, 9, 9), 1);
      const tag = rr(128, 326, 74, 40, 5); L.fill('ink', tag, 0); L.stroke('key', tag, 3);
      L.text('key', '3F', 165, 354, '600 22px "Hanken Grotesk"');
      for (const ty of [628, 780]) {
        L.stroke('key', rr(126, ty, 568, 138, 12), 3.5);
        const hd = rr(350, ty + 16, 120, 28, 12); L.fill('ink', hd, 0.75); L.stroke('key', hd, 3);
      }
      L.stroke('key', P('M640 690V730'), 6);
      return L;
    },

    biscuit() {
      const L = sheet(860), c = 430;
      // the A4 sheet on the floor, then her shadow on it
      const paper = poly([[150, 900], [710, 900], [790, 972], [70, 972]]); L.body(paper, 0, 4);
      L.fill('ink', el(c, 944, 250, 20), 0.3);
      const body = P('M300 470C228 560 196 720 226 860C240 922 300 942 430 942C560 942 620 922 634 860C664 720 632 560 560 470Z');
      L.body(body, 0.42);
      L.fill('ink', P('M382 520C352 600 350 760 380 905L480 905C510 760 508 600 478 520Z'), 0.12);
      for (const s of [-1, 1]) {
        for (let i = 0; i < 3; i++) L.stroke('ink', P(`M${c + s * 190} ${620 + i * 85}Q${c + s * 150} ${640 + i * 85} ${c + s * 132} ${600 + i * 85}`), 15, 0.8);
      }
      // the tail, curled round her paws
      const tail = P('M612 860C700 890 712 966 560 962C470 960 380 958 318 950');
      L.stroke('key', tail, 62); L.key.strokeStyle = '#fff'; L.key.lineWidth = 52; L.key.stroke(tail);
      L.stroke('ink', tail, 52, 0.42); L.sil.lineWidth = 62; L.sil.stroke(tail);
      for (const x of [520, 440, 360]) L.stroke('ink', P(`M${x} 938V986`), 12, 0.85);
      for (const x of [388, 472]) { const pw = el(x, 928, 44, 24); L.body(pw, 0.12, 4); for (const d of [-14, 0, 14]) L.stroke('key', P(`M${x + d} 912V926`), 3); }
      // head and ears
      for (const s of [-1, 1]) {
        const ear = poly([[c + s * 140, 302], [c + s * 112, 168], [c + s * 34, 262]]); L.body(ear, 0.42);
        const inner = poly([[c + s * 118, 286], [c + s * 106, 206], [c + s * 58, 262]]); L.fill('ink', inner, 0); L.fill('acc', inner, 0.55);
      }
      L.body(el(c, 400, 178, 150), 0.42);
      for (const d of [-32, 0, 32]) L.stroke('ink', P(`M${c + d} 274L${c + d * 1.15} 326`), 13, 0.85);
      L.fill('ink', el(c, 470, 70, 46), 0.12);
      for (const s of [-1, 1]) L.stroke('key', P(`M${c + s * 85} 410Q${c + s * 55} 432 ${c + s * 25} 410`), 6);
      const nose = poly([[c - 13, 448], [c + 13, 448], [c, 462]]); L.fill('acc', nose, 0.95); L.stroke('key', nose, 3);
      L.stroke('key', P(`M${c} 462Q${c} 480 ${c - 18} 484M${c} 462Q${c} 480 ${c + 18} 484`), 4);
      for (const s of [-1, 1]) for (const [a, b] of [[455, 440], [468, 474], [478, 510]]) L.stroke('key', P(`M${c + s * 62} ${a + 8}L${c + s * 200} ${b}`), 2.5);
      return L;
    },

    novelist() {
      const L = sheet(800);
      L.shadow(420, 320);
      // the stack: top and right faces show eleven years of pages
      const topF = poly([[140, 236], [210, 196], [710, 196], [640, 236]]); L.body(topF, 0.12, 4);
      const side = poly([[640, 236], [710, 196], [710, 902], [640, 942]]); L.body(side, 0.3, 4);
      for (let i = 1; i < 9; i++) { const t = i / 9; L.stroke('key', P(`M${140 + 70 * t} ${236 - 40 * t}H${640 + 70 * t}`), 1.6); }
      for (let i = 1; i < 14; i++) { const t = i / 14, j = (i * 37) % 7 - 3; L.stroke('key', P(`M${640 + 70 * t + j * 0.6} ${236 - 40 * t}V${942 - 40 * t}`), 1.6); }
      const pg = rr(140, 236, 500, 706, 2); L.body(pg, 0, 4);
      L.text('key', 'CHAPTER ONE', 390, 352, '400 30px "DM Mono"', 1, '4px');
      L.text('key', '1', 390, 900, '400 20px "DM Mono"');
      const ring = new Path2D(); ring.arc(500, 640, 64, 0.3, Math.PI * 1.85); L.stroke('ink', ring, 9, 0.5);
      const ring2 = new Path2D(); ring2.arc(504, 644, 58, 2.2, 3.4); L.stroke('ink', ring2, 4, 0.35);
      // a pink tab between the pages, and the binder clip
      const tab = poly([[708, 500], [762, 486], [762, 540], [708, 554]]); L.body(tab, 0, 3); L.fill('acc', tab, 0.85);
      L.stroke('key', P('M350 214L364 150L416 150L430 214M362 214L372 164L408 164L418 214'), 6);
      L.sil.lineWidth = 16; L.sil.stroke(P('M350 214L364 150L416 150L430 214'));
      const clip = rr(326, 208, 128, 72, 6); L.sil.fill(clip); L.fill('key', clip, 1);
      L.key.fillStyle = '#fff'; L.key.fillRect(338, 222, 104, 6);
      return L;
    },

    shredder() {
      const L = sheet(760), c = 380;
      L.shadow(c, 290);
      // the sheet going in: strips at its foot, one corner dog-eared in testing
      const sh = P('M222 318L208 78L500 78L548 126L536 318Z'); L.body(sh, 0, 4);
      const ear = poly([[500, 78], [548, 126], [500, 126]]); L.fill('ink', ear, 0.12); L.stroke('key', ear, 3);
      for (let x = 238; x < 530; x += 22) L.stroke('key', P(`M${x} 250V316`), 2);
      L.body(P('M130 300L630 300L660 336L100 336Z'), 0.3, 4);
      L.body(rr(100, 334, 560, 96, 16), 0.82);
      L.fill('key', rr(198, 310, 364, 10, 4), 1);
      L.body(P('M118 430L642 430L622 930Q620 954 596 954L164 954Q140 954 138 930Z'), 0.16);
      const win = rr(220, 510, 320, 350, 18); L.body(win, 0.75, 4);
      for (let i = 0, x = 236; x < 526; x += 22, i++) {
        const top = 640 + Math.abs(x - c) * 0.35 + ((i * 53) % 30);
        let d = `M${x} 856L${x} ${top}`; for (let y = top; y < 856; y += 36) d += `Q${x + 7} ${y + 18} ${x} ${y + 36}`;
        const strip = new Path2D(d); L.ink.strokeStyle = '#fff'; L.ink.lineWidth = 12; L.ink.stroke(strip); L.stroke('key', strip, 1.6, 0.6);
      }
      const lab = rr(436, 360, 182, 44, 6); L.fill('ink', lab, 0); L.stroke('key', lab, 3);
      L.text('key', 'ACCOUNTS', 527, 390, '600 19px "Hanken Grotesk"', 1, '2px');
      const led = el(146, 382, 11, 11); L.fill('ink', led, 0); L.fill('acc', led, 0.95); L.stroke('key', led, 3);
      return L;
    },

    pencil() {
      const L = sheet(440), c = 220;
      L.shadow(c, 150);
      for (const [x, s] of [[104, -1], [334, 1]]) {
        const sv = P(`M${x - 46} 958Q${x} 900 ${x + 46} 958Q${x + 30} 936 ${x + 16} 950Q${x} 926 ${x - 16} 950Q${x - 30} 936 ${x - 46} 958Z`);
        L.body(sv, 0.12, 3); L.stroke('acc', P(`M${x - 44} 956Q${x} 902 ${x + 44} 956`), 6, 0.9);
      }
      const eraser = P('M152 904H288V938Q288 962 262 962H178Q152 962 152 938Z'); L.body(eraser, 0.3, 4);
      const fer = rr(145, 828, 150, 78, 4); L.body(fer, 0.2, 4); L.fill('key', fer, 0.3); L.stroke('key', fer, 4);
      for (const y of [846, 866, 886]) L.stroke('key', P(`M147 ${y}H293`), 3);
      const scal = 'L295 318L277 300L258 322L220 296L182 322L163 300L145 318';
      const body = P(`M145 828L295 828${scal}Z`);
      L.sil.fill(body); L.fill('key', body, 0);
      L.fill('acc', body, 0.88);
      L.fill('ink', P('M145 828L182 828L182 322L163 300L145 318Z'), 0.25);
      L.fill('ink', P('M258 828L295 828L295 318L277 300L258 322Z'), 0.5);
      L.stroke('key', body, 5); L.stroke('key', P('M182 828V322M258 828V322'), 3);
      L.text('key', 'AVIVA HB', 220, 610, '600 30px "Hanken Grotesk"', 1, '5px', -Math.PI / 2);
      const cone = P('M145 318L163 300L182 322L220 296L258 322L277 300L295 318L234 142L206 142Z');
      L.body(cone, 0.1, 4); L.stroke('key', P('M182 322L212 160M258 322L228 160'), 2);
      const lead = P('M206 142L234 142L220 84Z'); L.sil.fill(lead); L.fill('key', lead, 1);
      return L;
    },

    bin() {
      const L = sheet(760), c = 380;
      L.shadow(c, 270);
      // the sheet that has been round before (five times, by the tally), and two crumpled balls
      const sh = P('M408 132L566 150L548 400L392 386Z'); L.body(sh, 0, 4);
      L.stroke('key', P('M440 220V268M456 220V268M472 220V268M488 220V268M432 262L498 226'), 4);
      const body = P('M130 380L630 380L582 940Q380 980 178 940Z');
      L.sil.fill(body); L.fill('ink', body, 0.13); L.fill('key', body, 0);
      L.ink.save(); L.ink.clip(body); L.key.save(); L.key.clip(body);
      for (let x = -300; x < 1100; x += 40) {
        L.stroke('ink', P(`M${x + 20} 380L${x + 20 + 330} 980M${x + 20} 380L${x + 20 - 330} 980`), 2.5, 0.55);
        L.stroke('key', P(`M${x} 380L${x + 330} 980M${x} 380L${x - 330} 980`), 3);
      }
      L.ink.restore(); L.key.restore();
      L.stroke('key', body, 5);
      for (const [x, y, r] of [[290, 350, 74], [470, 362, 62]]) {
        const b = P(`M${x - r} ${y}Q${x - r} ${y - r} ${x - 10} ${y - r + 6}Q${x + r} ${y - r - 6} ${x + r} ${y + 4}Q${x + r - 8} ${y + r} ${x} ${y + r - 4}Q${x - r + 6} ${y + r} ${x - r} ${y}Z`);
        L.body(b, 0.06, 4);
        L.stroke('key', P(`M${x - 30} ${y - 20}L${x + 4} ${y}L${x - 8} ${y + 32}M${x + 4} ${y}L${x + 36} ${y - 26}`), 2.5);
      }
      const rim = el(c, 382, 252, 36); L.sil.fill(rim); L.ink.save(); L.ink.clip(rim); L.ink.restore();
      L.stroke('key', P(`M128 382Q${c} 432 632 382`), 10);
      L.stroke('key', P('M182 938Q380 978 578 938'), 9);
      const lab = rr(296, 560, 168, 50, 6); L.fill('ink', lab, 0); L.fill('key', lab, 0); L.fill('acc', lab, 0.85); L.stroke('key', lab, 3);
      L.text('key', 'PAPER', c, 594, '600 24px "Hanken Grotesk"', 1, '4px');
      return L;
    },
  };

  // ── the print: halftone, grain, misregistration, multiply, die-cut ──
  const hash = (x, y, s) => { const t = Math.sin(x * 127.1 + y * 311.7 + s * 74.7) * 43758.5453; return t - Math.floor(t); };
  const vnoise = (x, y, sc, s) => {
    const X = x / sc, Y = y / sc, xi = Math.floor(X), yi = Math.floor(Y), fx = X - xi, fy = Y - yi;
    const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
    const a = hash(xi, yi, s), b = hash(xi + 1, yi, s), c = hash(xi, yi + 1, s), d = hash(xi + 1, yi + 1, s);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  };
  function cover(ctx, angle, seed, maxD, dx, dy, rot) {
    const W = ctx.canvas.width, src = ctx.canvas;
    const r = document.createElement('canvas'); r.width = W; r.height = H;
    const rx = r.getContext('2d'); rx.fillStyle = '#fff'; rx.fillRect(0, 0, W, H);
    rx.translate(W / 2 + dx, H / 2 + dy); rx.rotate(rot); rx.drawImage(src, -W / 2, -H / 2);
    const px = rx.getImageData(0, 0, W, H).data, out = new Float32Array(W * H);
    const a = angle * Math.PI / 180, ca = Math.cos(a), sa = Math.sin(a), p = 6.2, k = 2 * Math.PI / p;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x, D = 1 - px[i * 4] / 255;
      if (D < 0.01) continue;
      const u = x * ca + y * sa, v = -x * sa + y * ca;
      const s = 0.5 + 0.25 * (Math.cos(u * k) + Math.cos(v * k));
      let cv = Math.min(1, Math.max(0, (D * 1.06 - 0.03 - s) * 9 + 0.5));
      cv *= 0.84 + 0.16 * vnoise(x, y, 23, seed);              // mottled ink lay-down
      cv *= 0.9 + 0.1 * hash(x, y, seed + 9);                     // fine grain
      if (hash(x, y, seed + 3) > 0.985) cv *= 0.2;               // white specks in the solids
      out[i] = cv * maxD;
    }
    return out;
  }
  function print(name, seed) {
    const L = ART[name](), W = L.W;
    const G = [42, 41, 38], I = [31, 27, 110], A = name === 'biscuit' || name === 'novelist' ? [255, 148, 202] : [234, 243, 63];
    const mr = (n) => (hash(seed, n, 5) - 0.5);
    const cG = cover(L.key, 45, seed + 1, 0.95, 0, 0, 0);
    const cI = cover(L.ink, 15, seed + 2, 0.93, 2.2 + 1.6 * mr(1), -1.6 + 1.2 * mr(2), 0.0022 * mr(3));
    const cA = cover(L.acc, 75, seed + 3, 0.9, -1.8 + mr(4), 1.4 + mr(5), 0);
    // die-cut: dilate the silhouette (blur, low threshold), round it (blur, mid threshold), flat base
    const step = (src, blur, thr) => {
      const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
      x.filter = `blur(${blur}px)`; x.drawImage(src, 0, 0); x.filter = 'none';
      const d = x.getImageData(0, 0, W, H); for (let i = 0; i < d.data.length; i += 4) { const v = d.data[i] < 255 * (1 - thr) ? 0 : 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
      x.putImageData(d, 0, 0); return c;
    };
    let cut = step(L.sil.canvas, M / 1.56, 0.06);
    const cx = cut.getContext('2d'); cx.fillStyle = '#fff'; cx.fillRect(0, BASE, W, H - BASE);
    // close the foot: the card runs straight down to the base under its widest ground contact
    const row = cx.getImageData(0, GY + 10, W, 1).data; let x0 = W, x1 = 0;
    for (let x = 0; x < W; x++) if (row[x * 4] === 0) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); }
    cx.fillStyle = '#000'; cx.fillRect(x0, GY + 10, x1 - x0, BASE - GY - 10);
    cut = step(cut, 5, 0.5);
    const cc = cut.getContext('2d'); cc.fillStyle = '#fff'; cc.fillRect(0, BASE, W, H - BASE);
    const aa = document.createElement('canvas'); aa.width = W; aa.height = H; const ax = aa.getContext('2d');
    ax.filter = 'blur(0.7px)'; ax.drawImage(cut, 0, 0);
    const al = ax.getImageData(0, 0, W, H).data;
    const o = document.createElement('canvas'); o.width = W; o.height = H; const ox = o.getContext('2d'); const img = ox.createImageData(W, H), d = img.data;
    const paper = [247, 245, 240];
    for (let i = 0; i < W * H; i++) {
      for (let ch = 0; ch < 3; ch++) d[i * 4 + ch] = paper[ch] * (1 - cG[i] + cG[i] * G[ch] / 255) * (1 - cI[i] + cI[i] * I[ch] / 255) * (1 - cA[i] + cA[i] * A[ch] / 255);
      d[i * 4 + 3] = 255 - al[i * 4];
    }
    ox.putImageData(img, 0, 0);
    return o.toDataURL('image/png');
  }
  window.__print = print;
};

const b = await launch();
const p = await b.newPage();
await p.goto('http://localhost:8080/lab/styleguide.html');
await p.setContent(`<!doctype html><style>
@font-face{font-family:"Hanken Grotesk";src:url(/assets/fonts/hanken-grotesk-var-latin.woff2) format("woff2");font-weight:100 900}
@font-face{font-family:"DM Mono";src:url(/assets/fonts/dm-mono-400-latin.woff2) format("woff2")}</style><body>x</body>`);
await p.evaluate(async () => { await document.fonts.load('600 20px "Hanken Grotesk"'); await document.fonts.load('400 20px "DM Mono"'); });
await p.addScriptTag({ content: `(${PAGE.toString()})()` });
const names = ['printer', 'biscuit', 'novelist', 'shredder', 'pencil', 'bin'];
const files = [];
for (const [i, n] of names.entries()) {
  const url = await p.evaluate(([n, s]) => window.__print(n, s), [n, 11 + i * 7]);
  const png = path.join(TMP, n + '.png'); fs.writeFileSync(png, Buffer.from(url.split(',')[1], 'base64'));
  const out = path.join(OUT, n + '.webp');
  for (const q of [80, 72, 64, 56, 48, 42, 36]) {
    execFileSync('convert', [png, '-quality', String(q), '-define', 'webp:alpha-quality=100', '-define', 'webp:method=6', out]);
    if (fs.statSync(out).size <= 120 * 1024) break;
  }
  console.log(n, (fs.statSync(out).size / 1024).toFixed(1), 'KB');
  files.push(out);
}
await b.close();
if (process.argv[2]) {
  execFileSync('montage', [...files, '-resize', 'x420', '-tile', '6x1', '-geometry', '+18+18', '-background', '#120F45', process.argv[2]]);
  console.log('contact sheet →', process.argv[2]);
}
