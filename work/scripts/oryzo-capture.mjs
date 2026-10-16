#!/usr/bin/env node
// oryzo-capture.mjs: step through a whole long scroll page at 1440x900 and save N evenly spaced JPGs.
// Findings: wait >= 25 s after load, then plain window.scrollTo works over the whole page (verified to 55,000 px).
//   node work/scripts/oryzo-capture.mjs                                   -> ORYZO, 40 frames -> work/screenshots/density/oryzo/
//   node work/scripts/oryzo-capture.mjs --url http://localhost:8080/?nointro --out work/screenshots/density/aviva --n 30 --prefix aviva
// options: --url (https://oryzo.ai) --out --n (40) --settle ms (2500) --first ms (30000: ORYZO's loader is slow under software WebGL)
//          --mode scrollTo|keys|wheel (scrollTo)
// Findings so far (probe, headless SwiftShader, ~1 fps):
//  - oryzo.ai: no Lenis on window, no `lenis` class on <html>. scrollHeight is 49,967 px right after load and grows to ~56,691 px
//    about 15 s later, so it is re-read before every step.
//  - Native window.scrollTo(0, y) holds (scrollY stayed at 9000 for 4 s) once ~20 s have passed since load. Right after load
//    the page ignored it. Wheel and End were clamped at 9,200 in the probe: unresolved (possibly the page unlocks scroll
//    range progressively); this script therefore logs the real scrollY and retries before each shot.
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const argv = process.argv.slice(2), o = {};
for (let i = 0; i < argv.length; i++) if (argv[i].startsWith('--')) { const v = argv[i + 1]; o[argv[i].slice(2)] = (v === undefined || v.startsWith('--')) ? true : (i++, v); }
const url = o.url || 'https://oryzo.ai', out = o.out || 'work/screenshots/density/oryzo', N = +(o.n || 40);
const settle = +(o.settle || 2500), first = +(o.first || 30000), mode = o.mode || 'scrollTo', prefix = o.prefix || 'oryzo';
fs.mkdirSync(out, { recursive: true });
const args = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-webgl'];
let browser;
for (const exe of [undefined, '/opt/pw-browsers/chromium']) { try { browser = await chromium.launch({ headless: true, executablePath: exe, args }); break; } catch (e) { if (exe) throw e; } }
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })).newPage();
page.on('pageerror', (e) => console.log('[pageerror]', String(e).slice(0, 160)));
await page.goto(url, { waitUntil: 'load', timeout: 120000 });
await page.waitForTimeout(first);
const metrics = () => page.evaluate(() => ({ y: Math.round(scrollY), max: document.documentElement.scrollHeight - innerHeight }));
const log = [];
for (let i = 0; i < N; i++) {
  const { max } = await metrics();
  const target = Math.round((max * i) / (N - 1));
  if (mode === 'scrollTo') await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), target);
  else if (mode === 'keys') { await page.keyboard.press(i === N - 1 ? 'End' : 'PageDown'); }
  else { await page.mouse.move(720, 450); await page.mouse.wheel(0, target - (await metrics()).y); }
  await page.waitForTimeout(settle);
  let m = await metrics();
  if (mode === 'scrollTo' && Math.abs(m.y - target) > 40) { await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), target); await page.waitForTimeout(settle); m = await metrics(); }
  const file = path.join(out, `${prefix}-${String(i).padStart(2, '0')}.jpg`);
  await page.screenshot({ path: file, type: 'jpeg', quality: 80 });
  log.push({ i, target, reached: m.y, max: m.max, file }); console.log(i, 'target', target, 'reached', m.y, 'of', m.max);
}
fs.writeFileSync(path.join(out, 'capture-log.json'), JSON.stringify(log, null, 1));
await browser.close();
