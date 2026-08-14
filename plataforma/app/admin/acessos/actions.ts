"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session || role !== "ADMIN") redirect("/dashboard");
}

export async function grantSubscriptionAccess(_prev: unknown, formData: FormData) {
  await requireAdmin();
  const email  = (formData.get("email") as string).trim().toLowerCase();
  const plan   = formData.get("plan") as "MONTHLY" | "ANNUAL";

  if (!["MONTHLY", "ANNUAL"].includes(plan))
    return { error: "Plano inválido." };

  const user = await db.user.findUnique({ where: { email } });
  if (!user) return { error: "Usuário não encontrado com este e-mail." };

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

  revalidatePath("/admin/acessos");
  return { success: `Assinatura ${plan === "ANNUAL" ? "anual" : "mensal"} liberada para ${user.email}.` };
}

export async function revokeSubscription(subscriptionId: string) {
  await requireAdmin();
  await db.subscription.update({
    where: { id: subscriptionId },
    data: { status: "CANCELLED", cancelledAt: new Date() },
  });
  revalidatePath("/admin/acessos");
}

export async function deleteProduct(productId: string) {
  await requireAdmin();
  await db.lead.deleteMany({ where: { productId } });
  await db.enrollment.deleteMany({ where: { productId } });
  await db.orderItem.deleteMany({ where: { productId } });
  await db.product.delete({ where: { id: productId } });
  revalidatePath("/admin/produtos");
  revalidatePath("/admin/acessos");
}
