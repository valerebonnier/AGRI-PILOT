'use strict';
/* =====================================================================
   AGRI PILOT — Configuration de la ferme au premier lancement
   Obligatoire, rapide : listes et boutons, très peu de saisie libre.
   ===================================================================== */
const DEPTS = '01 Ain|02 Aisne|03 Allier|04 Alpes-de-Haute-Provence|05 Hautes-Alpes|06 Alpes-Maritimes|07 Ardèche|08 Ardennes|09 Ariège|10 Aube|11 Aude|12 Aveyron|13 Bouches-du-Rhône|14 Calvados|15 Cantal|16 Charente|17 Charente-Maritime|18 Cher|19 Corrèze|2A Corse-du-Sud|2B Haute-Corse|21 Côte-d\'Or|22 Côtes-d\'Armor|23 Creuse|24 Dordogne|25 Doubs|26 Drôme|27 Eure|28 Eure-et-Loir|29 Finistère|30 Gard|31 Haute-Garonne|32 Gers|33 Gironde|34 Hérault|35 Ille-et-Vilaine|36 Indre|37 Indre-et-Loire|38 Isère|39 Jura|40 Landes|41 Loir-et-Cher|42 Loire|43 Haute-Loire|44 Loire-Atlantique|45 Loiret|46 Lot|47 Lot-et-Garonne|48 Lozère|49 Maine-et-Loire|50 Manche|51 Marne|52 Haute-Marne|53 Mayenne|54 Meurthe-et-Moselle|55 Meuse|56 Morbihan|57 Moselle|58 Nièvre|59 Nord|60 Oise|61 Orne|62 Pas-de-Calais|63 Puy-de-Dôme|64 Pyrénées-Atlantiques|65 Hautes-Pyrénées|66 Pyrénées-Orientales|67 Bas-Rhin|68 Haut-Rhin|69 Rhône|70 Haute-Saône|71 Saône-et-Loire|72 Sarthe|73 Savoie|74 Haute-Savoie|75 Paris|76 Seine-Maritime|77 Seine-et-Marne|78 Yvelines|79 Deux-Sèvres|80 Somme|81 Tarn|82 Tarn-et-Garonne|83 Var|84 Vaucluse|85 Vendée|86 Vienne|87 Haute-Vienne|88 Vosges|89 Yonne|90 Territoire de Belfort|91 Essonne|92 Hauts-de-Seine|93 Seine-Saint-Denis|94 Val-de-Marne|95 Val-d\'Oise|971 Guadeloupe|972 Martinique|973 Guyane|974 La Réunion|976 Mayotte'.split('|');
const FORMES = ['Exploitation individuelle', 'EARL', 'GAEC', 'SCEA', 'SAS / SARL', 'Autre'];
const MAT_PRESETS = {
  tracteur: { label: 'Tracteur', cat: 'tracteur', icon: 'tractor', conso: 14, heuresAn: 500, dureeAmort: 10, marques: ['John Deere', 'Fendt', 'Claas', 'New Holland', 'Case IH', 'Massey Ferguson', 'Deutz-Fahr', 'Valtra', 'Kubota', 'Steyr', 'Same', 'Landini'] },
  moissonneuse: { label: 'Moissonneuse-batteuse', cat: 'moissonneuse', icon: 'wheat', conso: 30, heuresAn: 150, dureeAmort: 12, marques: ['Claas', 'John Deere', 'New Holland', 'Case IH', 'Fendt', 'Massey Ferguson', 'Deutz-Fahr', 'Laverda'] },
  pulverisateur: { label: 'Pulvérisateur', cat: 'pulverisateur', icon: 'droplet', conso: 0, heuresAn: 200, dureeAmort: 10, marques: ['Amazone', 'Kuhn', 'Berthoud', 'Tecnoma', 'Hardi', 'Lemken', 'Horsch', 'John Deere'] },
  semoir: { label: 'Semoir', cat: 'semoir', icon: 'sprout', conso: 0, heuresAn: 120, dureeAmort: 10, marques: ['Väderstad', 'Amazone', 'Kuhn', 'Horsch', 'Lemken', 'Sulky', 'Monosem', 'Kverneland'] },
  dechaumeur: { label: 'Déchaumeur', cat: 'dechaumeur', icon: 'shovel', conso: 0, heuresAn: 120, dureeAmort: 10, marques: ['Horsch', 'Väderstad', 'Lemken', 'Amazone', 'Kuhn', 'Köckerling', 'Gregoire Besson'] },
  charrue: { label: 'Charrue', cat: 'charrue', icon: 'shovel', conso: 0, heuresAn: 90, dureeAmort: 12, marques: ['Kuhn', 'Lemken', 'Kverneland', 'Gregoire Besson', 'Naud', 'Pöttinger'] },
  remorque: { label: 'Remorque / benne', cat: 'remorque', icon: 'box', conso: 0, heuresAn: 150, dureeAmort: 15, marques: ['Brimont', 'Rolland', 'Gilibert', 'Maupu', 'Joskin', 'Fliegl'] },
  epandeur: { label: 'Épandeur d’engrais', cat: 'divers', icon: 'flask', conso: 0, heuresAn: 60, dureeAmort: 10, marques: ['Amazone', 'Kuhn', 'Sulky', 'Bogballe', 'Rauch'] },
  telescopique: { label: 'Télescopique / chargeur', cat: 'manutention', icon: 'box', conso: 7, heuresAn: 350, dureeAmort: 10, marques: ['Manitou', 'Merlo', 'JCB', 'Claas', 'New Holland', 'Kramer', 'Bobcat'] },
  arracheuse: { label: 'Arracheuse', cat: 'divers', icon: 'wheat', conso: 0, heuresAn: 60, dureeAmort: 12, marques: ['Grimme', 'Dewulf', 'AVR', 'Ropa'] },
  irrigation: { label: 'Matériel d’irrigation', cat: 'divers', icon: 'droplet', conso: 0, heuresAn: 120, dureeAmort: 12, marques: ['Irrifrance', 'Ocmis', 'Bauer', 'Valley', 'Lindsay'] },
};
/* Correspondance des matériels utilisés dans les ITK types → type de matériel */
const ITK_MAT_PRESET = { t1: 'tracteur', t2: 'tracteur', t3: 'tracteur', mb: 'moissonneuse', pulve: 'pulverisateur', semoir: 'semoir', dech: 'dechaumeur', charrue: 'charrue', rem: 'remorque', manit: 'telescopique', epand: 'epandeur', arr: 'arracheuse', irrig: 'irrigation' };
const OB_CULTURES = ['ble_tendre', 'ble_dur', 'orge_h', 'orge_p', 'colza', 'mais', 'pois', 'pdt', 'legumes', 'prairie'];
const OB_STEPS = [['ferme', 'Ma ferme'], ['productions', 'Mes productions'], ['parcelles', 'Mes parcelles'], ['materiel', 'Mon matériel'], ['recap', 'C’est prêt']];
const OB_KEY = 'agripilot.onboarding.v1';
let OB = null;
function obLoad() {
  try { const d = JSON.parse(localStorage.getItem(OB_KEY) || 'null'); if (d && d.v === 1) { OB = d; return; } } catch (e) { }
  OB = { v: 1, step: 0, nom: '', prenom: '', forme: 'EARL', dept: '', cultures: [], parcelles: [], materiel: {}, genTasks: true };
}
function obSave() { try { localStorage.setItem(OB_KEY, JSON.stringify(OB)); } catch (e) { } }
function obValid(step) {
  const k = OB_STEPS[step][0];
  if (k === 'ferme') return OB.nom.trim().length >= 2 && !!OB.dept ? '' : 'Indiquez le nom de la ferme et le département';
  if (k === 'productions') return OB.cultures.length ? '' : 'Choisissez au moins une production';
  if (k === 'parcelles') return OB.parcelles.length && OB.parcelles.every(p => p.nom.trim() && p.surface > 0 && p.culture) ? '' : 'Ajoutez au moins une parcelle avec sa surface';
  return '';
}
const obSurf = () => r2(sum(OB.parcelles, p => p.surface), 2);
const matUnits = () => Object.entries(OB.materiel).flatMap(([k, list]) => list.map((u, i) => ({ k, i, ...u })));

function renderOnboarding() {
  if (!OB) obLoad();
  document.documentElement.dataset.theme = PREFS.theme;
  const step = OB.step, key = OB_STEPS[step][0], err = obValid(step);
  const body = { ferme: obFerme, productions: obProductions, parcelles: obParcelles, materiel: obMateriel, recap: obRecap }[key]();
  document.getElementById('app').innerHTML = `<div class="ob">
    <header class="ob-top"><div class="row"><span class="brand-logo" style="width:32px;height:32px;border-radius:10px">${ic('leaf')}</span><b>AGRI PILOT</b><span class="sp"></span><span class="small muted b">Étape ${step + 1} / ${OB_STEPS.length}</span></div>
      <div class="ob-prog">${OB_STEPS.map((s, i) => `<i class="${i < step ? 'done' : i === step ? 'on' : ''}"></i>`).join('')}</div></header>
    <main class="ob-body">${body}</main>
    <footer class="ob-foot">${step > 0 ? `<button class="btn" data-a="obPrev">${ic('chevL')}</button>` : ''}
      ${key === 'materiel' && !matUnits().length ? `<button class="btn ob-next" data-a="obNext">Je le ferai plus tard ${ic('chevR')}</button>` : key === 'recap' ? `<button class="btn p ob-next" data-a="obFinish">${ic('check')} Démarrer AGRI PILOT</button>` : `<button class="btn p ob-next" data-a="obNext" ${err ? 'disabled' : ''}>Continuer ${ic('chevR')}</button>`}</footer>
    ${err && key !== 'materiel' && key !== 'recap' ? `<div class="ob-hint">${esc(err)}</div>` : ''}
  </div>`;
}
function obRerender(focusSel) {
  const a = document.activeElement; const sel = focusSel || (a && a.dataset && a.dataset.in ? `[data-in="${a.dataset.in}"][data-i="${a.dataset.i ?? ''}"]` : null); const pos = a && a.selectionStart;
  const sc = document.querySelector('.ob-body')?.scrollTop || 0;
  renderOnboarding();
  const b = document.querySelector('.ob-body'); if (b) b.scrollTop = sc;
  if (sel) { const el = document.querySelector(sel) || document.querySelector(sel.replace(/\[data-i="[^"]*"\]/, '')); if (el) { el.focus(); try { if (pos != null) el.setSelectionRange(pos, pos); } catch (e) { } } }
}

/* ---- Étape 1 : la ferme ---- */
function obFerme() {
  return `<h1 class="ob-h">Bienvenue ! Configurons votre ferme.</h1><p class="ob-p">Quatre étapes rapides : ce minimum permet à l’application de calculer vos stocks, vos coûts et vos tâches.</p>
  <label class="field"><span>Nom de l’exploitation *</span><input class="inp" data-in="obF" data-k="nom" value="${esc(OB.nom)}" placeholder="Ex. : EARL du Moulin" autocomplete="organization"></label>
  <label class="field mt"><span>Votre prénom <small class="muted">(facultatif)</small></span><input class="inp" data-in="obF" data-k="prenom" value="${esc(OB.prenom)}" placeholder="Pour l’accueil" autocomplete="given-name"></label>
  <div class="field mt"><span>Forme juridique</span><div class="ob-chips">${FORMES.map(f => `<button class="fchip ${OB.forme === f ? 'on' : ''}" style="--c:var(--primary)" data-a="obSet" data-k="forme" data-v="${esc(f)}">${f}</button>`).join('')}</div></div>
  <label class="field mt"><span>Département du siège *</span><select class="inp" data-ch="obDept"><option value="">— Choisir —</option>${DEPTS.map(d => `<option value="${esc(d)}" ${OB.dept === d ? 'selected' : ''}>${esc(d)}</option>`).join('')}</select></label>`;
}
IN.obF = el => { OB[el.dataset.k] = el.value; obSave(); const btn = document.querySelector('.ob-next'); const err = obValid(OB.step); if (btn) btn.disabled = !!err; const h = document.querySelector('.ob-hint'); if (h) h.style.display = err ? '' : 'none'; };
CH.obDept = el => { OB.dept = el.value; obSave(); obRerender(); };
ACT.obSet = d => { OB[d.k] = d.v; obSave(); obRerender(); };

/* ---- Étape 2 : productions ---- */
function obProductions() {
  return `<h1 class="ob-h">Que cultivez-vous cette campagne ?</h1><p class="ob-p">Touchez toutes vos productions ${campLabel(CURRENT_CAMP)}. Chacune est livrée avec un itinéraire technique type, modifiable ensuite.</p>
  <div class="ob-grid">${OB_CULTURES.map(k => { const on = OB.cultures.includes(k); return `<button class="ob-tile ${on ? 'on' : ''}" style="--c:${CULTURES[k].color}" data-a="obCult" data-k="${k}"><span class="sw"></span><b>${CULTURES[k].nom}</b><span class="ck">${on ? ic('check') : ''}</span></button>`; }).join('')}</div>
  <p class="small muted mt">${OB.cultures.length} production(s) sélectionnée(s)</p>`;
}
ACT.obCult = d => {
  const i = OB.cultures.indexOf(d.k);
  if (i >= 0) { OB.cultures.splice(i, 1); OB.parcelles = OB.parcelles.filter(p => p.culture !== d.k); } else OB.cultures.push(d.k);
  obSave(); obRerender();
};

/* ---- Étape 3 : parcelles ---- */
function obParcelles() {
  return `<h1 class="ob-h">Vos parcelles</h1><p class="ob-p">Touchez une culture pour ajouter une parcelle, puis ajustez la surface avec − / +. Les contours pourront être dessinés ou importés plus tard.</p>
  <div class="ob-sum"><div><b>${nf(obSurf(), 1)} ha</b><span>surface totale</span></div><div><b>${OB.parcelles.length}</b><span>parcelle(s)</span></div></div>
  <div class="field"><span>Ajouter une parcelle de…</span><div class="ob-chips">${OB.cultures.map(k => `<button class="fchip" style="--c:${CULTURES[k].color}" data-a="obAddP" data-k="${k}"><span class="cat-dot" style="--c:${CULTURES[k].color}"></span>${ic('plus')} ${CULTURES[k].nom}</button>`).join('')}</div></div>
  <div class="mt">${OB.parcelles.map((p, i) => `<div class="ob-parc" style="--c:${CULTURES[p.culture]?.color}">
    <div class="row" style="gap:8px"><span class="cat-dot" style="--c:${CULTURES[p.culture]?.color}"></span><input class="inp ob-name" data-in="obPN" data-i="${i}" value="${esc(p.nom)}" aria-label="Nom de la parcelle"><button class="btn icon g sm" data-a="obDelP" data-i="${i}" aria-label="Supprimer">${ic('trash')}</button></div>
    <div class="row mt" style="gap:8px;flex-wrap:wrap"><select class="inp" style="flex:1;min-width:140px;height:42px" data-ch="obPC" data-i="${i}">${OB.cultures.map(k => `<option value="${k}" ${p.culture === k ? 'selected' : ''}>${CULTURES[k].nom}</option>`).join('')}</select>
      <div class="stepper"><button data-a="obStep" data-i="${i}" data-d="-1">${ic('minus')}</button><input inputmode="decimal" data-in="obPS" data-i="${i}" value="${String(p.surface).replace('.', ',')}" aria-label="Surface en hectares"><span>ha</span><button data-a="obStep" data-i="${i}" data-d="1">${ic('plus')}</button></div></div>
    <div class="ob-quick">${[2, 5, 10, 15, 20, 30].map(v => `<button class="${p.surface === v ? 'on' : ''}" data-a="obQS" data-i="${i}" data-v="${v}">${v} ha</button>`).join('')}</div>
  </div>`).join('') || `<div class="card empty">Aucune parcelle pour l’instant : touchez une culture ci-dessus.</div>`}</div>`;
}
ACT.obAddP = d => { const n = OB.parcelles.length + 1; OB.parcelles.push({ nom: `Parcelle ${n}`, culture: d.k, surface: 10 }); obSave(); obRerender(); setTimeout(() => { const b = document.querySelector('.ob-body'); b && b.scrollTo({ top: b.scrollHeight, behavior: 'smooth' }); }, 30); };
ACT.obDelP = d => { OB.parcelles.splice(+d.i, 1); obSave(); obRerender(); };
ACT.obStep = d => { const p = OB.parcelles[+d.i]; p.surface = Math.max(0.5, r2(p.surface + (+d.d), 2)); obSave(); obRerender(); };
ACT.obQS = d => { OB.parcelles[+d.i].surface = +d.v; obSave(); obRerender(); };
IN.obPN = el => { OB.parcelles[+el.dataset.i].nom = el.value; obSave(); const btn = document.querySelector('.ob-next'); if (btn) btn.disabled = !!obValid(OB.step); };
IN.obPS = el => { const v = parseFloat(el.value.replace(',', '.')); OB.parcelles[+el.dataset.i].surface = v > 0 ? r2(v, 2) : 0; obSave(); const s = document.querySelector('.ob-sum b'); if (s) s.textContent = `${nf(obSurf(), 1)} ha`; const btn = document.querySelector('.ob-next'); if (btn) btn.disabled = !!obValid(OB.step); };
CH.obPC = el => { OB.parcelles[+el.dataset.i].culture = el.value; obSave(); obRerender(); };

/* ---- Étape 4 : matériel ---- */
function obMateriel() {
  const yrs = []; for (let y = new Date().getFullYear(); y >= 1975; y--) yrs.push(y);
  return `<h1 class="ob-h">Votre matériel</h1><p class="ob-p">Indiquez le nombre de chaque matériel, puis sa marque et son année. Il sert au calcul des coûts de mécanisation et aux rappels d’entretien. Étape facultative.</p>
  <div class="ob-mat">${Object.entries(MAT_PRESETS).map(([k, m]) => { const n = (OB.materiel[k] || []).length; return `<div class="ob-mrow ${n ? 'on' : ''}"><span class="ti">${ic(m.icon)}</span><b>${m.label}</b><div class="stepper sm"><button data-a="obMat" data-k="${k}" data-d="-1" ${n ? '' : 'disabled'}>${ic('minus')}</button><span class="v">${n}</span><button data-a="obMat" data-k="${k}" data-d="1">${ic('plus')}</button></div></div>`; }).join('')}</div>
  ${matUnits().length ? `<div class="field mt2"><span>Précisez marque et année</span>${matUnits().map(u => { const m = MAT_PRESETS[u.k]; return `<div class="ob-unit"><b>${m.label}${(OB.materiel[u.k].length > 1) ? ' ' + (u.i + 1) : ''}</b><div class="row" style="gap:8px"><select class="inp" data-ch="obMU" data-k="${u.k}" data-i="${u.i}" data-f="marque">${opts([['', 'Marque…'], ...m.marques.map(x => [x, x]), ['Autre', 'Autre']], u.marque)}</select><select class="inp" style="max-width:120px" data-ch="obMU" data-k="${u.k}" data-i="${u.i}" data-f="annee">${opts([['', 'Année…'], ...yrs.map(y => [y, y])], u.annee)}</select></div></div>`; }).join('')}</div>` : ''}`;
}
ACT.obMat = d => { const l = OB.materiel[d.k] || (OB.materiel[d.k] = []); if (+d.d > 0) l.push({ marque: '', annee: '' }); else l.pop(); obSave(); obRerender(); };
CH.obMU = el => { OB.materiel[el.dataset.k][+el.dataset.i][el.dataset.f] = el.value; obSave(); };

/* ---- Étape 5 : récapitulatif ---- */
function obRecap() {
  const byC = OB.cultures.map(k => ({ k, s: sum(OB.parcelles.filter(p => p.culture === k), p => p.surface), n: OB.parcelles.filter(p => p.culture === k).length })).filter(x => x.n);
  return `<h1 class="ob-h">Tout est prêt${OB.prenom ? ', ' + esc(OB.prenom) : ''} !</h1><p class="ob-p">Vérifiez le récapitulatif. Vous pourrez tout compléter ensuite.</p>
  <div class="card"><div class="mrow" data-a="obGo" data-s="0"><div class="ic">${ic('farm')}</div><div class="tx"><b>${esc(OB.nom)}</b><span>${esc(OB.forme)} · ${esc(OB.dept)}</span></div>${ic('edit')}</div>
  <div class="mrow" data-a="obGo" data-s="2" style="--c:var(--c-cult)"><div class="ic">${ic('map')}</div><div class="tx"><b>${OB.parcelles.length} parcelle(s) · ${nf(obSurf(), 1)} ha</b><span>${byC.map(x => `${CULTURES[x.k].nom} ${nf(x.s, 1)} ha`).join(' · ')}</span></div>${ic('edit')}</div>
  <div class="mrow" data-a="obGo" data-s="3" style="--c:var(--c-mat)"><div class="ic">${ic('tractor')}</div><div class="tx"><b>${matUnits().length} matériel(s)</b><span>${matUnits().map(u => MAT_PRESETS[u.k].label).join(', ') || 'À ajouter plus tard'}</span></div>${ic('edit')}</div></div>
  <div class="card mt"><div class="mrow" data-a="obToggle" style="--c:var(--c-cult)"><div class="ic">${ic('calendar')}</div><div class="tx" style="white-space:normal"><b>Préparer mon calendrier de travaux</b><span style="white-space:normal">Crée les prochaines interventions à partir des itinéraires types (à partir d’aujourd’hui, rien n’est daté dans le passé).</span></div><button class="switch ${OB.genTasks ? 'on' : ''}" tabindex="-1"></button></div></div>
  <div class="note mt">${ic('info')}<span>Vos données restent sur cet appareil. Pensez à exporter régulièrement depuis Paramètres ; la sauvegarde en ligne arrive avec l’étape 2.</span></div>`;
}
ACT.obGo = d => { OB.step = +d.s; obSave(); obRerender(); };
ACT.obToggle = () => { OB.genTasks = !OB.genTasks; obSave(); obRerender(); };
ACT.obPrev = () => { OB.step = Math.max(0, OB.step - 1); obSave(); renderOnboarding(); window.scrollTo(0, 0); };
ACT.obNext = () => { const e = obValid(OB.step); if (e) { toast(e, 'warn'); return; } OB.step = Math.min(OB_STEPS.length - 1, OB.step + 1); obSave(); renderOnboarding(); window.scrollTo(0, 0); };

/** Création de la ferme à partir des réponses. */
ACT.obFinish = () => {
  for (let i = 0; i < 3; i++) { const e = obValid(i); if (e) { OB.step = i; obSave(); renderOnboarding(); toast(e, 'warn'); return; } }
  const tpl = seedDemo(); // catalogue d'intrants et itinéraires types (aucune donnée de démo conservée)
  const stock = tpl.stock.filter(s => s.cat !== 'production').map(s => ({ ...s, qte: 0, lot: '', fournisseur: '', dateEntree: TODAY, seuil: 0 }));
  const materiel = [];
  matUnits().forEach(u => { const p = MAT_PRESETS[u.k]; const n = OB.materiel[u.k].length; materiel.push({ id: uid('mat'), preset: u.k, cat: p.cat, marque: u.marque || 'À préciser', modele: p.label + (n > 1 ? ` ${u.i + 1}` : ''), annee: +u.annee || new Date().getFullYear(), serie: '', immat: '', heures: 0, puissance: null, dateAchat: '', prixAchat: 0, conso: p.conso, heuresAn: p.heuresAn, etat: 'bon', dureeAmort: p.dureeAmort, valeurManuelle: null, maintenance: [], prochain: null, historiqueValeur: [], heuresUsage: 0 }); });
  // ITK : remplace les matériels types par ceux de la ferme
  const itk = tpl.itk;
  Object.values(itk).forEach(t => t.steps.forEach(s => {
    const out = [];
    s.materiels.forEach(mid => { const pk = ITK_MAT_PRESET[mid]; const cands = materiel.filter(m => m.preset === pk); if (!cands.length) return; const idx = pk === 'tracteur' ? Math.min(cands.length - 1, +(mid.slice(1)) - 1 || 0) : 0; const m = cands[Math.max(0, idx)]; if (!out.includes(m.id)) out.push(m.id); });
    s.materiels = out;
  }));
  const dept = OB.dept.split(' ')[0];
  const LAT0 = 46.6, LNG0 = 2.4, cos = Math.cos(LAT0 * Math.PI / 180);
  const parcelles = OB.parcelles.map((p, i) => {
    const side = Math.sqrt(p.surface * 10000), x = (i % 4) * 900, y = Math.floor(i / 4) * -900;
    const la = LAT0 + y / 110540, ln = LNG0 + x / (111320 * cos), dla = side / 2 / 110540, dln = side / 2 / (111320 * cos);
    const it = itk[p.culture]; const md = it ? it.semisType : '03-01'; const yr = +md.slice(0, 2) >= 8 ? CURRENT_CAMP - 1 : CURRENT_CAMP; const semis = `${yr}-${md}`;
    const rec = it?.steps.find(s => s.type === 'recolte');
    return { id: uid('p'), nom: p.nom.trim(), surface: p.surface, cadastre: '', commune: '', sol: '', coords: [[la - dla, ln - dln], [la - dla, ln + dln], [la + dla, ln + dln], [la + dla, ln - dln]].map(c => c.map(v => r2(v, 6))), centre: [r2(la, 5), r2(ln, 5)], contourProvisoire: true, cultures: { [CURRENT_CAMP]: { culture: p.culture, variete: '', semis, recoltePrev: rec ? addDays(semis, rec.off) : null, rdtPrev: null, rdtReel: null } }, ilot: 1, numPac: `1.${i + 1}`, statutFoncier: 'propriete', statut: 'en_culture', notes: '' };
  });
  S = {
    version: 1, demo: false, onboarded: true, createdAt: TODAY, seq: { facture: 0 },
    exploitation: { nom: OB.nom.trim(), forme: OB.forme, siret: '', pacage: '', exploitant: OB.prenom.trim(), adresse: '', departement: OB.dept, telephone: '', email: '', certification: '', mainOeuvre: [{ nom: OB.prenom.trim() || 'Exploitant', role: 'Exploitant', taux: 0 }] },
    users: [{ id: 'u1', nom: OB.prenom.trim() || 'Administrateur', email: '', role: 'Administrateur' }],
    parcelles, interventions: [], stock, mouvements: [], ventes: [], charges: [], materiel,
    cours: Object.fromEntries(Object.entries(tpl.cours).map(([k, c]) => [k, { nom: c.nom, unite: c.unite, source: 'Aucune source — saisissez vos prix', type: 'manuel', points: [], manuels: [] }])),
    itk, favoris: tpl.favoris.map(f => ({ ...f, materiels: [] })), documents: [], echeances: [],
    pac: { campagnes: { [CURRENT_CAMP]: { statut: 'preparation', dateDepot: null, note: '' } }, checklist: { [CURRENT_CAMP]: {} } }, gettingStarted: { hidden: false },
  };
  let n = 0;
  if (OB.genTasks) parcelles.forEach(p => { const rec = p.cultures[CURRENT_CAMP]; const it = itk[rec.culture]; if (!it) return; it.steps.forEach(sp => { const date = addDays(rec.semis, sp.off); if (date < TODAY) return; S.interventions.push({ id: uid('iv'), campagne: CURRENT_CAMP, parcelleId: p.id, date, type: sp.type, label: sp.label, statut: 'planifiee', surface: p.surface, produits: sp.produits.map(x => ({ ...x })), materiels: [...sp.materiels], heures: r2(sp.hHa * p.surface, 1), mo: '', meteo: '', obs: '', photos: [], fromItk: true }); n++; }); });
  S.interventions.sort((a, b) => a.date.localeCompare(b.date));
  try { localStorage.removeItem(OB_KEY); } catch (e) { }
  OB = null; PREFS.camp = CURRENT_CAMP; savePrefs(); UI.assist = null;
  saveState(); location.hash = 'dashboard'; render(); window.scrollTo(0, 0);
  toast(`Ferme créée · ${parcelles.length} parcelle(s)${n ? ` · ${n} travaux planifiés` : ''}`);
};
ACT.reconfigure = () => openModal({ title: 'Configurer une nouvelle ferme ?', body: `<div class="note warn">${ic('alert')}<span>Toutes les données actuelles de cet appareil seront remplacées. Exportez-les d’abord si besoin (Paramètres → Exporter).</span></div>`, submit: 'Recommencer la configuration', onSubmit: () => { S.onboarded = false; OB = null; try { localStorage.removeItem(OB_KEY); } catch (e) { } saveState(); render(); } });
ACT.loadDemo = () => openModal({ title: 'Charger la démonstration ?', body: `<div class="note warn">${ic('alert')}<span>Vos données actuelles seront remplacées par l’exploitation fictive de démonstration.</span></div>`, submit: 'Charger la démo', onSubmit: () => { resetDemo(); S.onboarded = true; saveState(); UI.assist = null; commit('Démonstration chargée'); } });
