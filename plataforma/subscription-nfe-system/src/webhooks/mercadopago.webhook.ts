import { Request, Response } from "express";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { env } from "../config/env";
import { processarPagamentoConfirmado } from "../services/faturamento.service";
import { PagamentoConfirmado } from "../types/domain";

const mpClient = new MercadoPagoConfig({ accessToken: env.mercadoPago.accessToken });
const paymentApi = new Payment(mpClient);

/**
 * O Mercado Pago manda uma notificacao leve (so o ID) e espera que
 * voce busque os detalhes completos via API antes de agir.
 * Formato tipico do body: { type: "payment", data: { id: "123456" } }
 */
export async function mercadoPagoWebhookHandler(req: Request, res: Response) {
  const { type, data } = req.body;

  // Responde 200 imediatamente para o MP nao reenviar por timeout,
  // mesmo que o processamento abaixo demore
  res.status(200).json({ received: true });

  if (type !== "payment") {
    return;
  }

  try {
    const payment = await paymentApi.get({ id: data.id });

    if (payment.status !== "approved") {
      console.log(`[mp-webhook] pagamento ${data.id} com status ${payment.status}, ignorando`);
      return;
    }

    const pagamento = normalizarPagamentoMercadoPago(payment);
    await processarPagamentoConfirmado(pagamento);
  } catch (err) {
    console.error("[mp-webhook] erro ao processar pagamento:", err);
    // Nao ha retry automatico aqui pois ja respondemos 200.
    // Idealmente, registrar em uma fila/log para reprocessamento manual.
  }
}

function normalizarPagamentoMercadoPago(payment: any): PagamentoConfirmado {
  const documento = payment.payer?.identification?.number ?? "";
  const tipoDocumento = payment.payer?.identification?.type === "CNPJ" ? "CNPJ" : "CPF";

  return {
    gateway: "mercadopago",
    gatewayPaymentId: String(payment.id),
    gatewaySubscriptionId: payment.metadata?.preapproval_id ?? "",
    valorEmCentavos: Math.round(payment.transaction_amount * 100),
    moeda: payment.currency_id ?? "BRL",
    cliente: {
      nome: `${payment.payer?.first_name ?? ""} ${payment.payer?.last_name ?? ""}`.trim() || "Cliente",
      email: payment.payer?.email ?? "",
      documento,
      tipoDocumento,
    },
    descricaoServico: payment.description ?? "Assinatura",
    dataPagamento: payment.date_approved ?? new Date().toISOString(),
  };
}
