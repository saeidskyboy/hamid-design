// ---------- procedural textures ----------
function brickCanvas(o) {
  // o: {pal, mortar, bw, bh, j, px} brick size in m, joint in m, px per m
  const px = o.px || 200, W = Math.round(o.tw * px), H = Math.round(o.th * px);
  const col = cv(W, H), bump = cv(W, H);
  const g = col.getContext('2d'), b = bump.getContext('2d');
  g.fillStyle = o.mortar; g.fillRect(0, 0, W, H); b.fillStyle = '#202020'; b.fillRect(0, 0, W, H);
  const bw = o.bw * px, bh = o.bh * px, j = o.j * px, rows = Math.round(H / bh);
  for (let r = 0; r < rows; r++) {
    const off = (r % 2) * bw / 2, n = Math.round(W / bw) + 1;
    for (let i = -1; i < n; i++) {
      const x = i * bw + off, y = r * bh;
      const c = pick(o.pal); g.fillStyle = shade(c, rr(-.025, .025));
      g.fillRect(x + j / 2, y + j / 2, bw - j, bh - j);
      for (let k = 0; k < 14; k++) { g.fillStyle = `rgba(${rnd() < .5 ? '0,0,0' : '255,220,190'},${rr(.03, .09)})`; g.fillRect(x + j / 2 + rnd() * (bw - j), y + j / 2 + rnd() * (bh - j), rr(2, 9), rr(1, 3)); }
      const gr = g.createLinearGradient(0, y, 0, y + bh); gr.addColorStop(0, 'rgba(255,255,255,.05)'); gr.addColorStop(1, 'rgba(0,0,0,.12)');
      g.fillStyle = gr; g.fillRect(x + j / 2, y + j / 2, bw - j, bh - j);
      b.fillStyle = `rgb(${200 + rr(-20, 20)},${200},${200})`; b.fillRect(x + j / 2, y + j / 2, bw - j, bh - j);
    }
  }
  speckle(g, W, H, W * H / 400, .05);
  return [col, bump];
}
function noiseCanvas(W, H, base, n, a, fn) {
  return cv(W, H, (g) => { g.fillStyle = base; g.fillRect(0, 0, W, H); if (fn) fn(g, W, H); speckle(g, W, H, n, a); });
}
const TX = {};
// large-format panels with real joints; returns [colour, bump] textures (tile in metres)
function panelTex(o) {
  const W = Math.round(o.tw * o.ppm), H = Math.round(o.th * o.ppm), c = cv(W, H), b = cv(W, H);
  const g = c.getContext('2d'), h = b.getContext('2d'), v = o.var ?? .015;
  g.fillStyle = o.joint; g.fillRect(0, 0, W, H); h.fillStyle = '#000'; h.fillRect(0, 0, W, H);
  const pw = o.pw * o.ppm, ph = o.ph * o.ppm, j = o.jw;
  for (let r = 0; r * ph < H - 1; r++) for (let i = -1; i * pw < W; i++) {
    const x = i * pw + (o.stack ? 0 : (r % 2) * pw / 2), y = r * ph;
    g.save(); g.beginPath(); g.rect(x + j / 2, y + j / 2, pw - j, ph - j); g.clip();
    g.fillStyle = shade(pick(o.cols), rr(-v, v)); g.fillRect(x, y, pw, ph);
    if (o.fn) o.fn(g, x, y, pw, ph);
    g.restore();
    h.fillStyle = '#fff'; h.fillRect(x + j / 2, y + j / 2, pw - j, ph - j);
  }
  if (o.speck) speckle(g, W, H, W * H / 60, o.speck);
  return [T(c, [o.tw, o.th]), T(b, [o.tw, o.th], false)];
}
function leafTex(base, cols, n, flowers) {
  const S = 256, c = cv(S, S, (g) => {
    g.fillStyle = base; g.fillRect(0, 0, S, S);
    const leaf = (x, y, a, l, w, col) => {
      for (const dx of [0, -S, S]) for (const dy of [0, -S, S]) {
        const X = x + dx, Y = y + dy; if (X < -14 || X > S + 14 || Y < -14 || Y > S + 14) continue;
        g.save(); g.translate(X, Y); g.rotate(a); g.fillStyle = col; g.beginPath(); g.ellipse(0, 0, l, w, 0, 0, 7); g.fill(); g.restore();
      }
    };
    for (let i = 0; i < n; i++) { const l = rr(4, 9); leaf(rnd() * S, rnd() * S, rnd() * 7, l, l * rr(.3, .5), shade(pick(cols), rr(-.07, .07))); }
    if (flowers) for (let i = 0; i < flowers; i++) { const x = rnd() * S, y = rnd() * S, col = pick(['#c8247a', '#d63d8f', '#e05aa0', '#f4f1ee', '#c8247a']); for (let k = 0; k < 5; k++) leaf(x + rr(-5, 5), y + rr(-5, 5), rnd() * 7, rr(2.5, 4), rr(2, 3.5), col); }
  });
  return [T(c, .7), T(c, .7, false)];
}
function buildTextures() {
  // dark-brown clinker brick (design A)
  const [bc, bb] = brickCanvas({ pal: ['#4a2c20', '#3e251b', '#553326', '#5c3a2a', '#38221a', '#4f3023', '#442a1f'], mortar: '#3b3430', bw: .24, bh: .075, j: .011, tw: 2.16, th: 2.25, px: 220 });
  TX.brick = T(bc, [2.16, 2.25]); TX.brickBump = T(bb, [2.16, 2.25], false);
  TX.plaster = T(noiseCanvas(256, 256, '#d9d0c1', 5000, .05), 3);
  TX.asphalt = T(noiseCanvas(512, 512, '#46484b', 26000, .07), 4);
  TX.concrete = T(noiseCanvas(512, 512, '#bdb7ad', 16000, .04, (g, W, H) => { g.strokeStyle = 'rgba(0,0,0,.14)'; g.lineWidth = 3; g.strokeRect(0, 0, W, H); }), 3);
  TX.pavers = T(cv(512, 512, (g, W) => {
    g.fillStyle = '#9a9184'; g.fillRect(0, 0, W, W); const s = W / 8;
    for (let y = 0; y < 8; y++) for (let x = 0; x < 4; x++) { g.fillStyle = shade(pick(['#c3baab', '#bdb3a3', '#c8bfb0', '#b8ae9e']), rr(-.02, .02)); g.fillRect(x * s * 2 + (y % 2) * s + 2, y * s + 2, s * 2 - 4, s - 4); }
    speckle(g, W, W, 9000, .04);
  }), 2);
  TX.grass = T(noiseCanvas(512, 512, '#6a8a3c', 30000, .1, (g, W, H) => { for (let i = 0; i < 300; i++) { g.fillStyle = `rgba(${rnd() < .5 ? '110,100,50' : '55,85,30'},.2)`; g.beginPath(); g.arc(rnd() * W, rnd() * H, rr(5, 30), 0, 7); g.fill(); } }), 5);
  TX.sand = T(noiseCanvas(512, 512, '#cdb995', 30000, .07), 6);
  // weathered apron concrete: 6 x 6 m bays with sawn joints, tyre marks and stains (12 m tile = 2 x 2 bays)
  TX.apron = T(cv(1024, 1024, (g, W) => {
    const s = W / 2;
    for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) { g.fillStyle = shade(pick(['#c9c2b5', '#c4bdaf', '#cec7ba', '#bfb8aa']), rr(-.015, .015)); g.fillRect(i * s, j * s, s, s); }
    for (let k = 0; k < 40; k++) { g.fillStyle = `rgba(${rnd() < .7 ? '70,62,52' : '235,230,220'},${rr(.02, .06)})`; g.beginPath(); g.ellipse(rnd() * W, rnd() * W, rr(20, 140), rr(15, 90), rnd() * 3, 0, 7); g.fill(); }
    for (let k = 0; k < 6; k++) { g.fillStyle = `rgba(40,34,28,${rr(.05, .12)})`; g.beginPath(); g.ellipse(rnd() * W, rnd() * W, rr(6, 26), rr(5, 18), rnd() * 3, 0, 7); g.fill(); }
    speckle(g, W, W, 60000, .045);
    g.strokeStyle = 'rgba(60,55,48,.45)'; g.lineWidth = 3; for (const v of [1.5, s, W - 1.5]) { g.beginPath(); g.moveTo(v, 0); g.lineTo(v, W); g.stroke(); g.beginPath(); g.moveTo(0, v); g.lineTo(W, v); g.stroke(); }
  }), 12);
  TX.dry = T(noiseCanvas(512, 512, '#8f8f55', 30000, .12, (g, W, H) => { for (let i = 0; i < 260; i++) { g.fillStyle = `rgba(${rnd() < .5 ? '170,150,100' : '70,95,40'},.25)`; g.beginPath(); g.arc(rnd() * W, rnd() * H, rr(5, 26), 0, 7); g.fill(); } }), 5);
  TX.roofW = T(noiseCanvas(256, 256, '#d7d6d0', 9000, .05), 4);
  TX.gravel = T(noiseCanvas(256, 256, '#b8afa0', 22000, .16), 1.2);
  TX.granite = T(noiseCanvas(256, 256, '#3c3936', 20000, .1), 1.2);
  // cream (crema) travertine, 1.2 x 0.6 m stack-bond slabs with horizontal veining
  [TX.stone, TX.stoneB] = panelTex({ tw: 2.4, th: 2.4, pw: 1.2, ph: .6, ppm: 400, stack: true, joint: '#937c5e', jw: 3, speck: .025, var: .02, cols: ['#dcc6a0', '#d6bf97', '#e0cba8', '#d2ba91', '#d9c29b'], fn: (g, x, y, w, h) => {
    for (let k = 0; k < 24; k++) { g.strokeStyle = `rgba(${rnd() < .6 ? '146,112,70' : '240,226,198'},${rr(.05, .17)})`; g.lineWidth = rr(1, 4); const yy = y + rr(0, h); g.beginPath(); g.moveTo(x, yy); g.bezierCurveTo(x + w * .3, yy + rr(-8, 8), x + w * .7, yy + rr(-8, 8), x + w, yy + rr(-6, 6)); g.stroke(); }
    for (let k = 0; k < 50; k++) { g.fillStyle = `rgba(125,98,62,${rr(.12, .3)})`; g.beginPath(); g.ellipse(x + rnd() * w, y + rnd() * h, rr(1, 4), rr(.6, 1.4), 0, 0, 7); g.fill(); }
  } });
  // off-white fibre-cement / ceramic rainscreen, 3.0 x 1.0 m (design B)
  [TX.panel, TX.panelB] = panelTex({ tw: 6, th: 3, pw: 3, ph: 1, ppm: 160, stack: true, joint: '#5a5f64', jw: 2.5, speck: .012, var: .01, cols: ['#eef0f0', '#eaeced', '#f2f3f3', '#e8ebec'] });
  // warm-white large porcelain panels, 1.2 x 2.4 m vertical (design C)
  [TX.render, TX.renderB] = panelTex({ tw: 2.4, th: 4.8, pw: 1.2, ph: 2.4, ppm: 150, stack: true, joint: '#b3ab9f', jw: 2, speck: .015, var: .01, cols: ['#efebe4', '#ece7df', '#f1ede6'] });
  // light concrete slabs for the walkway / vestibule approach
  [TX.walk] = panelTex({ tw: 2.4, th: 2.4, pw: .6, ph: .6, ppm: 200, stack: true, joint: '#8d8982', jw: 3, speck: .05, cols: ['#d2cdc4', '#cbc6bc', '#d7d2c9', '#c6c1b7'] });
  [TX.walkA] = panelTex({ tw: 2.4, th: 2.4, pw: .6, ph: 1.2, ppm: 150, joint: '#a99273', jw: 2, speck: .03, var: .02, cols: ['#dcc8a4', '#d6c09a', '#e0ccaa', '#d3bd96'] });
  [TX.walkB] = panelTex({ tw: 2.4, th: 2.4, pw: 1.2, ph: .6, ppm: 150, stack: true, joint: '#76797c', jw: 2, speck: .04, cols: ['#b9bcbd', '#b3b6b8', '#bec0c0', '#adb1b3'] });
  TX.aggr = T(noiseCanvas(512, 512, '#b5a68f', 0, 0, (g, W) => {
    for (let i = 0; i < 26000; i++) { g.fillStyle = shade(pick(['#8c7b66', '#d8ccb8', '#6e6458', '#a89276', '#e6dccb', '#9a8f80']), rr(-.05, .05)); g.beginPath(); g.ellipse(rnd() * W, rnd() * W, rr(.8, 2.2), rr(.6, 1.6), rnd() * 3, 0, 7); g.fill(); }
    g.strokeStyle = 'rgba(40,30,20,.35)'; g.lineWidth = 2; g.beginPath(); g.moveTo(0, W / 2); g.lineTo(W, W / 2); g.moveTo(0, 1); g.lineTo(W, 1); g.stroke();
  }), 2.4);
  TX.wood = T(cv(512, 128, (g, W, H) => { g.fillStyle = '#8a5a35'; g.fillRect(0, 0, W, H); for (let i = 0; i < 70; i++) { g.strokeStyle = `rgba(${rnd() < .5 ? '60,35,18' : '170,120,80'},${rr(.1, .3)})`; g.lineWidth = rr(.5, 2); g.beginPath(); const y = rnd() * H; g.moveTo(0, y); g.bezierCurveTo(W * .3, y + rr(-5, 5), W * .6, y + rr(-5, 5), W, y + rr(-3, 3)); g.stroke(); } }), [2, .5]);
  TX.woodV = TX.wood.clone(); TX.woodV.rotation = Math.PI / 2; TX.woodV.needsUpdate = true;
  TX.epoxy = T(noiseCanvas(256, 256, '#8c9196', 4000, .04), 3);
  TX.corr = T(cv(64, 8, (g, W) => { const gr = g.createLinearGradient(0, 0, W, 0); gr.addColorStop(0, '#a9adb1'); gr.addColorStop(.5, '#cfd3d6'); gr.addColorStop(1, '#a9adb1'); g.fillStyle = gr; g.fillRect(0, 0, W, 8); }), [.2, 1]);
  // PV modules 1.05 x 1.75 m (design C roof)
  TX.pv = T(cv(210, 350, (g, W, H) => {
    g.fillStyle = '#c9ccd0'; g.fillRect(0, 0, W, H); g.fillStyle = '#16223a'; g.fillRect(4, 4, W - 8, H - 8);
    g.strokeStyle = 'rgba(150,170,210,.35)'; g.lineWidth = 1;
    for (let i = 1; i < 6; i++) { g.beginPath(); g.moveTo(4 + i * (W - 8) / 6, 4); g.lineTo(4 + i * (W - 8) / 6, H - 4); g.stroke(); }
    for (let i = 1; i < 10; i++) { g.beginPath(); g.moveTo(4, 4 + i * (H - 8) / 10); g.lineTo(W - 4, 4 + i * (H - 8) / 10); g.stroke(); }
  }), [1.05, 1.75]);
  // foliage
  [TX.leaf, TX.leafB] = leafTex('#1a2b13', ['#2f5220', '#3b6527', '#46742c', '#294a1b', '#527f34'], 2600);
  [TX.olive, TX.oliveB] = leafTex('#323b29', ['#7d8b62', '#8e9a72', '#6d7a55', '#a3ad88', '#5f6b4a'], 2600);
  [TX.flower, TX.flowerB] = leafTex('#1a2b13', ['#2f5220', '#3b6527', '#46742c', '#294a1b'], 2200, 300);
}

// ---------- NIOC logo (approximation – replace with the official vector for production) ----------
const LOGO = {
  flame: new Path2D('M31,52 C28,42 33,32 40,25 C40,31 42,34 45,35 C44,25 48,13 57,4 C56,14 59,22 63,27 C63,21 65,17 68,15 C67,23 71,31 71,39 C71,45 70,49 69,52 Z'),
  stem: new Path2D('M50,73 L50,97'),
  big: new Path2D('M51.5,95 C55,83 61,76 70,76 C80,76 87,83 87,91 C87,97 82,100 77.5,98.5 C73,97 73,91 77,90.5'),
  small: new Path2D('M51.5,95 C53,88 58,85.5 62,87.5 C66,90 64,95.5 60.5,95.5 C58,95.5 57.5,93 59,92'),
};
function drawLogo(g, cx, cy, size, o = {}) {
  // logo is drawn in a 100x100 box, centred at (cx,cy)
  const red = o.red || '#e1251b', navy = o.navy || '#1f3478';
  g.save(); g.translate(cx - size / 2, cy - size / 2); g.scale(size / 100, size / 100);
  g.fillStyle = red; g.fill(LOGO.flame);
  g.fillStyle = navy; g.fillRect(31, 54, 38, 4.6); g.fillRect(33, 61, 34, 4.4); g.fillRect(36, 67.6, 28, 4);
  g.strokeStyle = navy; g.lineWidth = 5.2; g.lineCap = 'round'; g.lineJoin = 'round';
  g.stroke(LOGO.stem);
  for (const s of [1, -1]) { g.save(); if (s < 0) { g.translate(100, 0); g.scale(-1, 1); } g.stroke(LOGO.big); g.stroke(LOGO.small); g.restore(); }
  g.restore();
}

// ---------- text helpers ----------
function fitText(g, txt, weight, px, family, maxW) {
  let s = px; g.font = `${weight} ${s}px ${family}`;
  while (g.measureText(txt).width > maxW && s > 6) { s *= .96; g.font = `${weight} ${s}px ${family}`; }
  return s;
}
function txt(g, s, x, y, o) {
  // o: {px, w (maxWidth px), fa, weight, color, align, ls}
  const fam = o.fa ? FA : EN; g.direction = o.fa ? 'rtl' : 'ltr';
  g.textAlign = o.align || 'center'; g.textBaseline = 'middle'; g.fillStyle = o.color || '#fff';
  // letter spacing: o.ls = spacing in 1/40 em; context is scaled to metres, so convert via the current transform
  const sp = o.ls && 'letterSpacing' in g ? o.ls / 40 : 0;
  let size = o.px;
  for (;;) {
    g.font = `${o.weight || 700} ${size}px ${fam}`;
    if (sp) g.letterSpacing = (sp * size) + 'px';
    if (g.measureText(s).width <= (o.w || 1e5) || size < .01) break;
    size *= .96;
  }
  g.fillText(s, x, y);
  if (sp) g.letterSpacing = '0px';
}

// sign = transparent canvas on a plane; letters cast shadows (alphaTest); optional night glow
function signPlane(wm, hm, ppm, draw, o = {}) {
  const c = cv(Math.round(wm * ppm), Math.round(hm * ppm)); const g = c.getContext('2d');
  g.scale(ppm, ppm); draw(g, wm, hm);
  const tex = T(c); tex.repeat.set(1, 1); tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
  const mat = M(0xffffff, o.rough ?? .35, o.metal ?? 0, { map: tex, alphaTest: .5, transparent: false, side: THREE.DoubleSide });
  if (o.glow) { mat.emissive = new THREE.Color(0xffffff); mat.emissiveMap = tex; onNight(n => mat.emissiveIntensity = n ? o.glow : (o.dayGlow || 0)); }
  const m = new THREE.Mesh(new THREE.PlaneGeometry(wm, hm), mat);
  m.castShadow = o.cast !== false; m.receiveShadow = true;
  m.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: tex, alphaTest: .5 });
  return m;
}
// soft additive glow plane behind halo-lit letters (night only)
function haloPlane(wm, hm, ppm, draw, color, op) {
  const c = cv(Math.round(wm * ppm), Math.round(hm * ppm)); const g = c.getContext('2d');
  g.filter = `blur(${Math.round(ppm * .09)}px)`; g.scale(ppm, ppm); draw(g, wm, hm);
  const tex = T(c); tex.repeat.set(1, 1);
  const mat = new THREE.MeshBasicMaterial({ map: tex, color, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
  onNight(n => mat.opacity = n ? op : 0);
  return new THREE.Mesh(new THREE.PlaneGeometry(wm, hm), mat);
}
