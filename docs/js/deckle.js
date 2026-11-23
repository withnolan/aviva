// deckle.js (T39): the page ends on a paper edge (brief 11.1 row s15, 5.12): where the white page meets the footer, a
// ragged, fibrous hand-made deckle 24-40 px tall across the full width, with a soft shadow on the footer. Drawn as the
// footer's own top: an SVG of the charcoal ground with a ragged top, so the page above shows through it exactly (no
// colour to match), plus paper-white fibres that hang over the charcoal and stir as the cursor passes.
const NS = 'http://www.w3.org/2000/svg';
const H = 44;                                           // the deckle band (px): the edge wanders 6-34 px down it

function rng(seed) { return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function noise1(seed) {                                 // smooth 1D value noise
  const r = rng(seed), v = Array.from({ length: 512 }, r);
  return (x) => { const i = Math.floor(x), f = x - i, a = v[i & 511], b = v[(i + 1) & 511]; return a + (b - a) * f * f * (3 - 2 * f); };
}

export function createDeckle(footer, { reduce = false } = {}) {
  if (!footer) return null;
  const host = document.createElement('div'); host.className = 'deckle'; host.setAttribute('aria-hidden', 'true');
  footer.prepend(host);
  footer.classList.add('has-deckle');
  const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('class', 'deckle__svg'); svg.setAttribute('focusable', 'false');
  host.appendChild(svg);
  let fibres = [], W = 0, raf = 0, mx = -999, live = false;

  function build() {
    W = Math.max(320, Math.round(footer.clientWidth));
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('width', W); svg.setAttribute('height', H);
    svg.textContent = '';
    const lo = noise1(7), mid = noise1(19), hi = noise1(31), r = rng(43);
    const edge = [];
    for (let x = 0; x <= W; x += 2) {
      // the tear's long waves, its torn steps, and the fibre-scale tooth
      const y = 20 + 10 * (lo(x / 140) - 0.5) * 2 + 4 * (mid(x / 22) - 0.5) * 2 + 1.6 * (hi(x / 3) - 0.5) * 2;
      edge.push([x, Math.max(6, Math.min(34, y))]);
    }
    const d = 'M0 ' + H + ' L' + edge.map((p) => p[0] + ' ' + p[1].toFixed(1)).join(' L') + ' L' + W + ' ' + H + ' Z';
    const defs = document.createElementNS(NS, 'defs');
    defs.innerHTML = '<filter id="deckle-soft" x="-5%" y="-50%" width="110%" height="250%"><feGaussianBlur stdDeviation="3.2"/></filter>'
      + '<clipPath id="deckle-clip"><path d="' + d + '"/></clipPath>';
    svg.appendChild(defs);
    const ground = document.createElementNS(NS, 'path'); ground.setAttribute('class', 'deckle__ground'); ground.setAttribute('d', d);
    // the paper's soft shadow on the charcoal: the edge, a little lower and blurred, inside the charcoal only
    const shade = document.createElementNS(NS, 'path'); shade.setAttribute('class', 'deckle__shade');
    shade.setAttribute('d', 'M0 0 L' + edge.map((p) => p[0] + ' ' + (p[1] + 5).toFixed(1)).join(' L') + ' L' + W + ' 0 Z');
    shade.setAttribute('filter', 'url(#deckle-soft)'); shade.setAttribute('clip-path', 'url(#deckle-clip)');
    svg.append(ground, shade);
    // fibres: short paper-white hairs hanging over the charcoal from the edge, a few longer ones
    const g = document.createElementNS(NS, 'g'); g.setAttribute('class', 'deckle__fibres');
    fibres = [];
    for (let i = 0; i < W / 5; i++) {
      const x = r() * W, k = Math.min(edge.length - 1, Math.round(x / 2)), y = edge[k][1] - 0.6;
      const len = 2.5 + r() * r() * 9, a = (r() - 0.5) * 1.1;            // mostly short, some long; leaning either way
      const l = document.createElementNS(NS, 'line');
      l.setAttribute('x1', '0'); l.setAttribute('y1', '0'); l.setAttribute('x2', (Math.sin(a) * len).toFixed(1)); l.setAttribute('y2', (Math.cos(a) * len).toFixed(1));
      l.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
      l.style.opacity = (0.35 + 0.5 * r()).toFixed(2);
      g.appendChild(l);
      fibres.push({ el: l, x, y, rot: 0, tr: 0 });
    }
    svg.appendChild(g);
  }

  // the cursor stirs the fibres it passes over (a few degrees, then they settle)
  function tick() {
    raf = 0; let moving = false;
    for (const f of fibres) {
      const dx = f.x - mx, near = live ? Math.max(0, 1 - Math.abs(dx) / 90) : 0;
      f.tr = near * 26 * Math.sign(dx || 1) * (1 - Math.abs(dx) / 140);
      const nr = f.rot + (f.tr - f.rot) * 0.18;
      if (Math.abs(nr - f.rot) > 0.05) { f.rot = nr; f.el.setAttribute('transform', `translate(${f.x.toFixed(1)} ${f.y.toFixed(1)}) rotate(${f.rot.toFixed(1)})`); moving = true; }
    }
    if (moving) raf = requestAnimationFrame(tick);
  }
  if (!reduce) {
    footer.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      const r = host.getBoundingClientRect();
      live = e.clientY > r.top - 60 && e.clientY < r.bottom + 40; mx = e.clientX - r.left;
      if (!raf) raf = requestAnimationFrame(tick);
    }, { passive: true });
    footer.addEventListener('pointerleave', () => { live = false; if (!raf) raf = requestAnimationFrame(tick); });
  }
  build();
  let rw = 0;
  addEventListener('resize', () => { clearTimeout(rw); rw = setTimeout(() => { if (Math.round(footer.clientWidth) !== W) build(); }, 150); });
  return { build };
}
