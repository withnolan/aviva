// loader-drawing.js: the s00 construction drawing (brief 10.1 #70-#74, 10.3 H0-H3, T5). Five letter outlines and the
// "4", projected from the letters' rest layout through the H0 pre-settle camera, so each sheet lands exactly inside
// its outline: crop marks round the word, the 141 mm cap height and the 36 deg apex on the first A, a fold label under
// each letter, and the chain dimension along the first A (left foot -> apex -> right foot = 2 x 148.5 = 297 mm) that
// the loading counter runs along. One SVG group per letter; each fades over 200 ms as its sheet lands.
//
// The geometry mirrors docs/js/paper/letters.js (LETTER_LAYOUT, restX, restCamera) without importing it: the drawing
// has to be on screen in the first frame, long before three.js has loaded. Keep the numbers in step with letters.js.
const L = { capMM: 141, legMM: 148.5, gapK: 0.22, letterMM: 92, depthMM: 210, fourMM: 100, fourGapMM: 4, capVh: 0.30, baselineY: 0.66, fov: 30, aimDeg: 12, iAimDeg: 0.4, marginK: 0.955, pitchDeg: -6 };
const PRE = { distK: 1.06, pitchDeg: -9 };                 // H0: the pre-settle camera (letters.js introCamera at c < 2.6)
const INTRO = { start: 0.4, gap: 0.12, fall: 1.1 };        // letters.js LETTER_INTRO: when each letter lands
const CHARS = ['A', 'V', 'I', 'V', 'A'];
const NS = 'http://www.w3.org/2000/svg';
const DEG = Math.PI / 180;

function layout() {
  const W = L.letterMM / 1000, g = (L.gapK * L.capMM) / 1000, h = L.depthMM / 2000;
  const widths = CHARS.map((c) => (c === 'I' ? 0 : W)), front = [0, 0, 0, 0, 0];
  for (let i = 3; i < 5; i++) front[i] = front[i - 1] + widths[i - 1] / 2 + g + widths[i] / 2;
  for (let i = 1; i >= 0; i--) front[i] = front[i + 1] - widths[i + 1] / 2 - g - widths[i] / 2;
  const t = Math.tan((L.fov / 2) * DEG);
  const D = ((L.capMM / 1000) / L.capVh) / (2 * t) * Math.cos(L.pitchDeg * DEG);
  const yaws = front.map((x, i) => (CHARS[i] === 'I' ? L.iAimDeg * DEG : L.aimDeg * DEG - Math.atan2(x, D)));
  const last = front[4] + W / 2;
  return { front, yaws, frontZ: h, four: last + L.fourGapMM / 1000 + L.fourMM / 2000 };
}

/** a projector for the pre-settle camera at this viewport (px) */
function camera(w, h, R) {
  const aspect = w / h, t = Math.tan((L.fov / 2) * DEG);
  const reach = R.four + L.fourMM / 2000;
  const viewH = Math.max((L.capMM / 1000) / L.capVh, (2 * reach) / L.marginK / Math.max(0.3, aspect));
  const dist = (viewH / (2 * t)) * PRE.distK, p = PRE.pitchDeg * DEG;
  const ty = (L.baselineY - 0.5) * viewH, tz = R.frontZ;
  const px = 0, py = ty - Math.sin(p) * dist, pz = tz + Math.cos(p) * dist;
  const fy = Math.sin(p), fz = -Math.cos(p), uy = Math.cos(p), uz = Math.sin(p);   // forward, up (right = +x)
  return (x, y, z) => {
    const vx = x - px, vy = y - py, vz = z - pz;
    const d = vy * fy + vz * fz, sx = vx / (d * t * aspect), sy = (vy * uy + vz * uz) / (d * t);
    return [(sx * 0.5 + 0.5) * w, (0.5 - sy * 0.5) * h];
  };
}

const el = (tag, attrs = {}, parent) => {
  const n = document.createElementNS(NS, tag);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(n);
  return n;
};
const d = (pts) => pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('');

export function createLoaderDrawing(root, { copy = (id, f) => f, landsAt = null, reduce = false } = {}) {
  const svg = el('svg', { class: 'ld', 'aria-hidden': 'true', focusable: 'false' });
  root.prepend(svg);
  const counter = root.querySelector('.loader__counter');
  let letters = [], four = null, chain = null, built = false;

  function build() {
    const w = innerWidth, h = innerHeight, R = layout(), P = camera(w, h, R);
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`); svg.textContent = '';
    const legH = (L.legMM / 1000) * Math.sin(18 * DEG), capH = (L.legMM / 1000) * Math.cos(18 * DEG);
    // a point on letter i's front outline: dx along its end edge (turned with its yaw), y up (m)
    const at = (i, dx, y) => P(R.front[i] + dx * Math.cos(R.yaws[i]), y, R.frontZ - dx * Math.sin(R.yaws[i]));
    letters = CHARS.map((ch, i) => {
      const g = el('g', { class: 'ld__l', style: `--i:${i}` }, svg);
      const shape = ch === 'A' ? [at(i, -legH, 0), at(i, 0, capH), at(i, legH, 0)]
        : ch === 'V' ? [at(i, -legH, capH), at(i, 0, 0), at(i, legH, capH)]
          : [at(i, 0, 0), at(i, 0, (L.legMM / 1000) * 1.0)];
      el('path', { class: 'ld__o', d: d(shape), pathLength: 1 }, g);
      // the fold notation under the letter: mountain dash-dot-dot, valley dashes, the I a solid hairline (edge-on)
      const foot = at(i, 0, 0), y0 = foot[1] + 14;
      el('path', { class: 'ld__f ld__f--' + (ch === 'A' ? 'm' : ch === 'V' ? 'v' : 'i'), d: `M${(foot[0] - 14).toFixed(1)} ${y0}H${(foot[0] + 14).toFixed(1)}` }, g);
      const t = el('text', { class: 'ld__t', x: foot[0].toFixed(1), y: (y0 + 14).toFixed(1) }, g);
      t.textContent = copy(ch === 'A' ? 's00.fold.a' : ch === 'V' ? 's00.fold.v' : 's00.fold.i', ch === 'A' ? 'MOUNTAIN' : ch === 'V' ? 'VALLEY' : 'EDGE-ON');
      return g;
    });
    // the "4": three strokes (diagonal, bar, stem), drawn on stroke by stroke at H3
    const q = (fx, fy) => P(R.four + (fx - 0.5) * 0.085, fy * capH, R.frontZ);
    four = el('g', { class: 'ld__four' }, svg);
    four.strokes = [[q(0.66, 1), q(0.02, 0.3)], [q(0.02, 0.3), q(0.98, 0.3)], [q(0.66, 1), q(0.66, 0)]]
      .map((s) => el('path', { class: 'ld__s', d: d(s), pathLength: 1 }, four));
    const f0 = q(0.5, 0);
    const ft = el('text', { class: 'ld__t', x: f0[0].toFixed(1), y: (f0[1] + 28).toFixed(1) }, four); ft.textContent = copy('s00.four', 'ISO 216');
    // dimensions on the first A: the cap height (141 mm) at its left, the apex angle (36 deg) above
    const dims = el('g', { class: 'ld__dims' }, svg);
    const foot0 = at(0, -legH, 0), apex0 = at(0, 0, capH), right0 = at(0, legH, 0), xL = foot0[0] - 34;
    el('path', { d: `M${xL} ${foot0[1].toFixed(1)}V${apex0[1].toFixed(1)}M${xL - 5} ${foot0[1].toFixed(1)}H${xL + 5}M${xL - 5} ${apex0[1].toFixed(1)}H${xL + 5}`, pathLength: 1 }, dims);
    const th = el('text', { class: 'ld__t ld__t--v', x: xL - 10, y: ((foot0[1] + apex0[1]) / 2).toFixed(1), transform: `rotate(-90 ${xL - 10} ${((foot0[1] + apex0[1]) / 2).toFixed(1)})` }, dims);
    th.textContent = copy('s00.dim.h', '141 mm');
    const r = 26, a1 = Math.atan2(foot0[1] - apex0[1], foot0[0] - apex0[0]), a2 = Math.atan2(right0[1] - apex0[1], right0[0] - apex0[0]);
    el('path', { d: `M${(apex0[0] + r * Math.cos(a1)).toFixed(1)} ${(apex0[1] + r * Math.sin(a1)).toFixed(1)}A${r} ${r} 0 0 0 ${(apex0[0] + r * Math.cos(a2)).toFixed(1)} ${(apex0[1] + r * Math.sin(a2)).toFixed(1)}`, pathLength: 1 }, dims);
    const ta = el('text', { class: 'ld__t', x: apex0[0].toFixed(1), y: (apex0[1] + r + 14).toFixed(1) }, dims); ta.textContent = copy('s00.dim.angle', '36°');
    // the chain dimension: parallel to the A's two legs, offset outward; the counter runs along it
    const off = 16, n1 = norm(foot0, apex0, -off), n2 = norm(apex0, right0, -off);
    chain = [[foot0[0] + n1[0], foot0[1] + n1[1]], [apex0[0] + (n1[0] + n2[0]) / 2, apex0[1] + (n1[1] + n2[1]) / 2 - off * 0.4], [right0[0] + n2[0], right0[1] + n2[1]]];
    el('path', { class: 'ld__chain', d: d(chain), pathLength: 1 }, dims);
    for (const p of chain) el('path', { d: `M${(p[0] - 4).toFixed(1)} ${(p[1] + 4).toFixed(1)}L${(p[0] + 4).toFixed(1)} ${(p[1] - 4).toFixed(1)}` }, dims);
    // crop marks round the word and the "4"
    const crops = el('g', { class: 'ld__crops' }, svg);
    const top = Math.min(apex0[1], at(1, -legH, capH)[1]) - 40, bot = foot0[1] + 52, left = foot0[0] - 60, right = q(1, 0)[0] + 40;
    for (const [x, y, sx, sy] of [[left, top, -1, -1], [right, top, 1, -1], [right, bot, 1, 1], [left, bot, -1, 1]]) {
      el('path', { d: `M${x + sx * 6} ${y}H${x + sx * 18}M${x} ${y + sy * 6}V${y + sy * 18}` }, crops);
    }
    built = true;
  }
  function norm(a, b, k) { const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1; return [(-dy / l) * -k, (dx / l) * -k]; }

  build();
  const onResize = () => { if (built) build(); };
  addEventListener('resize', onResize);
  return {
    /** the loading progress f (0..1): the counter runs along the chain dimension, 000 -> 297 */
    progress(f) {
      if (!counter || !chain) return;
      const k = Math.min(1, Math.max(0, f)), seg = k < 0.5 ? 0 : 1, u = seg ? (k - 0.5) * 2 : k * 2;
      const a = chain[seg], b = chain[seg + 1], x = a[0] + (b[0] - a[0]) * u, y = a[1] + (b[1] - a[1]) * u;
      counter.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(${seg ? '10px' : 'calc(-100% - 10px)'}, -50%)`;
    },
    /** the intro clock (s since loaded): each outline fades as its sheet lands; the "4" draws on stroke by stroke */
    clock(c, lands = landsAt) {
      if (!built) return;
      letters.forEach((g, i) => {
        const t = lands ? lands(i) : INTRO.start + INTRO.gap * i + INTRO.fall;
        g.style.opacity = reduce ? (c > 0 ? 0 : 1) : String(1 - Math.min(1, Math.max(0, (c - t) / 0.2)));
      });
      if (four) {
        four.strokes.forEach((s, j) => { const a = 2.1 + j * 0.13, k = reduce ? (c > 0 ? 1 : 0) : Math.min(1, Math.max(0, (c - a) / 0.13)); s.style.strokeDashoffset = String(1 - k); });
        four.style.opacity = String(1 - Math.min(1, Math.max(0, (c - 2.5) / 0.2)));
      }
    },
    destroy() { removeEventListener('resize', onResize); svg.remove(); },
  };
}
