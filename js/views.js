'use strict';
/* =====================================================================
   AGRI PILOT — Modules (vues, fiches, formulaires)
   ===================================================================== */
const opts = (list, sel) => list.map(([v, l]) => `<option value="${esc(v)}" ${String(v) === String(sel) ? 'selected' : ''}>${esc(l)}</option>`).join('');
const demoBar = (txt = 'Exploitation fictive : toutes les données affichées sont des données de démonstration. Vous pouvez repartir d’une exploitation vierge dans Paramètres.') => S.demo ? `<div class="demo-bar">${ic('info')}<span class="dtx">${txt}</span></div>` : '';
const kpi = (icon, label, value, sub = '', a = '', tone = '') => `<div class="card kpi" ${a}><div class="kpi-l"><span class="kpi-ic" ${tone ? `style="background:var(--${tone}-soft);color:var(--${tone})"` : ''}>${ic(icon)}</span>${label}</div><div class="kpi-v">${value}</div>${sub ? `<div class="kpi-s">${sub}</div>` : ''}</div>`;
const card = (title, body, o = {}) => `<div class="card ${o.cls || ''}" ${o.attr || ''}><div class="card-h"><h3>${title}</h3>${o.sub ? `<span class="sub">${o.sub}</span>` : ''}<span class="sp"></span>${o.right || ''}</div><div class="card-b">${body}</div></div>`;
const tabsBar = (k, items, cur, drawer) => `<div class="tabs">${items.map(([v, l]) => `<button type="button" class="${cur === v ? 'on' : ''}" data-a="tab" data-k="${k}" data-v="${v}" ${drawer ? 'data-drawer="1"' : ''}>${l}</button>`).join('')}</div>`;
const parcName = id => byId('parcelles', id)?.nom || '—';
const matName = id => { const m = byId('materiel', id); return m ? `${m.marque} ${m.modele}` : '—'; };
const curCult = p => p.cultures[CURRENT_CAMP] || null;

/* =========================== ACCUEIL (mobile d'abord) =========================== */
function catCounts(todo) {
  return Object.entries(TASK_CATS).map(([k, c]) => ({ k, ...c, n: todo.filter(t => t.cat === k).length, u: todo.filter(t => t.cat === k && t.urgence === 'danger').length, w: todo.filter(t => t.cat === k && t.urgence === 'warn').length }));
}
const mini = (label, value, sub, a = '', color = 'var(--primary)') => `<div class="mini" ${a}><div class="l"><i class="dotc" style="background:${color}"></i>${label}</div><div class="v">${value}</div><div class="s">${sub}</div></div>`;
function gettingStarted() {
  const steps = [
    { k: 'contour', l: 'Dessiner le contour de vos parcelles', s: 'Pour la carte et la déclaration PAC', i: 'map', c: 'var(--c-cult)', done: !S.parcelles.some(p => p.contourProvisoire), a: 'data-a="go" data-r="parcellaire"' },
    { k: 'stock', l: 'Saisir vos stocks d’intrants', s: 'Semences, engrais, phytos, GNR', i: 'box', c: 'var(--c-stock)', done: S.stock.some(i => i.cat !== 'production' && i.qte > 0), a: 'data-a="purchase"' },
    { k: 'mat', l: 'Compléter la valeur du matériel', s: 'Prix d’achat et heures compteur', i: 'tractor', c: 'var(--c-mat)', done: !S.materiel.length ? false : S.materiel.every(m => m.prixAchat > 0), a: S.materiel.length ? 'data-a="go" data-r="materiel"' : 'data-a="newMat"' },
    { k: 'cours', l: 'Saisir un prix de vente de référence', s: 'Pour valoriser vos récoltes', i: 'trend', c: 'var(--c-vente)', done: Object.values(S.cours).some(c => c.points.length), a: 'data-a="goCours"' },
    { k: 'iv', l: 'Enregistrer une première intervention', s: 'Avec le bouton + en bas', i: 'sprout', c: 'var(--c-cult)', done: S.interventions.some(i => i.statut === 'realisee'), a: 'data-a="quickIv"' },
  ];
  return steps;
}
VIEWS.dashboard = () => {
  const camp = PREFS.camp, E = econ(camp), st = stockTotals(), todo = todoList(), todo60 = todoList(60);
  const ivCur = S.interventions.filter(i => i.campagne === CURRENT_CAMP);
  const done = ivCur.filter(i => i.statut === 'realisee').length;
  const parc = sum(S.materiel, m => valeurMateriel(m));
  const urgent = todo.filter(t => t.urgence === 'danger').length, soon = todo.filter(t => t.urgence === 'warn').length;
  const next = S.interventions.filter(i => i.statut === 'planifiee' && i.date >= TODAY).sort((a, b) => a.date.localeCompare(b.date))[0];
  const W = {};
  W.premiers = () => { if (S.demo || S.gettingStarted?.hidden) return ''; const st = gettingStarted(); const ok = st.filter(x => x.done).length; if (ok === st.length) return ''; return `<div class="sec-h"><h3>Premiers pas</h3><span class="muted small">${ok}/${st.length}</span><span class="sp"></span><button class="lnk" data-a="hideGS">Masquer</button></div>
    <div class="card gs"><div class="bar" style="margin:14px 14px 4px"><i style="width:${ok / st.length * 100}%"></i></div>${st.map(x => `<div class="mrow ${x.done ? 'done' : ''}" style="--c:${x.c}" ${x.done ? '' : x.a}><div class="ic">${x.done ? ic('check') : ic(x.i)}</div><div class="tx"><b>${x.l}</b><span>${x.s}</span></div>${x.done ? '' : ic('chevR')}</div>`).join('')}</div>`; };
  W.categories = () => `<div class="sec-h"><h3>Mes tâches</h3><span class="sp"></span><a href="#taches">Tout voir ${ic('chevR')}</a></div>
    <div class="cat-grid">${catCounts(todo60).map(c => `<button class="cat-tile" style="--c:${c.color}" data-a="goTasks" data-c="${c.k}"><span class="ti">${ic(c.icon)}</span><span class="n">${c.n}</span><b>${c.label}</b><span class="u ${c.u || c.w ? '' : 'none'}">${c.u ? `${c.u} en retard` : c.w ? `${c.w} cette semaine` : c.n ? 'à planifier' : 'à jour'}</span></button>`).join('')}</div>`;
  W.priorites = () => `<div class="sec-h"><h3>À faire en priorité</h3><span class="sp"></span><a href="#taches">${todo.length} tâche${todo.length > 1 ? 's' : ''} ${ic('chevR')}</a></div>
    ${todo.filter(t => t.urgence !== 'ok').slice(0, 4).map(t => taskCard(t)).join('') || `<div class="card pad row">${ic('check')}<span class="muted">Rien d’urgent — tout est à jour.</span></div>`}`;
  W.cultures = () => { const ass = assolement(CURRENT_CAMP); if (!ass.length) return ''; return `<div class="sec-h"><h3>Mes cultures</h3><span class="muted small">${campLabel(CURRENT_CAMP)}</span><span class="sp"></span><a href="#parcellaire">Carte ${ic('chevR')}</a></div>
    <div class="hscroll">${ass.map(a => { const pids = S.parcelles.filter(p => p.cultures[CURRENT_CAMP]?.culture === a.key).map(p => p.id); const ivs = ivCur.filter(i => pids.includes(i.parcelleId)); const d = ivs.filter(i => i.statut === 'realisee').length; const nx = ivs.filter(i => i.statut === 'planifiee').sort((x, y) => x.date.localeCompare(y.date))[0]; return `<div class="crop" style="--c:${a.color}" data-a="goCult" data-c="${a.key}"><div class="row"><span class="sw"></span><b>${esc(a.label)}</b></div><div class="v">${nf(a.value, 1)} ha</div><div class="s">${pids.length} parcelle${pids.length > 1 ? 's' : ''}</div>${ivs.length ? `<div class="bar" style="margin:10px 0 6px"><i style="width:${d / ivs.length * 100}%;background:var(--c)"></i></div><div class="s">${d}/${ivs.length} travaux réalisés</div>` : '<div class="s" style="margin-top:10px">Aucun travail planifié</div>'}${nx ? `<div class="nx">${ic(IV_ICON[nx.type] || 'sprout')}<span>${esc(nx.label)} · ${dshort(nx.date)}</span></div>` : ''}</div>`; }).join('')}</div>`; };
  W.actions = () => `<div class="sec-h"><h3>Saisie rapide</h3></div><div class="qa-grid q4">${QUICK_ACTIONS.map(q => `<button class="qa" style="--c:${q.c}" data-a="qa" data-k="${q.k}"><span class="ti">${ic(q.i)}</span>${q.l}</button>`).join('')}</div>`;
  W.kpis = () => `<div class="sec-h"><h3>Chiffres clés</h3><span class="muted small">${campLabel(camp)}</span><span class="sp"></span><button class="lnk" data-a="go" data-r="economie">Économie ${ic('chevR')}</button></div>
    <div class="hscroll">
      ${mini(`CA réalisé`, keur(E.ca), E.ca ? `${keur(E.impayes)} à encaisser` : 'aucune vente saisie', 'data-a="go" data-r="ventes"', 'var(--c-vente)')}
      ${mini('Charges', keur(E.charges), E.charges ? `intrants ${keur(sum(S.charges.filter(c => c.campagne === camp && c.cat === 'intrants'), c => c.montant))}` : 'aucune charge saisie', 'data-a="go" data-r="economie"', 'var(--c-eco)')}
      ${mini('Résultat prévisionnel', keur(E.resultatPrev), `réalisé ${keur(E.resultatRealise)}`, 'data-a="go" data-r="economie"', 'var(--c-eco)')}
      ${mini('Valeur des stocks', keur(st.intrants + st.production), `récoltes ${keur(st.production)} (théorique)`, 'data-a="go" data-r="stocks"', 'var(--c-stock)')}
      ${mini('Avancement travaux', `${ivCur.length ? nf(done / ivCur.length * 100) : 0} %`, `${done}/${ivCur.length} interventions`, 'data-a="go" data-r="interventions"', 'var(--c-cult)')}
      ${mini('Parc matériel', S.materiel.length && S.materiel.every(m => m.prixAchat > 0) ? keur(parc) : '—', `${S.materiel.length} équipement${S.materiel.length > 1 ? 's' : ''}${S.materiel.some(m => !m.prixAchat) ? ' · valeurs à compléter' : ' · indicatif'}`, 'data-a="go" data-r="materiel"', 'var(--c-mat)')}
    </div>`;
  W.surfaces = () => card(`Assolement ${campLabel(CURRENT_CAMP)}`, donut(assolement(CURRENT_CAMP), { fmt: v => `${nf(v, 1)} ha`, center: [nf(surfaceTotale(), 0), 'hectares'], size: 150, thick: 22 }), { cls: 'mt' });
  W.ca = () => { const m = caMensuel(camp); return E.ca || E.charges ? card(`CA et charges · ${campLabel(camp)}`, barChart({ labels: m.map(x => x.label), series: [{ name: "Chiffre d'affaires", color: 'var(--c-vente)', values: m.map(x => x.ca) }, { name: 'Charges', color: 'var(--c-eco)', values: m.map(x => x.ch) }] }), { cls: 'mt' }) : ''; };
  W.marges = () => card(`Marge brute / ha · ${campLabel(camp)}`, E.rows.filter(r => r.production > 0).length ? hbars(E.rows.filter(r => r.production > 0).sort((a, b) => b.mbHa - a.mbHa).map(r => ({ label: r.nom, value: r.mbHa, color: r.color })), { fmt: v => `${eur(v)}/ha` }) : '<div class="empty small">Les marges s’afficheront après vos premières récoltes enregistrées.</div>', { cls: 'mt' });
  W.charges = () => E.byCat.length ? card(`Charges · ${campLabel(camp)}`, donut(E.byCat.sort((a, b) => b.value - a.value).map((c, i) => ({ ...c, color: ['#1C6A47', '#E2761B', '#2F7FD1', '#7A5BD6', '#D9487A', '#138F8F', '#A8742A', '#64748B', '#C7B45A'][i % 9] })), { fmt: v => keur(v), center: [keur(E.charges), 'total'], size: 150, thick: 22 }), { cls: 'mt' }) : '';
  W.stocks = () => { const cats = Object.keys(STOCK_CATS).map((k, i) => ({ label: STOCK_CATS[k], value: r2(sum(S.stock.filter(s => s.cat === k), s => stockValue(s) || 0)), color: ['#D4A23A', '#6FA858', '#2F7FD1', '#D9487A', '#94664A', '#64748B'][i] })).filter(x => x.value > 0); return cats.length ? card('Stocks (valeur)', donut(cats, { fmt: v => keur(v), center: [keur(sum(cats, c => c.value)), 'valeur'], size: 150, thick: 22 }) + `<div class="formula">Récoltes valorisées au dernier cours de référence (théorique)</div>`, { cls: 'mt' }) : ''; };
  W.cours = () => { const keys = ['ble_tendre', 'orge', 'colza', 'mais']; const cols = ['#D4A23A', '#9DB35E', '#7A5BD6', '#E07A35']; const series = keys.map((k, i) => { const pts = S.cours[k]?.points.slice(-65) || []; const b = pts[0]?.prix || 1; return { name: S.cours[k]?.nom || k, color: cols[i], points: pts.map(p => ({ x: p.date, y: p.prix / b * 100 })) }; }).filter(s => s.points.length > 1); return series.length ? card('Cours de référence · 90 j', lineChart({ series, fmt: v => nf(v, 0), height: 200 }) + `<div class="formula">Base 100 · ${esc(S.cours.ble_tendre?.source || 'aucune source')}</div>`, { cls: 'mt', right: `<button class="btn sm g" data-a="goCours">${ic('chevR')}</button>` }) : ''; };
  W.assistant = () => card(`${ic('sparkles')} Assistant (aperçu)`, `<form data-f="assist" class="row"><input class="inp" name="q" placeholder="Posez une question sur vos données" value="${esc(UI.assist?.q || '')}"><button class="btn p icon">${ic('chevR')}</button></form>
    <div class="fchips mt">${['Marge sur mon blé', "Tonnes d'orge restantes", 'Coût de mécanisation', 'Prochains entretiens', 'Coût de production le plus élevé', 'Dépenses en engrais'].map(q => `<span class="fchip" data-a="assistQ" data-q="${esc(q)}">${q}</span>`).join('')}</div>
    ${UI.assist ? `<div class="assist-out mt">${esc(UI.assist.a.text)}</div>${UI.assist.a.link ? `<button class="btn sm g mt" data-a="go" data-r="${UI.assist.a.link}">Voir le détail ${ic('chevR')}</button>` : ''}` : ''}
    <div class="formula">Réponses calculées uniquement à partir de vos données. L'assistant IA conversationnel est prévu à l'étape 7.</div>`, { cls: 'mt' });
  const order = PREFS.widgets.filter(w => w.on && W[w.id]).map(w => w.id);
  const leftIds = ['premiers', 'categories', 'priorites', 'cultures', 'actions'];
  const left = order.filter(id => leftIds.includes(id)), right = order.filter(id => !leftIds.includes(id));
  const date = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  const h = new Date().getHours(); const prenom = (S.exploitation.exploitant || '').split(' ')[0];
  return `<div class="hero"><div class="hello">${h < 12 ? 'Bonjour' : h < 18 ? 'Bon après-midi' : 'Bonsoir'}${prenom ? ' ' + esc(prenom) : ''} · ${date}</div><h2>${esc(S.exploitation.nom)}</h2>
    <span class="camp">${ic('calendar')} Campagne ${campLabel(CURRENT_CAMP)}</span>${S.demo ? ' <span class="camp">Démo</span>' : ''}
    <div class="stats"><div data-a="go" data-r="parcellaire"><b>${nf(surfaceTotale(), 0)} ha</b><span>${S.parcelles.length} parcelle${S.parcelles.length > 1 ? 's' : ''}</span></div><div data-a="goTasks" data-c=""><b>${urgent}</b><span>en retard</span></div><div data-a="goTasks" data-c=""><b>${soon}</b><span>cette semaine</span></div></div>
    ${next ? `<div class="hero-next" data-a="openIv" data-id="${next.id}"><span class="ti">${ic(IV_ICON[next.type] || 'sprout')}</span><span class="tx"><small>Prochain travail · ${dueInfo(next.date).echeance.toLowerCase()}</small><b>${esc(next.label)} — ${esc(parcName(next.parcelleId))}</b></span>${ic('chevR')}</div>` : ''}</div>
  <div class="grid g-2 home" style="align-items:start;gap:0 24px"><div>${left.map(id => W[id]()).join('')}</div><div>${right.map(id => W[id]()).join('')}</div></div>
  <div class="row mt2" style="justify-content:center"><button class="btn sm g" data-a="customize">${ic('settings')} Personnaliser l’accueil</button></div>`;
};
ACT.hideGS = () => { S.gettingStarted = { hidden: true }; commit(); };
ACT.goCult = d => { UI.f.parcCult = d.c; UI.tabs.parc = 'liste'; go('parcellaire'); };
ACT.goTasks = d => { UI.f.taskCat = d.c || ''; go('taches'); };

/* ---- Actions rapides (bouton +) ---- */
const QUICK_ACTIONS = [
  { k: 'iv', l: 'Intervention', s: 'Traitement, semis, travail du sol…', i: 'sprout', c: 'var(--c-cult)' },
  { k: 'recolte', l: 'Récolte', s: 'Entrée en stock de production', i: 'wheat', c: 'var(--c-cult)' },
  { k: 'vente', l: 'Vente', s: 'Sortie de stock + CA', i: 'euro', c: 'var(--c-vente)' },
  { k: 'achat', l: 'Achat / entrée', s: 'Intrants, carburant', i: 'box', c: 'var(--c-stock)' },
  { k: 'entretien', l: 'Entretien', s: 'Vidange, révision…', i: 'wrench', c: 'var(--c-mat)' },
  { k: 'panne', l: 'Panne', s: 'Réparation, immobilisation', i: 'alert', c: 'var(--c-mat)' },
  { k: 'charge', l: 'Charge', s: 'Fermage, assurance…', i: 'cart', c: 'var(--c-eco)' },
  { k: 'doc', l: 'Document', s: 'Justificatif, contrat…', i: 'file', c: 'var(--c-doc)' },
];
ACT.actionSheet = () => openModal({ title: 'Que voulez-vous saisir ?', body: `<div class="act-grid">${QUICK_ACTIONS.map(q => `<button type="button" class="act-btn" style="--c:${q.c}" data-a="qa" data-k="${q.k}"><span class="ti">${ic(q.i)}</span><span><b>${q.l}</b><span>${q.s}</span></span></button>`).join('')}</div>`, foot: '' });
ACT.qa = d => {
  closeModal();
  const k = d.k;
  setTimeout(() => {
    if (k === 'iv') quickIvForm({});
    else if (k === 'recolte') { quickIvForm({}); QF.type = 'recolte'; QF.label = 'Récolte'; QF.materiels = [S.materiel.find(m => m.cat === 'moissonneuse'), S.materiel.find(m => m.cat === 'tracteur'), S.materiel.find(m => m.cat === 'remorque')].filter(Boolean).map(m => m.id); QF.hHa = 0.4; renderQF(); }
    else if (k === 'vente') ACT.newSale({});
    else if (k === 'achat') ACT.purchase({});
    else if (k === 'entretien' || k === 'panne') pickMat(k === 'panne' ? 'reparation' : 'entretien');
    else if (k === 'charge') ACT.newCharge();
    else if (k === 'doc') ACT.newDoc();
  }, 220);
};
function pickMat(t) { openModal({ title: t === 'reparation' ? 'Panne — quel matériel ?' : 'Entretien — quel matériel ?', body: `<div class="list">${S.materiel.map(m => `<div class="mrow" style="--c:var(--c-mat)" data-a="pickMatGo" data-id="${m.id}" data-t="${t}"><div class="ic">${ic('tractor')}</div><div class="tx"><b>${esc(m.marque)} ${esc(m.modele)}</b><span>${MAT_CATS[m.cat]} · ${nf(isEngine(m) ? m.heures : m.heuresUsage)} h</span></div>${ic('chevR')}</div>`).join('')}</div>`, foot: '' }); }
ACT.pickMatGo = d => { closeModal(); setTimeout(() => ACT.addMaint({ id: d.id, t: d.t }), 220); };

/* =========================== TÂCHES =========================== */
VIEWS.taches = () => {
  const all = todoList(60); const cat = UI.f.taskCat || '';
  const list = all.filter(t => !cat || t.cat === cat);
  const G = [['retard', 'En retard', 'late'], ['jour', "Aujourd'hui", ''], ['semaine', '7 prochains jours', ''], ['plus_tard', 'Plus tard (60 j)', '']];
  return `${demoBar('Tâches calculées à partir des données de démonstration.')}
  <div class="fchips"><button class="fchip ${!cat ? 'on' : ''}" style="--c:var(--text)" data-a="taskCat" data-c="">Toutes <span class="k">${all.length}</span></button>${catCounts(all).map(c => `<button class="fchip ${cat === c.k ? 'on' : ''}" style="--c:${c.color}" data-a="taskCat" data-c="${c.k}"><span class="cat-dot" style="--c:${c.color}"></span>${c.label} <span class="k">${c.n}</span></button>`).join('')}</div>
  ${cat ? `<div class="note mt" style="border-left:4px solid ${TASK_CATS[cat].color}">${ic(TASK_CATS[cat].icon)}<span>${{ cultures: 'Interventions planifiées sur vos parcelles (issues des itinéraires techniques). « Valider » les marque comme réalisées et déduit les intrants.', materiel: 'Entretiens et contrôles à venir, selon les heures compteur ou la date.', stocks: 'Intrants sous le seuil d’alerte. « Commander » ouvre une entrée de stock.', ventes: 'Factures non réglées (échéance indicative à 30 jours).', admin: 'Échéances PAC et réglementaires. Les dates de démonstration sont indicatives.', documents: 'Documents marqués « à compléter ».' }[cat]}</span></div>` : ''}
  ${G.map(([g, l, cls]) => { const ts = list.filter(t => t.groupe === g); return ts.length ? `<div class="group-h ${cls}">${g === 'retard' ? ic('alert') : ''}${l}<span class="n">${ts.length}</span></div>${ts.map(t => taskCard(t)).join('')}` : ''; }).join('') || '<div class="card empty mt">Aucune tâche dans cette catégorie</div>'}
  <div class="formula mt2">Couleur = catégorie · pastille = urgence (rouge : en retard, contour rouge : cette semaine).</div>`;
};
ACT.taskCat = d => { UI.f.taskCat = d.c; render(); };

/* =========================== MENU « PLUS » =========================== */
VIEWS.plus = () => {
  const todo = todoList();
  const n = c => todo.filter(t => t.cat === c && t.urgence !== 'ok').length;
  const cnt = { interventions: n('cultures'), stocks: n('stocks'), materiel: n('materiel'), ventes: n('ventes'), pac: n('admin'), documents: n('documents') };
  const groups = [['Production', ['parcellaire', 'itk', 'interventions', 'stocks']], ['Économie', ['ventes', 'economie', 'materiel']], ['Administration', ['exploitation', 'pac', 'documents', 'parametres']]];
  return `${groups.map(([g, ids]) => `<div class="sec-h"><h3>${g}</h3></div><div class="mod-grid">${ids.map(id => { const r = ROUTES.find(x => x[0] === id); return `<a class="mod" href="#${id}" style="--c:${MOD_COLOR[id]}"><span class="ti">${ic(r[2])}</span>${r[1]}${cnt[id] ? `<span class="cnt">${cnt[id]}</span>` : ''}</a>`; }).join('')}</div>`).join('')}
  <div class="sec-h"><h3>Réglages rapides</h3></div>
  <div class="card"><div class="mrow" style="cursor:default"><div class="ic">${ic('calendar')}</div><div class="tx"><b>Campagne analysée</b><span>Chiffres économiques affichés</span></div><select class="inp" style="width:auto;height:40px" data-ch="camp">${[2025, 2026, 2027].map(c => `<option value="${c}" ${PREFS.camp === c ? 'selected' : ''}>${campLabel(c)}</option>`).join('')}</select></div>
  <div class="mrow" data-a="theme"><div class="ic">${ic(PREFS.theme === 'dark' ? 'sun' : 'moon')}</div><div class="tx"><b>Mode sombre</b><span>Lisibilité de nuit</span></div><button class="switch ${PREFS.theme === 'dark' ? 'on' : ''}" tabindex="-1"></button></div>
  <div class="mrow" data-a="search"><div class="ic">${ic('search')}</div><div class="tx"><b>Recherche globale</b><span>Parcelles, produits, matériel, factures…</span></div>${ic('chevR')}</div></div>
  <div class="formula mt">${S.demo ? 'Données de démonstration · ' : ''}${navigator.onLine ? 'En ligne' : 'Hors ligne'} · enregistrement sur cet appareil</div>`;
};

FORMS.assist = d => { UI.assist = { q: d.q, a: assistantAnswer(d.q || '', PREFS.camp) }; render(); };
ACT.assistQ = d => { const m = { 'Marge sur mon blé': 'Quelle est la marge réalisée sur mon blé ?', "Tonnes d'orge restantes": "Combien me reste-t-il de tonnes d'orge ?", 'Coût de mécanisation': 'Quel est le coût de mécanisation ?', 'Prochains entretiens': "Quelles sont les prochaines opérations d'entretien ?", 'Coût de production le plus élevé': 'Quelle parcelle présente le coût de production le plus élevé ?', 'Dépenses en engrais': "Combien ai-je dépensé en engrais ?" }; const q = m[d.q] || d.q; UI.assist = { q, a: assistantAnswer(q, PREFS.camp) }; render(); };
ACT.customize = () => openModal({ title: 'Personnaliser le tableau de bord', body: widgetCtl(), foot: '<button class="btn p" data-a="closeModal" type="button">Terminé</button>' });
function widgetCtl() { return `<div id="wctl">${PREFS.widgets.map((w, i) => `<div class="widget-ctl"><button type="button" class="switch ${w.on ? 'on' : ''}" data-a="wToggle" data-i="${i}" aria-label="Afficher"></button><span class="sp">${WIDGET_NAMES[w.id]}</span><button type="button" class="btn xs g" data-a="wMove" data-i="${i}" data-d="-1" ${i === 0 ? 'disabled' : ''}>${ic('up')}</button><button type="button" class="btn xs g" data-a="wMove" data-i="${i}" data-d="1" ${i === PREFS.widgets.length - 1 ? 'disabled' : ''}>${ic('down')}</button></div>`).join('')}</div><button type="button" class="btn sm g mt" data-a="wReset">Rétablir l'affichage par défaut</button>`; }
ACT.wToggle = d => { PREFS.widgets[d.i].on = !PREFS.widgets[d.i].on; savePrefs(); document.getElementById('wctl').outerHTML = widgetCtl().replace(/<button type="button" class="btn sm g mt".*$/, ''); render(); };
ACT.wMove = d => { const i = +d.i, j = i + +d.d; const w = PREFS.widgets;[w[i], w[j]] = [w[j], w[i]]; savePrefs(); document.getElementById('wctl').outerHTML = widgetCtl().replace(/<button type="button" class="btn sm g mt".*$/, ''); render(); };
ACT.wReset = () => { PREFS.widgets = DEFAULT_WIDGETS.map(id => ({ id, on: true })); savePrefs(); closeModal(); render(); };
ACT.goCours = () => { UI.tabs.eco = 'cours'; go('economie'); };

/* =========================== EXPLOITATION =========================== */
VIEWS.exploitation = () => {
  const x = S.exploitation;
  const prop = sum(S.parcelles.filter(p => p.statutFoncier === 'propriete'), p => p.surface), ferm = sum(S.parcelles.filter(p => p.statutFoncier === 'fermage'), p => p.surface);
  return `${demoBar()}
  <div class="grid g-21">
    ${card('Fiche exploitation', `<div class="kv">
      ${[['Raison sociale', x.nom], ['Forme juridique', x.forme], ['Exploitant', x.exploitant], ['SIRET', x.siret], ['N° PACAGE', x.pacage], ['Certification', x.certification], ['Adresse', x.adresse], ['Téléphone', x.telephone], ['E-mail', x.email]].map(([k, v]) => `<div><span>${k}</span><b>${esc(v || '—')}</b></div>`).join('')}
    </div>`, { right: `<button class="btn sm" data-a="editFarm">${ic('edit')} Modifier</button>` })}
    ${card('Foncier', donut([{ label: 'Propriété', value: r2(prop), color: '#1C6A47' }, { label: 'Fermage', value: r2(ferm), color: '#C7B45A' }], { fmt: v => `${nf(v, 1)} ha`, size: 140, thick: 20 }))}
  </div>
  <div class="grid g-2 mt">
    ${card('Assolement par campagne', `<div class="tbl-wrap"><table class="t"><thead><tr><th>Culture</th>${[2025, 2026, 2027].map(c => `<th class="n">${campLabel(c)}</th>`).join('')}</tr></thead><tbody>
      ${Object.keys(CULTURES).filter(k => [2025, 2026, 2027].some(c => S.parcelles.some(p => p.cultures[c]?.culture === k))).map(k => `<tr><td>${cultBadge(k)}</td>${[2025, 2026, 2027].map(c => { const v = sum(S.parcelles.filter(p => p.cultures[c]?.culture === k), p => p.surface); return `<td class="n">${v ? nf(v, 1) + ' ha' : '—'}</td>`; }).join('')}</tr>`).join('')}
    </tbody><tfoot><tr><td>Total</td>${[2025, 2026, 2027].map(c => `<td class="n">${nf(sum(S.parcelles.filter(p => p.cultures[c]), p => p.surface), 1)} ha</td>`).join('')}</tr></tfoot></table></div>`)}
    ${card("Main-d'œuvre", `<div class="list">${x.mainOeuvre.map((m, i) => `<div class="li"><div class="ic">${ic('users')}</div><div class="tx"><b>${esc(m.nom)}</b><span>${esc(m.role)}${m.taux ? ` · ${eur(m.taux, 2)}/h chargé` : ''}</span></div><button class="btn xs g" data-a="delMO" data-i="${i}">${ic('trash')}</button></div>`).join('')}</div>`, { right: `<button class="btn sm" data-a="addMO">${ic('plus')} Ajouter</button>` })}
  </div>
  <div class="grid g-3 mt">
    ${[2025, 2026, 2027].map(c => { const E = econ(c); return card(`Campagne ${campLabel(c)}`, `<div class="stat-line"><span>Statut</span><b>${c === CURRENT_CAMP ? '<span class="badge info">En cours</span>' : c === CURRENT_CAMP - 1 ? '<span class="badge warn">Commercialisation</span>' : '<span class="badge">Clôturée</span>'}</b></div><div class="stat-line"><span>Surface</span><b>${nf(E.surface, 1)} ha</b></div><div class="stat-line"><span>Chiffre d'affaires</span><b>${eur(E.ca)}</b></div><div class="stat-line"><span>Charges</span><b>${eur(E.charges)}</b></div><div class="stat-line"><span>Résultat réalisé</span><b>${eur(E.resultatRealise)}</b></div>`); }).join('')}
  </div>`;
};
ACT.editFarm = () => { const x = S.exploitation; openModal({ title: "Modifier l'exploitation", body: `<div class="grid2">${[['nom', 'Raison sociale'], ['forme', 'Forme juridique'], ['exploitant', 'Exploitant'], ['siret', 'SIRET'], ['pacage', 'N° PACAGE'], ['certification', 'Certification'], ['telephone', 'Téléphone'], ['email', 'E-mail']].map(([k, l]) => `<label class="field"><span>${l}</span><input class="inp" name="${k}" value="${esc(x[k])}"></label>`).join('')}</div><label class="field"><span>Adresse</span><input class="inp" name="adresse" value="${esc(x.adresse)}"></label>`, onSubmit: d => { Object.assign(S.exploitation, d); commit('Exploitation mise à jour'); } }); };
ACT.addMO = () => openModal({ title: "Ajouter une personne", body: `<label class="field"><span>Nom</span><input class="inp" name="nom" required></label><div class="grid2"><label class="field"><span>Rôle</span><input class="inp" name="role" value="Salarié agricole"></label><label class="field"><span>Coût horaire chargé (€)</span><input class="inp" name="taux" type="number" step="0.01" min="0"></label></div>`, onSubmit: d => { if (!d.nom) throw new Error('Nom requis'); S.exploitation.mainOeuvre.push({ nom: d.nom, role: d.role, taux: +d.taux || 0 }); commit('Ajouté'); } });
ACT.delMO = d => { S.exploitation.mainOeuvre.splice(+d.i, 1); commit(); };

/* =========================== PARCELLAIRE =========================== */
let PROJ = null;
function project(extra = []) {
  const pts = S.parcelles.flatMap(p => p.coords).concat(extra);
  if (!pts.length) pts.push([48.182, 1.385], [48.19, 1.40]);
  let mnLa = Math.min(...pts.map(p => p[0])), mxLa = Math.max(...pts.map(p => p[0])), mnLn = Math.min(...pts.map(p => p[1])), mxLn = Math.max(...pts.map(p => p[1]));
  const dl = (mxLa - mnLa) * 0.08 + 0.002, dn = (mxLn - mnLn) * 0.08 + 0.002; mnLa -= dl; mxLa += dl; mnLn -= dn; mxLn += dn;
  const cos = Math.cos((mnLa + mxLa) / 2 * Math.PI / 180), W = 1000;
  const sc = W / ((mxLn - mnLn) * cos), H = Math.max(420, (mxLa - mnLa) * sc);
  const offY = (H - (mxLa - mnLa) * sc) / 2;
  PROJ = { W, H, xy: ([la, ln]) => [(ln - mnLn) * cos * sc, offY + (mxLa - la) * sc], ll: (x, y) => [r2(mxLa - (y - offY) / sc, 6), r2(mnLn + x / (cos * sc), 6)], mPerPx: 111320 / sc };
  return PROJ;
}
function areaHa(coords) { if (coords.length < 3) return 0; const la0 = coords[0][0] * Math.PI / 180; const P = coords.map(([la, ln]) => [ln * 111320 * Math.cos(la0), la * 110540]); let a = 0; for (let i = 0; i < P.length; i++) { const [x1, y1] = P[i], [x2, y2] = P[(i + 1) % P.length]; a += x1 * y2 - x2 * y1; } return r2(Math.abs(a) / 2 / 10000, 2); }
function centroid(c) { return [r2(sum(c, p => p[0]) / c.length, 5), r2(sum(c, p => p[1]) / c.length, 5)]; }
function mapSVG() {
  const filt = UI.f.parcCult;
  const pr = project(UI.mapDraw || []);
  const { W, H } = pr;
  let g = '';
  for (let x = 0; x < W; x += 80) g += `<line class="grid-l" x1="${x}" y1="0" x2="${x}" y2="${H}"/>`;
  for (let y = 0; y < H; y += 80) g += `<line class="grid-l" x1="0" y1="${y}" x2="${W}" y2="${y}"/>`;
  g += `<path class="road" d="M0 ${H * .52} C ${W * .3} ${H * .45}, ${W * .55} ${H * .62}, ${W} ${H * .5}"/><path class="road" d="M${W * .42} 0 C ${W * .45} ${H * .4}, ${W * .38} ${H * .7}, ${W * .44} ${H}"/><path class="river" d="M0 ${H * .88} C ${W * .25} ${H * .8}, ${W * .5} ${H * .98}, ${W} ${H * .84}"/>`;
  S.parcelles.forEach(p => {
    const c = curCult(p)?.culture; const col = CULTURES[c]?.color || '#9AA79F';
    const dim = filt && filt !== c;
    const pts = p.coords.map(pt => pr.xy(pt).map(v => v.toFixed(1)).join(',')).join(' ');
    g += `<polygon class="parc ${UI.mapEdit === p.id ? 'sel' : ''} ${p.contourProvisoire ? 'prov' : ''}" points="${pts}" fill="${col}" fill-opacity="${dim ? .18 : .78}" data-a="mapParc" data-id="${p.id}" data-pid="${p.id}"><title>${esc(p.nom)} — ${nf(p.surface, 2)} ha</title></polygon>`;
    const [cx, cy] = pr.xy(centroid(p.coords));
    if (!dim) g += `<text class="lbl" x="${cx}" y="${cy - 2}">${esc(p.nom)}</text><text class="lbl2" x="${cx}" y="${cy + 13}">${nf(p.surface, 1)} ha</text>`;
  });
  if (UI.mapEdit) { const p = byId('parcelles', UI.mapEdit); p && p.coords.forEach((pt, i) => { const [x, y] = pr.xy(pt); g += `<circle class="vx" r="8" cx="${x}" cy="${y}" data-vi="${i}"/>`; }); }
  if (UI.mapDraw && UI.mapDraw.length) { const pts = UI.mapDraw.map(pt => pr.xy(pt).join(',')).join(' '); g += `<polygon class="draw" points="${pts}"/>` + UI.mapDraw.map(pt => { const [x, y] = pr.xy(pt); return `<circle class="vx" r="6" cx="${x}" cy="${y}"/>`; }).join(''); }
  const sb = Math.round(500 / pr.mPerPx);
  g += `<g transform="translate(${W - sb - 24},${H - 24})"><rect x="-6" y="-16" width="${sb + 12}" height="24" rx="6" fill="var(--surface)" opacity=".9"/><line x1="0" y1="0" x2="${sb}" y2="0" stroke="var(--text)" stroke-width="2"/><line x1="0" y1="-4" x2="0" y2="4" stroke="var(--text)" stroke-width="2"/><line x1="${sb}" y1="-4" x2="${sb}" y2="4" stroke="var(--text)" stroke-width="2"/><text x="${sb / 2}" y="-5" text-anchor="middle" style="font-size:11px;font-weight:700;fill:var(--text)">500 m</text></g>`;
  g += `<g transform="translate(${W - 34},34)"><circle r="16" fill="var(--surface)" opacity=".9"/><path d="M0 -11 L5 4 L0 1 L-5 4 Z" fill="var(--text)"/><text y="13" text-anchor="middle" style="font-size:8px;font-weight:700;fill:var(--text)">N</text></g>`;
  return `<svg id="map" class="map" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet">${g}</svg>`;
}
VIEWS.parcellaire = () => {
  const t = tab('parc', 'carte');
  const ass = assolement(CURRENT_CAMP);
  const q = norm(UI.q.parc || '');
  const list = S.parcelles.filter(p => (!UI.f.parcCult || curCult(p)?.culture === UI.f.parcCult) && (!q || norm(p.nom + p.commune).includes(q)));
  const editBar = UI.mapEdit && !hasLeaflet() ? `<div class="note info mb">${ic('edit')}<span>Modification du contour de <b>${esc(parcName(UI.mapEdit))}</b> : faites glisser les sommets. Surface graphique : <b id="areaLive">${nf(areaHa(byId('parcelles', UI.mapEdit).coords), 2)} ha</b> (déclarée : ${nf(byId('parcelles', UI.mapEdit).surface, 2)} ha).</span><span class="sp"></span><button class="btn sm" data-a="applyArea">Appliquer la surface graphique</button><button class="btn sm p" data-a="endEdit">Terminer</button></div>` : '';
  const drawBar = UI.mapDraw && !hasLeaflet() ? `<div class="note info mb">${ic('pin')}<span>Dessin d'une nouvelle parcelle : cliquez sur la carte pour placer les sommets (${UI.mapDraw.length} placés${UI.mapDraw.length >= 3 ? ` · ${nf(areaHa(UI.mapDraw), 2)} ha` : ''}).</span><span class="sp"></span><button class="btn sm" data-a="drawUndo" ${UI.mapDraw.length ? '' : 'disabled'}>Annuler le dernier</button><button class="btn sm" data-a="drawCancel">Abandonner</button><button class="btn sm p" data-a="drawDone" ${UI.mapDraw.length >= 3 ? '' : 'disabled'}>Valider le contour</button></div>` : '';
  return `${demoBar('Parcellaire fictif : contours et coordonnées GPS de démonstration, sur un fond de carte schématique.')}
  <div class="page-h toolbar"><div class="seg">${[['carte', 'Carte'], ['liste', 'Liste']].map(([v, l]) => `<button class="${t === v ? 'on' : ''}" data-a="tab" data-k="parc" data-v="${v}">${l}</button>`).join('')}</div>
  <div class="search-in" style="width:min(260px,100%)">${ic('search')}<input class="inp" placeholder="Rechercher une parcelle" data-in="parcQ" value="${esc(UI.q.parc || '')}"></div><span class="sp"></span>
  ${EDIT ? '' : pa([{ a: 'exportParc', i: 'copy', l: 'Export CSV', more: true }, { a: 'importParc', i: 'upload', l: 'Importer', more: true }, { a: 'drawStart', i: 'pin', l: 'Dessiner' }, { a: 'newParc', i: 'plus', l: 'Parcelle', primary: true }])}</div>
  <div class="chips mb"><span class="chip ${!UI.f.parcCult ? 'on' : ''}" data-a="parcCult" data-c="">Toutes · ${nf(surfaceTotale(), 1)} ha</span>${ass.map(a => `<span class="chip ${UI.f.parcCult === a.key ? 'on' : ''}" data-a="parcCult" data-c="${a.key}"><i class="sw" style="background:${a.color}"></i>${esc(a.label)} · ${nf(a.value, 1)} ha</span>`).join('')}</div>
  ${editBar}${drawBar}
  ${t === 'carte' ? `${EDIT ? '<div id="editPanel" class="edit-panel"></div>' : ''}<div class="grid g-21"><div class="card map-card">${hasLeaflet() ? mapLeafletHTML() : mapSVG() + '<div class="map-legend"><span>Carte schématique (hors connexion) — la carte satellite s’affiche avec du réseau</span></div>'}</div>
    <div class="card"><div class="card-h"><h3>Parcelles</h3><span class="sub">${list.length}</span></div><div class="card-b" style="max-height:560px;overflow:auto"><div class="list">${list.map(p => parcLi(p)).join('')}</div></div></div></div>`
      : `<div class="card"><div class="tbl-wrap"><table class="t"><thead><tr><th>Parcelle</th><th>Commune</th><th class="n">Surface</th><th>Sol</th><th>Culture ${campLabel(CURRENT_CAMP)}</th><th>Variété</th><th>Semis</th><th class="n">Rdt prév.</th><th>Statut</th></tr></thead><tbody>
      ${list.map(p => { const c = curCult(p); return `<tr data-a="openParc" data-id="${p.id}"><td><div class="cell-main">${esc(p.nom)}</div><div class="cell-sub">${esc(p.cadastre || '')} · îlot ${p.ilot}</div></td><td>${esc(p.commune)}</td><td class="n">${nf(p.surface, 2)} ha</td><td>${esc(p.sol)}</td><td>${cultBadge(c?.culture)}</td><td>${esc(c?.variete || '—')}</td><td>${dfr(c?.semis)}</td><td class="n">${c?.rdtPrev ? nfx(c.rdtPrev, 1) + ' t/ha' : '—'}</td><td>${statutParc(p)}</td></tr>`; }).join('')}
      </tbody><tfoot><tr><td>Total</td><td></td><td class="n">${nf(sum(list, p => p.surface), 2)} ha</td><td colspan="6"></td></tr></tfoot></table></div></div>`}`;
};
const statutParc = p => { const c = curCult(p); if (!c) return '<span class="badge">Non assolée</span>'; if (c.rdtReel) return '<span class="badge">Récoltée</span>'; if (c.semis > TODAY) return '<span class="badge warn">À semer</span>'; return '<span class="badge ok">En culture</span>'; };
const parcLi = p => { const c = curCult(p); if (p.contourProvisoire) return `<div class="li"><div class="ic warn">${ic('pin')}</div><div class="tx" data-a="openParc" data-id="${p.id}"><b>${esc(p.nom)}</b><span>${nf(p.surface, 2)} ha · contour à dessiner</span></div><button class="btn sm" data-a="editContour" data-id="${p.id}">${ic('pin')} Dessiner</button></div>`; return `<div class="li" data-a="openParc" data-id="${p.id}"><div class="ic" style="background:color-mix(in srgb,${CULTURES[c?.culture]?.color || '#999'} 22%,transparent);color:${CULTURES[c?.culture]?.color}">${ic('wheat')}</div><div class="tx"><b>${esc(p.nom)}</b><span>${nf(p.surface, 2)} ha · ${esc(CULTURES[c?.culture]?.nom || 'Non assolée')}</span></div>${statutParc(p)}</div>`; };
IN.parcQ = el => { UI.q.parc = el.value; const pos = el.selectionStart; render(); const i = document.querySelector('[data-in=parcQ]'); i.focus(); i.setSelectionRange(pos, pos); };
ACT.parcCult = d => { UI.f.parcCult = d.c || null; render(); };
ACT.openParc = d => openDrawer('parcelle', d.id);
ACT.mapParc = d => { if (UI.mapEdit || UI.mapDraw || EDIT) return; openDrawer('parcelle', d.id); };
ACT.editContour = d => { if (hasLeaflet()) { startContour(d.id); return; } closeDrawer(); UI.tabs.parc = 'carte'; UI.mapEdit = d.id; if (UI.route !== 'parcellaire') go('parcellaire'); else render(); };
ACT.endEdit = () => { const p = byId('parcelles', UI.mapEdit); if (p) p.contourProvisoire = false; UI.mapEdit = null; commit('Contour enregistré'); };
ACT.applyArea = () => { const p = byId('parcelles', UI.mapEdit); p.surface = areaHa(p.coords); p.centre = centroid(p.coords); S.interventions.filter(i => i.parcelleId === p.id && i.statut === 'planifiee').forEach(i => { i.surface = p.surface; }); commit(`Surface mise à jour : ${nf(p.surface, 2)} ha (interventions planifiées ajustées)`); };
ACT.drawStart = () => { if (hasLeaflet()) { startContour(null); return; } UI.mapDraw = []; UI.mapEdit = null; UI.tabs.parc = 'carte'; render(); };
ACT.drawUndo = () => { UI.mapDraw.pop(); render(); };
ACT.drawCancel = () => { UI.mapDraw = null; render(); };
ACT.drawDone = () => { const c = UI.mapDraw; UI.mapDraw = null; render(); parcForm(null, { coords: c, surface: areaHa(c) }); };
AFTER.push(() => {
  const svg = document.getElementById('map'); if (!svg) return;
  const pt = e => { const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; return p.matrixTransform(svg.getScreenCTM().inverse()); };
  if (UI.mapDraw) svg.addEventListener('click', e => { const p = pt(e); UI.mapDraw.push(PROJ.ll(p.x, p.y)); render(); });
  if (UI.mapEdit) {
    const parc = byId('parcelles', UI.mapEdit); let drag = null;
    svg.querySelectorAll('.vx').forEach(c => c.addEventListener('pointerdown', e => { drag = +c.dataset.vi; c.setPointerCapture(e.pointerId); e.preventDefault(); }));
    svg.addEventListener('pointermove', e => {
      if (drag == null) return; const p = pt(e);
      parc.coords[drag] = PROJ.ll(p.x, p.y);
      svg.querySelector(`[data-vi="${drag}"]`).setAttribute('cx', p.x); svg.querySelector(`[data-vi="${drag}"]`).setAttribute('cy', p.y);
      svg.querySelector(`polygon[data-pid="${parc.id}"]`).setAttribute('points', parc.coords.map(c => PROJ.xy(c).join(',')).join(' '));
      const a = document.getElementById('areaLive'); if (a) a.textContent = `${nf(areaHa(parc.coords), 2)} ha`;
    });
    svg.addEventListener('pointerup', () => { if (drag != null) { drag = null; saveState(); } });
  }
});
ACT.newParc = () => parcForm(null);
ACT.editParc = d => parcForm(d.id);
function parcForm(id, pre = {}) {
  const p = id ? byId('parcelles', id) : null;
  const c = p ? curCult(p) || {} : {};
  openModal({
    title: p ? `Modifier ${esc(p.nom)}` : 'Nouvelle parcelle', wide: true, body: `
    <div class="grid2"><label class="field"><span>Nom de la parcelle *</span><input class="inp" name="nom" required value="${esc(p?.nom || '')}"></label>
    <label class="field"><span>Surface (ha) *</span><input class="inp" name="surface" type="number" step="0.01" min="0.01" required value="${p?.surface ?? pre.surface ?? ''}">${pre.surface ? '<small>Surface graphique calculée depuis le contour dessiné</small>' : ''}</label></div>
    <div class="grid3"><label class="field"><span>Commune</span><input class="inp" name="commune" value="${esc(p?.commune || '')}"></label><label class="field"><span>Référence cadastrale</span><input class="inp" name="cadastre" placeholder="Facultatif" value="${esc(p?.cadastre || '')}"></label><label class="field"><span>Type de sol</span><input class="inp" name="sol" list="sols" value="${esc(p?.sol || '')}"><datalist id="sols">${['Limon argileux', 'Limon battant', 'Limon profond', 'Argilo-calcaire', 'Sable limoneux', 'Alluvions', 'Craie'].map(s => `<option value="${s}">`).join('')}</datalist></label></div>
    <div class="grid3"><label class="field"><span>Latitude (centre)</span><input class="inp" name="lat" type="number" step="0.00001" value="${p?.centre?.[0] ?? (pre.coords ? centroid(pre.coords)[0] : '')}"></label><label class="field"><span>Longitude (centre)</span><input class="inp" name="lng" type="number" step="0.00001" value="${p?.centre?.[1] ?? (pre.coords ? centroid(pre.coords)[1] : '')}"></label><label class="field"><span>Îlot PAC</span><input class="inp" name="ilot" type="number" min="1" value="${p?.ilot ?? 1}"></label></div>
    <label class="field"><span>Statut foncier</span><select class="inp" name="statutFoncier">${opts([['propriete', 'Propriété'], ['fermage', 'Fermage'], ['autre', 'Autre (mise à disposition…)']], p?.statutFoncier)}</select></label>
    <div class="hr"></div><b>Culture ${campLabel(CURRENT_CAMP)}</b>
    <div class="grid3"><label class="field"><span>Culture</span><select class="inp" name="culture"><option value="">— Non assolée —</option>${opts(Object.entries(CULTURES).map(([k, v]) => [k, v.nom]), c.culture)}</select></label><label class="field"><span>Variété</span><input class="inp" name="variete" value="${esc(c.variete || '')}"></label><label class="field"><span>Date de semis</span><input class="inp" name="semis" type="date" value="${c.semis || ''}"></label></div>
    <div class="grid3"><label class="field"><span>Récolte prévisionnelle</span><input class="inp" name="recoltePrev" type="date" value="${c.recoltePrev || ''}"></label><label class="field"><span>Rendement prévisionnel (t/ha)</span><input class="inp" name="rdtPrev" type="number" step="0.1" value="${c.rdtPrev ?? ''}"></label><label class="field"><span>Rendement réel (t/ha)</span><input class="inp" name="rdtReel" type="number" step="0.01" value="${c.rdtReel ?? ''}" ${c.rdtReel ? 'readonly' : ''}><small>${c.rdtReel ? 'Calculé depuis la récolte enregistrée' : 'Renseigné automatiquement à la récolte'}</small></label></div>
    ${!p ? `<label class="row small"><input type="checkbox" name="genItk" checked> Créer les interventions planifiées à partir de l'itinéraire technique type de la culture</label>` : ''}`,
    onSubmit: d => {
      const surface = +d.surface; if (!d.nom || !(surface > 0)) throw new Error('Nom et surface obligatoires');
      const lat = +d.lat || 48.182, lng = +d.lng || 1.385;
      let pp = p;
      if (!pp) {
        let coords = pre.coords;
        if (!coords) { const s = Math.sqrt(surface * 10000) / 2; const dla = s / 110540, dln = s / (111320 * Math.cos(lat * Math.PI / 180)); coords = [[lat - dla, lng - dln], [lat - dla, lng + dln], [lat + dla, lng + dln], [lat + dla, lng - dln]].map(x => x.map(v => r2(v, 6))); }
        pp = { id: uid('p'), coords, cultures: {}, notes: '', contourProvisoire: !pre.coords }; S.parcelles.push(pp);
      }
      Object.assign(pp, { nom: d.nom, surface, commune: d.commune, cadastre: d.cadastre, sol: d.sol, ilot: +d.ilot || 1, statutFoncier: d.statutFoncier, centre: [lat, lng] });
      const ilotN = S.parcelles.filter(x => x.ilot === pp.ilot); if (!pp.numPac) pp.numPac = `${pp.ilot}.${ilotN.length}`;
      if (d.culture) {
        const old = pp.cultures[CURRENT_CAMP];
        pp.cultures[CURRENT_CAMP] = { ...(old || {}), culture: d.culture, variete: d.variete, semis: d.semis || old?.semis || TODAY, recoltePrev: d.recoltePrev || null, rdtPrev: d.rdtPrev ? +d.rdtPrev : null, rdtReel: old?.rdtReel ?? (d.rdtReel ? +d.rdtReel : null) };
        if (d.genItk) generateFromItk(pp, CURRENT_CAMP);
      } else delete pp.cultures[CURRENT_CAMP];
      S.interventions.filter(i => i.parcelleId === pp.id && i.statut === 'planifiee').forEach(i => i.surface = pp.surface);
      commit(p ? 'Parcelle mise à jour' : 'Parcelle créée');
    }
  });
}
/** Génère les interventions planifiées d'une parcelle depuis l'ITK type (non réalisées). */
function generateFromItk(p, camp) {
  const rec = p.cultures[camp]; const itk = S.itk[rec.culture]; if (!itk) return 0;
  let n = 0;
  itk.steps.forEach(sp => {
    const date = addDays(rec.semis, sp.off);
    if (S.interventions.some(i => i.parcelleId === p.id && i.campagne === camp && i.label === sp.label)) return;
    S.interventions.push({ id: uid('iv'), campagne: camp, parcelleId: p.id, date, type: sp.type, label: sp.label, statut: 'planifiee', surface: p.surface, produits: sp.produits.filter(x => byId('stock', x.itemId)).map(x => ({ ...x })), materiels: sp.materiels.filter(m => byId('materiel', m)), heures: r2(sp.hHa * p.surface, 1), mo: '', meteo: '', obs: '', photos: [], fromItk: true });
    n++;
  });
  if (!rec.recoltePrev) { const r = itk.steps.find(s => s.type === 'recolte'); if (r) rec.recoltePrev = addDays(rec.semis, r.off); }
  S.interventions.sort((a, b) => a.date.localeCompare(b.date));
  return n;
}
ACT.delParc = d => openModal({ title: 'Supprimer la parcelle ?', body: `<p>La parcelle <b>${esc(parcName(d.id))}</b> et ses interventions <b>planifiées</b> seront supprimées. Les interventions réalisées sont conservées dans l'historique des stocks.</p>`, submit: 'Supprimer', onSubmit: () => { S.parcelles = S.parcelles.filter(p => p.id !== d.id); S.interventions = S.interventions.filter(i => !(i.parcelleId === d.id && i.statut === 'planifiee')); closeDrawer(); commit('Parcelle supprimée'); } });
ACT.exportParc = () => copyText(toCSV([['Nom', 'Commune', 'Cadastre', 'Ilot', 'N° PAC', 'Surface (ha)', 'Sol', 'Statut foncier', 'Latitude', 'Longitude', `Culture ${campLabel(CURRENT_CAMP)}`, 'Code PAC', 'Variété', 'Semis'], ...S.parcelles.map(p => { const c = curCult(p); return [p.nom, p.commune, p.cadastre, p.ilot, p.numPac, String(p.surface).replace('.', ','), p.sol, p.statutFoncier, p.centre?.[0], p.centre?.[1], CULTURES[c?.culture]?.nom || '', CULTURES[c?.culture]?.pac || '', c?.variete || '', c?.semis || '']; })]), 'Parcellaire copié au format CSV (séparateur ;)');
ACT.importParc = () => openModal({
  title: 'Importer des parcelles', body: `<div class="note info">${ic('info')}<span>Formats acceptés : <b>GeoJSON</b> (polygones, ex. export QGIS ou d'un outil cartographique) et <b>CSV</b> (colonnes : nom;surface;commune;sol;latitude;longitude). L'import direct des fichiers Telepac (shapefile / XML) est prévu à l'étape 6 ; en attendant, convertissez-les en GeoJSON avec QGIS.</span></div>
  <label class="field"><span>Fichier</span><input class="inp" type="file" name="file" accept=".geojson,.json,.csv,.txt" style="padding-top:8px"></label><div id="impPrev" class="small muted"></div>`,
  submit: 'Importer', onSubmit: () => { if (!window._imp || !window._imp.length) throw new Error('Aucune parcelle valide détectée'); window._imp.forEach(x => S.parcelles.push(x)); const n = window._imp.length; window._imp = null; commit(`${n} parcelle(s) importée(s)`); },
  onMount: m => m.querySelector('input[type=file]').addEventListener('change', async e => {
    const f = e.target.files[0]; if (!f) return; const txt = await f.text(); const out = [];
    try {
      if (/\.(geo)?json$/i.test(f.name) || txt.trim().startsWith('{')) {
        const gj = JSON.parse(txt); const feats = gj.type === 'FeatureCollection' ? gj.features : [gj];
        feats.forEach((ft, i) => { const g = ft.geometry; if (!g) return; const ring = g.type === 'Polygon' ? g.coordinates[0] : g.type === 'MultiPolygon' ? g.coordinates[0][0] : null; if (!ring) return; const coords = ring.slice(0, -1).map(([ln, la]) => [r2(la, 6), r2(ln, 6)]); const pr = ft.properties || {}; const nom = pr.nom || pr.NOM || pr.name || pr.NOM_PARC || pr.libelle || `Parcelle importée ${i + 1}`; const surf = +(pr.surface || pr.SURFACE || pr.SURF_HA || pr.surf_ha || 0) || areaHa(coords); out.push({ id: uid('p'), nom: String(nom), surface: r2(surf, 2), commune: pr.commune || pr.COMMUNE || '', cadastre: pr.cadastre || '', sol: pr.sol || '', coords, centre: centroid(coords), cultures: {}, ilot: +(pr.ilot || pr.NUM_ILOT || 1) || 1, numPac: pr.num_parcel || null, statutFoncier: 'autre', notes: 'Importée' }); });
      } else {
        const lines = txt.split(/\r?\n/).filter(l => l.trim()); const sep = lines[0].includes(';') ? ';' : ','; const head = lines[0].toLowerCase().split(sep).map(norm);
        const idx = k => head.findIndex(h => h.startsWith(k));
        lines.slice(1).forEach(l => { const c = l.split(sep); const nom = c[idx('nom')]; const s = parseFloat(String(c[idx('surface')] || '').replace(',', '.')); if (!nom || !(s > 0)) return; const la = parseFloat(String(c[idx('lat')] || '48.182').replace(',', '.')), ln = parseFloat(String(c[idx('lon')] || c[idx('lng')] || '1.385').replace(',', '.')); const h = Math.sqrt(s * 10000) / 2, dla = h / 110540, dln = h / (111320 * Math.cos(la * Math.PI / 180)); const coords = [[la - dla, ln - dln], [la - dla, ln + dln], [la + dla, ln + dln], [la + dla, ln - dln]].map(x => x.map(v => r2(v, 6))); out.push({ id: uid('p'), nom, surface: s, commune: c[idx('commune')] || '', sol: c[idx('sol')] || '', cadastre: '', coords, centre: [la, ln], cultures: {}, ilot: 1, numPac: null, statutFoncier: 'autre', notes: 'Importée (contour approximatif)' }); });
      }
    } catch (err) { document.getElementById('impPrev').textContent = 'Fichier illisible : ' + err.message; return; }
    window._imp = out;
    document.getElementById('impPrev').innerHTML = out.length ? `<b>${out.length}</b> parcelle(s) détectée(s), ${nf(sum(out, p => p.surface), 2)} ha : ${out.slice(0, 6).map(p => esc(p.nom)).join(', ')}${out.length > 6 ? '…' : ''}` : 'Aucune parcelle détectée.';
  })
});

DRAWERS.parcelle = id => {
  const p = byId('parcelles', id); if (!p) return null;
  const t = UI.drawer.tab || 'fiche', c = curCult(p);
  const camps = Object.keys(p.cultures).map(Number).sort((a, b) => b - a);
  let body = tabsBar('dp', [['fiche', 'Fiche'], ['historique', 'Historique'], ['interventions', 'Interventions'], ['eco', 'Économie']], t, true);
  if (t === 'fiche') {
    body += `<div class="card pad"><div class="kv">${[['Surface', `${nf(p.surface, 2)} ha`], ['Surface graphique', `${nf(areaHa(p.coords), 2)} ha`], ['Commune', p.commune], ['Réf. cadastrale', p.cadastre || '—'], ['Type de sol', p.sol], ['Statut foncier', { propriete: 'Propriété', fermage: 'Fermage', autre: 'Autre' }[p.statutFoncier]], ['Îlot / n° PAC', `${p.ilot} / ${p.numPac || '—'}`], ['GPS (centre)', p.centre ? `${p.centre[0]}, ${p.centre[1]}` : '—']].map(([k, v]) => `<div><span>${k}</span><b>${esc(v)}</b></div>`).join('')}</div></div>
    <div class="card pad mt"><div class="row mb"><b>Culture ${campLabel(CURRENT_CAMP)}</b><span class="sp"></span>${statutParc(p)}</div>${c ? `<div class="kv">${[['Culture', CULTURES[c.culture]?.nom], ['Variété', c.variete || '—'], ['Semis', dfr(c.semis)], ['Récolte prévue', dfr(c.recoltePrev)], ['Rendement prévisionnel', c.rdtPrev ? `${nfx(c.rdtPrev, 1)} t/ha` : '—'], ['Rendement réel', c.rdtReel ? `${nfx(c.rdtReel, 2)} t/ha` : '—'], ['Production prévue', c.rdtPrev ? `${nf(c.rdtPrev * p.surface, 1)} t` : '—']].map(([k, v]) => `<div><span>${k}</span><b>${esc(v)}</b></div>`).join('')}</div>` : '<div class="muted">Aucune culture déclarée pour la campagne en cours.</div>'}</div>
    ${p.contourProvisoire ? `<div class="note warn mt">${ic('map')}<span>Contour provisoire, non placé sur la carte. Touchez « Dessiner le contour » puis placez les sommets sur la vue satellite.</span></div>` : ''}
    <div class="row wrap mt"><button class="btn p" data-a="quickIv" data-pid="${p.id}">${ic('plus')} Intervention</button><button class="btn" data-a="editParc" data-id="${p.id}">${ic('edit')} Modifier</button><button class="btn" data-a="editContour" data-id="${p.id}">${ic('map')} ${p.contourProvisoire ? 'Dessiner le contour' : 'Modifier le contour'}</button>${c ? `<button class="btn" data-a="genItk" data-id="${p.id}">${ic('sprout')} Générer l'ITK</button>` : ''}<span class="sp"></span><button class="btn d g" data-a="delParc" data-id="${p.id}">${ic('trash')}</button></div>`;
  } else if (t === 'historique') {
    body += `<div class="card"><div class="tbl-wrap"><table class="t"><thead><tr><th>Campagne</th><th>Culture</th><th>Variété</th><th class="n">Rdt prév.</th><th class="n">Rdt réel</th><th class="n">Production</th></tr></thead><tbody>${camps.map(cp => { const r = p.cultures[cp]; return `<tr><td class="b">${campLabel(cp)}</td><td>${cultBadge(r.culture)}</td><td>${esc(r.variete || '—')}</td><td class="n">${r.rdtPrev ? nfx(r.rdtPrev, 1) : '—'}</td><td class="n">${r.rdtReel ? nfx(r.rdtReel, 2) : '—'}</td><td class="n">${r.rdtReel && r.culture !== 'prairie' ? nf(r.rdtReel * p.surface, 1) + ' t' : '—'}</td></tr>`; }).join('')}</tbody></table></div></div>
    <div class="formula">Rendements en t/ha. Les campagnes antérieures à 2025 sont un historique saisi (démo), sans détail d'interventions.</div>`;
  } else if (t === 'interventions') {
    const cp = UI.tabs.dpCamp || CURRENT_CAMP;
    const ivs = S.interventions.filter(i => i.parcelleId === p.id && i.campagne === +cp).sort((a, b) => a.date.localeCompare(b.date));
    body += `<div class="seg mb">${[2025, 2026, 2027].filter(x => p.cultures[x]).map(x => `<button class="${+cp === x ? 'on' : ''}" data-a="tab" data-k="dpCamp" data-v="${x}" data-drawer="1">${campLabel(x)}</button>`).join('')}</div>${ivTimeline(ivs)}`;
  } else {
    const rows = econ(PREFS.camp).rows.flatMap(r => r.parcelles.map(x => ({ ...x, culture: r.key, prixMoyen: r.prixMoyen ?? r.prixRef })));
    const r = rows.find(x => x.id === p.id);
    body += r ? `<div class="card pad"><b>Campagne ${campLabel(PREFS.camp)} — ${esc(CULTURES[r.culture]?.nom)}</b><div class="mt">
      ${[['Production récoltée', r.production ? `${nf(r.production, 1)} t` : '—'], ['Intrants consommés', eur(r.intrants)], ['Intrants / ha', eur(r.intrants / p.surface)], ['Mécanisation', eur(r.meca)], ['Mécanisation / ha', eur(r.meca / p.surface)], ['Charges de structure réparties', eur(r.fixAlloc)], ['Coût de production / t', r.coutTonne ? eur(r.coutTonne) : '—'], ['Produit estimé (prix moyen de la culture)', r.production && r.prixMoyen ? eur(r.production * r.prixMoyen) : '—']].map(([k, v]) => `<div class="stat-line"><span>${k}</span><b>${v}</b></div>`).join('')}</div>
      <div class="formula">Coût de production / t = (intrants + mécanisation + charges de structure réparties à l'hectare) ÷ tonnes récoltées</div></div>` : `<div class="empty">Pas de données pour la campagne ${campLabel(PREFS.camp)}</div>`;
  }
  return { title: `${esc(p.nom)} <span class="muted small">· ${nf(p.surface, 2)} ha</span>`, body };
};
ACT.genItk = d => { const p = byId('parcelles', d.id); const n = generateFromItk(p, CURRENT_CAMP); commit(n ? `${n} intervention(s) planifiée(s) créée(s)` : 'Toutes les étapes de l’ITK existent déjà'); };
function ivTimeline(ivs) {
  if (!ivs.length) return '<div class="empty">Aucune intervention</div>';
  return `<div class="timeline">${ivs.map(i => `<div class="tl ${i.statut === 'planifiee' ? 'plan' : ''}" data-a="openIv" data-id="${i.id}" style="cursor:pointer"><div class="d">${dfr(i.date)} · ${INTER_TYPES[i.type]}</div><div class="row"><b>${esc(i.label)}</b><span class="sp"></span>${i.statut === 'realisee' ? `<span class="small num">${eur(i.coutIntrants)}</span>` : '<span class="badge">Planifiée</span>'}</div><div class="small muted">${i.produits.map(x => `${esc(byId('stock', x.itemId)?.nom || '?')} ${nfx(x.dose, 2)} ${byId('stock', x.itemId)?.unite || ''}/ha`).join(' · ') || '—'}${i.recolteQte ? ` · <b>${nf(i.recolteQte, 1)} t récoltées</b>` : ''}</div></div>`).join('')}</div>`;
}

/* =========================== ITINÉRAIRES TECHNIQUES =========================== */
function stepCostHa(sp) {
  const intr = sum(sp.produits, x => { const it = byId('stock', x.itemId); return it ? x.dose * it.pmp : 0; });
  const meca = sum(sp.materiels, mid => { const m = byId('materiel', mid); return m ? sp.hHa * coutHoraire(m, CURRENT_CAMP - 1).horaire : 0; });
  const gnr = S.stock.find(x => x.cat === 'carburants');
  const fuel = sum(sp.materiels, mid => { const m = byId('materiel', mid); return m && m.conso && gnr ? sp.hHa * m.conso * gnr.pmp : 0; });
  return { intr: r2(intr + fuel), meca: r2(meca) };
}
VIEWS.itk = () => {
  const t = tab('itk', 'modeles');
  return `${demoBar('Itinéraires techniques types de démonstration : doses et produits génériques, à adapter à vos pratiques et aux autorisations en vigueur.')}
  ${tabsBar('itk', [['modeles', 'Modèles par culture'], ['suivi', 'Suivi par parcelle']], t)}
  ${t === 'modeles' ? itkModeles() : itkSuivi()}`;
};
function itkModeles() {
  const keys = Object.keys(S.itk); const k = UI.f.itkC && S.itk[UI.f.itkC] ? UI.f.itkC : keys[0];
  const itk = S.itk[k]; const steps = [...itk.steps].sort((a, b) => a.off - b.off);
  const costs = steps.map(stepCostHa); const ti = sum(costs, c => c.intr), tm = sum(costs, c => c.meca);
  const surf = sum(S.parcelles.filter(p => p.cultures[CURRENT_CAMP]?.culture === k), p => p.surface);
  return `<div class="chips mb">${keys.map(c => `<span class="chip ${c === k ? 'on' : ''}" data-a="itkC" data-c="${c}"><i class="sw" style="background:${CULTURES[c]?.color}"></i>${esc(CULTURES[c]?.nom || c)}</span>`).join('')}</div>
  <div class="grid g-kpi mb">${kpi('layers', 'Étapes', steps.length, `Semis type : ${itk.semisType.split('-').reverse().join('/')}`)}${kpi('box', 'Intrants + carburant / ha', eur(ti), 'aux prix moyens actuels')}${kpi('tractor', 'Mécanisation / ha', eur(tm), 'coût horaire du matériel')}${kpi('map', `Surface ${campLabel(CURRENT_CAMP)}`, `${nf(surf, 1)} ha`, `Coût total estimé <b>${keur((ti + tm) * surf)}</b>`)}</div>
  <div class="card"><div class="card-h"><h3>ITK type — ${esc(CULTURES[k]?.nom)}</h3><span class="sp"></span><button class="btn sm" data-a="itkStep" data-c="${k}">${ic('plus')} Étape</button></div>
  <div class="tbl-wrap"><table class="t"><thead><tr><th>J / semis</th><th>Étape</th><th>Type</th><th>Produits (dose/ha)</th><th>Matériel</th><th class="n">h/ha</th><th class="n">Intrants €/ha</th><th class="n">Méca €/ha</th><th></th></tr></thead><tbody>
  ${steps.map((s, i) => `<tr><td class="num">${s.off > 0 ? '+' : ''}${s.off}</td><td class="cell-main">${esc(s.label)}</td><td>${INTER_TYPES[s.type]}</td><td class="small">${s.produits.map(x => { const it = byId('stock', x.itemId); return it ? `${esc(it.nom)} — ${nfx(x.dose, 2)} ${it.unite}` : '<span class="badge warn">article absent</span>'; }).join('<br>') || '—'}</td><td class="small">${s.materiels.map(matName).join(' + ')}</td><td class="n">${nfx(s.hHa, 2)}</td><td class="n">${eur(costs[i].intr)}</td><td class="n">${eur(costs[i].meca)}</td><td class="n"><button class="btn xs g" data-a="itkStep" data-c="${k}" data-s="${s.id}">${ic('edit')}</button><button class="btn xs g" data-a="itkDel" data-c="${k}" data-s="${s.id}">${ic('trash')}</button></td></tr>`).join('') || `<tr><td colspan="9" class="empty">Aucune étape pour cette culture : ajoutez vos interventions types avec « + Étape » (travail du sol, semis, fertilisation…).</td></tr>`}
  </tbody><tfoot><tr><td colspan="6">Total par hectare</td><td class="n">${eur(ti)}</td><td class="n">${eur(tm)}</td><td></td></tr></tfoot></table></div></div>
  <div class="formula">Intrants €/ha = Σ dose × prix moyen pondéré du stock + carburant (h/ha × consommation L/h × prix du GNR). Méca €/ha = h/ha × coût horaire du matériel (hors carburant).</div>`;
}
ACT.itkC = d => { UI.f.itkC = d.c; render(); };
ACT.itkDel = d => { const it = S.itk[d.c]; it.steps = it.steps.filter(s => s.id !== d.s); commit('Étape supprimée'); };
ACT.itkStep = d => {
  const itk = S.itk[d.c]; const s = d.s ? itk.steps.find(x => x.id === d.s) : { type: 'protection', label: '', off: 0, produits: [], materiels: [], hHa: 0.1 };
  const intr = S.stock.filter(x => x.cat !== 'production' && x.cat !== 'carburants');
  openModal({
    title: d.s ? 'Modifier l’étape' : 'Nouvelle étape', wide: true, body: `
    <div class="grid3"><label class="field"><span>Libellé</span><input class="inp" name="label" required value="${esc(s.label)}"></label><label class="field"><span>Type</span><select class="inp" name="type">${opts(Object.entries(INTER_TYPES), s.type)}</select></label><label class="field"><span>Jours par rapport au semis</span><input class="inp" type="number" name="off" value="${s.off}"></label></div>
    <div class="grid2">${[0, 1].map(i => `<div class="grid2"><label class="field"><span>Produit ${i + 1}</span><select class="inp" name="p${i}"><option value="">—</option>${opts(intr.map(x => [x.id, `${x.nom} (${x.unite})`]), s.produits[i]?.itemId)}</select></label><label class="field"><span>Dose / ha</span><input class="inp" type="number" step="0.01" name="d${i}" value="${s.produits[i]?.dose ?? ''}"></label></div>`).join('')}</div>
    <div class="field"><span>Matériel</span><div class="chips">${S.materiel.map(m => `<label class="chip"><input type="checkbox" name="mat" value="${m.id}" ${s.materiels.includes(m.id) ? 'checked' : ''} style="margin:0"> ${esc(m.marque)} ${esc(m.modele)}</label>`).join('')}</div></div>
    <label class="field" style="max-width:200px"><span>Temps de travail (h/ha)</span><input class="inp" type="number" step="0.01" name="hHa" value="${s.hHa}"></label>`,
    onSubmit: f => {
      const n = { label: f.label, type: f.type, off: +f.off || 0, produits: [0, 1].filter(i => f['p' + i] && +f['d' + i] > 0).map(i => ({ itemId: f['p' + i], dose: +f['d' + i] })), materiels: [].concat(f.mat || []), hHa: +f.hHa || 0 };
      if (!n.label) throw new Error('Libellé requis');
      if (d.s) Object.assign(s, n); else itk.steps.push({ id: uid('stp'), ...n });
      commit('Itinéraire mis à jour');
    }
  });
};
function itkSuivi() {
  const pid = UI.f.itkP && byId('parcelles', UI.f.itkP) ? UI.f.itkP : S.parcelles[0]?.id; if (!pid) return '<div class="empty">Aucune parcelle</div>';
  const p = byId('parcelles', pid); const camp = +(UI.f.itkCamp || CURRENT_CAMP); const rec = p.cultures[camp];
  const ivs = S.interventions.filter(i => i.parcelleId === pid && i.campagne === camp).sort((a, b) => a.date.localeCompare(b.date));
  const real = ivs.filter(i => i.statut === 'realisee');
  const ci = sum(real, i => i.coutIntrants), cm = sum(real, i => mecaCost(i));
  return `<div class="row wrap mb toolbar"><select class="inp" style="width:auto" data-ch="itkP">${opts(S.parcelles.map(x => [x.id, `${x.nom} (${nf(x.surface, 1)} ha)`]), pid)}</select><div class="seg">${[2025, 2026, 2027].map(c => `<button class="${camp === c ? 'on' : ''}" data-a="itkCamp" data-c="${c}">${campLabel(c)}</button>`).join('')}</div><span class="sp"></span>
  ${pa([...(rec ? [{ a: 'dupItk', i: 'copy', l: `Dupliquer → ${campLabel(camp + 1)}`, d: { p: pid, c: camp } }] : []), { a: 'quickIv', i: 'plus', l: 'Intervention', primary: true, d: { pid } }])}</div>
  ${rec ? `<div class="grid g-kpi mb">${kpi('sprout', 'Culture', CULTURES[rec.culture]?.nom, `${esc(rec.variete || '')} · semis ${dshort(rec.semis)}`)}${kpi('tasks', 'Avancement', `${real.length} / ${ivs.length}`, 'interventions réalisées')}${kpi('box', 'Intrants / ha', eur(ci / p.surface), `total ${eur(ci)}`)}${kpi('tractor', 'Mécanisation / ha', eur(cm / p.surface), `total ${eur(cm)}`)}</div>
  <div class="card pad">${ivTimeline(ivs)}</div>` : `<div class="empty">Pas de culture sur cette parcelle pour ${campLabel(camp)}</div>`}`;
}
CH.itkP = el => { UI.f.itkP = el.value; render(); };
ACT.itkCamp = d => { UI.f.itkCamp = d.c; render(); };
ACT.dupItk = d => {
  const src = byId('parcelles', d.p), camp = +d.c, next = camp + 1;
  const ivs = S.interventions.filter(i => i.parcelleId === src.id && i.campagne === camp);
  const culture = src.cultures[camp].culture;
  const sameNext = S.parcelles.filter(p => p.cultures[next]?.culture === culture).map(p => p.id);
  openModal({
    title: `Dupliquer l'ITK ${campLabel(camp)} → ${campLabel(next)}`, body: `<p class="small">Les ${ivs.length} interventions de <b>${esc(src.nom)}</b> (${esc(CULTURES[culture]?.nom)}) seront recréées comme <b>planifiées</b>, décalées d'un an, avec les doses par hectare d'origine et la surface de chaque parcelle cible.</p>
    <div class="field"><span>Parcelles cibles</span><div class="chips">${S.parcelles.map(p => `<label class="chip"><input type="checkbox" name="t" value="${p.id}" ${(sameNext.length ? sameNext.includes(p.id) : p.id === src.id) ? 'checked' : ''} style="margin:0"> ${esc(p.nom)} ${p.cultures[next] ? `<span class="muted">(${esc(CULTURES[p.cultures[next].culture]?.nom)})</span>` : ''}</label>`).join('')}</div></div>`,
    submit: 'Dupliquer', onSubmit: f => {
      const targets = [].concat(f.t || []); if (!targets.length) throw new Error('Choisissez au moins une parcelle');
      let n = 0;
      targets.forEach(tid => {
        const tp = byId('parcelles', tid);
        if (!tp.cultures[next]) tp.cultures[next] = { culture, variete: src.cultures[camp].variete, semis: addYears(src.cultures[camp].semis, 1), recoltePrev: src.cultures[camp].recoltePrev ? addYears(src.cultures[camp].recoltePrev, 1) : null, rdtPrev: src.cultures[camp].rdtPrev, rdtReel: null };
        ivs.forEach(i => { if (S.interventions.some(x => x.parcelleId === tid && x.campagne === next && x.label === i.label)) return; S.interventions.push({ id: uid('iv'), campagne: next, parcelleId: tid, date: addYears(i.date, 1), type: i.type, label: i.label, statut: 'planifiee', surface: tp.surface, produits: i.produits.map(x => ({ itemId: x.itemId, dose: x.dose })), materiels: [...i.materiels], heures: r2(i.heures / i.surface * tp.surface, 1), mo: i.mo, meteo: '', obs: '', photos: [], duplicatedFrom: i.id }); n++; });
      });
      S.interventions.sort((a, b) => a.date.localeCompare(b.date));
      commit(n ? `${n} intervention(s) planifiée(s) créée(s) sur ${targets.length} parcelle(s)` : 'Aucune création : ces étapes sont déjà planifiées sur les parcelles choisies');
    }
  });
};


/* ---- Listes mobiles (remplacent les tableaux sur téléphone) ---- */
const mWrap = (rows, empty = 'Aucun élément') => `<div class="only-m">${rows.length ? rows.join('') : `<div class="empty">${empty}</div>`}</div>`;
const mIv = i => `<div class="mrow" style="--c:var(--c-cult)" data-a="openIv" data-id="${i.id}"><div class="ic">${ic(IV_ICON[i.type] || 'sprout')}</div><div class="tx"><b>${esc(i.label)}</b><span>${esc(parcName(i.parcelleId))} · ${dshort(i.date)} · ${nf(i.surface, 1)} ha</span></div><div class="r">${i.statut === 'realisee' ? `<b>${eur(i.coutIntrants)}</b><span>réalisée</span>` : i.date < TODAY ? '<span class="due danger">En retard</span>' : `<span class="due">${dshort(i.date)}</span>`}</div></div>`;
const mStock = i => { const v = stockValue(i); const low = i.cat !== 'production' && i.seuil && i.qte <= i.seuil; return `<div class="mrow" style="--c:var(--c-stock)" data-a="openStock" data-id="${i.id}"><div class="ic">${ic(i.cat === 'production' ? 'wheat' : i.cat === 'carburants' ? 'fuel' : i.cat === 'engrais' ? 'flask' : i.cat === 'phyto' ? 'shield' : i.cat === 'semences' ? 'sprout' : 'box')}</div><div class="tx"><b>${esc(i.nom)}</b><span>${STOCK_CATS[i.cat]} · ${esc(i.emplacement)}</span></div><div class="r"><b style="${low ? 'color:var(--late)' : ''}">${qty(i.qte, i.unite)}</b><span>${v == null ? '—' : eur(v)}${i.cat === 'production' ? ' (théo.)' : ''}</span></div></div>`; };
const mVente = v => { const ST = { paye: ['Payé', ''], attente: ['En attente', 'warn'], partiel: ['Partiel', 'warn'] }[v.statut]; return `<div class="mrow" style="--c:var(--c-vente)" data-a="openSale" data-id="${v.id}"><div class="ic">${ic('euro')}</div><div class="tx"><b>${esc(CULTURES[v.culture]?.nom || v.produit)} · ${nfx(v.qte, 1)} t</b><span>${esc(v.acheteur)} · ${dshort(v.date)} · ${esc(v.facture)}</span></div><div class="r"><b>${eur(v.montant)}</b><span class="due ${ST[1]}">${ST[0]}</span></div></div>`; };
const mCharge = c => `<div class="mrow" style="--c:var(--c-eco)"><div class="ic">${ic(c.cat === 'intrants' ? 'box' : c.cat === 'carburant' ? 'fuel' : c.cat === 'entretien' || c.cat === 'reparations' ? 'wrench' : 'euro')}</div><div class="tx"><b>${esc(c.libelle)}</b><span>${CHARGE_CATS[c.cat]} · ${dshort(c.date)} ${D(c.date).getFullYear()}</span></div><div class="r"><b>${eur(c.montant)}</b></div></div>`;
const mMove = m => { const it = byId('stock', m.itemId); const sign = ['sortie', 'perte'].includes(m.type) ? -1 : 1; const q = m.qte * sign; return `<div class="mrow" style="--c:${m.type === 'entree' ? 'var(--c-cult)' : m.type === 'perte' ? 'var(--late)' : 'var(--c-stock)'}"><div class="ic">${ic(m.type === 'entree' ? 'plus' : m.type === 'transfert' ? 'move' : 'minus')}</div><div class="tx"><b>${esc(it?.nom || '?')}</b><span>${MOVE_TYPES[m.type]} · ${dshort(m.date)} · ${esc(m.motif)}</span></div><div class="r"><b>${q > 0 ? '+' : ''}${nfx(q, 1)} ${it?.unite || ''}</b><span>${m.valeur ? eur(m.valeur * sign) : ''}</span></div></div>`; };

/* =========================== INTERVENTIONS =========================== */
VIEWS.interventions = () => {
  const camp = +(UI.f.ivCamp || CURRENT_CAMP), st = UI.f.ivSt || 'toutes', ty = UI.f.ivType || '', pid = UI.f.ivP || '';
  let ivs = S.interventions.filter(i => i.campagne === camp && (st === 'toutes' || i.statut === st) && (!ty || i.type === ty) && (!pid || i.parcelleId === pid));
  const q = norm(UI.q.iv || ''); if (q) ivs = ivs.filter(i => norm(i.label + parcName(i.parcelleId)).includes(q));
  ivs = [...ivs].sort((a, b) => a.statut !== b.statut ? (a.statut === 'planifiee' ? -1 : 1) : a.statut === 'planifiee' ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date));
  const real = ivs.filter(i => i.statut === 'realisee');
  return `${demoBar('Historique d’interventions de démonstration, généré à partir des itinéraires techniques types.')}
  <div class="card pad mb"><div class="row wrap"><b>${ic('star')} Favoris</b><span class="muted small">— saisie en un geste</span><span class="sp"></span></div><div class="fchips mt">${S.favoris.map(f => `<span class="fchip" style="--c:var(--c-cult)" data-a="quickIv" data-fav="${f.id}">${ic(IV_ICON[f.type] || 'play')} ${esc(f.label)}</span>`).join('')}<span class="fchip" data-a="quickIv">${ic('plus')} Nouvelle</span></div></div>
  <div class="row wrap mb toolbar"><div class="seg">${[2025, 2026, 2027].map(c => `<button class="${camp === c ? 'on' : ''}" data-a="ivF" data-k="ivCamp" data-v="${c}">${campLabel(c)}</button>`).join('')}</div>
  <div class="seg">${[['toutes', 'Toutes'], ['planifiee', 'Planifiées'], ['realisee', 'Réalisées']].map(([v, l]) => `<button class="${st === v ? 'on' : ''}" data-a="ivF" data-k="ivSt" data-v="${v}">${l}</button>`).join('')}</div>
  <select class="inp" style="width:auto;height:38px" data-ch="ivType"><option value="">Tous les types</option>${opts(Object.entries(INTER_TYPES), ty)}</select>
  <select class="inp" style="width:auto;height:38px" data-ch="ivP"><option value="">Toutes les parcelles</option>${opts(S.parcelles.map(p => [p.id, p.nom]), pid)}</select>
  <div class="search-in" style="width:min(220px,100%)">${ic('search')}<input class="inp" placeholder="Rechercher" data-in="ivQ" value="${esc(UI.q.iv || '')}"></div></div>
  <div class="card"><div class="card-h"><h3>${ivs.length} interventions</h3><span class="sub">${real.length} réalisées · intrants ${eur(sum(real, i => i.coutIntrants))} · ${nf(sum(real, i => i.heures), 1)} h</span><span class="sp"></span><button class="btn sm only-d" data-a="exportIv">${ic('copy')} CSV</button>${pa([{ a: 'exportIv', i: 'copy', l: 'Export CSV', more: true }, { a: 'quickIv', i: 'plus', l: 'Intervention', primary: true }]).replace('class="only-d row"', 'class="hide-all"')}</div>
  <div class="tbl-wrap only-d"><table class="t"><thead><tr><th>Date</th><th>Intervention</th><th>Parcelle</th><th class="hide-m">Produits</th><th class="n">Surface</th><th class="n hide-m">Temps</th><th class="n">Coût intrants</th><th>Statut</th></tr></thead><tbody>
  ${ivs.slice(0, 300).map(i => `<tr data-a="openIv" data-id="${i.id}"><td class="num">${dshort(i.date)}</td><td><div class="cell-main">${esc(i.label)}</div><div class="cell-sub">${INTER_TYPES[i.type]}</div></td><td>${esc(parcName(i.parcelleId))}</td><td class="small hide-m">${i.produits.map(x => esc(byId('stock', x.itemId)?.nom || '?')).join(', ') || '—'}</td><td class="n">${nf(i.surface, 1)} ha</td><td class="n hide-m">${nfx(i.heures, 1)} h</td><td class="n">${i.statut === 'realisee' ? eur(i.coutIntrants) : '—'}</td><td>${i.statut === 'realisee' ? '<span class="badge ok">Réalisée</span>' : i.date < TODAY ? '<span class="badge danger">En retard</span>' : '<span class="badge">Planifiée</span>'}</td></tr>`).join('') || '<tr><td colspan="8" class="empty">Aucune intervention</td></tr>'}
  </tbody></table></div>${mWrap(ivs.slice(0, 150).map(mIv), 'Aucune intervention')}</div>`;
};
ACT.ivF = d => { UI.f[d.k] = d.v; render(); };
CH.ivType = el => { UI.f.ivType = el.value; render(); };
CH.ivP = el => { UI.f.ivP = el.value; render(); };
IN.ivQ = el => { UI.q.iv = el.value; const pos = el.selectionStart; render(); const i = document.querySelector('[data-in=ivQ]'); i.focus(); i.setSelectionRange(pos, pos); };
ACT.openIv = d => openDrawer('intervention', d.id);
ACT.exportIv = () => { const camp = +(UI.f.ivCamp || CURRENT_CAMP); copyText(toCSV([['Date', 'Campagne', 'Parcelle', 'Type', 'Intervention', 'Statut', 'Surface (ha)', 'Produits', 'Matériel', 'Heures', 'Coût intrants (€)', 'Observations'], ...S.interventions.filter(i => i.campagne === camp).map(i => [i.date, campLabel(i.campagne), parcName(i.parcelleId), INTER_TYPES[i.type], i.label, i.statut, i.surface, i.produits.map(x => `${byId('stock', x.itemId)?.nom} ${x.dose}/ha`).join(' | '), i.materiels.map(matName).join(' + '), i.heures, i.coutIntrants || '', i.obs])]), 'Interventions copiées (CSV)'); };

DRAWERS.intervention = id => {
  const i = byId('interventions', id); if (!i) return null;
  const p = byId('parcelles', i.parcelleId);
  const meca = i.statut === 'realisee' ? mecaCost(i) : null;
  const body = `<div class="row wrap mb toolbar">${i.statut === 'realisee' ? '<span class="badge ok">Réalisée</span>' : '<span class="badge">Planifiée</span>'}<span class="badge">${INTER_TYPES[i.type]}</span><span class="badge">${campLabel(i.campagne)}</span></div>
  <div class="card pad"><div class="kv">${[['Date', dfr(i.date)], ['Parcelle', p?.nom], ['Surface', `${nf(i.surface, 2)} ha`], ['Temps de travail', `${nfx(i.heures, 1)} h`], ["Main-d'œuvre", i.mo || '—'], ['Météo', i.meteo || '—']].map(([k, v]) => `<div><span>${k}</span><b>${esc(v)}</b></div>`).join('')}</div>
  <div class="hr"></div><div class="small muted b">MATÉRIEL</div><div class="mt" style="margin-top:6px">${i.materiels.map(m => `<span class="badge" style="margin:0 4px 4px 0">${ic('tractor')} ${esc(matName(m))}</span>`).join('') || '—'}</div></div>
  <div class="card mt"><div class="card-h"><h3>Produits</h3></div><div class="tbl-wrap"><table class="t"><thead><tr><th>Produit</th><th class="n">Dose/ha</th><th class="n">Quantité</th><th class="n">Prix unit.</th><th class="n">Coût</th></tr></thead><tbody>
  ${i.produits.map(x => { const it = byId('stock', x.itemId); const q = x.qte ?? r2(x.dose * i.surface, 3); return `<tr><td>${esc(it?.nom || '?')}</td><td class="n">${nfx(x.dose, 2)} ${it?.unite || ''}</td><td class="n">${nfx(q, 2)} ${it?.unite || ''}</td><td class="n">${eur(x.pu ?? it?.pmp, 2)}</td><td class="n">${i.statut === 'realisee' ? eur(x.cout, 2) : `<span class="muted">${eur(q * (it?.pmp || 0), 2)}</span>`}</td></tr>`; }).join('') || '<tr><td colspan="5" class="muted">Aucun produit</td></tr>'}
  ${i.carburant ? `<tr><td>${ic('fuel')} GNR (calculé)</td><td class="n">—</td><td class="n">${nfx(i.carburant.qte, 1)} L</td><td class="n">${eur(i.carburant.pu, 3)}</td><td class="n">${eur(i.carburant.cout, 2)}</td></tr>` : ''}
  </tbody>${i.statut === 'realisee' ? `<tfoot><tr><td colspan="4">Total intrants + carburant</td><td class="n">${eur(i.coutIntrants, 2)}</td></tr><tr><td colspan="4">Mécanisation (coût horaire matériel)</td><td class="n">${eur(meca, 2)}</td></tr><tr><td colspan="4">Coût total / ha</td><td class="n">${eur((i.coutIntrants + meca) / i.surface, 2)}</td></tr></tfoot>` : ''}</table></div></div>
  ${i.recolteQte ? `<div class="note mt">${ic('wheat')}<span>Récolte : <b>${nf(i.recolteQte, 2)} t</b> (${nfx(i.recolteQte / i.surface, 2)} t/ha) entrées en stock <b>${esc(byId('stock', i.recolteItemId)?.nom || '')}</b>.</span></div>` : ''}
  ${i.obs ? `<div class="card pad mt"><div class="small muted b">OBSERVATIONS</div><p style="margin:6px 0 0">${esc(i.obs)}</p></div>` : ''}
  ${i.photos?.length ? `<div class="photos mt">${i.photos.map(ph => `<img src="${ph}" alt="photo">`).join('')}</div>` : ''}
  <div class="row wrap mt">${i.statut === 'planifiee' ? `<button class="btn p" data-a="validateIv" data-id="${i.id}">${ic('check')} Marquer comme réalisée</button><button class="btn" data-a="editIv" data-id="${i.id}">${ic('edit')} Modifier</button><button class="btn g d" data-a="delIv" data-id="${i.id}">${ic('trash')} Supprimer</button>` : `<button class="btn" data-a="cancelIv" data-id="${i.id}">Annuler la réalisation</button>`}<button class="btn g" data-a="favFromIv" data-id="${i.id}">${ic('star')} Ajouter aux favoris</button></div>`;
  return { title: esc(i.label), body };
};
ACT.validateIv = d => {
  const i = byId('interventions', d.id);
  const p = byId('parcelles', i.parcelleId); const rec = p.cultures[i.campagne];
  const need = i.produits.map(x => { const it = byId('stock', x.itemId); const q = r2(x.dose * i.surface, 3); return it && it.qte < q ? `${esc(it.nom)} : ${nfx(it.qte, 1)} ${it.unite} en stock pour ${nfx(q, 1)} nécessaires` : null; }).filter(Boolean);
  openModal({
    title: `Valider : ${esc(i.label)}`, body: `<div class="grid2"><label class="field"><span>Date de réalisation</span><input class="inp" type="date" name="date" value="${i.date <= TODAY ? i.date : TODAY}"></label><label class="field"><span>Temps de travail (h)</span><input class="inp" type="number" step="0.1" name="heures" value="${i.heures}"></label></div>
    ${i.produits.map((x, k) => `<label class="field"><span>${esc(byId('stock', x.itemId)?.nom)} — dose / ha (${byId('stock', x.itemId)?.unite})</span><input class="inp" type="number" step="0.01" name="dose${k}" value="${x.dose}"></label>`).join('')}
    ${i.type === 'recolte' && rec?.culture !== 'prairie' ? `<div class="grid2"><label class="field"><span>Quantité récoltée (t)</span><input class="inp" type="number" step="0.01" name="recolte" value="${rec?.rdtPrev ? r2(rec.rdtPrev * i.surface, 1) : ''}" required></label><div class="field"><span>Rendement</span><div class="inp" style="display:flex;align-items:center" id="rdtLive">${rec?.rdtPrev ? nfx(rec.rdtPrev, 2) + ' t/ha' : '—'}</div></div></div>` : ''}
    <label class="field"><span>Météo (facultatif)</span><input class="inp" name="meteo" value="${esc(i.meteo)}" placeholder="Ex. : sec, 12 °C, vent faible"></label>
    <label class="field"><span>Observations</span><textarea class="inp" name="obs">${esc(i.obs)}</textarea></label>
    ${need.length ? `<div class="note warn">${ic('alert')}<span>Stock insuffisant — la validation créera un stock négatif à régulariser :<br>${need.join('<br>')}</span></div>` : `<div class="note">${ic('info')}<span>Les intrants et le carburant seront déduits automatiquement des stocks.</span></div>`}`,
    submit: 'Valider', onMount: m => { const r = m.querySelector('[name=recolte]'); if (r) r.addEventListener('input', () => { document.getElementById('rdtLive').textContent = `${nfx(+r.value / i.surface, 2)} t/ha`; }); },
    onSubmit: f => {
      i.date = f.date || TODAY; i.campagne = i.campagne; i.heures = +f.heures || 0; i.meteo = f.meteo; i.obs = f.obs;
      i.produits.forEach((x, k) => { if (f['dose' + k] != null) x.dose = +f['dose' + k]; });
      if (f.recolte != null) { if (!(+f.recolte > 0)) throw new Error('Quantité récoltée requise'); i.recolteQte = +f.recolte; }
      const w = applyIntervention(i);
      commit(w.length ? 'Intervention validée — ' + w.join(' · ') : `Intervention validée · ${eur(i.coutIntrants)} d'intrants déduits du stock`, w.length ? 'warn' : '');
    }
  });
};
ACT.cancelIv = d => openModal({ title: 'Annuler la réalisation ?', body: '<p>Les mouvements de stock associés (intrants, carburant, récolte) seront contre-passés et l’intervention repassera en « planifiée ».</p>', submit: 'Confirmer', onSubmit: () => { const i = byId('interventions', d.id); if (i.type === 'recolte' && i.recolteItemId) { const it = byId('stock', i.recolteItemId); if (it && it.qte < i.recolteQte - 1e-6) throw new Error('Une partie de cette récolte a déjà été vendue : annulez d’abord les ventes concernées.'); } cancelIntervention(i); commit('Réalisation annulée'); } });
ACT.delIv = d => { S.interventions = S.interventions.filter(i => i.id !== d.id); closeDrawer(); commit('Intervention supprimée'); };
ACT.editIv = d => quickIvForm({ edit: d.id });
ACT.favFromIv = d => { const i = byId('interventions', d.id); S.favoris.push({ id: uid('f'), label: i.label + (i.produits[0] ? ` ${nfx(i.produits[0].dose, 2)}/ha` : ''), type: i.type, produits: i.produits.map(x => ({ itemId: x.itemId, dose: x.dose })), materiels: [...i.materiels], hHa: r2(i.heures / i.surface, 3) }); commit('Ajouté aux favoris'); };

/* ---- Saisie rapide d'intervention (objectif < 30 s) ---- */
let QF = null;
ACT.quickIv = d => quickIvForm({ pid: d.pid, fav: d.fav });
function quickIvForm({ pid, fav, edit } = {}) {
  if (edit) { const i = byId('interventions', edit); QF = { edit, parcelles: [i.parcelleId], type: i.type, label: i.label, date: i.date, statut: 'planifiee', produits: i.produits.map(x => ({ ...x })), materiels: [...i.materiels], hHa: i.heures / i.surface, mo: i.mo, meteo: i.meteo, obs: i.obs, photos: i.photos || [], recolte: '' }; }
  else QF = { parcelles: pid ? [pid] : [], type: 'protection', label: '', date: TODAY, statut: 'realisee', produits: [], materiels: [], hHa: 0.1, mo: S.exploitation.mainOeuvre[0]?.nom || '', meteo: '', obs: '', photos: [], recolte: '', saveFav: false, autoLabel: true };
  if (fav) applyFav(fav); else if (pid && !edit) suggestFromItk();
  openModal({ title: edit ? 'Modifier l’intervention' : 'Nouvelle intervention', wide: true, body: '', submit: edit ? 'Enregistrer' : 'Enregistrer l’intervention', onSubmit: submitQF, onMount: () => renderQF() });
}
function applyFav(fid) { const f = S.favoris.find(x => x.id === fid); if (!f) return; Object.assign(QF, { type: f.type, label: f.label, produits: f.produits.map(x => ({ ...x })), materiels: [...f.materiels], hHa: f.hHa, autoLabel: false }); }
function suggestFromItk() {
  const pid = QF.parcelles[0]; if (!pid) return;
  const next = S.interventions.filter(i => i.parcelleId === pid && i.statut === 'planifiee' && i.campagne === CURRENT_CAMP).sort((a, b) => a.date.localeCompare(b.date))[0];
  if (next) { Object.assign(QF, { type: next.type, label: next.label, produits: next.produits.map(x => ({ itemId: x.itemId, dose: x.dose })), materiels: [...next.materiels], hHa: next.heures / next.surface, fromPlan: next.id, autoLabel: false }); }
}
function qfSurface() { return r2(sum(QF.parcelles, id => byId('parcelles', id)?.surface || 0), 2); }
function renderQF() {
  const f = document.getElementById('mf'); if (!f) return;
  const surf = qfSurface();
  const intr = S.stock.filter(x => x.cat !== 'production' && x.cat !== 'carburants');
  const cost = sum(QF.produits, x => { const it = byId('stock', x.itemId); return it ? x.dose * surf * it.pmp : 0; });
  const warn = QF.statut === 'realisee' ? QF.produits.map(x => { const it = byId('stock', x.itemId); const q = x.dose * surf; return it && it.qte < q ? `${esc(it.nom)} : ${nfx(it.qte, 1)} ${it.unite} disponibles pour ${nfx(q, 1)}` : null; }).filter(Boolean) : [];
  const plan = QF.fromPlan ? byId('interventions', QF.fromPlan) : null;
  f.innerHTML = `
  ${S.favoris.length && !QF.edit ? `<div class="field"><span>${ic('star')} Favoris — un geste pour tout préremplir</span><div class="fchips">${S.favoris.map(x => `<span class="fchip" style="--c:var(--c-cult)" data-a="qfFav" data-id="${x.id}">${ic(IV_ICON[x.type] || 'star')} ${esc(x.label)}</span>`).join('')}</div></div>` : ''}
  <div class="field"><span>Parcelle(s) * ${surf ? `<span class="muted">— ${QF.parcelles.length} sélectionnée(s) · ${nf(surf, 2)} ha</span>` : ''}</span><div class="pick-grid">${S.parcelles.map(p => { const c = curCult(p); return `<div class="pick ${QF.parcelles.includes(p.id) ? 'on' : ''}" style="--c:${CULTURES[c?.culture]?.color || '#999'}" data-a="qfP" data-id="${p.id}"><i class="sw"></i><span>${esc(p.nom)}<small>${nf(p.surface, 1)} ha · ${esc(CULTURES[c?.culture]?.nom || '—')}</small></span><span class="ck">${QF.parcelles.includes(p.id) ? ic('check') : ''}</span></div>`; }).join('')}</div></div>
  ${plan ? `<div class="note info">${ic('sprout')}<span>Prérempli depuis l’ITK : <b>${esc(plan.label)}</b> prévue le ${dfr(plan.date)}. ${QF.statut === 'realisee' ? 'Elle sera marquée comme réalisée.' : ''}</span></div>` : ''}
  <div class="field"><span>Type d’intervention</span><div class="type-grid">${Object.entries(INTER_TYPES).map(([k, l]) => `<div class="pick ${QF.type === k ? 'on' : ''}" data-a="qfT" data-k="${k}">${ic(IV_ICON[k])}${l.replace(' / plantation', '').replace(' des cultures', '')}</div>`).join('')}</div></div>
  <div class="grid3"><label class="field"><span>Libellé</span><input class="inp" data-in="qf" data-k="label" value="${esc(QF.label || INTER_TYPES[QF.type])}"></label><label class="field"><span>Date</span><input class="inp" type="date" data-in="qf" data-k="date" value="${QF.date}"></label>
  <div class="field"><span>Statut</span><div class="seg" style="height:42px;align-items:center">${QF.edit ? '<button type="button" class="on">Planifiée</button>' : [['realisee', 'Réalisée'], ['planifiee', 'Planifiée']].map(([v, l]) => `<button type="button" class="${QF.statut === v ? 'on' : ''}" data-a="qfS" data-v="${v}">${l}</button>`).join('')}</div></div></div>
  <div class="field"><span>Produits</span>
  ${QF.produits.map((x, k) => { const it = byId('stock', x.itemId); return `<div class="row" style="gap:8px;margin-bottom:6px"><select class="inp" data-ch="qfProd" data-i="${k}" style="flex:2"><option value="">— Produit —</option>${Object.entries(STOCK_CATS).filter(([c]) => c !== 'production' && c !== 'carburants').map(([c, l]) => `<optgroup label="${l}">${opts(intr.filter(s => s.cat === c).map(s => [s.id, `${s.nom} — ${nfx(s.qte, 1)} ${s.unite}`]), x.itemId)}</optgroup>`).join('')}</select><input class="inp" type="number" step="0.01" min="0" data-in="qfDose" data-i="${k}" value="${x.dose}" style="flex:1;min-width:80px" placeholder="Dose/ha"><span class="small muted" style="width:96px">${it ? `${it.unite}/ha<br><b>${nfx(x.dose * surf, 1)} ${it.unite}</b>` : ''}</span><button type="button" class="btn sm icon g" data-a="qfDel" data-i="${k}">${ic('x')}</button></div>`; }).join('')}
  <button type="button" class="btn sm" data-a="qfAdd" style="align-self:flex-start">${ic('plus')} Ajouter un produit</button></div>
  <div class="field"><span>Matériel utilisé</span><div class="pick-grid">${S.materiel.map(m => `<div class="pick ${QF.materiels.includes(m.id) ? 'on' : ''}" style="--c:var(--c-mat)" data-a="qfM" data-id="${m.id}"><span>${esc(m.marque)} ${esc(m.modele)}<small>${MAT_CATS[m.cat]}</small></span><span class="ck">${QF.materiels.includes(m.id) ? ic('check') : ''}</span></div>`).join('')}</div></div>
  <div class="grid3"><label class="field"><span>Temps de travail (h)</span><input class="inp" type="number" step="0.1" data-in="qfH" value="${r2(QF.hHa * surf, 1)}"><small>${nfx(QF.hHa, 2)} h/ha</small></label>
  <label class="field"><span>Main-d'œuvre</span><select class="inp" data-ch="qfMo">${opts(S.exploitation.mainOeuvre.map(m => [m.nom, m.nom]), QF.mo)}</select></label>
  <label class="field"><span>Météo (facultatif)</span><input class="inp" data-in="qf" data-k="meteo" value="${esc(QF.meteo)}" placeholder="Sec, 12 °C, vent faible"></label></div>
  ${QF.type === 'recolte' && QF.statut === 'realisee' ? `<label class="field"><span>Quantité récoltée totale (t) *</span><input class="inp" type="number" step="0.01" data-in="qf" data-k="recolte" value="${QF.recolte}"><small>${QF.recolte && surf ? `${nfx(QF.recolte / surf, 2)} t/ha — ` : ''}répartie au prorata des surfaces et ajoutée au stock de production</small></label>` : ''}
  <label class="field"><span>Observations</span><textarea class="inp" data-in="qf" data-k="obs" placeholder="Facultatif">${esc(QF.obs)}</textarea></label>
  <div class="field"><span>Photos</span><div class="row wrap"><label class="btn sm">${ic('camera')} Ajouter<input type="file" accept="image/*" multiple hidden data-ch="qfPhoto"></label><div class="photos">${QF.photos.map(p => `<img src="${p}">`).join('')}</div></div></div>
  <div class="note ${warn.length ? 'warn' : ''}">${ic(warn.length ? 'alert' : 'info')}<span>${surf ? `${nf(surf, 2)} ha · coût intrants estimé <b>${eur(cost)}</b> (${eur(surf ? cost / surf : 0)}/ha)` : 'Choisissez au moins une parcelle'}${QF.statut === 'realisee' ? ' · déduction automatique des stocks et du carburant' : ''}${warn.length ? '<br>Stock insuffisant : ' + warn.join(' · ') : ''}</span></div>
  ${!QF.edit ? `<label class="row small"><input type="checkbox" data-ch="qfFavSave" ${QF.saveFav ? 'checked' : ''}> Enregistrer comme favori</label>` : ''}`;
}
ACT.qfP = d => { const a = QF.parcelles; const i = a.indexOf(d.id); i >= 0 ? a.splice(i, 1) : a.push(d.id); if (a.length === 1 && !QF.produits.length && !QF.fromPlan) suggestFromItk(); if (a.length !== 1) QF.fromPlan = null; renderQF(); };
ACT.qfT = d => { QF.type = d.k; if (QF.autoLabel !== false || !QF.label) QF.label = INTER_TYPES[d.k]; QF.fromPlan = null; renderQF(); };
ACT.qfS = d => { QF.statut = d.v; renderQF(); };
ACT.qfM = d => { const a = QF.materiels; const i = a.indexOf(d.id); i >= 0 ? a.splice(i, 1) : a.push(d.id); renderQF(); };
ACT.qfAdd = () => { QF.produits.push({ itemId: '', dose: '' }); renderQF(); };
ACT.qfDel = d => { QF.produits.splice(+d.i, 1); renderQF(); };
ACT.qfFav = d => { applyFav(d.id); QF.fromPlan = null; renderQF(); };
CH.qfProd = el => { QF.produits[+el.dataset.i].itemId = el.value; renderQF(); };
CH.qfMo = el => { QF.mo = el.value; };
CH.qfFavSave = el => { QF.saveFav = el.checked; };
CH.qfPhoto = async el => { for (const f of [...el.files].slice(0, 6)) { QF.photos.push(await downscale(f)); } renderQF(); };
IN.qf = el => { QF[el.dataset.k] = el.value; if (el.dataset.k === 'label') QF.autoLabel = false; };
IN.qfDose = el => { QF.produits[+el.dataset.i].dose = el.value; };
IN.qfH = el => { const s = qfSurface(); QF.hHa = s ? (+el.value || 0) / s : 0; };
function downscale(file, max = 640) { return new Promise(res => { const r = new FileReader(); r.onload = () => { const img = new Image(); img.onload = () => { const k = Math.min(1, max / Math.max(img.width, img.height)); const c = document.createElement('canvas'); c.width = img.width * k; c.height = img.height * k; c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); res(c.toDataURL('image/jpeg', 0.72)); }; img.onerror = () => res(r.result); img.src = r.result; }; r.readAsDataURL(file); }); }
function submitQF() {
  if (!QF.parcelles.length) throw new Error('Choisissez au moins une parcelle');
  const prods = QF.produits.filter(x => x.itemId && +x.dose > 0).map(x => ({ itemId: x.itemId, dose: +x.dose }));
  const surfTot = qfSurface();
  if (QF.type === 'recolte' && QF.statut === 'realisee' && !(+QF.recolte > 0)) throw new Error('Indiquez la quantité récoltée');
  if (QF.edit) { const i = byId('interventions', QF.edit); Object.assign(i, { type: QF.type, label: QF.label || INTER_TYPES[QF.type], date: QF.date, produits: prods, materiels: [...QF.materiels], heures: r2(QF.hHa * i.surface, 1), mo: QF.mo, meteo: QF.meteo, obs: QF.obs, photos: QF.photos }); commit('Intervention modifiée'); return; }
  const warns = []; let total = 0;
  QF.parcelles.forEach(pid => {
    const p = byId('parcelles', pid);
    const camp = Object.keys(p.cultures).map(Number).filter(c => p.cultures[c].semis <= QF.date || c === campOf(QF.date)).sort((a, b) => b - a)[0] || campOf(QF.date);
    let iv = QF.fromPlan && QF.parcelles.length === 1 ? byId('interventions', QF.fromPlan) : null;
    if (iv) Object.assign(iv, { type: QF.type, label: QF.label || INTER_TYPES[QF.type], date: QF.date, produits: prods.map(x => ({ ...x })), materiels: [...QF.materiels], heures: r2(QF.hHa * p.surface, 1), mo: QF.mo, meteo: QF.meteo, obs: QF.obs, photos: QF.photos });
    else { iv = { id: uid('iv'), campagne: camp, parcelleId: pid, date: QF.date, type: QF.type, label: QF.label || INTER_TYPES[QF.type], statut: 'planifiee', surface: p.surface, produits: prods.map(x => ({ ...x })), materiels: [...QF.materiels], heures: r2(QF.hHa * p.surface, 1), mo: QF.mo, meteo: QF.meteo, obs: QF.obs, photos: QF.photos }; S.interventions.push(iv); }
    if (QF.type === 'recolte' && QF.statut === 'realisee') iv.recolteQte = r2(+QF.recolte * p.surface / surfTot, 2);
    if (QF.statut === 'realisee') { warns.push(...applyIntervention(iv)); total += iv.coutIntrants; }
  });
  if (QF.saveFav) S.favoris.push({ id: uid('f'), label: QF.label || INTER_TYPES[QF.type], type: QF.type, produits: prods, materiels: [...QF.materiels], hHa: r2(QF.hHa, 3) });
  S.interventions.sort((a, b) => a.date.localeCompare(b.date));
  commit(warns.length ? `Enregistrée avec alertes : ${warns.join(' · ')}` : QF.statut === 'realisee' ? `Intervention enregistrée · ${eur(total)} d'intrants déduits des stocks` : 'Intervention planifiée', warns.length ? 'warn' : '');
}

/* =========================== STOCKS =========================== */
VIEWS.stocks = () => {
  const t = tab('stk', 'tout'); const st = stockTotals();
  const low = S.stock.filter(i => i.cat !== 'production' && i.seuil > 0 && i.qte <= i.seuil);
  const mv30 = S.mouvements.filter(m => daysBetween(m.date, TODAY) <= 30 && m.date <= TODAY).length;
  const head = `${demoBar('Stocks de démonstration : les quantités résultent du rejeu des achats, interventions, récoltes et ventes fictifs.')}
  <div class="grid g-kpi mb">${kpi('box', 'Valeur des intrants', eur(st.intrants), 'au prix moyen pondéré')}${kpi('wheat', 'Récoltes en stock', eur(st.production), `<span class="badge est">valeur théorique</span> au cours de référence`)}${kpi('alert', 'Sous le seuil d’alerte', low.length, low.slice(0, 2).map(i => esc(i.nom)).join(', ') || 'Aucun', '', low.length ? 'warn' : '')}${kpi('move', 'Mouvements (30 j)', mv30, `${S.mouvements.length} au total`)}</div>
  ${tabsBar('stk', [['tout', 'Tous'], ...Object.entries(STOCK_CATS), ['mouvements', 'Mouvements'], ['inventaire', 'Inventaire']], t)}`;
  if (t === 'mouvements') return head + stockMovesView();
  if (t === 'inventaire') return head + inventaireView();
  const q = norm(UI.q.stk || '');
  const items = S.stock.filter(i => (t === 'tout' || i.cat === t) && (t === 'production' || i.qte > 0.0001 || i.cat !== 'production') && (!q || norm(i.nom + i.emplacement + i.lot).includes(q)));
  return head + `<div class="row wrap mb toolbar"><div class="search-in" style="width:min(280px,100%)">${ic('search')}<input class="inp" placeholder="Rechercher un article, un lot…" data-in="stkQ" value="${esc(UI.q.stk || '')}"></div><span class="sp"></span>${pa([{ a: 'newItem', i: 'plus', l: 'Article', more: true }, { a: 'stockMove', i: 'move', l: 'Mouvement' }, { a: 'purchase', i: 'cart', l: 'Entrée / achat', primary: true }])}</div>
  ${`<div class="card only-m">${mWrap(items.map(mStock), 'Aucun article')}</div>`}<div class="card only-d"><div class="tbl-wrap"><table class="t"><thead><tr><th>Désignation</th><th class="hide-m">Catégorie</th><th class="hide-m">Emplacement</th><th class="n">Quantité</th><th class="n hide-m">Prix moyen</th><th class="n">Valeur</th><th>État</th></tr></thead><tbody>
  ${items.map(i => { const v = stockValue(i); const ratio = i.seuil ? i.qte / (i.seuil * 2) : 1; const lvl = i.qte <= 0 ? 'danger' : i.seuil && i.qte <= i.seuil ? 'warn' : ''; return `<tr data-a="openStock" data-id="${i.id}"><td><div class="cell-main">${esc(i.nom)}</div><div class="cell-sub">${i.lot ? 'Lot ' + esc(i.lot) + ' · ' : ''}${esc(i.fournisseur || '')}</div></td><td class="hide-m">${STOCK_CATS[i.cat]}</td><td class="hide-m">${esc(i.emplacement)}</td><td class="n b">${qty(i.qte, i.unite)}</td><td class="n hide-m">${i.cat === 'production' ? (refPrice(i.culture) != null ? `${eur(refPrice(i.culture))}/t <span class="badge est">cours</span>` : '—') : `${eur(i.pmp, i.pmp < 10 ? 3 : 2)}/${i.unite}`}</td><td class="n">${v == null ? '—' : eur(v)}</td><td style="min-width:110px">${i.cat === 'production' ? '<span class="badge">Récolte</span>' : i.seuil ? `<div class="bar ${lvl}"><i style="width:${Math.min(100, ratio * 100)}%"></i></div><div class="cell-sub">seuil ${nfx(i.seuil, 0)} ${i.unite}</div>` : lvl === 'danger' ? '<span class="badge danger">Épuisé</span>' : '<span class="muted small">—</span>'}</td></tr>`; }).join('') || '<tr><td colspan="7" class="empty">Aucun article</td></tr>'}
  </tbody><tfoot><tr><td colspan="3" class="hide-m">Total</td><td class="hide-d">Total</td><td class="hide-m"></td><td class="n">${eur(sum(items, i => stockValue(i) || 0))}</td><td colspan="2"></td></tr></tfoot></table></div></div>`;
};
IN.stkQ = el => { UI.q.stk = el.value; const pos = el.selectionStart; render(); const i = document.querySelector('[data-in=stkQ]'); i.focus(); i.setSelectionRange(pos, pos); };
function stockMovesView() {
  const ty = UI.f.mvT || ''; const mv = S.mouvements.filter(m => !ty || m.type === ty).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 250);
  return `<div class="row wrap mb toolbar"><div class="seg">${[['', 'Tous'], ...Object.entries(MOVE_TYPES)].map(([v, l]) => `<button class="${ty === v ? 'on' : ''}" data-a="ivF" data-k="mvT" data-v="${v}">${l}</button>`).join('')}</div><span class="sp"></span><button class="btn sm" data-a="exportMv">${ic('copy')} CSV</button></div>
  <div class="card only-m">${mWrap(mv.slice(0, 120).map(mMove))}</div><div class="card only-d"><div class="tbl-wrap"><table class="t"><thead><tr><th>Date</th><th>Type</th><th>Article</th><th class="n">Quantité</th><th class="n">Valeur</th><th>Motif</th></tr></thead><tbody>${mv.map(moveRow).join('')}</tbody></table></div></div>${S.mouvements.length > 250 ? '<div class="formula">250 derniers mouvements affichés — export CSV complet disponible.</div>' : ''}`;
}
const moveRow = m => { const it = byId('stock', m.itemId); const sign = ['sortie', 'perte'].includes(m.type) ? -1 : 1; const q = m.qte * sign; return `<tr><td class="num">${dshort(m.date)} <span class="cell-sub">${D(m.date).getFullYear()}</span></td><td><span class="badge ${m.type === 'entree' ? 'ok' : m.type === 'perte' ? 'danger' : m.type === 'sortie' ? 'warn' : 'info'}">${MOVE_TYPES[m.type]}</span></td><td>${esc(it?.nom || '?')}</td><td class="n num">${q > 0 ? '+' : ''}${nfx(q, 2)} ${it?.unite || ''}</td><td class="n">${m.valeur ? eur(m.valeur * (sign < 0 ? -1 : 1)) : '—'}</td><td class="small muted">${esc(m.motif)}</td></tr>`; };
ACT.exportMv = () => copyText(toCSV([['Date', 'Type', 'Article', 'Catégorie', 'Quantité', 'Unité', 'Prix unitaire', 'Valeur', 'Motif'], ...S.mouvements.map(m => { const it = byId('stock', m.itemId); return [m.date, MOVE_TYPES[m.type], it?.nom, STOCK_CATS[it?.cat], String(m.qte).replace('.', ','), it?.unite, String(m.pu).replace('.', ','), String(m.valeur).replace('.', ','), m.motif]; })]), 'Mouvements copiés (CSV)');
function inventaireView() {
  const items = S.stock.filter(i => i.cat !== 'production' || i.qte > 0);
  return `<div class="note info mb">${ic('info')}<span>Saisissez les quantités comptées. Les écarts génèrent des mouvements d’<b>ajustement</b> valorisés au prix moyen pondéré.</span></div>
  <form data-f="inventaire" class="card"><div class="tbl-wrap"><table class="t"><thead><tr><th>Article</th><th>Emplacement</th><th class="n">Théorique</th><th class="n" style="width:160px">Compté</th></tr></thead><tbody>
  ${items.map(i => `<tr><td><div class="cell-main">${esc(i.nom)}</div><div class="cell-sub">${STOCK_CATS[i.cat]}</div></td><td>${esc(i.emplacement)}</td><td class="n">${qty(i.qte, i.unite)}</td><td class="n"><input class="inp" style="height:36px;text-align:right" type="number" step="0.01" name="inv_${i.id}" placeholder="${nfx(i.qte, 2)}"></td></tr>`).join('')}
  </tbody></table></div><div class="row" style="padding:14px 18px"><span class="muted small">Seules les lignes renseignées sont prises en compte.</span><span class="sp"></span><button class="btn p">${ic('check')} Valider l’inventaire</button></div></form>`;
}
FORMS.inventaire = d => { let n = 0, val = 0; Object.entries(d).forEach(([k, v]) => { if (v === '' || !k.startsWith('inv_')) return; const it = byId('stock', k.slice(4)); const diff = r2(+v - it.qte, 3); if (Math.abs(diff) < 1e-6) return; const m = stockMove(it.id, 'ajustement', diff, { motif: `Inventaire du ${dfr(TODAY)}` }); n++; val += m.valeur; }); commit(n ? `${n} ajustement(s) d’inventaire · écart ${eur(val)}` : 'Aucun écart constaté'); };
ACT.openStock = d => openDrawer('stock', d.id);
DRAWERS.stock = id => {
  const i = byId('stock', id); if (!i) return null;
  const mv = S.mouvements.filter(m => m.itemId === id).sort((a, b) => b.date.localeCompare(a.date));
  const v = stockValue(i);
  return {
    title: esc(i.nom), body: `<div class="card pad"><div class="kv">${[['Catégorie', STOCK_CATS[i.cat]], ['Quantité disponible', qty(i.qte, i.unite)], ['Emplacement', i.emplacement], [i.cat === 'production' ? 'Cours de référence' : 'Prix moyen pondéré', i.cat === 'production' ? (refPrice(i.culture) != null ? `${eur(refPrice(i.culture))}/t` : 'non disponible') : `${eur(i.pmp, 3)}/${i.unite}`], [i.cat === 'production' ? 'Valeur théorique' : 'Valeur du stock', v == null ? '—' : eur(v)], ['Fournisseur', i.fournisseur || '—'], ['N° de lot', i.lot || '—'], ['Dernière entrée', dfr(i.dateEntree)], ['Seuil d’alerte', i.seuil ? qty(i.seuil, i.unite) : '—']].map(([k, x]) => `<div><span>${k}</span><b>${esc(x)}</b></div>`).join('')}</div>
    ${i.cat === 'production' ? `<div class="formula">Valeur théorique = ${nfx(i.qte, 2)} t × ${refPrice(i.culture) != null ? eur(refPrice(i.culture), 2) : '?'} (dernier cours : ${esc(S.cours[coursKeyOf(i.culture)]?.source || 'aucune source')}). Ce n'est pas du chiffre d'affaires réalisé.</div>` : ''}</div>
    <div class="row wrap mt">${i.cat === 'production' ? `<button class="btn p" data-a="newSale" data-item="${i.id}">${ic('cart')} Vendre</button>` : `<button class="btn p" data-a="purchase" data-item="${i.id}">${ic('plus')} Entrée / achat</button>`}<button class="btn" data-a="stockMove" data-item="${i.id}">${ic('move')} Mouvement</button><button class="btn" data-a="editItem" data-id="${i.id}">${ic('edit')} Modifier</button></div>
    <div class="card mt"><div class="card-h"><h3>Historique des mouvements</h3><span class="sub">${mv.length}</span></div><div class="tbl-wrap"><table class="t"><tbody>${mv.slice(0, 120).map(moveRow).join('') || '<tr><td class="empty">Aucun mouvement</td></tr>'}</tbody></table></div></div>`
  };
};
ACT.purchase = d => {
  const intr = S.stock.filter(x => x.cat !== 'production');
  const sel = d.item || intr[0]?.id;
  openModal({
    title: 'Entrée en stock / achat', body: `<label class="field"><span>Article</span><select class="inp" name="itemId" data-ch="purItem">${Object.entries(STOCK_CATS).filter(([c]) => c !== 'production').map(([c, l]) => `<optgroup label="${l}">${opts(intr.filter(s => s.cat === c).map(s => [s.id, `${s.nom} (${s.unite})`]), sel)}</optgroup>`).join('')}</select></label>
    <div class="grid3"><label class="field"><span>Quantité</span><input class="inp" type="number" step="0.01" min="0" name="qte" required></label><label class="field"><span>Prix unitaire HT (€)</span><input class="inp" type="number" step="0.0001" min="0" name="prix" value="${byId('stock', sel)?.pmp ?? ''}" required></label><label class="field"><span>Date</span><input class="inp" type="date" name="date" value="${TODAY}"></label></div>
    <div class="grid3"><label class="field"><span>Fournisseur</span><input class="inp" name="fournisseur" value="${esc(byId('stock', sel)?.fournisseur || '')}"></label><label class="field"><span>N° de lot</span><input class="inp" name="lot" value="${esc(byId('stock', sel)?.lot || '')}"></label><label class="field"><span>Réf. facture</span><input class="inp" name="ref"></label></div>
    <div class="note">${ic('info')}<span>L’achat crée une <b>entrée de stock</b> (prix moyen recalculé) et une <b>charge</b> dans la gestion économique.</span></div>`,
    submit: 'Enregistrer l’achat', onSubmit: f => { if (!(+f.qte > 0) || !(+f.prix >= 0)) throw new Error('Quantité et prix requis'); const it = byId('stock', f.itemId); if (f.lot) it.lot = f.lot; const ch = recordPurchase({ itemId: f.itemId, qte: +f.qte, prixUnit: +f.prix, date: f.date, fournisseur: f.fournisseur, ref: f.ref }); commit(`Achat enregistré : ${eur(ch.montant)} · stock ${qty(it.qte, it.unite)}`); }
  });
};
CH.purItem = el => { const it = byId('stock', el.value); const f = el.form; f.prix.value = it.pmp; f.fournisseur.value = it.fournisseur || ''; f.lot.value = it.lot || ''; };
ACT.stockMove = d => {
  const sel = d.item || S.stock[0]?.id;
  openModal({
    title: 'Mouvement de stock', body: `<label class="field"><span>Article</span><select class="inp" name="itemId">${Object.entries(STOCK_CATS).map(([c, l]) => `<optgroup label="${l}">${opts(S.stock.filter(s => s.cat === c && (c !== 'production' || s.qte > 0)).map(s => [s.id, `${s.nom} — ${qty(s.qte, s.unite)} · ${s.emplacement}`]), sel)}</optgroup>`).join('')}</select></label>
    <div class="field"><span>Type</span><select class="inp" name="type" data-ch="mvType">${opts([['sortie', 'Sortie (hors intervention)'], ['transfert', 'Transfert d’emplacement'], ['perte', 'Perte / casse / péremption'], ['ajustement', 'Ajustement (+/−)'], ['entree', 'Entrée sans achat (don, retour…)']], 'sortie')}</select></div>
    <div class="grid2"><label class="field"><span>Quantité <small id="mvHint">(positive)</small></span><input class="inp" type="number" step="0.01" name="qte" required></label><label class="field"><span>Date</span><input class="inp" type="date" name="date" value="${TODAY}"></label></div>
    <label class="field" id="mvDest" style="display:none"><span>Nouvel emplacement</span><input class="inp" name="dest" list="emps"><datalist id="emps">${[...new Set(S.stock.map(s => s.emplacement))].map(e => `<option value="${esc(e)}">`).join('')}</datalist></label>
    <label class="field"><span>Motif</span><input class="inp" name="motif" placeholder="Ex. : semences de ferme, casse…"></label>`,
    submit: 'Enregistrer', onSubmit: f => {
      const it = byId('stock', f.itemId); const q = +f.qte; if (!q) throw new Error('Quantité requise');
      if (f.type === 'transfert') { if (!f.dest) throw new Error('Emplacement requis'); transferStock(it.id, Math.abs(q), f.dest, f.date); }
      else if (f.type === 'ajustement') stockMove(it.id, 'ajustement', q, { date: f.date, motif: f.motif || 'Ajustement manuel' });
      else { if (q < 0) throw new Error('Quantité positive attendue'); if (f.type !== 'entree' && q > it.qte + 1e-6) throw new Error(`Quantité supérieure au stock (${qty(it.qte, it.unite)})`); stockMove(it.id, f.type, q, { date: f.date, motif: f.motif }); }
      commit('Mouvement enregistré');
    }
  });
};
CH.mvType = el => { document.getElementById('mvDest').style.display = el.value === 'transfert' ? '' : 'none'; document.getElementById('mvHint').textContent = el.value === 'ajustement' ? '(+ ou −)' : '(positive)'; };
ACT.newItem = () => itemForm(null);
ACT.editItem = d => itemForm(d.id);
function itemForm(id) {
  const i = id ? byId('stock', id) : { cat: 'engrais', unite: 'kg', seuil: 0 };
  openModal({
    title: id ? 'Modifier l’article' : 'Nouvel article', body: `<label class="field"><span>Désignation</span><input class="inp" name="nom" required value="${esc(i.nom || '')}"></label>
    <div class="grid3"><label class="field"><span>Catégorie</span><select class="inp" name="cat" ${id ? 'disabled' : ''}>${opts(Object.entries(STOCK_CATS).filter(([k]) => k !== 'production' || id), i.cat)}</select></label><label class="field"><span>Unité</span><select class="inp" name="unite">${opts([['t', 'tonne'], ['kg', 'kilogramme'], ['L', 'litre'], ['u', 'unité'], ['dose', 'dose']], i.unite)}</select></label><label class="field"><span>Seuil d’alerte</span><input class="inp" type="number" step="0.01" name="seuil" value="${i.seuil || 0}"></label></div>
    <div class="grid3"><label class="field"><span>Emplacement</span><input class="inp" name="emplacement" value="${esc(i.emplacement || '')}"></label><label class="field"><span>Fournisseur</span><input class="inp" name="fournisseur" value="${esc(i.fournisseur || '')}"></label><label class="field"><span>N° de lot</span><input class="inp" name="lot" value="${esc(i.lot || '')}"></label></div>
    ${!id ? '<div class="note">' + ic('info') + '<span>L’article est créé avec une quantité nulle : enregistrez ensuite une entrée / un achat.</span></div>' : ''}`,
    onSubmit: f => { if (!f.nom) throw new Error('Désignation requise'); if (id) Object.assign(i, { nom: f.nom, unite: f.unite, seuil: +f.seuil || 0, emplacement: f.emplacement, fournisseur: f.fournisseur, lot: f.lot }); else S.stock.push({ id: uid('st'), nom: f.nom, cat: f.cat, unite: f.unite, qte: 0, pmp: 0, basePrix: 0, batch: 1, seuil: +f.seuil || 0, emplacement: f.emplacement, fournisseur: f.fournisseur, lot: f.lot, dateEntree: TODAY }); commit(id ? 'Article modifié' : 'Article créé'); }
  });
}

/* =========================== VENTES ET ACHATS =========================== */
VIEWS.ventes = () => {
  const t = tab('va', 'ventes'); const camp = PREFS.camp;
  return `${demoBar('Ventes et charges de démonstration — acheteurs et fournisseurs fictifs.')}${tabsBar('va', [['ventes', 'Ventes'], ['achats', 'Achats et charges']], t)}${t === 'ventes' ? ventesView(camp) : achatsView(camp)}`;
};
function ventesView(camp) {
  const vs = S.ventes.filter(v => v.campagne === camp && (!UI.f.vSt || v.statut === UI.f.vSt)).sort((a, b) => b.date.localeCompare(a.date));
  const all = S.ventes.filter(v => v.campagne === camp); const E = econ(camp);
  const ST = { paye: ['Payé', 'ok'], attente: ['En attente', 'warn'], partiel: ['Partiel', 'info'] };
  return `<div class="grid g-kpi mb">${kpi('euro', `CA récolte ${camp}`, eur(E.ca), `${all.length} ventes`)}${kpi('wheat', 'Volume vendu', `${nf(sum(all, v => v.qte), 1)} t`, `prix moyen ${eur(sum(all, v => v.montant) / (sum(all, v => v.qte) || 1))}/t`)}${kpi('clock', 'À encaisser', eur(E.impayes), `${all.filter(v => v.statut !== 'paye').length} factures (partiel compté pour moitié)`, '', 'warn')}${kpi('box', 'Reste à vendre', `${nf(sum(S.stock.filter(s => s.cat === 'production' && s.campagne === camp), s => s.qte), 1)} t`, `<span class="badge est">≈ ${keur(E.produitEstime)}</span> au cours`)}</div>
  <div class="row wrap mb toolbar"><div class="seg">${[['', 'Toutes'], ['paye', 'Payées'], ['attente', 'En attente'], ['partiel', 'Partielles']].map(([v, l]) => `<button class="${(UI.f.vSt || '') === v ? 'on' : ''}" data-a="ivF" data-k="vSt" data-v="${v}">${l}</button>`).join('')}</div><span class="sp"></span>${pa([{ a: 'exportVentes', i: 'copy', l: 'Export CSV', more: true }, { a: 'newSale', i: 'plus', l: 'Vente', primary: true }])}</div>
  <div class="card only-m">${mWrap(vs.map(mVente), 'Aucune vente sur cette campagne')}</div><div class="card only-d"><div class="tbl-wrap"><table class="t"><thead><tr><th>Date</th><th>Facture</th><th>Produit</th><th class="hide-m">Acheteur</th><th class="n">Quantité</th><th class="n hide-m">Prix</th><th class="n">Montant</th><th>Règlement</th></tr></thead><tbody>
  ${vs.map(v => `<tr data-a="openSale" data-id="${v.id}"><td class="num">${dshort(v.date)} <span class="cell-sub">${D(v.date).getFullYear()}</span></td><td class="b">${esc(v.facture)}</td><td>${cultBadge(v.culture)}</td><td class="hide-m">${esc(v.acheteur)}</td><td class="n">${nfx(v.qte, 2)} ${v.unite}</td><td class="n hide-m">${eur(v.prix, 2)}/${v.unite}</td><td class="n b">${eur(v.montant)}</td><td><span class="badge ${ST[v.statut][1]}">${ST[v.statut][0]}</span></td></tr>`).join('') || '<tr><td colspan="8" class="empty">Aucune vente sur cette campagne</td></tr>'}
  </tbody><tfoot><tr><td colspan="4" class="hide-m">Total</td><td class="hide-d" colspan="3">Total</td><td class="n hide-m">${nf(sum(vs, v => v.qte), 1)} t</td><td class="hide-m"></td><td class="n">${eur(sum(vs, v => v.montant))}</td><td></td></tr></tfoot></table></div></div>`;
}
ACT.exportVentes = () => copyText(toCSV([['Date', 'Facture', 'Produit', 'Campagne', 'Acheteur', 'Quantité', 'Unité', 'Prix unitaire', 'Montant', 'Règlement'], ...S.ventes.map(v => [v.date, v.facture, v.produit, campLabel(v.campagne), v.acheteur, String(v.qte).replace('.', ','), v.unite, String(v.prix).replace('.', ','), String(v.montant).replace('.', ','), v.statut])]), 'Ventes copiées (CSV)');
ACT.newSale = d => {
  const items = S.stock.filter(s => s.cat === 'production' && s.qte > 0);
  if (!items.length) { toast('Aucun stock de production disponible : enregistrez d’abord une récolte.', 'warn'); return; }
  const sel = d.item || items[0].id;
  const buyers = [...new Set(S.ventes.map(v => v.acheteur))];
  openModal({
    title: 'Nouvelle vente', body: `<label class="field"><span>Produit</span><select class="inp" name="itemId" data-ch="saleItem">${opts(items.map(s => [s.id, `${s.nom} — ${nfx(s.qte, 2)} t disponibles`]), sel)}</select></label>
    <div class="grid3"><label class="field"><span>Quantité (t)</span><input class="inp" type="number" step="0.01" min="0" name="qte" required data-in="saleCalc"></label><label class="field"><span>Prix (€/t)</span><input class="inp" type="number" step="0.01" min="0" name="prix" required data-in="saleCalc" value="${refPrice(byId('stock', sel).culture) ?? ''}"><small>prérempli avec le dernier cours connu</small></label><div class="field"><span>Montant</span><div class="inp b" style="display:flex;align-items:center" id="saleTot">—</div></div></div>
    <div class="grid3"><label class="field"><span>Acheteur</span><input class="inp" name="acheteur" list="buyers" required><datalist id="buyers">${buyers.map(b => `<option value="${esc(b)}">`).join('')}</datalist></label><label class="field"><span>Date</span><input class="inp" type="date" name="date" value="${TODAY}"></label><label class="field"><span>Règlement</span><select class="inp" name="statut">${opts([['attente', 'En attente'], ['paye', 'Payé'], ['partiel', 'Partiel']], 'attente')}</select></label></div>
    <label class="field"><span>Référence facture</span><input class="inp" name="facture" placeholder="Générée automatiquement si vide"></label>
    <div class="note">${ic('info')}<span>La vente <b>diminue le stock</b> de production et alimente le <b>chiffre d’affaires</b> de la campagne de récolte.</span></div>`,
    submit: 'Enregistrer la vente', onSubmit: f => { if (!(+f.qte > 0) || !(+f.prix > 0) || !f.acheteur) throw new Error('Quantité, prix et acheteur requis'); const v = recordSale({ itemId: f.itemId, qte: +f.qte, prix: +f.prix, acheteur: f.acheteur, date: f.date, statut: f.statut, facture: f.facture }); commit(`Vente ${v.facture} enregistrée : ${eur(v.montant)}`); }
  });
};
CH.saleItem = el => { el.form.prix.value = refPrice(byId('stock', el.value).culture) ?? ''; IN.saleCalc(el); };
IN.saleCalc = el => { const f = el.form; document.getElementById('saleTot').textContent = (+f.qte.value > 0 && +f.prix.value > 0) ? eur(f.qte.value * f.prix.value, 2) : '—'; };
ACT.openSale = d => openDrawer('vente', d.id);
DRAWERS.vente = id => {
  const v = byId('ventes', id); if (!v) return null;
  return {
    title: `Vente ${esc(v.facture)}`, body: `<div class="card pad"><div class="kv">${[['Date', dfr(v.date)], ['Produit', v.produit], ['Campagne', campLabel(v.campagne)], ['Acheteur', v.acheteur], ['Quantité', `${nfx(v.qte, 2)} ${v.unite}`], ['Prix', `${eur(v.prix, 2)}/${v.unite}`], ['Montant', eur(v.montant, 2)]].map(([k, x]) => `<div><span>${k}</span><b>${esc(x)}</b></div>`).join('')}</div></div>
    <div class="field mt"><span>Statut du règlement</span><div class="seg">${[['attente', 'En attente'], ['partiel', 'Partiel'], ['paye', 'Payé']].map(([s, l]) => `<button class="${v.statut === s ? 'on' : ''}" data-a="saleSt" data-id="${v.id}" data-s="${s}">${l}</button>`).join('')}</div></div>
    <div class="row mt"><button class="btn g d" data-a="delSale" data-id="${v.id}">${ic('trash')} Supprimer (remet le stock)</button></div>`
  };
};
ACT.saleSt = d => { byId('ventes', d.id).statut = d.s; commit('Règlement mis à jour'); };
ACT.delSale = d => { deleteSale(byId('ventes', d.id)); closeDrawer(); commit('Vente supprimée, stock rétabli'); };
function achatsView(camp) {
  const cat = UI.f.chCat || ''; const ch = S.charges.filter(c => c.campagne === camp && (!cat || c.cat === cat)).sort((a, b) => b.date.localeCompare(a.date));
  const E = econ(camp);
  return `<div class="grid g-2 mb">${card(`Charges ${campLabel(camp)} par poste`, hbars(E.byCat.sort((a, b) => b.value - a.value).map(c => ({ label: c.label, value: c.value, color: 'var(--warn)' })), { fmt: v => eur(v) }), { sub: eur(E.charges) })}
  ${card('Comment sont alimentées les charges ?', `<div class="list small">${[['cart', 'Achats d’intrants et de carburant', 'Saisis via « Entrée / achat » : ils créent aussi l’entrée en stock.'], ['tractor', 'Entretien et réparations', 'Créés automatiquement depuis les fiches du parc matériel.'], ['euro', 'Fermages, assurances, main-d’œuvre, prestations…', 'Saisis ici, rattachés à une campagne.']].map(([i, t, s]) => `<div class="li"><div class="ic">${ic(i)}</div><div class="tx"><b>${t}</b><span>${s}</span></div></div>`).join('')}</div>`)}</div>
  <div class="row wrap mb toolbar"><select class="inp" style="width:auto;height:38px" data-ch="chCat"><option value="">Tous les postes</option>${opts(Object.entries(CHARGE_CATS), cat)}</select><span class="sp"></span>${pa([{ a: 'exportCharges', i: 'copy', l: 'Export CSV', more: true }, { a: 'purchase', i: 'box', l: 'Achat d’intrant' }, { a: 'newCharge', i: 'plus', l: 'Charge', primary: true }])}</div>
  <div class="card only-m">${mWrap(ch.map(mCharge), 'Aucune charge')}</div><div class="card only-d"><div class="tbl-wrap"><table class="t"><thead><tr><th>Date</th><th>Poste</th><th>Libellé</th><th class="hide-m">Fournisseur</th><th class="n">Montant HT</th><th></th></tr></thead><tbody>
  ${ch.map(c => `<tr><td class="num">${dshort(c.date)} <span class="cell-sub">${D(c.date).getFullYear()}</span></td><td><span class="badge">${CHARGE_CATS[c.cat]}</span></td><td>${esc(c.libelle)}</td><td class="hide-m small muted">${esc(c.fournisseur)}</td><td class="n b">${eur(c.montant, 2)}</td><td class="n">${!c.itemId && !c.materielId ? `<button class="btn xs g" data-a="delCharge" data-id="${c.id}">${ic('trash')}</button>` : `<span class="badge info" title="Liée à ${c.itemId ? 'un mouvement de stock' : 'une fiche matériel'}">liée</span>`}</td></tr>`).join('') || '<tr><td colspan="6" class="empty">Aucune charge</td></tr>'}
  </tbody><tfoot><tr><td colspan="3" class="hide-m">Total</td><td class="hide-d" colspan="2">Total</td><td class="n hide-m"></td><td class="n">${eur(sum(ch, c => c.montant), 2)}</td><td></td></tr></tfoot></table></div></div>`;
}
CH.chCat = el => { UI.f.chCat = el.value; render(); };
ACT.exportCharges = () => copyText(toCSV([['Date', 'Campagne', 'Poste', 'Libellé', 'Fournisseur', 'Montant HT'], ...S.charges.map(c => [c.date, campLabel(c.campagne), CHARGE_CATS[c.cat], c.libelle, c.fournisseur, String(c.montant).replace('.', ',')])]), 'Charges copiées (CSV)');
ACT.newCharge = () => openModal({
  title: 'Nouvelle charge', body: `<div class="grid2"><label class="field"><span>Poste</span><select class="inp" name="cat">${opts(Object.entries(CHARGE_CATS).filter(([k]) => k !== 'intrants'), 'divers')}</select></label><label class="field"><span>Campagne</span><select class="inp" name="campagne">${opts([2025, 2026, 2027].map(c => [c, campLabel(c)]), CURRENT_CAMP)}</select></label></div>
  <label class="field"><span>Libellé</span><input class="inp" name="libelle" required></label>
  <div class="grid3"><label class="field"><span>Montant HT (€)</span><input class="inp" type="number" step="0.01" name="montant" required></label><label class="field"><span>Date</span><input class="inp" type="date" name="date" value="${TODAY}"></label><label class="field"><span>Fournisseur</span><input class="inp" name="fournisseur"></label></div>
  <div class="note">${ic('info')}<span>Pour un achat d’intrant (engrais, semences…), utilisez « Achat d’intrant » afin d’alimenter aussi le stock.</span></div>`,
  onSubmit: f => { if (!f.libelle || !(+f.montant)) throw new Error('Libellé et montant requis'); S.charges.push({ id: uid('ch'), date: f.date, campagne: +f.campagne, cat: f.cat, libelle: f.libelle, montant: r2(+f.montant), fournisseur: f.fournisseur }); commit('Charge enregistrée'); }
});
ACT.delCharge = d => { S.charges = S.charges.filter(c => c.id !== d.id); commit('Charge supprimée'); };

/* =========================== GESTION ÉCONOMIQUE =========================== */
VIEWS.economie = () => {
  const t = tab('eco', 'synthese'); const camp = PREFS.camp;
  return `${demoBar('Résultats calculés à partir des données de démonstration ; cours de référence fictifs (aucune source de marché connectée).')}
  <div class="row wrap"><span class="muted small">Campagne analysée :</span><div class="seg">${[2025, 2026, 2027].map(c => `<button class="${camp === c ? 'on' : ''}" data-a="setCamp" data-c="${c}">${campLabel(c)}</button>`).join('')}</div></div><div style="height:12px"></div>
  ${tabsBar('eco', [['synthese', 'Synthèse'], ['marges', 'Marges par culture'], ['parcelles', 'Coûts par parcelle'], ['comparaison', 'Comparaison des campagnes'], ['cours', 'Cours agricoles']], t)}
  ${{ synthese: ecoSynthese, marges: ecoMarges, parcelles: ecoParcelles, comparaison: ecoComp, cours: ecoCours }[t](camp)}`;
};
ACT.setCamp = d => { PREFS.camp = +d.c; savePrefs(); render(); };
function ecoSynthese(camp) {
  const E = econ(camp), st = stockTotals(), m = caMensuel(camp);
  return `<div class="grid g-kpi">${kpi('euro', "Chiffre d'affaires", eur(E.ca), 'ventes réalisées de la récolte')}${kpi('cart', 'Charges', eur(E.charges), 'achats + charges de structure', '', 'warn')}${kpi('check', 'Résultat réalisé', eur(E.resultatRealise), 'CA − charges', '', E.resultatRealise >= 0 ? 'ok' : 'danger')}${kpi('trend', 'Résultat prévisionnel', eur(E.resultatPrev), `dont ${eur(E.produitEstime)} de stock valorisé <span class="badge est">estimé</span>`)}
  ${kpi('layers', 'Marge brute totale', eur(E.margeBrute), `${eur(E.surface ? E.margeBrute / E.surface : 0)}/ha`)}${kpi('box', 'Intrants consommés / ha', eur(E.intrantsHa), `total ${eur(E.intrantsConso)}`)}${kpi('tractor', 'Mécanisation / ha', eur(E.mecaHa), `total ${eur(E.meca)}`)}${kpi('wheat', 'Valeur des stocks', eur(st.intrants + st.production), `intrants ${keur(st.intrants)} · récoltes ${keur(st.production)}`)}</div>
  <div class="grid g-21 mt">${card('Chiffre d’affaires et charges par mois', barChart({ labels: m.map(x => x.label), series: [{ name: "Chiffre d'affaires", color: 'var(--primary)', values: m.map(x => x.ca) }, { name: 'Charges', color: 'var(--warn)', values: m.map(x => x.ch) }] }))}
  ${card('Charges par poste', donut(E.byCat.sort((a, b) => b.value - a.value).map((c, i) => ({ ...c, color: ['#1C6A47', '#E39A1F', '#2E7FBF', '#7A5BD6', '#D4532F', '#3FA38C', '#A8742A', '#68766D', '#C7B45A'][i % 9] })), { fmt: v => keur(v), size: 150, thick: 22 }))}</div>
  <div class="card pad mt"><b>Méthode de calcul</b><div class="formula">Résultat réalisé = Σ ventes de la récolte ${camp} − Σ charges rattachées à la campagne ${campLabel(camp)}
Résultat prévisionnel = résultat réalisé + stock de récolte non vendu × dernier cours de référence
Marge brute (culture) = produit brut − intrants consommés (produits + carburant) ; produit brut = ventes + stock restant × cours
Mécanisation = Σ heures × coût horaire (amortissement économique + assurance + entretien et réparations, hors carburant)
Les achats d’intrants sont des charges de trésorerie ; la marge brute retient les quantités réellement consommées.</div></div>`;
}
function ecoMarges(camp) {
  const E = econ(camp); const rows = E.rows;
  return `<div class="card"><div class="tbl-wrap"><table class="t"><thead><tr><th>Culture</th><th class="n">Surface</th><th class="n">Production</th><th class="n">Rdt</th><th class="n">Ventes</th><th class="n">Stock estimé</th><th class="n">Produit brut</th><th class="n">Intrants/ha</th><th class="n">Marge brute</th><th class="n">MB/ha</th><th class="n">Méca/ha</th><th class="n">Coût prod./t</th><th class="n">Prix moyen</th></tr></thead><tbody>
  ${rows.map(r => `<tr><td>${cultBadge(r.key)}</td><td class="n">${nf(r.surface, 1)} ha</td><td class="n">${r.production ? nf(r.production, 1) + ' t' : '—'}</td><td class="n">${r.rdt ? nfx(r.rdt, 2) : '—'}</td><td class="n">${eur(r.ventesCA)}</td><td class="n">${r.produitEstime ? `<span title="${nfx(r.restant, 1)} t × ${eur(r.prixRef, 2)}">${eur(r.produitEstime)}</span>` : '—'}</td><td class="n b">${eur(r.produitBrut)}</td><td class="n">${eur(r.intrantsHa)}</td><td class="n b">${eur(r.margeBrute)}</td><td class="n b" style="color:${r.mbHa >= 0 ? 'var(--ok)' : 'var(--danger)'}">${eur(r.mbHa)}</td><td class="n">${eur(r.mecaHa)}</td><td class="n">${r.coutTonne ? eur(r.coutTonne) : '—'}</td><td class="n">${r.prixMoyen ? eur(r.prixMoyen) : '—'}</td></tr>`).join('')}
  </tbody><tfoot><tr><td>Total</td><td class="n">${nf(E.surface, 1)} ha</td><td></td><td></td><td class="n">${eur(E.ca)}</td><td class="n">${eur(E.produitEstime)}</td><td class="n">${eur(sum(rows, r => r.produitBrut))}</td><td class="n">${eur(E.intrantsHa)}</td><td class="n">${eur(E.margeBrute)}</td><td class="n">${eur(E.surface ? E.margeBrute / E.surface : 0)}</td><td class="n">${eur(E.mecaHa)}</td><td></td><td></td></tr></tfoot></table></div></div>
  <div class="grid g-2 mt">${card('Marge brute par hectare', hbars(rows.filter(r => r.production).sort((a, b) => b.mbHa - a.mbHa).map(r => ({ label: r.nom, value: r.mbHa, color: r.color })), { fmt: v => `${eur(v)}/ha` }))}
  ${card('Coût de production par tonne vs prix', `<div class="tbl-wrap"><table class="t"><thead><tr><th>Culture</th><th class="n">Coût / t</th><th class="n">Prix moyen / cours</th><th class="n">Écart</th></tr></thead><tbody>${rows.filter(r => r.coutTonne).map(r => { const p = r.prixMoyen ?? r.prixRef; return `<tr><td>${esc(r.nom)}</td><td class="n">${eur(r.coutTonne)}</td><td class="n">${p ? eur(p) : '—'}</td><td class="n b" style="color:${p - r.coutTonne >= 0 ? 'var(--ok)' : 'var(--danger)'}">${p ? eur(p - r.coutTonne) : '—'}</td></tr>`; }).join('')}</tbody></table></div><div class="formula">Coût / t = (intrants + mécanisation + charges de structure réparties à l'ha) ÷ tonnes récoltées</div>`)}</div>`;
}
function ecoParcelles(camp) {
  const E = econ(camp); const ps = E.rows.flatMap(r => r.parcelles.map(p => ({ ...p, culture: r.key }))).sort((a, b) => (b.coutTonne || 0) - (a.coutTonne || 0));
  return `<div class="card"><div class="tbl-wrap"><table class="t"><thead><tr><th>Parcelle</th><th>Culture</th><th class="n">Surface</th><th class="n">Rdt</th><th class="n">Intrants/ha</th><th class="n">Méca/ha</th><th class="n">Structure/ha</th><th class="n">Coût total/ha</th><th class="n">Coût / t</th></tr></thead><tbody>
  ${ps.map(p => `<tr data-a="openParc" data-id="${p.id}"><td class="cell-main">${esc(p.nom)}</td><td>${cultBadge(p.culture)}</td><td class="n">${nf(p.surface, 1)} ha</td><td class="n">${p.production ? nfx(p.production / p.surface, 2) + ' t/ha' : '—'}</td><td class="n">${eur(p.intrants / p.surface)}</td><td class="n">${eur(p.meca / p.surface)}</td><td class="n">${eur(p.fixAlloc / p.surface)}</td><td class="n b">${eur((p.intrants + p.meca + p.fixAlloc) / p.surface)}</td><td class="n b">${p.coutTonne ? eur(p.coutTonne) : '—'}</td></tr>`).join('')}
  </tbody></table></div></div><div class="formula">Charges de structure (${eur(E.fixes)} : fermages, assurances, main-d’œuvre, prestations, divers) réparties au prorata de la surface : ${eur(E.surface ? E.fixes / E.surface : 0)}/ha.</div>`;
}
function ecoComp() {
  const cs = [2025, 2026, 2027]; const Es = cs.map(econ);
  const ind = [["Chiffre d'affaires", e => e.ca], ['Charges', e => e.charges], ['Résultat réalisé', e => e.resultatRealise], ['Résultat prévisionnel', e => e.resultatPrev], ['Marge brute totale', e => e.margeBrute], ['Intrants consommés / ha', e => e.intrantsHa], ['Mécanisation / ha', e => e.mecaHa]];
  const cultures = [...new Set(Es.flatMap(e => e.rows.filter(r => r.production).map(r => r.key)))];
  const cols = ['#9DB35E', '#1C6A47', '#E39A1F'];
  return `${card('Indicateurs clés', barChart({ labels: ["CA", 'Charges', 'Résultat réalisé', 'Marge brute'], series: cs.map((c, i) => ({ name: campLabel(c), color: cols[i], values: [Es[i].ca, Es[i].charges, Es[i].resultatRealise, Es[i].margeBrute] })) }))}
  <div class="card mt"><div class="tbl-wrap"><table class="t"><thead><tr><th>Indicateur</th>${cs.map(c => `<th class="n">${campLabel(c)}</th>`).join('')}<th class="n">Évol. N-1</th></tr></thead><tbody>
  ${ind.map(([l, f]) => `<tr><td class="cell-main">${l}</td>${Es.map(e => `<td class="n">${eur(f(e))}</td>`).join('')}<td class="n">${f(Es[0]) ? trend((f(Es[1]) - f(Es[0])) / Math.abs(f(Es[0]))) : '—'}</td></tr>`).join('')}
  </tbody></table></div><div class="formula" style="margin:0 18px 16px">Évol. N-1 : ${campLabel(cs[1])} par rapport à ${campLabel(cs[0])}. La campagne ${campLabel(cs[2])} est en cours (aucune récolte).</div></div>
  <div class="card mt"><div class="card-h"><h3>Rendement et marge brute / ha par culture</h3></div><div class="tbl-wrap"><table class="t"><thead><tr><th>Culture</th>${cs.slice(0, 2).map(c => `<th class="n">Rdt ${campLabel(c)}</th><th class="n">MB/ha ${campLabel(c)}</th>`).join('')}</tr></thead><tbody>
  ${cultures.map(k => `<tr><td>${cultBadge(k)}</td>${Es.slice(0, 2).map(e => { const r = e.rows.find(x => x.key === k); return `<td class="n">${r?.rdt ? nfx(r.rdt, 2) + ' t/ha' : '—'}</td><td class="n">${r?.production ? eur(r.mbHa) : '—'}</td>`; }).join('')}</tr>`).join('')}
  </tbody></table></div></div>`;
}
function ecoCours() {
  const keys = Object.keys(S.cours); const k = UI.f.coursK && S.cours[k] ? UI.f.coursK : (UI.f.coursK && S.cours[UI.f.coursK] ? UI.f.coursK : keys[0]);
  const sel = UI.f.coursK && S.cours[UI.f.coursK] ? UI.f.coursK : keys[0];
  const per = +(UI.f.coursPer || 365); const c = S.cours[sel];
  const pts = c ? c.points.filter(p => daysBetween(p.date, c.points[c.points.length - 1]?.date) <= per) : [];
  const prodStock = S.stock.filter(s => s.cat === 'production' && s.qte > 0);
  return `<div class="note warn mb">${ic('alert')}<span><b>Aucune source de marché n’est connectée.</b> Les séries affichées sont des <b>données de démonstration fictives</b> ; elles ne reflètent pas les cours réels. Vous pouvez saisir vos propres prix (bulletin de votre organisme stockeur, cotations publiées). La connexion à des sources identifiées est prévue à l’étape 6.</span></div>
  <div class="grid g-kpi mb">${keys.map(key => { const co = S.cours[key]; const l = lastCours(key); return `<div class="card kpi" data-a="coursK" data-k="${key}" style="${key === sel ? 'border-color:var(--primary);box-shadow:0 0 0 2px var(--primary-soft)' : ''}"><div class="kpi-l">${esc(co.nom)}<span class="sp"></span>${co.type === 'demo' ? '<span class="badge demo">démo</span>' : '<span class="badge info">saisi</span>'}</div><div class="row"><div class="kpi-v">${l ? eur(l.prix) : '—'}</div><span class="sp"></span>${sparkline(co.points.slice(-30).map(p => p.prix), coursVar(key, 30) >= 0 ? 'var(--ok)' : 'var(--danger)')}</div><div class="kpi-s">7 j ${trend(coursVar(key, 7))} · 30 j ${trend(coursVar(key, 30))} · 12 m ${trend(coursVar(key, 365))}</div><div class="kpi-s">MAJ ${l ? dfr(l.date) : '—'}</div></div>`; }).join('')}</div>
  ${c ? card(`${esc(c.nom)} — ${c.unite}`, `${pts.length > 1 ? lineChart({ series: [{ name: c.nom, color: 'var(--primary)', points: pts.map(p => ({ x: p.date, y: p.prix })) }], fmt: v => nf(v), height: 240 }) : '<div class="empty">Pas assez de points</div>'}<div class="formula">Source : ${esc(c.source)} · dernière actualisation : ${dfr(lastCours(sel)?.date)}${c.manuels?.length ? ` · ${c.manuels.length} prix saisi(s) manuellement` : ''}</div>`, { right: `<div class="seg">${[[30, '1 m'], [182, '6 m'], [365, '12 m']].map(([v, l]) => `<button class="${per === v ? 'on' : ''}" data-a="ivF" data-k="coursPer" data-v="${v}">${l}</button>`).join('')}</div><button class="btn sm p" data-a="addPrice" data-k="${sel}">${ic('plus')} Saisir un prix</button>` }) : ''}
  <div class="card mt"><div class="card-h"><h3>Valorisation théorique des stocks de récolte</h3></div><div class="tbl-wrap"><table class="t"><thead><tr><th>Stock</th><th class="n">Quantité</th><th class="n">Cours de référence</th><th class="n">Valeur estimée</th><th class="hide-m">Date du cours</th></tr></thead><tbody>
  ${prodStock.map(s => { const ck = coursKeyOf(s.culture); const l = ck && lastCours(ck); return `<tr><td>${esc(s.nom)}</td><td class="n">${nfx(s.qte, 2)} t</td><td class="n">${l ? eur(l.prix, 2) : '<span class="badge warn">aucun cours</span>'}</td><td class="n b">${l ? eur(s.qte * l.prix) : '—'}</td><td class="hide-m small muted">${l ? dfr(l.date) + ' · ' + esc(S.cours[ck].source) : '—'}</td></tr>`; }).join('') || '<tr><td colspan="5" class="empty">Aucun stock de récolte</td></tr>'}
  </tbody><tfoot><tr><td colspan="3">Valeur théorique totale</td><td class="n">${eur(stockTotals().production)}</td><td class="hide-m"></td></tr></tfoot></table></div>
  <div class="formula" style="margin:0 18px 16px">Valeur estimée du stock = quantité disponible × cours de référence. Il s'agit d'une valorisation théorique, distincte du chiffre d'affaires réellement réalisé (${eur(econ(PREFS.camp).ca)} sur ${campLabel(PREFS.camp)}).</div></div>`;
}
ACT.coursK = d => { UI.f.coursK = d.k; render(); };
ACT.addPrice = d => { const c = S.cours[d.k]; openModal({ title: `Saisir un prix — ${esc(c.nom)}`, body: `<div class="grid2"><label class="field"><span>Prix (${c.unite})</span><input class="inp" type="number" step="0.01" name="prix" required></label><label class="field"><span>Date</span><input class="inp" type="date" name="date" value="${TODAY}"></label></div><label class="field"><span>Source (obligatoire)</span><input class="inp" name="source" required placeholder="Ex. : bulletin de prix de mon organisme stockeur"></label><div class="note">${ic('info')}<span>Le prix saisi devient le cours de référence s’il est le plus récent ; la source est affichée partout où il est utilisé.</span></div>`, onSubmit: f => { if (!(+f.prix > 0) || !f.source) throw new Error('Prix et source requis'); c.points = c.points.filter(p => p.date !== f.date); c.points.push({ date: f.date, prix: +f.prix, source: f.source }); c.points.sort((a, b) => a.date.localeCompare(b.date)); c.manuels = c.manuels || []; c.manuels.push({ date: f.date, prix: +f.prix, source: f.source }); if (c.points[c.points.length - 1].date === f.date) { c.source = `Saisie manuelle — ${f.source}`; c.type = 'manuel'; } commit('Prix enregistré'); } }); };

/* =========================== PARC MATÉRIEL =========================== */
VIEWS.materiel = () => {
  const cat = UI.f.matCat || ''; const ms = S.materiel.filter(m => !cat || m.cat === cat);
  const camp = Math.min(PREFS.camp, CURRENT_CAMP - 1);
  const val = sum(S.materiel, m => valeurMateriel(m)), annuel = sum(S.materiel, m => coutHoraire(m, camp).annuel);
  const maintC = sum(S.materiel, m => maintCost(m, camp));
  const alerts = S.materiel.filter(m => { const n = nextMaintenance(m); return n && n.urgence !== 'ok'; });
  return `${demoBar('Parc matériel de démonstration ; valeurs de revente estimées par un modèle de décote simplifié, à titre indicatif.')}
  <div class="grid g-kpi mb">${kpi('tractor', 'Valeur estimée du parc', eur(val), `${S.materiel.length} équipements <span class="badge est">indicatif</span>`)}${kpi('euro', `Coût annuel ${campLabel(camp)}`, eur(annuel), 'amortissement + assurance + entretien')}${kpi('settings', `Entretien et réparations`, eur(maintC), `campagne ${campLabel(camp)}`, '', 'warn')}${kpi('alert', 'Entretiens à prévoir', alerts.length, alerts.map(m => esc(m.modele)).slice(0, 2).join(', ') || 'Aucun', '', alerts.length ? 'danger' : '')}</div>
  <div class="row wrap mb toolbar"><div class="chips"><span class="chip ${!cat ? 'on' : ''}" data-a="matCat" data-c="">Tous</span>${Object.entries(MAT_CATS).filter(([k]) => S.materiel.some(m => m.cat === k)).map(([k, l]) => `<span class="chip ${cat === k ? 'on' : ''}" data-a="matCat" data-c="${k}">${l}</span>`).join('')}</div><span class="sp"></span>${pa([{ a: 'newMat', i: 'plus', l: 'Équipement', primary: true }])}</div>
  <div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(280px,1fr))">${ms.map(m => { const n = nextMaintenance(m); const ch = coutHoraire(m, camp); return `<div class="card pad" data-a="openMat" data-id="${m.id}" style="cursor:pointer"><div class="row"><div class="kpi-ic">${ic('tractor')}</div><div style="min-width:0"><div class="b">${esc(m.marque)} ${esc(m.modele)}</div><div class="small muted">${MAT_CATS[m.cat]}${m.annee ? ` · ${m.annee}` : ''}${m.puissance ? ` · ${m.puissance} ch` : ''}</div></div></div>
    <div class="grid2 mt" style="gap:8px"><div><div class="small muted">${isEngine(m) ? 'Compteur' : 'Utilisation cumulée'}</div><b class="num">${nf(isEngine(m) ? m.heures : m.heuresUsage, 0)} h</b></div><div><div class="small muted">Valeur estimée</div><b class="num">${m.prixAchat ? eur(valeurMateriel(m)) : '<span class="badge warn">À compléter</span>'}</b></div><div><div class="small muted">Coût horaire</div><b class="num">${eur(ch.horaire, 2)}/h</b></div><div><div class="small muted">Entretien cumulé</div><b class="num">${eur(sum(m.maintenance, e => e.coutPieces + e.coutMO))}</b></div></div>
    ${n ? `<div class="row mt small"><span class="badge ${n.urgence === 'ok' ? '' : n.urgence}">${ic('calendar')} ${esc(n.label)} · ${esc(n.echeance)}</span></div>` : ''}</div>`; }).join('')}</div>`;
};
ACT.matCat = d => { UI.f.matCat = d.c; render(); };
ACT.openMat = d => openDrawer('materiel', d.id);
DRAWERS.materiel = id => {
  const m = byId('materiel', id); if (!m) return null;
  const t = UI.drawer.tab || 'id'; const camp = Math.min(PREFS.camp, CURRENT_CAMP - 1);
  let body = tabsBar('dm', [['id', 'Identification'], ['eco', 'Économie'], ['maint', 'Maintenance'], ['pannes', 'Pannes']], t, true);
  if (t === 'id') {
    body += `<div class="card pad"><div class="kv">${[['Catégorie', MAT_CATS[m.cat]], ['Marque', m.marque], ['Modèle', m.modele], ['Année', m.annee || '—'], ['N° de série', m.serie || '—'], ['Immatriculation', m.immat || '—'], [isEngine(m) ? 'Heures compteur' : 'Heures d’utilisation', `${nf(isEngine(m) ? m.heures : m.heuresUsage, 1)} h`], ['Puissance', m.puissance ? `${m.puissance} ch` : '—'], ['Date d’achat', dfr(m.dateAchat)], ['Consommation', m.conso ? `${m.conso} L/h` : '—'], ['État', { excellent: 'Excellent', bon: 'Bon', moyen: 'Moyen', mauvais: 'Mauvais' }[m.etat]]].map(([k, v]) => `<div><span>${k}</span><b>${esc(v)}</b></div>`).join('')}</div></div>
    ${isEngine(m) ? '<div class="formula">Le compteur augmente automatiquement avec les heures des interventions réalisées.</div>' : ''}
    <div class="row wrap mt"><button class="btn" data-a="editMat" data-id="${m.id}">${ic('edit')} Modifier</button><button class="btn" data-a="setHours" data-id="${m.id}">${ic('clock')} Relevé compteur</button><span class="sp"></span><button class="btn g d" data-a="delMat" data-id="${m.id}">${ic('trash')}</button></div>`;
  } else if (t === 'eco') {
    const ch = coutHoraire(m, camp), est = estimationRevente(m);
    const hist = [...m.historiqueValeur, { date: TODAY, valeur: valeurMateriel(m) }];
    body += `<div class="card pad"><b>Coût de revient — campagne ${campLabel(camp)}</b><div class="mt">${[['Prix d’achat', eur(m.prixAchat)], [`Amortissement économique (80 % sur ${m.dureeAmort} ans)`, eur(ch.amort)], ['Assurance (0,6 % du prix)', eur(ch.assurance)], ['Entretien et réparations', eur(ch.entretien)], ['Coût annuel', eur(ch.annuel)], ['Heures retenues', `${nf(ch.heures, 0)} h`], ['Coût horaire (hors carburant)', `${eur(ch.horaire, 2)}/h`], ['Carburant', m.conso ? `${m.conso} L/h, compté en intrant GNR` : '—']].map(([k, v]) => `<div class="stat-line"><span>${k}</span><b>${v}</b></div>`).join('')}</div>
    <div class="formula">Coût horaire = (amortissement + assurance + entretien/réparations) ÷ heures d’utilisation de la campagne (heures de référence ${m.heuresAn} h/an si la campagne est incomplète).</div></div>
    <div class="card pad mt"><div class="row"><b>Valeur de revente</b><span class="sp"></span><span class="badge est">estimation indicative</span></div><div class="kpi-v mt">${eur(valeurMateriel(m))}</div>${m.valeurManuelle != null ? '<div class="small muted">Valeur saisie manuellement</div>' : ''}
    <div class="formula">Modèle : ${eur(m.prixAchat)} × (1 − ${nf(est.taux * 100, 1)} %)^${nfx(est.age, 1)} ans × facteur heures ${nfx(est.fh, 3)} × facteur état ${nfx(est.fe, 2)} = ${eur(est.valeur)}${!m.annee ? '\nAnnée non renseignée : ajoutez-la pour tenir compte de l’âge.' : ''}${!m.prixAchat ? '\nPrix d’achat non renseigné : estimation impossible.' : ''}
Non contractuel. Pourra être alimenté ultérieurement par des sources de marché d’occasion.</div>
    <form data-f="matVal" data-id="${m.id}" class="grid2 mt"><label class="field"><span>État</span><select class="inp" name="etat">${opts([['excellent', 'Excellent'], ['bon', 'Bon'], ['moyen', 'Moyen'], ['mauvais', 'Mauvais']], m.etat)}</select></label><label class="field"><span>Valeur manuelle (€)</span><input class="inp" type="number" name="val" value="${m.valeurManuelle ?? ''}" placeholder="Vide = estimation"></label><button class="btn p" style="grid-column:1/-1">Mettre à jour</button></form></div>
    ${hist.length > 1 ? card('Historique de valorisation', lineChart({ series: [{ name: 'Valeur', color: 'var(--primary)', points: hist.map(h => ({ x: h.date, y: h.valeur })) }], fmt: v => keur(v), xfmt: s => D(s).getFullYear(), ticks: Math.min(hist.length, 4), height: 180 }), { cls: 'mt' }) : ''}`;
  } else {
    const list = m.maintenance.filter(e => t === 'maint' || e.type === 'reparation').sort((a, b) => b.date.localeCompare(a.date));
    const n = nextMaintenance(m);
    body += `${t === 'maint' ? `<div class="card pad mb"><div class="row"><b>Prochain entretien</b><span class="sp"></span><button class="btn sm" data-a="setNext" data-id="${m.id}">${ic('edit')} Planifier</button></div>${n ? `<div class="row mt"><span class="badge ${n.urgence === 'ok' ? '' : n.urgence}">${esc(n.echeance)}</span><span>${esc(n.label)} ${n.heures != null ? `à ${nf(n.heures)} h` : `le ${dfr(n.date)}`}</span></div>` : '<div class="muted small mt">Aucun entretien planifié</div>'}</div>` : `<div class="grid g-2 mb">${kpi('alert', 'Pannes', list.length, 'enregistrées')}${kpi('clock', 'Immobilisation', `${sum(list, e => e.immobilisation)} j`, `coût ${eur(sum(list, e => e.coutPieces + e.coutMO))}`)}</div>`}
    <div class="row mb"><span class="sp"></span><button class="btn p sm" data-a="addMaint" data-id="${m.id}" data-t="${t === 'pannes' ? 'reparation' : 'entretien'}">${ic('plus')} ${t === 'pannes' ? 'Déclarer une panne' : 'Entretien'}</button></div>
    ${list.map(e => `<div class="card pad mb"><div class="row"><span class="badge ${e.type === 'reparation' ? 'danger' : e.type === 'controle' ? 'info' : ''}">${MAINT_TYPES[e.type]}</span><b>${esc(e.titre)}</b><span class="sp"></span><span class="small muted">${dfr(e.date)}</span></div>
    ${e.description ? `<p class="small" style="margin:8px 0 0">${esc(e.description)}</p>` : ''}<div class="kv mt">${[['Pièces', e.pieces || '—'], ['Prestataire', e.prestataire || '—'], ['Coût pièces', eur(e.coutPieces)], ['Main-d’œuvre', eur(e.coutMO)], ['Immobilisation', `${e.immobilisation || 0} j`]].map(([k, v]) => `<div><span>${k}</span><b>${esc(v)}</b></div>`).join('')}</div>${e.commentaire ? `<div class="small muted mt">${esc(e.commentaire)}</div>` : ''}${e.photos?.length ? `<div class="photos mt">${e.photos.map(p => `<img src="${p}">`).join('')}</div>` : ''}</div>`).join('') || '<div class="empty">Aucun enregistrement</div>'}`;
  }
  return { title: `${esc(m.marque)} ${esc(m.modele)}`, body };
};
FORMS.matVal = (f, form) => { const m = byId('materiel', form.dataset.id); m.etat = f.etat; m.valeurManuelle = f.val === '' ? null : +f.val; commit('Valorisation mise à jour'); };
ACT.addMaint = d => openModal({
  title: `${d.t === 'reparation' ? 'Panne / réparation' : 'Entretien'} · ${esc(matName(d.id))}`, wide: true, body: `<div class="grid3"><label class="field"><span>Type</span><select class="inp" name="type">${opts(Object.entries(MAINT_TYPES), d.t)}</select></label><label class="field"><span>Date</span><input class="inp" type="date" name="date" value="${TODAY}"></label><label class="field"><span>Immobilisation (jours)</span><input class="inp" type="number" name="immobilisation" value="0" min="0"></label></div>
  <label class="field"><span>${d.t === 'reparation' ? 'Nature du problème' : 'Intitulé'}</span><input class="inp" name="titre" required value="${esc(d.titre || '')}"></label><label class="field"><span>Description</span><textarea class="inp" name="description"></textarea></label>
  <div class="grid2"><label class="field"><span>Pièces remplacées</span><input class="inp" name="pieces"></label><label class="field"><span>Fournisseur / réparateur</span><input class="inp" name="prestataire"></label></div>
  <div class="grid2"><label class="field"><span>Coût des pièces HT (€)</span><input class="inp" type="number" step="0.01" name="coutPieces" value="0"></label><label class="field"><span>Coût main-d’œuvre HT (€)</span><input class="inp" type="number" step="0.01" name="coutMO" value="0"></label></div>
  <label class="field"><span>Commentaires</span><input class="inp" name="commentaire"></label><label class="field"><span>Photos</span><input class="inp" type="file" name="ph" accept="image/*" multiple style="padding-top:8px"></label>
  <div class="note">${ic('info')}<span>Le coût total est enregistré automatiquement en charge (entretien ou réparations).</span></div>`,
  onSubmit: (f, form) => { if (!f.titre) throw new Error('Intitulé requis'); const files = [...form.ph.files]; Promise.all(files.slice(0, 4).map(x => downscale(x))).then(photos => { recordMaintenance(d.id, { ...f, photos }); commit('Enregistré'); }); }
});
ACT.setNext = d => { const m = byId('materiel', d.id); const p = m.prochain || {}; openModal({ title: 'Planifier le prochain entretien', body: `<label class="field"><span>Intitulé</span><input class="inp" name="label" value="${esc(p.label || '')}" required></label><div class="grid2"><label class="field"><span>À (heures compteur)</span><input class="inp" type="number" name="heures" value="${p.heures ?? ''}"></label><label class="field"><span>ou à la date</span><input class="inp" type="date" name="date" value="${p.date || ''}"></label></div>`, onSubmit: f => { if (!f.label || (!f.heures && !f.date)) throw new Error('Intitulé et échéance requis'); m.prochain = { label: f.label, heures: f.heures ? +f.heures : null, date: f.heures ? null : f.date }; commit('Entretien planifié'); } }); };
ACT.setHours = d => { const m = byId('materiel', d.id); openModal({ title: 'Relevé du compteur', body: `<label class="field"><span>Heures compteur</span><input class="inp" type="number" step="0.1" name="h" value="${m.heures}"></label>`, onSubmit: f => { m.heures = +f.h; commit('Compteur mis à jour'); } }); };
ACT.delMat = d => openModal({ title: 'Supprimer cet équipement ?', body: '<p>Son historique d’entretien sera supprimé. Les charges déjà enregistrées sont conservées.</p>', submit: 'Supprimer', onSubmit: () => { S.materiel = S.materiel.filter(m => m.id !== d.id); closeDrawer(); commit('Équipement supprimé'); } });
ACT.newMat = () => matForm(null);
ACT.editMat = d => matForm(d.id);
function matForm(id) {
  const m = id ? byId('materiel', id) : { cat: 'tracteur', annee: null, etat: 'bon', dureeAmort: 10, heuresAn: 400, conso: 0, heures: 0 };
  openModal({
    title: id ? 'Modifier l’équipement' : 'Nouvel équipement', wide: true, body: `<div class="grid3"><label class="field"><span>Catégorie</span><select class="inp" name="cat">${opts(Object.entries(MAT_CATS), m.cat)}</select></label><label class="field"><span>Marque</span><input class="inp" name="marque" required value="${esc(m.marque || '')}"></label><label class="field"><span>Modèle</span><input class="inp" name="modele" required value="${esc(m.modele || '')}"></label></div>
    <div class="grid3"><label class="field"><span>Année</span><input class="inp" type="number" name="annee" value="${m.annee ?? ''}" placeholder="Facultatif"></label><label class="field"><span>N° de série</span><input class="inp" name="serie" value="${esc(m.serie || '')}"></label><label class="field"><span>Immatriculation</span><input class="inp" name="immat" value="${esc(m.immat || '')}"></label></div>
    <div class="grid3"><label class="field"><span>Heures compteur</span><input class="inp" type="number" name="heures" value="${m.heures}"></label><label class="field"><span>Puissance (ch)</span><input class="inp" type="number" name="puissance" value="${m.puissance ?? ''}"></label><label class="field"><span>Consommation (L/h)</span><input class="inp" type="number" step="0.1" name="conso" value="${m.conso}"></label></div>
    <div class="grid3"><label class="field"><span>Date d’achat</span><input class="inp" type="date" name="dateAchat" value="${m.dateAchat || ''}"></label><label class="field"><span>Prix d’achat HT (€)</span><input class="inp" type="number" name="prixAchat" placeholder="Pour les coûts" value="${m.prixAchat ?? ''}"></label><label class="field"><span>Durée d’amortissement (ans)</span><input class="inp" type="number" name="dureeAmort" value="${m.dureeAmort}"></label></div>
    <div class="grid2"><label class="field"><span>Utilisation de référence (h/an)</span><input class="inp" type="number" name="heuresAn" value="${m.heuresAn}"></label><label class="field"><span>État</span><select class="inp" name="etat">${opts([['excellent', 'Excellent'], ['bon', 'Bon'], ['moyen', 'Moyen'], ['mauvais', 'Mauvais']], m.etat)}</select></label></div>`,
    onSubmit: f => { if (!f.marque) throw new Error('Marque requise'); const n = { cat: f.cat, marque: f.marque, modele: f.modele, annee: +f.annee || null, serie: f.serie, immat: f.immat, heures: +f.heures || 0, puissance: +f.puissance || null, conso: +f.conso || 0, dateAchat: f.dateAchat, prixAchat: +f.prixAchat || 0, dureeAmort: +f.dureeAmort || 10, heuresAn: +f.heuresAn || 100, etat: f.etat }; if (id) Object.assign(m, n); else S.materiel.push({ id: uid('mat'), ...n, valeurManuelle: null, maintenance: [], prochain: null, historiqueValeur: [], heuresUsage: 0 }); commit(id ? 'Équipement modifié' : 'Équipement ajouté'); }
  });
}

/* =========================== ADMINISTRATIF ET PAC =========================== */
const PAC_ST = { preparation: ['En préparation — non transmise', 'warn'], declaree_exploitant: ['Déclarée (statut saisi par l’exploitant)', 'info'], a_deposer: ['Prête à déposer', 'ok'] };
VIEWS.pac = () => {
  const t = tab('pac', 'prep');
  return `${demoBar('Données PAC de démonstration : numéros, îlots et échéances fictifs ou indicatifs, à vérifier sur les sources officielles.')}
  ${tabsBar('pac', [['prep', `Préparation ${campLabel(CURRENT_CAMP)}`], ['ilots', 'Îlots et parcelles'], ['echeances', 'Échéances'], ['historique', 'Historique'], ['docs', 'Justificatifs']], t)}
  ${{ prep: pacPrep, ilots: pacIlots, echeances: pacEch, historique: pacHist, docs: pacDocs }[t]()}`;
};
function pacPrep() {
  const c = S.pac.campagnes[CURRENT_CAMP] || { statut: 'preparation' }; const ck = S.pac.checklist[CURRENT_CAMP] || (S.pac.checklist[CURRENT_CAMP] = {});
  const rec = {}; S.parcelles.forEach(p => { const r = p.cultures[CURRENT_CAMP]; const k = r ? r.culture : '_none'; rec[k] = (rec[k] || 0) + p.surface; });
  const steps = [['parcelles', 'Contrôler le parcellaire (contours, surfaces, îlots)'], ['cultures', 'Vérifier les cultures déclarées pour chaque parcelle'], ['surfaces', 'Rapprocher surfaces graphiques et surfaces déclarées'], ['justificatifs', 'Rassembler les justificatifs (baux, attestations…)'], ['export', 'Exporter le récapitulatif pour la saisie'], ['depot', 'Déposer la déclaration sur la plateforme officielle (hors AGRI PILOT)']];
  const ecarts = S.parcelles.filter(p => Math.abs(areaHa(p.coords) - p.surface) > 0.05);
  return `<div class="card pad mb"><div class="row wrap"><div class="kpi-ic">${ic('landmark')}</div><div><b>Déclaration PAC ${CURRENT_CAMP}</b><div class="small muted">N° PACAGE ${esc(S.exploitation.pacage)}</div></div><span class="sp"></span><span class="badge ${PAC_ST[c.statut][1]}">${PAC_ST[c.statut][0]}</span></div>
  <div class="note warn mt">${ic('alert')}<span>AGRI PILOT <b>ne transmet aucune déclaration</b>. Il prépare et exporte vos données ; le dépôt et la validation se font sur la plateforme officielle. Le statut « déposée » ne peut être indiqué que par vous, après confirmation de dépôt.</span></div></div>
  <div class="grid g-2">${card('Assistant de préparation', `<div class="list">${steps.map(([k, l], i) => `<div class="li" data-a="pacCk" data-k="${k}"><div class="ic ${ck[k] ? 'ok' : ''}">${ck[k] ? ic('check') : `<b>${i + 1}</b>`}</div><div class="tx"><b style="${ck[k] ? 'text-decoration:line-through;color:var(--muted)' : ''}">${l}</b></div></div>`).join('')}</div>
  <div class="bar mt"><i style="width:${Object.values(ck).filter(Boolean).length / steps.length * 100}%"></i></div>
  <div class="row wrap mt"><button class="btn" data-a="pacStatus">${ic('edit')} Renseigner le statut</button></div>`)}
  ${card('Récapitulatif des cultures déclarées', `<div class="tbl-wrap"><table class="t"><thead><tr><th>Code</th><th>Culture</th><th class="n">Surface</th></tr></thead><tbody>${Object.entries(rec).sort((a, b) => b[1] - a[1]).map(([k, v]) => `<tr><td class="b">${CULTURES[k]?.pac || '—'}</td><td>${k === '_none' ? '<span class="badge warn">Non renseignée</span>' : esc(CULTURES[k]?.nom)}</td><td class="n">${nf(v, 2)} ha</td></tr>`).join('')}</tbody><tfoot><tr><td></td><td>Total</td><td class="n">${nf(surfaceTotale(), 2)} ha</td></tr></tfoot></table></div>
  <div class="formula">Codes cultures indicatifs (démo), à contrôler avec la nomenclature officielle de la campagne.</div>
  <div class="row wrap mt"><button class="btn p" data-a="pacCsv">${ic('copy')} Copier le récapitulatif (CSV)</button><button class="btn" data-a="pacGeo">${ic('copy')} Copier les contours (GeoJSON)</button></div>`)}</div>
  ${ecarts.length ? `<div class="note warn mt">${ic('alert')}<span>${ecarts.length} parcelle(s) présentent un écart > 0,05 ha entre surface déclarée et surface graphique : ${ecarts.map(p => `<a href="#parcellaire" data-a="openParc" data-id="${p.id}">${esc(p.nom)}</a> (${nf(p.surface, 2)} / ${nf(areaHa(p.coords), 2)} ha)`).join(', ')}.</span></div>` : ''}
  <div class="card pad mt"><b>Intégrations prévues</b><div class="small muted mt">L’architecture expose une couche d’export (CSV, GeoJSON) et un point d’intégration unique pour les futurs services officiels disponibles (import des îlots et parcelles de la campagne précédente, référentiels de cultures). Aucune connexion n’est active à ce stade.</div></div>`;
}
ACT.pacCk = d => { const ck = S.pac.checklist[CURRENT_CAMP]; ck[d.k] = !ck[d.k]; commit(); };
ACT.pacStatus = () => { const c = S.pac.campagnes[CURRENT_CAMP] || (S.pac.campagnes[CURRENT_CAMP] = { statut: 'preparation' }); openModal({ title: `Statut de la déclaration ${CURRENT_CAMP}`, body: `<label class="field"><span>Statut</span><select class="inp" name="statut">${opts([['preparation', 'En préparation — non transmise'], ['a_deposer', 'Prête à déposer'], ['declaree_exploitant', 'Déposée par moi sur la plateforme officielle']], c.statut)}</select></label><label class="field"><span>Date de dépôt (si déposée)</span><input class="inp" type="date" name="date" value="${c.dateDepot || ''}"></label><div class="note">${ic('info')}<span>Ce statut est une information que vous renseignez ; AGRI PILOT ne vérifie pas le dépôt. Pensez à archiver l’accusé de réception dans les justificatifs.</span></div>`, onSubmit: f => { if (f.statut === 'declaree_exploitant' && !f.date) throw new Error('Indiquez la date de dépôt'); c.statut = f.statut; c.dateDepot = f.date || null; c.note = f.statut === 'declaree_exploitant' ? 'Statut renseigné manuellement par l’exploitant.' : c.note; commit('Statut mis à jour'); } }); };
ACT.pacCsv = () => { copyText(toCSV([['Ilot', 'N° parcelle', 'Nom', 'Commune', 'Code culture', 'Culture', 'Variété', 'Surface (ha)', 'Surface graphique (ha)'], ...S.parcelles.sort((a, b) => a.ilot - b.ilot).map(p => { const c = p.cultures[CURRENT_CAMP]; return [p.ilot, p.numPac, p.nom, p.commune, CULTURES[c?.culture]?.pac || '', CULTURES[c?.culture]?.nom || '', c?.variete || '', String(p.surface).replace('.', ','), String(areaHa(p.coords)).replace('.', ',')]; })]), 'Récapitulatif PAC copié (CSV)'); const ck = S.pac.checklist[CURRENT_CAMP]; if (ck) { ck.export = true; saveState(); } };
ACT.pacGeo = () => { const prov = S.parcelles.filter(p => p.contourProvisoire).length; if (prov) toast(`${prov} parcelle(s) sans contour dessiné exclue(s) de l’export`, 'warn'); copyText(JSON.stringify({ type: 'FeatureCollection', features: S.parcelles.filter(p => !p.contourProvisoire).map(p => ({ type: 'Feature', properties: { nom: p.nom, ilot: p.ilot, num_parcelle: p.numPac, surface: p.surface, culture: CULTURES[p.cultures[CURRENT_CAMP]?.culture]?.pac || null, commune: p.commune }, geometry: { type: 'Polygon', coordinates: [[...p.coords, p.coords[0]].map(([la, ln]) => [ln, la])] } })) }), 'Contours copiés (GeoJSON)'); };
function pacIlots() {
  const ilots = [...new Set(S.parcelles.map(p => p.ilot))].sort((a, b) => a - b);
  return `<div class="card"><div class="tbl-wrap"><table class="t"><thead><tr><th>Îlot</th><th>N° parcelle</th><th>Parcelle</th><th>Commune</th><th>Code culture</th><th class="n">Surface déclarée</th><th class="n">Surface graphique</th></tr></thead><tbody>
  ${ilots.map(il => { const ps = S.parcelles.filter(p => p.ilot === il); return ps.map((p, i) => `<tr data-a="openParc" data-id="${p.id}">${i === 0 ? `<td rowspan="${ps.length}" class="b" style="vertical-align:top">Îlot ${il}<div class="cell-sub">${nf(sum(ps, x => x.surface), 2)} ha</div></td>` : ''}<td>${esc(p.numPac || '—')}</td><td class="cell-main">${esc(p.nom)}</td><td>${esc(p.commune)}</td><td>${CULTURES[p.cultures[CURRENT_CAMP]?.culture]?.pac || '—'}</td><td class="n">${nf(p.surface, 2)} ha</td><td class="n">${nf(areaHa(p.coords), 2)} ha</td></tr>`).join(''); }).join('')}
  </tbody></table></div></div>`;
}
function pacEch() {
  const list = [...S.echeances].sort((a, b) => a.date.localeCompare(b.date));
  return `<div class="row mb"><span class="sp"></span>${pa([{ a: 'newEch', i: 'plus', l: 'Échéance', primary: true }])}</div><div class="card"><div class="card-b"><div class="list">${list.map(e => { const j = daysBetween(TODAY, e.date); const u = e.fait ? 'ok' : j < 0 ? 'danger' : j <= 30 ? 'warn' : ''; return `<div class="li"><button class="switch ${e.fait ? 'on' : ''}" data-a="echDone" data-id="${e.id}" aria-label="Fait"></button><div class="tx"><b style="${e.fait ? 'text-decoration:line-through;color:var(--muted)' : ''}">${esc(e.titre)}</b><span>${esc(e.cat)} · ${dfr(e.date)} — ${esc(e.note || '')}</span></div><span class="badge ${u}">${e.fait ? 'Fait' : j < 0 ? `dépassée (${-j} j)` : `J−${j}`}</span><button class="btn xs g" data-a="delEch" data-id="${e.id}">${ic('trash')}</button></div>`; }).join('') || '<div class="empty">Aucune échéance</div>'}</div></div></div>`;
}
ACT.echDone = d => { const e = S.echeances.find(x => x.id === d.id); e.fait = !e.fait; commit(); };
ACT.delEch = d => { S.echeances = S.echeances.filter(x => x.id !== d.id); commit('Échéance supprimée'); };
ACT.newEch = () => openModal({ title: 'Nouvelle échéance', body: `<label class="field"><span>Intitulé</span><input class="inp" name="titre" required></label><div class="grid2"><label class="field"><span>Date</span><input class="inp" type="date" name="date" required></label><label class="field"><span>Catégorie</span><select class="inp" name="cat">${opts([['PAC', 'PAC'], ['Réglementaire', 'Réglementaire'], ['Matériel', 'Matériel'], ['Contrats', 'Contrats'], ['Autre', 'Autre']], 'PAC')}</select></label></div><label class="field"><span>Note</span><input class="inp" name="note"></label>`, onSubmit: f => { if (!f.titre || !f.date) throw new Error('Intitulé et date requis'); S.echeances.push({ id: uid('e'), ...f, fait: false }); commit('Échéance ajoutée'); } });
function pacHist() {
  return `<div class="grid g-3">${Object.entries(S.pac.campagnes).sort((a, b) => b[0] - a[0]).map(([c, x]) => { const ass = assolement(+c); return card(`PAC ${c}`, `<span class="badge ${PAC_ST[x.statut][1]}">${PAC_ST[x.statut][0]}</span>${x.dateDepot ? `<div class="small mt">Dépôt indiqué le ${dfr(x.dateDepot)}</div>` : ''}<div class="small muted mt">${esc(x.note || '')}</div><div class="hr"></div>${ass.map(a => `<div class="stat-line"><span><i class="dotc" style="background:${a.color}"></i> ${esc(a.label)}</span><b>${nf(a.value, 1)} ha</b></div>`).join('')}`); }).join('')}</div>`;
}
function pacDocs() { return docTable(S.documents.filter(d => d.cat === 'PAC' || d.cat === 'Réglementaire')); }

/* =========================== DOCUMENTS =========================== */
const DOC_CATS = ['PAC', 'Réglementaire', 'Contrats', 'Factures', 'Matériel', 'Analyses', 'Autre'];
VIEWS.documents = () => {
  const c = UI.f.docCat || '';
  return `${demoBar('Documents de démonstration : seules les métadonnées existent (aucun fichier réel attaché).')}
  <div class="row wrap mb toolbar"><div class="chips"><span class="chip ${!c ? 'on' : ''}" data-a="docCat" data-c="">Tous · ${S.documents.length}</span>${DOC_CATS.map(k => `<span class="chip ${c === k ? 'on' : ''}" data-a="docCat" data-c="${k}">${k} · ${S.documents.filter(d => d.cat === k).length}</span>`).join('')}</div><span class="sp"></span>${pa([{ a: 'newDoc', i: 'upload', l: 'Ajouter', primary: true }])}</div>
  ${docTable(S.documents.filter(d => !c || d.cat === c))}
  <div class="formula">Dans cette version, les fichiers ajoutés sont consultables pendant la session ; le stockage sécurisé des pièces sur serveur arrive avec l’étape 2 (authentification et base de données).</div>`;
};
function docTable(list) {
  return `<div class="card"><div class="tbl-wrap"><table class="t"><thead><tr><th>Document</th><th>Catégorie</th><th>Campagne</th><th>Date</th><th>Statut</th><th></th></tr></thead><tbody>
  ${[...list].sort((a, b) => b.date.localeCompare(a.date)).map(d => `<tr><td><div class="row">${ic('file')}<div><div class="cell-main">${esc(d.nom)}</div><div class="cell-sub">${d.fichier ? `${esc(d.fichier)} · ${nf(d.taille / 1024)} ko` : d.demo ? 'démo — aucun fichier' : 'aucun fichier'}</div></div></div></td><td><span class="badge">${esc(d.cat)}</span></td><td>${d.campagne ? campLabel(d.campagne) : '—'}</td><td>${dfr(d.date)}</td><td><button class="badge ${d.statut === 'a_completer' ? 'warn' : 'ok'}" style="border:0;cursor:pointer" data-a="docSt" data-id="${d.id}">${d.statut === 'a_completer' ? 'À compléter' : 'Archivé'}</button></td><td class="n">${d.url ? `<a class="btn xs" href="${d.url}" target="_blank" rel="noopener">Ouvrir</a>` : ''}<button class="btn xs g" data-a="delDoc" data-id="${d.id}">${ic('trash')}</button></td></tr>`).join('') || '<tr><td colspan="6" class="empty">Aucun document</td></tr>'}
  </tbody></table></div></div>`;
}
ACT.docCat = d => { UI.f.docCat = d.c; render(); };
ACT.docSt = d => { const x = S.documents.find(y => y.id === d.id); x.statut = x.statut === 'a_completer' ? 'archive' : 'a_completer'; commit(); };
ACT.delDoc = d => { S.documents = S.documents.filter(x => x.id !== d.id); commit('Document supprimé'); };
ACT.newDoc = () => openModal({ title: 'Ajouter un document', body: `<label class="field"><span>Fichier</span><input class="inp" type="file" name="f" style="padding-top:8px"></label><label class="field"><span>Nom</span><input class="inp" name="nom" placeholder="Par défaut : nom du fichier"></label><div class="grid3"><label class="field"><span>Catégorie</span><select class="inp" name="cat">${opts(DOC_CATS.map(c => [c, c]), UI.f.docCat || 'PAC')}</select></label><label class="field"><span>Campagne</span><select class="inp" name="campagne">${opts([2025, 2026, 2027].map(c => [c, campLabel(c)]), CURRENT_CAMP)}</select></label><label class="field"><span>Statut</span><select class="inp" name="statut">${opts([['archive', 'Archivé'], ['a_completer', 'À compléter']], 'archive')}</select></label></div>`, onSubmit: (f, form) => { const file = form.f.files[0]; const nom = f.nom || file?.name; if (!nom) throw new Error('Fichier ou nom requis'); S.documents.push({ id: uid('doc'), nom, cat: f.cat, date: TODAY, campagne: +f.campagne, statut: f.statut, fichier: file?.name || null, taille: file?.size || null, url: file ? URL.createObjectURL(file) : null }); commit('Document ajouté'); } });

/* =========================== PARAMÈTRES =========================== */
VIEWS.parametres = () => `
  <div class="grid g-2">
  ${card('Apparence', `<div class="widget-ctl"><span class="sp">Mode sombre</span><button class="switch ${PREFS.theme === 'dark' ? 'on' : ''}" data-a="theme"></button></div><div class="widget-ctl" style="border:0"><span class="sp">Tableau de bord</span><button class="btn sm" data-a="customize">${ic('grid')} Personnaliser</button></div>`)}
  ${card('Utilisateurs et droits', `<div class="list">${S.users.map(u => `<div class="li"><div class="ic">${ic('users')}</div><div class="tx"><b>${esc(u.nom)}</b><span>${esc(u.email)}</span></div><select class="inp" style="width:auto;height:34px" data-ch="userRole" data-id="${u.id}">${opts(['Administrateur', 'Saisie terrain', 'Lecture seule'].map(r => [r, r]), u.role)}</select></div>`).join('')}</div>
    <div class="note mt">${ic('lock')}<span>Rôles prévus : <b>Administrateur</b> (tout), <b>Saisie terrain</b> (interventions, stocks), <b>Lecture seule</b> (comptable, conseiller). L’authentification sécurisée et l’application des droits côté serveur arrivent à l’étape 2.</span></div>`, { right: `<button class="btn sm" data-a="addUser">${ic('plus')}</button>` })}
  ${card('Données', `<div class="list">
    <div class="li"><div class="ic">${ic('copy')}</div><div class="tx"><b>Exporter toutes les données (JSON)</b><span>Sauvegarde complète copiée dans le presse-papiers</span></div><button class="btn sm" data-a="exportAll">Copier</button></div>
    <div class="li"><div class="ic">${ic('upload')}</div><div class="tx"><b>Restaurer une sauvegarde</b><span>Coller un export JSON</span></div><button class="btn sm" data-a="importAll">Restaurer</button></div>
    <div class="li"><div class="ic">${ic('sparkles')}</div><div class="tx"><b>Explorer la démonstration</b><span>Charge une exploitation fictive complète (remplace vos données)</span></div><button class="btn sm" data-a="loadDemo">Charger</button></div>
    <div class="li"><div class="ic danger">${ic('farm')}</div><div class="tx"><b>Configurer une nouvelle ferme</b><span>Relance l’assistant de configuration (remplace vos données)</span></div><button class="btn sm d" data-a="reconfigure">Configurer</button></div>
  </div><div class="formula">Enregistrement : ${saveState() ? 'local dans ce navigateur (fonctionne hors connexion)' : 'en mémoire uniquement (stockage local indisponible)'}. La synchronisation serveur et les sauvegardes régulières arrivent avec l’étape 2.</div>`)}
  ${card('Feuille de route et intégrations', `<div class="list small">${[['Étape 1', 'Interface complète, données de démonstration, liaisons entre modules', 'ok', 'Livrée'], ['Étape 2', 'Authentification, base de données relationnelle, multi-exploitation, droits', '', 'À venir'], ['Étape 3–5', 'Modules opérationnels sur serveur, synchronisation hors ligne', '', 'À venir'], ['Étape 6', 'Imports Telepac, sources de cours identifiées, fonds cartographiques, météo', '', 'À venir'], ['Étape 7', 'Assistant IA conversationnel sur vos données', '', 'À venir']].map(([e, t, u, s]) => `<div class="li"><div class="ic ${u}">${u ? ic('check') : ic('clock')}</div><div class="tx"><b>${e}</b><span>${t}</span></div><span class="badge ${u}">${s}</span></div>`).join('')}</div>`)}
  </div>`;
CH.userRole = el => { S.users.find(u => u.id === el.dataset.id).role = el.value; commit('Rôle mis à jour'); };
ACT.addUser = () => openModal({ title: 'Inviter un utilisateur', body: `<label class="field"><span>Nom</span><input class="inp" name="nom" required></label><label class="field"><span>E-mail</span><input class="inp" type="email" name="email" required></label><label class="field"><span>Rôle</span><select class="inp" name="role">${opts(['Administrateur', 'Saisie terrain', 'Lecture seule'].map(r => [r, r]), 'Saisie terrain')}</select></label><div class="note">${ic('info')}<span>Aucune invitation n’est envoyée à ce stade : l’envoi et la connexion arrivent avec l’étape 2.</span></div>`, onSubmit: f => { if (!f.nom || !f.email) throw new Error('Nom et e-mail requis'); S.users.push({ id: uid('u'), ...f }); commit('Utilisateur ajouté'); } });
ACT.exportAll = () => copyText(JSON.stringify(S), 'Sauvegarde JSON copiée');
ACT.importAll = () => openModal({ title: 'Restaurer une sauvegarde', body: `<textarea class="inp" name="json" style="min-height:200px;font-family:ui-monospace,monospace;font-size:12px" placeholder="Collez ici l’export JSON"></textarea><div class="note warn">${ic('alert')}<span>Les données actuelles seront remplacées.</span></div>`, submit: 'Restaurer', onSubmit: f => { const st = JSON.parse(f.json); if (st.version !== 1 || !Array.isArray(st.parcelles)) throw new Error('Sauvegarde non reconnue'); S = st; commit('Sauvegarde restaurée'); } });
ACT.resetDemo = () => openModal({ title: 'Réinitialiser la démonstration ?', body: '<p>Toutes les modifications seront perdues et l’exploitation fictive régénérée.</p>', submit: 'Réinitialiser', onSubmit: () => { resetDemo(); UI.assist = null; commit('Démonstration réinitialisée'); } });
ACT.startEmpty = () => openModal({
  title: 'Démarrer une exploitation vierge ?', body: `<label class="field"><span>Nom de l’exploitation</span><input class="inp" name="nom" required placeholder="Ex. : GAEC du Moulin"></label><div class="note warn">${ic('alert')}<span>Toutes les données de démonstration seront supprimées. Le catalogue d’intrants (quantités à zéro) et les ITK types sont conservés pour gagner du temps.</span></div>`, submit: 'Démarrer', onSubmit: f => {
    if (!f.nom) throw new Error('Nom requis');
    const keepStock = S.stock.filter(s => s.cat !== 'production').map(s => ({ ...s, qte: 0, lot: '', fournisseur: '' }));
    const itk = S.itk; Object.values(itk).forEach(t => t.steps.forEach(s => s.materiels = []));
    S = { version: 1, demo: false, createdAt: TODAY, seq: { facture: 0 }, exploitation: { nom: f.nom, forme: '', siret: '', pacage: '', exploitant: '', adresse: '', telephone: '', email: '', certification: '', mainOeuvre: [{ nom: 'Exploitant', role: 'Exploitant', taux: 0 }] }, users: [{ id: 'u1', nom: 'Administrateur', email: '', role: 'Administrateur' }], parcelles: [], interventions: [], stock: keepStock, mouvements: [], ventes: [], charges: [], materiel: [], cours: Object.fromEntries(Object.entries(S.cours).map(([k, c]) => [k, { nom: c.nom, unite: c.unite, source: 'Aucune source — saisissez vos prix', type: 'manuel', points: [], manuels: [] }])), itk, favoris: [], documents: [], echeances: [], pac: { campagnes: { [CURRENT_CAMP]: { statut: 'preparation', dateDepot: null, note: '' } }, checklist: { [CURRENT_CAMP]: {} } } };
    UI.assist = null; commit('Exploitation créée'); go('exploitation');
  }
});

/* =========================== DÉMARRAGE =========================== */
(function boot() {
  loadState();
  document.body.insertAdjacentHTML('beforeend', `<div id="scrimD" class="scrim" data-a="closeDrawer"></div><aside id="drawer" class="drawer" aria-label="Fiche"></aside><div id="scrimM" class="scrim m" data-a="closeModal"></div><div id="modal" class="modal" role="dialog"></div><div id="toasts" class="toast-box"></div>
  <div id="searchPop" class="search-pop" data-a="closeSearchBg"><div class="search-box"><div style="position:relative"><span style="position:absolute;left:16px;top:18px;color:var(--faint)">${ic('search')}</span><input class="inp" placeholder="Rechercher dans l’exploitation…" data-in="search"></div><div class="res"></div></div></div>`);
  ACT.closeSearchBg = (d, el, e) => { if (e.target.id === 'searchPop') ACT.closeSearch(); };
  route();
})();
