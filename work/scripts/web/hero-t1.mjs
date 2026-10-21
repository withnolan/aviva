// hero-t1.mjs: brief 11.9 T1 check at 1440×900. The intro plays once on time (H1–H4), input fast-forwards it,
// scroll is never locked, and scroll runs H5–H9 under a fixed h1 (l2 at 1.5 vh, the pin releases at 2.0 vh).
//   node work/scripts/web/hero-t1.mjs [baseUrl] [outDir]
import { launch } from './launch.mjs';
import fs from 'node:fs';

const base = process.argv[2] || 'http://localhost:8080/';
const out = process.argv[3] || 'work/screenshots/build/t1';
fs.mkdirSync(out, { recursive: true });
const browser = await launch();
const note = (k, v) => console.log(k.padEnd(36), typeof v === 'string' ? v : JSON.stringify(v));

async function open() {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errors.push(`[${m.type()}] ${m.text()}`.slice(0, 240)); });
  page.on('pageerror', (e) => errors.push(`[pageerror] ${String(e).slice(0, 240)}`));
  await page.goto(base, { waitUntil: 'load', timeout: 90000 });
  for (let i = 0; i < 200; i++) { if (await page.evaluate(() => !!(window.__aviva && window.__aviva.ready)).catch(() => false)) break; await page.waitForTimeout(100); }
  return { ctx, page, errors };
}
const st = (page) => page.evaluate(() => {
  const a = window.__aviva, I = a.E.intro, s = a.scroll.byKey('s01'), h1 = document.getElementById('s01-h1').getBoundingClientRect();
  const on = (q) => document.querySelector(q).classList.contains('is-in');
  return { clock: +I.clock.toFixed(2), done: I.done, ff: I.ff, p: +s.p.toFixed(2), h1Top: Math.round(h1.top), l1: on('.hero__l1'), l2: on('.hero__l2'), foot: on('.hero__foot'), hint: !document.getElementById('hint').classList.contains('is-off') };
});
const go = async (page, key, p, wait = 2400) => { await page.evaluate(([k, p]) => { const S = window.__aviva.scroll; S.scrollTo(S.yOf(S.byKey(k), p), { immediate: true }); }, [key, p]); await page.waitForTimeout(wait); };
const shot = (page, n) => page.screenshot({ path: `${out}/${n}.jpg`, type: 'jpeg', quality: 82 });

/* 1. the intro on its own clock, no input */
{
  const { ctx, page, errors } = await open();
  await page.waitForTimeout(1300);                                  // ≈ 3.5 s from the loader's first frame
  note('H2 (ready + 1.3 s)', await st(page)); await shot(page, '01-h2-falling');
  for (let i = 0; i < 120; i++) { if (await page.evaluate(() => window.__aviva.E.intro.done)) break; await page.waitForTimeout(100); }
  await page.waitForTimeout(1500);
  note('H4 rest (intro done)', await st(page)); await shot(page, '02-h4-rest');
  for (const p of [0.3, 0.9, 1.3, 1.6, 1.95]) { await go(page, 's01', p); note(`scroll s01 p ${p}`, await st(page)); await shot(page, `03-s01-p${String(p).replace('.', '_')}`); }
  await go(page, 's02', 0.4); note('s02 p 0.4 (pin released)', await st(page)); await shot(page, '04-s02-p0_4');
  await go(page, 's01', 0.0, 2000); note('back to the top (no replay)', await st(page));
  note('errors (intro run)', errors.length ? errors.slice(0, 8) : 'none');
  await ctx.close();
}

/* 2. input during the intro fast-forwards it in 0.4 s; the wheel also scrolls (never locked) */
{
  const { ctx, page, errors } = await open();
  await page.waitForTimeout(600);
  await page.mouse.move(720, 450);
  const before = await st(page);
  await page.mouse.wheel(0, 120);
  const t0 = Date.now();
  for (let i = 0; i < 40; i++) { if (await page.evaluate(() => window.__aviva.E.intro.done)) break; await page.waitForTimeout(50); }
  note('ff: before / ms to done', [before.clock, Date.now() - t0]);
  await page.waitForTimeout(1200);
  note('ff: after (scrolled?)', await st(page)); await shot(page, '05-ff-after-wheel');
  note('errors (ff run)', errors.length ? errors.slice(0, 8) : 'none');
  await ctx.close();
}
await browser.close();
