importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js",
);

firebase.initializeApp({
  apiKey: "AIzaSyAAZPlPYMfl3Un6Q5keydrGfPhoErYh_tw",
  authDomain: "bookexchange-188db.firebaseapp.com",
  projectId: "bookexchange-188db",
  storageBucket: "bookexchange-188db.firebasestorage.app",
  messagingSenderId: "344459394812",
  appId: "1:344459394812:web:29e675ff820469368b6179",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload,
  );
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/icon-192x192.png",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
