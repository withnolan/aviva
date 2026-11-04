// board.js: the s03 drafting board (brief 5.12, 11.1 row s03, T9): a pale grey laminate board, an aluminium parallel rule
// on fine cables, cream drafting tape at the sheet's corners, and an architect's lamp head entering at the top left.
//
//   const board = system.createDraftingBoard();   // { object, mount, lamp, rule, tape, materials, setRule(y), dispose() }
//   scene.add(board.object);
//   // the board's frame IS the sheet's mount: origin = the sheet's centre, the sheet in the local XY plane, +z = the side
//   // the camera sees. Give board.object the sheet's world position and its slope (s03: rx 35, the top away), WITHOUT
//   // the sheet's ry 180 turn; board.mount = { position, quaternion } is the sheet's pose in board space (identity).
//   board.setRule(-0.19);                          // the parallel rule's height on the board (m, board space)
//   board.materials                               // { laminate, aluminium, tape, enamel, cable }: T10's UV relight
//
// Cost: 5 draw calls (board, rule + clamps, tape, lamp enamel, cables), all with the key's shadow.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export const BOARD = { w: 0.74, h: 0.54, t: 0.022, gap: 0.0004, ruleY: -0.19, lamp: [-0.36, 0.36, 0.3] };
const clean = (g) => { const n = g.index ? g.toNonIndexed() : g; for (const k of Object.keys(n.attributes)) if (!['position', 'normal', 'uv'].includes(k)) n.deleteAttribute(k); return n; };
function box(w, h, d, x, y, z) { return clean(new THREE.BoxGeometry(w, h, d).translate(x, y, z)); }

function laminateTexture() {
  // a faint, even laminate grain: fine noise + a few soft scuffs; tiles over the board
  const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d');
  x.fillStyle = '#808080'; x.fillRect(0, 0, 256, 256);
  const img = x.getImageData(0, 0, 256, 256), d = img.data;
  for (let i = 0; i < d.length; i += 4) { const v = 128 + (Math.random() - 0.5) * 14; d[i] = d[i + 1] = d[i + 2] = v; }
  x.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(6, 4.4); t.colorSpace = THREE.NoColorSpace;
  return t;
}

export class DraftingBoard {
  constructor(sys, { tape = true, lamp = true } = {}) {
    this.sys = sys;
    this.object = new THREE.Group(); this.object.name = 'paper.board';
    this.mount = { position: new THREE.Vector3(), quaternion: new THREE.Quaternion() };
    const env = sys.environment;
    const B = BOARD, bump = laminateTexture();
    const M = this.materials = {
      laminate: new THREE.MeshPhysicalMaterial({ color: '#a9adb0', roughness: 0.62, clearcoat: 0.25, clearcoatRoughness: 0.5, bumpMap: bump, bumpScale: 0.25, envMapIntensity: 0.6 }),
      edge: new THREE.MeshStandardMaterial({ color: '#8d9092', roughness: 0.55 }),
      aluminium: new THREE.MeshPhysicalMaterial({ color: '#c3c7cb', metalness: 1, roughness: 0.34, envMapIntensity: 1.4 }),
      tape: new THREE.MeshStandardMaterial({ color: '#e4d6b2', roughness: 0.78, transparent: true, opacity: 0.94 }),
      enamel: new THREE.MeshPhysicalMaterial({ color: '#33363a', roughness: 0.36, metalness: 0.1, clearcoat: 0.6, clearcoatRoughness: 0.2 }),
      cable: new THREE.MeshStandardMaterial({ color: '#b9bdc1', metalness: 1, roughness: 0.3 }),
    };
    // the board: a laminate slab, its face just behind the sheet (z = -gap), with a darker edge band (2 materials, 1 mesh)
    const slab = new THREE.BoxGeometry(B.w, B.h, B.t).translate(0, 0.02, -B.gap - B.t / 2);
    this.board = new THREE.Mesh(slab, [M.edge, M.edge, M.edge, M.edge, M.laminate, M.edge]); this.board.name = 'board.slab';
    // the parallel rule: an aluminium bar with a bevelled working edge and two end clamps
    const rule = mergeGeometries([box(B.w - 0.03, 0.034, 0.008, 0, 0, 0.004), box(B.w - 0.03, 0.004, 0.003, 0, 0.018, 0.0015),
      box(0.03, 0.044, 0.014, -(B.w / 2 - 0.02), 0, 0.007), box(0.03, 0.044, 0.014, B.w / 2 - 0.02, 0, 0.007)]);
    this.rule = new THREE.Mesh(rule, M.aluminium); this.rule.name = 'board.rule';
    // the cables: two fine steel lines down the board's sides that guide the rule
    const cab = mergeGeometries([0, 1].map((s) => clean(new THREE.CylinderGeometry(0.0006, 0.0006, B.h - 0.03, 6).translate((s ? 1 : -1) * (B.w / 2 - 0.012), 0.02, 0.0015))));
    this.cables = new THREE.Mesh(cab, M.cable);
    // drafting tape: four cream strips across the sheet's corners at 45 deg (0.15 mm proud of the sheet)
    const tapes = [];
    for (const [sx, sy] of [[-1, 1], [1, 1], [-1, -1], [1, -1]]) {
      const g = new THREE.BoxGeometry(0.05, 0.019, 0.00015).rotateZ(sx * sy * Math.PI / 4).translate(sx * 0.098, sy * 0.1395, 0.00025);
      tapes.push(clean(g));
    }
    this.tape = new THREE.Mesh(mergeGeometries(tapes), M.tape); this.tape.name = 'board.tape'; this.tape.visible = tape;
    // the architect's lamp: a graphite-enamel shade and its arm, entering at the top left, aimed at the sheet
    const shade = new THREE.LatheGeometry([0.006, 0.03, 0.05, 0.072, 0.075].map((r, i) => new THREE.Vector2(r, -i * 0.024)), 32);
    const head = mergeGeometries([clean(shade), clean(new THREE.CylinderGeometry(0.014, 0.014, 0.03, 16).translate(0, 0.02, 0)),
      clean(new THREE.CylinderGeometry(0.005, 0.005, 0.32, 8).rotateZ(0.9).translate(-0.12, 0.13, 0))]);
    M.enamel.side = THREE.DoubleSide;
    this.lamp = new THREE.Mesh(head, M.enamel); this.lamp.name = 'board.lamp'; this.lamp.visible = lamp;
    this.lamp.position.set(...B.lamp); this.lamp.lookAt(new THREE.Vector3(0, 0, 0)); this.lamp.rotateX(-Math.PI / 2);
    this.object.add(this.board, this.rule, this.cables, this.tape, this.lamp);
    this.object.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    this.tape.castShadow = false; this.lamp.castShadow = false;   // the lamp is the light: its head never shadows the sheet
    this.setRule(B.ruleY);
    // dark mode (T10): the UV tube across the top, its violet light, and the sheet's fluorescent halo on the board
    const soft = (w, h, inner) => {   // a soft-edged rectangle mask (white centre, transparent rim)
      const c = document.createElement('canvas'); c.width = 256; c.height = 256; const x = c.getContext('2d');
      x.filter = 'blur(' + Math.round(inner * 256 * 0.7) + 'px)'; x.fillStyle = '#fff';
      const m = inner * 256 * 2.2; x.fillRect(m, m, 256 - 2 * m, 256 - 2 * m);
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.NoColorSpace; return t;
    };
    const add = (tex, col) => new THREE.MeshBasicMaterial({ map: tex, color: col, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, opacity: 0 });
    this.halo = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.5), add(soft(1, 1, 0.12), new THREE.Color(0.35, 0.55, 1.4)));
    this.halo.position.set(0, 0, -0.0002); this.halo.renderOrder = 2;
    this.tube = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.62, 16).rotateZ(Math.PI / 2), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.62, 0.34, 1.0), toneMapped: false }));
    this.tube.position.set(0, 0.3, 0.07);
    const caps = new THREE.Mesh(mergeGeometries([-1, 1].map((s) => clean(new THREE.CylinderGeometry(0.008, 0.008, 0.03, 16).rotateZ(Math.PI / 2).translate(s * 0.325, 0, 0)))), M.enamel);
    this.tube.add(caps);
    this.tubeGlow = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.12), add(soft(1, 1, 0.22), new THREE.Color(0.45, 0.2, 1.1)));
    this.tubeGlow.position.set(0, 0.3, 0.078); this.tubeGlow.renderOrder = 3;
    this.uvLight = new THREE.SpotLight(new THREE.Color('#8a5cff'), 0, 0, 1.3, 1, 2);
    this.uvLight.position.set(0, 0.3, 0.12); this.uvLight.target.position.set(0, -0.05, 0);
    this.object.add(this.halo, this.tube, this.tubeGlow, this.uvLight, this.uvLight.target);
    this.tube.visible = this.tubeGlow.visible = this.halo.visible = false;
  }
  /** s03 dark mode (system.setUV calls it): the board and props go dim violet; the tape keeps a faint glow (paper) */
  setUV(k = 0) {
    const V = new THREE.Color('#4a2c8a');
    if (!this._base) this._base = Object.fromEntries(Object.entries(this.materials).map(([n, m]) => [n, m.color.clone()]));
    for (const [n, m] of Object.entries(this.materials)) m.color.copy(this._base[n]).lerp(V, k * (n === 'tape' ? 0.6 : 0.85));
    this.halo.material.opacity = k * 0.55; this.tubeGlow.material.opacity = k * 0.8;
    this.halo.visible = this.tube.visible = this.tubeGlow.visible = k > 0.002;
    this.uvLight.intensity = k * 0.5;   // the tube's violet light on the board, the rule and the tape
    return this;
  }
  /** the parallel rule's height on the board (board space, m; below the sheet's bottom edge at -0.1485 by default) */
  setRule(y) { this.rule.position.set(0, y, 0); return this; }
  dispose() { this.object.traverse((o) => { if (o.isMesh) o.geometry.dispose(); }); for (const m of Object.values(this.materials)) m.dispose(); this.object.removeFromParent(); }
}
