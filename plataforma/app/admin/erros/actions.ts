"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function deleteError(id: string) {
  const session = await auth();
  if (!session?.user?.id) return;
  const user = await db.user.findUnique({ where: { id: session.user.id }, select: { role: true } });
  if (user?.role !== "ADMIN") return;

  await db.errorLog.delete({ where: { id } });
  revalidatePath("/admin/erros");
}
