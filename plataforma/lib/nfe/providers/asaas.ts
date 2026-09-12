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

async function extractError(res: Response, fallback: string): Promise<string> {
  try {
    const body = await res.json();
    const detail = body?.errors?.[0]?.description ?? body?.message ?? "";
    return detail ? `${fallback}: ${detail}` : `${fallback} (HTTP ${res.status})`;
  } catch {
    return `${fallback} (HTTP ${res.status})`;
  }
}

/**
 * Consulta a API ViaCEP para obter endereço completo a partir do CEP.
 */
async function lookupCep(cep: string): Promise<{
  address: string;
  province: string;
  cityName: string;
  state: string;
} | null> {
  if (!cep || cep.length !== 8) return null;
  try {
    const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.erro) return null;
    return {
      address: data.logradouro || "Não informado",
      province: data.bairro || "Não informado",
      cityName: data.localidade || "",
      state: data.uf || "",
    };
  } catch {
    return null;
  }
}

/**
 * Busca um cliente existente no Asaas pelo CPF/CNPJ.
 * Retorna o id se encontrado, null caso contrário.
 */
async function findCustomerByDoc(doc: string): Promise<string | null> {
  if (!doc) return null;
  const base = nfeConfig.asaas.baseUrl;
  const res = await fetch(`${base}/customers?cpfCnpj=${encodeURIComponent(doc)}`, {
    headers: headers(),
  });
  if (!res.ok) return null;
  const data = await res.json().catch(() => ({}));
  return data?.data?.[0]?.id ?? null;
}

export const asaasProvider: NfeProvider = {
  nome: "asaas",

  async emitir(input: NfeEmitInput): Promise<{ status: NfeStatus; externalId?: string; error?: string }> {
    const base = nfeConfig.asaas.baseUrl;
    const doc = input.tomador.documento?.replace(/\D/g, "") ?? "";

    // 1. Reutiliza cliente existente ou cria um novo.
    let customerId: string | null = null;

    if (doc) {
      customerId = await findCustomerByDoc(doc);
    }

    // Se cliente já existe, atualiza endereço (pode estar incompleto)
    if (customerId) {
      const cep = input.tomador.cep?.replace(/\D/g, "") ?? "";
      const addr = cep ? await lookupCep(cep) : null;
      if (addr) {
        await fetch(`${base}/customers/${customerId}`, {
          method: "PUT",
          headers: headers(),
          body: JSON.stringify({
            postalCode: cep,
            address: addr.address,
            addressNumber: "S/N",
            province: addr.province,
            cityName: addr.cityName,
            state: addr.state,
          }),
        }).catch(() => {});
      }
    }

    if (!customerId) {
      const cep = input.tomador.cep?.replace(/\D/g, "") ?? "";
      const addr = cep ? await lookupCep(cep) : null;

      const custBody: Record<string, unknown> = {
        name: input.tomador.nome,
        email: input.tomador.email,
        externalReference: input.ref,
      };
      if (doc) custBody.cpfCnpj = doc;
      if (cep) custBody.postalCode = cep;
      if (addr) {
        custBody.address = addr.address;
        custBody.addressNumber = "S/N";
        custBody.province = addr.province;
        custBody.cityName = addr.cityName;
        custBody.state = addr.state;
      }

      const custRes = await fetch(`${base}/customers`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify(custBody),
      });

      if (!custRes.ok) {
        const err = await extractError(custRes, "Erro ao criar cliente no Asaas");
        // Se for conflito (cliente já existe), tenta buscar novamente
        if (custRes.status === 409 && doc) {
          customerId = await findCustomerByDoc(doc);
        }
        if (!customerId) {
          return { status: "error", error: err };
        }
      } else {
        const customer = await custRes.json();
        customerId = customer.id;
      }
    }

    // 2. Cria a nota fiscal (invoice) vinculada ao cliente (avulsa, sem cobrança).
    const invBody: Record<string, unknown> = {
      customer: customerId,
      serviceDescription: input.discriminacao,
      observations: input.discriminacao,
      value: input.valorCents / 100,
      deductions: 0,
      effectiveDate: new Date().toISOString().slice(0, 10),
      externalReference: input.ref,
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
    if (nfeConfig.asaas.municipalServiceId) invBody.municipalServiceId = nfeConfig.asaas.municipalServiceId;
    if (nfeConfig.asaas.municipalServiceCode) invBody.municipalServiceCode = nfeConfig.asaas.municipalServiceCode;
    if (nfeConfig.asaas.municipalServiceName) invBody.municipalServiceName = nfeConfig.asaas.municipalServiceName;

    const invRes = await fetch(`${base}/invoices`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(invBody),
    });
    if (!invRes.ok) {
      return { status: "error", error: await extractError(invRes, "Erro ao criar nota no Asaas") };
    }
    const invoice = await invRes.json();

    // 3. Autoriza (emite) a nota.
    const authRes = await fetch(`${base}/invoices/${invoice.id}/authorize`, {
      method: "POST",
      headers: headers(),
    });

    if (!authRes.ok) {
      const authErr = await extractError(authRes, "Erro ao autorizar nota no Asaas");
      // Nota foi criada mas não autorizada — retornamos o externalId para
      // podermos consultar/reprocessar depois, junto com o erro.
      return { status: "error", externalId: invoice.id, error: authErr };
    }

    const authorized = await authRes.json().catch(() => ({}));
    const status = mapStatus(authorized?.status);

    if (status === "error") {
      const msg = authorized?.errorMessage ?? authorized?.rejectMessage ?? "Nota rejeitada pelo Asaas";
      return { status: "error", externalId: invoice.id, error: msg };
    }

    return { status, externalId: invoice.id };
  },

  async consultar(ref: string): Promise<NfeConsultaResult> {
    const res = await fetch(`${nfeConfig.asaas.baseUrl}/invoices/${encodeURIComponent(ref)}`, {
      headers: headers(),
    });

    if (!res.ok) {
      const err = await extractError(res, "Erro ao consultar nota no Asaas");
      return { status: "error", error: err };
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
      return {
        status,
        error: data?.errorMessage ?? data?.rejectMessage ?? `Nota rejeitada (status Asaas: ${data?.status ?? "desconhecido"})`,
      };
    }

    // Ainda processando — inclui o status real do Asaas para diagnóstico
    return { status: "processing", error: `Aguardando prefeitura (status Asaas: ${data?.status ?? "desconhecido"})` };
  },
};
