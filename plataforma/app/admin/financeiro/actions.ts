"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAdminRequest } from "@/lib/require-admin";

async function requireAdmin() {
  if (!(await isAdminRequest())) redirect("/dashboard");
}

export async function addCost(_prev: unknown, formData: FormData) {
  await requireAdmin();

  const name = formData.get("name") as string;
  const amountStr = formData.get("amount") as string;
  const category = formData.get("category") as string;
  const recurring = formData.get("recurring") === "on";
  const monthStr = formData.get("month") as string;
  const note = (formData.get("note") as string) || null;

  if (!name || !amountStr || !monthStr) {
    return { error: "Preencha todos os campos obrigatórios." };
  }

  const amount = parseFloat(amountStr.replace(",", "."));
  if (isNaN(amount) || amount <= 0) {
    return { error: "Valor inválido." };
  }

  const amountCents = Math.round(amount * 100);
  const [year, month] = monthStr.split("-").map(Number);
  const referenceMonth = new Date(year, month - 1, 1);

  await db.financialCost.create({
    data: { name, amountCents, recurring, category, referenceMonth, note },
  });

  revalidatePath("/admin/financeiro");
  return { success: true };
}

export async function deleteCost(id: string) {
  await requireAdmin();
  await db.financialCost.delete({ where: { id } });
  revalidatePath("/admin/financeiro");
}

export async function seedRecurringCosts() {
  await requireAdmin();

  const now = new Date();
  const referenceMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const existing = await db.financialCost.count({
    where: { recurring: true, referenceMonth },
  });
  if (existing > 0) return { info: "Custos recorrentes já existem para este mês." };

  const recurring = await db.financialCost.findMany({
    where: { recurring: true },
    orderBy: { referenceMonth: "desc" },
    distinct: ["name"],
  });

  if (recurring.length === 0) return { info: "Nenhum custo recorrente cadastrado." };

  for (const cost of recurring) {
    const alreadyExists = await db.financialCost.findFirst({
      where: { name: cost.name, referenceMonth },
    });
    if (!alreadyExists) {
      await db.financialCost.create({
        data: {
          name: cost.name,
          amountCents: cost.amountCents,
          recurring: true,
          category: cost.category,
          referenceMonth,
          note: cost.note,
        },
      });
    }
  }

  revalidatePath("/admin/financeiro");
  return { success: true };
}
