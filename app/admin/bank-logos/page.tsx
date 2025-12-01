import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import connectDB from "@/lib/mongodb";
import BankLogo from "@/models/BankLogo";
import { AdminBankLogosManagement } from "@/components/AdminBankLogosManagement";
import { BackButton } from "@/components/BackButton";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getBankLogos() {
  try {
    const db = await connectDB();
    if (!db) {
      return [];
    }

    const bankLogos = await BankLogo.find()
      .sort({ displayOrder: 1, bankName: 1 })
      .lean()
      .maxTimeMS(5000);

    return bankLogos.map((logo) => ({
      ...logo,
      _id: logo._id.toString(),
    })) as any;
  } catch (error) {
    console.error("Error fetching bank logos:", error);
    return [];
  }
}

export default async function AdminBankLogosPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || (session.user as any).role !== "admin") {
    redirect("/");
  }

  const bankLogos = await getBankLogos();

  return (
    <div className="min-h-screen bg-dark-bg py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <BackButton href="/admin" label="Quay lại Dashboard" />
        </div>
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-heading font-black text-dark-text mb-2">
            Quản lý logo ngân hàng
          </h1>
          <p className="text-dark-text2">
            Upload và quản lý logo ngân hàng để hiển thị trong dropdown "Chọn ngân hàng" của user khi thêm tài khoản
          </p>
        </div>

        <AdminBankLogosManagement initialBankLogos={bankLogos} />
      </div>
    </div>
  );
}

