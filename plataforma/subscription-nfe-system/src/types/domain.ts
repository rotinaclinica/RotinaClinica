/**
 * Representa um pagamento confirmado, ja normalizado,
 * independente de ter vindo do Stripe ou do Mercado Pago.
 *
 * Este e o "contrato" que faz os dois gateways convergirem
 * para a mesma logica de nota fiscal + email.
 */
export interface PagamentoConfirmado {
  gateway: "stripe" | "mercadopago";
  gatewayPaymentId: string;
  gatewaySubscriptionId: string;

  valorEmCentavos: number;
  moeda: string; // ex: "BRL"

  cliente: {
    nome: string;
    email: string;
    documento: string; // CPF ou CNPJ
    tipoDocumento: "CPF" | "CNPJ";
  };

  descricaoServico: string;
  dataPagamento: string; // ISO 8601
}

export interface NotaFiscalEmitida {
  id: string;
  numero: string;
  urlPdf: string;
  urlXml?: string;
  status: "autorizada" | "processando" | "erro";
}
