'use strict';
// ---------- core: renderer, helpers, sky, lights ----------
const Q = new URLSearchParams(location.search);
const $ = s => document.querySelector(s);
const FA = "Vazirmatn, 'Noto Sans Arabic', Tahoma, sans-serif";
const EN = "'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

// treat hex colours as sRGB (r149 defaults to legacy linear, which washes colours out)
THREE.ColorManagement.legacyMode = false;
const renderer = new THREE.WebGLRenderer({ canvas: $('#c'), antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, 1, 0.3, 900);
const ANISO = Math.min(8, renderer.capabilities.getMaxAnisotropy());

// deterministic random so textures look the same on every load
let SEED = 20261119;
function rnd() { SEED |= 0; SEED = SEED + 0x6D2B79F5 | 0; let t = Math.imul(SEED ^ SEED >>> 15, 1 | SEED); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }
const rr = (a, b) => a + (b - a) * rnd();
const pick = a => a[Math.floor(rnd() * a.length)];
const v2 = (x, y) => new THREE.Vector2(x, y);
function shade(hex, k) { const c = new THREE.Color(hex); c.offsetHSL(0, 0, k); return '#' + c.getHexString(); }

function cv(w, h, fn) { const c = document.createElement('canvas'); c.width = w; c.height = h; if (fn) fn(c.getContext('2d'), w, h); return c; }
// canvas -> repeating texture; tile = size of the canvas in metres (geometry UVs are in metres)
function T(c, tile, color = true) {
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  if (color) t.encoding = THREE.sRGBEncoding;
  t.anisotropy = ANISO;
  if (tile) { const [tw, th] = Array.isArray(tile) ? tile : [tile, tile]; t.repeat.set(1 / tw, 1 / th); }
  return t;
}
function speckle(g, w, h, n, a) { for (let i = 0; i < n; i++) { g.fillStyle = rnd() < .5 ? `rgba(0,0,0,${a})` : `rgba(255,255,255,${a})`; g.fillRect(rnd() * w, rnd() * h, rr(1, 3), rr(1, 3)); } }
function M(color, rough = .7, metal = 0, extra = {}) { return new THREE.MeshStandardMaterial(Object.assign({ color, roughness: rough, metalness: metal }, extra)); }

// world-planar UVs in metres, so brick courses / panel joints continue across separate boxes
function meterUV(geo, ox = 0, oy = 0, oz = 0) {
  const p = geo.attributes.position, n = geo.attributes.normal, uv = geo.attributes.uv;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i) + ox, y = p.getY(i) + oy, z = p.getZ(i) + oz;
    const ax = Math.abs(n.getX(i)), ay = Math.abs(n.getY(i)), az = Math.abs(n.getZ(i));
    if (az >= ax && az >= ay) uv.setXY(i, x, y);
    else if (ax >= ay) uv.setXY(i, z, y);
    else uv.setXY(i, x, z);
  }
  uv.needsUpdate = true;
}
// axis-aligned box from min/max coordinates
function B(x0, x1, y0, y1, z0, z1, mat, parent, opt = {}) {
  const g = new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0);
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, cz = (z0 + z1) / 2;
  meterUV(g, cx, cy, cz);
  const m = new THREE.Mesh(g, mat);
  m.position.set(cx, cy, cz);
  m.castShadow = opt.cast !== false; m.receiveShadow = true;
  (parent || scene).add(m);
  return m;
}
// wall slab with rectangular openings [x0,x1,y0,y1]
function wallHoles(x0, x1, y0, y1, z0, z1, holes, mat, parent) {
  const X = [...new Set([x0, x1, ...holes.flatMap(h => [h[0], h[1]])])].filter(v => v >= x0 && v <= x1).sort((a, b) => a - b);
  for (let i = 0; i < X.length - 1; i++) {
    const a = X[i], b = X[i + 1], mid = (a + b) / 2;
    const cuts = holes.filter(h => h[0] < mid && h[1] > mid).map(h => [h[2], h[3]]).sort((p, q) => p[0] - q[0]);
    let y = y0;
    for (const [c0, c1] of cuts) { if (c0 > y) B(a, b, y, c0, z0, z1, mat, parent); y = Math.max(y, c1); }
    if (y < y1) B(a, b, y, y1, z0, z1, mat, parent);
  }
}
function plane(w, h, mat, parent, x, y, z, ry = 0) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
  m.position.set(x, y, z); m.rotation.y = ry;
  (parent || scene).add(m); return m;
}
function groundPlane(x0, x1, z0, z1, y, mat, parent) {
  const g = new THREE.PlaneGeometry(x1 - x0, z1 - z0); g.rotateX(-Math.PI / 2);
  const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2; meterUV(g, cx, 0, cz);
  const m = new THREE.Mesh(g, mat); m.position.set(cx, y, cz); m.receiveShadow = true;
  (parent || scene).add(m); return m;
}

// ---------- day / night ----------
const NIGHT = [];            // callbacks (isNight:boolean) => void
const onNight = f => NIGHT.push(f);
const glowTex = T(cv(128, 128, (g) => { const r = g.createRadialGradient(64, 64, 0, 64, 64, 64); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(.25, 'rgba(255,255,255,.45)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 128, 128); }));
function halo(parent, x, y, z, color = 0xffd9a0, size = .9, op = .85) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0 }));
  s.position.set(x, y, z); s.scale.set(size, size, 1); parent.add(s);
  onNight(n => s.material.opacity = n ? op : 0);
  return s;
}
function spot(parent, x, y, z, tx, ty, tz, o = {}) {
  const L = new THREE.SpotLight(o.color || 0xffd6a0, 0, o.dist || 14, o.angle || .55, o.pen ?? .75, 1.3);
  L.position.set(x, y, z); L.target.position.set(tx, ty, tz); parent.add(L, L.target);
  onNight(n => L.intensity = n ? (o.i || 2.4) : 0);
  if (o.halo !== false) halo(parent, x, y, z, o.color || 0xffd6a0, o.hs || .7);
  return L;
}
function pointL(parent, x, y, z, o = {}) {
  const L = new THREE.PointLight(o.color || 0xffe2b8, 0, o.dist || 12, 1.5);
  L.position.set(x, y, z); parent.add(L);
  onNight(n => L.intensity = n ? (o.i || 1.5) : (o.day || 0));
  return L;
}
// material whose emissive glow is switched by day/night
function glowM(color, emissive, day, night, extra = {}) {
  const m = M(color, extra.rough ?? .5, extra.metal ?? 0, Object.assign({ emissive: new THREE.Color(emissive) }, extra.mat || {}));
  onNight(n => m.emissiveIntensity = n ? night : day);
  return m;
}

// ---------- sky, environment, sun ----------
const skyU = { top: { value: new THREE.Color() }, mid: { value: new THREE.Color() }, bot: { value: new THREE.Color() } };
const skyMat = new THREE.ShaderMaterial({
  side: THREE.BackSide, depthWrite: false, uniforms: skyU,
  vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
  fragmentShader: 'uniform vec3 top, mid, bot; varying vec3 vP; void main(){ float h = vP.y; vec3 c = h > 0.0 ? mix(mid, top, pow(clamp(h,0.0,1.0), 0.5)) : mix(mid, bot, clamp(-h*5.0,0.0,1.0)); gl_FragColor = vec4(c,1.0);\n#include <encodings_fragment>\n}'
});
const sky = new THREE.Mesh(new THREE.SphereGeometry(600, 32, 16), skyMat);
sky.renderOrder = -1; scene.add(sky);
const pmrem = new THREE.PMREMGenerator(renderer);
const envScene = new THREE.Scene(); envScene.add(new THREE.Mesh(new THREE.SphereGeometry(50, 32, 16), skyMat));
const envTex = {};

const hemi = new THREE.HemisphereLight(0xd6e6ff, 0xb59b7a, .6); scene.add(hemi);
const sun = new THREE.DirectionalLight(0xfff0db, 1.7);
sun.position.set(-34, 46, 42); sun.castShadow = true;
sun.shadow.mapSize.set(4096, 4096);
Object.assign(sun.shadow.camera, { left: -38, right: 38, top: 30, bottom: -26, near: 5, far: 160 });
sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03;
scene.add(sun, sun.target); sun.target.position.set(0, 2, -4);
scene.fog = new THREE.Fog(0xcfe0ef, 120, 520);

const SKY = {
  day: { top: '#2f6fc4', mid: '#bcd7f0', bot: '#cdbb9c', fog: '#c9dcec', hemi: [0xd6e6ff, 0xb59b7a, .62], sun: [0xfff0db, 1.75], exp: 1.0 },
  night: { top: '#050a18', mid: '#1b2a4a', bot: '#0b0d12', fog: '#121b2c', hemi: [0x3a4f7a, 0x16120d, .16], sun: [0x9db4ff, .14], exp: 1.15 },
};
let isNight = false;
function setNight(n) {
  isNight = n; const s = n ? SKY.night : SKY.day;
  skyU.top.value.set(s.top); skyU.mid.value.set(s.mid); skyU.bot.value.set(s.bot);
  scene.fog.color.set(s.fog);
  hemi.color.set(s.hemi[0]); hemi.groundColor.set(s.hemi[1]); hemi.intensity = s.hemi[2];
  sun.color.set(s.sun[0]); sun.intensity = s.sun[1];
  renderer.toneMappingExposure = s.exp;
  const key = n ? 'night' : 'day';
  if (!envTex[key]) envTex[key] = pmrem.fromScene(envScene, 0.02).texture;
  scene.environment = envTex[key];
  NIGHT.forEach(f => f(n));
}
