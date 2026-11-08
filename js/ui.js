'use strict';
/* =====================================================================
   AGRI PILOT — Interface : icônes, formats, graphiques, structure, routeur
   ===================================================================== */
const ICONS = {
  home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>',
  farm: '<path d="M3 21V10l9-6 9 6v11M9 21v-6h6v6M2 21h20"/>',
  map: '<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14"/>',
  sprout: '<path d="M7 20h10M12 20v-8M12 12c0-4-3-6-7-6 0 4 3 6 7 6zM12 10c0-3.5 2.5-6 7-6 0 3.5-2.5 6-7 6z"/>',
  tasks: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 3v2h6V3M9 12l2 2 4-4M9 17h6"/>',
  box: '<path d="M21 8 12 3 3 8v8l9 5 9-5zM3 8l9 5 9-5M12 13v8"/>',
  cart: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0"/>',
  chart: '<path d="M3 3v18h18M7 15l4-4 3 3 5-6"/>',
  tractor: '<circle cx="7" cy="16" r="4"/><circle cx="18" cy="17.5" r="2.5"/><path d="M3 12V6h7l2 6M10 6V3M12 12h6a2 2 0 0 1 2 2v1.5M11 16h4.5"/>',
  landmark: '<path d="M3 21h18M5 21V10M9 21V10M15 21V10M19 21V10M2 10l10-6 10 6z"/>',
  file: '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9zM14 3v6h6M8 13h8M8 17h5"/>',
  settings: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  alert: '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0zM12 9v4M12 17h.01"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  euro: '<path d="M4 10h12M4 14h9M19 6a7.7 7.7 0 0 0-5.2-2A7.9 7.9 0 0 0 6 12c0 4.4 3.5 8 7.8 8 2 0 3.8-.8 5.2-2"/>',
  layers: '<path d="M12 2 2 7l10 5 10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>',
  trend: '<path d="M22 7 13.5 15.5 8.5 10.5 2 17M16 7h6v6"/>',
  star: '<path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/>',
  edit: '<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  trash: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6"/>',
  copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  chevR: '<path d="m9 18 6-6-6-6"/>', chevL: '<path d="m15 18-6-6 6-6"/>', up: '<path d="m18 15-6-6-6 6"/>', down: '<path d="m6 9 6 6 6-6"/>',
  sparkles: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9zM19 3v4M17 5h4M5 17v4M3 19h4"/>',
  fuel: '<path d="M3 22h12M4 9h10M14 22V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v18M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 4 0V9.8a2 2 0 0 0-.6-1.4L18 5"/>',
  wheat: '<path d="M2 22 16 8M3.5 12.5 5 11l1.5 1.5a3.5 3.5 0 0 1 0 5L5 19l-1.5-1.5a3.5 3.5 0 0 1 0-5zM7.5 8.5 9 7l1.5 1.5a3.5 3.5 0 0 1 0 5L9 15l-1.5-1.5a3.5 3.5 0 0 1 0-5zM11.5 4.5 13 3l1.5 1.5a3.5 3.5 0 0 1 0 5L13 11l-1.5-1.5a3.5 3.5 0 0 1 0-5zM20 2h2v2a4 4 0 0 1-4 4h-2V6a4 4 0 0 1 4-4z"/>',
  droplet: '<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  users: '<circle cx="9" cy="7" r="4"/><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
  wifiOff: '<path d="M2 2l20 20M8.5 16.4a5 5 0 0 1 7 0M2 8.8a15 15 0 0 1 4.2-2.8M10.7 5.1A15 15 0 0 1 22 8.8M5 12.9a10 10 0 0 1 5.2-2.8M16.9 10.3a10 10 0 0 1 2.1 2.6M12 20h.01"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 16v-4M12 8h.01"/>',
  camera: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3z"/><circle cx="12" cy="13" r="3"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>',
  move: '<path d="M17 3l4 4-4 4M3 7h18M7 21l-4-4 4-4M21 17H3"/>',
  leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10zM2 21c0-3 1.9-5.4 5.1-6.1"/>',
  dots: '<circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>',
  play: '<path d="m6 3 14 9-14 9z"/>',
  minus: '<path d="M5 12h14"/>',
  clipboard: '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>',
  shovel: '<path d="M2 22l8-8M14 4l6 6M17 7l-7 7M12.5 5.5 18.5 11.5 16 14a4 4 0 0 1-5.7 0L10 13.7a4 4 0 0 1 0-5.7z"/>',
  flask: '<path d="M9 3h6M10 3v6L4.5 18.5A1.7 1.7 0 0 0 6 21h12a1.7 1.7 0 0 0 1.5-2.5L14 9V3M7 15h10"/>',
  wrench: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z"/>',
  lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
};
const ic = (n, cls = '') => `<svg class="i ${cls}" viewBox="0 0 24 24">${ICONS[n] || ''}</svg>`;

/* ---------- Formats ---------- */
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const nf = (v, d = 0) => (v == null || isNaN(v)) ? '—' : (+v).toLocaleString('fr-FR', { minimumFractionDigits: d, maximumFractionDigits: d });
const nfx = (v, d = 2) => (v == null || isNaN(v)) ? '—' : (+v).toLocaleString('fr-FR', { maximumFractionDigits: d });
const eur = (v, d = 0) => (v == null || isNaN(v)) ? '—' : (+v).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: d, maximumFractionDigits: d });
const keur = v => Math.abs(v) >= 10000 ? `${nf(v / 1000, 1)} k€` : eur(v);
const pct = (v, d = 1) => v == null ? '—' : `${v > 0 ? '+' : ''}${nf(v * 100, d)} %`;
const dfr = s => s ? D(s).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const dshort = s => s ? D(s).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) : '—';
const qty = (v, u) => `${nfx(v, u === 't' ? 2 : u === 'kg' || u === 'L' ? 1 : 2)} ${u}`;
const trend = v => v == null ? '<span class="muted small">—</span>' : `<span class="trend ${v >= 0 ? 'up' : 'down'}">${pct(v)}</span>`;
const cultBadge = k => k ? `<span class="badge" style="background:color-mix(in srgb,${CULTURES[k]?.color} 18%,transparent);color:var(--text)"><i class="dotc" style="background:${CULTURES[k]?.color}"></i>${esc(CULTURES[k]?.nom || k)}</span>` : '<span class="muted">—</span>';
const urg = { danger: 'danger', warn: 'warn', ok: 'ok' };

/* ---------- Graphiques SVG ---------- */
function niceMax(v) { if (v <= 0) return 1; const p = 10 ** Math.floor(Math.log10(v)); const n = v / p; return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * p; }
function shortN(v) { const a = Math.abs(v); return a >= 1e6 ? nf(v / 1e6, 1) + ' M' : a >= 1e3 ? nf(v / 1e3, a >= 1e4 ? 0 : 1) + ' k' : nf(v); }

function donut(data, o = {}) {
  const tot = sum(data, d => d.value) || 1, S0 = o.size || 168, R0 = S0 / 2, th = o.thick || 24, r = R0 - th / 2;
  let a0 = -Math.PI / 2;
  const arcs = data.map(d => {
    const a = d.value / tot * Math.PI * 2, a1 = a0 + a;
    const large = a > Math.PI ? 1 : 0;
    const p = (ang) => [R0 + r * Math.cos(ang), R0 + r * Math.sin(ang)];
    const [x0, y0] = p(a0 + 0.012), [x1, y1] = p(Math.max(a0 + 0.013, a1 - 0.012));
    const path = data.length === 1 ? `<circle cx="${R0}" cy="${R0}" r="${r}" fill="none" stroke="${d.color}" stroke-width="${th}"/>` : `<path class="hov" d="M${x0} ${y0}A${r} ${r} 0 ${large} 1 ${x1} ${y1}" fill="none" stroke="${d.color}" stroke-width="${th}"><title>${esc(d.label)} : ${o.fmt ? o.fmt(d.value) : nf(d.value)}</title></path>`;
    a0 = a1; return path;
  }).join('');
  return `<div class="donut-wrap"><svg viewBox="0 0 ${S0} ${S0}" width="${S0}" height="${S0}" class="chart" style="width:${S0}px;flex:none">${arcs}
    ${o.center ? `<text x="${R0}" y="${R0 - 2}" text-anchor="middle" style="font-size:20px;font-weight:750;fill:var(--text)">${o.center[0]}</text><text x="${R0}" y="${R0 + 17}" text-anchor="middle">${o.center[1]}</text>` : ''}</svg>
    <div class="legend">${data.map(d => `<span><span class="row" style="gap:7px"><i class="dotc" style="background:${d.color}"></i>${esc(d.label)}</span><em>${o.fmt ? o.fmt(d.value) : nf(d.value)}${o.pct !== false ? ` · ${nf(d.value / tot * 100)} %` : ''}</em></span>`).join('')}</div></div>`;
}
function barChart({ labels, series, height = 220, fmt = shortN, stacked = false }) {
  const W = 640, H = height, L = 46, B = 26, T = 10, Rr = 6;
  const max = niceMax(stacked ? Math.max(...labels.map((_, i) => sum(series, s => Math.max(0, s.values[i])))) : Math.max(1, ...series.flatMap(s => s.values)));
  const min = Math.min(0, ...series.flatMap(s => s.values));
  const span = max - min || 1, y = v => T + (H - T - B) * (1 - (v - min) / span);
  const gw = (W - L - Rr) / labels.length, bw = stacked ? Math.min(34, gw * .6) : Math.min(22, gw * .7 / series.length);
  let g = '';
  for (let i = 0; i <= 4; i++) { const v = min + span * i / 4; g += `<line class="gl" x1="${L}" x2="${W - Rr}" y1="${y(v)}" y2="${y(v)}"/><text x="${L - 8}" y="${y(v) + 4}" text-anchor="end">${fmt(v)}</text>`; }
  labels.forEach((lb, i) => {
    const cx = L + gw * i + gw / 2;
    if (stacked) {
      let acc = 0;
      series.forEach(s => { const v = s.values[i]; if (!v) return; const y0 = y(acc), y1 = y(acc + v); g += `<rect class="hov" x="${cx - bw / 2}" y="${y1}" width="${bw}" height="${Math.max(0, y0 - y1)}" rx="3" fill="${s.color}"><title>${esc(s.name)} — ${esc(lb)} : ${fmt(v)}</title></rect>`; acc += v; });
    } else series.forEach((s, j) => {
      const v = s.values[i], x = cx - (bw * series.length + 3 * (series.length - 1)) / 2 + j * (bw + 3);
      const y0 = y(Math.max(0, v)), h = Math.abs(y(v) - y(0));
      g += `<rect class="hov" x="${x}" y="${y0}" width="${bw}" height="${Math.max(v ? 1.5 : 0, h)}" rx="4" fill="${s.color}"><title>${esc(s.name)} — ${esc(lb)} : ${fmt(v)}</title></rect>`;
    });
    g += `<text x="${cx}" y="${H - 8}" text-anchor="middle">${esc(lb)}</text>`;
  });
  return `<svg viewBox="0 0 ${W} ${H}" class="chart">${g}</svg>${series.length > 1 ? `<div class="legend">${series.map(s => `<span><i class="dotc" style="background:${s.color}"></i>${esc(s.name)}</span>`).join('')}</div>` : ''}`;
}
function lineChart({ series, height = 220, fmt = v => nf(v), xfmt = dshort, ticks = 5, area = true }) {
  const W = 640, H = height, L = 48, B = 26, T = 12, Rr = 10;
  const all = series.flatMap(s => s.points); if (!all.length) return '<div class="empty">Aucune donnée</div>';
  let mn = Math.min(...all.map(p => p.y)), mx = Math.max(...all.map(p => p.y)); const pad = (mx - mn) * 0.12 || mx * 0.05 || 1; mn -= pad; mx += pad;
  const xs = series[0].points; const n = xs.length;
  const x = i => L + (W - L - Rr) * (n > 1 ? i / (n - 1) : .5), y = v => T + (H - T - B) * (1 - (v - mn) / (mx - mn));
  let g = '';
  for (let i = 0; i <= 4; i++) { const v = mn + (mx - mn) * i / 4; g += `<line class="gl" x1="${L}" x2="${W - Rr}" y1="${y(v)}" y2="${y(v)}"/><text x="${L - 8}" y="${y(v) + 4}" text-anchor="end">${fmt(v)}</text>`; }
  for (let i = 0; i < ticks; i++) { const k = Math.round(i * (n - 1) / (ticks - 1)); g += `<text x="${x(k)}" y="${H - 8}" text-anchor="${i === 0 ? 'start' : i === ticks - 1 ? 'end' : 'middle'}">${xfmt(xs[k].x)}</text>`; }
  series.forEach((s, si) => {
    const d = s.points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(p.y).toFixed(1)}`).join('');
    if (area && series.length === 1) g += `<path d="${d}L${x(n - 1)} ${H - B}L${x(0)} ${H - B}Z" fill="${s.color}" opacity=".10"/>`;
    g += `<path d="${d}" fill="none" stroke="${s.color}" stroke-width="2.2" stroke-linejoin="round" ${s.dash ? 'stroke-dasharray="5 4"' : ''}/>`;
    const lp = s.points[s.points.length - 1]; g += `<circle cx="${x(n - 1)}" cy="${y(lp.y)}" r="4" fill="${s.color}" stroke="var(--surface)" stroke-width="2"><title>${fmt(lp.y)}</title></circle>`;
  });
  return `<svg viewBox="0 0 ${W} ${H}" class="chart">${g}</svg>${series.length > 1 ? `<div class="legend">${series.map(s => `<span><i class="dotc" style="background:${s.color}"></i>${esc(s.name)}</span>`).join('')}</div>` : ''}`;
}
function hbars(rows, o = {}) {
  const max = Math.max(1, ...rows.map(r => Math.abs(r.value)));
  return `<div class="list">${rows.map(r => `<div style="padding:7px 0"><div class="row small" style="justify-content:space-between;margin-bottom:5px"><span class="row" style="gap:7px"><i class="dotc" style="background:${r.color || 'var(--primary)'}"></i><b style="font-weight:600">${esc(r.label)}</b></span><b class="num">${o.fmt ? o.fmt(r.value) : nf(r.value)}</b></div><div class="bar"><i style="width:${Math.max(0, r.value) / max * 100}%;background:${r.value < 0 ? 'var(--danger)' : r.color || 'var(--primary)'}"></i></div></div>`).join('')}</div>`;
}
function sparkline(vals, color = 'var(--primary)', w = 90, h = 28) {
  if (vals.length < 2) return '';
  const mn = Math.min(...vals), mx = Math.max(...vals), sp = mx - mn || 1;
  const d = vals.map((v, i) => `${i ? 'L' : 'M'}${(i / (vals.length - 1) * w).toFixed(1)} ${(h - 2 - (v - mn) / sp * (h - 4)).toFixed(1)}`).join('');
  return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}"><path d="${d}" fill="none" stroke="${color}" stroke-width="1.8"/></svg>`;
}

/* ---------- État d'interface ---------- */
const ROUTES = [
  ['dashboard', 'Tableau de bord', 'home', 'Pilotage'],
  ['taches', 'Tâches', 'check', 'Pilotage'],
  ['exploitation', 'Exploitation', 'farm', 'Pilotage'],
  ['parcellaire', 'Parcellaire', 'map', 'Production'],
  ['itk', 'Itinéraires techniques', 'sprout', 'Production'],
  ['interventions', 'Interventions', 'tasks', 'Production'],
  ['stocks', 'Gestion des stocks', 'box', 'Production'],
  ['ventes', 'Ventes et achats', 'cart', 'Économie'],
  ['economie', 'Gestion économique', 'chart', 'Économie'],
  ['materiel', 'Parc matériel', 'tractor', 'Économie'],
  ['pac', 'Administratif et PAC', 'landmark', 'Administration'],
  ['documents', 'Documents', 'file', 'Administration'],
  ['parametres', 'Paramètres', 'settings', 'Administration'],
];
const DEFAULT_WIDGETS = ['premiers', 'categories', 'priorites', 'cultures', 'actions', 'kpis', 'surfaces', 'marges', 'ca', 'charges', 'stocks', 'cours', 'assistant'];
/* Couleur de catégorie de chaque module (cohérente avec les catégories de tâches) */
const MOD_COLOR = { dashboard: 'var(--primary)', taches: 'var(--late)', exploitation: 'var(--c-cult)', parcellaire: 'var(--c-cult)', itk: 'var(--c-cult)', interventions: 'var(--c-cult)', stocks: 'var(--c-stock)', ventes: 'var(--c-vente)', economie: 'var(--c-eco)', materiel: 'var(--c-mat)', pac: 'var(--c-admin)', documents: 'var(--c-doc)', parametres: 'var(--c-set)' };
const WIDGET_NAMES = { premiers: 'Premiers pas (nouvelle ferme)', cultures: 'Mes cultures', categories: 'Tâches par catégorie', priorites: 'À faire en priorité', actions: 'Actions rapides', kpis: 'Chiffres clés', surfaces: 'Répartition des surfaces', ca: "Évolution du chiffre d'affaires et des charges", marges: 'Marges par culture', charges: 'Répartition des charges', stocks: 'Répartition des stocks', cours: 'Cours agricoles', assistant: 'Assistant (aperçu)' };
let PREFS = { theme: 'light', camp: CURRENT_CAMP - 1, widgets: DEFAULT_WIDGETS.map(id => ({ id, on: true })) };
try { const p = JSON.parse(localStorage.getItem(PREF_KEY) || 'null'); if (p) PREFS = { ...PREFS, ...p }; } catch (e) { }
PREFS.widgets = PREFS.widgets.filter(w => DEFAULT_WIDGETS.includes(w.id));
DEFAULT_WIDGETS.forEach((id, i) => { if (!PREFS.widgets.find(w => w.id === id)) PREFS.widgets.splice(Math.min(i, PREFS.widgets.length), 0, { id, on: true }); });
const savePrefs = () => { try { localStorage.setItem(PREF_KEY, JSON.stringify(PREFS)); } catch (e) { } };
const UI = { route: 'dashboard', drawer: null, tabs: {}, q: {}, f: {}, notif: false, mapEdit: null, mapDraw: null, mapSel: null, assist: null, customize: false };
const tab = (k, def) => UI.tabs[k] || def;
/** Actions de page : boutons dans l'en-tête sur ordinateur, barre fixe en bas (zone du pouce) sur téléphone. */
function pa(list) { UI._pa = list; return `<span class="only-d row" style="gap:8px">${list.map(x => `<button class="btn ${x.primary ? 'p' : ''}" data-a="${x.a}" ${Object.entries(x.d || {}).map(([k, v]) => `data-${k}="${esc(v)}"`).join(' ')}>${ic(x.i)} ${x.l}</button>`).join('')}</span>`; }
function paBar() {
  const list = UI._pa || []; if (!list.length) return '';
  const main = list.filter(x => !x.more).slice(-3), more = list.filter(x => x.more || !main.includes(x));
  const btn = x => `<button class="btn ${x.primary ? 'p' : ''}" data-a="${x.a}" ${Object.entries(x.d || {}).map(([k, v]) => `data-${k}="${esc(v)}"`).join(' ')}>${ic(x.i)}<span>${x.l}</span></button>`;
  return `<div class="pabar">${more.length ? `<button class="btn icon" data-a="paMore" aria-label="Autres actions">${ic('dots')}</button>` : ''}${main.map(btn).join('')}</div>`;
}

/* ---------- Modale / tiroir / toast ---------- */
let MODAL = null;
function openModal({ title, body, submit = 'Enregistrer', wide = false, onSubmit, onMount, foot }) {
  MODAL = { onSubmit, onMount };
  const m = document.getElementById('modal');
  m.className = 'modal on' + (wide ? ' wide' : '');
  m.innerHTML = `<div class="modal-h"><h2>${title}</h2><button class="btn g icon sm" data-a="closeModal" aria-label="Fermer">${ic('x')}</button></div>
    <form id="mf" class="modal-b form" novalidate>${body}</form>
    <div class="modal-f">${foot ?? `<button class="btn" data-a="closeModal" type="button">Annuler</button>${onSubmit ? `<button class="btn p" type="submit" form="mf">${submit}</button>` : ''}`}</div>`;
  document.getElementById('scrimM').classList.add('on');
  onMount && onMount(m);
  const first = m.querySelector('input:not([type=hidden]):not([type=file]),select'); if (first && window.innerWidth > 900) setTimeout(() => first.focus(), 60);
}
function closeModal() { const m = document.getElementById('modal'); m.className = 'modal'; document.getElementById('scrimM').classList.remove('on'); MODAL = null; }
function openDrawer(kind, id, t) { UI.drawer = { kind, id, tab: t }; renderDrawer(); document.getElementById('drawer').classList.add('on'); document.getElementById('scrimD').classList.add('on'); }
function closeDrawer() { UI.drawer = null; document.getElementById('drawer').classList.remove('on'); document.getElementById('scrimD').classList.remove('on'); }
function toast(msg, kind = '') { const b = document.getElementById('toasts'); const t = document.createElement('div'); t.className = 'toast ' + kind; t.innerHTML = (kind === 'warn' ? ic('alert') : ic('check')) + `<span>${msg}</span>`; b.appendChild(t); setTimeout(() => t.remove(), kind === 'warn' ? 6500 : 3200); }
function formData(form) { const o = {}; new FormData(form).forEach((v, k) => { if (k in o) { o[k] = [].concat(o[k], v); } else o[k] = v; }); return o; }
async function copyText(txt, label = 'Copié dans le presse-papiers') { try { await navigator.clipboard.writeText(txt); toast(label); } catch (e) { openModal({ title: 'Copier le contenu', body: `<div class="note info">${ic('info')}<span>La copie automatique est bloquée par le navigateur. Sélectionnez le texte ci-dessous puis copiez-le.</span></div><textarea class="inp" style="min-height:260px;font-family:ui-monospace,monospace;font-size:12px" readonly>${esc(txt)}</textarea>`, foot: '<button class="btn" data-a="closeModal" type="button">Fermer</button>' }); } }
function toCSV(rows) { return rows.map(r => r.map(c => { const s = String(c ?? ''); return /[;"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; }).join(';')).join('\n'); }

/* ---------- Structure ---------- */
function commit(msg, kind) { if (!saveState()) { /* stockage indisponible : l'application continue en mémoire */ } render(); if (UI.drawer) renderDrawer(); if (msg) toast(msg, kind); }

function shell() {
  const todo = todoList();
  const urgent = todo.filter(t => t.urgence !== 'ok').length;
  const groups = {};
  ROUTES.forEach(r => (groups[r[3]] = groups[r[3]] || []).push(r));
  const byCat = c => todo.filter(t => t.cat === c && t.urgence !== 'ok').length;
  const cnt = { taches: urgent, interventions: byCat('cultures'), stocks: byCat('stocks'), materiel: byCat('materiel'), ventes: byCat('ventes'), pac: byCat('admin'), documents: byCat('documents') };
  const r = ROUTES.find(x => x[0] === UI.route) || (UI.route === 'plus' ? ['plus', 'Menu'] : ROUTES[0]);
  UI._pa = []; const content = (VIEWS[UI.route] || VIEWS.dashboard)(); const bar = paBar();
  const isTab = ['dashboard', 'parcellaire', 'stocks', 'taches', 'plus'].includes(UI.route);
  const stockAlerts = todo.filter(t => t.kind === 'stock').length;
  return `
  <aside class="side">
    <div class="brand"><div class="brand-logo">${ic('leaf')}</div><div><b>AGRI PILOT</b><small>ERP agricole</small></div></div>
    <nav class="nav">${Object.entries(groups).map(([g, rs]) => `<div class="nav-sec">${g}</div>${rs.map(([id, label, icon]) => `<a href="#${id}" class="${UI.route === id ? 'on' : ''}"><span style="color:${MOD_COLOR[id]}">${ic(icon)}</span><span>${label}</span>${cnt[id] ? `<span class="cnt">${cnt[id]}</span>` : ''}</a>`).join('')}`).join('')}</nav>
    <div class="side-foot">
      <div class="row small"><span class="badge demo">${ic('info')} Données de démonstration</span></div>
      <div class="row small muted">${navigator.onLine ? '<i class="dotc" style="background:var(--ok)"></i> En ligne · enregistrement local' : '<i class="dotc" style="background:var(--warn)"></i> Hors ligne · enregistrement local'}</div>
    </div>
  </aside>
  <div class="main ${bar ? 'has-pa' : ''}">
    <header class="top" id="top">
      ${!isTab ? `<button class="btn g icon back" data-a="back" aria-label="Retour">${ic('chevL')}</button>` : ''}
      <h1>${UI.route === 'dashboard' ? `<span class="only-d">${esc(S.exploitation.nom)}</span><span class="only-m row" style="gap:8px"><span class="brand-logo" style="width:30px;height:30px;border-radius:9px">${ic('leaf')}</span>AGRI PILOT</span>` : r[1]}</h1>
      <span class="badge demo hide-m">DÉMO</span>
      <div class="sp"></div>
      <select class="inp hide-m" style="width:auto;height:38px" data-ch="camp" title="Campagne analysée">${[2025, 2026, 2027].map(c => `<option value="${c}" ${PREFS.camp === c ? 'selected' : ''}>Campagne ${campLabel(c)}${c === CURRENT_CAMP ? ' (en cours)' : ''}</option>`).join('')}</select>
      <button class="btn icon g" data-a="search" title="Recherche globale (Ctrl+K)">${ic('search')}</button>
      <a href="#taches" class="btn g top-tasks ${UI.route === 'taches' ? 'on' : ''}" title="Tâches" aria-label="Tâches${urgent ? ` (${urgent} à traiter)` : ''}">${ic('check')}<span class="hide-m">Tâches</span>${urgent ? `<span class="dot">${urgent}</span>` : ''}</a>
      <button class="btn icon g hide-m" data-a="theme" title="Mode sombre">${ic(PREFS.theme === 'dark' ? 'sun' : 'moon')}</button>
      <button class="btn p hide-m" data-a="actionSheet">${ic('plus')} Saisir</button>
    </header>
    <main class="content" id="content">${content}</main>
    ${bar}
  </div>
  <nav class="bottom">
    <a href="#dashboard" class="${UI.route === 'dashboard' ? 'on' : ''}">${ic('home')}Accueil</a>
    <a href="#parcellaire" class="${UI.route === 'parcellaire' ? 'on' : ''}">${ic('map')}Parcelles</a>
    <button class="plus" data-a="actionSheet" aria-label="Saisir">${ic('plus')}</button>
    <a href="#stocks" class="${UI.route === 'stocks' ? 'on' : ''}">${ic('box')}Stocks${stockAlerts ? `<span class="bdg">${stockAlerts}</span>` : ''}</a>
    <a href="#plus" class="${!isTab || UI.route === 'plus' ? 'on' : ''}">${ic('grid')}Plus</a>
  </nav>`;
}
function notifPop(todo) {
  return `<div class="pop"><div class="row" style="padding:8px 0"><b>Notifications</b><span class="sp"></span><a href="#taches" class="small b" style="text-decoration:none">Toutes les tâches</a></div>
  <div style="padding-bottom:8px">${todo.filter(t => t.urgence !== 'ok').slice(0, 10).map(t => taskCard(t, true)).join('') || '<div class="empty">Rien d’urgent</div>'}</div></div>`;
}
/** Carte de tâche : la couleur indique la catégorie, la pastille indique l'urgence. */
function taskCard(t, compact) {
  const c = TASK_CATS[t.cat];
  return `<div class="task" style="--c:${c.color}" data-a="openTodo" data-kind="${t.kind}" data-id="${t.id}">
    <div class="task-ic">${ic(t.icon || c.icon)}</div>
    <div class="task-tx"><span class="cat-tag">${c.label}${t.sub ? ` · <span style="opacity:.75">${esc(t.sub)}</span>` : ''}</span><b>${esc(t.titre)}</b>${!compact && t.detail ? `<span class="d">${esc(t.detail)}</span>` : ''}</div>
    <div class="task-r"><span class="due ${t.urgence === 'ok' ? '' : t.urgence}">${esc(t.echeance)}</span>${!compact && t.action ? `<button class="act" data-a="taskAct" data-kind="${t.kind}" data-id="${t.id}">${t.action}</button>` : ''}</div>
  </div>`;
}
const todoLi = t => taskCard(t);

const VIEWS = {}; const DRAWERS = {};
function render() {
  document.documentElement.dataset.theme = PREFS.theme;
  if (!S.onboarded && typeof renderOnboarding === 'function') { closeDrawer(); closeModal(); renderOnboarding(); return; }
  const app = document.getElementById('app');
  app.innerHTML = shell();
  afterRender();
}
function renderDrawer() {
  const d = UI.drawer; if (!d) return;
  const el = document.getElementById('drawer');
  const r = DRAWERS[d.kind] ? DRAWERS[d.kind](d.id) : null;
  if (!r) { closeDrawer(); return; }
  el.innerHTML = `<div class="drawer-h"><button class="btn g icon sm" data-a="closeDrawer" aria-label="Fermer">${ic('chevL')}</button><h2>${r.title}</h2>${r.actions || ''}</div><div class="drawer-b">${r.body}</div>`;
  r.mount && r.mount(el);
}
const AFTER = [];
function afterRender() {
  const top = document.getElementById('top');
  const onScroll = () => top && top.classList.toggle('scrolled', window.scrollY > 4);
  window.onscroll = onScroll; onScroll();
  AFTER.forEach(f => f());
}
function go(route) { if (location.hash !== '#' + route) location.hash = route; else { UI.route = route; render(); } }
function route() {
  const h = (location.hash || '').replace('#', '');
  UI.route = ROUTES.find(r => r[0] === h) || h === 'plus' ? h : 'dashboard';
  UI.notif = false; UI.mapEdit = null; UI.mapDraw = null;
  if (UI.drawer) closeDrawer();
  render(); window.scrollTo(0, 0);
}

/* ---------- Événements globaux ---------- */
const ACT = {}, FORMS = {}, CH = {}, IN = {};
document.addEventListener('click', e => {
  const el = e.target.closest('[data-a]');
  if (UI.notif && !e.target.closest('.pop') && !(el && el.dataset.a === 'notif')) { UI.notif = false; render(); if (!el) return; }
  if (!el) return;
  const a = el.dataset.a;
  if (ACT[a]) { if (el.tagName === 'A' || el.type === 'submit' && a !== 'submitModal') e.preventDefault(); ACT[a](el.dataset, el, e); }
});
document.addEventListener('submit', e => {
  if (e.target.id === 'mf') { e.preventDefault(); if (MODAL && MODAL.onSubmit) { try { const r = MODAL.onSubmit(formData(e.target), e.target); if (r !== false) closeModal(); } catch (err) { toast(err.message, 'warn'); } } return; }
  const f = e.target.dataset.f; if (f && FORMS[f]) { e.preventDefault(); FORMS[f](formData(e.target), e.target); }
});
document.addEventListener('change', e => { const k = e.target.dataset.ch; if (k && CH[k]) CH[k](e.target, e); });
document.addEventListener('input', e => { const k = e.target.dataset.in; if (k && IN[k]) IN[k](e.target, e); });
document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); ACT.search(); }
  if (e.key === 'Escape') { if (document.getElementById('searchPop').classList.contains('on')) ACT.closeSearch(); else if (MODAL) closeModal(); else if (UI.drawer) closeDrawer(); }
});
window.addEventListener('hashchange', route);
window.addEventListener('online', () => render());
window.addEventListener('offline', () => render());

ACT.closeModal = () => closeModal();
ACT.closeDrawer = () => closeDrawer();
ACT.go = d => { closeModal(); closeDrawer(); go(d.r); };
ACT.theme = () => { PREFS.theme = PREFS.theme === 'dark' ? 'light' : 'dark'; savePrefs(); render(); };
ACT.notif = () => { UI.notif = !UI.notif; render(); };
ACT.tab = d => { UI.tabs[d.k] = d.v; if (d.drawer) { if (d.k === 'dp' || d.k === 'dm') UI.drawer.tab = d.v; renderDrawer(); } else render(); };
ACT.menuOld = () => openModal({ title: 'Menu', body: `<div class="list">${ROUTES.map(([id, l, i]) => `<div class="li" data-a="go" data-r="${id}"><div class="ic ${UI.route === id ? 'ok' : ''}">${ic(i)}</div><div class="tx"><b>${l}</b></div>${ic('chevR')}</div>`).join('')}</div>
  <div class="row mt"><button type="button" class="btn sp" data-a="theme">${ic(PREFS.theme === 'dark' ? 'sun' : 'moon')} Mode ${PREFS.theme === 'dark' ? 'clair' : 'sombre'}</button></div>
  <label class="field mt"><span>Campagne analysée</span><select class="inp" data-ch="camp">${[2025, 2026, 2027].map(c => `<option value="${c}" ${PREFS.camp === c ? 'selected' : ''}>${campLabel(c)}${c === CURRENT_CAMP ? ' (en cours)' : ''}</option>`).join('')}</select></label>`, foot: '' });
CH.camp = el => { PREFS.camp = +el.value; savePrefs(); render(); if (UI.drawer) renderDrawer(); };

/* Recherche globale */
ACT.search = () => { const p = document.getElementById('searchPop'); p.classList.add('on'); const i = p.querySelector('input'); i.value = ''; p.querySelector('.res').innerHTML = searchHint(); setTimeout(() => i.focus(), 30); };
ACT.closeSearch = () => document.getElementById('searchPop').classList.remove('on');
function searchHint() { return `<div class="muted small" style="padding:14px">Recherchez une parcelle, un produit, un matériel, une facture, un document…</div>`; }
IN.search = el => {
  const res = globalSearch(el.value);
  const icn = { parcelle: 'map', stock: 'box', materiel: 'tractor', vente: 'cart', document: 'file', intervention: 'tasks' };
  const lbl = { parcelle: 'Parcelle', stock: 'Stock', materiel: 'Matériel', vente: 'Vente', document: 'Document', intervention: 'Intervention' };
  document.querySelector('#searchPop .res').innerHTML = el.value.trim().length < 2 ? searchHint() : res.length ? res.map(r => `<div class="r" data-a="openResult" data-kind="${r.kind}" data-id="${r.id}"><div class="li" style="padding:0;border:0"><div class="ic">${ic(icn[r.kind])}</div></div><div style="flex:1;min-width:0"><b style="display:block">${esc(r.titre)}</b><span class="small muted">${esc(r.sub)}</span></div><span class="badge">${lbl[r.kind]}</span></div>`).join('') : '<div class="empty">Aucun résultat</div>';
};
ACT.openResult = d => {
  ACT.closeSearch();
  const map = { parcelle: ['parcellaire', 'parcelle'], stock: ['stocks', 'stock'], materiel: ['materiel', 'materiel'], vente: ['ventes', 'vente'], document: ['documents', null], intervention: ['interventions', 'intervention'] };
  const [r, k] = map[d.kind]; go(r); if (k) setTimeout(() => openDrawer(k, d.id), 30);
};
ACT.paMore = () => { const list = UI._pa || []; const main = list.filter(x => !x.more).slice(-3); openModal({ title: 'Autres actions', body: `<div class="list">${list.filter(x => x.more || !main.includes(x)).map(x => `<div class="mrow" data-a="${x.a}" ${Object.entries(x.d || {}).map(([k, v]) => `data-${k}="${esc(v)}"`).join(' ')}><div class="ic">${ic(x.i)}</div><div class="tx"><b>${x.l}</b></div>${ic('chevR')}</div>`).join('')}</div>`, foot: '' }); };
ACT.back = () => { if (history.length > 1) history.back(); else go('plus'); };
ACT.menu = () => go('plus');
ACT.taskAct = (d, el, e) => {
  e.stopPropagation();
  if (d.kind === 'intervention') ACT.validateIv({ id: d.id });
  else if (d.kind === 'maintenance') { const m = byId('materiel', d.id); ACT.addMaint({ id: d.id, t: m.prochain?.type === 'controle' ? 'controle' : (m.prochain?.type || 'entretien'), titre: m.prochain?.label }); }
  else if (d.kind === 'stock') ACT.purchase({ item: d.id });
  else if (d.kind === 'encaissement') { byId('ventes', d.id).statut = 'paye'; commit('Vente marquée comme encaissée'); }
  else if (d.kind === 'echeance') { S.echeances.find(x => x.id === d.id).fait = true; commit('Échéance marquée comme faite'); }
  else if (d.kind === 'document') go('documents');
};
ACT.openTodo = d => {
  UI.notif = false;
  if (d.kind === 'encaissement') { openDrawer('vente', d.id); render(); return; }
  if (d.kind === 'intervention') openDrawer('intervention', d.id);
  else if (d.kind === 'maintenance') openDrawer('materiel', d.id);
  else if (d.kind === 'stock') openDrawer('stock', d.id);
  else if (d.kind === 'echeance') go('pac');
  else if (d.kind === 'document') go('documents');
  render();
};
