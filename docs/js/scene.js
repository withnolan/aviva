// scene.js: the renderer, the camera rig and the screen-space ↔ world helpers; render on demand; resize rules;
// context loss. One fixed full-screen canvas behind the DOM (CLAUDE.md rule 4).
//
// Camera rig: "keep this world point (anchor) at this screen position (sx %, sy %), this far away, at this pitch".
// The choreography blends two framings: the STAGE (a level camera on the floating sheet) and the FLOOR (the hero,
// looking down at −68° on the floor print). Everything else is placed in screen space relative to the live camera,
// so the brief's 2B numbers (x %, y %, size as % of the viewport height) hold at every aspect ratio.
import * as THREE from 'three';

export const DEG = Math.PI / 180;
export const A4 = { w: 0.21, h: 0.297 };
export const STAGE = { anchor: new THREE.Vector3(0, 0.42, 0), sx: 50, sy: 50, dist: 1.2 };

export function createStage(canvas, { tier = 2, onLost, onRestored } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, stencil: false, powerPreference: 'high-performance' });
  const maxDpr = [1, 1.5, 2][tier] ?? 2;                    // CLAUDE.md rule 5: 2 desktop, 1.5 mobile
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxDpr));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.autoClear = false;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#ECEBE7');
  const camera = new THREE.PerspectiveCamera(30, 1, 0.01, 60);
  const size = { w: 1, h: 1, aspect: 1, dpr: renderer.getPixelRatio() };

  const rig = { anchor: STAGE.anchor.clone(), sx: 50, sy: 50, dist: STAGE.dist, pitch: 0, yaw: 0, roll: 0, fov: 30 };
  const _e = new THREE.Euler(0, 0, 0, 'YXZ'), _p = new THREE.Vector3(), _q = new THREE.Quaternion();

  function applyRig() {
    if (camera.fov !== rig.fov) { camera.fov = rig.fov; camera.updateProjectionMatrix(); }
    _e.set(rig.pitch * DEG, rig.yaw * DEG, rig.roll * DEG, 'YXZ');
    camera.quaternion.setFromEuler(_e);
    const t = Math.tan(rig.fov * DEG / 2);
    _p.set(((rig.sx - 50) / 50) * t * size.aspect * rig.dist, ((50 - rig.sy) / 50) * t * rig.dist, -rig.dist);
    _p.applyQuaternion(camera.quaternion);
    camera.position.copy(rig.anchor).sub(_p);
    camera.updateMatrixWorld(true);
  }

  /** world position of a point shown at (x %, y %) whose depth makes a long side L metres project to sizePct % of
   *  the viewport height; dz moves it toward the camera along the same ray (the screen position does not change). */
  function screenToWorld(x, y, sizePct, L, dz, out) {
    const t = Math.tan(camera.fov * DEG / 2);
    const d = Math.max(0.02, L / (Math.max(0.5, sizePct) / 100 * 2 * t));
    const k = Math.max(0.02, d - (dz || 0)) / d;
    out.set(((x - 50) / 50) * t * size.aspect * d * k, ((50 - y) / 50) * t * d * k, -d * k);
    return out.applyMatrix4(camera.matrixWorld);
  }
  /** camera-relative orientation per brief 2B: rx > 0 tips the top edge away, ry > 0 turns the right edge away,
   *  rz rolls in plane. The tilt is about the screen's horizontal axis, applied last. */
  const _qa = new THREE.Quaternion(), _qb = new THREE.Quaternion(), _ax = new THREE.Vector3();
  function screenQuat(rx, ry, rz, out) {
    out.copy(camera.quaternion);
    _qa.setFromAxisAngle(_ax.set(1, 0, 0), -rx * DEG); out.multiply(_qa);
    _qb.setFromAxisAngle(_ax.set(0, 1, 0), ry * DEG); out.multiply(_qb);
    _qa.setFromAxisAngle(_ax.set(0, 0, 1), rz * DEG); out.multiply(_qa);
    return out;
  }
  /** world → CSS pixels (x right, y down) and depth; returns false when behind the camera */
  const _v = new THREE.Vector3();
  function toScreen(world, out) {
    _v.copy(world).project(camera);
    out.x = (_v.x * 0.5 + 0.5) * size.w; out.y = (-_v.y * 0.5 + 0.5) * size.h; out.z = _v.z;
    return _v.z < 1;
  }

  function resize(w, h) {
    size.w = w; size.h = h; size.aspect = w / h;
    renderer.setSize(w, h, false);
    camera.aspect = size.aspect; camera.updateProjectionMatrix();
    size.dpr = renderer.getPixelRatio();
  }

  const canvasEl = renderer.domElement;
  canvasEl.addEventListener('webglcontextlost', (e) => { e.preventDefault(); onLost && onLost(); }, false);
  canvasEl.addEventListener('webglcontextrestored', () => { onRestored && onRestored(); }, false);

  return { renderer, scene, camera, rig, size, applyRig, screenToWorld, screenQuat, toScreen, resize, maxDpr };
}

/** Hero framing (s01): the floor print spans `frac` of the viewport width; the sheet lands at (50 %, 55 %).
 *  Matches the module's lab hero (print 0.96 m wide, camera 1.18 m at 68° elevation) at 1440 × 900. */
export function heroFraming(aspect, fov = 30) {
  const t = (aspect - 0.6) / (1.3 - 0.6), k = Math.min(1, Math.max(0, t));
  const printW = 0.5 + (0.96 - 0.5) * k;                    // smaller print on portrait screens: the sheet still reads
  const wordW = printW * 2038.8 / 2201.9;                   // the word inside the print's viewBox (wordmark-metrics.json)
  const frac = 0.92 + (0.88 - 0.92) * k;
  const viewH = wordW / frac / aspect;
  const dist = viewH / (2 * Math.tan(fov * DEG / 2));
  return { printW, dist, sy: 55, center: [0, -0.01] };
}
