// ════════════════════════════════════════════════════════════
//  firebase-messaging-sw.js  —  Bajón Lunar Admin
//  COLOCA ESTE ARCHIVO EN LA RAÍZ DE TU REPO DE GITHUB
//  (mismo nivel que index.html / admin-panel.html)
//  URL: ingalejandrofh01-boop.github.io/Bajon-Lunar/
// ════════════════════════════════════════════════════════════

importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey:            "AIzaSyAuGEQjkloYkS3bG8vrW16Rkx719L3ow8o",
  authDomain:        "bajon-lunar.firebaseapp.com",
  projectId:         "bajon-lunar",
  storageBucket:     "bajon-lunar.firebasestorage.app",
  messagingSenderId: "796358723768",
  appId:             "1:796358723768:web:cb7d12026b9399a8878c4d"
});

const messaging = firebase.messaging();

// ─── Notificación cuando la app está en BACKGROUND o cerrada ───
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Mensaje en background:', payload);

  const notification = payload.notification || {};
  const data         = payload.data         || {};

  const title = notification.title || '🌙 Nueva Cotización — Bajón Lunar';
  const body  = notification.body  ||
    ((data.folio ? data.folio + ' · ' : '') +
     (data.nombre || 'Cliente nuevo') +
     (data.total  ? ' · $' + parseFloat(data.total).toLocaleString('es-MX', { minimumFractionDigits: 2 }) : ''));

  // Ícono embebido del logo Bajón Lunar
  const ICON = 'https://ingalejandrofh01-boop.github.io/Bajon-Lunar/icon-192.png';

  return self.registration.showNotification(title, {
    body,
    icon:      ICON,
    badge:     ICON,
    tag:       data.folio || 'bl-cot',
    renotify:  true,
    vibrate:   [100, 50, 200, 50, 100],  // patrón de vibración 🌙
    data:      { url: '/', folio: data.folio },
    actions:   [
      { action: 'ver',     title: '👁 Ver' },
      { action: 'ignorar', title: 'Ignorar' },
    ],
  });
});

// ─── Al tocar la notificación, abrir / enfocar la app ───
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'ignorar') return;

  const urlToOpen = event.notification.data?.url || 'https://ingalejandrofh01-boop.github.io/Bajon-Lunar/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Si ya está abierta, enfocarla
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      // Si no, abrir nueva ventana
      if (clients.openWindow) return clients.openWindow(urlToOpen);
    })
  );
});

// ─── Activación inmediata del SW ───
self.addEventListener('install',  () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(clients.claim()));
