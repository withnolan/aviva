// magnetic.js: the subtle magnetic pull for controls (brief 11.1: the s10 votes, the s12 model options, the s15 links;
// T40's cursor pass reuses it). One listener set per element, transform only, no layout reads while moving.
//
//   import { magnetize, magnetic } from './magnetic.js';
//   magnetize(document);                 // every [data-magnetic] element
//   const m = magnetic(el, { max: 5 });  // one element; m.destroy()
//
// While a fine pointer is over the element, it leans toward the pointer: --mx / --my (px) are written on the element
// and CSS decides what moves (the whole element, or only its content where hairline borders must stay put, see
// .seg__opt in ui.css). The pull is a fraction of the pointer's offset from the centre, capped at `max` px, so it
// stays a few pixels: felt more than seen. On leave it eases back (the transition lives in CSS). Off for touch, for
// a coarse pointer and in reduced motion.
const reduceMQ = typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : null;
const calm = () => (reduceMQ && reduceMQ.matches) || document.documentElement.classList.contains('reduce-motion');

export function magnetic(el, { strength = 0.22, max = 5 } = {}) {
  if (!el || el.__magnetic) return el && el.__magnetic;
  let box = null, raf = 0, tx = 0, ty = 0;
  const write = () => { raf = 0; el.style.setProperty('--mx', tx.toFixed(2) + 'px'); el.style.setProperty('--my', ty.toFixed(2) + 'px'); };
  const queue = () => { if (!raf) raf = requestAnimationFrame(write); };
  function enter(e) {
    if (e.pointerType !== 'mouse' || calm()) return;
    box = el.getBoundingClientRect();                 // one read per hover, never per move
    el.classList.add('is-magnet');
  }
  function move(e) {
    if (!box || e.pointerType !== 'mouse') return;
    const dx = e.clientX - (box.left + box.width / 2), dy = e.clientY - (box.top + box.height / 2);
    const k = Math.min(1, max / Math.max(1e-3, Math.hypot(dx, dy) * strength));
    tx = dx * strength * k; ty = dy * strength * k;
    queue();
  }
  function leave() {
    if (!box) return;
    box = null; tx = 0; ty = 0;
    el.classList.remove('is-magnet');                 // CSS swaps to the slower, eased return
    queue();
  }
  el.addEventListener('pointerenter', enter);
  el.addEventListener('pointermove', move);
  el.addEventListener('pointerleave', leave);
  el.addEventListener('pointercancel', leave);
  const api = {
    destroy() {
      el.removeEventListener('pointerenter', enter); el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave); el.removeEventListener('pointercancel', leave);
      cancelAnimationFrame(raf); el.style.removeProperty('--mx'); el.style.removeProperty('--my'); el.__magnetic = null;
    },
  };
  el.__magnetic = api;
  return api;
}

export function magnetize(root = document, selector = '[data-magnetic]') {
  return [...root.querySelectorAll(selector)].map((el) => magnetic(el, {
    max: el.dataset.magnetic ? parseFloat(el.dataset.magnetic) || 5 : 5,
  }));
}
