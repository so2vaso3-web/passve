import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { UsersManagement } from "@/components/UsersManagement";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getUsers() {
  await connectDB();

  const users = await User.find({ role: "user" })
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  return users.map((u: any) => ({
    ...u,
    _id: u._id.toString(),
  }));
}

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any)?.role !== "admin") {
    redirect("/");
  }

  const users = await getUsers();

  return <UsersManagement users={users} />;
}

