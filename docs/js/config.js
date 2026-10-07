// config.js: the few values that must live in exactly one place.
//
// CREDIT: the person credited in the final CTA and the footer (decision #21: the GitHub account is now withnolan).
// Changing the name or the URLs here updates the site at boot (ui.applyCredit fills every [data-credit] element).
// index.html carries the same values as plain text for the no-JS page; work/scripts/check-copy.mjs flags a mismatch.
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

// Query flags (for testing): ?nogl forces the static page, ?paper=real tries the visual-designer's module,
// ?debug exposes window.__aviva and logs timings, ?nointro skips the loader wait.
const q = new URLSearchParams(location.search);
export const FLAGS = {
  nogl: q.has('nogl'),
  paper: q.get('paper') || 'placeholder',
  debug: q.has('debug'),
  nointro: q.has('nointro'),
};

export const REAM_SIZE = 500;
