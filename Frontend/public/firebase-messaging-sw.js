// firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyB1Vie6MaY1FpZjYj9j1s2lzFEE8X-SupI",
  authDomain: "rural-girls-empowerment.firebaseapp.com",
  projectId: "rural-girls-empowerment",
  storageBucket: "rural-girls-empowerment.appspot.com",
  messagingSenderId: "670183967597",
  appId: "1:670183967597:web:8cb93df4e1375d0299e864",
  measurementId: "G-WJZ57QBK75",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
