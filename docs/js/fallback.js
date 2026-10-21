// fallback.js: the static page (no WebGL, brief 3.20), image slots that degrade gracefully, and the context-loss
// line (brief 3.0 ctx.*). The static page is the same DOM, copy and order: the canvas is replaced by designed stills
// (F1–F6) where their beats are, interactive beats show their .fallback line, the Arena and the size picker still work.
import { FEATURES } from './config.js';
import { copy } from './copy.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/** a CSS-drawn sheet standing in for a still or a render that has not been exported yet */
function drawnSlot(fig, img, cls) {
  img.classList.add('is-missing');
  img.setAttribute('aria-hidden', 'true');
  fig.classList.add(cls);
  if (img.alt) { fig.setAttribute('role', 'img'); fig.setAttribute('aria-label', img.alt); }
}

export function setupImages({ gl }) {
  // the six testimonial drawings exist: load them lazily
  for (const img of $$('img.review__art[data-src]')) { img.loading = 'lazy'; img.decoding = 'async'; img.src = img.dataset.src; }
  // claim-card renders (both modes)
  for (const img of $$('img.claim__img[data-src]')) {
    if (FEATURES.claimRenders) { img.loading = 'lazy'; img.decoding = 'async'; img.src = img.dataset.src; }
    else drawnSlot(img.closest('.claim__fig'), img, 'is-drawn');
  }
  // the fallback stills: only on the static page (brief 5.10: they load only when WebGL is unavailable)
  if (!gl) {
    for (const fig of $$('.fb-still')) {
      const img = $('img', fig); if (!img) continue;
      if (FEATURES.fallbackStills) { img.loading = 'lazy'; img.decoding = 'async'; img.src = img.dataset.src; }
      else drawnSlot(fig, img, 'is-drawn');
    }
  }
}

export function enterFallback() {
  const root = document.documentElement;
  root.classList.add('no-webgl');
  const banner = $('#fb-banner');
  if (banner) {
    banner.hidden = false;
    const ok = $('#fb-dismiss');
    ok && ok.addEventListener('click', () => { banner.hidden = true; const main = $('#content'); main && main.focus({ preventScroll: true }); }, { once: true });
  }
  const gl = $('#gl'); if (gl) gl.setAttribute('aria-hidden', 'true');
}

/** the context-loss line: "This demo can't crash. It can only crease." */
export function contextLine() {
  const el = $('#ctx-status');
  let t = 0;
  return {
    lost() { if (!el) return; clearTimeout(t); el.textContent = copy('ctx.lost'); el.classList.add('is-on'); },
    restored(ok) {
      if (!el) return;
      clearTimeout(t);
      if (!ok) { el.classList.remove('is-on'); return; }
      el.textContent = copy('ctx.restored'); el.classList.add('is-on');
      t = setTimeout(() => el.classList.remove('is-on'), 2600);
    },
  };
}
