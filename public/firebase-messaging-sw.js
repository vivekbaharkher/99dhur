importScripts(
  "https://www.gstatic.com/firebasejs/11.6.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/11.6.0/firebase-messaging-compat.js",
);
// // Initialize the Firebase app in the service worker by passing the generated config

const firebaseConfig = {
  apiKey: "AIzaSyDkcr4IS9uL58U1JjommGQ3OqiP8PlJ8kU",
  authDomain: "phulmojo.firebaseapp.com",
  projectId: "phulmojo",
  storageBucket: "phulmojo.firebasestorage.app",
  messagingSenderId: "392010196334",
  appId: "1:392010196334:web:9fbef046cd7cda1c4e4d7f",
  measurementId: "G-K48H73E5QQ"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Retrieve firebase messaging
const messaging = firebase.messaging();

self.addEventListener("install", function (event) {
  console.log("Hello world from the Service Worker");
});

// Handle background messages
self.addEventListener("push", function (event) {

  if (!event.data) {
    return;
  }

  try {
    const payload = event.data.json();

    const notificationTitle = payload.notification?.title;

    let clickAction = "https://ebrokerweb.wrteam.me/en/";

    if (payload?.data?.chat_message_type) {
      clickAction += `user/chat?propertyId=${payload.data?.property_id}&userId=${payload.data?.sender_id}`;
    }

    const notificationOptions = {
      body: payload.notification?.body,
      icon: payload.data?.icon || "/favicon.ico",
      requireInteraction: true,
      data: {
        url: clickAction,
      },
    };

    // Send a message to the clients about the notification
    event.waitUntil(
      self.clients.matchAll({ includeUncontrolled: true }).then((clients) => {
        let isClientFocused = false;

        for (const client of clients) {
          if (client.focused || client.visibilityState === "visible") {
            isClientFocused = true;
            break;
          }
        }

        if (!isClientFocused) {
          // Only postMessage if none of the clients are focused (i.e., background)
          clients.forEach((client) => {
            client.postMessage({
              type: "NOTIFICATION_RECEIVED",
              payload,
            });
          });
        }
      }),
    );

    // Show the notification
    event.waitUntil(
      self.registration.showNotification(
        notificationTitle,
        notificationOptions,
      ),
    );
  } catch (error) {
    console.error("Error processing push event:", error);
  }
});

// // Handle notification click events
self.addEventListener("notificationclick", function (event) {

  event.notification.close();

  // Check if a window is already open and focus/redirect it, or open a new one
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        const targetUrl = event.notification.data.url;
        // If no existing window found, open a new one
        return clients.openWindow(targetUrl);
      })
      .catch((error) => {
        console.error("Error handling notification click:", error);
        // Fallback: just open a new window
        return clients.openWindow(event.notification.data.url);
      }),
  );
});