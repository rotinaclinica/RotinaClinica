"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { isAdminRequest } from "@/lib/require-admin";
import { processInvoiceBatch, retryInvoice } from "@/lib/nfe";

async function requireAdmin() {
  if (!(await isAdminRequest())) redirect("/dashboard");
}

/** Roda o lote de emissão manualmente (mesma lógica do cron). */
export async function processarNotasAgora() {
  await requireAdmin();
  await processInvoiceBatch(30);
  revalidatePath("/admin/notas");
}

/** Recoloca uma nota específica na fila e tenta de novo. */
export async function reprocessarNota(invoiceId: string) {
  await requireAdmin();
  await retryInvoice(invoiceId);
  revalidatePath("/admin/notas");
}
