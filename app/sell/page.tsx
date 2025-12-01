import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { PostForm } from "@/components/PostForm";

export default async function SellPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/api/auth/signin?callbackUrl=/sell");
  }

  return (
    <div className="min-h-screen bg-dark-bg py-8">
      <PostForm />
    </div>
  );
}
