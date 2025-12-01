import { revalidatePath, revalidateTag } from "next/cache";

export async function revalidateAll() {
  revalidatePath("/");
  revalidatePath("/profile");
  revalidatePath("/admin");
  revalidateTag("tickets");
  revalidateTag("wallet");
  revalidateTag("users");
  revalidateTag("transactions");
}

export async function revalidateTickets() {
  revalidatePath("/");
  revalidateTag("tickets");
}

export async function revalidateWallet(userId?: string) {
  revalidatePath("/profile");
  if (userId) {
    revalidatePath(`/profile?userId=${userId}`);
  }
  revalidateTag("wallet");
  revalidateTag("transactions");
}

