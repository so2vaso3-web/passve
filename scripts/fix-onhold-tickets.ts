import { config } from "dotenv";
import { resolve } from "path";
import mongoose from "mongoose";

// Load .env.local
config({ path: resolve(__dirname, "../.env.local") });

import connectDB from "@/lib/mongodb";
import Ticket from "@/models/Ticket";
import Wallet from "@/models/Wallet";
import Transaction from "@/models/Transaction";

async function fixOnHoldTickets() {
  console.log("🔍 Đang kết nối MongoDB...");
  await connectDB();
  console.log("✅ Đã kết nối MongoDB");

  try {
    // Tìm tất cả vé on_hold có qrImage hoặc ticketCode
    const tickets = await Ticket.find({
      status: "on_hold",
      $or: [
        { qrImage: { $exists: true, $ne: null, $ne: "" } },
        { ticketCode: { $exists: true, $ne: null, $ne: "" } },
      ],
    }).populate("seller onHoldBy");

    console.log(`📊 Tìm thấy ${tickets.length} vé on_hold có QR image hoặc ticket code`);

    if (tickets.length === 0) {
      console.log("✅ Không có vé nào cần sửa");
      process.exit(0);
    }

    const db = mongoose.connection;
    const dbSession = await db.startSession();

    try {
      await dbSession.withTransaction(async () => {
        for (const ticket of tickets) {
          const hasQrImage = ticket.qrImage && ticket.qrImage.trim().length > 0;
          const hasTicketCode = ticket.ticketCode && ticket.ticketCode.trim().length > 0;

          if (!hasQrImage && !hasTicketCode) {
            continue;
          }

          // Tính toán số tiền
          const sellerReceives = Math.round(ticket.sellingPrice * 0.93);

          // Lấy wallet của seller
          let sellerWallet = await Wallet.findOne({ user: ticket.seller._id });
          if (!sellerWallet) {
            sellerWallet = await Wallet.create({
              user: ticket.seller._id,
              balance: 0,
              escrow: 0,
              totalEarned: 0,
            });
          }

          // Chuyển từ escrow sang balance
          if (sellerWallet.escrow >= ticket.sellingPrice) {
            sellerWallet.escrow -= ticket.sellingPrice;
            sellerWallet.balance += sellerReceives;
            sellerWallet.totalEarned += sellerReceives;
            await sellerWallet.save({ session: dbSession });
          }

          // Cập nhật ticket status
          ticket.status = "sold";
          ticket.buyer = ticket.onHoldBy;
          ticket.soldAt = ticket.onHoldAt || new Date();
          await ticket.save({ session: dbSession });

          // Tạo transaction mới
          const buyer = ticket.onHoldBy;
          if (buyer) {
            const buyerFee = Math.round(ticket.sellingPrice * 0.07);
            const total = ticket.sellingPrice + buyerFee;

            await Transaction.create(
              [
                {
                  user: buyer._id,
                  type: "purchase",
                  amount: total,
                  status: "completed",
                  description: `Mua vé ${ticket.movieTitle} - ${ticket.cinema}${hasTicketCode ? ` (Mã vé: ${ticket.ticketCode})` : ""}`,
                  ticket: ticket._id,
                },
                {
                  user: ticket.seller._id,
                  type: "sale",
                  amount: sellerReceives,
                  status: "completed",
                  description: `Bán vé ${ticket.movieTitle} cho ${(buyer as any).name || "Người mua"}`,
                  ticket: ticket._id,
                },
              ],
              { session: dbSession, ordered: true }
            );
          }

          console.log(`✅ Đã cập nhật vé ${ticket._id} từ on_hold → sold`);
        }
      });

      console.log(`\n✅ Đã sửa ${tickets.length} vé thành công!`);
    } finally {
      await dbSession.endSession();
    }
  } catch (error: any) {
    console.error("❌ Lỗi:", error);
    process.exit(1);
  }

  process.exit(0);
}

fixOnHoldTickets();

import { resolve } from "path";
import mongoose from "mongoose";

// Load .env.local
config({ path: resolve(__dirname, "../.env.local") });

import connectDB from "@/lib/mongodb";
import Ticket from "@/models/Ticket";
import Wallet from "@/models/Wallet";
import Transaction from "@/models/Transaction";

async function fixOnHoldTickets() {
  console.log("🔍 Đang kết nối MongoDB...");
  await connectDB();
  console.log("✅ Đã kết nối MongoDB");

  try {
    // Tìm tất cả vé on_hold có qrImage hoặc ticketCode
    const tickets = await Ticket.find({
      status: "on_hold",
      $or: [
        { qrImage: { $exists: true, $ne: null, $ne: "" } },
        { ticketCode: { $exists: true, $ne: null, $ne: "" } },
      ],
    }).populate("seller onHoldBy");

    console.log(`📊 Tìm thấy ${tickets.length} vé on_hold có QR image hoặc ticket code`);

    if (tickets.length === 0) {
      console.log("✅ Không có vé nào cần sửa");
      process.exit(0);
    }

    const db = mongoose.connection;
    const dbSession = await db.startSession();

    try {
      await dbSession.withTransaction(async () => {
        for (const ticket of tickets) {
          const hasQrImage = ticket.qrImage && ticket.qrImage.trim().length > 0;
          const hasTicketCode = ticket.ticketCode && ticket.ticketCode.trim().length > 0;

          if (!hasQrImage && !hasTicketCode) {
            continue;
          }

          // Tính toán số tiền
          const sellerReceives = Math.round(ticket.sellingPrice * 0.93);

          // Lấy wallet của seller
          let sellerWallet = await Wallet.findOne({ user: ticket.seller._id });
          if (!sellerWallet) {
            sellerWallet = await Wallet.create({
              user: ticket.seller._id,
              balance: 0,
              escrow: 0,
              totalEarned: 0,
            });
          }

          // Chuyển từ escrow sang balance
          if (sellerWallet.escrow >= ticket.sellingPrice) {
            sellerWallet.escrow -= ticket.sellingPrice;
            sellerWallet.balance += sellerReceives;
            sellerWallet.totalEarned += sellerReceives;
            await sellerWallet.save({ session: dbSession });
          }

          // Cập nhật ticket status
          ticket.status = "sold";
          ticket.buyer = ticket.onHoldBy;
          ticket.soldAt = ticket.onHoldAt || new Date();
          await ticket.save({ session: dbSession });

          // Tạo transaction mới
          const buyer = ticket.onHoldBy;
          if (buyer) {
            const buyerFee = Math.round(ticket.sellingPrice * 0.07);
            const total = ticket.sellingPrice + buyerFee;

            await Transaction.create(
              [
                {
                  user: buyer._id,
                  type: "purchase",
                  amount: total,
                  status: "completed",
                  description: `Mua vé ${ticket.movieTitle} - ${ticket.cinema}${hasTicketCode ? ` (Mã vé: ${ticket.ticketCode})` : ""}`,
                  ticket: ticket._id,
                },
                {
                  user: ticket.seller._id,
                  type: "sale",
                  amount: sellerReceives,
                  status: "completed",
                  description: `Bán vé ${ticket.movieTitle} cho ${(buyer as any).name || "Người mua"}`,
                  ticket: ticket._id,
                },
              ],
              { session: dbSession, ordered: true }
            );
          }

          console.log(`✅ Đã cập nhật vé ${ticket._id} từ on_hold → sold`);
        }
      });

      console.log(`\n✅ Đã sửa ${tickets.length} vé thành công!`);
    } finally {
      await dbSession.endSession();
    }
  } catch (error: any) {
    console.error("❌ Lỗi:", error);
    process.exit(1);
  }

  process.exit(0);
}

fixOnHoldTickets();

