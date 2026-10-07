// Figure 5 of the research paper: three microscope panels of ink spreading through fibres, rendered from the
// prototype's closed-form ink-front shader (work/scripts/paper-proto/ink-front.js) at t = 0.05, 0.35 and 1.0.
// Needs a static server whose root contains render.html, vendor/ (-> docs/vendor) and proto/ (-> paper-proto).
// Usage: node work/scripts/design/render-fig5.mjs http://localhost:8131/fig5 [size=1000]
import { launch } from './snap.mjs';
const [base, size = 1000] = process.argv.slice(2);
const b = await launch();
for (const t of ['0.05', '0.35', '1.0']) {
  const p = await b.newPage({ viewport: { width: +size, height: +size } });
  p.on('pageerror', (e) => console.log('ERR', e.message));
  await p.goto(`${base}/render.html?t=${t}&s=${size}`);
  await p.waitForFunction(() => window.__ready, null, { timeout: 180000 });
  await p.screenshot({ path: `docs/research/src/figures/fig5-t${t}.png` });
  await p.close();
  console.log('rendered t =', t);
}
await b.close();
