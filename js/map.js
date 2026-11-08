'use strict';
/* =====================================================================
   AGRI PILOT — Carte satellite (IGN Géoplateforme) et édition des contours
   Fonds : photographies aériennes IGN, Plan IGN ; calques : cadastre, îlots PAC (RPG).
   Services publics sans clé (data.geopf.fr). Repli sur la carte schématique hors ligne.
   ===================================================================== */
const geopf = (layer, style, fmt) => `https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=${layer}&STYLE=${encodeURIComponent(style)}&TILEMATRIXSET=PM&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=${encodeURIComponent(fmt)}`;
const MAP_BASES = {
  sat: { label: 'Satellite', url: geopf('ORTHOIMAGERY.ORTHOPHOTOS', 'normal', 'image/jpeg'), max: 19 },
  plan: { label: 'Plan', url: geopf('GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2', 'normal', 'image/png'), max: 19 },
};
const MAP_OVERLAYS = {
  cadastre: { label: 'Cadastre', url: geopf('CADASTRALPARCELS.PARCELLAIRE_EXPRESS', 'PCI vecteur', 'image/png'), max: 19 },
  rpg: { label: 'Îlots PAC', url: geopf('LANDUSE.AGRICULTURE.LATEST', 'normal', 'image/png'), max: 16, opacity: 0.6 },
};
const MAP_ATTR = '© <a href="https://www.ign.fr" target="_blank" rel="noopener">IGN</a> – Géoplateforme';
let LMAP = null, EDIT = null, LOCATE_MK = null;
const hasLeaflet = () => typeof window.L !== 'undefined' && navigator.onLine !== false;

function mapLeafletHTML() {
  const base = PREFS.mapBase || 'sat', ov = PREFS.mapOv || [];
  return `<div class="lmap-wrap"><div id="lmap"></div>
    <div class="lmap-ctl top"><div class="seg">${Object.entries(MAP_BASES).map(([k, b]) => `<button class="${base === k ? 'on' : ''}" data-a="mapBase" data-k="${k}">${b.label}</button>`).join('')}</div>
      ${Object.entries(MAP_OVERLAYS).map(([k, o]) => `<button class="lchip ${ov.includes(k) ? 'on' : ''}" data-a="mapOv" data-k="${k}">${o.label}</button>`).join('')}</div>
    <div class="lmap-ctl rside"><button class="lbtn" data-a="mapSearch" aria-label="Rechercher un lieu">${ic('search')}</button><button class="lbtn" data-a="mapLocate" aria-label="Ma position">${ic('pin')}</button><button class="lbtn" data-a="mapFit" aria-label="Voir toutes les parcelles">${ic('map')}</button></div>
  </div>`;
}
const realParcels = () => S.parcelles.filter(p => !p.contourProvisoire && p.coords?.length >= 3);
function initLeaflet() {
  const el = document.getElementById('lmap'); if (!el || !hasLeaflet()) return;
  if (LMAP) { try { LMAP.remove(); } catch (e) { } LMAP = null; }
  LMAP = L.map(el, { zoomControl: false, attributionControl: true, maxZoom: 20, tap: true });
  LMAP.attributionControl.setPrefix(false);
  const b = MAP_BASES[PREFS.mapBase || 'sat'];
  L.tileLayer(b.url, { maxNativeZoom: b.max, maxZoom: 20, attribution: MAP_ATTR, crossOrigin: true }).addTo(LMAP);
  (PREFS.mapOv || []).forEach(k => { const o = MAP_OVERLAYS[k]; if (o) L.tileLayer(o.url, { maxNativeZoom: o.max, maxZoom: 20, opacity: o.opacity || 1, crossOrigin: true }).addTo(LMAP); });
  const filt = UI.f.parcCult;
  realParcels().forEach(p => {
    const c = curCult(p)?.culture, col = CULTURES[c]?.color || '#9AA79F';
    if (EDIT && EDIT.pid === p.id) return;
    const dim = filt && filt !== c;
    const poly = L.polygon(p.coords, { color: '#ffffff', weight: 2, fillColor: col, fillOpacity: dim ? 0.12 : 0.45, opacity: dim ? 0.4 : 1 }).addTo(LMAP);
    if (!dim) poly.bindTooltip(`<b>${esc(p.nom)}</b><br>${nf(p.surface, 2)} ha`, { permanent: true, direction: 'center', className: 'ptip' });
    poly.on('click', e => { if (EDIT) return; L.DomEvent.stopPropagation(e); openDrawer('parcelle', p.id); });
  });
  if (UI.mapView) LMAP.setView(UI.mapView.c, UI.mapView.z);
  else if (realParcels().length) LMAP.fitBounds(L.latLngBounds(realParcels().flatMap(p => p.coords)), { padding: [30, 30] });
  else LMAP.setView([46.6, 2.4], 6);
  LMAP.on('moveend', () => { UI.mapView = { c: LMAP.getCenter(), z: LMAP.getZoom() }; });
  LMAP.on('click', e => { if (EDIT && EDIT.mode === 'draw') { EDIT.pts.push([r2(e.latlng.lat, 7), r2(e.latlng.lng, 7)]); EDIT.sel = EDIT.pts.length - 1; renderEdit(); } });
  if (EDIT) renderEdit();
  setTimeout(() => LMAP && LMAP.invalidateSize(), 60);
}
AFTER.push(() => { if (document.getElementById('lmap')) initLeaflet(); else if (LMAP) { try { LMAP.remove(); } catch (e) { } LMAP = null; } });

/* ---- Édition point par point ---- */
function renderEdit() {
  if (!LMAP || !EDIT) return;
  if (EDIT.layer) EDIT.layer.remove();
  const g = EDIT.layer = L.layerGroup().addTo(LMAP);
  const pts = EDIT.pts;
  const shape = pts.length >= 3 ? L.polygon(pts, { color: '#FFD23F', weight: 3, fillColor: '#FFD23F', fillOpacity: 0.22, dashArray: EDIT.mode === 'draw' ? '6 6' : null, interactive: false }) : L.polyline(pts, { color: '#FFD23F', weight: 3, dashArray: '6 6', interactive: false });
  shape.addTo(g); EDIT.shape = shape;
  pts.forEach((pt, i) => {
    const m = L.marker(pt, { draggable: true, icon: L.divIcon({ className: '', html: `<div class="vx-h ${EDIT.sel === i ? 'sel' : ''}">${i + 1}</div>`, iconSize: [30, 30], iconAnchor: [15, 15] }) }).addTo(g);
    m.on('click', e => { L.DomEvent.stopPropagation(e); EDIT.sel = EDIT.sel === i ? null : i; renderEdit(); });
    m.on('drag', e => { const ll = e.target.getLatLng(); pts[i] = [r2(ll.lat, 7), r2(ll.lng, 7)]; shape.setLatLngs(pts); updateEditPanel(); });
    m.on('dragend', () => { EDIT.sel = i; renderEdit(); });
  });
  const n = pts.length, segs = n >= 3 ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const a = pts[i], b = pts[(i + 1) % n];
    const mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    const mm = L.marker(mid, { draggable: true, icon: L.divIcon({ className: '', html: '<div class="mid-h">+</div>', iconSize: [26, 26], iconAnchor: [13, 13] }) }).addTo(g);
    const insert = ll => { pts.splice(i + 1, 0, [r2(ll.lat, 7), r2(ll.lng, 7)]); EDIT.sel = i + 1; renderEdit(); };
    mm.on('click', e => { L.DomEvent.stopPropagation(e); insert(mm.getLatLng()); });
    mm.on('dragend', e => insert(e.target.getLatLng()));
  }
  updateEditPanel();
}
function updateEditPanel() {
  const el = document.getElementById('editPanel'); if (!el || !EDIT) return;
  const p = EDIT.pid ? byId('parcelles', EDIT.pid) : null; const n = EDIT.pts.length; const a = n >= 3 ? areaHa(EDIT.pts) : 0;
  el.innerHTML = `<div class="ep-h"><div><b>${p ? esc(p.nom) : 'Nouvelle parcelle'}</b><span>${EDIT.mode === 'draw' ? 'Touchez la carte pour placer les sommets' : 'Déplacez les points · « + » ajoute un point'}</span></div><div class="ep-a"><b>${nf(a, 2)} ha</b><span>${n} point${n > 1 ? 's' : ''}${p ? ` · déclarée ${nf(p.surface, 2)} ha` : ''}</span></div></div>
  <div class="ep-b"><button class="btn icon" data-a="edCancel" aria-label="Abandonner">${ic('x')}</button>${EDIT.mode === 'draw' ? `<button class="btn icon" data-a="edUndo" aria-label="Retirer le dernier point" ${n ? '' : 'disabled'}>${ic('chevL')}</button>` : ''}<button class="btn" data-a="edDelPt" aria-label="Supprimer le point sélectionné" ${EDIT.sel != null && n > 3 ? '' : 'disabled'}>${ic('trash')}${EDIT.sel != null ? ` n° ${EDIT.sel + 1}` : ''}</button><button class="btn p" data-a="edDone" ${n >= 3 ? '' : 'disabled'}>${ic('check')} Valider</button></div>`;
}
function startContour(pid) {
  const p = pid ? byId('parcelles', pid) : null;
  const fresh = !p || p.contourProvisoire || !(p.coords?.length >= 3);
  EDIT = { pid: pid || null, mode: fresh ? 'draw' : 'edit', pts: fresh ? [] : p.coords.map(c => [...c]), sel: null };
  UI.tabs.parc = 'carte'; closeDrawer();
  if (!fresh) UI.mapView = { c: L.latLngBounds(p.coords).getCenter(), z: Math.max(15, UI.mapView?.z || 15) };
  if (UI.route !== 'parcellaire') go('parcellaire'); else render();
  if (fresh) toast(p ? `Placez les sommets de « ${p.nom} » en touchant la carte` : 'Touchez la carte pour placer les sommets de la parcelle');
}
ACT.edUndo = () => { EDIT.pts.pop(); EDIT.sel = EDIT.pts.length ? EDIT.pts.length - 1 : null; renderEdit(); };
ACT.edDelPt = () => { if (EDIT.sel == null || EDIT.pts.length <= 3) return; EDIT.pts.splice(EDIT.sel, 1); EDIT.sel = null; renderEdit(); };
ACT.edCancel = () => { EDIT = null; render(); };
ACT.edDone = () => {
  const pts = EDIT.pts; if (pts.length < 3) return;
  const area = areaHa(pts);
  if (!EDIT.pid) { EDIT = null; render(); parcForm(null, { coords: pts, surface: area }); return; }
  const p = byId('parcelles', EDIT.pid); EDIT = null;
  p.coords = pts; p.centre = centroid(pts); p.contourProvisoire = false;
  if (Math.abs(area - p.surface) >= 0.01) {
    openModal({ title: 'Mettre à jour la surface ?', body: `<p>Surface mesurée sur la carte : <b>${nf(area, 2)} ha</b><br>Surface déclarée actuelle : <b>${nf(p.surface, 2)} ha</b></p><div class="note">${ic('info')}<span>La surface déclarée sert aux calculs (doses, coûts, rendements). Gardez-la si elle provient d’un document officiel (PAC, bail).</span></div>`, submit: `Utiliser ${nf(area, 2)} ha`, foot: `<button type="button" class="btn" data-a="edKeep">Garder ${nf(p.surface, 2)} ha</button><button class="btn p" type="submit" form="mf">Utiliser ${nf(area, 2)} ha</button>`, onSubmit: () => { p.surface = area; S.interventions.filter(i => i.parcelleId === p.id && i.statut === 'planifiee').forEach(i => { i.surface = area; }); commit(`Contour et surface enregistrés (${nf(area, 2)} ha)`); } });
    saveState(); render();
  } else commit('Contour enregistré');
};
ACT.edKeep = () => { closeModal(); commit('Contour enregistré, surface déclarée conservée'); };

/* ---- Commandes de carte ---- */
ACT.mapBase = d => { PREFS.mapBase = d.k; savePrefs(); render(); };
ACT.mapOv = d => { const o = PREFS.mapOv || (PREFS.mapOv = []); const i = o.indexOf(d.k); i >= 0 ? o.splice(i, 1) : o.push(d.k); savePrefs(); render(); };
ACT.mapFit = () => { if (!LMAP) return; const r = realParcels(); if (r.length) LMAP.fitBounds(L.latLngBounds(r.flatMap(p => p.coords)), { padding: [30, 30] }); else toast('Aucune parcelle dessinée pour l’instant', 'warn'); };
ACT.mapLocate = () => {
  if (!LMAP) return;
  if (!navigator.geolocation) { toast('Localisation indisponible sur cet appareil', 'warn'); return; }
  toast('Recherche de votre position…');
  navigator.geolocation.getCurrentPosition(pos => {
    const ll = [pos.coords.latitude, pos.coords.longitude];
    if (LOCATE_MK) LOCATE_MK.remove();
    LOCATE_MK = L.circleMarker(ll, { radius: 8, color: '#fff', weight: 3, fillColor: '#2F7FD1', fillOpacity: 1 }).addTo(LMAP);
    LMAP.setView(ll, Math.max(LMAP.getZoom(), 16));
  }, () => toast('Position refusée ou introuvable. Autorisez la localisation pour AGRI PILOT.', 'warn'), { enableHighAccuracy: true, timeout: 12000 });
};
ACT.mapSearch = () => openModal({
  title: 'Aller à un lieu', body: `<label class="field"><span>Commune, adresse ou référence cadastrale</span><input class="inp" id="geoQ" placeholder="Ex. : Bonneval, 28800" autocomplete="off" data-in="geoQ"></label><div id="geoRes" class="mt"></div><div class="formula">Recherche : service de géocodage de l’IGN (Géoplateforme).</div>`,
  foot: '<button type="button" class="btn" data-a="closeModal">Fermer</button>'
});
let GEO_T = null;
IN.geoQ = el => {
  clearTimeout(GEO_T); const q = el.value.trim(); const out = document.getElementById('geoRes');
  if (q.length < 3) { out.innerHTML = ''; return; }
  GEO_T = setTimeout(async () => {
    try {
      const isParcel = /^\d{5}[0-9A-Z]{3}[A-Z0-9]{2}\d{4}$/i.test(q.replace(/\s/g, ''));
      const url = `https://data.geopf.fr/geocodage/search?q=${encodeURIComponent(q)}&limit=6${isParcel ? '&index=parcel' : ''}`;
      const r = await fetch(url); const j = await r.json();
      out.innerHTML = (j.features || []).map(f => { const [ln, la] = f.geometry.coordinates; const pr = f.properties || {}; return `<div class="mrow" data-a="geoGo" data-la="${la}" data-ln="${ln}" data-z="${pr.type === 'municipality' ? 14 : 17}"><div class="ic">${ic('pin')}</div><div class="tx"><b>${esc(pr.label || pr.name || q)}</b><span>${esc(pr.context || pr.type || '')}</span></div></div>`; }).join('') || '<div class="empty">Aucun résultat</div>';
    } catch (e) { out.innerHTML = '<div class="empty">Recherche impossible (connexion ?)</div>'; }
  }, 350);
};
ACT.geoGo = d => { closeModal(); if (LMAP) LMAP.setView([+d.la, +d.ln], +d.z); };
