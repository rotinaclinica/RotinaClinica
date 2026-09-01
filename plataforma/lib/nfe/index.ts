import { db } from "@/lib/db";
import { sendNotaFiscal } from "@/lib/email";
import { nfeConfig, nfeEnabled } from "./config";
import { focusNfeProvider } from "./providers/focusnfe";
import type { NfeEmitInput, NfeProvider } from "./types";

/**
 * PONTO CENTRAL DO SISTEMA DE NOTA FISCAL.
 *
 * Os dois webhooks (Stripe e Mercado Pago), depois de confirmar o pagamento,
 * chamam APENAS `createPendingInvoiceForOrder`. Isso cria um registro Invoice
 * (PENDING) e retorna imediatamente — a emissão de fato NUNCA roda dentro do
 * webhook, para não bloquear nem quebrar a confirmação de pagamento.
 *
 * O ciclo de vida completo (emitir → consultar → entregar PDF por email) é
 * conduzido pelo cron `/api/cron/emitir-notas`, que chama `processInvoiceBatch`.
 */

const MAX_ATTEMPTS = 8;

function getProvider(): NfeProvider {
  switch (nfeConfig.provider) {
    case "focusnfe":
      return focusNfeProvider;
    // case "nfeio":     return nfeIoProvider;     // adapters futuros
    // case "plugnotas": return plugNotasProvider;
    default:
      return focusNfeProvider;
  }
}

/**
 * Cria (idempotentemente) uma nota PENDENTE para um pedido pago.
 * Seguro de chamar dentro do webhook: se a NFe estiver desligada, faz no-op;
 * qualquer erro deve ser engolido pelo chamador (`.catch(() => {})`).
 */
export async function createPendingInvoiceForOrder(orderId: string): Promise<void> {
  if (!nfeEnabled()) return;

  const order = await db.order.findUnique({
    where: { id: orderId },
    include: {
      user: { select: { name: true, email: true, cpf: true } },
      items: { include: { product: { select: { title: true } } } },
    },
  });

  if (!order || order.status !== "PAID" || order.totalCents <= 0) return;
  if (!order.user?.email) return;

  // Idempotência: uma nota por pedido.
  const existing = await db.invoice.findUnique({ where: { orderId } });
  if (existing) return;

  const doc = order.user.cpf?.replace(/\D/g, "") || null;
  const titulos = order.items.map((i) => i.product.title).filter(Boolean);
  const discriminacao = titulos.length
    ? `${nfeConfig.servico.discriminacaoPadrao} — ${titulos.join(", ")}`
    : nfeConfig.servico.discriminacaoPadrao;

  await db.invoice.create({
    data: {
      orderId,
      provider: nfeConfig.provider,
      providerRef: `nfe_${orderId}`,
      status: "PENDING",
      amountCents: order.totalCents,
      discriminacao,
      customerName: order.user.name ?? "Cliente",
      customerEmail: order.user.email,
      customerDoc: doc,
    },
  });
}

function buildEmitInput(inv: {
  providerRef: string;
  amountCents: number;
  discriminacao: string;
  customerName: string;
  customerEmail: string;
  customerDoc: string | null;
}): NfeEmitInput {
  const doc = inv.customerDoc?.replace(/\D/g, "") || undefined;
  return {
    ref: inv.providerRef,
    valorCents: inv.amountCents,
    discriminacao: inv.discriminacao,
    tomador: {
      nome: inv.customerName,
      email: inv.customerEmail,
      documento: doc,
      tipoDocumento: doc ? (doc.length > 11 ? "CNPJ" : "CPF") : undefined,
    },
  };
}

export interface InvoiceBatchResult {
  skipped?: boolean;
  processed: number;
  authorized: number;
  emailed: number;
  failed: number;
  stillProcessing: number;
}

/**
 * Processa um lote de notas pendentes/em processamento.
 * - PENDING  → chama emitir() no provedor, vira PROCESSING.
 * - PROCESSING → consulta status; se autorizada, salva PDF e envia email.
 * Cada nota que erra tem `attempts` incrementado; ao passar de MAX_ATTEMPTS,
 * vira FAILED e para de ser reprocessada.
 */
export async function processInvoiceBatch(limit = 20): Promise<InvoiceBatchResult> {
  if (!nfeEnabled()) return { skipped: true, processed: 0, authorized: 0, emailed: 0, failed: 0, stillProcessing: 0 };

  const provider = getProvider();
  const pendentes = await db.invoice.findMany({
    where: { status: { in: ["PENDING", "PROCESSING"] }, attempts: { lt: MAX_ATTEMPTS } },
    orderBy: { createdAt: "asc" },
    take: limit,
  });

  const result: InvoiceBatchResult = {
    processed: 0,
    authorized: 0,
    emailed: 0,
    failed: 0,
    stillProcessing: 0,
  };

  for (const inv of pendentes) {
    result.processed++;
    try {
      // 1. Se ainda não foi enviada ao provedor, emite.
      if (inv.status === "PENDING") {
        const emit = await provider.emitir(buildEmitInput(inv));
        if (emit.status === "error") {
          throw new Error(emit.error ?? "Erro ao emitir");
        }
        await db.invoice.update({
          where: { id: inv.id },
          data: { status: "PROCESSING", attempts: { increment: 1 } },
        });
      }

      // 2. Consulta o status atual.
      const consulta = await provider.consultar(inv.providerRef);

      if (consulta.status === "authorized" && consulta.pdfUrl && consulta.numero) {
        await db.invoice.update({
          where: { id: inv.id },
          data: {
            status: "AUTHORIZED",
            numero: consulta.numero,
            externalId: consulta.externalId ?? inv.externalId,
            pdfUrl: consulta.pdfUrl,
            xmlUrl: consulta.xmlUrl ?? null,
            errorMessage: null,
          },
        });
        result.authorized++;

        // 3. Entrega o PDF por email (uma vez só).
        if (!inv.emailSentAt) {
          await sendNotaFiscal({
            to: inv.customerEmail,
            customerName: inv.customerName,
            numero: consulta.numero,
            pdfUrl: consulta.pdfUrl,
            amountCents: inv.amountCents,
          });
          await db.invoice.update({
            where: { id: inv.id },
            data: { emailSentAt: new Date() },
          });
          result.emailed++;
        }
      } else if (consulta.status === "error") {
        throw new Error(consulta.error ?? "Erro na autorização");
      } else {
        await db.invoice.update({
          where: { id: inv.id },
          data: { attempts: { increment: 1 } },
        });
        result.stillProcessing++;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const attempts = inv.attempts + 1;
      await db.invoice.update({
        where: { id: inv.id },
        data: {
          attempts: { increment: 1 },
          errorMessage: message.slice(0, 500),
          ...(attempts >= MAX_ATTEMPTS ? { status: "FAILED" } : {}),
        },
      });
      if (attempts >= MAX_ATTEMPTS) result.failed++;
    }
  }

  return result;
}

/** Reprocessa uma nota específica (usado pelo botão do admin). */
export async function retryInvoice(invoiceId: string): Promise<void> {
  const inv = await db.invoice.findUnique({ where: { id: invoiceId } });
  if (!inv) return;
  // Volta para a fila e zera as tentativas.
  await db.invoice.update({
    where: { id: invoiceId },
    data: {
      status: inv.numero ? "AUTHORIZED" : "PENDING",
      attempts: 0,
      errorMessage: null,
    },
  });
  await processInvoiceBatch(1);
}
