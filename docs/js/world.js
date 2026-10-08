// world.js: everything that needs three.js. Loaded only when WebGL2 works (the static page never downloads it).
//
//   const world = await createWorld({ canvas, tier, reduce, onProgress, onLost, onRestored });
//   world.frame(dt, scroll, ground)   → claim → springs → (render on demand) apply → paper.update → render
//
// One fixed canvas, one scene, one persistent sheet (A) plus the few stand-ins the brief needs: the twin B (s06, the
// Arena), the falling output F and outputs 2–8 on the drying line (s04). Rendering happens only when something moves:
// the scroll, a spring, a tween (events.js), a time loop (s04 sway, s08 breathing), the pencil, or a resize.
import * as THREE from 'three';
import { createStage, A4 } from './scene.js';
import { createPaper } from './sheet-adapter.js';
import { SceneState, Springs } from './state.js';
import { createChoreo } from './choreo.js';
import { createTypePlane, createDryingLine, createDrop, createBleed } from './props.js';
import { E, isAnimating } from './events.js';
import { FEATURES, FLAGS } from './config.js';

const PROFILE = FLAGS.debug;

export async function createWorld({ canvas, tier = 2, reduce = false, onProgress = () => {}, onLost = () => {}, onRestored = () => {} }) {
  let W = null;              // the rebuildable part (paper system, sheets, props, choreography)
  let lost = false, dirty = 4, lastGround = '', lastS07 = -1, reduced = reduce;
  const stage = createStage(canvas, {
    tier,
    onLost: () => { lost = true; onLost(); },
    onRestored: () => { rebuild().then(() => { lost = false; dirty = 4; onRestored(true); }).catch((e) => { console.warn('[aviva] restore failed:', e && e.message); onRestored(false); }); },
  });
  stage.resize(window.innerWidth, window.innerHeight);
  stage.applyRig();
  onProgress(0.42);

  async function build() {
    const paper = await createPaper(stage.renderer, { tier });
    onProgress(0.62);
    paper.install(stage.scene);
    const A = paper.createSheet({ name: 'hero', hero: true });
    const B = paper.createSheet({ name: 'twin', low: true });
    const F = paper.createSheet({ name: 'out1', low: true });
    const O = Array.from({ length: 7 }, (_, i) => paper.createSheet({ name: 'out' + (i + 2), low: true }));
    for (const s of [A, B, F, ...O]) { stage.scene.add(s.object); s.object.visible = false; }
    const numerals = createTypePlane('4.99 g');
    const line = createDryingLine(8), drop = createDrop(), bleed = createBleed();
    stage.scene.add(numerals.mesh, line.group, drop);
    const paint = await paper.createPaint();
    A.attachPaint(paint);
    if (FEATURES.floorPrint) await paper.loadFloorPrint('assets/logo/wordmark-floor.png');
    onProgress(0.78);
    if (document.fonts && document.fonts.load) {
      document.fonts.load('300 100px "Hanken Grotesk"').then(() => { numerals.draw(); dirty = 2; }).catch(() => {});
    }
    const state = new SceneState();
    const springs = new Springs(state);
    springs.direct = reduced;
    const props = { numerals, line, drop, bleed };
    const choreo = createChoreo({ stage, paper, state, springs, props, sheets: { A, B, F, O } });
    choreo.ctx.ground = new THREE.Color('#ECEBE7');
    return { paper, A, B, F, O, props, paint, state, springs, choreo };
  }

  async function rebuild() {
    const old = W;
    if (old) {
      try {
        for (const s of [old.A, old.B, old.F, ...old.O]) stage.scene.remove(s.object);
        stage.scene.remove(old.props.numerals.mesh, old.props.line.group, old.props.drop);
        old.paper.dispose();
      } catch { /* the old context is gone anyway */ }
      stage.scene.clear();
    }
    W = await build();
    await prepare();
  }

  /** compile every material behind the loader, and the fibre layers The Bleed needs */
  async function prepare() {
    try { W.paper.ensureMacro(); } catch { /* optional */ }
    try { await W.paper.prepare(stage.renderer, stage.scene, stage.camera); } catch (e) { console.warn('[aviva] precompile:', e && e.message); }
    dirty = 4;
  }

  W = await build();
  await prepare();
  onProgress(0.94);

  /* ------------------------------------------------------------------ rendering */
  function render() {
    const r = stage.renderer;
    r.setRenderTarget(null);
    r.clear();
    r.render(stage.scene, stage.camera);
    if (W.props.bleed.active) r.render(W.props.bleed.scene, W.props.bleed.camera);
  }
  const veilEl = canvas.parentElement && canvas.parentElement.classList.contains('gl') ? canvas.parentElement : null;
  function veil() {
    if (!veilEl) return;
    veilEl.style.setProperty('--veil', document.documentElement.style.backgroundColor || 'var(--color-studio)');
    veilEl.classList.add('is-veiled');
    clearTimeout(veil.t); veil.t = setTimeout(() => veilEl.classList.remove('is-veiled'), 420);
  }

  const _gc = new THREE.Color();
  /** dt seconds; scroll = scroll.js state; ground = grounds.js output (canvas colour, sRGB 0–1) */
  function frame(dt, scroll, ground) {
    if (!W) return false;
    const { choreo, springs } = W;
    if (ground) {
      const c = ground.canvas, key = c[0].toFixed(4) + c[1].toFixed(4) + c[2].toFixed(4);
      if (key !== lastGround) { lastGround = key; _gc.setRGB(c[0], c[1], c[2], THREE.SRGBColorSpace); choreo.ctx.ground.copy(_gc); dirty = Math.max(dirty, 1); }
    }
    choreo.claim(scroll.secs, { reduce: reduced });
    const moving = springs.step(dt);
    if (reduced && choreo.ctx.s07 !== lastS07) { if (lastS07 >= 0) veil(); lastS07 = choreo.ctx.s07; }
    const need = dirty > 0 || moving || isAnimating() || choreo.ctx.loop || scroll.changed;
    if (!need || lost) return false;
    const ta = performance.now();
    choreo.apply(dt);
    const tb = performance.now();
    W.paper.update(stage.scene, stage.camera, dt);
    const tc = performance.now();
    render();
    const td = performance.now();
    if (PROFILE && td - ta > 150) console.log(`[aviva] slow frame: apply ${Math.round(tb - ta)} · paper.update ${Math.round(tc - tb)} · render ${Math.round(td - tc)} ms · programs ${stage.renderer.info.programs ? stage.renderer.info.programs.length : '?'}`);
    if (dirty > 0) dirty--;
    return true;
  }

  /* ------------------------------------------------------------------ helpers for the DOM layer */
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), _v = new THREE.Vector3(), _o = {};
  const proj = (v) => { stage.toScreen(v, _o); return { x: _o.x, y: _o.y, z: _o.z }; };
  const local = (obj, x, y) => obj.localToWorld(_v.set(x, y, 0));

  function pickHero(cx, cy) {
    if (!W || !W.choreo.ctx.heroOn) return null;
    ndc.set((cx / stage.size.w) * 2 - 1, -(cy / stage.size.h) * 2 + 1);
    ray.setFromCamera(ndc, stage.camera);
    return W.paper.pick(W.A, ray);
  }
  function anchorOf(sheet) {
    const o = sheet.object;
    if (!o.visible) return null;
    o.updateMatrixWorld(true);
    const p = proj(local(o, A4.w / 2, A4.h / 4));
    return { x: p.x + 18, y: p.y };
  }
  function tearLine(stageNo) {
    const A = W.A;
    if (!A.object.visible) return null;
    A.object.updateMatrixWorld(true);
    let a, b;
    if (stageNo === 1) {
      a = proj(local(A.object, -A4.w / 2, 0)); b = proj(local(A.object, A4.w / 2, 0));
    } else if (stageNo === 2) {
      const T = A.piece('T'), Bp = A.piece('B');
      if (!T || !Bp) return null;
      const m1 = T.mesh || T.object, m2 = Bp.mesh || Bp.object;
      m1.updateMatrixWorld(true); m2.updateMatrixWorld(true);
      const pts = [proj(m1.localToWorld(_v.set(0, 0.0005, 0))), proj(m1.localToWorld(_v.set(0, A4.h / 2, 0))),
        proj(m2.localToWorld(_v.set(0, -A4.h / 2, 0))), proj(m2.localToWorld(_v.set(0, -0.0005, 0)))];
      pts.sort((p, q) => p.x - q.x);
      a = pts[0]; b = pts[3];
    } else {
      const ks = ['TL', 'TR', 'BL', 'BR'].map((k) => A.piece(k)).filter(Boolean);
      if (ks.length < 4) return null;
      const c = ks.map((pc) => { const m = pc.mesh || pc.object; m.updateMatrixWorld(true); return proj(pc.object.localToWorld(_v.set(0, 0, 0))); });
      const xs = c.map((p) => p.x), ys = c.map((p) => p.y);
      const x0 = Math.min(...xs), x1 = Math.max(...xs), y = (Math.min(...ys) + Math.max(...ys)) / 2, pad = (x1 - x0) * 0.45;
      a = { x: x0 - pad, y }; b = { x: x1 + pad, y };
    }
    if (!isFinite(a.x) || !isFinite(b.x)) return null;
    const dx = b.x - a.x, dy = b.y - a.y;
    return { x: a.x, y: a.y, len: Math.hypot(dx, dy), rot: Math.atan2(dy, dx) };
  }
  function heroCorners(P, folded) {
    const A = W.A;
    if (!W.choreo.ctx.heroOn || !A.object.visible || W.state.get('T.on') > 0.5) return false;
    A.object.updateMatrixWorld(true);
    const top = folded ? 0 : A4.h / 2, hw = A4.w / 2, hh = A4.h / 2;
    const pts = [[-hw, top], [hw, top], [hw, -hh], [-hw, -hh]];
    for (let i = 0; i < 4; i++) { const p = proj(local(A.object, pts[i][0], pts[i][1])); P[i].x = p.x; P[i].y = p.y; if (p.z >= 1) return false; }
    return true;
  }
  function dotLabel() {
    const s = W.choreo.ctx;
    const on = s.heroOn && W.springs.get('A.dot') > 0.6 && W.springs.get('A.size') < 60 && dotLabel.until > performance.now();
    if (!on) return { on: false, x: 0, y: 0 };
    const p = proj(local(W.A.object, 0.072, -0.118));
    return { on: true, x: p.x, y: p.y };
  }
  dotLabel.until = 0;

  return {
    stage, frame, render, veil,
    get paint() { return W.paint; },
    get ctx() { return W.choreo.ctx; },
    get paper() { return W.paper; },
    get kind() { return W.paper.kind; },
    heroOn: () => !!(W && W.choreo.ctx.heroOn),
    pickHero, tearLine, heroCorners,
    heroAnchor: () => anchorOf(W.A),
    sheetAnchor: (k) => anchorOf(k === 'B' ? W.B : W.A),
    dimsMode: () => (W.choreo.ctx.heroOn ? W.state.enum('D.mode') : 'none'),
    dotLabel, showDotLabel(ms = 2600) { dotLabel.until = performance.now() + ms; },
    sizeChoice: () => W.choreo.ctx.sizeChoice,
    outputs: () => W.choreo.ctx.out,
    paintFace: () => W.state.enum('A.paintFace'),
    markDirty() { dirty = Math.max(dirty, 2); },
    setReduced(on) { reduced = on; if (W) W.springs.direct = on; dirty = 2; },
    resize(w, h) { stage.resize(w, h); dirty = 3; },
    get lost() { return lost; },
    debug: () => W,
  };
}
