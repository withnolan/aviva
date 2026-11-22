// sec-shots.mjs: 1440×900 shots of one section at given progress values (vh into the section), with ?nointro.
// node work/scripts/web/sec-shots.mjs <secKey> <p1,p2,...> <outDir> [--mouse x,y] [--wait ms] [--sweep]
//   --mouse x,y  park the pointer there (CSS px) before each shot (pointer-driven effects)
//   --sweep      for each p: shot with the pointer at the left, then after moving it to the right
import { launch } from './launch.mjs';
import { mkdirSync } from 'node:fs';
const [key = 's07', list = '2,3', out = 'work/screenshots/build/sec'] = process.argv.slice(2);
const arg = (n, d) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : d; };
const mouse = arg('--mouse', null), wait = +arg('--wait', 3500), sweep = process.argv.includes('--sweep');
mkdirSync(out, { recursive: true });
const browser = await launch();
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })).newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(String(e).slice(0, 200)));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 200)); });
await page.goto('http://localhost:8080/?nointro', { waitUntil: 'load', timeout: 120000 });
for (let i = 0; i < 400; i++) { if (await page.evaluate(() => !!(window.__aviva && window.__aviva.ready)).catch(() => false)) break; await page.waitForTimeout(100); }
const go = (p) => page.evaluate(([k, p]) => { const S = window.__aviva.scroll; S.scrollTo(S.yOf(S.byKey(k), p), { immediate: true }); }, [key, p]);
for (const p of list.split(',').map(Number)) {
  if (mouse) { const [x, y] = mouse.split(',').map(Number); await page.mouse.move(x, y); }
  await go(p); await page.waitForTimeout(wait);
  if (sweep) {
    await page.mouse.move(200, 450, { steps: 4 }); await page.waitForTimeout(wait);
    await page.screenshot({ path: `${out}/${key}-p${p}-left.jpg`, quality: 80 });
    await page.mouse.move(1240, 450, { steps: 8 }); await page.waitForTimeout(wait);
    await page.screenshot({ path: `${out}/${key}-p${p}-right.jpg`, quality: 80 });
  } else await page.screenshot({ path: `${out}/${key}-p${p}.jpg`, quality: 80 });
  console.log('shot', key, p);
}
console.log('errors:', errors.length ? errors : 'none');
await browser.close();
