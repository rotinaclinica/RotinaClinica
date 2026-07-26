"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { grantAccess } from "@/lib/entitlements";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session || role !== "ADMIN") redirect("/dashboard");
}

export async function grantManualAccess(_prev: unknown, formData: FormData) {
  await requireAdmin();
  const email = (formData.get("email") as string).trim().toLowerCase();
  const productId = formData.get("productId") as string;

  const user = await db.user.findUnique({ where: { email } });
  if (!user) return { error: "Usuário não encontrado com este e-mail." };

  const product = await db.product.findUnique({ where: { id: productId } });
  if (!product) return { error: "Produto inválido." };

  await grantAccess(user.id, productId, `manual-admin`);
  revalidatePath("/admin/acessos");
  return { success: `Acesso liberado para ${user.email} em "${product.title}".` };
}

export async function revokeAccess(enrollmentId: string) {
  await requireAdmin();
  await db.enrollment.delete({ where: { id: enrollmentId } });
  revalidatePath("/admin/acessos");
}
