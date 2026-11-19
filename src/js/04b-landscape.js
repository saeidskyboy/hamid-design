// ---------- per-design forecourt landscape ----------
// Each design gets its own walkway paving, a raised planter between the drive and the walkway (replaces steel bollards;
// a 0.5 m planter wall is a firmer vehicle stop) and a small shaded rest garden. Planting at the drive exit stays low for sight lines.
const LS = { dx0: -1.75, dx1: -.95, dz0: VEST.z + .3, dz1: 8.4, gx0: 3.5, gx1: 9.3, gz0: 4.4, gz1: 9.6 };

function smallTree(G, x, y, z, s, narrow = 1) { const t = oliveTree(G, x, z, s, y); t.scale.set(narrow, 1, narrow); halo(G, x, y + .15, z, 0xffd9a0, 1.1, .5); return t; }
function seatGlow(G, x0, x1, z0, z1, y) { B(x0, x1, y, y + .015, z0, z1, glowM(0x333333, 0xffd9a0, 0, 1.8), G); }
// hollow raised bed: four walls so the planting surface inside stays visible
function bed(G, x0, x1, z0, z1, y0, y1, t, mat) { B(x0, x1, y0, y1, z0, z0 + t, mat, G); B(x0, x1, y0, y1, z1 - t, z1, mat, G); B(x0, x0 + t, y0, y1, z0 + t, z1 - t, mat, G); B(x1 - t, x1, y0, y1, z0 + t, z1 - t, mat, G); }
function boulder(G, x, z, s, mat) { const m = new THREE.Mesh(new THREE.DodecahedronGeometry(s, 0), mat); m.scale.set(1, .55, .8); m.rotation.y = rnd() * 6; m.position.set(x, s * .3, z); m.castShadow = m.receiveShadow = true; G.add(m); }

// A: Persian courtyard: travertine-look slabs with a brick border, brick planter with olives, raised garden with a water rill
function landscapeA(G) {
  const stone = M(0xffffff, .62, 0, { map: TX.stone, bumpMap: TX.stoneB, bumpScale: .008 });
  const brick = M(0xffffff, .85, 0, { map: TX.brick, bumpMap: TX.brickBump, bumpScale: .01 });
  const wood = M(0xffffff, .6, 0, { map: TX.wood, color: 0xc98f5c });
  groundPlane(VEST.x0, VEST.x1, VEST.z, FZ, .012, M(0xffffff, .55, 0, { map: TX.walkA }), G);
  for (const [a, b] of [[VEST.x0, VEST.x0 + .22], [VEST.x1 - .22, VEST.x1]]) groundPlane(a, b, VEST.z, FZ, .014, brick, G);
  // divider: brick planter, travertine coping, clipped myrtle hedge and two small olives
  bed(G, LS.dx0, LS.dx1, LS.dz0, LS.dz1, 0, .5, .12, brick); bed(G, LS.dx0 - .03, LS.dx1 + .03, LS.dz0 - .03, LS.dz1 + .03, .5, .56, .17, stone);
  groundPlane(LS.dx0 + .1, LS.dx1 - .1, LS.dz0 + .1, LS.dz1 - .1, .46, M(0x5a4636, 1), G);
  hedge(G, LS.dx0 + .1, LS.dx1 - .1, .52, .95, LS.dz0 + .15, LS.dz1 - .15, LEAF());
  smallTree(G, -1.35, .55, 4.4, .55); smallTree(G, -1.35, .55, 7.0, .5);
  // rest garden: brick bed with a travertine seat coping, lawn, rill, olives and bougainvillea
  const { gx0: x0, gx1: x1, gz0: z0, gz1: z1 } = LS;
  bed(G, x0, x1, z0, z1, 0, .42, .22, brick); bed(G, x0 - .04, x1 + .04, z0 - .04, z1 + .04, .42, .47, .5, stone);
  groundPlane(x0 + .2, x1 - .2, z0 + .2, z1 - .2, .43, M(0xffffff, 1, 0, { map: TX.grass }), G);
  B(5.95, 6.75, .44, .5, 5.0, 9.0, stone, G);
  B(6.07, 6.63, .5, .505, 5.1, 8.9, M(0x2f6a78, .05, .2), G); groundPlane(6.12, 6.58, 5.15, 8.85, .507, M(0x2f6a78, .05, .2, { envMapIntensity: 1.4 }), G);
  oliveTree(G, 4.7, 8.3, .95, .44); oliveTree(G, 8.2, 5.7, .9, .44);
  halo(G, 4.7, .6, 8.3, 0xffd9a0, 1.4, .55); halo(G, 8.2, .6, 5.7, 0xffd9a0, 1.4, .55);
  hedge(G, 8.0, 8.95, .43, .85, 8.3, 9.05, FLOWER()); hedge(G, 4.3, 5.1, .43, .8, 4.95, 5.6, FLOWER()); hedge(G, 8.55, 9.0, .43, .75, 4.95, 5.6, FLOWER());
  for (const [x, z] of [[5.2, 6.0], [7.4, 7.6], [8.7, 6.9], [4.4, 6.9], [7.3, 4.9]]) grassClump(G, x, .44, z, rr(.5, .7), 50);
  // timber seat on the walkway side, under the olive
  B(x0 - .02, x0 + .45, .47, .53, 5.8, 9.0, wood, G); seatGlow(G, x0 - .02, x0 + .02, 5.8, 9.0, .3);
}

// B: response-centre xeriscape: grey large slabs with a green egress line, steel planter with columnar conocarpus, shade-sail rest area
function landscapeB(G) {
  const anthDk = M(0x1c1e21, .5, .5), wood = M(0xffffff, .6, 0, { map: TX.wood, color: 0xb98458 }), conc = M(0xcfcac2, .75);
  groundPlane(VEST.x0, VEST.x1, VEST.z, FZ, .012, M(0xffffff, .6, 0, { map: TX.walkB }), G);
  // photoluminescent green guidance line to the assembly point
  B(.94, 1.06, .012, .02, VEST.z + .2, FZ - .1, glowM(0x1f9a4a, 0x2bd665, .15, 1.4), G);
  // divider: anthracite steel planter, gravel, grasses, two columnar conocarpus
  bed(G, LS.dx0, LS.dx1, LS.dz0, LS.dz1, 0, .55, .06, anthDk);
  groundPlane(LS.dx0 + .06, LS.dx1 - .06, LS.dz0 + .06, LS.dz1 - .06, .5, M(0xffffff, 1, 0, { map: TX.gravel }), G);
  for (let z = LS.dz0 + .4; z < LS.dz1 - .2; z += .55) grassClump(G, -1.35 + rr(-.08, .08), .5, z, rr(.5, .75), 55);
  smallTree(G, -1.35, .5, 4.6, .75, .45); smallTree(G, -1.35, .5, 7.2, .7, .45);
  // rest garden: gravel and boulders, young date palms, white tensile shade sail over timber benches
  const { gx0: x0, gx1: x1, gz0: z0, gz1: z1 } = LS;
  bed(G, x0, x1, z0, z1, 0, .16, .05, anthDk); groundPlane(x0 + .05, x1 - .05, z0 + .05, z1 - .05, .13, M(0xffffff, 1, 0, { map: TX.gravel }), G);
  const rock = M(0xb49d7c, .9);
  for (const [x, z, s] of [[7.6, 5.0, .45], [8.6, 7.4, .35], [5.0, 9.1, .3], [7.0, 8.9, .4]]) boulder(G, x, z, s, rock);
  for (const [x, z, r] of [[8.0, 6.2, .4], [8.5, 8.6, 2.1]]) palm(x, z, 4.2, .05, r, G).scale.setScalar(.62);
  for (const [x, z] of [[7.2, 7.4], [8.9, 5.2], [6.8, 5.0], [9.0, 9.2], [7.8, 9.3]]) grassClump(G, x, .15, z, rr(.55, .8), 55);
  for (const [a, b, c, d] of [[3.9, 4.35, 5.3, 8.3], [4.9, 6.4, 8.45, 8.9]]) { B(a + .05, b - .05, .15, .4, c + .1, d - .1, conc, G); B(a, b, .4, .46, c, d, wood, G); seatGlow(G, a + .05, b - .05, c + .1, d - .1, .2); }
  const corners = [[3.8, 3.0, 5.1], [6.4, 2.35, 5.3], [6.3, 3.0, 8.95], [3.75, 2.3, 8.8]];
  for (const [x, h, z] of corners) post(G, x, z, h + .1, .05, M(0x2b2e32, .45, .55));
  const sg = new THREE.PlaneGeometry(1, 1, 8, 8), p = sg.attributes.position, [c0, c1, c2, c3] = corners;
  for (let i = 0; i < p.count; i++) {
    const u = p.getX(i) + .5, v = p.getY(i) + .5, sag = .18 * Math.sin(Math.PI * u) * Math.sin(Math.PI * v);
    const L = (k) => (c0[k] * (1 - u) + c1[k] * u) * (1 - v) + (c3[k] * (1 - u) + c2[k] * u) * v;
    p.setXYZ(i, L(0) + (u - .5) * -.5 * Math.sin(Math.PI * v), L(1) - sag, L(2) + (v - .5) * -.5 * Math.sin(Math.PI * u));
  }
  sg.computeVertexNormals();
  const sail = new THREE.Mesh(sg, M(0xf4f2ec, .8, 0, { side: THREE.DoubleSide })); sail.castShadow = true; G.add(sail);
}

// C: timber garden: exposed-aggregate walkway, timber planter bench, pergola with bougainvillea over a deck
function landscapeC(G) {
  const timber = M(0xffffff, .62, 0, { map: TX.woodV, color: 0xd8a374 }), deck = M(0xffffff, .65, 0, { map: TX.wood, color: 0xc08a5a }), anth = M(0x2a2d31, .5, .45);
  groundPlane(VEST.x0, VEST.x1, VEST.z, FZ, .012, M(0xffffff, .8, 0, { map: TX.aggr }), G);
  // divider: timber-clad planter with grasses, flowering shrubs and two small olives
  bed(G, LS.dx0, LS.dx1, LS.dz0, LS.dz1, 0, .5, .05, timber); bed(G, LS.dx0 - .02, LS.dx1 + .02, LS.dz0 - .02, LS.dz1 + .02, .5, .53, .07, anth);
  groundPlane(LS.dx0 + .05, LS.dx1 - .05, LS.dz0 + .05, LS.dz1 - .05, .48, M(0xffffff, 1, 0, { map: TX.gravel }), G);
  for (let z = LS.dz0 + .35; z < LS.dz1 - .2; z += .5) grassClump(G, -1.35 + rr(-.08, .08), .48, z, rr(.5, .75), 50);
  hedge(G, LS.dx0 + .1, LS.dx1 - .1, .48, .9, 5.5, 6.2, FLOWER());
  smallTree(G, -1.35, .48, 4.2, .55); smallTree(G, -1.35, .48, 7.4, .5);
  // rest garden: lawn, timber deck under a slatted pergola with climbers, one shade olive
  const { gx0: x0, gx1: x1, gz0: z0, gz1: z1 } = LS;
  bed(G, x0, x1, z0, z1, 0, .12, .05, timber); groundPlane(x0 + .05, x1 - .05, z0 + .05, z1 - .05, .1, M(0xffffff, 1, 0, { map: TX.grass }), G);
  B(x0 + .1, 6.6, .11, .2, z0 + .3, z1 - .3, deck, G);
  const px = [x0 + .3, 6.3], pz = [z0 + .55, z1 - .55], H = 2.7;
  for (const x of px) for (const z of pz) B(x - .07, x + .07, 0, H, z - .07, z + .07, timber, G);
  for (const z of pz) B(px[0] - .3, px[1] + .3, H, H + .2, z - .05, z + .05, timber, G);
  for (let x = px[0] - .2; x <= px[1] + .25; x += .3) B(x - .03, x + .03, H + .2, H + .3, pz[0] - .35, pz[1] + .35, timber, G);
  // bougainvillea trained over part of the pergola: loose clumps, not a full roof
  for (const [a, b, c, d] of [[px[0] - .25, px[0] + .5, pz[1] - .9, pz[1] + .3], [px[0] + .4, px[0] + 1.1, pz[1] - .3, pz[1] + .35], [px[0] - .2, px[0] + .35, pz[1] - 1.8, pz[1] - .8], [px[1] - .5, px[1] + .3, pz[0] - .3, pz[0] + .6]])
    hedge(G, a, b, H + .2, H + .2 + rr(.25, .4), c, d, FLOWER());
  hedge(G, px[0] - .12, px[0] + .12, .2, H + .1, pz[1] - .14, pz[1] + .14, FLOWER()); hedge(G, px[1] - .12, px[1] + .12, .2, H + .1, pz[0] - .14, pz[0] + .14, FLOWER());
  for (const [a, b, c, d] of [[4.0, 4.45, 5.6, 8.4], [5.0, 6.0, 8.6, 9.0]]) { B(a, b, .2, .46, c, d, timber, G); B(a, b, .46, .5, c, d, deck, G); seatGlow(G, a, b, c, d, .21); }
  halo(G, 5.0, 2.5, 7.0, 0xffd9a0, 2.2, .45);
  oliveTree(G, 8.1, 7.0, 1.0, .11); halo(G, 8.1, .3, 7.0, 0xffd9a0, 1.4, .55);
  hedge(G, 8.9, 9.2, .11, .7, 4.7, 9.3, LEAF());
  for (const [x, z] of [[7.2, 5.0], [8.4, 5.2], [7.4, 9.1], [8.5, 9.2]]) grassClump(G, x, .11, z, rr(.55, .8), 55);
}
