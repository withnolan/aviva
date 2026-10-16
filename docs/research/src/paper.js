// paper.js: prepares paper.html for printing (work/scripts/design/build-paper.mjs) and for viewing in a browser.
//  1. inlines each figure SVG (so its text uses the page's fonts), prefixing ids so figures cannot clash;
//  2. waits for every face and image;
//  3. measures each page: how full its text block is, whether anything overflows it (down, or sideways into an
//     overflow column), and the height of the two text columns (balance);
//  4. sets window.__report and window.__ready = true.
(async function () {
  const report = { pages: [], problems: [] };
  try {
    // 1. figures
    const arts = [...document.querySelectorAll('.art[data-svg]')];
    await Promise.all(arts.map(async (el, k) => {
      const url = el.getAttribute('data-svg');
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) { report.problems.push(`figure ${url}: HTTP ${res.status}`); return; }
      let svg = await res.text();
      const pre = `f${k}-`;
      svg = svg.replace(/\bid="([^"]+)"/g, `id="${pre}$1"`).replace(/url\(#([^)]+)\)/g, `url(#${pre}$1)`).replace(/href="#([^"]+)"/g, `href="#${pre}$1"`);
      el.innerHTML = svg;
      const s = el.querySelector('svg');
      if (s) { s.setAttribute('aria-hidden', 'false'); s.setAttribute('focusable', 'false'); }
    }));

    // 2. faces and images
    const faces = ['400 10pt "STIX Two Text"', 'italic 400 10pt "STIX Two Text"', '400 10pt "STIX Two Math"',
      '300 10pt "Hanken Grotesk"', '400 10pt "Hanken Grotesk"', '500 10pt "Hanken Grotesk"', '400 10pt "DM Mono"'];
    await Promise.all(faces.map((f) => document.fonts.load(f, 'aviva √≈ 0123')));
    await document.fonts.ready;
    for (const f of faces) if (!document.fonts.check(f, 'aviva')) report.problems.push(`font not loaded: ${f}`);
    await Promise.all([...document.images].map((im) => (im.complete ? (im.naturalWidth ? null : report.problems.push(`image missing: ${im.src}`)) : new Promise((r) => { im.onload = r; im.onerror = () => { report.problems.push(`image failed: ${im.src}`); r(); }; }))));
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

    // 2b. keep only the soft hyphens that are used: Chromium writes every U+00AD into the PDF text layer, which spoils
    // search and copy. Removing a break opportunity that a line did not take cannot change the line breaks.
    let kept = 0, dropped = 0;
    const keepAll = /[?&]keephy\b/.test(location.search);
    // does the line break at node.data[i]? Chromium paints the hyphen as part of the next letter's box, so test whether a
    // range from the letter before to the letter after spans two lines.
    const breaksAt = (node, i) => { const rg = document.createRange(); rg.setStart(node, i - 1); rg.setEnd(node, i + 2);
      const rs = [...rg.getClientRects()]; return rs.length > 1 && rs[rs.length - 1].top - rs[0].top > 0.5 * rs[0].height; };
    const walker = document.createTreeWalker(document.querySelector('.paper'), NodeFilter.SHOW_TEXT, { acceptNode: (n) => (n.data.includes('­') ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP) });
    const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
    for (const node of keepAll ? [] : nodes) {
      const marks = []; for (let i = node.data.indexOf('­'); i !== -1; i = node.data.indexOf('­', i + 1)) marks.push(i);
      const remove = [];
      for (const i of marks) {
        if (i === 0 || i === node.data.length - 1) { kept++; continue; }
        if (breaksAt(node, i)) kept++; else remove.push(i);
      }
      if (remove.length) { let s = node.data; for (const i of remove.reverse()) s = s.slice(0, i) + s.slice(i + 1); node.data = s; dropped += remove.length; }
    }
    report.hyphens = { used: kept, removed: dropped };
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

    // 3. measure
    const mm = (px) => +(px * 25.4 / 96).toFixed(1);
    for (const page of document.querySelectorAll('.page')) {
      const frame = page.querySelector('.frame');
      const fr = frame.getBoundingClientRect();
      let bottom = fr.top, overflow = [];
      const leaves = frame.querySelectorAll('h1, h2, h3, p, li, dt, dd, figure, .tbl, table, pre, .eq, .listing, aside, .art');
      for (const el of leaves) {
        const r = el.getBoundingClientRect();
        if (!r.width && !r.height) continue;
        bottom = Math.max(bottom, r.bottom);
        if (r.bottom > fr.bottom + 0.5) overflow.push(`${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''} ends ${mm(r.bottom - fr.bottom)} mm below the text block`);
        if (r.right > fr.right + 0.5 || r.left < fr.left - 0.5) overflow.push(`${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''} runs ${mm(Math.max(r.right - fr.right, fr.left - r.left))} mm outside the text block`);
      }
      // column heights: split the .cols children by their left edge
      const cols = [...page.querySelectorAll('.cols')].map((c) => {
        const cr = c.getBoundingClientRect(), mid = cr.left + cr.width / 2;
        let l = cr.top, rgt = cr.top;
        for (const el of c.querySelectorAll('h2, h3, p, li, dt, dd, figure, .tbl, pre, .eq')) {
          const r = el.getBoundingClientRect(); if (!r.height) continue;
          if (r.left < mid) l = Math.max(l, r.bottom); else rgt = Math.max(rgt, r.bottom);
        }
        return { left: mm(l - cr.top), right: mm(rgt - cr.top) };
      });
      const fill = (bottom - fr.top) / fr.height;
      report.pages.push({ page: page.id, fill: +(fill * 100).toFixed(0), usedMM: mm(bottom - fr.top), frameMM: mm(fr.height), cols, overflow });
      for (const o of overflow) report.problems.push(`${page.id}: ${o}`);
    }
    // cross-references and citations all resolve
    for (const a of document.querySelectorAll('a[href^="#"]')) {
      const id = a.getAttribute('href').slice(1);
      if (!document.getElementById(id)) report.problems.push(`broken link #${id}`);
    }
    const cited = new Set([...document.querySelectorAll('.cite a')].map((a) => a.getAttribute('href').slice(1)));
    for (const li of document.querySelectorAll('.refs li')) if (!cited.has(li.id)) report.problems.push(`reference never cited: ${li.id}`);
  } catch (e) {
    report.problems.push('paper.js: ' + (e && e.message ? e.message : e));
  }
  window.__report = report;
  window.__ready = true;
  if (report.problems.length) console.warn('[paper] ' + report.problems.join(' | '));
})();
