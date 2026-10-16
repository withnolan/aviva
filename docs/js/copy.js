// copy.js: runtime strings come from <template id="copy-bank"> in index.html, so every word of copy lives in
// one file with its brief id (data-copy). copy('ream.status', { n: 499 }) → "499 left in this ream."
const bank = new Map();

export function loadCopy(doc = document) {
  const tpl = doc.getElementById('copy-bank');
  if (!tpl) return;
  for (const el of tpl.content.querySelectorAll('[data-copy]')) bank.set(el.dataset.copy, el.textContent.trim());
}

export function copy(id, vars) {
  let s = bank.get(id);
  if (s === undefined) {
    const el = document.querySelector(`[data-copy="${id}"]`);
    s = el ? el.textContent.trim() : '';
  }
  if (vars) for (const k in vars) s = s.split(`{${k}}`).join(String(vars[k]));
  return s;
}

/** Sanitise visitor text for DOM echo: plain text only, collapsed whitespace, max n characters then "…". */
export function sanitise(text, n = 80) {
  const t = String(text || '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim();
  return t.length > n ? t.slice(0, n).trimEnd() + '…' : t;
}
