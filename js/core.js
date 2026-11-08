'use strict';
/* =====================================================================
   AGRI PILOT — Noyau : utilitaires, référentiels, données, logique métier
   Toutes les données générées ici sont des DONNÉES DE DÉMONSTRATION.
   ===================================================================== */

/* ---------- Utilitaires ---------- */
const pad = n => String(n).padStart(2, '0');
const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const TODAY = iso(new Date());
const D = s => new Date(s + 'T12:00:00');
const addDays = (s, n) => { const d = D(s); d.setDate(d.getDate() + n); return iso(d); };
const addYears = (s, n) => { const d = D(s); d.setFullYear(d.getFullYear() + n); return iso(d); };
const daysBetween = (a, b) => Math.round((D(b) - D(a)) / 864e5);
const r2 = (v, d = 2) => { const f = 10 ** d; return Math.round((+v || 0) * f) / f; };
const sum = (a, f = x => x) => a.reduce((s, x) => s + (+f(x) || 0), 0);
let _seq = 0;
const uid = p => `${p}_${Date.now().toString(36)}${(++_seq).toString(36)}${Math.random().toString(36).slice(2, 5)}`;
/* Campagne N = récolte N, du 1er août N-1 au 31 juillet N */
const campOf = s => { const d = D(s); return d.getMonth() >= 7 ? d.getFullYear() + 1 : d.getFullYear(); };
const campLabel = c => `${c - 1}-${c}`;
const CURRENT_CAMP = campOf(TODAY);
const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

/* ---------- Référentiels ---------- */
const CULTURES = {
  ble_tendre: { nom: 'Blé tendre', color: '#D4A23A', pac: 'BTH', cours: 'ble_tendre' },
  ble_dur: { nom: 'Blé dur', color: '#A8742A', pac: 'BDH', cours: 'ble_dur' },
  orge_h: { nom: "Orge d'hiver", color: '#C7B45A', pac: 'ORH', cours: 'orge' },
  orge_p: { nom: 'Orge de printemps', color: '#9DB35E', pac: 'ORP', cours: 'orge' },
  colza: { nom: 'Colza', color: '#E6C51F', pac: 'CZH', cours: 'colza' },
  mais: { nom: 'Maïs grain', color: '#E07A35', pac: 'MIS', cours: 'mais' },
  pois: { nom: 'Pois protéagineux', color: '#6FA858', pac: 'PPR', cours: 'pois' },
  pdt: { nom: 'Pommes de terre', color: '#94664A', pac: 'PTC', cours: 'pdt' },
  legumes: { nom: 'Légumes', color: '#3FA38C', pac: 'LEG', cours: null },
  prairie: { nom: 'Prairie permanente', color: '#3E8E5E', pac: 'PPH', cours: null },
};
const INTER_TYPES = {
  preparation: 'Préparation du sol', travail_sol: 'Travail du sol', semis: 'Semis / plantation',
  fertilisation: 'Fertilisation', desherbage: 'Désherbage', protection: 'Protection des cultures',
  irrigation: 'Irrigation', recolte: 'Récolte', autre: 'Autre',
};
const STOCK_CATS = {
  production: 'Productions', semences: 'Semences', engrais: 'Engrais',
  phyto: 'Produits phytosanitaires', amendements: 'Amendements', carburants: 'Carburants',
};
const MOVE_TYPES = { entree: 'Entrée', sortie: 'Sortie', transfert: 'Transfert', perte: 'Perte', ajustement: 'Ajustement' };
const CHARGE_CATS = {
  intrants: "Achats d'intrants", carburant: 'Carburant', entretien: 'Entretien matériel', reparations: 'Réparations',
  prestations: 'Prestations extérieures', main_oeuvre: "Main-d'œuvre", fermages: 'Fermages', assurances: 'Assurances', divers: 'Charges diverses',
};
const FIXED_CATS = ['prestations', 'main_oeuvre', 'fermages', 'assurances', 'divers'];
const MAT_CATS = {
  tracteur: 'Tracteurs', moissonneuse: 'Moissonneuses-batteuses', ensileuse: 'Ensileuses', pulverisateur: 'Pulvérisateurs',
  semoir: 'Semoirs', dechaumeur: 'Déchaumeurs', charrue: 'Charrues', remorque: 'Remorques', manutention: 'Matériel de manutention', divers: 'Matériel divers',
};
const MAINT_TYPES = { entretien: 'Entretien', vidange: 'Vidange', filtres: 'Filtres', pneumatiques: 'Pneumatiques', reparation: 'Réparation / panne', controle: 'Contrôle réglementaire' };
const ENGINE_CATS = ['tracteur', 'moissonneuse', 'ensileuse', 'manutention'];
const ETATS = { excellent: 1.08, bon: 1, moyen: 0.9, mauvais: 0.78 };

/* ---------- Persistance locale ---------- */
const STORE_KEY = 'agripilot.v1';
const PREF_KEY = 'agripilot.prefs.v1';
let S = null;
function saveState() { try { localStorage.setItem(STORE_KEY, JSON.stringify(S)); return true; } catch (e) { return false; } }
function loadState() {
  try { const raw = localStorage.getItem(STORE_KEY); if (raw) { const st = JSON.parse(raw); if (st && st.version === 1) { S = st; return 'local'; } } } catch (e) { }
  S = seedDemo(); saveState(); return 'seed';
}
function resetDemo() { S = seedDemo(); saveState(); }

const byId = (coll, id) => (S[coll] || []).find(x => x.id === id);

/* =====================================================================
   OPÉRATIONS MÉTIER (toutes les liaisons inter-modules passent ici)
   ===================================================================== */

/** Mouvement de stock. Entrée avec prix : recalcul du prix moyen pondéré (PMP). */
function stockMove(itemId, type, qte, o = {}) {
  const it = byId('stock', itemId);
  if (!it) throw new Error('Article introuvable');
  qte = +qte;
  const pu = o.prixUnit != null ? +o.prixUnit : it.pmp || 0;
  if (type === 'entree') {
    if (o.prixUnit != null) {
      const tot = it.qte * (it.pmp || 0) + qte * pu;
      it.qte = r2(it.qte + qte, 3);
      it.pmp = it.qte > 0 ? r2(tot / it.qte, 4) : pu;
    } else it.qte = r2(it.qte + qte, 3);
    it.dateEntree = o.date || TODAY;
  } else if (type === 'sortie' || type === 'perte') {
    it.qte = r2(it.qte - qte, 3);
  } else if (type === 'ajustement') {
    it.qte = r2(it.qte + qte, 3);
  }
  const m = { id: uid('mv'), date: o.date || TODAY, itemId, type, qte: r2(qte, 3), pu: r2(pu, 4), valeur: r2(qte * pu), motif: o.motif || '', ref: o.ref || null, refKind: o.refKind || null };
  S.mouvements.push(m);
  return m;
}

/** Transfert de quantité vers un autre emplacement (scinde l'article si partiel). */
function transferStock(itemId, qte, dest, date = TODAY) {
  const it = byId('stock', itemId);
  qte = Math.min(+qte, it.qte);
  if (qte <= 0 || !dest || dest === it.emplacement) return;
  let target = S.stock.find(x => x.id !== it.id && x.nom === it.nom && x.cat === it.cat && x.emplacement === dest && x.lot === it.lot);
  if (qte >= it.qte && !target) {
    const from = it.emplacement; it.emplacement = dest;
    S.mouvements.push({ id: uid('mv'), date, itemId, type: 'transfert', qte, pu: it.pmp, valeur: r2(qte * it.pmp), motif: `${from} → ${dest}` });
    return;
  }
  if (!target) { target = { ...it, id: uid('st'), qte: 0, emplacement: dest }; S.stock.push(target); }
  it.qte = r2(it.qte - qte, 3);
  target.pmp = target.qte + qte > 0 ? r2((target.qte * target.pmp + qte * it.pmp) / (target.qte + qte), 4) : it.pmp;
  target.qte = r2(target.qte + qte, 3);
  S.mouvements.push({ id: uid('mv'), date, itemId: it.id, type: 'transfert', qte: -qte, pu: it.pmp, valeur: -r2(qte * it.pmp), motif: `Vers ${dest}` });
  S.mouvements.push({ id: uid('mv'), date, itemId: target.id, type: 'transfert', qte, pu: it.pmp, valeur: r2(qte * it.pmp), motif: `Depuis ${it.emplacement}` });
}

/** Achat d'un intrant : entrée en stock + charge. */
function recordPurchase({ itemId, qte, prixUnit, date = TODAY, fournisseur, campagne, ref }) {
  const it = byId('stock', itemId);
  const montant = r2(qte * prixUnit);
  const ch = { id: uid('ch'), date, campagne: campagne || campOf(date), cat: it.cat === 'carburants' ? 'carburant' : 'intrants', libelle: `${it.nom} — ${fmtQ(qte)} ${it.unite}`, montant, fournisseur: fournisseur || it.fournisseur || '', itemId, qte, stockCat: it.cat, ref: ref || '' };
  S.charges.push(ch);
  stockMove(itemId, 'entree', qte, { prixUnit, date, motif: `Achat ${ch.fournisseur}`, ref: ch.id, refKind: 'charge' });
  if (fournisseur) it.fournisseur = fournisseur;
  return ch;
}
function fmtQ(v) { return (Math.round(v * 100) / 100).toLocaleString('fr-FR'); }

/** Article de production pour une culture et une campagne (créé si besoin). */
function prodItem(culture, campagne) {
  let it = S.stock.find(x => x.cat === 'production' && x.culture === culture && x.campagne === campagne);
  if (!it) {
    const silo = { colza: 'Cellule 3', mais: 'Cellule 4', pdt: 'Bâtiment frigo', pois: 'Cellule 5', ble_dur: 'Cellule 2', orge_h: 'Cellule 2', orge_p: 'Cellule 5' }[culture] || 'Cellule 1';
    it = { id: uid('st'), nom: `${CULTURES[culture]?.nom || culture} — récolte ${campagne}`, cat: 'production', culture, campagne, unite: 't', qte: 0, pmp: 0, emplacement: silo, fournisseur: '', lot: `R${campagne}-${(CULTURES[culture]?.pac || 'XX')}`, seuil: 0, dateEntree: TODAY };
    S.stock.push(it);
  }
  return it;
}

/**
 * Réalisation d'une intervention : déduit les intrants, le carburant (GNR) selon
 * la consommation horaire du matériel moteur, ajoute les heures au compteur et,
 * pour une récolte, alimente le stock de production et le rendement réel.
 */
function applyIntervention(iv, o = {}) {
  const warnings = [];
  iv.produits = (iv.produits || []).map(p => {
    const it = byId('stock', p.itemId);
    const qte = r2(p.dose * iv.surface, 3);
    if (o.autoBuy && it.qte < qte) autoBuy(it, qte - it.qte, iv);
    if (it.qte < qte) warnings.push(`Stock insuffisant : ${it.nom} (${fmtQ(it.qte)} ${it.unite} disponibles, ${fmtQ(qte)} nécessaires)`);
    const pu = it.pmp;
    stockMove(it.id, 'sortie', qte, { date: iv.date, motif: `Intervention ${iv.label} — ${byId('parcelles', iv.parcelleId)?.nom || ''}`, ref: iv.id, refKind: 'intervention' });
    return { ...p, qte, pu: r2(pu, 4), cout: r2(qte * pu) };
  });
  // Carburant
  const gnr = S.stock.find(x => x.cat === 'carburants');
  let litres = 0;
  (iv.materiels || []).forEach(mid => {
    const m = byId('materiel', mid); if (!m) return;
    if (m.conso) litres += m.conso * iv.heures;
    if (ENGINE_CATS.includes(m.cat)) m.heures = r2(m.heures + iv.heures, 1);
    m.heuresUsage = r2((m.heuresUsage || 0) + iv.heures, 1);
  });
  litres = r2(litres, 1);
  if (litres > 0 && gnr) {
    if (o.autoBuy && gnr.qte < litres) autoBuy(gnr, litres - gnr.qte, iv);
    if (gnr.qte < litres) warnings.push(`Stock de GNR insuffisant (${fmtQ(gnr.qte)} L)`);
    const pu = gnr.pmp;
    stockMove(gnr.id, 'sortie', litres, { date: iv.date, motif: `Carburant — ${iv.label}`, ref: iv.id, refKind: 'intervention' });
    iv.carburant = { itemId: gnr.id, qte: litres, pu: r2(pu, 4), cout: r2(litres * pu) };
  } else iv.carburant = null;
  // Récolte
  if (iv.type === 'recolte' && iv.recolteQte > 0) {
    const p = byId('parcelles', iv.parcelleId);
    const rec = p.cultures[iv.campagne];
    if (rec && rec.culture !== 'prairie') {
      const it = prodItem(rec.culture, iv.campagne);
      stockMove(it.id, 'entree', iv.recolteQte, { date: iv.date, motif: `Récolte ${p.nom}`, ref: iv.id, refKind: 'intervention' });
      iv.recolteItemId = it.id;
      rec.rdtReel = r2(iv.recolteQte / p.surface, 2);
      rec.recolte = iv.date;
    }
  }
  iv.statut = 'realisee';
  iv.coutIntrants = r2(sum(iv.produits, p => p.cout) + (iv.carburant?.cout || 0));
  return warnings;
}
function autoBuy(it, missing, iv) {
  const b = it.batch || 1;
  const q = Math.max(b, Math.ceil(missing / b) * b);
  const f = iv.campagne <= 2025 ? 1.05 : 1;
  recordPurchase({ itemId: it.id, qte: q, prixUnit: r2(it.basePrix * f, 4), date: addDays(iv.date, -12), campagne: iv.campagne, fournisseur: it.fournisseur });
}

/** Annulation d'une intervention réalisée : contre-passe les mouvements. */
function cancelIntervention(iv) {
  if (iv.statut !== 'realisee') return;
  S.mouvements.filter(m => m.ref === iv.id).forEach(m => {
    const it = byId('stock', m.itemId); if (!it) return;
    if (m.type === 'sortie') it.qte = r2(it.qte + m.qte, 3);
    if (m.type === 'entree') it.qte = r2(it.qte - m.qte, 3);
  });
  S.mouvements = S.mouvements.filter(m => m.ref !== iv.id);
  (iv.materiels || []).forEach(mid => { const m = byId('materiel', mid); if (!m) return; if (ENGINE_CATS.includes(m.cat)) m.heures = r2(m.heures - iv.heures, 1); });
  if (iv.type === 'recolte') { const rec = byId('parcelles', iv.parcelleId)?.cultures[iv.campagne]; if (rec) rec.rdtReel = null; }
  iv.statut = 'planifiee'; iv.carburant = null; iv.coutIntrants = 0;
  iv.produits = iv.produits.map(p => ({ itemId: p.itemId, dose: p.dose }));
}

/** Vente : sortie de stock de production + chiffre d'affaires. */
function recordSale({ itemId, qte, prix, acheteur, date = TODAY, statut = 'attente', facture }) {
  const it = byId('stock', itemId);
  if (qte > it.qte + 1e-6) throw new Error(`Quantité supérieure au stock disponible (${fmtQ(it.qte)} t)`);
  S.seq.facture++;
  const v = { id: uid('vt'), date, itemId, produit: it.nom, culture: it.culture, campagne: it.campagne, qte: r2(qte, 3), unite: it.unite, prix: r2(prix, 2), montant: r2(qte * prix), acheteur, statut, facture: facture || `FA-${D(date).getFullYear()}-${String(S.seq.facture).padStart(4, '0')}` };
  S.ventes.push(v);
  stockMove(itemId, 'sortie', qte, { date, motif: `Vente ${v.facture} — ${acheteur}`, ref: v.id, refKind: 'vente', prixUnit: it.pmp });
  return v;
}
function deleteSale(v) {
  const it = byId('stock', v.itemId); if (it) it.qte = r2(it.qte + v.qte, 3);
  S.mouvements = S.mouvements.filter(m => m.ref !== v.id);
  S.ventes = S.ventes.filter(x => x.id !== v.id);
}

/** Entretien / réparation matériel : historique + charge. */
function recordMaintenance(matId, e) {
  const m = byId('materiel', matId);
  const entry = { id: uid('mt'), ...e, coutPieces: +e.coutPieces || 0, coutMO: +e.coutMO || 0, immobilisation: +e.immobilisation || 0 };
  m.maintenance.push(entry);
  const total = entry.coutPieces + entry.coutMO;
  if (total > 0) S.charges.push({ id: uid('ch'), date: e.date, campagne: campOf(e.date), cat: e.type === 'reparation' ? 'reparations' : 'entretien', libelle: `${m.marque} ${m.modele} — ${e.titre}`, montant: r2(total), fournisseur: e.prestataire || '', materielId: m.id, ref: entry.id });
  return entry;
}

/* =====================================================================
   CALCULS
   ===================================================================== */
function coursKeyOf(culture) { return CULTURES[culture]?.cours || null; }
function lastCours(key) {
  const c = S.cours[key]; if (!c || !c.points.length) return null;
  return c.points[c.points.length - 1];
}
/** Prix de référence (dernier cours connu) pour une culture, sinon null. */
function refPrice(culture) { const k = coursKeyOf(culture); const p = k && lastCours(k); return p ? p.prix : null; }
function coursAt(key, daysAgo) {
  const c = S.cours[key]; if (!c || !c.points.length) return null;
  const last = c.points[c.points.length - 1].date;
  const target = addDays(last, -daysAgo);
  let best = null;
  for (const p of c.points) { if (p.date <= target) best = p; else break; }
  return best;
}
function coursVar(key, days) { const a = coursAt(key, days), b = lastCours(key); if (!a || !b || !a.prix) return null; return (b.prix - a.prix) / a.prix; }

function materielAge(m, camp = CURRENT_CAMP) { return Math.max(1, camp - m.annee); }
function amortAnnuel(m) { return r2((m.prixAchat * 0.8) / (m.dureeAmort || 10)); }
function assuranceAnnuelle(m) { return r2(m.prixAchat * 0.006); }
function maintCost(m, camp, types) { return r2(sum(m.maintenance.filter(e => campOf(e.date) === camp && (!types || types.includes(e.type))), e => e.coutPieces + e.coutMO)); }
function heuresCampagne(m, camp) { return r2(sum(S.interventions.filter(i => i.statut === 'realisee' && i.campagne === camp && (i.materiels || []).includes(m.id)), i => i.heures), 1); }
/**
 * Coût horaire (hors carburant, déjà compté en intrant GNR) :
 * (amortissement économique + assurance + entretien/réparations de la campagne) / heures d'utilisation.
 * Campagne en cours ou peu d'heures : base = heures annuelles de référence.
 */
function coutHoraire(m, camp = CURRENT_CAMP - 1) {
  const h = heuresCampagne(m, camp);
  const base = camp >= CURRENT_CAMP || h < m.heuresAn * 0.3 ? m.heuresAn : h;
  const annuel = amortAnnuel(m) + assuranceAnnuelle(m) + maintCost(m, camp);
  return { annuel: r2(annuel), heures: base, horaire: r2(annuel / Math.max(1, base)), amort: amortAnnuel(m), assurance: assuranceAnnuelle(m), entretien: maintCost(m, camp) };
}
/** Estimation indicative de la valeur de revente (modèle de décote simplifié). */
function estimationRevente(m) {
  const age = Math.max(0, CURRENT_CAMP - 1 - m.annee + 0.5);
  const taux = { tracteur: 0.085, moissonneuse: 0.095, manutention: 0.1 }[m.cat] || 0.11;
  let v = m.prixAchat * Math.pow(1 - taux, age);
  let fh = 1;
  if (ENGINE_CATS.includes(m.cat) && m.heuresAn) {
    const attendu = age * m.heuresAn;
    fh = Math.min(1.1, Math.max(0.8, 1 - 0.05 * ((m.heures - attendu) / 1000)));
  }
  v *= fh * (ETATS[m.etat] || 1);
  return { valeur: Math.round(v / 100) * 100, age: r2(age, 1), taux, fh: r2(fh, 3), fe: ETATS[m.etat] || 1 };
}
function valeurMateriel(m) { return m.valeurManuelle != null && m.valeurManuelle !== '' ? +m.valeurManuelle : estimationRevente(m).valeur; }

function nextMaintenance(m) {
  const p = m.prochain; if (!p) return null;
  let urgence = 'ok', echeance = '';
  if (p.heures != null) {
    const reste = r2(p.heures - m.heures, 1);
    echeance = reste <= 0 ? `dépassé de ${fmtQ(-reste)} h` : `dans ${fmtQ(reste)} h`;
    urgence = reste <= 0 ? 'danger' : reste <= 50 ? 'warn' : 'ok';
  }
  if (p.date) {
    const j = daysBetween(TODAY, p.date);
    echeance = j < 0 ? `en retard de ${-j} j` : `dans ${j} j`;
    urgence = j < 0 ? 'danger' : j <= 30 ? 'warn' : 'ok';
  }
  return { ...p, urgence, echeance };
}

function stockValue(it) {
  if (it.cat === 'production') { const p = refPrice(it.culture); return p != null ? r2(it.qte * p) : null; }
  return r2(it.qte * (it.pmp || 0));
}
function stockTotals() {
  const intrants = sum(S.stock.filter(i => i.cat !== 'production'), i => stockValue(i));
  const prodItems = S.stock.filter(i => i.cat === 'production' && i.qte > 0);
  const production = sum(prodItems, i => stockValue(i) || 0);
  const sansCours = prodItems.filter(i => stockValue(i) == null).length;
  return { intrants: r2(intrants), production: r2(production), sansCours };
}

function surfaceTotale() { return r2(sum(S.parcelles, p => p.surface), 2); }
function assolement(camp) {
  const m = {};
  S.parcelles.forEach(p => { const c = p.cultures[camp]?.culture; if (!c) return; m[c] = (m[c] || 0) + p.surface; });
  return Object.entries(m).map(([k, v]) => ({ key: k, label: CULTURES[k]?.nom || k, value: r2(v), color: CULTURES[k]?.color })).sort((a, b) => b.value - a.value);
}

/** Coût de mécanisation d'une intervention réalisée. */
function mecaCost(iv) {
  return r2(sum(iv.materiels || [], mid => { const m = byId('materiel', mid); return m ? iv.heures * coutHoraire(m, iv.campagne).horaire : 0; }));
}

/**
 * Économie d'une campagne.
 * Produit brut = ventes réalisées + stock restant × cours de référence (part estimée signalée).
 * Marge brute = produit brut − intrants consommés (produits + carburant).
 * Coût de production / t = (intrants + mécanisation + charges de structure réparties à l'ha) / tonnes récoltées.
 */
function econ(camp) {
  const ivs = S.interventions.filter(i => i.campagne === camp && i.statut === 'realisee');
  const charges = S.charges.filter(c => c.campagne === camp);
  const ventes = S.ventes.filter(v => v.campagne === camp);
  const fixes = sum(charges.filter(c => FIXED_CATS.includes(c.cat)), c => c.montant);
  const surfTot = sum(S.parcelles.filter(p => p.cultures[camp]), p => p.surface);
  const cult = {};
  S.parcelles.forEach(p => {
    const rec = p.cultures[camp]; if (!rec) return;
    const k = rec.culture;
    const c = cult[k] || (cult[k] = { key: k, nom: CULTURES[k]?.nom || k, color: CULTURES[k]?.color, surface: 0, production: 0, intrants: 0, meca: 0, ventesQ: 0, ventesCA: 0, parcelles: [] });
    c.surface += p.surface;
    const pivs = ivs.filter(i => i.parcelleId === p.id);
    const intr = sum(pivs, i => i.coutIntrants), meca = sum(pivs, i => mecaCost(i));
    const prod = sum(pivs.filter(i => i.type === 'recolte'), i => i.recolteQte || 0);
    c.intrants += intr; c.meca += meca; c.production += prod;
    const fixAlloc = surfTot ? fixes * p.surface / surfTot : 0;
    c.parcelles.push({ id: p.id, nom: p.nom, surface: p.surface, intrants: r2(intr), meca: r2(meca), production: r2(prod, 2), fixAlloc: r2(fixAlloc), coutTonne: prod > 0 ? r2((intr + meca + fixAlloc) / prod) : null, rdt: rec.rdtReel });
  });
  ventes.forEach(v => { const c = cult[v.culture]; if (c) { c.ventesQ += v.qte; c.ventesCA += v.montant; } });
  const rows = Object.values(cult).map(c => {
    const restant = Math.max(0, c.production - c.ventesQ);
    const pr = refPrice(c.key);
    const estime = restant > 0 && pr != null ? restant * pr : 0;
    const pb = c.ventesCA + estime;
    const fixAlloc = surfTot ? fixes * c.surface / surfTot : 0;
    const mb = pb - c.intrants;
    return {
      ...c, surface: r2(c.surface), production: r2(c.production, 2), intrants: r2(c.intrants), meca: r2(c.meca), ventesQ: r2(c.ventesQ, 2), ventesCA: r2(c.ventesCA),
      restant: r2(restant, 2), prixRef: pr, produitEstime: r2(estime), produitBrut: r2(pb), prixMoyen: c.ventesQ ? r2(c.ventesCA / c.ventesQ) : null,
      rdt: c.surface ? r2(c.production / c.surface, 2) : 0, margeBrute: r2(mb), mbHa: c.surface ? r2(mb / c.surface) : 0,
      intrantsHa: c.surface ? r2(c.intrants / c.surface) : 0, mecaHa: c.surface ? r2(c.meca / c.surface) : 0,
      fixAlloc: r2(fixAlloc), coutTonne: c.production > 0 ? r2((c.intrants + c.meca + fixAlloc) / c.production) : null,
      margeNette: r2(mb - c.meca - fixAlloc),
    };
  }).sort((a, b) => b.surface - a.surface);
  const ca = r2(sum(ventes, v => v.montant));
  const chargesTot = r2(sum(charges, c => c.montant));
  const estime = r2(sum(rows, r => r.produitEstime));
  const byCat = Object.keys(CHARGE_CATS).map(k => ({ key: k, label: CHARGE_CATS[k], value: r2(sum(charges.filter(c => c.cat === k), c => c.montant)) })).filter(x => x.value > 0);
  const intrantsConso = r2(sum(rows, r => r.intrants)), meca = r2(sum(rows, r => r.meca));
  return {
    camp, rows, ca, charges: chargesTot, resultatRealise: r2(ca - chargesTot), produitEstime: estime, resultatPrev: r2(ca + estime - chargesTot),
    byCat, fixes: r2(fixes), surface: r2(surfTot), intrantsConso, meca, intrantsHa: surfTot ? r2(intrantsConso / surfTot) : 0, mecaHa: surfTot ? r2(meca / surfTot) : 0,
    margeBrute: r2(sum(rows, r => r.margeBrute)), impayes: r2(sum(ventes.filter(v => v.statut !== 'paye'), v => v.statut === 'partiel' ? v.montant / 2 : v.montant)),
  };
}
function caMensuel(camp) {
  const months = []; for (let i = 0; i < 12; i++) { const d = new Date(camp - 1, 7 + i, 1); months.push({ key: `${d.getFullYear()}-${pad(d.getMonth() + 1)}`, label: d.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', '') }); }
  return months.map(m => ({ label: m.label, ca: r2(sum(S.ventes.filter(v => v.date.startsWith(m.key)), v => v.montant)), ch: r2(sum(S.charges.filter(c => c.date.startsWith(m.key)), c => c.montant)) }));
}

/* ---------- Tâches : catégories, urgence, regroupement ---------- */
const TASK_CATS = {
  cultures: { label: 'Cultures', icon: 'sprout', color: 'var(--c-cult)' },
  materiel: { label: 'Matériel', icon: 'tractor', color: 'var(--c-mat)' },
  stocks: { label: 'Stocks', icon: 'box', color: 'var(--c-stock)' },
  ventes: { label: 'Ventes', icon: 'euro', color: 'var(--c-vente)' },
  admin: { label: 'Administratif', icon: 'landmark', color: 'var(--c-admin)' },
  documents: { label: 'Documents', icon: 'file', color: 'var(--c-doc)' },
};
const IV_ICON = { preparation: 'layers', travail_sol: 'shovel', semis: 'sprout', fertilisation: 'flask', desherbage: 'leaf', protection: 'shield', irrigation: 'droplet', recolte: 'wheat', autre: 'dots' };
function dueInfo(date) {
  const j = daysBetween(TODAY, date);
  if (j < 0) return { j, urgence: 'danger', groupe: 'retard', echeance: `En retard · ${-j} j` };
  if (j === 0) return { j, urgence: 'warn', groupe: 'jour', echeance: "Aujourd'hui" };
  if (j <= 7) return { j, urgence: 'warn', groupe: 'semaine', echeance: j === 1 ? 'Demain' : `Dans ${j} j` };
  return { j, urgence: 'ok', groupe: 'plus_tard', echeance: `Dans ${j} j` };
}
/** Liste des tâches à traiter, toutes catégories confondues (horizon en jours). */
function todoList(horizon = 21) {
  const out = [];
  S.interventions.filter(i => i.statut === 'planifiee').forEach(i => {
    const d = dueInfo(i.date); if (d.j > horizon) return;
    out.push({ kind: 'intervention', cat: 'cultures', icon: IV_ICON[i.type] || 'sprout', sub: INTER_TYPES[i.type], id: i.id, date: i.date, titre: `${i.label} — ${byId('parcelles', i.parcelleId)?.nom}`, detail: `${fmtQ(i.surface)} ha${i.produits.length ? ' · ' + i.produits.map(x => byId('stock', x.itemId)?.nom).filter(Boolean).join(', ') : ''}`, action: 'Valider', ...d });
  });
  S.materiel.forEach(m => {
    const n = nextMaintenance(m); if (!n) return;
    let d;
    if (n.heures != null) { const reste = n.heures - m.heures; if (reste > 80) return; d = { j: 0, urgence: reste <= 0 ? 'danger' : 'warn', groupe: reste <= 0 ? 'retard' : 'semaine', echeance: reste <= 0 ? `Dépassé · ${fmtQ(-reste)} h` : `Dans ${fmtQ(reste)} h` }; }
    else { d = dueInfo(n.date); if (d.j > horizon) return; }
    out.push({ kind: 'maintenance', cat: 'materiel', icon: n.type === 'controle' ? 'check' : 'wrench', sub: MAINT_TYPES[n.type] || 'Entretien', id: m.id, date: n.date || TODAY, titre: n.label, detail: `${m.marque} ${m.modele}`, action: 'Saisir', ...d });
  });
  S.stock.filter(i => i.cat !== 'production' && i.seuil > 0 && i.qte <= i.seuil).forEach(i => out.push({ kind: 'stock', cat: 'stocks', icon: 'box', sub: 'Réapprovisionnement', id: i.id, date: TODAY, titre: i.nom, detail: `${fmtQ(i.qte)} ${i.unite} restants · seuil ${fmtQ(i.seuil)} ${i.unite}`, action: 'Commander', j: 0, urgence: i.qte <= 0 ? 'danger' : 'warn', groupe: i.qte <= 0 ? 'retard' : 'jour', echeance: i.qte <= 0 ? 'Épuisé' : 'Stock faible' }));
  S.ventes.filter(v => v.statut !== 'paye').forEach(v => { const age = daysBetween(v.date, TODAY); const due = addDays(v.date, 30); const d = dueInfo(due); out.push({ kind: 'encaissement', cat: 'ventes', icon: 'euro', sub: 'Encaissement', id: v.id, date: due, titre: `${v.facture} — ${v.acheteur}`, detail: `${fmtQ(v.montant)} € · ${v.statut === 'partiel' ? 'règlement partiel' : 'facturée il y a ' + age + ' j'}`, action: 'Encaissé', ...d, echeance: d.j < 0 ? `Échue · ${-d.j} j` : d.echeance }); });
  S.echeances.filter(e => !e.fait).forEach(e => { const d = dueInfo(e.date); if (d.j > Math.max(horizon, 120)) return; out.push({ kind: 'echeance', cat: e.cat === 'Matériel' ? 'materiel' : 'admin', icon: e.cat === 'PAC' ? 'landmark' : 'calendar', sub: e.cat, id: e.id, date: e.date, titre: e.titre, detail: e.note || '', action: 'Fait', ...d }); });
  S.documents.filter(d => d.statut === 'a_completer').forEach(d => out.push({ kind: 'document', cat: 'documents', icon: 'file', sub: d.cat, id: d.id, date: TODAY, titre: d.nom, detail: 'Document à compléter', action: 'Ouvrir', j: 0, urgence: 'warn', groupe: 'jour', echeance: 'À compléter' }));
  const rank = { danger: 0, warn: 1, ok: 2 };
  return out.sort((a, b) => rank[a.urgence] - rank[b.urgence] || a.date.localeCompare(b.date));
}

/* ---------- Recherche globale ---------- */
function globalSearch(q) {
  q = norm(q).trim(); if (q.length < 2) return [];
  const res = [];
  const hit = s => norm(s).includes(q);
  S.parcelles.forEach(p => { if (hit(p.nom) || hit(p.commune) || hit(CULTURES[p.cultures[CURRENT_CAMP]?.culture]?.nom)) res.push({ kind: 'parcelle', id: p.id, titre: p.nom, sub: `${fmtQ(p.surface)} ha · ${p.commune}` }); });
  S.stock.forEach(i => { if (hit(i.nom) || hit(i.lot) || hit(i.emplacement)) res.push({ kind: 'stock', id: i.id, titre: i.nom, sub: `${fmtQ(i.qte)} ${i.unite} · ${i.emplacement}` }); });
  S.materiel.forEach(m => { if (hit(`${m.marque} ${m.modele}`) || hit(m.immat) || hit(MAT_CATS[m.cat])) res.push({ kind: 'materiel', id: m.id, titre: `${m.marque} ${m.modele}`, sub: `${MAT_CATS[m.cat]} · ${m.annee}` }); });
  S.ventes.forEach(v => { if (hit(v.facture) || hit(v.acheteur) || hit(v.produit)) res.push({ kind: 'vente', id: v.id, titre: `${v.facture} — ${v.produit}`, sub: `${v.acheteur} · ${v.date}` }); });
  S.documents.forEach(d => { if (hit(d.nom) || hit(d.cat)) res.push({ kind: 'document', id: d.id, titre: d.nom, sub: d.cat }); });
  S.interventions.forEach(i => { if (hit(i.label) && res.length < 60) res.push({ kind: 'intervention', id: i.id, titre: `${i.label} — ${byId('parcelles', i.parcelleId)?.nom}`, sub: `${i.date} · ${i.statut === 'realisee' ? 'réalisée' : 'planifiée'}` }); });
  return res.slice(0, 40);
}

/* =====================================================================
   GÉNÉRATEUR DE DONNÉES DE DÉMONSTRATION
   Exploitation fictive. Les quantités de stock résultent du rejeu des
   achats, interventions, récoltes et ventes : elles sont donc vérifiables.
   ===================================================================== */
function seedDemo() {
  const st = {
    version: 1, demo: true, createdAt: TODAY, seq: { facture: 0 },
    exploitation: {
      nom: 'EARL des Trois Chênes', forme: 'EARL', siret: '000 000 000 00000', pacage: '028000000', exploitant: 'Paul Martin',
      adresse: 'Ferme des Trois Chênes, 28800 Bonneval', telephone: '00 00 00 00 00', email: 'contact@exemple.fr',
      certification: 'HVE (démo)', mainOeuvre: [{ nom: 'Paul Martin', role: 'Exploitant', taux: 0 }, { nom: 'Julien Robert', role: 'Salarié agricole (CDI)', taux: 22.5 }, { nom: 'Saisonnier', role: 'Renfort moisson / arrachage', taux: 18 }],
    },
    users: [
      { id: 'u1', nom: 'Paul Martin', email: 'paul@exemple.fr', role: 'Administrateur' },
      { id: 'u2', nom: 'Julien Robert', email: 'julien@exemple.fr', role: 'Saisie terrain' },
      { id: 'u3', nom: 'Cabinet comptable', email: 'compta@exemple.fr', role: 'Lecture seule' },
    ],
    parcelles: [], interventions: [], stock: [], mouvements: [], ventes: [], charges: [], materiel: [], cours: {}, itk: {}, favoris: [], documents: [], echeances: [],
    pac: { campagnes: {}, checklist: {} },
  };
  S = st;
  const R = rng(20261107);

  /* ---- Intrants (stock de départ à zéro : tout est acheté au fil des besoins) ---- */
  const INTR = [
    ['sem_ble', 'Semence blé tendre certifiée R2', 'semences', 'kg', 0.62, 4000, 1500, 'Hangar semences', 'Coopérative Beauce Céréales'],
    ['sem_bledur', 'Semence blé dur certifiée', 'semences', 'kg', 0.86, 4000, 0, 'Hangar semences', 'Coopérative Beauce Céréales'],
    ['sem_orge', "Semence orge d'hiver", 'semences', 'kg', 0.68, 4000, 800, 'Hangar semences', 'Coopérative Beauce Céréales'],
    ['sem_orgep', 'Semence orge de printemps', 'semences', 'kg', 0.66, 1000, 0, 'Hangar semences', 'Négoce Durand & Fils'],
    ['sem_colza', 'Semence colza hybride', 'semences', 'kg', 58, 25, 0, 'Hangar semences', 'Coopérative Beauce Céréales'],
    ['sem_mais', 'Semence maïs (dose 50 000 grains)', 'semences', 'dose', 105, 10, 0, 'Hangar semences', 'Négoce Durand & Fils'],
    ['sem_pois', 'Semence pois protéagineux', 'semences', 'kg', 0.78, 1000, 0, 'Hangar semences', 'Négoce Durand & Fils'],
    ['sem_pdt', 'Plants de pommes de terre', 'semences', 't', 620, 1, 0, 'Bâtiment frigo', 'Féculerie Val de Loire'],
    ['eng_amm', 'Ammonitrate 33,5 %', 'engrais', 'kg', 0.46, 12000, 6000, 'Hangar engrais', 'Coopérative Beauce Céréales'],
    ['eng_sol', 'Solution azotée 39', 'engrais', 'kg', 0.38, 6000, 0, 'Cuve 30 m³', 'Négoce Durand & Fils'],
    ['eng_dap', 'DAP 18-46', 'engrais', 'kg', 0.70, 3000, 2000, 'Hangar engrais', 'Coopérative Beauce Céréales'],
    ['eng_kcl', 'Chlorure de potasse 60', 'engrais', 'kg', 0.40, 3000, 0, 'Hangar engrais', 'Coopérative Beauce Céréales'],
    ['phy_herb_cer', 'Herbicide céréales (produit démo)', 'phyto', 'L', 36, 50, 40, 'Local phytosanitaire', 'Coopérative Beauce Céréales'],
    ['phy_herb_col', 'Herbicide colza (produit démo)', 'phyto', 'L', 44, 20, 0, 'Local phytosanitaire', 'Coopérative Beauce Céréales'],
    ['phy_herb_mais', 'Herbicide maïs / PdT (produit démo)', 'phyto', 'L', 29, 20, 0, 'Local phytosanitaire', 'Négoce Durand & Fils'],
    ['phy_fong', 'Fongicide céréales (produit démo)', 'phyto', 'L', 52, 40, 0, 'Local phytosanitaire', 'Coopérative Beauce Céréales'],
    ['phy_fong_pdt', 'Fongicide mildiou (produit démo)', 'phyto', 'L', 31, 40, 0, 'Local phytosanitaire', 'Négoce Durand & Fils'],
    ['phy_insect', 'Insecticide (produit démo)', 'phyto', 'L', 24, 10, 4, 'Local phytosanitaire', 'Coopérative Beauce Céréales'],
    ['phy_reg', 'Régulateur de croissance (produit démo)', 'phyto', 'L', 17, 20, 0, 'Local phytosanitaire', 'Coopérative Beauce Céréales'],
    ['amd_chaux', 'Amendement calcique', 'amendements', 't', 48, 30, 0, 'Plateforme', 'Négoce Durand & Fils'],
    ['gnr', 'GNR (gazole non routier)', 'carburants', 'L', 1.12, 5000, 2500, 'Cuve GNR 10 m³', 'Distributeur carburant local'],
  ];
  INTR.forEach(([id, nom, cat, unite, prix, batch, seuil, emplacement, fournisseur]) => st.stock.push({ id, nom, cat, unite, qte: 0, pmp: prix, basePrix: prix, batch, seuil, emplacement, fournisseur, lot: cat === 'phyto' || cat === 'semences' ? `L${Math.floor(R() * 90000 + 10000)}` : '', dateEntree: '2024-08-01' }));

  /* ---- Matériel ---- */
  const MAT = [
    ['t1', 'tracteur', 'John Deere', '6R 155', 2019, '1L06155RLKP904512', 'GH-512-KT', 3700, 155, '2019-03-12', 168000, 14, 650, 'bon', 10],
    ['t2', 'tracteur', 'Fendt', '724 Vario', 2021, 'WAM72400LMF00218', 'FX-218-BD', 2300, 240, '2021-02-20', 236000, 18, 600, 'excellent', 10],
    ['t3', 'tracteur', 'Claas', 'Arion 420', 2014, 'A2900321', 'CQ-731-LM', 8250, 105, '2014-09-05', 76000, 8, 450, 'moyen', 10],
    ['mb', 'moissonneuse', 'Claas', 'Lexion 6700', 2018, 'C7600412', '', 1450, 408, '2018-06-15', 395000, 30, 170, 'bon', 12],
    ['pulve', 'pulverisateur', 'Amazone', 'UX 5201 Super 36 m', 2020, 'UX5201-2087', '', 0, null, '2020-02-01', 98000, 0, 220, 'bon', 10],
    ['semoir', 'semoir', 'Väderstad', 'Rapid A 600S', 2017, 'RD600-17-3311', '', 0, null, '2017-08-10', 72000, 0, 140, 'bon', 10],
    ['dech', 'dechaumeur', 'Horsch', 'Joker 6 RT', 2016, 'JK6RT-2016-118', '', 0, null, '2016-07-01', 48000, 0, 130, 'moyen', 10],
    ['charrue', 'charrue', 'Kuhn', 'Multi-Master 153 (5 corps)', 2015, 'KMM153-5521', '', 0, null, '2015-02-15', 32000, 0, 90, 'moyen', 10],
    ['rem', 'remorque', 'Brimont', 'BB 18 t', 2012, 'BB18-12-0417', 'AB-118-RT', 0, null, '2012-06-01', 26000, 0, 200, 'moyen', 15],
    ['manit', 'manutention', 'Manitou', 'MLT 737-130 PS+', 2020, 'MLT737-20-88412', 'FB-604-QZ', 2380, 130, '2020-05-14', 82000, 7, 380, 'bon', 10],
    ['epand', 'divers', 'Amazone', 'ZA-TS 3200 (épandeur)', 2019, 'ZATS-3200-1907', '', 0, null, '2019-01-20', 22000, 0, 60, 'bon', 10],
    ['arr', 'divers', 'Grimme', 'SE 150-60 (arracheuse)', 2016, 'GR-SE150-16-221', '', 0, null, '2016-04-01', 118000, 0, 60, 'bon', 12],
    ['irrig', 'divers', 'Irrifrance', 'Enrouleur 110/400', 2017, 'IF-110-17-5530', '', 0, null, '2017-04-15', 24000, 0, 120, 'bon', 12],
  ];
  MAT.forEach(([id, cat, marque, modele, annee, serie, immat, heures, puissance, dateAchat, prixAchat, conso, heuresAn, etat, dureeAmort]) => st.materiel.push({ id, cat, marque, modele, annee, serie, immat, heures, puissance, dateAchat, prixAchat, conso, heuresAn, etat, dureeAmort, valeurManuelle: null, maintenance: [], prochain: null, historiqueValeur: [], heuresUsage: 0 }));

  /* ---- Itinéraires techniques types (dose / ha, heures / ha, décalage en jours / semis) ---- */
  const T = (type, label, off, prod, mat, hHa) => ({ id: uid('stp'), type, label, off, produits: prod.map(([itemId, dose]) => ({ itemId, dose })), materiels: mat, hHa });
  const cereale = (sem, dose, rec, azote = [150, 220]) => [
    T('travail_sol', 'Déchaumage', -35, [], ['t2', 'dech'], 0.22),
    T('semis', 'Semis', 0, [[sem, dose]], ['t2', 'semoir'], 0.28),
    T('desherbage', "Désherbage d'automne", 18, [['phy_herb_cer', 1.0]], ['t1', 'pulve'], 0.1),
    T('fertilisation', 'Apport azote 1 (tallage)', 125, [['eng_amm', azote[0]]], ['t3', 'epand'], 0.07),
    T('fertilisation', 'Apport azote 2 (épi 1 cm)', 165, [['eng_amm', azote[1]]], ['t3', 'epand'], 0.07),
    T('protection', 'Régulateur', 170, [['phy_reg', 0.6]], ['t1', 'pulve'], 0.1),
    T('protection', 'Fongicide T2', 205, [['phy_fong', 0.8]], ['t1', 'pulve'], 0.1),
    T('recolte', 'Moisson', rec, [], ['mb', 't3', 'rem'], 0.4),
  ];
  st.itk = {
    ble_tendre: { culture: 'ble_tendre', semisType: '10-18', steps: cereale('sem_ble', 150, 268) },
    ble_dur: { culture: 'ble_dur', semisType: '10-28', steps: cereale('sem_bledur', 180, 262, [160, 240]) },
    orge_h: { culture: 'orge_h', semisType: '10-05', steps: cereale('sem_orge', 140, 268, [120, 150]) },
    orge_p: {
      culture: 'orge_p', semisType: '03-08', steps: [
        T('travail_sol', 'Labour', -60, [], ['t2', 'charrue'], 0.8),
        T('semis', 'Semis', 0, [['sem_orgep', 130]], ['t2', 'semoir'], 0.28),
        T('fertilisation', 'Apport azote', 20, [['eng_amm', 200]], ['t3', 'epand'], 0.07),
        T('desherbage', 'Désherbage', 25, [['phy_herb_cer', 1.0]], ['t1', 'pulve'], 0.1),
        T('protection', 'Fongicide', 70, [['phy_fong', 0.6]], ['t1', 'pulve'], 0.1),
        T('recolte', 'Moisson', 132, [], ['mb', 't3', 'rem'], 0.4),
      ]
    },
    colza: {
      culture: 'colza', semisType: '08-27', steps: [
        T('travail_sol', 'Déchaumage', -10, [], ['t2', 'dech'], 0.22),
        T('fertilisation', 'Fumure de fond DAP', -1, [['eng_dap', 100]], ['t3', 'epand'], 0.07),
        T('semis', 'Semis', 0, [['sem_colza', 2.5]], ['t2', 'semoir'], 0.28),
        T('desherbage', 'Désherbage post-semis', 2, [['phy_herb_col', 1.5]], ['t1', 'pulve'], 0.1),
        T('protection', 'Insecticide altises', 30, [['phy_insect', 0.2]], ['t1', 'pulve'], 0.1),
        T('fertilisation', 'Apport azote 1', 172, [['eng_amm', 200]], ['t3', 'epand'], 0.07),
        T('fertilisation', 'Apport azote 2', 200, [['eng_amm', 150]], ['t3', 'epand'], 0.07),
        T('protection', 'Fongicide floraison', 240, [['phy_fong', 0.7]], ['t1', 'pulve'], 0.1),
        T('recolte', 'Moisson', 318, [], ['mb', 't3', 'rem'], 0.38),
      ]
    },
    mais: {
      culture: 'mais', semisType: '04-24', steps: [
        T('travail_sol', 'Labour', -30, [], ['t2', 'charrue'], 0.8),
        T('preparation', 'Reprise de labour', -3, [], ['t2', 'dech'], 0.25),
        T('fertilisation', 'Fumure de fond DAP', -2, [['eng_dap', 150]], ['t3', 'epand'], 0.07),
        T('semis', 'Semis monograine', 0, [['sem_mais', 2]], ['t1', 'semoir'], 0.3),
        T('desherbage', 'Désherbage post-levée', 20, [['phy_herb_mais', 2.0]], ['t1', 'pulve'], 0.1),
        T('fertilisation', 'Apport azote (solution)', 45, [['eng_sol', 200]], ['t1', 'pulve'], 0.1),
        T('irrigation', 'Irrigation tour 1 (30 mm)', 70, [], ['irrig', 't3'], 0.15),
        T('irrigation', 'Irrigation tour 2 (30 mm)', 85, [], ['irrig', 't3'], 0.15),
        T('irrigation', 'Irrigation tour 3 (25 mm)', 100, [], ['irrig', 't3'], 0.15),
        T('recolte', 'Récolte maïs grain', 165, [], ['mb', 't3', 'rem'], 0.45),
      ]
    },
    pois: {
      culture: 'pois', semisType: '03-04', steps: [
        T('travail_sol', 'Labour', -40, [], ['t2', 'charrue'], 0.8),
        T('semis', 'Semis', 0, [['sem_pois', 210]], ['t2', 'semoir'], 0.28),
        T('desherbage', 'Désherbage pré-levée', 3, [['phy_herb_cer', 1.0]], ['t1', 'pulve'], 0.1),
        T('protection', 'Insecticide pucerons', 60, [['phy_insect', 0.15]], ['t1', 'pulve'], 0.1),
        T('protection', 'Fongicide', 80, [['phy_fong', 0.6]], ['t1', 'pulve'], 0.1),
        T('recolte', 'Moisson', 125, [], ['mb', 't3', 'rem'], 0.4),
      ]
    },
    pdt: {
      culture: 'pdt', semisType: '04-08', steps: [
        T('travail_sol', 'Labour', -45, [], ['t2', 'charrue'], 0.8),
        T('fertilisation', 'Potasse', -6, [['eng_kcl', 300]], ['t3', 'epand'], 0.07),
        T('fertilisation', 'Azote', -3, [['eng_amm', 350]], ['t3', 'epand'], 0.07),
        T('semis', 'Plantation', 0, [['sem_pdt', 2.5]], ['t2'], 0.9),
        T('desherbage', 'Désherbage', 10, [['phy_herb_mais', 1.5]], ['t1', 'pulve'], 0.1),
        T('protection', 'Fongicide mildiou 1', 50, [['phy_fong_pdt', 2.0]], ['t1', 'pulve'], 0.1),
        T('protection', 'Fongicide mildiou 2', 64, [['phy_fong_pdt', 2.0]], ['t1', 'pulve'], 0.1),
        T('protection', 'Fongicide mildiou 3', 78, [['phy_fong_pdt', 2.0]], ['t1', 'pulve'], 0.1),
        T('recolte', 'Arrachage', 152, [], ['t2', 'arr', 'rem'], 2.0),
      ]
    },
    prairie: { culture: 'prairie', semisType: '03-01', steps: [T('fertilisation', 'Fertilisation prairie', 0, [['eng_amm', 100]], ['t3', 'epand'], 0.07)] },
  };

  /* ---- Parcelles (géométrie fictive autour de Bonneval, 28) ---- */
  const LAT0 = 48.182, LNG0 = 1.385;
  const P = [
    // id, nom, ha, commune, sol, x km, y km, angle, {campagne: [culture, variété, rdt réel, rdt prév]}, ref cadastrale, îlot, statut
    ['p1', 'La Grande Pièce', 24.5, 'Bonneval', 'Limon argileux', 0, 0, 12, { 2023: ['ble_tendre', '', 8.9], 2024: ['orge_h', '', 6.8], 2025: ['colza', 'Hybride A', 3.8], 2026: ['ble_tendre', 'Chevignon', 8.4], 2027: ['orge_h', 'KWS Faro', null, 7.5] }, 'ZA 12', 1, 'propriete'],
    ['p2', 'Les Sablons', 18.2, 'Bonneval', 'Sable limoneux', 0.95, 0.25, -8, { 2024: ['colza', '', 3.4], 2025: ['ble_tendre', 'Chevignon', 7.9], 2026: ['orge_h', 'KWS Faro', 7.6], 2027: ['colza', 'Hybride A', null, 3.7] }, 'ZA 18', 1, 'fermage'],
    ['p3', 'Champ du Moulin', 15.8, 'Montboissier', 'Limon argileux', -0.85, 0.55, 20, { 2024: ['ble_tendre', '', 8.6], 2025: ['orge_h', 'KWS Faro', 7.1], 2026: ['colza', 'Hybride A', 3.9], 2027: ['ble_tendre', 'Chevignon', null, 8.5] }, 'ZB 4', 2, 'propriete'],
    ['p4', 'La Croix Blanche', 21.0, 'Bonneval', 'Argilo-calcaire', 0.2, -0.95, 5, { 2024: ['ble_tendre', '', 8.1], 2025: ['mais', 'Grain demi-précoce', 10.6], 2026: ['ble_dur', 'Anvergur', 6.9], 2027: ['ble_tendre', 'Chevignon', null, 8.2] }, 'ZC 7', 3, 'fermage', { 2027: '11-12' }],
    ['p5', 'Les Noues', 12.4, 'Saumeray', 'Limon profond', 1.25, -0.75, -15, { 2024: ['colza', '', 3.5], 2025: ['ble_tendre', 'Chevignon', 8.3], 2026: ['mais', 'Grain demi-précoce', 11.2], 2027: ['pois', 'Printemps', null, 4.5] }, 'ZD 21', 4, 'fermage'],
    ['p6', 'Le Bois Joli', 9.6, 'Montboissier', 'Limon battant', -0.95, -0.6, 30, { 2024: ['orge_h', '', 7.0], 2025: ['ble_tendre', 'Chevignon', 8.0], 2026: ['pdt', 'Fontane', 45], 2027: ['ble_tendre', 'Chevignon', null, 8.6] }, 'ZB 19', 2, 'propriete', { 2027: '10-25' }],
    ['p7', 'Les Longues Raies', 19.3, 'Dancy', 'Limon argileux', 2.05, 0.15, -5, { 2024: ['ble_tendre', '', 8.4], 2025: ['colza', 'Hybride A', 3.6], 2026: ['ble_tendre', 'Chevignon', 8.1], 2027: ['orge_h', 'KWS Faro', null, 7.4] }, 'ZE 2', 5, 'fermage'],
    ['p8', 'La Mare aux Loups', 14.7, 'Dancy', 'Argilo-calcaire', 1.95, -0.95, 18, { 2024: ['orge_h', '', 6.6], 2025: ['ble_tendre', 'Chevignon', 7.6], 2026: ['pois', 'Printemps', 4.2], 2027: ['colza', 'Hybride A', null, 3.6] }, 'ZE 9', 5, 'fermage'],
    ['p9', 'Le Petit Clos', 6.3, 'Bonneval', 'Limon battant', -1.6, -0.05, 0, { 2024: ['ble_tendre', '', 7.8], 2025: ['colza', 'Hybride A', 3.3], 2026: ['orge_p', 'RGT Planet', 6.5], 2027: ['mais', 'Grain demi-précoce', null, 10.5] }, 'ZA 31', 6, 'propriete'],
    ['p10', 'Le Haut Chemin', 22.8, 'Montboissier', 'Limon argileux', 0.45, 1.15, -10, { 2024: ['orge_h', '', 7.2], 2025: ['ble_tendre', 'Chevignon', 8.5], 2026: ['colza', 'Hybride A', 3.6], 2027: ['ble_tendre', 'Chevignon', null, 8.4] }, 'ZB 1', 2, 'fermage'],
    ['p11', 'La Prairie du Ru', 8.4, 'Saumeray', 'Alluvions', -1.65, -1.05, 25, { 2024: ['prairie', '', null], 2025: ['prairie', '', null], 2026: ['prairie', '', null], 2027: ['prairie', '', null] }, 'ZD 3', 7, 'propriete'],
    ['p12', 'Les Terres Rouges', 13.0, 'Dancy', 'Argilo-calcaire', 1.55, 1.05, 8, { 2024: ['ble_tendre', '', 8.2], 2025: ['pois', 'Printemps', 4.6], 2026: ['ble_tendre', 'Chevignon', 7.9], 2027: ['mais', 'Grain demi-précoce', null, 10.2] }, 'ZE 14', 5, 'fermage'],
  ];
  const cosL = Math.cos(LAT0 * Math.PI / 180);
  P.forEach(([id, nom, ha, commune, sol, x, y, ang, cult, cad, ilot, statut, semisOv]) => {
    const A = ha * 10000, ar = 1.55 + R() * 0.4, w = Math.sqrt(A * ar), h = A / w, a = ang * Math.PI / 180;
    const pts = [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]].map(([px, py], i) => {
      const j = 1 + (R() - 0.5) * 0.05; px *= j; py *= j;
      const rx = px * Math.cos(a) - py * Math.sin(a), ry = px * Math.sin(a) + py * Math.cos(a);
      const mx = x * 1000 + rx, my = y * 1000 + ry;
      return [r2(LAT0 + my / 110540, 6), r2(LNG0 + mx / (111320 * cosL), 6)];
    });
    const cultures = {};
    Object.entries(cult).forEach(([camp, [c, variete, rdtReel, rdtPrev]]) => {
      camp = +camp;
      const it = st.itk[c];
      const md = (semisOv && semisOv[camp]) || it.semisType;
      const yr = +md.slice(0, 2) >= 8 ? camp - 1 : camp;
      const semis = `${yr}-${md}`;
      const recStep = it.steps.find(s => s.type === 'recolte');
      cultures[camp] = { culture: c, variete, semis, recoltePrev: recStep ? addDays(semis, recStep.off) : null, rdtPrev: rdtPrev ?? (rdtReel ? r2(rdtReel * (0.95 + R() * 0.1), 1) : null), rdtReel: camp < 2025 ? rdtReel : null, _rdtCible: rdtReel };
    });
    const cur = cultures[CURRENT_CAMP] || cultures[2027];
    st.parcelles.push({ id, nom, surface: ha, cadastre: cad, commune, sol, coords: pts, centre: [r2(LAT0 + y * 1000 / 110540, 5), r2(LNG0 + x * 1000 / (111320 * cosL), 5)], cultures, ilot, numPac: null, statutFoncier: statut, statut: cur && daysBetween(cur.semis, TODAY) >= 0 ? 'en_culture' : 'interculture', notes: '' });
  });
  // numéros PAC par îlot
  const cnt = {}; st.parcelles.forEach(p => { cnt[p.ilot] = (cnt[p.ilot] || 0) + 1; p.numPac = `${p.ilot}.${cnt[p.ilot]}`; });

  /* ---- Interventions générées à partir des ITK ---- */
  st.parcelles.forEach(p => {
    [2025, 2026, 2027].forEach(camp => {
      const rec = p.cultures[camp]; if (!rec) return;
      st.itk[rec.culture].steps.forEach(sp => {
        const date = addDays(rec.semis, sp.off);
        const realise = date <= TODAY;
        const iv = { id: uid('iv'), campagne: camp, parcelleId: p.id, date, type: sp.type, label: sp.label, statut: 'planifiee', surface: p.surface, produits: sp.produits.map(x => ({ ...x })), materiels: [...sp.materiels], heures: r2(sp.hHa * p.surface, 1), mo: sp.type === 'recolte' ? 'Paul Martin, Julien Robert' : (R() > 0.5 ? 'Paul Martin' : 'Julien Robert'), meteo: realise ? ['Ensoleillé, 14 °C, vent faible', 'Couvert, 9 °C, sans vent', 'Éclaircies, 17 °C, vent 10 km/h', 'Sec, 22 °C'][Math.floor(R() * 4)] : '', obs: '', photos: [], fromItk: true };
        if (sp.type === 'recolte' && rec._rdtCible) iv.recolteQte = r2(rec._rdtCible * p.surface, 2);
        if (!realise) iv.recolteQte = undefined;
        iv._realise = realise;
        st.interventions.push(iv);
      });
    });
  });
  st.interventions.sort((a, b) => a.date.localeCompare(b.date));
  st.interventions.forEach(iv => { const r = iv._realise; delete iv._realise; if (r) applyIntervention(iv, { autoBuy: true }); });
  st.parcelles.forEach(p => Object.values(p.cultures).forEach(c => delete c._rdtCible));
  // Commandes déjà passées pour les interventions des 3 prochaines semaines
  const besoins = {};
  st.interventions.filter(i => i.statut === 'planifiee' && daysBetween(TODAY, i.date) <= 21).forEach(i => i.produits.forEach(x => { besoins[x.itemId] = (besoins[x.itemId] || 0) + x.dose * i.surface; }));
  Object.entries(besoins).forEach(([id, q]) => { const it = byId('stock', id); if (it.qte < q) { const b = it.batch || 1; recordPurchase({ itemId: id, qte: Math.ceil((q - it.qte) / b) * b, prixUnit: it.basePrix, date: addDays(TODAY, -6), campagne: CURRENT_CAMP, fournisseur: it.fournisseur }); } });

  /* ---- Charges de structure (montants fictifs) ---- */
  const fix = (date, camp, cat, libelle, montant, fournisseur = '') => st.charges.push({ id: uid('ch'), date, campagne: camp, cat, libelle, montant, fournisseur });
  [[2025, 1.0], [2026, 1.025], [2027, 1.05]].forEach(([c, f]) => {
    const y = c - 1;
    if (`${y}-11-11` <= TODAY) fix(`${y}-11-11`, c, 'fermages', 'Fermages (113,5 ha en location)', r2(113.5 * 158 * f), 'Propriétaires bailleurs');
    if (`${y}-09-15` <= TODAY) fix(`${y}-09-15`, c, 'assurances', 'Assurance multirisque climatique', r2(7400 * f), 'Assureur (démo)');
    if (`${y}-09-15` <= TODAY) fix(`${y}-09-15`, c, 'assurances', 'Assurance bâtiments & responsabilité civile', r2(2650 * f), 'Assureur (démo)');
    [`${y}-10-31`, `${c}-01-31`, `${c}-04-30`, `${c}-07-31`].forEach((d, i) => { if (d <= TODAY) fix(d, c, 'main_oeuvre', `Salaire & charges — trimestre ${i + 1}`, r2(8150 * f), 'Julien Robert'); });
    if (`${c}-07-25` <= TODAY) fix(`${c}-07-25`, c, 'main_oeuvre', 'Saisonnier moisson', r2(2600 * f), 'Saisonnier');
    if (`${y}-12-15` <= TODAY) fix(`${y}-12-15`, c, 'divers', 'Honoraires comptables & centre de gestion', r2(2700 * f), 'Cabinet comptable');
    if (`${c}-03-20` <= TODAY) fix(`${c}-03-20`, c, 'divers', 'Électricité & eau', r2(2100 * f), 'Fournisseur énergie');
    if (`${c}-02-10` <= TODAY) fix(`${c}-02-10`, c, 'prestations', 'Analyses de sol & reliquats azotés', r2(640 * f), 'Laboratoire (démo)');
    if (`${y}-08-30` <= TODAY) fix(`${y}-08-30`, c, 'prestations', 'ETA — chaulage', r2(2350 * f), 'ETA du Loir (démo)');
  });
  // séchage du maïs (rattaché à la campagne de la culture)
  st.interventions.filter(i => i.type === 'recolte' && i.statut === 'realisee' && byId('parcelles', i.parcelleId).cultures[i.campagne].culture === 'mais').forEach(i => fix(addDays(i.date, 5), i.campagne, 'prestations', `Séchage maïs — ${fmtQ(i.recolteQte)} t`, r2(i.recolteQte * 19), 'Coopérative Beauce Céréales'));

  /* ---- Entretiens matériel ---- */
  const MT = {
    t1: [['2025-01-14', 'vidange', 'Vidange moteur 3 000 h', 'Huile 15W40 22 L, filtre huile, filtre GO', 'Atelier exploitation', 420, 0, 0], ['2025-11-20', 'entretien', 'Révision annuelle', 'Kit filtres, graissage, contrôle hydraulique', 'Concession Agri-Services 28 (démo)', 980, 640, 1], ['2026-05-03', 'reparation', 'Fuite vérin de relevage', 'Joints vérin, flexible HP', 'Concession Agri-Services 28 (démo)', 310, 380, 2], ['2026-09-10', 'pneumatiques', 'Pneus avant 600/65R28', '2 pneumatiques', 'Pneus Service Beauce (démo)', 3900, 250, 1]],
    t2: [['2025-03-02', 'entretien', 'Révision 1 500 h', 'Kit révision constructeur', 'Concession Agri-Services 28 (démo)', 1650, 720, 1], ['2026-02-18', 'filtres', 'Filtres à air + habitacle', 'Filtre air primaire/secondaire, filtre cabine', 'Atelier exploitation', 240, 0, 0], ['2026-08-02', 'reparation', 'Capteur vitesse transmission', 'Capteur', 'Concession Agri-Services 28 (démo)', 540, 310, 1]],
    t3: [['2025-06-10', 'reparation', 'Démarreur hors service', 'Démarreur échange standard', 'Garage agricole Dupuis (démo)', 680, 260, 3], ['2026-01-22', 'vidange', 'Vidange moteur', 'Huile, filtre', 'Atelier exploitation', 260, 0, 0]],
    mb: [['2025-06-20', 'entretien', 'Préparation moisson 2025', 'Couteaux, sections, courroies, filtres', 'Concession Claas (démo)', 3200, 1400, 2], ['2025-07-18', 'reparation', 'Casse courroie batteur', 'Courroie batteur', 'Concession Claas (démo)', 890, 450, 2], ['2026-06-15', 'entretien', 'Préparation moisson 2026', 'Couteaux, sections, filtres', 'Concession Claas (démo)', 3450, 1500, 2], ['2026-07-22', 'reparation', 'Roulement rotor', 'Roulement + joints', 'Concession Claas (démo)', 1240, 880, 3]],
    pulve: [['2024-03-15', 'controle', 'Contrôle périodique pulvérisateur', 'Rapport de contrôle', 'Organisme d’inspection agréé (démo)', 0, 290, 0], ['2026-03-01', 'entretien', 'Buses anti-dérive', 'Jeu de 72 buses', 'Atelier exploitation', 620, 0, 0]],
    semoir: [['2025-08-05', 'entretien', 'Disques semeurs', 'Disques + roulements', 'Atelier exploitation', 1850, 0, 1]],
    dech: [['2026-07-30', 'entretien', 'Remplacement disques', '48 disques', 'Atelier exploitation', 2100, 0, 1]],
    charrue: [['2025-02-10', 'entretien', "Pièces d'usure", 'Socs, pointes, versoirs', 'Atelier exploitation', 760, 0, 0]],
    rem: [['2025-09-12', 'pneumatiques', 'Pneumatiques', '2 pneus', 'Pneus Service Beauce (démo)', 1200, 0, 0], ['2026-04-08', 'reparation', 'Freinage', 'Garnitures, tambours', 'Garage agricole Dupuis (démo)', 340, 420, 2]],
    manit: [['2025-10-05', 'entretien', 'Révision 2 000 h', 'Kit révision', 'Concession Manitou (démo)', 880, 520, 1]],
    epand: [['2026-02-10', 'entretien', 'Pales et réglages', 'Pales', 'Atelier exploitation', 280, 0, 0]],
    arr: [['2026-03-20', 'entretien', 'Préparation saison', 'Tapis, roulements', 'Concession Grimme (démo)', 1450, 600, 1], ['2026-09-18', 'reparation', 'Chaîne tamiseur', 'Chaîne', 'Concession Grimme (démo)', 980, 350, 2]],
    irrig: [['2026-05-12', 'entretien', 'Révision turbine', 'Joints, roulements', 'Atelier exploitation', 320, 180, 1]],
  };
  Object.entries(MT).forEach(([mid, list]) => list.forEach(([date, type, titre, pieces, prestataire, coutPieces, coutMO, immobilisation]) => {
    if (date > TODAY) return;
    recordMaintenance(mid, { date, type, titre, description: '', pieces, prestataire, coutPieces, coutMO, immobilisation, photos: [], commentaire: '' });
  }));
  const M = id => byId('materiel', id);
  M('t1').prochain = { label: 'Vidange moteur (500 h)', type: 'vidange', heures: Math.round(M('t1').heures + 40) };
  M('t2').prochain = { label: 'Révision 3 000 h', type: 'entretien', heures: Math.round(M('t2').heures + 260) };
  M('t3').prochain = { label: 'Révision annuelle', type: 'entretien', date: addDays(TODAY, 12) };
  M('mb').prochain = { label: 'Préparation moisson', type: 'entretien', date: `${CURRENT_CAMP}-06-01` };
  M('pulve').prochain = { label: 'Contrôle périodique pulvérisateur (échéance à vérifier)', type: 'controle', date: '2027-03-15' };
  M('semoir').prochain = { label: 'Révision hivernale', type: 'entretien', date: addDays(TODAY, 38) };
  M('manit').prochain = { label: 'Vidange 2 500 h', type: 'vidange', heures: Math.round(M('manit').heures - 10) };
  M('rem').prochain = { label: 'Contrôle freinage', type: 'controle', date: addDays(TODAY, 95) };
  st.materiel.forEach(m => { m.historiqueValeur = [2024, 2025, 2026].filter(y => y >= m.annee).map(y => { const save = CURRENT_CAMP; return { date: `${y}-12-31`, valeur: Math.round(m.prixAchat * Math.pow(1 - ({ tracteur: 0.085, moissonneuse: 0.095, manutention: 0.1 }[m.cat] || 0.11), y - m.annee + 0.5) * (ETATS[m.etat] || 1) / 100) * 100, source: 'Estimation indicative' }; }).filter(h => h.date <= TODAY); });

  /* ---- Ventes (acheteurs fictifs) ---- */
  const B = { b1: 'Coopérative Beauce Céréales', b2: 'Négoce Durand & Fils', b3: 'Huilerie du Perche', b4: 'Féculerie Val de Loire' };
  const PLAN = {
    2025: { ble_tendre: [[0.4, '2025-07-22', 205, 'b1', 'paye'], [0.35, '2025-11-14', 198, 'b2', 'paye'], [1, '2026-03-10', 212, 'b1', 'paye']], orge_h: [[0.55, '2025-07-15', 182, 'b1', 'paye'], [1, '2025-12-03', 176, 'b2', 'paye']], colza: [[0.6, '2025-07-12', 472, 'b3', 'paye'], [1, '2025-10-20', 465, 'b3', 'paye']], mais: [[1, '2025-11-05', 192, 'b1', 'paye']], pois: [[1, '2025-08-12', 245, 'b1', 'paye']] },
    2026: { ble_tendre: [[0.35, '2026-07-25', 188, 'b1', 'paye'], [0.25, '2026-10-02', 194, 'b2', 'attente']], orge_h: [[0.5, '2026-07-16', 168, 'b1', 'paye']], colza: [[0.6, '2026-07-10', 458, 'b3', 'paye'], [0.25, '2026-09-21', 462, 'b3', 'partiel']], ble_dur: [[0.7, '2026-08-05', 262, 'b2', 'paye']], mais: [[0.3, '2026-10-28', 184, 'b1', 'attente']], pois: [[0.8, '2026-08-10', 228, 'b1', 'paye']], pdt: [[0.45, '2026-09-28', 145, 'b4', 'paye'], [0.2, '2026-10-30', 150, 'b4', 'attente']], orge_p: [[1, '2026-08-01', 176, 'b2', 'paye']] },
  };
  Object.entries(PLAN).forEach(([camp, cults]) => Object.entries(cults).forEach(([c, sales]) => {
    const it = st.stock.find(x => x.cat === 'production' && x.culture === c && x.campagne === +camp); if (!it) return;
    const total = it.qte;
    sales.forEach(([frac, date, prix, b, statut]) => {
      if (date > TODAY || it.qte <= 0) return;
      const q = frac === 1 ? it.qte : r2(Math.min(it.qte, total * frac), 2);
      recordSale({ itemId: it.id, qte: q, prix, acheteur: B[b], date, statut });
    });
  }));

  /* ---- Ajustements et achats complémentaires réalistes ---- */
  const gnr = byId('stock', 'gnr');
  if (gnr.qte > gnr.seuil) stockMove('gnr', 'perte', r2(gnr.qte - gnr.seuil * 0.8, 0), { date: addDays(TODAY, -20), motif: 'Consommation hors interventions (transport, cour de ferme)' });
  stockMove('phy_insect', 'perte', Math.min(byId('stock', 'phy_insect').qte, 2), { date: addDays(TODAY, -40), motif: 'Bidon endommagé' });

  /* ---- Cours de référence : SÉRIES DE DÉMONSTRATION (aucune source de marché connectée) ---- */
  const CO = { ble_tendre: ['Blé tendre', 191], orge: ['Orge fourragère', 172], colza: ['Colza', 458], mais: ['Maïs', 184], ble_dur: ['Blé dur', 264], pois: ['Pois protéagineux', 226], pdt: ['Pommes de terre (industrie)', 148] };
  Object.entries(CO).forEach(([k, [nom, end]], idx) => {
    const r = rng(1000 + idx); const pts = []; let p = end; let d = TODAY;
    for (let i = 0; i < 420; i++) {
      const wd = D(d).getDay();
      if (wd !== 0 && wd !== 6) { pts.push({ date: d, prix: r2(p, 2) }); p = p * (1 + (r() - 0.5) * 0.018 + (k === 'colza' ? 0.0001 : 0.0002)); }
      d = addDays(d, -1);
    }
    st.cours[k] = { nom, unite: '€/t', source: 'Série de démonstration (fictive)', type: 'demo', points: pts.reverse(), manuels: [] };
  });

  /* ---- Favoris / interventions récurrentes ---- */
  st.favoris = [
    { id: 'f1', label: 'Fongicide céréales 0,8 L/ha', type: 'protection', produits: [{ itemId: 'phy_fong', dose: 0.8 }], materiels: ['t1', 'pulve'], hHa: 0.1 },
    { id: 'f2', label: 'Ammonitrate 150 kg/ha', type: 'fertilisation', produits: [{ itemId: 'eng_amm', dose: 150 }], materiels: ['t3', 'epand'], hHa: 0.07 },
    { id: 'f3', label: 'Désherbage céréales 1 L/ha', type: 'desherbage', produits: [{ itemId: 'phy_herb_cer', dose: 1 }], materiels: ['t1', 'pulve'], hHa: 0.1 },
    { id: 'f4', label: 'Déchaumage', type: 'travail_sol', produits: [], materiels: ['t2', 'dech'], hHa: 0.22 },
  ];

  /* ---- Administratif & PAC ---- */
  st.pac.campagnes = {
    2025: { statut: 'declaree_exploitant', dateDepot: '2025-05-07', note: "Statut renseigné manuellement par l'exploitant. Aucune transmission par AGRI PILOT." },
    2026: { statut: 'declaree_exploitant', dateDepot: '2026-05-05', note: "Statut renseigné manuellement par l'exploitant. Aucune transmission par AGRI PILOT." },
    2027: { statut: 'preparation', dateDepot: null, note: 'Préparation en cours dans AGRI PILOT. Le dépôt se fait sur la plateforme officielle.' },
  };
  st.pac.checklist = { 2027: { parcelles: true, cultures: false, surfaces: false, justificatifs: false, export: false, depot: false } };
  st.echeances = [
    { id: 'e1', date: '2027-02-15', titre: 'Plan prévisionnel de fumure 2027', cat: 'Réglementaire', note: 'Date indicative (démo) — à vérifier selon le programme d’actions nitrates applicable.', fait: false },
    { id: 'e2', date: '2027-04-01', titre: 'Ouverture de la télédéclaration PAC 2027', cat: 'PAC', note: 'Date indicative (démo) — à confirmer avec le calendrier officiel.', fait: false },
    { id: 'e3', date: '2027-05-15', titre: 'Date limite de dépôt PAC 2027', cat: 'PAC', note: 'Date indicative (démo) — à confirmer avec le calendrier officiel.', fait: false },
    { id: 'e4', date: addDays(TODAY, 24), titre: 'Mise à jour du registre phytosanitaire', cat: 'Réglementaire', note: 'Vérifier que toutes les interventions phyto de la campagne sont saisies.', fait: false },
    { id: 'e5', date: '2027-03-15', titre: 'Contrôle périodique du pulvérisateur', cat: 'Matériel', note: 'Échéance indicative calculée depuis le dernier contrôle saisi.', fait: false },
    { id: 'e6', date: addDays(TODAY, 55), titre: 'Renouvellement Certiphyto — Julien Robert', cat: 'Réglementaire', note: 'Date fictive (démo).', fait: false },
  ];
  const DOCS = [
    ['Récépissé de dépôt PAC 2026', 'PAC', '2026-05-05', 2026, 'archive'], ['Récépissé de dépôt PAC 2025', 'PAC', '2025-05-07', 2025, 'archive'],
    ['Registre phytosanitaire 2026-2027', 'Réglementaire', '2026-09-01', 2027, 'a_completer'], ['Plan prévisionnel de fumure 2026', 'Réglementaire', '2026-02-10', 2026, 'archive'],
    ['Attestation assurance multirisque 2026-2027', 'Contrats', '2026-09-15', 2027, 'archive'], ['Baux ruraux (5 bailleurs)', 'Contrats', '2024-11-11', 2025, 'archive'],
    ['Rapport contrôle pulvérisateur', 'Matériel', '2024-03-15', 2024, 'archive'], ['Analyses de sol — Grande Pièce', 'Analyses', '2026-02-10', 2026, 'archive'],
    ['Certificat Certiphyto — Paul Martin', 'Réglementaire', '2023-06-20', 2023, 'archive'], ['Contrat de vente colza 2026', 'Contrats', '2026-06-02', 2026, 'archive'],
  ];
  st.documents = DOCS.map(([nom, cat, date, campagne, statut]) => ({ id: uid('doc'), nom, cat, date, campagne, statut, fichier: null, taille: null, demo: true }));

  st.mouvements.sort((a, b) => a.date.localeCompare(b.date));
  return st;
}

/* =====================================================================
   ASSISTANT (aperçu) — répond uniquement à partir des données enregistrées
   Moteur de règles déterministe ; l'IA générative est prévue à l'étape 7.
   ===================================================================== */
function assistantAnswer(q, camp) {
  const n = norm(q);
  const E = econ(camp);
  const cultureIn = () => { for (const [k, c] of Object.entries(CULTURES)) { const nm = norm(c.nom); if (n.includes(nm) || n.includes(nm.split(' ')[0]) && !['ble'].includes(nm.split(' ')[0])) return k; } if (n.includes('ble dur')) return 'ble_dur'; if (n.includes('ble')) return 'ble_tendre'; if (n.includes('orge')) return 'orge'; return null; };
  const eur = v => v.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
  const t = v => `${v.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} t`;
  if (n.includes('marge')) {
    let k = cultureIn();
    const rows = k === 'orge' ? E.rows.filter(r => r.key.startsWith('orge')) : k ? E.rows.filter(r => r.key === k) : E.rows;
    if (!rows.length) return { text: `Aucune donnée de marge pour cette culture sur la campagne ${campLabel(camp)}.` };
    return { text: rows.map(r => `${r.nom} (${campLabel(camp)}) : marge brute ${eur(r.margeBrute)}, soit ${eur(r.mbHa)}/ha sur ${r.surface} ha.${r.produitEstime > 0 ? ` Dont ${eur(r.produitEstime)} de stock non vendu valorisé au cours de référence (estimation).` : ''}`).join('\n'), link: 'economie' };
  }
  if (n.includes('reste') || n.includes('stock') || n.includes('combien') && n.includes('tonne')) {
    let k = cultureIn();
    const items = S.stock.filter(i => i.cat === 'production' && i.qte > 0 && (!k || (k === 'orge' ? i.culture.startsWith('orge') : i.culture === k)));
    if (!items.length) return { text: k ? 'Aucun stock disponible enregistré pour cette production.' : 'Aucun stock de production enregistré.' };
    return { text: items.map(i => `${i.nom} : ${t(i.qte)} (${i.emplacement})`).join('\n') + (items.length > 1 ? `\nTotal : ${t(sum(items, i => i.qte))}` : ''), link: 'stocks' };
  }
  if (n.includes('mecanisation')) return { text: `Coût de mécanisation ${campLabel(camp)} : ${eur(E.meca)}, soit ${eur(E.mecaHa)}/ha (amortissement économique, assurance, entretien et réparations, hors carburant compté en intrant).`, link: 'materiel' };
  if (n.includes('entretien') || n.includes('maintenance')) {
    const l = S.materiel.map(m => ({ m, n: nextMaintenance(m) })).filter(x => x.n).sort((a, b) => ({ danger: 0, warn: 1, ok: 2 }[a.n.urgence] - { danger: 0, warn: 1, ok: 2 }[b.n.urgence]));
    return { text: l.slice(0, 6).map(x => `${x.m.marque} ${x.m.modele} : ${x.n.label} — ${x.n.echeance}`).join('\n'), link: 'materiel' };
  }
  if (n.includes('cout de production') || n.includes('plus eleve') || n.includes('plus cher')) {
    const ps = E.rows.flatMap(r => r.parcelles.map(p => ({ ...p, culture: r.nom }))).filter(p => p.coutTonne != null).sort((a, b) => b.coutTonne - a.coutTonne);
    if (!ps.length) return { text: `Aucune récolte enregistrée sur ${campLabel(camp)} : le coût de production ne peut pas être calculé.` };
    const p = ps[0];
    return { text: `Coût de production le plus élevé (${campLabel(camp)}) : ${p.nom} (${p.culture}) à ${eur(p.coutTonne)}/t.\nCalcul : (intrants ${eur(p.intrants)} + mécanisation ${eur(p.meca)} + charges de structure ${eur(p.fixAlloc)}) / ${t(p.production)}.`, link: 'economie' };
  }
  if (n.includes('engrais') || n.includes('phyto') || n.includes('semence') || n.includes('carburant') || n.includes('gnr')) {
    const cat = n.includes('engrais') ? 'engrais' : n.includes('phyto') ? 'phyto' : n.includes('semence') ? 'semences' : 'carburants';
    const achats = sum(S.charges.filter(c => c.campagne === camp && c.stockCat === cat), c => c.montant);
    const conso = sum(S.mouvements.filter(m => m.type === 'sortie' && m.refKind === 'intervention' && byId('stock', m.itemId)?.cat === cat && byId('interventions', m.ref)?.campagne === camp), m => m.valeur);
    return { text: `${STOCK_CATS[cat]} — campagne ${campLabel(camp)} :\nAchats enregistrés : ${eur(achats)}\nConsommation (interventions réalisées) : ${eur(conso)}`, link: 'ventes' };
  }
  if (n.includes('materiel') || n.includes('parc')) return { text: `Valeur estimée du parc matériel : ${eur(sum(S.materiel, m => valeurMateriel(m)))} (${S.materiel.length} équipements). Estimation indicative, hors valeurs saisies manuellement.`, link: 'materiel' };
  if (n.includes('chiffre') || n.includes('vente') || n.includes(' ca ')) return { text: `Chiffre d'affaires réalisé ${campLabel(camp)} : ${eur(E.ca)} (${S.ventes.filter(v => v.campagne === camp).length} ventes). Montant non encore réglé : ${eur(E.impayes)}.`, link: 'ventes' };
  if (n.includes('surface') || n.includes('hectare')) return { text: `Surface totale : ${surfaceTotale().toLocaleString('fr-FR')} ha sur ${S.parcelles.length} parcelles.\n` + assolement(CURRENT_CAMP).map(a => `${a.label} : ${a.value} ha`).join('\n'), link: 'parcellaire' };
  return { text: "Je ne trouve pas de réponse fiable à cette question dans vos données. Essayez par exemple :\n• Quelle est la marge réalisée sur mon blé ?\n• Combien me reste-t-il de tonnes d'orge ?\n• Quel est le coût de mécanisation ?\n• Quelles sont les prochaines opérations d'entretien ?\n• Quelle parcelle a le coût de production le plus élevé ?\n• Combien ai-je dépensé en engrais ?\n• Quelle est la valeur de mon parc matériel ?", none: true };
}

if (typeof module !== 'undefined') module.exports = { get S() { return S; }, seedDemo, econ, stockTotals, todoList, assistantAnswer, coutHoraire, estimationRevente, recordSale, applyIntervention, byId, TODAY, CURRENT_CAMP, sum, globalSearch };
