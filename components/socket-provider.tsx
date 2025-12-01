"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

const SocketContext = createContext<Socket | null>(null);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // Socket.IO đã được tắt - sử dụng polling thay thế
    // Chat sẽ tự động refresh tin nhắn mỗi 3 giây thay vì dùng realtime socket
    // Điều này giúp giảm tải server và không cần socket server riêng
    return;
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
