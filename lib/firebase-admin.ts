// Firebase Admin SDK cho server-side
import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getMessaging, Messaging } from "firebase-admin/messaging";

let app: App;
let messaging: Messaging;

if (typeof window === "undefined") {
  // Chỉ chạy trên server
  if (getApps().length === 0) {
    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    };

    if (
      serviceAccount.projectId &&
      serviceAccount.clientEmail &&
      serviceAccount.privateKey
    ) {
      app = initializeApp({
        credential: cert(serviceAccount as any),
        projectId: serviceAccount.projectId,
      });
      messaging = getMessaging(app);
    } else {
      console.warn("Firebase Admin not configured. Push notifications will be disabled.");
    }
  } else {
    app = getApps()[0];
    messaging = getMessaging(app);
  }
}

export { messaging };

