import "dotenv/config";

/**
 * Centraliza a leitura das variaveis de ambiente.
 * Se alguma variavel obrigatoria estiver faltando, o servidor
 * falha ja na inicializacao (fail fast) em vez de quebrar depois,
 * no meio de um webhook de pagamento.
 */
function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Variavel de ambiente obrigatoria ausente: ${name}`);
  }
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 3000),

  stripe: {
    secretKey: required("STRIPE_SECRET_KEY"),
    webhookSecret: required("STRIPE_WEBHOOK_SECRET"),
  },

  mercadoPago: {
    accessToken: required("MP_ACCESS_TOKEN"),
    webhookSecret: process.env.MP_WEBHOOK_SECRET ?? "",
  },

  nfe: {
    baseUrl: required("NFE_PROVIDER_BASE_URL"),
    token: required("NFE_PROVIDER_TOKEN"),
    cnpj: required("NFE_EMPRESA_CNPJ"),
  },

  email: {
    resendApiKey: required("RESEND_API_KEY"),
    from: required("EMAIL_FROM"),
  },
};
