// studio.js: a white-cyclorama lighting environment for PMREM: big soft boxes with HDR values, so a white sheet gets gentle gradients.
import * as THREE from 'three';
export function makeStudioEnvironment() {
  const s = new THREE.Scene();
  const box = new THREE.Mesh(new THREE.BoxGeometry(20, 12, 20), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.55, 0.55, 0.56), side: THREE.BackSide })); box.position.y = 5; s.add(box);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.9, 0.9, 0.88) })); floor.rotation.x = -Math.PI / 2; floor.position.y = -0.9; s.add(floor);  // white floor bounce
  const lamp = (w, h, pos, look, intensity, tint = [1, 1, 1]) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(tint[0] * intensity, tint[1] * intensity, tint[2] * intensity), side: THREE.DoubleSide })); m.position.set(...pos); m.lookAt(...look); s.add(m); };
  lamp(8, 5, [-6, 7, 4], [0, 0, 0], 6.0, [1, .97, .93]);     // big key softbox, top left front
  lamp(3, 8, [8, 4, 2], [0, 0, 0], 2.2, [.92, .96, 1]);      // cool strip right
  lamp(10, 3, [0, 9.5, -6], [0, 0, 0], 3.0);                  // rim / top-back
  lamp(6, 6, [0, 10, 0], [0, 0, 0], 1.2);                     // overhead fill
  return s;
}
