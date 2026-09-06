import { Request, Response } from "express";
import Stripe from "stripe";
import { env } from "../config/env";
import { processarPagamentoConfirmado } from "../services/faturamento.service";
import { PagamentoConfirmado } from "../types/domain";

const stripe = new Stripe(env.stripe.secretKey);

/**
 * IMPORTANTE: esta rota precisa receber o body RAW (nao parseado como JSON),
 * pois o Stripe valida a assinatura sobre os bytes originais.
 * Veja a configuracao em server.ts (express.raw() so nesta rota).
 */
export async function stripeWebhookHandler(req: Request, res: Response) {
  const signature = req.headers["stripe-signature"];

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body, // Buffer cru
      signature as string,
      env.stripe.webhookSecret
    );
  } catch (err) {
    console.error("[stripe-webhook] assinatura invalida:", err);
    return res.status(400).send("Assinatura invalida");
  }

  // Evento relevante: fatura de assinatura paga com sucesso
  if (event.type === "invoice.payment_succeeded") {
    const invoice = event.data.object as Stripe.Invoice;

    try {
      const pagamento = await normalizarPagamentoStripe(invoice);
      await processarPagamentoConfirmado(pagamento);
    } catch (err) {
      console.error("[stripe-webhook] erro ao processar pagamento:", err);
      // Retorna 500 para o Stripe tentar reenviar o webhook depois
      return res.status(500).send("Erro ao processar");
    }
  }

  // Sempre responder 200 rapido para eventos que voce nao trata,
  // senao o Stripe fica reenviando
  res.status(200).json({ received: true });
}

async function normalizarPagamentoStripe(invoice: Stripe.Invoice): Promise<PagamentoConfirmado> {
  const customer = await stripe.customers.retrieve(invoice.customer as string);

  if (customer.deleted) {
    throw new Error("Cliente Stripe foi deletado, nao e possivel emitir nota");
  }

  // Ajuste os metadados abaixo conforme como voce cadastra CPF/CNPJ do
  // cliente no Stripe (geralmente em customer.metadata na criacao)
  const documento = customer.metadata?.documento ?? "";
  const tipoDocumento = documento.length > 11 ? "CNPJ" : "CPF";

  return {
    gateway: "stripe",
    gatewayPaymentId: invoice.id,
    gatewaySubscriptionId: (invoice.subscription as string) ?? "",
    valorEmCentavos: invoice.amount_paid,
    moeda: invoice.currency.toUpperCase(),
    cliente: {
      nome: customer.name ?? "Cliente",
      email: customer.email ?? "",
      documento,
      tipoDocumento,
    },
    descricaoServico: invoice.lines.data[0]?.description ?? "Assinatura",
    dataPagamento: new Date(invoice.status_transitions.paid_at! * 1000).toISOString(),
  };
}
