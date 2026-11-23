// s07-ink.js (T14): the absorption view's DOM layer. The 1 mm scale bar (its bar is exactly 1 mm at the macro's scale),
// the timer (time since the drop, from the choreography), and the text blocks that invert to paper white once the ink
// under them passes 50 % (brief 5.3). "The ink under a block" is the screen-space front (paper/bleed.js) evaluated at
// nine points of the block with the same closed form (its fibre streaks left out), plus the sheet's own blot as a disc
// before and under the hand-over. Nothing here touches the 3D: it only reads world.ctx.inkDom / inkTime.
import { copy } from './copy.js';

const fract = (x) => x - Math.floor(x);
const sstep = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };   // GLSL smoothstep, edges may be reversed
function bh(x, y, seed) {                       // bleed.js bh(): hash of vec3(p.xyx)
  const o = seed * 0.013;
  let a = fract(x * 0.1031 + o), b = fract(y * 0.1031 + o), c = fract(x * 0.1031 + o);
  const d = a * (b + 33.33) + b * (c + 33.33) + c * (a + 33.33);
  a += d; b += d; c += d;
  return fract((a + b) * c);
}
function bn(x, y, seed) {
  const ix = Math.floor(x), iy = Math.floor(y);
  let fx = x - ix, fy = y - iy; fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy);
  const a = bh(ix, iy, seed), b = bh(ix + 1, iy, seed), c = bh(ix, iy + 1, seed), d = bh(ix + 1, iy + 1, seed);
  const l = a + (b - a) * fx, h = c + (d - c) * fx;
  return l + (h - l) * fy;
}
function bfbm(x, y, seed) { let s = 0, a = 0.5; for (let i = 0; i < 5; i++) { s += a * bn(x, y, seed); x = x * 2.03 + 1.7; y = y * 2.03 + 1.7; a *= 0.5; } return s; }

/** ink alpha of the screen-space front at uv (u right, v up), as bleed.js computes it (without the fibre term) */
function overlayInk(u, v, D) {
  const c = Math.min(1, Math.max(0, D.cov));
  if (c <= 0.0005) return 0;
  const s = D.seed, qx = ((u - D.cx) * D.aspect) / D.scale, qy = (v - D.cy) / D.scale;
  const d = Math.hypot(qx, qy) * (1 + 0.32 * (bfbm(qx * 2.6, qy * 2.6, s) - 0.5)) - 0.09 * (bfbm(qx * 9, qy * 9, s) - 0.5);
  const R = Math.sqrt((c * D.aspect) / Math.PI) * (1 + 0.4 * c * c) + 0.01, w = 0.012 + 0.02 * c;
  const body = sstep(R + w, R - w, d);
  const isl = bfbm(qx * 3.2 + 11, qy * 3.2 + 11, s) - 0.06 + 0.05 * (bn(qx * 40, qy * 40, s) - 0.5);
  const it = 0.95 - 0.73 * sstep(0.45, 1, c);
  const island = sstep(it + 0.035, it - 0.035, isl) * sstep(0.42, 0.55, c) * sstep(R + 0.45, R - 0.1, d);
  const a = Math.max(body, island);
  return a + (1 - a) * sstep(0.93, 1, c);
}

export function createS07Ink({ scroll, world = null, reduce = false }) {
  const sec = scroll.byKey('s07'), stage = document.getElementById('s07-stage');
  if (!sec || !stage || !world) return { frame() {} };
  const flips = [...stage.querySelectorAll('.ink-flip')], bar = stage.querySelector('.s07__inst'), timer = document.getElementById('s07-timer');
  let lastT = '', lastMm = '', lastInk = '';
  function inkUnder(el, D, W, H) {
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) return 0;
    let sum = 0;
    for (let j = 0; j < 3; j++) for (let i = 0; i < 3; i++) {
      const x = r.left + r.width * (0.12 + 0.38 * i), y = r.top + r.height * (0.15 + 0.35 * j);
      const disc = D.on ? sstep(D.sr * 1.08, D.sr * 0.9, Math.hypot(x - D.sx, y - D.sy)) : 0;
      sum += Math.max(disc, overlayInk(x / W, 1 - y / H, D));
    }
    return sum / 9;
  }
  return {
    frame() {
      if (sec.raw < -1.05 || sec.raw > sec.h + 0.05) return;
      const C = world.ctx, D = C && C.inkDom;
      if (!D) return;
      const p = sec.p, W = innerWidth, H = innerHeight;
      // the scale bar: 1 mm at the sheet's current scale; the timer: one decimal
      const mm = D.pxPerMm.toFixed(2);
      if (bar && mm !== lastMm) { lastMm = mm; bar.style.setProperty('--mm', mm); }
      // the ink panels' colour: the sheet's lit ink before the hand-over, deepening to the token with the screen front
      const k = C.bleedTone ?? 1, ink = `rgb(${Math.round(50 - 19 * k)} ${Math.round(46 - 19 * k)} ${Math.round(105 + 5 * k)})`;
      if (ink !== lastInk) { lastInk = ink; stage.style.setProperty('--ink-now', ink); }
      const t = copy('s07.timer', { s: (C.inkTime || 0).toFixed(1) });
      if (timer && t !== lastT) { lastT = t; timer.textContent = t; }
      // each block inverts once the ink under it passes 50 % (hysteresis), and stays inverted on the ink ground
      const ground = p >= 3.95 || (reduce && p >= 3.4);
      for (const el of flips) {
        const was = el.classList.contains('is-inked');
        const k = ground ? 1 : D.on || D.cov > 0.0005 ? inkUnder(el, D, W, H) : 0;
        const on = ground || (was ? k > 0.42 : k > 0.5);    // the block's panel takes the colour of most of the ground under it
        if (on !== was) el.classList.toggle('is-inked', on);
      }
    },
  };
}
