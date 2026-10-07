// grounds.js: the page ground (decision #24). Every section has a ground key (data-ground: paper | charcoal | grey |
// grey-light | ink, default paper). The colours are read from the live CSS role variables (tokens.css), so the design system
// stays the single source of truth for the DOM, the nav AND the WebGL studio (backdrop + clear colour).
//
// Hand-overs between sections are scroll-synced cross-fades over the viewport-height in which the next section
// scrolls in. Exceptions (brief 2B / 5.3): s07 turns ink under The Bleed (absorbed, never faded), the s11 white
// page slides up over the ink with a hard paper edge, and the footer is a solid charcoal block (hard edge).
//
// Output per frame: the canvas colour (sRGB 0–1) and the blended role colours, written as inline custom properties
// on <html>, so the nav, the ruler, the hint, the overlays and every section without its own data-ground cross-fade
// with the ground. Sections with a data-ground attribute keep their own roles (they are only on screen once their
// ground has fully arrived).
import { smoothstep } from './util.js';

const ROLES = ['--ground', '--surface', '--surface-sunken', '--text', '--text-muted', '--text-disabled', '--accent',
  '--color-rule', '--color-rule-strong', '--color-focus', '--button-bg', '--button-fg', '--button-bg-hover',
  '--selection-bg', '--selection-fg', '--press-hi', '--press-lo', '--dims', '--mark', '--mark-alt'];

/** parse a computed colour: rgb() / rgba() / color(srgb …) → [r, g, b, a] in 0..1 (sRGB) */
export function parseColor(s) {
  s = String(s || '').trim();
  let m = s.match(/^rgba?\(([^)]+)\)$/i);
  if (m) {
    const p = m[1].split(/[\s,/]+/).filter(Boolean).map(parseFloat);
    return [p[0] / 255, p[1] / 255, p[2] / 255, p.length > 3 ? p[3] : 1];
  }
  m = s.match(/^color\(srgb\s+([^)]+)\)$/i);
  if (m) {
    const p = m[1].split(/[\s/]+/).filter(Boolean).map(parseFloat);
    return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1];
  }
  m = s.match(/^#([0-9a-f]{6})$/i);
  if (m) { const n = parseInt(m[1], 16); return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255, 1]; }
  return null;
}
const css = (c) => `rgba(${Math.round(c[0] * 255)}, ${Math.round(c[1] * 255)}, ${Math.round(c[2] * 255)}, ${+c[3].toFixed(3)})`;
const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t, a[3] + (b[3] - a[3]) * t];
const lum = (c) => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];

export function createGrounds(scroll) {
  const root = document.documentElement;
  const host = document.createElement('div');
  host.setAttribute('aria-hidden', 'true');
  host.style.cssText = 'position:absolute;left:-9999px;top:0;width:1px;height:1px;overflow:hidden;pointer-events:none;visibility:hidden';
  document.body.appendChild(host);
  const sets = new Map();          // ground key → { roles: { name: [r,g,b,a] }, canvas: [r,g,b,a], dark }

  /** resolve the role colours of one ground through a probe (handles var(), rgba() and color-mix()) */
  function read(key) {
    if (sets.has(key)) return sets.get(key);
    const box = document.createElement('div');
    box.setAttribute('data-ground', key);
    const probe = document.createElement('i');
    box.appendChild(probe); host.appendChild(box);
    const roles = {};
    for (const name of ROLES) {
      probe.style.color = `var(${name})`;
      roles[name] = parseColor(getComputedStyle(probe).color) || [0, 0, 0, 1];
    }
    probe.style.color = 'var(--color-studio)';
    const studio = parseColor(getComputedStyle(probe).color) || [0.925, 0.922, 0.906, 1];
    host.removeChild(box);
    // the 3D studio: white sections sit in the studio white (a touch darker than the paper, so the sheet is
    // always the brightest white on screen); every other ground is its own colour
    const canvas = key === 'paper' ? studio : roles['--ground'];
    const set = { key, roles, canvas, dark: lum(canvas) < 0.35 };
    sets.set(key, set);
    return set;
  }

  let secs = scroll.secs;
  function measure() {
    sets.clear();
    secs = scroll.secs;
    for (const s of secs) s.gset = read(s.ground0);
    read('paper'); read('ink');
  }

  /** the ground key a section shows at progress p (only s07 changes inside itself) */
  const keyAt = (s, p) => (s.key === 's07' && p >= 3.95 ? 'ink' : s.ground0);
  const rolesKeyAt = (s, p) => (s.key === 's07' && p >= 3.7 ? 'ink' : s.ground0);   // text inverts as the ink passes it

  const out = { canvas: [1, 1, 1, 1], dark: false, ink: false, key: 'paper', a: 'paper', b: 'paper', t: 0 };
  let lastRoles = '';

  /** Y: scroll position in viewport heights */
  function frame(Y) {
    if (!secs.length) return out;
    let k = secs.length - 1;
    for (let i = 0; i < secs.length; i++) if (Y < secs[i].bot) { k = i; break; }
    const s = secs[k], n = secs[k + 1];
    const p = Y - s.top;
    let ca = keyAt(s, p), ra = rolesKeyAt(s, p), cb = ca, rb = ra, tc = 0, tr = 0;
    if (n) {
      const nb = n.ground0;
      if (n.key === 's11') {                                 // the white page slides up over the ink (hard edge)
        const sw = Y >= n.top - 0.06 ? 1 : 0; cb = nb; rb = nb; tc = sw; tr = sw;
      } else if (n.key === 's15') {
        // the footer paints its own charcoal: the studio behind it stays as it is
      } else if (nb !== ca) {
        const t = smoothstep(n.top - 1, n.top, Y);
        cb = nb; rb = nb; tc = t; tr = t;
      }
    }
    const A = read(ca), B = read(cb), RA = read(ra), RB = read(rb);
    out.canvas = tc <= 0 ? A.canvas : tc >= 1 ? B.canvas : mix(A.canvas, B.canvas, tc);
    out.key = tc < 0.5 ? ca : cb;
    out.dark = lum(out.canvas) < 0.35;
    out.ink = out.key === 'ink';
    out.a = ra; out.b = rb; out.t = tr;
    // roles on <html>: only touched when they change (a fade is a few dozen style updates, then nothing)
    const tq = Math.round(tr * 48) / 48;
    const rk = ra + '|' + rb + '|' + tq;
    if (rk !== lastRoles) {
      lastRoles = rk;
      if ((tq <= 0 && ra === 'paper') || (tq >= 1 && rb === 'paper')) {
        for (const name of ROLES) root.style.removeProperty(name);
      } else {
        for (const name of ROLES) {
          const c = tq <= 0 ? RA.roles[name] : tq >= 1 ? RB.roles[name] : mix(RA.roles[name], RB.roles[name], tq);
          root.style.setProperty(name, css(c));
        }
      }
      const darkText = lum((tq >= 0.5 ? RB : RA).roles['--ground']) < 0.35;
      root.classList.toggle('is-dark', darkText);
      root.classList.toggle('is-ink', (tq >= 0.5 ? rb : ra) === 'ink');
    }
    const bg = css(out.canvas);
    if (bg !== out._bg) { out._bg = bg; root.style.backgroundColor = bg; }
    return out;
  }

  /** the ground key under a given screen line (0 = top of the viewport, 1 = bottom), for the ruler marker */
  function keyUnder(Y, line) {
    const y = Y + line;
    for (const s of secs) if (y >= s.top && y < s.bot) return s.key === 's15' ? s.ground0 : null;
    return null;
  }

  return { measure, frame, read, keyUnder, out };
}
