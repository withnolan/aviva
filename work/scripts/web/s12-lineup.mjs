// s12-lineup.mjs: the lineup's deal at 1440×900: Ream Pro Max chosen (mid-deal, settled), then Notebook Pro (the
// binding), with the passive preview first. node work/scripts/web/s12-lineup.mjs [outDir]
import { launch } from './launch.mjs';
import { mkdirSync } from 'node:fs';
const out = process.argv[2] || 'work/screenshots/build/lineup';
mkdirSync(out, { recursive: true });
const browser = await launch();
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })).newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(String(e).slice(0, 200)));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 200)); });
await page.goto('http://localhost:8080/?nointro', { waitUntil: 'load', timeout: 120000 });
for (let i = 0; i < 400; i++) { if (await page.evaluate(() => !!(window.__aviva && window.__aviva.ready)).catch(() => false)) break; await page.waitForTimeout(100); }
const go = (p) => page.evaluate((p) => { const S = window.__aviva.scroll; S.scrollTo(S.yOf(S.byKey('s12'), p), { immediate: true }); }, p);
const state = () => page.evaluate(() => { const L = window.__aviva.world.ctx.lineup; return `${window.__aviva.E.size.model} count ${L.count.toFixed(0)} t ${L.t.toFixed(2)} bind ${L.bind.toFixed(2)}`; });
await page.mouse.move(30, 880);
// the passive preview: Notebook Pro at 1.1 vh
await go(1.1); await page.waitForTimeout(6000);
console.log('preview 1.1:', await state());
await page.screenshot({ path: `${out}/s12-preview-pro.jpg`, quality: 82 });
// the visitor chooses Ream Pro Max
await page.click('#s12-model input[value="max"]', { force: true });
await page.waitForTimeout(1600);
console.log('max, mid:', await state());
await page.screenshot({ path: `${out}/s12-max-deal.jpg`, quality: 82 });
await page.waitForTimeout(7000);
console.log('max, settled:', await state());
await page.screenshot({ path: `${out}/s12-max.jpg`, quality: 82 });
console.log('errors:', errors.length ? errors : 'none');
await browser.close();
