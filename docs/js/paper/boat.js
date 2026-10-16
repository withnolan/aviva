// boat.js: the paper boat (drying-line card 4, "Something about the sea."), the classic boat folded from one A4 sheet.
// Its last step ("open the base") is not a hinge fold, so the finished form is a hand-modelled mesh: flat facets with
// crisp creases, in the same paper material (variant 'static': rest-space uv for the tooth and formation, both faces
// lit, light through the paper). ~40 triangles. Sheet.set({ boat: 1 }) swaps it in (see sheet.js); boatGeometry()
// is exported for anyone who wants the bare mesh.
//
// Frame (metres): length along x (bow -x, stern +x), up +y, beam along z. The sail's peak is at (0, PEAK, 0); the
// sheet places the mesh so the peak hangs at the sheet's top centre (where the drying-line clip holds a card).
import * as THREE from 'three';

export const BOAT = { length: 0.142, peak: 0.075, beam: 0.044 };

/** the boat as a non-indexed geometry (one normal per facet: the creases stay sharp) with an aRest attribute */
export function boatGeometry() {
  const L = BOAT.length / 2;
  // hull stations (port side, z >= 0); starboard mirrors them
  const tipB = [-L, 0.040, 0], tipS = [L, 0.040, 0];                 // bow and stern points, raised
  const gB = [-0.033, 0.026, 0.021], gS = [0.033, 0.026, 0.021];     // the gunwale, where the pocket opens
  const gM = [0, 0.024, 0.022];
  const bB = [-0.047, 0.0, 0.007], bS = [0.047, 0.0, 0.007], bM = [0, -0.002, 0.008];   // the bottom edge of the side
  const sB = [-0.036, 0.022, 0.0012], sS = [0.036, 0.022, 0.0012], peak = [0, BOAT.peak, 0];   // the sail (two layers)
  const tris = [];
  const mir = (p) => [p[0], p[1], -p[2]];
  const side = (flip) => {
    const m = flip ? mir : (p) => p;
    const T = (a, b, c) => tris.push(flip ? [m(a), m(c), m(b)] : [m(a), m(b), m(c)]);
    T(tipB, bB, gB); T(gB, bB, bM); T(gB, bM, gM); T(gM, bM, gS); T(gS, bM, bS); T(gS, bS, tipS);   // the hull side
    T(gB, gM, sB); T(gM, sS, sB); T(gM, gS, sS);                                                      // the pocket's inner wall
    T(tipB, gB, sB); T(sS, gS, tipS);                                                                 // the folded-in ends
    T(sB, sS, peak);                                                                                   // one layer of the sail
  };
  side(false); side(true);
  // the bottom: a narrow flat strip between the two sides, closed at the ends
  const bB2 = mir(bB), bS2 = mir(bS), bM2 = mir(bM);
  tris.push([bB, bB2, bM2], [bB, bM2, bM], [bM, bM2, bS2], [bM, bS2, bS], [tipB, bB2, bB], [tipS, bS, bS2]);
  const pos = new Float32Array(tris.length * 9), rest = new Float32Array(tris.length * 6);
  tris.forEach((t, i) => t.forEach((p, k) => {
    pos.set(p, i * 9 + k * 3);
    // a plausible unfolding for the paper texture: x and y scaled into the A4 rest frame, z adds a little shear
    rest[i * 6 + k * 2] = p[0] * 1.35 + p[2] * 0.6; rest[i * 6 + k * 2 + 1] = (p[1] - 0.035) * 1.9 + p[2] * 0.4;
  }));
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('aRest', new THREE.BufferAttribute(rest, 2));
  g.computeVertexNormals();                                          // non-indexed: one normal per facet
  g.computeBoundingSphere();
  return g;
}
