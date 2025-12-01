import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";
import connectDB from "@/lib/mongodb";
import ChatMessage from "@/models/Chat";

export function initializeSocket(server: HTTPServer) {
  const io = new SocketIOServer(server, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join-ticket", (ticketId: string) => {
      socket.join(`ticket:${ticketId}`);
      console.log(`Socket ${socket.id} joined ticket ${ticketId}`);
    });

    socket.on("leave-ticket", (ticketId: string) => {
      socket.leave(`ticket:${ticketId}`);
      console.log(`Socket ${socket.id} left ticket ${ticketId}`);
    });

    socket.on("send-message", async (data: { ticketId: string; receiverId: string; message: string; senderId: string }) => {
      try {
        await connectDB();
        const chatMessage = await ChatMessage.create({
          ticket: data.ticketId,
          sender: data.senderId,
          receiver: data.receiverId,
          message: data.message,
        });

        const message = {
          _id: chatMessage._id.toString(),
          sender: chatMessage.sender.toString(),
          receiver: chatMessage.receiver.toString(),
          message: chatMessage.message,
          createdAt: chatMessage.createdAt.toISOString(),
        };

        io.to(`ticket:${data.ticketId}`).emit("new-message", message);
      } catch (error) {
        console.error("Error sending message:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  return io;
}



