// claims.js (T23): s11, the claims row (brief 11.1 row s11, 5.6, 3.12).
//   The darkroom: each card arrives as a blank print, and its render develops on it as it nears the centre, from paper
//   white through a warm, low-contrast stage to the full image (--dev 0..1, CSS filters). A developed print stays
//   developed; scrolling back un-develops nothing that has passed the centre.
//   2.5D: the render drifts inside its window against the row (it sits deeper than the card), and under the pointer
//   the card tilts up to 2 degrees while the render shifts the other way. Reduced motion: no tilt, no drift.
//   The caption shows on the card nearest the centre only. The cards take focus: a focused card is scrolled to the
//   centre. ui.js owns the track (--track); this module reads it.
import { smoothstep } from './util.js';

export function createClaims({ scroll, reduce = false }) {
  const list = document.getElementById('claims'), sec = scroll.byKey('s11');
  if (!list || !sec) return { measure() {}, frame() {} };
  const cards = [...list.querySelectorAll('.claim')].map((el) => ({ el, x: 0, w: 0, dev: '', px: '', centre: false, done: false }));
  const P0 = 0.8, P1 = 6.4;          // ui.js: the row translates over these vh of s11
  let max = 0, lastTrack = 0;
  const set = (el, k, v) => el.style.setProperty(k, v);

  function measure() {
    for (const c of cards) { c.x = c.el.offsetLeft; c.w = c.el.offsetWidth; }
    const last = cards[cards.length - 1];                   // the track ends with the last print centred
    max = last ? Math.max(0, last.x + last.w / 2 - innerWidth / 2) : 0;
    return max;
  }

  function frame(track) {
    lastTrack = track;
    const W = innerWidth, mid = W / 2, p = sec.p;
    const entry = smoothstep(0.2, 0.85, p);          // the row rises in blank; the first print develops as it arrives
    let best = null, bd = Infinity;
    for (const c of cards) {
      const d = c.x + c.w / 2 - track - mid;          // the card's centre relative to the viewport's centre (px)
      const dev = Math.min(entry, d <= W * 0.05 ? 1 : 1 - smoothstep(W * 0.05, W * 0.42, d));
      const dv = dev.toFixed(3);
      if (dv !== c.dev) { c.dev = dv; set(c.el, '--dev', dv); const done = dev >= 0.999; if (done !== c.done) { c.done = done; c.el.classList.toggle('is-done', done); } }
      const px = reduce ? '0.0' : (-20 * Math.max(-1, Math.min(1, d / (W * 0.55)))).toFixed(1);
      if (px !== c.px) { c.px = px; set(c.el, '--px', px + 'px'); }
      if (Math.abs(d) < bd) { bd = Math.abs(d); best = c; }
    }
    const live = p > 0.5 && p < 6.6;
    for (const c of cards) {
      const on = live && c === best && bd < W * 0.3;
      if (on !== c.centre) { c.centre = on; c.el.classList.toggle('is-centre', on); }
    }
  }

  // the pointer: a 2 degree tilt toward the cursor, the render shifting the other way (mouse only)
  if (!reduce) {
    for (const c of cards) {
      c.el.addEventListener('pointermove', (e) => {
        if (e.pointerType !== 'mouse') return;
        const r = c.el.getBoundingClientRect(), nx = (e.clientX - r.left) / r.width - 0.5, ny = (e.clientY - r.top) / r.height - 0.5;
        set(c.el, '--ry', (nx * 4).toFixed(2) + 'deg'); set(c.el, '--rx', (-ny * 4).toFixed(2) + 'deg');
        set(c.el, '--ix', (-nx * 12).toFixed(1) + 'px'); set(c.el, '--iy', (-ny * 9).toFixed(1) + 'px');
        c.el.classList.add('is-tilt');
      }, { passive: true });
      c.el.addEventListener('pointerleave', () => {
        for (const k of ['--rx', '--ry', '--ix', '--iy']) c.el.style.removeProperty(k);
        c.el.classList.remove('is-tilt');
      });
    }
  }
  // keyboard: a focused card is brought to the centre (the row follows the page's scroll)
  list.addEventListener('focusin', (e) => {
    const c = cards.find((k) => k.el === e.target);
    if (!c || !max) return;
    const t = Math.max(0, Math.min(max, c.x + c.w / 2 - innerWidth / 2));
    scroll.scrollTo(scroll.yOf(sec, P0 + ((P1 - P0) * t) / max));
  });
  return { measure, frame, get max() { return max; }, get track() { return lastTrack; } };
}
