// events.js: the time-driven layer on top of the scroll-driven state. Interactions start these tweens; the
// choreography reads E every frame and folds the values into its claims (so scrolling back still works).
import { gsap } from 'gsap';

// The hero intro (brief 10.3 H1–H4): E.intro.clock counts seconds from "loaded" (H1, the loader's nominal 2.2 s; a
// slow load shifts everything after H0). H1 0–0.4 the studio fades up · H2 0.4–2.2 the fold-in (five sheets, 0.12 s
// apart, 1.1 s each) · H3 2.1–2.6 the "4" · H4 2.6–4.8 the settle. DOM beats: eyebrow + h1 l1 at 2.7 (4.9 s), side +
// spec at 3.3 (5.5 s), the scroll hint at 3.8 (6.0 s); the loader drawing retracts at 2.6 and leaves at 3.0.
export const INTRO = { end: 4.8, retract: 2.6, gone: 3.0, l1: 2.7, foot: 3.3, hint: 3.8, ff: 0.4 };

export const E = {
  loader: { sheet: 0 },                              // sheet opacity at the end of the loader
  intro: { clock: 0, fade: 0, started: false, done: false, ff: false, hint: false },   // the hero intro (INTRO)
  think: { curl: 0 },                                 // s03 "thinking" corner curl
  regen: { crumple: 0, roll: 0, drop: 1, hidden: 0, fade: 1, busy: false },
  tear: { p1: 0, p2: 0, split1: 0, split2: 0, refuse: 0, busy: false },
  loupe: { x: 0.5 },                                  // s07 magnifier position across the sheet, 0..1
  arena: { loser: null, crumple: 0, roll: 0, drop: 1, hidden: 0, bow: 0, fade: 1, winner: 'A', voted: null, busy: false },
  size: { choice: 'A4', model: 'base' },               // s12: the sheet is always A4; model 'base' | 'pro' | 'max'
  release: { plane: 0, fly: 0, fade: 1, started: false, done: false },
  hover: { x: 0, y: 0, on: 0 },
  pointer: { nx: 0, ny: 0, x: 0, y: 0, on: false },     // the mouse anywhere on the page (interactions.js)                       // s04: pointer position (−1..1) for the outputs' sway
  cues: {},                                           // s06 / s09 scroll cues (written by ui.js)
  layout: { s10Top: 0 },                              // DOM edges the 3D layout keeps clear of (ui.js measures, % of the viewport)
  dissolve: { k: 0 },                                 // reduced motion: veil amount
  time: 0,                                            // seconds since boot (loops: breathing, sway)
};

let running = 0;
/** True while any of our tweens runs (the renderer keeps drawing). */
export const isAnimating = () => running > 0;

/** gsap.to wrapper that keeps the "animating" count (on-demand rendering). */
export function tween(target, vars) {
  const { onStart, onComplete, onInterrupt } = vars;
  return gsap.to(target, {
    ...vars,
    onStart() { running++; onStart && onStart.call(this); },
    onComplete() { running = Math.max(0, running - 1); onComplete && onComplete.call(this); },
    onInterrupt() { running = Math.max(0, running - 1); onInterrupt && onInterrupt.call(this); },
  });
}
export function timeline(vars = {}) {
  const tl = gsap.timeline({
    ...vars,
    onStart() { running++; vars.onStart && vars.onStart(); },
    onComplete() { running = Math.max(0, running - 1); vars.onComplete && vars.onComplete(); },
    onInterrupt() { running = Math.max(0, running - 1); },
  });
  return tl;
}
