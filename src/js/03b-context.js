// ---------- neutral surroundings: generic open concrete yard (no real site) ----------
// Mapped from Esri World Imagery + OpenStreetMap. Scene axes: +x = north, +z = east, 1 unit = 1 m.

// gabled shed; ridge along 'x' or 'z'; prism caps (gable ends) take the wall material, slopes the roof
function gable(o) {
  const p = o.parent || scene, cast = !!o.cast, ov = .35, mats = [o.wall, o.roof];
  B(o.x0, o.x1, 0, o.eave, o.z0, o.z1, o.wall, p, { cast });
  if (o.along === 'z') {
    const xm = (o.x0 + o.x1) / 2;
    prism([[o.x0 - ov, o.eave - .2], [o.x1 + ov, o.eave - .2], [xm, o.ridge]], o.z0, o.z1, mats, p, { cast });
  } else {
    const zm = (o.z0 + o.z1) / 2;
    const m = prism([[-o.z1 - ov, o.eave - .2], [-o.z0 + ov, o.eave - .2], [-zm, o.ridge]], o.x0, o.x1, mats, p, { cast });
    m.rotation.y = Math.PI / 2;
  }
}
// cylinder between two points
const _up = new THREE.Vector3(0, 1, 0);
function rod(p, a, b, r, mat) {
  const d = new THREE.Vector3().subVectors(b, a), L = d.length();
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, L, 6), mat);
  m.position.copy(a).addScaledVector(d, .5); m.quaternion.setFromUnitVectors(_up, d.normalize()); m.castShadow = true; p.add(m); return m;
}
// galvanised triangular lattice floodlight mast head aimed at (tx, tz)
function latticeMast(p, x, z, h, tx, tz) {
  const g = new THREE.Group(); g.position.set(x, 0, z); p.add(g);
  const galv = M(0xaab0b4, .45, .8), legs = [];
  for (let i = 0; i < 3; i++) { const a = i * 2.094 + .3; legs.push([Math.cos(a), Math.sin(a)]); }
  const P = (i, y) => { const r = .55 - .3 * y / h; return new THREE.Vector3(legs[i][0] * r, y, legs[i][1] * r); };
  for (let i = 0; i < 3; i++) rod(g, P(i, 0), P(i, h), .045, galv);
  for (let y = 0, k = 0; y < h - .5; y += 1.1, k++) for (let i = 0; i < 3; i++) rod(g, P(i, y), P((i + 1) % 3, y + 1.1), .018, galv);
  B(-.7, .7, h, h + .12, -.7, .7, galv, g);
  const head = new THREE.Group(); head.position.y = h + .9; head.rotation.y = Math.atan2(tx - x, tz - z); g.add(head);
  B(-1.3, 1.3, -.05, .05, -.05, .05, galv, head);
  const lamp = M(0x2b2f34, .5, .5), lens = glowM(0xd8dde0, 0xfff1d6, 0, 3);
  for (const lx of [-.9, -.3, .3, .9]) for (const ly of [.45, -.45]) {
    const L = new THREE.Group(); L.position.set(lx, ly, .1); L.rotation.x = .55; head.add(L);
    B(-.24, .24, -.18, .18, -.1, .12, lamp, L); B(-.2, .2, -.14, .14, .12, .13, lens, L, { cast: false });
  }
  halo(head, 0, 0, .4, 0xfff1d6, 4.5, .55);
  const s = spot(g, 0, h + .6, 0, (tx - x) * .9, 0, (tz - z) * .9, { i: 3.2, dist: 55, angle: .75, pen: .6, color: 0xfff1d6, halo: false });
  return g;
}
function container(p, x, z, ry, color, y = 0, len = 6.06) {
  const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; p.add(g);
  B(-1.22, 1.22, 0, 2.59, -len / 2, len / 2, M(color, .7, .25, { map: TX.corr }), g, { cast: false });
  return g;
}
function ambulance(p, x, z, ry) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; p.add(g);
  const white = M(0xf5f5f2, .35, .2), red = M(0xc8161d, .4, .2), dark = M(0x1d2024, .6), glass = M(0x1b2530, .1, .6);
  B(-1.0, 1.0, .5, 2.7, -3.0, 1.2, white, g); B(-1.0, 1.0, .5, 1.9, 1.2, 2.2, white, g);
  B(-.95, .95, 1.95, 2.55, 1.16, 1.24, glass, g); B(-.9, .9, 1.25, 1.8, 2.18, 2.22, glass, g);
  B(-1.01, 1.01, 1.2, 1.45, -3.0, 2.2, red, g); B(-1.01, 1.01, 1.55, 1.62, -3.0, 2.2, M(0xf3c318, .5), g);
  B(-.6, .6, 2.7, 2.85, .6, 1.1, glowM(0x3355ff, 0x2244ff, .5, 2), g);
  for (const [wx, wz] of [[-.95, -2.1], [.95, -2.1], [-.95, 1.3], [.95, 1.3]]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(.4, .4, .28, 18), dark); w.rotation.z = Math.PI / 2; w.position.set(wx, .4, wz); g.add(w); }
  const lbl = signPlane(2.6, .6, 100, (c, w, h) => { txt(c, 'آمبولانس  ·  اورژانس HSE', w / 2, h / 2, { px: .26, fa: 1, w: w - .1, color: '#c8161d' }); }, { cast: false });
  for (const s of [-1, 1]) { const l = lbl.clone(); l.position.set(s * 1.02, 2.15, -.8); l.rotation.y = s * Math.PI / 2; g.add(l); }
  return g;
}

function buildContext() {
  const C = new THREE.Group(); scene.add(C); FROND = FROND || frondTex();
  groundPlane(-260, 180, -240, 280, -.03, M(0xffffff, 1, 0, { map: TX.sand }), C);
  groundPlane(-45, 45, -32, 48, -.006, M(0xffffff, .9, 0, { map: TX.apron }), C);
  // a few generic trees around the yard edge
  for (const [x, z] of [[-40, 44], [-26, 45], [26, 45], [40, 44], [-42, 20], [42, 22], [-42, -6], [42, -8]]) oliveTree(C, x + rr(-1, 1), z + rr(-1, 1), rr(1.2, 1.5));
  for (const [x, z] of [[-34, 40], [34, 41], [-41, 32], [41, 34]]) palm(x, z, rr(8, 10.5), rr(-.06, .06), rr(0, 6), C);
  // floodlight masts flanking the facade, vehicles in the yard
  latticeMast(C, -24.5, 12.5, 15, -6, 26);
  latticeMast(C, 12.4, 12.8, 15, -2, 26);
  buildTruck(C, -14.2, 17.5, Math.PI);
  ambulance(C, 19, 21, -1.2);
}
