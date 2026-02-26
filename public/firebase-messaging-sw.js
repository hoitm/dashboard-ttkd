//firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');
firebase.initializeApp({
  // Config của bạn
  apiKey: "AIzaSyD2SVMDLDvnVnIRSBMfbzubCFQJuWtjt_Y",
  authDomain: "hoitmerprd.firebaseapp.com",
  projectId: "hoitmerprd",
  storageBucket: "hoitmerprd.appspot.com",
  messagingSenderId: "603554851974",
  appId: "1:603554851974:web:d39cf201ddd6b6217f7507",
  measurementId: "G-9XCJBPXSJ0"
});
const messaging = firebase.messaging();
 
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] ✅ Received background FCM', payload);

  const { title, body, image } = payload.notification || {};
  const url = payload.data?.url || '/';
  const notificationOptions = {
    body: body || '',
    icon: 'https://ttkd.vnptphuyen.vn/images/icon-192.png',
    badge: 'https://ttkd.vnptphuyen.vn/images/badge.png',
    image: payload.data?.urlimage || image,
    data: { url },
    requireInteraction: true
  };

  self.registration.showNotification(title || '🔔 Thông báo mới', notificationOptions);
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const url = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) return client.focus();
      }
      return clients.openWindow(url);
    })
  );
});
 