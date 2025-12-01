"use client";

import { useState } from "react";
import { Trash2, Eye, EyeOff, X } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BackButton } from "./BackButton";

interface Ticket {
  _id: string;
  title: string;
  category: string;
  status: string;
  isExpired: boolean;
  sellingPrice: number;
  createdAt: string;
  seller: {
    _id: string;
    name: string;
    email: string;
  } | null;
}

interface TicketsManagementProps {
  tickets: Ticket[];
}

export function TicketsManagement({ tickets: initialTickets }: TicketsManagementProps) {
  const router = useRouter();
  const [tickets, setTickets] = useState(initialTickets);
  const [processing, setProcessing] = useState<string | null>(null);

  const handleDelete = async (ticketId: string) => {
    if (!confirm("Xác nhận xóa vé này? Vé sẽ biến mất khỏi trang chủ ngay lập tức.")) return;

    setProcessing(ticketId);
    try {
      const res = await fetch(`/api/admin/tickets/${ticketId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Có lỗi xảy ra");
      }

      toast.success("Đã xóa vé");
      setTickets(tickets.filter((t) => t._id !== ticketId));
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra");
    } finally {
      setProcessing(null);
    }
  };

  const handleToggleExpired = async (ticketId: string, currentStatus: boolean) => {
    setProcessing(ticketId);
    try {
      const res = await fetch(`/api/admin/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isExpired: !currentStatus }),
      });

      if (!res.ok) {
        throw new Error("Có lỗi xảy ra");
      }

      toast.success(currentStatus ? "Đã hiển thị vé" : "Đã ẩn vé");
      setTickets(
        tickets.map((t) =>
          t._id === ticketId ? { ...t, isExpired: !currentStatus } : t
        )
      );
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra");
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <BackButton href="/admin" label="Quay lại Dashboard" />
        </div>
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-heading font-black text-dark-text mb-2">
            Quản lý vé
          </h1>
          <p className="text-dark-text2">{tickets.length} vé trong hệ thống</p>
        </div>

        <div className="bg-dark-card border border-dark-border rounded-2xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-bg border-b border-dark-border">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-heading font-bold text-dark-text">
                    Tiêu đề
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-heading font-bold text-dark-text">
                    Người bán
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-heading font-bold text-dark-text">
                    Giá
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-heading font-bold text-dark-text">
                    Trạng thái
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-heading font-bold text-dark-text">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => (
                  <tr
                    key={ticket._id}
                    className="border-t border-dark-border hover:bg-dark-bg transition-colors"
                  >
                    <td className="px-6 py-4">
                      <Link
                        href={`/post/${ticket._id}`}
                        className="font-semibold text-dark-text hover:text-neon-green transition-colors"
                      >
                        {ticket.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-dark-text2">
                      {ticket.seller?.name || "Unknown"}
                    </td>
                    <td className="px-6 py-4 font-heading font-bold text-neon-green-light text-glow">
                      {new Intl.NumberFormat("vi-VN").format(ticket.sellingPrice)} đ
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                          ticket.status === "sold"
                            ? "bg-dark-text2 text-white"
                            : ticket.isExpired
                            ? "bg-dark-text2 text-white"
                            : "bg-neon-green text-white"
                        }`}
                      >
                        {ticket.status === "sold"
                          ? "Đã bán"
                          : ticket.isExpired
                          ? "Hết hạn"
                          : "Đang bán"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleToggleExpired(ticket._id, ticket.isExpired)}
                          disabled={processing === ticket._id}
                          className="px-3 py-1.5 bg-neon-green hover:bg-neon-green-light text-white rounded-xl font-semibold text-sm transition-all disabled:opacity-50 hover:shadow-neon hover:scale-[1.03] active:scale-[0.97] flex items-center gap-1"
                          title={ticket.isExpired ? "Hiển thị" : "Ẩn"}
                        >
                          {ticket.isExpired ? (
                            <Eye className="w-4 h-4" />
                          ) : (
                            <EyeOff className="w-4 h-4" />
                          )}
                          <span className="font-bold">{ticket.isExpired ? "Hiển thị" : "Ẩn tin"}</span>
                        </button>
                        <button
                          onClick={() => handleDelete(ticket._id)}
                          disabled={processing === ticket._id}
                          className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold text-sm transition-all disabled:opacity-50 hover:shadow-neon hover:scale-[1.03] active:scale-[0.97] flex items-center gap-1"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="font-bold">Xóa</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
