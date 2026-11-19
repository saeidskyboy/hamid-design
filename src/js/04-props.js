// ---------- HSE props ----------
function post(g, x, z, h, r, mat) { const p = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 12), mat); p.position.set(x, h / 2, z); p.castShadow = true; g.add(p); return p; }

function e007(c, x, y, s) {
  // ISO 7010 E007 "evacuation assembly point" style pictogram
  c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = '#00843d'; c.fillRect(0, 0, 1, 1); c.strokeStyle = '#fff'; c.lineWidth = .035; c.strokeRect(.04, .04, .92, .92);
  c.fillStyle = '#fff';
  for (let i = 0; i < 4; i++) {
    c.save(); c.translate(.5, .5); c.rotate(i * Math.PI / 2 + Math.PI / 4); c.translate(0, -.42);
    c.beginPath(); c.moveTo(0, .16); c.lineTo(-.07, .06); c.lineTo(-.025, .06); c.lineTo(-.025, -.02); c.lineTo(.025, -.02); c.lineTo(.025, .06); c.lineTo(.07, .06); c.closePath(); c.fill(); c.restore();
  }
  const person = (px, py, k) => { c.beginPath(); c.arc(px, py - .1 * k, .035 * k, 0, 7); c.fill(); c.fillRect(px - .035 * k, py - .06 * k, .07 * k, .13 * k); c.fillRect(px - .03 * k, py + .07 * k, .022 * k, .09 * k); c.fillRect(px + .008 * k, py + .07 * k, .022 * k, .09 * k); };
  person(.42, .5, 1); person(.58, .5, 1); person(.5, .55, 1.15);
  c.restore();
}

function buildProps() {
  const g = new THREE.Group(); scene.add(g);
  const steel = M(0xb9bec4, .3, .9), yellow = M(0xf3c318, .5), anth = M(0x2b2f34, .45, .6);
  // assembly point in the open yard (upwind side)
  post(g, -19.5, 13, 2.6, .05, steel);
  const ap = signPlane(1.1, 1.45, 200, (c, w, h) => { c.fillStyle = '#00843d'; c.fillRect(0, 0, w, h); e007(c, .07, .07, .96); c.fillStyle = '#fff'; txt(c, 'محل تجمع اضطراری', w / 2, 1.17, { px: .12, fa: 1, w: 1 }); txt(c, 'ASSEMBLY POINT', w / 2, 1.34, { px: .095, w: 1 }); });
  ap.position.set(-19.5, 2.0, 13.06); g.add(ap);
  decal(-22, -17, 13.4, 17.4, 60, (c, w, h) => { c.strokeStyle = 'rgba(0,166,81,.9)'; c.lineWidth = .1; c.strokeRect(.1, .1, w - .2, h - .2); txt(c, 'A', w / 2, h / 2, { px: 1.4, color: 'rgba(255,255,255,.85)', weight: 800 }); }, .01);
  // slim "days without lost-time injury" totem beside the walkway
  const tot = new THREE.Group(); tot.position.set(4.3, 0, 3.7); tot.rotation.y = -.35; g.add(tot);
  B(-.5, .5, 0, 2.5, -.12, .12, anth, tot); B(-.5, .5, 0, .08, -.16, .16, anth, tot);
  const face = signPlane(.86, 2.2, 220, (c, w, h) => {
    c.fillStyle = '#f4f5f6'; c.fillRect(0, 0, w, h);
    drawLogo(c, w / 2, .36, .52);
    txt(c, 'ایمنی، اولویت نخست', w / 2, .78, { px: .085, fa: 1, w: .76, color: '#1f3478' });
    c.fillStyle = '#1f3478'; c.fillRect(.08, .92, w - .16, .006);
    txt(c, 'روزهای بدون حادثه', w / 2, 1.06, { px: .075, fa: 1, w: .76, color: '#333' });
    c.fillStyle = '#101418'; c.fillRect(.08, 1.16, w - .16, .4);
    txt(c, '۱۲۴۸', w / 2, 1.375, { px: .3, fa: 1, color: '#36d17a', w: .6 });
    txt(c, 'DAYS WITHOUT LTI', w / 2, 1.66, { px: .06, w: .76, color: '#555' });
    c.fillStyle = '#00843d'; c.fillRect(0, h - .16, w, .16);
    txt(c, 'SAFETY  ·  HEALTH  ·  ENVIRONMENT', w / 2, h - .08, { px: .045, w: .76, weight: 600 });
  }, { glow: .7, dayGlow: .05, cast: false });
  face.position.set(0, 1.33, .125); tot.add(face);
  // fire hydrant
  const hy = new THREE.Group(); hy.position.set(-8.4, 0, 3.2); g.add(hy);
  const red = M(0xc4161c, .45, .2); post(hy, 0, 0, .8, .12, red); const cap = new THREE.Mesh(new THREE.SphereGeometry(.13, 12, 8, 0, 7, 0, 1.6), red); cap.position.y = .8; hy.add(cap);
  for (const s of [-1, 1]) { const n = new THREE.Mesh(new THREE.CylinderGeometry(.05, .05, .2, 8), red); n.rotation.z = Math.PI / 2; n.position.set(s * .14, .55, 0); hy.add(n); }
  // 10 km/h sign at the driveway entry
  post(g, -8.1, 9.4, 2.4, .04, steel);
  const sl = signPlane(.6, .6, 300, (c, w) => { c.fillStyle = '#fff'; c.beginPath(); c.arc(w / 2, w / 2, w / 2, 0, 7); c.fill(); c.strokeStyle = '#d0021b'; c.lineWidth = .07; c.beginPath(); c.arc(w / 2, w / 2, w / 2 - .05, 0, 7); c.stroke(); txt(c, '10', w / 2, w / 2 + .01, { px: .28, color: '#111', weight: 800 }); });
  sl.position.set(-8.1, 2.15, 9.46); g.add(sl);
  // windsock on the left wing roof (H2S / gas release wind direction)
  const ws = new THREE.Group(); ws.position.set(-13.2, 4.8, -2.0); g.add(ws);
  post(ws, 0, 0, 4.2, .05, steel);
  const sockTex = T(cv(256, 8, (c, w) => { for (let i = 0; i < 5; i++) { c.fillStyle = i % 2 ? '#ffffff' : '#ff5a00'; c.fillRect(i * w / 5, 0, w / 5, 8); } }));
  sockTex.repeat.set(1, 1);
  const sg = new THREE.CylinderGeometry(.18, .35, 1.9, 16, 6, true); sg.rotateZ(Math.PI / 2); sg.translate(.98, 0, 0);
  { const p = sg.attributes.position, uv = sg.attributes.uv; for (let i = 0; i < p.count; i++) uv.setX(i, 1 - p.getX(i) / 1.95); }
  const sock = new THREE.Mesh(sg, M(0xffffff, .8, 0, { map: sockTex, side: THREE.DoubleSide })); sock.position.y = 4.1; sock.castShadow = true;
  const pivot = new THREE.Group(); pivot.add(sock); ws.add(pivot);
  ANIM.push(t => { pivot.rotation.y = -.5 + Math.sin(t * .23) * .35 + Math.sin(t * 1.7) * .05; sock.rotation.z = -.12 + Math.sin(t * 2.3) * .04; });
}

// ---------- vegetation ----------
function frondTex() {
  return T(cv(128, 512, (g, w, h) => {
    g.strokeStyle = '#6b6a2a'; g.lineWidth = 4; g.beginPath(); g.moveTo(w / 2, 0); g.lineTo(w / 2, h); g.stroke();
    for (let y = 10; y < h - 6; y += 7) {
      const L = (w / 2 - 4) * Math.sin(Math.PI * (y / h) * .9 + .25);
      for (const s of [-1, 1]) { g.strokeStyle = pick(['#4c7a2a', '#5b8a32', '#447025', '#6a9238']); g.lineWidth = 3.4; g.beginPath(); g.moveTo(w / 2, y); g.quadraticCurveTo(w / 2 + s * L * .5, y + 8, w / 2 + s * L, y + 26); g.stroke(); }
    }
  }), null);
}
let FROND;
function palm(x, z, h, lean = .06, rot = 0, parent = scene) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rot; parent.add(g);
  const tg = new THREE.CylinderGeometry(.2, .3, h, 10, 16); tg.translate(0, h / 2, 0);
  const p = tg.attributes.position; for (let i = 0; i < p.count; i++) { const y = p.getY(i) / h; p.setX(i, p.getX(i) + Math.pow(y, 2) * lean * h); }
  tg.computeVertexNormals();
  const bark = T(cv(32, 64, (c, w, hh) => { c.fillStyle = '#7a6a55'; c.fillRect(0, 0, w, hh); for (let y = 0; y < hh; y += 8) { c.fillStyle = '#5a4b3a'; c.fillRect(0, y, w, 3); } speckle(c, w, hh, 200, .1); }), [1.2, .5]);
  const tr = new THREE.Mesh(tg, M(0xffffff, .95, 0, { map: bark })); tr.castShadow = true; g.add(tr);
  const top = new THREE.Vector3(lean * h, h, 0);
  const fm = M(0xffffff, .85, 0, { map: FROND, alphaTest: .45, side: THREE.DoubleSide, envMapIntensity: .5 });
  const n = 16;
  for (let i = 0; i < n; i++) {
    const L = rr(3.0, 4.2), droop = rr(.5, 1.1), seg = 10, pos = [], uv = [], idx = [];
    for (let s = 0; s <= seg; s++) {
      const t = s / seg, xx = t * L, yy = Math.sin(t * 1.6) * .9 - t * t * droop * 2.2, wd = .5 * Math.sin(Math.PI * Math.min(1, t * 1.1 + .05));
      pos.push(xx, yy + wd * .25, -wd, xx, yy, 0, xx, yy + wd * .25, wd); uv.push(0, 1 - t, .5, 1 - t, 1, 1 - t);
      if (s < seg) { const a = s * 3; idx.push(a, a + 3, a + 1, a + 1, a + 3, a + 4, a + 1, a + 4, a + 2, a + 2, a + 4, a + 5); }
    }
    const fg = new THREE.BufferGeometry(); fg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); fg.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); fg.setIndex(idx); fg.computeVertexNormals();
    const f = new THREE.Mesh(fg, fm); f.castShadow = true;
    f.position.copy(top); f.rotation.y = i / n * Math.PI * 2 + rr(-.15, .15); f.rotation.z = (i % 2 ? .25 : -.05);
    g.add(f);
    const ph = rnd() * 6; ANIM.push(t => f.rotation.x = Math.sin(t * 1.1 + ph) * .025);
  }
  const nut = new THREE.Mesh(new THREE.SphereGeometry(.35, 10, 8), M(0x7a5a22, .8)); nut.position.copy(top).add(new THREE.Vector3(0, -.2, 0)); g.add(nut);
  return g;
}
// rounded box: BoxGeometry with every vertex pulled onto a rounded hull, normals set analytically
function RB(w, h, d, r, seg = 4) {
  const g = new THREE.BoxGeometry(w, h, d, seg, seg, seg), p = g.attributes.position, n = g.attributes.normal;
  const hx = w / 2 - r, hy = h / 2 - r, hz = d / 2 - r, v = new THREE.Vector3(), c = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i); c.set(THREE.MathUtils.clamp(v.x, -hx, hx), THREE.MathUtils.clamp(v.y, -hy, hy), THREE.MathUtils.clamp(v.z, -hz, hz));
    const dlt = v.clone().sub(c); if (dlt.lengthSq() < 1e-9) continue; dlt.normalize();
    p.setXYZ(i, c.x + dlt.x * r, c.y + dlt.y * r, c.z + dlt.z * r); n.setXYZ(i, dlt.x, dlt.y, dlt.z);
  }
  return g;
}
const LEAF = () => M(0xffffff, .95, 0, { map: TX.leaf, bumpMap: TX.leafB, bumpScale: .05, envMapIntensity: .4 });
const FLOWER = () => M(0xffffff, .95, 0, { map: TX.flower, bumpMap: TX.flowerB, bumpScale: .05, envMapIntensity: .4 });
// clipped hedge as a softly rounded, slightly lumpy box
function hedge(parent, x0, x1, y0, y1, z0, z1, mat) {
  const w = x1 - x0, h = y1 - y0, d = z1 - z0, r = Math.min(.14, w / 3, h / 3, d / 3);
  const g = RB(w, h, d, r, Math.max(4, Math.round(Math.max(w, d) * 3)));
  const p = g.attributes.position, n = g.attributes.normal, cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, cz = (z0 + z1) / 2;
  for (let i = 0; i < p.count; i++) {
    const X = p.getX(i) + cx, Y = p.getY(i) + cy, Z = p.getZ(i) + cz;
    const k = .025 * (Math.sin(X * 6.1 + Z * 2.3) + Math.sin(Z * 5.3 - Y * 4.1) + Math.sin(Y * 7.7 + X * 3.1));
    p.setXYZ(i, p.getX(i) + n.getX(i) * k, p.getY(i) + n.getY(i) * k * (n.getY(i) < -.5 ? 0 : 1), p.getZ(i) + n.getZ(i) * k);
  }
  g.computeVertexNormals(); meterUV(g, cx, cy, cz);
  const m = new THREE.Mesh(g, mat); m.position.set(cx, cy, cz); m.castShadow = m.receiveShadow = true; parent.add(m); return m;
}
// ornamental grass: a fountain of thin vertex-coloured blades
function grassClump(parent, x, y, z, h, n = 60, cols = ['#5c7a32', '#7a9442', '#a3a85a', '#c2b77a']) {
  const pos = [], col = [], c0 = new THREE.Color(), c1 = new THREE.Color();
  for (let i = 0; i < n; i++) {
    const a = rnd() * 6.283, r0 = rr(0, .08), lean = rr(.15, .7), hh = h * rr(.55, 1.05), w = rr(.012, .025);
    const bx = Math.cos(a) * r0, bz = Math.sin(a) * r0, dx = Math.cos(a), dz = Math.sin(a), px = -dz * w, pz = dx * w;
    const mx = bx + dx * lean * hh * .35, my = hh * .62, mz = bz + dz * lean * hh * .35;
    const tx = bx + dx * lean * hh * 1.0, ty = hh * (1 - lean * .35), tz = bz + dz * lean * hh * 1.0;
    c0.set('#3f5a22'); c1.set(pick(cols));
    const V = [[bx - px, 0, bz - pz, 0], [bx + px, 0, bz + pz, 0], [mx - px * .7, my, mz - pz * .7, .6], [mx + px * .7, my, mz + pz * .7, .6], [tx, ty, tz, 1]];
    for (const [ia, ib, ic] of [[0, 1, 2], [1, 3, 2], [2, 3, 4]]) for (const j of [ia, ib, ic]) { const v = V[j]; pos.push(v[0], v[1], v[2]); const cc = c0.clone().lerp(c1, v[3]); col.push(cc.r, cc.g, cc.b); }
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.computeVertexNormals();
  const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, side: THREE.DoubleSide, roughness: .85, envMapIntensity: .5 }));
  m.position.set(x, y, z); m.castShadow = true; parent.add(m);
  const ph = rnd() * 6; ANIM.push(t => { m.rotation.x = Math.sin(t * 1.3 + ph) * .03; m.rotation.z = Math.sin(t * 1.1 + ph) * .03; });
  return m;
}
// olive tree: gnarly multi-stem trunk; crown made of alpha-tested leaf-cluster cards with radial normals
let OLIVE_M, BARK_M;
function leafCardTex(cols, stem) {
  const S = 256;
  return T(cv(S, S, (g) => {
    g.clearRect(0, 0, S, S);
    for (let b = 0; b < 7; b++) {
      const a0 = rr(0, 6.283), L = rr(70, 118), cx = S / 2, cy = S / 2;
      g.strokeStyle = stem; g.lineWidth = 1.6; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a0) * L, cy + Math.sin(a0) * L); g.stroke();
      for (let t = .12; t < 1; t += .075) for (const sd of [-1, 1]) {
        const x = cx + Math.cos(a0) * L * t, y = cy + Math.sin(a0) * L * t, a = a0 + sd * rr(.45, .85), l = rr(9, 14);
        g.save(); g.translate(x + Math.cos(a) * l, y + Math.sin(a) * l); g.rotate(a); g.fillStyle = shade(pick(cols), rr(-.06, .06));
        g.beginPath(); g.ellipse(0, 0, l, l * .26, 0, 0, 7); g.fill(); g.restore();
      }
    }
  }), null);
}
function oliveTree(parent, x, z, s = 1, y = 0) {
  if (!OLIVE_M) {
    OLIVE_M = M(0xffffff, .8, 0, { map: leafCardTex(['#6f7f55', '#7f8f64', '#8e9b74', '#5e6e47', '#9aa684'], '#4b4636'), alphaTest: .5, side: THREE.DoubleSide, envMapIntensity: .6 });
    BARK_M = M(0x6a5e50, .95);
  }
  const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g);
  const tops = [];
  for (let i = 0; i < 4; i++) {
    const a = i * 1.6 + rr(-.3, .3), L = (i ? 1.6 : 2.1) * s * rr(.9, 1.05), c = new THREE.CylinderGeometry(.04 * s, .09 * s, L, 7); c.translate(0, L / 2, 0);
    const m = new THREE.Mesh(c, BARK_M), tilt = i ? .38 : .1; m.rotation.set(Math.sin(a) * tilt, 0, Math.cos(a) * tilt); m.castShadow = true; g.add(m);
    m.updateMatrix(); tops.push(new THREE.Vector3(0, L, 0).applyMatrix4(m.matrix));
  }
  // crown: several overlapping clouds of leaf cards
  const pos = [], nor = [], uv = [], idx = [];
  const clouds = [[0, 2.55, 0, 1.15, .75], [.75, 2.25, .25, .85, .6], [-.7, 2.3, -.2, .9, .62], [.15, 2.2, -.7, .8, .55], [-.1, 2.25, .7, .8, .55], [.2, 3.05, .1, .75, .5]];
  const q = new THREE.Quaternion(), e = new THREE.Euler(), v = new THREE.Vector3(), cen = new THREE.Vector3();
  for (const [cx, cy, cz, rx, ry] of clouds) {
    const n = Math.round(46 * rx);
    for (let i = 0; i < n; i++) {
      const u = rnd() * 6.283, w = Math.acos(rr(-.6, 1)), rad = Math.cbrt(rr(.15, 1));
      cen.set(cx + Math.sin(w) * Math.cos(u) * rx * rad, cy + Math.cos(w) * ry * rad, cz + Math.sin(w) * Math.sin(u) * rx * rad).multiplyScalar(s);
      const nrm = new THREE.Vector3((cen.x / s - cx) / rx, (cen.y / s - cy) / ry + .35, (cen.z / s - cz) / rx).normalize();
      q.setFromEuler(e.set(rnd() * 6.283, rnd() * 6.283, rnd() * 6.283)); const sz = rr(.55, .8) * s, b = pos.length / 3;
      for (const [a, c] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { v.set(a * sz / 2, c * sz / 2, 0).applyQuaternion(q).add(cen); pos.push(v.x, v.y, v.z); nor.push(nrm.x, nrm.y, nrm.z); uv.push((a + 1) / 2, (c + 1) / 2); }
      idx.push(b, b + 1, b + 2, b, b + 2, b + 3);
    }
  }
  const cg = new THREE.BufferGeometry(); cg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); cg.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); cg.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); cg.setIndex(idx);
  const crown = new THREE.Mesh(cg, OLIVE_M); crown.castShadow = true; crown.receiveShadow = true; g.add(crown);
  const ph = rnd() * 6; ANIM.push(t => { crown.rotation.x = Math.sin(t * .9 + ph) * .012; crown.rotation.z = Math.sin(t * .7 + ph) * .012; });
  return g;
}
function buildVegetation() {
  FROND = FROND || frondTex();
  // date palms beside the annexes
  palm(12.2, 5.2, 10.5, .05, .3); palm(13.0, -3.4, 9, -.04, 1.2); palm(12.9, -10, 10, .05, 2.2);
  palm(-17, 4, 8.5, .06, 2.7); palm(-20.6, 7.6, 10, -.05, .8);
  const veg = new THREE.Group(); scene.add(veg);
  oliveTree(veg, 11.4, 8.4, 1.0, .1); oliveTree(veg, -12.2, 8.6, 1.0, .1); oliveTree(veg, -19, 9.4, .95, .1);
  for (const [a, b, n] of [[9.9, 13, 4], [-21.5, -9.9, 9]]) for (let i = 0; i < n; i++) grassClump(veg, rr(a, b), .1, rr(3.0, 9.2), rr(.55, .8), 55);
  // low clipped hedge lining the lawns along the forecourt
  hedge(veg, 9.6, 13.2, .1, .65, 2.6, 3.2, LEAF()); hedge(veg, -14.2, -9.6, .1, .65, 2.6, 3.2, LEAF());
}
