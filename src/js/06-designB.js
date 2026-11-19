// ---------- design B: Response Centre (white panels, anthracite frame, emergency-red gate portal) ----------
function designB() {
  const G = new THREE.Group(); scene.add(G);
  const Z = .35, X = 8.95, LW = .5, TOP = 10.0, BAND = 9.0, P = Z + 1.0, RED = 0xa8191f;
  const panel = M(0xffffff, .42, 0, { map: TX.panel, bumpMap: TX.panelB, bumpScale: .01 });
  const anth = M(0x2b2e32, .45, .55), anthDk = M(0x1c1e21, .5, .5), silver = M(0xc9ced3, .3, .85), white = M(0xf3f3f1, .5);
  const red = M(RED, .38, .25);
  const CW = [3.4, 8.2, .5, 6.0];
  // white panel field (squared-off parapet hides the old gable)
  wallHoles(-X + LW, X - LW, 0, BAND, 0, Z, [[GATE.x0, GATE.x1, 0, GATE.h], [DOOR.x0, DOOR.x1, 0, DOOR.h], CW], panel, G);
  for (const [p, q] of [[-X + LW, GATE.x0 - .45], [GATE.x1 + .45, VEST.x0], [VEST.x1, CW[0]], [CW[1], X - LW]]) B(p, q, 0, .4, Z - .02, Z + .02, anthDk, G);
  // anthracite frame: legs + top band projecting 1 m, returns 3 m deep over the old roof
  for (const s of [-1, 1]) {
    const a = s < 0 ? -X : X - LW, b = s < 0 ? -X + LW : X;
    B(a, b, 0, TOP, -3, P, anth, G);
  }
  B(-X, X, BAND, TOP, 0, P, anth, G);
  B(-X + LW, X - LW, BAND - .04, BAND, Z, P, white, G, { cast: false });
  B(-X + LW, X - LW, BAND - .06, BAND - .04, P - .12, P - .06, glowM(0x8a1015, 0xff2a2a, .2, 2.5), G, { cast: false });
  for (let x = -7.5; x <= 7.6; x += 1.5) { halo(G, x, BAND - .06, P - .3, 0xfff0d6, .3, .9); wash(G, x, BAND - .1, Z + .01, 1.5, 2.2, 0xfff0d6, .3, true); }
  const en = signPlane(2 * X - 1.4, .5, 220, (c, w, h) => txt(c, 'HSE DEPARTMENT   ·   IRANIAN OFFSHORE OIL COMPANY   ·   BUSHEHR DISTRICT', w / 2, h / 2, { px: .3, color: '#ffffff', w: w - .2, ls: 4, weight: 600 }), { glow: .9, cast: false });
  en.position.set(0, (BAND + TOP) / 2, P + .006); G.add(en);
  // vehicle gate: deep emergency-red portal, full-vision aluminium sectional door
  const D = Z + 1.2, gx0 = GATE.x0 - .45, gx1 = GATE.x1 + .45, gh = GATE.h + .45;
  B(gx0, GATE.x0, 0, gh, 0, D, red, G); B(GATE.x1, gx1, 0, gh, 0, D, red, G); B(gx0, gx1, GATE.h, gh, 0, D, red, G);
  B(GATE.x0, GATE.x1, GATE.h - .02, GATE.h, Z, D, white, G, { cast: false });
  rollerDoor(G, GATE.x0, GATE.x1, GATE.h, .12, sectionalDoor('#c9ced3', { full: 1 }));
  const gs = signPlane(GATE.x1 - GATE.x0 + .6, .32, 260, (c, w, h) => {
    txt(c, 'ورودی خودرو', w * .7, h / 2 + .005, { px: .22, fa: 1, color: '#ffffff', w: 1.9 });
    c.fillStyle = '#ffffff'; c.fillRect(w / 2 - .006, .06, .012, .2);
    txt(c, 'VEHICLE ENTRANCE', w * .29, h / 2, { px: .12, color: '#ffffff', w: 2.0, ls: 2, weight: 600 });
  }, { glow: .7, cast: false });
  gs.position.set((GATE.x0 + GATE.x1) / 2, GATE.h + .225, D + .006); G.add(gs);
  heightSign(G, -7.45, 4.3, Z + .02);
  for (const x of [gx0 - .25, gx1 + .25]) { post(G, x, D + .35, 1.0, .1, M(0xb9bec4, .3, .9)); const t = post(G, x, D + .35, .14, .102, M(0xf3c318, .5)); t.position.y = .78; }
  for (const x of [GATE.x0 + .8, GATE.x1 - .8]) { spot(G, x, GATE.h - .05, D - .3, x, 0, 4, { i: 1.6, dist: 12, angle: .75, halo: false }); halo(G, x, GATE.h - .03, D - .3, 0xfff0d6, .45, .9); }
  // staff entrance hallway: frameless-look glass box, anthracite roof, white soffit
  vestibule(G, { Z, glass: true, frame: anth, roof: anth, soffit: white, canopy: .9, roofT: .45, over: .15, signCol: '#ffffff', signGlow: .9 });
  // office curtain wall with vertical solar fins
  const [cx0, cx1, cy0, cy1] = CW;
  B(cx0, cx1, cy0, cy1, Z - .2, Z - .15, glowM(0x41586a, 0xffc98a, 0, .16, { rough: .05, metal: .6 }), G, { cast: false });
  frame(G, cx0, cx1, cy0, cy1, Z + .06, .1, .26, anth);
  for (let x = cx0 + 1.2; x < cx1 - .1; x += 1.2) B(x - .03, x + .03, cy0, cy1, Z - .2, Z, anth, G);
  B(cx0, cx1, 3.0, 3.06, Z - .2, Z, anth, G);
  for (let x = cx0 + .3; x < cx1; x += .6) B(x - .025, x + .025, cy0 + .1, cy1 + .25, Z, Z + .5, silver, G);
  B(cx0 - .1, cx1 + .1, cy1 + .25, cy1 + .33, Z, Z + .55, anth, G);
  // corporate lettering on the white field (logo on the right, Persian reads from it)
  const SX = 2 * (X - LW), SY0 = 6.4, SY1 = 8.85, wx = x => x + X - LW, wy = y => SY1 - y;
  const draw = (c, w, h, glow) => {
    const navy = glow ? '#fff' : '#1f3478', grey = glow ? '#fff' : '#3b4046';
    drawLogo(c, wx(6.55), wy(7.6), 2.2, glow ? { red: '#fff', navy: '#fff' } : {});
    txt(c, 'اداره ایمنی، بهداشت و محیط زیست', wx(5.25), wy(8.2), { px: .66, fa: 1, color: navy, w: 11.5, align: 'right' });
    txt(c, 'شرکت نفت فلات قاره ایران', wx(5.25), wy(7.42), { px: .4, fa: 1, color: grey, w: 7, align: 'right', weight: 600 });
    c.font = `600 .4px ${FA}`; const lw = c.measureText('شرکت نفت فلات قاره ایران').width;
    const tx1 = wx(5.25) - lw - .35, tw = 2.25;
    c.fillStyle = glow ? '#fff' : '#a8191f'; c.fillRect(tx1 - tw, wy(7.42) - .27, tw, .54);
    txt(c, 'ناحیه بوشهر', tx1 - tw / 2, wy(7.42) + .01, { px: .34, fa: 1, color: glow ? '#000' : '#ffffff', w: tw - .3 });
  };
  const sign = signPlane(SX, SY1 - SY0, 140, (c, w, h) => draw(c, w, h, false), { rough: .4 });
  sign.position.set(0, (SY0 + SY1) / 2, Z + .04); G.add(sign);
  const hal = haloPlane(SX, SY1 - SY0, 60, (c, w, h) => draw(c, w, h, true), 0xdfeaff, .5); hal.position.set(0, (SY0 + SY1) / 2, Z + .012); G.add(hal);
  // wings: white panels, anthracite ribbon windows and coping
  wallHoles(-14.1, -X, 0, 4.2, -.05, .2, [[-13.4, -9.6, 1.1, 3.0]], panel, G);
  win(G, -13.4, -9.6, 1.1, 3.0, .2, anth, { depth: .2, t: .08, mullions: [-12.13, -10.87] });
  B(-14.2, -X, 4.2, 4.5, -.1, .3, anth, G); B(-14.1, -X, 0, .4, .2, .23, anthDk, G);
  wallHoles(X, 12.6, 0, 3.8, -.05, .2, [[9.5, 12.0, 1.1, 3.0]], panel, G);
  win(G, 9.5, 12.0, 1.1, 3.0, .2, anth, { depth: .2, t: .08, mullions: [10.75] });
  B(X, 12.7, 3.8, 4.1, -.1, .3, anth, G); B(X, 12.6, 0, .4, .2, .23, anthDk, G);
  // weathering-free anthracite steel planters with ornamental grasses
  for (const [x0, x1, z0, z1] of [[3.4, 8.2, Z + .75, Z + 1.45], [-13.6, -9.6, .5, 1.2]]) {
    B(x0, x1, 0, .55, z0, z1, anthDk, G); groundPlane(x0 + .06, x1 - .06, z0 + .06, z1 - .06, .5, M(0xffffff, 1, 0, { map: TX.gravel }), G);
    for (let x = x0 + .35; x < x1 - .2; x += .55) grassClump(G, x + rr(-.1, .1), .5, (z0 + z1) / 2 + rr(-.1, .1), rr(.6, .8), 60);
  }
  // emergency information point by the gate: AED + first-aid cabinet on the leg
  const aed = signPlane(.5, .62, 300, (c, w, h) => {
    c.fillStyle = '#0a8a3c'; c.fillRect(0, 0, w, h); c.fillStyle = '#fff';
    c.fillRect(w / 2 - .06, .09, .12, .32); c.fillRect(w / 2 - .16, .19, .32, .12);
    txt(c, 'AED · کمک‌های اولیه', w / 2, h - .1, { px: .06, fa: 1, color: '#fff', w: .44 });
  }, { glow: .8, cast: false });
  aed.position.set(-X + LW / 2, 1.6, P + .006); G.add(aed);
  landscapeB(G);
  return { G, lobbyH: 3.5 };
}
