import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { MaintenanceMode } from "@/components/MaintenanceMode";

export default async function MaintenancePage() {
  // Check if user is admin
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user && (session.user as any)?.role === "admin";

  // If admin, redirect to homepage (they can access normally)
  if (isAdmin) {
    redirect("/");
  }

  return <MaintenanceMode />;
}

