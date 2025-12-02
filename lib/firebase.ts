// Firebase configuration cho client-side
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getMessaging, getToken, onMessage, Messaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
let app: FirebaseApp;
if (typeof window !== "undefined" && getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else if (typeof window !== "undefined") {
  app = getApps()[0];
}

// Get messaging instance (chỉ chạy trên client)
export const getMessagingInstance = (): Messaging | null => {
  if (typeof window === "undefined") return null;
  
  try {
    return getMessaging(app);
  } catch (error) {
    console.error("Error getting messaging instance:", error);
    return null;
  }
};

// Register service worker
export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js", {
      scope: "/",
    });
    console.log("✅ Service Worker registered:", registration);
    return registration;
  } catch (error) {
    console.error("❌ Service Worker registration failed:", error);
    return null;
  }
};

// Request permission và get FCM token
export const requestNotificationPermission = async (): Promise<string | null> => {
  if (typeof window === "undefined") return null;

  try {
    // Đăng ký Service Worker trước
    await registerServiceWorker();

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.log("❌ Notification permission denied");
      return null;
    }

    const messaging = getMessagingInstance();
    if (!messaging) {
      console.error("❌ Messaging not available");
      return null;
    }

    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
    if (!vapidKey) {
      console.error("❌ VAPID key not configured");
      return null;
    }

    // Đợi service worker ready
    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.ready;
      console.log("✅ Service Worker ready");
    }

    const token = await getToken(messaging, { 
      vapidKey,
      serviceWorkerRegistration: await navigator.serviceWorker.ready,
    });
    
    if (token) {
      console.log("✅ FCM Token obtained:", token.substring(0, 20) + "...");
    } else {
      console.log("❌ No FCM token available");
    }
    
    return token;
  } catch (error: any) {
    console.error("❌ Error getting FCM token:", error);
    return null;
  }
};

// Listen for foreground messages
export const onMessageListener = () => {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(null);
      return;
    }

    const messaging = getMessagingInstance();
    if (!messaging) {
      resolve(null);
      return;
    }

    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
};

