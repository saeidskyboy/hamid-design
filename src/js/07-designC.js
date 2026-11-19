// ---------- design C: Gable Frame (warm render, anthracite folded frame, timber gable, PV roof) ----------
function designC() {
  const G = new THREE.Group(); scene.add(G);
  const Z = .35, X = 8.95, FW = .7, XI = X - FW, Eo = 7.45, APo = 10.65, Ei = 6.85, APi = 9.85, FZ = Z + 1.6, BY0 = 5.25, BY1 = 6.75;
  const yIn = x => APi - (APi - Ei) * Math.abs(x) / XI;
  const render = M(0xffffff, .75, 0, { map: TX.render, bumpMap: TX.renderB, bumpScale: .006 });
  const anth = M(0x2a2d31, .5, .45), anthDk = M(0x1b1d20, .55, .4), white = M(0xf4f2ee, .55);
  const timber = M(0xffffff, .62, 0, { map: TX.woodV, color: 0xd8a374 }), timberSoff = M(0xffffff, .6, 0, { map: TX.wood, color: 0xd09a68 });
  const W = [3.6, 7.9, 1.0, 4.6];
  // warm-white rendered wall up to the band
  wallHoles(-XI, XI, 0, BY0, 0, Z, [[GATE.x0, GATE.x1, 0, GATE.h], [DOOR.x0, DOOR.x1, 0, DOOR.h], W], render, G);
  for (const [p, q] of [[-XI, GATE.x0 - .3], [GATE.x1 + .3, VEST.x0], [VEST.x1, XI]]) B(p, q, 0, .35, Z - .02, Z + .02, anthDk, G);
  // anthracite information band carrying the department name
  B(-XI, XI, BY0, BY1, 0, Z + .25, anth, G);
  const band = signPlane(2 * XI - .4, BY1 - BY0, 160, (c, w, h) => {
    txt(c, 'اداره ایمنی، بهداشت و محیط زیست', w / 2, h - 1.02, { px: .6, fa: 1, color: '#ffffff', w: 10 });
    const l2 = 'شرکت نفت فلات قاره ایران'; c.font = `500 .3px ${FA}`; const lw = c.measureText(l2).width, tw = 1.6, gap = .3, tot = lw + gap + tw, x0 = w / 2 - tot / 2;
    txt(c, l2, x0 + tot, h - .5, { px: .3, fa: 1, color: '#e6e2da', align: 'right', weight: 500 });
    c.fillStyle = '#c8191f'; c.fillRect(x0, h - .5 - .2, tw, .4);
    txt(c, 'ناحیه بوشهر', x0 + tw / 2, h - .49, { px: .26, fa: 1, color: '#fff', w: tw - .2 });
    txt(c, 'HSE DEPARTMENT  ·  IRANIAN OFFSHORE OIL COMPANY  ·  BUSHEHR DISTRICT', w / 2, h - .17, { px: .15, color: '#bfc3c8', w: 9, ls: 3, weight: 600 });
  }, { glow: .85, cast: false });
  band.position.set(0, (BY0 + BY1) / 2, Z + .256); G.add(band);
  // timber-battened gable on a dark backing; logo on a white disc
  prism([[-XI, BY1], [XI, BY1], [XI, Ei], [0, APi], [-XI, Ei]], 0, Z, anthDk, G);
  const bat = new THREE.BoxGeometry(.065, 1, .09); bat.translate(0, .5, 0);
  const xs = []; for (let x = -XI + .1; x <= XI - .09; x += .16) xs.push(x);
  const bm = new THREE.InstancedMesh(bat, timber, xs.length); const mm = new THREE.Matrix4();
  xs.forEach((x, i) => { const h = Math.min(yIn(x - .035), yIn(x + .035)) - BY1; mm.makeScale(1, Math.max(.01, h), 1).setPosition(x, BY1, Z + .045); bm.setMatrixAt(i, mm); });
  bm.castShadow = bm.receiveShadow = true; G.add(bm);
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(.82, .82, .08, 48), white); disc.rotation.x = Math.PI / 2; disc.position.set(0, 8.25, Z + .13); disc.castShadow = true; G.add(disc);
  const logo = signPlane(1.3, 1.3, 300, (c, w, h) => drawLogo(c, w / 2, h / 2, 1.22), { cast: false, glow: .5 }); logo.position.set(0, 8.25, Z + .175); G.add(logo);
  const lh = haloPlane(2.4, 2.4, 60, (c, w, h) => { c.fillStyle = '#fff'; c.beginPath(); c.arc(w / 2, h / 2, .9, 0, 7); c.fill(); }, 0xffe2b8, .6); lh.position.set(0, 8.25, Z + .1); G.add(lh);
  for (let x = -7.2; x <= 7.3; x += 1.2) wash(G, x, BY1 + .02, Z + .1, 1.1, yIn(x) - BY1 - .05, 0xffb874, .32);
  // deep folded anthracite frame tracing the gable
  prism([[-X, 0], [-X, Eo], [0, APo], [X, Eo], [X, 0], [XI, 0], [XI, Ei], [0, APi], [-XI, Ei], [-XI, 0]], -.3, FZ, anth, G);
  const strip = glowM(0x5a4a38, 0xffd9a8, .15, 2.4);
  for (const s of [-1, 1]) {
    const L = Math.hypot(XI, APi - Ei), a = Math.atan2(APi - Ei, XI), m = new THREE.Mesh(new THREE.BoxGeometry(L, .03, .06), strip);
    m.position.set(s * XI / 2, (APi + Ei) / 2 - .02, FZ - .25); m.rotation.z = -s * a; G.add(m);
    B(s < 0 ? -XI - .01 : XI - .02, s < 0 ? -XI + .02 : XI + .01, .4, Ei, FZ - .28, FZ - .22, strip, G, { cast: false });
  }
  for (const s of [-1, 1]) wash(G, s * (XI + .01), .3, FZ - .5, .9, 6, 0xffd9a8, .3);
  // vehicle gate: heritage white door with red bands in an anthracite reveal that ties into the band
  const D = Z + .45, gx0 = GATE.x0 - .3, gx1 = GATE.x1 + .3;
  B(gx0, GATE.x0, 0, BY0, 0, D, anth, G); B(GATE.x1, gx1, 0, BY0, 0, D, anth, G); B(gx0, gx1, GATE.h, BY0, 0, D, anth, G);
  rollerDoor(G, GATE.x0, GATE.x1, GATE.h, .12, sectionalDoor('#f2f2f2', { stripes: 1, vision: 3 }));
  heightSign(G, gx0 - .55, 4.3, Z + .02);
  const gs = signPlane(GATE.x1 - GATE.x0, .2, 300, (c, w, h) => { txt(c, 'ورودی خودرو  |  VEHICLE ENTRANCE', w / 2, h / 2, { px: .14, fa: 1, color: '#fff', w: w - .2 }); }, { glow: .7, cast: false });
  gs.position.set((GATE.x0 + GATE.x1) / 2, (GATE.h + BY0) / 2 - .005, D + .006); G.add(gs);
  for (const x of [gx0 - .25, gx1 + .25]) { post(G, x, D + .35, 1.0, .1, M(0xb9bec4, .3, .9)); const t = post(G, x, D + .35, .14, .102, M(0xf3c318, .5)); t.position.y = .78; }
  spot(G, (GATE.x0 + GATE.x1) / 2, GATE.h - .05, D - .1, (GATE.x0 + GATE.x1) / 2, 0, 3.5, { i: 2.0, dist: 12, angle: .8, halo: false });
  halo(G, (GATE.x0 + GATE.x1) / 2, GATE.h - .02, D - .15, 0xffe6c0, .6, .9);
  // staff entrance hallway: rendered walls, timber soffit, anthracite roof
  vestibule(G, { Z, wall: render, roof: anth, soffit: timberSoff, frame: anth, canopy: .75, roofT: .42, over: .12, signCol: '#ffffff', signGlow: .85 });
  // large office window in a projecting anthracite box
  const [wx0, wx1, wy0, wy1] = W;
  win(G, wx0, wx1, wy0, wy1, Z, anth, { depth: .22, t: .06, mullions: [(wx0 + wx1) / 2 - .72, (wx0 + wx1) / 2 + .72], glass: glowM(0x3c5262, 0xffc98a, 0, .16, { rough: .05, metal: .6 }) });
  frame(G, wx0 - .16, wx1 + .16, wy0 - .16, wy1 + .16, Z + .5, .16, .5, anth);
  // photovoltaic array on both slopes of the existing roof
  const a = Math.atan2(2.4, 8.5), pv = M(0xffffff, .2, .5, { map: TX.pv, envMapIntensity: 1.3 }), rail = M(0xb9bec4, .4, .8);
  for (const s of [-1, 1]) {
    const pg = new THREE.Group(); pg.position.set(s * 4.25, (H.eave + H.ridge) / 2 + .06, -H.d / 2); pg.rotation.z = -s * a; G.add(pg);
    B(-3.6, 3.7, .1, .15, -9.6, 8.4, pv, pg); B(-3.65, 3.75, .06, .1, -9.65, 8.45, rail, pg);
  }
  // wings: render, anthracite ribbon windows, timber fascia
  wallHoles(-14.1, -X, 0, 3.9, -.05, .2, [[-13.4, -9.6, 1.1, 3.0]], render, G);
  win(G, -13.4, -9.6, 1.1, 3.0, .2, anth, { depth: .2, t: .07, mullions: [-12.13, -10.87] });
  B(-14.2, -X, 3.9, 4.85, -.1, .28, timber, G); B(-14.25, -X, 4.85, 4.95, -.12, .3, anth, G); B(-14.1, -X, 0, .35, .2, .23, anthDk, G);
  wallHoles(X, 12.6, 0, 3.5, -.05, .2, [[9.5, 12.0, 1.1, 3.0]], render, G);
  win(G, 9.5, 12.0, 1.1, 3.0, .2, anth, { depth: .2, t: .07, mullions: [10.75] });
  B(X, 12.7, 3.5, 4.45, -.1, .28, timber, G); B(X, 12.75, 4.45, 4.55, -.12, .3, anth, G); B(X, 12.6, 0, .35, .2, .23, anthDk, G);
  // timber-clad planter benches with grasses
  for (const [x0, x1, z0, z1] of [[3.4, 8.1, Z + .9, Z + 1.6], [-13.6, -9.6, .5, 1.2]]) {
    B(x0, x1, 0, .5, z0, z1, timber, G); B(x0 - .02, x1 + .02, .5, .53, z0 - .02, z1 + .02, anth, G);
    groundPlane(x0 + .05, x1 - .05, z0 + .05, z1 - .05, .535, M(0xffffff, 1, 0, { map: TX.gravel }), G);
    for (let x = x0 + .35; x < x1 - .2; x += .5) grassClump(G, x + rr(-.1, .1), .53, (z0 + z1) / 2 + rr(-.1, .1), rr(.55, .8), 55);
  }
  landscapeC(G);
  return { G, lobbyH: 3.5 };
}
