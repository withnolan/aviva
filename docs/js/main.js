// main.js: boot. Copy and credit → the loader (s00) → scroll + grounds → the 3D world (or the static page) → UI and
// interactions → one gsap ticker for everything → the reveal and the hero intro.
//
// The page can never stay stuck on the loader: every step has a timeout, a watchdog reveals the page after 16 s
// whatever happens, and any failure of the 3D layer falls back to the static page (brief 3.20).
import { loadCopy, copy } from './copy.js';
import { FLAGS } from './config.js';
import { E, tween } from './events.js';
import { createScroll, gsap, ScrollTrigger } from './scroll.js';
import { createGrounds } from './grounds.js';
import { createUI, applyCredit } from './ui.js';
import { createInteractions } from './interactions.js';
import { setupImages, enterFallback, contextLine } from './fallback.js';

const root = document.documentElement;
const $ = (s) => document.querySelector(s);
const reduceMQ = matchMedia('(prefers-reduced-motion: reduce)');
let reduce = reduceMQ.matches || FLAGS.reduce;
if (reduce) root.classList.add('reduce-motion');
const aviva = (window.__aviva = { ready: false, E });
const t0 = performance.now();
const log = (...a) => { if (FLAGS.debug) console.log(`[aviva ${Math.round(performance.now() - t0)} ms]`, ...a); };

const timeout = (p, ms, what) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error(`${what} timed out`)), ms))]);

/** WebGL2 available? Also says whether it is a software rasteriser (SwiftShader, llvmpipe): the slowest "GPU" */
function webgl2() {
  try {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2');
    if (!gl) return null;
    let renderer = '';
    const dbg = gl.getExtension('WEBGL_debug_renderer_info');
    if (dbg) renderer = String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) || '');
    const lose = gl.getExtension('WEBGL_lose_context'); if (lose) lose.loseContext();
    return { renderer, software: /swiftshader|llvmpipe|softpipe|software/i.test(renderer) };
  } catch { return null; }
}
function deviceTier(gl) {
  const q = new URLSearchParams(location.search).get('tier');
  if (q !== null && /^[012]$/.test(q)) return +q;
  if (gl && gl.software) return 0;                 // software WebGL: treat it as the lowest tier (no shadow map, no MSAA)
  const coarse = matchMedia('(pointer: coarse)').matches;
  const mobile = coarse || /Android|iPhone|iPad|Mobile/i.test(navigator.userAgent || '');
  const lowMem = (navigator.deviceMemory ?? 8) <= 4 || (navigator.hardwareConcurrency ?? 8) <= 4;
  return mobile ? (lowMem ? 0 : 1) : 2;
}

/* ------------------------------------------------------------------ the loader (s00) */
function createLoader() {
  const el = $('#s00-loader'), frame = $('#loader-frame'), mm = $('#loader-mm'), label = $('#loader-label'), sr = $('#loader-sr');
  const minMs = FLAGS.nointro ? 300 : reduce ? 900 : 2200;
  const start = performance.now();
  let target = 0.08, shown = 0, raf = 0, done = false, resolveDone, last = performance.now();
  const finished = new Promise((r) => { resolveDone = r; });
  if (sr) sr.textContent = copy('s00.sr.loading');
  const set = (f) => {
    const n = Math.round(f * 297);
    if (mm) mm.textContent = String(n).padStart(3, '0');
    if (frame) frame.style.setProperty('--climb', f.toFixed(4));
  };
  // time-based (never frame-based): the counter climbs at most 0.9 of the line per second toward what has loaded
  function tick() {
    const now = performance.now(), dt = Math.min(0.5, (now - last) / 1000); last = now;
    const timeShare = Math.min(1, (now - start) / minMs);
    const goal = Math.min(target, timeShare);
    if (reduce) shown = goal >= 1 ? 1 : goal >= 0.5 ? 0.5 : 0;                 // 000 → 148 → 297
    else shown = Math.min(goal, shown + Math.max((goal - shown) * (1 - Math.exp(-6 * dt)), 0.9 * dt * (goal > shown ? 0.25 : 0)));
    set(shown);
    if (shown >= 0.999 && target >= 1) { set(1); done = true; resolveDone(); return; }
    raf = requestAnimationFrame(tick);
  }
  raf = requestAnimationFrame(tick);
  return {
    progress(f) { target = Math.max(target, Math.min(1, f)); },
    finish() { target = 1; return finished; },
    async out() {
      // "NOTHING LOADED" for 400 ms, the sheet fades in inside the marks, the crop marks retract and fade
      if (label) label.textContent = copy('s00.done');
      if (sr) sr.textContent = copy('s00.sr.loaded');
      await new Promise((r) => setTimeout(r, reduce ? 150 : 400));
      el && el.classList.add('is-done', 'is-clear');
      tween(E.loader, { sheet: 1, duration: reduce ? 0.3 : 0.4, ease: 'power1.out' });
      await new Promise((r) => setTimeout(r, 420));
      el && el.classList.add('is-gone');
    },
    kill() { cancelAnimationFrame(raf); if (!done) { done = true; resolveDone(); } el && el.classList.add('is-done', 'is-clear', 'is-gone'); E.loader.sheet = 1; },
  };
}

/* ------------------------------------------------------------------ the hero intro (s01, time-driven) */
function heroIntro(ui) {
  const l1 = $('.hero__l1'), l2 = $('.hero__l2');
  const show = (el) => { if (!el || el.classList.contains('is-in')) return; el.classList.add('is-in'); el.classList.remove('is-pressed'); void el.offsetWidth; el.classList.add('is-pressed'); };
  let l2Timer = 0;
  const landed = () => {
    show(l1); ui.intro();
    l2Timer = setTimeout(() => show(l2), 1400);                    // the pause is the joke
  };
  if (reduce) { E.intro.fall = 1; landed(); }
  else {
    E.intro.started = true;
    tween(E.intro, { fall: 1, duration: 2.4, ease: 'none', delay: 0.15, onComplete() { E.intro.landed = true; } });
    setTimeout(landed, 2050);
  }
  return { firstScroll() { if (l1 && l1.classList.contains('is-in')) { clearTimeout(l2Timer); show(l2); } else { landed(); clearTimeout(l2Timer); show(l2); } } };
}

/* ------------------------------------------------------------------ boot */
async function boot() {
  root.classList.add('is-loading');
  loadCopy();
  applyCredit();
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);
  const loader = createLoader();
  aviva.loader = loader;

  const scroll = createScroll({ reduce });
  aviva.scroll = scroll;
  scroll.stop();
  const grounds = createGrounds(scroll);
  grounds.measure();
  scroll.onRefresh.push(() => grounds.measure());
  loader.progress(0.2);
  log('scroll ready');

  // the 3D world, or the static page
  let world = null;
  const ctxLine = contextLine();
  const glInfo = FLAGS.nogl ? null : webgl2();
  if (glInfo) {
    aviva.gl = { ...glInfo, tier: deviceTier(glInfo) };
    log('webgl:', glInfo.renderer, 'tier', aviva.gl.tier);
    try {
      const { createWorld } = await timeout(import('./world.js'), 15000, 'loading three.js');
      loader.progress(0.35);
      world = await timeout(createWorld({
        canvas: $('#gl-canvas'), tier: aviva.gl.tier, reduce,
        onProgress: (f) => loader.progress(f),
        onLost: () => ctxLine.lost(),
        onRestored: (ok) => { ctxLine.restored(ok); if (!ok) enterFallback(); },
      }), 25000, 'building the 3D scene');
      log('world ready:', world.kind);
    } catch (e) {
      console.warn('[aviva] 3D unavailable, showing the static page:', e && e.message);
      world = null;
    }
  }
  if (!world) enterFallback();
  aviva.world = world;
  setupImages({ gl: !!world });

  const ui = createUI({ scroll, grounds, world, reduce });
  const ix = createInteractions({ scroll, ui, world, reduce });
  Object.assign(aviva, { scroll, grounds, world, ui, ix, gsap, ScrollTrigger });

  // one clock for everything (tech research §4.3): lenis.raf is the ticker's first callback (scroll.js), this the second
  let intro = null, s07seen = false;
  function frame(time, deltaMs) {
    const dt = Math.min(0.1, Math.max(0, deltaMs / 1000));
    E.time += dt;
    scroll.update();
    const g = grounds.frame(scroll.Y);
    ix.frame(dt);
    ui.frame();
    if (intro && scroll.Y > 0.02) { intro.firstScroll(); intro = null; }
    if (world) {
      const s07 = scroll.byKey('s07');
      if (s07 && s07.w > 0.5 && s07.p > 4.15 && !s07seen) { s07seen = true; world.showDotLabel(2600); }
      if (s07 && s07.p < 3.9) s07seen = false;
      world.frame(dt, scroll, g);
    }
  }
  gsap.ticker.add(frame);

  // layout: fonts, resize (width or a large height change: never the mobile toolbar), the tab hidden
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { ui.resplit(true); ScrollTrigger.refresh(); }).catch(() => {});
  let lastW = innerWidth, lastH = innerHeight, rt = 0;
  addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(() => {
      const w = innerWidth, h = innerHeight, coarse = matchMedia('(pointer: coarse)').matches;
      if (w === lastW && coarse && Math.abs(h - lastH) < 120) return;
      lastW = w; lastH = h;
      root.style.setProperty('--vh100', h + 'px');
      if (world) world.resize(w, h);
      ScrollTrigger.refresh();
    }, 120);
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) gsap.ticker.sleep(); else gsap.ticker.wake(); });
  const mm = gsap.matchMedia();
  mm.add('(prefers-reduced-motion: reduce)', () => {
    setReduce(true);
    return () => setReduce(false);
  });
  function setReduce(on) {
    if (on === reduce) return;
    reduce = on || FLAGS.reduce;
    root.classList.toggle('reduce-motion', reduce);
    if (world) world.setReduced(reduce);
    scroll.lenis.options.lerp = reduce ? 1 : 0.1;
    scroll.lenis.options.smoothWheel = !reduce;
  }

  let revealed = false;
  function reveal() {
    if (revealed) return;
    revealed = true;
    root.classList.remove('is-loading');
    scroll.start();
    ScrollTrigger.refresh();
    intro = heroIntro(ui);
    aviva.ready = true;
    log('revealed');
  }
  aviva.reveal = reveal;

  // render a couple of frames behind the loader (shadow maps, contact shadows and paint compile on first use)
  if (world) { scroll.update(); const g = grounds.frame(0); for (let i = 0; i < 2; i++) world.frame(1 / 60, scroll, g); }
  log('warm-up frames done');
  loader.progress(1);
  await timeout(loader.finish(), 8000, 'loader').catch(() => {});
  if (!revealed) await loader.out();
  reveal();
}

// the watchdog: whatever happens, the page is readable and scrollable within 16 s
const watchdog = setTimeout(() => {
  if (aviva.ready) return;
  console.warn('[aviva] loader watchdog: revealing the page');
  emergency();
}, 16000);

/** reveal the page whatever state the boot is in. failed: the boot threw, so show the static page too */
function emergency(failed = false) {
  try { aviva.loader && aviva.loader.kill(); } catch { /* */ }
  const l = $('#s00-loader'); if (l) l.classList.add('is-done', 'is-clear', 'is-gone');
  root.classList.remove('is-loading');
  try { if (aviva.scroll) aviva.scroll.start(); } catch { /* */ }
  root.classList.remove('lenis-stopped');
  if (failed && !aviva.world) enterFallback();
  if (aviva.reveal) aviva.reveal();                          // the normal reveal (with the hero intro) if the UI exists
  else for (const el of document.querySelectorAll('[data-intro], .hero__l1, .hero__l2')) el.classList.add('is-in');
  E.loader.sheet = 1;
  aviva.ready = true;
}

boot().then(() => clearTimeout(watchdog)).catch((e) => {
  console.error('[aviva] boot failed:', e);
  clearTimeout(watchdog);
  emergency(true);
});
