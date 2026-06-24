// ════════════════════════════════════════════════════════════
//  firebase-messaging-sw.js  —  Bajón Lunar Admin
//  Service Worker para notificaciones push vía Firebase FCM
//  INSTRUCCIONES:
//    1. Coloca este archivo en la RAÍZ de tu servidor (mismo
//       nivel que tu HTML principal), no en una subcarpeta.
//    2. Reemplaza los valores de firebaseConfig con los tuyos.
// ════════════════════════════════════════════════════════════

importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey:            "AIzaSyCIeNPEDzpMLb1iLNqAcqJwaeST01xLftk",
  authDomain:        "bajon-lunar-240d5.firebaseapp.com",
  projectId:         "bajon-lunar-240d5",
  storageBucket:     "bajon-lunar-240d5.firebasestorage.app",
  messagingSenderId: "557896881017",
  appId:             "1:557896881017:web:e61ee3cda3095340b395a8"
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

  return self.registration.showNotification(title, {
    body,
    icon:  '/icon-192.png',   // ← pon tu ícono aquí
    badge: '/badge-72.png',   // ← ícono pequeño para la barra de estado
    tag:   data.folio || 'bl-cot',
    renotify: true,
    data: { url: '/', folio: data.folio },
    actions: [
      { action: 'ver',    title: '👁 Ver cotización' },
      { action: 'ignorar', title: 'Ignorar' },
    ],
  });
});

// ─── Al tocar la notificación, abrir / enfocar la app ───
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'ignorar') return;

  const urlToOpen = event.notification.data?.url || '/';

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
