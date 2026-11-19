// ---------- shared facade parts ----------
const DESIGNS = {};
const glassM = () => M(0x1e2a33, .06, .6, { envMapIntensity: 1.4 });
const winGlowM = () => glowM(0x1c262e, 0xffc98a, 0, .16, { rough: .08, metal: .5 });
function frame(G, x0, x1, y0, y1, z, t, d, mat) {
  B(x0, x1, y1 - t, y1, z - d, z, mat, G); B(x0, x1, y0, y0 + t, z - d, z, mat, G);
  B(x0, x0 + t, y0, y1, z - d, z, mat, G); B(x1 - t, x1, y0, y1, z - d, z, mat, G);
}
function win(G, x0, x1, y0, y1, zFace, frameMat, opt = {}) {
  const dp = opt.depth || .3;
  const gl = B(x0, x1, y0, y1, zFace - dp, zFace - dp + .05, opt.glass || winGlowM(), G, { cast: false });
  frame(G, x0, x1, y0, y1, zFace + (opt.proud || .04), opt.t || .06, dp + (opt.proud || .04), frameMat);
  if (opt.mullions) for (const x of opt.mullions) B(x - .025, x + .025, y0, y1, zFace - dp, zFace - dp + .1, frameMat, G);
  return gl;
}
function hazardStripes(c, w, h, k = .25) {
  c.fillStyle = '#f3c318'; c.fillRect(0, 0, w, h); c.fillStyle = '#151515';
  for (let x = -h; x < w + h; x += 2 * k) { c.beginPath(); c.moveTo(x, h); c.lineTo(x + k, h); c.lineTo(x + k + h, 0); c.lineTo(x + h, 0); c.fill(); }
}
function sectionalDoor(color, opt = {}) {
  return (c, w, h) => {
    c.fillStyle = color; c.fillRect(0, 0, w, h); const n = Math.round(h / .6);
    for (let i = 0; i < n; i++) {
      const y = i * h / n;
      if (opt.vision && i === opt.vision) { c.fillStyle = '#1b2530'; c.fillRect(0, y, w, h / n); c.fillStyle = color; for (let x = 0; x <= w; x += w / 6) c.fillRect(x - .05, y, .1, h / n); }
      if (opt.full) { c.fillStyle = 'rgba(30,45,58,.82)'; c.fillRect(.08, y + .06, w - .16, h / n - .12); c.fillStyle = color; for (let x = 0; x <= w; x += w / 5) c.fillRect(x - .04, y, .08, h / n); }
      c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(0, y, w, .025); c.fillStyle = 'rgba(255,255,255,.12)'; c.fillRect(0, y + .025, w, .015);
      if (opt.ribs) for (let k = 1; k < 4; k++) { c.fillStyle = 'rgba(0,0,0,.12)'; c.fillRect(0, y + k * h / n / 4, w, .01); }
    }
    if (opt.stripes) { c.fillStyle = '#d7141a'; c.fillRect(0, h - 1.1, w, .32); c.fillRect(0, h - .55, w, .16); }
    c.fillStyle = '#e6e9ec'; c.fillRect(w / 2 - .25, h - .12, .5, .05);
  };
}

// extruded polygon (x,y points) between z0 and z1, metre UVs
function prism(pts, z0, z1, mat, parent, opt = {}) {
  const g = new THREE.ExtrudeGeometry(new THREE.Shape(pts.map(([x, y]) => v2(x, y))), { depth: z1 - z0, bevelEnabled: false });
  g.translate(0, 0, z0); meterUV(g);
  const m = new THREE.Mesh(g, mat); m.castShadow = opt.cast !== false; m.receiveShadow = true; (parent || scene).add(m); return m;
}
// soft additive light wash on a wall (night only): anchored at its base, grows upward (or downward)
let WASH_T;
function wash(parent, x, y, z, w, h, color = 0xffc98a, op = .45, down = false) {
  if (!WASH_T) { WASH_T = T(cv(128, 256, (g, W, H) => { g.translate(W / 2, H); g.scale(1, H / (W / 2)); const r = g.createRadialGradient(0, 0, 0, 0, 0, W / 2); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(.3, 'rgba(255,255,255,.5)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(-W / 2, -W / 2, W, W / 2); })); WASH_T.wrapS = WASH_T.wrapT = THREE.ClampToEdgeWrapping; }
  const geo = new THREE.PlaneGeometry(w, h); geo.translate(0, h / 2, 0);
  const mat = new THREE.MeshBasicMaterial({ map: WASH_T, color, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4 });
  const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); if (down) m.rotation.z = Math.PI; parent.add(m);
  onNight(n => mat.opacity = n ? op : 0); return m;
}
function sconce(parent, x, y, z, mat, color = 0xffc98a, len = 3) {
  B(x - .07, x + .07, y - .22, y + .22, z, z + .12, mat, parent);
  B(x - .05, x + .05, y + .21, y + .23, z + .02, z + .1, glowM(0x222222, 0xffe0b0, 0, 3), parent, { cast: false });
  B(x - .05, x + .05, y - .23, y - .21, z + .02, z + .1, glowM(0x222222, 0xffe0b0, 0, 3), parent, { cast: false });
  wash(parent, x, y + .2, z + .005, .9, len, color, .55); wash(parent, x, y - .2, z + .005, .9, Math.min(len, y - .2), color, .55, true);
}
function heightSign(G, x, y, z, txt_ = '4.8m') {
  const s = signPlane(.56, .56, 300, (c, w) => { c.fillStyle = '#fff'; c.beginPath(); c.arc(w / 2, w / 2, w / 2, 0, 7); c.fill(); c.strokeStyle = '#d0021b'; c.lineWidth = .06; c.beginPath(); c.arc(w / 2, w / 2, w / 2 - .04, 0, 7); c.stroke(); txt(c, txt_, w / 2, w / 2 + .01, { px: .15, color: '#111', weight: 800 }); c.fillStyle = '#111'; for (const s of [1, -1]) { c.beginPath(); c.moveTo(w / 2, w / 2 - s * .2); c.lineTo(w / 2 - .05, w / 2 - s * .13); c.lineTo(w / 2 + .05, w / 2 - s * .13); c.fill(); } }, { cast: false });
  s.position.set(x, y, z); G.add(s); return s;
}
// glazed entrance screen: fixed sidelights + transom, automatic sliding pair in the middle
function entryGlazing(G, x0, x1, h, z, frameMat, o = {}) {
  MANIF = MANIF || M(0xffffff, .5, 0, { transparent: true, opacity: .75 });
  const dw = o.dw || 1.8, lh = o.lh || 2.6, c = (x0 + x1) / 2, l0 = c - dw / 2, l1 = c + dw / 2;
  const gm = M(0x9fb8c8, .05, .2, { transparent: true, opacity: .28, envMapIntensity: 1.5 });
  for (const [a, b, c0, d] of [[x0, l0, 0, h], [l1, x1, 0, h], [l0, l1, lh, h]]) {
    if (b - a < .05) continue;
    B(a, b, c0, d, z - .015, z + .015, gm, G, { cast: false }); frame(G, a, b, c0, d, z + .05, .06, .1, frameMat);
    if (d - c0 > 2) B(a + .06, b - .06, 1.45, 1.52, z + .016, z + .02, MANIF, G, { cast: false });
  }
  slidingDoors(G, l0, l1, lh, z, frameMat);
}
// staff entrance hallway: walls (solid or glass), roof slab with canopy, soffit lights, double doors (airlock), fascia sign
function vestibule(G, o) {
  const { x0, x1, z: zf, h } = VEST, Z = o.Z, ct = o.roofT ?? .45, cz = zf + (o.canopy ?? .6), ov = o.over ?? 0;
  const t = o.glass ? .12 : DOOR.x0 - x0, ix0 = x0 + t, ix1 = x1 - t;
  if (o.glass) {
    const gm = M(0x9fb8c8, .05, .2, { transparent: true, opacity: .25, envMapIntensity: 1.5 });
    for (const [a, b] of [[x0, ix0], [ix1, x1]]) {
      B(a, b, 0, h, zf - .12, zf, o.frame, G); B(a, b, 0, .14, Z, zf, o.frame, G);
      B(a + .04, b - .04, .14, h, Z, zf - .12, gm, G, { cast: false });
      B(a, b, 2.6, 2.66, Z, zf - .12, o.frame, G);
    }
  } else { B(x0, ix0, 0, h, Z - .02, zf, o.wall, G); B(ix1, x1, 0, h, Z - .02, zf, o.wall, G); }
  B(x0 - ov, x1 + ov, h, h + ct, Z - .02, cz, o.roof, G);
  B(ix0, ix1, h - .03, h, Z, zf, o.soffit, G, { cast: false }); B(x0 - ov, x1 + ov, h - .03, h, zf, cz, o.soffit, G, { cast: false });
  B(ix0, ix1, 0, .025, 0, zf, M(0xffffff, .45, 0, { map: TX.stone }), G);
  B(ix0 + .25, ix1 - .25, .025, .035, zf - 1.3, zf - .35, M(0x2a2c2e, .95), G, { cast: false });
  entryGlazing(G, ix0, ix1, h - .03, zf - .15, o.frame, { lh: 2.6 });
  entryGlazing(G, DOOR.x0, DOOR.x1, DOOR.h, .12, o.frame, { lh: 2.6 });
  const mx = (x0 + x1) / 2;
  for (const x of [mx - 1, mx + 1]) { halo(G, x, h - .05, (zf + cz) / 2, 0xfff0d6, .5, .9); halo(G, x, h - .05, (Z + zf) / 2, 0xfff0d6, .5, .9); }
  pointL(G, mx, h - .5, (Z + zf) / 2, { i: 1.3, dist: 6 });
  spot(G, mx, h - .1, zf + .2, mx, 0, zf + 2.2, { i: 1.8, dist: 8, angle: 1.0, halo: false });
  const fw = x1 - x0 + 2 * ov;
  const sg = signPlane(fw - .3, ct * .62, 260, (c, w, hh) => {
    txt(c, 'ورودی کارکنان', w * .72, hh / 2 + .01, { px: hh * .78, fa: 1, color: o.signCol, w: w * .42 });
    c.fillStyle = o.signCol; c.fillRect(w * .485, hh * .18, .012, hh * .64);
    txt(c, 'STAFF ENTRANCE', w * .25, hh / 2, { px: hh * .5, color: o.signCol, w: w * .43, ls: 2, weight: 600 });
  }, { glow: o.signGlow ?? .7, cast: false, metal: o.signMetal ?? 0 });
  sg.position.set(mx, h + ct / 2, cz + .006); G.add(sg);
}

// ---------- design A: Brick & Travertine ----------
function designA() {
  const G = new THREE.Group(); scene.add(G);
  const Z = .35, X = 8.95, E = 7.0, AP = 10.3, PW = 1.15, a = .1, b = .58;
  const yTop = x => AP - (AP - E) * Math.abs(x) / X;
  const brick = M(0xffffff, .9, 0, { map: TX.brick, bumpMap: TX.brickBump, bumpScale: .02 });
  const stone = M(0xffffff, .62, 0, { map: TX.stone, bumpMap: TX.stoneB, bumpScale: .008 });
  const bronze = M(0x6b4f33, .36, .85), bronzeDk = M(0x3a2a1c, .45, .8), granite = M(0xffffff, .35, 0, { map: TX.granite });
  const teak = M(0xffffff, .6, 0, { map: TX.wood, color: 0xd09a68 });
  // travertine field + gable, dark granite plinth
  const W1 = [3.75, 5.05, .9, 5.3], W2 = [5.95, 7.25, .9, 5.3];
  wallHoles(-X + PW, X - PW, 0, E, 0, Z, [[GATE.x0, GATE.x1, 0, GATE.h], [DOOR.x0, DOOR.x1, 0, DOOR.h], W1, W2], stone, G);
  prism([[-X, E], [X, E], [0, AP]], 0, Z, stone, G);
  for (const [p, q] of [[-X + PW, GATE.x0 - .3], [GATE.x1 + .3, VEST.x0], [VEST.x1, X - PW]]) B(p, q, 0, .45, Z - .02, Z + .03, granite, G);
  B(-X + PW, X - PW, E - .05, E, Z, Z + .04, bronze, G);
  // dark-brown brick frame: end piers + rake bands, bronze cap
  for (const s of [-1, 1]) B(s < 0 ? -X : X - PW, s < 0 ? -X + PW : X, 0, E, 0, Z + .2, brick, G);
  prism([[-X, E + a], [0, AP + a], [X, E + a], [X, E - b], [0, AP - b], [-X, E - b]], 0, Z + .2, brick, G);
  prism([[-X - .05, E + a], [0, AP + a + .02], [X + .05, E + a], [X + .05, E + a + .08], [0, AP + a + .1], [-X - .05, E + a + .08]], -.05, Z + .26, bronze, G);
  for (const s of [-1, 1]) B(s < 0 ? -X - .05 : X - PW - .05, s < 0 ? -X + PW + .05 : X + .05, 0, .45, -.02, Z + .25, granite, G);
  for (let x = -7.5; x <= 7.6; x += 1.5) { const y = yTop(x) - b - .02; halo(G, x, y, Z + .12, 0xffd9a0, .35, .9); wash(G, x, y, Z + .01, 1.4, 1.6, 0xffc98a, .35, true); }
  // vehicle gate: projecting bronze portal, graphite sectional door
  const D = Z + .55, gx0 = GATE.x0 - .3, gx1 = GATE.x1 + .3;
  B(gx0, GATE.x0, 0, GATE.h + .3, 0, D, bronze, G); B(GATE.x1, gx1, 0, GATE.h + .3, 0, D, bronze, G); B(gx0, gx1, GATE.h, GATE.h + .3, 0, D, bronze, G);
  rollerDoor(G, GATE.x0, GATE.x1, GATE.h, .12, sectionalDoor('#3b3d40', { vision: 2, ribs: 1 }));
  const gs = signPlane(GATE.x1 - GATE.x0, .26, 260, (c, w, h) => {
    txt(c, 'ورودی خودرو', w * .7, h / 2 + .005, { px: .19, fa: 1, color: '#efe3cc', w: 1.8 });
    c.fillStyle = '#efe3cc'; c.fillRect(w / 2 - .006, .05, .012, .16);
    txt(c, 'VEHICLE ENTRANCE', w * .29, h / 2, { px: .1, color: '#efe3cc', w: 1.9, ls: 2, weight: 600 });
  }, { glow: .6, cast: false });
  gs.position.set((GATE.x0 + GATE.x1) / 2, GATE.h + .15, D + .006); G.add(gs);
  heightSign(G, -7.35, 4.3, Z + .02);
  for (const x of [gx0 - .25, gx1 + .25]) { post(G, x, D + .35, 1.0, .1, M(0xb9bec4, .3, .9)); const t = post(G, x, D + .35, .14, .102, M(0xf3c318, .5)); t.position.y = .78; }
  spot(G, (GATE.x0 + GATE.x1) / 2, GATE.h - .05, D - .1, (GATE.x0 + GATE.x1) / 2, 0, 3.5, { i: 2.2, dist: 12, angle: .8, halo: false });
  halo(G, (GATE.x0 + GATE.x1) / 2, GATE.h - .02, D - .15, 0xffe6c0, .6, .9);
  // staff entrance hallway: brick walls, bronze roof slab, teak soffit
  vestibule(G, { Z, wall: brick, roof: bronze, soffit: teak, frame: bronzeDk, canopy: .6, roofT: .42, over: .1, signCol: '#f1e4c8' });
  // tall windows with deep bronze surrounds
  for (const [x0, x1, y0, y1] of [W1, W2]) {
    win(G, x0, x1, y0, y1, Z, bronzeDk, { depth: .25, t: .05 });
    frame(G, x0 - .12, x1 + .12, y0 - .12, y1 + .12, Z + .3, .12, .3, bronze);
    B(x0, x1, 2.95, 3.01, Z - .25, Z - .17, bronzeDk, G);
  }
  // halo-lit bronze lettering in the gable
  const SY0 = 6.3, SY1 = 9.5, SW = 13;
  const draw = (c, w, h, col) => {
    const L = col || '#3a2a1c';
    drawLogo(c, w / 2, SY1 - 8.82, 1.2, col ? { red: col, navy: col } : {});
    txt(c, 'اداره ایمنی، بهداشت و محیط زیست', w / 2, SY1 - 7.72, { px: .52, fa: 1, color: L, w: 8.2 });
    txt(c, 'شرکت نفت فلات قاره ایران  ·  ناحیه بوشهر', w / 2, SY1 - 7.2, { px: .3, fa: 1, color: L, w: 8.8, weight: 500 });
    txt(c, 'HSE DEPARTMENT  ·  IRANIAN OFFSHORE OIL COMPANY  ·  BUSHEHR DISTRICT', w / 2, SY1 - 6.6, { px: .17, color: L, w: 8.6, ls: 3, weight: 600 });
  };
  const sign = signPlane(SW, SY1 - SY0, 150, (c, w, h) => draw(c, w, h), { metal: .5, rough: .4 });
  sign.position.set(0, (SY0 + SY1) / 2, Z + .05); G.add(sign);
  const hal = haloPlane(SW, SY1 - SY0, 60, (c, w, h) => draw(c, w, h, '#ffffff'), 0xffc98a, .55); hal.position.set(0, (SY0 + SY1) / 2, Z + .012); G.add(hal);
  // piers: bronze sconces washing the brick
  for (const x of [-X + PW / 2, X - PW / 2]) sconce(G, x, 3.2, Z + .2, bronzeDk, 0xffc58a, 3.6);
  // wings: travertine, brick parapet band, bronze coping, bronze windows
  wallHoles(-14.1, -X, 0, 4.0, -.05, .2, [[-13.2, -11.4, 1.0, 3.2], [-11.0, -9.4, 1.0, 3.2]], stone, G);
  B(-14.1, -X, 4.0, 4.8, -.05, .26, brick, G); B(-14.2, -X, 4.8, 4.9, -.1, .32, bronze, G);
  win(G, -13.2, -11.4, 1.0, 3.2, .2, bronze, { depth: .2 }); win(G, -11.0, -9.4, 1.0, 3.2, .2, bronze, { depth: .2 });
  wallHoles(X, 12.6, 0, 3.6, -.05, .2, [[9.6, 11.9, 1.0, 3.0]], stone, G); win(G, 9.6, 11.9, 1.0, 3.0, .2, bronze, { mullions: [10.75], depth: .2 });
  B(X, 12.6, 3.6, 4.4, -.05, .26, brick, G); B(X, 12.7, 4.4, 4.5, -.1, .32, bronze, G);
  B(-14.1, -X, 0, .45, .2, .23, granite, G); B(X, 12.6, 0, .45, .2, .23, granite, G);
  // travertine planters with clipped hedge and flowering groundcover
  B(3.5, 7.5, 0, .55, Z + .55, Z + 1.35, stone, G); hedge(G, 3.6, 7.4, .5, .95, Z + .65, Z + 1.25, FLOWER());
  B(-13.6, -9.8, 0, .55, .45, 1.25, stone, G); hedge(G, -13.5, -9.9, .5, .95, .55, 1.15, LEAF());
  landscapeA(G);
  return { G, lobbyH: 3.5 };
}
