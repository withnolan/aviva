// reduced-probe.mjs: inspect the DOM state, animations and transitions in the reduced-motion context.
import { launch } from './launch.mjs';
const browser = await launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, reducedMotion: process.argv[2] === 'normal' ? 'no-preference' : 'reduce' });
const page = await ctx.newPage();
page.on('pageerror', (e) => console.log('[pageerror]', String(e).slice(0, 400)));
await page.goto('http://localhost:8080/', { waitUntil: 'load' });
for (let i = 0; i < 120; i++) { if (await page.evaluate(() => window.__aviva && window.__aviva.ready)) break; await page.waitForTimeout(250); }
await page.waitForTimeout(3000);
console.log(JSON.stringify(await page.evaluate(() => {
  const info = (s) => { const e = document.querySelector(s); if (!e) return 'none'; const cs = getComputedStyle(e); return { op: cs.opacity, tr: cs.transition.slice(0, 120), anim: cs.animationName, an: e.getAnimations().map((a) => `${a.constructor.name}:${a.playState}:${a.currentTime}`) }; };
  return { html: document.documentElement.className, nav: info('.nav'), l1: info('.hero__l1'), line: info('.hero__l1 .press__line'), eyebrow: info('.hero__eyebrow'), all: document.getAnimations().length, timeline: document.timeline.currentTime };
}), null, 1));
await browser.close();
