// scroll.js: Lenis + GSAP ScrollTrigger on ONE clock (the gsap ticker), and the section map the rest reads.
//
//   const scroll = createScroll({ reduce });
//   scroll.update()   → every frame, after lenis.raf (same ticker): Y (viewport heights), per-section p and weights
//   scroll.secs       → [{ key, el, len, pin, top, bot, p, w, raw }]  (top/bot in viewport heights from the page top)
//
// Pins are CSS sticky stages (sections.css): a pinned section is len × 100 vh tall and its stage holds for (len − 1)
// viewports, then scrolls away during the last one while the next section rises. ScrollTrigger measures the page
// (refresh on fonts, resize, layout changes) and drives the master trigger (start 0 → end 'max': later layout can
// never make it finish early, tech research §4.2) and the per-section enter/leave toggles.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger.js';
import Lenis from 'lenis';
import { clamp, smoothstep } from './util.js';

gsap.registerPlugin(ScrollTrigger);
export { gsap, ScrollTrigger };

const BLEND = 0.08;   // half-width (vh) of the claim cross-blend between neighbouring sections

export function createScroll({ reduce = false } = {}) {
  const lenis = new Lenis({
    lerp: reduce ? 1 : 0.1, smoothWheel: !reduce, syncTouch: false, autoRaf: false, allowNestedScroll: true,
    wheelMultiplier: 1, touchMultiplier: 1, anchors: false,
  });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));      // callback #1 of the ticker: the scroll moves first
  gsap.ticker.lagSmoothing(0);

  const els = [...document.querySelectorAll('[data-sec]')];
  const secs = els.map((el, i) => ({
    el, i, key: el.dataset.sec,
    len: parseFloat(el.style.getPropertyValue('--len')) || 1,
    pin: el.classList.contains('sec--pin'),
    ground0: el.getAttribute('data-ground') || 'paper',
    top: i, bot: i + 1, h: 1, p: 0, raw: 0, w: i === 0 ? 1 : 0, active: i === 0,
  }));
  const S = {
    lenis, secs, Y: 0, y: 0, lastY: -1, vh: window.innerHeight, max: 1, progress: 0, velocity: 0, changed: true,
    current: secs[0], refreshCount: 0, onRefresh: [],
  };

  function measure() {
    S.vh = window.innerHeight;
    const sy = window.scrollY;
    for (const s of secs) {
      const r = s.el.getBoundingClientRect();
      s.top = (r.top + sy) / S.vh; s.h = Math.max(0.01, r.height / S.vh); s.bot = s.top + s.h;
    }
    S.max = Math.max(1, document.documentElement.scrollHeight - S.vh);
    S.changed = true; S.refreshCount++;
    for (const fn of S.onRefresh) fn(S);
  }
  ScrollTrigger.addEventListener('refresh', measure);

  // the master trigger: global progress over the whole page
  ScrollTrigger.create({ start: 0, end: 'max', onUpdate: (self) => { S.progress = self.progress; } });
  // per-section toggles (aria and "active" flags used by interactions)
  for (const s of secs) {
    ScrollTrigger.create({ trigger: s.el, start: 'top bottom', end: 'bottom top', onToggle: (self) => { s.active = self.isActive; } });
  }

  function update() {
    const y = window.scrollY;
    S.y = y; S.Y = y / S.vh;
    S.changed = Math.abs(y - S.lastY) > 0.05;
    S.lastY = y;
    S.velocity = lenis.velocity || 0;
    const Y = S.Y, n = secs.length;
    let cur = secs[n - 1];
    const Yc = Y + 0.5;
    for (let i = 0; i < n; i++) {
      const s = secs[i];
      s.raw = Y - s.top;
      // flow sections may be taller than the brief's length (copy wraps): normalise so the choreography keys hold
      s.p = clamp(s.pin ? s.raw : s.raw * (s.len / s.h), 0, s.len);
      const wIn = i === 0 ? 1 : smoothstep(s.top - BLEND, s.top + BLEND, Y);
      const wOut = i === n - 1 ? 1 : 1 - smoothstep(s.bot - BLEND, s.bot + BLEND, Y);
      s.w = wIn * wOut;
      if (Yc >= s.top && Yc < s.bot) cur = s;
    }
    if (Yc < secs[0].top) cur = secs[0];
    S.current = cur;
    if (S.max > 1) S.progress = clamp(y / S.max);
    return S;
  }

  const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
  /** smooth jump to an element or a y (px) */
  function scrollTo(target, { immediate = false, offset = 0, duration } = {}) {
    const y = typeof target === 'number' ? target : target.getBoundingClientRect().top + window.scrollY;
    const d = Math.abs(y + offset - window.scrollY) / S.vh;
    lenis.scrollTo(y + offset, { immediate: immediate || reduce, duration: duration ?? Math.min(2.4, 0.9 + d * 0.06), easing: easeInOut, force: true });
  }
  /** the y (px) at which a section has progress p */
  const yOf = (s, p) => (s.top + (s.pin ? p : p * (s.h / s.len))) * S.vh;

  S.update = update;
  S.measure = measure;
  S.scrollTo = scrollTo;
  S.yOf = yOf;
  S.stop = () => lenis.stop();
  S.start = () => lenis.start();
  S.refresh = () => ScrollTrigger.refresh();
  S.byKey = (k) => secs.find((s) => s.key === k);
  measure();
  return S;
}
