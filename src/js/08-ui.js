// ---------- UI, camera controls, main loop ----------
const INFO = {
  A: {
    name: 'Brick & Travertine', fa: 'آجر و تراورتن', col: '#6b4f33',
    concept: 'Hamid\'s brick idea, used with restraint. A warm cream travertine (or travertine-look porcelain slab) field is framed by dark-brown clinker brick piers and rake bands, with bronze trims, a dark granite plinth and halo-lit lettering in the gable. Brick and stone are non-combustible, low-maintenance and durable in Bushehr\'s hot, salty air.',
    sw: [['#d9c29b', 'Cream travertine / porcelain slab'], ['#4b2a1d', 'Dark-brown clinker brick (frame only)'], ['#6b4f33', 'Bronze anodised aluminium'], ['#2b2b2b', 'Dark granite plinth'], ['#3a3d40', 'Graphite sectional door'], ['#d09a68', 'Teak-look soffit']],
    feat: ['Brick frames the gable and piers; cream travertine and bronze do the rest.', 'Projecting bronze portal at the vehicle gate, with jamb bollards and height sign.', '2 m staff hallway in brick with a teak soffit and bronze roof slab.', 'Tall windows in deep bronze surrounds limit solar gain.', 'Halo-lit lettering and brick-grazing sconces at night.', 'Garden: cream travertine-look walkway with brick borders; Persian-style raised garden with lawn, water rill, olives, bougainvillea and a stone/timber seat.'],
  },
  B: {
    name: 'Response Centre', fa: 'مرکز واکنش', col: '#a8191f',
    concept: 'Modelled on international emergency-response and fire-station buildings. A crisp white panel facade inside an anthracite frame, the vehicle bay marked by a safety-red portal (ISO 3864 colour for fire/emergency) and a glazed curtain wall with silver fins for the offices. Clear, calm and instantly readable as an HSE building.',
    sw: [['#eef0f1', 'White A2 non-combustible panels'], ['#2a2d31', 'Anthracite frame'], ['#a8191f', 'Safety red portal'], ['#1f3478', 'NIOC navy lettering'], ['#c9ced3', 'Silver aluminium fins'], ['#41586a', 'Solar-control glass']],
    feat: ['Red portal identifies the emergency vehicle exit.', 'Full-vision sectional door: drivers and staff see each other.', '2 m glazed staff hallway with an anthracite canopy.', 'Curtain wall with vertical fins for shading.', 'Red LED reveal and wall washes at night; AED / first-aid point on the facade.', 'Garden: grey slab walkway with a photoluminescent green egress line; low-water gravel garden with young date palms, boulders, grasses and benches under a white shade sail.'],
  },
  C: {
    name: 'Gable Frame', fa: 'قاب شیروانی', col: '#2a2d31',
    concept: 'Keeps the existing gable and makes it the icon. A deep anthracite folded frame traces the roof line, the gable is clad in warm timber battens behind a white logo disc, and a dark information band carries the department name. Warm-white porcelain panels below, solar panels on the roof.',
    sw: [['#efebe4', 'Warm-white porcelain panels'], ['#2a2d31', 'Anthracite folded frame'], ['#d8a374', 'Timber-look battens (fire-rated)'], ['#f2f2f2', 'White door, red bands'], ['#c8191f', 'Red district tag'], ['#1b2a3a', 'Rooftop PV']],
    feat: ['Folded frame with LED line gives a strong night silhouette.', 'Rooftop PV array: the Environment in HSE, made visible.', 'White sectional door with red bands recalls the original roller door.', '2 m staff hallway in white panels with a timber soffit.', 'Garden: exposed-aggregate concrete walkway; lawn and timber deck under a pergola with bougainvillea, benches and a shade olive.'],
  },
};
const COMMON = ['2 m staff hallway (airlock vestibule) projecting into the pavement: shade, wind and dust lobby', 'Walkway and driveway separated by a 0.5 m raised planter instead of steel bollards (UK HSE HSG136); low planting at the drive exit keeps sight lines clear', 'Small paved area only: new walkway paving about 3.8 × 8 m plus a pocket garden; the asphalt in front of the car gate stays', 'Internal-site traffic: 10 km/h limit, stop line and keep-clear box in front of the car gate', 'Clearance height sign at the vehicle gate', 'Assembly point (ISO 7010 E007) in the open yard', 'Windsock: wind direction for H₂S/gas release', '"Days without lost-time injury" board at the entrance', 'Fire hydrant and good night lighting'];
let cur = null, gateGoal = 0, gateT = 0, spin = false;
function showDesign(k) {
  k = (k || 'A').toUpperCase(); if (!DESIGNS[k]) k = 'A'; cur = k;
  for (const [key, d] of Object.entries(DESIGNS)) d.G.visible = key === k;
  setLobbyHeight(DESIGNS[k].lobbyH);
  document.querySelectorAll('.tab').forEach(b => b.classList.toggle('on', b.dataset.k === k));
  const I = INFO[k];
  $('#info').innerHTML = `<h2>${k} · ${I.name}</h2><div class="fa">${I.fa}</div>
    <p>${I.concept}</p><h3>Materials & colours</h3><div class="sw">${I.sw.map(([c, n]) => `<div><i style="background:${c}"></i>${n}</div>`).join('')}</div>
    <h3>This design</h3><ul>${I.feat.map(f => `<li>${f}</li>`).join('')}</ul>
    <h3>HSE site features (all designs)</h3><ul>${COMMON.map(f => `<li>${f}</li>`).join('')}</ul>
    <h3>Notes</h3><p class="note">Concept visualisation only. Dimensions are estimated from the photo. The NIOC logo is redrawn as an approximation, so use the official vector artwork for production. Check the existing steel frame for the extra facade and wind load, the fire rating of the materials, and the local permits.</p>`;
  try { history.replaceState(null, '', '?' + new URLSearchParams(Object.assign(Object.fromEntries(Q), { design: k.toLowerCase() }))); } catch (e) { }
}
$('#lightbox').onclick = () => $('#lightbox').style.display = 'none';

// ----- camera (spherical around a target) -----
const VIEWS = {
  front: { th: 0, ph: 1.42, r: 31, t: [0, 4.8, 0] },
  left: { th: -.72, ph: 1.36, r: 31, t: [-.5, 4.6, 0] },
  right: { th: .72, ph: 1.36, r: 31, t: [.5, 4.6, 0] },
  gate: { th: -.28, ph: 1.42, r: 14, t: [-4.2, 3.0, 0] },
  entrance: { th: .38, ph: 1.4, r: 12, t: [1.0, 2.2, 1.5] },
  garden: { th: .35, ph: 1.0, r: 21, t: [1.5, 1.0, 5.5] },
  aerial: { th: .62, ph: .78, r: 50, t: [0, 2, -5] },
};
const cam = { th: 0, ph: 1.42, r: 31, t: new THREE.Vector3(0, 4.8, 0) }, goal = { th: 0, ph: 1.42, r: 31, t: new THREE.Vector3(0, 4.8, 0) };
function setView(name, instant) {
  const v = VIEWS[name] || VIEWS.front, k = camera.aspect < 1 ? 1.7 : camera.aspect < 1.4 ? 1.25 : 1;
  goal.th = v.th; goal.ph = v.ph; goal.r = v.r * k; goal.t.set(...v.t);
  while (cam.th - goal.th > Math.PI) cam.th -= 2 * Math.PI; while (goal.th - cam.th > Math.PI) cam.th += 2 * Math.PI;
  if (instant) { Object.assign(cam, { th: goal.th, ph: goal.ph, r: goal.r }); cam.t.copy(goal.t); }
  document.querySelectorAll('[data-view]').forEach(b => b.classList.toggle('on', b.dataset.view === name));
}
function applyCam() {
  const s = Math.sin(cam.ph);
  camera.position.set(cam.t.x + cam.r * s * Math.sin(cam.th), cam.t.y + cam.r * Math.cos(cam.ph), cam.t.z + cam.r * s * Math.cos(cam.th));
  if (camera.position.y < .4) camera.position.y = .4;
  camera.lookAt(cam.t);
}
const ptr = new Map(); let pinch0 = 0, panMode = false;
const cvs = $('#c');
cvs.addEventListener('contextmenu', e => e.preventDefault());
cvs.addEventListener('pointerdown', e => { cvs.setPointerCapture(e.pointerId); ptr.set(e.pointerId, { x: e.clientX, y: e.clientY }); panMode = e.button === 2 || e.shiftKey || ptr.size === 2; if (ptr.size === 2) { const [a, b] = [...ptr.values()]; pinch0 = Math.hypot(a.x - b.x, a.y - b.y); } spin = false; $('#bSpin').classList.remove('on'); });
cvs.addEventListener('pointerup', e => { ptr.delete(e.pointerId); if (ptr.size < 2) pinch0 = 0; if (!ptr.size) panMode = false; });
cvs.addEventListener('pointercancel', e => ptr.delete(e.pointerId));
cvs.addEventListener('pointermove', e => {
  const p = ptr.get(e.pointerId); if (!p) return;
  const dx = e.clientX - p.x, dy = e.clientY - p.y; p.x = e.clientX; p.y = e.clientY;
  if (ptr.size === 2) {
    const [a, b] = [...ptr.values()], d = Math.hypot(a.x - b.x, a.y - b.y);
    if (pinch0) { goal.r = THREE.MathUtils.clamp(goal.r * pinch0 / d, 5, 130); pinch0 = d; }
  }
  if (panMode) {
    const k = goal.r * .0014, right = new THREE.Vector3().setFromMatrixColumn(camera.matrix, 0), up = new THREE.Vector3().setFromMatrixColumn(camera.matrix, 1);
    goal.t.addScaledVector(right, -dx * k).addScaledVector(up, dy * k); goal.t.y = THREE.MathUtils.clamp(goal.t.y, .3, 20);
  } else if (ptr.size === 1) {
    goal.th -= dx * .006; goal.ph = THREE.MathUtils.clamp(goal.ph - dy * .005, .15, 1.53);
  }
  document.querySelectorAll('[data-view]').forEach(b => b.classList.remove('on'));
});
cvs.addEventListener('wheel', e => { e.preventDefault(); goal.r = THREE.MathUtils.clamp(goal.r * Math.exp(e.deltaY * .0011), 5, 130); }, { passive: false });

function setGate(open) { gateGoal = open ? 1 : 0; $('#bGate').classList.toggle('on', open); $('#bGate').textContent = open ? 'Close gates' : 'Open gates'; }
function toggleNight(n) { setNight(n); $('#bNight').classList.toggle('on', n); $('#bNight').textContent = n ? 'Day' : 'Night'; }
document.querySelectorAll('[data-view]').forEach(b => b.onclick = () => setView(b.dataset.view));
$('#bNight').onclick = () => toggleNight(!isNight);
$('#bGate').onclick = () => setGate(!gateGoal);
$('#bSpin').onclick = () => { spin = !spin; $('#bSpin').classList.toggle('on', spin); };
$('#toggleInfo').onclick = () => $('#info').classList.toggle('open');
addEventListener('keydown', e => {
  if (e.key >= '1' && e.key <= '3') showDesign('ABC'[e.key - 1]);
  else if (e.key === 'n' || e.key === 'N') toggleNight(!isNight);
  else if (e.key === 'g' || e.key === 'G') setGate(!gateGoal);
});

function resize() { const w = innerWidth, h = innerHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
addEventListener('resize', resize);

const clock = new THREE.Clock();
function loop() {
  const dt = Math.min(clock.getDelta(), .1), t = clock.elapsedTime;
  if (spin) goal.th += dt * .15;
  const k = 1 - Math.pow(.0015, dt);
  cam.th += (goal.th - cam.th) * k; cam.ph += (goal.ph - cam.ph) * k; cam.r += (goal.r - cam.r) * k; cam.t.lerp(goal.t, k);
  applyCam();
  if (gateT !== gateGoal) { gateT = gateGoal > gateT ? Math.min(1, gateT + dt * .4) : Math.max(0, gateT - dt * .4); const e = gateT * gateT * (3 - 2 * gateT); GATES.forEach(f => f(e)); }
  ANIM.forEach(f => f(t, dt));
  renderer.render(scene, camera);
  requestAnimationFrame(loop);
}

async function init() {
  try { await Promise.all([document.fonts.load('700 64px Vazirmatn', 'آب'), document.fonts.load('500 64px Vazirmatn', 'آب')]); } catch (e) { console.warn('font', e); }
  buildTextures();
  buildSite();
  DESIGNS.A = designA(); DESIGNS.B = designB(); DESIGNS.C = designC();
  $('#tabs').innerHTML = Object.entries(INFO).map(([k, I]) => `<button class="tab" data-k="${k}"><b><i style="background:${I.col}"></i>${k} · ${I.name}</b><span>${I.fa}</span></button>`).join('');
  document.querySelectorAll('.tab').forEach(b => b.onclick = () => showDesign(b.dataset.k));
  if (Q.get('ui') === '0') document.body.classList.add('noui');
  resize();
  showDesign(Q.get('design'));
  toggleNight(Q.get('night') === '1');
  setView(Q.get('view') || 'front', true);
  if (Q.get('gate') === '1') { setGate(true); gateT = 1; GATES.forEach(f => f(1)); }
  if (Q.get('spin') === '1') { spin = true; $('#bSpin').classList.add('on'); }
  $('#loading').remove();
  loop();
  window.READY = true;
}
init().catch(e => { console.error(e); $('#loading').textContent = 'Error: ' + e.message; });
