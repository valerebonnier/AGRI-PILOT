'use strict';
/* =====================================================================
   AGRI PILOT — Configuration de la ferme au premier lancement
   Obligatoire, rapide : listes et boutons, très peu de saisie libre.
   ===================================================================== */
const DEPTS = '01 Ain|02 Aisne|03 Allier|04 Alpes-de-Haute-Provence|05 Hautes-Alpes|06 Alpes-Maritimes|07 Ardèche|08 Ardennes|09 Ariège|10 Aube|11 Aude|12 Aveyron|13 Bouches-du-Rhône|14 Calvados|15 Cantal|16 Charente|17 Charente-Maritime|18 Cher|19 Corrèze|2A Corse-du-Sud|2B Haute-Corse|21 Côte-d\'Or|22 Côtes-d\'Armor|23 Creuse|24 Dordogne|25 Doubs|26 Drôme|27 Eure|28 Eure-et-Loir|29 Finistère|30 Gard|31 Haute-Garonne|32 Gers|33 Gironde|34 Hérault|35 Ille-et-Vilaine|36 Indre|37 Indre-et-Loire|38 Isère|39 Jura|40 Landes|41 Loir-et-Cher|42 Loire|43 Haute-Loire|44 Loire-Atlantique|45 Loiret|46 Lot|47 Lot-et-Garonne|48 Lozère|49 Maine-et-Loire|50 Manche|51 Marne|52 Haute-Marne|53 Mayenne|54 Meurthe-et-Moselle|55 Meuse|56 Morbihan|57 Moselle|58 Nièvre|59 Nord|60 Oise|61 Orne|62 Pas-de-Calais|63 Puy-de-Dôme|64 Pyrénées-Atlantiques|65 Hautes-Pyrénées|66 Pyrénées-Orientales|67 Bas-Rhin|68 Haut-Rhin|69 Rhône|70 Haute-Saône|71 Saône-et-Loire|72 Sarthe|73 Savoie|74 Haute-Savoie|75 Paris|76 Seine-Maritime|77 Seine-et-Marne|78 Yvelines|79 Deux-Sèvres|80 Somme|81 Tarn|82 Tarn-et-Garonne|83 Var|84 Vaucluse|85 Vendée|86 Vienne|87 Haute-Vienne|88 Vosges|89 Yonne|90 Territoire de Belfort|91 Essonne|92 Hauts-de-Seine|93 Seine-Saint-Denis|94 Val-de-Marne|95 Val-d\'Oise|971 Guadeloupe|972 Martinique|973 Guyane|974 La Réunion|976 Mayotte'.split('|');
const FORMES = ['Exploitation individuelle', 'EARL', 'GAEC', 'SCEA', 'SAS / SARL', 'Autre'];
const MAT_PRESETS = {
  tracteur: { label: 'Tracteur', cat: 'tracteur', icon: 'tractor', moteur: true, conso: 14, heuresAn: 500, dureeAmort: 10, famille: 'Véhicules', marques: ['John Deere', 'Fendt', 'Claas', 'New Holland', 'Case IH', 'Massey Ferguson', 'Deutz-Fahr', 'Valtra', 'Kubota', 'McCormick', 'Steyr', 'Same', 'Landini', 'Lamborghini', 'JCB', 'Zetor', 'Renault', 'Ford', 'Fiat', 'Antonio Carraro', 'Iseki', 'Yanmar', 'Solis', 'Mahindra'] },
  moissonneuse: { label: 'Moissonneuse-batteuse', cat: 'moissonneuse', icon: 'wheat', moteur: true, conso: 30, heuresAn: 150, dureeAmort: 12, famille: 'Véhicules', marques: ['Claas', 'John Deere', 'New Holland', 'Case IH', 'Fendt', 'Massey Ferguson', 'Deutz-Fahr', 'Laverda', 'Sampo', 'Rostselmash'] },
  ensileuse: { label: 'Ensileuse automotrice', cat: 'ensileuse', icon: 'wheat', moteur: true, conso: 40, heuresAn: 200, dureeAmort: 10, famille: 'Véhicules', marques: ['Claas', 'John Deere', 'New Holland', 'Krone', 'Fendt'] },
  telescopique: { label: 'Télescopique / chargeuse', cat: 'manutention', icon: 'box', moteur: true, conso: 7, heuresAn: 350, dureeAmort: 10, famille: 'Véhicules', marques: ['Manitou', 'Merlo', 'JCB', 'Claas', 'New Holland', 'Dieci', 'Kramer', 'Bobcat', 'Weidemann', 'Caterpillar', 'Faresin', 'Magni', 'Schäffer'] },
  pulve_auto: { label: 'Pulvérisateur automoteur', cat: 'pulverisateur', icon: 'droplet', moteur: true, conso: 15, heuresAn: 300, dureeAmort: 10, famille: 'Véhicules', marques: ['Amazone', 'Kuhn', 'Berthoud', 'Tecnoma', 'Evrard', 'Hardi', 'Agrifac', 'Caruelle', 'Matrot', 'Exel', 'Lemken', 'Horsch', 'John Deere', 'Dammann', 'Kverneland'] },
  utilitaire: { label: 'Quad / utilitaire / pick-up', cat: 'divers', icon: 'tractor', moteur: true, conso: 3, heuresAn: 200, dureeAmort: 8, famille: 'Véhicules', marques: ['Renault', 'Peugeot', 'Citroën', 'Ford', 'Toyota', 'Volkswagen', 'Iveco', 'Mercedes-Benz', 'Polaris', 'Can-Am', 'Kawasaki', 'Kubota', 'John Deere', 'Yamaha'] },
  camion: { label: 'Camion / porteur', cat: 'remorque', icon: 'tractor', moteur: true, conso: 25, heuresAn: 300, dureeAmort: 10, famille: 'Véhicules', marques: ['Renault', 'Peugeot', 'Citroën', 'Ford', 'Toyota', 'Volkswagen', 'Iveco', 'Mercedes-Benz', 'Polaris', 'Can-Am', 'Kawasaki', 'Kubota', 'John Deere', 'Yamaha'] },
  charrue: { label: 'Charrue', cat: 'charrue', icon: 'shovel', moteur: false, conso: 0, heuresAn: 90, dureeAmort: 12, famille: 'Travail du sol', marques: ['Kuhn', 'Lemken', 'Amazone', 'Horsch', 'Väderstad', 'Pöttinger', 'Kverneland', 'Gregoire Besson', 'Köckerling', 'Maschio-Gaspardo', 'Quivogne', 'Agrisem', 'Simba', 'Dalbo', 'Farmet', 'Sky', 'Naud', 'Rabe', 'He-Va', 'Carré'] },
  dechaumeur: { label: 'Déchaumeur (disques / dents)', cat: 'dechaumeur', icon: 'shovel', moteur: false, conso: 0, heuresAn: 120, dureeAmort: 10, famille: 'Travail du sol', marques: ['Kuhn', 'Lemken', 'Amazone', 'Horsch', 'Väderstad', 'Pöttinger', 'Kverneland', 'Gregoire Besson', 'Köckerling', 'Maschio-Gaspardo', 'Quivogne', 'Agrisem', 'Simba', 'Dalbo', 'Farmet', 'Sky', 'Naud', 'Rabe', 'He-Va', 'Carré'] },
  cultivateur: { label: 'Cultivateur / vibroculteur', cat: 'dechaumeur', icon: 'shovel', moteur: false, conso: 0, heuresAn: 100, dureeAmort: 10, famille: 'Travail du sol', marques: ['Kuhn', 'Lemken', 'Amazone', 'Horsch', 'Väderstad', 'Pöttinger', 'Kverneland', 'Gregoire Besson', 'Köckerling', 'Maschio-Gaspardo', 'Quivogne', 'Agrisem', 'Simba', 'Dalbo', 'Farmet', 'Sky', 'Naud', 'Rabe', 'He-Va', 'Carré'] },
  herse_rot: { label: 'Herse rotative', cat: 'dechaumeur', icon: 'shovel', moteur: false, conso: 0, heuresAn: 120, dureeAmort: 10, famille: 'Travail du sol', marques: ['Kuhn', 'Lemken', 'Amazone', 'Horsch', 'Väderstad', 'Pöttinger', 'Kverneland', 'Gregoire Besson', 'Köckerling', 'Maschio-Gaspardo', 'Quivogne', 'Agrisem', 'Simba', 'Dalbo', 'Farmet', 'Sky', 'Naud', 'Rabe', 'He-Va', 'Carré'] },
  decompacteur: { label: 'Décompacteur / sous-soleuse', cat: 'dechaumeur', icon: 'shovel', moteur: false, conso: 0, heuresAn: 60, dureeAmort: 12, famille: 'Travail du sol', marques: ['Kuhn', 'Lemken', 'Amazone', 'Horsch', 'Väderstad', 'Pöttinger', 'Kverneland', 'Gregoire Besson', 'Köckerling', 'Maschio-Gaspardo', 'Quivogne', 'Agrisem', 'Simba', 'Dalbo', 'Farmet', 'Sky', 'Naud', 'Rabe', 'He-Va', 'Carré'] },
  rouleau: { label: 'Rouleau', cat: 'divers', icon: 'layers', moteur: false, conso: 0, heuresAn: 80, dureeAmort: 15, famille: 'Travail du sol', marques: ['Kuhn', 'Lemken', 'Amazone', 'Horsch', 'Väderstad', 'Pöttinger', 'Kverneland', 'Gregoire Besson', 'Köckerling', 'Maschio-Gaspardo', 'Quivogne', 'Agrisem', 'Simba', 'Dalbo', 'Farmet', 'Sky', 'Naud', 'Rabe', 'He-Va', 'Carré'] },
  striptill: { label: 'Strip-till', cat: 'dechaumeur', icon: 'shovel', moteur: false, conso: 0, heuresAn: 80, dureeAmort: 10, famille: 'Travail du sol', marques: ['Kuhn', 'Lemken', 'Amazone', 'Horsch', 'Väderstad', 'Pöttinger', 'Kverneland', 'Gregoire Besson', 'Köckerling', 'Maschio-Gaspardo', 'Quivogne', 'Agrisem', 'Simba', 'Dalbo', 'Farmet', 'Sky', 'Naud', 'Rabe', 'He-Va', 'Carré'] },
  semoir: { label: 'Semoir céréales / combiné', cat: 'semoir', icon: 'sprout', moteur: false, conso: 0, heuresAn: 120, dureeAmort: 10, famille: 'Semis & plantation', marques: ['Väderstad', 'Amazone', 'Kuhn', 'Horsch', 'Lemken', 'Sulky', 'Sky', 'Monosem', 'Kverneland', 'Maschio-Gaspardo', 'Pöttinger', 'John Deere', 'Great Plains', 'Accord', 'Novag', 'Ribouleau'] },
  semoir_mono: { label: 'Semoir monograine', cat: 'semoir', icon: 'sprout', moteur: false, conso: 0, heuresAn: 80, dureeAmort: 10, famille: 'Semis & plantation', marques: ['Väderstad', 'Amazone', 'Kuhn', 'Horsch', 'Lemken', 'Sulky', 'Sky', 'Monosem', 'Kverneland', 'Maschio-Gaspardo', 'Pöttinger', 'John Deere', 'Great Plains', 'Accord', 'Novag', 'Ribouleau'] },
  semoir_direct: { label: 'Semoir de semis direct', cat: 'semoir', icon: 'sprout', moteur: false, conso: 0, heuresAn: 100, dureeAmort: 10, famille: 'Semis & plantation', marques: ['Väderstad', 'Amazone', 'Kuhn', 'Horsch', 'Lemken', 'Sulky', 'Sky', 'Monosem', 'Kverneland', 'Maschio-Gaspardo', 'Pöttinger', 'John Deere', 'Great Plains', 'Accord', 'Novag', 'Ribouleau'] },
  planteuse: { label: 'Planteuse', cat: 'semoir', icon: 'sprout', moteur: false, conso: 0, heuresAn: 60, dureeAmort: 12, famille: 'Semis & plantation', marques: ['Grimme', 'Dewulf', 'AVR', 'Ropa', 'Holmer', 'Vervaet', 'Agrifac', 'Moreau'] },
  pulverisateur: { label: 'Pulvérisateur traîné / porté', cat: 'pulverisateur', icon: 'droplet', moteur: false, conso: 0, heuresAn: 200, dureeAmort: 10, famille: 'Fertilisation & protection', marques: ['Amazone', 'Kuhn', 'Berthoud', 'Tecnoma', 'Evrard', 'Hardi', 'Agrifac', 'Caruelle', 'Matrot', 'Exel', 'Lemken', 'Horsch', 'John Deere', 'Dammann', 'Kverneland'] },
  epandeur: { label: 'Épandeur d’engrais', cat: 'divers', icon: 'flask', moteur: false, conso: 0, heuresAn: 60, dureeAmort: 10, famille: 'Fertilisation & protection', marques: ['Amazone', 'Kuhn', 'Sulky', 'Bogballe', 'Rauch', 'Kverneland', 'Joskin', 'Pichon', 'Samson', 'Bergmann', 'Fliegl', 'Leboulch', 'Perard', 'Jeantil', 'Rolland'] },
  epandeur_fumier: { label: 'Épandeur à fumier / compost', cat: 'divers', icon: 'flask', moteur: false, conso: 0, heuresAn: 80, dureeAmort: 12, famille: 'Fertilisation & protection', marques: ['Amazone', 'Kuhn', 'Sulky', 'Bogballe', 'Rauch', 'Kverneland', 'Joskin', 'Pichon', 'Samson', 'Bergmann', 'Fliegl', 'Leboulch', 'Perard', 'Jeantil', 'Rolland'] },
  tonne: { label: 'Tonne à lisier', cat: 'divers', icon: 'droplet', moteur: false, conso: 0, heuresAn: 80, dureeAmort: 12, famille: 'Fertilisation & protection', marques: ['Amazone', 'Kuhn', 'Sulky', 'Bogballe', 'Rauch', 'Kverneland', 'Joskin', 'Pichon', 'Samson', 'Bergmann', 'Fliegl', 'Leboulch', 'Perard', 'Jeantil', 'Rolland'] },
  bineuse: { label: 'Bineuse / herse étrille / houe', cat: 'divers', icon: 'leaf', moteur: false, conso: 0, heuresAn: 80, dureeAmort: 10, famille: 'Fertilisation & protection', marques: ['Carré', 'Einböck', 'Garford', 'Kverneland', 'Steketee', 'Hatzenbichler', 'Schmotzer', 'Treffler'] },
  faucheuse: { label: 'Faucheuse / faucheuse-conditionneuse', cat: 'divers', icon: 'leaf', moteur: false, conso: 0, heuresAn: 80, dureeAmort: 10, famille: 'Récolte & fourrage', marques: ['Kuhn', 'Claas', 'Krone', 'Pöttinger', 'New Holland', 'John Deere', 'Vicon', 'McHale', 'Lely', 'Fella', 'Deutz-Fahr', 'Massey Ferguson', 'Kverneland', 'Elho'] },
  faneuse: { label: 'Faneuse', cat: 'divers', icon: 'leaf', moteur: false, conso: 0, heuresAn: 60, dureeAmort: 10, famille: 'Récolte & fourrage', marques: ['Kuhn', 'Claas', 'Krone', 'Pöttinger', 'New Holland', 'John Deere', 'Vicon', 'McHale', 'Lely', 'Fella', 'Deutz-Fahr', 'Massey Ferguson', 'Kverneland', 'Elho'] },
  andaineur: { label: 'Andaineur', cat: 'divers', icon: 'leaf', moteur: false, conso: 0, heuresAn: 60, dureeAmort: 10, famille: 'Récolte & fourrage', marques: ['Kuhn', 'Claas', 'Krone', 'Pöttinger', 'New Holland', 'John Deere', 'Vicon', 'McHale', 'Lely', 'Fella', 'Deutz-Fahr', 'Massey Ferguson', 'Kverneland', 'Elho'] },
  presse: { label: 'Presse (ronde / balles carrées)', cat: 'divers', icon: 'box', moteur: false, conso: 0, heuresAn: 80, dureeAmort: 10, famille: 'Récolte & fourrage', marques: ['Kuhn', 'Claas', 'Krone', 'Pöttinger', 'New Holland', 'John Deere', 'Vicon', 'McHale', 'Lely', 'Fella', 'Deutz-Fahr', 'Massey Ferguson', 'Kverneland', 'Elho'] },
  enrubanneuse: { label: 'Enrubanneuse', cat: 'divers', icon: 'box', moteur: false, conso: 0, heuresAn: 50, dureeAmort: 10, famille: 'Récolte & fourrage', marques: ['Kuhn', 'Claas', 'Krone', 'Pöttinger', 'New Holland', 'John Deere', 'Vicon', 'McHale', 'Lely', 'Fella', 'Deutz-Fahr', 'Massey Ferguson', 'Kverneland', 'Elho'] },
  arracheuse: { label: 'Arracheuse (pommes de terre / betteraves)', cat: 'divers', icon: 'wheat', moteur: false, conso: 0, heuresAn: 60, dureeAmort: 12, famille: 'Récolte & fourrage', marques: ['Grimme', 'Dewulf', 'AVR', 'Ropa', 'Holmer', 'Vervaet', 'Agrifac', 'Moreau'] },
  remorque: { label: 'Remorque / benne', cat: 'remorque', icon: 'box', moteur: false, conso: 0, heuresAn: 150, dureeAmort: 15, famille: 'Transport & manutention', marques: ['Brimont', 'Rolland', 'Gilibert', 'Maupu', 'Joskin', 'Fliegl', 'Dangreville', 'Leboulch', 'Perard', 'Krampe', 'Bergmann'] },
  plateau: { label: 'Plateau fourrager', cat: 'remorque', icon: 'box', moteur: false, conso: 0, heuresAn: 80, dureeAmort: 15, famille: 'Transport & manutention', marques: ['Brimont', 'Rolland', 'Gilibert', 'Maupu', 'Joskin', 'Fliegl', 'Dangreville', 'Leboulch', 'Perard', 'Krampe', 'Bergmann'] },
  chargeur: { label: 'Chargeur frontal', cat: 'manutention', icon: 'box', moteur: false, conso: 0, heuresAn: 150, dureeAmort: 10, famille: 'Transport & manutention', marques: ['Manitou', 'Merlo', 'JCB', 'Claas', 'New Holland', 'Dieci', 'Kramer', 'Bobcat', 'Weidemann', 'Caterpillar', 'Faresin', 'Magni', 'Schäffer'] },
  broyeur: { label: 'Broyeur', cat: 'divers', icon: 'layers', moteur: false, conso: 0, heuresAn: 80, dureeAmort: 10, famille: 'Divers', marques: ['Kuhn', 'Berti', 'Desvoys', 'Ferri', 'Maschio-Gaspardo', 'Rousseau', 'Noremat', 'Orsi'] },
  irrigation: { label: 'Matériel d’irrigation', cat: 'divers', icon: 'droplet', moteur: false, conso: 0, heuresAn: 120, dureeAmort: 12, famille: 'Divers', marques: ['Irrifrance', 'Ocmis', 'Bauer', 'Valley', 'Lindsay', 'Rainstar', 'Perrot'] },
  autre: { label: 'Autre matériel', cat: 'divers', icon: 'dots', moteur: false, conso: 0, heuresAn: 60, dureeAmort: 10, famille: 'Divers', marques: ['Kuhn', 'Lemken', 'Amazone', 'Horsch', 'Väderstad', 'Pöttinger', 'Kverneland', 'Gregoire Besson', 'Köckerling', 'Maschio-Gaspardo', 'Quivogne', 'Agrisem', 'Simba', 'Dalbo', 'Farmet', 'Sky', 'Naud', 'Rabe', 'He-Va', 'Carré'] },
};
/* Correspondance des matériels utilisés dans les ITK types → type de matériel */
const ITK_MAT_PRESET = { t1: 'tracteur', t2: 'tracteur', t3: 'tracteur', mb: 'moissonneuse', pulve: 'pulverisateur', semoir: 'semoir', dech: 'dechaumeur', charrue: 'charrue', rem: 'remorque', manit: 'telescopique', epand: 'epandeur', arr: 'arracheuse', irrig: 'irrigation' };
const OB_FAMILLES = [
  ['Céréales', ['ble_tendre', 'ble_dur', 'orge_h', 'orge_p', 'triticale', 'seigle', 'avoine', 'epeautre', 'mais', 'mais_ens', 'sorgho']],
  ['Oléagineux', ['colza', 'tournesol', 'lin', 'soja']],
  ['Protéagineux', ['pois', 'feverole', 'lentille']],
  ['Cultures industrielles & légumes', ['betterave', 'pdt', 'chanvre', 'legumes']],
  ['Fourrages & autres surfaces', ['prairie', 'prairie_t', 'luzerne', 'jachere']],
];
const OB_CULTURES = OB_FAMILLES.flatMap(f => f[1]);
const OB_STEPS = [['profil', 'Vous'], ['ferme', 'Ma ferme'], ['productions', 'Mes productions'], ['itk', 'Mes itinéraires'], ['repartition', 'Mes surfaces'], ['parcelles', 'Mes parcelles'], ['materiel', 'Mon matériel'], ['forfait', 'Mon forfait'], ['options', 'Options'], ['recap', 'C’est prêt']];
OB_STEPS.splice(0, OB_STEPS.length, ...OB_STEPS.filter(x => x[0] !== 'materiel' || modOn('materiel')));
const obIdx = k => OB_STEPS.findIndex(x => x[0] === k);
const ROLES_OB = [['exploitant', 'Chef·fe d’exploitation', 'farm'], ['associe', 'Associé·e', 'users'], ['salarie', 'Salarié·e', 'tractor'], ['conseil', 'Conseiller·e / comptable', 'chart']];
const OB_KEY = 'agripilot.onboarding.v3';
let OB = null;
function obLoad() {
  try { const d = JSON.parse(localStorage.getItem(OB_KEY) || 'null'); if (d && d.v === 3) { OB = d; OB.rep = OB.rep || {}; OB.itk = OB.itk || {}; return; } } catch (e) { }
  OB = { v: 3, step: -1, nom: '', prenom: '', nomFam: '', role: 'exploitant', email: '', tel: '', siret: '', pacage: '', forme: 'EARL', dept: '', cultures: [], rep: {}, itk: {}, parcelles: [], materiel: {}, genTasks: true, plan: null, cycle: 'annuel', options: [] };
}
function obSave() { try { localStorage.setItem(OB_KEY, JSON.stringify(OB)); } catch (e) { } }
function obValid(step) {
  const k = OB_STEPS[step][0];
  if (k === 'profil') return OB.prenom.trim().length >= 2 ? '' : 'Indiquez votre prénom';
  if (k === 'forfait') return OB.plan ? '' : 'Choisissez un forfait';
  if (k === 'ferme') return OB.nom.trim().length >= 2 && !!OB.dept ? '' : 'Indiquez le nom de la ferme et le département';
  if (k === 'productions') return OB.cultures.length ? '' : 'Choisissez au moins une production';
  if (k === 'repartition') return OB.cultures.every(c => OB.rep[c] > 0) ? '' : 'Indiquez une surface pour chaque culture';
  if (k === 'parcelles') return OB.parcelles.every(p => p.nom.trim() && p.surface > 0 && p.culture) ? '' : 'Chaque parcelle doit avoir un nom et une surface';
  return '';
}
const obSurf = () => r2(sum(OB.parcelles, p => p.surface), 2);
const matUnits = () => Object.entries(OB.materiel).flatMap(([k, list]) => list.map((u, i) => ({ k, i, ...u })));

function renderOnboarding() {
  if (!OB) obLoad();
  document.documentElement.dataset.theme = PREFS.theme;
  if (OB.step < 0) { renderWelcome(); return; }
  if (OB_STEPS[OB.step][0] === 'forfait' && !OB.plan) OB.plan = planReco();
  const step = OB.step, key = OB_STEPS[step][0], err = obValid(step);
  const body = { profil: obProfil, ferme: obFerme, productions: obProductions, itk: obItk, repartition: obRepartition, parcelles: obParcelles, materiel: obMateriel, forfait: obForfait, options: obOptions, recap: obRecap }[key]();
  document.getElementById('app').className = 'app ob-mode';
  document.getElementById('app').innerHTML = `<div class="ob">
    <header class="ob-top"><div class="row"><span class="brand-logo" style="width:32px;height:32px;border-radius:10px">${ic('leaf')}</span><b>AGRI PILOT</b><span class="sp"></span><span class="small muted b">${esc(OB_STEPS[step][1])} · ${step + 1}/${OB_STEPS.length}</span></div>
      <div class="ob-prog">${OB_STEPS.map((s, i) => `<i class="${i < step ? 'done' : i === step ? 'on' : ''}"></i>`).join('')}</div></header>
    <main class="ob-body">${body}</main>
    <footer class="ob-foot"><button class="btn" data-a="obPrev" aria-label="Retour">${ic('chevL')}</button>${key === 'options' ? `<div class="ob-tot"><small>Après l’essai</small><b>${eur2(aboTotal({ plan: OB.plan, cycle: OB.cycle, options: OB.options }))}<span>${perLbl(OB.cycle)}</span></b></div>` : ''}
      ${(key === 'materiel' && !matUnits().length) || (key === 'parcelles' && !OB.parcelles.length) ? `<button class="btn ob-next" data-a="obNext">Je le ferai plus tard ${ic('chevR')}</button>` : key === 'recap' ? `<button class="btn p ob-next" data-a="obFinish">${ic('check')} Démarrer AGRI PILOT</button>` : `<button class="btn p ob-next" data-a="obNext" ${err ? 'disabled' : ''}>Continuer ${ic('chevR')}</button>`}</footer>
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
  return `<h1 class="ob-h">Votre exploitation</h1><p class="ob-p">Ce minimum permet à l’application de calculer vos stocks, vos coûts et vos tâches.</p>
  <label class="field"><span>Nom de l’exploitation *</span><input class="inp" data-in="obF" data-k="nom" value="${esc(OB.nom)}" placeholder="Ex. : EARL du Moulin" autocomplete="organization"></label>
  <div class="field mt"><span>Forme juridique</span><div class="ob-chips">${FORMES.map(f => `<button class="fchip ${OB.forme === f ? 'on' : ''}" style="--c:var(--primary)" data-a="obSet" data-k="forme" data-v="${esc(f)}">${f}</button>`).join('')}</div></div>
  <label class="field mt"><span>Département du siège *</span><select class="inp" data-ch="obDept"><option value="">— Choisir —</option>${DEPTS.map(d => `<option value="${esc(d)}" ${OB.dept === d ? 'selected' : ''}>${esc(d)}</option>`).join('')}</select></label>
  <details class="ob-more mt"${OB.siret || OB.pacage ? ' open' : ''}><summary>Identifiants <small>(facultatif, pour la PAC et les factures)</small></summary><div class="grid2 mt"><label class="field"><span>SIRET</span><input class="inp" inputmode="numeric" data-in="obF" data-k="siret" value="${esc(OB.siret)}" placeholder="14 chiffres"></label><label class="field"><span>N° PACAGE</span><input class="inp" inputmode="numeric" data-in="obF" data-k="pacage" value="${esc(OB.pacage)}" placeholder="9 chiffres"></label></div></details>`;
}
IN.obF = el => { OB[el.dataset.k] = el.value; obSave(); const btn = document.querySelector('.ob-next'); const err = obValid(OB.step); if (btn) btn.disabled = !!err; const h = document.querySelector('.ob-hint'); if (h) h.style.display = err ? '' : 'none'; };
CH.obDept = el => { OB.dept = el.value; obSave(); obRerender(); };
ACT.obSet = d => { OB[d.k] = d.v; obSave(); obRerender(); };

/* ---- Étape 2 : productions ---- */
function obProductions() {
  return `<h1 class="ob-h">Que cultivez-vous cette campagne ?</h1><p class="ob-p">Touchez toutes vos productions ${campLabel(CURRENT_CAMP)}. Les principales sont livrées avec un itinéraire technique type ; pour les autres, vous construirez le vôtre.</p>
  ${OB_FAMILLES.map(([fam, ks]) => `<div class="ob-fam">${fam}</div><div class="ob-grid">${ks.map(k => { const on = OB.cultures.includes(k); return `<button class="ob-tile ${on ? 'on' : ''}" style="--c:${CULTURES[k].color}" data-a="obCult" data-k="${k}"><span class="sw"></span><b>${CULTURES[k].nom}</b><span class="ck">${on ? ic('check') : ''}</span></button>`; }).join('')}</div>`).join('')}
  <p class="small muted mt">${OB.cultures.length} production(s) sélectionnée(s)</p>`;
}
ACT.obCult = d => {
  const i = OB.cultures.indexOf(d.k);
  if (i >= 0) { OB.cultures.splice(i, 1); delete OB.rep[d.k]; OB.parcelles = OB.parcelles.filter(p => p.culture !== d.k); } else OB.cultures.push(d.k);
  obSave(); obRerender();
};

/* ---- Étape 3 : parcelles ---- */
const obRepTot = () => r2(sum(OB.cultures, c => +OB.rep[c] || 0), 2);
/* ---- Étape : répartition des surfaces ---- */
function obRepartition() {
  const tot = obRepTot();
  return `<h1 class="ob-h">Vos surfaces ${campLabel(CURRENT_CAMP)}</h1><p class="ob-p">Combien d’hectares pour chaque culture cette campagne ? Vous placerez ces surfaces sur vos parcelles à l’étape suivante… ou plus tard.</p>
  <div class="rep-tot"><div><b id="repTot">${nf(tot, 1)}</b><span>ha au total</span></div><div class="zbar rep-bar">${OB.cultures.map(c => `<i style="flex:${+OB.rep[c] || 0};background:${CULTURES[c].color}"></i>`).join('')}</div></div>
  ${OB.cultures.map(c => { const v = +OB.rep[c] || 0; return `<div class="rep-row" style="--c:${CULTURES[c].color}"><div class="row"><span class="sw"></span><b>${CULTURES[c].nom}</b><span class="sp"></span><span class="rep-pc">${tot ? Math.round(v / tot * 100) : 0} %</span></div>
    <div class="row mt" style="gap:8px;flex-wrap:wrap"><div class="stepper"><button data-a="obRepS" data-k="${c}" data-d="-5">${ic('minus')}</button><input inputmode="decimal" data-in="obRep" data-k="${c}" value="${v ? String(v).replace('.', ',') : ''}" placeholder="0" aria-label="Hectares de ${esc(CULTURES[c].nom)}"><span>ha</span><button data-a="obRepS" data-k="${c}" data-d="5">${ic('plus')}</button></div>
    <div class="ob-quick" style="margin:0">${[10, 20, 50, 100].map(x => `<button class="${v === x ? 'on' : ''}" data-a="obRepQ" data-k="${c}" data-v="${x}">${x}</button>`).join('')}</div></div></div>`; }).join('')}
  <div class="note mt">${ic('info')}<span>Ces surfaces deviennent votre plan d’assolement (menu Assolement). Ce qui n’est pas encore placé sur une parcelle reste compté « sans parcelle ».</span></div>`;
}
ACT.obRepS = d => { OB.rep[d.k] = Math.max(0, r2((+OB.rep[d.k] || 0) + (+d.d), 2)); obSave(); obRerender(); };
ACT.obRepQ = d => { OB.rep[d.k] = +d.v; obSave(); obRerender(); };
IN.obRep = el => { const v = parseFloat(el.value.replace(',', '.')); OB.rep[el.dataset.k] = v > 0 ? r2(v, 2) : 0; obSave(); const t = document.getElementById('repTot'); if (t) t.textContent = nf(obRepTot(), 1); const btn = document.querySelector('.ob-next'); const e = obValid(OB.step); if (btn) btn.disabled = !!e; const h = document.querySelector('.ob-hint'); if (h) h.style.display = e ? '' : 'none'; };

/* ---- Étape : parcelles ---- */
function obParcelles() {
  const placed = c => r2(sum(OB.parcelles.filter(p => p.culture === c), p => p.surface), 2);
  return `<h1 class="ob-h">Vos parcelles</h1><p class="ob-p">Placez vos surfaces sur des parcelles : touchez « + Parcelle » sous une culture, puis donnez-lui un nom. Les contours se dessineront plus tard sur la carte.</p>
  <div class="ob-sum"><div><b>${nf(obSurf(), 1)} / ${nf(obRepTot(), 1)} ha</b><span>placés sur des parcelles</span></div><div><b>${OB.parcelles.length}</b><span>parcelle(s)</span></div></div>
  <div class="rep-place">${OB.cultures.map(c => { const plan = +OB.rep[c] || 0, pl = placed(c), rest = r2(plan - pl, 2); return `<div class="rp" style="--c:${CULTURES[c].color}"><div class="row"><span class="sw"></span><b>${CULTURES[c].nom}</b><span class="sp"></span><span class="rp-n ${rest < -0.01 ? 'over' : rest < 0.01 ? 'ok' : ''}">${rest > 0.01 ? `${nf(rest, 1)} ha à placer` : rest < -0.01 ? `${nf(-rest, 1)} ha en plus` : `${ic('check')} tout placé`}</span></div><div class="rp-bar"><i style="width:${plan ? Math.min(100, pl / plan * 100) : 0}%"></i></div><button class="btn sm" data-a="obAddP" data-k="${c}">${ic('plus')} Parcelle${rest > 0.01 ? ` de ${nf(rest, 1)} ha` : ''}</button></div>`; }).join('')}</div>
  <div class="mt">${OB.parcelles.map((p, i) => `<div class="ob-parc" style="--c:${CULTURES[p.culture]?.color}">
    <div class="row" style="gap:8px"><span class="cat-dot" style="--c:${CULTURES[p.culture]?.color}"></span><input class="inp ob-name" data-in="obPN" data-i="${i}" value="${esc(p.nom)}" aria-label="Nom de la parcelle"><button class="btn icon g sm" data-a="obDelP" data-i="${i}" aria-label="Supprimer">${ic('trash')}</button></div>
    <div class="row mt" style="gap:8px;flex-wrap:wrap"><select class="inp" style="flex:1;min-width:140px;height:42px" data-ch="obPC" data-i="${i}">${OB.cultures.map(k => `<option value="${k}" ${p.culture === k ? 'selected' : ''}>${CULTURES[k].nom}</option>`).join('')}</select>
      <div class="stepper"><button data-a="obStep" data-i="${i}" data-d="-1">${ic('minus')}</button><input inputmode="decimal" data-in="obPS" data-i="${i}" value="${String(p.surface).replace('.', ',')}" aria-label="Surface en hectares"><span>ha</span><button data-a="obStep" data-i="${i}" data-d="1">${ic('plus')}</button></div></div>
    <div class="ob-quick">${[2, 5, 10, 15, 20, 30].map(v => `<button class="${p.surface === v ? 'on' : ''}" data-a="obQS" data-i="${i}" data-v="${v}">${v} ha</button>`).join('')}</div>
  </div>`).join('') || `<div class="card empty">Aucune parcelle pour l’instant. Vous pouvez aussi passer cette étape : vos surfaces resteront dans le plan d’assolement.</div>`}</div>`;
}
ACT.obAddP = d => { const n = OB.parcelles.length + 1; const rest = r2((+OB.rep[d.k] || 0) - sum(OB.parcelles.filter(p => p.culture === d.k), p => p.surface), 2); OB.parcelles.push({ nom: `Parcelle ${n}`, culture: d.k, surface: rest > 0 ? rest : 10 }); obSave(); obRerender(); setTimeout(() => { const b = document.querySelector('.ob-body'); b && b.scrollTo({ top: b.scrollHeight, behavior: 'smooth' }); }, 30); };
ACT.obDelP = d => { OB.parcelles.splice(+d.i, 1); obSave(); obRerender(); };
ACT.obStep = d => { const p = OB.parcelles[+d.i]; p.surface = Math.max(0.5, r2(p.surface + (+d.d), 2)); obSave(); obRerender(); };
ACT.obQS = d => { OB.parcelles[+d.i].surface = +d.v; obSave(); obRerender(); };
IN.obPN = el => { OB.parcelles[+el.dataset.i].nom = el.value; obSave(); const btn = document.querySelector('.ob-next'); if (btn) btn.disabled = !!obValid(OB.step); };
IN.obPS = el => { const v = parseFloat(el.value.replace(',', '.')); OB.parcelles[+el.dataset.i].surface = v > 0 ? r2(v, 2) : 0; obSave(); const s = document.querySelector('.ob-sum b'); if (s) s.textContent = `${nf(obSurf(), 1)} ha`; const btn = document.querySelector('.ob-next'); if (btn) btn.disabled = !!obValid(OB.step); };
CH.obPC = el => { OB.parcelles[+el.dataset.i].culture = el.value; obSave(); obRerender(); };

/* ---- Étape 4 : matériel ---- */
function obMateriel() {
  const fams = [...new Set(Object.values(MAT_PRESETS).map(m => m.famille))];
  const units = matUnits();
  return `<h1 class="ob-h">Votre matériel</h1><p class="ob-p">Indiquez le nombre de chaque matériel, puis la marque et le modèle (et les heures pour les véhicules). Il sert aux coûts de mécanisation et aux rappels d’entretien. Étape facultative.</p>
  ${units.length ? `<div class="ob-sum" style="grid-template-columns:1fr"><div><b>${units.length}</b><span>matériel(s) sélectionné(s) — détails en bas de page</span></div></div>` : ''}
  ${fams.map(f => `<div class="ob-fam">${f}</div><div class="ob-mat">${Object.entries(MAT_PRESETS).filter(([, m]) => m.famille === f).map(([k, m]) => { const n = (OB.materiel[k] || []).length; return `<div class="ob-mrow ${n ? 'on' : ''}"><span class="ti">${ic(m.icon)}</span><b>${m.label}</b><div class="stepper sm"><button data-a="obMat" data-k="${k}" data-d="-1" ${n ? '' : 'disabled'}>${ic('minus')}</button><span class="v">${n}</span><button data-a="obMat" data-k="${k}" data-d="1">${ic('plus')}</button></div></div>`; }).join('')}</div>`).join('')}
  ${units.length ? `<div class="ob-fam" id="obDetails">Détails de votre matériel</div>${units.map(u => { const m = MAT_PRESETS[u.k]; const autre = u.marque === 'Autre'; return `<div class="ob-unit"><b>${ic(m.icon)} ${m.label}${(OB.materiel[u.k].length > 1) ? ' ' + (u.i + 1) : ''}</b>
    <select class="inp" data-ch="obMU" data-k="${u.k}" data-i="${u.i}" data-f="marque">${opts([['', 'Marque…'], ...m.marques.map(x => [x, x]), ['Autre', 'Autre marque…']], u.marque)}</select>
    ${autre ? `<input class="inp mt" style="margin-top:8px" data-in="obMT" data-k="${u.k}" data-i="${u.i}" data-f="marqueLibre" value="${esc(u.marqueLibre || '')}" placeholder="Nom de la marque">` : ''}
    <div class="row" style="gap:8px;margin-top:8px"><input class="inp" style="flex:2" data-in="obMT" data-k="${u.k}" data-i="${u.i}" data-f="modele" value="${esc(u.modele || '')}" placeholder="Modèle (facultatif)">${m.moteur ? `<input class="inp" style="flex:1;min-width:0" inputmode="numeric" data-in="obMT" data-k="${u.k}" data-i="${u.i}" data-f="heures" value="${esc(u.heures || '')}" placeholder="Heures">` : ''}</div></div>`; }).join('')}` : ''}`;
}
ACT.obMat = d => { const l = OB.materiel[d.k] || (OB.materiel[d.k] = []); if (+d.d > 0) l.push({ marque: '', modele: '', heures: '' }); else l.pop(); if (!l.length) delete OB.materiel[d.k]; obSave(); obRerender(); };
CH.obMU = el => { OB.materiel[el.dataset.k][+el.dataset.i][el.dataset.f] = el.value; obSave(); if (el.dataset.f === 'marque') obRerender(); };
IN.obMT = el => { OB.materiel[el.dataset.k][+el.dataset.i][el.dataset.f] = el.value; obSave(); };

/* ---- Étape 5 : récapitulatif ---- */
function obRecap() {
  const byC = OB.cultures.map(k => ({ k, s: sum(OB.parcelles.filter(p => p.culture === k), p => p.surface), n: OB.parcelles.filter(p => p.culture === k).length })).filter(x => x.n);
  return `<h1 class="ob-h">Tout est prêt${OB.prenom ? ', ' + esc(OB.prenom) : ''} !</h1><p class="ob-p">Vérifiez le récapitulatif. Vous pourrez tout compléter ensuite.</p>
  <div class="card"><div class="mrow" data-a="obGo" data-s="${obIdx('ferme')}"><div class="ic">${ic('farm')}</div><div class="tx"><b>${esc(OB.nom)}</b><span>${esc(OB.forme)} · ${esc(OB.dept)}</span></div>${ic('edit')}</div>
  <div class="mrow" data-a="obGo" data-s="${obIdx('repartition')}" style="--c:var(--c-cult)"><div class="ic">${ic('layers')}</div><div class="tx"><b>Assolement ${campLabel(CURRENT_CAMP)} · ${nf(obRepTot(), 1)} ha</b><span>${OB.cultures.map(c => `${CULTURES[c].nom} ${nf(+OB.rep[c] || 0, 1)} ha`).join(' · ')}</span></div>${ic('edit')}</div>
  <div class="mrow" data-a="obGo" data-s="${obIdx('parcelles')}" style="--c:var(--c-cult)"><div class="ic">${ic('map')}</div><div class="tx"><b>${OB.parcelles.length} parcelle(s) · ${nf(obSurf(), 1)} ha placés</b><span>${byC.map(x => `${CULTURES[x.k].nom} ${nf(x.s, 1)} ha`).join(' · ') || 'Parcelles à créer plus tard'}</span></div>${ic('edit')}</div>
  ${!modOn('materiel') ? '' : `<div class="mrow" data-a="obGo" data-s="${obIdx('materiel')}" style="--c:var(--c-mat)"><div class="ic">${ic('tractor')}</div><div class="tx"><b>${matUnits().length} matériel(s)</b><span>${matUnits().map(u => MAT_PRESETS[u.k].label).join(', ') || 'À ajouter plus tard'}</span></div>${ic('edit')}</div>`}</div>
  <div class="card mt"><div class="mrow" data-a="obGo" data-s="${obIdx('forfait')}" style="--c:var(--primary)"><div class="ic">${ic('star')}</div><div class="tx"><b>Forfait ${esc(PLANS[OB.plan]?.nom || '—')} · ${OB.cycle === 'annuel' ? 'annuel' : 'mensuel'}</b><span>${OB.options.length ? OB.options.map(o => OPTIONS[o]?.nom).join(', ') : 'Sans option'} · essai gratuit ${ESSAI_J} jours</span></div>${ic('edit')}</div></div>
  <div class="card mt"><div class="mrow" data-a="obToggle" style="--c:var(--c-cult)"><div class="ic">${ic('calendar')}</div><div class="tx" style="white-space:normal"><b>Préparer mon calendrier de travaux</b><span style="white-space:normal">Crée les prochaines interventions à partir des itinéraires types (à partir d’aujourd’hui, rien n’est daté dans le passé).</span></div><button class="switch ${OB.genTasks ? 'on' : ''}" tabindex="-1"></button></div></div>
  <div class="note mt">${ic('info')}<span>Vos données restent sur cet appareil. Pensez à exporter régulièrement depuis Paramètres ; la sauvegarde en ligne arrive avec l’étape 2.</span></div>`;
}
ACT.obGo = d => { OB.step = +d.s; obSave(); obRerender(); };
ACT.obToggle = () => { OB.genTasks = !OB.genTasks; obSave(); obRerender(); };
ACT.obPrev = () => { OB.step = Math.max(-1, OB.step - 1); obSave(); renderOnboarding(); window.scrollTo(0, 0); };
ACT.obNext = () => { const e = obValid(OB.step); if (e) { toast(e, 'warn'); return; } OB.step = Math.min(OB_STEPS.length - 1, OB.step + 1); obSave(); renderOnboarding(); window.scrollTo(0, 0); };

/** Création de la ferme à partir des réponses. */
ACT.obFinish = () => {
  for (const i of ['profil', 'ferme', 'productions', 'repartition', 'parcelles', 'forfait'].map(obIdx)) { const e = obValid(i); if (e) { OB.step = i; obSave(); renderOnboarding(); toast(e, 'warn'); return; } }
  const tpl = seedDemo(); // catalogue d'intrants et itinéraires types (aucune donnée de démo conservée)
  const stock = tpl.stock.filter(s => s.cat !== 'production').map(s => ({ ...s, qte: 0, lot: '', fournisseur: '', dateEntree: TODAY, seuil: 0 }));
  const materiel = [];
  matUnits().forEach(u => { const p = MAT_PRESETS[u.k]; const n = OB.materiel[u.k].length; const marque = u.marque === 'Autre' ? (u.marqueLibre || '').trim() : u.marque; const h = parseFloat(String(u.heures || '').replace(',', '.')); materiel.push({ id: uid('mat'), preset: u.k, cat: p.cat, moteur: p.moteur, marque: marque || p.label, modele: (u.modele || '').trim() || (marque ? p.label : '') + (n > 1 ? ` ${u.i + 1}` : ''), annee: null, serie: '', immat: '', heures: h > 0 ? h : 0, puissance: null, dateAchat: '', prixAchat: 0, conso: p.conso, heuresAn: p.heuresAn, etat: 'bon', dureeAmort: p.dureeAmort, valeurManuelle: null, maintenance: [], prochain: null, historiqueValeur: [], heuresUsage: 0 }); });
  // ITK : remplace les matériels types par ceux de la ferme
  const itk = tpl.itk;
  OB.cultures.forEach(k => { const o = obItkOf(k); itk[k] = { culture: k, semisType: o.semisType, steps: o.steps.filter(x => x.on).map(({ on, ...x }) => ({ ...x, produits: (x.produits || []).map(y => ({ ...y })), materiels: [...(x.materiels || [])] })).sort((a, b) => a.off - b.off) }; });
  Object.values(itk).forEach(t => t.steps.forEach(s => {
    const out = [];
    s.materiels.forEach(mid => { const pk = ITK_MAT_PRESET[mid]; const alt = { pulverisateur: ['pulve_auto'], semoir: ['semoir_direct', 'semoir_mono'], dechaumeur: ['cultivateur', 'herse_rot', 'striptill'], telescopique: ['chargeur'], remorque: ['camion', 'plateau'] }[pk] || []; let cands = materiel.filter(m => m.preset === pk); if (!cands.length) cands = materiel.filter(m => alt.includes(m.preset)); if (!cands.length) return; const idx = pk === 'tracteur' ? Math.min(cands.length - 1, +(mid.slice(1)) - 1 || 0) : 0; const m = cands[Math.max(0, idx)]; if (!out.includes(m.id)) out.push(m.id); });
    s.materiels = out;
  }));
  OB.cultures.forEach(k => { if (!itk[k]) itk[k] = { culture: k, semisType: ['tournesol', 'soja', 'sorgho', 'mais_ens', 'lin', 'betterave', 'chanvre', 'lentille', 'feverole'].includes(k) ? '04-15' : ['triticale', 'seigle', 'avoine', 'epeautre'].includes(k) ? '10-15' : '03-01', steps: [] }; });
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
    exploitation: { nom: OB.nom.trim(), forme: OB.forme, siret: OB.siret.trim(), pacage: OB.pacage.trim(), exploitant: `${OB.prenom.trim()} ${OB.nomFam.trim()}`.trim(), adresse: '', departement: OB.dept, telephone: OB.tel.trim(), email: OB.email.trim(), certification: '', mainOeuvre: [{ nom: `${OB.prenom.trim()} ${OB.nomFam.trim()}`.trim() || 'Exploitant', role: ROLES_OB.find(r => r[0] === OB.role)?.[1].replace('·e', '').replace('·fe', '') || 'Exploitant', taux: 0 }] },
    users: [{ id: 'u1', nom: `${OB.prenom.trim()} ${OB.nomFam.trim()}`.trim() || 'Administrateur', email: OB.email.trim(), role: 'Administrateur' }],
    profil: { prenom: OB.prenom.trim(), nom: OB.nomFam.trim(), role: OB.role, email: OB.email.trim(), tel: OB.tel.trim() },
    assolPlan: { [CURRENT_CAMP]: Object.fromEntries(OB.cultures.map(c => [c, +OB.rep[c] || 0])) },
    abonnement: { plan: OB.plan, cycle: OB.cycle, options: [...OB.options], debut: TODAY, finEssai: addDays(TODAY, ESSAI_J) },
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
  saveState(); location.hash = 'dashboard'; render(); window.scrollTo(0, 0); setTimeout(welcomeSheet, 350);
  toast(`Ferme créée · ${parcelles.length} parcelle(s)${n ? ` · ${n} travaux planifiés` : ''}`);
};
ACT.reconfigure = () => openModal({ title: 'Configurer une nouvelle ferme ?', body: `<div class="note warn">${ic('alert')}<span>Toutes les données actuelles de cet appareil seront remplacées. Exportez-les d’abord si besoin (Paramètres → Exporter).</span></div>`, submit: 'Recommencer la configuration', onSubmit: () => { S.onboarded = false; OB = null; try { localStorage.removeItem(OB_KEY); } catch (e) { } saveState(); render(); } });
ACT.loadDemo = () => openModal({ title: 'Charger la démonstration ?', body: `<div class="note warn">${ic('alert')}<span>Vos données actuelles seront remplacées par l’exploitation fictive de démonstration.</span></div>`, submit: 'Charger la démo', onSubmit: () => { resetDemo(); S.onboarded = true; saveState(); UI.assist = null; commit('Démonstration chargée'); } });
ACT.obDemo = () => { resetDemo(); S.onboarded = true; saveState(); OB = null; try { localStorage.removeItem(OB_KEY); } catch (e) { } location.hash = 'dashboard'; render(); toast('Démonstration chargée · données fictives'); };

/* =====================================================================
   ÉCRAN D'ACCUEIL, PROFIL, FORFAITS ET OPTIONS
   Tarifs indicatifs (à valider) — aucun paiement n'est demandé ni traité dans l'application.
   ===================================================================== */
const ESSAI_J = 30;
const eur2 = v => `${nf(v, v % 1 ? 2 : 0)} €`;
const PLANS = {
  decouverte: { nom: 'Découverte', prix: 0, accroche: 'Pour démarrer', color: '#5B6B7A', limite: 'Jusqu’à 30 ha · 1 utilisateur', modules: ['dashboard', 'taches', 'exploitation', 'parcellaire', 'itk', 'interventions', 'stocks', 'documents', 'parametres'], points: ['Carte satellite et parcellaire', 'Interventions et itinéraires', 'Stocks d’intrants', 'Tâches et rappels'] },
  essentiel: { nom: 'Essentiel', prix: 20, accroche: 'Le plus choisi', color: '#1C6A47', limite: 'Surface illimitée · 3 utilisateurs', modules: ['assolement', 'materiel', 'ventes', 'economie', 'pac'], points: ['Tout Découverte', 'Assolement et mouvements de terres', 'Plusieurs cultures par champ', 'Préparation PAC'] },
  pro: { nom: 'Pro', prix: 40, accroche: 'Pour les équipes', color: '#7A5BD6', limite: 'Surface et utilisateurs illimités', modules: ['equipe'], points: ['Tout Essentiel', 'Main-d’œuvre et planning des salariés', 'Toutes les options incluses*', 'Assistance prioritaire'] },
};
const PLAN_ORDER = ['decouverte', 'essentiel', 'pro'];
const OPTIONS = {
  equipe: { nom: 'Main-d’œuvre et planning', desc: 'Horaires, absences, affectation des tâches aux salariés', prix: 10, icon: 'users', modules: ['equipe'], inPro: true },
  tracabilite: { nom: 'Traçabilité renforcée', desc: 'Lots, registre phytosanitaire et exports de contrôle', prix: 5, icon: 'clipboard', inPro: true, bientot: true },
  cloud: { nom: 'Sauvegarde en ligne et multi-appareils', desc: 'Vos données synchronisées sur téléphone, tablette et ordinateur', prix: 5, icon: 'upload', inPro: true, bientot: true },
  ia: { nom: 'Assistant IA', desc: 'Posez vos questions sur vos données en langage courant', prix: 10, icon: 'sparkles', inPro: true, bientot: true },
  accomp: { nom: 'Prise en main accompagnée', desc: '1 h en visio avec un conseiller pour paramétrer votre ferme', prix: 50, unique: true, icon: 'clock' },
};
const planRank = k => PLAN_ORDER.indexOf(k);
const planReco = () => { const ha = Math.max(obSurf(), obRepTot()), mats = matUnits().length; return ha > 30 || mats > 2 ? 'essentiel' : 'decouverte'; };
/** Prix par période : mensuel, ou annuel = 10 mois (2 mois offerts). Toujours des montants ronds. */
const planPrix = (k, cycle) => { const p = PLANS[k]?.prix || 0; return cycle === 'annuel' ? p * 10 : p; };
const perLbl = cycle => cycle === 'annuel' ? '/an HT' : '/mois HT';
function aboTotal(a) { if (!a?.plan) return 0; return r2(planPrix(a.plan, a.cycle) + sum((a.options || []).filter(o => OPTIONS[o] && !OPTIONS[o].unique && !OPTIONS[o].bientot && !(a.plan === 'pro' && OPTIONS[o].inPro)), o => a.cycle === 'annuel' ? OPTIONS[o].prix * 10 : OPTIONS[o].prix), 2); }
const abo = () => S.abonnement || { plan: 'pro', cycle: 'annuel', options: [], debut: TODAY, finEssai: addDays(TODAY, ESSAI_J), implicite: true };
const enEssai = () => { const a = abo(); return !a.paye && TODAY <= a.finEssai; };
/** Accès à un module : pendant l'essai tout est ouvert ; ensuite selon le forfait et les options. */
function moduleInclus(route, a = abo()) { if (['plus', 'dashboard'].includes(route)) return true; const allR = PLAN_ORDER.slice(0, planRank(a.plan) + 1).flatMap(k => PLANS[k].modules); if (allR.includes(route)) return true; if ((a.options || []).some(o => OPTIONS[o]?.modules?.includes(route))) return true; return !PLAN_ORDER.some(k => PLANS[k].modules.includes(route)); }
const hasRoute = route => S.demo || enEssai() || moduleInclus(route);
const planOfRoute = r => PLAN_ORDER.find(k => PLANS[k].modules.includes(r));

/* ---- Écran d'accueil ---- */
/** Illustration originale (SVG) : paysage agricole au lever du jour. */
const HERO_SVG = `<svg class="wel-ill" viewBox="0 0 400 230" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Illustration : champs cultivés, tracteur et ferme">
<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#CFE8DA"/><stop offset=".7" stop-color="#F6EBCB"/></linearGradient>
<linearGradient id="f1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E7C25A"/><stop offset="1" stop-color="#D4A23A"/></linearGradient>
<linearGradient id="f2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7DBA6B"/><stop offset="1" stop-color="#3F8F55"/></linearGradient>
<linearGradient id="f3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C79A66"/><stop offset="1" stop-color="#A2744A"/></linearGradient></defs>
<rect width="400" height="230" fill="url(#sky)"/>
<circle cx="318" cy="62" r="26" fill="#F7D774"/><circle cx="318" cy="62" r="40" fill="#F7D774" opacity=".25"/>
<path d="M290 40c6-4 12-4 16 0M270 54c5-3 10-3 13 0" stroke="#5B6B7A" stroke-width="1.6" fill="none" stroke-linecap="round"/>
<path d="M0 120 C60 92 120 104 170 112 C230 120 280 94 400 106 L400 140 L0 140Z" fill="#A9CFA0"/>
<path d="M0 132 C80 114 160 128 230 124 C300 120 350 112 400 118 L400 150 L0 150Z" fill="#8DBE84"/>
<g transform="translate(36 88)"><rect x="0" y="22" width="44" height="30" fill="#B5473A"/><path d="M-4 24 L22 4 L48 24Z" fill="#8E3328"/><rect x="16" y="34" width="12" height="18" fill="#F3E3C8"/><path d="M16 34 L28 52 M28 34 L16 52" stroke="#B5473A" stroke-width="1.5"/><rect x="50" y="10" width="12" height="42" rx="6" fill="#D9D3C4"/><rect x="50" y="10" width="12" height="8" rx="4" fill="#B8B0A0"/></g>
<g transform="translate(350 96)"><rect x="-2" y="18" width="4" height="22" fill="#6B4E31"/><circle cx="0" cy="12" r="16" fill="#4F8F5A"/><circle cx="-9" cy="18" r="10" fill="#5FA068"/></g>
<path d="M0 150 L400 140 L400 230 L0 230Z" fill="url(#f2)"/>
<path d="M0 166 L400 150 L400 230 L0 230Z" fill="url(#f1)"/>
<path d="M0 196 L400 176 L400 230 L0 230Z" fill="url(#f3)"/>
<g stroke="#ffffff" stroke-opacity=".28" stroke-width="2">${[...Array(9)].map((_, i) => `<path d="M${i * 50 - 20} 230 L${180 + i * 16} 152"/>`).join('')}</g>
<g transform="translate(206 150)"><rect x="-6" y="6" width="48" height="5" rx="2" fill="#5A4430" opacity=".35"/><rect x="2" y="-14" width="22" height="16" rx="3" fill="#2E7D4F"/><rect x="5" y="-26" width="15" height="14" rx="2" fill="#E9F2EC" stroke="#2E7D4F" stroke-width="2.5"/><rect x="20" y="-6" width="20" height="9" rx="2" fill="#2E7D4F"/><rect x="34" y="-14" width="3" height="9" fill="#444"/><circle cx="10" cy="5" r="9" fill="#2A2A2A"/><circle cx="10" cy="5" r="4" fill="#E7C25A"/><circle cx="35" cy="7" r="5.5" fill="#2A2A2A"/><circle cx="35" cy="7" r="2.4" fill="#E7C25A"/><rect x="-30" y="-2" width="28" height="7" rx="2" fill="#B5473A"/><path d="M-28 5 L-28 11 M-21 5 L-21 11 M-14 5 L-14 11 M-7 5 L-7 11" stroke="#555" stroke-width="2"/></g>
</svg>`;
const WELCOME = [
  ['map', 'var(--c-cult)', 'Votre ferme sur la carte', 'Parcelles sur la vue satellite, cultures et stades d’un coup d’œil.'],
  ['sprout', 'var(--c-stock)', 'Saisie en trois gestes', 'Semis, traitement, récolte : stocks et coûts se mettent à jour seuls.'],
  ['tractor', 'var(--c-mat)', 'Matériel suivi', 'Compteurs, entretiens à prévoir, pannes : rien n’est oublié.'],
  ['chart', 'var(--c-eco)', 'Gardez le cap', 'Tâches du jour, marges par culture, préparation PAC.'],
];
function renderWelcome() {
  const app = document.getElementById('app'); app.className = 'app ob-mode';
  app.innerHTML = `<div class="wel">
    <div class="wel-hero">${HERO_SVG}<div class="wel-top"><span class="wel-logo">${ic('leaf')}</span><b>AGRI PILOT</b></div></div>
    <div class="wel-main">
      <h1 class="wel-h">Pilotez votre exploitation,<br>simplement.</h1>
      <div class="wel-slides" id="welS">${WELCOME.map(([i, c, t, d]) => `<section class="wel-s" style="--c:${c}"><span class="ic">${ic(i)}</span><b>${t}</b><p>${d}</p></section>`).join('')}</div>
      <div class="wel-dots">${WELCOME.map((_, i) => `<i class="${i ? '' : 'on'}"></i>`).join('')}</div>
      <div class="wel-h2">Commencer l’essai gratuit</div>
      <div class="wel-choice">
        <button class="wc wc-main" data-a="obStart"><span class="ic">${ic('farm')}</span><span class="tx"><b>Configurer ma ferme</b><small>5 minutes · ${ESSAI_J} jours gratuits · sans carte bancaire</small></span>${ic('chevR')}</button>
        <button class="wc" data-a="obDemo"><span class="ic">${ic('sparkles')}</span><span class="tx"><b>Essayer avec une ferme de démo</b><small>Une exploitation fictive déjà remplie, à explorer librement</small></span>${ic('chevR')}</button>
      </div>
      <button class="lnk wel-rest" data-a="importAll">${ic('upload')} J’ai une sauvegarde à restaurer</button>
    </div>
  </div>`;
  const sl = document.getElementById('welS'); sl.addEventListener('scroll', () => { const w = sl.firstElementChild?.offsetWidth || 1; const k = Math.round(sl.scrollLeft / (w + 10)); document.querySelectorAll('.wel-dots i').forEach((d, i) => d.classList.toggle('on', i === Math.min(k, WELCOME.length - 1))); }, { passive: true });
}
ACT.obStart = () => { OB.step = 0; obSave(); renderOnboarding(); window.scrollTo(0, 0); };

/* ---- Étape : profil ---- */
function obProfil() {
  return `<h1 class="ob-h">Faisons connaissance</h1><p class="ob-p">Pour personnaliser l’accueil et attribuer vos saisies.</p>
  <div class="grid2"><label class="field"><span>Prénom *</span><input class="inp" data-in="obF" data-k="prenom" value="${esc(OB.prenom)}" autocomplete="given-name" placeholder="Paul"></label><label class="field"><span>Nom</span><input class="inp" data-in="obF" data-k="nomFam" value="${esc(OB.nomFam)}" autocomplete="family-name"></label></div>
  <div class="field mt"><span>Vous êtes</span><div class="ob-roles">${ROLES_OB.map(([k, l, i]) => `<button class="${OB.role === k ? 'on' : ''}" data-a="obSet" data-k="role" data-v="${k}">${ic(i)}<span>${l}</span></button>`).join('')}</div></div>
  <details class="ob-more mt"${OB.email || OB.tel ? ' open' : ''}><summary>Coordonnées <small>(facultatif)</small></summary><div class="grid2 mt"><label class="field"><span>E-mail</span><input class="inp" type="email" data-in="obF" data-k="email" value="${esc(OB.email)}" autocomplete="email"></label><label class="field"><span>Téléphone</span><input class="inp" type="tel" data-in="obF" data-k="tel" value="${esc(OB.tel)}" autocomplete="tel"></label></div></details>
  <div class="note mt">${ic('lock')}<span>Ces informations restent sur votre appareil. Elles serviront à créer votre compte lorsque la sauvegarde en ligne sera disponible.</span></div>`;
}

/* ---- Étape : forfait ---- */
function planCards(sel, cycle, reco, act = 'obPlan') {
  return `<div class="cyc"><button class="${cycle === 'mensuel' ? 'on' : ''}" data-a="${act}Cyc" data-v="mensuel">Mensuel</button><button class="${cycle === 'annuel' ? 'on' : ''}" data-a="${act}Cyc" data-v="annuel">Annuel <em>2 mois offerts</em></button></div>
  <div class="plans">${PLAN_ORDER.map(k => { const p = PLANS[k], px = planPrix(k, cycle); return `<button class="plan ${sel === k ? 'on' : ''}" style="--c:${p.color}" data-a="${act}" data-v="${k}">${k === reco ? '<span class="plan-reco">Recommandé pour vous</span>' : ''}<div class="plan-h"><span class="plan-rad"></span><b>${p.nom}</b><span class="sp"></span><span class="plan-px">${px ? `<b>${px} €</b><small>${perLbl(cycle)}</small>` : '<b>Gratuit</b>'}</span></div><div class="plan-l">${p.limite}${cycle === 'annuel' && px ? ` · au lieu de ${p.prix * 12} €` : ''}</div><ul>${p.points.map(x => `<li>${ic('check')} ${x}</li>`).join('')}</ul></button>`; }).join('')}</div>`;
}
function obForfait() {
  const reco = planReco();
  return `<h1 class="ob-h">Choisissez votre forfait</h1><p class="ob-p">Toutes les fonctions sont ouvertes pendant <b>${ESSAI_J} jours d’essai gratuit</b>. Vous pourrez changer de forfait à tout moment dans Paramètres.</p>
  ${planCards(OB.plan, OB.cycle, reco)}
  <div class="note mt">${ic('info')}<span>Aucun moyen de paiement n’est demandé aujourd’hui. Tarifs indicatifs HT, susceptibles d’évoluer avant l’ouverture des abonnements. ${Math.max(obSurf(), obRepTot()) ? `Recommandation basée sur vos ${nf(Math.max(obSurf(), obRepTot()), 0)} ha et ${matUnits().length} matériel(s).` : ''}</span></div>`;
}
ACT.obPlan = d => { OB.plan = d.v; obSave(); obRerender(); };
ACT.obPlanCyc = d => { OB.cycle = d.v; obSave(); obRerender(); };

/* ---- Étape : options ---- */
function optCards(a, act = 'obOpt') {
  return `<div class="opts">${Object.entries(OPTIONS).map(([k, o]) => { const incl = a.plan === 'pro' && o.inPro, on = incl || a.options.includes(k); const px = o.unique ? `${o.prix} € une fois` : `+${a.cycle === 'annuel' ? o.prix * 10 : o.prix} €${a.cycle === 'annuel' ? '/an' : '/mois'}`;
    return `<button class="opt ${on ? 'on' : ''} ${incl ? 'incl' : ''}" data-a="${act}" data-v="${k}" ${incl ? 'disabled' : ''}><span class="opt-ic">${ic(o.icon)}</span><span class="opt-tx"><b>${o.nom}${o.bientot ? ' <em>Bientôt</em>' : ''}</b><small>${o.desc}</small><span class="opt-px">${incl ? 'Inclus dans Pro' : o.bientot ? `${px} · non facturé avant disponibilité` : px}</span></span><span class="switch ${on ? 'on' : ''}"></span></button>`; }).join('')}</div>`;
}
function obOptions() {
  return `<h1 class="ob-h">Des options ?</h1><p class="ob-p">Ajoutez seulement ce qui vous sert. Tout reste modifiable plus tard.</p>
  ${optCards({ plan: OB.plan, cycle: OB.cycle, options: OB.options })}
  <div class="formula">* Les options marquées « Bientôt » arrivent avec les prochaines étapes ; elles ne seront pas facturées avant d’être disponibles. Montants HT, indicatifs.</div>`;
}
ACT.obOpt = d => { const i = OB.options.indexOf(d.v); i >= 0 ? OB.options.splice(i, 1) : OB.options.push(d.v); obSave(); obRerender(); };

/* ---- Après la configuration ---- */
function welcomeSheet() {
  if (!S.onboarded || S.demo) return;
  openModal({ title: `Bienvenue ${esc(S.profil?.prenom || '')} 👋`, body: `<p style="margin-top:0">Votre ferme <b>${esc(S.exploitation.nom)}</b> est prête. Votre essai gratuit court jusqu’au <b>${dfr(abo().finEssai)}</b>.</p>
  <div class="sheet3">${[['map', 'var(--c-cult)', 'Dessiner mes parcelles', 'Sur la carte satellite', 'go', 'parcellaire'], ['box', 'var(--c-stock)', 'Saisir mes stocks', 'Semences, engrais, phytos, GNR', 'purchase', ''], ['sprout', 'var(--c-cult)', 'Enregistrer une intervention', 'Avec le bouton + en bas', 'quickIv', '']].map(([i, c, l, sub, a, r]) => `<button type="button" class="s3" style="--c:${c}" data-a="wsGo" data-x="${a}" data-r="${r}"><span class="ti">${ic(i)}</span><span><b>${l}</b><small>${sub}</small></span>${ic('chevR')}</button>`).join('')}</div>`, foot: `<button class="btn p" style="flex:1" data-a="closeModal" type="button">Découvrir l’accueil</button>` });
}
ACT.wsGo = d => { closeModal(); setTimeout(() => d.x === 'go' ? go(d.r) : ACT[d.x]({}), 200); };

/* ---- Forfait dans Paramètres ---- */
let ABO = null;
ACT.aboEdit = () => { const a = abo(); ABO = { plan: a.plan, cycle: a.cycle, options: [...(a.options || [])] }; openModal({ title: 'Mon forfait', wide: true, body: '<div id="aboB"></div>', submit: 'Enregistrer', onMount: renderAbo, onSubmit: () => { const prev = abo(); S.abonnement = { ...prev, implicite: false, plan: ABO.plan, cycle: ABO.cycle, options: [...ABO.options] }; commit(`Forfait ${PLANS[ABO.plan].nom} enregistré`); } }); };
function renderAbo() { document.getElementById('aboB').innerHTML = `${planCards(ABO.plan, ABO.cycle, null, 'aboPlan')}<div class="sec-h"><h3>Options</h3></div>${optCards(ABO, 'aboOpt')}<div class="ob-tot mt"><small>Total après l’essai</small><b>${eur2(aboTotal(ABO))}<span>${perLbl(ABO.cycle)}</span></b></div><div class="formula">Aucun paiement n’est traité dans l’application pour l’instant : la souscription sera ouverte avec les comptes en ligne. Tarifs indicatifs.</div>`; }
ACT.aboPlan = d => { ABO.plan = d.v; renderAbo(); };
ACT.aboPlanCyc = d => { ABO.cycle = d.v; renderAbo(); };
ACT.aboOpt = d => { const i = ABO.options.indexOf(d.v); i >= 0 ? ABO.options.splice(i, 1) : ABO.options.push(d.v); renderAbo(); };
ACT.profilEdit = () => { const p = S.profil || {}; openModal({ title: 'Mon profil', body: `<div class="grid2"><label class="field"><span>Prénom</span><input class="inp" name="prenom" value="${esc(p.prenom || '')}"></label><label class="field"><span>Nom</span><input class="inp" name="nom" value="${esc(p.nom || '')}"></label></div><label class="field"><span>Rôle</span><select class="inp" name="role">${opts(ROLES_OB.map(r => [r[0], r[1]]), p.role)}</select></label><div class="grid2"><label class="field"><span>E-mail</span><input class="inp" type="email" name="email" value="${esc(p.email || '')}"></label><label class="field"><span>Téléphone</span><input class="inp" type="tel" name="tel" value="${esc(p.tel || '')}"></label></div>`, onSubmit: f => { S.profil = { prenom: f.prenom.trim(), nom: f.nom.trim(), role: f.role, email: f.email.trim(), tel: f.tel.trim() }; if (!S.demo) { S.exploitation.exploitant = `${S.profil.prenom} ${S.profil.nom}`.trim(); } commit('Profil enregistré'); } }); };
/** Écran affiché à la place d'un module non inclus (après l'essai). */
function lockedView(route) { const k = planOfRoute(route), r = ROUTES.find(x => x[0] === route); const opt = Object.entries(OPTIONS).find(([, o]) => o.modules?.includes(route)); return `<div class="lock card pad"><span class="lock-ic">${ic('lock')}</span><h2>${esc(r?.[1] || 'Module')}</h2><p>Ce module est inclus dans le forfait <b>${PLANS[k]?.nom}</b>${opt ? ` ou avec l’option « ${opt[1].nom} »` : ''}. Vos données sont conservées.</p><button class="btn p" data-a="aboEdit">${ic('star')} Voir les forfaits</button></div>`; }

/* ---- Étape : itinéraires techniques (base proposée, adaptable) ---- */
let OB_TPL = null;
const obTpl = () => OB_TPL || (OB_TPL = seedDemo());
const OB_ITK_TYPES = ['travail_sol', 'semis', 'fertilisation', 'desherbage', 'protection', 'irrigation', 'recolte', 'autre'];
function genericItk(k) {
  const spring = ['tournesol', 'soja', 'sorgho', 'mais_ens', 'lin', 'betterave', 'chanvre', 'lentille', 'feverole', 'orge_p', 'pois', 'mais', 'pdt', 'legumes'].includes(k), autumn = ['triticale', 'seigle', 'avoine', 'epeautre'].includes(k);
  const perennial = ['prairie', 'prairie_t', 'luzerne', 'jachere'].includes(k);
  const md = spring ? '04-15' : autumn ? '10-15' : '03-01';
  const S_ = (type, label, off) => ({ id: uid('stp'), type, label, off, produits: [], materiels: [], hHa: type === 'recolte' ? 0.4 : 0.15, on: true });
  const steps = perennial ? [S_('fertilisation', 'Fertilisation', 20), S_('recolte', 'Fauche / récolte', 90)] : [S_('travail_sol', 'Préparation du sol', -15), S_('semis', 'Semis', 0), S_('desherbage', 'Désherbage', spring ? 25 : 35), S_('fertilisation', 'Fertilisation', spring ? 40 : 120), S_('protection', 'Protection fongicide / ravageurs', spring ? 70 : 190), S_('recolte', 'Récolte', spring ? 160 : 270)];
  return { semisType: md, steps, generic: true };
}
function obItkOf(k) {
  if (OB.itk[k]) return OB.itk[k];
  const t = obTpl().itk[k];
  OB.itk[k] = t && t.steps.length ? { semisType: t.semisType, steps: t.steps.map(x => ({ ...x, produits: x.produits.map(y => ({ ...y })), materiels: [...x.materiels], on: true })) } : genericItk(k);
  return OB.itk[k];
}
const obSemis = k => { const md = obItkOf(k).semisType, yr = +md.slice(0, 2) >= 8 ? CURRENT_CAMP - 1 : CURRENT_CAMP; return `${yr}-${md}`; };
const obProdName = id => obTpl().stock.find(x => x.id === id)?.nom || '';
function obItk() {
  const open = OB.itkOpen ?? OB.cultures[0];
  return `<h1 class="ob-h">Vos itinéraires techniques</h1><p class="ob-p">Voici une base pour chaque culture. Décochez ce que vous ne faites pas, ajustez les dates, ajoutez vos étapes : vos tâches seront créées à partir de ces itinéraires.</p>
  ${OB.cultures.map(k => { const o = obItkOf(k), sem = obSemis(k), on = o.steps.filter(x => x.on), op = open === k; return `<div class="oi ${op ? 'open' : ''}" style="--c:${CULTURES[k].color}">
    <button class="oi-h" data-a="obItkOpen" data-k="${k}"><span class="sw"></span><span class="tx"><b>${CULTURES[k].nom}</b><small>${on.length} étape${on.length > 1 ? 's' : ''} · semis ${dshort(sem)}${o.generic ? ' · base générique' : ''}</small></span>${ic(op ? 'up' : 'down')}</button>
    ${op ? `<div class="oi-b"><label class="oi-sem">${ic('sprout')}<span>Date de semis ${campLabel(CURRENT_CAMP)}</span><input class="inp" type="date" value="${sem}" data-ch="obSem" data-k="${k}"></label>
      <div class="oi-steps">${[...o.steps].map((x, i) => ({ x, i })).sort((a, b) => a.x.off - b.x.off).map(({ x, i }) => { const d = addDays(sem, x.off), past = d < TODAY; return `<div class="oi-s ${x.on ? '' : 'off'}"><button class="oi-ck" data-a="obItkTg" data-k="${k}" data-i="${i}" aria-label="Activer">${x.on ? ic('check') : ''}</button><span class="oi-ic">${ic(IV_ICON[x.type] || 'sprout')}</span><span class="tx" data-a="obItkEd" data-k="${k}" data-i="${i}"><b>${esc(x.label)}</b><small>${dshort(d)}${x.off ? ` · J${x.off > 0 ? '+' : ''}${x.off}` : ' · jour du semis'}${(x.produits || []).length ? ' · ' + esc(x.produits.map(y => obProdName(y.itemId)).filter(Boolean).join(', ')) : ''}${past && x.on ? ' · <em>déjà passée</em>' : ''}</small></span><button class="btn sm icon g" data-a="obItkEd" data-k="${k}" data-i="${i}" aria-label="Modifier">${ic('edit')}</button></div>`; }).join('')}</div>
      <div class="row mt"><button class="btn sm" data-a="obItkAdd" data-k="${k}">${ic('plus')} Ajouter une étape</button><span class="sp"></span>${!o.generic && obTpl().itk[k] ? `<button class="lnk" data-a="obItkReset" data-k="${k}">Revenir à la base</button>` : ''}</div>
      ${o.generic ? `<div class="note mt">${ic('info')}<span>Pas d’itinéraire type détaillé pour cette culture : base générique à adapter à vos pratiques.</span></div>` : ''}</div>` : ''}</div>`; }).join('')}
  <div class="note mt">${ic('calendar')}<span>Les étapes dont la date est déjà passée ne créent pas de tâche. Vous pourrez tout modifier ensuite dans le menu Itinéraires techniques.</span></div>`;
}
ACT.obItkOpen = d => { OB.itkOpen = OB.itkOpen === d.k ? '' : d.k; obSave(); obRerender(); };
ACT.obItkTg = d => { const x = obItkOf(d.k).steps[+d.i]; x.on = !x.on; obSave(); obRerender(); };
ACT.obItkReset = d => { delete OB.itk[d.k]; obSave(); obRerender(); };
CH.obSem = el => { if (!el.value) return; const o = obItkOf(el.dataset.k); o.semisType = el.value.slice(5); obSave(); obRerender(); };
function obStepForm(k, i) {
  const o = obItkOf(k), x = i != null ? o.steps[i] : null, sem = obSemis(k);
  openModal({ title: x ? 'Modifier l’étape' : `Nouvelle étape · ${esc(CULTURES[k].nom)}`, body: `<label class="field"><span>Intitulé</span><input class="inp" name="label" required value="${esc(x?.label || '')}" placeholder="Ex. Désherbage de printemps"></label>
  <div class="field"><span>Type</span><div class="ob-chips">${OB_ITK_TYPES.map(t => `<label class="fchip rad"><input type="radio" name="type" value="${t}" ${(x?.type || 'autre') === t ? 'checked' : ''}><span>${ic(IV_ICON[t] || 'dots')} ${esc(INTER_TYPES[t])}</span></label>`).join('')}</div></div>
  <label class="field"><span>Date prévue</span><input class="inp" type="date" name="date" value="${addDays(sem, x?.off ?? 30)}" required><small>Semis le ${dfr(sem)} : la date est enregistrée en jours après le semis, pour se décaler avec lui.</small></label>`,
    foot: `${x ? `<button type="button" class="btn g d" data-a="obItkDel" data-k="${k}" data-i="${i}">${ic('trash')}</button>` : ''}<span class="sp"></span><button class="btn" data-a="closeModal" type="button">Annuler</button><button class="btn p" type="submit" form="mf">${x ? 'Enregistrer' : 'Ajouter'}</button>`,
    onSubmit: f => { if (!f.label || !f.date) throw new Error('Intitulé et date requis'); const off = daysBetween(sem, f.date); if (x) Object.assign(x, { label: f.label, type: f.type, off }); else o.steps.push({ id: uid('stp'), type: f.type, label: f.label, off, produits: [], materiels: [], hHa: f.type === 'recolte' ? 0.4 : 0.15, on: true }); obSave(); setTimeout(obRerender, 0); } });
}
ACT.obItkEd = d => obStepForm(d.k, +d.i);
ACT.obItkAdd = d => obStepForm(d.k, null);
ACT.obItkDel = d => { obItkOf(d.k).steps.splice(+d.i, 1); obSave(); closeModal(); obRerender(); };
