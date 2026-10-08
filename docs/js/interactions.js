// interactions.js: every control on the page (brief 2A, 3.17, 3.18). Paper-only gimmicks write into E (events.js),
// which the choreography folds into its claims, so scrolling back and forth always stays consistent.
//   s03 · draw (pointer; touch DRAW/DONE; keyboard "Type a line"), ERASE, REGENERATE, the status line
//   s04 · hover sway        s05 · tear: drag along the perforation, HOLD TO TEAR (pointer, Space/Enter)
//   s07 · bar magnifier (drag, arrow keys)     s10 · Arena votes      s12 · paper size radios
//   s13 · copy BibTeX       s14 · draw again, RELEASE IT
// world is null on the static page: only the Arena, the size picker and the BibTeX copy work there.
import { E, tween, timeline } from './events.js';
import { copy, sanitise } from './copy.js';
import { clamp, damp, seg } from './util.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

export function createInteractions({ scroll, ui, world = null, reduce = false }) {
  const root = document.documentElement;
  const S = scroll;
  const s03 = S.byKey('s03'), s04 = S.byKey('s04'), s05 = S.byKey('s05'), s07 = S.byKey('s07'), s10 = S.byKey('s10'), s14 = S.byKey('s14');
  const fineMQ = matchMedia('(pointer: fine)');
  let fine = fineMQ.matches;
  fineMQ.addEventListener && fineMQ.addEventListener('change', (e) => { fine = e.matches; });
  const paint = () => (world ? world.paint : null);

  /* ================================================================== drawing (s03, s14) */
  const pencil = $('#pencil'), hintS03 = $('.draw-hint[data-hint="s03"]'), hintS14 = $('.draw-hint[data-hint="s14"]');
  const st03 = $('#s03-status'), echo03 = $('#s03-echo'), sr03 = $('#s03-sr'), sr14 = $('#s14-sr'), st14 = $('#s14-status');
  const D = { zone: null, over: false, stroking: false, toggle: false, eraser: false, everDrew: false, tipShown: false,
    x: -999, y: -999, lastMove: 0, hoverTimer: 0, timers: [], row: { s03: 0, s14: 0 }, enteredS03: false, leftS03: false };

  function zoneNow() {
    if (!world || !world.heroOn()) return null;
    if (s03 && s03.w > 0.5 && s03.p >= 0.8 && s03.p < 5 && !E.regen.busy) return 's03';
    if (s14 && s14.w > 0.5 && s14.p >= 0.6 && s14.p < 1.8 && !E.release.started) return 's14';
    return null;
  }
  const clearTimers = () => { for (const t of D.timers) clearTimeout(t); D.timers.length = 0; };
  function thinkSequence() {
    clearTimers();
    D.timers.push(setTimeout(() => {
      ui.say(st03, copy('s03.status.thinking'));
      if (!reduce) timeline().to(E.think, { curl: 1, duration: 0.45, ease: 'power2.out' }).to(E.think, { curl: 0, duration: 0.5, ease: 'power2.inOut', delay: 0.15 });
    }, 1200));
    D.timers.push(setTimeout(() => ui.say(st03, copy('s03.status.thought')), 2600));
    D.timers.push(setTimeout(() => ui.say(st03, copy('s03.status.answer'), { mark: true }), 3600));
  }
  function setPencil(on) {
    if (!pencil) return;
    pencil.classList.toggle('is-on', on);
    root.classList.toggle('is-pencil-over', on);
    if (on && !D.tipShown && fine) {
      D.tipShown = true; pencil.classList.add('show-tip');
      setTimeout(() => pencil.classList.remove('show-tip'), 2600);
    }
  }
  function movePencil(x, y) { if (pencil) pencil.style.transform = `translate3d(${x}px, ${y}px, 0)`; }

  function beginStroke(e, hit) {
    const p = paint(); if (!p) return;
    D.stroking = true; D.everDrew = true;
    p.setEraser(D.eraser);
    p.begin(hit.u, hit.v);
    world.markDirty();
    if (D.zone === 's03') { clearTimers(); ui.say(st03, copy('s03.status.receiving')); E.think.curl = 0; }
  }
  function strokeTo(e) {
    const p = paint(); if (!p) return;
    const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : null;
    const list = evs && evs.length ? evs : [e];
    for (const ev of list) {
      const hit = world.pickHero(ev.clientX, ev.clientY);
      if (!hit) { p.end(); continue; }
      const pressure = ev.pointerType === 'pen' && ev.pressure > 0 ? ev.pressure : undefined;
      p.to(hit.u, hit.v, pressure);
    }
    world.markDirty();
  }
  function endStroke() {
    const p = paint(); if (!p || !D.stroking) return;
    D.stroking = false; p.end(); world.markDirty();
    if (D.zone === 's03' || (s03 && s03.w > 0.5)) {
      if (D.eraser) { clearTimers(); ui.say(st03, copy('s03.status.erase')); } else thinkSequence();
    }
  }

  window.addEventListener('pointermove', (e) => {
    D.x = e.clientX; D.y = e.clientY;
    // s04: the outputs lean toward the cursor
    if (e.pointerType !== 'touch') { E.hover.tx = (e.clientX / innerWidth - 0.5) * 2; E.hover.ty = (e.clientY / innerHeight - 0.5) * 2; }
    if (!world) return;
    if (D.stroking) { strokeTo(e); movePencil(e.clientX, e.clientY); return; }
    const z = zoneNow();
    if (!z || (e.pointerType === 'touch' && !D.toggle)) { if (D.over) { D.over = false; setPencil(false); } return; }
    const hit = world.pickHero(e.clientX, e.clientY);
    const over = !!hit && e.pointerType !== 'touch';
    if (over !== D.over) { D.over = over; setPencil(over); }
    if (over) {
      movePencil(e.clientX, e.clientY);
      D.lastMove = performance.now();
      clearTimeout(D.hoverTimer);
      if (z === 's03' && !(paint() && paint().hasInk)) D.hoverTimer = setTimeout(() => { if (D.over && !D.stroking) ui.say(st03, copy('s03.status.waiting')); }, 4000);
    }
  }, { passive: true });

  window.addEventListener('pointerdown', (e) => {
    if (!world || e.button > 0) return;
    const z = zoneNow(); if (!z) return;
    if (e.pointerType === 'touch' && !D.toggle) return;            // a swipe never draws by accident
    if (e.target.closest && e.target.closest('button, a, input, label, .tools, form')) return;
    const hit = world.pickHero(e.clientX, e.clientY); if (!hit) return;
    e.preventDefault();
    D.zone = z;
    beginStroke(e, hit);
  }, { passive: false });
  window.addEventListener('pointerup', endStroke);
  window.addEventListener('pointercancel', endStroke);
  window.addEventListener('blur', endStroke);

  // touch: DRAW / DONE (scrolling pauses while drawing)
  function setToggle(btn, on) {
    D.toggle = on;
    for (const b of $$('#s03-draw, #s14-draw')) {
      const active = on && b === btn;
      b.setAttribute('aria-pressed', String(active));
      if (!b.__label) { b.__label = b.textContent.trim(); b.__aria = b.getAttribute('aria-label'); }
      b.textContent = active ? (b.dataset.labelOn || 'DONE') : b.__label;
      b.setAttribute('aria-label', active ? (b.dataset.ariaOn || b.__aria) : b.__aria);
    }
    root.classList.toggle('is-drawing', on);
    if (on) S.stop(); else S.start();
  }
  for (const b of $$('#s03-draw, #s14-draw')) b.addEventListener('click', () => setToggle(b, !(D.toggle && b.getAttribute('aria-pressed') === 'true')));

  // ERASE: the pencil turned round
  const erase = $('#s03-erase');
  if (erase) erase.addEventListener('click', () => {
    D.eraser = !D.eraser;
    erase.setAttribute('aria-pressed', String(D.eraser));
    pencil && pencil.classList.toggle('is-eraser', D.eraser);
    paint() && paint().setEraser(D.eraser);
  });

  // keyboard: "Type a line" draws a pre-baked line of quick handwriting (never the typed text)
  function typeLine(form, zone) {
    const input = $('input', form);
    const text = sanitise(input.value, 80);
    if (!world || !paint()) return;
    const p = paint();
    if (zone === 's03') {
      if (echo03) { echo03.hidden = !text; echo03.textContent = text ? copy('s03.kb.echo', { text }) : ''; }
      clearTimers(); ui.say(st03, copy('s03.status.receiving'));
    }
    input.value = '';
    const row = D.row[zone]++ % 5;
    const prog = { t: 0 }; let last = 0;
    const face = world.paintFace();
    D.everDrew = true;
    p.setEraser(false);
    tween(prog, {
      t: 1, duration: reduce ? 0.01 : 1.5, ease: 'none',
      onUpdate() { p.bakedLine(last, prog.t, { row, mirror: face < 0 }); last = prog.t; world.markDirty(); },
      onComplete() {
        p.bakedLine(last, 1, { row, mirror: face < 0 }); p.end(); p.setEraser(D.eraser); world.markDirty();
        const sr = zone === 's03' ? sr03 : sr14;
        if (sr) { sr.textContent = ''; setTimeout(() => { sr.textContent = copy('s03.kb.sr'); }, 50); }
        if (zone === 's03') thinkSequence();
      },
    });
  }
  const kb03 = $('#s03-kb'), kb14 = $('#s14-kb');
  kb03 && kb03.addEventListener('submit', (e) => { e.preventDefault(); typeLine(kb03, 's03'); });
  kb14 && kb14.addEventListener('submit', (e) => { e.preventDefault(); typeLine(kb14, 's14'); });

  // REGENERATE: crumple, roll out, a fresh sheet drops in. Same answer.
  const regen = $('#s03-regen');
  if (regen) regen.addEventListener('click', () => {
    const R = E.regen;
    if (R.busy || !world) return;
    R.busy = true; clearTimers();
    ui.say(st03, copy('s03.status.regen.1'));
    ui.consume(world.heroAnchor());
    const swap = () => { R.gen = (R.gen || 0) + 1; paint() && paint().clear(); if (echo03) echo03.hidden = true; world.markDirty(); };
    if (reduce) {
      timeline({ onComplete() { R.busy = false; ui.say(st03, copy('s03.status.regen.2')); } })
        .to(R, { fade: 0, duration: 0.3, ease: 'power1.out' }).call(swap).to(R, { fade: 1, duration: 0.3, ease: 'power1.in' });
      return;
    }
    timeline({ onComplete() { R.busy = false; ui.say(st03, copy('s03.status.regen.2')); } })
      .to(R, { crumple: 0.9, duration: 0.6, ease: 'power2.in' })
      .to(R, { roll: 1, duration: 0.5, ease: 'power1.in' })
      .call(() => { R.hidden = 1; })
      .to({}, { duration: 0.12 })
      .call(() => { swap(); R.crumple = 0; R.roll = 0; R.drop = 0; R.hidden = 0; })
      .to(R, { drop: 1, duration: 0.9, ease: 'power2.out' });
  });

  /* ================================================================== s05: tear */
  const tear = $('#tear'), tearLine = $('#tear-line'), hold = $('#s05-hold'), sr05 = $('#s05-sr');
  const instr1 = tearLine && $('.tear__instr:not(.tear__instr--again)', tearLine), instr2 = tearLine && $('.tear__instr--again', tearLine);
  const r1 = $('#s05-r1'), r2 = $('#s05-r2'), refuse = $('#s05-refuse');
  const T = { holding: false, dragging: false, stage: 1, announced: 0, refused: false, line: null };
  E.tear.refuse = 0;
  function tearStage() {
    const t = world ? world.ctx.tear : null;
    if (!t || !t.live) return 0;
    if (t.p1 < 1) return 1;
    if (t.s1 < 0.98) return 0;           // the halves are moving: no line
    if (t.p2 < 1) return 2;
    if (t.s2 < 0.98) return 0;
    return 3;
  }
  function advance(stage, amount) {
    if (stage === 1 && E.tear.p1 < 1) {
      E.tear.p1 = clamp(Math.max(E.tear.p1, amount));
      if (E.tear.p1 >= 1) tween(E.tear, { split1: 1, duration: reduce ? 0.3 : 0.85, ease: 'power2.inOut' });
    } else if (stage === 2 && E.tear.p2 < 1) {
      E.tear.p2 = clamp(Math.max(E.tear.p2, amount));
      if (E.tear.p2 >= 1) tween(E.tear, { split2: 1, duration: reduce ? 0.3 : 0.85, ease: 'power2.inOut' });
    } else if (stage === 3 && !T.refused) {
      T.refused = true; E.tear.refuse = 1;
      tear && tear.classList.add(reduce ? 'is-grey' : 'is-refusing');
      setTimeout(() => tear && tear.classList.add('is-grey'), reduce ? 0 : 900);
    }
    world && world.markDirty();
    const v = Math.round(100 * (stage === 1 ? E.tear.p1 : E.tear.p2));
    const step = Math.floor(v / 25) * 25;
    if (stage < 3 && step > T.announced && step > 0) { T.announced = step; if (sr05) sr05.textContent = copy('s05.g.sr.progress', { n: step }); if (step >= 100) T.announced = 0; }
  }
  const stageValue = (stage) => (stage === 1 ? E.tear.p1 : stage === 2 ? E.tear.p2 : 0);
  if (tearLine) {
    tearLine.addEventListener('pointerdown', (e) => {
      const stage = tearStage(); if (!stage || !T.line) return;
      e.preventDefault(); T.dragging = true; tearLine.classList.add('is-dragging');
      try { tearLine.setPointerCapture(e.pointerId); } catch { /* */ }
      if (stage === 3) advance(3, 0);
    });
    tearLine.addEventListener('pointermove', (e) => {
      if (!T.dragging || !T.line) return;
      const stage = tearStage(); if (!stage || stage === 3) return;
      const L = T.line, dx = e.clientX - L.x, dy = e.clientY - L.y;
      const t = (dx * Math.cos(L.rot) + dy * Math.sin(L.rot)) / Math.max(1, L.len);
      if (t > stageValue(stage) && t < stageValue(stage) + 0.35) advance(stage, t);
    });
    const stop = () => { T.dragging = false; tearLine.classList.remove('is-dragging'); };
    tearLine.addEventListener('pointerup', stop); tearLine.addEventListener('pointercancel', stop);
  }
  if (hold) {
    const start = (e) => {
      if (e) e.preventDefault();
      const st = tearStage(); if (!st) return;
      if (st === 3) { advance(3, 0); return; }
      T.holding = true; T.holdStage = st; T.holdT0 = performance.now(); T.holdV0 = stageValue(st);   // wall-clock: 1.5 s per tear at any frame rate
      hold.classList.add('is-holding');
    };
    const stop = () => { T.holding = false; hold.classList.remove('is-holding'); };
    hold.addEventListener('pointerdown', start);
    hold.addEventListener('pointerup', stop); hold.addEventListener('pointerleave', stop); hold.addEventListener('pointercancel', stop);
    hold.addEventListener('keydown', (e) => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) start(e); });
    hold.addEventListener('keyup', (e) => { if (e.key === ' ' || e.key === 'Enter') stop(); });
    hold.addEventListener('click', (e) => e.preventDefault());
    hold.addEventListener('blur', stop);
  }

  /* ================================================================== s07: the bar magnifier */
  const loupe = $('#loupe'), bar = $('#loupe-bar');
  E.loupe.x = 0.5;
  function setLoupe(x) {
    E.loupe.x = clamp(x);
    const mm = Math.round(E.loupe.x * 210);
    if (bar) { bar.setAttribute('aria-valuenow', String(mm)); bar.setAttribute('aria-valuetext', copy('s07.loupe.valuetext', { n: mm })); }
    world && world.markDirty();
  }
  if (bar) {
    let drag = false;
    const gut = () => parseFloat(getComputedStyle(root).getPropertyValue('--gutter')) || 24;
    const fromX = (cx) => (cx - gut() - 40) / Math.max(1, innerWidth - 2 * gut() - 80);
    bar.addEventListener('pointerdown', (e) => { drag = true; e.preventDefault(); try { bar.setPointerCapture(e.pointerId); } catch { /* */ } setLoupe(fromX(e.clientX)); });
    bar.addEventListener('pointermove', (e) => { if (drag) setLoupe(fromX(e.clientX)); });
    bar.addEventListener('pointerup', () => { drag = false; }); bar.addEventListener('pointercancel', () => { drag = false; });
    bar.addEventListener('keydown', (e) => {
      const step = (e.shiftKey ? 50 : 10) / 210;
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { setLoupe(E.loupe.x + step); e.preventDefault(); }
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { setLoupe(E.loupe.x - step); e.preventDefault(); }
      else if (e.key === 'Home') { setLoupe(0); e.preventDefault(); }
      else if (e.key === 'End') { setLoupe(1); e.preventDefault(); }
    });
  }

  /* ================================================================== s10: the Arena */
  const votes = $$('#s10-votes [data-vote]'), lb = $('#s10-lb');
  const res = { win: $('.s10__out[data-res="win"]'), tie: $('.s10__out[data-res="tie"]'), none: $('.s10__out[data-res="none"]') };
  const showRes = (k) => { for (const n in res) if (res[n]) res[n].hidden = n !== k; };
  for (const b of votes) b.addEventListener('click', () => {
    const V = E.arena;
    if (V.busy) return;
    const v = b.dataset.vote;
    V.voted = v;
    for (const o of votes) o.setAttribute('aria-pressed', String(o === b));
    showRes(v === 'tie' ? 'tie' : 'win');
    if (lb) lb.hidden = false;
    if (!world) return;                                            // the static page: results only
    if (v === 'tie') {
      V.busy = true; V.loser = null;
      if (reduce) { V.busy = false; return; }
      timeline({ onComplete() { V.busy = false; } }).to(V, { bow: 1, duration: 0.4, ease: 'power2.out' }).to(V, { bow: 0, duration: 0.4, ease: 'power2.inOut' });
      return;
    }
    V.busy = true; V.loser = v === 'a' ? 'B' : 'A'; V.winner = v === 'a' ? 'A' : 'B';
    ui.consume(world.sheetAnchor(V.loser));
    const genKey = V.loser === 'A' ? 'genA' : 'genB';
    const swap = () => { V[genKey] = (V[genKey] || 0) + 1; world.markDirty(); };
    if (reduce) {
      timeline({ onComplete() { V.busy = false; } }).to(V, { fade: 0, duration: 0.3 }).call(swap).to(V, { fade: 1, duration: 0.3 });
      return;
    }
    timeline({ onComplete() { V.busy = false; } })
      .to(V, { crumple: 0.9, duration: 0.6, ease: 'power2.in' })
      .to(V, { roll: 1, duration: 0.5, ease: 'power1.in' })
      .call(() => { V.hidden = 1; })
      .to({}, { duration: 0.1 })
      .call(() => { swap(); V.crumple = 0; V.roll = 0; V.drop = 0; V.hidden = 0; })
      .to(V, { drop: 1, duration: 0.8, ease: 'power2.out' });
  });

  /* ================================================================== s12: paper size */
  const sr12 = $('#s12-sr');
  const DIMS = { A5: '148 × 210 mm', A4: '210 × 297 mm', A3: '297 × 420 mm' };
  for (const r of $$('#s12-size input[type="radio"]')) r.addEventListener('change', () => {
    if (!r.checked) return;
    E.size.choice = r.value;
    for (const t of $$('#s12-tier [data-tier]')) t.hidden = t.dataset.tier !== r.value;
    $$('.cmp__t thead th').forEach((th, i) => th.classList.toggle('is-sel', ['A5', 'A4', 'A3'][i] === r.value));
    if (sr12) sr12.textContent = copy('s12.sr.change', { size: r.value, dims: DIMS[r.value] });
    world && world.markDirty();
  });

  /* ================================================================== s13: copy BibTeX */
  const copyBtn = $('#s13-copy'), bib = $('#s13-bib');
  if (copyBtn && bib) copyBtn.addEventListener('click', async () => {
    const text = bib.textContent;
    let ok = false;
    try { if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(text); ok = true; } } catch { /* fall back */ }
    if (!ok) {
      try { const r = document.createRange(); r.selectNodeContents(bib); const s = getSelection(); s.removeAllRanges(); s.addRange(r); ok = document.execCommand('copy'); s.removeAllRanges(); } catch { ok = false; }
    }
    const lab = $('.btn__txt', copyBtn);
    if (lab) {
      if (!copyBtn.__label) copyBtn.__label = lab.textContent;
      lab.textContent = copyBtn.dataset.labelDone || copy('s13.bib.copied');
      clearTimeout(copyBtn.__t); copyBtn.__t = setTimeout(() => { lab.textContent = copyBtn.__label; }, 2000);
    }
  });

  /* ================================================================== s14: release it */
  const relBtn = $('#s14-release-btn'), credit = $('#s14-credit'), tools14 = $('.s14__tools');
  function released() {
    if (E.release.done) return;
    E.release.done = true; E.release.plane = 7; E.release.fly = 1; E.release.fade = 0;
    credit && credit.classList.add('is-on');
    tools14 && tools14.classList.add('is-gone');
    ui.say(st14, copy('s14.released'));
    if (sr14) sr14.textContent = copy('s14.released');
  }
  if (relBtn) relBtn.addEventListener('click', () => {
    const R = E.release;
    if (R.started) return;
    R.started = true;
    tools14 && tools14.classList.add('is-gone');
    if (D.toggle) setToggle(null, false);
    if (!world) { released(); return; }
    if (reduce) {
      timeline({ onComplete: released }).call(() => world.veil()).to(R, { plane: 3.5, duration: 0.01 }).to({}, { duration: 0.3 })
        .call(() => world.veil()).to(R, { plane: 7, duration: 0.01 }).to({}, { duration: 0.3 }).to(R, { fade: 0, duration: 0.5 });
      return;
    }
    timeline({ onComplete: released })
      .to(R, { plane: 7, duration: 1.2, ease: 'power1.inOut' })
      .to(R, { fly: 1, duration: 1.6, ease: 'power1.inOut' });
  });

  /* ================================================================== per frame */
  let prevS03 = 0;
  function frame(dt) {
    // s04 hover: damped lean
    E.hover.x = damp(E.hover.x, E.hover.tx || 0, 5, dt); E.hover.y = damp(E.hover.y, E.hover.ty || 0, 5, dt);
    if (!world) return;
    // drawing zones, hints
    const z = zoneNow();
    if (!z && D.over) { D.over = false; setPencil(false); }
    if (hintS03) hintS03.classList.toggle('is-on', z === 's03' && (fine ? D.over : true) && !(paint() && paint().hasInk));
    if (hintS14) hintS14.classList.toggle('is-on', z === 's14' && (fine ? D.over : true));
    // s03 status: ready on entering, none on leaving without a prompt
    if (s03) {
      const p = s03.w > 0.5 ? s03.p : (s03.raw < 0 ? 0 : 6);
      if (p >= 0.6 && prevS03 < 0.6 && !(paint() && paint().hasInk)) ui.say(st03, copy('s03.status.ready'));
      if (p > 5 && prevS03 <= 5 && !D.everDrew) ui.say(st03, copy('s03.status.none'));
      prevS03 = p;
    }
    // s05: the hold, the perforation, the results
    if (s05) {
      const t = world.ctx.tear, stage = tearStage();
      if (T.holding && stage && stage < 3) {
        if (stage !== T.holdStage) { T.holdStage = stage; T.holdT0 = performance.now(); T.holdV0 = stageValue(stage); }
        advance(stage, T.holdV0 + (performance.now() - T.holdT0) / 1500);
      }
      const showLine = stage > 0 && s05.p >= 1.75 && s05.p < 4.4;
      if (tear) tear.classList.toggle('is-off', !showLine);
      if (showLine && tearLine) {
        T.line = world.tearLine(stage);
        if (T.line) {
          tearLine.style.setProperty('--x', T.line.x.toFixed(1)); tearLine.style.setProperty('--y', T.line.y.toFixed(1));
          tearLine.style.setProperty('--len', T.line.len.toFixed(1)); tearLine.style.setProperty('--rot', T.line.rot.toFixed(4));
          tearLine.style.setProperty('--torn', (stage === 1 ? t.p1 : stage === 2 ? t.p2 : 0).toFixed(3));
        }
        if (instr1) instr1.hidden = stage !== 1;
        if (instr2) instr2.hidden = stage !== 2;
      }
      if (hold) hold.style.setProperty('--hold', (stage === 1 ? t.p1 : stage === 2 ? t.p2 : stage === 3 ? 1 : 0).toFixed(3));
      const inBeat = s05.w > 0.5 && s05.p >= 1.6 && s05.p < 4.4;
      if (r1) r1.hidden = !(inBeat && t.s1 > 0.9 && t.s2 <= 0.9);
      if (r2) r2.hidden = !(inBeat && t.s2 > 0.9 && !T.refused);
      if (refuse) refuse.hidden = !(inBeat && T.refused);
      if (s05.p >= 4.75 && s05.w > 0.5 && t.p1 > 0 && !E.tear.counted) { E.tear.counted = true; ui.consume(world.heroAnchor()); }
    }
    // s07: the magnifier follows its value across the content width
    if (loupe && s07 && s07.w > 0) loupe.style.setProperty('--lx', (40 + E.loupe.x * (innerWidth - 80)).toFixed(1));
    // s10: no vote is also a preference
    if (s10 && s10.w > 0.5 && s10.p > 2.2 && !E.arena.voted && res.none && res.none.hidden) { showRes('none'); if (lb) lb.hidden = false; }
    // s14: the release (button or scroll), the variants
    if (s14 && s14.w > 0) {
      const r = world.ctx.rel;
      if (!E.release.done && ((reduce && r.fade < 0.05) || (!reduce && r.fly > 0.95))) { E.release.started = true; released(); }
      const drawn = !!(paint() && paint().hasInk);
      if (drawn !== D.drawnVariant) {
        D.drawnVariant = drawn;
        for (const el of $$('#s14-release [data-variant]')) el.hidden = el.dataset.variant !== (drawn ? 'drawn' : 'empty');
      }
    }
  }

  return { frame, get drawing() { return D.stroking; }, setLoupe };
}
