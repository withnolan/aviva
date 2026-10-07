// config.js: the few values that must live in exactly one place.
//
// CREDIT: the person credited in the final CTA and the footer (decision #21: the GitHub account is now withnolan).
// Changing the name or the URLs here updates the site at boot (ui.applyCredit fills every [data-credit] element).
// index.html carries the same values as plain text for the no-JS page.
export const CREDIT = {
  name: 'withnolan',
  profile: 'https://github.com/withnolan',
  repo: 'https://github.com/withnolan/aviva',
};

// The section plan (brief Part 2): id, length in viewport heights, pinned or not, ground.
// The DOM is the source of the lengths (style="--len:…"); this table is used to sanity-check it at boot.
export const SECTIONS = [
  { id: 's01-hero', key: 's01', len: 1.5, pin: false },
  { id: 's02-thin', key: 's02', len: 3, pin: true },
  { id: 's03-intelligence', key: 's03', len: 6, pin: true },
  { id: 's04-outputs', key: 's04', len: 8, pin: true },
  { id: 's05-architecture', key: 's05', len: 5, pin: true },
  { id: 's06-release-notes', key: 's06', len: 4, pin: false },
  { id: 's07-surface', key: 's07', len: 4.5, pin: true },
  { id: 's08-afterlife', key: 's08', len: 3, pin: false, ink: true },
  { id: 's09-reviews', key: 's09', len: 4, pin: false, ink: true },
  { id: 's10-arena', key: 's10', len: 3, pin: true, ink: true },
  { id: 's11-claims', key: 's11', len: 7, pin: true },
  { id: 's12-sizes', key: 's12', len: 4, pin: true },
  { id: 's13-paper', key: 's13', len: 2, pin: false },
  { id: 's14-release', key: 's14', len: 2.5, pin: true },
  { id: 's15-footer', key: 's15', len: 0.5, pin: false },
];

// Nav groups (brief 3.0): SHEET covers s01–s04, SPECS s05–s11, SIZES s12, PAPER s13–s15.
export const NAV_GROUP = { s01: 0, s02: 0, s03: 0, s04: 0, s05: 1, s06: 1, s07: 1, s08: 1, s09: 1, s10: 1, s11: 1, s12: 2, s13: 3, s14: 3, s15: 3 };

// Query flags (for testing): ?nogl forces the static page, ?paper=placeholder uses the stand-in sheet instead of the
// visual-designer's module, ?debug exposes window.__aviva and logs timings, ?nointro shortens the loader.
const q = new URLSearchParams(location.search);
export const FLAGS = {
  nogl: q.has('nogl'),
  paper: q.get('paper') || 'real',
  debug: q.has('debug'),
  nointro: q.has('nointro'),
  reduce: q.has('reduce'),            // force the reduced-motion version (testing; the media query does it for real)
};

// Files that other agents have not delivered yet. Flip a switch to true when the file lands, so the site never
// requests a missing file (a 404 is a console error in tools/shoot.mjs). Everything degrades gracefully meanwhile.
export const FEATURES = {
  paperPaint: false,       // docs/js/paper/paint.js (the GPU pencil). Until then: the canvas pencil, shown as an overlay.
  paperCrumple: false,     // docs/assets/paper/crumple.bin(.gz) (the baked crumple). Until then: a fold-based stand-in.
  fallbackStills: false,   // docs/assets/fallback/f1–f6.webp (brief 5.10). Until then: CSS-drawn sheet slots.
  claimRenders: false,     // docs/assets/claims/c1–c8.webp (brief 5.6). Until then: a drawn sheet in a studio well.
  floorPrint: true,        // docs/assets/logo/wordmark-floor.png (the hero floor wordmark)
};

export const REAM_SIZE = 500;
