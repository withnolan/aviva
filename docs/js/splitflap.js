// splitflap.js: the s10 scoreboard (brief 3.11, 5.12): a split-flap board with a graphite housing, white flaps and
// dark digits. Every vote makes the whole board flip, and it lands on the same two rows. Both models are AVIVA A4.
//
//   const board = createSplitFlap(el);   // el holds [data-flap="…"] slots; each becomes a row of flaps
//   board.show(text?)                    // flip every slot to its text (staggered, a few random characters first)
//   board.set()                          // jump straight to the text (reduced motion, the static page)
//
// Each flap is four half-cards: the top half of the new character (fixed), the bottom half of the old one (fixed
// until the leaf lands), and the leaf, whose front is the old top falling and whose back is the new bottom landing.
// Transforms and opacity only; the timing lives in CSS (.flap.is-flip, --fd).
const CHARS = ' ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.%';

function cell() {
  const c = document.createElement('span');
  c.className = 'flap';
  c.innerHTML = '<span class="flap__t"></span><span class="flap__b"></span><span class="flap__lt"></span><span class="flap__lb"></span>';
  c.__ch = ' ';
  for (const p of c.children) p.dataset.c = ' ';
  return c;
}
function setCh(c, ch) { c.__ch = ch; for (const p of c.children) p.dataset.c = ch; c.classList.remove('is-flip'); }

export function createSplitFlap(el, { reduce = () => false } = {}) {
  const slots = [...el.querySelectorAll('[data-flap]')].map((s) => {
    const text = s.dataset.flap, cells = [...text].map(() => cell());
    s.textContent = ''; s.append(...cells); s.setAttribute('aria-hidden', 'true');
    return { s, text, cells };
  });
  const timers = [];
  function flip(c, to, delay, dur) {
    timers.push(setTimeout(() => {
      const from = c.__ch;
      const [t, b, lt, lb] = c.children;
      t.dataset.c = to; b.dataset.c = from; lt.dataset.c = from; lb.dataset.c = to;
      c.style.setProperty('--fd', dur + 'ms');
      c.classList.remove('is-flip'); void c.offsetWidth; c.classList.add('is-flip');
      c.__ch = to;
      timers.push(setTimeout(() => { b.dataset.c = to; lt.dataset.c = to; c.classList.remove('is-flip'); }, 2 * dur + 20));
    }, delay));
  }
  return {
    show() {
      if (reduce()) { this.set(); return; }
      for (const t of timers) clearTimeout(t);
      timers.length = 0;
      let col = 0;
      for (const { text, cells } of slots) {
        cells.forEach((c, i) => {
          const target = text[i], steps = target === ' ' ? 1 : 3 + ((i * 7 + col * 3) % 4), dur = 55;
          for (let k = 0; k < steps; k++) {
            const ch = k === steps - 1 ? target : CHARS[1 + Math.floor(Math.random() * (CHARS.length - 1))];
            flip(c, ch, (col + i) * 28 + k * (2 * dur + 30), dur);
          }
        });
        col += 2;
      }
    },
    set() { for (const t of timers) clearTimeout(t); timers.length = 0; for (const { text, cells } of slots) cells.forEach((c, i) => setCh(c, text[i])); },
  };
}
