"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

const SocketContext = createContext<Socket | null>(null);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // Chỉ kết nối socket khi thực sự cần (lazy connection)
    // Hoặc có thể tắt hoàn toàn nếu không dùng socket server
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
    
    // Nếu không có socket URL hoặc không cần socket, bỏ qua
    if (!socketUrl || socketUrl === "http://localhost:3001") {
      // Tạm thời tắt socket để giảm tải
      return;
    }

    const socketInstance = io(socketUrl, {
      transports: ["websocket"],
      reconnection: false, // Tắt auto reconnect để giảm tải
      timeout: 5000,
    });

    socketInstance.on("connect_error", () => {
      // Im lặng xử lý lỗi, không spam console
    });

    setSocket(socketInstance);

    return () => {
      if (socketInstance.connected) {
        socketInstance.close();
      }
    };
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

