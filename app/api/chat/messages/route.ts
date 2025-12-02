import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import ChatRoom from "@/models/ChatRoom";
import ChatMessage from "@/models/ChatMessage";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const roomId = searchParams.get("roomId");

    if (!roomId) {
      return NextResponse.json(
        { error: "Missing roomId" },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify user is part of this room
    const room = await ChatRoom.findById(roomId);
    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    if (
      room.buyer.toString() !== user._id.toString() &&
      room.seller.toString() !== user._id.toString()
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const messages = await ChatMessage.find({ room: roomId })
      .populate("sender", "name image")
      .sort({ createdAt: 1 })
      .lean();

    const formattedMessages = messages.map((msg: any) => ({
      _id: msg._id.toString(),
      sender: msg.sender._id.toString(),
      senderName: msg.sender.name,
      message: msg.message,
      type: msg.type,
      attachments: msg.attachments || [],
      isRead: msg.isRead,
      createdAt: msg.createdAt,
    }));

    return NextResponse.json({ messages: formattedMessages });
  } catch (error: any) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { roomId, message, receiverId, type = "text", attachments = [] } = await request.json();

    if (!roomId || !receiverId) {
      return NextResponse.json(
        { error: "Missing required fields: roomId and receiverId are required" },
        { status: 400 }
      );
    }

    // For image/file type, message can be optional but attachments are required
    if (type === "text" && !message?.trim()) {
      return NextResponse.json(
        { error: "Message is required for text messages" },
        { status: 400 }
      );
    }

    if ((type === "image" || type === "file") && (!attachments || attachments.length === 0)) {
      return NextResponse.json(
        { error: "Attachments are required for image/file messages" },
        { status: 400 }
      );
    }

    await connectDB();

    const sender = await User.findOne({ email: session.user.email });
    if (!sender) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify room
    const room = await ChatRoom.findById(roomId);
    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    if (
      room.buyer.toString() !== sender._id.toString() &&
      room.seller.toString() !== sender._id.toString()
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Create message
    const messageText = type === "text" ? (message?.trim() || "") : (message?.trim() || (type === "image" ? "📷 Đã gửi ảnh" : "📎 Đã gửi file"));
    const newMessage = await ChatMessage.create({
      room: roomId,
      sender: sender._id,
      receiver: receiverId,
      message: messageText,
      type,
      attachments: attachments || [],
      isRead: false,
    });

    // Update room
    room.lastMessage = messageText;
    room.lastMessageAt = new Date();
    if (room.buyer.toString() === sender._id.toString()) {
      room.unreadCountSeller += 1;
    } else {
      room.unreadCountBuyer += 1;
    }
    await room.save();

    // Revalidate tags for real-time updates
    const { revalidateTag } = await import("next/cache");
    revalidateTag("chat");
    revalidateTag("unread-count");

    // Populate sender
    await newMessage.populate("sender", "name image");

    // Send push notification to receiver if they have FCM token
    try {
      const receiver = await User.findById(receiverId);
      if (receiver?.fcmToken) {
        // Import firebase-admin messaging
        const { messaging } = await import("@/lib/firebase-admin");
        
        if (messaging) {
          const notificationTitle = `${(newMessage.sender as any).name}`;
          const notificationBody = type === "image" ? "📷 Đã gửi ảnh" : (messageText.substring(0, 100) || "Tin nhắn mới");
          const chatUrl = `/chat/${roomId}`;
          
          console.log(`📤 Sending push notification to user ${receiver.email}:`, {
            title: notificationTitle,
            body: notificationBody,
            url: chatUrl,
            roomId: roomId,
          });

          try {
            await messaging.send({
              token: receiver.fcmToken,
              notification: {
                title: notificationTitle,
                body: notificationBody,
                icon: "/icon-192.png",
              },
              data: {
                roomId: roomId,
                senderId: sender._id.toString(),
                type: "chat_message",
                url: chatUrl,
                click_action: chatUrl,
              },
              android: {
                priority: "high",
                notification: {
                  sound: "default",
                  channelId: "chat_messages",
                },
              },
              apns: {
                payload: {
                  aps: {
                    sound: "default",
                    badge: 1,
                    alert: {
                      title: notificationTitle,
                      body: notificationBody,
                    },
                  },
                },
              },
              webpush: {
                notification: {
                  icon: "/icon-192.png",
                  badge: "/icon-192.png",
                  requireInteraction: false,
                },
                fcmOptions: {
                  link: chatUrl,
                },
              },
            });
            console.log(`✅ Push notification sent successfully to ${receiver.email}`);
          } catch (pushError: any) {
            console.error(`❌ Error sending push notification to ${receiver.email}:`, pushError);
            // Nếu token không hợp lệ, xóa token khỏi database
            if (pushError.code === "messaging/registration-token-not-registered" || 
                pushError.code === "messaging/invalid-registration-token") {
              console.log(`🔧 Removing invalid FCM token for user ${receiver.email}`);
              receiver.fcmToken = undefined;
              await receiver.save();
            }
          }
        } else {
          console.warn(`⚠️ Firebase Admin messaging not available - cannot send push notification to ${receiver.email}`);
        }
      }
    } catch (pushError) {
      // Log error nhưng không fail request nếu push notification thất bại
      console.error("Error sending push notification:", pushError);
    }

    return NextResponse.json({
      success: true,
      message: {
        _id: newMessage._id.toString(),
        sender: newMessage.sender._id.toString(),
        senderName: (newMessage.sender as any).name,
        message: newMessage.message,
        type: newMessage.type,
        attachments: newMessage.attachments || [],
        isRead: newMessage.isRead,
        createdAt: newMessage.createdAt,
      },
    });
  } catch (error: any) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send message" },
      { status: 500 }
    );
  }
}
