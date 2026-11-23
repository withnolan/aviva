// choreo.js: brief Part 2B as code. Each section claims a pose for the camera, the lights and the sheet(s) from
// its own progress p (viewport heights into the section); state.js blends the claims; springs damp them; apply()
// turns them into the scene. Screen-space poses (x %, y %, size = projected long side in % of the viewport height,
// rx/ry/rz in degrees) are resolved against the live camera, so the sheet stays exactly where the brief puts it.
import * as THREE from 'three';
import { kf, seg, clamp, lerp, smooth, smoothstep, ease } from './util.js';
import { E, INTRO } from './events.js';
import { DEG, A4, STAGE, heroFraming } from './scene.js';
import { PORTRAIT } from './portrait.js';

const FLOOR_ANCHOR = new THREE.Vector3(0, 0, 0);
export const SIZE_SCALE = { A5: Math.SQRT1_2, A4: 1, A3: Math.SQRT2 };
const STUDIO = new THREE.Color('#ECEBE7'), INK = new THREE.Color('#1F1B6E');
const LOOPED = new Set(['s04', 's08']);           // sections with time-based motion (sway, breathing)

/** horizontal pitch of the drying-line outputs, in % of the viewport width (brief 2B, design system §10) */
export function outputSpacing(w) { return w <= 600 ? 74 : w <= 1024 ? 40 : 26; }

export function createChoreo({ stage, paper, state, springs, props, sheets }) {
  const { camera, rig, size } = stage;
  const { A, B, F, O, hero = null, bench = null, rim = null, board = null, portrait = null, lineup = null } = sheets;  // the product, second instance, falling output 1, outputs 2–8, the letters (letters.js)
  const ctx = {
    M: false, reduce: false, time: 0, hero: null, loop: false,
    tear: { p1: 0, s1: 0, p2: 0, s2: 0, live: false, fall: 0 }, rel: { plane: 0, fly: 0, fade: 1 },
    out: { off: 0, lineY: 118, spacing: 26, drop: 0, on: false }, s07: 0, sizeChoice: 'A4', heroOn: false,
    ground: null,                                  // THREE.Color set every frame by the world from grounds.js
  };


  /* ------------------------------------------------------------------ the hero letters (brief 10.3, decision #31) */
  // letters.js draws them (five module Sheets and the "4", in its own frame at the world origin); this file only drives
  // them: H2-H4 from E.intro.clock, H5-H8 from the scroll, the cursor lean and the I's glint (T6). heroClaim() writes
  // ctx.heroL[i] (the state for hero.set(i, ...)), ctx.heroFour and ctx.heroCam (restCamera, the rig blends to it); at
  // H9 the sheet A takes over from the I at the same pose (ctx.heroPose) and becomes the product.
  const HERO = {
    start: 0.4, gap: 0.12, fall: 1.1, drop: 0.5, leanDeg: 3,
    xn: [-0.53, -0.21, 0, 0.21, 0.53],                                   // the letters' screen x at rest (NDC)
    turn: [[0.10, 0.40], [0.25, 0.55], [0.40, 0.70], [0.25, 0.55], [0.10, 0.40]],
    open: [[0.40, 0.80], [0.55, 0.95], [0.70, 1.10], [0.55, 0.95], [0.40, 0.80]],
    merge: [[0.80, 1.25], [0.95, 1.35], null, [0.95, 1.35], [0.80, 1.25]],
    back: [0.004, 0.002, 0, 0.002, 0.004],
  };
  const REST = hero ? hero.restLayout() : null, STAGE_H = hero ? hero.restStage() : null;
  const CONTACT0 = paper.contact ? paper.contact.uniforms.uCS.value.z : 0, EXTENT0 = paper.lights.raw ? paper.lights.raw.shadowExtent : 0.6;
  ctx.heroL = [0, 1, 2, 3, 4].map(() => ({ visible: false, fold: 1, pose: 1, x: 0, z: 0, lift: 0, yaw: 0, flutter: 0 }));
  ctx.heroFour = { opacity: 0, visible: false };
  ctx.heroCam = null; ctx.heroLetters = false; ctx.heroP = 0; ctx.heroIntro = 0; ctx.heroDone = false;
  const _hcT = new THREE.Vector3();
  ctx.heroPose = { pos: new THREE.Vector3(REST ? REST.xs[2] : 0, A4.h / 2, REST ? REST.zs[2] : 0), quat: new THREE.Quaternion() };
  function heroClaim(c, p) {
    const R = ctx.reduce;
    ctx.heroLetters = true; ctx.heroP = p;
    for (let i = 0; i < 5; i++) {
      const o = ctx.heroL[i];
      const open = R ? (p > 0.1 ? 1 : 0) : seg(p, HERO.open[i][0], HERO.open[i][1]);     // H7
      const turn = R ? 0 : seg(p, HERO.turn[i][0], HERO.turn[i][1]);                     // H6
      const mw = HERO.merge[i], m = mw ? (R ? (p > 0.1 ? 1 : 0) : smooth(seg(p, mw[0], mw[1], ease.linear))) : 0;   // H8
      o.visible = m < 0.999 && !(i === 2 && p >= 1.1);                 // the I hands over to A at H9
      o.fold = 1 - open;
      o.pose = 1 - open;                                                 // pose 0 = upright, recto to the camera (airQuat)
      o.lift = (A4.h / 2) * open;                                        // unfolded, it stands on its edge
      o.flutter = 0;
      o.yaw = lerp(REST.yaws[i], i < 2 || i === 2 ? Math.PI / 2 : -Math.PI / 2, turn);
      o.lean = 1 - turn;
      o.x = lerp(REST.xs[i], REST.xs[2], m); o.z = lerp(REST.zs[i], REST.zs[2] - HERO.back[i], m);
    }
    // H3: the "4"; it leaves by 0.15 vh (H5)
    ctx.heroFour.opacity = (R ? 1 : seg(c, 2.1, 2.5)) * (1 - seg(p, 0, 0.15));
    ctx.heroFour.visible = ctx.heroFour.opacity > 0.002;
  }

  /* ------------------------------------------------------------------ the s02 bench (T8; bench.js) */
  ctx.bench = { on: false, rise: 0, slide: 0, open: 0.0125, lcd: '12.500', text: '', stackOn: false };
  ctx.dof = { k: 0, focus: new THREE.Vector3() };
  ctx.dofK = 0; ctx.dofT = 0; ctx.rimOn = 0;
  const _bp = new THREE.Vector3(), _bf = new THREE.Vector3(), _be = new THREE.Vector3();
  const EXTENT_BENCH = 1.2;
  ctx.boardOn = false; ctx.boardRise = 1;
  // s12 (T24): the family portrait: on, its screen y (%), the chosen model (damped 0..2), the riffle (damped 0..1),
  // the callouts' screen points, and whether it still needs frames (the spot sliding, the riffle settling)
  // s12: the lineup's stack: the model it shows, its displayed count, the deal in progress (from -> to over t 0..1), the
  // Notebook Pro's binding (0..1), and whether it still needs frames
  ctx.lineup = { on: false, model: 'base', count: 1, from: 1, to: 1, t: 1, dur: 0.9, bind: 0, busy: false };
  const _lq = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2), _lv = new THREE.Vector3();
  ctx.port = { on: false, y: 107, sel: 0, rk: 0, t: 0, busy: false, px: 0, py: 0, dom: [{ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }], hint: { x: 0, y: 0 }, ream: { x: 0, y: 0 } };
  const _pp = new THREE.Vector3(), _pq = new THREE.Quaternion(), _pv = new THREE.Vector3(), _psc = {};
  const _pf = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];
  ctx.pip = { on: false, y: -32, form: 0, ink: 1 }; ctx.inkTime = 0; ctx.bleedFlat = false; ctx.bleedTone = 1; ctx.inkTok = null;
  // s07 (T14): the ink front's centre (sheet rest m) drifting toward the pointer; t and Rmax after the compensation;
  // what the DOM needs (ui: scale bar, timer, the text that inverts as the ink passes under it)
  ctx.ink = { x: 0, y: 0, tx: 0, ty: 0, t: 0, rmax: 34.5, moving: false, px: 0, py: 0 };
  ctx.inkDom = { on: false, pxPerMm: 1, sx: 0, sy: 0, sr: 0, cov: 0, cx: 0.5, cy: 0.5, seed: 3.1, scale: 1, aspect: 1.6 };
  const _bq = new THREE.Quaternion();

  /* ------------------------------------------------------------------ claims, one per section (brief 2B) */
  const C = {
    s01(S, p) {
      // brief 10.3. H1-H4 run on E.intro.clock (main.js playIntro), H5-H9 on scroll inside the 2 vh hold.
      const I = E.intro, R = ctx.reduce, c = R ? INTRO.end : I.clock;
      if (I.started && !I.done) ctx.loop = true;
      const h9 = R ? (p > 0.1 ? 1 : 0) : seg(p, 1.1, 1.5);                // H9: the product stands free, the camera levels
      S.set('cam.floor', 0); S.set('cam.pitch', 0); S.set('cam.push', 0); S.set('cam.panY', 0);
      if (hero) {
        const C0 = hero.introCamera(c, size.aspect);
        // H7-H8: an upright, unfolded sheet is 297 mm tall, twice a letter. The camera eases back while they open, so
        // the baseline stays at 66 % and the top edge never rises above 25 % (under the h1)
        const k7 = R ? 0 : ease.inOut(seg(p, 0.3, 0.9, ease.linear));
        if (k7 > 0) {
          const Fw = Math.max(C0.dist * 2 * Math.tan(C0.fov * DEG / 2), A4.h / (0.66 - 0.25)), dw = Fw / (2 * Math.tan(C0.fov * DEG / 2));
          _hcT.set(C0.target.x, lerp(C0.target.y, (0.66 - 0.5) * Fw, k7), C0.target.z);
          ctx.heroCam = { target: _hcT, dist: lerp(C0.dist, dw, k7), pitch: C0.pitch, fov: C0.fov };
        } else ctx.heroCam = C0;
        ctx.heroIntro = c;
        S.set('cam.hero', 1 - h9);
        heroClaim(c, p);
        // T6: the letters lean toward the cursor at rest (<= 3 deg, eased by the springs); the I glints as it passes
        const P = E.pointer, live = P.on && !R && p < 0.1 && I.done;
        S.set('hero.lx', live ? P.nx : 0); S.set('hero.lon', live ? 1 : 0);
        S.set('hero.glint', live && Math.abs(P.nx) < 0.06 ? 1 : 0);
      }
      S.many('A.', { on: hero ? (p >= 1.1 || (R && p > 0.1) ? 1 : 0) : 1, op: 1, world: 1 - h9, x: 50, y: 52, size: 46, rx: 0, ry: 0, rz: 0 });
      S.set('world.print', 0); S.set('world.shadow', 1);
      const k1 = R ? 1 : seg(c, 0, 0.4);                                   // H1: the studio fades up under the drawing
      // backs and inner faces turned away from the key read as grey card: while the sheets fall and turn (H2, H6-H8) a
      // soft, even fill (card5) joins the letters' key; at rest and for the product (H9) it is the letters' key alone
      const fillB = R ? 0 : 0.4 * Math.max(seg(c, 0.3, 0.6) * (1 - seg(c, 2.2, 2.9)), seg(p, 0.05, 0.3) * (1 - seg(p, 1.25, 1.5)));
      S.light('s00', 1 - k1); S.light('letters', k1 * (1 - fillB)); S.light('card5', k1 * fillB);
      S.setEnum('A.gen', 'h' + (E.regen.gen || 0));
    },
    s02(S, p) {
      // from the hero's end frame (10.3 H9): upright at (50, 52), 46 vh%, level camera; push-in to (50, 50), 52 vh%
      S.set('cam.floor', 0); S.set('cam.pitch', 0);
      S.set('cam.push', ctx.reduce ? 0 : 0.04 * seg(p, 0.8, 3, ease.linear));
      S.many('A.', { on: 1, op: 1, world: 0, x: 50, y: kf(p, [[0, 52], [0.8, 50, ease.inOut]]), size: kf(p, [[0, 46], [0.8, 52, ease.inOut]]), rx: 0, rz: 0 });
      S.set('A.ry', kf(p, [[0.8, 0], [1.6, 90, ease.inOut], [2.2, 90], [3, 180, ease.inOut]]));
      S.set('world.print', 0); S.set('world.shadow', 0);
      S.set('bg.dark', seg(p, 1.3, 1.6) * (1 - seg(p, 2.2, 2.5)));
      const k = seg(p, 0.6, 1.4);
      S.light('letters', 1 - k); S.light('bench', k);                     // T8: the bench's cool overhead key and left rim
      // T8, the micrometer beat (11.1 row s02): parked until the sheet is edge-on (1.6 vh); slides in, closes to 0.1 mm
      // while the readout counts down, holds 0.100, then opens and parks again before the second turn (2.2 vh)
      const R = ctx.reduce, closeK = ease.inOut(seg(p, 1.75, 1.98, ease.linear)), reopen = seg(p, 2.08, 2.17);
      const gap = lerp(0.0125, 0.0001, closeK);
      const b = ctx.bench;
      b.on = true; b.rise = R ? 1 : seg(p, 0.15, 0.85);
      b.slide = seg(p, 1.6, 1.74) * (1 - seg(p, 2.15, 2.22));
      b.open = lerp(gap, 0.0125, reopen);
      b.lcd = (b.open * 1000).toFixed(3);                                 // the LCD reads the real gap: down to 0.100, back up
      b.text = '';
      b.stackOn = p >= 1.6 && p < 2.2;
      ctx.dofK = R ? 0 : 0.5 * seg(p, 1.5, 1.65) * (1 - seg(p, 2.2, 2.35));   // subtle: the subject stays crisp
      ctx.dofT = seg(p, 1.8, 2.15);                                       // rack focus: the readout -> the 0.1 mm edge
      ctx.rimOn = p > 1.3 && p < 2.4 ? 1 : 0;
      S.setEnum('A.gen', 'h' + (E.regen.gen || 0));
    },
    s03(S, p) {
      const M = ctx.M, inn = seg(p, 0, 0.8), out = seg(p, 6.6, 7);     // 7 vh: the dark-mode coda 5.4-6.6 (Part 11)
      S.set('cam.pitch', -12 * inn * (1 - out));
      const R = E.regen;
      // The sheet stays taped to the board's 35° slope through the coda (it glows there, the tape and board dark).
      // 5-5.4 vh the set reframes right of the coda's text column with a slight push-in; 6.6-7 vh the sheet lifts off
      // and exits upwards while the board drops away. Bd.* is the board's copy of the slope pose (no entry/exit moves).
      const bx = M ? 50 : kf(p, [[5, 50], [5.4, 58]]), by = M ? 47 : kf(p, [[5, 59], [5.4, 58]]), bs = M ? 32 : kf(p, [[5, 40], [5.4, 41]]);
      S.set('Bd.x', bx); S.set('Bd.y', by); S.set('Bd.size', bs);
      S.set('A.rest', 1 - inn * (1 - out));      // taped flat to the board: its rest bow would sink the long edges into it (ry 180)
      const x = kf(p, [[6.6, bx], [7, 50]]);
      const y = kf(p, [[0, 50], [0.8, by], [6.6, by], [7, M ? -28 : -25]]);
      const sz = kf(p, [[0, 52], [0.8, bs], [6.6, bs], [7, M ? 24 : 30]]);
      S.many('A.', { on: R.hidden ? 0 : 1, op: R.fade, x: x - 60 * R.roll, y: y - 70 * (1 - R.drop) + 8 * R.roll, size: sz,
        rx: kf(p, [[0, 0], [0.8, 35], [6.6, 35], [7, 0]]) + 60 * R.roll, ry: 180, rz: 160 * R.roll, crumple: R.crumple,
        flutter: ctx.reduce ? 0 : 0.006 * (R.drop < 1 ? 1 : 0), paint: 1, curl: ctx.reduce ? 0 : E.think.curl });
      S.setEnum('A.paintFace', -1); S.setEnum('A.curlCorner', 'tr');
      S.set('bg.warm', inn * (1 - seg(p, 5, 5.4)));
      ctx.boardOn = true; ctx.boardRise = ease.inOut(inn) * (1 - out);            // rises in with the slope, leaves with the section
      S.light('s03', 1);
      S.setEnum('A.gen', 'h' + (R.gen || 0));
    },
    s04(S, p) {
      const M = ctx.M;
      S.set('A.on', 0);
      // the fit-width numerals; "the camera pans down" = they move up out of frame while the line rises
      const pan = seg(p, 2.5, 3.2);
      S.many('N.', { on: p < 3.4 ? 1 : 0, op: seg(p, 0, 0.35), y: 50 - 100 * pan });
      // the falling sheet (it becomes output 1 when the first clip catches it)
      S.many('F.', {
        on: 1,
        x: kf(p, [[0, M ? 42 : 30], [0.8, M ? 30 : 20], [1.6, M ? 58 : 47], [2.5, 52], [3.2, 50]]),
        y: ctx.reduce ? kf(p, [[0, 37], [3.2, 37]]) : kf(p, [[0, -22], [0.8, 42], [1.6, 55], [2.5, 76], [3.2, 37]]),
        size: kf(p, [[0, 30], [2.5, 30], [3.2, 34]]),
        dz: kf(p, [[0, 0.04], [0.8, 0.12], [1.2, 0], [1.6, -0.1], [2.3, -0.05], [2.8, 0]]),
        rx: ctx.reduce ? 0 : kf(p, [[0, -25], [0.8, 18], [1.6, -20], [2.5, 12], [3.2, 0]]),
        ry: ctx.reduce ? 0 : kf(p, [[0, 30], [0.8, -24], [1.6, 26], [2.5, -10], [3.2, 0]]),
        rz: ctx.reduce ? 0 : kf(p, [[0, -14], [0.8, 12], [1.6, -10], [2.5, 6], [3.2, 0]]),
      });
      if (ctx.reduce) S.set('F.on', p > 2.4 ? 1 : 0);
      S.set('O.catch', ctx.reduce ? 1 : seg(p, 2.8, 3.2));
      S.many('O.', { on: p > 2.35 ? 1 : 0, line: seg(p, 2.4, 2.8), lineY: 18 + 100 * (1 - pan) - 32 * seg(p, 7.6, 8),
        offset: 7 * seg(p, 3.2, 7.6, ease.linear), drop: seg(p, 7.6, 8) });
      const g = seg(p, 2.6, 3.2), off = 7 * seg(p, 3.2, 7.6, ease.linear);
      S.light('studio', 1 - g);
      for (let i = 0; i < 8; i++) { const w = Math.max(0, 1 - Math.abs(i - off)); if (w > 0) S.light('card' + (i + 1), w * g); }
      S.setEnum('A.gen', 's04');
    },
    s05(S, p) {
      const M = ctx.M, T = E.tear;
      // the dropped output becomes the hero sheet; it settles, folds in half, unfolds; then the tears
      const fresh = p >= 4.75;
      S.many('A.', { on: 1, op: 1, x: !fresh ? 50 : (M ? 50 : 70),
        y: !fresh ? kf(p, [[0, 60], [0.6, 52]]) : kf(p, [[4.75, -32], [5, 50, ease.out]]),
        size: !fresh ? kf(p, [[0, 40], [0.6, M ? 40 : 46]]) : (M ? 34 : 40), ry: !fresh ? 0 : -18, rx: 0, rz: 0,
        halving: kf(p, [[0.6, 0], [1.05, 1, ease.inOut], [1.2, 1], [1.6, 0, ease.inOut]]),
        creaseMid: !fresh && p > 1.25 ? 1 : 0 });
      S.set('O.on', 0); S.set('F.on', 0);
      S.setEnum('A.gen', !fresh ? 't' : 'f' + (E.arena.genA || 0));
      const p1 = Math.max(T.p1, seg(p, 1.95, 2.4, ease.linear));
      const s1 = Math.max(T.split1, seg(p, 2.4, 2.75));
      const p2 = s1 > 0.98 ? Math.max(T.p2, seg(p, 2.95, 3.4, ease.linear)) : 0;
      const s2 = p2 >= 1 ? Math.max(T.split2, seg(p, 3.4, 3.75)) : 0;
      const live = !fresh && p > 1.6;
      Object.assign(ctx.tear, { p1: live ? p1 : 0, s1: live ? s1 : 0, p2: live ? p2 : 0, s2: live ? s2 : 0, live, fall: seg(p, 4.4, 4.75) });
      S.many('T.', { on: live && p1 > 0 ? 1 : 0, p1: live ? p1 : 0, p2: live ? p2 : 0, split1: live ? s1 : 0, split2: live ? s2 : 0, fall: seg(p, 4.4, 4.75) });
      S.setEnum('T.line', !live ? 0 : p1 < 1 ? 1 : (p2 < 1 && s1 > 0.98) ? 2 : (s2 > 0.98 ? 3 : 0));
      S.setEnum('D.mode', p < 0.15 || p > 1.6 ? 'none' : (p > 0.75 && p < 1.3 ? 'fold' : 'a4'));
      S.light('s05', 1);
    },
    s06(S, p) {
      const M = ctx.M, c = E.cues, end = seg(p, 3.3, 4);
      S.many('A.', { on: 1, op: 1,
        x: lerp(M ? 50 : 70 + 3 * (c.drift || 0), 50, end), y: lerp(M ? 17 : 50, 50, end), size: lerp(M ? 19 : 40, 60, end),
        ry: kf(p, [[0, -18], [3.3, 18, ease.linear], [4, 0]]), rx: 0, rz: 0,
        bend: 1.5 * (1 - end), map: c.map || 0, wm: c.wm || 0 });
      const dbl = c.double || 0;
      S.many('B.', { on: dbl > 0.02 ? 1 : 0, op: 1, x: (M ? 50 : 70) + 15 * dbl + (M ? 0 : 3 * (c.drift || 0)), y: M ? 17 : 50,
        size: M ? 19 : 40, ry: kf(p, [[0, -18], [3.3, 18, ease.linear]]), dz: -0.03, rx: 0, rz: 0, bend: 1.5 });
      S.setEnum('D.mode', (c.dims || 0) > 0.5 && end < 0.5 ? 'a4' : 'none');
      S.light('s06', 1 - (c.wm || 0)); if (c.wm) S.light('s06v2', c.wm);
      S.setEnum('A.gen', 'f' + (E.arena.genA || 0)); S.setEnum('B.gen', 'b');
    },
    s07(S, p) {
      const R = ctx.reduce;
      const dolly = R ? (p > 0.6 ? 1 : 0) : seg(p, 0, 1.2, ease.inOut);
      const back = R ? (p > 3.9 ? 1 : 0) : seg(p, 4.0, 4.5, ease.out);
      const macroSize = 420;
      ctx.s07 = p < 0.6 ? 0 : p < 2.4 ? 1 : p < 3.9 ? 2 : 3;      // the reduced-motion cross-dissolve steps
      S.many('A.', { on: 1, op: 1,
        x: 50 - (E.loupe.x - 0.5) * 8 * seg(p, 1.2, 1.4) * (1 - back), y: lerp(50, ctx.M ? 26 : 32, back),
        size: back > 0 ? lerp(macroSize, ctx.M ? 22 : 30, back) : lerp(60, macroSize, dolly), rx: 0, ry: 0, rz: 0,
        macro: seg(p, 0.6, 1.2) * (1 - seg(p, 4.0, 4.2)), dot: seg(p, 4.1, 4.3), trans: lerp(0.24, 0.36, back) });
      S.set('cam.fov', R ? (p < 0.6 || p > 3.9 ? 30 : 22) : kf(p, [[0, 30], [1.2, 22], [2.8, 22], [3.4, 26], [4.0, 26], [4.5, 30]]));
      const front = R ? (p > 2.4 ? 1 : 0) : seg(p, 2.4, 3.4, ease.linear);
      // T14: a glass pipette comes down from the top (2.0-2.15 vh), a drop swells at its tip (2.15-2.2) and falls to the
      // sheet (2.2-2.4), and the pipette lifts away (2.3-2.55); the ink column in it drops a little as the drop leaves
      const P = ctx.pip;
      P.on = !R && p > 1.98 && p < 2.56;
      P.y = kf(p, [[2.0, -32], [2.15, 31, ease.out], [2.3, 31], [2.56, -48, ease.in]]);
      P.form = seg(p, 2.15, 2.2); P.ink = 1 - 0.18 * seg(p, 2.17, 2.23);
      S.set('ink.dropOn', p > 2.15 && p < 2.62 && !R ? 1 : 0);
      S.set('ink.drop', seg(p, 2.2, 2.4, ease.in));
      ctx.inkTime = p < 2.4 ? 0 : 12 * seg(p, 2.4, 3.4, ease.linear) + 8 * seg(p, 3.4, 3.95, ease.linear);   // the timer (s)
      // on-demand rendering: keep drawing while the ink is still following a pointer that moved (inkFollow, apply)
      const Ik = ctx.ink, Pq = E.pointer;
      if (!R && front > 0 && p < 3.95 && (Ik.moving || Pq.x !== Ik.px || Pq.y !== Ik.py)) ctx.loop = true;
      Ik.px = Pq.x; Ik.py = Pq.y;
      // the sheet's own front ends under the full-screen ink (3.95): the sheet that surfaces at the pull-back is white
      S.set('ink.front', R ? (p < 4.0 ? front : 1 - seg(p, 4.1, 4.4)) : p < 3.95 ? front : 0);
      S.set('ink.grade', seg(p, 2.4, 2.55) * (1 - (R ? seg(p, 4.0, 4.1) : seg(p, 3.94, 3.95))));
      // the screen-space front: 0.4 at the hand-over (3.4) to every pixel by 3.93; then, as the camera pulls back, the
      // ink lifts off evenly (a flat fade over 4.1-4.32, once the shrinking sheet no longer fills the frame), so the white
      // sheet surfaces in the ink world without a flash
      ctx.bleedFlat = !R && p >= 3.94;
      const bleed = R || p < 3.4 ? 0 : p < 3.94 ? 0.4 + 0.6 * seg(p, 3.4, 3.93, ease.linear) : 1 - seg(p, 4.1, 4.32, ease.inOut);
      S.set('ink.bleed', bleed);
      ctx.bleedTone = seg(p, 3.4, 3.7);                 // its colour: from the sheet's lit ink at the hand-over to the token
      S.set('bg.ink', p >= 3.95 || (R && p >= 3.4) ? 1 : 0);
      S.setEnum('ground', p >= 3.9 || (R && p >= 3.4) ? 'ink' : 'paper');
      const toInk = seg(p, 3.9, 4.2);
      S.light('s07', 1 - toInk); S.light('s08', toInk);
      S.setEnum('A.gen', 'f' + (E.arena.genA || 0));
    },
    s08(S, p) {
      const M = ctx.M;
      // phones: the copy and cards scroll through the middle of the screen, so the sheet steps out of their way
      const y = M ? kf(p, [[0, 26], [0.5, 24], [0.95, -30], [2.4, -30], [3, 52]]) : kf(p, [[0, 32], [2.4, 30], [3, 50]]);
      S.many('A.', { on: 1, op: 1, x: 50, y, size: M ? kf(p, [[0, 22], [2.4, 18]]) : kf(p, [[0, 30], [2.4, 30], [3, 34]]),
        ry: -20 + 40 * seg(p, 0, 3, ease.linear), rx: 0, rz: 0, dot: 1, trans: 0.36,
        bend: ctx.reduce ? 1.5 : 1.5 + 0.5 * Math.sin(ctx.time * Math.PI / 3) });
      S.set('bg.ink', 1); S.setEnum('ground', 'ink');
      S.light('s08', 1);
      S.setEnum('A.gen', 'f' + (E.arena.genA || 0));
    },
    s09(S, p) {
      const M = ctx.M, mv = seg(p, 3.6, 4);
      const yM = kf(p, [[0, 52], [0.35, 52], [0.8, -30], [3.4, -30], [4, 46]]);
      S.many('A.', { on: 1, op: 1, x: lerp(50, M ? 28 : 35, mv), y: M ? yM : 50, size: M ? kf(p, [[0, 18], [3.4, 18], [4, 24]]) : lerp(34, 40, mv),
        ry: 15 * Math.sin(p * 1.7) * (1 - mv), rx: 0, rz: 0, dot: 1, dogEar: (E.cues.dogEar || 0) * (1 - mv),
        creaseDog: E.cues.dogEarSeen && p > 3.7 ? 1 : 0 });
      S.setEnum('A.curlCorner', 'tr');
      S.set('bg.ink', 1); S.setEnum('ground', 'ink');
      S.light('s09', 1);
      S.setEnum('A.gen', 'f' + (E.arena.genA || 0));
    },
    s10(S, p) {
      const M = ctx.M, V = E.arena, exit = seg(p, 2.2, 2.9);
      // brief: (35 | 65, 50), 40 vh%; on a short screen the pair shrinks and drops just enough to clear the header
      // (its bottom edge, measured by ui.js) and keep above the RESPONSE labels at 72 %
      const top = (E.layout.s10Top || 0) + 2;
      const ax = M ? 28 : 35, bx = M ? 72 : 65, sz = M ? 24 : clamp(70 - top, 28, 40), sy = M ? 46 : Math.max(50, top + sz / 2);
      const win = V.winner || 'A';
      const pose = (who) => {
        const isLoser = V.loser === who, base = who === 'A' ? ax : bx;
        let x = who === 'B' ? lerp(125, bx, seg(p, 0, 0.5)) : base, y = sy;
        if (isLoser) { y += 70 * V.roll - 75 * (1 - V.drop); x += 6 * V.roll; }
        if (who === win) y = lerp(y, -32, exit); else x = lerp(x, 135, exit);
        return { x, y, size: sz, rx: 10 * V.bow + (isLoser ? 50 * V.roll : 0), ry: 0, rz: isLoser ? 120 * V.roll : 0,
          crumple: isLoser ? V.crumple : 0, op: isLoser ? V.fade : 1 };
      };
      const a = pose('A'), b = pose('B');
      S.many('A.', { on: V.loser === 'A' && V.hidden ? 0 : 1, ...a, dot: 1, creaseDog: E.cues.dogEarSeen ? 1 : 0 });
      S.many('B.', { on: (V.loser === 'B' && V.hidden) || p < 0.02 ? 0 : 1, ...b });
      S.setEnum('A.gen', 'f' + (V.genA || 0)); S.setEnum('B.gen', 'b' + (V.genB || 0));
      S.set('bg.ink', p < 2.96 ? 1 : 0);
      S.setEnum('ground', p < 2.9 ? 'ink' : 'paper');
      S.light('s10', 1);
    },
    s11(S, p) {
      const M = ctx.M, out = seg(p, 6.4, 7);
      S.many('A.', { on: 1, op: 1, x: lerp(50, M ? 50 : 62, out), y: lerp(M ? 9 : 18, M ? 64 : 52, out), size: lerp(M ? 12 : 22, M ? 26 : 44, out),
        ry: ctx.reduce ? 0 : 25 * Math.sin(p * 0.9) * (1 - out), rx: lerp(8, -8, out), rz: 0, dot: 1, creaseDog: E.cues.dogEarSeen ? 1 : 0 });
      S.setEnum('A.gen', 'f' + (E.arena.genA || 0));
      S.light('s11', 1);
    },
    s12(S, p) {
      const M = ctx.M;
      // the lineup is all A4 (3.13): the dimension lines always read 210 x 297 (fresh-eyes #6); the models add
      // sheets, not size (the stacks and the passive preview at 0.8 / 1.4 / 2.0 vh are T24)
      const choice = 'A4';
      // T24: the lineup's sheet leaves upwards (2.3-2.8 vh) as the family portrait rises in with the comparison table
      // (2.3-3.0, the same ease as the table); from 3.0 the stage scrolls away and the portrait goes with it
      const away = seg(p, 2.3, 2.8);
      // the lineup's stack grows behind the sheet (apply): as it does, the sheet turns 12 deg so its bound side reads, and
      // for the ream the camera eases back 8 % and tilts down 6 deg so the top and the side of the 5 cm block both read
      const Lu = ctx.lineup, grow = clamp((Lu.count - 1) / 79), ream = clamp((Lu.count - 80) / 420);
      Lu.on = !M && away < 0.995;
      if (Lu.busy) ctx.loop = true;
      S.many('A.', { on: away < 0.995 ? 1 : 0, op: 1, x: M ? 50 : 62, y: lerp(M ? 64 : 52, -36, ease.in(away)), size: lerp(lerp(M ? 26 : 44, 40.5, ream), 36, away),
        rx: -8 - 6 * ream, ry: 12 * grow, rz: 0, scale: SIZE_SCALE[choice], dot: 1, creaseDog: E.cues.dogEarSeen ? 1 : 0 });
      ctx.sizeChoice = choice;
      S.setEnum('D.mode', away < 0.1 ? 'size' : 'none');
      const P = ctx.port, Pq = E.pointer;
      P.on = !M && p > 2.28 && p < 3.75;
      P.y = p <= 3 ? 27 + 80 * (1 - seg(p, 2.3, 3.0)) : 27 - 100 * (p - 3);
      if (P.on && (P.busy || Pq.x !== P.px || Pq.y !== P.py)) ctx.loop = true;   // the riffle and the spot need frames
      P.px = Pq.x; P.py = Pq.y;
      S.setEnum('A.gen', 'f' + (E.arena.genA || 0));
      S.light('s12', 1);
    },
    s13(S) {
      S.many('A.', { on: 0, y: -40 });
      S.light('s12', 1);
      S.setEnum('A.gen', 's13');
    },
    s14(S, p) {
      const M = ctx.M, Rl = E.release, R = ctx.reduce;
      const plane = Math.max(Rl.plane, R ? (p > 2.0 ? 7 : p > 1.85 ? 3.5 : 0) : 7 * seg(p, 1.8, 2.15, ease.linear));
      const fly = R ? 0 : Math.max(Rl.fly, seg(p, 2.15, 2.5, ease.in));
      const fade = R ? Math.min(Rl.fade, 1 - seg(p, 2.2, 2.45)) : 1;
      Object.assign(ctx.rel, { plane, fly, fade });
      S.many('A.', { on: fly < 0.995 && fade > 0.01 ? 1 : 0, op: fade,
        x: 50 + 78 * fly * fly, y: kf(p, [[0, -32], [0.6, M ? 47 : 52, ease.out]]) - 72 * fly ** 1.3, size: lerp(M ? 32 : 42, M ? 18 : 24, fly),
        rx: 14 * fly, ry: 180, rz: -52 * smooth(clamp(plane / 7)) * (1 - 0.3 * fly) - 18 * fly,
        plane, paint: 1, dot: 1, creaseDog: E.cues.dogEarSeen ? 1 : 0 });
      S.setEnum('A.paintFace', -1);
      S.set('P.fly', fly);
      S.set('cam.panY', -3 * fly);
      S.light('s14', 1);
      S.setEnum('A.gen', 's14');
    },
    s15(S) { S.set('A.on', 0); S.light('s14', 1); S.setEnum('A.gen', 's15'); },
  };

  /* ------------------------------------------------------------------ per-frame: claim → resolve */
  function claim(secs, frame) {
    ctx.M = size.w <= 600 || size.aspect <= 0.8;      // the stacked layout: the same test as the CSS media query
    ctx.heroLetters = false; ctx.bench.on = false; ctx.dofK = 0; ctx.rimOn = 0; ctx.boardOn = false; ctx.port.on = false; ctx.lineup.on = false;
    ctx.reduce = frame.reduce;
    ctx.time = E.time;
    ctx.loop = false;
    state.reset();
    let total = 0;
    for (const s of secs) {
      if (s.w <= 0) continue;
      state.w = s.w; total += s.w;
      if (LOOPED.has(s.key) && !ctx.reduce) ctx.loop = true;
      const fn = C[s.key];
      if (fn) fn(state, s.p);
    }
    state.resolve(total);
  }

  /* ------------------------------------------------------------------ apply the damped state to the scene */
  const _pos = new THREE.Vector3(), _q = new THREE.Quaternion(), _wq = new THREE.Quaternion(), _wp = new THREE.Vector3();
  const _e = new THREE.Euler(), _m = new THREE.Matrix4(), _mi = new THREE.Matrix4(), _v = new THREE.Vector3(), _s = new THREE.Vector3(1, 1, 1);
  const g = (n) => springs.get(n);

  function placeScreen(obj, pre, scale = 1) {
    const k = stage.screenPlace(g(pre + 'x'), g(pre + 'y'), g(pre + 'size'), A4.h, g(pre + 'dz'), _pos);
    stage.screenQuat(g(pre + 'rx'), g(pre + 'ry'), g(pre + 'rz'), _q);
    obj.position.copy(_pos); obj.quaternion.copy(_q); obj.scale.setScalar(scale * k);
  }
  function placeHero() {
    const o = A.object;
    let k = stage.screenPlace(g('A.x'), g('A.y'), g('A.size'), A4.h, g('A.dz'), _pos);
    stage.screenQuat(g('A.rx'), g('A.ry'), g('A.rz'), _q);
    const w = clamp(g('A.world'));
    if (w > 0.0005) {
      if (ctx.heroLetters) { _wp.copy(ctx.heroPose.pos); _wq.copy(ctx.heroPose.quat); }
      else { _wp.set(g('A.wx'), g('A.wy'), g('A.wz')); _e.set(g('A.wrx') * DEG, g('A.wry') * DEG, g('A.wrz') * DEG, 'XYZ'); _wq.setFromEuler(_e); }
      _pos.lerp(_wp, w); _q.slerp(_wq, w); k = lerp(k, 1, w);
    }
    o.position.copy(_pos); o.quaternion.copy(_q); o.scale.setScalar(g('A.scale') * k);
    o.updateMatrixWorld(true);
  }

  // change-detected sheet.set(): only pass keys whose values moved
  function push(sheet, next) {
    const prev = sheet.__last || (sheet.__last = {});
    const diff = {};
    let any = false;
    for (const k in next) {
      const v = next[k], pv = prev[k];
      const same = typeof v === 'number' ? (pv !== undefined && Math.abs(v - pv) < 1e-4) : JSON.stringify(v) === JSON.stringify(pv);
      if (!same) { diff[k] = v; prev[k] = v; any = true; }
    }
    if (any) sheet.set(diff);
  }

  // tear pieces: world poses from screen space, written into the hero sheet's local frame
  const piecePose = (x, y, sizePct, L, rz, out) => {
    out.k = stage.screenPlace(x, y, sizePct, L, 0, out.p);
    stage.screenQuat(0, 0, rz, out.q);
    return out;
  };
  const PA = { p: new THREE.Vector3(), q: new THREE.Quaternion(), k: 1 }, PB = { p: new THREE.Vector3(), q: new THREE.Quaternion(), k: 1 };
  const PC = { p: new THREE.Vector3(), q: new THREE.Quaternion(), k: 1 };
  function setPieceWorld(piece, p, q) {
    _m.compose(p, q, _s);
    _mi.copy(A.object.matrixWorld).invert();
    _m.premultiply(_mi);
    _m.decompose(piece.object.position, piece.object.quaternion, _v);
  }
  function applyTear() {
    const on = g('T.on') > 0.5;
    const p1 = g('T.p1'), p2 = g('T.p2'), s1 = g('T.split1'), s2 = g('T.split2'), fall = g('T.fall');
    if (!on) { push(A, { tear: null }); return; }
    push(A, { tear: { p1: Math.min(1, p1), p2: Math.min(1, p2) } });
    const M = ctx.M, W = A4.w, H = A4.h;
    const halfSize = M ? 26 : 33, qSize = M ? 19 : 23;
    const hx = M ? [30, 70] : [36, 64];
    const fallY = 95 * fall * fall, fallR = 70 * fall;
    if (p2 <= 0) {
      for (const [key, i] of [['T', 0], ['B', 1]]) {
        const pc = A.piece(key); if (!pc) continue;
        // rest pose (inside the A4) → side-by-side portrait halves
        const rest = PA; rest.p.set(0, i === 0 ? H / 4 + 0.0015 * p1 : -H / 4 - 0.0015 * p1, 0).applyMatrix4(A.object.matrixWorld);
        rest.q.copy(A.object.quaternion);
        piecePose(hx[i], 52 + fallY, halfSize, W, 90 + (i ? -1 : 1) * fallR * 0.3, PB);
        rest.p.lerp(PB.p, smooth(s1)); rest.q.slerp(PB.q, smooth(s1));
        setPieceWorld(pc, rest.p, rest.q);
      }
    } else {
      // quarters: start where their parent half is, then settle into the 2 × 2 grid (portrait again)
      const grid = { TL: [M ? 30 : 38, M ? 38 : 32], TR: [M ? 70 : 62, M ? 38 : 32], BL: [M ? 30 : 38, M ? 64 : 70], BR: [M ? 70 : 62, M ? 64 : 70] };
      const parent = { TL: 0, TR: 0, BL: 1, BR: 1 };
      const offs = { TL: -W / 4, TR: W / 4, BL: -W / 4, BR: W / 4 };
      for (const key of ['TL', 'TR', 'BL', 'BR']) {
        const pc = A.piece(key); if (!pc) continue;
        const i = parent[key];
        piecePose(hx[i], 52, halfSize, W, 90, PB);                         // the parent half's pose
        _v.set(offs[key] * (1 + 0.02 * p2), 0, 0).applyQuaternion(PB.q);   // the quarter's centre inside it
        PC.p.copy(PB.p).add(_v); PC.q.copy(PB.q);
        const [gx, gy] = grid[key];
        piecePose(gx, gy + fallY, qSize, H / 2, (key.endsWith('L') ? 1 : -1) * fallR * 0.25, PA);
        PC.p.lerp(PA.p, smooth(s2)); PC.q.slerp(PA.q, smooth(s2));
        setPieceWorld(pc, PC.p, PC.q);
      }
    }
  }

  // outputs on the drying line
  const OUT_FORMS = [
    { light: 'card1' }, { plane: 7, rz: 180 }, { curl: { corner: 'br', t: 1, r: 0.02, deg: 60, size: 0.07 } }, { boat: 1 },
    {}, { fan: 1 }, {}, { still: true },
  ];
  function applyOutputs() {
    const on = g('O.on') > 0.5;
    const spacing = outputSpacing(size.w), off = g('O.offset'), lineY = g('O.lineY'), drop = g('O.drop');
    Object.assign(ctx.out, { off, lineY, spacing, drop, on: on || g('F.on') > 0.5 });
    const line = props.line;
    line.group.visible = on || g('F.on') > 0.5;
    // the falling sheet F = output 1
    if (g('F.on') > 0.5) {
      F.object.visible = true;
      const k = smooth(clamp(g('O.catch')));
      const hx = 50 + (0 - off) * spacing, hy = lineY + 1.4 + 17;
      const fx = g('F.x'), fy = g('F.y'), fs = g('F.size');
      const bonus = 1 + 0.08 * Math.max(0, 1 - Math.abs(off));
      const sc = stage.screenPlace(lerp(fx, hx, k), lerp(fy, hy, k), lerp(fs, 34 * bonus, k), A4.h, lerp(g('F.dz'), 0, k), _pos);
      const sway = ctx.reduce ? 0 : 3 * Math.sin(E.time * 1.3) * k;
      stage.screenQuat(lerp(g('F.rx'), 0, k), lerp(g('F.ry'), sway + E.hover.x * 6 * k * Math.max(0, 1 - Math.abs(off)), k), lerp(g('F.rz'), 0, k), _q);
      F.object.position.copy(_pos); F.object.quaternion.copy(_q); F.object.scale.setScalar(sc);
      push(F, { flutter: ctx.reduce ? 0 : lerp(0.008, 0.004, k), translucency: 0.3 });
    } else F.object.visible = false;
    for (let i = 1; i < 8; i++) {
      const s = O[i - 1], f = OUT_FORMS[i];
      if (!on) { s.object.visible = false; continue; }
      const x = 50 + (i - off) * spacing;
      const near = Math.max(0, 1 - Math.abs(i - off));
      let y = lineY + 1.4 + 17, sz = 34 * (1 + 0.08 * near);
      const rz = f.rz || 0;
      if (i === 7 && drop > 0) { y = lerp(y, 60, smooth(drop)); sz = lerp(sz, 40, drop); }
      const vis = x > -40 && x < 140;
      s.object.visible = vis;
      if (!vis) continue;
      const sway = f.still || ctx.reduce ? 0 : 4 * Math.sin(E.time * 1.1 + i * 1.7);
      const sc = stage.screenPlace(x, y, sz, A4.h, 0, _pos);
      stage.screenQuat(0, (f.plane ? (ctx.reduce ? 0 : 10 * Math.sin(E.time * 0.8 + i)) : sway) + E.hover.x * 8 * near, rz + (f.still ? 0 : E.hover.y * 2 * near), _q);
      s.object.position.copy(_pos); s.object.quaternion.copy(_q); s.object.scale.setScalar(sc);
      push(s, { plane: f.plane || 0, boat: f.boat || 0, fan: f.fan || 0, curl: f.curl || null, flutter: f.still || ctx.reduce ? 0 : 0.004 });
    }
    // the cord + clips at the outputs' depth
    if (line.group.visible) {
      const t = Math.tan(camera.fov * DEG / 2), d = A4.h / (0.34 * 2 * t);
      stage.screenPlace(50, lineY, 34, A4.h, 0, _pos);
      line.cord.position.copy(_pos); line.cord.quaternion.copy(camera.quaternion);
      line.cord.rotateZ(Math.PI / 2);
      line.cord.scale.set(1, 2 * d * t * size.aspect * 1.3, 1);
      line.cord.visible = g('O.line') > 0.02;
      for (let i = 0; i < 8; i++) {
        const c = line.clips[i];
        const x = 50 + (i - off) * spacing;
        const hidden = (i === 7 && drop > 0.02) || x < -20 || x > 120 || !on;
        c.visible = !hidden && line.cord.visible;
        if (!c.visible) continue;
        stage.screenPlace(x, lineY + 0.9, 34, A4.h, 0.004, _pos);
        c.position.copy(_pos); c.quaternion.copy(camera.quaternion);
      }
    }
  }

  const bg = new THREE.Color(), _sc = {};
  const MID_CREASE = [{ n: [0, 1], d: 0, strength: 1 }];
  const DOG_CREASE = { n: [0.7071, 0.7071], d: 0.7071 * (A4.w / 2 + A4.h / 2 - 0.03), strength: 0.8 };
  /* s07 (T14): the ink follows the pointer (capillary pull, brief 11.1): the front's centre drifts toward the cursor, up
     to 40 % of its radius, and the front grows by the same amount, so the side away from the cursor never recedes. The
     radius at t = 1 matches the screen-space front's at the hand-over (bleed.js, uCov 0.4: 0.49 screen heights, which is
     34.5 mm at the macro's 420 vh%), so the blot does not jump at 3.4 vh. */
  const INK_R = 34.5, _iray = new THREE.Raycaster(), _indc = new THREE.Vector2(), _ipl = new THREE.Plane(), _ihit = new THREE.Vector3(), _inrm = new THREE.Vector3();
  function inkFollow(dt, front) {
    const I = ctx.ink;
    if (front <= 0.0005) { I.x = I.y = I.tx = I.ty = 0; I.t = 0; I.rmax = INK_R; return; }
    const R = INK_R * (0.04 + 0.96 * Math.sqrt(Math.min(1, front))) / 1000;          // m
    const P = E.pointer, o = A.object;
    if (P.on && !ctx.reduce) {                                                     // the cursor on the sheet (rest m)
      _indc.set((P.x / size.w) * 2 - 1, -(P.y / size.h) * 2 + 1);
      _iray.setFromCamera(_indc, camera);
      _ipl.setFromNormalAndCoplanarPoint(_inrm.set(0, 0, 1).applyQuaternion(o.quaternion), o.position);
      if (_iray.ray.intersectPlane(_ipl, _ihit)) { o.worldToLocal(_ihit); I.tx = _ihit.x; I.ty = _ihit.y; }
    }
    const m = 0.4 * R, lt = Math.hypot(I.tx, I.ty), kt = lt > m ? m / lt : 1;
    const k = 1 - Math.exp(-2.2 * Math.min(dt, 0.1));                              // ~0.5 s to follow
    const ex = I.tx * kt - I.x, ey = I.ty * kt - I.y;
    I.moving = Math.abs(ex) + Math.abs(ey) > 0.00002;                               // still on its way (keeps frames coming)
    I.x += ex * k; I.y += ey * k;
    const l = Math.hypot(I.x, I.y); if (l > m) { I.x *= m / l; I.y *= m / l; }     // scrolling back shrinks the room
    const Rw = (R + Math.min(l, m)) * 1000, st = (Rw / INK_R - 0.04) / 0.96;        // the grown radius (mm) -> t, then Rmax
    if (st <= 1) { I.t = st * st; I.rmax = INK_R; } else { I.t = 1; I.rmax = Rw; }
  }
  function apply(dt = 1 / 60) {
    const M = ctx.M;
    /* camera */
    const fl = clamp(g('cam.floor'));
    const HF = heroFraming(size.aspect, 30);
    ctx.hero = HF;
    rig.anchor.lerpVectors(STAGE.anchor, FLOOR_ANCHOR, fl);
    rig.sx = 50 + g('cam.panX');
    rig.sy = lerp(50, HF.sy, fl) + g('cam.panY');
    rig.dist = lerp(STAGE.dist, HF.dist, fl) * (1 - g('cam.push'));
    rig.pitch = g('cam.pitch'); rig.fov = g('cam.fov');
    const hw = ctx.heroCam ? clamp(g('cam.hero')) : 0;               // s01: the letters' rest camera (letters.js)
    if (hw > 0.0005) {
      const H = ctx.heroCam;
      rig.anchor.lerp(H.target, hw); rig.sx = lerp(rig.sx, 50, hw); rig.sy = lerp(rig.sy, 50, hw);
      rig.dist = lerp(rig.dist, H.dist, hw); rig.pitch = lerp(rig.pitch, H.pitch, hw); rig.fov = lerp(rig.fov, H.fov, hw);
    }
    stage.applyRig();

    /* ground colour (the studio, the ink world, the s02 edge-on darkening, the s03 warmth) */
    // the page ground (grounds.js: the section map, cross-faded with the scroll), else the studio / ink fallback
    if (ctx.ground) bg.copy(ctx.ground); else bg.copy(STUDIO).lerp(INK, clamp(g('bg.ink')));
    const wm = g('bg.warm');
    if (wm > 0.001) { bg.r *= 1 + 0.06 * wm; bg.g *= 1 + 0.015 * wm; bg.b *= 1 - 0.05 * wm; }
    if (paper.kind === 'placeholder' && g('bg.dark') > 0.001) bg.multiplyScalar(1 - 0.045 * g('bg.dark'));   // the module's s02 preset does it
    paper.setGround(bg);

    /* the hero sheet */
    const aOn = g('A.on') > 0.5 && g('A.op') > 0.003;
    ctx.heroOn = aOn;
    A.object.visible = aOn;
    if (aOn) {
      placeHero();
      const front = g('ink.front');
      inkFollow(dt, front);
      const creases = [];
      if (g('A.creaseMid') > 0.5) creases.push(MID_CREASE[0]);
      if (g('A.creaseDog') > 0.5) creases.push(DOG_CREASE);
      push(A, {
        opacity: g('A.op'), bend: g('A.bend'), flutter: g('A.flutter'), peel: g('A.peel'), dogEar: g('A.dogEar'), halving: g('A.halving'),
        plane: g('A.plane'), crumple: g('A.crumple'), showThrough: g('A.show'), translucency: g('A.trans'), watermark: g('A.wm'),
        map: g('A.map'), inkDot: g('A.dot'), macro: g('A.macro'), paint: g('A.paint') > 0.5, paintFace: state.enum('A.paintFace'),
        curl: g('A.curl') > 0.001 ? { corner: state.enum('A.curlCorner'), t: g('A.curl'), r: 0.015, deg: 25, size: 0.06 } : null,
        bleed: front > 0.0005 ? { t: ctx.ink.t, at: [ctx.ink.x, ctx.ink.y], radiusMM: ctx.ink.rmax, amount: 1, grade: g('ink.grade') } : null,
        creases: creases.length ? creases : null, rest: g('A.rest'),
        cockle: 0.00045 * (0.3 + 0.7 * g('A.rest')),        // taped flat (s03): its waviness stays under the tape (0.18 mm)
      });
      applyTear();
    }

    /* the hero letters (s01): state -> letters.js; the cursor lean and the I's glint (T6) */
    if (hero) {
      hero.object.visible = ctx.heroLetters;
      if (ctx.heroLetters) {
        const lx = g('hero.lx'), lon = g('hero.lon'), glint = g('hero.glint');
        // H2-H4 (T3): letters.js poses every letter and the "4" from the intro clock (a pure function, so the input
        // fast-forward scrubs it); once it reports the rest frame, the scroll beats and the lean take over
        if (!ctx.heroDone) { const r = hero.intro(ctx.heroIntro); if (r.done) ctx.heroDone = true; }
        if (ctx.heroDone) for (let i = 0; i < 5; i++) {
          const o = ctx.heroL[i];
          const lean = HERO.leanDeg * DEG * lon * o.lean * clamp((lx - HERO.xn[i]) * 1.6, -1, 1);
          hero.set(i, { visible: o.visible, fold: o.fold, pose: o.pose, x: o.x, z: o.z, lift: o.lift, flutter: o.flutter, yaw: o.yaw + (i === 2 ? 0.5 * lean : lean),
            sheet: i === 2 ? { gain: 1 + 0.32 * glint } : undefined });
        }
        if (ctx.heroDone) hero.setFour(ctx.heroFour);
      }
    }

    /* the second instance */
    const bOn = g('B.on') > 0.5;
    B.object.visible = bOn;
    if (bOn) { placeScreen(B.object, 'B.'); push(B, { crumple: g('B.crumple'), bend: g('B.bend'), opacity: g('B.op') }); }

    /* outputs, numerals */
    applyOutputs();
    const N = props.numerals;
    N.mesh.visible = g('N.on') > 0.5 && g('N.op') > 0.003;
    if (N.mesh.visible) {
      const t = Math.tan(camera.fov * DEG / 2), d = A4.h / (0.30 * 2 * t);
      const w = 2 * d * t * size.aspect * (M ? 0.9 : 0.9375);
      stage.screenPlace(50, g('N.y'), 30, A4.h, 0, _pos);
      N.mesh.position.copy(_pos); N.mesh.quaternion.copy(camera.quaternion);
      N.mesh.scale.set(w, w / N.aspect, 1);
      N.mesh.material.opacity = g('N.op');
    }

    /* the ink drop */
    const drop = props.drop, pip = props.pipette, P = ctx.pip;
    if (drop.visible || P.on || g('ink.dropOn') > 0.5) stage.toScreen(A.object.position, _sc);   // the sheet's centre (px)
    const cxPct = (_sc.x / size.w) * 100, cyPct = (_sc.y / size.h) * 100, mmPct = g('A.size') / 297;   // % of the height per mm
    drop.visible = g('ink.dropOn') > 0.5;
    if (drop.visible) {
      // T14: it swells at the pipette's tip, then falls to the sheet's centre (where the front starts); no splash
      const k = g('ink.drop'), f = P.form, hang = P.y + (0.8 + 2.2 * f) * mmPct;
      stage.screenPlace(cxPct, lerp(hang, cyPct, k), g('A.size'), A4.h, 0.002, _pos);
      drop.position.copy(_pos);
      const sw = 0.35 + 0.65 * f;
      drop.scale.set(sw * (1 + 0.6 * smoothstep(0.9, 1, k)), k > 0.97 ? 0.35 : sw * 1.35, sw * (1 + 0.6 * smoothstep(0.9, 1, k)));
      drop.quaternion.copy(camera.quaternion);
    }
    if (pip) {
      pip.group.visible = P.on;
      if (P.on) {
        const kk = stage.screenPlace(cxPct, P.y, g('A.size'), A4.h, 0.004, _pos);
        pip.group.position.copy(_pos); pip.group.quaternion.copy(camera.quaternion); pip.group.rotateZ(-0.04);
        pip.group.scale.setScalar(kk); pip.setInk(P.ink);
      }
    }

    /* the Bleed (screen space) */
    const bl = props.bleed.material.uniforms;
    bl.uCov.value = g('ink.bleed'); bl.uAspect.value = size.aspect; bl.uFlat.value = ctx.reduce || ctx.bleedFlat ? 1 : 0;
    if (bl.uColor && bl.uDeep) {                     // T14: the hand-over starts in the sheet's lit ink, then deepens to the token
      const T = ctx.inkTok || (ctx.inkTok = { c: bl.uColor.value.clone(), d: bl.uDeep.value.clone() }), k = ctx.bleedTone;
      bl.uColor.value.set(lerp(0.196, T.c.x, k), lerp(0.18, T.c.y, k), lerp(0.412, T.c.z, k));
      bl.uDeep.value.set(lerp(0.18, T.d.x, k), lerp(0.18, T.d.y, k), lerp(0.322, T.d.z, k));
    }
    const I = ctx.ink, D = ctx.inkDom;
    D.on = aOn && g('ink.front') > 0.0005;
    if (D.on || (bl.uCenter && bl.uCov.value > 0.0005 && aOn)) {   // the front grows from where the drop landed, drifted toward the cursor
      stage.toScreen(A.object.localToWorld(_v.set(I.x, I.y, 0)), _sc);
      if (bl.uCenter) bl.uCenter.value.set(_sc.x / size.w, 1 - _sc.y / size.h);
      D.pxPerMm = (g('A.size') / 100) * size.h / 297; D.sx = _sc.x; D.sy = _sc.y;
      D.sr = I.rmax * (0.04 + 0.96 * Math.sqrt(I.t)) * D.pxPerMm;
    }
    D.cov = bl.uCov.value; D.aspect = size.aspect;
    if (bl.uCenter) { D.cx = bl.uCenter.value.x; D.cy = bl.uCenter.value.y; }
    if (bl.uSeed) D.seed = bl.uSeed.value;
    if (bl.uScale) D.scale = bl.uScale.value;

    /* floor print and contact blob (the placeholder's; the module draws its own contact shadows) */
    const pr = g('world.print');
    paper.setFloorPrint({ center: HF.center, width: HF.printW, opacity: pr, visible: pr > 0.002 });
    if (paper.contactBlob) {
      const y = A.object.position.y;
      paper.contactBlob(A.object.position.x, A.object.position.z, y, aOn ? g('world.shadow') * (g('A.world') > 0.5 ? 1 : 0) : 0);
    }

    /* lights */
    paper.lights.set(springs.lightList());
    /* s02 (T8): the bench under the edge-on sheet's bottom edge (where the sheet is at 1.6-2.2 vh), turned with the
       camera's yaw; the micrometer; the rack focus; the cursor's rim light on the 0.1 mm edge */
    const bo = ctx.bench;
    if (bench) {
      bench.object.visible = bo.on;
      ctx.dof.k = 0;
      if (bo.on) {
        stage.screenPlace(50, 50, 52, A4.h, 0, _bp);
        bench.object.position.set(_bp.x, _bp.y - A4.h / 2 - 0.3 * (1 - smooth(bo.rise)), _bp.z);
        bench.object.rotation.set(0, rig.yaw * DEG, 0);
        bench.micrometer.set({ open: bo.open, slide: bo.slide }); bench.micrometer.setReadout(bo.lcd);
        bench.object.updateMatrixWorld(true);
        if (ctx.dofK > 0.01) {
          _bf.copy(bench.focus.readout).lerp(_be.copy(bench.focus.edge), smooth(ctx.dofT));
          ctx.dof.focus.copy(bench.object.localToWorld(_bf)); ctx.dof.k = ctx.dofK;
        }
        if (paper.lights.raw) paper.lights.raw.shadowExtent = EXTENT_BENCH;
      }
    }
    /* s03 (T9/T10): the drafting board is the writing slope's mount: the sheet's writing pose (rx 35, without its ry 180
       turn), on the Bd.* springs, which track the same targets as the sheet's (s03 above); it rises in with the slope,
       carries the taped sheet through the coda, and drops away as the sheet exits */
    if (board) {
      board.object.visible = ctx.boardOn;
      if (ctx.boardOn) {
        const k = stage.screenPlace(g('Bd.x'), g('Bd.y'), g('Bd.size'), A4.h, 0, _bp);
        stage.screenQuat(35, 0, 0, _bq);
        board.object.position.copy(_bp); board.object.position.y -= 0.6 * (1 - ctx.boardRise);
        board.object.quaternion.copy(_bq); board.object.scale.setScalar(k);
      }
    }
    /* s12 (T24): the family portrait, camera-relative like the board: seen from 30 deg above, its 1.44 m span at about
       two thirds of the width; the spot slides to the chosen model; the ream riffles under the cursor */
    if (portrait) {
      const P = ctx.port, o = portrait.object;
      o.visible = P.on;
      if (P.on) {
        const pk = stage.screenPlace(50, P.y, 100, PORTRAIT.span, 0, _pp);  // pk < 1: the distance was clamped, so it scales
        stage.screenQuat(-28, 0, 0, _pq);                                   // the tops turned toward the camera: seen from 28 deg above
        o.position.copy(_pp); o.quaternion.copy(_pq); o.scale.setScalar(pk); o.updateMatrixWorld(true);
        const want = { base: 0, pro: 1, max: 2 }[E.size.model] ?? 0;
        P.sel = ctx.reduce ? want : P.sel + (want - P.sel) * (1 - Math.exp(-5 * Math.min(dt, 0.1)));
        // the cursor on the ream's front face, or within a few px of its top edge
        let target = 0;
        if (E.pointer.on && !ctx.reduce) {
          portrait.reamFront(_pf);
          const q = _pf.map((w) => { stage.toScreen(w, _psc); return [_psc.x, _psc.y]; });
          const mx = E.pointer.x, my = E.pointer.y;
          const inX = mx > Math.min(q[0][0], q[3][0]) - 6 && mx < Math.max(q[1][0], q[2][0]) + 6;
          const yTop = q[0][1] + ((q[1][1] - q[0][1]) * (mx - q[0][0])) / Math.max(1, q[1][0] - q[0][0]);
          const yBot = q[3][1] + ((q[2][1] - q[3][1]) * (mx - q[3][0])) / Math.max(1, q[2][0] - q[3][0]);
          if (inX && my > yTop - 16 && my < yBot + 6) target = 1;
        }
        const lam = target > P.rk ? 9 : 3;
        P.rk += (target - P.rk) * (1 - Math.exp(-lam * Math.min(dt, 0.1)));
        P.t += dt;
        portrait.set({ sel: P.sel, light: 1, riffle: P.rk, time: P.t });
        P.busy = Math.abs(want - P.sel) > 0.002 || P.rk > 0.003 || target > 0;
        for (let i = 0; i < 3; i++) { stage.toScreen(portrait.foot(i, _pv), _psc); P.dom[i].x = _psc.x; P.dom[i].y = _psc.y; }
        stage.toScreen(portrait.crown(2, _pv), _psc); P.hint.x = _psc.x; P.hint.y = _psc.y;
        portrait.reamFront(_pf); _pv.copy(_pf[0]).add(_pf[1]).add(_pf[2]).add(_pf[3]).multiplyScalar(0.25);
        stage.toScreen(_pv, _psc); P.ream.x = _psc.x; P.ream.y = _psc.y;          // the ream's front face (tests, hints)
      } else { P.busy = false; portrait.spot.intensity = 0; if (portrait.fill) portrait.fill.intensity = 0; }
    }
    /* s12: the lineup's deal. A new model (a click, or the passive preview) deals sheets in under the hero sheet, or plays
       the deal backwards; the stack sits behind the sheet, its +y running back, its long side along the sheet's */
    if (lineup) {
      const Lu = ctx.lineup, show = Lu.on && aOn;
      const N = { base: 1, pro: 80, max: 500 }, want = N[E.size.model] ? E.size.model : 'base';
      if (want !== Lu.model) {
        Lu.from = Math.round(Lu.count); Lu.to = N[want]; Lu.model = want; Lu.t = 0;
        Lu.dur = Lu.to > Lu.from ? (Lu.to - Lu.from > 100 ? 1.25 : 0.9) : 0.8;
      }
      if (!show || ctx.reduce) Lu.t = 1;                                // off screen or reduced motion: just the count
      if (Lu.t < 1) Lu.t = Math.min(1, Lu.t + Math.min(dt, 0.1) / Lu.dur);
      Lu.count = Lu.from + (Lu.to - Lu.from) * smooth(clamp((Lu.t - 0.03) / 0.92));
      const bt = Lu.model === 'pro' && Lu.t >= 1 ? 1 : 0;             // the binding draws on once the notebook has settled
      Lu.bind = ctx.reduce ? bt : Lu.bind + (bt - Lu.bind) * (1 - Math.exp(-(bt ? 2.6 : 6) * Math.min(dt, 0.1)));
      Lu.busy = show && (Lu.t < 1 || Math.abs(bt - Lu.bind) > 0.003);
      const vis = show && (Lu.count > 1.02 || Lu.t < 1);
      lineup.object.visible = vis;
      if (vis) {
        lineup.set({ from: Lu.from, to: Lu.to, t: Lu.t, bind: Lu.bind });
        const o = lineup.object, q = A.object.quaternion, sc = A.object.scale.x;
        o.quaternion.copy(q).multiply(_lq); o.scale.setScalar(sc);
        o.position.copy(A.object.position).add(_lv.set(0, 0, -0.00008 * sc).applyQuaternion(q));
      }
    }
    if (rim) {
      const on = ctx.rimOn * (E.pointer.on ? 1 : 0.35);
      rim.intensity = 0.9 * on;
      if (on > 0 && bench) {                                              // up the edge with the cursor's height
        const h = clamp(0.5 - 0.5 * E.pointer.ny) * A4.h;
        rim.position.copy(bench.object.localToWorld(_be.set(-0.035, h, 0.135)));
      }
    }
    if (hero && ctx.heroLetters) {                                     // the letters' light and contact window (restStage)
      paper.lights.aim(STAGE_H.aim);
      if (paper.contact) paper.contact.uniforms.uCS.value.z = STAGE_H.contactHalf;
      if (paper.lights.raw) paper.lights.raw.shadowExtent = STAGE_H.shadowExtent;
    } else {
      paper.lights.aim(aOn ? A.object.position : _v.set(0, STAGE.anchor.y, 0));
      if (paper.contact) paper.contact.uniforms.uCS.value.z = CONTACT0;
      if (paper.lights.raw && !(bench && bo.on)) paper.lights.raw.shadowExtent = EXTENT0;
    }
    paper.setUV(E.uv.k);                                             // s03 dark mode (T10): after setGround and lights.set
  }

  /** before the precompile: every output takes its form once, so a mesh the module builds on demand (the boat) exists
   *  when the loader compiles the materials, instead of compiling mid-scroll in s04 */
  function prime() {
    for (let i = 1; i < 8; i++) { const f = OUT_FORMS[i]; push(O[i - 1], { plane: f.plane || 0, boat: f.boat || 0, fan: f.fan || 0, curl: f.curl || null }); }
  }

  return { claim, apply, prime, ctx };
}
