import { nfeConfig } from "../config";
import type { NfeConsultaResult, NfeEmitInput, NfeProvider, NfeStatus } from "../types";

/**
 * Adapter da Focus NFe (https://focusnfe.com.br) para NFS-e.
 *
 * REFERÊNCIA / PONTO DE AJUSTE: o formato exato do payload de NFS-e varia por
 * município. Ao contratar o provedor e ter os dados fiscais, valide os campos
 * de `servico`/`prestador` contra a doc da Focus e a prefeitura. Nenhum outro
 * arquivo precisa mudar — só este.
 *
 * Autenticação: HTTP Basic com o token como usuário e senha vazia.
 */

function authHeader(): string {
  return "Basic " + Buffer.from(`${nfeConfig.focusnfe.token}:`).toString("base64");
}

function mapStatus(focusStatus: string | undefined): NfeStatus {
  switch (focusStatus) {
    case "autorizado":
      return "authorized";
    case "erro_autorizacao":
    case "cancelado":
      return "error";
    default:
      // processando_autorizacao, em_processamento, etc.
      return "processing";
  }
}

export const focusNfeProvider: NfeProvider = {
  nome: "focusnfe",

  async emitir(input: NfeEmitInput): Promise<{ status: NfeStatus; error?: string }> {
    const valorReais = (input.valorCents / 100).toFixed(2);
    const doc = input.tomador.documento?.replace(/\D/g, "") ?? "";

    const payload = {
      data_emissao: new Date().toISOString(),
      prestador: {
        cnpj: nfeConfig.emitente.cnpj,
        inscricao_municipal: nfeConfig.emitente.inscricaoMunicipal,
        codigo_municipio: nfeConfig.emitente.codigoMunicipioIbge,
      },
      tomador: {
        ...(input.tomador.tipoDocumento === "CNPJ" ? { cnpj: doc } : {}),
        ...(input.tomador.tipoDocumento === "CPF" ? { cpf: doc } : {}),
        razao_social: input.tomador.nome,
        email: input.tomador.email,
      },
      servico: {
        aliquota: nfeConfig.servico.aliquotaIss,
        discriminacao: input.discriminacao,
        iss_retido: nfeConfig.servico.issRetido,
        item_lista_servico: nfeConfig.servico.itemListaServico,
        codigo_tributario_municipio: nfeConfig.servico.codigoTributarioMunicipio,
        valor_servicos: valorReais,
      },
    };

    const res = await fetch(
      `${nfeConfig.focusnfe.baseUrl}/v2/nfse?ref=${encodeURIComponent(input.ref)}`,
      {
        method: "POST",
        headers: { Authorization: authHeader(), "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    // Focus responde 202 (aceito p/ processamento) ou 4xx com { erros }.
    if (res.status === 202 || res.ok) {
      const data = await res.json().catch(() => ({}));
      return { status: mapStatus(data?.status) };
    }

    const err = await res.json().catch(() => ({}));
    const msg =
      err?.erros?.[0]?.mensagem ?? err?.mensagem ?? `HTTP ${res.status} ao emitir NFS-e`;
    return { status: "error", error: msg };
  },

  async consultar(ref: string): Promise<NfeConsultaResult> {
    const res = await fetch(
      `${nfeConfig.focusnfe.baseUrl}/v2/nfse/${encodeURIComponent(ref)}`,
      { headers: { Authorization: authHeader() } }
    );

    if (!res.ok) {
      return { status: "processing" }; // pode ainda não existir; tenta de novo depois
    }

    const data = await res.json().catch(() => ({}));
    const status = mapStatus(data?.status);

    if (status === "authorized") {
      return {
        status,
        numero: data?.numero ? String(data.numero) : undefined,
        externalId: data?.ref ?? undefined,
        pdfUrl: data?.url_danfse ?? data?.url ?? undefined,
        xmlUrl: data?.caminho_xml_nota_fiscal ?? undefined,
      };
    }

    if (status === "error") {
      return {
        status,
        error: data?.mensagem_sefaz ?? data?.erros?.[0]?.mensagem ?? "Erro na autorização",
      };
    }

    return { status: "processing" };
  },
};
