// ---------- shared site: ground, existing shed, interiors, HSE props, vegetation ----------
const ANIM = [];               // per-frame callbacks (t, dt)
const GATES = [];              // callbacks (open 0..1)
const H = { x0: -8.5, x1: 8.5, d: 24, eave: 6.8, ridge: 9.2 };
const GATE = { x0: -6.6, x1: -1.8, h: 5.0 };
const DOOR = { x0: -0.5, x1: 2.5, h: 3.4 };
// staff entrance hallway (vestibule / airlock) projecting ~2 m in front of the facade into the forecourt
const VEST = { x0: -0.9, x1: 2.9, z: 2.35, h: 3.5 };

function decal(x0, x1, z0, z1, ppm, draw, y = .02) {
  const c = cv(Math.round((x1 - x0) * ppm), Math.round((z1 - z0) * ppm)); const g = c.getContext('2d'); g.scale(ppm, ppm); draw(g, x1 - x0, z1 - z0);
  const t = T(c); t.repeat.set(1, 1);
  const m = groundPlane(x0, x1, z0, z1, y, M(0xffffff, .8, 0, { map: t, transparent: true, polygonOffset: true, polygonOffsetFactor: -2 }));
  m.geometry.attributes.uv.array.set([0, 1, 1, 1, 0, 0, 1, 0]); // undo meter UVs: plain 0..1
  m.geometry.attributes.uv.needsUpdate = true;
  return m;
}

const FZ = 10.3; // forecourt depth into the yard
function buildSite() {
  // existing yard is plain concrete (see buildContext); the proposal adds a paved forecourt with lawns
  const mAsph = M(0xffffff, .92, 0, { map: TX.asphalt }), mConc = M(0xffffff, .85, 0, { map: TX.concrete });
  groundPlane(-22, 13.4, 0, FZ, 0, M(0xffffff, .85, 0, { map: TX.pavers }));
  // vehicle route: asphalt from the gate into the yard (walkway paving, divider planter and garden are per design: 04b-landscape.js)
  groundPlane(-7.6, -1.8, 0, FZ, .01, mAsph);
  // low kerb edging the forecourt (flush at the drive and the walkway)
  for (const [a, b] of [[-22, -7.6], [-1.8, VEST.x0], [VEST.x1, 13.4]]) B(a, b, 0, .1, FZ, FZ + .2, mConc);
  // lawns either side
  const mGrass = M(0xffffff, 1, 0, { map: TX.grass });
  for (const [a, b, c, d] of [[9.4, 13.4, 2.4, 9.6], [-22, -9.4, 2.4, 9.6]]) { B(a, b, 0, .1, c, d, mConc); groundPlane(a + .1, b - .1, c + .1, d - .1, .105, mGrass); }
  // keep-clear box in front of the vehicle gate (thin yellow hatch)
  decal(GATE.x0, GATE.x1, .9, 4.8, 100, (g, w, h) => {
    g.strokeStyle = 'rgba(243,195,24,.9)'; g.lineWidth = .1; g.strokeRect(.05, .05, w - .1, h - .1);
    g.save(); g.beginPath(); g.rect(.05, .05, w - .1, h - .1); g.clip(); g.lineWidth = .07;
    for (let k = -h; k < w + h; k += .9) { g.beginPath(); g.moveTo(k, 0); g.lineTo(k + h, h); g.stroke(); g.beginPath(); g.moveTo(k + h, 0); g.lineTo(k, h); g.stroke(); }
    g.restore();
  });
  // stop line + "look" marking where vehicles leave the forecourt into the yard
  decal(-7.5, -1.9, FZ - .6, FZ - .3, 60, (g, w, h) => { g.fillStyle = 'rgba(244,241,232,.92)'; g.fillRect(0, .05, w, .2); });

  buildContext();
  buildShed();
  buildInteriors();
  buildProps();
  buildVegetation();
}

function buildShed() {
  const roofTex = TX.corr.clone(); roofTex.needsUpdate = true; roofTex.rotation = Math.PI / 2;
  const mSide = M(0xffffff, .55, .35, { map: TX.corr }), mRoof = M(0xb8bcc0, .5, .45, { map: roofTex });
  const z0 = -H.d;
  B(H.x0 - .2, H.x0, 0, H.eave, z0, 0, mSide); B(H.x1, H.x1 + .2, 0, H.eave, z0, 0, mSide);
  B(H.x0, H.x1, 0, H.eave, z0, z0 + .2, mSide);
  const tri = new THREE.Shape([v2(H.x0, H.eave), v2(H.x1, H.eave), v2(0, H.ridge)]);
  const tg = new THREE.ShapeGeometry(tri); const tm = new THREE.Mesh(tg, M(0xb5b9bd, .6, .3, { side: THREE.DoubleSide })); tm.position.z = z0 + .1; scene.add(tm);
  const L = Math.hypot(8.5, 2.4), a = Math.atan2(2.4, 8.5);
  for (const s of [-1, 1]) {
    const g = new THREE.BoxGeometry(L + .5, .12, H.d + .3); meterUV(g); const m = new THREE.Mesh(g, mRoof);
    m.position.set(s * 4.25, (H.eave + H.ridge) / 2 + .06, z0 / 2); m.rotation.z = -s * a; m.castShadow = m.receiveShadow = true; scene.add(m);
  }
  // annexes (old single-storey wings) – fronts are re-clad per design
  const mPl = M(0xffffff, .9, 0, { map: TX.plaster });
  B(-13.9, -8.7, 0, 4.6, -10, -.05, mPl); B(-14.1, -8.6, 4.6, 4.8, -10.2, 0, M(0x8d8f91, .6, .3));
  B(8.7, 12.4, 0, 4.2, -8, -.05, mPl); B(8.6, 12.6, 4.2, 4.4, -8.2, 0, M(0x8d8f91, .6, .3));
  // rooftop HVAC units
  for (const x of [-12.5, -10.3]) B(x, x + 1.4, 4.8, 5.7, -7, -5.8, M(0xd9dadb, .5, .3));
}

function buildInteriors() {
  const g = new THREE.Group(); scene.add(g);
  const mWall = M(0xdfe2e4, .85), mDark = M(0x30343a, .8);
  // garage (fire / HSE response vehicle bay)
  groundPlane(-8.4, -1.2, -12, -.05, .02, M(0xffffff, .35, 0, { map: TX.epoxy, color: 0x9aa3ab }), g);
  decal(-8.3, -1.3, -11.9, -.1, 40, (c, w, h) => { c.strokeStyle = '#f3c318'; c.lineWidth = .12; c.strokeRect(.6, .6, w - 1.2, h - 1.2); }, .03);
  B(-1.3, -1.1, 0, 6.5, -12, -.4, mWall, g); B(-8.4, -1.1, 0, 6.5, -12.2, -12, mWall, g); B(-8.4, -1.1, 6.5, 6.6, -12, -.4, mDark, g);
  for (const z of [-3, -6.5, -10]) { const s = B(-6.5, -3, 6.35, 6.45, z - .15, z + .15, glowM(0xffffff, 0xffffff, .8, 1.6), g); s.castShadow = false; }
  pointL(g, -4.6, 5.5, -5, { i: 1.2, day: .5, dist: 14 });
  // shelving + extinguishers + SCBA cabinet along the back wall
  for (let i = 0; i < 3; i++) { B(-7.9 + i * 2.3, -6.1 + i * 2.3, 0, 2.2, -11.9, -11.4, M(0xc9302c, .55, .2), g); B(-7.7 + i * 2.3, -6.3 + i * 2.3, .4, 1.9, -11.4, -11.38, M(0xe8e8e8, .3, .3), g); }
  buildTruck(g, -4.3, -5.6);
  // lobby behind the staff entrance
  groundPlane(-1.1, 8.3, -7, -.05, .02, M(0xffffff, .4, 0, { map: TX.stone }), g);
  B(-1.1, 8.3, 0, 7, -7.2, -7, mWall, g);
  B(8.1, 8.3, 0, 7, -7, -.4, mWall, g);
  const wood = M(0xffffff, .6, 0, { map: TX.wood }); B(-.6, 5, 0, 3.2, -6.98, -6.9, wood, g);
  B(.2, 2.6, 0, 1.05, -5.2, -4.5, M(0xf2f2f2, .3), g); B(.1, 2.7, 1.05, 1.12, -5.25, -4.45, wood, g);
  // HSE policy board on lobby wall
  const pb = signPlane(1.6, 1.0, 150, (c, w, h) => { c.fillStyle = '#0d2a5c'; c.fillRect(0, 0, w, h); drawLogo(c, .25, .25, .38, { navy: '#fff' }); txt(c, 'خط مشی ایمنی، بهداشت و محیط زیست', w / 2 + .1, .28, { px: .09, fa: 1, w: 1.0 }); for (let i = 0; i < 5; i++) { c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(.2, .5 + i * .09, w - .4, .03); } }, { glow: .4, dayGlow: .2 });
  pb.position.set(3.6, 1.9, -6.89); g.add(pb);
  g.userData.lobbyCeil = B(-1.1, 8.3, 3.6, 3.7, -7, -.4, mWall, g);
  for (const x of [.5, 2.5, 4.5, 6.5]) halo(g, x, 3.5, -3, 0xfff0d6, .5, .7);
  pointL(g, 2.5, 3.2, -3, { i: 1.4, day: .35, dist: 10 });
  const lobby = g;
  setLobbyHeight = h => { lobby.userData.lobbyCeil.position.y = h + .05; };
}
let setLobbyHeight = () => { };

function buildTruck(parent, x, z, ry = 0) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; parent.add(g);
  const red = M(0xc8161d, .35, .3), white = M(0xf4f4f4, .35, .2), dark = M(0x1d2024, .6), glass = M(0x1b2530, .1, .6);
  B(-1.05, 1.05, .55, 1.75, -2.6, 1.4, red, g); B(-1.05, 1.05, 1.75, 2.75, .0, 1.4, red, g);
  B(-1.0, 1.0, 1.85, 2.6, 1.38, 1.42, glass, g); B(-1.06, 1.06, 1.15, 1.35, -2.62, 1.42, white, g);
  B(-1.08, 1.08, 2.0, 2.25, -2.5, -.2, white, g); B(-1.1, 1.1, .45, .62, 1.35, 1.55, dark, g);
  B(-.7, .7, 2.75, 2.88, .3, 1.0, M(0x3355ff, .3, 0, { emissive: 0x2244ff, emissiveIntensity: .6 }), g);
  for (const [wx, wz] of [[-1, -1.8], [1, -1.8], [-1, .8], [1, .8]]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(.45, .45, .32, 20), dark); w.rotation.z = Math.PI / 2; w.position.set(wx, .45, wz); w.castShadow = true; g.add(w); }
  for (const s of [-1, 1]) B(s * .75 - .15, s * .75 + .15, 1.0, 1.15, 1.4, 1.43, M(0xffffff, .2, 0, { emissive: 0xfff4d0, emissiveIntensity: .8 }), g);
  const lbl = signPlane(1.9, .5, 120, (c, w, h) => { txt(c, 'واحد امداد و آتش‌نشانی HSE', w / 2, h / 2, { px: .2, fa: 1, w: w - .1 }); }, { cast: false });
  for (const s of [-1, 1]) { const l = lbl.clone(); l.position.set(s * 1.06, 1.45, -1.1); l.rotation.y = s * Math.PI / 2; g.add(l); }
}

function rollerDoor(parent, x0, x1, h, z, canvasFn, ppm = 60) {
  // roller / sectional door that rolls up into the head; canvasFn(g,w,h) draws the leaf
  const w = x1 - x0, tex = T(cv(Math.round(w * ppm), Math.round(h * ppm), (g) => { g.scale(ppm, ppm); canvasFn(g, w, h); }));
  tex.repeat.set(1, 1); tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
  const geo = new THREE.PlaneGeometry(w, h); geo.translate(0, -h / 2, 0);
  const m = new THREE.Mesh(geo, M(0xffffff, .45, .35, { map: tex, side: THREE.DoubleSide }));
  m.position.set((x0 + x1) / 2, h, z); m.castShadow = m.receiveShadow = true; parent.add(m);
  GATES.push(t => { const k = Math.max(.02, 1 - t); m.scale.y = k; tex.repeat.y = k; tex.offset.y = 1 - k; m.visible = t < .99; });
  return m;
}
let MANIF;
function slidingDoors(parent, x0, x1, h, z, frameMat) {
  MANIF = MANIF || M(0xffffff, .5, 0, { transparent: true, opacity: .75 });
  const w = (x1 - x0) / 2, glass = M(0x9fb8c8, .05, .2, { transparent: true, opacity: .35, envMapIntensity: 1.5 });
  for (const s of [-1, 1]) {
    const leaf = new THREE.Group(); parent.add(leaf);
    const lx0 = s < 0 ? x0 : x0 + w, cx = lx0 + w / 2;
    B(lx0, lx0 + w, 0, h, z - .03, z + .03, glass, leaf, { cast: false });
    B(lx0, lx0 + .06, 0, h, z - .04, z + .04, frameMat, leaf); B(lx0 + w - .06, lx0 + w, 0, h, z - .04, z + .04, frameMat, leaf);
    B(lx0, lx0 + w, h - .08, h, z - .04, z + .04, frameMat, leaf); B(lx0, lx0 + w, 0, .08, z - .04, z + .04, frameMat, leaf);
    B(cx - .02 - s * .3, cx + .02 - s * .3, .9, 1.9, z + .04, z + .1, frameMat, leaf);
    B(lx0 + .06, lx0 + w - .06, 1.45, 1.52, z + .031, z + .036, MANIF, leaf, { cast: false });
    GATES.push(t => leaf.position.x = s * t * (w - .1));
  }
}
