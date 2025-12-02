// Service Worker cho Firebase Cloud Messaging
// File này phải ở trong public/ và có tên chính xác: firebase-messaging-sw.js

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// Initialize Firebase
// Sẽ được set từ main app
firebase.initializeApp({
  apiKey: "AIzaSyBm1_ycgrKG66q9dc_5ekkY2unNqxKCvgY",
  authDomain: "pass-ve-phim-bea23.firebaseapp.com",
  projectId: "pass-ve-phim-bea23",
  storageBucket: "pass-ve-phim-bea23.firebasestorage.app",
  messagingSenderId: "640231961352",
  appId: "1:640231961352:web:b327ffdb239da7829db2bd"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification?.title || 'Tin nhắn mới';
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.message || 'Bạn có tin nhắn mới',
    icon: payload.notification?.icon || '/icon-192.png',
    badge: '/icon-192.png',
    tag: payload.data?.roomId || 'chat',
    data: payload.data,
    requireInteraction: false,
    silent: false,
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification click received.');
  
  event.notification.close();

  // Open app when notification is clicked
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      const urlToOpen = event.notification.data?.url || '/';
      
      // Check if app is already open
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Open new window if app is not open
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

