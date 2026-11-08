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
/* ---- Équipe : personnes associées aux opérations ---- */
const team = () => S.exploitation.mainOeuvre || [];
const ivPeople = i => i.personnes?.length ? i.personnes : (i.mo ? String(i.mo).split(/\s*,\s*/).filter(Boolean) : []);
const initials = n => String(n || '?').split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
const PCOLORS = ['#1C6A47', '#2F7FD1', '#D9487A', '#E2761B', '#7A5BD6', '#138F8F', '#A8742A', '#5B6B7A'];
const pColor = n => PCOLORS[Math.max(0, team().findIndex(m => m.nom === n)) % PCOLORS.length];
const avatar = (n, sm) => `<span class="av ${sm ? 'sm' : ''}" style="--c:${pColor(n)}" title="${esc(n)}">${esc(initials(n))}</span>`;
function lastPeople() { let l = []; try { l = JSON.parse(localStorage.getItem('agripilot.lastPeople') || '[]'); } catch (e) { } l = l.filter(n => team().some(m => m.nom === n)); if (!l.length && team().length === 1) l = [team()[0].nom]; return l; }
function rememberPeople(l) { try { localStorage.setItem('agripilot.lastPeople', JSON.stringify(l)); } catch (e) { } }
function peoplePicker(sel, act) { return `<div class="ppl">${team().map(m => `<button type="button" class="ppl-b ${sel.includes(m.nom) ? 'on' : ''}" style="--c:${pColor(m.nom)}" data-a="${act}" data-n="${esc(m.nom)}">${avatar(m.nom, true)}<span>${esc(m.nom)}</span></button>`).join('')}<button type="button" class="ppl-b add" data-a="pplAdd" data-cb="${act}">${ic('plus')}<span>Ajouter</span></button></div>`; }
ACT.pplAdd = d => { const box = document.querySelector('#mf .ppl'); if (!box || box.querySelector('.ppl-new')) return; box.insertAdjacentHTML('beforeend', `<div class="ppl-new"><input class="inp" id="pplNom" placeholder="Prénom et nom"><button type="button" class="btn p" data-a="pplSave" data-cb="${d.cb}">OK</button></div>`); document.getElementById('pplNom').focus(); };
ACT.pplSave = d => { const n = document.getElementById('pplNom')?.value.trim(); if (!n) return; if (!team().some(m => m.nom === n)) S.exploitation.mainOeuvre.push({ nom: n, role: 'Équipe', taux: 0 }); saveState(); ACT[d.cb]({ n, add: true }); };

/* =========================== ACCUEIL (mobile d'abord) =========================== */
function catCounts(todo) {
  return Object.entries(TASK_CATS).map(([k, c]) => ({ k, ...c, n: todo.filter(t => t.cat === k).length, u: todo.filter(t => t.cat === k && t.urgence === 'danger').length, w: todo.filter(t => t.cat === k && t.urgence === 'warn').length }));
}
const mini = (label, value, sub, a = '', color = 'var(--primary)') => `<div class="mini" ${a}><div class="l"><i class="dotc" style="background:${color}"></i>${label}</div><div class="v">${value}</div><div class="s">${sub}</div></div>`;
function gettingStarted() {
  const steps = [
    { k: 'contour', l: 'Dessiner le contour de vos parcelles', s: 'Pour la carte et la déclaration PAC', i: 'map', c: 'var(--c-cult)', done: !landParcels().some(p => p.contourProvisoire), a: 'data-a="go" data-r="parcellaire"' },
    { k: 'stock', l: 'Saisir vos stocks d’intrants', s: 'Semences, engrais, phytos, GNR', i: 'box', c: 'var(--c-stock)', done: S.stock.some(i => i.cat !== 'production' && i.qte > 0), a: 'data-a="purchase"' },
    { k: 'mat', l: 'Compléter la valeur du matériel', s: 'Prix d’achat et heures compteur', i: 'tractor', c: 'var(--c-mat)', done: !S.materiel.length ? false : S.materiel.every(m => m.prixAchat > 0), a: S.materiel.length ? 'data-a="go" data-r="materiel"' : 'data-a="newMat"' },
    { k: 'cours', l: 'Saisir un prix de vente de référence', s: 'Pour valoriser vos récoltes', i: 'trend', c: 'var(--c-vente)', done: Object.values(S.cours).some(c => c.points.length), a: 'data-a="goCours"' },
    { k: 'iv', l: 'Enregistrer une première intervention', s: 'Avec le bouton + en bas', i: 'sprout', c: 'var(--c-cult)', done: S.interventions.some(i => i.statut === 'realisee'), a: 'data-a="quickIv"' },
  ];
  return steps;
}
VIEWS.dashboard = () => {
  const camp = PREFS.camp, E = econ(camp), st = stockTotals(), todo = todoList(), todo60 = todoList(400);
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
    ${taskItems(todo.filter(t => t.urgence !== 'ok')).slice(0, 4).map(tkCard).join('') || `<div class="card pad row">${ic('check')}<span class="muted">Rien d’urgent — tout est à jour.</span></div>`}`;
  W.cultures = () => { const ass = assolement(CURRENT_CAMP); if (!ass.length) return ''; return `<div class="sec-h"><h3>Mes cultures</h3><span class="muted small">${campLabel(CURRENT_CAMP)}</span><span class="sp"></span><a href="#parcellaire">Carte ${ic('chevR')}</a></div>
    <div class="hscroll">${ass.map(a => { const pids = activeParcels().filter(p => p.cultures[CURRENT_CAMP]?.culture === a.key).map(p => p.id); const ivs = ivCur.filter(i => pids.includes(i.parcelleId)); const d = ivs.filter(i => i.statut === 'realisee').length; const nx = ivs.filter(i => i.statut === 'planifiee').sort((x, y) => x.date.localeCompare(y.date))[0]; return `<div class="crop" style="--c:${a.color}" data-a="goCult" data-c="${a.key}"><div class="row"><span class="sw"></span><b>${esc(a.label)}</b></div><div class="v">${nf(a.value, 1)} ha</div><div class="s">${pids.length} parcelle${pids.length > 1 ? 's' : ''}</div>${ivs.length ? `<div class="bar" style="margin:10px 0 6px"><i style="width:${d / ivs.length * 100}%;background:var(--c)"></i></div><div class="s">${d}/${ivs.length} travaux réalisés</div>` : '<div class="s" style="margin-top:10px">Aucun travail planifié</div>'}${nx ? `<div class="nx">${ic(IV_ICON[nx.type] || 'sprout')}<span>${esc(nx.label)} · ${dshort(nx.date)}</span></div>` : ''}</div>`; }).join('')}</div>`; };
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
  /* ---- nouveaux blocs ---- */
  const AP = activeParcels(), assol = AP.filter(p => curCult(p)), sown = assol.filter(p => S.interventions.some(i => i.parcelleId === p.id && i.campagne === CURRENT_CAMP && i.type === 'semis' && i.statut === 'realisee') || curCult(p).semisFait);
  const stk = S.stock.filter(i => i.cat !== 'production' && i.seuil > 0), stkOk = stk.filter(i => stockLevel(i)?.state === 'ok');
  const ring = (pct, col, v, l, sub, act) => { const r = 26, c = 2 * Math.PI * r, p = Math.max(0, Math.min(1, pct || 0)); return `<button class="ring" style="--c:${col}" ${act}><svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="${r}" class="rg-bg"/><circle cx="32" cy="32" r="${r}" class="rg-fg" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - p)}"/><text x="32" y="36">${v}</text></svg><b>${l}</b><span>${sub}</span></button>`; };
  W.anneaux = () => `<div class="rings">${ring(ivCur.length ? done / ivCur.length : 0, 'var(--c-cult)', `${ivCur.length ? Math.round(done / ivCur.length * 100) : 0}%`, 'Travaux', `${done}/${ivCur.length} faits`, 'data-a="go" data-r="interventions"')}${ring(assol.length ? sum(sown, p => p.surface) / sum(assol, p => p.surface) : 0, '#2F9E5B', `${assol.length ? Math.round(sum(sown, p => p.surface) / sum(assol, p => p.surface) * 100) : 0}%`, 'Semis', `${nf(sum(sown, p => p.surface), 0)}/${nf(sum(assol, p => p.surface), 0)} ha`, 'data-a="go" data-r="parcellaire"')}${ring(stk.length ? stkOk.length / stk.length : 1, 'var(--c-stock)', stk.length ? `${stkOk.length}/${stk.length}` : '—', 'Stocks OK', stk.length ? (stk.length - stkOk.length ? `${stk.length - stkOk.length} sous le seuil` : 'au-dessus des seuils') : 'aucun seuil défini', 'data-a="go" data-r="stocks"')}</div>`;
  W.aujourdhui = () => { const items = taskItems(todo.filter(t => t.urgence !== 'ok')); const late = items.filter(t => t.groupe === 'retard').length; const pres = team().filter(m => { const d = personDay(m, TODAY); return d.h > 0; });
    return `<div class="today card"><div class="today-h"><div><b>Aujourd’hui</b><span>${new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</span></div><span class="sp"></span>${team().length ? `<button class="today-team" data-a="go" data-r="equipe" title="Équipe présente">${pres.slice(0, 4).map(m => avatar(m.nom, true)).join('')}<span>${pres.length}/${team().length}</span></button>` : ''}</div>
    ${items.length ? `${late ? `<div class="today-late">${ic('alert')} ${late} tâche${late > 1 ? 's' : ''} en retard</div>` : ''}<div class="today-l">${items.slice(0, 4).map(t => { const c = TASK_CATS[t.cat]; const ivs = t.ivs || []; const ppl = [...new Set(ivs.flatMap(ivPeople))]; return `<div class="tdi" style="--c:${c.color}" data-a="${t.kind === 'ivgroup' ? (ivs.length > 1 ? 'tkDetail' : 'openIv') : 'openTodo'}" data-id="${t.kind === 'ivgroup' ? (ivs.length > 1 ? ivs.map(i => i.id).join(',') : ivs[0].id) : t.id}" data-kind="${t.kind}"><span class="tdi-ic">${ic(t.icon || c.icon)}</span><span class="tdi-tx"><b>${esc(t.titre)}</b><small>${t.kind === 'ivgroup' ? `${ivs.length > 1 ? ivs.length + ' parcelles' : esc(parcName(ivs[0].parcelleId))} · ${nf(sum(ivs, i => i.surface), 1)} ha` : esc(t.detail || c.label)}</small></span>${ppl.length ? `<span class="ivc-av">${ppl.slice(0, 2).map(n => avatar(n, true)).join('')}</span>` : ''}<span class="due ${t.urgence}">${esc(t.echeance)}</span></div>`; }).join('')}</div>${items.length > 4 ? `<a class="today-more" href="#taches">+ ${items.length - 4} autre${items.length - 4 > 1 ? 's' : ''} cette semaine ${ic('chevR')}</a>` : ''}` : `<div class="today-ok">${ic('check')}<span><b>Rien d’urgent</b><small>${next ? `Prochain : ${esc(next.label)} · ${dshort(next.date)}` : 'Aucun travail prévu'}</small></span></div>`}</div>`; };
  W.semaine = () => { const days = [...Array(7)].map((_, k) => addDays(TODAY, k)); const pl = S.interventions.filter(i => i.statut === 'planifiee'); const mx = Math.max(1, ...days.map(d => new Set(pl.filter(i => i.date === d).map(i => i.label)).size));
    return `<div class="sec-h"><h3>Les 7 prochains jours</h3><span class="sp"></span><a href="#equipe">Planning ${ic('chevR')}</a></div><div class="week card">${days.map(d => { const ivs = pl.filter(i => i.date === d), n = new Set(ivs.map(i => i.label)).size, dt = D(d); return `<button class="wd ${d === TODAY ? 'on' : ''} ${d < TODAY ? 'past' : ''}" data-a="goTasks" data-c=""><span>${dt.toLocaleDateString('fr-FR', { weekday: 'short' }).slice(0, 3)}</span><b>${dt.getDate()}</b><i style="height:${n ? 6 + n / mx * 26 : 3}px;${n ? '' : 'opacity:.35'}"></i><small>${n || ''}</small></button>`; }).join('')}</div>`; };
  W.modules = () => { const nextCamp = CURRENT_CAMP + 1, T = asTotals(nextCamp), lowS = S.stock.filter(i => ['warn', 'danger'].includes(stockLevel(i)?.state)).length, todoIv = ivCur.filter(i => i.statut === 'planifiee').length;
    const tiles = [['parcellaire', 'map', `${nf(surfaceTotale(), 0)} ha`, `${landParcels().length} champs`], ['assolement', 'layers', T.sau ? `${Math.round(T.aff / T.sau * 100)} %` : '—', `assolé ${nextCamp}`], ['interventions', 'sprout', todoIv, 'travaux prévus'], ['stocks', 'box', lowS || 'OK', lowS ? 'à réapprovisionner' : 'niveaux corrects'], ['equipe', 'users', team().length, team().length > 1 ? 'personnes' : 'personne'], ['economie', 'chart', keur(E.ca), `CA ${campLabel(camp)}`]];
    return `<div class="sec-h"><h3>Mon exploitation</h3></div><div class="mtiles">${tiles.map(([r, i, v, l]) => `<a class="mtile" href="#${r}" style="--c:${MOD_COLOR[r]}"><span class="ti">${ic(i)}</span><b>${v}</b><small>${l}</small><em>${ROUTES.find(x => x[0] === r)[1]}</em></a>`).join('')}</div>`; };
  const order = PREFS.widgets.filter(w => w.on && W[w.id]).map(w => w.id);
  const leftIds = ['premiers', 'aujourdhui', 'anneaux', 'semaine', 'categories', 'priorites', 'cultures', 'actions'];
  const left = order.filter(id => leftIds.includes(id)), right = order.filter(id => !leftIds.includes(id));
  const h = new Date().getHours(); const prenom = (S.exploitation.exploitant || '').split(' ')[0];
  const cs = `${CURRENT_CAMP - 1}-08-01`, cprog = Math.max(0, Math.min(1, daysBetween(cs, TODAY) / 365));
  const season = (() => { const m = D(TODAY).getMonth(); return m <= 1 || m === 11 ? ['Hiver', '❄️'] : m <= 4 ? ['Printemps', '🌱'] : m <= 7 ? ['Été · moissons', '🌾'] : ['Automne · semis', '🍂']; })();
  return `<div class="home2-h"><div class="h2-top"><div><div class="h2-hello">${h < 12 ? 'Bonjour' : h < 18 ? 'Bon après-midi' : 'Bonsoir'}${prenom ? ' ' + esc(prenom) : ''} 👋</div><h2>${esc(S.exploitation.nom)}</h2></div>${S.demo ? '<span class="h2-demo">Démo</span>' : ''}</div>
    <div class="h2-camp"><span>${season[1]} ${season[0]}</span><span class="sp"></span><span>Campagne ${campLabel(CURRENT_CAMP)}</span></div><div class="h2-prog"><i style="width:${cprog * 100}%"></i></div><div class="h2-ticks"><span>août</span><span>récolte ${CURRENT_CAMP}</span></div>
    <div class="h2-stats"><a href="#parcellaire"><b>${nf(surfaceTotale(), 0)}</b><span>hectares</span></a><button data-a="goTasks" data-c="" class="${urgent ? 'late' : ''}"><b>${urgent}</b><span>en retard</span></button><button data-a="goTasks" data-c=""><b>${soon}</b><span>cette semaine</span></button></div></div>
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
const SHEET = {
  stock: { l: 'Stock', c: 'var(--c-stock)', i: 'box', items: [['achat', 'Entrée', 'plus', 'Livraison, achat, stock existant'], ['sortie', 'Sortie', 'minus', 'Utilisation, perte, cession'], ['corriger', 'Corriger', 'edit', 'Rectifier une quantité'], ['vente', 'Vendre une récolte', 'euro', 'Sortie de stock + chiffre d’affaires']] },
  divers: { l: 'Divers', c: 'var(--c-mat)', i: 'dots', items: [['entretien', 'Entretien matériel', 'wrench', 'Vidange, révision…'], ['panne', 'Panne / réparation', 'alert', 'Avec immobilisation'], ['charge', 'Charge', 'cart', 'Fermage, assurance, prestation…'], ['doc', 'Document', 'file', 'Justificatif, contrat…']] },
};
ACT.actionSheet = () => openModal({ title: 'Saisir', body: `<div class="sheet3"><button type="button" class="s3 big" style="--c:var(--c-cult)" data-a="qa" data-k="iv"><span class="ti">${ic('sprout')}</span><span><b>Intervention</b><small>Semis, traitement, engrais, travail du sol, récolte…</small></span>${ic('chevR')}</button>${Object.entries(SHEET).map(([k, g]) => `<button type="button" class="s3" style="--c:${g.c}" data-a="sheetSub" data-k="${k}"><span class="ti">${ic(g.i)}</span><span><b>${g.l}</b><small>${g.items.map(x => x[1]).join(' · ')}</small></span>${ic('chevR')}</button>`).join('')}</div>`, foot: '' });
ACT.sheetSub = d => { const g = SHEET[d.k]; document.querySelector('#modal .modal-h h2').innerHTML = `<button type="button" class="lnk-back" data-a="actionSheet" style="padding:0">${ic('chevL')}</button> ${g.l}`; document.getElementById('mf').innerHTML = `<div class="sheet3">${g.items.map(([k, l, i, sub]) => `<button type="button" class="s3" style="--c:${g.c}" data-a="qa" data-k="${k}"><span class="ti">${ic(i)}</span><span><b>${l}</b><small>${sub}</small></span>${ic('chevR')}</button>`).join('')}</div>`; };
ACT.qa = d => {
  closeModal();
  const k = d.k;
  setTimeout(() => {
    if (k === 'iv') quickIvForm({});
    else if (k === 'recolte') { quickIvForm({}); QF.type = 'recolte'; QF.label = 'Récolte'; QF.materiels = [S.materiel.find(m => m.cat === 'moissonneuse'), S.materiel.find(m => m.cat === 'tracteur'), S.materiel.find(m => m.cat === 'remorque')].filter(Boolean).map(m => m.id); QF.hHa = 0.4; renderQF(); }
    else if (k === 'vente') ACT.newSale({});
    else if (k === 'achat') ACT.purchase({});
    else if (k === 'sortie') ACT.stockOutPick({});
    else if (k === 'corriger') ACT.stockFixPick();
    else if (k === 'entretien' || k === 'panne') pickMat(k === 'panne' ? 'panne' : 'entretien');
    else if (k === 'charge') ACT.newCharge();
    else if (k === 'doc') ACT.newDoc();
  }, 220);
};
function pickMat(t) { openModal({ title: t === 'panne' ? 'Panne — quel matériel ?' : 'Entretien — quel matériel ?', body: `<div class="list">${S.materiel.map(m => `<div class="mrow" style="--c:var(--c-mat)" data-a="pickMatGo" data-id="${m.id}" data-t="${t}"><div class="ic">${matIc(m)}</div><div class="tx"><b>${esc(m.marque)} ${esc(m.modele)}</b><span>${MAT_CATS[m.cat]} · ${nf(matCnt(m))} h${m.panne ? ' · <b style="color:var(--danger)">en panne</b>' : ''}</span></div>${ic('chevR')}</div>`).join('')}</div>`, foot: '' }); }
ACT.pickMatGo = d => { closeModal(); setTimeout(() => d.t === 'panne' ? ACT.matPanne({ id: d.id }) : ACT.addMaint({ id: d.id, t: d.t }), 220); };

/* =========================== TÂCHES =========================== */
/** Regroupe les opérations identiques (même libellé, même type, même date) sur plusieurs parcelles. */
function taskItems(list) {
  const out = [], groups = {};
  list.forEach(t => {
    if (t.kind !== 'intervention') { out.push(t); return; }
    const iv = byId('interventions', t.id); if (!iv) return;
    const k = `${iv.label}|${iv.type}|${iv.date}`;
    if (!groups[k]) { groups[k] = { ...t, kind: 'ivgroup', ivs: [], titre: iv.label }; out.push(groups[k]); }
    groups[k].ivs.push(iv);
  });
  return out;
}
function tkCard(t) {
  const c = TASK_CATS[t.cat];
  let meta = `<span class="tk-meta">${esc(t.detail || '')}</span>`, acts;
  if (t.kind === 'ivgroup') {
    const ivs = t.ivs, surf = sum(ivs, i => i.surface), cults = [...new Set(ivs.map(i => CULTURES[byId('parcelles', i.parcelleId)?.cultures[i.campagne]?.culture]?.nom).filter(Boolean))];
    const prods = ivs[0].produits.map(x => { const it = byId('stock', x.itemId); return it ? `${esc(it.nom)} ${nfx(x.dose, 2)} ${it.unite}/ha` : ''; }).filter(Boolean).join(' · ');
    meta = `<span class="tk-meta"><b>${ivs.length > 1 ? `${ivs.length} parcelles` : esc(parcName(ivs[0].parcelleId))}</b> · ${nf(surf, 1)} ha${cults.length ? ' · ' + esc(cults.join(', ')) : ''}</span>${prods ? `<span class="tk-meta">${prods}</span>` : ''}${ivs.length > 1 ? `<span class="tk-parcs">${ivs.map(i => `<i>${esc(parcName(i.parcelleId))}</i>`).join('')}</span>` : ''}`;
    const ppl = [...new Set(ivs.flatMap(ivPeople))];
    meta += `<span class="tk-ppl">${ppl.length ? ppl.map(n => `${avatar(n, true)}<span>${esc(n)}</span>`).join('') : `<button class="tk-assign" data-a="assignIv" data-id="${ivs.map(i => i.id).join(',')}">${ic('users')} À attribuer</button>`}</span>`;
    acts = `<button class="btn sm" data-a="${ivs.length > 1 ? 'tkDetail' : 'openIv'}" data-id="${ivs.length > 1 ? ivs.map(i => i.id).join(',') : ivs[0].id}">${ivs.length > 1 ? 'Détail' : 'Voir'}</button><button class="btn sm tk-go" data-a="quickIv" data-pids="${ivs.map(i => i.parcelleId).join(',')}" data-plan="${esc(ivs[0].label)}" data-type="${ivs[0].type}">${ic('check')} ${ivs.length > 1 ? `Fait sur les ${ivs.length}` : 'Fait'}</button>`;
  } else acts = `<button class="btn sm" data-a="openTodo" data-kind="${t.kind}" data-id="${t.id}">Voir</button>${t.action ? `<button class="btn sm tk-go" data-a="taskAct" data-kind="${t.kind}" data-id="${t.id}">${t.action}</button>` : ''}`;
  return `<div class="tk" style="--c:${c.color}"><div class="tk-top"><span class="tk-ic">${ic(t.icon || c.icon)}</span><div class="tk-main"><span class="tk-cat">${c.label}${t.sub ? ` · ${esc(t.sub)}` : ''}</span><b>${esc(t.titre)}</b>${meta}</div><span class="due ${t.urgence === 'ok' ? '' : t.urgence}">${esc(t.echeance)}</span></div><div class="tk-act">${acts}</div></div>`;
}
ACT.tkDetail = d => { const ivs = d.id.split(',').map(id => byId('interventions', id)).filter(Boolean); openModal({ title: esc(ivs[0].label), body: `<p class="small muted">${dfr(ivs[0].date)} · ${ivs.length} parcelles · ${nf(sum(ivs, i => i.surface), 1)} ha</p><div class="card">${ivs.map(i => `<div class="mrow" style="--c:var(--c-cult)"><div class="ic">${ic(IV_ICON[i.type])}</div><div class="tx" data-a="openIvFromModal" data-id="${i.id}"><b>${esc(parcName(i.parcelleId))}</b><span>${nf(i.surface, 2)} ha</span></div><button class="act-s" data-a="validateIv" data-id="${i.id}">Fait</button></div>`).join('')}</div>`, foot: `<button type="button" class="btn" data-a="closeModal">Fermer</button><button type="button" class="btn p" data-a="quickIv" data-pids="${ivs.map(i => i.parcelleId).join(',')}" data-plan="${esc(ivs[0].label)}" data-type="${ivs[0].type}">${ic('check')} Fait sur les ${ivs.length}</button>` }); };
ACT.assignIv = d => { const ivs = d.id.split(',').map(id => byId('interventions', id)).filter(Boolean); ASG = { ivs, sel: [...new Set(ivs.flatMap(ivPeople))] }; if (!ASG.sel.length) ASG.sel = lastPeople(); openModal({ title: `Qui fait : ${esc(ivs[0].label)} ?`, body: '<div id="asgBox"></div>', submit: 'Attribuer', onMount: () => { document.getElementById('asgBox').innerHTML = peoplePicker(ASG.sel, 'asgP'); }, onSubmit: () => { if (!ASG.sel.length) throw new Error('Choisissez au moins une personne'); ASG.ivs.forEach(i => { i.personnes = [...ASG.sel]; i.mo = ASG.sel.join(', '); }); rememberPeople(ASG.sel); commit(`Attribuée à ${ASG.sel.join(', ')}`); } }); };
let ASG = null;
ACT.asgP = d => { const i = ASG.sel.indexOf(d.n); if (d.add) { if (i < 0) ASG.sel.push(d.n); } else i >= 0 ? ASG.sel.splice(i, 1) : ASG.sel.push(d.n); document.getElementById('asgBox').innerHTML = peoplePicker(ASG.sel, 'asgP'); };
ACT.openIvFromModal = d => { closeModal(); openDrawer('intervention', d.id); };
VIEWS.taches = () => {
  const who = UI.f.taskWho || '';
  const all = todoList(400).filter(t => !who || t.kind !== 'intervention' || (who === '_none' ? !ivPeople(byId('interventions', t.id) || {}).length : ivPeople(byId('interventions', t.id) || {}).includes(who))); const cat = UI.f.taskCat || '', when = UI.f.taskWhen || '';
  const items = taskItems(all.filter(t => !cat || t.cat === cat));
  const inWhen = t => !when || (when === 'semaine' ? ['jour', 'semaine'].includes(t.groupe) : t.groupe === when);
  const cnt = g => taskItems(all.filter(t => (!cat || t.cat === cat))).filter(t => g === 'semaine' ? ['jour', 'semaine'].includes(t.groupe) : t.groupe === g).length;
  const list = items.filter(inWhen);
  const G = [['retard', 'En retard', 'alert'], ['jour', "Aujourd'hui", 'calendar'], ['semaine', 'Cette semaine', 'calendar'], ['plus_tard', 'À venir', 'clock']];
  return `${demoBar('Tâches calculées à partir des données de démonstration.')}
  <div class="tk-sum">${[['retard', 'En retard', 'late'], ['semaine', 'Cette semaine', 'soon'], ['plus_tard', 'À venir', 'later']].map(([g, l, cls]) => `<button class="${cls} ${when === g ? 'on' : ''}" data-a="taskWhen" data-g="${g}"><b>${cnt(g)}</b><span>${l}</span></button>`).join('')}</div>
  <div class="fchips mt"><button class="fchip ${!cat ? 'on' : ''}" style="--c:var(--text)" data-a="taskCat" data-c="">Tout</button>${catCounts(all).filter(c => c.n).map(c => `<button class="fchip ${cat === c.k ? 'on' : ''}" style="--c:${c.color}" data-a="taskCat" data-c="${c.k}">${ic(c.icon)} ${c.label} <span class="k">${c.n}</span></button>`).join('')}</div>
  ${team().length ? `<div class="fchips mt">${[['', 'Tout le monde'], ...team().map(m => [m.nom, m.nom]), ['_none', 'À attribuer']].map(([v, l]) => `<button class="fchip ${who === v ? 'on' : ''}" style="--c:${v && v !== '_none' ? pColor(v) : 'var(--text)'}" data-a="taskWho" data-v="${esc(v)}">${v && v !== '_none' ? avatar(v, true) : v === '_none' ? ic('users') : ''} ${esc(l)}</button>`).join('')}</div>` : ''}
  ${when || cat ? `<div class="row mt small"><span class="muted">Filtre actif</span><button class="lnk b" style="background:none;border:0;color:var(--primary);cursor:pointer" data-a="taskReset">Tout afficher</button></div>` : ''}
  ${G.map(([g, l, i]) => { const ts = list.filter(t => t.groupe === g); if (!ts.length) return ''; let mo = ''; return `<div class="group-h ${g === 'retard' ? 'late' : ''}">${ic(i)} ${l}<span class="n">${ts.length}</span></div>${ts.map(t => { let h = ''; if (g === 'plus_tard') { const m = D(t.date).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }); if (m !== mo) { mo = m; h = `<div class="month-h">${m}</div>`; } } return h + tkCard(t); }).join('')}`; }).join('') || `<div class="card pad mt row">${ic('check')}<span class="muted">Aucune tâche ${when ? 'dans cette période' : ''} ${cat ? 'pour cette catégorie' : ''}.</span></div>`}
  <div class="formula mt2">Toutes les tâches de la campagne sont affichées. Les opérations identiques prévues le même jour sur plusieurs parcelles sont regroupées : « Fait sur les N » les valide toutes en une saisie.</div>`;
};
ACT.taskWhen = d => { UI.f.taskWhen = UI.f.taskWhen === d.g ? '' : d.g; render(); };
ACT.taskReset = () => { UI.f.taskWhen = ''; UI.f.taskCat = ''; UI.f.taskWho = ''; render(); };
ACT.taskWho = d => { UI.f.taskWho = UI.f.taskWho === d.v ? '' : d.v; render(); };
ACT.taskCat = d => { UI.f.taskCat = d.c; render(); };

/* =========================== MENU « PLUS » =========================== */
VIEWS.plus = () => {
  const todo = todoList();
  const n = c => todo.filter(t => t.cat === c && t.urgence !== 'ok').length;
  const cnt = { taches: todo.filter(t => t.urgence !== 'ok').length, interventions: n('cultures'), stocks: n('stocks'), materiel: n('materiel'), ventes: n('ventes'), pac: n('admin'), documents: n('documents') };
  const groups = [['Travail', ['taches', 'equipe', 'interventions']], ['Production', ['parcellaire', 'assolement', 'itk', 'stocks']], ['Économie', ['ventes', 'economie', 'materiel']], ['Administration', ['exploitation', 'pac', 'documents', 'parametres']]];
  return `${groups.map(([g, ids]) => `<div class="sec-h"><h3>${g}</h3></div><div class="mod-grid">${ids.map(id => { const r = ROUTES.find(x => x[0] === id); return `<a class="mod" href="#${id}" style="--c:${MOD_COLOR[id]}"><span class="ti">${ic(r[2])}</span>${r[1]}${cnt[id] ? `<span class="cnt">${cnt[id]}</span>` : ''}</a>`; }).join('')}</div>`).join('')}
  <div class="sec-h"><h3>Réglages rapides</h3></div>
  <div class="card"><div class="mrow" style="cursor:default"><div class="ic">${ic('calendar')}</div><div class="tx"><b>Campagne analysée</b><span>Chiffres économiques affichés</span></div><select class="inp" style="width:auto;height:40px" data-ch="camp">${[2025, 2026, 2027].map(c => `<option value="${c}" ${PREFS.camp === c ? 'selected' : ''}>${campLabel(c)}</option>`).join('')}</select></div>
  <div class="mrow" data-a="theme"><div class="ic">${ic(PREFS.theme === 'dark' ? 'sun' : 'moon')}</div><div class="tx"><b>Mode sombre</b><span>Lisibilité de nuit</span></div><button class="switch ${PREFS.theme === 'dark' ? 'on' : ''}" tabindex="-1"></button></div>
  <div class="mrow" data-a="search"><div class="ic">${ic('search')}</div><div class="tx"><b>Recherche globale</b><span>Parcelles, produits, matériel, factures…</span></div>${ic('chevR')}</div></div>
  <div class="card mt"><div class="mrow" data-a="appUpdate"><div class="ic">${ic('upload')}</div><div class="tx"><b>Mettre à jour l’application</b><span>Version ${APP_VERSION} · recharge la dernière version</span></div>${ic('chevR')}</div></div>
  <div class="formula mt">${S.demo ? 'Données de démonstration · ' : ''}${navigator.onLine ? 'En ligne' : 'Hors ligne'} · enregistrement sur cet appareil · version ${APP_VERSION}</div>`;
};

ACT.appUpdate = async () => { toast('Mise à jour en cours…'); try { if ('serviceWorker' in navigator) { const rs = await navigator.serviceWorker.getRegistrations(); for (const r of rs) await r.unregister(); } if (window.caches) { for (const k of await caches.keys()) await caches.delete(k); } } catch (e) { } location.reload(); };
FORMS.assist = d => { UI.assist = { q: d.q, a: assistantAnswer(d.q || '', PREFS.camp) }; render(); };
ACT.assistQ = d => { const m = { 'Marge sur mon blé': 'Quelle est la marge réalisée sur mon blé ?', "Tonnes d'orge restantes": "Combien me reste-t-il de tonnes d'orge ?", 'Coût de mécanisation': 'Quel est le coût de mécanisation ?', 'Prochains entretiens': "Quelles sont les prochaines opérations d'entretien ?", 'Coût de production le plus élevé': 'Quelle parcelle présente le coût de production le plus élevé ?', 'Dépenses en engrais': "Combien ai-je dépensé en engrais ?" }; const q = m[d.q] || d.q; UI.assist = { q, a: assistantAnswer(q, PREFS.camp) }; render(); };
ACT.customize = () => openModal({ title: 'Personnaliser le tableau de bord', body: widgetCtl(), foot: '<button class="btn p" data-a="closeModal" type="button">Terminé</button>' });
function widgetCtl() { return `<div id="wctl">${PREFS.widgets.map((w, i) => `<div class="widget-ctl"><button type="button" class="switch ${w.on ? 'on' : ''}" data-a="wToggle" data-i="${i}" aria-label="Afficher"></button><span class="sp">${WIDGET_NAMES[w.id]}</span><button type="button" class="btn xs g" data-a="wMove" data-i="${i}" data-d="-1" ${i === 0 ? 'disabled' : ''}>${ic('up')}</button><button type="button" class="btn xs g" data-a="wMove" data-i="${i}" data-d="1" ${i === PREFS.widgets.length - 1 ? 'disabled' : ''}>${ic('down')}</button></div>`).join('')}</div><button type="button" class="btn sm g mt" data-a="wReset">Rétablir l'affichage par défaut</button>`; }
ACT.wToggle = d => { PREFS.widgets[d.i].on = !PREFS.widgets[d.i].on; savePrefs(); document.getElementById('wctl').outerHTML = widgetCtl().replace(/<button type="button" class="btn sm g mt".*$/, ''); render(); };
ACT.wMove = d => { const i = +d.i, j = i + +d.d; const w = PREFS.widgets;[w[i], w[j]] = [w[j], w[i]]; savePrefs(); document.getElementById('wctl').outerHTML = widgetCtl().replace(/<button type="button" class="btn sm g mt".*$/, ''); render(); };
ACT.wReset = () => { PREFS.widgets = DEFAULT_WIDGETS.map(id => ({ id, on: !WIDGETS_OFF.includes(id) })); savePrefs(); closeModal(); render(); };
ACT.goCours = () => { UI.tabs.eco = 'cours'; go('economie'); };

/* =========================== MAIN-D'ŒUVRE : planning et affectation =========================== */
const ROLES = ['Exploitant', 'Associé', 'Salarié', 'Saisonnier', 'Apprenti', 'Prestataire'];
/* ---- Horaires : semaine type par personne + exceptions datées ---- */
const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
const MOTIFS = ['Congé', 'Maladie', 'Formation', 'Récupération', 'Autre'];
const hm = t => { const [a, b] = String(t || '0:0').split(':').map(Number); return a + (b || 0) / 60; };
const fmtH = h => { const H = Math.floor(h + 1e-9), M = Math.round((h - H) * 60); return M ? `${H}h${String(M).padStart(2, '0')}` : `${H}h`; };
const fmtT = t => t ? t.replace(':00', 'h').replace(':', 'h') : '';
function defaultWeek() { return [0, 1, 2, 3, 4, 5, 6].map(i => ({ on: i < 5, deb: '08:00', fin: '17:30', pause: 90 })); }
function weekOf(m) { if (!m.horaires) m.horaires = defaultWeek(); return m.horaires; }
/** Disponibilité d'une personne un jour donné (semaine type, sauf exception). */
function personDay(m, date) {
  const ex = (m.exceptions || {})[date]; const wd = (D(date).getDay() + 6) % 7; const w = weekOf(m)[wd];
  if (ex && ex.type === 'absent') return { absent: true, motif: ex.motif || 'Absent', h: 0, ex: true };
  const r = ex && ex.type === 'horaires' ? ex : w.on ? w : null;
  if (!r) return { off: true, h: 0, ex: !!ex };
  const h = Math.max(0, hm(r.fin) - hm(r.deb) - (+r.pause || 0) / 60);
  return { deb: r.deb, fin: r.fin, pause: +r.pause || 0, h, ex: !!ex };
}
const plannedH = (n, date) => r2(sum(S.interventions.filter(i => i.date === date && ivPeople(i).includes(n)), i => i.heures / Math.max(1, ivPeople(i).length)), 1);
const TIMES = (() => { const a = []; for (let h = 4; h <= 22; h++) for (const mm of ['00', '30']) a.push(`${String(h).padStart(2, '0')}:${mm}`); return a; })();
const weekSummary = m => { const w = weekOf(m); const on = w.map((d, i) => d.on ? i : -1).filter(i => i >= 0); if (!on.length) return 'Aucun jour travaillé'; const same = on.every(i => w[i].deb === w[on[0]].deb && w[i].fin === w[on[0]].fin); const days = on.length === 5 && on[4] === 4 ? 'Lun–Ven' : on.map(i => JOURS[i].slice(0, 3)).join(', '); const tot = sum(on, i => Math.max(0, hm(w[i].fin) - hm(w[i].deb) - w[i].pause / 60)); return `${days}${same ? ` · ${fmtT(w[on[0]].deb)}–${fmtT(w[on[0]].fin)}` : ''} · ${fmtH(tot)}/sem.`; };
let HW = null;
ACT.eqHours = (d, el, e) => { e && e.stopPropagation(); const m = team()[+d.i]; HW = { i: +d.i, w: JSON.parse(JSON.stringify(weekOf(m))) }; openModal({ title: `Horaires habituels · ${esc(m.nom)}`, body: '<div id="hwBox"></div>', submit: 'Enregistrer', onMount: renderHW, onSubmit: () => { team()[HW.i].horaires = HW.w; commit('Horaires enregistrés'); } }); };
function renderHW() {
  const box = document.getElementById('hwBox'); if (!box) return;
  const tot = sum(HW.w.filter(d => d.on), d => Math.max(0, hm(d.fin) - hm(d.deb) - d.pause / 60));
  box.innerHTML = `<p class="small muted" style="margin-top:0">Semaine type. Les changements ponctuels (congé, horaires d’un jour) se font dans le planning, en touchant la personne sur le jour voulu.</p>
  ${HW.w.map((d, k) => `<div class="hw-row ${d.on ? '' : 'off'}"><button type="button" class="switch ${d.on ? 'on' : ''}" data-a="hwOn" data-k="${k}" aria-label="Travaillé"></button><b>${JOURS[k]}</b>${d.on ? `<select class="inp" data-ch="hw" data-k="${k}" data-f="deb">${opts(TIMES.map(t => [t, fmtT(t)]), d.deb)}</select><span>à</span><select class="inp" data-ch="hw" data-k="${k}" data-f="fin">${opts(TIMES.map(t => [t, fmtT(t)]), d.fin)}</select>` : '<span class="muted small">repos</span>'}</div>${d.on ? `<div class="hw-pause"><span>Pause</span>${[0, 30, 60, 90, 120].map(p => `<button type="button" class="${d.pause === p ? 'on' : ''}" data-a="hwP" data-k="${k}" data-v="${p}">${p ? fmtH(p / 60) : 'aucune'}</button>`).join('')}<em>${fmtH(Math.max(0, hm(d.fin) - hm(d.deb) - d.pause / 60))}</em></div>` : ''}`).join('')}
  <div class="row mt" style="gap:8px"><button type="button" class="btn sm" data-a="hwCopy">Appliquer lundi à tous les jours travaillés</button><span class="sp"></span><b>${fmtH(tot)} / semaine</b></div>`;
}
ACT.hwOn = d => { HW.w[+d.k].on = !HW.w[+d.k].on; renderHW(); };
ACT.hwP = d => { HW.w[+d.k].pause = +d.v; renderHW(); };
CH.hw = el => { HW.w[+el.dataset.k][el.dataset.f] = el.value; renderHW(); };
ACT.hwCopy = () => { const m = HW.w[0]; HW.w.forEach(d => { if (d.on) { d.deb = m.deb; d.fin = m.fin; d.pause = m.pause; } }); renderHW(); };
let DX = null;
ACT.dayEdit = d => {
  const m = team().find(x => x.nom === d.n); if (!m) return; const date = d.d; const cur = (m.exceptions || {})[date]; const base = weekOf(m)[(D(date).getDay() + 6) % 7];
  DX = { m, date, type: cur ? cur.type : 'normal', motif: cur?.motif || 'Congé', deb: cur?.deb || (base.on ? base.deb : '08:00'), fin: cur?.fin || (base.on ? base.fin : '17:30'), pause: cur?.pause ?? (base.on ? base.pause : 60), base };
  openModal({ title: `${avatar(m.nom)} ${esc(m.nom.split(' ')[0])} · ${D(date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}`, body: '<div id="dxBox"></div>', submit: 'Enregistrer', onMount: renderDX, onSubmit: () => { const ex = DX.m.exceptions || (DX.m.exceptions = {}); if (DX.type === 'normal') delete ex[DX.date]; else if (DX.type === 'absent') ex[DX.date] = { type: 'absent', motif: DX.motif }; else ex[DX.date] = { type: 'horaires', deb: DX.deb, fin: DX.fin, pause: DX.pause }; const pl = plannedH(DX.m.nom, DX.date); commit(DX.type === 'absent' && pl ? `Absence enregistrée — ${fmtH(pl)} de travaux sont prévus ce jour pour ${DX.m.nom} : pensez à les réaffecter` : 'Journée mise à jour', DX.type === 'absent' && pl ? 'warn' : ''); } });
};
function renderDX() {
  const b = document.getElementById('dxBox'); if (!b) return; const pl = plannedH(DX.m.nom, DX.date);
  b.innerHTML = `<div class="qf-status" style="grid-template-columns:repeat(3,1fr)">${[['normal', 'clock', 'Habituel', DX.base.on ? `${fmtT(DX.base.deb)}–${fmtT(DX.base.fin)}` : 'repos'], ['horaires', 'edit', 'Autres horaires', 'ce jour-là'], ['absent', 'x', 'Absent', 'congé, maladie…']].map(([v, i, l, sub]) => `<button type="button" class="${DX.type === v ? 'on' : ''}" data-a="dxT" data-v="${v}">${ic(i)}<b>${l}</b><small>${sub}</small></button>`).join('')}</div>
  ${DX.type === 'horaires' ? `<div class="hw-row mt"><b>De</b><select class="inp" data-ch="dx" data-f="deb">${opts(TIMES.map(t => [t, fmtT(t)]), DX.deb)}</select><span>à</span><select class="inp" data-ch="dx" data-f="fin">${opts(TIMES.map(t => [t, fmtT(t)]), DX.fin)}</select></div><div class="hw-pause"><span>Pause</span>${[0, 30, 60, 90, 120].map(p => `<button type="button" class="${+DX.pause === p ? 'on' : ''}" data-a="dxP" data-v="${p}">${p ? fmtH(p / 60) : 'aucune'}</button>`).join('')}<em>${fmtH(Math.max(0, hm(DX.fin) - hm(DX.deb) - DX.pause / 60))}</em></div>` : ''}
  ${DX.type === 'absent' ? `<div class="field mt"><span>Motif</span><div class="ob-chips">${MOTIFS.map(x => `<button type="button" class="fchip ${DX.motif === x ? 'on' : ''}" style="--c:var(--late)" data-a="dxM" data-v="${x}">${x}</button>`).join('')}</div></div>` : ''}
  ${pl ? `<div class="note ${DX.type === 'absent' ? 'warn' : ''} mt">${ic('info')}<span>${fmtH(pl)} de travaux prévus ce jour pour ${esc(DX.m.nom.split(' ')[0])}.</span></div>` : ''}`;
}
ACT.dxT = d => { DX.type = d.v; renderDX(); };
ACT.dxM = d => { DX.motif = d.v; renderDX(); };
ACT.dxP = d => { DX.pause = +d.v; renderDX(); };
CH.dx = el => { DX[el.dataset.f] = el.value; renderDX(); };
function weekStart(off = 0) { const d = D(TODAY); const wd = (d.getDay() + 6) % 7; d.setDate(d.getDate() - wd + off * 7); return iso(d); }
VIEWS.equipe = () => {
  const t = tab('eq', 'planning');
  return `${tabsBar('eq', [['planning', 'Planning'], ['equipe', 'Équipe']], t)}${t === 'planning' ? eqPlanning() : eqTeam()}${pa([{ a: 'eqAddPerson', i: 'users', l: 'Personne', more: true }, { a: 'quickIv', i: 'plus', l: 'Planifier', primary: true, d: { statut: 'planifiee' } }])}`;
};
function eqGroups(ivs) { const g = {}, out = []; ivs.forEach(i => { const k = `${i.label}|${i.type}|${i.date}|${i.statut}|${ivPeople(i).join(',')}`; if (!g[k]) { g[k] = { ivs: [], ...i }; out.push(g[k]); } g[k].ivs.push(i); }); return out; }
function eqRow(g) {
  const ivs = g.ivs, pp = ivPeople(ivs[0]), done = g.statut === 'realisee', late = !done && g.date < TODAY;
  return `<div class="eq-row ${done ? 'done' : ''}" data-a="${done ? 'openIv' : 'planAssign'}" data-id="${done ? ivs[0].id : ivs.map(i => i.id).join(',')}"><span class="ic">${done ? ic('check') : ic(IV_ICON[g.type] || 'sprout')}</span><span class="tx"><b>${esc(g.label)}</b><small>${ivs.length > 1 ? `${ivs.length} parcelles` : esc(parcName(ivs[0].parcelleId))} · ${nf(sum(ivs, i => i.surface), 1)} ha · ${nfx(sum(ivs, i => i.heures), 1)} h${late ? ' · <span style="color:var(--late);font-weight:700">en retard</span>' : ''}</small></span><span class="who">${pp.length ? pp.map(n => avatar(n, true)).join('') : `<span class="tk-assign">${ic('users')} Affecter</span>`}</span></div>`;
}
function eqPlanning() {
  const off = +(UI.f.wk || 0), ws = weekStart(off), we = addDays(ws, 6), who = UI.f.eqWho || '';
  const match = i => !who || (who === '_none' ? !ivPeople(i).length : ivPeople(i).includes(who));
  const week = S.interventions.filter(i => i.date >= ws && i.date <= we && match(i));
  const late = off === 0 ? S.interventions.filter(i => i.statut === 'planifiee' && i.date < ws && match(i)) : [];
  const toAssign = S.interventions.filter(i => i.statut === 'planifiee' && !ivPeople(i).length && i.date <= we);
  const hours = n => r2(sum(S.interventions.filter(i => i.date >= ws && i.date <= we && ivPeople(i).includes(n)), i => i.heures / Math.max(1, ivPeople(i).length)), 1);
  const lbl = `${D(ws).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} – ${D(we).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}`;
  let h = `<div class="wk-nav"><button class="btn icon" data-a="wk" data-d="-1">${ic('chevL')}</button><div><b>${off === 0 ? 'Cette semaine' : off === 1 ? 'Semaine prochaine' : off === -1 ? 'Semaine dernière' : 'Semaine'}</b><span>${lbl}</span></div><button class="btn icon" data-a="wk" data-d="1">${ic('chevR')}</button></div>
  ${off ? `<div style="text-align:center;margin-top:6px"><button class="lnk" data-a="wk" data-d="0">Revenir à aujourd’hui</button></div>` : ''}
  <div class="eq-load">${team().map(m => { const hh = hours(m.nom); const dispo = sum([0, 1, 2, 3, 4, 5, 6], k => personDay(m, addDays(ws, k)).h); return `<button class="eq-p ${who === m.nom ? 'on' : ''} ${hh > dispo + 0.01 ? 'over' : ''}" style="--c:${pColor(m.nom)}" data-a="eqWho" data-v="${esc(m.nom)}">${avatar(m.nom)}<span><b>${esc(m.nom.split(' ')[0])}</b><small>${fmtH(hh)} / ${fmtH(dispo)}</small></span></button>`; }).join('')}<button class="eq-p ${who === '_none' ? 'on' : ''}" style="--c:var(--late)" data-a="eqWho" data-v="_none"><span class="av" style="--c:var(--late)">?</span><span><b>À affecter</b><small>${toAssign.length}</small></span></button></div>`;
  if (toAssign.length && !who) h += `<div class="eq-assign"><div class="row"><b>${ic('alert')} ${toAssign.length} travail(x) sans personne</b><span class="sp"></span><button class="btn sm p" data-a="planAssign" data-id="${toAssign.map(i => i.id).join(',')}">Tout affecter</button></div><small>Prévus d’ici le ${dshort(we)} · touchez un travail pour l’affecter à quelqu’un</small></div>`;
  if (late.length) h += `<div class="eq-day late"><div class="eq-dh"><b>${ic('alert')} En retard</b><span>${late.length}</span></div>${eqGroups(late.sort((a, b) => a.date.localeCompare(b.date))).map(eqRow).join('')}</div>`;
  for (let k = 0; k < 7; k++) {
    const d = addDays(ws, k), items = week.filter(i => i.date === d);
    const isToday = d === TODAY;
    const avail = team().filter(m => !who || who === '_none' || m.nom === who).map(m => { const pd = personDay(m, d), pl = plannedH(m.nom, d); const over = pl > pd.h + 0.01; return `<button class="dv ${pd.absent ? 'abs' : pd.off ? 'off' : over ? 'over' : ''} ${pd.ex ? 'ex' : ''}" style="--c:${pColor(m.nom)}" data-a="dayEdit" data-n="${esc(m.nom)}" data-d="${d}">${avatar(m.nom, true)}<span>${pd.absent ? esc(pd.motif) : pd.off ? 'Repos' : `${fmtT(pd.deb)}–${fmtT(pd.fin)}`}${!pd.absent && !pd.off || pl ? `<small>${fmtH(pl)} / ${fmtH(pd.h)}</small>` : ''}</span></button>`; }).join('');
    h += `<div class="eq-day ${isToday ? 'today' : ''}"><div class="eq-dh"><b>${D(d).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'short' })}${isToday ? ' · aujourd’hui' : ''}</b><span>${items.length ? `${nfx(sum(items, i => i.heures), 1)} h de travaux` : ''}</span></div>${avail ? `<div class="dv-row">${avail}</div>` : ''}${items.length ? eqGroups(items).map(eqRow).join('') : `<div class="eq-empty">Aucun travail prévu</div>`}</div>`;
  }
  return h;
}
ACT.wk = d => { UI.f.wk = +d.d === 0 ? 0 : (+(UI.f.wk || 0) + +d.d); render(); };
ACT.eqWho = d => { UI.f.eqWho = UI.f.eqWho === d.v ? '' : d.v; render(); };
let PA = null;
ACT.planAssign = d => {
  const ivs = d.id.split(',').map(id => byId('interventions', id)).filter(Boolean); if (!ivs.length) return;
  const same = new Set(ivs.map(i => i.date)).size === 1;
  PA = { ivs, sel: [...new Set(ivs.flatMap(ivPeople))], date: same ? ivs[0].date : '' };
  if (!PA.sel.length) PA.sel = lastPeople();
  const render2 = () => { document.getElementById('paBox').innerHTML = `<div class="field"><span>Qui ?</span>${peoplePicker(PA.sel, 'paWho')}</div><div class="field mt"><span>Quand ?</span><div class="ob-chips">${[['', same ? 'Garder la date' : 'Garder les dates'], [TODAY, "Aujourd'hui"], [addDays(TODAY, 1), 'Demain'], [addDays(TODAY, 2), D(addDays(TODAY, 2)).toLocaleDateString('fr-FR', { weekday: 'long' })], [addDays(TODAY, 7), 'Dans 7 j']].map(([v, l]) => `<button type="button" class="fchip ${(PA.date === v || (!v && PA.date === (same ? ivs[0].date : ''))) ? 'on' : ''}" style="--c:var(--primary)" data-a="paDate" data-v="${v}">${l}</button>`).join('')}</div><input class="inp mt" type="date" id="paD" value="${PA.date}" style="margin-top:8px"></div>`; document.getElementById('paD').onchange = e => { PA.date = e.target.value; }; };
  ACT.paWho = x => { const i = PA.sel.indexOf(x.n); if (x.add) { if (i < 0) PA.sel.push(x.n); } else i >= 0 ? PA.sel.splice(i, 1) : PA.sel.push(x.n); render2(); };
  ACT.paDate = x => { PA.date = x.v || (same ? ivs[0].date : ''); render2(); };
  openModal({
    title: `${esc(ivs[0].label)}${ivs.length > 1 ? ` · ${ivs.length} travaux` : ''}`, body: `<p class="small muted" style="margin-top:0">${ivs.length > 1 ? `${ivs.length} travaux · ${nf(sum(ivs, i => i.surface), 1)} ha` : `${esc(parcName(ivs[0].parcelleId))} · ${nf(ivs[0].surface, 1)} ha`} · prévu ${same ? 'le ' + dfr(ivs[0].date) : 'à des dates différentes'}</p><div id="paBox"></div>`,
    foot: `${ivs.length === 1 ? `<button type="button" class="btn" data-a="paOpen" data-id="${ivs[0].id}">Détail</button>` : ''}<button class="btn p" type="submit" form="mf">${ic('check')} Enregistrer</button>`,
    onMount: render2,
    onSubmit: () => { if (!PA.sel.length) throw new Error('Choisissez au moins une personne'); const absent = PA.sel.filter(n => { const m = team().find(x => x.nom === n); return m && PA.ivs.some(i => { const pd = personDay(m, PA.date || i.date); return pd.absent || pd.off; }); }); if (absent.length) setTimeout(() => toast(`Attention : ${absent.join(', ')} ne travaille pas ce jour-là (absence ou repos)`, 'warn'), 300);
      PA.ivs.forEach(i => { i.personnes = [...PA.sel]; i.mo = PA.sel.join(', '); if (PA.date && PA.date !== i.date) { i.date = PA.date; i.custom = true; } }); rememberPeople(PA.sel); S.interventions.sort((a, b) => a.date.localeCompare(b.date)); commit(`Affecté à ${PA.sel.join(', ')}${PA.date ? ' · ' + dfr(PA.date) : ''}`); }
  });
};
ACT.paOpen = d => { closeModal(); openDrawer('intervention', d.id); };
function eqTeam() {
  const ws = weekStart(0), we = addDays(ws, 6);
  return `${team().map((m, i) => { const mine = S.interventions.filter(iv => ivPeople(iv).includes(m.nom) && iv.campagne === CURRENT_CAMP); const done = mine.filter(iv => iv.statut === 'realisee'); const wk = S.interventions.filter(iv => ivPeople(iv).includes(m.nom) && iv.date >= ws && iv.date <= we); return `<div class="eq-card" style="--c:${pColor(m.nom)}"><div class="row" data-a="personDetail" data-n="${esc(m.nom)}">${avatar(m.nom)}<div style="flex:1;min-width:0"><b>${esc(m.nom)}</b><small>${esc(m.role || '')}${m.taux ? ` · ${eur(m.taux, 2)}/h` : ''}</small></div><button class="btn sm icon g" data-a="eqEdit" data-i="${i}" aria-label="Modifier">${ic('edit')}</button></div>
    <button class="hw-sum" data-a="eqHours" data-i="${i}">${ic('clock')}<span>${weekSummary(m)}</span><b>Horaires ${ic('chevR')}</b></button>
    <div class="eq-stats"><div><b>${wk.length}</b><span>cette semaine</span></div><div><b>${nf(sum(wk, x => x.heures / Math.max(1, ivPeople(x).length)), 1)} h</b><span>prévues</span></div><div><b>${done.length}</b><span>réalisées (campagne)</span></div><div><b>${nf(sum(done, x => x.heures / Math.max(1, ivPeople(x).length)), 0)} h</b><span>travaillées</span></div></div></div>`; }).join('') || '<div class="card empty">Aucune personne. Ajoutez votre équipe.</div>'}
  <button class="btn mt" style="width:100%;height:48px;border-style:dashed" data-a="eqAddPerson">${ic('plus')} Ajouter une personne</button>
  <div class="formula">Heures : temps de chaque opération réparti entre les personnes affectées. Coût horaire facultatif, utilisé plus tard pour le coût de main-d’œuvre.</div>`;
}
function personForm(i) {
  const m = i != null ? team()[i] : { nom: '', role: 'Salarié', taux: '' };
  openModal({ title: i != null ? 'Modifier la personne' : 'Ajouter une personne', body: `<label class="field"><span>Prénom et nom</span><input class="inp" name="nom" value="${esc(m.nom)}" required></label><div class="field"><span>Rôle</span><div class="ob-chips" id="roleC">${ROLES.map(r => `<label class="fchip ${m.role === r ? 'on' : ''}" style="--c:var(--c-admin)"><input type="radio" name="role" value="${r}" ${m.role === r ? 'checked' : ''} hidden onchange="document.querySelectorAll('#roleC .fchip').forEach(x=>x.classList.toggle('on',x.contains(this)))">${r}</label>`).join('')}</div></div><label class="field"><span>Coût horaire chargé (€/h, facultatif)</span><input class="inp" name="taux" inputmode="decimal" value="${m.taux || ''}"></label>${i != null ? `<button type="button" class="btn d g mt" data-a="eqDel" data-i="${i}">${ic('trash')} Retirer de l’équipe</button>` : ''}`,
    onSubmit: f => { if (!f.nom?.trim()) throw new Error('Nom requis'); const nom = f.nom.trim(); const n = { nom, role: f.role || 'Salarié', taux: parseFloat(String(f.taux || '').replace(',', '.')) || 0 }; if (i != null) { const old = team()[i].nom; if (old !== nom) S.interventions.forEach(iv => { const pp = ivPeople(iv); if (pp.includes(old)) { iv.personnes = pp.map(x => x === old ? nom : x); iv.mo = iv.personnes.join(', '); } }); Object.assign(team()[i], n); } else S.exploitation.mainOeuvre.push(n); commit(i != null ? 'Personne modifiée' : 'Personne ajoutée'); } });
}
ACT.eqAddPerson = () => personForm(null);
ACT.eqEdit = (d, el, e) => { e.stopPropagation(); personForm(+d.i); };
ACT.eqDel = d => { S.exploitation.mainOeuvre.splice(+d.i, 1); closeModal(); commit('Personne retirée (son historique est conservé)'); };

/* =========================== EXPLOITATION =========================== */
VIEWS.exploitation = () => {
  const x = S.exploitation;
  const prop = sum(landParcels().filter(p => p.statutFoncier === 'propriete'), p => p.surface), ferm = sum(landParcels().filter(p => p.statutFoncier === 'fermage'), p => p.surface);
  return `${demoBar()}
  <div class="grid g-21">
    ${card('Fiche exploitation', `<div class="kv">
      ${[['Raison sociale', x.nom], ['Forme juridique', x.forme], ['Exploitant', x.exploitant], ['SIRET', x.siret], ['N° PACAGE', x.pacage], ['Certification', x.certification], ['Adresse', x.adresse], ['Téléphone', x.telephone], ['E-mail', x.email]].map(([k, v]) => `<div><span>${k}</span><b>${esc(v || '—')}</b></div>`).join('')}
    </div>`, { right: `<button class="btn sm" data-a="editFarm">${ic('edit')} Modifier</button>` })}
    ${card('Foncier', donut([{ label: 'Propriété', value: r2(prop), color: '#1C6A47' }, { label: 'Fermage', value: r2(ferm), color: '#C7B45A' }], { fmt: v => `${nf(v, 1)} ha`, size: 140, thick: 20 }))}
  </div>
  <div class="grid g-2 mt">
    ${card('Assolement par campagne', `<div class="tbl-wrap"><table class="t"><thead><tr><th>Culture</th>${[2025, 2026, 2027].map(c => `<th class="n">${campLabel(c)}</th>`).join('')}</tr></thead><tbody>
      ${Object.keys(CULTURES).filter(k => [2025, 2026, 2027].some(c => activeParcels(c).some(p => p.cultures[c]?.culture === k))).map(k => `<tr><td>${cultBadge(k)}</td>${[2025, 2026, 2027].map(c => { const v = sum(activeParcels(c).filter(p => p.cultures[c]?.culture === k), p => p.surface); return `<td class="n">${v ? nf(v, 1) + ' ha' : '—'}</td>`; }).join('')}</tr>`).join('')}
    </tbody><tfoot><tr><td>Total</td>${[2025, 2026, 2027].map(c => `<td class="n">${nf(sum(activeParcels(c).filter(p => p.cultures[c]), p => p.surface), 1)} ha</td>`).join('')}</tr></tfoot></table></div>`)}
    ${card('Équipe et suivi du travail <button class="lnk" data-a="go" data-r="equipe" style="margin-left:8px">Planning ' + ic('chevR') + '</button>', `<div class="list">${x.mainOeuvre.map((m, i) => { const mine = S.interventions.filter(iv => ivPeople(iv).includes(m.nom) && iv.campagne === CURRENT_CAMP); const done = mine.filter(iv => iv.statut === 'realisee'); return `<div class="li" data-a="personDetail" data-n="${esc(m.nom)}">${avatar(m.nom)}<div class="tx"><b>${esc(m.nom)}</b><span>${esc(m.role)} · ${done.length} réalisée(s) · ${nf(sum(done, iv => iv.heures), 1)} h · ${nf(sum(done, iv => iv.surface), 0)} ha · ${mine.length - done.length} à faire</span></div><button class="btn xs g" data-a="delMO" data-i="${i}" aria-label="Retirer">${ic('trash')}</button></div>`; }).join('')}</div><div class="formula">Campagne ${campLabel(CURRENT_CAMP)} · touchez une personne pour voir le détail de son travail.</div>`, { right: `<button class="btn sm" data-a="addMO">${ic('plus')} Ajouter</button>` })}
  </div>
  <div class="grid g-3 mt">
    ${[2025, 2026, 2027].map(c => { const E = econ(c); return card(`Campagne ${campLabel(c)}`, `<div class="stat-line"><span>Statut</span><b>${c === CURRENT_CAMP ? '<span class="badge info">En cours</span>' : c === CURRENT_CAMP - 1 ? '<span class="badge warn">Commercialisation</span>' : '<span class="badge">Clôturée</span>'}</b></div><div class="stat-line"><span>Surface</span><b>${nf(E.surface, 1)} ha</b></div><div class="stat-line"><span>Chiffre d'affaires</span><b>${eur(E.ca)}</b></div><div class="stat-line"><span>Charges</span><b>${eur(E.charges)}</b></div><div class="stat-line"><span>Résultat réalisé</span><b>${eur(E.resultatRealise)}</b></div>`); }).join('')}
  </div>`;
};
ACT.editFarm = () => { const x = S.exploitation; openModal({ title: "Modifier l'exploitation", body: `<div class="grid2">${[['nom', 'Raison sociale'], ['forme', 'Forme juridique'], ['exploitant', 'Exploitant'], ['siret', 'SIRET'], ['pacage', 'N° PACAGE'], ['certification', 'Certification'], ['telephone', 'Téléphone'], ['email', 'E-mail']].map(([k, l]) => `<label class="field"><span>${l}</span><input class="inp" name="${k}" value="${esc(x[k])}"></label>`).join('')}</div><label class="field"><span>Adresse</span><input class="inp" name="adresse" value="${esc(x.adresse)}"></label>`, onSubmit: d => { Object.assign(S.exploitation, d); commit('Exploitation mise à jour'); } }); };
ACT.addMO = () => openModal({ title: "Ajouter une personne", body: `<label class="field"><span>Nom</span><input class="inp" name="nom" required></label><div class="grid2"><label class="field"><span>Rôle</span><input class="inp" name="role" value="Salarié agricole"></label><label class="field"><span>Coût horaire chargé (€)</span><input class="inp" name="taux" type="number" step="0.01" min="0"></label></div>`, onSubmit: d => { if (!d.nom) throw new Error('Nom requis'); S.exploitation.mainOeuvre.push({ nom: d.nom, role: d.role, taux: +d.taux || 0 }); commit('Ajouté'); } });
ACT.delMO = (d, el, e) => { e.stopPropagation(); S.exploitation.mainOeuvre.splice(+d.i, 1); commit(); };
ACT.personDetail = d => { const mine = S.interventions.filter(iv => ivPeople(iv).includes(d.n)).sort((a, b) => b.date.localeCompare(a.date)); const done = mine.filter(i => i.statut === 'realisee'), todo = mine.filter(i => i.statut === 'planifiee').sort((a, b) => a.date.localeCompare(b.date)); const row = i => `<div class="mrow" style="--c:var(--c-cult)" data-a="openIvFromModal" data-id="${i.id}"><div class="ic">${ic(IV_ICON[i.type] || 'sprout')}</div><div class="tx"><b>${esc(i.label)}</b><span>${esc(parcName(i.parcelleId))} · ${dfr(i.date)}</span></div><div class="r"><b>${nfx(i.heures, 1)} h</b><span>${nf(i.surface, 1)} ha</span></div></div>`; openModal({ title: `${avatar(d.n)} ${esc(d.n)}`, body: `<div class="grid g-kpi" style="grid-template-columns:repeat(3,1fr)">${[['Réalisées', done.length], ['Heures', nf(sum(done, i => i.heures), 1)], ['Hectares', nf(sum(done, i => i.surface), 0)]].map(([l, v]) => `<div class="card pad" style="padding:12px"><div class="small muted">${l}</div><b style="font-size:20px">${v}</b></div>`).join('')}</div><div class="sec-h"><h3>À faire</h3><span class="muted small">${todo.length}</span></div><div class="card">${todo.slice(0, 20).map(row).join('') || '<div class="empty small">Rien de prévu</div>'}</div><div class="sec-h"><h3>Réalisé</h3><span class="muted small">${done.length}</span></div><div class="card">${done.slice(0, 40).map(row).join('') || '<div class="empty small">Aucune opération</div>'}</div>`, foot: '<button type="button" class="btn" data-a="closeModal">Fermer</button>' }); };

/* =========================== PARCELLAIRE =========================== */
let PROJ = null;
function project(extra = []) {
  const pts = landParcels().flatMap(p => p.coords || []).concat(extra);
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
  landParcels().forEach(p => {
    if (!(p.coords?.length >= 3)) return;
    const c = (zonesOf(p)[0] ? curCult(zonesOf(p)[0]) : curCult(p))?.culture; const col = CULTURES[c]?.color || '#9AA79F';
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
  const list = landParcels().filter(p => (!UI.f.parcCult || curCult(p)?.culture === UI.f.parcCult || zonesOf(p).some(z => curCult(z)?.culture === UI.f.parcCult)) && (!q || norm(p.nom + p.commune).includes(q)));
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
      : `<div class="card pad only-m"><div class="list">${list.map(p => parcLi(p)).join('') || '<div class="empty">Aucune parcelle</div>'}</div></div><div class="card only-d"><div class="tbl-wrap"><table class="t"><thead><tr><th>Parcelle</th><th>Commune</th><th class="n">Surface</th><th>Sol</th><th>Culture ${campLabel(CURRENT_CAMP)}</th><th>Variété</th><th>Semis</th><th class="n">Rdt prév.</th><th>Statut</th></tr></thead><tbody>
      ${list.flatMap(p => [p, ...zonesOf(p)]).map(p => { const c = curCult(p); if (zonesOf(p).length) return `<tr data-a="openParc" data-id="${p.id}"><td><div class="cell-main">${esc(p.nom)}</div><div class="cell-sub">îlot ${p.ilot} · ${zonesOf(p).length} cultures</div></td><td>${esc(p.commune)}</td><td class="n">${nf(p.surface, 2)} ha</td><td>${esc(p.sol)}</td><td colspan="5" class="muted small">Divisé en zones ↓</td></tr>`; return `<tr data-a="openParc" data-id="${p.id}" ${p.parentId ? 'class="zrow"' : ''}><td><div class="cell-main">${esc(p.nom)}</div><div class="cell-sub">${esc(p.cadastre || '')} · îlot ${p.ilot}</div></td><td>${esc(p.commune)}</td><td class="n">${nf(p.surface, 2)} ha</td><td>${esc(p.sol)}</td><td>${cultBadge(c?.culture)}</td><td>${esc(c?.variete || '—')}</td><td>${dfr(c?.semis)}</td><td class="n">${c?.rdtPrev ? nfx(c.rdtPrev, 1) + ' t/ha' : '—'}</td><td>${statutParc(p)}</td></tr>`; }).join('')}
      </tbody><tfoot><tr><td>Total</td><td></td><td class="n">${nf(sum(list, p => p.surface), 2)} ha</td><td colspan="6"></td></tr></tfoot></table></div></div>`}`;
};
const STADE = { travail_sol: ['Sol préparé', 'info'], preparation: ['Sol préparé', 'info'], semis: ['Semée', 'ok'], fertilisation: ['Fertilisée', 'ok'], desherbage: ['Désherbée', 'ok'], protection: ['Traitée', 'ok'], irrigation: ['Irriguée', 'ok'], recolte: ['Récoltée', ''], autre: ['En culture', 'ok'] };
/** État de la parcelle = dernière opération réalisée de la campagne en cours (stade + date). */
function parcState(p) {
  const c = curCult(p); if (!c) return { k: 'none', l: 'Non assolée', cls: '' };
  const ivs = S.interventions.filter(i => i.parcelleId === p.id && i.campagne === CURRENT_CAMP);
  const real = ivs.filter(i => i.statut === 'realisee').sort((a, b) => b.date.localeCompare(a.date) || (b.type === 'recolte') - (a.type === 'recolte'));
  if (real.some(i => i.type === 'recolte') || c.rdtReel) { const r = real.find(i => i.type === 'recolte'); return { k: 'recoltee', l: 'Récoltée', cls: '', d: r?.date }; }
  if (real.length) { const [l, cls] = STADE[real[0].type] || STADE.autre; return { k: real[0].type, l, cls, d: real[0].date }; }
  const planSemis = ivs.some(i => i.type === 'semis' && i.statut === 'planifiee');
  if (planSemis || c.semis > TODAY) return { k: 'asemer', l: 'À semer', cls: 'warn' };
  return { k: 'culture', l: 'En culture', cls: 'ok' };
}
/** Contrôle de cohérence : renvoie la raison si l'opération est illogique sur cette parcelle, sinon ''. */
function ivBlock(p, type, opts = {}) {
  const c = curCult(p); const ivs = S.interventions.filter(i => i.parcelleId === p.id && i.campagne === CURRENT_CAMP && i.id !== opts.except);
  const real = ivs.filter(i => i.statut === 'realisee');
  const rec = real.find(i => i.type === 'recolte'); const harvested = !!rec || !!c?.rdtReel;
  const sem = real.filter(i => i.type === 'semis').sort((a, b) => b.date.localeCompare(a.date))[0];
  const sown = !!sem || (!!c && c.semis <= TODAY && !ivs.some(i => i.type === 'semis' && i.statut === 'planifiee'));
  const h = rec ? ` le ${dshort(rec.date)}` : '';
  if (type === 'recolte') { if (!c) return 'non assolée'; if (harvested) return `déjà récoltée${h}`; if (!sown) return 'pas encore semée'; if (c.culture === 'jachere') return 'jachère'; }
  if (type === 'semis') { if (harvested) return `déjà récoltée${h} cette campagne`; if (sem && !opts.ressemis) return `déjà semée le ${dshort(sem.date)}`; }
  if (type === 'protection' || type === 'irrigation') { if (!c) return 'non assolée'; if (harvested) return `déjà récoltée${h}`; if (!sown) return 'pas encore semée'; }
  if (opts.date && type === 'recolte' && sem && opts.date < sem.date) return 'date avant le semis';
  return '';
}
const statutParc = p => { const s = parcState(p); return `<span class="badge ${s.cls}">${s.l}${s.d ? ` · ${dshort(s.d)}` : ''}</span>`; };
function lastOp(p) { return S.interventions.filter(i => i.parcelleId === p.id && i.statut === 'realisee').sort((a, b) => b.date.localeCompare(a.date))[0]; }
const zoneLi = z => { const c = curCult(z), col = CULTURES[c?.culture]?.color || '#999'; return `<div class="li zone" data-a="openParc" data-id="${z.id}"><span class="zl"></span><div class="ic" style="background:color-mix(in srgb,${col} 22%,transparent);color:${col}">${ic('wheat')}</div><div class="tx"><b>${esc(CULTURES[c?.culture]?.nom || z.nom)}</b><span>${nf(z.surface, 2)} ha</span></div>${statutParc(z)}<button class="btn sm icon" style="margin-left:4px" data-a="quickIv" data-pid="${z.id}" aria-label="Saisir une opération">${ic('plus')}</button></div>`; };
const parcLi = p => { const zs = zonesOf(p); if (zs.length) return `<div class="zgrp"><div class="li" data-a="openParc" data-id="${p.id}"><div class="ic" style="background:var(--surface-3);color:var(--text-2)">${ic('layers')}</div><div class="tx"><b>${esc(p.nom)}</b><span>${nf(p.surface, 2)} ha · ${zs.length} cultures dans ce champ</span></div></div>${zs.map(zoneLi).join('')}</div>`; const c = curCult(p); if (p.contourProvisoire) return `<div class="li"><div class="ic warn">${ic('pin')}</div><div class="tx" data-a="openParc" data-id="${p.id}"><b>${esc(p.nom)}</b><span>${nf(p.surface, 2)} ha · contour à dessiner</span></div><button class="btn sm" data-a="editContour" data-id="${p.id}">${ic('pin')} Dessiner</button></div>`; return `<div class="li" data-a="openParc" data-id="${p.id}"><div class="ic" style="background:color-mix(in srgb,${CULTURES[c?.culture]?.color || '#999'} 22%,transparent);color:${CULTURES[c?.culture]?.color}">${ic('wheat')}</div><div class="tx"><b>${esc(p.nom)}</b><span>${nf(p.surface, 2)} ha · ${esc(CULTURES[c?.culture]?.nom || 'Non assolée')}</span></div>${statutParc(p)}<button class="btn sm icon" style="margin-left:4px" data-a="quickIv" data-pid="${p.id}" aria-label="Saisir une opération">${ic('plus')}</button></div>`; };
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
      const ilotN = S.parcelles.filter(x => !x.parentId && x.ilot === pp.ilot); if (!pp.numPac) pp.numPac = `${pp.ilot}.${ilotN.length}`;
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
/**
 * Applique l'itinéraire type d'une culture aux parcelles (campagne en cours) :
 * - crée les travaux manquants (datés à partir d'aujourd'hui ; les étapes déjà passées sont ignorées),
 * - met à jour les travaux encore planifiés issus de l'ITK (date, produits, doses, matériel),
 * - supprime les travaux planifiés dont l'étape a été retirée de l'ITK.
 * Les travaux réalisés ne sont jamais modifiés.
 */
function syncItkParcel(p, camp = CURRENT_CAMP) {
  const rec = p.cultures[camp]; const itk = rec && S.itk[rec.culture]; const r = { created: 0, updated: 0, removed: 0, past: 0 };
  if (!itk) return r;
  const labels = itk.steps.map(s => s.label);
  itk.steps.forEach(sp => {
    const date = addDays(rec.semis, sp.off);
    let ex = S.interventions.filter(i => i.parcelleId === p.id && i.campagne === camp && i.label === sp.label);
    if (!ex.length) { const same = S.interventions.filter(i => i.parcelleId === p.id && i.campagne === camp && i.type === sp.type && i.statut === 'realisee' && (['semis', 'recolte'].includes(sp.type) || Math.abs(daysBetween(i.date, date)) <= 20)); if (same.length) return; }
    const prods = sp.produits.filter(x => byId('stock', x.itemId)).map(x => ({ ...x })), mats = sp.materiels.filter(m => byId('materiel', m));
    if (ex.length) { ex.filter(i => i.statut === 'planifiee' && i.fromItk && !i.custom).forEach(i => { Object.assign(i, { type: sp.type, date: date < TODAY && i.date >= TODAY ? i.date : date, produits: prods, materiels: mats, heures: r2(sp.hHa * p.surface, 1), surface: p.surface }); r.updated++; }); return; }
    if (date < TODAY) { r.past++; return; }
    S.interventions.push({ id: uid('iv'), campagne: camp, parcelleId: p.id, date, type: sp.type, label: sp.label, statut: 'planifiee', surface: p.surface, produits: prods, materiels: mats, heures: r2(sp.hHa * p.surface, 1), mo: '', meteo: '', obs: '', photos: [], fromItk: true });
    r.created++;
  });
  const before = S.interventions.length;
  S.interventions = S.interventions.filter(i => !(i.parcelleId === p.id && i.campagne === camp && i.statut === 'planifiee' && i.fromItk && !i.custom && !labels.includes(i.label)));
  r.removed = before - S.interventions.length;
  if (!rec.recoltePrev) { const rs = itk.steps.find(s => s.type === 'recolte'); if (rs) rec.recoltePrev = addDays(rec.semis, rs.off); }
  S.interventions.sort((a, b) => a.date.localeCompare(b.date));
  return r;
}
function syncItkCulture(culture) {
  const tot = { created: 0, updated: 0, removed: 0, past: 0, parcelles: 0 };
  activeParcels().filter(p => p.cultures[CURRENT_CAMP]?.culture === culture).forEach(p => { const r = syncItkParcel(p); tot.parcelles++; ['created', 'updated', 'removed', 'past'].forEach(k => tot[k] += r[k]); });
  return tot;
}
const syncMsg = t => t.parcelles ? `Itinéraire appliqué à ${t.parcelles} parcelle(s) : ${t.created} travail(x) créé(s)${t.updated ? `, ${t.updated} mis à jour` : ''}${t.removed ? `, ${t.removed} retiré(s)` : ''}${t.past ? ` · ${t.past} étape(s) déjà passée(s) non créée(s)` : ''}` : 'Itinéraire enregistré (aucune parcelle de cette culture cette campagne)';
function generateFromItk(p, camp) { return syncItkParcel(p, camp).created; }
ACT.delParc = d => openModal({ title: 'Supprimer la parcelle ?', body: `<p>La parcelle <b>${esc(parcName(d.id))}</b> et ses interventions <b>planifiées</b> seront supprimées. Les interventions réalisées sont conservées dans l'historique des stocks.</p>`, submit: 'Supprimer', onSubmit: () => { const ids = [d.id, ...S.parcelles.filter(z => z.parentId === d.id).map(z => z.id)]; S.parcelles = S.parcelles.filter(p => !ids.includes(p.id)); S.interventions = S.interventions.filter(i => !(ids.includes(i.parcelleId) && i.statut === 'planifiee')); closeDrawer(); commit('Parcelle supprimée'); } });
ACT.exportParc = () => copyText(toCSV([['Nom', 'Commune', 'Cadastre', 'Ilot', 'N° PAC', 'Surface (ha)', 'Sol', 'Statut foncier', 'Latitude', 'Longitude', `Culture ${campLabel(CURRENT_CAMP)}`, 'Code PAC', 'Variété', 'Semis'], ...activeParcels().map(p => { const c = curCult(p); return [p.nom, p.commune, p.cadastre, p.ilot, p.numPac, String(p.surface).replace('.', ','), p.sol, p.statutFoncier, p.centre?.[0], p.centre?.[1], CULTURES[c?.culture]?.nom || '', CULTURES[c?.culture]?.pac || '', c?.variete || '', c?.semis || '']; })]), 'Parcellaire copié au format CSV (séparateur ;)');
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

const OP_TYPES = [['protection', 'Traitement'], ['desherbage', 'Désherbage'], ['fertilisation', 'Engrais'], ['semis', 'Semis'], ['travail_sol', 'Travail du sol'], ['irrigation', 'Irrigation'], ['recolte', 'Récolte'], ['autre', 'Autre']];
DRAWERS.parcelle = id => {
  const p = byId('parcelles', id); if (!p) return null;
  if (zonesOf(p).length) return zonesDrawer(p);
  const t = UI.drawer.tab || 'ops', c = curCult(p);
  const camps = Object.keys(p.cultures).map(Number).sort((a, b) => b - a);
  let body = tabsBar('dp', [['ops', 'Opérations'], ['fiche', 'Fiche'], ['interventions', 'Travaux'], ['historique', 'Historique'], ['eco', 'Économie']], t, true);
  if (t === 'ops') {
    const col = CULTURES[c?.culture]?.color || 'var(--primary)';
    const same = c ? activeParcels().filter(x => curCult(x)?.culture === c.culture) : [];
    const next = S.interventions.filter(i => i.parcelleId === p.id && i.statut === 'planifiee').sort((a, b) => a.date.localeCompare(b.date)).slice(0, 4);
    const last = S.interventions.filter(i => i.parcelleId === p.id && i.statut === 'realisee').sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);
    body += `<div class="pcard" style="--c:${col}"><div class="row"><span class="sw"></span><div style="flex:1;min-width:0"><b>${esc(CULTURES[c?.culture]?.nom || 'Non assolée')}${c?.variete ? ` · ${esc(c.variete)}` : ''}</b><span>${nf(p.surface, 2)} ha${p.commune ? ' · ' + esc(p.commune) : ''}${c?.semis ? ` · semis ${c.semisFait ? 'fait le' : 'prévu le'} ${dshort(c.semis)}` : ''}</span>${(() => { const l = lastOp(p); return l ? `<span>Dernière opération : <b style="display:inline;font-size:inherit">${esc(l.label)}</b> · ${dshort(l.date)}</span>` : ''; })()}</div>${statutParc(p)}</div></div>
    <div class="sec-h" style="margin-top:16px"><h3>Saisir une opération</h3></div>
    <div class="op-grid">${OP_TYPES.map(([k, l]) => `<button class="op" data-a="quickIv" data-pid="${p.id}" data-type="${k}"><span class="ti">${ic(IV_ICON[k])}</span>${l}</button>`).join('')}</div>
    ${same.length > 1 ? `<button class="btn mt" style="width:100%;justify-content:flex-start" data-a="quickIv" data-pids="${same.map(x => x.id).join(',')}">${ic('layers')} Même opération sur tout le ${esc(CULTURES[c.culture].nom.toLowerCase())} · ${same.length} parcelles · ${nf(sum(same, x => x.surface), 1)} ha</button>` : ''}
    ${p.parentId ? `<div class="note info mt">${ic('layers')}<span>Zone du champ <b>${esc(parcName(p.parentId))}</b> (${zonesOf(byId('parcelles', p.parentId)).length} cultures cette campagne).</span><button class="btn sm" data-a="openParc" data-id="${p.parentId}">Voir le champ</button></div>` : `<button class="btn mt" style="width:100%;justify-content:flex-start" data-a="divParc" data-id="${p.id}">${ic('layers')} Plusieurs cultures dans ce champ</button>`}
    <div class="sec-h"><h3>Prévu</h3><span class="sp"></span>${next.length ? `<button class="lnk" data-a="tab" data-k="dp" data-v="interventions" data-drawer="1">Tout ${ic('chevR')}</button>` : ''}</div>
    <div class="card">${next.map(i => { const d = dueInfo(i.date); return `<div class="mrow" style="--c:var(--c-cult)"><div class="ic" data-a="openIv" data-id="${i.id}">${ic(IV_ICON[i.type] || 'sprout')}</div><div class="tx" data-a="openIv" data-id="${i.id}"><b>${esc(i.label)}</b><span>${dfr(i.date)}${i.produits.length ? ' · ' + i.produits.map(x => esc(byId('stock', x.itemId)?.nom || '')).join(', ') : ''}</span></div><div class="r" style="display:flex;flex-direction:column;align-items:flex-end;gap:6px"><span class="due ${d.urgence === 'ok' ? '' : d.urgence}">${esc(d.echeance)}</span><button class="act-s" data-a="validateIv" data-id="${i.id}">Fait</button></div></div>`; }).join('') || `<div class="empty small">Aucune opération prévue.${c ? ` <button class="lnk" data-a="genItk" data-id="${p.id}">Générer depuis l’itinéraire type</button>` : ''}</div>`}</div>
    ${last.length ? `<div class="sec-h"><h3>Dernières opérations</h3></div><div class="card">${last.map(i => `<div class="mrow" style="--c:var(--c-cult)" data-a="openIv" data-id="${i.id}"><div class="ic">${ic(IV_ICON[i.type] || 'sprout')}</div><div class="tx"><b>${esc(i.label)}</b><span>${dfr(i.date)}</span></div><div class="r"><b>${eur(i.coutIntrants)}</b><span>${eur(i.coutIntrants / i.surface)}/ha</span></div></div>`).join('')}</div>` : ''}`;
  } else if (t === 'fiche') {
    body += `<div class="card pad"><div class="kv">${[['Surface', `${nf(p.surface, 2)} ha`], ['Surface graphique', p.contourProvisoire ? 'contour à dessiner' : `${nf(areaHa(p.coords), 2)} ha`], ['Commune', p.commune || '—'], ['Réf. cadastrale', p.cadastre || '—'], ['Type de sol', p.sol || '—'], ['Statut foncier', { propriete: 'Propriété', fermage: 'Fermage', autre: 'Autre' }[p.statutFoncier] || '—'], ['Îlot / n° PAC', `${p.ilot} / ${p.numPac || '—'}`], ['GPS (centre)', p.centre && !p.contourProvisoire ? `${p.centre[0]}, ${p.centre[1]}` : '—']].map(([k, v]) => `<div><span>${k}</span><b>${esc(v)}</b></div>`).join('')}</div></div>
    <div class="card pad mt"><div class="row mb"><b>Culture ${campLabel(CURRENT_CAMP)}</b><span class="sp"></span>${statutParc(p)}</div>${c ? `<div class="kv">${[['Culture', CULTURES[c.culture]?.nom], ['Variété', c.variete || '—'], ['Semis', dfr(c.semis)], ['Récolte prévue', dfr(c.recoltePrev)], ['Rendement prévisionnel', c.rdtPrev ? `${nfx(c.rdtPrev, 1)} t/ha` : '—'], ['Rendement réel', c.rdtReel ? `${nfx(c.rdtReel, 2)} t/ha` : '—'], ['Production prévue', c.rdtPrev ? `${nf(c.rdtPrev * p.surface, 1)} t` : '—']].map(([k, v]) => `<div><span>${k}</span><b>${esc(v)}</b></div>`).join('')}</div>` : '<div class="muted">Aucune culture déclarée pour la campagne en cours.</div>'}</div>
    ${p.contourProvisoire ? `<div class="note warn mt">${ic('map')}<span>Contour provisoire, non placé sur la carte. Touchez « Dessiner le contour » puis placez les sommets sur la vue satellite.</span></div>` : ''}
    <div class="row wrap mt"><button class="btn" data-a="editParc" data-id="${p.id}">${ic('edit')} Modifier</button><button class="btn" data-a="editContour" data-id="${p.id}">${ic('map')} ${p.contourProvisoire ? 'Dessiner le contour' : 'Modifier le contour'}</button>${c ? `<button class="btn" data-a="genItk" data-id="${p.id}">${ic('sprout')} Générer l'ITK</button>` : ''}<span class="sp"></span>${p.parentId ? '' : `<button class="btn g" data-a="terreOut" data-id="${p.id}">${ic('minus')} Retirer des terres</button>`}<button class="btn d g" data-a="delParc" data-id="${p.id}">${ic('trash')}</button></div>`;
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
/* ---------- Plusieurs cultures dans un champ (zones de culture par campagne) ---------- */
const zoneHasDone = z => S.interventions.some(i => i.parcelleId === z.id && i.statut === 'realisee' && i.campagne === CURRENT_CAMP);
function zonesDrawer(p) {
  const zs = zonesOf(p), tot = sum(zs, z => z.surface);
  const body = `<div class="card pad mb"><div class="row"><div class="ic" style="width:42px;height:42px;border-radius:12px;display:grid;place-items:center;background:var(--surface-3)">${ic('layers')}</div><div style="flex:1;min-width:0"><b>${zs.length} cultures dans ce champ</b><div class="small muted">Campagne ${campLabel(CURRENT_CAMP)} · ${nf(tot, 2)} ha répartis sur ${nf(p.surface, 2)} ha${p.commune ? ' · ' + esc(p.commune) : ''}</div></div></div>
    <div class="zbar mt">${zs.map(z => `<i style="flex:${z.surface};background:${CULTURES[curCult(z)?.culture]?.color || '#999'}" title="${esc(CULTURES[curCult(z)?.culture]?.nom || '')}"></i>`).join('')}</div></div>
    <div class="note info mb">${ic('info')}<span>Chaque zone se gère comme une parcelle : opérations, stade, itinéraire, coûts. Touchez une zone pour l’ouvrir.</span></div>
    <div class="card">${zs.map(zoneLi).join('')}</div>
    <div class="row wrap mt"><button class="btn" data-a="divParc" data-id="${p.id}">${ic('edit')} Modifier la répartition</button><button class="btn" data-a="quickIv" data-pids="${zs.map(z => z.id).join(',')}">${ic('plus')} Opération sur tout le champ</button><span class="sp"></span><button class="btn g" data-a="joinParc" data-id="${p.id}" ${zs.some(zoneHasDone) ? 'disabled title="Des opérations ont été réalisées sur les zones"' : ''}>${ic('undo')} Réunir</button></div>
    <div class="row wrap mt"><button class="btn sm" data-a="editParc" data-id="${p.id}">${ic('edit')} Fiche du champ</button><button class="btn sm" data-a="editContour" data-id="${p.id}">${ic('map')} Contour</button></div>`;
  return { title: `${esc(p.nom)} <span class="muted small">· ${nf(p.surface, 2)} ha</span>`, body };
}
let DIV = null;
ACT.divParc = d => {
  let p = byId('parcelles', d.id); if (p.parentId) p = byId('parcelles', p.parentId);
  const zs = zonesOf(p);
  if (!zs.length && S.interventions.some(i => i.parcelleId === p.id && i.statut === 'realisee' && i.campagne === CURRENT_CAMP)) { toast('Des opérations ont déjà été réalisées sur ce champ cette campagne : la répartition doit être faite avant le premier travail.', 'warn'); return; }
  const c0 = curCult(p);
  DIV = { pid: p.id, rows: zs.length ? zs.map(z => ({ id: z.id, culture: curCult(z).culture, surface: z.surface, variete: curCult(z).variete || '', lock: zoneHasDone(z) })) : [{ culture: c0?.culture || '', surface: r2(p.surface / 2, 2), variete: c0?.variete || '' }, { culture: '', surface: r2(p.surface - r2(p.surface / 2, 2), 2), variete: '' }] };
  openModal({ title: `Cultures dans ${esc(p.nom)}`, body: '<div id="divB"></div>', submit: 'Enregistrer', wide: true, onMount: renderDiv, onSubmit: submitDiv });
};
function renderDiv() {
  const p = byId('parcelles', DIV.pid), tot = r2(sum(DIV.rows, r => +r.surface || 0), 2), rest = r2(p.surface - tot, 2);
  const farm = [...new Set(activeParcels().map(x => curCult(x)?.culture).filter(Boolean))];
  const cOpts = v => `<option value="">Choisir…</option>${farm.length ? `<optgroup label="Mes cultures">${opts(farm.map(k => [k, CULTURES[k].nom]), v)}</optgroup>` : ''}<optgroup label="Autres">${opts(Object.keys(CULTURES).filter(k => !farm.includes(k)).map(k => [k, CULTURES[k].nom]), v)}</optgroup>`;
  document.getElementById('divB').innerHTML = `<p class="small muted" style="margin-top:0">Campagne ${campLabel(CURRENT_CAMP)} · champ de <b>${nf(p.surface, 2)} ha</b>. Chaque culture devient une zone suivie séparément (stade, travaux, coûts).</p>
  <div class="zbar mb">${DIV.rows.map(r => `<i style="flex:${Math.max(+r.surface || 0, 0)};background:${CULTURES[r.culture]?.color || 'var(--surface-3)'}"></i>`).join('')}${rest > 0 ? `<i style="flex:${rest};background:repeating-linear-gradient(45deg,var(--surface-3) 0 6px,transparent 6px 12px)"></i>` : ''}</div>
  ${DIV.rows.map((r, i) => `<div class="div-row" style="--c:${CULTURES[r.culture]?.color || 'var(--line)'}"><span class="sw"></span><select class="inp" data-ch="divC" data-i="${i}" ${r.lock ? 'disabled' : ''}>${cOpts(r.culture)}</select><div class="div-ha"><input class="inp" type="number" step="0.01" min="0.01" inputmode="decimal" value="${r.surface}" data-in="divS" data-i="${i}"><span>ha</span></div><input class="inp div-v" placeholder="Variété (facultatif)" value="${esc(r.variete)}" data-in="divV" data-i="${i}" ${r.lock ? 'disabled' : ''}>${!r.lock && DIV.rows.length > 2 ? `<button type="button" class="btn sm icon g" data-a="divDel" data-i="${i}" aria-label="Retirer">${ic('x')}</button>` : r.lock ? `<span class="badge" title="Opérations réalisées">${ic('check')}</span>` : ''}</div>`).join('')}
  <div class="row mt"><button type="button" class="btn sm" data-a="divAdd">${ic('plus')} Ajouter une culture</button><span class="sp"></span><span id="divRest" class="small ${Math.abs(rest) < 0.011 ? 'ok-t' : 'warn-t'}"><b>${Math.abs(rest) < 0.011 ? 'Surface entièrement répartie' : rest > 0 ? `${nf(rest, 2)} ha à répartir` : `${nf(-rest, 2)} ha en trop`}</b></span>${Math.abs(rest) >= 0.011 ? `<button type="button" class="lnk" data-a="divFill">Ajuster la dernière</button>` : ''}</div>`;
}
CH.divC = (el) => { DIV.rows[+el.dataset.i].culture = el.value; renderDiv(); };
IN.divS = (el) => { DIV.rows[+el.dataset.i].surface = el.value; const p = byId('parcelles', DIV.pid), rest = r2(p.surface - sum(DIV.rows, r => +r.surface || 0), 2); const e = document.getElementById('divRest'); if (e) { e.className = 'small ' + (Math.abs(rest) < 0.011 ? 'ok-t' : 'warn-t'); e.innerHTML = `<b>${Math.abs(rest) < 0.011 ? 'Surface entièrement répartie' : rest > 0 ? `${nf(rest, 2)} ha à répartir` : `${nf(-rest, 2)} ha en trop`}</b>`; } };
IN.divV = (el) => { DIV.rows[+el.dataset.i].variete = el.value; };
ACT.divAdd = () => { DIV.rows.push({ culture: '', surface: 0, variete: '' }); renderDiv(); };
ACT.divDel = d => { DIV.rows.splice(+d.i, 1); renderDiv(); };
ACT.divFill = () => { const p = byId('parcelles', DIV.pid); const last = [...DIV.rows].reverse().find(r => !r.lock) || DIV.rows[DIV.rows.length - 1]; const others = sum(DIV.rows.filter(r => r !== last), r => +r.surface || 0); last.surface = r2(p.surface - others, 2); renderDiv(); };
function submitDiv() {
  const p = byId('parcelles', DIV.pid), camp = CURRENT_CAMP, rows = DIV.rows.map(r => ({ ...r, surface: r2(+r.surface || 0, 2) }));
  if (rows.length < 2) throw new Error('Indiquez au moins deux cultures (sinon, modifiez simplement la culture de la parcelle)');
  if (rows.some(r => !r.culture)) throw new Error('Choisissez une culture pour chaque zone');
  if (rows.some(r => r.surface <= 0)) throw new Error('Chaque zone doit avoir une surface');
  if (new Set(rows.map(r => r.culture)).size < rows.length) throw new Error('Deux zones ont la même culture : réunissez-les en une seule');
  const tot = r2(sum(rows, r => r.surface), 2); if (Math.abs(tot - p.surface) > 0.011) throw new Error(`Les zones totalisent ${nf(tot, 2)} ha pour un champ de ${nf(p.surface, 2)} ha`);
  const old = zonesOf(p, camp);
  if (!old.length) { // première division : la culture du champ est mise de côté
    p.divisions = p.divisions || {}; p.divisions[camp] = { prev: p.cultures[camp] || null, date: TODAY };
    delete p.cultures[camp];
    S.interventions = S.interventions.filter(i => !(i.parcelleId === p.id && i.campagne === camp && i.statut === 'planifiee'));
  }
  old.filter(z => !rows.some(r => r.id === z.id)).forEach(z => { S.parcelles = S.parcelles.filter(x => x.id !== z.id); S.interventions = S.interventions.filter(i => i.parcelleId !== z.id || i.statut === 'realisee'); });
  const L = 'ABCDEFGHIJ'; let created = 0;
  rows.forEach((r, k) => {
    let z = r.id && byId('parcelles', r.id);
    if (!z) { z = { id: uid('p'), parentId: p.id, coords: [], centre: p.centre, commune: p.commune, cadastre: p.cadastre, ilot: p.ilot, sol: p.sol, statutFoncier: p.statutFoncier, notes: '', cultures: {} }; S.parcelles.push(z); created++; }
    const changed = z.cultures[camp]?.culture && z.cultures[camp].culture !== r.culture;
    if (changed) S.interventions = S.interventions.filter(i => !(i.parcelleId === z.id && i.statut === 'planifiee'));
    z.nom = `${p.nom} · ${CULTURES[r.culture].nom}`; z.surface = r.surface; z.numPac = `${p.numPac || p.ilot}${L[k] || k}`;
    z.cultures[camp] = { ...(z.cultures[camp] && !changed ? z.cultures[camp] : newCultRec(r.culture, camp, { semis: p.divisions[camp]?.prev?.culture === r.culture ? p.divisions[camp].prev.semis : undefined })), culture: r.culture, variete: r.variete || '' }; if (!z.cultures[camp].semis) z.cultures[camp].semis = newCultRec(r.culture, camp).semis;
    syncItkParcel(z);
  });
  DIV = null; commit(`${rows.length} cultures dans ${p.nom}${created ? ` · ${created} zone(s) créée(s)` : ''}`); openDrawer('parcelle', p.id);
}
ACT.joinParc = d => { const p = byId('parcelles', d.id), zs = zonesOf(p); if (zs.some(zoneHasDone)) { toast('Impossible : des opérations ont été réalisées sur les zones', 'warn'); return; } openModal({ title: 'Réunir le champ ?', body: `<p>Les ${zs.length} zones de <b>${esc(p.nom)}</b> et leurs travaux prévus seront supprimés. Le champ redevient une seule parcelle${p.divisions?.[CURRENT_CAMP]?.prev ? ` en <b>${esc(CULTURES[p.divisions[CURRENT_CAMP].prev.culture]?.nom)}</b>` : ' non assolée'}.</p>`, submit: 'Réunir', onSubmit: () => { const ids = zs.map(z => z.id); S.parcelles = S.parcelles.filter(x => !ids.includes(x.id)); S.interventions = S.interventions.filter(i => !ids.includes(i.parcelleId)); const prev = p.divisions[CURRENT_CAMP].prev; if (prev) p.cultures[CURRENT_CAMP] = prev; delete p.divisions[CURRENT_CAMP]; if (prev) syncItkParcel(p); commit('Champ réuni'); openDrawer('parcelle', p.id); } }); };

ACT.genItk = d => { const p = byId('parcelles', d.id); const r = syncItkParcel(p); commit(r.created || r.updated ? `${r.created} travail(x) créé(s)${r.updated ? `, ${r.updated} mis à jour` : ''}${r.past ? ` · ${r.past} étape(s) passée(s) ignorée(s)` : ''}` : r.past ? `Aucune étape à venir : ${r.past} étape(s) déjà passée(s) (dates calculées depuis le semis)` : 'L’itinéraire est vide ou déjà appliqué'); };
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
/* ---- Itinéraires techniques : un ITK par culture, détaillable par parcelle ---- */
VIEWS.itk = () => {
  if (UI.f.itkP && byId('parcelles', UI.f.itkP)) return itkParcelView(byId('parcelles', UI.f.itkP));
  if (UI.f.itkC && S.itk[UI.f.itkC]) return itkCultureView(UI.f.itkC);
  const farm = assolement(CURRENT_CAMP).map(a => a.key).filter(k => S.itk[k]);
  const missing = assolement(CURRENT_CAMP).map(a => a.key).filter(k => !S.itk[k]);
  const others = Object.keys(S.itk).filter(k => !farm.includes(k));
  return `<p class="itk-intro">Un itinéraire type par culture. Il crée automatiquement les travaux prévus de vos parcelles ; vous pouvez ensuite l’ajuster parcelle par parcelle.</p>
  <div class="itk-cards">${farm.map(itkCard).join('') || '<div class="card empty">Aucune culture assolée cette campagne.</div>'}</div>
  ${missing.length ? `<div class="sec-h"><h3>Sans itinéraire</h3></div><div class="fchips">${missing.map(k => `<button class="fchip" style="--c:${CULTURES[k].color}" data-a="itkCreate" data-c="${k}">${ic('plus')} ${CULTURES[k].nom}</button>`).join('')}</div>` : ''}
  ${others.length ? `<div class="sec-h"><h3>Autres itinéraires types</h3><span class="muted small">cultures non assolées</span></div><div class="fchips">${others.map(k => `<button class="fchip" style="--c:${CULTURES[k]?.color}" data-a="itkOpen" data-c="${k}"><span class="cat-dot" style="--c:${CULTURES[k]?.color}"></span>${esc(CULTURES[k]?.nom || k)} · ${S.itk[k].steps.length} ét.</button>`).join('')}</div>` : ''}
  <button class="btn mt2" style="width:100%;height:48px;border-style:dashed" data-a="itkNewPick">${ic('plus')} Créer un itinéraire pour une autre culture</button>`;
};
function itkStats(k) {
  const ps = activeParcels().filter(p => p.cultures[CURRENT_CAMP]?.culture === k);
  const ivs = S.interventions.filter(i => i.campagne === CURRENT_CAMP && ps.some(p => p.id === i.parcelleId));
  const next = ivs.filter(i => i.statut === 'planifiee').sort((a, b) => a.date.localeCompare(b.date))[0];
  return { ps, ivs, done: ivs.filter(i => i.statut === 'realisee').length, next };
}
function itkCard(k) {
  const t = S.itk[k], c = CULTURES[k], st = itkStats(k);
  return `<button class="itk-card" style="--c:${c.color}" data-a="itkOpen" data-c="${k}"><div class="row"><span class="sw"></span><b>${esc(c.nom)}</b><span class="sp"></span>${ic('chevR')}</div>
  <div class="itk-meta"><span><b>${t.steps.length}</b> étapes</span><span><b>${st.ps.length}</b> parcelle${st.ps.length > 1 ? 's' : ''}</span><span><b>${nf(sum(st.ps, p => p.surface), 1)}</b> ha</span></div>
  ${st.ivs.length ? `<div class="bar" style="margin:10px 0 6px"><i style="width:${st.done / st.ivs.length * 100}%;background:var(--c)"></i></div><div class="small muted">${st.done}/${st.ivs.length} travaux réalisés</div>` : `<div class="small muted" style="margin-top:8px">${t.steps.length ? 'Aucun travail prévu' : 'Itinéraire à construire'}</div>`}
  ${st.next ? `<div class="itk-next">${ic(IV_ICON[st.next.type] || 'sprout')}<span>Prochain : <b>${esc(st.next.label)}</b> · ${dshort(st.next.date)}</span></div>` : ''}</button>`;
}
ACT.itkOpen = d => { UI.f.itkC = d.c; UI.f.itkP = null; render(); window.scrollTo(0, 0); };
ACT.itkBack = () => { if (UI.f.itkP) UI.f.itkP = null; else UI.f.itkC = null; render(); window.scrollTo(0, 0); };
ACT.itkCreate = d => { S.itk[d.c] = S.itk[d.c] || { culture: d.c, semisType: '03-15', steps: [] }; UI.f.itkC = d.c; commit('Itinéraire créé : ajoutez vos étapes'); };
ACT.itkNewPick = () => openModal({ title: 'Créer un itinéraire', body: `<div class="ob-chips">${Object.keys(CULTURES).filter(k => !S.itk[k]).map(k => `<button type="button" class="fchip" style="--c:${CULTURES[k].color}" data-a="itkCreateM" data-c="${k}"><span class="cat-dot" style="--c:${CULTURES[k].color}"></span>${CULTURES[k].nom}</button>`).join('') || '<span class="muted">Toutes les cultures ont déjà un itinéraire.</span>'}</div>`, foot: '' });
ACT.itkCreateM = d => { closeModal(); ACT.itkCreate(d); };
function itkCultureView(k) {
  const t = S.itk[k], c = CULTURES[k], st = itkStats(k);
  const steps = [...t.steps].sort((a, b) => a.off - b.off);
  const semis = st.ps[0]?.cultures[CURRENT_CAMP]?.semis || `${+t.semisType.slice(0, 2) >= 8 ? CURRENT_CAMP - 1 : CURRENT_CAMP}-${t.semisType}`;
  const costs = steps.map(stepCostHa);
  return `<button class="lnk-back" data-a="itkBack">${ic('chevL')} Itinéraires</button>
  <div class="itk-head" style="--c:${c.color}"><div class="row"><span class="sw"></span><div style="flex:1"><b>${esc(c.nom)}</b><span>${steps.length} étapes · ${st.ps.length} parcelle(s) · ${nf(sum(st.ps, p => p.surface), 1)} ha</span></div></div>
    <div class="row mt" style="gap:8px"><button class="btn sm" data-a="itkSemis" data-c="${k}">${ic('calendar')} Semis : ${dfr(semis)}</button><span class="small muted">≈ ${eur(sum(costs, x => x.intr))}/ha d’intrants</span></div></div>
  <div class="sec-h"><h3>Étapes</h3><span class="sp"></span><button class="lnk" data-a="itkStep" data-c="${k}">${ic('plus')} Ajouter</button></div>
  <div class="itk-line">${steps.map((sp, i) => `<button class="itk-step" data-a="itkStep" data-c="${k}" data-s="${sp.id}"><span class="dot">${ic(IV_ICON[sp.type] || 'sprout')}</span><span class="body"><span class="when">${sp.off === 0 ? 'Jour du semis' : sp.off < 0 ? `${-sp.off} j avant semis` : `${sp.off} j après semis`} · ≈ ${dshort(addDays(semis, sp.off))}</span><b>${esc(sp.label)}</b><small>${sp.produits.map(x => { const it = byId('stock', x.itemId); return it ? `${esc(it.nom)} · ${nfx(x.dose, 2)} ${it.unite}/ha` : ''; }).filter(Boolean).join('<br>') || INTER_TYPES[sp.type]}</small></span>${ic('chevR')}</button>`).join('') || '<div class="card empty">Aucune étape. Touchez « Ajouter » pour construire l’itinéraire.</div>'}</div>
  <button class="btn mt" style="width:100%;height:46px;border-style:dashed" data-a="itkStep" data-c="${k}">${ic('plus')} Ajouter une étape</button>
  ${st.ps.length ? `<div class="sec-h"><h3>Par parcelle</h3><span class="muted small">touchez pour détailler ou ajuster</span></div><div class="card">${st.ps.map(p => { const ivs = st.ivs.filter(i => i.parcelleId === p.id); const d = ivs.filter(i => i.statut === 'realisee').length; const nx = ivs.filter(i => i.statut === 'planifiee').sort((a, b) => a.date.localeCompare(b.date))[0]; const cu = ivs.some(i => i.custom); return `<div class="mrow" style="--c:${c.color}" data-a="itkParc" data-id="${p.id}"><div class="ic">${ic('map')}</div><div class="tx"><b>${esc(p.nom)}${cu ? ' <span class="badge info" style="font-size:10px">ajusté</span>' : ''}</b><span>${d}/${ivs.length} réalisés${nx ? ` · prochain : ${esc(nx.label)} ${dshort(nx.date)}` : ''}</span></div>${statutParc(p)}</div>`; }).join('')}</div>` : ''}
  <div class="row mt2" style="justify-content:center"><button class="btn sm g" data-a="itkSync" data-c="${k}">${ic('sprout')} Réappliquer aux parcelles</button></div>`;
}
ACT.itkParc = d => { UI.f.itkP = d.id; render(); window.scrollTo(0, 0); };
function itkParcelView(p) {
  const c = curCult(p), col = CULTURES[c?.culture]?.color || 'var(--primary)';
  const ivs = S.interventions.filter(i => i.parcelleId === p.id && i.campagne === CURRENT_CAMP).sort((a, b) => a.date.localeCompare(b.date));
  return `<button class="lnk-back" data-a="itkBack">${ic('chevL')} ${esc(CULTURES[c?.culture]?.nom || 'Itinéraire')}</button>
  <div class="itk-head" style="--c:${col}"><div class="row"><span class="sw"></span><div style="flex:1"><b>${esc(p.nom)}</b><span>${nf(p.surface, 2)} ha · ${esc(CULTURES[c?.culture]?.nom || '')}${c?.variete ? ' · ' + esc(c.variete) : ''}</span></div>${statutParc(p)}</div></div>
  <p class="small muted">Les modifications faites ici ne concernent que cette parcelle (marquées « ajusté ») et ne seront pas écrasées par l’itinéraire type.</p>
  <div class="itk-line">${ivs.map(i => { const done = i.statut === 'realisee'; const pp = ivPeople(i); return `<div class="itk-step ${done ? 'done' : ''}" data-a="openIv" data-id="${i.id}"><span class="dot">${done ? ic('check') : ic(IV_ICON[i.type] || 'sprout')}</span><span class="body"><span class="when">${done ? 'Fait le' : 'Prévu le'} ${dfr(i.date)}${pp.length ? ' · ' + esc(pp.join(', ')) : ''}</span><b>${esc(i.label)}${i.custom ? ' <span class="badge info" style="font-size:10px">ajusté</span>' : ''}</b><small>${i.produits.map(x => { const it = byId('stock', x.itemId); return it ? `${esc(it.nom)} · ${nfx(x.dose, 2)} ${it.unite}/ha` : ''; }).filter(Boolean).join('<br>') || INTER_TYPES[i.type]}</small></span>${done ? '' : `<button class="act-s" data-a="editIv" data-id="${i.id}">Ajuster</button>`}</div>`; }).join('') || '<div class="card empty">Aucun travail pour cette campagne.</div>'}</div>
  <div class="row mt" style="gap:8px"><button class="btn" style="flex:1" data-a="quickIv" data-pid="${p.id}" data-statut="planifiee">${ic('plus')} Étape pour cette parcelle</button><button class="btn" data-a="itkRealign" data-id="${p.id}">${ic('sprout')} Réaligner</button></div>`;
}
ACT.itkRealign = d => { const p = byId('parcelles', d.id); S.interventions.filter(i => i.parcelleId === p.id && i.campagne === CURRENT_CAMP && i.statut === 'planifiee' && i.fromItk).forEach(i => delete i.custom); const r = syncItkParcel(p); commit(`Parcelle réalignée sur l’itinéraire type (${r.updated} mis à jour, ${r.created} créé(s))`); };
function itkModeles() {
  const keys = Object.keys(S.itk); const k = UI.f.itkC && S.itk[UI.f.itkC] ? UI.f.itkC : keys[0];
  const itk = S.itk[k]; const steps = [...itk.steps].sort((a, b) => a.off - b.off);
  const costs = steps.map(stepCostHa); const ti = sum(costs, c => c.intr), tm = sum(costs, c => c.meca);
  const surf = sum(activeParcels().filter(p => p.cultures[CURRENT_CAMP]?.culture === k), p => p.surface);
  return `<div class="chips mb">${keys.map(c => `<span class="chip ${c === k ? 'on' : ''}" data-a="itkC" data-c="${c}"><i class="sw" style="background:${CULTURES[c]?.color}"></i>${esc(CULTURES[c]?.nom || c)}</span>`).join('')}</div>
  <div class="grid g-kpi mb">${kpi('layers', 'Étapes', steps.length, `Semis type : ${itk.semisType.split('-').reverse().join('/')}`)}${kpi('box', 'Intrants + carburant / ha', eur(ti), 'aux prix moyens actuels')}${kpi('tractor', 'Mécanisation / ha', eur(tm), 'coût horaire du matériel')}${kpi('map', `Surface ${campLabel(CURRENT_CAMP)}`, `${nf(surf, 1)} ha`, `Coût total estimé <b>${keur((ti + tm) * surf)}</b>`)}</div>
  ${(() => { const ps = activeParcels().filter(p => p.cultures[CURRENT_CAMP]?.culture === k); const ivs = S.interventions.filter(i => i.campagne === CURRENT_CAMP && ps.some(p => p.id === i.parcelleId)); return `<div class="note ${ps.length && !ivs.length && steps.length ? 'warn' : 'info'} mb">${ic('sprout')}<span>${ps.length ? `${ps.length} parcelle(s) en ${esc(CULTURES[k]?.nom.toLowerCase())} · ${ivs.filter(i => i.statut === 'planifiee').length} travaux prévus · ${ivs.filter(i => i.statut === 'realisee').length} réalisés. Chaque modification de l’itinéraire met à jour les travaux prévus de ces parcelles.` : `Aucune parcelle en ${esc(CULTURES[k]?.nom.toLowerCase())} sur la campagne ${campLabel(CURRENT_CAMP)}.`}</span>${ps.length && steps.length ? `<button class="btn sm" data-a="itkSync" data-c="${k}">Appliquer</button>` : ''}</div>`; })()}
  <div class="card"><div class="card-h"><h3>ITK type — ${esc(CULTURES[k]?.nom)}</h3><span class="sp"></span><button class="btn sm" data-a="itkSemis" data-c="${k}">${ic('calendar')} Semis</button><button class="btn sm" data-a="itkStep" data-c="${k}">${ic('plus')} Étape</button></div>
  <div class="tbl-wrap"><table class="t"><thead><tr><th>J / semis</th><th>Étape</th><th>Type</th><th>Produits (dose/ha)</th><th>Matériel</th><th class="n">h/ha</th><th class="n">Intrants €/ha</th><th class="n">Méca €/ha</th><th></th></tr></thead><tbody>
  ${steps.map((s, i) => `<tr><td class="num">${s.off > 0 ? '+' : ''}${s.off}</td><td class="cell-main">${esc(s.label)}</td><td>${INTER_TYPES[s.type]}</td><td class="small">${s.produits.map(x => { const it = byId('stock', x.itemId); return it ? `${esc(it.nom)} — ${nfx(x.dose, 2)} ${it.unite}` : '<span class="badge warn">article absent</span>'; }).join('<br>') || '—'}</td><td class="small">${s.materiels.map(matName).join(' + ')}</td><td class="n">${nfx(s.hHa, 2)}</td><td class="n">${eur(costs[i].intr)}</td><td class="n">${eur(costs[i].meca)}</td><td class="n"><button class="btn xs g" data-a="itkStep" data-c="${k}" data-s="${s.id}">${ic('edit')}</button><button class="btn xs g" data-a="itkDel" data-c="${k}" data-s="${s.id}">${ic('trash')}</button></td></tr>`).join('') || `<tr><td colspan="9" class="empty">Aucune étape pour cette culture : ajoutez vos interventions types avec « + Étape » (travail du sol, semis, fertilisation…).</td></tr>`}
  </tbody><tfoot><tr><td colspan="6">Total par hectare</td><td class="n">${eur(ti)}</td><td class="n">${eur(tm)}</td><td></td></tr></tfoot></table></div></div>
  <div class="formula">Intrants €/ha = Σ dose × prix moyen pondéré du stock + carburant (h/ha × consommation L/h × prix du GNR). Méca €/ha = h/ha × coût horaire du matériel (hors carburant).</div>`;
}
ACT.itkC = d => { UI.f.itkC = d.c; render(); };
ACT.itkSync = d => commit(syncMsg(syncItkCulture(d.c)));
ACT.itkSemis = d => { const itk = S.itk[d.c]; const ps = activeParcels().filter(p => p.cultures[CURRENT_CAMP]?.culture === d.c); openModal({ title: `Date de semis — ${esc(CULTURES[d.c]?.nom)}`, body: `<p class="small muted">Les dates des étapes sont calculées à partir du semis (J+0). Indiquez la date de semis de cette campagne : elle s’applique aux parcelles de cette culture.</p><label class="field"><span>Date de semis ${campLabel(CURRENT_CAMP)}</span><input class="inp" type="date" name="semis" value="${ps[0]?.cultures[CURRENT_CAMP].semis || ''}" required></label>`, onSubmit: f => { if (!f.semis) throw new Error('Date requise'); itk.semisType = f.semis.slice(5); ps.forEach(p => { p.cultures[CURRENT_CAMP].semis = f.semis; p.cultures[CURRENT_CAMP].recoltePrev = null; S.interventions.filter(i => i.parcelleId === p.id && i.campagne === CURRENT_CAMP && i.statut === 'planifiee' && i.fromItk).forEach(i => { const st = itk.steps.find(x => x.label === i.label); if (st) i.date = addDays(f.semis, st.off); }); }); commit(syncMsg(syncItkCulture(d.c))); } }); };
ACT.itkDel = d => { const it = S.itk[d.c]; it.steps = it.steps.filter(s => s.id !== d.s); commit(syncMsg(syncItkCulture(d.c))); };
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
      if (d.s) { const old = s.label; Object.assign(s, n); if (old !== n.label) S.interventions.filter(i => i.statut === 'planifiee' && i.fromItk && i.label === old && byId('parcelles', i.parcelleId)?.cultures[i.campagne]?.culture === d.c).forEach(i => i.label = n.label); } else itk.steps.push({ id: uid('stp'), ...n });
      commit(syncMsg(syncItkCulture(d.c)));
    }
  });
};
function itkSuivi() {
  const pid = UI.f.itkP && byId('parcelles', UI.f.itkP) ? UI.f.itkP : activeParcels()[0]?.id; if (!pid) return '<div class="empty">Aucune parcelle</div>';
  const p = byId('parcelles', pid); const camp = +(UI.f.itkCamp || CURRENT_CAMP); const rec = p.cultures[camp];
  const ivs = S.interventions.filter(i => i.parcelleId === pid && i.campagne === camp).sort((a, b) => a.date.localeCompare(b.date));
  const real = ivs.filter(i => i.statut === 'realisee');
  const ci = sum(real, i => i.coutIntrants), cm = sum(real, i => mecaCost(i));
  return `<div class="row wrap mb toolbar"><select class="inp" style="width:auto" data-ch="itkP">${opts(activeParcels().map(x => [x.id, `${x.nom} (${nf(x.surface, 1)} ha)`]), pid)}</select><div class="seg">${[2025, 2026, 2027].map(c => `<button class="${camp === c ? 'on' : ''}" data-a="itkCamp" data-c="${c}">${campLabel(c)}</button>`).join('')}</div><span class="sp"></span>
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
  const sameNext = activeParcels(next).filter(p => p.cultures[next]?.culture === culture).map(p => p.id);
  openModal({
    title: `Dupliquer l'ITK ${campLabel(camp)} → ${campLabel(next)}`, body: `<p class="small">Les ${ivs.length} interventions de <b>${esc(src.nom)}</b> (${esc(CULTURES[culture]?.nom)}) seront recréées comme <b>planifiées</b>, décalées d'un an, avec les doses par hectare d'origine et la surface de chaque parcelle cible.</p>
    <div class="field"><span>Parcelles cibles</span><div class="chips">${activeParcels(next).map(p => `<label class="chip"><input type="checkbox" name="t" value="${p.id}" ${(sameNext.length ? sameNext.includes(p.id) : p.id === src.id) ? 'checked' : ''} style="margin:0"> ${esc(p.nom)} ${p.cultures[next] ? `<span class="muted">(${esc(CULTURES[p.cultures[next].culture]?.nom)})</span>` : ''}</label>`).join('')}</div></div>`,
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
const IV_COL = { preparation: '#8B6B4A', travail_sol: '#8B6B4A', semis: '#2F9E5B', fertilisation: '#2F7FD1', desherbage: '#7A9A2E', protection: '#7A5BD6', irrigation: '#138F8F', recolte: '#D4A23A', autre: '#5B6B7A' };
const MOIS_C = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
/** Regroupe les interventions saisies ensemble (même jour, même opération) sur plusieurs parcelles. */
function ivGroups(ivs) { const m = new Map(); ivs.forEach(i => { const k = [i.date, i.type, i.label, i.statut].join('|'); if (!m.has(k)) m.set(k, []); m.get(k).push(i); }); return [...m.values()]; }
function ivGroupCard(g) {
  const i = g[0], done = i.statut === 'realisee', col = IV_COL[i.type] || 'var(--c-cult)', d = dueInfo(i.date);
  const names = g.map(x => parcName(x.parcelleId)), surf = sum(g, x => x.surface), ppl = [...new Set(g.flatMap(ivPeople))];
  const prods = [...new Set(g.flatMap(x => x.produits.map(p => byId('stock', p.itemId)?.nom).filter(Boolean)))];
  const when = done ? `<span class="iv-d"><b>${D(i.date).getDate()}</b>${MOIS_C[D(i.date).getMonth()]}</span>` : `<span class="iv-d ${d.urgence}"><b>${D(i.date).getDate()}</b>${MOIS_C[D(i.date).getMonth()]}</span>`;
  return `<div class="ivc ${done ? 'done' : ''}" style="--c:${col}" data-a="${g.length > 1 ? 'ivGrp' : 'openIv'}" data-id="${i.id}" data-ids="${g.map(x => x.id).join(',')}">${when}<div class="ivc-ic">${ic(IV_ICON[i.type] || 'sprout')}</div>
  <div class="ivc-tx"><b>${esc(i.label)}</b><span>${g.length > 1 ? `<b class="ivc-n">${g.length} parcelles</b> ` : ''}${esc(names.slice(0, 2).join(', '))}${names.length > 2 ? ` +${names.length - 2}` : ''} · ${nf(surf, 1)} ha</span>${prods.length ? `<span class="ivc-p">${esc(prods.slice(0, 2).join(' · '))}${prods.length > 2 ? ` +${prods.length - 2}` : ''}</span>` : ''}</div>
  <div class="ivc-r">${done ? `<span class="badge ok">${ic('check')}</span>` : d.j < 0 ? `<span class="badge danger">${-d.j} j</span>` : d.j <= 7 ? `<span class="badge warn">${esc(d.echeance)}</span>` : ''}${ppl.length ? `<span class="ivc-av">${ppl.slice(0, 3).map(n => avatar(n, true)).join('')}</span>` : done ? '' : '<span class="ivc-na">À attribuer</span>'}</div></div>`;
}
VIEWS.interventions = () => {
  const camp = +(UI.f.ivCamp || CURRENT_CAMP), st = UI.f.ivSt === 'realisee' ? 'realisee' : 'planifiee', ty = UI.f.ivType || '';
  const all = S.interventions.filter(i => i.campagne === camp);
  const q = norm(UI.q.iv || '');
  let ivs = all.filter(i => i.statut === st && (!ty || i.type === ty) && (!q || norm(i.label + parcName(i.parcelleId) + ivPeople(i).join(' ')).includes(q)));
  ivs.sort((a, b) => st === 'planifiee' ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date));
  const groups = ivGroups(ivs);
  const sec = g => { const i = g[0]; if (st === 'planifiee') { const d = dueInfo(i.date); if (d.j < 0) return 'En retard'; if (d.j === 0) return 'Aujourd’hui'; if (d.j <= 7) return 'Cette semaine'; } const dt = D(i.date); return `${MOIS[dt.getMonth()][0].toUpperCase() + MOIS[dt.getMonth()].slice(1)} ${dt.getFullYear()}`; };
  const secs = []; groups.forEach(g => { const k = sec(g); let o = secs[secs.length - 1]; if (!o || o.k !== k) secs.push(o = { k, g: [] }); o.g.push(g); });
  const nP = all.filter(i => i.statut === 'planifiee').length, nR = all.filter(i => i.statut === 'realisee').length, late = all.filter(i => i.statut === 'planifiee' && i.date < TODAY).length;
  const types = [...new Set(all.filter(i => i.statut === st).map(i => i.type))];
  return `${demoBar('Historique d’interventions de démonstration, généré à partir des itinéraires techniques types.')}
  <div class="page-h toolbar"><select class="inp iv-camp" data-ch="ivCampS">${opts([CURRENT_CAMP - 2, CURRENT_CAMP - 1, CURRENT_CAMP].map(c => [c, `Campagne ${campLabel(c)}`]), camp)}</select><span class="sp"></span>${pa([{ a: 'exportIv', i: 'copy', l: 'Export CSV', more: true }, { a: 'quickIv', i: 'plus', l: 'Intervention', primary: true }])}</div>
  <div class="iv-sw"><button class="${st === 'planifiee' ? 'on' : ''}" data-a="ivF" data-k="ivSt" data-v="planifiee">${ic('calendar')}<span><b>${nP}</b> à faire${late ? ` <em>${late} en retard</em>` : ''}</span></button><button class="${st === 'realisee' ? 'on' : ''}" data-a="ivF" data-k="ivSt" data-v="realisee">${ic('check')}<span><b>${nR}</b> réalisées</span></button></div>
  ${S.favoris.length ? `<div class="iv-fav">${S.favoris.map(f => `<button class="fchip" style="--c:${IV_COL[f.type] || 'var(--c-cult)'}" data-a="quickIv" data-fav="${f.id}">${ic(IV_ICON[f.type] || 'play')} ${esc(f.label)}</button>`).join('')}</div>` : ''}
  <div class="iv-filt"><div class="search-in">${ic('search')}<input class="inp" placeholder="Opération, parcelle, personne…" data-in="ivQ" value="${esc(UI.q.iv || '')}"></div></div>
  ${types.length > 1 ? `<div class="iv-types"><button class="${!ty ? 'on' : ''}" data-a="ivF" data-k="ivType" data-v="">Tout</button>${types.map(t => `<button class="${ty === t ? 'on' : ''}" style="--c:${IV_COL[t]}" data-a="ivF" data-k="ivType" data-v="${t}">${ic(IV_ICON[t] || 'dots')} ${esc(INTER_TYPES[t])}</button>`).join('')}</div>` : ''}
  ${secs.length ? secs.map(o => `<div class="iv-sec ${o.k === 'En retard' ? 'late' : ''}"><h3>${o.k}</h3><span>${o.g.length}</span></div><div class="ivc-list">${o.g.map(ivGroupCard).join('')}</div>`).join('') : `<div class="empty card pad">${st === 'planifiee' ? 'Rien de prévu' : 'Aucune intervention réalisée'}${ty || q ? ' avec ces filtres' : ` sur la campagne ${campLabel(camp)}`}.<div class="mt"><button class="btn p" data-a="quickIv">${ic('plus')} Saisir une intervention</button></div></div>`}
  ${st === 'realisee' && ivs.length ? `<div class="formula">${ivs.length} interventions · intrants ${eur(sum(ivs, i => i.coutIntrants))} · ${nf(sum(ivs, i => i.heures), 1)} h de travail</div>` : ''}`;
};
CH.ivCampS = el => { UI.f.ivCamp = +el.value; render(); };
ACT.ivGrp = d => { const g = d.ids.split(',').map(id => byId('interventions', id)).filter(Boolean), i = g[0], done = i.statut === 'realisee';
  openModal({ title: esc(i.label), body: `<p class="small muted" style="margin-top:0">${dfr(i.date)} · ${g.length} parcelles · ${nf(sum(g, x => x.surface), 1)} ha${done ? ` · intrants ${eur(sum(g, x => x.coutIntrants))}` : ''}</p><div class="card">${g.map(x => `<div class="li" data-a="ivGrpOpen" data-id="${x.id}"><div class="ic" style="background:color-mix(in srgb,${IV_COL[x.type]} 18%,transparent);color:${IV_COL[x.type]}">${ic(IV_ICON[x.type] || 'sprout')}</div><div class="tx"><b>${esc(parcName(x.parcelleId))}</b><span>${nf(x.surface, 2)} ha${ivPeople(x).length ? ' · ' + esc(ivPeople(x).join(', ')) : ''}</span></div>${ic('chevR')}</div>`).join('')}</div>`, foot: `${!done ? `<button type="button" class="btn" data-a="ivGrpEdit" data-ids="${d.ids}">${ic('check')} Tout réaliser</button>` : ''}<span class="sp"></span><button type="button" class="btn p" data-a="closeModal">Fermer</button>` }); };
ACT.ivGrpOpen = d => { closeModal(); openDrawer('intervention', d.id); };
ACT.ivGrpEdit = d => { closeModal(); quickIvForm({ pids: d.ids.split(',').map(id => byId('interventions', id).parcelleId), type: byId('interventions', d.ids.split(',')[0]).type, statut: 'realisee', planLabel: byId('interventions', d.ids.split(',')[0]).label }); };
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
  <div class="card pad"><div class="kv">${[['Date', dfr(i.date)], ['Parcelle', p?.nom], ['Surface', `${nf(i.surface, 2)} ha`], ['Temps de travail', `${nfx(i.heures, 1)} h`], ['Réalisée par', ivPeople(i).join(', ') || 'À attribuer'], ['Météo', i.meteo || '—']].map(([k, v]) => `<div><span>${k}</span><b>${esc(v)}</b></div>`).join('')}</div>
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
let VPPL = [];
ACT.vWho = d => { const i = VPPL.indexOf(d.n); if (d.add) { if (i < 0) VPPL.push(d.n); } else i >= 0 ? VPPL.splice(i, 1) : VPPL.push(d.n); document.getElementById('vPpl').innerHTML = peoplePicker(VPPL, 'vWho'); };
ACT.validateIv = d => {
  const i = byId('interventions', d.id);
  { const why = ivBlock(byId('parcelles', i.parcelleId), i.type, { except: i.id }); if (why) { toast(`Impossible : ${parcName(i.parcelleId)} ${why}. Supprimez ce travail prévu ou modifiez-le.`, 'warn'); return; } }
  const p = byId('parcelles', i.parcelleId); const rec = p.cultures[i.campagne];
  const need = i.produits.map(x => { const it = byId('stock', x.itemId); const q = r2(x.dose * i.surface, 3); return it && it.qte < q ? `${esc(it.nom)} : ${nfx(it.qte, 1)} ${it.unite} en stock pour ${nfx(q, 1)} nécessaires` : null; }).filter(Boolean);
  openModal({
    title: `Valider : ${esc(i.label)}`, body: `<div class="field"><span>Qui l’a fait ?</span><div id="vPpl"></div></div><div class="grid2"><label class="field"><span>Date de réalisation</span><input class="inp" type="date" name="date" value="${i.date <= TODAY ? i.date : TODAY}"></label><label class="field"><span>Temps de travail (h)</span><input class="inp" type="number" step="0.1" name="heures" value="${i.heures}"></label></div>
    ${i.produits.map((x, k) => `<label class="field"><span>${esc(byId('stock', x.itemId)?.nom)} — dose / ha (${byId('stock', x.itemId)?.unite})</span><input class="inp" type="number" step="0.01" name="dose${k}" value="${x.dose}"></label>`).join('')}
    ${i.type === 'recolte' && rec?.culture !== 'prairie' ? `<div class="grid2"><label class="field"><span>Quantité récoltée (t)</span><input class="inp" type="number" step="0.01" name="recolte" value="${rec?.rdtPrev ? r2(rec.rdtPrev * i.surface, 1) : ''}" required></label><div class="field"><span>Rendement</span><div class="inp" style="display:flex;align-items:center" id="rdtLive">${rec?.rdtPrev ? nfx(rec.rdtPrev, 2) + ' t/ha' : '—'}</div></div></div>` : ''}
    <label class="field"><span>Météo (facultatif)</span><input class="inp" name="meteo" value="${esc(i.meteo)}" placeholder="Ex. : sec, 12 °C, vent faible"></label>
    <label class="field"><span>Observations</span><textarea class="inp" name="obs">${esc(i.obs)}</textarea></label>
    ${need.length ? `<div class="note warn">${ic('alert')}<span>Stock insuffisant — la validation créera un stock négatif à régulariser :<br>${need.join('<br>')}</span></div>` : `<div class="note">${ic('info')}<span>Les intrants et le carburant seront déduits automatiquement des stocks.</span></div>`}`,
    submit: 'Valider', onMount: m => { VPPL = ivPeople(i).length ? [...ivPeople(i)] : lastPeople(); document.getElementById('vPpl').innerHTML = peoplePicker(VPPL, 'vWho'); const r = m.querySelector('[name=recolte]'); if (r) r.addEventListener('input', () => { document.getElementById('rdtLive').textContent = `${nfx(+r.value / i.surface, 2)} t/ha`; }); },
    onSubmit: f => {
      if (!VPPL.length) throw new Error('Indiquez qui a fait cette opération'); i.personnes = [...VPPL]; i.mo = VPPL.join(', '); rememberPeople(VPPL);
      i.date = f.date || TODAY; i.campagne = i.campagne; i.heures = +f.heures || 0; i.meteo = f.meteo; i.obs = f.obs;
      i.produits.forEach((x, k) => { if (f['dose' + k] != null) x.dose = +f['dose' + k]; });
      if (f.recolte != null) { if (!(+f.recolte > 0)) throw new Error('Quantité récoltée requise'); i.recolteQte = +f.recolte; }
      const w = applyIntervention(i); afterApply(i);
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
ACT.quickIv = d => quickIvForm({ pid: d.pid, fav: d.fav, type: d.type, pids: d.pids ? d.pids.split(',') : null, planLabel: d.plan, statut: d.statut });
/**
 * Saisie d'opération. Peut cibler une ou plusieurs parcelles (ex. toutes les parcelles d'une culture).
 * Si une opération identique est prévue dans l'itinéraire de ces parcelles (même libellé), elle est
 * marquée réalisée au lieu de créer un doublon.
 */
function quickIvForm({ pid, pids, fav, edit, type, planLabel, statut } = {}) {
  if (edit) { const i = byId('interventions', edit); QF = { edit, typeChosen: true, open: {}, personnes: ivPeople(i), parcelles: [i.parcelleId], type: i.type, label: i.label, date: i.date, statut: 'planifiee', produits: i.produits.map(x => ({ ...x })), materiels: [...i.materiels], hHa: i.heures / i.surface, mo: i.mo, meteo: i.meteo, obs: i.obs, photos: i.photos || [], recolte: '' }; }
  else QF = { personnes: lastPeople(), parcelles: pids ? [...pids] : pid ? [pid] : [], type: type || 'protection', typeLocked: !!type, typeChosen: !!type || !!planLabel, open: {}, label: '', date: statut === 'planifiee' ? addDays(TODAY, 1) : TODAY, statut: statut || 'realisee', produits: [], materiels: [], hHa: 0.1, mo: S.exploitation.mainOeuvre[0]?.nom || '', meteo: '', obs: '', photos: [], recolte: '', saveFav: false, autoLabel: true, planLabel: null, manual: false };
  if (fav) { applyFav(fav); QF.manual = true; }
  else if (!edit && QF.parcelles.length) suggestPlan(planLabel);
  const n = QF.parcelles.length;
  openModal({ title: edit ? 'Modifier l’opération' : 'Saisir une opération', wide: true, body: '', submit: 'Enregistrer', onSubmit: submitQF, onMount: () => renderQF() });
}
function applyFav(fid) { const f = S.favoris.find(x => x.id === fid); if (!f) return; Object.assign(QF, { type: f.type, label: f.label, produits: f.produits.map(x => ({ ...x })), materiels: [...f.materiels], hHa: f.hHa, autoLabel: false, planLabel: null }); }
/** Planifiées correspondant à un libellé sur les parcelles choisies. */
function qfPlanned(label, type) { return S.interventions.filter(i => i.statut === 'planifiee' && QF.parcelles.includes(i.parcelleId) && i.label === label && (!type || i.type === type)); }
/** Préremplit avec la prochaine opération prévue (commune au plus grand nombre de parcelles sélectionnées). */
function suggestPlan(forceLabel) {
  const pool = S.interventions.filter(i => i.statut === 'planifiee' && QF.parcelles.includes(i.parcelleId) && (!QF.typeLocked || i.type === QF.type) && (!forceLabel || i.label === forceLabel));
  if (!pool.length) {
    QF.planLabel = null;
    if (QF.typeLocked && QF.parcelles.length) { // gabarit d'ITK de la culture pour ce type
      const c = curCult(byId('parcelles', QF.parcelles[0]))?.culture; const st = S.itk[c]?.steps.find(x => x.type === QF.type);
      QF.label = st ? st.label : INTER_TYPES[QF.type];
      if (st) Object.assign(QF, { produits: st.produits.filter(x => byId('stock', x.itemId)).map(x => ({ ...x })), materiels: st.materiels.filter(m => byId('materiel', m)), hHa: st.hHa });
    }
    return;
  }
  const groups = {}; pool.forEach(i => { (groups[i.label] = groups[i.label] || []).push(i); });
  const best = Object.values(groups).sort((a, b) => new Set(b.map(i => i.parcelleId)).size - new Set(a.map(i => i.parcelleId)).size || a[0].date.localeCompare(b[0].date))[0].sort((a, b) => a.date.localeCompare(b.date));
  const ref = best[0];
  Object.assign(QF, { type: ref.type, label: ref.label, produits: ref.produits.map(x => ({ itemId: x.itemId, dose: x.dose })), materiels: [...ref.materiels], hHa: ref.heures / ref.surface, autoLabel: false, planLabel: ref.label });
}
/* ---- Écran de saisie d'opération (V7) : statut → opération → parcelles → produits → détails ---- */
const TYPE_CATS = { semis: ['semences'], fertilisation: ['engrais', 'amendements'], desherbage: ['phyto'], protection: ['phyto'], irrigation: [], recolte: [], travail_sol: [], preparation: [], autre: ['semences', 'engrais', 'phyto', 'amendements', 'autre'] };
const TYPE_REQ = ['semis', 'fertilisation', 'desherbage', 'protection'];
const DOSE_STEP = { kg: 10, L: 0.1, t: 0.1, dose: 0.5, u: 1 };
function qfSurface() { return r2(sum(QF.parcelles, id => byId('parcelles', id)?.surface || 0), 2); }
function qfSecHead(n, title, sum2, key, open) { return `<button type="button" class="qf-h ${open ? 'open' : ''}" data-a="qfToggle" data-k="${key}"><span class="n">${n}</span><span class="t">${title}</span><span class="s">${sum2 || ''}</span>${ic(open ? 'up' : 'down')}</button>`; }
function renderQF() {
  const f = document.getElementById('mf'); if (!f) return;
  const surf = qfSurface(), cats = TYPE_CATS[QF.type] || [], needProd = TYPE_REQ.includes(QF.type);
  const cost = sum(QF.produits, x => { const it = byId('stock', x.itemId); return it ? (+x.dose || 0) * surf * it.pmp : 0; });
  const warn = QF.statut === 'realisee' ? QF.produits.map(x => { const it = byId('stock', x.itemId); const q = (+x.dose || 0) * surf; return it && it.qte < q ? `${esc(it.nom)} : ${qty(it.qte, it.unite)} en stock pour ${qty(q, it.unite)}` : null; }).filter(Boolean) : [];
  QF.open = QF.open || {};
  const AP = activeParcels(); const many = AP.length > 6;
  if (QF.open.parc === undefined && !QF.parcelles.length) QF.open.parc = true;
  const openParc = !!QF.open.parc;
  // 1. Statut
  let h = !QF.edit ? `<div class="qf-status">${[['realisee', 'check', 'Réalisée', 'Déduit les stocks maintenant'], ['planifiee', 'calendar', 'À planifier', 'Ajouté aux tâches']].map(([v, i, l, s]) => `<button type="button" class="${QF.statut === v ? 'on' : ''}" data-a="qfS" data-v="${v}">${ic(i)}<b>${l}</b><small>${s}</small></button>`).join('')}</div>` : '';
  // 2. Opération
  h += `<div class="qf-sec">${qfSecHead(1, 'Opération', QF.open.type === false || QF.typeChosen ? INTER_TYPES[QF.type] : '', 'type', QF.open.type !== false && !QF.typeChosen)}
    ${QF.open.type !== false && !QF.typeChosen ? `<div class="type-grid">${Object.entries(INTER_TYPES).map(([k, l]) => `<div class="pick ${QF.type === k ? 'on' : ''}" data-a="qfT" data-k="${k}">${ic(IV_ICON[k])}${l.replace(' / plantation', '').replace(' des cultures', '')}</div>`).join('')}</div>` : ''}</div>`;
  // 3. Parcelles
  if (!QF.edit && !QF.blkChecked) { QF.blkChecked = true; const bad = QF.parcelles.filter(id => ivBlock(byId('parcelles', id), QF.type)); if (bad.length) { QF.parcelles = QF.parcelles.filter(id => !bad.includes(id)); setTimeout(() => toast(bad.map(id => `${parcName(id)} : ${ivBlock(byId('parcelles', id), QF.type)}`).join(' · '), 'warn'), 50); } }
  const ass = assolement(CURRENT_CAMP); const noCult = AP.filter(p => !curCult(p));
  const parcSum = QF.parcelles.length ? `${QF.parcelles.length} parcelle${QF.parcelles.length > 1 ? 's' : ''} · ${nf(surf, 1)} ha` : '<span style="color:var(--late)">à choisir</span>';
  h += `<div class="qf-sec">${qfSecHead(2, 'Parcelles', parcSum, 'parc', openParc)}`;
  if (QF.type === 'semis' && !QF.edit && AP.some(p => ivBlock(p, 'semis').startsWith('déjà semée'))) h += `<label class="row small" style="margin:-4px 0 8px"><input type="checkbox" data-ch="qfRes" ${QF.ressemis ? 'checked' : ''}> Ressemis (autoriser les parcelles déjà semées)</label>`;
  if (openParc) {
    if (!many) h += `<div class="pick-grid">${AP.map(p => qfParcPick(p)).join('')}</div>`;
    else h += `${!QF.edit ? `<div class="qf-all"><button type="button" class="lnk" data-a="qfCult" data-c="*">${QF.parcelles.length === AP.length ? 'Tout désélectionner' : 'Tout sélectionner'}</button></div>` : ''}${[...ass.map(a => ({ key: a.key, label: a.label, color: a.color, ps: AP.filter(p => curCult(p)?.culture === a.key) })), ...(noCult.length ? [{ key: '_none', label: 'Non assolées', color: '#999', ps: noCult }] : [])].map(g => { const sel = g.ps.filter(p => QF.parcelles.includes(p.id)); const op = QF.open['c_' + g.key]; return `<div class="qf-cult" style="--c:${g.color}"><div class="qf-ch"><button type="button" class="qf-cl" data-a="qfOpenC" data-c="${g.key}"><span class="sw"></span><b>${esc(g.label)}</b><small>${g.ps.length} parc. · ${nf(sum(g.ps, p => p.surface), 1)} ha${sel.length ? ` · <span style="color:var(--primary);font-weight:800">${sel.length} choisie${sel.length > 1 ? 's' : ''}</span>` : ''}</small>${ic(op ? 'up' : 'down')}</button><button type="button" class="qf-tout ${sel.length === g.ps.length ? 'on' : ''}" data-a="qfCult" data-c="${g.key}">${sel.length === g.ps.length ? ic('check') + ' Tout' : 'Tout'}</button></div>${op ? `<div class="pick-grid" style="margin-top:8px">${g.ps.map(p => qfParcPick(p, true)).join('')}</div>` : ''}</div>`; }).join('')}`;
    if (QF.parcelles.length) h += `<button type="button" class="btn sm mt" data-a="qfToggle" data-k="parc">${ic('check')} Valider la sélection</button>`;
  } else if (QF.parcelles.length) h += `<div class="qf-chips">${QF.parcelles.slice(0, 6).map(id => `<span>${esc(parcName(id))}</span>`).join('')}${QF.parcelles.length > 6 ? `<span>+${QF.parcelles.length - 6}</span>` : ''}</div>`;
  h += `</div>`;
  // plan
  if (QF.planLabel && !QF.edit) { const pl = qfPlanned(QF.planLabel, QF.type); const np = new Set(pl.map(i => i.parcelleId)).size; if (np) h += `<div class="note info">${ic('sprout')}<span>Prévu : <b>${esc(QF.planLabel)}</b> (${dfr(pl[0]?.date)}) sur ${np} parcelle(s). ${QF.statut === 'realisee' ? 'Ces travaux seront marqués réalisés.' : 'Ils seront mis à jour.'}</span></div>`; }
  // 4. Produits
  if (cats.length) {
    const pc = QF.prodCat && cats.includes(QF.prodCat) ? QF.prodCat : cats[0];
    h += `<div class="qf-sec">${qfSecHead(3, needProd ? 'Produit' + (QF.type === 'semis' ? ' (semence)' : '') : 'Produits (facultatif)', QF.produits.filter(x => x.itemId).length ? `${QF.produits.filter(x => x.itemId).length} choisi(s)` : needProd ? '<span style="color:var(--late)">obligatoire</span>' : '', 'prod', true)}
    ${QF.produits.map((x, k) => { const it = byId('stock', x.itemId); if (!it) return ''; const m = STOCK_META[it.cat]; const tot = (+x.dose || 0) * surf; return `<div class="qf-prod" style="--c:${m.color}"><div class="row" style="gap:10px"><span class="st-ic">${ic(m.icon)}</span><div style="flex:1;min-width:0"><b>${esc(it.nom)}</b><small>${it.variete ? 'Variété ' + esc(it.variete) + ' · ' : ''}en stock : ${qty(it.qte, it.unite)}</small></div><button type="button" class="btn sm icon g" data-a="qfDel" data-i="${k}" aria-label="Retirer">${ic('x')}</button></div>
      <div class="row" style="gap:10px;margin-top:8px"><div class="stepper"><button type="button" data-a="qfDose" data-i="${k}" data-d="-1">${ic('minus')}</button><input inputmode="decimal" data-in="qfDose" data-i="${k}" value="${String(x.dose ?? '').replace('.', ',')}" placeholder="dose"><span>${it.unite}/ha</span><button type="button" data-a="qfDose" data-i="${k}" data-d="1">${ic('plus')}</button></div><div class="qf-tot">Total<b data-tot="${k}">${qty(r2(tot, 2), it.unite)}</b></div></div>${QF.type === 'semis' && it.cat === 'semences' ? semisCalc(it, k) : ''}</div>`; }).join('')}
    ${QF.pickOpen || !QF.produits.filter(x => x.itemId).length ? `<div class="qf-picker">${cats.length > 1 ? `<div class="fchips" style="margin-bottom:8px">${cats.map(c => `<button type="button" class="fchip ${pc === c ? 'on' : ''}" style="--c:${STOCK_META[c].color}" data-a="qfPC" data-c="${c}">${ic(STOCK_META[c].icon)} ${STOCK_META[c].label}</button>`).join('')}</div>` : ''}
      ${QF.newProd ? `<div class="qf-new"><input class="inp" id="qfNewNom" placeholder="Nom du nouveau produit ${STOCK_META[pc].label.toLowerCase()}"><div class="ob-chips" id="qfNewU" style="margin-top:8px">${[['kg', 'kg'], ['t', 't'], ['L', 'L'], ['dose', 'dose'], ['u', 'unité']].map(([v, l]) => `<button type="button" class="fchip ${v === (QF.newUnit || ({ phyto: 'L', amendements: 't' }[pc] || 'kg')) ? 'on' : ''}" style="--c:var(--primary)" data-a="qfNewU" data-v="${v}">${l}</button>`).join('')}</div><div class="row mt" style="gap:8px"><button type="button" class="btn" data-a="qfNewCancel">Annuler</button><button type="button" class="btn p" style="flex:1" data-a="qfNewAdd" data-c="${pc}">${ic('plus')} Ajouter</button></div></div>`
        : `<div class="swz-list">${S.stock.filter(i => i.cat === pc && !QF.produits.some(x => x.itemId === i.id)).sort((a, b) => (b.qte > 0) - (a.qte > 0) || a.nom.localeCompare(b.nom)).map(i => `<button type="button" class="swz-item" style="--c:${STOCK_META[pc].color}" data-a="qfAddP" data-id="${i.id}"><span class="st-ic">${ic(STOCK_META[pc].icon)}</span><span class="t"><b>${esc(i.nom)}</b></span><span class="q ${i.qte <= 0 ? 'danger' : ''}">${qty(i.qte, i.unite)}</span></button>`).join('') || '<div class="empty small">Aucun produit dans cette catégorie</div>'}</div><button type="button" class="btn sm mt" style="border-style:dashed;width:100%" data-a="qfNewP">${ic('plus')} Nouveau produit ${STOCK_META[pc].label.toLowerCase()}</button>`}
    </div>` : `<button type="button" class="btn sm" data-a="qfPickOpen">${ic('plus')} Ajouter un produit</button>`}</div>`;
  }
  // Semis : culture semée (obligatoire pour une parcelle non assolée)
  if (QF.type === 'semis' && !QF.edit && QF.parcelles.length) {
    const ps = QF.parcelles.map(id => byId('parcelles', id)); const noC = ps.filter(p => !curCult(p)); const cs = [...new Set(ps.map(p => curCult(p)?.culture).filter(Boolean))];
    if (!QF.cultureSemis && cs.length === 1 && !noC.length) QF.cultureSemis = cs[0];
    const farm = [...new Set([...assolement(CURRENT_CAMP).map(a => a.key), ...Object.keys(S.itk)])].filter(k => CULTURES[k] && !['prairie', 'jachere'].includes(k));
    const changes = ps.filter(p => curCult(p) && QF.cultureSemis && curCult(p).culture !== QF.cultureSemis).length;
    h += `<div class="qf-sec"><div class="qf-h open" style="cursor:default"><span class="n">${ic('sprout')}</span><span class="t">Culture semée</span><span class="s">${QF.cultureSemis ? esc(CULTURES[QF.cultureSemis].nom) : noC.length ? '<span style="color:var(--late)">obligatoire</span>' : ''}</span></div>
      <div class="ob-chips">${farm.slice(0, 10).map(k => `<button type="button" class="fchip ${QF.cultureSemis === k ? 'on' : ''}" style="--c:${CULTURES[k].color}" data-a="qfCS" data-v="${k}"><span class="cat-dot" style="--c:${CULTURES[k].color}"></span>${CULTURES[k].nom}</button>`).join('')}</div>
      <select class="inp" data-ch="qfCSsel" style="margin-top:8px"><option value="">Autre culture…</option>${opts(Object.keys(CULTURES).filter(k => !farm.slice(0, 10).includes(k)).map(k => [k, CULTURES[k].nom]), farm.slice(0, 10).includes(QF.cultureSemis) ? '' : QF.cultureSemis)}</select>
      ${noC.length ? `<div class="small muted" style="margin-top:6px">${noC.length} parcelle(s) non assolée(s) : elles passeront en ${QF.cultureSemis ? esc(CULTURES[QF.cultureSemis].nom.toLowerCase()) : '…'} pour la campagne ${campLabel(CURRENT_CAMP)}.</div>` : ''}${changes ? `<div class="small" style="margin-top:6px;color:var(--warn-ink)">${ic('alert')} ${changes} parcelle(s) changeront de culture (les travaux prévus de l’ancienne culture seront retirés).</div>` : ''}</div>`;
  }
  // Semis : variété ; Récolte : quantité
  if (QF.type === 'semis') h += `<label class="field"><span>Variété (facultatif)</span><input class="inp" data-in="qf" data-k="variete" value="${esc(QF.variete || (QF.parcelles.length === 1 ? curCult(byId('parcelles', QF.parcelles[0]))?.variete || '' : ''))}" placeholder="Ex. : Chevignon"></label>`;
  if (QF.type === 'recolte' && QF.statut === 'realisee') { const u = QF.rdtU || 'q'; h += `<div class="qf-sec"><div class="qf-h open" style="cursor:default"><span class="n">${ic('wheat')}</span><span class="t">Récolte</span><span class="s" id="recSum">${QF.recolte ? `${nfx(parseFloat(String(QF.recolte).replace(',', '.')), 2)} t` : '<span style="color:var(--late)">obligatoire</span>'}</span></div>
    <div class="field"><span>Rendement</span><div class="row" style="gap:8px"><input class="inp" inputmode="decimal" data-in="rdt" value="${QF.rdtVal || ''}" placeholder="Ex. : 85" style="font-size:20px;font-weight:800;height:52px;flex:1"><div class="seg">${[['q', 'q/ha'], ['t', 't/ha'], ['kg', 'kg/ha']].map(([v, l]) => `<button type="button" class="${u === v ? 'on' : ''}" data-a="rdtU" data-v="${v}">${l}</button>`).join('')}</div></div></div>
    <div class="field" style="margin-top:10px"><span>Ou quantité totale récoltée (t)</span><input class="inp" inputmode="decimal" data-in="recTot" value="${QF.recolte || ''}" placeholder="Calculée automatiquement"></div>
    <div class="calc-out" id="recOut">${recText()}</div></div>`; }
  // Qui
  h += `<div class="qf-sec"><div class="qf-h open" style="cursor:default"><span class="n">${ic('users')}</span><span class="t">Qui ${QF.statut === 'realisee' ? 'l’a fait' : 'le fera'} ?</span><span class="s">${QF.personnes.length ? QF.personnes.join(', ') : '<span style="color:var(--late)">obligatoire</span>'}</span></div>${peoplePicker(QF.personnes, 'qfWho')}</div>`;
  // 5. Date et détails
  const det = QF.open.det;
  h += `<div class="qf-sec">${qfSecHead(cats.length ? 4 : 3, 'Date et détails', `${QF.date === TODAY ? "aujourd'hui" : dfr(QF.date)}${QF.materiels.length ? ` · ${QF.materiels.length} matériel(s)` : ''}`, 'det', det)}
    <div class="row" style="gap:8px;flex-wrap:wrap">${[[TODAY, "Aujourd'hui"], [addDays(TODAY, -1), 'Hier'], ...(QF.statut === 'planifiee' ? [[addDays(TODAY, 1), 'Demain'], [addDays(TODAY, 7), 'Dans 7 j']] : [])].map(([d, l]) => `<button type="button" class="fchip ${QF.date === d ? 'on' : ''}" style="--c:var(--primary)" data-a="qfDate" data-v="${d}">${l}</button>`).join('')}<input class="inp" type="date" data-in="qf" data-k="date" value="${QF.date}" style="width:auto;height:38px"></div>
    ${det ? `<div class="field mt"><span>Matériel utilisé</span><div class="pick-grid">${S.materiel.map(m => `<div class="pick ${QF.materiels.includes(m.id) ? 'on' : ''}" style="--c:var(--c-mat)" data-a="qfM" data-id="${m.id}"><span>${esc(m.marque)} ${esc(m.modele)}<small>${m.panne?.immo ? '<b style="color:var(--danger)">Immobilisé</b>' : MAT_CATS[m.cat]}</small></span><span class="ck">${QF.materiels.includes(m.id) ? ic('check') : ''}</span></div>`).join('') || '<span class="small muted">Aucun matériel enregistré</span>'}</div></div>
    <label class="field mt"><span>Temps de travail (h)</span><input class="inp" inputmode="decimal" data-in="qfH" value="${r2(QF.hHa * surf, 1)}"></label>
    <label class="field mt"><span>Météo</span><input class="inp" data-in="qf" data-k="meteo" value="${esc(QF.meteo)}" placeholder="Facultatif"></label>
    <label class="field mt"><span>Observations</span><textarea class="inp" data-in="qf" data-k="obs" placeholder="Facultatif">${esc(QF.obs)}</textarea></label>
    <div class="field mt"><span>Photos</span><div class="row wrap"><label class="btn sm">${ic('camera')} Ajouter<input type="file" accept="image/*" multiple hidden data-ch="qfPhoto"></label><div class="photos">${QF.photos.map(p => `<img src="${p}">`).join('')}</div></div></div>
    ${!QF.edit ? `<label class="row small mt"><input type="checkbox" data-ch="qfFavSave" ${QF.saveFav ? 'checked' : ''}> Enregistrer comme favori</label>` : ''}` : ''}</div>`;
  // Résumé
  h += `<div class="qf-sum ${warn.length ? 'warn' : ''}">${surf ? `<b>${QF.parcelles.length} parc. · ${nf(surf, 1)} ha</b>${cost ? ` · intrants ≈ ${eur(cost)}` : ''}${warn.length ? `<br>${ic('alert')} Stock insuffisant : ${warn.join(' · ')}` : ''}` : 'Choisissez au moins une parcelle'}</div>`;
  f.innerHTML = h;
}
/* ---- Aide au calcul du semis : dose = densité × PMG / 100 (kg/ha), pertes à la levée en option ---- */
function semisCalc(it, k) {
  const cs = (QF.calc = QF.calc || {})[k] || (QF.calc[k] = { open: false, pmg: it.pmg || '', dens: '', pertes: '', gpd: it.grainsDose || 50000 });
  if (!cs.open) return `<button type="button" class="calc-open" data-a="calcOpen" data-i="${k}">${ic('chart')} Calculer la dose (PMG × densité)</button>`;
  const perDose = it.unite === 'dose' || it.unite === 'u';
  return `<div class="calc"><div class="grid2"><label class="field"><span>PMG (g)</span><input class="inp" inputmode="decimal" data-in="calc" data-i="${k}" data-f="pmg" value="${cs.pmg}" placeholder="Ex. : 45" ${perDose ? 'disabled' : ''}></label><label class="field"><span>Densité (grains/m²)</span><input class="inp" inputmode="decimal" data-in="calc" data-i="${k}" data-f="dens" value="${cs.dens}" placeholder="${perDose ? 'Ex. : 9' : 'Ex. : 250'}"></label></div>
  <div class="grid2" style="margin-top:8px"><label class="field"><span>Pertes à la levée (%)</span><input class="inp" inputmode="decimal" data-in="calc" data-i="${k}" data-f="pertes" value="${cs.pertes}" placeholder="0"></label>${perDose ? `<label class="field"><span>Grains par ${it.unite === 'dose' ? 'dose' : 'unité'}</span><input class="inp" inputmode="numeric" data-in="calc" data-i="${k}" data-f="gpd" value="${cs.gpd}"></label>` : '<div></div>'}</div>
  <div class="calc-out" id="calcOut${k}">${calcText(it, cs)}</div></div>`;
}
function calcDose(it, cs) { const n = v => parseFloat(String(v || '').replace(',', '.')) || 0; const dens = n(cs.dens), p = Math.min(90, n(cs.pertes)); if (!dens) return null; const eff = dens / (1 - p / 100); if (it.unite === 'dose' || it.unite === 'u') return r2(eff * 10000 / (n(cs.gpd) || 50000), 2); const pmg = n(cs.pmg); if (!pmg) return null; const kg = eff * pmg / 100; return it.unite === 't' ? r2(kg / 1000, 4) : r2(kg, 1); }
function calcText(it, cs) { const d = calcDose(it, cs); return d == null ? 'Renseignez la densité' + (it.unite === 'kg' || it.unite === 't' ? ' et le PMG' : '') : `Dose : <b>${nfx(d, 2)} ${it.unite}/ha</b>${(+String(cs.pertes).replace(',', '.') || 0) ? ' (pertes incluses)' : ''} · total ${qty(r2(d * qfSurface(), 2), it.unite)}`; }
const RDT_F = { q: 0.1, t: 1, kg: 0.001 };
function recText() { const s = qfSurface(); const tot = parseFloat(String(QF.recolte || '').replace(',', '.')); return s ? (tot > 0 ? `<b>${nfx(tot, 2)} t</b> sur ${nf(s, 2)} ha · ${nfx(tot / s * 10, 1)} q/ha · ${nfx(tot / s, 2)} t/ha` : `Surface : ${nf(s, 2)} ha`) : 'Choisissez les parcelles'; }
IN.rdt = el => { QF.rdtVal = el.value; const v = parseFloat(el.value.replace(',', '.')); const s = qfSurface(); QF.recolte = v > 0 && s ? String(r2(v * RDT_F[QF.rdtU || 'q'] * s, 2)) : ''; const t = document.querySelector('[data-in=recTot]'); if (t) t.value = QF.recolte.replace('.', ','); document.getElementById('recOut').innerHTML = recText(); const rs = document.getElementById('recSum'); if (rs) rs.textContent = QF.recolte ? `${nfx(+QF.recolte, 2)} t` : ''; };
IN.recTot = el => { QF.recolte = el.value.replace(',', '.'); const v = parseFloat(QF.recolte); const s = qfSurface(); QF.rdtVal = v > 0 && s ? String(r2(v / s / RDT_F[QF.rdtU || 'q'], 2)).replace('.', ',') : ''; const r = document.querySelector('[data-in=rdt]'); if (r) r.value = QF.rdtVal; document.getElementById('recOut').innerHTML = recText(); };
ACT.rdtU = d => { QF.rdtU = d.v; const v = parseFloat(String(QF.recolte || '').replace(',', '.')); const s = qfSurface(); if (v > 0 && s) QF.rdtVal = String(r2(v / s / RDT_F[d.v], 2)).replace('.', ','); renderQF(); };
ACT.calcOpen = d => { QF.calc[d.i].open = true; renderQF(); };
IN.calc = el => { const k = +el.dataset.i, cs = QF.calc[k]; cs[el.dataset.f] = el.value; const x = QF.produits[k]; const it = byId('stock', x.itemId); const dd = calcDose(it, cs); if (dd != null) { x.dose = dd; QF.manual = true; const inp = document.querySelector(`[data-in="qfDose"][data-i="${k}"]`); if (inp) inp.value = String(dd).replace('.', ','); const t = document.querySelector(`[data-tot="${k}"]`); if (t) t.textContent = qty(r2(dd * qfSurface(), 2), it.unite); } const o = document.getElementById('calcOut' + k); if (o) o.innerHTML = calcText(it, cs); };
function qfParcPick(p, noCult) { const c = curCult(p); const on = QF.parcelles.includes(p.id); const why = QF.edit ? '' : ivBlock(p, QF.type, { ressemis: QF.ressemis }); return `<div class="pick ${on ? 'on' : ''} ${why ? 'dis' : ''}" style="--c:${CULTURES[c?.culture]?.color || '#999'}" data-a="qfP" data-id="${p.id}"><i class="sw"></i><span>${esc(p.nom)}<small>${why ? `<b class="why">${esc(why)}</b>` : `${nf(p.surface, 1)} ha${noCult ? '' : ' · ' + esc(CULTURES[c?.culture]?.nom || '—')}`}</small></span><span class="ck">${on ? ic('check') : ''}</span></div>`; }
ACT.qfToggle = d => { QF.open = QF.open || {}; if (d.k === 'type') { QF.typeChosen = !QF.typeChosen; } else QF.open[d.k] = !QF.open[d.k]; renderQF(); };
ACT.qfOpenC = d => { QF.open['c_' + d.c] = !QF.open['c_' + d.c]; renderQF(); };
ACT.qfP = d => { const a = QF.parcelles; const i = a.indexOf(d.id); if (i < 0) { const why = ivBlock(byId('parcelles', d.id), QF.type, { ressemis: QF.ressemis }); if (why) { toast(`${parcName(d.id)} : ${why}`, 'warn'); return; } } i >= 0 ? a.splice(i, 1) : a.push(d.id); if (!QF.manual) suggestPlan(QF.planLabel); renderQF(); };
ACT.qfCult = d => { const ids0 = d.c === '*' ? activeParcels().map(p => p.id) : d.c === '_none' ? activeParcels().filter(p => !curCult(p)).map(p => p.id) : activeParcels().filter(p => curCult(p)?.culture === d.c).map(p => p.id); const ids = ids0.filter(id => !ivBlock(byId('parcelles', id), QF.type, { ressemis: QF.ressemis })); if (!ids.length) { toast('Aucune parcelle de ce groupe ne convient pour cette opération', 'warn'); return; } const all = ids.every(id => QF.parcelles.includes(id)); if (all) QF.parcelles = QF.parcelles.filter(id => !ids.includes(id)); else ids.forEach(id => { if (!QF.parcelles.includes(id)) QF.parcelles.push(id); }); if (ids.length < ids0.length) toast(`${ids0.length - ids.length} parcelle(s) écartée(s) : opération impossible`, 'warn'); if (!QF.manual) suggestPlan(); renderQF(); };
ACT.qfT = d => { const bad = QF.parcelles.filter(id => ivBlock(byId('parcelles', id), d.k)); if (bad.length) { QF.parcelles = QF.parcelles.filter(id => !bad.includes(id)); toast(`${bad.map(id => `${parcName(id)} : ${ivBlock(byId('parcelles', id), d.k)}`).join(' · ')} — retirée(s) de la sélection`, 'warn'); } QF.type = d.k; QF.typeLocked = true; QF.typeChosen = true; QF.manual = false; QF.produits = []; QF.pickOpen = false; QF.prodCat = null; suggestPlan(); const cats = TYPE_CATS[QF.type] || []; QF.produits = QF.produits.filter(x => cats.includes(byId('stock', x.itemId)?.cat)); if (!QF.planLabel) QF.label = INTER_TYPES[d.k]; renderQF(); };
ACT.qfS = d => { QF.statut = d.v; if (d.v === 'planifiee' && QF.date <= TODAY) QF.date = addDays(TODAY, 1); if (d.v === 'realisee' && QF.date > TODAY) QF.date = TODAY; renderQF(); };
ACT.qfDate = d => { QF.date = d.v; renderQF(); };
ACT.qfM = d => { const a = QF.materiels; const i = a.indexOf(d.id); if (i < 0 && byId('materiel', d.id)?.panne?.immo) toast(`${matName(d.id)} est déclaré en panne (immobilisé)`, 'warn'); i >= 0 ? a.splice(i, 1) : a.push(d.id); renderQF(); };
ACT.qfPC = d => { QF.prodCat = d.c; QF.newProd = false; renderQF(); };
ACT.qfPickOpen = () => { QF.pickOpen = true; renderQF(); };
ACT.qfAddP = d => { const it = byId('stock', d.id); const c = QF.parcelles.length ? curCult(byId('parcelles', QF.parcelles[0]))?.culture : null; const st = c && S.itk[c]?.steps.find(s => s.type === QF.type && s.produits.some(x => x.itemId === d.id)); const dose = st ? st.produits.find(x => x.itemId === d.id).dose : ''; QF.produits = QF.produits.filter(x => x.itemId); QF.produits.push({ itemId: d.id, dose }); if (QF.type === 'semis' && it.variete && !QF.variete) QF.variete = it.variete; if (QF.type === 'semis' && it.cultureSem && !QF.cultureSemis) QF.cultureSemis = it.cultureSem; QF.pickOpen = false; QF.manual = true; renderQF(); setTimeout(() => { const el = document.querySelector(`[data-in="qfDose"][data-i="${QF.produits.length - 1}"]`); if (el && dose === '') el.focus(); }, 50); };
ACT.qfDel = d => { QF.produits.splice(+d.i, 1); QF.manual = true; renderQF(); };
ACT.qfDose = d => { const x = QF.produits[+d.i]; const it = byId('stock', x.itemId); const step = DOSE_STEP[it?.unite] || 1; x.dose = Math.max(0, r2((parseFloat(String(x.dose).replace(',', '.')) || 0) + step * +d.d, 3)); QF.manual = true; renderQF(); };
ACT.qfNewP = () => { QF.newProd = true; renderQF(); setTimeout(() => document.getElementById('qfNewNom')?.focus(), 50); };
ACT.qfNewCancel = () => { QF.newProd = false; renderQF(); };
ACT.qfNewU = d => { QF.newUnit = d.v; document.querySelectorAll('#qfNewU .fchip').forEach(x => x.classList.toggle('on', x.dataset.v === d.v)); };
ACT.qfNewAdd = d => { const nom = document.getElementById('qfNewNom')?.value.trim(); if (!nom) { toast('Indiquez le nom du produit', 'warn'); return; } const it = { id: uid('st'), nom, cat: d.c, unite: QF.newUnit || ({ phyto: 'L', amendements: 't' }[d.c] || 'kg'), qte: 0, pmp: 0, basePrix: 0, batch: 1, seuil: 0, capacite: null, emplacement: '', fournisseur: '', lot: '', dateEntree: TODAY }; S.stock.push(it); QF.newProd = false; QF.newUnit = null; ACT.qfAddP({ id: it.id }); toast('Produit créé (stock à zéro : pensez à saisir une entrée)'); };
CH.qfRes = el => { QF.ressemis = el.checked; renderQF(); };
ACT.qfCS = d => { QF.cultureSemis = d.v; renderQF(); };
CH.qfCSsel = el => { if (el.value) { QF.cultureSemis = el.value; renderQF(); } };
ACT.qfWho = d => { const a = QF.personnes; const i = a.indexOf(d.n); if (d.add) { if (i < 0) a.push(d.n); } else i >= 0 ? a.splice(i, 1) : a.push(d.n); renderQF(); };
ACT.qfFav = d => { applyFav(d.id); QF.manual = true; QF.typeChosen = true; renderQF(); };
CH.qfProd = el => { QF.produits[+el.dataset.i].itemId = el.value; QF.manual = true; renderQF(); };
CH.qfMo = el => { QF.mo = el.value; };
CH.qfFavSave = el => { QF.saveFav = el.checked; };
CH.qfPhoto = async el => { for (const f of [...el.files].slice(0, 6)) { QF.photos.push(await downscale(f)); } renderQF(); };
IN.qf = el => { QF[el.dataset.k] = el.value; if (el.dataset.k === 'label') QF.autoLabel = false; if (el.dataset.k === 'date') { document.querySelectorAll('#mf [data-a=qfDate]').forEach(b => b.classList.toggle('on', b.dataset.v === el.value)); } };
IN.qfDose = el => { const x = QF.produits[+el.dataset.i]; x.dose = el.value; QF.manual = true; const it = byId('stock', x.itemId); const t = document.querySelector(`[data-tot="${el.dataset.i}"]`); if (t && it) t.textContent = qty(r2((parseFloat(String(el.value).replace(',', '.')) || 0) * qfSurface(), 2), it.unite); };
IN.qfH = el => { const s = qfSurface(); QF.hHa = s ? (parseFloat(String(el.value).replace(',', '.')) || 0) / s : 0; };
function downscale(file, max = 640) { return new Promise(res => { const r = new FileReader(); r.onload = () => { const img = new Image(); img.onload = () => { const k = Math.min(1, max / Math.max(img.width, img.height)); const c = document.createElement('canvas'); c.width = img.width * k; c.height = img.height * k; c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); res(c.toDataURL('image/jpeg', 0.72)); }; img.onerror = () => res(r.result); img.src = r.result; }; r.readAsDataURL(file); }); }
/** Après réalisation : met à jour l'état de la parcelle (semis, variété) et recale les travaux prévus. */
function afterApply(iv, extra = {}) {
  const p = byId('parcelles', iv.parcelleId); const rec = p?.cultures[iv.campagne]; if (!rec) return;
  if (iv.type === 'semis') { rec.semis = iv.date; rec.semisFait = iv.date; rec.recoltePrev = null; if (extra.variete) rec.variete = extra.variete; if (iv.campagne === CURRENT_CAMP) syncItkParcel(p); }
}
function submitQF() {
  if (!QF.parcelles.length) throw new Error('Choisissez au moins une parcelle');
  const prods = QF.produits.filter(x => x.itemId && parseFloat(String(x.dose).replace(',', '.')) > 0).map(x => ({ itemId: x.itemId, dose: parseFloat(String(x.dose).replace(',', '.')) }));
  if (TYPE_REQ.includes(QF.type) && !prods.length) { QF.open.prod = true; renderQF(); throw new Error(QF.produits.some(x => x.itemId) ? 'Indiquez la dose par hectare du produit' : `Choisissez le ${QF.type === 'semis' ? 'semence' : 'produit'} utilisé`); }
  if (!QF.edit) { const bad = QF.parcelles.map(id => [id, ivBlock(byId('parcelles', id), QF.type, { ressemis: QF.ressemis, date: QF.date })]).filter(x => x[1]); if (bad.length) throw new Error(bad.map(([id, w]) => `${parcName(id)} : ${w}`).join(' · ')); }
  if (QF.type === 'semis' && !QF.edit && QF.parcelles.some(id => !curCult(byId('parcelles', id))) && !QF.cultureSemis) throw new Error('Choisissez la culture semée');
  if (!QF.personnes.length) throw new Error('Indiquez qui ' + (QF.statut === 'realisee' ? 'a fait' : 'fera') + ' cette opération');
  rememberPeople(QF.personnes);
  const surfTot = qfSurface();
  const recolte = parseFloat(String(QF.recolte || '').replace(',', '.'));
  if (QF.type === 'recolte' && QF.statut === 'realisee' && !(recolte > 0)) throw new Error('Indiquez la quantité récoltée');
  if (QF.statut === 'realisee' && QF.date > TODAY) throw new Error('Une opération réalisée ne peut pas être datée dans le futur');
  if (QF.edit) { const i = byId('interventions', QF.edit); i.custom = true; Object.assign(i, { type: QF.type, label: QF.label || INTER_TYPES[QF.type], date: QF.date, produits: prods, materiels: [...QF.materiels], heures: r2(QF.hHa * i.surface, 1), mo: QF.personnes.join(', '), personnes: [...QF.personnes], meteo: QF.meteo, obs: QF.obs, photos: QF.photos }); commit('Intervention modifiée'); return; }
  const warns = []; let total = 0;
  if (QF.calc) Object.entries(QF.calc).forEach(([k, cs]) => { const it = byId('stock', QF.produits[k]?.itemId); if (it && cs.open) { const v = parseFloat(String(cs.pmg).replace(',', '.')); if (v > 0) it.pmg = v; const g = parseFloat(cs.gpd); if (g > 0 && (it.unite === 'dose' || it.unite === 'u')) it.grainsDose = g; } });
  if (QF.type === 'semis' && QF.cultureSemis) prods.forEach(x => { const it = byId('stock', x.itemId); if (it && it.cat === 'semences' && !it.cultureSem) it.cultureSem = QF.cultureSemis; });
  QF.parcelles.forEach(pid => {
    const p = byId('parcelles', pid);
    if (QF.type === 'semis' && QF.cultureSemis && !QF.edit) { const rec = p.cultures[CURRENT_CAMP]; if (!rec || rec.culture !== QF.cultureSemis) { if (rec) S.interventions = S.interventions.filter(i => !(i.parcelleId === pid && i.campagne === CURRENT_CAMP && i.statut === 'planifiee' && i.fromItk)); p.cultures[CURRENT_CAMP] = { culture: QF.cultureSemis, variete: QF.variete || '', semis: QF.date, recoltePrev: null, rdtPrev: null, rdtReel: null }; } }
    const camp = Object.keys(p.cultures).map(Number).filter(c => p.cultures[c].semis <= QF.date || c === campOf(QF.date)).sort((a, b) => b - a)[0] || campOf(QF.date);
    let iv = QF.planLabel ? S.interventions.filter(i => i.parcelleId === pid && i.statut === 'planifiee' && i.label === QF.planLabel && i.type === QF.type).sort((a, b) => Math.abs(daysBetween(a.date, QF.date)) - Math.abs(daysBetween(b.date, QF.date)))[0] || null : null;
    const itkLbl = !QF.planLabel && (!QF.label || QF.label === INTER_TYPES[QF.type]) ? (S.itk[p.cultures[CURRENT_CAMP]?.culture]?.steps.filter(x => x.type === QF.type) || []) : [];
    const data = { type: QF.type, label: itkLbl.length === 1 ? itkLbl[0].label : QF.label || INTER_TYPES[QF.type], date: QF.date, produits: prods.map(x => ({ ...x })), materiels: [...QF.materiels], heures: r2(QF.hHa * p.surface, 1), mo: QF.personnes.join(', '), personnes: [...QF.personnes], meteo: QF.meteo, obs: QF.obs, photos: QF.photos };
    if (iv) Object.assign(iv, data);
    else { iv = { id: uid('iv'), campagne: camp, parcelleId: pid, statut: 'planifiee', surface: p.surface, ...data }; S.interventions.push(iv); }
    if (QF.type === 'recolte' && QF.statut === 'realisee') iv.recolteQte = r2(recolte * p.surface / surfTot, 2);
    if (QF.statut === 'realisee') { warns.push(...applyIntervention(iv)); total += iv.coutIntrants; afterApply(iv, { variete: QF.variete }); }
    else if (QF.type === 'semis' && QF.variete) { const rec = p.cultures[camp]; if (rec) rec.variete = QF.variete; }
  });
  if (QF.saveFav) S.favoris.push({ id: uid('f'), label: QF.label || INTER_TYPES[QF.type], type: QF.type, produits: prods, materiels: [...QF.materiels], hHa: r2(QF.hHa, 3) });
  S.interventions.sort((a, b) => a.date.localeCompare(b.date));
  const n = QF.parcelles.length;
  commit(warns.length ? `Enregistrée avec alertes : ${warns.join(' · ')}` : QF.statut === 'realisee' ? `${n > 1 ? `Opération enregistrée sur ${n} parcelles` : 'Opération enregistrée'}${total ? ` · ${eur(total)} d'intrants déduits des stocks` : ''}` : `${n > 1 ? n + ' opérations planifiées' : 'Opération planifiée'} · visibles dans Tâches`, warns.length ? 'warn' : '');
}

/* =========================== STOCKS =========================== */
/* =========================== STOCKS (visuel) =========================== */
const STOCK_META = {
  production: { label: 'Récoltes', icon: 'wheat', color: '#C9962E' }, semences: { label: 'Semences', icon: 'sprout', color: '#2E9A5B' },
  engrais: { label: 'Engrais', icon: 'flask', color: '#2F7FD1' }, phyto: { label: 'Phytos', icon: 'shield', color: '#D9487A' },
  amendements: { label: 'Amendements', icon: 'layers', color: '#94664A' }, carburants: { label: 'Carburant', icon: 'fuel', color: '#5B6B7A' },
  autre: { label: 'Autres', icon: 'box', color: '#7A6E5D' },
};
const QTY_PRESETS = { kg: [100, 500, 1000, 5000], L: [5, 20, 100, 1000], t: [1, 5, 10, 25], dose: [1, 5, 10, 20], u: [1, 5, 10, 50] };
/** Niveau de remplissage : par rapport à la capacité si connue, sinon à 3 × le seuil d'alerte. */
function stockLevel(i) {
  if (i.cat === 'production') return null;
  const ref = i.capacite > 0 ? i.capacite : i.seuil > 0 ? i.seuil * 3 : null;
  const state = i.qte <= 0 ? 'danger' : i.seuil > 0 && i.qte <= i.seuil ? 'warn' : 'ok';
  return { ratio: ref ? Math.max(0, Math.min(1, i.qte / ref)) : null, seuilPos: ref && i.seuil ? Math.min(1, i.seuil / ref) : null, state };
}
const gauge = (i, big) => { const l = stockLevel(i); if (!l || l.ratio == null) return ''; return `<div class="gauge ${big ? 'big' : ''} ${l.state}"><i style="width:${l.ratio * 100}%"></i>${l.seuilPos ? `<b style="left:${l.seuilPos * 100}%" title="Seuil d'alerte"></b>` : ''}</div>`; };
const stIcon = i => STOCK_META[i.cat]?.icon || 'box';
/** Total des quantités, regroupées par unité (kg et t additionnés en tonnes). */
function qtyTotals(items) {
  const g = {}; items.forEach(i => { if (!(i.qte > 0)) return; const u = i.unite === 'kg' || i.unite === 't' ? 't' : i.unite; g[u] = (g[u] || 0) + (i.unite === 'kg' ? i.qte / 1000 : i.qte); });
  return Object.entries(g).map(([u, v]) => u === 't' ? (v < 1 ? `${nf(v * 1000)} kg` : `${nfx(v, 1)} t`) : u === 'L' ? `${nf(v)} L` : `${nfx(v, 1)} ${u}${v > 1 && u === 'dose' ? 's' : ''}`).join(' · ') || '0';
}
function harvestInfo(i) { const inQ = sum(S.mouvements.filter(m => m.itemId === i.id && m.type === 'entree'), m => m.qte); const sold = sum(S.ventes.filter(v => v.itemId === i.id), v => v.qte); return { inQ, sold }; }

VIEWS.stocks = () => {
  const t = tab('stk', 'apercu');
  const nav = `<div class="fchips">${[['apercu', 'Vue d’ensemble', 'grid'], ...Object.entries(STOCK_META).map(([k, m]) => [k, m.label, m.icon]), ['mouvements', 'Mouvements', 'move'], ['inventaire', 'Inventaire', 'clipboard']].map(([k, l, i]) => `<button class="fchip ${t === k ? 'on' : ''}" style="--c:${STOCK_META[k]?.color || 'var(--text)'}" data-a="tab" data-k="stk" data-v="${k}">${ic(i)} ${l}</button>`).join('')}</div>`;
  const pas = [{ a: 'stockFixPick', i: 'edit', l: 'Corriger un stock', more: true }, { a: 'newItem', i: 'plus', l: 'Nouveau produit', more: true }, { a: 'stockOutPick', i: 'minus', l: 'Sortie' }, { a: 'purchase', i: 'plus', l: 'Entrée', primary: true }];
  let body;
  if (t === 'apercu') body = stockOverview();
  else if (t === 'mouvements') body = stockMovesView();
  else if (t === 'inventaire') body = inventaireView();
  else body = stockCategory(t);
  return `${demoBar('Stocks de démonstration : les quantités résultent du rejeu des achats, interventions, récoltes et ventes fictifs.')}${nav}<div class="mt">${body}</div>${pa(pas).replace('class="only-d row"', 'class="only-d row" style="margin-top:16px;justify-content:flex-end"')}`;
};
function stockOverview() {
  const st = stockTotals();
  const low = S.stock.filter(i => i.cat !== 'production' && i.seuil > 0 && i.qte <= i.seuil).sort((a, b) => a.qte / a.seuil - b.qte / b.seuil);
  const crops = S.stock.filter(i => i.cat === 'production' && i.qte > 0.001).sort((a, b) => b.campagne - a.campagne || b.qte - a.qte);
  const tonnes = sum(crops, i => i.qte);
  const inStock = S.stock.filter(i => i.cat !== 'production' && i.qte > 0).length;
  return `<div class="st-hero"><div><span>Récoltes en stock</span><b>${nf(tonnes, 1)} t</b><small>${crops.length} lot(s) · ≈ ${keur(st.production)}</small></div><div><span>Intrants en stock</span><b>${inStock} produit${inStock > 1 ? 's' : ''}</b><small>${low.length ? `${low.length} à réapprovisionner` : 'aucune alerte'} · ${keur(st.intrants)}</small></div></div>
  ${low.length ? `<div class="sec-h"><h3>${ic('alert')} À réapprovisionner</h3><span class="n-pill">${low.length}</span></div><div class="hscroll">${low.map(i => `<div class="st-alert" style="--c:${STOCK_META[i.cat].color}" data-a="openStock" data-id="${i.id}"><div class="row"><span class="st-ic">${ic(stIcon(i))}</span><b>${esc(i.nom)}</b></div><div class="q ${i.qte <= 0 ? 'danger' : 'warn'}">${qty(i.qte, i.unite)}</div><small>seuil ${qty(i.seuil, i.unite)}</small>${gauge(i)}<button class="btn sm p" data-a="stockIn" data-id="${i.id}">${ic('plus')} Entrée</button></div>`).join('')}</div>` : `<div class="note mt">${ic('check')}<span>Aucun produit sous son seuil d’alerte.</span></div>`}
  <div class="sec-h"><h3>Par catégorie</h3></div>
  <div class="st-cats">${Object.entries(STOCK_META).map(([k, m]) => { const items = S.stock.filter(i => i.cat === k && (k !== 'production' || i.qte > 0.001)); const val = sum(items, i => stockValue(i) || 0); const nLow = items.filter(i => stockLevel(i)?.state && stockLevel(i).state !== 'ok').length; const np = items.filter(i => i.qte > 0).length; return `<button class="st-cat" style="--c:${m.color}" data-a="tab" data-k="stk" data-v="${k}"><span class="st-ic">${ic(m.icon)}</span>${nLow ? `<span class="st-badge">${nLow}</span>` : ''}<b>${m.label}</b><em>${qtyTotals(items)}</em><span>${np} produit${np > 1 ? 's' : ''} · ${keur(val)}</span></button>`; }).join('')}</div>
  ${crops.length ? `<div class="sec-h"><h3>Récoltes</h3><span class="sp"></span><button class="lnk" data-a="tab" data-k="stk" data-v="production">Tout ${ic('chevR')}</button></div><div class="hscroll">${crops.slice(0, 8).map(siloCard).join('')}</div>` : ''}`;
}
function siloCard(i) {
  const { inQ, sold } = harvestInfo(i); const col = CULTURES[i.culture]?.color || '#C9962E'; const v = stockValue(i);
  const pctSold = inQ ? Math.min(100, sold / inQ * 100) : 0;
  return `<div class="silo" style="--c:${col}" data-a="openStock" data-id="${i.id}"><div class="silo-top"><span class="sw"></span><b>${esc(CULTURES[i.culture]?.nom || i.nom)}</b><small>récolte ${i.campagne}</small></div>
  <div class="silo-q">${nf(i.qte, 1)}<span> t</span></div><small class="muted">${esc(i.emplacement)}${v != null ? ` · ≈ ${keur(v)}` : ''}</small>
  <div class="silo-bar"><i style="width:${pctSold}%"></i></div><small class="muted">${nf(pctSold)} % vendu sur ${nf(inQ, 1)} t récoltées</small>
  <button class="btn sm" style="--c:var(--c-vente)" data-a="newSale" data-item="${i.id}">${ic('euro')} Vendre</button></div>`;
}
function stockCategory(cat) {
  const m = STOCK_META[cat]; const q = norm(UI.q.stk || '');
  let items = S.stock.filter(i => i.cat === cat && (!q || norm(i.nom + i.emplacement + i.lot).includes(q)));
  if (cat === 'production') { items = items.filter(i => i.qte > 0.001 || UI.f.showEmpty); return `${items.length ? `<div class="silos">${items.sort((a, b) => b.campagne - a.campagne).map(siloCard).join('')}</div>` : '<div class="card empty">Aucune récolte en stock. Les récoltes s’ajoutent automatiquement quand vous enregistrez une opération « Récolte ».</div>'}`; }
  const val = sum(items, i => stockValue(i) || 0);
  return `<div class="row mb" style="gap:10px"><div class="search-in" style="flex:1">${ic('search')}<input class="inp" placeholder="Rechercher dans ${m.label.toLowerCase()}" data-in="stkQ" value="${esc(UI.q.stk || '')}"></div></div>
  <div class="small muted mb"><b style="color:var(--text)">${qtyTotals(items)}</b> · ${items.length} produit(s) · ${eur(val)}</div>
  ${items.sort((a, b) => (b.qte > 0) - (a.qte > 0) || a.nom.localeCompare(b.nom)).map(i => { const l = stockLevel(i); return `<div class="st-item ${i.qte <= 0 ? 'empty' : ''}" style="--c:${m.color}" data-a="openStock" data-id="${i.id}"><span class="st-ic">${ic(m.icon)}</span><div class="st-main"><b>${esc(i.nom)}</b><small>${i.variete ? 'Variété ' + esc(i.variete) + ' · ' : ''}${esc(i.emplacement || '—')}${i.lot ? ' · lot ' + esc(i.lot) : ''}</small>${gauge(i)}</div><div class="st-r"><b class="${l?.state || ''}">${qty(i.qte, i.unite)}</b><small>${eur(stockValue(i))}</small></div></div>`; }).join('') || '<div class="card empty">Aucun produit</div>'}
  <button class="btn mt" style="width:100%" data-a="newItem" data-cat="${cat}">${ic('plus')} Ajouter un produit ${m.label.toLowerCase()}</button>`;
}
IN.stkQ = el => { UI.q.stk = el.value; const pos = el.selectionStart; render(); const i = document.querySelector('[data-in=stkQ]'); if (i) { i.focus(); i.setSelectionRange(pos, pos); } };
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
  const m = STOCK_META[i.cat]; const v = stockValue(i); const l = stockLevel(i);
  const mv = S.mouvements.filter(x => x.itemId === id).sort((a, b) => b.date.localeCompare(a.date));
  const months = []; for (let k = 11; k >= 0; k--) { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - k); months.push({ key: `${d.getFullYear()}-${pad(d.getMonth() + 1)}`, label: d.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', '') }); }
  const outs = months.map(mo => r2(sum(mv.filter(x => x.date.startsWith(mo.key) && ['sortie', 'perte'].includes(x.type)), x => x.qte), 2));
  const ins = months.map(mo => r2(sum(mv.filter(x => x.date.startsWith(mo.key) && x.type === 'entree'), x => x.qte), 2));
  const isProd = i.cat === 'production';
  const actions = isProd ? [['newSale', 'euro', 'Vendre', 'var(--c-vente)', { item: i.id }], ['stockOut', 'minus', 'Sortie', 'var(--c-stock)', { id: i.id }], ['stockFix', 'edit', 'Corriger', 'var(--c-eco)', { id: i.id }], ['stockMove', 'move', 'Déplacer', 'var(--c-mat)', { item: i.id, type: 'transfert' }]]
    : [['stockIn', 'plus', 'Entrée', 'var(--c-cult)', { id: i.id }], ['stockOut', 'minus', 'Sortie', 'var(--c-stock)', { id: i.id }], ['stockFix', 'edit', 'Corriger', 'var(--c-eco)', { id: i.id }], ['stockMove', 'move', 'Déplacer', 'var(--c-mat)', { item: i.id, type: 'transfert' }]];
  const h = isProd ? harvestInfo(i) : null;
  return {
    title: esc(i.nom), actions: `<button class="btn g icon" data-a="stockMenu" data-id="${i.id}" aria-label="Plus d’actions">${ic('dots')}</button>`, body: `<div class="st-sheet" style="--c:${isProd ? CULTURES[i.culture]?.color || m.color : m.color}"><div class="row"><span class="st-ic big">${ic(m.icon)}</span><div style="flex:1;min-width:0"><small>${m.label}${i.variete ? ' · variété ' + esc(i.variete) : ''}${i.lot ? ' · lot ' + esc(i.lot) : ''}</small><div class="st-big ${l?.state || ''}" data-a="stockFix" data-id="${i.id}" style="cursor:pointer" title="Corriger">${nfx(i.qte, 2)} <span>${i.unite}</span> <span class="fix-hint">${ic('edit')}</span></div><small>${esc(i.emplacement || '—')}</small></div><div style="text-align:right"><small>${isProd ? 'Valeur théorique' : 'Valeur'}</small><span style="display:block;font-size:13.5px;font-weight:700;color:var(--text-2)">${v == null ? '—' : eur(v)}</span><small>${isProd ? (refPrice(i.culture) != null ? `${eur(refPrice(i.culture))}/t` : 'pas de cours') : `${eur(i.pmp, i.pmp < 10 ? 3 : 2)}/${i.unite}`}</small></div></div>
      ${gauge(i, true)}${l && l.ratio != null ? `<div class="row small" style="justify-content:space-between;margin-top:6px"><span>${l.state === 'ok' ? 'Niveau correct' : l.state === 'warn' ? 'Sous le seuil d’alerte' : 'Épuisé'}</span><span class="muted">seuil ${qty(i.seuil, i.unite)}${i.capacite ? ` · capacité ${qty(i.capacite, i.unite)}` : ''}</span></div>` : ''}
      ${h ? `<div class="silo-bar" style="margin-top:12px"><i style="width:${h.inQ ? Math.min(100, h.sold / h.inQ * 100) : 0}%"></i></div><div class="small muted" style="margin-top:4px">${nf(h.sold, 1)} t vendues sur ${nf(h.inQ, 1)} t récoltées</div>` : ''}</div>
    <div class="st-acts">${actions.map(([a, ico, lab, c, data]) => `<button style="--c:${c}" data-a="${a}" ${Object.entries(data).map(([k, x]) => `data-${k}="${x}"`).join(' ')}><span>${ic(ico)}</span>${lab}</button>`).join('')}</div>
    <div class="card mt">${card('Entrées et sorties · 12 mois', barChart({ labels: months.map(x => x.label), series: [{ name: 'Entrées', color: 'var(--c-cult)', values: ins }, { name: 'Sorties', color: 'var(--c-stock)', values: outs }], height: 170, fmt: x => nfx(x, 0) }))}</div>
    <div class="card pad mt"><div class="kv">${[[isProd ? 'Campagne' : 'Fournisseur', isProd ? i.campagne : i.fournisseur || '—'], ['Dernière entrée', dfr(i.dateEntree)], ['Seuil d’alerte', i.seuil ? qty(i.seuil, i.unite) : '—'], ['Capacité', i.capacite ? qty(i.capacite, i.unite) : '—']].map(([k, x]) => `<div><span>${k}</span><b>${esc(x)}</b></div>`).join('')}</div><button class="btn sm mt" data-a="editItem" data-id="${i.id}">${ic('edit')} Modifier le produit</button></div>
    <div class="sec-h"><h3>Historique</h3><span class="muted small">${mv.length} mouvement(s)</span></div><div class="card">${mv.slice(0, 60).map(mMove).join('') || '<div class="empty">Aucun mouvement</div>'}</div>`
  };
};
/* ---- Saisies rapides : quantité par boutons ---- */
function qtyField(unit, val = '') {
  const pr = QTY_PRESETS[unit] || [1, 5, 10, 50];
  return `<div class="qty-box"><button type="button" class="qb" data-a="qtyAdj" data-d="-1">${ic('minus')}</button><input class="qty-in" name="qte" inputmode="decimal" value="${val}" placeholder="0" autocomplete="off"><span class="qu">${unit}</span><button type="button" class="qb" data-a="qtyAdj" data-d="1">${ic('plus')}</button></div>
  <div class="qty-pre">${pr.map(v => `<button type="button" data-a="qtyAdd" data-v="${v}">+ ${nf(v)}</button>`).join('')}<button type="button" data-a="qtyAdd" data-v="0">Effacer</button></div>`;
}
const qtyInput = () => document.querySelector('#mf .qty-in');
const qtyVal = () => parseFloat(String(qtyInput()?.value || '0').replace(',', '.')) || 0;
ACT.qtyAdd = d => { const i = qtyInput(); if (!i) return; i.value = +d.v === 0 ? '' : String(r2(qtyVal() + +d.v, 3)).replace('.', ','); i.dispatchEvent(new Event('input', { bubbles: true })); };
ACT.qtyAdj = d => { const i = qtyInput(); if (!i) return; const step = qtyVal() >= 100 ? 10 : 1; i.value = String(Math.max(0, r2(qtyVal() + step * +d.d, 3))).replace('.', ','); i.dispatchEvent(new Event('input', { bubbles: true })); };
IN.qtyLive = () => { const el = document.getElementById('qtyLive'); if (el) el.innerHTML = el.dataset.f ? new Function('q', el.dataset.f)(qtyVal()) : ''; };
document.addEventListener('input', e => { if (e.target.classList?.contains('qty-in') || (e.target.name === 'prix' && e.target.closest('#mf') && qtyInput())) { const el = document.getElementById('qtyLive'); if (el && QTY_LIVE) el.innerHTML = QTY_LIVE(qtyVal(), e.target.form); } });
let QTY_LIVE = null;
function pickProduct(title, filter, next) {
  const items = S.stock.filter(filter);
  openModal({ title, body: `${Object.entries(STOCK_META).map(([k, m]) => { const its = items.filter(i => i.cat === k); return its.length ? `<div class="ob-fam" style="margin-top:12px">${m.label}</div><div class="card">${its.map(i => `<div class="mrow" style="--c:${m.color}" data-a="${next}" data-id="${i.id}"><div class="ic">${ic(m.icon)}</div><div class="tx"><b>${esc(i.nom)}</b><span>${qty(i.qte, i.unite)} · ${esc(i.emplacement || '')}</span></div>${ic('chevR')}</div>`).join('')}</div>` : ''; }).join('')}`, foot: '<button type="button" class="btn" data-a="newItemFromPick">' + ic('plus') + ' Nouveau produit</button><button type="button" class="btn" data-a="closeModal">Fermer</button>' });
}
ACT.newItemFromPick = () => { closeModal(); setTimeout(() => itemForm(null), 200); };
ACT.purchase = d => { if (d && d.item) return ACT.stockIn({ id: d.item }); stockWizard('in', d && d.cat); };
/* ---- Assistant Entrée / Sortie : catégorie → produit (de cette catégorie) → quantité ---- */
let SWZ = null;
function stockWizard(mode, cat) { SWZ = { mode, cat: cat || null, creating: false }; openModal({ title: { in: 'Entrée en stock', out: 'Sortie de stock', fix: 'Corriger un stock' }[mode], body: '', foot: '', onMount: renderSWZ }); }
function renderSWZ() {
  const f = document.getElementById('mf'); if (!f || !SWZ) return;
  const cats = Object.entries(STOCK_META);
  if (!SWZ.cat) { f.innerHTML = `<p class="small muted" style="margin:0">${{ in: 'Que rentrez-vous ?', out: 'Que sortez-vous ?', fix: 'Quel stock corriger ?' }[SWZ.mode]}</p><div class="st-pick big">${cats.map(([k, m]) => { const n = S.stock.filter(i => i.cat === k && (SWZ.mode !== 'out' || i.qte > 0)).length; return `<button type="button" style="--c:${m.color}" data-a="swzCat" data-c="${k}"><span class="st-ic">${ic(m.icon)}</span>${m.label}<small>${n} produit${n > 1 ? 's' : ''}</small></button>`; }).join('')}</div>${SWZ.mode === 'in' ? `<div class="note small">${ic('info')}<span>Les récoltes saisies avec l’opération « Récolte » entrent automatiquement en stock ; ici, vous pouvez ajouter un stock existant.</span></div>` : ''}`; return; }
  const m = STOCK_META[SWZ.cat];
  const items = S.stock.filter(i => i.cat === SWZ.cat && (SWZ.mode !== 'out' || i.qte > 0)).sort((a, b) => (b.qte > 0) - (a.qte > 0) || a.nom.localeCompare(b.nom));
  if (SWZ.creating && SWZ.cat === 'production') { f.innerHTML = harvestCreateForm(); return; }
  if (SWZ.creating) { f.innerHTML = `<button type="button" class="lnk-back" data-a="swzBack">${ic('chevL')} ${m.label}</button><div class="row" style="gap:10px;margin:6px 0 4px"><span class="st-ic" style="--c:${m.color};background:${m.color};color:#fff">${ic(m.icon)}</span><b>Nouveau produit · ${m.label.toLowerCase()}</b></div>
    <label class="field"><span>Nom du produit</span><input class="inp" id="swzNom" placeholder="${{ semences: 'Ex. : Semence blé KWS Extase', engrais: 'Ex. : Ammonitrate 27 %', phyto: 'Ex. : nom commercial du produit', amendements: 'Ex. : Chaux vive', carburants: 'Ex. : GNR', production: '' }[SWZ.cat] || ''}" autocomplete="off"></label>
    ${SWZ.cat === 'semences' ? `<label class="field"><span>Variété <small class="muted">(facultatif)</small></span><input class="inp" id="swzVar" placeholder="Ex. : Chevignon" autocomplete="off"></label>` : ''}
    <div class="field"><span>Unité</span><div class="ob-chips" id="swzU">${[['kg', 'kg'], ['t', 'tonne'], ['L', 'litre'], ['u', 'unité'], ['dose', 'dose']].map(([v, l]) => `<button type="button" class="fchip ${v === ({ phyto: 'L', carburants: 'L', amendements: 't' }[SWZ.cat] || 'kg') ? 'on' : ''}" style="--c:var(--primary)" data-a="swzUnit" data-v="${v}">${l}</button>`).join('')}</div></div>
    <button type="button" class="btn p mt" style="width:100%;height:50px" data-a="swzCreate">${ic('check')} Créer et saisir la quantité</button>`; setTimeout(() => document.getElementById('swzNom')?.focus(), 60); return; }
  f.innerHTML = `<button type="button" class="lnk-back" data-a="swzBack">${ic('chevL')} Catégories</button>
  <div class="row" style="gap:10px;margin:6px 0 2px"><span class="st-ic" style="background:${m.color};color:#fff">${ic(m.icon)}</span><b style="font-size:16px">${m.label}</b><span class="sp"></span><span class="small muted">${items.length} produit(s)</span></div>
  ${SWZ.mode === 'in' ? `<button type="button" class="btn mt" style="width:100%;height:48px;border-style:dashed" data-a="swzNew">${ic('plus')} ${SWZ.cat === 'production' ? 'Nouvelle récolte (choisir la culture)' : 'Nouveau produit ' + m.label.toLowerCase()}</button>` : ''}
  <div class="swz-list">${items.map(i => `<button type="button" class="swz-item" style="--c:${m.color}" data-a="swzPick" data-id="${i.id}"><span class="st-ic">${ic(m.icon)}</span><span class="t"><b>${esc(i.nom)}</b><small>${i.variete ? 'Variété ' + esc(i.variete) + ' · ' : ''}${esc(i.emplacement || '')}</small></span><span class="q ${stockLevel(i)?.state || ''}">${qty(i.qte, i.unite)}</span></button>`).join('') || `<div class="empty small">Aucun produit ${SWZ.mode === 'out' ? 'en stock ' : ''}dans cette catégorie.</div>`}</div>
  `;
}
function harvestCreateForm() {
  const farm = [...new Set(S.parcelles.flatMap(p => Object.values(p.cultures).map(c => c.culture)))].filter(k => CULTURES[k]);
  const others = Object.keys(CULTURES).filter(k => !farm.includes(k) && !['prairie', 'jachere'].includes(k));
  SWZ.hc = SWZ.hc || farm[0] || 'ble_tendre'; SWZ.hy = SWZ.hy || CURRENT_CAMP - 1;
  return `<button type="button" class="lnk-back" data-a="swzBack">${ic('chevL')} Récoltes</button><div class="row" style="gap:10px;margin:6px 0 4px"><span class="st-ic" style="background:${STOCK_META.production.color};color:#fff">${ic('wheat')}</span><b>Nouvelle récolte en stock</b></div>
  <div class="field"><span>Culture</span>${farm.length ? `<div class="ob-chips">${farm.map(k => `<button type="button" class="fchip ${SWZ.hc === k ? 'on' : ''}" style="--c:${CULTURES[k].color}" data-a="swzHC" data-v="${k}"><span class="cat-dot" style="--c:${CULTURES[k].color}"></span>${CULTURES[k].nom}</button>`).join('')}</div>` : ''}
  <select class="inp mt" data-ch="swzHCsel" style="margin-top:8px"><option value="">${farm.length ? 'Autre culture…' : 'Choisir la culture…'}</option>${opts(others.map(k => [k, CULTURES[k].nom]), others.includes(SWZ.hc) ? SWZ.hc : '')}</select></div>
  <div class="field"><span>Récolte de</span><div class="ob-chips">${[CURRENT_CAMP - 2, CURRENT_CAMP - 1, CURRENT_CAMP].map(y => `<button type="button" class="fchip ${SWZ.hy === y ? 'on' : ''}" style="--c:var(--primary)" data-a="swzHY" data-v="${y}">${y}</button>`).join('')}</div></div>
  <label class="field"><span>Lieu de stockage</span><input class="inp" id="swzEmp" list="empsH" placeholder="Silo, cellule, hangar…"><datalist id="empsH">${[...new Set(S.stock.filter(s => s.cat === 'production').map(s => s.emplacement).filter(Boolean))].map(e => `<option value="${esc(e)}">`).join('')}</datalist></label>
  <button type="button" class="btn p mt" style="width:100%;height:50px" data-a="swzHarvest">${ic('check')} ${esc(CULTURES[SWZ.hc]?.nom || '')} récolte ${SWZ.hy} — saisir la quantité</button>`;
}
ACT.swzHC = d => { SWZ.hc = d.v; renderSWZ(); };
CH.swzHCsel = el => { if (el.value) { SWZ.hc = el.value; renderSWZ(); } };
ACT.swzHY = d => { SWZ.hy = +d.v; renderSWZ(); };
ACT.swzHarvest = () => { const emp = document.getElementById('swzEmp')?.value.trim(); const it = prodItem(SWZ.hc, SWZ.hy); if (emp) it.emplacement = emp; saveState(); closeModal(); setTimeout(() => ACT.stockIn({ id: it.id }), 200); };
ACT.swzCat = d => { SWZ.cat = d.c; SWZ.creating = false; renderSWZ(); };
ACT.swzBack = () => { if (SWZ.creating) SWZ.creating = false; else SWZ.cat = null; renderSWZ(); };
ACT.swzNew = () => { SWZ.creating = true; SWZ.unit = { phyto: 'L', carburants: 'L', amendements: 't' }[SWZ.cat] || 'kg'; renderSWZ(); };
ACT.swzUnit = d => { SWZ.unit = d.v; document.querySelectorAll('#swzU .fchip').forEach(x => x.classList.toggle('on', x.dataset.v === d.v)); };
ACT.swzCreate = () => { const nom = document.getElementById('swzNom')?.value.trim(); if (!nom) { toast('Indiquez le nom du produit', 'warn'); return; } const m = STOCK_META[SWZ.cat]; const it = { id: uid('st'), nom, variete: document.getElementById('swzVar')?.value.trim() || '', cat: SWZ.cat, unite: SWZ.unit || 'kg', qte: 0, pmp: 0, basePrix: 0, batch: 1, seuil: 0, capacite: null, emplacement: { semences: 'Hangar semences', engrais: 'Hangar engrais', phyto: 'Local phytosanitaire', carburants: 'Cuve GNR', amendements: 'Plateforme' }[SWZ.cat] || 'Hangar', fournisseur: '', lot: '', dateEntree: TODAY }; S.stock.push(it); saveState(); closeModal(); setTimeout(() => ACT.stockIn({ id: it.id }), 200); };
ACT.swzPick = d => { const mode = SWZ.mode; closeModal(); setTimeout(() => mode === 'in' ? ACT.stockIn({ id: d.id }) : mode === 'fix' ? ACT.stockFix({ id: d.id }) : ACT.stockOut({ id: d.id }), 200); };
ACT.stockFixPick = () => stockWizard('fix');
ACT.stockInGo = d => { closeModal(); setTimeout(() => ACT.stockIn(d), 200); };
ACT.stockOutPick = d => stockWizard('out', d && d.cat);
ACT.stockOutGo = d => { closeModal(); setTimeout(() => ACT.stockOut(d), 200); };
ACT.stockIn = d => {
  const it = byId('stock', d.id); const m = STOCK_META[it.cat];
  QTY_LIVE = (q, f) => { const p = parseFloat(String(f?.prix?.value || '').replace(',', '.')) || 0; return q > 0 ? `Nouveau stock : <b>${qty(it.qte + q, it.unite)}</b>${p ? ` · montant <b>${eur(q * p, 2)}</b>` : ''}` : `Stock actuel : ${qty(it.qte, it.unite)}`; };
  openModal({
    title: `${ic(m.icon)} Entrée · ${esc(it.nom)}`, body: `${qtyField(it.unite)}<div class="qty-live" id="qtyLive">Stock actuel : ${qty(it.qte, it.unite)}</div>
    ${it.cat === 'semences' ? `<label class="field"><span>Variété <small class="muted">(facultatif)</small></span><input class="inp" name="variete" value="${esc(it.variete || '')}" placeholder="Ex. : Chevignon" autocomplete="off"></label>` : ''}
    ${it.cat === 'production' ? `<label class="field"><span>Date</span><input class="inp" type="date" name="date" value="${TODAY}"></label><div class="note small">${ic('info')}<span>Entrée manuelle d’un stock existant. Les récoltes de l’année se saisissent de préférence avec l’opération « Récolte » (rendement de la parcelle mis à jour).</span></div>` : `<div class="grid2"><label class="field"><span>Prix d’achat HT (€/${it.unite})</span><input class="inp" name="prix" inputmode="decimal" value="${it.pmp ? String(r2(it.pmp, 4)).replace('.', ',') : ''}" placeholder="Facultatif"></label><label class="field"><span>Date</span><input class="inp" type="date" name="date" value="${TODAY}"></label></div>`}
    ${it.cat === 'production' ? '' : `<details class="more"><summary>Fournisseur, lot, facture</summary><div class="grid3 mt"><label class="field"><span>Fournisseur</span><input class="inp" name="fournisseur" value="${esc(it.fournisseur || '')}"></label><label class="field"><span>N° de lot</span><input class="inp" name="lot" value="${esc(it.lot || '')}"></label><label class="field"><span>Réf. facture</span><input class="inp" name="ref"></label></div></details>
    <div class="note small">${ic('info')}<span>Avec un prix, l’entrée est enregistrée comme un <b>achat</b> (charge + prix moyen recalculé). Sans prix, c’est une simple entrée.</span></div>`}`,
    submit: 'Valider l’entrée', onSubmit: f => {
      const q = parseFloat(String(f.qte).replace(',', '.')); const p = parseFloat(String(f.prix || '').replace(',', '.'));
      if (!(q > 0)) throw new Error('Indiquez une quantité');
      if (f.lot) it.lot = f.lot;
      if (f.variete != null) it.variete = f.variete.trim();
      if (p > 0) recordPurchase({ itemId: it.id, qte: q, prixUnit: p, date: f.date, fournisseur: f.fournisseur, ref: f.ref }); else stockMove(it.id, 'entree', q, { date: f.date, motif: f.fournisseur ? `Entrée — ${f.fournisseur}` : 'Entrée sans achat' });
      commit(`+ ${qty(q, it.unite)} · stock ${qty(it.qte, it.unite)}`);
    }
  });
};
ACT.stockOut = d => {
  const it = byId('stock', d.id); const m = STOCK_META[it.cat];
  QTY_LIVE = q => q > it.qte + 1e-6 ? `<span style="color:var(--late)">Plus que le stock disponible (${qty(it.qte, it.unite)})</span>` : q > 0 ? `Reste après sortie : <b>${qty(it.qte - q, it.unite)}</b>` : `Disponible : ${qty(it.qte, it.unite)}`;
  openModal({
    title: `${ic(m.icon)} Sortie · ${esc(it.nom)}`, body: `${qtyField(it.unite)}<div class="qty-live" id="qtyLive">Disponible : ${qty(it.qte, it.unite)}</div>
    <div class="field"><span>Motif</span><div class="ob-chips" id="motifs">${[['sortie', 'Utilisation', 'Hors intervention saisie'], ['sortie', 'Cession / don', ''], ['perte', 'Perte / casse', ''], ['perte', 'Périmé', '']].map(([t, l], k) => `<label class="fchip ${k === 0 ? 'on' : ''}" style="--c:var(--c-stock)"><input type="radio" name="motif" value="${t}|${l}" ${k === 0 ? 'checked' : ''} hidden onchange="document.querySelectorAll('#motifs .fchip').forEach(x=>x.classList.toggle('on',x.contains(this)))">${l}</label>`).join('')}</div></div>
    <label class="field"><span>Date</span><input class="inp" type="date" name="date" value="${TODAY}"></label>
    ${it.cat !== 'production' ? `<div class="note small">${ic('info')}<span>Pour un produit utilisé sur une parcelle, saisissez plutôt une <b>opération</b> : la sortie de stock et le coût sont calculés automatiquement.</span></div>` : ''}`,
    submit: 'Valider la sortie', onSubmit: f => {
      const q = parseFloat(String(f.qte).replace(',', '.')); if (!(q > 0)) throw new Error('Indiquez une quantité');
      if (q > it.qte + 1e-6) throw new Error(`Quantité supérieure au stock (${qty(it.qte, it.unite)})`);
      const [t, l] = String(f.motif).split('|'); stockMove(it.id, t, q, { date: f.date, motif: l });
      commit(`− ${qty(q, it.unite)} · stock ${qty(it.qte, it.unite)}`);
    }
  });
};
ACT.stockMenu = d => { const i = byId('stock', d.id); const lastManual = S.mouvements.filter(m => m.itemId === i.id && !m.refKind).sort((a, b) => b.date.localeCompare(a.date) || 0).at(-1) && S.mouvements.filter(m => m.itemId === i.id && !m.refKind).at(-1); openModal({ title: esc(i.nom), body: `<div class="card">${[['stockFix', 'edit', 'Corriger la quantité ou le prix', 'Remplace le chiffre affiché par le bon'], ['stockCount', 'clipboard', 'Inventaire (comptage)', 'Saisir la quantité comptée'], ['editItem', 'settings', 'Modifier le produit', 'Nom, variété, unité, seuil, capacité, emplacement'], ...(lastManual ? [['stockUndo', 'chevL', 'Annuler le dernier mouvement', `${MOVE_TYPES[lastManual.type]} de ${qty(Math.abs(lastManual.qte), i.unite)} du ${dshort(lastManual.date)}`]] : []), ['stockDel', 'trash', 'Supprimer le produit', i.qte ? 'Possible uniquement à stock nul' : 'Retire le produit de la liste']].map(([a, ico, l, sub]) => `<div class="mrow" data-a="${a}" data-id="${i.id}"><div class="ic">${ic(ico)}</div><div class="tx"><b>${l}</b><span>${sub}</span></div>${ic('chevR')}</div>`).join('')}</div>`, foot: '' }); };
ACT.stockFix = d => {
  const it = byId('stock', d.id); if (MODAL) closeModal();
  setTimeout(() => {
    QTY_LIVE = q => { const diff = r2(q - it.qte, 3); return Math.abs(diff) < 1e-6 ? `Quantité actuelle : ${qty(it.qte, it.unite)}` : `Correction : <b style="color:${diff < 0 ? 'var(--late)' : 'var(--c-cult)'}">${diff > 0 ? '+' : ''}${qty(diff, it.unite)}</b>`; };
    openModal({ title: `Corriger · ${esc(it.nom)}`, body: `<p class="small muted" style="margin-top:0">Indiquez la bonne quantité en stock.</p>${qtyField(it.unite, String(r2(it.qte, 3)).replace('.', ','))}<div class="qty-live" id="qtyLive">Quantité actuelle : ${qty(it.qte, it.unite)}</div>
      ${it.cat !== 'production' ? `<label class="field"><span>Prix moyen (€/${it.unite})</span><input class="inp" name="pmp" inputmode="decimal" value="${String(r2(it.pmp || 0, 4)).replace('.', ',')}"><small>Sert à la valeur du stock et au coût des opérations à venir</small></label>` : ''}
      <label class="field"><span>Motif</span><input class="inp" name="motif" value="Correction de saisie"></label>`,
      submit: 'Enregistrer la correction', onSubmit: f => { const q = parseFloat(String(f.qte).replace(',', '.')); if (!(q >= 0)) throw new Error('Quantité invalide'); const diff = r2(q - it.qte, 3); if (f.pmp != null) { const p = parseFloat(String(f.pmp).replace(',', '.')); if (p >= 0) it.pmp = p; } if (Math.abs(diff) >= 1e-6) stockMove(it.id, 'ajustement', diff, { motif: f.motif || 'Correction de saisie' }); commit(Math.abs(diff) >= 1e-6 ? `Stock corrigé : ${qty(it.qte, it.unite)}` : 'Prix moyen mis à jour'); }
    });
  }, 200);
};
ACT.stockUndo = d => { const it = byId('stock', d.id); const m = S.mouvements.filter(x => x.itemId === it.id && !x.refKind).at(-1); if (!m) return; const sign = m.type === 'sortie' || m.type === 'perte' ? 1 : m.type === 'transfert' ? 0 : -1; it.qte = r2(it.qte + sign * m.qte, 3); S.mouvements = S.mouvements.filter(x => x.id !== m.id); closeModal(); commit(`Mouvement annulé · stock ${qty(it.qte, it.unite)}`); };
ACT.stockDel = d => { const it = byId('stock', d.id); if (it.qte > 1e-6) { toast('Mettez d’abord le stock à zéro (Corriger la quantité)', 'warn'); return; } S.stock = S.stock.filter(x => x.id !== it.id); closeModal(); closeDrawer(); commit('Produit supprimé'); };
ACT.stockCount = d => {
  const it = byId('stock', d.id);
  QTY_LIVE = q => { const diff = r2(q - it.qte, 3); return qtyInput()?.value === '' ? `Quantité théorique : ${qty(it.qte, it.unite)}` : Math.abs(diff) < 1e-6 ? 'Aucun écart' : `Écart : <b style="color:${diff < 0 ? 'var(--late)' : 'var(--c-cult)'}">${diff > 0 ? '+' : ''}${qty(diff, it.unite)}</b> (${eur(diff * (it.pmp || 0))})`; };
  openModal({ title: `Inventaire · ${esc(it.nom)}`, body: `<p class="small muted" style="margin-top:0">Indiquez la quantité réellement comptée.</p>${qtyField(it.unite, String(r2(it.qte, 2)).replace('.', ','))}<div class="qty-live" id="qtyLive">Quantité théorique : ${qty(it.qte, it.unite)}</div>`, submit: 'Valider le comptage', onSubmit: f => { const q = parseFloat(String(f.qte).replace(',', '.')); if (!(q >= 0)) throw new Error('Quantité invalide'); const diff = r2(q - it.qte, 3); if (Math.abs(diff) < 1e-6) { commit('Aucun écart'); return; } stockMove(it.id, 'ajustement', diff, { motif: `Inventaire du ${dfr(TODAY)}` }); commit(`Inventaire enregistré · écart ${diff > 0 ? '+' : ''}${qty(diff, it.unite)}`); } });
};
ACT.stockMove = d => {
  const sel = d.item || S.stock[0]?.id;
  openModal({
    title: 'Mouvement de stock', body: `<label class="field"><span>Article</span><select class="inp" name="itemId">${Object.entries(STOCK_CATS).map(([c, l]) => `<optgroup label="${l}">${opts(S.stock.filter(s => s.cat === c && (c !== 'production' || s.qte > 0)).map(s => [s.id, `${s.nom} — ${qty(s.qte, s.unite)} · ${s.emplacement}`]), sel)}</optgroup>`).join('')}</select></label>
    <div class="field"><span>Type</span><select class="inp" name="type" data-ch="mvType">${opts([['sortie', 'Sortie (hors intervention)'], ['transfert', 'Déplacer vers un autre emplacement'], ['perte', 'Perte / casse / péremption'], ['ajustement', 'Ajustement (+/−)'], ['entree', 'Entrée sans achat (don, retour…)']], d.type || 'sortie')}</select></div>
    <div class="grid2"><label class="field"><span>Quantité <small id="mvHint">(positive)</small></span><input class="inp" type="number" step="0.01" name="qte" required></label><label class="field"><span>Date</span><input class="inp" type="date" name="date" value="${TODAY}"></label></div>
    <label class="field" id="mvDest" style="${d.type === 'transfert' ? '' : 'display:none'}"><span>Nouvel emplacement</span><input class="inp" name="dest" list="emps"><datalist id="emps">${[...new Set(S.stock.map(s => s.emplacement))].map(e => `<option value="${esc(e)}">`).join('')}</datalist></label>
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
ACT.newItem = d => itemForm(null, d && d.cat);
ACT.editItem = d => itemForm(d.id);
function itemForm(id, preCat) {
  const i = id ? byId('stock', id) : { cat: preCat && preCat !== 'production' ? preCat : 'engrais', unite: 'kg', seuil: 0 };
  const units = [['kg', 'kg'], ['t', 'tonne'], ['L', 'litre'], ['u', 'unité'], ['dose', 'dose']];
  openModal({
    title: id ? 'Modifier le produit' : 'Nouveau produit', body: `${!id ? `<div class="field"><span>Catégorie</span><div class="st-pick">${Object.entries(STOCK_META).map(([k, m]) => `<label class="${i.cat === k ? 'on' : ''}" style="--c:${m.color}"><input type="radio" name="cat" value="${k}" ${i.cat === k ? 'checked' : ''} hidden onchange="this.closest('.st-pick').querySelectorAll('label').forEach(x=>x.classList.toggle('on',x.contains(this)));document.getElementById('ifProd').style.display=this.value==='production'?'':'none';document.getElementById('ifStd').style.display=this.value==='production'?'none':''"><span class="st-ic">${ic(m.icon)}</span>${m.label}</label>`).join('')}</div></div>` : ''}
    ${!id ? `<div id="ifProd" style="display:none" class="form"><label class="field"><span>Culture récoltée</span><select class="inp" name="culture">${(() => { const farm = [...new Set(S.parcelles.flatMap(p => Object.values(p.cultures).map(c => c.culture)))].filter(k => CULTURES[k]); return `${farm.length ? `<optgroup label="Mes cultures">${opts(farm.map(k => [k, CULTURES[k].nom]), farm[0])}</optgroup>` : ''}<optgroup label="Autres cultures">${opts(Object.keys(CULTURES).filter(k => !farm.includes(k)).map(k => [k, CULTURES[k].nom]), '')}</optgroup>`; })()}</select></label><div class="field"><span>Récolte de</span><select class="inp" name="campagne">${opts([CURRENT_CAMP - 2, CURRENT_CAMP - 1, CURRENT_CAMP].map(y => [y, y]), CURRENT_CAMP - 1)}</select></div><label class="field"><span>Lieu de stockage</span><input class="inp" name="empProd" placeholder="Silo, cellule…"></label></div>` : ''}
    <div id="ifStd" class="form">
    <label class="field"><span>Nom du produit</span><input class="inp" name="nom" value="${esc(i.nom || '')}" placeholder="Ex. : Ammonitrate 27 %"></label>
    ${!id || i.cat === 'semences' ? `<label class="field" ${!id ? 'id="varField"' : ''}><span>Variété (semences, facultatif)</span><input class="inp" name="variete" value="${esc(i.variete || '')}" placeholder="Ex. : Chevignon"></label>` : ''}
    <div class="field"><span>Unité</span><div class="ob-chips" id="units">${units.map(([v, l]) => `<label class="fchip ${i.unite === v ? 'on' : ''}" style="--c:var(--primary)"><input type="radio" name="unite" value="${v}" ${i.unite === v ? 'checked' : ''} hidden onchange="document.querySelectorAll('#units .fchip').forEach(x=>x.classList.toggle('on',x.contains(this)))">${l}</label>`).join('')}</div></div>
    <div class="grid2"><label class="field"><span>Seuil d’alerte</span><input class="inp" name="seuil" inputmode="decimal" value="${i.seuil || ''}" placeholder="Ex. : 1000"><small>Alerte quand le stock passe en dessous</small></label><label class="field"><span>Capacité de stockage</span><input class="inp" name="capacite" inputmode="decimal" value="${i.capacite || ''}" placeholder="Facultatif"><small>Ex. : volume de la cuve, pour la jauge</small></label></div>
    <div class="grid2"><label class="field"><span>Emplacement</span><input class="inp" name="emplacement" list="emps" value="${esc(i.emplacement || '')}" placeholder="Hangar, cuve, cellule…"><datalist id="emps">${[...new Set(S.stock.map(s => s.emplacement).filter(Boolean))].map(e => `<option value="${esc(e)}">`).join('')}</datalist></label><label class="field"><span>Fournisseur habituel</span><input class="inp" name="fournisseur" value="${esc(i.fournisseur || '')}"></label></div></div>`,
    submit: id ? 'Enregistrer' : 'Créer le produit',
    onSubmit: f => {
      if (!id && f.cat === 'production') { const it = prodItem(f.culture, +f.campagne); if (f.empProd) it.emplacement = f.empProd; UI.tabs.stk = 'production'; saveState(); closeModal(); setTimeout(() => ACT.stockIn({ id: it.id }), 200); return false; }
      if (!f.nom) throw new Error('Nom requis'); const num = v => parseFloat(String(v || '').replace(',', '.')) || 0;
      const n = { nom: f.nom, variete: (f.variete || '').trim(), unite: f.unite || 'kg', seuil: num(f.seuil), capacite: num(f.capacite) || null, emplacement: f.emplacement, fournisseur: f.fournisseur };
      if (id) Object.assign(i, n); else { const it = { id: uid('st'), cat: f.cat || 'engrais', qte: 0, pmp: 0, basePrix: 0, batch: 1, lot: '', dateEntree: TODAY, ...n }; S.stock.push(it); UI.tabs.stk = it.cat; }
      commit(id ? 'Produit modifié' : 'Produit créé — touchez « Entrée » pour saisir votre stock');
    }
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

/* =========================== PARC MATÉRIEL (suivi technique) =========================== */
const MAT_IC = { tracteur: 'tractor', moissonneuse: 'wheat', ensileuse: 'leaf', pulverisateur: 'droplet', semoir: 'sprout', dechaumeur: 'shovel', charrue: 'shovel', remorque: 'box', manutention: 'move', divers: 'wrench' };
const matIc = m => ic(MAT_IC[m.cat] || 'tractor');
const odo = v => `<span class="odo">${String(Math.round(v)).padStart(5, '0').split('').map(c => `<i>${c}</i>`).join('')}<small>h</small></span>`;
const planBar = n => n.prog == null ? '' : `<div class="pl-bar ${n.urgence}"><i style="width:${Math.min(100, n.prog * 100)}%"></i></div>`;
VIEWS.materiel = () => {
  const t = tab('mat', 'atelier');
  const seg = `<div class="seg mb mat-seg">${[['atelier', 'Atelier'], ['couts', 'Coûts']].map(([v, l]) => `<button class="${t === v ? 'on' : ''}" data-a="tab" data-k="mat" data-v="${v}">${l}</button>`).join('')}</div>`;
  const acts = pa([{ a: 'matPannePick', i: 'alert', l: 'Déclarer une panne', more: true }, { a: 'matReleve', i: 'clock', l: 'Relevé compteurs' }, { a: 'newMat', i: 'plus', l: 'Équipement', primary: true }]);
  if (t === 'couts') return `${demoBar('Parc matériel de démonstration ; valeurs de revente estimées par un modèle de décote simplifié, à titre indicatif.')}<div class="page-h toolbar">${seg}<span class="sp"></span>${acts}</div>${matCouts()}`;
  const f = UI.f.matCat || '';
  const due = m => matPlanDue(m).filter(n => n.urgence !== 'ok');
  const nDue = S.materiel.filter(m => due(m).length).length, nPanne = S.materiel.filter(m => m.panne).length, nImmo = S.materiel.filter(m => m.panne?.immo).length;
  const hCamp = sum(S.materiel, m => matUsage(m).h);
  const ms = S.materiel.filter(m => !f || (f === '_due' ? due(m).length : f === '_panne' ? m.panne : m.cat === f)).sort((a, b) => (b.panne ? 2 : 0) + (due(b).length ? 1 : 0) - (a.panne ? 2 : 0) - (due(a).length ? 1 : 0));
  return `${demoBar('Parc matériel de démonstration. Les plans d’entretien sont des modèles indicatifs : adaptez-les au carnet du constructeur.')}
  <div class="page-h toolbar">${seg}<span class="sp"></span>${acts}</div>
  <div class="mat-sum"><button data-a="matCat" data-c=""><b>${S.materiel.length - nImmo}<small>/${S.materiel.length}</small></b><span>en service</span></button><button class="${nPanne ? 'bad' : ''}" data-a="matCat" data-c="_panne"><b>${nPanne}</b><span>en panne</span></button><button class="${nDue ? 'warn' : ''}" data-a="matCat" data-c="_due"><b>${nDue}</b><span>à entretenir</span></button><button data-a="go" data-r="interventions"><b>${nf(hCamp, 0)}</b><span>h cette campagne</span></button></div>
  <div class="iv-types mb"><button class="${!f ? 'on' : ''}" data-a="matCat" data-c="">Tout</button>${nDue ? `<button class="${f === '_due' ? 'on' : ''}" style="--c:var(--warn)" data-a="matCat" data-c="_due">${ic('wrench')} À entretenir</button>` : ''}${nPanne ? `<button class="${f === '_panne' ? 'on' : ''}" style="--c:var(--danger)" data-a="matCat" data-c="_panne">${ic('alert')} En panne</button>` : ''}${Object.entries(MAT_CATS).filter(([k]) => S.materiel.some(m => m.cat === k)).map(([k, l]) => `<button class="${f === k ? 'on' : ''}" style="--c:var(--c-mat)" data-a="matCat" data-c="${k}">${ic(MAT_IC[k] || 'tractor')} ${l}</button>`).join('')}</div>
  ${ms.length ? `<div class="mat-grid">${ms.map(matCard).join('')}</div>` : `<div class="empty card pad">${S.materiel.length ? 'Aucun matériel avec ce filtre' : 'Aucun équipement enregistré'}<div class="mt"><button class="btn p" data-a="newMat">${ic('plus')} Ajouter un équipement</button></div></div>`}`;
};
function matCard(m) {
  const st = matStatus(m), n = nextMaintenance(m), u = matUsage(m), eng = isEngine(m);
  return `<div class="matc ${st.k}" data-a="openMat" data-id="${m.id}"><div class="matc-h"><span class="matc-ic">${matIc(m)}</span><div class="matc-t"><b>${esc(m.marque)} ${esc(m.modele)}</b><span>${esc(MAT_CATS[m.cat])}${m.puissance ? ` · ${m.puissance} ch` : ''}${m.largeur ? ` · ${nfx(m.largeur, 1)} m` : ''}</span></div><span class="badge ${st.c}">${st.l}</span></div>
  ${m.panne ? `<div class="matc-panne">${ic('alert')}<span><b>${esc(m.panne.titre)}</b> · depuis ${daysBetween(m.panne.date, TODAY) || 'aujourd’hui'}${daysBetween(m.panne.date, TODAY) ? ' j' : ''}</span></div>` : ''}
  <div class="matc-m"><div><small>${eng ? 'Compteur' : 'Utilisation cumulée'}</small>${odo(matCnt(m))}</div><div><small>Campagne</small><b>${nf(u.h, 0)} h</b><span>${u.last ? `dernière : ${dshort(u.last.date)}` : 'pas encore utilisé'}</span></div></div>
  ${n ? `<div class="matc-n ${n.urgence}"><div class="row"><span class="tx">${ic(n.type === 'controle' ? 'check' : 'wrench')} ${esc(n.label)}</span><span class="sp"></span><b>${esc(n.echeance)}</b></div>${planBar(n)}</div>` : ''}
  <div class="matc-a">${eng ? `<button class="btn sm" data-a="setHours" data-id="${m.id}">${ic('clock')} Relevé</button>` : ''}<button class="btn sm" data-a="addMaint" data-id="${m.id}" ${n && n.urgence !== 'ok' ? `data-plan="${n.id}"` : ''}>${ic('wrench')} Entretien</button>${m.panne ? `<button class="btn sm tk-go" data-a="matRepair" data-id="${m.id}">${ic('check')} Réparé</button>` : `<button class="btn sm g" data-a="matPanne" data-id="${m.id}" aria-label="Déclarer une panne">${ic('alert')}</button>`}</div></div>`;
}
function matCouts() {
  const camp = Math.min(PREFS.camp, CURRENT_CAMP - 1);
  const val = sum(S.materiel, m => valeurMateriel(m)), annuel = sum(S.materiel, m => coutHoraire(m, camp).annuel), maintC = sum(S.materiel, m => maintCost(m, camp));
  return `<div class="grid g-kpi mb">${kpi('tractor', 'Valeur estimée du parc', eur(val), `${S.materiel.length} équipements <span class="badge est">indicatif</span>`)}${kpi('euro', `Coût annuel ${campLabel(camp)}`, eur(annuel), 'amortissement + assurance + entretien')}${kpi('settings', 'Entretien et réparations', eur(maintC), `campagne ${campLabel(camp)}`, '', 'warn')}</div>
  <div class="card"><div class="tbl-wrap"><table class="t"><thead><tr><th>Matériel</th><th class="n">Valeur estimée</th><th class="n">Coût horaire</th><th class="n">Entretien ${campLabel(camp)}</th></tr></thead><tbody>${S.materiel.map(m => `<tr data-a="openMat" data-id="${m.id}" data-tab="couts"><td><div class="cell-main">${esc(m.marque)} ${esc(m.modele)}</div><div class="cell-sub">${esc(MAT_CATS[m.cat])}</div></td><td class="n">${m.prixAchat ? eur(valeurMateriel(m)) : '<span class="badge warn">À compléter</span>'}</td><td class="n">${eur(coutHoraire(m, camp).horaire, 2)}/h</td><td class="n">${eur(maintCost(m, camp))}</td></tr>`).join('')}</tbody></table></div></div>
  <div class="formula">Coût horaire hors carburant (le GNR est compté en intrant). Valeurs de revente indicatives, non contractuelles.</div>`;
}
ACT.matCat = d => { UI.f.matCat = UI.f.matCat === d.c && d.c ? '' : d.c; render(); };
ACT.openMat = d => openDrawer('materiel', d.id, d.tab);
DRAWERS.materiel = id => {
  const m = byId('materiel', id); if (!m) return null;
  const t = UI.drawer.tab || 'suivi'; const camp = Math.min(PREFS.camp, CURRENT_CAMP - 1);
  let body = tabsBar('dm', [['suivi', 'Suivi'], ['entretien', 'Entretien'], ['pannes', 'Pannes'], ['fiche', 'Fiche technique'], ['couts', 'Coûts']], t, true);
  const st = matStatus(m), eng = isEngine(m);
  if (t === 'suivi') {
    const u = matUsage(m), plans = matPlanDue(m), mx = Math.max(1, ...u.months.map(x => x.h));
    body += `<div class="mat-hero ${st.k}"><div class="row"><span class="matc-ic">${matIc(m)}</span><div style="flex:1;min-width:0"><small>${eng ? 'Compteur moteur' : 'Heures d’utilisation (calculées)'}</small>${odo(matCnt(m))}</div><span class="badge ${st.c}">${st.l}</span></div>
      ${m.panne ? `<div class="matc-panne mt">${ic('alert')}<span><b>${esc(m.panne.titre)}</b>${m.panne.desc ? ` — ${esc(m.panne.desc)}` : ''}<br><small>Déclarée le ${dfr(m.panne.date)}${m.panne.immo ? ' · matériel immobilisé' : ' · utilisable avec précaution'}</small></span></div>` : ''}
      <div class="row wrap mt">${eng ? `<button class="btn sm" data-a="setHours" data-id="${m.id}">${ic('clock')} Relevé compteur</button>` : ''}${m.panne ? `<button class="btn sm tk-go" data-a="matRepair" data-id="${m.id}">${ic('check')} Remettre en service</button>` : `<button class="btn sm" data-a="matPanne" data-id="${m.id}">${ic('alert')} Déclarer une panne</button>`}</div>
      ${!eng ? '<div class="formula">Outil sans compteur : les heures s’additionnent à partir des interventions où il est utilisé.</div>' : m.releves?.length ? `<div class="small muted mt">Dernier relevé : ${nf(m.releves[m.releves.length - 1].h, 1)} h le ${dfr(m.releves[m.releves.length - 1].date)}</div>` : ''}</div>
    <div class="sec-h"><h3>Entretiens à venir</h3><span class="sp"></span><button class="lnk" data-a="tab" data-k="dm" data-v="entretien" data-drawer="1">Plan ${ic('chevR')}</button></div>
    <div class="card">${plans.slice(0, 4).map(n => planRow(m, n)).join('') || '<div class="empty small">Aucun point d’entretien</div>'}</div>
    <div class="sec-h"><h3>Utilisation ${campLabel(CURRENT_CAMP)}</h3></div>
    <div class="mat-use card pad"><div class="mu-k"><div><b>${nf(u.h, 1)} h</b><span>travail</span></div><div><b>${nf(u.ha, 0)} ha</b><span>travaillés</span></div><div><b>${u.n}</b><span>interventions</span></div><div><b>${u.gnr != null ? nf(u.gnr) + ' L' : '—'}</b><span>GNR estimé</span></div></div>
      <div class="mu-ch">${u.months.map(x => `<div title="${x.h} h"><i style="height:${x.h ? 4 + x.h / mx * 46 : 2}px"></i><span>${MOIS_C[+x.ym.slice(5) - 1].slice(0, 1).toUpperCase()}</span></div>`).join('')}</div>
      <div class="formula">Heures issues des interventions réalisées avec ce matériel.${u.gnr != null ? ` GNR estimé = ${nfx(m.conso, 1)} L/h × heures.` : ''}${u.last ? ` Dernière utilisation : ${esc(u.last.label)} le ${dfr(u.last.date)}.` : ''}</div></div>`;
  } else if (t === 'entretien') {
    const plans = matPlanDue(m), hist = [...m.maintenance].filter(e => e.type !== 'reparation').sort((a, b) => b.date.localeCompare(a.date));
    body += `<div class="row mb"><b>Plan d’entretien</b><span class="sp"></span><button class="btn sm" data-a="planEdit" data-id="${m.id}">${ic('plus')} Point</button></div>
    <div class="card mb">${plans.map(n => planRow(m, n, true)).join('') || `<div class="empty small">Aucun point d’entretien. <button class="lnk" data-a="planTpl" data-id="${m.id}">Appliquer le modèle ${esc(MAT_CATS[m.cat].toLowerCase())}</button></div>`}</div>
    <div class="formula">Chaque point revient toutes les N heures et/ou tous les N mois, au premier des deux atteint. Les intervalles proposés sont indicatifs : reportez ceux du carnet d’entretien constructeur.</div>
    <div class="row mt mb"><b>Historique</b><span class="sp"></span><button class="btn p sm" data-a="addMaint" data-id="${m.id}">${ic('plus')} Entretien fait</button></div>
    ${hist.map(maintCard).join('') || '<div class="empty">Aucun entretien enregistré</div>'}`;
  } else if (t === 'pannes') {
    const list = m.maintenance.filter(e => e.type === 'reparation').sort((a, b) => b.date.localeCompare(a.date));
    body += `${m.panne ? `<div class="matc-panne mb">${ic('alert')}<span><b>En cours : ${esc(m.panne.titre)}</b><br><small>depuis le ${dfr(m.panne.date)}</small></span><button class="btn sm tk-go" data-a="matRepair" data-id="${m.id}">Réparé</button></div>` : `<button class="btn mb" style="width:100%" data-a="matPanne" data-id="${m.id}">${ic('alert')} Déclarer une panne</button>`}
    <div class="grid g-2 mb">${kpi('alert', 'Pannes', list.length, 'réparées')}${kpi('clock', 'Immobilisation', `${sum(list, e => e.immobilisation)} j`, 'cumulée')}</div>
    ${list.map(maintCard).join('') || '<div class="empty">Aucune panne enregistrée</div>'}`;
  } else if (t === 'fiche') {
    const P = m.pieces || [];
    const rows = [['Catégorie', MAT_CATS[m.cat]], ['Marque / modèle', `${m.marque} ${m.modele}`], ['Année', m.annee || '—'], ['N° de série', m.serie || '—'], ['Immatriculation', m.immat || '—'], ['Puissance', m.puissance ? `${m.puissance} ch` : '—'], ['Consommation', m.conso ? `${nfx(m.conso, 1)} L/h` : '—'], ['Largeur de travail', m.largeur ? `${nfx(m.largeur, 2)} m` : '—'], ['Capacité', m.capacite || '—'], ['Poids', m.poids ? `${nf(m.poids)} kg` : '—'], ['Pneus avant', m.pneuAv || '—'], ['Pneus arrière', m.pneuAr || '—'], ['Huile moteur', m.huile || '—'], ['Huile hydraulique / transmission', m.huileH || '—']].filter(([, v]) => v !== '—' || ['Année', 'N° de série', 'Puissance'].includes(v));
    body += `<div class="card pad"><div class="kv">${rows.map(([k, v]) => `<div><span>${k}</span><b>${esc(v)}</b></div>`).join('')}</div>${m.notesTech ? `<div class="small mt" style="white-space:pre-wrap">${esc(m.notesTech)}</div>` : ''}</div>
    <div class="sec-h"><h3>Pièces et consommables</h3></div>
    <div class="card">${P.length ? P.map(x => `<div class="li"><div class="ic">${ic('wrench')}</div><div class="tx"><b>${esc(x.nom)}</b><span>${esc(x.ref || 'référence non renseignée')}</span></div>${x.ref ? `<button class="btn sm icon g" data-a="copyRef" data-v="${esc(x.ref)}" aria-label="Copier la référence">${ic('copy')}</button>` : ''}</div>`).join('') : '<div class="empty small">Notez ici les références de filtres, courroies, socs… pour les commander sans chercher.</div>'}</div>
    <div class="row wrap mt"><button class="btn" data-a="matTech" data-id="${m.id}">${ic('edit')} Compléter la fiche</button><button class="btn" data-a="editMat" data-id="${m.id}">${ic('settings')} Identification</button><span class="sp"></span><button class="btn g d" data-a="delMat" data-id="${m.id}">${ic('trash')}</button></div>`;
  } else {
    const ch = coutHoraire(m, camp), est = estimationRevente(m);
    const hist = [...m.historiqueValeur, { date: TODAY, valeur: valeurMateriel(m) }];
    body += `<div class="card pad"><b>Coût de revient — campagne ${campLabel(camp)}</b><div class="mt">${[['Prix d’achat', eur(m.prixAchat)], [`Amortissement économique (80 % sur ${m.dureeAmort} ans)`, eur(ch.amort)], ['Assurance (0,6 % du prix)', eur(ch.assurance)], ['Entretien et réparations', eur(ch.entretien)], ['Coût annuel', eur(ch.annuel)], ['Heures retenues', `${nf(ch.heures, 0)} h`], ['Coût horaire (hors carburant)', `${eur(ch.horaire, 2)}/h`]].map(([k, v]) => `<div class="stat-line"><span>${k}</span><b>${v}</b></div>`).join('')}</div>
    <div class="formula">Coût horaire = (amortissement + assurance + entretien/réparations) ÷ heures d’utilisation de la campagne (heures de référence ${m.heuresAn} h/an si la campagne est incomplète).</div></div>
    <div class="card pad mt"><div class="row"><b>Valeur de revente</b><span class="sp"></span><span class="badge est">estimation indicative</span></div><div class="kpi-v mt">${eur(valeurMateriel(m))}</div>${m.valeurManuelle != null ? '<div class="small muted">Valeur saisie manuellement</div>' : ''}
    <div class="formula">Modèle : ${eur(m.prixAchat)} × (1 − ${nf(est.taux * 100, 1)} %)^${nfx(est.age, 1)} ans × facteur heures ${nfx(est.fh, 3)} × facteur état ${nfx(est.fe, 2)} = ${eur(est.valeur)}${!m.annee ? '\nAnnée non renseignée : ajoutez-la pour tenir compte de l’âge.' : ''}${!m.prixAchat ? '\nPrix d’achat non renseigné : estimation impossible.' : ''}
Non contractuel.</div>
    <form data-f="matVal" data-id="${m.id}" class="grid2 mt"><label class="field"><span>État</span><select class="inp" name="etat">${opts([['excellent', 'Excellent'], ['bon', 'Bon'], ['moyen', 'Moyen'], ['mauvais', 'Mauvais']], m.etat)}</select></label><label class="field"><span>Valeur manuelle (€)</span><input class="inp" type="number" name="val" value="${m.valeurManuelle ?? ''}" placeholder="Vide = estimation"></label><button class="btn p" style="grid-column:1/-1">Mettre à jour</button></form></div>
    ${hist.length > 1 ? card('Historique de valorisation', lineChart({ series: [{ name: 'Valeur', color: 'var(--primary)', points: hist.map(h => ({ x: h.date, y: h.valeur })) }], fmt: v => keur(v), xfmt: s => D(s).getFullYear(), ticks: Math.min(hist.length, 4), height: 180 }), { cls: 'mt' }) : ''}`;
  }
  return { title: `${esc(m.marque)} ${esc(m.modele)}`, body };
};
function planRow(m, n, edit) {
  const every = n.once ? 'ponctuel' : [n.h ? `${nf(n.h)} h` : '', n.mois ? (n.mois % 12 ? `${n.mois} mois` : `${n.mois / 12} an${n.mois > 12 ? 's' : ''}`) : ''].filter(Boolean).join(' / ');
  return `<div class="plr ${n.urgence}"><div class="plr-ic">${ic(n.type === 'controle' ? 'check' : n.type === 'graissage' ? 'droplet' : 'wrench')}</div><div class="plr-tx"><b>${esc(n.label)}</b><span>${n.once ? 'ponctuel' : `tous les ${every}`}${!n.once && (n.lastDate || n.lastH != null) ? ` · fait ${n.h && n.lastH != null ? `à ${nf(n.lastH)} h` : ''}${n.mois ? ` le ${dshort(n.lastDate)}` : ''}` : ''}</span>${planBar(n)}<span class="plr-due">${esc(n.echeance || '—')}</span></div><div class="plr-a"><button class="btn sm ${n.urgence !== 'ok' ? 'tk-go' : ''}" data-a="addMaint" data-id="${m.id}" data-plan="${n.id}">${ic('check')}</button>${edit ? `<button class="btn sm icon g" data-a="planEdit" data-id="${m.id}" data-pid="${n.id}" aria-label="Modifier">${ic('edit')}</button>` : ''}</div></div>`;
}
const maintCard = e => `<div class="card pad mb mcard ${e.type === 'reparation' ? 'rep' : ''}"><div class="row"><span class="badge ${e.type === 'reparation' ? 'danger' : e.type === 'controle' ? 'info' : ''}">${MAINT_TYPES[e.type] || e.type}</span><b style="flex:1;min-width:0">${esc(e.titre)}</b><span class="small muted">${dfr(e.date)}</span></div>
  ${e.description ? `<p class="small" style="margin:8px 0 0">${esc(e.description)}</p>` : ''}<div class="mc-meta">${e.heures != null ? `<span>${ic('clock')} ${nf(e.heures)} h</span>` : ''}${e.pieces ? `<span>${ic('wrench')} ${esc(e.pieces)}</span>` : ''}${e.prestataire ? `<span>${ic('users')} ${esc(e.prestataire)}</span>` : ''}${e.immobilisation ? `<span>${ic('alert')} ${e.immobilisation} j d’arrêt</span>` : ''}${e.coutPieces + e.coutMO ? `<span>${ic('euro')} ${eur(e.coutPieces + e.coutMO)}</span>` : ''}</div>${e.commentaire ? `<div class="small muted mt">${esc(e.commentaire)}</div>` : ''}${e.photos?.length ? `<div class="photos mt">${e.photos.map(p => `<img src="${p}">`).join('')}</div>` : ''}</div>`;
ACT.copyRef = d => copyText(d.v, 'Référence copiée');
FORMS.matVal = (f, form) => { const m = byId('materiel', form.dataset.id); m.etat = f.etat; m.valeurManuelle = f.val === '' ? null : +f.val; commit('Valorisation mise à jour'); };
/* ---- Entretien réalisé (coche les points du plan) ---- */
let MNT = null;
ACT.addMaint = d => {
  const m = byId('materiel', d.id), plans = matPlanDue(m), rep = d.t === 'reparation';
  MNT = { id: m.id, sel: d.plan ? [d.plan] : [], rep, fromPanne: !!d.fromPanne };
  const pre = d.plan && plans.find(p => p.id === d.plan);
  openModal({ title: `${rep ? 'Réparation' : 'Entretien fait'} · ${esc(m.marque)} ${esc(m.modele)}`, wide: true, body: `
  ${!rep && plans.length ? `<div class="field"><span>Qu’avez-vous fait ?</span><div class="mnt-pl">${plans.map(n => `<button type="button" class="${MNT.sel.includes(n.id) ? 'on' : ''}" data-a="mntPl" data-pid="${n.id}"><span class="ck">${ic('check')}</span><span><b>${esc(n.label)}</b><small class="${n.urgence}">${esc(n.echeance)}</small></span></button>`).join('')}</div></div>` : ''}
  <div class="grid3"><label class="field"><span>Date</span><input class="inp" type="date" name="date" value="${TODAY}"></label><label class="field"><span>${isEngine(m) ? 'Compteur (h)' : 'Heures d’utilisation'}</span><input class="inp" type="number" step="0.1" name="heures" value="${matCnt(m)}" inputmode="decimal"></label><label class="field"><span>Type</span><select class="inp" name="type">${opts(Object.entries(MAINT_TYPES), rep ? 'reparation' : pre?.type || 'entretien')}</select></label></div>
  <label class="field"><span>${rep ? 'Panne réparée' : 'Intitulé'}</span><input class="inp" name="titre" value="${esc(d.titre || pre?.label || '')}" ${!d.titre ? 'data-auto="1"' : ''} placeholder="${rep ? 'Ex. Fuite hydraulique' : 'Rempli automatiquement avec les points cochés'}"></label>
  <div class="grid2"><label class="field"><span>Pièces / consommables</span><input class="inp" name="pieces" placeholder="Filtre, huile 15W40 18 L…"></label><label class="field"><span>Fait par</span><input class="inp" name="prestataire" list="prestas" placeholder="Sur l’exploitation, concessionnaire…"><datalist id="prestas">${[...new Set(S.materiel.flatMap(x => x.maintenance.map(e => e.prestataire)).filter(Boolean))].map(x => `<option value="${esc(x)}">`).join('')}</datalist></label></div>
  ${rep ? `<label class="field"><span>Jours d’immobilisation</span><input class="inp" type="number" name="immobilisation" value="${d.immo || 0}" min="0"></label>` : '<input type="hidden" name="immobilisation" value="0">'}
  <details class="mnt-more"><summary>Coûts, description, photos <small>(facultatif)</small></summary>
  <div class="grid2 mt"><label class="field"><span>Coût des pièces HT (€)</span><input class="inp" type="number" step="0.01" name="coutPieces" value="0"></label><label class="field"><span>Main-d’œuvre HT (€)</span><input class="inp" type="number" step="0.01" name="coutMO" value="0"></label></div>
  <label class="field"><span>Description</span><textarea class="inp" name="description">${esc(d.desc || '')}</textarea></label><label class="field"><span>Photos</span><input class="inp" type="file" name="ph" accept="image/*" multiple style="padding-top:8px"></label>
  <div class="note">${ic('info')}<span>Un coût saisi est enregistré automatiquement en charge (entretien ou réparations).</span></div></details>`,
    submit: 'Enregistrer',
    onSubmit: (f, form) => {
      const sel = plansOf(m).filter(p => MNT.sel.includes(p.id));
      if (!f.titre) f.titre = sel.map(p => p.label).join(' + ');
      if (!f.titre) throw new Error(rep ? 'Décrivez la panne réparée' : 'Cochez un point du plan ou saisissez un intitulé');
      const h = +f.heures, c = matCnt(m);
      if (isEngine(m) && h > c) { (m.releves = m.releves || []).push({ date: f.date || TODAY, h }); m.heures = h; }
      const files = [...(form.ph?.files || [])];
      Promise.all(files.slice(0, 4).map(x => downscale(x))).then(photos => {
        const { ph, ...rest } = f; recordMaintenance(m.id, { ...rest, heures: h || c, photos, commentaire: '' });
        sel.forEach(p => { if (p.once) m.plans = m.plans.filter(x => x.id !== p.id); else { p.lastH = h || c; p.lastDate = f.date || TODAY; } });
        if (MNT.fromPanne) delete m.panne;
        commit(MNT.fromPanne ? 'Remis en service' : sel.length ? `${sel.length} point(s) d’entretien à jour` : 'Enregistré');
      });
    } });
};
ACT.mntPl = d => { const i = MNT.sel.indexOf(d.pid); i >= 0 ? MNT.sel.splice(i, 1) : MNT.sel.push(d.pid); document.querySelectorAll('.mnt-pl button').forEach(b => b.classList.toggle('on', MNT.sel.includes(b.dataset.pid))); const t = document.querySelector('#mf [name=titre]'); if (t && (!t.value || t.dataset.auto)) { t.oninput = () => delete t.dataset.auto; t.value = plansOf(byId('materiel', MNT.id)).filter(p => MNT.sel.includes(p.id)).map(p => p.label).join(' + '); t.dataset.auto = '1'; } const ty = document.querySelector('#mf [name=type]'); const p0 = plansOf(byId('materiel', MNT.id)).find(p => p.id === MNT.sel[0]); if (ty && p0) ty.value = p0.type; };
/* ---- Pannes ---- */
ACT.matPannePick = () => pickMat('panne');
ACT.matPanne = d => { const m = byId('materiel', d.id); openModal({ title: `Panne · ${esc(m.marque)} ${esc(m.modele)}`, body: `<label class="field"><span>Quel problème ?</span><input class="inp" name="titre" required placeholder="Ex. Fuite hydraulique, pneu crevé…"></label>
  <div class="field"><span>Le matériel peut-il encore travailler ?</span><div class="seg2"><label><input type="radio" name="immo" value="1" checked><span>${ic('alert')} Non, immobilisé</span></label><label><input type="radio" name="immo" value="0"><span>${ic('info')} Oui, avec précaution</span></label></div></div>
  <div class="grid2"><label class="field"><span>Depuis le</span><input class="inp" type="date" name="date" value="${TODAY}"></label><label class="field"><span>Détails</span><input class="inp" name="desc" placeholder="Facultatif"></label></div>
  <p class="small muted">La panne apparaît dans vos tâches jusqu’à la remise en service. Un matériel immobilisé est signalé lors de la saisie des interventions.</p>`, submit: 'Déclarer', onSubmit: f => { if (!f.titre) throw new Error('Décrivez le problème'); m.panne = { titre: f.titre, desc: f.desc || '', date: f.date || TODAY, immo: f.immo === '1' }; commit('Panne déclarée'); } }); };
ACT.matRepair = d => { const m = byId('materiel', d.id); if (!m.panne) return; closeModal(); setTimeout(() => ACT.addMaint({ id: m.id, t: 'reparation', titre: m.panne.titre, desc: m.panne.desc, immo: m.panne.immo ? Math.max(0, daysBetween(m.panne.date, TODAY)) : 0, fromPanne: true }), 50); };
/* ---- Compteurs ---- */
function saveReleve(m, h, date = TODAY) { if (!(h >= 0)) return false; (m.releves = m.releves || []).push({ date, h }); m.heures = h; return true; }
ACT.setHours = d => { const m = byId('materiel', d.id); openModal({ title: `Relevé compteur · ${esc(m.modele)}`, body: `<label class="field"><span>Heures affichées au compteur</span><input class="inp big-in" type="number" step="0.1" name="h" value="${m.heures}" inputmode="decimal"><small>Précédent : ${nf(m.heures, 1)} h</small></label><label class="row small"><input type="checkbox" name="corr"> Correction (compteur remplacé ou erreur de saisie)</label>`, submit: 'Enregistrer', onSubmit: f => { const h = +f.h; if (!(h >= 0)) throw new Error('Valeur invalide'); if (h < m.heures && !f.corr) throw new Error(`Le compteur ne peut pas descendre sous ${nf(m.heures, 1)} h (cochez « Correction » si besoin)`); saveReleve(m, h); commit('Compteur mis à jour'); } }); };
ACT.matReleve = () => { const ms = S.materiel.filter(isEngine); if (!ms.length) { toast('Aucun matériel avec compteur', 'warn'); return; } openModal({ title: 'Relevé des compteurs', body: `<p class="small muted" style="margin-top:0">Saisissez les heures lues sur chaque compteur. Laissez inchangé ce que vous n’avez pas relevé.</p>${ms.map(m => `<div class="rel-row"><span class="matc-ic">${matIc(m)}</span><div class="tx"><b>${esc(m.marque)} ${esc(m.modele)}</b><small>actuel ${nf(m.heures, 1)} h</small></div><input class="inp" type="number" step="0.1" inputmode="decimal" name="h_${m.id}" value="${m.heures}"></div>`).join('')}`, submit: 'Enregistrer', onSubmit: f => { let n = 0; const low = []; ms.forEach(m => { const v = +f['h_' + m.id]; if (!(v >= 0) || v === m.heures) return; if (v < m.heures) { low.push(m.modele); return; } saveReleve(m, v); n++; }); if (low.length) throw new Error(`Valeur inférieure au compteur actuel : ${low.join(', ')}`); commit(n ? `${n} compteur(s) mis à jour` : 'Aucun changement'); } }); };
/* ---- Plan d'entretien ---- */
ACT.planTpl = d => { const m = byId('materiel', d.id); m.plans = planFromTemplate(m); commit('Modèle appliqué'); };
ACT.planEdit = d => { const m = byId('materiel', d.id), p = d.pid ? plansOf(m).find(x => x.id === d.pid) : null;
  openModal({ title: p ? 'Point d’entretien' : 'Nouveau point d’entretien', body: `<label class="field"><span>Intitulé</span><input class="inp" name="label" required value="${esc(p?.label || '')}" placeholder="Ex. Vidange moteur"></label><label class="field"><span>Type</span><select class="inp" name="type">${opts(Object.entries(MAINT_TYPES).filter(([k]) => k !== 'reparation'), p?.type || 'entretien')}</select></label>
  <div class="field"><span>Revient</span><div class="seg2"><label><input type="radio" name="once" value="0" ${p?.once ? '' : 'checked'}><span>Régulièrement</span></label><label><input type="radio" name="once" value="1" ${p?.once ? 'checked' : ''}><span>Une seule fois</span></label></div></div>
  <div class="grid2"><label class="field"><span>Toutes les … heures</span><input class="inp" type="number" name="h" value="${p?.h ?? ''}" placeholder="—"></label><label class="field"><span>Tous les … mois</span><input class="inp" type="number" name="mois" value="${p?.mois ?? ''}" placeholder="—"></label></div>
  <div class="grid2"><label class="field"><span>${p?.once ? 'À faire à (h)' : 'Dernière fois à (h)'}</span><input class="inp" type="number" step="0.1" name="lastH" value="${p ? (p.once ? p.dueH ?? '' : p.lastH ?? '') : matCnt(m)}"></label><label class="field"><span>${p?.once ? 'ou le' : 'Dernière fois le'}</span><input class="inp" type="date" name="lastDate" value="${p ? (p.once ? p.dueD || '' : p.lastDate || '') : TODAY}"></label></div>
  <p class="small muted">Régulier : renseignez au moins un intervalle (heures et/ou mois). Une seule fois : indiquez l’échéance en heures ou en date.</p>`,
    foot: `${p ? `<button type="button" class="btn g d" data-a="planDel" data-id="${m.id}" data-pid="${p.id}">${ic('trash')}</button>` : ''}<span class="sp"></span><button class="btn" data-a="closeModal" type="button">Annuler</button><button class="btn p" type="submit" form="mf">Enregistrer</button>`,
    onSubmit: f => { if (!f.label) throw new Error('Intitulé requis'); const once = f.once === '1';
      const n = once ? { label: f.label, type: f.type, once: true, dueH: f.lastH !== '' ? +f.lastH : null, dueD: f.lastH !== '' ? null : f.lastDate || null, h: null, mois: null } : { label: f.label, type: f.type, once: false, h: +f.h || null, mois: +f.mois || null, lastH: f.lastH !== '' ? +f.lastH : matCnt(m), lastDate: f.lastDate || TODAY, dueH: null, dueD: null };
      if (once && n.dueH == null && !n.dueD) throw new Error('Indiquez une échéance'); if (!once && !n.h && !n.mois) throw new Error('Indiquez un intervalle en heures ou en mois');
      if (p) Object.assign(p, n); else plansOf(m).push({ id: uid('pl'), ...n }); commit('Plan d’entretien mis à jour'); } }); };
ACT.planDel = d => { const m = byId('materiel', d.id); m.plans = plansOf(m).filter(p => p.id !== d.pid); closeModal(); commit('Point supprimé'); };
ACT.matTech = d => { const m = byId('materiel', d.id), P = m.pieces || [];
  openModal({ title: 'Fiche technique', wide: true, body: `<div class="grid3"><label class="field"><span>Puissance (ch)</span><input class="inp" type="number" name="puissance" value="${m.puissance ?? ''}"></label><label class="field"><span>Consommation (L/h)</span><input class="inp" type="number" step="0.1" name="conso" value="${m.conso || ''}"></label><label class="field"><span>Largeur de travail (m)</span><input class="inp" type="number" step="0.01" name="largeur" value="${m.largeur ?? ''}"></label></div>
  <div class="grid3"><label class="field"><span>Capacité</span><input class="inp" name="capacite" value="${esc(m.capacite || '')}" placeholder="Cuve 3 000 L, trémie 8 t…"></label><label class="field"><span>Poids (kg)</span><input class="inp" type="number" name="poids" value="${m.poids ?? ''}"></label><label class="field"><span>Immatriculation</span><input class="inp" name="immat" value="${esc(m.immat || '')}"></label></div>
  <div class="grid2"><label class="field"><span>Pneus avant</span><input class="inp" name="pneuAv" value="${esc(m.pneuAv || '')}" placeholder="540/65 R28"></label><label class="field"><span>Pneus arrière</span><input class="inp" name="pneuAr" value="${esc(m.pneuAr || '')}" placeholder="650/65 R38"></label></div>
  <div class="grid2"><label class="field"><span>Huile moteur</span><input class="inp" name="huile" value="${esc(m.huile || '')}" placeholder="15W40 · 14 L"></label><label class="field"><span>Huile hydraulique / transmission</span><input class="inp" name="huileH" value="${esc(m.huileH || '')}"></label></div>
  <div class="field"><span>Pièces et consommables</span><div id="pcs">${[...P, { nom: '', ref: '' }].map((x, i) => pieceRow(x, i)).join('')}</div><button type="button" class="btn sm mt" data-a="pcAdd">${ic('plus')} Ligne</button></div>
  <label class="field"><span>Notes techniques</span><textarea class="inp" name="notesTech" placeholder="Réglages, particularités, contacts SAV…">${esc(m.notesTech || '')}</textarea></label>`,
    onSubmit: f => { ['capacite', 'immat', 'pneuAv', 'pneuAr', 'huile', 'huileH', 'notesTech'].forEach(k => m[k] = f[k] || ''); m.puissance = +f.puissance || null; m.conso = +f.conso || 0; m.largeur = +f.largeur || null; m.poids = +f.poids || null;
      m.pieces = Object.keys(f).filter(k => k.startsWith('pn_')).map(k => ({ nom: (f[k] || '').trim(), ref: (f['pr_' + k.slice(3)] || '').trim() })).filter(x => x.nom || x.ref).map(x => ({ nom: x.nom || x.ref, ref: x.ref })); commit('Fiche technique enregistrée'); } }); };
const pieceRow = (x, i) => `<div class="pc-row"><input class="inp" name="pn_${i}" value="${esc(x.nom)}" placeholder="Filtre à huile"><input class="inp" name="pr_${i}" value="${esc(x.ref)}" placeholder="Référence"></div>`;
ACT.pcAdd = () => { const b = document.getElementById('pcs'); b.insertAdjacentHTML('beforeend', pieceRow({ nom: '', ref: '' }, Date.now())); };
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
  const rec = {}; activeParcels().forEach(p => { const r = p.cultures[CURRENT_CAMP]; const k = r ? r.culture : '_none'; rec[k] = (rec[k] || 0) + p.surface; });
  const steps = [['parcelles', 'Contrôler le parcellaire (contours, surfaces, îlots)'], ['cultures', 'Vérifier les cultures déclarées pour chaque parcelle'], ['surfaces', 'Rapprocher surfaces graphiques et surfaces déclarées'], ['justificatifs', 'Rassembler les justificatifs (baux, attestations…)'], ['export', 'Exporter le récapitulatif pour la saisie'], ['depot', 'Déposer la déclaration sur la plateforme officielle (hors AGRI PILOT)']];
  const ecarts = landParcels().filter(p => !p.contourProvisoire && Math.abs(areaHa(p.coords) - p.surface) > 0.05);
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
ACT.pacCsv = () => { copyText(toCSV([['Ilot', 'N° parcelle', 'Nom', 'Commune', 'Code culture', 'Culture', 'Variété', 'Surface (ha)', 'Surface graphique (ha)'], ...activeParcels().sort((a, b) => a.ilot - b.ilot).map(p => { const c = p.cultures[CURRENT_CAMP]; return [p.ilot, p.numPac, p.nom, p.commune, CULTURES[c?.culture]?.pac || '', CULTURES[c?.culture]?.nom || '', c?.variete || '', String(p.surface).replace('.', ','), p.parentId ? '' : String(areaHa(p.coords)).replace('.', ',')]; })]), 'Récapitulatif PAC copié (CSV)'); const ck = S.pac.checklist[CURRENT_CAMP]; if (ck) { ck.export = true; saveState(); } };
ACT.pacGeo = () => { const prov = landParcels().filter(p => p.contourProvisoire).length; if (prov) toast(`${prov} parcelle(s) sans contour dessiné exclue(s) de l’export`, 'warn'); copyText(JSON.stringify({ type: 'FeatureCollection', features: landParcels().filter(p => !p.contourProvisoire).map(p => ({ type: 'Feature', properties: { nom: p.nom, ilot: p.ilot, num_parcelle: p.numPac, surface: p.surface, culture: zonesOf(p).length ? zonesOf(p).map(z => CULTURES[z.cultures[CURRENT_CAMP]?.culture]?.pac).join('+') : CULTURES[p.cultures[CURRENT_CAMP]?.culture]?.pac || null, commune: p.commune }, geometry: { type: 'Polygon', coordinates: [[...p.coords, p.coords[0]].map(([la, ln]) => [ln, la])] } })) }), 'Contours copiés (GeoJSON)'); };
function pacIlots() {
  const ilots = [...new Set(activeParcels().map(p => p.ilot))].sort((a, b) => a - b);
  return `<div class="card"><div class="tbl-wrap"><table class="t"><thead><tr><th>Îlot</th><th>N° parcelle</th><th>Parcelle</th><th>Commune</th><th>Code culture</th><th class="n">Surface déclarée</th><th class="n">Surface graphique</th></tr></thead><tbody>
  ${ilots.map(il => { const ps = activeParcels().filter(p => p.ilot === il); return ps.map((p, i) => `<tr data-a="openParc" data-id="${p.id}">${i === 0 ? `<td rowspan="${ps.length}" class="b" style="vertical-align:top">Îlot ${il}<div class="cell-sub">${nf(sum(ps, x => x.surface), 2)} ha</div></td>` : ''}<td>${esc(p.numPac || '—')}</td><td class="cell-main">${esc(p.nom)}</td><td>${esc(p.commune)}</td><td>${CULTURES[p.cultures[CURRENT_CAMP]?.culture]?.pac || '—'}</td><td class="n">${nf(p.surface, 2)} ha</td><td class="n">${p.parentId ? '—' : nf(areaHa(p.coords), 2) + ' ha'}</td></tr>`).join(''); }).join('')}
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
/* =====================================================================
   ASSOLEMENT — plan par culture, affectation des parcelles, mouvements de terres
   ===================================================================== */
const TERRE_IN = [['achat', 'Achat', 'euro'], ['bail', 'Location / bail', 'file'], ['echange', 'Échange', 'swap'], ['mad', 'Mise à disposition', 'users'], ['autre', 'Autre', 'plus']];
const TERRE_OUT = [['finbail', 'Fin de bail', 'file'], ['vente', 'Vente', 'euro'], ['echange', 'Échange', 'swap'], ['reprise', 'Reprise par le propriétaire', 'users'], ['autre', 'Autre', 'minus']];
const asCamp = () => +(UI.f.asCamp || CURRENT_CAMP);
const asPlan = camp => { S.assolPlan = S.assolPlan || {}; return S.assolPlan[camp] || (S.assolPlan[camp] = {}); };
function asRows(camp) {
  const plan = asPlan(camp), ps = activeParcels(camp), m = {};
  ps.forEach(p => { const k = p.cultures[camp]?.culture; if (k) { (m[k] = m[k] || { key: k, aff: 0, n: 0 }); m[k].aff += p.surface; m[k].n++; } });
  Object.keys(plan).forEach(k => { m[k] = m[k] || { key: k, aff: 0, n: 0 }; });
  return Object.values(m).map(r => { const obj = plan[r.key] ?? null; return { ...r, aff: r2(r.aff, 2), obj, sans: obj != null ? r2(Math.max(0, obj - r.aff), 2) : 0, over: obj != null ? r2(Math.max(0, r.aff - obj), 2) : 0, color: CULTURES[r.key]?.color || '#999', nom: CULTURES[r.key]?.nom || r.key }; }).sort((a, b) => Math.max(b.aff, b.obj || 0) - Math.max(a.aff, a.obj || 0));
}
function asTotals(camp) {
  const rows = asRows(camp), sau = surfaceTotale(camp), aff = r2(sum(rows, r => r.aff), 2), sans = r2(sum(rows, r => r.sans), 2);
  return { rows, sau, aff, sans, libre: r2(sau - aff - sans, 2) };
}
VIEWS.assolement = () => {
  const camp = asCamp(), t = tab('as', 'plan'), T = asTotals(camp);
  const camps = [CURRENT_CAMP - 1, CURRENT_CAMP, CURRENT_CAMP + 1, CURRENT_CAMP + 2];
  const bar = `<div class="zbar as-bar">${T.rows.filter(r => r.aff).map(r => `<i style="flex:${r.aff};background:${r.color}"></i>`).join('')}${T.sans ? `<i class="hatch" style="flex:${T.sans}"></i>` : ''}${T.libre > 0 ? `<i style="flex:${T.libre};background:var(--surface-3)"></i>` : ''}</div>`;
  const head = `<div class="as-years">${camps.map(c => `<button class="${c === camp ? 'on' : ''}" data-a="asCamp" data-c="${c}"><b>${c}</b><span>${c === CURRENT_CAMP ? 'en cours' : c < CURRENT_CAMP ? 'passée' : 'à venir'}</span></button>`).join('')}</div>
  <div class="as-hero card pad"><div class="row"><div><div class="small muted">Assolement ${campLabel(camp)} · récolte ${camp}</div><div class="as-big">${nf(T.aff, 1)} <small>/ ${nf(T.sau, 1)} ha assolés</small></div></div></div>${bar}
    <div class="as-leg"><span><i style="background:var(--primary)"></i><b>${nf(T.aff, 1)} ha</b> sur parcelles</span>${T.sans ? `<span><i class="hatch"></i><b>${nf(T.sans, 1)} ha</b> prévus sans parcelle</span>` : ''}<span><i style="background:var(--surface-3)"></i><b>${nf(Math.max(T.libre, 0), 1)} ha</b> non assolés</span></div>
    ${T.libre < -0.01 ? `<div class="note warn mt">${ic('alert')}<span>Le plan dépasse la surface de l’exploitation de <b>${nf(-T.libre, 2)} ha</b> : ajoutez des terres ou réduisez les objectifs.</span></div>` : ''}</div>`;
  const tabs = `<div class="seg mb as-tabs">${[['plan', 'Plan'], ['parcelles', 'Parcelles'], ['terres', 'Terres']].map(([v, l]) => `<button class="${t === v ? 'on' : ''}" data-a="tab" data-k="as" data-v="${v}">${l}</button>`).join('')}</div>`;
  let body = '';
  if (t === 'plan') body = asPlanView(camp, T);
  else if (t === 'parcelles') body = asParcView(camp);
  else body = asTerresView(camp);
  return `<div class="page-h toolbar"><span class="sp"></span>${pa([{ a: 'terreOut', i: 'minus', l: 'Retirer des terres', more: true }, { a: 'terreIn', i: 'plus', l: 'Ajouter des terres', more: true }, { a: 'asCopy', i: 'copy', l: `Reprendre ${camp - 1}`, more: true }, { a: 'asAddCult', i: 'plus', l: 'Culture au plan', primary: true }])}</div>${head}${tabs}${body}`;
};
function asPlanView(camp, T) {
  if (!T.rows.length) return `<div class="empty card pad">${ic('layers')}<p><b>Aucune culture prévue pour ${campLabel(camp)}</b></p><p class="small muted">Ajoutez les cultures que vous voulez faire et leur surface. Vous pourrez ensuite les placer sur vos parcelles, ou garder une partie « sans parcelle » en attendant.</p><div class="row wrap" style="justify-content:center"><button class="btn p" data-a="asAddCult">${ic('plus')} Ajouter une culture</button>${activeParcels(camp - 1).some(p => p.cultures[camp - 1]) ? `<button class="btn" data-a="asCopy">${ic('copy')} Partir de ${camp - 1}</button>` : ''}</div></div>`;
  return `<div class="as-list">${T.rows.map(r => { const tot = Math.max(r.obj || 0, r.aff) || 1; return `<div class="as-row" style="--c:${r.color}" data-a="asEdit" data-c="${r.key}"><div class="row"><span class="sw"></span><b>${esc(r.nom)}</b><span class="sp"></span><span class="as-n">${nf(r.aff, 1)}${r.obj != null ? ` <small>/ ${nf(r.obj, 1)} ha</small>` : ' ha'}</span></div>
    <div class="as-prog"><i style="width:${r.aff / tot * 100}%;background:var(--c)"></i>${r.sans ? `<i class="hatch" style="width:${r.sans / tot * 100}%"></i>` : ''}</div>
    <div class="as-sub">${r.n ? `${r.n} parcelle${r.n > 1 ? 's' : ''}` : 'Aucune parcelle'}${r.sans ? ` · <span class="chip-s warn">${nf(r.sans, 2)} ha sans parcelle</span>` : ''}${r.over ? ` · <span class="chip-s">${nf(r.over, 2)} ha au-delà de l’objectif</span>` : ''}${r.obj == null ? ' · <span class="muted">pas d’objectif</span>' : ''}${r.sans ? `<button class="lnk" data-a="asPlace" data-c="${r.key}">Placer ${ic('chevR')}</button>` : ''}</div></div>`; }).join('')}</div>
  <div class="formula">Les surfaces « sans parcelle » comptent dans le plan sans être rattachées à un champ (terres à trouver, location à venir…). Elles n’entrent pas dans le suivi des travaux ni dans la déclaration PAC.</div>`;
}
function asParcView(camp) {
  const ps = landParcels(camp), prev = camp - 1, only = UI.f.asNone;
  const farm = [...new Set([...Object.keys(asPlan(camp)), ...activeParcels(camp).map(p => p.cultures[camp]?.culture).filter(Boolean), ...activeParcels(prev).map(p => p.cultures[prev]?.culture).filter(Boolean)])].filter(k => CULTURES[k]);
  const sel = (p) => { const v = p.cultures[camp]?.culture || ''; return `<select class="inp as-sel" data-ch="asSet" data-id="${p.id}" style="--c:${CULTURES[v]?.color || 'var(--line)'}"><option value="">— Non assolée —</option>${farm.length ? `<optgroup label="Mon plan">${opts(farm.map(k => [k, CULTURES[k].nom]), v)}</optgroup>` : ''}<optgroup label="Autres cultures">${opts(Object.keys(CULTURES).filter(k => !farm.includes(k)).map(k => [k, CULTURES[k].nom]), v)}</optgroup></select>`; };
  const prevOf = p => { const zs = zonesOf(p, prev); if (zs.length) return zs.map(z => CULTURES[z.cultures[prev].culture]?.nom).join(' + '); return CULTURES[p.cultures[prev]?.culture]?.nom || '—'; };
  const list = ps.filter(p => !only || (!p.cultures[camp] && !zonesOf(p, camp).length));
  const nNone = ps.filter(p => !p.cultures[camp] && !zonesOf(p, camp).length).length;
  return `<div class="row wrap mb"><span class="chip ${!only ? 'on' : ''}" data-a="asNone" data-v="">Toutes · ${ps.length}</span><span class="chip ${only ? 'on' : ''}" data-a="asNone" data-v="1">Non assolées · ${nNone}</span></div>
  ${list.length ? `<div class="card as-plist">${list.map(p => { const zs = zonesOf(p, camp); return `<div class="as-p"><div class="tx" data-a="openParc" data-id="${p.id}"><b>${esc(p.nom)}</b><span>${nf(p.surface, 2)} ha · avant : ${esc(prevOf(p))}</span></div>${zs.length ? `<button class="btn sm" data-a="openParc" data-id="${p.id}">${ic('layers')} ${zs.map(z => esc(CULTURES[z.cultures[camp].culture]?.nom)).join(' + ')}</button>` : `<div class="as-pick">${sel(p)}${camp === CURRENT_CAMP ? `<button class="btn sm icon g" data-a="divParc" data-id="${p.id}" aria-label="Plusieurs cultures dans ce champ" title="Plusieurs cultures">${ic('layers')}</button>` : ''}</div>`}</div>`; }).join('')}</div>` : `<div class="empty">${only ? 'Toutes les parcelles sont assolées 👍' : 'Aucune parcelle pour cette campagne'}</div>`}
  <div class="formula">${camp === CURRENT_CAMP ? 'Changer la culture d’une parcelle met à jour ses travaux prévus selon l’itinéraire de la nouvelle culture.' : camp > CURRENT_CAMP ? 'Campagne à venir : l’affectation prépare l’assolement ; les travaux seront générés depuis l’itinéraire au démarrage de la campagne (Fiche parcelle › Générer l’ITK).' : 'Campagne passée : affectation conservée pour l’historique et les rotations.'} Plusieurs cultures dans un même champ : bouton ${ic('layers')}.</div>`;
}
function asTerresView(camp) {
  S.terres = S.terres || [];
  const camps = [CURRENT_CAMP - 2, CURRENT_CAMP - 1, CURRENT_CAMP, CURRENT_CAMP + 1, CURRENT_CAMP + 2], vals = camps.map(c => surfaceTotale(c)), mx = Math.max(...vals, 1);
  const mv = [...S.terres].sort((a, b) => b.date.localeCompare(a.date));
  const NAT = Object.fromEntries([...TERRE_IN, ...TERRE_OUT].map(x => [x[0], x[1]]));
  return `<div class="row wrap mb" style="gap:10px"><button class="btn as-big-btn in" data-a="terreIn">${ic('plus')}<span><b>Ajouter des terres</b><small>Achat, location, échange…</small></span></button><button class="btn as-big-btn out" data-a="terreOut">${ic('minus')}<span><b>Retirer des terres</b><small>Fin de bail, vente…</small></span></button></div>
  <div class="card pad mb"><div class="row mb"><b>Surface de l’exploitation</b><span class="sp"></span><span class="small muted">par campagne</span></div><div class="sau-ch">${camps.map((c, i) => `<div class="${c === camp ? 'on' : ''}"><span>${nf(vals[i], 0)}</span><i style="height:${Math.max(4, vals[i] / mx * 90)}px"></i><b>${c}</b></div>`).join('')}</div></div>
  <div class="sec-h"><h3>Mouvements de terres</h3></div>
  ${mv.length ? `<div class="card">${mv.map(m => { const inn = m.type === 'ajout'; return `<div class="li" data-a="terreOpen" data-id="${m.id}"><div class="ic ${inn ? 'ok' : 'warn'}">${ic(inn ? 'plus' : 'minus')}</div><div class="tx"><b>${inn ? '+' : '−'} ${nf(m.surface, 2)} ha · ${esc(m.nom)}</b><span>${esc(NAT[m.nature] || m.nature)} · ${dfr(m.date)} · campagne ${campLabel(campOf(m.date))}</span></div>${ic('chevR')}</div>`; }).join('')}</div>` : `<div class="empty card pad">Aucun mouvement enregistré. Les entrées et sorties de terres mettent à jour la surface de l’exploitation à partir de leur date.</div>`}`;
}
ACT.asCamp = d => { UI.f.asCamp = +d.c; render(); };
ACT.asNone = d => { UI.f.asNone = d.v; render(); };
const cultOpts = (v, excl = []) => opts(Object.keys(CULTURES).filter(k => !excl.includes(k)).map(k => [k, CULTURES[k].nom]), v);
ACT.asAddCult = () => { const camp = asCamp(), plan = asPlan(camp); openModal({ title: `Culture au plan ${campLabel(camp)}`, body: `<label class="field"><span>Culture</span><select class="inp" name="c" required><option value="">Choisir…</option>${cultOpts('', Object.keys(plan))}</select></label><label class="field"><span>Surface prévue (ha)</span><input class="inp" type="number" name="ha" step="0.01" min="0" inputmode="decimal" required></label><p class="small muted">Vous placerez ensuite cette culture sur vos parcelles (onglet Parcelles). La partie non placée reste comptée « sans parcelle ».</p>`, submit: 'Ajouter', onSubmit: f => { if (!f.c || !(+f.ha >= 0)) throw new Error('Culture et surface requises'); plan[f.c] = r2(+f.ha, 2); commit(`${CULTURES[f.c].nom} ajouté au plan ${campLabel(camp)}`); } }); };
ACT.asEdit = (d, el, e) => { if (e?.target.closest('[data-a="asPlace"]')) return; const camp = asCamp(), plan = asPlan(camp), r = asRows(camp).find(x => x.key === d.c); openModal({ title: esc(r.nom), body: `<div class="kv mb"><div><span>Sur parcelles</span><b>${nf(r.aff, 2)} ha (${r.n})</b></div><div><span>Sans parcelle</span><b>${nf(r.sans, 2)} ha</b></div></div><label class="field"><span>Objectif ${campLabel(camp)} (ha)</span><input class="inp" type="number" name="ha" step="0.01" min="0" inputmode="decimal" value="${r.obj ?? r.aff}"><small>Laisser vide pour ne suivre que les parcelles affectées</small></label>`, foot: `${plan[d.c] != null ? `<button type="button" class="btn g d" data-a="asDelPlan" data-c="${d.c}">${ic('trash')}</button>` : ''}<span class="sp"></span><button class="btn" data-a="closeModal" type="button">Annuler</button><button class="btn p" type="submit" form="mf">Enregistrer</button>`, submit: 'Enregistrer', onSubmit: f => { if (f.ha === '' || f.ha == null) delete plan[d.c]; else plan[d.c] = r2(+f.ha, 2); commit('Plan mis à jour'); } }); };
ACT.asDelPlan = d => { delete asPlan(asCamp())[d.c]; closeModal(); commit('Objectif retiré'); };
ACT.asPlace = d => { UI.tabs.as = 'parcelles'; UI.f.asNone = '1'; render(); toast(`Choisissez « ${CULTURES[d.c]?.nom} » sur les parcelles non assolées`); };
ACT.asCopy = () => { const camp = asCamp(), prev = camp - 1, plan = asPlan(camp), src = asRows(prev); if (!src.length) { toast(`Rien à reprendre pour ${campLabel(prev)}`, 'warn'); return; } openModal({ title: `Reprendre les surfaces de ${campLabel(prev)}`, body: `<p>Les objectifs ${campLabel(camp)} seront pré-remplis avec les surfaces par culture de ${campLabel(prev)} (à ajuster ensuite pour la rotation). Les parcelles ne sont pas modifiées.</p><div class="card">${src.map(r => `<div class="li"><span class="sw" style="width:10px;height:10px;border-radius:3px;background:${r.color}"></span><div class="tx"><b>${esc(r.nom)}</b></div><b>${nf(r.obj ?? r.aff, 1)} ha</b></div>`).join('')}</div>`, submit: 'Reprendre', onSubmit: () => { src.forEach(r => { if (plan[r.key] == null) plan[r.key] = r2(r.obj ?? r.aff, 2); }); commit('Plan pré-rempli'); } }); };
CH.asSet = el => {
  const camp = asCamp(), p = byId('parcelles', el.dataset.id), v = el.value, old = p.cultures[camp];
  const done = S.interventions.filter(i => i.parcelleId === p.id && i.campagne === camp && i.statut === 'realisee');
  if (done.length && old && old.culture !== v) { toast(`Impossible : ${done.length} opération(s) déjà réalisée(s) en ${CULTURES[old.culture]?.nom} sur ${p.nom} cette campagne`, 'warn'); render(); return; }
  S.interventions = S.interventions.filter(i => !(i.parcelleId === p.id && i.campagne === camp && i.statut === 'planifiee' && !i.custom));
  if (!v) delete p.cultures[camp];
  else { p.cultures[camp] = newCultRec(v, camp, old?.culture === v ? old : {}); if (camp === CURRENT_CAMP) syncItkParcel(p); }
  commit(v ? `${p.nom} → ${CULTURES[v].nom}` : `${p.nom} non assolée`);
};
/* ---------- mouvements de terres ---------- */
let TER = null;
function natPick(list, v) { return `<div class="nat-pick">${list.map(([k, l, i]) => `<button type="button" class="${v === k ? 'on' : ''}" data-a="terNat" data-v="${k}">${ic(i)}<span>${l}</span></button>`).join('')}</div>`; }
ACT.terNat = d => { TER.nature = d.v; document.querySelectorAll('.nat-pick button').forEach(b => b.classList.toggle('on', b.dataset.v === d.v)); };
ACT.terreIn = () => {
  TER = { nature: 'bail' }; const camp = asCamp();
  openModal({ title: 'Ajouter des terres', body: `<div class="field"><span>Origine</span>${natPick(TERRE_IN, TER.nature)}</div>
  <div class="grid2"><label class="field"><span>Nom du champ *</span><input class="inp" name="nom" required placeholder="Ex. Les Grands Prés"></label><label class="field"><span>Surface (ha) *</span><input class="inp" name="surface" type="number" step="0.01" min="0.01" inputmode="decimal" required></label></div>
  <div class="grid2"><label class="field"><span>Date d’entrée</span><input class="inp" type="date" name="date" value="${TODAY}"></label><label class="field"><span>Commune</span><input class="inp" name="commune"></label></div>
  <label class="field"><span>Culture prévue (facultatif)</span><select class="inp" name="culture"><option value="">— Plus tard —</option>${cultOpts('')}</select><small>Pour la campagne de la date d’entrée</small></label>
  <label class="field"><span>Note</span><input class="inp" name="note" placeholder="Propriétaire, durée du bail…"></label>
  <p class="small muted">Le champ est créé dans le parcellaire avec un contour à dessiner sur la carte.</p>`, submit: 'Ajouter', onSubmit: f => {
    const surface = r2(+f.surface, 2); if (!f.nom || !(surface > 0)) throw new Error('Nom et surface obligatoires');
    const date = f.date || TODAY, cp = campOf(date), ref = landParcels()[0];
    const ilot = Math.max(0, ...S.parcelles.filter(x => !x.parentId).map(x => +x.ilot || 0)) + 1;
    const p = { id: uid('p'), nom: f.nom.trim(), surface, commune: f.commune || ref?.commune || '', cadastre: '', sol: '', coords: [], centre: ref?.centre || S.exploitation?.centre || null, contourProvisoire: true, cultures: {}, notes: f.note || '', ilot, numPac: `${ilot}.1`, statutFoncier: TER.nature === 'achat' ? 'propriete' : TER.nature === 'bail' ? 'fermage' : 'autre', dateEntree: date };
    if (f.culture) p.cultures[cp] = newCultRec(f.culture, cp);
    S.parcelles.push(p); if (f.culture && cp === CURRENT_CAMP) syncItkParcel(p);
    S.terres = S.terres || []; S.terres.push({ id: uid('t'), type: 'ajout', nature: TER.nature, date, surface, parcelleId: p.id, nom: p.nom, note: f.note || '' });
    commit(`+ ${nf(surface, 2)} ha · ${p.nom} ajouté`);
  } });
};
ACT.terreOut = d => {
  const ps = landParcels(); if (!ps.length) { toast('Aucune parcelle', 'warn'); return; }
  TER = { nature: 'finbail' }; const pre = d?.id || '';
  openModal({ title: 'Retirer des terres', body: `<label class="field"><span>Champ concerné *</span><select class="inp" name="pid" required><option value="">Choisir…</option>${opts(ps.map(p => [p.id, `${p.nom} · ${nf(p.surface, 2)} ha`]), pre)}</select></label>
  <div class="field"><span>Motif</span>${natPick(TERRE_OUT, TER.nature)}</div>
  <div class="grid2"><label class="field"><span>Date de sortie</span><input class="inp" type="date" name="date" value="${TODAY}"></label><label class="field"><span>Surface retirée (ha)</span><input class="inp" type="number" name="surface" step="0.01" min="0.01" inputmode="decimal" placeholder="Tout le champ"><small>Laisser vide pour retirer tout le champ</small></label></div>
  <label class="field"><span>Note</span><input class="inp" name="note"></label>
  <p class="small muted">L’historique (opérations réalisées, récoltes, coûts) est conservé. Les travaux prévus après la date de sortie sont supprimés.</p>`, submit: 'Retirer', onSubmit: f => {
    const p = byId('parcelles', f.pid); if (!p) throw new Error('Choisissez un champ');
    const date = f.date || TODAY, part = f.surface ? r2(+f.surface, 2) : p.surface;
    if (!(part > 0) || part > p.surface + 0.001) throw new Error(`Surface entre 0 et ${nf(p.surface, 2)} ha`);
    const partiel = part < p.surface - 0.001;
    if (partiel && zonesOf(p).length) throw new Error('Ce champ contient plusieurs cultures : réunissez-le ou retirez-le en entier');
    const ids = [p.id, ...S.parcelles.filter(z => z.parentId === p.id).map(z => z.id)];
    if (partiel) { p.surface = r2(p.surface - part, 2); S.interventions.filter(i => i.parcelleId === p.id && i.statut === 'planifiee').forEach(i => i.surface = p.surface); }
    else { p.dateSortie = date; S.interventions = S.interventions.filter(i => !(ids.includes(i.parcelleId) && i.statut === 'planifiee' && i.date >= date)); }
    S.terres = S.terres || []; S.terres.push({ id: uid('t'), type: 'retrait', nature: TER.nature, date, surface: part, parcelleId: p.id, nom: p.nom, note: f.note || '', partiel });
    closeDrawer(); commit(`− ${nf(part, 2)} ha · ${p.nom}${partiel ? '' : ' retiré de l’exploitation'}`);
  } });
};
ACT.terreOpen = d => { const m = S.terres.find(x => x.id === d.id), p = byId('parcelles', m.parcelleId), NAT = Object.fromEntries([...TERRE_IN, ...TERRE_OUT].map(x => [x[0], x[1]]));
  const canUndo = m.type === 'ajout' ? p && !S.interventions.some(i => i.parcelleId === p.id && i.statut === 'realisee') : !!p;
  openModal({ title: m.type === 'ajout' ? 'Entrée de terres' : 'Sortie de terres', body: `<div class="kv">${[['Champ', m.nom], ['Surface', `${nf(m.surface, 2)} ha`], ['Motif', NAT[m.nature] || m.nature], ['Date', dfr(m.date)], ['Campagne', campLabel(campOf(m.date))], ['Note', m.note || '—']].map(([k, v]) => `<div><span>${k}</span><b>${esc(v)}</b></div>`).join('')}</div>${!canUndo && m.type === 'ajout' ? '<p class="small muted mt">Des opérations ont été réalisées sur ce champ : l’entrée ne peut plus être annulée (retirez plutôt les terres).</p>' : ''}`, foot: `${canUndo ? `<button type="button" class="btn g d" data-a="terreUndo" data-id="${m.id}">${ic('undo')} Annuler ce mouvement</button>` : ''}<span class="sp"></span><button class="btn p" data-a="closeModal" type="button">Fermer</button>` }); };
ACT.terreUndo = d => { const m = S.terres.find(x => x.id === d.id), p = byId('parcelles', m.parcelleId);
  if (m.type === 'ajout' && p) { const ids = [p.id, ...S.parcelles.filter(z => z.parentId === p.id).map(z => z.id)]; S.parcelles = S.parcelles.filter(x => !ids.includes(x.id)); S.interventions = S.interventions.filter(i => !ids.includes(i.parcelleId)); }
  else if (p) { if (m.partiel) p.surface = r2(p.surface + m.surface, 2); else delete p.dateSortie; }
  S.terres = S.terres.filter(x => x.id !== m.id); closeModal(); commit('Mouvement annulé' + (m.type === 'retrait' && !m.partiel ? ' · les travaux prévus supprimés ne sont pas recréés' : ''));
};

(function boot() {
  loadState();
  document.body.insertAdjacentHTML('beforeend', `<div id="scrimD" class="scrim" data-a="closeDrawer"></div><aside id="drawer" class="drawer" aria-label="Fiche"></aside><div id="scrimM" class="scrim m" data-a="closeModal"></div><div id="modal" class="modal" role="dialog"></div><div id="toasts" class="toast-box"></div>
  <div id="searchPop" class="search-pop" data-a="closeSearchBg"><div class="search-box"><div style="position:relative"><span style="position:absolute;left:16px;top:18px;color:var(--faint)">${ic('search')}</span><input class="inp" placeholder="Rechercher dans l’exploitation…" data-in="search"></div><div class="res"></div></div></div>`);
  ACT.closeSearchBg = (d, el, e) => { if (e.target.id === 'searchPop') ACT.closeSearch(); };
  // Mise à jour : applique une fois les itinéraires saisis aux parcelles d'une ferme réelle
  try { if (S.onboarded && !S.demo && !S.itkSync1) { Object.keys(S.itk).forEach(k => syncItkCulture(k)); S.itkSync1 = true; saveState(); } } catch (e) { }
  route();
})();
