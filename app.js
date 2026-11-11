'use strict';
/* =====================================================================
   Drixx Work — flyers, courses, livraisons. Tout reste sur le téléphone.
   ===================================================================== */

// ------------------------------------------------------------ utilitaires
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const nf = (n, min = 0, max = 2) => Number(n).toLocaleString('fr-FR', { minimumFractionDigits: min, maximumFractionDigits: max });
const eur = n => nf(n, 2, 2) + ' €';
const km = n => (n < 0.005 ? '0 km' : nf(n, 0, n >= 100 ? 1 : 2) + ' km');
const kmh = n => nf(n, 0, 1) + ' km/h';
const r2 = n => Math.round((n + Number.EPSILON) * 100) / 100;
const pad = n => String(n).padStart(2, '0');
const dur = ms => { const s = Math.floor(ms / 1000), h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60); return h ? `${h}:${pad(m)}:${pad(s % 60)}` : `${pad(m)}:${pad(s % 60)}`; };
const hhmm = ts => { const d = new Date(ts); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; };
const dayLong = ts => new Date(ts).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
const dayStart = ts => { const d = new Date(ts); d.setHours(0, 0, 0, 0); return d.getTime(); };
const dayKey = ts => { const d = new Date(ts); return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate(); };
const num = v => { const n = parseFloat(String(v).replace(',', '.')); return Number.isFinite(n) && n >= 0 ? n : 0; };
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

// ------------------------------------------------------------ icônes
const P = {
  home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  history: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l3 2"/>',
  chart: '<path d="M3 3v18h18"/><path d="M8 17v-5M13 17V8M18 17v-8"/>',
  sliders: '<path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1"/><circle cx="15" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="18" r="2"/>',
  flyer: '<path d="M7 3h7l5 5v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
  car: '<path d="M4 17v-4l2-6h12l2 6v4z"/><path d="M4 13h16M6.5 17v2M17.5 17v2"/><circle cx="8" cy="15" r=".6"/><circle cx="16" cy="15" r=".6"/>',
  box: '<path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="m3 8 9 5 9-5M12 13v8"/>',
  play: '<path d="M7 4.5v15l13-7.5z" fill="currentColor"/>',
  pause: '<rect x="6" y="5" width="4.2" height="14" rx="1.2" fill="currentColor"/><rect x="13.8" y="5" width="4.2" height="14" rx="1.2" fill="currentColor"/>',
  stop: '<rect x="5.5" y="5.5" width="13" height="13" rx="2.5" fill="currentColor"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  share: '<circle cx="18" cy="5" r="2.6"/><circle cx="6" cy="12" r="2.6"/><circle cx="18" cy="19" r="2.6"/><path d="m8.3 10.8 7.4-4.4M8.3 13.2l7.4 4.4"/>',
  receipt: '<path d="M5 3h14v18l-3-2-2 2-2-2-2 2-2-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  camera: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.6"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  back: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  chev: '<path d="m9 6 6 6-6 6"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="3"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  medal: '<circle cx="12" cy="9" r="5.5"/><path d="m8.5 13.5-2 7 5.5-3 5.5 3-2-7"/>',
  gps: '<path d="M3 11 21 3l-8 18-2-8z"/>',
  moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4 6.5 6.5 0 0 0 20 14.5z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"/>',
  download: '<path d="M12 4v11M7 11l5 5 5-5M5 20h14"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
  drop: '<path d="M12 3s6 6.2 6 10.5a6 6 0 0 1-12 0C6 9.2 12 3 12 3z"/>',
  wind: '<path d="M3 9h11a3 3 0 1 0-3-3M3 15h15a3 3 0 1 1-3 3M3 12h7"/>',
  road: '<path d="M8 3 4 21M16 3l4 18M12 4v3M12 10v4M12 17v3"/>',
  coin: '<circle cx="12" cy="12" r="9"/><path d="M14.8 9.2c-.6-.9-1.7-1.4-2.9-1.4-1.6 0-2.7.8-2.7 2 0 3 5.8 1.2 5.8 4.2 0 1.2-1.2 2.1-2.9 2.1-1.3 0-2.5-.5-3.1-1.5M12 6.5v1.3M12 16.2v1.3"/>',
  flame: '<path d="M12 3c1 3 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-6 1-9z"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2"/>',
  phone: '<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/>',
  bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
  printer: '<path d="M7 9V3h10v6M7 17H4v-7h16v7h-3M7 14h10v7H7z"/>',
};
const ic = (n, s = 22, w = 1.9) => `<svg class="ic" viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[n] || ''}</svg>`;
const MODES = { flyers: { label: 'Flyers', icon: 'flyer' }, course: { label: 'Course', icon: 'car' }, livraison: { label: 'Livraison', icon: 'box' } };

// ------------------------------------------------------------ données
const KEY = 'drixxwork:v1';
const DEF = () => ({
  set: {
    onboarded: false, name: '', greeting: 'Bonjour', avatar: null, theme: 'dark', accent: '#8b5cf6',
    course: { base: 3, perKm: 1.5, maint: 0.1, other: 0 },
    livraison: { base: 4, perKm: 0.7, maint: 0.1, other: 0 },
    flyerValue: 0.1, demo: false, sound: true, volume: 0.8,
    ticket: { logo: null, company: '', contact: '', footer: 'Merci pour votre confiance !' },
  },
  acts: [],      // historique (visible)
  stats: [],     // journal des statistiques (indépendant de l'historique)
  quests: {},    // quêtes débloquées { id: { ts, demo } }
  active: null,  // activité en cours
  lastMode: 'flyers',
  wx: null, lastPos: null,
});
const merge = (d, s) => { if (!s || typeof s !== 'object') return d; for (const k in d) { if (d[k] && typeof d[k] === 'object' && !Array.isArray(d[k])) d[k] = merge(d[k], s[k]); else if (s[k] !== undefined) d[k] = s[k]; } return d; };
let S;
try { S = merge(DEF(), JSON.parse(localStorage.getItem(KEY))); } catch { S = DEF(); }
let memoryOnly = false;
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { if (!memoryOnly) { memoryOnly = true; toast('Stockage plein ou bloqué : les données ne seront pas conservées'); } } }

// ------------------------------------------------------------ thème
function hexRgb(h) { h = h.replace('#', ''); if (h.length === 3) h = [...h].map(c => c + c).join(''); const n = parseInt(h, 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
function rgbHsl([r, g, b]) { r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b); let h = 0, s = 0; const l = (mx + mn) / 2; if (mx !== mn) { const d = mx - mn; s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; } return [h, s, l]; }
function hslHex(h, s, l) { h = (h % 360 + 360) % 360; const a = s * Math.min(l, 1 - l), f = n => { const k = (n + h / 30) % 12; return Math.round(255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)))).toString(16).padStart(2, '0'); }; return `#${f(0)}${f(8)}${f(4)}`; }
function applyTheme() {
  const root = document.documentElement, rgb = hexRgb(S.set.accent), [h, s, l] = rgbHsl(rgb);
  root.dataset.theme = S.set.theme;
  root.style.setProperty('--accent', S.set.accent);
  root.style.setProperty('--rgb', rgb.join(','));
  root.style.setProperty('--accent2', hslHex(h + 12, Math.min(1, s), Math.min(.8, l + .13)));
  const m = $('meta[name=theme-color]'); if (m) m.content = S.set.theme === 'dark' ? '#07060d' : '#f1eefb';
}

// ------------------------------------------------------------ sons & vibrations
let AC = null;
function tone(f, d, type = 'sine', v = .2, at = 0, to = null) {
  if (!S.set.sound || S.set.volume <= 0) return;
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    if (AC.state === 'suspended') AC.resume();
    const o = AC.createOscillator(), g = AC.createGain(), t = AC.currentTime + at;
    o.type = type; o.frequency.setValueAtTime(f, t); if (to) o.frequency.exponentialRampToValueAtTime(to, t + d);
    const vol = v * S.set.volume * S.set.volume;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(Math.max(vol, .0002), t + .012); g.gain.exponentialRampToValueAtTime(.0001, t + d);
    o.connect(g).connect(AC.destination); o.start(t); o.stop(t + d + .05);
  } catch { }
}
const buzz = ms => { try { navigator.vibrate && navigator.vibrate(ms); } catch { } };
const sfx = {
  tap: () => { tone(880, .05, 'triangle', .12); },
  nav: () => { tone(620, .06, 'sine', .12, 0, 760); },
  on: () => { tone(520, .08, 'triangle', .15); tone(780, .1, 'triangle', .15, .07); },
  off: () => { tone(780, .08, 'triangle', .13); tone(480, .1, 'triangle', .13, .07); },
  start: () => { [523, 659, 784, 1047].forEach((f, i) => tone(f, .16, 'triangle', .18, i * .075)); },
  flyer: n => { tone(560 + (n % 10) * 45, .09, 'sine', .22, 0, 700 + (n % 10) * 45); },
  pause: () => { tone(700, .1, 'triangle', .16); tone(500, .14, 'triangle', .16, .08); },
  resume: () => { tone(500, .1, 'triangle', .16); tone(740, .14, 'triangle', .16, .08); },
  stop: () => { [784, 659, 523].forEach((f, i) => tone(f, .2, 'sine', .2, i * .09)); tone(262, .5, 'triangle', .16, .28); },
  quest: () => { [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, .22, 'triangle', .2, i * .09)); tone(1568, .6, 'sine', .15, .5); },
  err: () => { tone(220, .18, 'sawtooth', .12); },
};

// ------------------------------------------------------------ toasts / feuilles
function toast(msg, cls = '', icon = '') {
  const el = document.createElement('div'); el.className = 'toast ' + cls; el.innerHTML = (icon ? ic(icon, 20) : '') + `<span>${esc(msg)}</span>`;
  $('#toasts').appendChild(el); setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 400); }, cls === 'quest' ? 4200 : 2600);
}
const sheets = []; let pendingBack = 0;
function openSheet(html, { small = false } = {}) {
  const el = document.createElement('div'); el.className = 'sheet-wrap';
  el.innerHTML = `<div class="backdrop" data-act="sheet-close"></div><div class="sheet ${small ? 'small' : ''}">${small ? '' : `<button class="sheet-x" data-act="sheet-close" aria-label="Fermer">${ic('close', 22)}</button>`}${html}</div>`;
  $('#sheets').appendChild(el); sheets.push(el); history.pushState({ m: 1 }, '');
  requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('in')));
  return el;
}
function removeSheet(el) { const i = sheets.indexOf(el); if (i < 0) return; sheets.splice(i, 1); el.classList.remove('in'); setTimeout(() => el.remove(), 420); }
function closeSheet(el) { el = el || sheets[sheets.length - 1]; if (!el || !sheets.includes(el)) return; removeSheet(el); pendingBack++; history.back(); }
function closeAllSheets() { [...sheets].forEach(closeSheet); }
function confirmBox({ title, text, ok = 'Confirmer', danger = false, onOk }) {
  const el = openSheet(`<div class="confirm"><h2>${esc(title)}</h2><p>${esc(text)}</p><div class="btns"><button class="btn soft sm" data-act="sheet-close">Annuler</button><button class="btn ${danger ? 'danger' : 'primary'} sm" data-act="confirm-ok">${esc(ok)}</button></div></div>`, { small: true });
  el._ok = onOk;
}
window.addEventListener('popstate', () => {
  if (pendingBack > 0) { pendingBack--; return; }
  if (sheets.length) { removeSheet(sheets[sheets.length - 1]); return; }
  if (route === 'quests') { go('stats', true); return; }
  if (route !== 'home') go('home', true);
});

// ------------------------------------------------------------ calculs
const elapsed = a => a.acc + (a.run ? Date.now() - a.t0 : 0);
function price(mode, kmv, flyers) {
  if (mode === 'flyers') { const t = r2(flyers * S.set.flyerValue); return { base: 0, dist: 0, maint: 0, other: 0, flyers: t, total: t }; }
  const p = S.set[mode], b = { base: p.base, dist: r2(kmv * p.perKm), maint: r2(kmv * p.maint), other: p.other, flyers: 0 };
  b.total = r2(b.base + b.dist + b.maint + b.other); return b;
}
function periodFrom(p) {
  const now = new Date();
  return { today: dayStart(now), d7: dayStart(now) - 6 * 864e5, d30: dayStart(now) - 29 * 864e5, year: new Date(now.getFullYear(), 0, 1).getTime(), all: 0 }[p];
}
function agg(list) {
  const t = { money: 0, km: 0, ms: 0, flyers: 0, n: list.length, course: 0, livraison: 0, fsess: 0, fms: 0, fkm: 0 };
  for (const a of list) {
    t.money += a.amount; t.km += a.km; t.ms += a.durMs; t.flyers += a.flyers || 0;
    if (a.mode === 'course') t.course++; else if (a.mode === 'livraison') t.livraison++; else { t.fsess++; t.fms += a.durMs; t.fkm += a.km; }
  }
  t.speed = t.ms > 0 ? t.km / (t.ms / 36e5) : 0;
  t.fpm = t.fms > 5000 ? t.flyers / (t.fms / 6e4) : 0;
  t.fpk = t.fkm > 0.05 ? t.flyers / t.fkm : null;
  return t;
}
function streaks() {
  const days = [...new Set(S.stats.map(a => dayKey(a.start)))].sort((a, b) => a - b);
  const toD = k => new Date(Math.floor(k / 10000), Math.floor(k % 10000 / 100) - 1, k % 100).getTime();
  let best = 0, run = 0, prev = null;
  for (const k of days) { const t = toD(k); run = prev !== null && Math.round((t - prev) / 864e5) === 1 ? run + 1 : 1; best = Math.max(best, run); prev = t; }
  let cur = 0; const today = dayStart(Date.now()); let t = today;
  const set = new Set(days.map(toD));
  if (!set.has(t)) t -= 864e5;
  while (set.has(t)) { cur++; t -= 864e5; }
  return { cur, best };
}

// ------------------------------------------------------------ quêtes
const QUESTS = [
  { key: 'km', title: 'Kilomètres', icon: 'road', val: t => t.km, fmt: v => nf(v, 0, 1) + ' km', tiers: [[10, 'Premiers tours de roue'], [50, 'Routard du quartier'], [100, 'Centurion de la route'], [500, 'Dévoreur d\'asphalte'], [1000, 'Légende du bitume']] },
  { key: 'fly', title: 'Flyers distribués', icon: 'flyer', val: t => t.flyers, fmt: v => nf(v, 0, 0), tiers: [[100, 'Premier courrier'], [500, 'Facteur de quartier'], [1000, 'Boîtes aux lettres en feu'], [5000, 'Tempête de papier'], [10000, 'Roi du flyer']] },
  { key: 'eur', title: 'Argent gagné', icon: 'coin', val: t => t.money, fmt: v => nf(v, 0, 0) + ' €', tiers: [[50, 'Premiers euros'], [100, 'Argent de poche'], [500, 'Joli pactole'], [1000, 'Coffre bien rempli'], [5000, 'Empire en marche']] },
  { key: 'act', title: 'Activités terminées', icon: 'check', val: t => t.n, fmt: v => nf(v, 0, 0), tiers: [[1, 'C\'est parti !'], [10, 'Habitué du terrain'], [50, 'Régulier comme une horloge'], [100, 'Infatigable'], [500, 'Machine de guerre']] },
  { key: 'str', title: 'Série de jours', icon: 'flame', val: (t, s) => s.best, fmt: v => nf(v, 0, 0) + ' j', tiers: [[3, 'Sur la lancée'], [7, 'Semaine de feu'], [14, 'Deux semaines non-stop'], [30, 'Mois d\'acier'], [60, 'Inarrêtable']] },
];
const TOTAL_Q = QUESTS.reduce((n, q) => n + q.tiers.length, 0);
function questState() {
  const t = agg(S.stats), s = streaks();
  return QUESTS.map(q => { const v = q.val(t, s); return { ...q, v, tiers: q.tiers.map(([target, name]) => ({ target, name, id: q.key + '-' + target, done: v >= target || !!S.quests[q.key + '-' + target] })) }; });
}
function checkQuests() {
  const fresh = [];
  for (const q of questState()) for (const t of q.tiers) if (t.done && !S.quests[t.id] && q.v >= t.target) { S.quests[t.id] = { ts: Date.now(), demo: !!S.set.demo }; fresh.push({ ...t, cat: q.title, icon: q.icon }); }
  return fresh;
}
function nextQuest() {
  let best = null;
  for (const q of questState()) { const t = q.tiers.find(x => !x.done); if (!t) continue; const prev = q.tiers[q.tiers.indexOf(t) - 1]; const from = prev ? prev.target : 0; const pr = Math.min(1, Math.max(0, (q.v - from) / (t.target - from))); if (!best || pr > best.pr) best = { q, t, pr }; }
  return best;
}

// ------------------------------------------------------------ GPS
const geo = { state: 'searching', watch: null, last: null, acc: null };
function geoUpdate(p) {
  geo.state = 'active'; geo.last = p; S.lastPos = { lat: p.coords.latitude, lon: p.coords.longitude, ts: Date.now() };
  const a = S.active;
  if (a && a.run) {
    const { latitude: la, longitude: lo, accuracy: ac, speed } = p.coords;
    if (ac <= 45) {
      const prev = a.last;
      if (prev) {
        const d = haversine(prev.la, prev.lo, la, lo), dt = (p.timestamp - prev.ts) / 1000;
        if (dt > 0 && d >= Math.max(4, ac * 0.25) && d / dt <= 45) { a.km += d / 1000; a.last = { la, lo, ts: p.timestamp }; }
        else if (dt > 20) a.last = { la, lo, ts: p.timestamp };
      } else a.last = { la, lo, ts: p.timestamp };
    }
    save();
  }
  paintGps();
}
function haversine(a, b, c, d) { const R = 6371000, t = x => x * Math.PI / 180, dl = t(c - a), dg = t(d - b); const h = Math.sin(dl / 2) ** 2 + Math.cos(t(a)) * Math.cos(t(c)) * Math.sin(dg / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(h)); }
function geoError(e) {
  geo.state = e.code === 1 ? 'denied' : e.code === 2 ? 'unavailable' : (geo.last ? 'active' : 'searching');
  paintGps();
}
function geoOnce() {
  if (!navigator.geolocation) { geo.state = 'unsupported'; paintGps(); return; }
  navigator.geolocation.getCurrentPosition(p => { geoUpdate(p); loadWeather(); }, geoError, { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 });
}
function geoStartWatch() {
  if (!navigator.geolocation || geo.watch !== null) return;
  geo.watch = navigator.geolocation.watchPosition(geoUpdate, geoError, { enableHighAccuracy: true, maximumAge: 1000, timeout: 20000 });
}
function geoStopWatch() { if (geo.watch !== null) { navigator.geolocation.clearWatch(geo.watch); geo.watch = null; } }
function gpsBubble() {
  const off = !navigator.onLine && geo.state !== 'active';
  if (S.set.demo && S.active) return ['', 'GPS démo'];
  if (geo.state === 'denied') return ['bad', 'GPS refusé'];
  if (geo.state === 'unsupported') return ['bad', 'GPS absent'];
  if (geo.state === 'unavailable') return ['bad', 'Position introuvable'];
  if (off) return ['off', 'Hors ligne'];
  if (geo.state === 'active') return ['', 'GPS actif'];
  return ['warn', 'Recherche GPS…'];
}
function paintGps() { const el = $('#gps'); if (!el) return; const [c, t] = gpsBubble(); el.className = 'gps ' + c; el.innerHTML = `<i></i>${ic('gps', 16)}<span>${t}</span>`; }

// verrou d'écran (garde l'écran allumé pendant l'activité)
let wl = null;
async function wakeOn() { try { if (navigator.wakeLock && !wl) { wl = await navigator.wakeLock.request('screen'); wl.addEventListener('release', () => { wl = null; }); } } catch { } }
function wakeOff() { try { wl && wl.release(); } catch { } wl = null; }
document.addEventListener('visibilitychange', () => { if (!document.hidden) { if (S.active && S.active.run) wakeOn(); tick(); } });

// ------------------------------------------------------------ météo
const WX = c => c === 0 ? ['☀️', 'Ciel dégagé'] : c === 1 ? ['🌤️', 'Plutôt dégagé'] : c === 2 ? ['⛅', 'Partiellement nuageux'] : c === 3 ? ['☁️', 'Couvert'] : c <= 48 ? ['🌫️', 'Brouillard'] : c <= 57 ? ['🌦️', 'Bruine'] : c <= 67 ? ['🌧️', 'Pluie'] : c <= 77 ? ['❄️', 'Neige'] : c <= 82 ? ['🌧️', 'Averses'] : c <= 86 ? ['🌨️', 'Averses de neige'] : ['⛈️', 'Orage'];
async function loadWeather() {
  const p = S.lastPos; if (!p) return;
  if (S.wx && Date.now() - S.wx.ts < 15 * 60e3 && Math.abs(S.wx.lat - p.lat) < .1) { paintWeather(); return; }
  try {
    const u = `https://api.open-meteo.com/v1/forecast?latitude=${p.lat.toFixed(3)}&longitude=${p.lon.toFixed(3)}&current=temperature_2m,weather_code,wind_speed_10m,is_day&hourly=temperature_2m,precipitation_probability,weather_code&timezone=auto&forecast_days=2`;
    const r = await fetch(u); if (!r.ok) throw 0; const j = await r.json();
    const now = j.current.time, idx = j.hourly.time.findIndex(t => t > now);
    const hrs = []; for (let i = idx; i < idx + 3 && i >= 0 && i < j.hourly.time.length; i++) hrs.push({ t: j.hourly.time[i].slice(11, 13) + 'h', temp: Math.round(j.hourly.temperature_2m[i]), pop: j.hourly.precipitation_probability[i] ?? 0, code: j.hourly.weather_code[i] });
    const pop = idx >= 0 ? (j.hourly.precipitation_probability[idx - 1] ?? j.hourly.precipitation_probability[idx] ?? 0) : 0;
    S.wx = { ts: Date.now(), lat: p.lat, cur: { temp: Math.round(j.current.temperature_2m), code: j.current.weather_code, wind: Math.round(j.current.wind_speed_10m), day: j.current.is_day, pop }, hrs };
    save(); paintWeather();
  } catch { paintWeather(); }
}
function weatherHTML() {
  const w = S.wx; if (!w) return `<div class="wx-empty">${navigator.onLine ? 'Météo en attente de ta position…' : 'Météo indisponible hors ligne'}</div>`;
  let [e, d] = WX(w.cur.code); if (!w.cur.day && w.cur.code <= 1) e = '🌙';
  return `<div class="wx"><div class="now"><div class="big"><span class="e">${e}</span>${w.cur.temp}°</div><div class="desc">${d}</div><div class="meta"><span style="display:flex;gap:5px;align-items:center">${ic('drop', 16)}${w.cur.pop}%</span><span style="display:flex;gap:5px;align-items:center">${ic('wind', 16)}${w.cur.wind} km/h</span></div></div>
  <div class="hrs">${w.hrs.map(h => `<div class="hr"><span class="t">${h.t}</span><span class="e">${WX(h.code)[0]}</span>${h.temp}°<span class="p">${h.pop}%</span></div>`).join('')}</div></div>`;
}
function paintWeather() { const el = $('#wx'); if (el) el.innerHTML = weatherHTML(); }

// ------------------------------------------------------------ rendu : routes
let route = 'home', histFilter = 'all', period = 'd7';
const view = $('#view');
function go(r, fromPop = false) {
  const was = route; route = r;
  if (!fromPop) { if (was === 'home' && r !== 'home') history.pushState({ r }, ''); }
  render(); window.scrollTo(0, 0);
}
function render() {
  paintNav();
  view.innerHTML = `<div class="page">${route === 'home' ? homeHTML() : route === 'history' ? historyHTML() : route === 'stats' ? statsHTML() : route === 'quests' ? questsHTML() : settingsHTML()}</div>`;
  if (route === 'home') { paintGps(); paintWeather(); tick(); }
  if (route === 'quests') $('.nav').style.display = 'none'; else $('.nav').style.display = '';
}
function paintNav() {
  const items = [['home', 'Accueil', 'home'], ['history', 'Historique', 'history'], ['stats', 'Statistiques', 'chart'], ['settings', 'Réglages', 'sliders']];
  const cur = route === 'quests' ? 'stats' : route;
  const nav = $('#nav'); nav.style.setProperty('--i', Math.max(0, items.findIndex(i => i[0] === cur)));
  nav.innerHTML = `<div class="ind"></div>` + items.map(([k, l, i]) => `<button data-act="nav" data-r="${k}" class="${k === cur ? 'on' : ''}">${ic(i, 24, 1.8)}<span>${l}</span></button>`).join('');
}

// ------------------------------------------------------------ accueil
function avatarSrc() {
  if (S.set.avatar) return S.set.avatar;
  const ch = (S.set.name || 'D').trim()[0].toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${S.set.accent}"/><stop offset="1" stop-color="#1a1035"/></linearGradient></defs><rect width="100" height="100" fill="url(#g)"/><text x="50" y="66" font-family="system-ui,sans-serif" font-size="52" font-weight="800" fill="#fff" text-anchor="middle">${esc(ch)}</text></svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}
function homeHTML() {
  const a = S.active, mode = a ? a.mode : S.lastMode, st = streaks().cur;
  const date = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  const nq = nextQuest();
  const rate = mode === 'flyers' ? `${eur(S.set.flyerValue)} par flyer` : `${nf(S.set[mode].base, 0, 2)} € + ${nf(S.set[mode].perKm + S.set[mode].maint, 0, 2)} €/km${S.set[mode].other ? ' + ' + nf(S.set[mode].other, 0, 2) + ' € de frais' : ''}`;
  return `
  <div class="head">
    <img class="avatar" src="${avatarSrc()}" alt="">
    <div class="who"><div class="date">${date}</div><h1>${esc(S.set.greeting || 'Bonjour')}${S.set.name ? ' ' + esc(S.set.name) : ''}</h1></div>
    <div class="right"><div id="gps" class="gps" data-act="gps"></div><div class="streak">${st ? '🔥 ' + st + ' J' : '&nbsp;'}</div></div>
  </div>
  ${S.set.demo ? `<div class="demo-banner">${ic('bolt', 16)} MODE DÉMO — les données seront effacées à la désactivation</div>` : ''}
  <div class="modes ${a ? 'locked' : ''}">${Object.entries(MODES).map(([k, m]) => `<button class="mode ${k === mode ? 'on' : ''}" data-act="mode" data-m="${k}"><span class="tile">${ic(m.icon, 28)}</span>${m.label.toUpperCase()}</button>`).join('')}</div>
  <section class="card glow ${a && a.run ? 'live' : ''}" id="main">
    <div class="row-top"><span class="kicker">Montant estimé</span><span id="chip">${a ? (a.run ? '<span class="chip"><i></i>En cours</span>' : '<span class="chip pause">En pause</span>') : ''}</span></div>
    <div class="amount" id="amt">0,00 €</div>
    <div class="rate">${rate}</div>
    <div class="tiles ${mode === 'flyers' ? 't3' : 't2'}">
      <div class="tile-s"><div class="k">Distance</div><div class="v" id="dist">0 km</div></div>
      <div class="tile-s"><div class="k">Durée</div><div class="v" id="dur">00:00</div></div>
      ${mode === 'flyers' ? `<div class="tile-s hl"><div class="k">Flyers</div><div class="v" id="fly">0</div></div>` : ''}
    </div>
    ${!a ? `<button class="btn primary" data-act="start">${ic('play', 24)} Démarrer</button>` : `
      ${mode === 'flyers' ? `<button class="btn ghost big" data-act="flyer" ${a.run ? '' : 'disabled style="opacity:.45"'}>${ic('plus', 30, 2.4)} 1 flyer</button>` : ''}
      <div class="btns"><button class="btn primary" data-act="pause">${a.run ? ic('pause', 22) + ' Pause' : ic('play', 22) + ' Reprendre'}</button><button class="btn danger" data-act="stop">${ic('stop', 22)} Arrêter</button></div>`}
  </section>
  <section class="card" style="margin-top:16px"><div id="wx"></div></section>
  ${nq ? `<section class="card nq" data-act="nav" data-r="quests"><div class="ico">${ic(nq.q.icon, 24)}</div><div class="tx"><b>${esc(nq.t.name)}</b><small>${nq.q.fmt(nq.q.v)} / ${nq.q.fmt(nq.t.target)}</small><div class="bar"><i style="width:${Math.round(nq.pr * 100)}%"></i></div></div>${ic('chev', 20)}</section>` : ''}`;
}
let lastAmt = null;
function tick() {
  const a = S.active, amt = $('#amt'); if (!amt) return;
  let k = 0, ms = 0, f = 0, total = 0;
  if (a) {
    if (S.set.demo && a.run && a.mode !== 'flyers') { /* simulé dans simTick */ }
    k = a.km; ms = elapsed(a); f = a.flyers; total = price(a.mode, k, f).total;
  }
  amt.textContent = eur(total);
  if (lastAmt !== null && total !== lastAmt) { amt.classList.remove('pop'); void amt.offsetWidth; amt.classList.add('pop'); }
  lastAmt = total;
  $('#dist').textContent = km(k); $('#dur').textContent = dur(ms); const fl = $('#fly'); if (fl) fl.textContent = nf(f, 0, 0);
}
let lastSim = Date.now();
setInterval(() => {
  const a = S.active, now = Date.now(), dt = (now - lastSim) / 1000; lastSim = now;
  if (a && a.run && S.set.demo) { const v = a.mode === 'flyers' ? 3.8 : 24 + Math.sin(now / 4000) * 8; a.km += v * dt / 3600; }
  if (route === 'home') tick();
  if (a && now % 5 < 1) save();
}, 250);

// ------------------------------------------------------------ actions activité
function startActivity() {
  const mode = S.lastMode;
  S.active = { id: uid(), mode, demo: !!S.set.demo, start: Date.now(), acc: 0, t0: Date.now(), run: true, km: 0, flyers: 0, last: null };
  save(); sfx.start(); buzz(30); wakeOn();
  if (!S.set.demo) { geoStartWatch(); if (geo.state === 'denied') toast('GPS refusé : la distance restera à 0', '', 'gps'); }
  lastAmt = null; render();
}
function togglePause() {
  const a = S.active; if (!a) return;
  if (a.run) { a.acc += Date.now() - a.t0; a.run = false; a.last = null; wakeOff(); sfx.pause(); }
  else { a.t0 = Date.now(); a.run = true; a.last = null; wakeOn(); sfx.resume(); }
  save(); render();
}
function addFlyer() {
  const a = S.active; if (!a || !a.run || a.mode !== 'flyers') return;
  a.flyers++; sfx.flyer(a.flyers); buzz(12); save(); tick();
}
function askStop() {
  const a = S.active; if (!a) return;
  confirmBox({ title: 'Terminer l\'activité ?', text: 'Le résumé sera enregistré dans l\'historique.', ok: 'Terminer', onOk: finishActivity });
}
function finishActivity() {
  const a = S.active; if (!a) return;
  const ms = elapsed(a), end = Date.now(); const b = price(a.mode, a.km, a.flyers);
  S.active = null; geoStopWatch(); wakeOff(); lastAmt = null;
  if (ms < 4000 && a.flyers === 0 && a.km < 0.01) { save(); sfx.err(); toast('Activité trop courte : ignorée'); render(); return; }
  const rec = { id: a.id, mode: a.mode, start: a.start, end, durMs: ms, km: a.km, flyers: a.flyers, flyerValue: S.set.flyerValue, amount: b.total, b, demo: a.demo, speed: ms > 0 ? a.km / (ms / 36e5) : 0 };
  S.acts.unshift(rec); S.stats.push({ id: rec.id, mode: rec.mode, start: rec.start, durMs: rec.durMs, km: rec.km, flyers: rec.flyers, amount: rec.amount, demo: rec.demo });
  const fresh = checkQuests(); save(); sfx.stop(); buzz([40, 40, 80]); render();
  openSummary(rec, true);
  fresh.forEach((q, i) => setTimeout(() => { sfx.quest(); toast(`Quête accomplie : ${q.name}`, 'quest', 'medal'); }, 900 + i * 1800));
}

// ------------------------------------------------------------ résumé / détails
function detailRows(a) {
  const base = [['Distance', km(a.km)], ['Durée', dur(a.durMs)], ['Heure de départ', hhmm(a.start)], ['Heure d\'arrivée', hhmm(a.end)], ['Mode', MODES[a.mode].label], ['Vitesse moyenne', kmh(a.speed)]];
  let second;
  if (a.mode === 'flyers') {
    const fpm = a.durMs > 5000 ? a.flyers / (a.durMs / 6e4) : 0, fpk = a.km > 0.05 ? a.flyers / a.km : null;
    second = [['Nombre de flyers', nf(a.flyers, 0, 0)], ['Valeur par flyer', eur(a.flyerValue)], ['Flyers / minute', nf(fpm, 0, 2)], ['Flyers / km', fpk === null ? '—' : nf(fpk, 0, 1)]];
  } else {
    second = [['Prix de base', eur(a.b.base)], ['Distance', eur(a.b.dist)], ['Entretien', eur(a.b.maint)]]; if (a.b.other) second.push(['Autres frais', eur(a.b.other)]);
  }
  return `<div class="rows">${base.map(([l, v]) => `<div class="r"><span>${l}</span><b>${v}</b></div>`).join('')}</div>
  <div class="rows">${second.map(([l, v]) => `<div class="r"><span>${l}</span><b>${v}</b></div>`).join('')}<div class="r total"><span>Total</span><b>${eur(a.amount)}</b></div></div>`;
}
function banner(a) { return `<div class="banner"><div class="kicker">${ic(MODES[a.mode].icon, 18)} ${MODES[a.mode].label} · ${dayLong(a.start).toUpperCase()}${a.demo ? ' · DÉMO' : ''}</div><div class="amount">${eur(a.amount)}</div></div>`; }
function openSummary(a, done) {
  const el = openSheet(`<h2>${done ? 'Activité terminée 🎉' : 'Détails de l\'activité'}</h2><p class="sub">${done ? 'Voici le résumé de votre activité.' : '&nbsp;'}</p>${banner(a)}${detailRows(a)}
  <div class="stack">
    <button class="btn ghost sm" data-act="share-ticket" data-id="${a.id}">${ic('share', 20)} Partager le ticket</button>
    ${done ? `<button class="btn primary sm" data-act="sheet-close">${ic('check', 20)} Fermer</button>` : ''}
    <button class="btn ${done ? 'ghost' : 'soft'} sm" data-act="gen-ticket" data-id="${a.id}">${ic('receipt', 20)} Générer le ticket</button>
    ${done ? '' : `<button class="btn soft sm" style="color:var(--bad)" data-act="del-act" data-id="${a.id}">${ic('trash', 20)} Supprimer</button>`}
  </div>`);
  return el;
}

// ------------------------------------------------------------ ticket
const loadImg = src => new Promise((ok, ko) => { const i = new Image(); i.onload = () => ok(i); i.onerror = ko; i.src = src; });
async function makeTicket(a) {
  const W = 576, M = 30, c = document.createElement('canvas'); c.width = W; c.height = 3000;
  const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, W, c.height); x.fillStyle = '#000'; x.textBaseline = 'top';
  const FONT = 'ui-monospace,"SF Mono",Menlo,Consolas,"Roboto Mono",monospace';
  let y = 26;
  const text = (s, size, o = {}) => { x.font = `${o.bold ? '800 ' : '500 '}${size}px ${FONT}`; x.textAlign = o.align || 'left'; x.fillText(s, o.align === 'center' ? W / 2 : o.align === 'right' ? W - M : M, y); };
  const wrap = (s, size, o = {}) => { x.font = `${o.bold ? '800 ' : '500 '}${size}px ${FONT}`; const out = []; for (const para of String(s).split('\n')) { let line = ''; for (const w of para.split(' ')) { const t = line ? line + ' ' + w : w; if (x.measureText(t).width > W - 2 * M && line) { out.push(line); line = w; } else line = t; } out.push(line); } for (const l of out) { text(l, size, o); y += size * 1.35; } };
  const dash = () => { y += 6; x.setLineDash([8, 6]); x.lineWidth = 2; x.beginPath(); x.moveTo(M, y); x.lineTo(W - M, y); x.stroke(); x.setLineDash([]); y += 16; };
  const row = (l, r, o = {}) => { const s = o.size || 25; x.font = `${o.bold ? '800 ' : '500 '}${s}px ${FONT}`; x.textAlign = 'left'; x.fillText(l, M, y); x.textAlign = 'right'; x.fillText(r, W - M, y); y += s * 1.55; };
  const t = S.set.ticket;
  if (t.logo) { try { const im = await loadImg(t.logo), h = Math.min(120, im.height * (260 / im.width)), w = im.width * h / im.height; x.drawImage(im, (W - w) / 2, y, w, h); y += h + 16; } catch { } }
  if (t.company) { wrap(t.company, 34, { bold: true, align: 'center' }); y += 4; }
  if (t.contact) wrap(t.contact, 22, { align: 'center' });
  dash(); text('TICKET D\'ACTIVITÉ', 28, { bold: true, align: 'center' }); y += 40;
  if (a.demo) { text('*** MODE DÉMO ***', 24, { bold: true, align: 'center' }); y += 34; }
  dash();
  row('Date', new Date(a.start).toLocaleDateString('fr-FR')); row('Mode', MODES[a.mode].label); row('Départ', hhmm(a.start)); row('Arrivée', hhmm(a.end)); row('Durée', dur(a.durMs));
  if (a.km >= 0.005 || a.mode !== 'flyers') { row('Distance', km(a.km)); row('Vitesse moy.', kmh(a.speed)); }
  dash();
  if (a.mode === 'flyers') { row('Flyers distribués', nf(a.flyers, 0, 0)); row('Valeur par flyer', eur(a.flyerValue)); }
  else { row('Prix de base', eur(a.b.base)); row(`Distance (${km(a.km)})`, eur(a.b.dist)); row('Entretien', eur(a.b.maint)); if (a.b.other) row('Autres frais', eur(a.b.other)); }
  dash(); row('TOTAL', eur(a.amount), { bold: true, size: 40 }); y += 6; dash();
  if (t.footer) { y += 4; wrap(t.footer, 24, { bold: true, align: 'center' }); }
  y += 4; text('Ticket généré par Drixx Work', 18, { align: 'center' }); y += 50;
  const out = document.createElement('canvas'); out.width = W; out.height = Math.ceil(y); out.getContext('2d').drawImage(c, 0, 0);
  return out;
}
const toBlob = c => new Promise(r => c.toBlob(r, 'image/png'));
async function shareTicket(a) {
  try {
    const blob = await toBlob(await makeTicket(a)), file = new File([blob], `ticket-${new Date(a.start).toISOString().slice(0, 10)}.png`, { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: 'Ticket Drixx Work' }); return; }
    downloadBlob(blob, file.name); toast('Partage indisponible : ticket enregistré', '', 'download');
  } catch (e) { if (e && e.name !== 'AbortError') { sfx.err(); toast('Impossible de partager le ticket'); } }
}
function downloadBlob(b, name) { const u = URL.createObjectURL(b), l = document.createElement('a'); l.href = u; l.download = name; document.body.appendChild(l); l.click(); l.remove(); setTimeout(() => URL.revokeObjectURL(u), 4000); }
async function showTicket(a) {
  const cv = await makeTicket(a), url = cv.toDataURL('image/png');
  openSheet(`<h2>Ticket</h2><p class="sub">Prêt à montrer ou à envoyer à l'imprimante.</p><div class="ticket-prev"><img src="${url}" alt="Ticket"></div>
  <div class="btns"><button class="btn primary sm" data-act="share-ticket" data-id="${a.id}">${ic('share', 20)} Partager</button><button class="btn soft sm" data-act="dl-ticket" data-id="${a.id}">${ic('download', 20)} Enregistrer</button></div>`);
}
const findAct = id => S.acts.find(a => a.id === id);

// ------------------------------------------------------------ historique
function historyHTML() {
  const list = S.acts.filter(a => histFilter === 'all' || a.mode === histFilter);
  const F = [['all', 'Tout'], ['flyers', 'Flyers'], ['course', 'Courses'], ['livraison', 'Livraisons']];
  return `<h1 class="title">Historique</h1>
  <div class="filters">${F.map(([k, l]) => `<button class="fchip ${histFilter === k ? 'on' : ''}" data-act="hfilter" data-k="${k}">${l}</button>`).join('')}</div>
  ${list.length ? list.map(a => `<button class="card act glow" data-act="open-act" data-id="${a.id}"><div class="ico">${ic(MODES[a.mode].icon, 28)}</div>
    <div class="mid"><div class="l1"><span>${MODES[a.mode].label}${a.demo ? '<span class="pill">DÉMO</span>' : ''}</span><em>${eur(a.amount)}</em></div>
    <div class="l2">${dayLong(a.start)} · ${hhmm(a.start)} → ${hhmm(a.end)}<br>${km(a.km)} · ${dur(a.durMs)} · ${kmh(a.speed)}${a.mode === 'flyers' ? ' · ' + nf(a.flyers, 0, 0) + ' flyers' : ''}</div></div>${ic('chev', 20)}</button>`).join('')
      : `<div class="empty">${ic('history', 54, 1.4)}<p>Rien ici pour le moment.<br>Tes activités terminées apparaîtront dans cette page.</p></div>`}`;
}

// ------------------------------------------------------------ statistiques
function statsHTML() {
  const P_ = [['today', 'Aujourd\'hui'], ['d7', '7 jours'], ['d30', '30 jours'], ['year', 'Cette année'], ['all', 'Tout']];
  const t = agg(S.stats.filter(a => a.start >= periodFrom(period === 'd7' ? 'd7' : period)));
  const card = (k, v, i) => `<div class="card stat glow"><div class="k">${i ? ic(i, 15) : ''}${k}</div><div class="v">${v}</div></div>`;
  return `<h1 class="title">Statistiques</h1>
  <div class="periods">${P_.map(([k, l]) => `<button class="fchip ${period === k ? 'on' : ''}" data-act="period" data-k="${k}">${l}</button>`).join('')}</div>
  <div class="hero"><div class="kicker">Argent gagné</div><div class="amount">${eur(t.money)}</div><div style="opacity:.9;font-size:17px">${t.n} activité${t.n > 1 ? 's' : ''}</div></div>
  <div class="grid2">
    ${card('Distance totale', km(t.km))}${card('Durée totale', dur(t.ms))}
    ${card('Flyers distribués', nf(t.flyers, 0, 0), 'flyer')}${card('Courses', t.course, 'car')}
    ${card('Livraisons', t.livraison, 'box')}${card('Sessions flyers', t.fsess, 'flyer')}
    ${card('Vitesse moyenne', kmh(t.speed))}${card('Flyers / minute', nf(t.fpm, 0, 2), 'flyer')}
    ${card('Flyers / km', t.fpk === null ? '—' : nf(t.fpk, 0, 1), 'flyer')}${card('Série en cours', streaks().cur + ' j', 'flame')}
  </div>
  <button class="fab" data-act="nav" data-r="quests" aria-label="Quêtes">${ic('medal', 28)}</button>`;
}

// ------------------------------------------------------------ quêtes
function questsHTML() {
  const qs = questState(), done = qs.reduce((n, q) => n + q.tiers.filter(t => t.done).length, 0);
  return `<div class="qhead"><button class="back" data-act="nav" data-r="stats" aria-label="Retour">${ic('back', 22)}</button><h1>Quêtes</h1><span class="count">${done}/${TOTAL_Q}</span></div>
  ${qs.map(q => { const cur = q.tiers.find(t => !t.done); return `<section class="card qcat"><h3>${ic(q.icon, 20)} ${q.title}</h3><div class="chain">
    ${q.tiers.map(t => { const prevT = q.tiers[q.tiers.indexOf(t) - 1], from = prevT ? prevT.target : 0, p = Math.max(0, Math.min(1, (q.v - from) / (t.target - from)));
      const st = t.done ? 'done' : t === cur ? 'cur' : 'lock';
      return `<div class="step ${st}"><div class="si">${ic(st === 'lock' ? 'lock' : st === 'done' ? 'check' : q.icon, 22)}</div><div class="st"><b>${esc(t.name)}</b><small>${t.done ? 'Accomplie · ' : ''}${q.fmt(t.target)}</small>${st === 'cur' ? `<div class="bar"><i style="width:${Math.round(p * 100)}%"></i></div>` : ''}</div>${st === 'cur' ? `<span class="pct">${Math.round(p * 100)}%</span>` : ''}</div>`; }).join('')}
  </div></section>`; }).join('')}`;
}

// ------------------------------------------------------------ réglages
const SWATCH = ['#8b5cf6', '#3b82f6', '#22b8cf', '#34d399', '#f59e0b', '#ef4444', '#ec4899'];
let installEvt = null;
const standalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone;
function priceBlock(k, title, icon) {
  const p = S.set[k], row = (f, l, u) => `<div class="set-row"><label>${l}</label><input class="inp num" inputmode="decimal" data-bind="${k}.${f}" value="${nf(p[f], 0, 3)}"><span class="unit">${u}</span></div>`;
  return `<div class="set-row" style="color:var(--accent2);font-weight:800;border-top:0;padding-bottom:6px"><span class="lb" style="display:flex;gap:10px;align-items:center">${ic(icon, 22)} ${title}</span></div>${row('base', 'Prix de base', '€')}${row('perKm', 'Prix par km', '€/km')}${row('maint', 'Entretien par km', '€/km')}${row('other', 'Autres frais', '€')}`;
}
function settingsHTML() {
  const s = S.set, t = s.ticket;
  return `<h1 class="title">Réglages</h1>
  <div class="sect">Profil</div>
  <div class="card group"><div class="profile"><button class="pf-av" data-act="pick-avatar"><img src="${avatarSrc()}" alt=""><span class="cam">${ic('camera', 16)}</span></button><div><b style="font-size:19px">${esc(s.greeting)}${s.name ? ' ' + esc(s.name) : ''}</b><div class="sub" style="margin-top:4px">Touchez la photo pour la modifier</div></div></div>
    <div class="set-row"><label>Texte d'accueil</label><input class="inp" data-bind="greeting" value="${esc(s.greeting)}" maxlength="24"></div>
    <div class="set-row"><label>Nom affiché</label><input class="inp" data-bind="name" value="${esc(s.name)}" maxlength="24" placeholder="Ton pseudo"></div></div>
  <div class="sect">Apparence</div>
  <div class="card group"><div class="seg"><button class="${s.theme === 'dark' ? 'on' : ''}" data-act="theme" data-t="dark">${ic('moon', 20)} Sombre</button><button class="${s.theme === 'light' ? 'on' : ''}" data-act="theme" data-t="light">${ic('sun', 20)} Clair</button></div>
    <div class="set-row" style="border-top:1px solid var(--line)"><label>Couleur principale</label></div>
    <div class="swatches">${SWATCH.map(c => `<button class="sw ${s.accent.toLowerCase() === c ? 'on' : ''}" style="background:${c};color:${c}" data-act="accent" data-c="${c}" aria-label="${c}"></button>`).join('')}<label class="sw custom ${SWATCH.includes(s.accent.toLowerCase()) ? '' : 'on'}" style="${SWATCH.includes(s.accent.toLowerCase()) ? '' : 'background:' + s.accent}">${ic('plus', 18)}<input type="color" data-act-input="accent" value="${s.accent}"></label></div></div>
  <div class="sect">Tarification course / livraison</div>
  <div class="card group">${priceBlock('course', 'Tarification course', 'car')}<div style="height:8px"></div>${priceBlock('livraison', 'Tarification livraison', 'box')}</div>
  <div class="sect">Flyers</div>
  <div class="card group"><div class="set-row"><label>Valeur d'un flyer</label><input class="inp num" inputmode="decimal" data-bind="flyerValue" value="${nf(s.flyerValue, 0, 3)}"><span class="unit">€</span></div>
    <div class="set-row"><span class="sub" id="f100">100 flyers = ${eur(s.flyerValue * 100)}</span></div></div>
  <div class="sect">Mode démo</div>
  <div class="card group"><div class="set-row"><label>Mode démo</label><button class="switch ${s.demo ? 'on' : ''}" data-act="demo" aria-label="Mode démo"></button></div>
    <div class="set-row"><span class="sub">Fais une fausse course pour présenter l'app : le GPS est simulé et les activités s'enregistrent normalement. En désactivant le mode démo, tout ce qui a été enregistré en démo est supprimé de l'historique, des statistiques et des quêtes.</span></div></div>
  <div class="sect">Sons</div>
  <div class="card group"><div class="set-row"><label>Sons d'interface</label><button class="switch ${s.sound ? 'on' : ''}" data-act="sound" aria-label="Sons"></button></div>
    <div class="set-row" style="display:block"><div style="display:flex;justify-content:space-between;margin-bottom:12px"><label>Volume</label><b id="volv" style="color:var(--mut)">${Math.round(s.volume * 100)}%</b></div><input type="range" min="0" max="100" value="${Math.round(s.volume * 100)}" data-act-input="volume"></div></div>
  <div class="sect">Ticket</div>
  <div class="card group"><div class="set-row"><div class="logo-prev">${t.logo ? `<img src="${t.logo}" alt="">` : 'Logo'}</div><div style="flex:1;padding-left:4px"><div style="font-size:16.5px">Logo du ticket</div><div style="display:flex;gap:16px;margin-top:6px"><button class="link" data-act="pick-logo">${t.logo ? 'Changer' : 'Ajouter'}</button>${t.logo ? '<button class="link red" data-act="rm-logo">Retirer</button>' : ''}</div></div></div>
    <div class="set-row"><label>Nom de l'entreprise</label><input class="inp" data-bind="ticket.company" value="${esc(t.company)}" maxlength="40"></div>
    <div class="set-row" style="display:block"><label style="display:block;margin-bottom:10px">Coordonnées</label><textarea class="inp" data-bind="ticket.contact" placeholder="Adresse&#10;Téléphone&#10;SIRET">${esc(t.contact)}</textarea></div>
    <div class="set-row"><label>Message de fin</label><input class="inp" data-bind="ticket.footer" value="${esc(t.footer)}" maxlength="80"></div>
    <div class="set-row"><span style="color:var(--mut)">${ic('printer', 22)}</span><span class="sub" style="flex:1;padding-left:6px">Le ticket est une image au format 80 mm. Touche « Partager le ticket », choisis Bluetooth ou l'application de ton imprimante, et il s'imprime.</span></div></div>
  <div class="sect">Application</div>
  <div class="card group">
    ${!standalone() && installEvt ? `<button class="danger-row" style="color:var(--accent2)" data-act="install">${ic('download', 22)} Installer l'application</button>` : ''}
    <button class="danger-row" style="color:var(--accent2)" data-act="share-app">${ic('share', 22)} Partager l'application</button>
    <button class="danger-row" style="color:var(--accent2)" data-act="tour">${ic('info', 22)} Revoir la présentation</button></div>
  <div class="sect">Historique / données</div>
  <div class="card group"><button class="danger-row" data-act="reset" data-k="home">${ic('trash', 22)} Réinitialiser l'accueil</button><button class="danger-row" data-act="reset" data-k="history">${ic('trash', 22)} Réinitialiser l'historique</button><button class="danger-row" data-act="reset" data-k="stats">${ic('trash', 22)} Réinitialiser les statistiques</button></div>
  <p class="foot">Drixx Work · tes données restent sur ce téléphone</p>`;
}
const RESETS = {
  home: { title: 'Réinitialiser l\'accueil ?', text: 'L\'activité en cours sera annulée et l\'écran redémarré. Utile en cas de bug. L\'historique et les statistiques ne sont pas touchés.', run: () => { S.active = null; save(); location.reload(); } },
  history: { title: 'Vider l\'historique ?', text: 'Toutes les activités de la liste seront supprimées. Les statistiques et les quêtes sont conservées.', run: () => { S.acts = []; save(); toast('Historique vidé'); render(); } },
  stats: { title: 'Réinitialiser les statistiques ?', text: 'Les statistiques et les quêtes accomplies repartent de zéro. L\'historique est conservé.', run: () => { S.stats = []; S.quests = {}; save(); toast('Statistiques remises à zéro'); render(); } },
};
function setDemo(on) {
  if (on) { S.set.demo = true; save(); render(); toast('Mode démo activé', '', 'bolt'); sfx.on(); return; }
  if (S.active && S.active.demo) { S.active = null; geoStopWatch(); wakeOff(); }
  S.acts = S.acts.filter(a => !a.demo); S.stats = S.stats.filter(a => !a.demo);
  for (const k in S.quests) if (S.quests[k].demo) delete S.quests[k];
  S.set.demo = false; save(); render(); sfx.off(); toast('Mode démo désactivé : données de démo supprimées');
}
function bind(path, val) {
  const ks = path.split('.'); let o = S.set; while (ks.length > 1) o = o[ks.shift()];
  const k = ks[0]; o[k] = typeof o[k] === 'number' ? num(val) : val; save();
  if (path === 'flyerValue') { const e = $('#f100'); if (e) e.textContent = `100 flyers = ${eur(S.set.flyerValue * 100)}`; }
  if (path === 'name' || path === 'greeting') { const b = $('.profile b'); if (b) b.textContent = S.set.greeting + (S.set.name ? ' ' + S.set.name : ''); }
}
function pickImage(cb, size, png) {
  const i = document.createElement('input'); i.type = 'file'; i.accept = 'image/*';
  i.onchange = async () => {
    const f = i.files[0]; if (!f) return;
    try {
      const url = URL.createObjectURL(f), im = await loadImg(url), c = document.createElement('canvas'), x = c.getContext('2d');
      if (png) { const sc = Math.min(1, size / Math.max(im.width, im.height)); c.width = im.width * sc; c.height = im.height * sc; x.drawImage(im, 0, 0, c.width, c.height); }
      else { const m = Math.min(im.width, im.height), sc = size / m; c.width = c.height = size; x.drawImage(im, (im.width - m) / 2, (im.height - m) / 2, m, m, 0, 0, size, size); }
      URL.revokeObjectURL(url); cb(c.toDataURL(png ? 'image/png' : 'image/jpeg', .85));
    } catch { toast('Image illisible'); }
  };
  i.click();
}

// ------------------------------------------------------------ tutoriel (premier lancement)
let onbStep = 0, onbTotal = 5;
function onboard(manual = false) {
  onbStep = 0;
  const feat = (i, t, d) => `<div class="card"><div class="ico">${ic(i, 24)}</div><div><b>${t}</b><small>${d}</small></div></div>`;
  const slides = [
    `<div class="orb">${ic('bolt', 74, 1.6)}</div><h1>Bienvenue sur<br>Drixx Work</h1><p class="lead">Ton compagnon pour tes flyers, tes courses et tes livraisons : suivi GPS, gains en direct et tickets prêts à imprimer.</p>`,
    `<h1>Ce que tu peux faire</h1><div class="feat">${feat('flyer', 'Flyers', 'Un bouton +1 flyer, et l\'app compte ce que tu gagnes.')}${feat('car', 'Courses & livraisons', 'Prix de base + distance GPS + entretien, calculés pour toi.')}${feat('receipt', 'Tickets', 'Un ticket à partager ou à imprimer en Bluetooth.')}${feat('medal', 'Quêtes & statistiques', 'Débloque des paliers et suis tes progrès.')}</div>`,
    `<h1>Ton profil</h1><p class="lead">Comment veux-tu qu'on t'appelle ?</p><div class="form"><div class="card"><div class="profile"><button class="pf-av" data-act="pick-avatar"><img id="onb-av" src="${avatarSrc()}" alt=""><span class="cam">${ic('camera', 16)}</span></button><div class="sub">Ajoute une photo (facultatif)</div></div>
      <div class="set-row"><label>Texte d'accueil</label><input class="inp" data-bind="greeting" value="${esc(S.set.greeting)}" maxlength="24"></div>
      <div class="set-row"><label>Ton pseudo</label><input class="inp" data-bind="name" value="${esc(S.set.name)}" maxlength="24" placeholder="Ton pseudo"></div></div></div>`,
    `<h1>Ton style</h1><p class="lead">Choisis ta couleur néon et la valeur d'un flyer. Tu pourras tout changer dans les réglages.</p><div class="form"><div class="card"><div class="seg"><button class="${S.set.theme === 'dark' ? 'on' : ''}" data-act="theme" data-t="dark" data-onb="1">${ic('moon', 20)} Sombre</button><button class="${S.set.theme === 'light' ? 'on' : ''}" data-act="theme" data-t="light" data-onb="1">${ic('sun', 20)} Clair</button></div>
      <div class="swatches">${SWATCH.map(c => `<button class="sw ${S.set.accent.toLowerCase() === c ? 'on' : ''}" style="background:${c};color:${c}" data-act="accent" data-c="${c}" data-onb="1" aria-label="${c}"></button>`).join('')}</div>
      <div class="set-row"><label>Valeur d'un flyer</label><input class="inp num" inputmode="decimal" data-bind="flyerValue" value="${nf(S.set.flyerValue, 0, 3)}"><span class="unit">€</span></div></div></div>`,
    `<div class="orb">${ic('gps', 70, 1.6)}</div><h1>Dernière étape</h1><p class="lead">Autorise la position pour mesurer la distance et afficher la météo. Tes données restent uniquement sur ce téléphone, rien n'est envoyé.</p>
      <div class="center"><button class="btn ghost" data-act="ask-gps">${ic('gps', 22)} Activer le GPS</button>${installEvt && !standalone() ? `<button class="btn soft" data-act="install">${ic('download', 22)} Installer l'application</button>` : ''}<div id="gps-ok"></div></div>`,
  ];
  const el = $('#onb'); el.innerHTML = `<div class="onb"><div class="bg2"><div class="bg"><i></i><i></i><div class="grid"></div></div></div>
    <div class="track" id="onb-track">${slides.map(s => `<div class="slide">${s}</div>`).join('')}</div>
    <div class="foot-bar"><div class="dots">${slides.map((_, i) => `<i class="${i ? '' : 'on'}"></i>`).join('')}</div><button class="btn primary" id="onb-next" data-act="onb-next">Suivant</button><button class="skip" data-act="onb-skip">${manual ? 'Fermer' : 'Passer'}</button></div></div>`;
  onbTotal = slides.length;
}
function onbGo(n) {
  onbStep = Math.max(0, Math.min(onbTotal - 1, n));
  $('#onb-track').style.transform = `translateX(-${onbStep * 100}%)`;
  $$('#onb .dots i').forEach((d, i) => d.classList.toggle('on', i === onbStep));
  $('#onb-next').textContent = onbStep === onbTotal - 1 ? 'C\'est parti !' : 'Suivant';
}
function onbEnd() { S.set.onboarded = true; save(); $('#onb').innerHTML = ''; applyTheme(); render(); sfx.start(); }

// ------------------------------------------------------------ événements
document.addEventListener('click', async e => {
  const t = e.target.closest('[data-act]'); if (!t) return;
  const act = t.dataset.act;
  if (t.classList.contains('btn')) { const r = document.createElement('span'), b = t.getBoundingClientRect(), s = Math.max(b.width, b.height) * 2; r.className = 'rip'; r.style.cssText = `width:${s}px;height:${s}px;left:${e.clientX - b.left - s / 2}px;top:${e.clientY - b.top - s / 2}px`; t.appendChild(r); setTimeout(() => r.remove(), 650); }
  switch (act) {
    case 'nav': sfx.nav(); go(t.dataset.r); break;
    case 'mode': if (!S.active) { S.lastMode = t.dataset.m; save(); sfx.tap(); lastAmt = null; render(); } break;
    case 'start': startActivity(); break;
    case 'pause': togglePause(); break;
    case 'flyer': addFlyer(); break;
    case 'stop': sfx.tap(); askStop(); break;
    case 'gps': sfx.tap(); if (geo.state === 'denied') toast('Autorise la position dans les réglages Chrome du site'); else { geo.state = 'searching'; paintGps(); geoOnce(); } break;
    case 'sheet-close': sfx.tap(); closeSheet(t.closest('.sheet-wrap')); break;
    case 'confirm-ok': { const w = t.closest('.sheet-wrap'), f = w._ok; closeSheet(w); sfx.tap(); setTimeout(() => f && f(), 60); break; }
    case 'open-act': { const a = findAct(t.dataset.id); if (a) { sfx.tap(); openSummary(a, false); } break; }
    case 'share-ticket': { const a = findAct(t.dataset.id); a && shareTicket(a); break; }
    case 'gen-ticket': { const a = findAct(t.dataset.id); sfx.tap(); a && showTicket(a); break; }
    case 'dl-ticket': { const a = findAct(t.dataset.id); if (a) downloadBlob(await toBlob(await makeTicket(a)), 'ticket.png'); break; }
    case 'del-act': { const id = t.dataset.id; confirmBox({ title: 'Supprimer cette activité ?', text: 'Elle disparaît de l\'historique. Les statistiques sont conservées.', ok: 'Supprimer', danger: true, onOk: () => { S.acts = S.acts.filter(a => a.id !== id); save(); closeAllSheets(); render(); } }); break; }
    case 'hfilter': histFilter = t.dataset.k; sfx.tap(); render(); break;
    case 'period': period = t.dataset.k; sfx.tap(); render(); break;
    case 'theme': S.set.theme = t.dataset.t; save(); applyTheme(); sfx.tap(); if (t.dataset.onb) $$('[data-act=theme]', $('#onb')).forEach(b => b.classList.toggle('on', b.dataset.t === S.set.theme)); else render(); break;
    case 'accent': S.set.accent = t.dataset.c; save(); applyTheme(); sfx.tap(); if (t.dataset.onb) $$('.sw', $('#onb')).forEach(b => b.classList.toggle('on', b.dataset.c === S.set.accent)); else render(); break;
    case 'demo': setDemo(!S.set.demo); break;
    case 'sound': S.set.sound = !S.set.sound; save(); t.classList.toggle('on', S.set.sound); if (S.set.sound) sfx.on(); break;
    case 'pick-avatar': pickImage(d => { S.set.avatar = d; save(); const o = $('#onb-av'); if (o) o.src = d; else render(); }, 256, false); break;
    case 'pick-logo': pickImage(d => { S.set.ticket.logo = d; save(); render(); }, 420, true); break;
    case 'rm-logo': S.set.ticket.logo = null; save(); render(); break;
    case 'reset': { const r = RESETS[t.dataset.k]; confirmBox({ title: r.title, text: r.text, ok: 'Réinitialiser', danger: true, onOk: r.run }); break; }
    case 'install': if (installEvt) { installEvt.prompt(); await installEvt.userChoice; installEvt = null; render(); } break;
    case 'share-app': try { await navigator.share({ title: 'Drixx Work', text: 'Suivi de flyers, courses et livraisons', url: location.href.split('#')[0].replace(/index\.html$/, '') }); } catch { try { await navigator.clipboard.writeText(location.href); toast('Lien copié'); } catch { } } break;
    case 'tour': onboard(true); break;
    case 'onb-next': sfx.nav(); onbStep === onbTotal - 1 ? onbEnd() : onbGo(onbStep + 1); break;
    case 'onb-skip': onbEnd(); break;
    case 'ask-gps': geo.state = 'searching'; if (!navigator.geolocation) { toast('GPS indisponible sur cet appareil'); break; } navigator.geolocation.getCurrentPosition(p => { geoUpdate(p); loadWeather(); $('#gps-ok').innerHTML = `<div class="ok-tag">${ic('check', 20)} GPS activé</div>`; sfx.on(); }, er => { geoError(er); toast(er.code === 1 ? 'Position refusée : tu pourras l\'activer plus tard' : 'Position introuvable pour l\'instant'); }, { enableHighAccuracy: true, timeout: 15000 }); break;
  }
});
document.addEventListener('input', e => {
  const t = e.target;
  if (t.dataset.bind) bind(t.dataset.bind, t.value);
  else if (t.dataset.actInput === 'volume') { S.set.volume = t.value / 100; $('#volv').textContent = t.value + '%'; save(); }
  else if (t.dataset.actInput === 'accent') { S.set.accent = t.value; applyTheme(); save(); }
});
document.addEventListener('change', e => {
  const t = e.target;
  if (t.dataset.actInput === 'volume') sfx.tap();
  if (t.dataset.actInput === 'accent') render();
  if (t.classList.contains('num')) t.value = nf(num(t.value), 0, 3);
});
// halo qui suit le doigt sur les cartes
document.addEventListener('pointermove', e => { const c = e.target.closest && e.target.closest('.glow'); if (!c) return; const r = c.getBoundingClientRect(); c.style.setProperty('--mx', (e.clientX - r.left) + 'px'); c.style.setProperty('--my', (e.clientY - r.top) + 'px'); c.classList.add('hot'); });
document.addEventListener('pointerup', () => setTimeout(() => $$('.glow.hot').forEach(c => c.classList.remove('hot')), 350));
document.addEventListener('pointercancel', () => $$('.glow.hot').forEach(c => c.classList.remove('hot')));
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); installEvt = e; if (route === 'settings') render(); });
window.addEventListener('appinstalled', () => { installEvt = null; toast('Application installée !', '', 'check'); });
window.addEventListener('online', () => { paintGps(); loadWeather(); });
window.addEventListener('offline', paintGps);

// ------------------------------------------------------------ démarrage
applyTheme();
history.replaceState({ r: 'home' }, '');
render();
if (!S.set.onboarded) onboard();
if (S.active) { if (S.active.run) { wakeOn(); if (!S.active.demo) geoStartWatch(); } }
geoOnce();
if (S.wx) paintWeather();
if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('sw.js').catch(() => { });
