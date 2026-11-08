/* AGRI PILOT — service worker : fonctionnement hors connexion de l'application */
const VERSION = 'agripilot-v10';
const SHELL = ['./', './index.html', './css/app.css', './js/core.js', './js/ui.js', './js/onboarding.js', './js/map.js', './vendor/leaflet/leaflet.js', './vendor/leaflet/leaflet.css', './js/views.js', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
/* Réseau d'abord (pour recevoir les mises à jour), cache en secours hors connexion */
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (e.request.url.includes('data.geopf.fr')) return; // tuiles et géocodage : réseau direct
  e.respondWith(fetch(e.request).then(r => { if (r.ok && (r.type === 'basic' || r.type === 'cors')) { const cp = r.clone(); caches.open(VERSION).then(c => c.put(e.request, cp)); } return r; }).catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match('./index.html'))));
});
