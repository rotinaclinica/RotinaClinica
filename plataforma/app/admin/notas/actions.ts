"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { isAdminRequest } from "@/lib/require-admin";
import { processInvoiceBatch, retryInvoice } from "@/lib/nfe";
import { db } from "@/lib/db";
import { sendNotaFiscal } from "@/lib/email";

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

/** Reenvia o email da nota fiscal autorizada. */
export async function reenviarEmailNota(invoiceId: string) {
  await requireAdmin();
  const inv = await db.invoice.findUnique({ where: { id: invoiceId } });
  if (!inv || inv.status !== "AUTHORIZED" || !inv.numero || !inv.pdfUrl) return;

  await sendNotaFiscal({
    to: inv.customerEmail,
    customerName: inv.customerName,
    numero: inv.numero,
    pdfUrl: inv.pdfUrl,
    amountCents: inv.amountCents,
  });
  await db.invoice.update({
    where: { id: invoiceId },
    data: { emailSentAt: new Date() },
  });
  revalidatePath("/admin/notas");
}
