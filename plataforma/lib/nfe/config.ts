/**
 * Configuração fiscal centralizada para emissão de NFS-e.
 *
 * Tudo vem de variáveis de ambiente. Enquanto `NFE_ENABLED` não for "true",
 * o sistema inteiro de nota fiscal fica em no-op: os webhooks não criam nota,
 * o cron não processa nada. Isso permite subir o código para produção com
 * segurança antes de ter provedor/dados fiscais definidos — nada quebra o
 * fluxo de pagamento.
 *
 * Preencha estes valores quando escolher o provedor e tiver a configuração
 * fiscal completa (CNPJ, inscrição municipal, código do serviço, alíquota ISS).
 */
export const nfeConfig = {
  enabled: process.env.NFE_ENABLED === "true",
  provider: (process.env.NFE_PROVIDER ?? "focusnfe").toLowerCase(),

  focusnfe: {
    baseUrl: process.env.FOCUSNFE_BASE_URL ?? "https://api.focusnfe.com.br",
    token: process.env.FOCUSNFE_TOKEN ?? "",
  },

  asaas: {
    // produção: https://api.asaas.com/v3 · sandbox: https://api-sandbox.asaas.com/v3
    baseUrl: process.env.ASAAS_BASE_URL ?? "https://api.asaas.com/v3",
    apiKey: process.env.ASAAS_API_KEY ?? "",
    // Serviço municipal cadastrado no Asaas (um dos três identifica o serviço).
    municipalServiceId: process.env.ASAAS_MUNICIPAL_SERVICE_ID ?? "",
    municipalServiceCode: process.env.ASAAS_MUNICIPAL_SERVICE_CODE ?? "",
    municipalServiceName: process.env.ASAAS_MUNICIPAL_SERVICE_NAME ?? "",
  },

  /** Dados do emitente (prestador do serviço) — a sua empresa. */
  emitente: {
    cnpj: (process.env.NFE_CNPJ ?? "").replace(/\D/g, ""),
    inscricaoMunicipal: process.env.NFE_INSCRICAO_MUNICIPAL ?? "",
    codigoMunicipioIbge: process.env.NFE_CODIGO_MUNICIPIO_IBGE ?? "",
  },

  /** Dados do serviço prestado (assinatura/curso). */
  servico: {
    itemListaServico: process.env.NFE_ITEM_LISTA_SERVICO ?? "",
    codigoTributarioMunicipio: process.env.NFE_CODIGO_TRIBUTARIO_MUNICIPIO ?? "",
    aliquotaIss: Number(process.env.NFE_ALIQUOTA_ISS ?? "0"), // ex: 2 = 2%
    issRetido: process.env.NFE_ISS_RETIDO === "true",
    // Simples Nacional na maioria dos casos; ajuste se lucro presumido/real.
    simplesNacional: process.env.NFE_SIMPLES_NACIONAL !== "false",
    discriminacaoPadrao:
      process.env.NFE_DISCRIMINACAO ??
      "Assinatura de plataforma de conteúdo clínico (Rotina Clínica)",
  },
} as const;

export function nfeEnabled(): boolean {
  return nfeConfig.enabled;
}
