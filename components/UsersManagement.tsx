"use client";

import { useState } from "react";
import { Lock, Unlock, User as UserIcon } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { BackButton } from "./BackButton";

interface User {
  _id: string;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: string;
}

interface UsersManagementProps {
  users: User[];
}

export function UsersManagement({ users: initialUsers }: UsersManagementProps) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [processing, setProcessing] = useState<string | null>(null);

  const handleToggleActive = async (userId: string, currentStatus: boolean) => {
    setProcessing(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (!res.ok) {
        throw new Error("Có lỗi xảy ra");
      }

      toast.success(currentStatus ? "Đã khóa user" : "Đã mở khóa user");
      setUsers(
        users.map((u) =>
          u._id === userId ? { ...u, isActive: !currentStatus } : u
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
            Quản lý người dùng
          </h1>
          <p className="text-dark-text2">{users.length} người dùng trong hệ thống</p>
        </div>

        <div className="bg-dark-card border border-dark-border rounded-2xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-bg border-b border-dark-border">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-heading font-bold text-dark-text">
                    Tên
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-heading font-bold text-dark-text">
                    Email
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
                {users.map((user) => (
                  <tr
                    key={user._id}
                    className="border-t border-dark-border hover:bg-dark-bg transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-neon-green flex items-center justify-center text-white font-heading font-bold">
                          {user.name[0]?.toUpperCase()}
                        </div>
                        <span className="font-semibold text-dark-text">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-dark-text2">{user.email}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                          user.isActive
                            ? "bg-neon-green text-white"
                            : "bg-dark-text2 text-white"
                        }`}
                      >
                        {user.isActive ? "Hoạt động" : "Đã khóa"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleActive(user._id, user.isActive)}
                        disabled={processing === user._id}
                        className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 flex items-center gap-2 hover:shadow-neon hover:scale-[1.03] active:scale-[0.97] ${
                          user.isActive
                            ? "bg-red-500 hover:bg-red-600 text-white"
                            : "bg-neon-green hover:bg-neon-green-light text-white"
                        }`}
                        title={user.isActive ? "Khóa user" : "Mở khóa user"}
                      >
                        {user.isActive ? (
                          <Lock className="w-4 h-4" />
                        ) : (
                          <Unlock className="w-4 h-4" />
                        )}
                        <span className="font-bold">{user.isActive ? "Khóa user" : "Mở khóa"}</span>
                      </button>
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
