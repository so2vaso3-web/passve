"use client";

import { SessionProvider } from "next-auth/react";
import { SocketProvider } from "./socket-provider";
import { NotificationProvider } from "./NotificationProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SocketProvider>
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </SocketProvider>
    </SessionProvider>
  );
}

