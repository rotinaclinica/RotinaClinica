"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Não autenticado");
  const user = await db.user.findUnique({ where: { id: session.user.id }, select: { role: true } });
  if (user?.role !== "ADMIN") throw new Error("Sem permissão");
}

export async function makeAmbassador(formData: FormData) {
  await requireAdmin();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const code = (formData.get("code") as string)?.trim().toUpperCase();
  if (!email || !code) return { error: "Email e código são obrigatórios." };
  if (!/^[A-Z0-9]{3,20}$/.test(code)) return { error: "Código inválido. Use apenas letras e números (3–20 caracteres)." };

  const target = await db.user.findUnique({ where: { email }, select: { id: true } });
  if (!target) return { error: "Usuário não encontrado." };

  const codeInUse = await db.user.findUnique({ where: { ambassadorCode: code }, select: { id: true } });
  if (codeInUse && codeInUse.id !== target.id) return { error: "Esse código já está em uso por outro embaixador." };

  await db.user.update({
    where: { id: target.id },
    data: { isAmbassador: true, ambassadorCode: code },
  });

  revalidatePath("/admin/embaixadores");
  return { success: true };
}

export async function removeAmbassador(userId: string) {
  await requireAdmin();
  await db.user.update({
    where: { id: userId },
    data: { isAmbassador: false, ambassadorCode: null },
  });
  revalidatePath("/admin/embaixadores");
}

export async function markCommissionPaid(ambassadorId: string) {
  await requireAdmin();
  await db.referral.updateMany({
    where: { ambassadorId, paidOut: false },
    data: { paidOut: true, paidOutAt: new Date() },
  });
  revalidatePath("/admin/embaixadores");
}
