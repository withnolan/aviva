// choreo.js: brief Part 2B as code. Each section claims a pose for the camera, the lights and the sheet(s) from
// its own progress p (viewport heights into the section); state.js blends the claims; springs damp them; apply()
// turns them into the scene. Screen-space poses (x %, y %, size = projected long side in % of the viewport height,
// rx/ry/rz in degrees) are resolved against the live camera, so the sheet stays exactly where the brief puts it.
import * as THREE from 'three';
import { kf, seg, clamp, lerp, smooth, smoothstep, ease } from './util.js';
import { E, INTRO } from './events.js';
import { DEG, A4, STAGE, heroFraming } from './scene.js';

const FLOOR_ANCHOR = new THREE.Vector3(0, 0, 0);
export const SIZE_SCALE = { A5: Math.SQRT1_2, A4: 1, A3: Math.SQRT2 };
const STUDIO = new THREE.Color('#ECEBE7'), INK = new THREE.Color('#1F1B6E');
const LOOPED = new Set(['s04', 's08']);           // sections with time-based motion (sway, breathing)

/** horizontal pitch of the drying-line outputs, in % of the viewport width (brief 2B, design system §10) */
export function outputSpacing(w) { return w <= 600 ? 74 : w <= 1024 ? 40 : 26; }

export function createChoreo({ stage, paper, state, springs, props, sheets }) {
  const { camera, rig, size } = stage;
  const { A, B, F, O, hero = null } = sheets;  // the product, second instance, falling output 1, outputs 2–8, the letters (letters.js)
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
      S.light('letters', 1 - k); S.light('s02', k);
      S.setEnum('A.gen', 'h' + (E.regen.gen || 0));
    },
    s03(S, p) {
      const M = ctx.M, inn = seg(p, 0, 0.8), out = seg(p, 5, 6);
      S.set('cam.pitch', -12 * inn * (1 - out));
      const R = E.regen;
      const y = M ? kf(p, [[0, 50], [0.8, 47], [5, 47], [5.6, 34], [6, -28]]) : kf(p, [[0, 50], [0.8, 57], [5, 57], [5.6, 38], [6, -25]]);
      const sz = M ? kf(p, [[0, 52], [0.8, 32], [5, 32], [5.6, 24]]) : kf(p, [[0, 52], [0.8, 46], [5, 46], [5.6, 30]]);
      S.many('A.', { on: R.hidden ? 0 : 1, op: R.fade, x: 50 - 60 * R.roll, y: y - 70 * (1 - R.drop) + 8 * R.roll, size: sz,
        rx: kf(p, [[0, 0], [0.8, 35], [5, 35], [5.6, 0]]) + 60 * R.roll, ry: 180, rz: 160 * R.roll, crumple: R.crumple,
        flutter: ctx.reduce ? 0 : 0.006 * (R.drop < 1 ? 1 : 0), paint: 1, curl: ctx.reduce ? 0 : E.think.curl });
      S.setEnum('A.paintFace', -1); S.setEnum('A.curlCorner', 'tr');
      S.set('bg.warm', inn * (1 - out));
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
      S.set('ink.dropOn', p > 2.12 && p < 2.62 && !R ? 1 : 0);
      S.set('ink.drop', seg(p, 2.15, 2.4, ease.in));
      S.set('ink.front', p < 4.0 ? front : 1 - seg(p, 4.1, 4.4));
      S.set('ink.grade', seg(p, 2.4, 2.55) * (1 - seg(p, 4.0, 4.1)));
      const bleed = p < 3.4 || p >= 3.97 ? 0 : (R ? 0 : 0.4 + 0.55 * seg(p, 3.4, 3.9, ease.linear));
      S.set('ink.bleed', bleed);
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
      const rise = seg(p, 2.4, 3.3), exit = seg(p, 3.4, 4);
      S.many('A.', { on: 1, op: 1, x: lerp(M ? 50 : 62, 50, rise), y: lerp(lerp(M ? 64 : 52, 20, rise), -32, exit), size: lerp(M ? 26 : 44, 26, rise),
        rx: -8 * (1 - rise), ry: 0, rz: 0, scale: lerp(SIZE_SCALE[choice], 1, rise), dot: 1, creaseDog: E.cues.dogEarSeen ? 1 : 0 });
      ctx.sizeChoice = choice;
      S.setEnum('D.mode', rise < 0.2 ? 'size' : 'none');
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
    ctx.heroLetters = false;
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
  function apply() {
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
      const creases = [];
      if (g('A.creaseMid') > 0.5) creases.push(MID_CREASE[0]);
      if (g('A.creaseDog') > 0.5) creases.push(DOG_CREASE);
      push(A, {
        opacity: g('A.op'), bend: g('A.bend'), flutter: g('A.flutter'), peel: g('A.peel'), dogEar: g('A.dogEar'), halving: g('A.halving'),
        plane: g('A.plane'), crumple: g('A.crumple'), showThrough: g('A.show'), translucency: g('A.trans'), watermark: g('A.wm'),
        map: g('A.map'), inkDot: g('A.dot'), macro: g('A.macro'), paint: g('A.paint') > 0.5, paintFace: state.enum('A.paintFace'),
        curl: g('A.curl') > 0.001 ? { corner: state.enum('A.curlCorner'), t: g('A.curl'), r: 0.015, deg: 25, size: 0.06 } : null,
        bleed: front > 0.0005 ? { t: front, at: [0, 0], radiusMM: 9, amount: 1, grade: g('ink.grade') } : null,
        creases: creases.length ? creases : null,
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
    const drop = props.drop;
    drop.visible = g('ink.dropOn') > 0.5;
    if (drop.visible) {
      const k = g('ink.drop');
      stage.screenPlace(50, lerp(-8, 50, k), g('A.size'), A4.h, 0.002, _pos);
      drop.position.copy(_pos);
      drop.scale.set(1 + 0.6 * smoothstep(0.9, 1, k), k > 0.97 ? 0.35 : 1.35, 1 + 0.6 * smoothstep(0.9, 1, k));
      drop.quaternion.copy(camera.quaternion);
    }

    /* the Bleed (screen space) */
    const bl = props.bleed.material.uniforms;
    bl.uCov.value = g('ink.bleed'); bl.uAspect.value = size.aspect; bl.uFlat.value = ctx.reduce ? 1 : 0;
    if (bl.uCenter && bl.uCov.value > 0.0005 && aOn) {          // the front grows from where the drop landed: the sheet's centre
      stage.toScreen(A.object.position, _sc); bl.uCenter.value.set(_sc.x / size.w, 1 - _sc.y / size.h);
    }

    /* floor print and contact blob (the placeholder's; the module draws its own contact shadows) */
    const pr = g('world.print');
    paper.setFloorPrint({ center: HF.center, width: HF.printW, opacity: pr, visible: pr > 0.002 });
    if (paper.contactBlob) {
      const y = A.object.position.y;
      paper.contactBlob(A.object.position.x, A.object.position.z, y, aOn ? g('world.shadow') * (g('A.world') > 0.5 ? 1 : 0) : 0);
    }

    /* lights */
    paper.lights.set(springs.lightList());
    if (hero && ctx.heroLetters) {                                     // the letters' light and contact window (restStage)
      paper.lights.aim(STAGE_H.aim);
      if (paper.contact) paper.contact.uniforms.uCS.value.z = STAGE_H.contactHalf;
      if (paper.lights.raw) paper.lights.raw.shadowExtent = STAGE_H.shadowExtent;
    } else {
      paper.lights.aim(aOn ? A.object.position : _v.set(0, STAGE.anchor.y, 0));
      if (paper.contact) paper.contact.uniforms.uCS.value.z = CONTACT0;
      if (paper.lights.raw) paper.lights.raw.shadowExtent = EXTENT0;
    }
  }

  /** before the precompile: every output takes its form once, so a mesh the module builds on demand (the boat) exists
   *  when the loader compiles the materials, instead of compiling mid-scroll in s04 */
  function prime() {
    for (let i = 1; i < 8; i++) { const f = OUT_FORMS[i]; push(O[i - 1], { plane: f.plane || 0, boat: f.boat || 0, fan: f.fan || 0, curl: f.curl || null }); }
  }

  return { claim, apply, prime, ctx };
}
