// sheet-adapter.js: the ONE place that decides which paper system draws the sheet.
//
// Today: the placeholder (js/placeholder-paper.js), which mirrors the visual-designer's API.
// Phase 4: set DEFAULT to 'real' (or load with ?paper=real to try it now). Everything else in the site talks to
// the object returned here, so the swap is a one-line change. What the adapter guarantees on top of either system:
//   paper.createSheet(opts) → { object, set(state), piece(key), attachPaint(paint) }
//   paper.lights.set([[preset, w], …]).aim(vec3)        paper.update(scene, camera, dt)
//   paper.setFloorPrint({ center, width, opacity, visible })   paper.loadFloorPrint(url)
//   paper.createPaint() → { begin(u,v), to(u,v,pressure), end(), setEraser(on), bakedLine(from,to), hasInk, version }
//   paper.pick(sheet, raycaster) → { u, v } | null      (ray–plane in the sheet's frame: exact while it is flat)
//   paper.contactBlob(x, z, height, strength)          (no-op for the real module: it draws its own contact shadows)
import * as THREE from 'three';
import { FLAGS } from './config.js';

const DEFAULT = 'placeholder';

export async function createPaper(renderer, { tier = 2 } = {}) {
  const want = FLAGS.paper === 'real' ? 'real' : DEFAULT;
  if (want === 'real') {
    try {
      const m = await import('./paper/index.js');
      const sys = await m.createPaperSystem(renderer, { tier });
      return wrapReal(sys);
    } catch (e) {
      console.warn('[aviva] paper module unavailable, using the placeholder sheet:', e && e.message);
    }
  }
  const { createPlaceholderSystem } = await import('./placeholder-paper.js');
  const sys = await createPlaceholderSystem(renderer, { tier });
  return withCommon(sys);
}

const _inv = new THREE.Matrix4(), _ray = new THREE.Ray();
function withCommon(sys) {
  /** UV under a ray on a (near-)flat sheet: intersect the sheet's own z = 0 plane in its local frame */
  sys.pick = (sheet, raycaster) => {
    const o = sheet.object;
    if (!o.visible) return null;
    o.updateMatrixWorld(true);
    _inv.copy(o.matrixWorld).invert();
    _ray.copy(raycaster.ray).applyMatrix4(_inv);
    const dz = _ray.direction.z;
    if (Math.abs(dz) < 1e-6) return null;
    const t = -_ray.origin.z / dz;
    if (t < 0) return null;
    const x = _ray.origin.x + _ray.direction.x * t, y = _ray.origin.y + _ray.direction.y * t;
    const W = sheet.size ? sheet.size.w : 0.21, H = sheet.size ? sheet.size.h : 0.297;
    const u = x / W + 0.5, v = y / H + 0.5;
    if (u < 0 || u > 1 || v < 0 || v > 1) return null;
    return { u, v, face: dz < 0 ? 1 : -1 };
  };
  if (!sys.contactBlob) sys.contactBlob = () => {};
  return sys;
}

function wrapReal(sys) {
  // The real module has no paint layer yet (paint.js is still to come): use the placeholder's canvas pencil and
  // feed it to the sheet as an overlay texture.
  const origCreate = sys.createPaint ? sys.createPaint.bind(sys) : null;
  sys.kind = 'real';
  sys.createPaint = async () => {
    try { if (origCreate) return await origCreate(); } catch { /* fall through */ }
    const { PlaceholderPaint } = await import('./placeholder-paper.js');
    const p = new PlaceholderPaint();
    p.texture = new THREE.CanvasTexture(p.canvas);
    p.texture.colorSpace = THREE.SRGBColorSpace;
    return p;
  };
  const origSheet = sys.createSheet.bind(sys);
  sys.createSheet = (o = {}) => {
    const s = origSheet(o);
    const set = s.set.bind(s);
    s.set = (st) => {
      if (st && 'paint' in st && s._overlayPaint) {
        const tex = s._overlayPaint.texture; tex.needsUpdate = true;
        set({ ...st, overlay: st.paint ? { texture: tex, opacity: 1, face: st.paintFace ?? -1 } : null });
        return s;
      }
      return set(st);
    };
    const attach = s.attachPaint ? s.attachPaint.bind(s) : null;
    s.attachPaint = (p) => { if (p && p.canvas) s._overlayPaint = p; else if (attach) attach(p); };
    if (!s.size) s.size = { w: o.width || 0.21, h: o.height || 0.297 };
    return s;
  };
  return withCommon(sys);
}
