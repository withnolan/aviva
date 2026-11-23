// portrait.js (T24): the s12 family portrait (brief 11.1 row s12, 11.3; decision #28). Three low graphite plinths,
// 400 × 400 × 120 mm, 120 mm apart, each with a brass nameplate, carrying the three models at true thickness: AVIVA
// (1 sheet, 0.1 mm), AVIVA Notebook Pro (80, ≈ 8 mm) and AVIVA Ream Pro Max (500, ≈ 5 cm), from the paper module's
// stack.js. A soft spot picks out the model chosen in the print dialog (it slides between the plinths); the ream's top
// sheets riffle when the cursor runs along its front edge. Nothing glows (decision #28): the spot is just light.
//
//   const P = createPortrait({ sys, names });   scene.add(P.object)
//   choreo places P.object (camera-relative, like the drafting board) and calls P.set({ sel, riffle, time })
// Local frame: y up, the plinth tops at y = 0, the middle plinth at x = 0, the fronts facing +z.
import * as THREE from 'three';

const PL = { w: 0.4, h: 0.12, d: 0.4, gap: 0.12 };
const SHEET = { w: 0.21, h: 0.297, t: 0.0001 };
export const PORTRAIT = { span: 3 * PL.w + 2 * PL.gap, plinth: PL, counts: [1, 80, 500] };
const X = (i) => (i - 1) * (PL.w + PL.gap);

function plateTexture(text) {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 160;
  const x = c.getContext('2d');
  x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height);              // multiplies the brass: white = bare brass
  x.fillStyle = '#4a3a22';                                                // the engraving: a darker, duller brass
  x.font = '500 56px "Hanken Grotesk", "Helvetica Neue", Arial, sans-serif';
  x.textAlign = 'center'; x.textBaseline = 'middle';
  if ('letterSpacing' in x) x.letterSpacing = '10px';
  x.fillText(text.toUpperCase(), c.width / 2, c.height / 2 + 2);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
}
function shadowTexture() {      // three soft footprints under the plinths
  const c = document.createElement('canvas'); c.width = 1024; c.height = 320;
  const x = c.getContext('2d'), k = c.width / (PORTRAIT.span + 0.5);
  x.filter = 'blur(22px)'; x.fillStyle = 'rgba(0,0,0,0.9)';
  for (let i = 0; i < 3; i++) { const cx = c.width / 2 + X(i) * k; x.fillRect(cx - (PL.w / 2) * k, c.height / 2 - (PL.d / 2) * k * 0.92, PL.w * k, PL.d * k * 0.92); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.NoColorSpace;
  return t;
}

export function createPortrait({ sys, names = ['AVIVA', 'AVIVA Notebook Pro', 'AVIVA Ream Pro Max'] }) {
  if (!sys || !sys.createStack || !sys.createSheet) return null;
  const object = new THREE.Group(); object.name = 'portrait'; object.visible = false;
  const body = new THREE.MeshStandardMaterial({ color: '#3a3936', roughness: 0.9, metalness: 0 });
  const top = new THREE.MeshStandardMaterial({ color: '#44433f', roughness: 0.82, metalness: 0 });
  const brass = new THREE.MeshPhysicalMaterial({ color: '#c09a5e', metalness: 1, roughness: 0.36, clearcoat: 0.3, clearcoatRoughness: 0.4 });
  const stacks = [], plates = [];
  for (let i = 0; i < 3; i++) {
    const x = X(i);
    // the plinth: a matte graphite body with a slightly lighter top plate, set in by 2 mm (a fine shadow line)
    const b = new THREE.Mesh(new THREE.BoxGeometry(PL.w, PL.h - 0.008, PL.d), body); b.position.set(x, -PL.h / 2 - 0.004, 0);
    const t = new THREE.Mesh(new THREE.BoxGeometry(PL.w - 0.004, 0.008, PL.d - 0.004), top); t.position.set(x, -0.004, 0);
    // the brass nameplate on its front, engraved with the model's name
    const pm = brass.clone(); pm.map = plateTexture(names[i]);
    const plate = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.027, 0.002), [brass, brass, brass, brass, pm, brass]);
    plate.position.set(x, -0.062, PL.d / 2 + 0.001);
    for (const m of [b, t]) { m.castShadow = true; m.receiveShadow = true; }
    object.add(b, t, plate); plates.push(plate);
    // the stack, at true thickness, its long side running back
    const s = sys.createStack({ max: PORTRAIT.counts[i], fly: 1, seed: 17 + 11 * i, name: 'portrait' + i });
    s.set({ count: PORTRAIT.counts[i] });
    s.object.position.set(x, 0.00005, 0);
    object.add(s.object); stacks.push(s);
  }
  // the riffle: the ream's top sheet and two more above it lift their front edges under the cursor
  const ream = stacks[2], riffle = [ream.topSheet];
  for (let j = 1; j < 3; j++) {
    const sh = sys.createSheet({ name: 'portrait.riffle' + j, width: SHEET.w, height: SHEET.h, seed: 61 + j });
    sh.object.rotation.x = -Math.PI / 2;
    sh.object.position.y = ream.height + SHEET.t * (j - 0.5);
    sh.set({ rest: 0.18, cockle: 0.0002 });
    ream.object.add(sh.object); riffle.push(sh);
  }
  // soft footprints, and the spot that picks out the chosen model
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(PORTRAIT.span + 0.5, (PORTRAIT.span + 0.5) * 320 / 1024),
    new THREE.MeshBasicMaterial({ color: '#000000', alphaMap: shadowTexture(), transparent: true, opacity: 0.32, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2; shadow.position.y = -PL.h - 0.0006; shadow.renderOrder = -1;
  const spot = new THREE.SpotLight('#fff4e6', 0, 0, 0.19, 0.9, 0);   // a soft pool round the chosen stack; no falloff (the group scales)
  spot.position.set(0, 1.05, 0.55); spot.target.position.set(0, 0, 0);
  // an even overhead fill, so every stack reads as white paper; the spot only lifts the chosen one a little
  const fill = new THREE.DirectionalLight('#ffffff', 0); fill.position.set(-0.5, 1.6, 1.1); fill.target.position.set(0, 0, 0);
  object.add(shadow, spot, spot.target, fill, fill.target);

  const _v = new THREE.Vector3();
  let sel = 1, lastRiffle = -1;
  return {
    object, stacks, riffle, spot, fill, plates,
    /** sel: the chosen model as a float 0..2 (damped by the caller); light: 0..1; riffle: 0..1; time (s) */
    set({ sel: s = sel, light = 1, riffle: k = 0, time = 0 } = {}) {
      sel = s;
      const x = X(0) + (PL.w + PL.gap) * s;
      spot.position.x = x; spot.target.position.x = x; spot.intensity = 2.4 * light; fill.intensity = 1.25 * light;
      if (k > 0.002 || lastRiffle > 0.002) {
        riffle.forEach((sh, j) => {
          const a = k * (0.95 - 0.27 * j) + 0.05 * k * Math.sin(time * 9 + j * 1.7);   // the top sheet lifts most
          // a lying sheet (rest 0.18) only lifts its edge's middle a few mm: riffled, the top sheets are free (rest 1)
          const free = 0.18 + 0.82 * Math.min(1, k * 4);
          sh.set({ rest: free, curl: a > 0.003 ? { edge: 'bottom', at: 0.13 + 0.03 * j, r: 0.012, angle: a, toward: 1 } : null });
        });
      }
      lastRiffle = k;
    },
    /** world positions: plinth i's bottom front centre (its caption hangs below it), stack i's top back centre */
    foot(i, out = new THREE.Vector3()) { return object.localToWorld(out.set(X(i), -PL.h, PL.d / 2)); },
    crown(i, out = new THREE.Vector3()) { return object.localToWorld(out.set(X(i), stacks[i].height, -SHEET.h / 2)); },
    /** stack i's top front right corner */
    corner(i, out = new THREE.Vector3()) { return object.localToWorld(out.set(X(i) + SHEET.w / 2, stacks[i].height + 0.0001, SHEET.h / 2)); },
    /** the ream's front face, as world points: top left, top right, bottom right, bottom left */
    reamFront(P) {
      const h = stacks[2].height, x = X(2), z = SHEET.h / 2;
      P[0].copy(object.localToWorld(_v.set(x - SHEET.w / 2, h, z))); P[1].copy(object.localToWorld(_v.set(x + SHEET.w / 2, h, z)));
      P[2].copy(object.localToWorld(_v.set(x + SHEET.w / 2, 0, z))); P[3].copy(object.localToWorld(_v.set(x - SHEET.w / 2, 0, z)));
      return P;
    },
  };
}

/**
 * The lineup's growing stack (brief 2B s12, 0-2.4 vh; decision #28): behind the hero sheet, which stays its live top
 * sheet. Choosing Notebook Pro deals 79 sheets in (≈ 0.9 s) and a hairline graphite binding draws on along the left
 * edge; Ream Pro Max deals 420 more (≈ 1.25 s, faster) and the binding fades; AVIVA plays the deal backwards, so the
 * sheets fly back out the way they came. choreo places it each frame (its +y runs back from the hero sheet).
 */
export function createLineup({ sys }) {
  if (!sys || !sys.createStack) return null;
  const stack = sys.createStack({ max: 500, fly: 24, seed: 5, name: 'lineup' });
  stack.topSheet.set({ visible: false });                  // the hero sheet is the top of this stack
  const bind = new THREE.Mesh(new THREE.BoxGeometry(0.0014, 1, SHEET.h), new THREE.MeshStandardMaterial({ color: '#2f2e2b', roughness: 0.7, transparent: true, opacity: 0 }));
  bind.position.x = -SHEET.w / 2 - 0.0002;
  stack.object.add(bind); stack.object.visible = false;
  return {
    stack, object: stack.object,
    /** fan progress from `from` to `to` sheets (a deal down plays the deal up backwards); bind 0..1 draws the binding on */
    set({ from, to, t, bind: b = 0 }) {
      if (to >= from) stack.set({ fan: t, from, to }); else stack.set({ fan: 1 - t, from: to, to: from });
      const h = Math.max(0, stack.height - SHEET.t);         // the block under the (hidden) top sheet
      bind.visible = b > 0.002 && h > 0.0005;
      bind.scale.set(1, Math.max(h, 1e-5), Math.max(0.001, b)); bind.position.set(-SHEET.w / 2 - 0.0002, h / 2, (SHEET.h / 2) * (1 - b));
      bind.material.opacity = Math.min(1, b * 1.4);
      return stack.height;
    },
  };
}
