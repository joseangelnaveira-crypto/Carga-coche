(function () {
"use strict";
  var KEY = "carga-coche-v3";

  /* Capacidad ÚTIL de la batería en kWh (la que se llena al cargar). Fuente: ev-database.org */
  var CARS = [
    ["Tesla", [["Model 3 Standard Range Plus (2019-20)", 49], ["Model 3 RWD (antes de Highland)", 57], ["Model 3 RWD Highland", 60], ["Model 3 Long Range (Highland)", 75], ["Model 3 Performance (Highland)", 79], ["Model Y RWD (antes de Juniper)", 57], ["Model Y RWD (Juniper)", 60], ["Model Y Long Range (2024-25)", 75], ["Model Y Performance (2022-25)", 75]]],
    ["Renault", [["Zoe ZE50 (R110 / R135)", 52], ["Mégane E-Tech EV60", 60], ["Mégane E-Tech 67 kWh", 67], ["5 E-Tech 52 kWh", 52], ["5 E-Tech 40 kWh", 40], ["4 E-Tech 52 kWh", 52], ["Twingo E-Tech", 27.5]]],
    ["Nissan", [["Leaf 40 kWh (2018-22)", 39], ["Leaf e+ 62 kWh", 59], ["Leaf 52 kWh (nuevo)", 52.9], ["Leaf 75 kWh (nuevo)", 75.1], ["Ariya 63 kWh", 63], ["Ariya 87 kWh", 87]]],
    ["Volkswagen", [["ID.3 58 kWh", 58], ["ID.3 Pro S 77 kWh", 77], ["ID.3 79 kWh", 79], ["ID.4 Pure 58 kWh", 58], ["ID.4 Pro 77 kWh", 77], ["ID.4 Pro 79 kWh", 79]]],
    ["Hyundai", [["Kona Eléctrico 64 kWh", 64], ["Kona Eléctrico 65 kWh (2024-)", 65.4], ["Kona Eléctrico 48,6 kWh", 48.6], ["Ioniq 5 63 kWh", 60], ["Ioniq 5 84 kWh", 80], ["Ioniq 6 63 kWh", 60], ["Ioniq 6 84 kWh", 80], ["Inster Standard Range", 39], ["Inster Long Range", 46]]],
    ["Kia", [["e-Niro 64 kWh", 64], ["Niro EV (2022-25)", 64.8], ["EV6 Standard Range", 60], ["EV6 Long Range 2WD", 74], ["EV6 Long Range AWD", 80]]],
    ["BYD", [["Dolphin Surf 30 kWh", 30], ["Dolphin Surf 43,2 kWh", 43.2], ["Dolphin 60,4 kWh", 60.5], ["Atto 2 64,8 kWh", 64.8], ["Atto 3 (2023-25)", 60.5], ["Atto 3 Evo", 74.8], ["Seal 61,4 kWh", 61.4], ["Seal 82,5 kWh", 82.5]]],
    ["MG", [["MG4 51 kWh", 50.8], ["MG4 64 kWh", 61.7], ["MG4 77 kWh", 74.4], ["MG5 Long Range", 57.4], ["ZS EV Long Range", 68.3]]],
    ["Peugeot", [["e-208 50 kWh", 46.3], ["e-208 54 kWh", 50.8], ["e-2008 54 kWh", 50.8], ["e-308 58 kWh", 55.4]]],
    ["Citroën", [["ë-C3 44 kWh", 43.8], ["ë-C4", 46.3]]],
    ["Opel", [["Corsa Electric 50 kWh", 46.3], ["Corsa Electric 54 kWh", 50.8], ["Mokka Electric", 50.8], ["Frontera Electric 44 kWh", 43.8]]],
    ["Fiat", [["500e 24 kWh", 21.3], ["500e 42 kWh", 37.3], ["600e", 50.8], ["Grande Panda 44 kWh", 43.8]]],
    ["Dacia", [["Spring 24 kWh", 24], ["Spring Electric 80 (27,5 kWh)", 27.5]]],
    ["Škoda", [["Enyaq 60", 58], ["Enyaq 80 / 85", 77], ["Elroq 60", 59], ["Elroq 85", 77]]],
    ["Cupra", [["Born 58 kWh", 58], ["Born 77 kWh", 77], ["Born 79 kWh", 79]]],
    ["BMW", [["i3 120 Ah", 37.9], ["i4 eDrive40", 81.3]]],
    ["Mini", [["Cooper E", 36.6], ["Cooper SE", 49.2]]],
    ["Volvo", [["EX30 49 kWh", 49], ["EX30 Long Range", 65]]],
    ["Toyota", [["bZ4X 57,7 kWh", 54], ["bZ4X 73,1 kWh", 69], ["bZ4X 74,7 kWh", 71], ["Urban Cruiser 48,8 kWh", 47.8]]]
  ];
  var OTHER = "Otro / no está en la lista";

  var CONFIG_KEYS = ["brand", "model", "bat", "pw", "eff", "margin", "startMode", "startAt", "pValle", "pOtro", "vStart", "vEnd", "iee", "iva"];
  var DEFAULTS = {
    brand: "Tesla", model: "Model 3 RWD Highland", bat: 60,
    pw: 2.95, eff: 90, margin: 30, startMode: "auto", startAt: "23:00",
    pValle: 0.08, pOtro: 0.20, vStart: "00:00", vEnd: "08:00", iee: 5.11, iva: 21,
    cur: 30, tgt: 80, need: "07:30",
    profiles: [], active: null
  };
  var S = {}, view = "main", setupIdx = 0, delArm = false, sim = null;
  var $ = function (id) { return document.getElementById(id); };

  /* Todo lo que se lee del almacenamiento se valida: tipo, rango y formato */
  var RANGES = { bat: [1, 300], pw: [0.5, 50], eff: [50, 100], margin: [0, 240], pValle: [0, 10], pOtro: [0, 10], iee: [0, 100], iva: [0, 100], cur: [0, 100], tgt: [0, 100] };
  var TIMES = ["startAt", "vStart", "vEnd", "need"];
  function cleanConfig(c) {
    var o = {};
    c = (c && typeof c === "object" && !Array.isArray(c)) ? c : {};
    Object.keys(DEFAULTS).forEach(function (k) {
      if (k === "profiles" || k === "active") return;
      var v = c[k];
      if (RANGES[k]) v = (typeof v === "number" && isFinite(v) && v >= RANGES[k][0] && v <= RANGES[k][1]) ? v : DEFAULTS[k];
      else if (TIMES.indexOf(k) >= 0) v = (typeof v === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(v)) ? v : DEFAULTS[k];
      else if (k === "startMode") v = ["auto", "now", "manual"].indexOf(v) >= 0 ? v : DEFAULTS[k];
      else if (k === "brand") v = (v === OTHER || (typeof v === "string" && brandModels(v).length)) ? v : DEFAULTS[k];
      else if (k === "model") v = typeof v === "string" ? v.slice(0, 80) : DEFAULTS[k];
      o[k] = v;
    });
    return o;
  }
  function load() {
    var saved = {};
    try { saved = JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch (e) { saved = {}; }
    if (typeof saved !== "object" || Array.isArray(saved)) saved = {};
    S = cleanConfig(saved);
    S.profiles = (Array.isArray(saved.profiles) ? saved.profiles : []).filter(function (p) { return p && typeof p.id === "string" && /^p\d+$/.test(p.id); }).slice(0, 20).map(function (p) {
      var c = cleanConfig(p.c);
      if (c.brand !== OTHER && !findModel(c.brand, c.model)) c.model = brandModels(c.brand)[0][0];
      return { id: p.id, name: String(p.name || "").slice(0, 120), c: c };
    });
    S.active = (typeof saved.active === "string" && /^p\d+$/.test(saved.active)) ? saved.active : null;
    var p = findProfile(S.active);
    if (p) Object.keys(p.c).forEach(function (k) { S[k] = p.c[k]; });
    if (S.brand !== OTHER) fixModel();
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
  function fixModel() {
    if (!brandModels(S.brand).length) S.brand = DEFAULTS.brand;
    if (!findModel(S.brand, S.model)) S.model = brandModels(S.brand)[0][0];
  }

  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function hm(d) { return pad(d.getHours()) + ":" + pad(d.getMinutes()); }
  function toMin(s) { var p = String(s || "").split(":"); return (parseInt(p[0], 10) || 0) * 60 + (parseInt(p[1], 10) || 0); }
  function addMin(hhmm, d) { var m = (((toMin(hhmm) + d) % 1440) + 1440) % 1440; return pad(Math.floor(m / 60)) + ":" + pad(m % 60); }
  function num(v, d) { var n = parseFloat(v); return isNaN(n) ? d : n; }
  function nf(v, d) { return v.toLocaleString("es-ES", { maximumFractionDigits: d }); }
  function money(v) { return v.toLocaleString("es-ES", { style: "currency", currency: "EUR" }); }
  function kwhText(v) { return nf(v, 1) + " kWh"; }
  function durText(min) { var t = Math.round(min), h = Math.floor(t / 60); return h === 0 ? t + " min" : h + " h " + pad(t % 60) + " min"; }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;"); }
  function dayLabel(d, now) {
    var a = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    var b = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    var diff = Math.round((a - b) / 86400000);
    if (diff === 0) return "hoy";
    if (diff === 1) return "mañana";
    if (diff === -1) return "ayer";
    return d.toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" });
  }
  function nextAfter(base, hhmm) {
    var m = toMin(hhmm), d = new Date(base.getTime());
    d.setHours(Math.floor(m / 60), m % 60, 0, 0);
    if (d.getTime() <= base.getTime()) d = new Date(d.getTime() + 86400000);
    return d;
  }
  function inValle(md) {
    var a = toMin(S.vStart), b = toMin(S.vEnd);
    if (a === b) return false;
    return a < b ? (md >= a && md < b) : (md >= a || md < b);
  }
  function brandModels(b) { for (var i = 0; i < CARS.length; i++) if (CARS[i][0] === b) return CARS[i][1]; return []; }
  function findModel(b, m) { return brandModels(b).filter(function (x) { return x[0] === m; })[0]; }
  function btns(list, cur, key, cols) {
    return '<div class="grid cols-' + (cols || list.length) + '">' + list.map(function (o) {
      return '<button type="button" class="btn" data-set="' + key + '" data-v="' + esc(o[0]) + '" aria-pressed="' + (String(cur) === String(o[0])) + '">' + o[1] + (o[2] ? '<small>' + o[2] + '</small>' : '') + '</button>';
    }).join("") + '</div>';
  }

  /* ---------- Configuraciones guardadas ---------- */
  function carName(c) { return c.brand === OTHER ? "Otro coche" : c.brand + " " + c.model; }
  function pickConfig() { var c = {}; CONFIG_KEYS.forEach(function (k) { c[k] = S[k]; }); return c; }
  function profileName() { return carName(S) + " · " + nf(num(S.pw, 0), 2) + " kW"; }
  function findProfile(id) { return S.profiles.filter(function (p) { return p.id === id; })[0]; }
  function saveProfile() {
    var name = profileName(), p = findProfile(S.active);
    if (!p) p = S.profiles.filter(function (x) { return x.name === name; })[0];
    if (!p) { p = { id: "p" + Date.now() }; S.profiles.push(p); }
    p.name = name; p.c = pickConfig(); S.active = p.id;
  }
  function syncProfile() { var p = findProfile(S.active); if (p) { p.name = profileName(); p.c = pickConfig(); } }
  function touch(key) { if (CONFIG_KEYS.indexOf(key) >= 0) syncProfile(); save(); }

  /* ---------- Cuerpos reutilizables (alta y ajustes) ---------- */
  function carBody() {
    var brands = CARS.map(function (c) { return c[0]; }).concat([OTHER]);
    var h = '<div class="card"><div class="field"><label for="brand">Marca</label><select id="brand">' + brands.map(function (b) { return '<option' + (b === S.brand ? ' selected' : '') + '>' + esc(b) + '</option>'; }).join("") + '</select></div>';
    if (S.brand !== OTHER) {
      h += '<div class="field"><label for="model">Modelo</label><select id="model">' + brandModels(S.brand).map(function (m) { return '<option value="' + esc(m[0]) + '"' + (m[0] === S.model ? ' selected' : '') + '>' + esc(m[0]) + ' · ' + nf(m[1], 1) + ' kWh</option>'; }).join("") + '</select></div>';
    }
    h += '<div class="field"><label for="bat">Batería útil (kWh)</label><input type="number" id="bat" inputmode="decimal" min="1" step="0.5" value="' + S.bat + '"></div>';
    h += '<p class="hint">' + (S.brand === OTHER ? 'Búscala en la ficha técnica del coche. Es la capacidad útil, no la bruta.' : 'Capacidad útil orientativa del modelo. Si conoces la tuya, cámbiala.') + '</p></div>';
    return h;
  }
  function pwBody() {
    return '<div class="card">' + btns([[2.3, "2,3 kW", "10 A"], [2.95, "2,95 kW", "13 A"], [3.7, "3,7 kW", "16 A"], [7.4, "7,4 kW", "32 A"]], S.pw, "pw", 4) +
      '<div class="row"><div class="field"><label for="pwin">Potencia exacta (kW)</label><input type="number" id="pwin" inputmode="decimal" min="0.5" step="0.05" value="' + S.pw + '"></div>' +
      '<div class="field"><label for="eff">Rendimiento (%)</label><input type="number" id="eff" inputmode="decimal" min="50" max="100" step="1" value="' + S.eff + '"></div></div>' +
      '<p class="hint">En un enchufe de casa suele ser entre 2,9 y 3 kW. El rendimiento es lo que llega a la batería de lo que sale de la red, normalmente entre 90 y 93 %.</p></div>';
  }
  function tariffBody() {
    return '<div class="card"><p class="hint">Precios sin impuestos. Los que ves son de ejemplo: pon los de tu tarifa.</p>' +
      '<div class="row"><div class="field"><label for="pValle">Valle (€/kWh)</label><input type="number" id="pValle" inputmode="decimal" min="0" step="0.005" value="' + S.pValle + '"></div>' +
      '<div class="field"><label for="pOtro">Resto (€/kWh)</label><input type="number" id="pOtro" inputmode="decimal" min="0" step="0.005" value="' + S.pOtro + '"></div></div>' +
      '<div class="row"><div class="field"><label for="vStart">Valle desde</label><input type="time" id="vStart" value="' + S.vStart + '"></div>' +
      '<div class="field"><label for="vEnd">Valle hasta</label><input type="time" id="vEnd" value="' + S.vEnd + '"></div></div>' +
      '<div class="row"><div class="field"><label for="iee">Impuesto eléctrico (%)</label><input type="number" id="iee" inputmode="decimal" min="0" step="0.01" value="' + S.iee + '"></div>' +
      '<div class="field"><label for="iva">IVA (%)</label><input type="number" id="iva" inputmode="decimal" min="0" step="1" value="' + S.iva + '"></div></div></div>';
  }

  /* ---------- Pantallas ---------- */
  function setupHtml() {
    var steps = [
      { q: "¿Qué coche tienes?", sub: "Elígelo y pongo su batería. Si no está, escribe tú los kWh.", body: carBody() },
      { q: "¿Qué cargador usas?", sub: "Solo hay que decirlo una vez. Después solo te pregunto la batería y la hora.", body: pwBody() }
    ];
    var s = steps[setupIdx];
    var prog = steps.map(function (_, i) { return '<i class="' + (i <= setupIdx ? "on" : "") + '"></i>'; }).join("");
    return '<div class="page"><div class="head">' + (setupIdx > 0 || S.profiles.length ? '<button type="button" class="back" id="back" aria-label="Volver">‹</button>' : '') +
      '<div class="prog">' + prog + '</div><div class="count">' + (setupIdx + 1) + ' de ' + steps.length + '</div></div>' +
      '<h1 class="q">' + s.q + '</h1><p class="sub">' + s.sub + '</p>' + s.body +
      '<div class="foot"><button type="button" class="next" id="next">' + (setupIdx === steps.length - 1 ? "Empezar" : "Siguiente") + '</button></div></div>';
  }

  function plugBody() {
    var seg = [["auto", "Mejor hora"], ["now", "Ahora"], ["manual", "Otra hora"]].map(function (o) { return '<button type="button" class="btn" data-set="startMode" data-v="' + o[0] + '" aria-pressed="' + (S.startMode === o[0]) + '">' + o[1] + '</button>'; }).join("");
    var h = '<div class="card start"><div class="grid cols-3">' + seg + '</div>';
    if (S.startMode === "auto") {
      h += '<div class="mrow"><span class="lbl">Margen de seguridad</span><button type="button" class="btn" data-margin="-15" aria-label="Restar 15 minutos">−15</button><span class="v">' + num(S.margin, 0) + ' min</span><button type="button" class="btn" data-margin="15" aria-label="Sumar 15 minutos">+15</button></div>';
      h += '<p class="hint">Calculo la hora de enchufe para que termine con este margen antes de la hora que necesitas.</p>';
    } else if (S.startMode === "manual") {
      h += '<div class="trow"><button type="button" class="btn" data-time="startAt" data-d="-60">−1 h</button><button type="button" class="btn" data-time="startAt" data-d="-15">−15</button><button type="button" class="val tap" data-wheel="startAt" aria-label="Elegir hora">' + S.startAt + '</button><button type="button" class="btn" data-time="startAt" data-d="15">+15</button><button type="button" class="btn" data-time="startAt" data-d="60">+1 h</button></div>';
      h += '<p class="hint">Pones tú la hora de enchufe y la app te dice cómo queda.</p>';
    } else {
      h += '<p class="hint">Cargas desde este momento.</p>';
    }
    return h + '</div>';
  }

  function settingsHtml() {
    return '<div class="page"><div class="head"><button type="button" class="back" id="done" aria-label="Volver">‹</button><div class="t">Ajustes</div></div>' +
      '<h2 class="s">Cuándo enchufar</h2>' + plugBody() + '<h2 class="s">Coche</h2>' + carBody() + '<h2 class="s">Cargador</h2>' + pwBody() + '<h2 class="s">Tarifa e impuestos</h2>' + tariffBody() + '<h2 class="s">Instalar en el móvil</h2>' + installBody() + '<h2 class="s">Acerca de</h2>' + aboutBody() +
      '<div class="foot"><button type="button" class="next" id="done2">Listo</button>' +
      '<button type="button" class="del" id="del">' + (delArm ? "Pulsa otra vez para borrar" : "Borrar esta configuración") + '</button></div></div>';
  }

  function carsHtml() {
    var h = '<div class="page"><div class="head"><button type="button" class="back" id="done" aria-label="Volver">‹</button><div class="t">Mis coches y cargadores</div></div>';
    S.profiles.forEach(function (p) {
      h += '<button type="button" class="opt' + (p.id === S.active ? ' on' : '') + '" data-profile="' + esc(p.id) + '"><b>' + esc(p.name) + '</b><span>' + kwhText(num(p.c.bat, 0)) + ' de batería</span></button>';
    });
    return h + '<button type="button" class="ghost" id="addcar">+ Añadir otro coche o cargador</button></div>';
  }

    function mainHtml() {
    var tb = function (key, arr) { return arr.map(function (o) { return '<button type="button" class="btn" data-time="' + key + '" data-d="' + o[0] + '">' + o[1] + '</button>'; }).join(""); };
    return '<div class="ctxrow"><button type="button" class="ctxbtn" id="carbtn"><span><svg class="car" viewBox="0 0 28 16" width="26" height="15" aria-hidden="true"><path d="M3 11.5 5 6.5Q6 4.5 9 4.5H17Q19 4.5 20.5 6.5L24 8.5Q26 9 26 11.5V12.5H3Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><circle cx="8" cy="13" r="2.3" fill="var(--surface)" stroke="currentColor" stroke-width="1.6"/><circle cx="21" cy="13" r="2.3" fill="var(--surface)" stroke="currentColor" stroke-width="1.6"/></svg> ' + esc(profileName()) + '</span><span class="m">Cambiar</span></button>' +
      '<button type="button" class="setbtn tmp" id="refbtn" aria-label="Refrescar" title="Refrescar">&#8635;</button><button type="button" class="setbtn" id="setbtn" aria-label="Ajustes" title="Ajustes">Ajustes</button></div><div class="hero" id="res" aria-live="polite"></div>' +
      '<div class="ctl">' +

      '<section class="card cur"><div class="ch"><span class="lbl">Batería ahora</span><span class="val" id="vCur"></span></div>' +
      '<div class="rng"><button type="button" class="btn" data-adj="cur" data-d="-1" aria-label="Restar 1 %">−</button><input type="range" id="rCur" min="0" max="100" step="1" aria-label="Batería ahora"><button type="button" class="btn" data-adj="cur" data-d="1" aria-label="Sumar 1 %">+</button></div></section>' +

      '<section class="card tgt"><div class="ch"><span class="lbl">Cargar hasta</span><span class="val" id="vTgt"></span></div>' +
      '<div class="rng"><button type="button" class="btn" data-adj="tgt" data-d="-1" aria-label="Restar 1 %">−</button><input type="range" id="rTgt" min="0" max="100" step="1" aria-label="Cargar hasta"><button type="button" class="btn" data-adj="tgt" data-d="1" aria-label="Sumar 1 %">+</button></div></section>' +

      '<section class="card need"><div class="ch"><span class="lbl">Lo necesito listo a las</span></div><div class="trow">' + tb("need", [["-60", "−1 h"], ["-15", "−15"]]) +
      '<button type="button" class="val tap" id="vNeed" data-wheel="need" aria-label="Elegir hora"></button>' + tb("need", [["15", "+15"], ["60", "+1 h"]]) + '</div></section>' +
      '</div>';
  }

  /* ---------- Cálculo ---------- */
  function compute() {
    var now = new Date(Math.floor(Date.now() / 60000) * 60000);
    var pw = num(S.pw, 0), eff = num(S.eff, 90) / 100, bat = num(S.bat, 60), cur = num(S.cur, 0), tgt = num(S.tgt, 0);
    if (!(pw > 0) || !(eff > 0) || !(bat > 0)) return null;
    var kwhBat = Math.max(0, (tgt - cur) / 100 * bat), kwhGrid = kwhBat / eff, durMin = kwhGrid / pw * 60, margin = Math.max(0, num(S.margin, 0));

    var effStart, need, startShown, idealPassed = false, idealText = "";
    var smode = sim ? "manual" : S.startMode, sat = sim || S.startAt;
    if (smode === "manual") {
      var m = toMin(sat);
      effStart = new Date(now.getTime()); effStart.setHours(Math.floor(m / 60), m % 60, 0, 0);
      if (effStart.getTime() < now.getTime()) effStart = new Date(effStart.getTime() + 86400000);
      need = nextAfter(effStart, S.need); startShown = effStart;
    } else if (smode === "now") {
      effStart = now; need = nextAfter(now, S.need); startShown = now;
    } else {
      need = nextAfter(now, S.need);
      var ideal = new Date(Math.floor((need.getTime() - (margin + durMin) * 60000) / 300000) * 300000);
      startShown = ideal; effStart = ideal.getTime() < now.getTime() ? now : ideal;
      if (ideal.getTime() < now.getTime()) { idealPassed = true; idealText = hm(ideal); }
    }
    var fullEnd = new Date(effStart.getTime() + durMin * 60000);
    var reached = fullEnd.getTime() <= need.getTime() + 30000;
    var stopAt = reached ? fullEnd : need;
    var chargedMin = Math.max(0, (stopAt.getTime() - effStart.getTime()) / 60000);
    var kwhGridDone = chargedMin / 60 * pw, kwhBatDone = kwhGridDone * eff;
    var pctFinal = Math.min(100, cur + kwhBatDone / bat * 100);
    var realMargin = Math.round((need.getTime() - fullEnd.getTime()) / 60000);

    var base = 0, t = effStart.getTime(), left = chargedMin;
    while (left > 1e-9) {
      var w = Math.min(1, left), d = new Date(t), md = d.getHours() * 60 + d.getMinutes(), e = pw / 60 * w;
      base += e * (inValle(md) ? num(S.pValle, 0) : num(S.pOtro, 0));
      t += 60000; left -= w;
    }
    var withIee = base * (1 + num(S.iee, 0) / 100), total = withIee * (1 + num(S.iva, 0) / 100);

    var pre = idealPassed ? "Ya pasó la hora ideal (" + idealText + "). " : "";
    var kind, text;
    if (kwhGrid <= 0) { kind = "good"; text = "No hay nada que cargar con estos datos."; }
    else if (reached && realMargin >= margin) { kind = "good"; text = pre + "Queda al " + nf(tgt, 0) + " % a las " + hm(fullEnd) + ", con " + durText(realMargin) + " de sobra."; }
    else if (reached) { kind = "warn"; text = pre + "Queda al " + nf(tgt, 0) + " % a las " + hm(fullEnd) + ", pero con solo " + durText(Math.max(0, realMargin)) + " de margen."; }
    else { kind = "warn"; text = pre + "No llega al " + nf(tgt, 0) + " %: a las " + hm(need) + " tendrás " + nf(pctFinal, 0) + " %. Termina a las " + hm(fullEnd) + "."; }

    return {
      l1: sim ? "Si lo enchufas a las" : S.startMode === "auto" ? "Pon a cargar a las" : "Cargas desde las",
      l1v: hm(startShown),
      l1day: smode === "now" ? "ahora" : idealPassed ? "ya pasó" : dayLabel(startShown, now),
      l2: reached ? "Cargado a las" : "A las " + hm(need) + " tendrás",
      l2v: reached ? hm(fullEnd) : nf(pctFinal, 0) + " %",
      l2day: reached ? dayLabel(fullEnd, now) : "no llega",
      reached: reached, det: { now: now, kwhBat: kwhBat, kwhGrid: kwhGrid, durMin: durMin, eff: eff, pw: pw, bat: bat, cur: cur, tgt: tgt, margin: margin, effStart: effStart, fullEnd: fullEnd, need: need, smode: smode, idealPassed: idealPassed, idealText: idealText, base: base, withIee: withIee, total: total, chargedMin: chargedMin, pctFinal: pctFinal, realMargin: realMargin }, kind: kind, text: text, total: total, base: base, withIee: withIee, chargedMin: chargedMin, kwhGridDone: kwhGridDone, pctFinal: pctFinal
    };
  }

  function renderRes() {
    var el = $("res"); if (!el) return;
    var o = compute();
    if (!o) { el.innerHTML = '<p class="msg warn">Revisa la batería, la potencia y el rendimiento en Ajustes.</p>'; return; }
    var head = sim
      ? '<div class="eyebrow">Si lo enchufas a las ' + o.l1v + ' · ' + o.l2 + '</div><div class="rbig l2' + (o.reached ? '' : ' bad') + ' main">' + o.l2v + '</div>'
      : '<div class="eyebrow">' + o.l1 + ' · ' + o.l1day + '</div><div class="rbig l1 main">' + o.l1v + '</div>';
    var tipo = cheapest(o.det);
    var tip = tipo ? '<div class="tip"><span>Más barato: enchufa a las <b>' + tipo.time + '</b> (' + tipo.day + ') y ahorras <b>' + money(tipo.saving) + '</b>. Cargado a las ' + tipo.end + '.</span><button type="button" class="link" id="tipBtn" data-t="' + tipo.time + '">Probar</button></div>' : '';
    var links = sim
      ? '<div class="simbar"><span>Simulación: enchufo a las ' + sim + '</span><button type="button" class="link" id="simOff">Quitar</button></div>'
      : '';
    el.innerHTML = head +
      '<p class="msg ' + o.kind + '">' + o.text + '</p>' +
      '<div class="costline"><span class="cost">' + money(o.total) + '</span><span class="break">con impuestos' + (o.chargedMin > 0 ? ' · ' + durText(o.chargedMin) + ' · ' + kwhText(o.kwhGridDone) : '') + '</span></div>' +
      tip + links +
      '<div class="links"><button type="button" class="link" id="simBtn">Probar otra hora de enchufe</button><button type="button" class="link" id="howBtn">Cómo se calcula</button></div>';
  }


  /* Hora de enchufe más barata que aun así termina con el margen pedido */
  function cheapest(d) {
    var step = 300000, pw = d.pw, perMin = pw / 60, pv = num(S.pValle, 0), po = num(S.pOtro, 0);
    var k = (1 + num(S.iee, 0) / 100) * (1 + num(S.iva, 0) / 100);
    var earliest = Math.ceil(d.now.getTime() / step) * step;
    var latest = Math.floor((d.need.getTime() - (d.margin + d.durMin) * 60000) / step) * step;
    if (!(d.durMin > 0) || latest < earliest) return null;
    var best = null;
    for (var t = earliest; t <= latest; t += step) {
      var sd = new Date(t), startMd = sd.getHours() * 60 + sd.getMinutes(), base = 0, left = d.durMin, i = 0;
      while (left > 1e-9) { var w = Math.min(1, left); base += perMin * w * (inValle((startMd + i) % 1440) ? pv : po); left -= w; i++; }
      var total = base * k;
      if (!best || total <= best.total + 1e-9) best = { t: t, total: total };
    }
    if (!best) return null;
    var saving = d.total - best.total;
    if (saving < 0.05 || Math.abs(best.t - d.effStart.getTime()) < 120000) return null;
    var st = new Date(best.t);
    return { time: hm(st), day: dayLabel(st, d.now), end: hm(new Date(best.t + d.durMin * 60000)), saving: saving };
  }

  function explainHtml() {
    var o = compute(); if (!o) return "<p>Faltan datos.</p>";
    var d = o.det, h = '<ol>';
    h += '<li><b>Energía que falta en la batería.</b> (' + nf(d.tgt, 0) + ' % − ' + nf(d.cur, 0) + ' %) × ' + nf(d.bat, 1) + ' kWh = <b>' + kwhText(d.kwhBat) + '</b>.</li>';
    h += '<li><b>Energía que sale de la red.</b> ' + kwhText(d.kwhBat) + ' ÷ ' + nf(d.eff * 100, 0) + ' % de rendimiento = <b>' + kwhText(d.kwhGrid) + '</b>. Una parte se pierde en el cargador y en el coche.</li>';
    h += '<li><b>Tiempo de carga.</b> ' + kwhText(d.kwhGrid) + ' ÷ ' + nf(d.pw, 2) + ' kW = <b>' + durText(d.durMin) + '</b>.</li>';
    var st;
    if (d.smode === "manual") st = 'Enchufas a las <b>' + hm(d.effStart) + '</b> (' + (sim ? 'hora que has probado' : 'hora que has elegido') + '). ' + hm(d.effStart) + ' + ' + durText(d.durMin) + ' = termina a las <b>' + hm(d.fullEnd) + '</b>.';
    else if (d.smode === "now") st = 'Cargas desde ahora (<b>' + hm(d.effStart) + '</b>). ' + hm(d.effStart) + ' + ' + durText(d.durMin) + ' = termina a las <b>' + hm(d.fullEnd) + '</b>.';
    else if (d.idealPassed) st = 'Hora necesaria ' + hm(d.need) + ' − ' + durText(d.durMin) + ' − ' + d.margin + ' min de margen = ' + d.idealText + ', pero esa hora ya pasó. Cuento desde ahora (<b>' + hm(d.effStart) + '</b>) y termina a las <b>' + hm(d.fullEnd) + '</b>.';
    else st = 'Hora necesaria ' + hm(d.need) + ' − ' + durText(d.durMin) + ' − ' + d.margin + ' min de margen = <b>' + hm(d.effStart) + '</b> (redondeado a 5 min). Termina a las <b>' + hm(d.fullEnd) + '</b>.';
    h += '<li><b>Hora de enchufe y fin.</b> ' + st + '</li>';
    if (!o.reached) h += '<li><b>¿Llega al objetivo?</b> No. A las ' + hm(d.need) + ' solo han pasado ' + durText(d.chargedMin) + ' de carga, así que tendrás <b>' + nf(d.pctFinal, 0) + ' %</b>.</li>';
    else h += '<li><b>Margen.</b> Termina ' + durText(Math.max(0, d.realMargin)) + ' antes de las ' + hm(d.need) + '.</li>';
    h += '<li><b>Coste.</b> Cada minuto se cobra al precio del tramo (valle ' + nf(num(S.pValle, 0), 3) + ' €/kWh, resto ' + nf(num(S.pOtro, 0), 3) + ' €/kWh): energía ' + money(d.base) + ' + impuesto eléctrico ' + nf(num(S.iee, 0), 2) + ' % (' + money(d.withIee - d.base) + ') + IVA ' + nf(num(S.iva, 0), 0) + ' % (' + money(d.total - d.withIee) + ') = <b>' + money(d.total) + '</b>.</li>';
    var ch = cheapest(d);
    if (ch) h += '<li><b>Hora más barata.</b> Pruebo todas las horas de enchufe posibles, cada 5 min, que terminen con tu margen de ' + d.margin + ' min antes de las ' + hm(d.need) + ', y elijo la de menor coste: enchufar a las <b>' + ch.time + '</b> (' + ch.day + ') costaría ' + money(d.total - ch.saving) + ', es decir, <b>' + money(ch.saving) + '</b> menos.</li>';
    return h + '</ol>';
  }

  function syncCtl() {
    $("vCur").textContent = Math.round(num(S.cur, 0)) + " %";
    $("vTgt").textContent = Math.round(num(S.tgt, 0)) + " %";
    $("vNeed").textContent = S.need;
    $("rCur").value = num(S.cur, 0);
    $("rTgt").value = num(S.tgt, 0);
    Array.prototype.forEach.call(document.querySelectorAll("#root [data-set]"), function (b) {
      var k = b.getAttribute("data-set");
      if (k === "tgt") b.setAttribute("aria-pressed", String(String(S[k]) === b.getAttribute("data-v")));
    });
  }
  function refresh() { if (view === "main") { syncCtl(); renderRes(); } else draw(true); }

  /* ---------- Dibujo ---------- */
  function draw(keepScroll) {
    var y = window.scrollY, root = $("root");
    if (view === "main") { root.innerHTML = mainHtml(); syncCtl(); renderRes(); }
    else if (view === "setup") root.innerHTML = setupHtml();
    else if (view === "settings") root.innerHTML = settingsHtml();
    else root.innerHTML = carsHtml();
    window.scrollTo(0, keepScroll ? y : 0);
  }
  function go(v) { view = v; delArm = false; if (v !== "main") sim = null; draw(false); }


  /* ---------- Ruleta de hora ---------- */
  var wheel = null;
  function fillCol(el, n, step, pick) {
    var h = "";
    for (var i = 0; i < n; i++) h += '<div class="wi">' + pad(i * step) + '</div>';
    el.innerHTML = h;
    el.scrollTop = pick * 44;
    markCol(el);
  }
  function markCol(el) {
    var i = Math.max(0, Math.min(el.children.length - 1, Math.round(el.scrollTop / 44)));
    for (var k = 0; k < el.children.length; k++) el.children[k].classList.toggle("sel", k === i);
    return i;
  }
  function openWheel(key) {
    var m = toMin(key === "sim" ? (sim || S.startAt) : S[key]);
    wheel = { key: key };
    var sh = $("sheet"), isStart = key === "startAt" || key === "sim";
    sh.style.setProperty("--wc", isStart ? "var(--c-start)" : "var(--c-need)");
    sh.style.setProperty("--wcs", isStart ? "var(--c-start-soft)" : "var(--c-need-soft)");
    $("wtitle").textContent = key === "sim" ? "Probar: lo enchufo a las…" : isStart ? "Hora a la que enchufo" : "Hora a la que lo necesito";
    sh.hidden = false;
    fillCol($("wH"), 24, 1, Math.floor(m / 60));
    fillCol($("wM"), 12, 5, Math.round((m % 60) / 5) % 12);
  }
  function closeWheel() { $("sheet").hidden = true; wheel = null; }
  function applyWheel() {
    if (!wheel) return;
    var h = markCol($("wH")), mi = markCol($("wM"));
    var val = pad(h) + ":" + pad(mi * 5);
    if (wheel.key === "sim") sim = val; else { S[wheel.key] = val; touch(wheel.key); }
    closeWheel(); refresh();
  }
  ["wH", "wM"].forEach(function (id) { $(id).addEventListener("scroll", function () { markCol($(id)); }); });

  /* ---------- Instalación y avisos ---------- */
  var deferredPrompt = null;
  function isStandalone() { return (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) || window.navigator.standalone === true; }
  function isIOS() { return /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1); }
  function installBody() {
    var ios = isIOS();
    var steps = {
      ios: '<div class="os' + (ios ? ' me' : '') + '"><h3>iPhone y iPad' + (ios ? ' <em>tu móvil</em>' : '') + '</h3><ol>' +
        '<li>Abre esta página en <b>Safari</b> (no en Chrome ni dentro de otra app).</li>' +
        '<li>Toca <b>Compartir</b>, el cuadrado con una flecha hacia arriba.</li>' +
        '<li>Desliza y elige <b>«Añadir a pantalla de inicio»</b>.</li>' +
        '<li>Toca <b>«Añadir»</b>. Ábrela desde el icono nuevo.</li></ol></div>',
      and: '<div class="os' + (!ios ? ' me' : '') + '"><h3>Android' + (!ios ? ' <em>tu móvil</em>' : '') + '</h3><ol>' +
        '<li>Abre esta página en <b>Chrome</b>.</li>' +
        '<li>Toca el menú <b>⋮</b> de arriba a la derecha.</li>' +
        '<li>Elige <b>«Instalar aplicación»</b> o «Añadir a pantalla de inicio».</li>' +
        '<li>Confirma con <b>«Instalar»</b>. Ábrela desde el icono nuevo.</li></ol></div>'
    };
    var h = '<div class="card install">';
    if (isStandalone()) return h + '<p class="hint"><b>Ya está instalada</b> en este móvil. Funciona sin conexión.</p></div>';
    if (deferredPrompt) h += '<button type="button" class="next" id="installBtn">Instalar la app</button><p class="hint">Se guarda en el móvil y funciona sin conexión. O sigue estos pasos:</p>';
    h += ios ? steps.ios + steps.and : steps.and + steps.ios;
    h += '<p class="hint">Si ves una versión antigua, cierra la app del todo y ábrela dos veces con conexión.</p>';
    return h + '</div>';
  }
  function aboutBody() {
    return '<div class="card"><p class="hint"><b>Valores orientativos.</b> Las horas y el coste dependen de tu coche, tu cargador y tu tarifa, y pueden diferir de la realidad. Comprueba siempre que el coche queda cargado.</p>' +
      '<p class="hint"><b>Privacidad.</b> No hay cuentas ni cookies, y no se envía ningún dato a ningún servidor. Lo que escribes se guarda solo en este dispositivo y puedes borrarlo con «Borrar esta configuración».</p>' +
      '<p class="hint">Las capacidades de batería son valores útiles orientativos tomados de ev-database.org. Consulta la ficha de tu coche para el dato exacto.</p></div>';
  }
  window.addEventListener("beforeinstallprompt", function (e) { e.preventDefault(); deferredPrompt = e; if (view === "settings") draw(true); });
  window.addEventListener("appinstalled", function () { deferredPrompt = null; if (view === "settings") draw(true); });
  if ("serviceWorker" in navigator) { window.addEventListener("load", function () { navigator.serviceWorker.register("sw.js").catch(function () {}); }); }

  /* ---------- Eventos ---------- */
  document.addEventListener("click", function (ev) {
    if (ev.target.id === "sheet") { closeWheel(); return; }
    if (ev.target.id === "info") { $("info").hidden = true; return; }
    var t = ev.target.closest("button");
    if (!t) return;
    var id = t.id;
    if (id === "sheetOk") { applyWheel(); return; }
    if (id === "installBtn") { if (deferredPrompt) { deferredPrompt.prompt(); deferredPrompt = null; draw(true); } return; }
    if (id === "simBtn") { openWheel("sim"); return; }
    if (id === "tipBtn") { sim = t.getAttribute("data-t"); refresh(); return; }
    if (id === "simOff") { sim = null; refresh(); return; }
    if (id === "howBtn") { $("howBody").innerHTML = explainHtml(); $("info").hidden = false; return; }
    if (id === "infoOk") { $("info").hidden = true; return; }
    if (id === "sheetCancel") { closeWheel(); return; }
    if (t.hasAttribute("data-wheel")) { openWheel(t.getAttribute("data-wheel")); return; }
    if (id === "next") {
      if (setupIdx < 1) { setupIdx++; draw(false); }
      else { saveProfile(); save(); go("main"); }
      return;
    }
    if (id === "back") { if (setupIdx > 0) { setupIdx--; draw(false); } else go("cars"); return; }
    if (id === "done" || id === "done2") { if (findProfile(S.active)) { syncProfile(); save(); go("main"); } return; }
    if (id === "carbtn") { go("cars"); return; }
    /* TEMPORAL: borra la copia guardada y recarga (quitar al terminar los cambios) */
    if (id === "refbtn") {
      var done = function () { location.reload(); };
      var work = [];
      if (window.caches) work.push(caches.keys().then(function (ks) { return Promise.all(ks.map(function (k) { return caches.delete(k); })); }));
      if (navigator.serviceWorker) work.push(navigator.serviceWorker.getRegistrations().then(function (rs) { return Promise.all(rs.map(function (r) { return r.unregister(); })); }));
      Promise.all(work).then(done, done);
      return;
    }
    if (id === "setbtn") { go("settings"); return; }
    if (id === "addcar") { S.active = null; setupIdx = 0; save(); go("setup"); return; }
    if (id === "del") {
      if (!delArm) { delArm = true; draw(true); return; }
      S.profiles = S.profiles.filter(function (p) { return p.id !== S.active; });
      S.active = null; save();
      if (S.profiles.length) go("cars"); else { setupIdx = 0; go("setup"); }
      return;
    }
    if (t.hasAttribute("data-profile")) {
      var p = findProfile(t.getAttribute("data-profile"));
      if (p) { Object.keys(p.c).forEach(function (k) { S[k] = p.c[k]; }); S.active = p.id; save(); go("main"); }
      return;
    }
    if (t.hasAttribute("data-adj")) {
      var k = t.getAttribute("data-adj");
      S[k] = Math.max(0, Math.min(100, num(S[k], 0) + parseInt(t.getAttribute("data-d"), 10))); save(); refresh(); return;
    }
    if (t.hasAttribute("data-time")) {
      var tk = t.getAttribute("data-time");
      S[tk] = addMin(S[tk], parseInt(t.getAttribute("data-d"), 10)); touch(tk); refresh(); return;
    }
    if (t.hasAttribute("data-margin")) {
      S.margin = Math.max(0, Math.min(240, num(S.margin, 0) + parseInt(t.getAttribute("data-margin"), 10))); touch("margin"); refresh(); return;
    }
    if (t.hasAttribute("data-set")) {
      var key = t.getAttribute("data-set"), raw = t.getAttribute("data-v");
      S[key] = (key === "startMode") ? raw : parseFloat(raw);
      touch(key); refresh();
    }
  });

  document.addEventListener("input", function (ev) {
    var el = ev.target, id = el.id;
    if (id === "rCur" || id === "rTgt") {
      var key = id === "rCur" ? "cur" : "tgt"; S[key] = parseFloat(el.value); save();
      $(id === "rCur" ? "vCur" : "vTgt").textContent = Math.round(S[key]) + " %"; syncCtl(); renderRes(); return;
    }
    if (id === "pwin") { S.pw = num(el.value, S.pw); touch("pw"); return; }
    if (["bat", "eff", "pValle", "pOtro", "iee", "iva"].indexOf(id) >= 0) { S[id] = el.value === "" ? "" : parseFloat(el.value); touch(id); return; }
    if (["vStart", "vEnd"].indexOf(id) >= 0 && el.value) { S[id] = el.value; touch(id); }
  });

  document.addEventListener("change", function (ev) {
    var el = ev.target;
    if (el.id === "brand") {
      S.brand = el.value;
      var ms = brandModels(S.brand);
      if (ms.length) { S.model = ms[0][0]; S.bat = ms[0][1]; } else { S.model = ""; }
      touch("brand"); draw(true);
    } else if (el.id === "model") {
      var f = findModel(S.brand, el.value);
      if (f) { S.model = f[0]; S.bat = f[1]; }
      touch("model"); draw(true);
    } else if (el.id === "pwin") { draw(true); }
  });

  load();
  if (!S.profiles.length) { view = "setup"; }
  else if (!findProfile(S.active)) { view = "cars"; }
  draw(false);
  setInterval(function () { if (view === "main") renderRes(); }, 30000);
})();
