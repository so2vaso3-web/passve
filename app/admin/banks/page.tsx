import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import connectDB from "@/lib/mongodb";
import AdminBank from "@/models/AdminBank";
import { AdminBanksManagement } from "@/components/AdminBanksManagement";
import { BackButton } from "@/components/BackButton";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getAdminBanks() {
  try {
    const db = await connectDB();
    if (!db) {
      return [];
    }

    const banks = await AdminBank.find()
      .sort({ displayOrder: 1, createdAt: -1 })
      .lean()
      .maxTimeMS(5000);

    return banks;
  } catch (error) {
    console.error("Error fetching admin banks:", error);
    return [];
  }
}

export default async function AdminBanksPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || (session.user as any).role !== "admin") {
    redirect("/");
  }

  const banks = await getAdminBanks();

  return (
    <div className="min-h-screen bg-dark-bg py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <BackButton href="/admin" label="Quay lại Dashboard" />
        </div>
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-heading font-black text-dark-text mb-2">
            Quản lý tài khoản nhận tiền
          </h1>
          <p className="text-dark-text2">
            Quản lý tài khoản ngân hàng/ví điện tử của HỆ THỐNG (số TK, chủ TK, QR code, logo) để khách hàng nạp tiền
          </p>
        </div>

        <AdminBanksManagement initialBanks={banks} />
      </div>
    </div>
  );
}

