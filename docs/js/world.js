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
  let lost = false, dirty = 4, lastGround = '', lastS07 = -1, reduced = reduce, warmed = false;
  const stage = createStage(canvas, {
    tier,
    onLost: () => { lost = true; onLost(); },
    onRestored: () => {
      rebuild().then(() => { lost = false; dirty = 4; onRestored(true); if (warmed) { warmed = false; warm(); } })
        .catch((e) => { console.warn('[aviva] restore failed:', e && e.message); onRestored(false); });
    },
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
    // the hero (brief 10.3): five folded sheets + the "4" (letters.js). At H9 the sheet A takes over from the I at the
    // same pose and the same paper (formation patch and cockle phase copied), so the hand-off cannot be seen
    let hero = null;
    try { hero = paper.createLetters(); } catch (e) { console.warn('[aviva] letters:', e && e.message); }
    if (hero) {
      stage.scene.add(hero.object); hero.object.visible = false;
      const I = hero.items[2].sheet.uniforms, U = A.raw && A.raw.uniforms;
      if (U && I) { U.uFormP.value.copy(I.uFormP.value); U.uCockle.value.z = I.uCockle.value.z; }
    }
    // s02 (T8): the metrology bench, and the point light the cursor slides along the 0.1 mm edge (always in the
    // scene at intensity 0 elsewhere: the light count is part of every material's program, so it never recompiles)
    let bench = null;
    try { bench = paper.createBench({ stackCount: 10 }); } catch (e) { console.warn('[aviva] bench:', e && e.message); }
    if (bench) { stage.scene.add(bench.object); bench.object.visible = false; }
    let board = null;                                      // s03 (T9): the drafting board under the writing slope
    try { board = paper.createDraftingBoard(); } catch (e) { console.warn('[aviva] board:', e && e.message); }
    if (board) { stage.scene.add(board.object); board.object.visible = false; }
    const rim = new THREE.PointLight('#eef3ff', 0, 0.3, 2); rim.name = 's02.rim'; stage.scene.add(rim);
    const numerals = createTypePlane('4.99 g');
    const line = createDryingLine(8), drop = createDrop();
    const bleed = paper.raw && paper.raw.createBleed ? paper.raw.createBleed() : createBleed();   // the module's ink front at screen scale
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
    const choreo = createChoreo({ stage, paper, state, springs, props, sheets: { A, B, F, O, hero, bench, rim, board } });
    choreo.ctx.ground = new THREE.Color('#ECEBE7');
    return { paper, A, B, F, O, hero, bench, props, paint, state, springs, choreo };
  }

  async function rebuild() {
    // after a context loss every GL object of the old world died with the context: drop them, never dispose them
    // (deleting them in the new context only produces "object does not belong to this context" warnings)
    if (W) stage.scene.clear();
    W = await build();
    await prepare();
  }

  /** compile every material behind the loader, and the fibre layers The Bleed needs */
  async function prepare() {
    try { W.paper.ensureMacro(); } catch { /* optional */ }
    try { W.choreo.prime(); } catch (e) { console.warn('[aviva] prime:', e && e.message); }
    try { await W.paper.prepare(stage.renderer, stage.scene, stage.camera); } catch (e) { console.warn('[aviva] precompile:', e && e.message); }
    dirty = 4;
  }

  W = await build();
  await prepare();
  onProgress(0.94);

  /** once the page is idle after the reveal: the baked crumple (Regenerate, the Arena) is fetched and compiled ahead
   *  of the first gesture. Reduced motion never crumples (a fade-swap instead), so it skips the download. */
  async function warm() {
    if (warmed || !W || reduced || !FEATURES.paperCrumple) return false;
    warmed = true;
    let ok = false;
    try { ok = await W.paper.warmCrumple(stage.renderer, stage.scene, stage.camera, [W.A, W.B]); }
    catch (e) { console.warn('[aviva] crumple warm-up:', e && e.message); }
    dirty = Math.max(dirty, 1);
    return ok;
  }

  /* ------------------------------------------------------------------ rendering */
  /* the s02 rack focus (T8): one cheap depth-of-field pass, only while choreo asks for it (ctx.dof.k > 0) */
  let dofRT = null, dof = null;
  const _dsz = new THREE.Vector2(), _fv = new THREE.Vector3();
  function dofPass(r, k, focusWorld) {
    r.getDrawingBufferSize(_dsz);
    if (!dofRT || dofRT.width !== _dsz.x || dofRT.height !== _dsz.y) {
      if (dofRT) dofRT.dispose();
      dofRT = new THREE.WebGLRenderTarget(_dsz.x, _dsz.y, { type: THREE.HalfFloatType, depthTexture: new THREE.DepthTexture(_dsz.x, _dsz.y) });
    }
    if (!dof) {
      const mat = new THREE.ShaderMaterial({
        uniforms: { tColor: { value: null }, tDepth: { value: null }, uNear: { value: 0.01 }, uFar: { value: 100 }, uFocus: { value: 1 }, uK: { value: 0 }, uTexel: { value: new THREE.Vector2() } },
        vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
        fragmentShader: `varying vec2 vUv; uniform sampler2D tColor, tDepth; uniform float uNear, uFar, uFocus, uK; uniform vec2 uTexel;
          float vz(vec2 uv){ float z = texture2D(tDepth, uv).x * 2.0 - 1.0; return 2.0 * uNear * uFar / (uFar + uNear - z * (uFar - uNear)); }
          void main(){
            float coc = smoothstep(0.04, 0.5, abs(vz(vUv) - uFocus) / uFocus) * uK;
            vec4 acc = texture2D(tColor, vUv); float w = 1.0;
            for (int i = 1; i < 18; i++) { float a = float(i) * 2.39996, rr = sqrt(float(i) / 17.0);
              vec2 uv = vUv + vec2(cos(a), sin(a)) * rr * coc * 6.0 * uTexel;
              float cs = smoothstep(0.04, 0.5, abs(vz(uv) - uFocus) / uFocus);         // an in-focus neighbour never bleeds in
              float ww = cs * cs; acc += texture2D(tColor, uv) * ww; w += ww; }
            gl_FragColor = acc / w;
            #include <tonemapping_fragment>
            #include <colorspace_fragment>
          }`,
        depthTest: false, depthWrite: false, toneMapped: true,
      });
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3));
      g.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 2, 0, 0, 2], 2));
      const mesh = new THREE.Mesh(g, mat); mesh.frustumCulled = false;
      dof = { mat, scene: new THREE.Scene().add(mesh), cam: new THREE.Camera() };
    }
    r.setRenderTarget(dofRT); r.clear(); r.render(stage.scene, stage.camera); r.setRenderTarget(null);
    const c = stage.camera, U = dof.mat.uniforms;
    U.tColor.value = dofRT.texture; U.tDepth.value = dofRT.depthTexture; U.uNear.value = c.near; U.uFar.value = c.far;
    U.uFocus.value = Math.max(0.02, _fv.copy(focusWorld).applyMatrix4(c.matrixWorldInverse).z * -1);
    U.uK.value = k; U.uTexel.value.set(1 / _dsz.x, 1 / _dsz.y);
    r.render(dof.scene, dof.cam);
  }
  function render() {
    const r = stage.renderer;
    r.setRenderTarget(null);
    r.clear();
    const D = W.choreo.ctx.dof;
    if (D && D.k > 0.01) dofPass(r, D.k, D.focus); else r.render(stage.scene, stage.camera);
    const bl = W.props.bleed;
    if (bl.active) { const ac = r.autoClear; r.autoClear = false; r.render(bl.scene, bl.camera); r.autoClear = ac; }   // over the scene
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
  /** a point just right of the sheet as it appears on screen (whatever its rotation: the s03 sheet shows its back),
   *  `at` of the way down from its top edge (0..1): where the ream label pops up */
  const CORNERS = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
  function anchorOf(sheet, at = 0.25) {
    const o = sheet.object;
    if (!o.visible) return null;
    o.updateMatrixWorld(true);
    let x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    for (const [cx, cy] of CORNERS) {
      const p = proj(local(o, cx * A4.w / 2, cy * A4.h / 2));
      x1 = Math.max(x1, p.x); y0 = Math.min(y0, p.y); y1 = Math.max(y1, p.y);
    }
    return isFinite(x1) ? { x: x1 + 18, y: y0 + (y1 - y0) * at } : null;
  }
  function tearLine(stageNo) {
    const A = W.A;
    if (!A.object.visible) return null;
    A.object.updateMatrixWorld(true);
    let a, b;
    if (stageNo === 1) {
      a = proj(local(A.object, -A4.w / 2, 0)); b = proj(local(A.object, A4.w / 2, 0));
    } else if (stageNo === 2) {
      // the line runs along x = 0 of each half (rest space). While the second tear runs, the halves are already
      // quarters (TL/TR, BL/BR): every piece's mesh is in the sheet's rest frame, so any piece of a half carries it
      const T = A.piece('T') || A.piece('TL'), Bp = A.piece('B') || A.piece('BL');
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
  /** the five letters' feet on screen (their front outlines at the floor): the fold labels hang under them (T6) */
  function heroFeet(out) {
    const h = W && W.hero;
    if (!h || !W.choreo.ctx.heroLetters) return false;
    const R = h.__rest || (h.__rest = h.restLayout());
    for (let i = 0; i < 5; i++) { const p = proj(_v.set(R.front[i], 0, R.frontZ)); out[i].x = p.x; out[i].y = p.y; }
    return true;
  }
  /** s02 (T8): screen points for the readout caption (beside the LCD) and the stack label, plus the reading */
  function benchOverlay(out) {
    const B = W && W.bench, b = W && W.choreo.ctx.bench;
    if (!B || !b || !b.on || !B.object.visible) return false;
    B.object.updateMatrixWorld(true);
    const r = proj(B.object.localToWorld(_v.copy(B.focus.readout))); out.rx = r.x; out.ry = r.y;
    const s = proj(B.object.localToWorld(_v.copy(B.stack.object.position).setY(B.stack.object.position.y + 0.002))); out.sx = s.x; out.sy = s.y;
    out.text = b.text; out.lcd = b.lcd; out.stackOn = b.stackOn;
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
    stage, frame, render, veil, warm,
    get paint() { return W.paint; },
    get ctx() { return W.choreo.ctx; },
    get paper() { return W.paper; },
    get kind() { return W.paper.kind; },
    heroOn: () => !!(W && W.choreo.ctx.heroOn),
    pickHero, tearLine, heroCorners, heroFeet, benchOverlay,
    heroAnchor: (at) => anchorOf(W.A, at),
    sheetAnchor: (k, at) => anchorOf(k === 'B' ? W.B : W.A, at),
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
