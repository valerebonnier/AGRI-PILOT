# AGRI PILOT — ERP agricole

Application web installable (PWA), pensée d'abord pour le téléphone, pour piloter une exploitation agricole : parcelles, itinéraires techniques, interventions, stocks, ventes et achats, gestion économique, parc matériel, administratif et PAC, documents.

## Installer sur le téléphone
1. Ouvrir https://valerebonnier.github.io/AGRI-PILOT/ sur le téléphone.
2. iPhone (Safari) : bouton Partager → « Sur l'écran d'accueil ». Android (Chrome) : menu ⋮ → « Installer l'application ».

L'application fonctionne hors connexion. Les données sont enregistrées sur l'appareil (elles ne sont pas envoyées sur GitHub).

## État
- Étape 1 + V2 mobile : interface complète, données de démonstration identifiées comme telles, liaisons automatiques entre modules (interventions → stocks, récoltes → stocks, ventes → stocks et CA, achats → stocks et charges, entretiens → charges).
- Étape 2 à venir : authentification, base de données serveur, multi-exploitation, droits.

## Structure
- `index.html` — point d'entrée
- `css/app.css` — design system (catégories : cultures, matériel, stocks, ventes, administratif, documents)
- `js/core.js` — modèle de données, logique métier et calculs, générateur de démonstration
- `js/ui.js` — icônes, graphiques, navigation, modales
- `js/views.js` — écrans des modules
- `sw.js`, `manifest.webmanifest`, `icons/` — installation et hors connexion

## Cartographie
- Fonds : photographies aériennes et Plan IGN, calques cadastre et îlots PAC (RPG) — services publics de la Géoplateforme IGN (data.geopf.fr), sans clé.
- Recherche de lieu : API de géocodage de la Géoplateforme.
- Bibliothèque cartographique : Leaflet 1.9.4 (licence BSD-2, fichiers dans `vendor/leaflet/`).
