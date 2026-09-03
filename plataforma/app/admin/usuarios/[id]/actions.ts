"use server";

import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { isAdminRequest } from "@/lib/require-admin";

async function requireAdmin() {
  if (!(await isAdminRequest())) redirect("/dashboard");
}

export async function grantAccessToUser(_prev: unknown, formData: FormData) {
  await requireAdmin();
  const userId = formData.get("userId") as string;
  const plan = formData.get("plan") as "MONTHLY" | "ANNUAL";

  if (!["MONTHLY", "ANNUAL"].includes(plan)) return { error: "Plano inválido." };

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) return { error: "Usuário não encontrado." };

  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setDate(periodEnd.getDate() + (plan === "ANNUAL" ? 365 : 30));

  await db.subscription.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      plan,
      status: "ACTIVE",
      provider: "STRIPE",
      providerRef: `manual-admin-${Date.now()}`,
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
    },
    update: {
      plan,
      status: "ACTIVE",
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      cancelledAt: null,
    },
  });

  revalidatePath(`/admin/usuarios/${userId}`);
  revalidatePath("/admin/usuarios");
  return { success: `Assinatura ${plan === "ANNUAL" ? "anual" : "mensal"} liberada.` };
}

export async function revokeUserSubscription(userId: string) {
  await requireAdmin();
  await db.subscription.updateMany({
    where: { userId },
    data: { status: "CANCELLED", cancelledAt: new Date() },
  });
  revalidatePath(`/admin/usuarios/${userId}`);
  revalidatePath("/admin/usuarios");
}
