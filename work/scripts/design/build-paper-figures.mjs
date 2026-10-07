// Draws the research paper's vector figures (1, 2, 3, 4, 6) into docs/research/src/figures/*.svg.
// Units are millimetres (viewBox in mm), so a figure placed at its viewBox width prints at true size.
// Style: the site's graphite line drawing. Graphite lines, ink-blue only for accents (the A4 cell, the aviva bars).
// Text uses the paper's own @font-face ("Hanken Grotesk"); the SVGs are inlined into paper.html at print time.
// Usage: node work/scripts/design/build-paper-figures.mjs
import fs from 'node:fs';
import path from 'node:path';

const OUT = 'docs/research/src/figures';
const G = '#2A2926', MUTED = '#615F58', INK = '#2E2A8E', RULE = '#C9C6BE';
const PT = 0.3528;                       // 1 pt in mm
const r = (v) => +(+v).toFixed(3);
const sans = (size, extra = '') => `font-family="Hanken Grotesk, Helvetica, Arial, sans-serif" font-size="${r(size * PT)}" ${extra}`;
const svg = (w, h, body, title) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${r(w)} ${r(h)}" width="${r(w)}mm" height="${r(h)}mm" role="img" aria-label="${title}">${body}</svg>\n`;
const text = (x, y, s, size, extra = '') => `<text x="${r(x)}" y="${r(y)}" ${sans(size, extra)}${/fill=/.test(extra) ? '' : ` fill="${G}"`}>${s}</text>`;
fs.mkdirSync(OUT, { recursive: true });

// ---------- Figure 1: aviva A4 and a typical output, same scale ----------
{
  const W = 170, H = 74, h = 60, w = h / Math.SQRT2, gap = 34;
  const x1 = (W - 2 * w - gap) / 2, x2 = x1 + w + gap, y = 3;
  const sheet = (x) => `<rect x="${r(x)}" y="${y}" width="${r(w)}" height="${r(h)}" fill="#fff" stroke="${G}" stroke-width="${r(0.5 * PT)}" filter="url(#f1s)"/>`;
  const body = `<defs><filter id="f1s" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0.5" dy="1.1" stdDeviation="1.1" flood-color="${G}" flood-opacity="0.13"/></filter></defs>` +
    sheet(x1) + sheet(x2) +
    text(x1 + w / 2, y + h + 7.4, 'aviva A4', 8, 'text-anchor="middle"') + text(x2 + w / 2, y + h + 7.4, 'Output', 8, 'text-anchor="middle"');
  fs.writeFileSync(path.join(OUT, 'fig1.svg'), svg(W, H, body, 'Two identical blank A4 rectangles labelled aviva A4 and Output'));
}

// ---------- Figure 2: the A-series nesting diagram, A0 halved into A1 … A10 ----------
{
  const A0w = 56, A0h = A0w * Math.SQRT2, ox = 1, oy = 1.5, W = 81.5, H = oy + A0h + 2;
  // Successive halvings: the remainder alternates between the bottom half (landscape cuts) and the right half (portrait cuts).
  let x = ox, y = oy, w = A0w, h = A0h;
  const cells = [];
  for (let k = 1; k <= 10; k++) {
    if (w < h) { // portrait: cut horizontally; top half is A_k, the remainder is the bottom half
      cells.push({ k, x, y, w, h: h / 2 }); y += h / 2; h /= 2;
    } else {     // landscape: cut vertically; left half is A_k, the remainder is the right half
      cells.push({ k, x, y, w: w / 2, h }); x += w / 2; w /= 2;
    }
  }
  cells.push({ k: 10, x, y, w, h, twin: true }); // the last remainder is a second A10
  const sw = r(0.35 * PT);
  let body = `<rect x="${ox}" y="${oy}" width="${r(A0w)}" height="${r(A0h)}" fill="#fff" stroke="${G}" stroke-width="${r(0.6 * PT)}"/>`;
  for (const c of cells) body += `<rect x="${r(c.x)}" y="${r(c.y)}" width="${r(c.w)}" height="${r(c.h)}" fill="none" stroke="${G}" stroke-width="${sw}"/>`;
  const a4 = cells.find((c) => c.k === 4);
  body += `<rect x="${r(a4.x)}" y="${r(a4.y)}" width="${r(a4.w)}" height="${r(a4.h)}" fill="none" stroke="${INK}" stroke-width="${r(0.9 * PT)}"/>`;
  // labels: inside where they fit (small caps via letter-spacing + capitals at a smaller size), leaders for the smallest
  const lab = (c, s) => `A${c.k}`;
  const leaderX = ox + A0w + 5;
  const small = cells.filter((c) => c.w < 6).map((c) => ({ ...c, cx: c.x + c.w / 2, cy: c.y + c.h / 2 }))
    .sort((a, b) => a.cy - b.cy || a.cx - b.cx);
  let ly = oy + A0h - (small.length - 1) * 4.6 - 1;
  for (const c of cells.filter((c) => c.w >= 6)) {
    const cx = c.x + c.w / 2, cy = c.y + c.h / 2, size = Math.max(4.6, Math.min(9, c.w * 0.55));
    body += text(cx, cy + size * PT * 0.36, lab(c), size, `text-anchor="middle" letter-spacing="0.06em"${c.k === 4 ? ` fill="${INK}"` : ''}`);
  }
  for (const c of small) {
    body += `<path d="M${r(c.cx)} ${r(c.cy)}L${r(leaderX - 1.2)} ${r(ly - 0.9)}" stroke="${MUTED}" stroke-width="${r(0.25 * PT)}" fill="none"/>` +
      `<circle cx="${r(c.cx)}" cy="${r(c.cy)}" r="0.3" fill="${G}"/>` + text(leaderX, ly, lab(c), 6, 'letter-spacing="0.06em"');
    ly += 4.6;
  }
  // dimension note for A0
  body += text(ox + A0w + 4, oy + 4, 'A0 = 1 m²', 6.5) + text(ox + A0w + 4, oy + 8.2, '841 × 1189 mm', 6.5, `fill="${MUTED}"`).replace(`fill="${G}" fill`, 'fill');
  fs.writeFileSync(path.join(OUT, 'fig2.svg'), svg(W, H, body, 'The A-series: an A0 rectangle halved repeatedly into A1 to A10, with the A4 cell outlined in ink blue'));
}

// ---------- Figure 3: win rate, two equal bars, zero-length error bars ----------
{
  const W = 81.5, H = 58, x0 = 13, y0 = 47, ph = 40, pw = 62;    // plot origin bottom-left, plot height/width
  const yv = (p) => y0 - (p / 100) * ph;
  let body = '';
  for (const p of [0, 25, 50, 75, 100]) {
    body += `<path d="M${x0} ${r(yv(p))}H${x0 + pw}" stroke="${p ? RULE : G}" stroke-width="${r((p ? 0.3 : 0.6) * PT)}"/>` +
      text(x0 - 2, yv(p) + 0.9, `${p}`, 6.5, `text-anchor="end" fill="${MUTED}"`).replace(`fill="${G}" `, '');
  }
  body += `<text transform="translate(3.2 ${r(y0 - ph / 2)}) rotate(-90)" ${sans(6.5, 'text-anchor="middle"')} fill="${MUTED}">Win rate (%)</text>`;
  const bw = 15;
  for (const [i, cx] of [[0, x0 + pw * 0.3], [1, x0 + pw * 0.7]]) {
    body += `<rect x="${r(cx - bw / 2)}" y="${r(yv(50))}" width="${bw}" height="${r(ph / 2)}" fill="${INK}" fill-opacity="0.9"/>` +
      // the error bar: drawn, length zero (whisker and caps coincide at 50.0 %)
      `<path d="M${r(cx - 2.2)} ${r(yv(50))}H${r(cx + 2.2)}M${r(cx)} ${r(yv(50))}V${r(yv(50))}" stroke="${G}" stroke-width="${r(0.7 * PT)}" stroke-linecap="round"/>` +
      text(cx, yv(50) - 2.4, '50.0', 7, 'text-anchor="middle"') +
      text(cx, y0 + 4.6, 'aviva A4', 7, 'text-anchor="middle"');
  }
  fs.writeFileSync(path.join(OUT, 'fig3.svg'), svg(W, H, body, 'Bar chart: two equal bars, both labelled aviva A4, at 50.0 percent, with error bars of zero length'));
}

// ---------- Figure 4: thickness against folds, log axis 0.1 mm to 10^12 mm ----------
{
  const W = 170, H = 80, x0 = 20, y0 = 68, pw = 118, ph = 62;
  const xv = (n) => x0 + (n / 42) * pw;
  const yv = (mm) => y0 - ((Math.log10(mm) + 1) / 13) * ph;     // 10^-1 … 10^12
  let body = '';
  // grid + y labels every decade (labels every other decade)
  for (let e = -1; e <= 12; e++) {
    body += `<path d="M${x0} ${r(yv(10 ** e))}H${x0 + pw}" stroke="${RULE}" stroke-width="${r(0.25 * PT)}"/>`;
    if ((e + 1) % 2 === 0) {
      const lab = e === -1 ? '0.1' : e === 0 ? '1' : e === 1 ? '10' : `10<tspan dy="-1" font-size="${r(4.6 * PT)}">${e}</tspan>`;
      body += `<text x="${x0 - 2}" y="${r(yv(10 ** e) + 0.9)}" ${sans(6.5, 'text-anchor="end"')} fill="${MUTED}">${lab}</text>`;
    }
  }
  for (const n of [0, 6, 7, 12, 18, 24, 30, 36, 42]) {
    body += `<path d="M${r(xv(n))} ${y0}v1.2" stroke="${G}" stroke-width="${r(0.4 * PT)}"/>` + text(xv(n), y0 + 4.4, `${n}`, 6.5, 'text-anchor="middle"');
  }
  body += `<path d="M${x0} ${y0 - ph}V${y0}H${x0 + pw}" fill="none" stroke="${G}" stroke-width="${r(0.6 * PT)}"/>`;
  body += text(x0 + pw / 2, y0 + 9.4, 'Folds, n', 6.5, 'text-anchor="middle"');
  body += `<text transform="translate(4.5 ${r(y0 - ph / 2)}) rotate(-90)" ${sans(6.5, 'text-anchor="middle"')} fill="${MUTED}">Thickness (mm, log)</text>`;
  // reference lines: a ream (≈ 5 cm) and the Moon (384,400 km)
  for (const [mm, lab] of [[50, 'a ream, ≈ 5 cm'], [3.844e11, 'the Moon, 384,400 km']]) {
    body += `<path d="M${x0} ${r(yv(mm))}H${x0 + pw}" stroke="${G}" stroke-width="${r(0.45 * PT)}" stroke-dasharray="0.6 0.9"/>` +
      text(x0 + pw + 2, yv(mm) + 0.9, lab, 6.5);
  }
  // the roadmap (dashed) beyond n = 6, the sheet (solid + dots) for n = 0..6
  const pts = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => `${r(xv(a + i))} ${r(yv(0.1 * 2 ** (a + i)))}`);
  body += `<path d="M${pts(6, 42).join('L')}" fill="none" stroke="${G}" stroke-width="${r(0.6 * PT)}" stroke-dasharray="1.6 1.1"/>`;
  body += `<path d="M${pts(0, 6).join('L')}" fill="none" stroke="${G}" stroke-width="${r(0.9 * PT)}"/>`;
  for (let n = 0; n <= 6; n++) body += `<circle cx="${r(xv(n))}" cy="${r(yv(0.1 * 2 ** n))}" r="0.62" fill="${G}"/>`;
  // the wall at n = 6 and the alternating-direction seventh fold
  body += `<path d="M${r(xv(6))} ${y0 - ph}V${y0}" stroke="${G}" stroke-width="${r(0.35 * PT)}"/>` +
    text(xv(6) + 1.4, yv(1e8), 'wall (same direction each time)', 6.5);
  body += `<circle cx="${r(xv(7))}" cy="${r(yv(12.8))}" r="0.75" fill="#fff" stroke="${G}" stroke-width="${r(0.6 * PT)}"/>` +
    text(xv(7) + 1.8, yv(12.8) + 3.6, 'alternating: 7', 6.5);
  body += text(xv(2.2), yv(0.1 * 2 ** 4) - 4.4, 'our sheet', 6.5) + text(xv(30), yv(0.1 * 2 ** 30) - 3, 'our roadmap', 6.5, `fill="${MUTED}"`).replace(`fill="${G}" fill`, 'fill');
  fs.writeFileSync(path.join(OUT, 'fig4.svg'), svg(W, H, body, 'Log plot of thickness against number of folds, from 0.1 millimetres to beyond the Moon, with a wall at six folds'));
}

// ---------- Figure 6: the sheet's edge at magnification ----------
{
  const W = 81.5, H = 44, edge = 24;
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  let body = '';
  // fibres inside the sheet (above the edge): long, faint, crossing
  for (let i = 0; i < 46; i++) {
    const x = 13 + rnd() * (W - 13), y = 2 + rnd() * (edge - 4), a = (rnd() - 0.5) * 0.9, L = 8 + rnd() * 22;
    const dx = Math.cos(a) * L / 2, dy = Math.sin(a) * L / 2, bend = (rnd() - 0.5) * 3;
    body += `<path d="M${r(x - dx)} ${r(y - dy)}Q${r(x + bend)} ${r(y + bend * 0.4)} ${r(x + dx)} ${r(y + dy)}" fill="none" stroke="${G}" stroke-opacity="0.22" stroke-width="${r(0.4 * PT)}"/>`;
  }
  // the nominal edge: a straight line, interrupted where fibres leave it
  body += `<path d="M13 ${edge}H${W - 2}" stroke="${G}" stroke-width="${r(0.8 * PT)}"/>`;
  // ragged fibrils projecting beyond the edge
  for (let i = 0; i < 64; i++) {
    const x = 14 + rnd() * (W - 17), L = 0.6 + rnd() ** 2 * 7.5, a = Math.PI / 2 + (rnd() - 0.5) * 1.6;
    const ex = x + Math.cos(a) * L, ey = edge + Math.sin(a) * L, cx = x + (rnd() - 0.5) * 1.6, cy = edge + L * 0.5;
    body += `<path d="M${r(x)} ${edge}Q${r(cx)} ${r(cy)} ${r(ex)} ${r(ey)}" fill="none" stroke="${G}" stroke-width="${r((0.35 + rnd() * 0.35) * PT)}" stroke-linecap="round"/>`;
  }
  // labels and the 0.1 mm scale bar (the field is 0.6 mm wide, so 0.1 mm = W / 6)
  const bar = (W - 4) / 6;
  body += `<path d="M${r(W - 2 - bar)} ${H - 3}H${W - 2}M${r(W - 2 - bar)} ${H - 4}v2M${W - 2} ${H - 4}v2" stroke="${G}" stroke-width="${r(0.7 * PT)}" fill="none"/>` +
    text(W - 2 - bar / 2, H - 5, '0.1 mm', 6.5, 'text-anchor="middle"') +
    text(2, 9, 'sheet', 6.5, `fill="${MUTED}"`).replace(`fill="${G}" fill`, 'fill') +
    text(2, edge + 0.9, 'edge', 6.5, `fill="${MUTED}"`).replace(`fill="${G}" fill`, 'fill');
  fs.writeFileSync(path.join(OUT, 'fig6.svg'), svg(W, H, body, 'Line drawing of a paper edge under magnification, with ragged fibres projecting from a straight line and a 0.1 millimetre scale bar'));
}
console.log('figures →', OUT, fs.readdirSync(OUT).join(' '));
