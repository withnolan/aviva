// s10-s12-t17.mjs: T17 + T25 at 1440×900: the vote flips the split-flap board (it lands on the same rows), the vote
// buttons are magnetic, the s12 Model group drives copies / pages / tier / table / the announcement, dims read A4.
import { launch } from './launch.mjs';
import fs from 'node:fs';
const base = process.argv[2] || 'http://localhost:8080/', out = 'work/screenshots/build/t17';
fs.mkdirSync(out, { recursive: true });
const browser = await launch();
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })).newPage();
const errors = [];
page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errors.push(m.text().slice(0, 200)); });
page.on('pageerror', (e) => errors.push(String(e).slice(0, 200)));
await page.goto(base, { waitUntil: 'load', timeout: 90000 });
for (let i = 0; i < 200; i++) { if (await page.evaluate(() => !!(window.__aviva && window.__aviva.ready)).catch(() => false)) break; await page.waitForTimeout(100); }
const go = async (k, p, w = 2600) => { await page.evaluate(([k, p]) => { const S = window.__aviva.scroll; S.scrollTo(S.yOf(S.byKey(k), p), { immediate: true }); }, [k, p]); await page.waitForTimeout(w); };
const board = () => page.evaluate(() => [...document.querySelectorAll('#s10-lb .board__row')].map((r) => [...r.querySelectorAll('.flap')].map((f) => f.__ch).join('')));
await go('s10', 1.0);
const btn = await page.$('[data-vote="b"]'), bb = await btn.boundingBox();
await page.mouse.move(bb.x + bb.width - 4, bb.y + bb.height / 2); await page.waitForTimeout(400);
console.log('magnetic --mx while hovering:', await page.evaluate(() => getComputedStyle(document.querySelector('[data-vote="b"]')).getPropertyValue('--mx')));
await page.click('[data-vote="a"]');
await page.waitForTimeout(350);
console.log('board mid-flip:', JSON.stringify(await board()));
await page.screenshot({ path: `${out}/s10-flipping.jpg`, type: 'jpeg', quality: 82 });
await page.waitForTimeout(2600);
console.log('board landed:', JSON.stringify(await board()));
await page.mouse.move(40, 860); await page.waitForTimeout(700);
console.log('magnetic --mx after leaving:', await page.evaluate(() => getComputedStyle(document.querySelector('[data-vote="b"]')).getPropertyValue('--mx')));
await page.screenshot({ path: `${out}/s10-voted.jpg`, type: 'jpeg', quality: 82 });
await go('s12', 1.0);
const dims = () => page.evaluate(() => [...document.querySelectorAll('.dims__lab.is-on')].map((e) => e.textContent.trim()));
console.log('s12 dims (A4 expected):', JSON.stringify(await dims()));
await page.click('#s12-model label:nth-child(2)'); await page.waitForTimeout(600);
console.log('pro:', JSON.stringify(await page.evaluate(() => [document.getElementById('s12-copies').textContent, document.getElementById('s12-pages').textContent, document.getElementById('s12-sr').textContent, document.querySelector('#s12-cmp th.is-sel').dataset.tier])));
await page.screenshot({ path: `${out}/s12-pro.jpg`, type: 'jpeg', quality: 82 });
await page.keyboard.press('ArrowLeft'); await page.waitForTimeout(600);
console.log('back to base (arrow):', JSON.stringify(await page.evaluate(() => [document.getElementById('s12-copies').textContent, document.getElementById('s12-sr').textContent])));
console.log('errors:', errors.length ? errors : 'none');
await browser.close();
