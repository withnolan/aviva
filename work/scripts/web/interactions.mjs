// interactions.mjs: drive every control on the aviva page in headless Chromium (software WebGL) and screenshot
// each state; then the reduced-motion version, the static page (getContext stubbed) and a context loss.
//   node work/scripts/web/interactions.mjs [baseUrl] [outDir]
import { launch } from './launch.mjs';
import fs from 'node:fs';

const base = process.argv[2] || 'http://localhost:8080/';
const out = process.argv[3] || 'work/screenshots/build/interactions';
fs.mkdirSync(out, { recursive: true });
const browser = await launch();
const results = [];
const note = (k, v) => { results.push([k, v]); console.log(k.padEnd(34), typeof v === 'string' ? v : JSON.stringify(v)); };

async function open({ w = 1440, h = 900, reduced = false, nogl = false, query = '' } = {}) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, reducedMotion: reduced ? 'reduce' : 'no-preference', isMobile: w < 600, hasTouch: w < 600 });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errors.push(`[${m.type()}] ${m.text()}`.slice(0, 300)); });
  page.on('pageerror', (e) => errors.push(`[pageerror] ${String(e).slice(0, 300)}`));
  page.on('response', (r) => { if (r.status() >= 400) errors.push(`[http ${r.status()}] ${r.url()}`); });
  if (nogl) await page.addInitScript(() => {
    const orig = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...a) { if (/webgl/i.test(type)) return null; return orig.call(this, type, ...a); };
  });
  await page.goto(base + query, { waitUntil: 'load', timeout: 90000 });
  for (let i = 0; i < 160; i++) { if (await page.evaluate(() => !!(window.__aviva && window.__aviva.ready)).catch(() => false)) break; await page.waitForTimeout(250); }
  await page.waitForTimeout(1500);
  return { ctx, page, errors };
}
/** jump to progress p (viewport heights) of a section, and let the springs settle */
async function go(page, key, p, wait = 2600) {
  await page.evaluate(([key, p]) => { const S = window.__aviva.scroll, s = S.byKey(key); S.scrollTo(S.yOf(s, p), { immediate: true }); }, [key, p]);
  await page.waitForTimeout(wait);
}
const shot = (page, name) => page.screenshot({ path: `${out}/${name}.jpg`, type: 'jpeg', quality: 80 });
const box = (page) => page.evaluate(() => { const w = window.__aviva.world; const a = w.heroAnchor(); const P = [{}, {}, {}, {}]; w.heroCorners(P, false); return { a, P }; });

/* ============================================================ 1. the full site, desktop */
{
  const { ctx, page, errors } = await open();
  note('boot: world', await page.evaluate(() => (window.__aviva.world ? window.__aviva.world.kind : 'static')));
  // s03: draw a scribble on the sloped sheet
  await go(page, 's03', 2.0);
  const { P } = await box(page);
  const cx = (P[0].x + P[2].x) / 2, cy = (P[0].y + P[2].y) / 2;
  await page.mouse.move(cx - 60, cy - 20);
  await page.waitForTimeout(400);
  note('s03 pencil cursor over sheet', await page.evaluate(() => document.getElementById('pencil').classList.contains('is-on')));
  await page.mouse.down();
  for (let i = 0; i <= 40; i++) await page.mouse.move(cx - 60 + i * 3, cy - 20 + Math.sin(i / 3) * 18, { steps: 1 });
  await page.mouse.up();
  await page.waitForTimeout(800);
  note('s03 drew: hasInk', await page.evaluate(() => window.__aviva.world.paint.hasInk));
  note('s03 status (receiving/thinking)', await page.evaluate(() => document.getElementById('s03-status').textContent));
  await shot(page, '01-s03-drawn');
  await page.waitForTimeout(3600);
  note('s03 status after 4 s', await page.evaluate(() => document.getElementById('s03-status').textContent));
  await shot(page, '02-s03-answer');
  // erase
  await page.click('#s03-erase');
  note('ERASE aria-pressed', await page.getAttribute('#s03-erase', 'aria-pressed'));
  await page.mouse.move(cx - 50, cy - 20); await page.mouse.down();
  for (let i = 0; i <= 30; i++) await page.mouse.move(cx - 50 + i * 3, cy - 20 + Math.sin(i / 3) * 18);
  await page.mouse.up(); await page.waitForTimeout(700);
  note('s03 status after erasing', await page.evaluate(() => document.getElementById('s03-status').textContent));
  await shot(page, '03-s03-erased');
  await page.click('#s03-erase');
  // keyboard: type a line
  await page.fill('#s03-kb-input', 'What is the meaning of life?');
  await page.press('#s03-kb-input', 'Enter');
  await page.waitForTimeout(2200);
  note('s03 echo', await page.evaluate(() => document.getElementById('s03-echo').textContent));
  await shot(page, '04-s03-typed');
  // regenerate
  await page.click('#s03-regen');
  await page.waitForTimeout(700);
  await shot(page, '05-s03-regenerating');
  note('ream status', await page.evaluate(() => document.getElementById('ream-status').textContent));
  await page.waitForTimeout(2600);
  note('s03 status after regenerate', await page.evaluate(() => document.getElementById('s03-status').textContent));
  note('paint cleared', await page.evaluate(() => !window.__aviva.world.paint.hasInk));
  await shot(page, '06-s03-regenerated');

  // s04 hover sway
  await go(page, 's04', 4.4);
  await page.mouse.move(1200, 400); await page.waitForTimeout(1200);
  await shot(page, '07-s04-hover');

  // s05: hold to tear with the keyboard (Space)
  await go(page, 's05', 1.85);
  await page.focus('#s05-hold');
  await page.keyboard.down('Space'); await page.waitForTimeout(2600); await page.keyboard.up('Space');
  await page.waitForTimeout(1600);
  note('s05 tear p1 / split1', await page.evaluate(() => [window.__aviva.E.tear.p1, +window.__aviva.E.tear.split1.toFixed(2)]));
  note('s05 result 1 shown', await page.evaluate(() => !document.getElementById('s05-r1').hidden));
  await shot(page, '08-s05-torn-once');
  // the second tear by dragging along the perforation
  const line = await page.evaluate(() => { const l = document.getElementById('tear-line'); const cs = getComputedStyle(l); return { x: +cs.getPropertyValue('--x'), y: +cs.getPropertyValue('--y'), len: +cs.getPropertyValue('--len'), rot: +cs.getPropertyValue('--rot') }; });
  note('s05 line 2', line);
  if (line.len > 10) {
    await page.mouse.move(line.x + 4, line.y); await page.mouse.down();
    for (let i = 1; i <= 24; i++) await page.mouse.move(line.x + 4 + (line.len * i) / 24 * Math.cos(line.rot), line.y + (line.len * i) / 24 * Math.sin(line.rot));
    await page.mouse.up(); await page.waitForTimeout(1800);
  }
  note('s05 tear p2 / split2', await page.evaluate(() => [+window.__aviva.E.tear.p2.toFixed(2), +window.__aviva.E.tear.split2.toFixed(2)]));
  await shot(page, '09-s05-torn-twice');
  // the third attempt refuses
  await page.focus('#s05-hold'); await page.keyboard.down('Space'); await page.waitForTimeout(500); await page.keyboard.up('Space');
  await page.waitForTimeout(1200);
  note('s05 refused', await page.evaluate(() => !document.getElementById('s05-refuse').hidden));
  await shot(page, '10-s05-refused');

  // s07: the magnifier with the keyboard
  await go(page, 's07', 1.7);
  await page.focus('#loupe-bar');
  for (let i = 0; i < 5; i++) await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Shift+ArrowRight');
  await page.waitForTimeout(1200);
  note('loupe aria-valuenow', await page.getAttribute('#loupe-bar', 'aria-valuenow'));
  await shot(page, '11-s07-loupe');

  // s10: vote
  await go(page, 's10', 1.0);
  await page.click('[data-vote="a"]');
  await page.waitForTimeout(900);
  await shot(page, '12-s10-voting');
  await page.waitForTimeout(1600);
  note('arena result + leaderboard', await page.evaluate(() => [!document.querySelector('[data-res="win"]').hidden, !document.getElementById('s10-lb').hidden]));
  await shot(page, '13-s10-voted');
  await page.click('[data-vote="tie"]'); await page.waitForTimeout(1200);
  note('arena tie shown', await page.evaluate(() => !document.querySelector('[data-res="tie"]').hidden));

  // s12: paper size A5 then A3 (keyboard arrows in the radio group)
  await go(page, 's12', 1.0);
  await page.click('#s12-size label:nth-child(1)');
  await page.waitForTimeout(1600);
  note('size A5: tier text', await page.evaluate(() => document.querySelector('#s12-tier [data-tier]:not([hidden]) .tier__name').textContent));
  await shot(page, '14-s12-a5');
  await page.keyboard.press('ArrowRight'); await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(1600);
  note('size after arrows', await page.evaluate(() => window.__aviva.E.size.choice));
  await shot(page, '15-s12-a3');

  // s13: copy BibTeX
  await go(page, 's13', 1.2, 1200);
  await ctx.grantPermissions(['clipboard-read', 'clipboard-write']).catch(() => {});
  await page.click('#s13-copy');
  await page.waitForTimeout(300);
  note('copy label', await page.evaluate(() => document.querySelector('#s13-copy .btn__txt').textContent));

  // s14: draw again, then release
  await go(page, 's14', 1.0);
  note('s14 variant (drawn?)', await page.evaluate(() => !document.querySelector('[data-variant="drawn"]').hidden));
  await shot(page, '16-s14-before');
  await page.click('#s14-release-btn');
  await page.waitForTimeout(1400); await shot(page, '17-s14-folding');
  await page.waitForTimeout(2600);
  note('released: credit on', await page.evaluate(() => document.getElementById('s14-credit').classList.contains('is-on')));
  note('footer ream', await page.evaluate(() => document.getElementById('s15-ream').textContent));
  await shot(page, '18-s14-released');

  // back to the top, then a resize to 768
  await page.evaluate(() => window.__aviva.scroll.scrollTo(0, { immediate: true }));
  await page.waitForTimeout(1500);
  await shot(page, '19-top-again');
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.waitForTimeout(2200);
  await go(page, 's05', 0.9);
  await shot(page, '20-resized-768-s05');
  // context loss and restore
  await page.evaluate(() => window.__aviva.world.stage.renderer.forceContextLoss());
  await page.waitForTimeout(800);
  note('ctx lost line', await page.evaluate(() => document.getElementById('ctx-status').textContent));
  await shot(page, '21-context-lost');
  await page.evaluate(() => window.__aviva.world.stage.renderer.forceContextRestore());
  await page.waitForTimeout(7000);
  note('ctx restored line', await page.evaluate(() => document.getElementById('ctx-status').textContent));
  await shot(page, '22-context-restored');
  note('errors (desktop run)', errors.length ? errors.slice(0, 12) : 'none');
  await ctx.close();
}

/* ============================================================ 2. reduced motion */
{
  const { ctx, page, errors } = await open({ reduced: true });
  note('reduced: html class', await page.evaluate(() => document.documentElement.classList.contains('reduce-motion')));
  await shot(page, '30-reduced-hero');
  await go(page, 's07', 3.0, 2000); await shot(page, '31-reduced-s07');
  await go(page, 's07', 4.3, 2000); await shot(page, '32-reduced-s07-ink');
  await go(page, 's14', 1.0, 1500);
  await page.click('#s14-release-btn'); await page.waitForTimeout(2200);
  note('reduced: released', await page.evaluate(() => document.getElementById('s14-credit').classList.contains('is-on')));
  await shot(page, '33-reduced-released');
  note('errors (reduced run)', errors.length ? errors.slice(0, 12) : 'none');
  await ctx.close();
}

/* ============================================================ 3. the static page (no WebGL) */
{
  const { ctx, page, errors } = await open({ nogl: true });
  note('static: no-webgl class', await page.evaluate(() => document.documentElement.classList.contains('no-webgl')));
  note('static: banner visible', await page.evaluate(() => !document.getElementById('fb-banner').hidden));
  await shot(page, '40-static-hero');
  await go(page, 's03', 2.0, 1200); await shot(page, '41-static-s03');
  await go(page, 's07', 4.2, 1200); await shot(page, '42-static-s07-ink');
  await go(page, 's10', 1.0, 1200);
  await page.click('[data-vote="b"]'); await page.waitForTimeout(500);
  note('static: arena works', await page.evaluate(() => !document.querySelector('[data-res="win"]').hidden));
  await shot(page, '43-static-s10');
  await go(page, 's12', 1.0, 1200);
  await page.click('#s12-size label:nth-child(3)'); await page.waitForTimeout(400);
  note('static: size picker works', await page.evaluate(() => document.querySelector('#s12-tier [data-tier]:not([hidden]) .tier__name').textContent));
  await shot(page, '44-static-s12');
  await page.click('#fb-dismiss');
  note('static: banner dismissed', await page.evaluate(() => document.getElementById('fb-banner').hidden));
  note('errors (static run)', errors.length ? errors.slice(0, 12) : 'none');
  await ctx.close();
}

/* ============================================================ 4. phone: the touch DRAW toggle */
{
  const { ctx, page, errors } = await open({ w: 390, h: 844 });
  await go(page, 's03', 2.0);
  await page.click('#s03-draw');
  note('touch DRAW pressed / label', await page.evaluate(() => [document.getElementById('s03-draw').getAttribute('aria-pressed'), document.getElementById('s03-draw').textContent]));
  const { P } = await box(page);
  const cx = (P[0].x + P[2].x) / 2, cy = (P[0].y + P[2].y) / 2;
  await page.mouse.move(cx - 40, cy); await page.mouse.down();
  for (let i = 0; i <= 30; i++) await page.mouse.move(cx - 40 + i * 3, cy + Math.sin(i / 2) * 12);
  await page.mouse.up(); await page.waitForTimeout(800);
  note('touch drew: hasInk', await page.evaluate(() => window.__aviva.world.paint.hasInk));
  await shot(page, '50-phone-s03-drawn');
  await page.click('#s03-draw');
  note('touch DONE restores scroll', await page.evaluate(() => !document.documentElement.classList.contains('lenis-stopped')));
  note('errors (phone run)', errors.length ? errors.slice(0, 12) : 'none');
  await ctx.close();
}

fs.writeFileSync(`${out}/results.json`, JSON.stringify(results, null, 2));
await browser.close();
