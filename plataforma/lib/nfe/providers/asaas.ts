import { nfeConfig } from "../config";
import type { NfeConsultaResult, NfeEmitInput, NfeProvider, NfeStatus } from "../types";

/**
 * Adapter do Asaas (https://asaas.com) para NFS-e.
 *
 * O Asaas emite nota fiscal de serviço via API mesmo quando o pagamento não
 * passou por ele (nota "avulsa"): basta um cadastro PJ aprovado e a autorização
 * da prefeitura. Fluxo: cria/reutiliza um cliente → cria a nota (invoice) →
 * autoriza. A nota tem um id próprio do Asaas, guardado como `externalId`.
 *
 * Autenticação: header `access_token` com a API key.
 * Base: produção https://api.asaas.com/v3 · sandbox https://api-sandbox.asaas.com/v3
 */

function headers(): Record<string, string> {
  return { access_token: nfeConfig.asaas.apiKey, "Content-Type": "application/json" };
}

// Status possíveis do Asaas: SCHEDULED, SYNCHRONIZED, AUTHORIZED, PROCESSING_CANCELLATION,
// CANCELED, CANCELLATION_DENIED, ERROR.
function mapStatus(s: string | undefined): NfeStatus {
  switch (s) {
    case "AUTHORIZED":
      return "authorized";
    case "ERROR":
    case "CANCELED":
    case "CANCELLATION_DENIED":
      return "error";
    default:
      return "processing";
  }
}

async function firstError(res: Response, fallback: string): Promise<string> {
  const body = await res.json().catch(() => ({}));
  return body?.errors?.[0]?.description ?? body?.message ?? `${fallback} (HTTP ${res.status})`;
}

export const asaasProvider: NfeProvider = {
  nome: "asaas",

  async emitir(input: NfeEmitInput): Promise<{ status: NfeStatus; externalId?: string; error?: string }> {
    const base = nfeConfig.asaas.baseUrl;
    const doc = input.tomador.documento?.replace(/\D/g, "") ?? "";

    // 1. Cria o cliente (tomador) no Asaas.
    const custRes = await fetch(`${base}/customers`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({
        name: input.tomador.nome,
        email: input.tomador.email,
        cpfCnpj: doc,
        externalReference: input.ref,
      }),
    });
    if (!custRes.ok) {
      return { status: "error", error: await firstError(custRes, "Erro ao criar cliente no Asaas") };
    }
    const customer = await custRes.json();

    // 2. Cria a nota fiscal (invoice) vinculada ao cliente (avulsa, sem cobrança).
    const invBody = {
      customer: customer.id,
      serviceDescription: input.discriminacao,
      observations: input.discriminacao,
      value: input.valorCents / 100,
      deductions: 0,
      effectiveDate: new Date().toISOString().slice(0, 10),
      externalReference: input.ref,
      ...(nfeConfig.asaas.municipalServiceId ? { municipalServiceId: nfeConfig.asaas.municipalServiceId } : {}),
      ...(nfeConfig.asaas.municipalServiceCode ? { municipalServiceCode: nfeConfig.asaas.municipalServiceCode } : {}),
      ...(nfeConfig.asaas.municipalServiceName ? { municipalServiceName: nfeConfig.asaas.municipalServiceName } : {}),
      taxes: {
        retainIss: nfeConfig.servico.issRetido,
        iss: nfeConfig.servico.aliquotaIss,
        cofins: 0,
        csll: 0,
        inss: 0,
        ir: 0,
        pis: 0,
      },
    };
    const invRes = await fetch(`${base}/invoices`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(invBody),
    });
    if (!invRes.ok) {
      return { status: "error", error: await firstError(invRes, "Erro ao criar nota no Asaas") };
    }
    const invoice = await invRes.json();

    // 3. Autoriza (emite) a nota. Se a autorização falhar aqui, ainda guardamos
    //    o id — o cron reconsulta e o painel admin permite reprocessar.
    const authRes = await fetch(`${base}/invoices/${invoice.id}/authorize`, {
      method: "POST",
      headers: headers(),
    });
    let status: NfeStatus = "processing";
    if (authRes.ok) {
      const authorized = await authRes.json().catch(() => ({}));
      status = mapStatus(authorized?.status);
    }

    return { status, externalId: invoice.id };
  },

  async consultar(ref: string): Promise<NfeConsultaResult> {
    const res = await fetch(`${nfeConfig.asaas.baseUrl}/invoices/${encodeURIComponent(ref)}`, {
      headers: headers(),
    });
    if (!res.ok) {
      return { status: "processing" };
    }

    const data = await res.json().catch(() => ({}));
    const status = mapStatus(data?.status);

    if (status === "authorized") {
      return {
        status,
        numero: data?.number ? String(data.number) : undefined,
        externalId: data?.id,
        pdfUrl: data?.pdfUrl ?? undefined,
        xmlUrl: data?.xmlUrl ?? undefined,
      };
    }

    if (status === "error") {
      return { status, error: data?.errorMessage ?? data?.rejectMessage ?? "Erro na emissão da nota" };
    }

    return { status: "processing" };
  },
};
