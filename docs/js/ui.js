// ui.js: the DOM layer that follows the scroll: timed reveals ([data-at]/[data-until] inside pinned stages,
// [data-reveal] in flowing sections), the signature "Impression" headline reveal (lines split by measurement), the
// nav's active section, the mm ruler, the scroll hint, the ream counter, status lines, the section-driven DOM
// (drying-line captions, the claims track, the s12 table, the s06/s09 cues, the s14 variants) and the dimension
// overlay registered to the projected sheet. Works with or without WebGL (world may be null).
import { CREDIT, NAV_GROUP, REAM_SIZE } from './config.js';
import { copy } from './copy.js';
import { E } from './events.js';
import { clamp, seg, smoothstep, ease } from './util.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* ------------------------------------------------------------------ credit (decision #21: one place) */
export function applyCredit() {
  for (const el of $$('[data-credit="name"]')) el.textContent = CREDIT.name;
  for (const el of $$('[data-credit="gh"]')) {
    el.href = CREDIT.profile;
    el.setAttribute('aria-label', `${CREDIT.name} on GitHub (opens in a new tab)`);
  }
  for (const el of $$('[data-credit="gh-label"]')) el.textContent = CREDIT.profile.replace(/^https?:\/\//, '').toUpperCase();
  for (const el of $$('[data-credit="repo"]')) el.href = CREDIT.repo;
}

/* ------------------------------------------------------------------ the Impression reveal: measured lines */
// Batched for the whole page: (1) every heading gets its words wrapped, (2) one layout reads every word's line,
// (3) every heading is rebuilt as one block span per line. One forced layout instead of one per word.
function wrapWords(el) {
  if (!el.__orig) el.__orig = el.innerHTML;
  el.innerHTML = el.__orig;
  const words = [];
  const walk = (node) => {
    for (const ch of [...node.childNodes]) {
      if (ch.nodeType === 3) {
        const frag = document.createDocumentFragment();
        for (const part of ch.textContent.split(/(\s+)/)) {
          if (!part) continue;
          if (/^\s+$/.test(part) && !/\u00a0/.test(part)) { frag.appendChild(document.createTextNode(part)); continue; }
          const w = document.createElement('span'); w.className = 'press__w'; w.textContent = part;
          frag.appendChild(w); words.push(w);
        }
        ch.replaceWith(frag);
      } else if (ch.nodeType === 1 && ch.tagName !== 'BR') walk(ch);
    }
  };
  walk(el);
  return words;
}
export function splitAll(els) {
  const jobs = [];
  for (const el of els) { try { jobs.push({ el, words: wrapWords(el) }); } catch { /* keep the original */ } }
  for (const j of jobs) j.tops = j.words.map((w) => w.offsetTop);          // one layout for all of them
  for (const j of jobs) {
    if (!j.words.length) continue;
    const lines = []; let top = null, line = null;
    j.words.forEach((w, i) => { const t = j.tops[i]; if (top === null || Math.abs(t - top) > 2) { line = []; lines.push(line); top = t; } line.push(w.textContent); });
    j.el.innerHTML = lines.map((l, i) => `<span class="press__line" style="--i:${i}">${l.join(' ')}</span>`).join('');
  }
}

export function createUI({ scroll, grounds, world = null, reduce = false }) {
  const root = document.documentElement;
  const S = scroll;

  /* ---------------------------------------------------------------- timed reveals */
  const timed = [];
  for (const s of S.secs) {
    for (const el of $$('[data-at]', s.el)) {
      timed.push({ el, s, at: parseFloat(el.dataset.at) || 0, until: el.dataset.until ? parseFloat(el.dataset.until) : Infinity, on: null });
    }
  }
  const splits = $$('[data-split]');
  let splitW = -1;
  /** re-measure the headline lines: when the width changes, or forced (the web font arrived) */
  function resplit(force = false) {
    if (!force && innerWidth === splitW) return;
    splitW = innerWidth;
    splitAll(splits);
    for (const t of timed) if (t.on) press(t.el, true);
  }
  const press = (el, on) => {
    const targets = el.matches('[data-split]') ? [el] : $$('[data-split]', el);
    for (const t of targets) {
      if (on) { t.classList.remove('is-pressed'); void t.offsetWidth; t.classList.add('is-pressed'); } else t.classList.remove('is-pressed');
    }
    // marks (the pencil underline, a highlighter) draw on once their block has arrived
    for (const m of $$('.u-pencil, .hl', el)) m.classList.toggle('is-drawn', on);
  };
  // flowing sections: reveal on entering the viewport
  const io = 'IntersectionObserver' in window ? new IntersectionObserver((entries) => {
    for (const e of entries) {
      const on = e.isIntersecting;
      if (on === e.target.__on) continue;
      e.target.__on = on;
      e.target.classList.toggle('is-in', on);
      press(e.target, on);
    }
  }, { rootMargin: '-6% 0px -8% 0px', threshold: 0.01 }) : null;
  for (const el of $$('[data-reveal]')) io ? io.observe(el) : el.classList.add('is-in');

  /* ---------------------------------------------------------------- nav */
  const navLinks = $$('.nav__links a[data-nav]');
  let navGroup = -1;
  function setNav(g) {
    if (g === navGroup) return;
    navGroup = g;
    navLinks.forEach((a, i) => { if (i === g) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current'); });
  }
  function jump(target) {
    if (!target) return;
    S.scrollTo(target);
    const focusAfter = () => {
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      try { target.focus({ preventScroll: true }); } catch { /* old browsers */ }
    };
    setTimeout(focusAfter, reduce ? 0 : 900);
  }
  for (const a of [...navLinks, $('.nav__logo'), $('.foot__top')].filter(Boolean)) {
    a.addEventListener('click', (e) => {
      const id = (a.getAttribute('href') || '').slice(1);
      const el = id === 'top' ? document.getElementById('content') : document.getElementById(id);
      if (!el) return;
      e.preventDefault();
      if (id === 'top') { S.scrollTo(0); setTimeout(() => { try { el.focus({ preventScroll: true }); } catch { /* */ } }, reduce ? 0 : 900); } else jump(el);
    });
  }

  /* ---------------------------------------------------------------- focus: never leave a hidden control focused */
  document.addEventListener('focusin', (e) => {
    const t = e.target.closest && e.target.closest('[data-at]');
    if (!t || t.classList.contains('is-in')) return;
    const secEl = t.closest('[data-sec]');
    const s = secEl && S.secs.find((x) => x.el === secEl);
    if (!s) return;
    const at = parseFloat(t.dataset.at) || 0, until = t.dataset.until ? parseFloat(t.dataset.until) : s.len;
    const p = Math.min(at + 0.15, (at + Math.min(until, s.len)) / 2);
    S.scrollTo(S.yOf(s, p), { immediate: true });
  });

  /* ---------------------------------------------------------------- ruler */
  const ruler = $('#ruler'), marker = $('#ruler-marker'), readout = $('#ruler-readout');
  if (ruler) {
    const ticks = $('.ruler__track', ruler);
    for (const n of [50, 100, 150, 200, 250]) {
      const l = document.createElement('span'); l.className = 'ruler__lab'; l.textContent = String(n);
      l.style.top = (n / 297 * 100) + '%'; ticks.appendChild(l);
    }
  }
  let rulerH = 0, reachedEnd = false, rulerText = '';
  function setReadout(t) { if (t !== rulerText && readout) { rulerText = t; readout.textContent = t; } }

  /* ---------------------------------------------------------------- hint */
  const hint = $('#hint');
  let hintState = '';
  function setHint(st) { if (st === hintState || !hint) return; hintState = st; hint.classList.toggle('is-off', st === 'off'); hint.classList.toggle('is-dim', st === 'dim'); }

  /* ---------------------------------------------------------------- ream counter */
  const ream = $('#ream-status'), footReam = $('#s15-ream');
  let destroyed = 0, reamTimer = 0;
  function consume(at) {
    destroyed++;
    const n = Math.max(0, REAM_SIZE - destroyed);
    if (ream) {
      ream.textContent = copy('ream.status', { n });
      const x = at && isFinite(at.x) ? at.x : innerWidth * 0.62, y = at && isFinite(at.y) ? at.y : innerHeight * 0.5;
      ream.style.setProperty('--rx', Math.round(Math.min(innerWidth - 220, Math.max(12, x))) + 'px');
      ream.style.setProperty('--ry', Math.round(Math.min(innerHeight - 60, Math.max(70, y))) + 'px');
      ream.classList.add('is-on');
      clearTimeout(reamTimer); reamTimer = setTimeout(() => ream.classList.remove('is-on'), 3000);
    }
    updateFoot();
  }
  function updateFoot() { if (footReam) footReam.textContent = copy('s15.ream', { n: destroyed + 1 }); }
  updateFoot();

  /* ---------------------------------------------------------------- status lines */
  function say(el, text, { mark = false } = {}) {
    if (!el || el.__text === text) return;
    el.__text = text;
    el.classList.add('is-swap');
    clearTimeout(el.__swap);
    el.__swap = setTimeout(() => {
      el.textContent = '';
      if (text) {
        if (mark) {
          const m = document.createElement('mark'); m.className = 'hl'; m.textContent = text; el.appendChild(m);
          requestAnimationFrame(() => requestAnimationFrame(() => m.classList.add('is-drawn')));
        } else el.textContent = text;
      }
      el.classList.remove('is-swap');
    }, 160);
  }

  /* ---------------------------------------------------------------- geometry measured on refresh */
  const outputs = $$('#outputs .output');
  const claims = $('#claims'), plate = $('.s11__plate');
  const s12col = $('#s12-col'), s12cmp = $('#s12-cmp');
  const cues = $$('#changelog [data-cue]').map((el) => ({ el, cue: el.dataset.cue, y: 0 }));
  const dogCue = $('.review[data-cue="dogear"]');
  const issue = $('#s06-issue');
  let claimsMax = 0, dogY = 0;
  function measure() {
    rulerH = ruler ? ruler.clientHeight : 0;
    claimsMax = claims ? Math.max(0, claims.scrollWidth - innerWidth) : 0;
    const sy = window.scrollY;
    for (const c of cues) { const r = c.el.getBoundingClientRect(); c.y = r.top + sy + r.height / 2; }
    if (dogCue) { const r = dogCue.getBoundingClientRect(); dogY = r.top + sy + r.height / 2; }
    resplit();
  }
  S.onRefresh.push(measure);
  measure();

  /* ---------------------------------------------------------------- the dimension overlay (needs the 3D sheet) */
  const dims = $('#dims'), svg = $('#dims-svg');
  const labs = {};
  for (const el of $$('.dims__lab', dims || document)) labs[el.dataset.dim] = el;
  const P = [{}, {}, {}, {}], Q = {};
  let dimsMode = 'none';
  const NS = 'http://www.w3.org/2000/svg';
  const pathMain = svg ? document.createElementNS(NS, 'path') : null, pathExt = svg ? document.createElementNS(NS, 'path') : null;
  if (svg) { pathExt.setAttribute('class', 'is-faint'); svg.append(pathExt, pathMain); }
  const DIMS = { A5: ['148 mm', '210 mm'], A4: ['210 mm', '297 mm'], A3: ['297 mm', '420 mm'] };
  function placeLab(el, x, y, on, rot = 0) {
    if (!el) return;
    if (on) el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -50%)${rot ? ` rotate(${rot}deg)` : ''}`;
    el.classList.toggle('is-on', !!on);
  }
  /** one dimension: a line offset outward from edge a→b, ticks at both ends, faint extension lines */
  function dimLine(a, b, c, off, parts, ext) {
    let nx = -(b.y - a.y), ny = b.x - a.x; const L = Math.hypot(nx, ny) || 1; nx /= L; ny /= L;
    const mx = (a.x + b.x) / 2 - c.x, my = (a.y + b.y) / 2 - c.y;
    if (nx * mx + ny * my < 0) { nx = -nx; ny = -ny; }
    const ax = a.x + nx * off, ay = a.y + ny * off, bx = b.x + nx * off, by = b.y + ny * off;
    parts.push(`M${ax.toFixed(1)} ${ay.toFixed(1)}L${bx.toFixed(1)} ${by.toFixed(1)}`);
    const tx = nx * 6, ty = ny * 6;
    parts.push(`M${(ax - tx).toFixed(1)} ${(ay - ty).toFixed(1)}L${(ax + tx).toFixed(1)} ${(ay + ty).toFixed(1)}`);
    parts.push(`M${(bx - tx).toFixed(1)} ${(by - ty).toFixed(1)}L${(bx + tx).toFixed(1)} ${(by + ty).toFixed(1)}`);
    ext.push(`M${(a.x + nx * 4).toFixed(1)} ${(a.y + ny * 4).toFixed(1)}L${(ax + nx * 4).toFixed(1)} ${(ay + ny * 4).toFixed(1)}`);
    ext.push(`M${(b.x + nx * 4).toFixed(1)} ${(b.y + ny * 4).toFixed(1)}L${(bx + nx * 4).toFixed(1)} ${(by + ny * 4).toFixed(1)}`);
    return { x: (ax + bx) / 2 + nx * 14, y: (ay + by) / 2 + ny * 14, ang: Math.atan2(by - ay, bx - ax) * 180 / Math.PI };
  }
  function updateDims() {
    if (!world || !svg) return;
    const mode = world.dimsMode();
    const dot = world.dotLabel();
    if (mode === 'none' && dimsMode === 'none' && !dot.on && !(labs.dot && labs.dot.classList.contains('is-on'))) return;
    dimsMode = mode;
    const parts = [], ext = [];
    let w = null, h = null, ratio = null, fold = null, foldLab = null;
    if (mode !== 'none' && world.heroCorners(P, mode === 'fold')) {
      const c = { x: (P[0].x + P[2].x) / 2, y: (P[0].y + P[2].y) / 2 };
      const big = Math.abs(P[1].x - P[0].x) > 60;
      if (big) {
        w = dimLine(P[0], P[1], c, 26, parts, ext);              // top edge: the width
        h = dimLine(P[1], P[2], c, 26, parts, ext);              // right edge: the height
        const bot = { x: (P[2].x + P[3].x) / 2, y: Math.max(P[2].y, P[3].y) };
        if (mode === 'a4') ratio = { x: bot.x, y: bot.y + 30 };
        if (mode === 'fold') { fold = h; foldLab = { x: bot.x, y: bot.y + 30 }; h = null; }
      }
    }
    pathMain.setAttribute('d', parts.join(''));
    pathExt.setAttribute('d', ext.join(''));
    const size = world.sizeChoice ? world.sizeChoice() : 'A4';
    const dset = mode === 'size' ? DIMS[size] || DIMS.A4 : DIMS.A4;
    if (labs.w && labs.w.__t !== dset[0]) { labs.w.textContent = dset[0]; labs.w.__t = dset[0]; }
    if (labs.h && labs.h.__t !== dset[1]) { labs.h.textContent = dset[1]; labs.h.__t = dset[1]; }
    placeLab(labs.w, w && w.x, w && w.y, !!w);
    placeLab(labs.h, h && h.x, h && h.y, !!h, 90);
    placeLab(labs.ratio, ratio && ratio.x, ratio && ratio.y, !!ratio);
    placeLab(labs.fold, fold && fold.x, fold && fold.y, !!fold, 90);
    placeLab(labs.foldlabel, foldLab && foldLab.x, foldLab && foldLab.y, !!foldLab);
    placeLab(labs.dot, dot.x + 26, dot.y + 2, dot.on);
  }

  /* ---------------------------------------------------------------- per frame */
  const groundOut = { dark: false };
  let introDone = false;
  function frame() {
    const Y = S.Y, cur = S.current;
    // reveals inside pinned stages
    for (const t of timed) {
      if (t.el.hasAttribute('data-intro') && !introDone) continue;
      const s = t.s, praw = s.pin ? s.raw : s.raw * (s.len / s.h);
      const on = praw >= t.at && praw < t.until && s.raw > -0.98 && s.raw < s.h + 0.02;
      if (on !== t.on) { t.on = on; t.el.classList.toggle('is-in', on); press(t.el, on); }
    }
    // nav
    setNav(NAV_GROUP[cur.key] ?? 0);
    // ruler
    const pr = S.progress;
    if (marker) marker.style.setProperty('--ruler-y', (pr * rulerH).toFixed(1));
    if (pr > 0.997) { reachedEnd = true; setReadout(copy('ruler.end')); ruler && ruler.classList.add('is-message'); }
    else if (reachedEnd && pr < 0.003) { setReadout(copy('ruler.top')); ruler && ruler.classList.add('is-message'); }
    else { setReadout(copy('ruler.readout', { n: Math.round(pr * 297) })); ruler && ruler.classList.remove('is-message'); }
    if (marker && grounds) {
      const k = grounds.keyUnder(Y, (pr * rulerH + ruler.offsetTop) / S.vh);
      if (k !== marker.__g) { marker.__g = k; if (k) marker.setAttribute('data-ground', k); else marker.removeAttribute('data-ground'); }
    }
    // hint: hidden in s13–s15, dimmed while moving fast or during a hand-over
    const late = cur.key === 's13' || cur.key === 's14' || cur.key === 's15';
    const moving = Math.abs(S.velocity) > 7 || (cur.pin && cur.raw > cur.len - 0.92) || (!cur.pin && cur.raw > cur.h - 0.9);
    setHint(late || root.classList.contains('is-loading') ? 'off' : moving ? 'dim' : 'on');
    sections();
    updateDims();
    return groundOut;
  }

  /* ---------------------------------------------------------------- the section-driven DOM */
  const s04 = S.byKey('s04'), s06 = S.byKey('s06'), s09 = S.byKey('s09'), s11 = S.byKey('s11'), s12 = S.byKey('s12');
  const near = (s) => s && s.raw > -1.05 && s.raw < s.h + 0.05;
  function sections() {
    const vw = innerWidth, vh = S.vh;
    if (near(s04)) {
      const o = world ? world.outputs() : null;
      const p = s04.p, w = vw;
      const off = o ? o.off : 7 * seg(p, 3.2, 7.6, ease.linear);
      const lineY = o ? o.lineY : 18 - 32 * seg(p, 7.6, 8);
      const spacing = o ? o.spacing : (w <= 600 ? 74 : w <= 1024 ? 40 : 26);
      outputs.forEach((el, i) => {
        const x = (i - off) * spacing;
        const op = (1 - smoothstep(38, 52, Math.abs(x))) * (i === 7 ? 1 - seg(p, 7.55, 7.75) : 1);
        el.style.setProperty('--ox', (x / 100 * vw).toFixed(1));
        el.style.setProperty('--oy', ((Math.min(lineY, 18) - 18) / 100 * vh).toFixed(1) + 'px');
        el.style.setProperty('--oo', op.toFixed(3));
      });
    }
    if (near(s06)) {
      const yc = window.scrollY + vh / 2;
      let map = 0, wm = 0, drift = 0, dimsOn = 0, dbl = 0;
      for (const c of cues) {
        const d = (c.y - yc) / vh, bump = 1 - smoothstep(0.1, 0.42, Math.abs(d));
        if (c.cue === 'map') map = Math.max(map, bump);
        else if (c.cue === 'watermark') wm = Math.max(wm, bump);
        else if (c.cue === 'drift') drift = Math.max(drift, smoothstep(0.35, -0.25, d));
        else if (c.cue === 'dims') dimsOn = Math.max(dimsOn, d < 0.05 ? 1 : 0);
        else if (c.cue === 'double') dbl = Math.max(dbl, bump);
      }
      Object.assign(E.cues, { map, wm, drift, dims: dimsOn, double: reduce ? 0 : dbl });
      if (issue && dbl > 0.3 && !issue.classList.contains('is-drawn')) issue.classList.add('is-drawn');
    }
    if (near(s09) && dogCue) {
      const d = (dogY - (window.scrollY + vh / 2)) / vh;
      const v = smoothstep(0.3, 0.02, d);
      E.cues.dogEar = reduce ? (v > 0.5 ? 1 : 0) : v;
      if (v > 0.9) E.cues.dogEarSeen = true;
    }
    if (near(s11) && claims) {
      claims.style.setProperty('--track', (seg(s11.p, 0.8, 6.4, ease.linear) * claimsMax).toFixed(1));
      if (plate) plate.style.setProperty('--plate', (1 - seg(s11.p, 0.06, 0.45)).toFixed(3));
    }
    if (near(s12)) {
      const p = s12.p;
      if (s12col) {
        s12col.style.setProperty('--colY', (-seg(p, 2.3, 2.9) * vh * 0.22).toFixed(1));
        s12col.style.setProperty('--colO', (1 - seg(p, 2.3, 2.75)).toFixed(3));
      }
      if (s12cmp) s12cmp.style.setProperty('--cmpY', (-seg(p, 2.3, 3.0) * vh * 0.8).toFixed(1));
    }
  }

  return {
    frame, consume, say, measure, resplit,
    intro() { introDone = true; for (const el of $$('[data-intro]')) el.classList.add('is-in'); },
    get destroyed() { return destroyed; },
  };
}
