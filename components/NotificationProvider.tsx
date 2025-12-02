"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { requestNotificationPermission, onMessageListener } from "@/lib/firebase";
import { toast } from "react-hot-toast";

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [tokenRegistered, setTokenRegistered] = useState(false);

  useEffect(() => {
    if (!session?.user) return;

    // Request notification permission và register FCM token
    const registerFCMToken = async () => {
      try {
        const token = await requestNotificationPermission();
        
        if (token) {
          // Save token to backend
          const res = await fetch("/api/push/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fcmToken: token }),
          });

          if (res.ok) {
            setTokenRegistered(true);
            console.log("FCM token registered successfully");
          }
        }
      } catch (error) {
        console.error("Error registering FCM token:", error);
      }
    };

    // Đợi một chút để đảm bảo Firebase đã sẵn sàng
    const timer = setTimeout(() => {
      registerFCMToken();
    }, 2000);

    return () => clearTimeout(timer);
  }, [session]);

  useEffect(() => {
    if (!session?.user) return;

    // Listen for foreground messages (khi app đang mở)
    const setupMessageListener = async () => {
      try {
        const payload: any = await onMessageListener();
        if (payload) {
          // Hiển thị toast notification khi có tin nhắn mới
          toast.custom((t) => (
            <div
              className={`${
                t.visible ? "animate-enter" : "animate-leave"
              } max-w-md w-full bg-dark-card border border-dark-border shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
            >
              <div className="flex-1 w-0 p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-neon-green rounded-full flex items-center justify-center">
                      <span className="text-white text-lg">💬</span>
                    </div>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-dark-text">
                      {payload.notification?.title || "Tin nhắn mới"}
                    </p>
                    <p className="mt-1 text-sm text-dark-text2">
                      {payload.notification?.body || payload.data?.message || ""}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex border-l border-dark-border">
                <button
                  onClick={() => {
                    toast.dismiss(t.id);
                    if (payload.data?.url) {
                      window.location.href = payload.data.url;
                    }
                  }}
                  className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-neon-green hover:text-neon-green-light focus:outline-none"
                >
                  Xem
                </button>
              </div>
            </div>
          ));
        }
      } catch (error) {
        console.error("Error setting up message listener:", error);
      }
    };

    if (tokenRegistered) {
      setupMessageListener();
    }
  }, [session, tokenRegistered]);

  return <>{children}</>;
}

