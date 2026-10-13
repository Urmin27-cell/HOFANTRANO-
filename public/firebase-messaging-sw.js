// Scripts for Firebase Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

const firebaseConfig = {
  projectId: "gen-lang-client-0235676341",
  appId: "1:183924441253:web:b833e21e5994c9ffe1cd4c",
  apiKey: "AIzaSyCO6DF0gulWjYcE2YSZnLbQ79zfZp8uzZE",
  authDomain: "gen-lang-client-0235676341.firebaseapp.com",
  messagingSenderId: "183924441253"
};

try {
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    const notificationTitle = payload.notification ? payload.notification.title : 'HOFANTRANO';
    const notificationOptions = {
      body: payload.notification ? payload.notification.body : 'Fampandrenesana vaovao',
      icon: '/logo-192.png',
      badge: '/logo-192.png',
      data: payload.data || { url: '/' }
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  });
} catch (e) {
  console.warn('Firebase Messaging SW init error:', e);
}
