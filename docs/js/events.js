// events.js: the time-driven layer on top of the scroll-driven state. Interactions start these tweens; the
// choreography reads E every frame and folds the values into its claims (so scrolling back still works).
import { gsap } from 'gsap';

export const E = {
  loader: { sheet: 0 },                              // sheet opacity at the end of the loader
  intro: { fall: 0, started: false, landed: false },  // the hero leaf-fall, 0 → 1 over ≈ 2.4 s
  think: { curl: 0 },                                 // s03 "thinking" corner curl
  regen: { crumple: 0, roll: 0, drop: 1, hidden: 0, fade: 1, busy: false },
  tear: { p1: 0, p2: 0, split1: 0, split2: 0, refuse: 0, busy: false },
  loupe: { x: 0.5 },                                  // s07 magnifier position across the sheet, 0..1
  arena: { loser: null, crumple: 0, roll: 0, drop: 1, hidden: 0, bow: 0, fade: 1, winner: 'A', voted: null, busy: false },
  size: { choice: null },                             // s12: 'A5' | 'A4' | 'A3' once the visitor clicked
  release: { plane: 0, fly: 0, fade: 1, started: false, done: false },
  hover: { x: 0, y: 0, on: 0 },                       // s04: pointer position (−1..1) for the outputs' sway
  cues: {},                                           // s06 / s09 scroll cues (written by ui.js)
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
