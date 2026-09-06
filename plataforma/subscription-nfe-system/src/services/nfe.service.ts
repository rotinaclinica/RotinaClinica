import axios from "axios";
import { env } from "../config/env";
import { NotaFiscalEmitida, PagamentoConfirmado } from "../types/domain";

/**
 * Integracao com provedor de emissao de NFe/NFS-e (ex: Focus NFe, NFe.io, PlugNotas).
 * Trocar de provedor no futuro deve exigir mudar SOMENTE este arquivo.
 *
 * IMPORTANTE: o formato exato do payload varia por provedor e por
 * municipio (no caso de NFS-e). Ajuste os campos abaixo conforme a
 * documentacao do provedor escolhido antes de ir para producao.
 */

const nfeClient = axios.create({
  baseURL: env.nfe.baseUrl,
  auth: { username: env.nfe.token, password: "" },
  timeout: 15_000,
});

export async function emitirNotaFiscal(
  pagamento: PagamentoConfirmado
): Promise<NotaFiscalEmitida> {
  const valorEmReais = pagamento.valorEmCentavos / 100;

  const payload = {
    cnpj_emitente: env.nfe.cnpj,
    data_emissao: pagamento.dataPagamento,
    discriminacao: pagamento.descricaoServico,
    valor_servicos: valorEmReais.toFixed(2),
    tomador: {
      nome: pagamento.cliente.nome,
      email: pagamento.cliente.email,
      cpf: pagamento.cliente.tipoDocumento === "CPF" ? pagamento.cliente.documento : undefined,
      cnpj: pagamento.cliente.tipoDocumento === "CNPJ" ? pagamento.cliente.documento : undefined,
    },
    // referencia externa para rastrear a nota ate o pagamento que a originou
    ref: `${pagamento.gateway}_${pagamento.gatewayPaymentId}`,
  };

  const response = await nfeClient.post("/v2/nfse", payload);

  return {
    id: response.data.ref ?? response.data.id,
    numero: response.data.numero ?? "pendente",
    urlPdf: response.data.url ?? response.data.caminho_pdf,
    urlXml: response.data.caminho_xml_nota_fiscal,
    status: response.data.status === "autorizado" ? "autorizada" : "processando",
  };
}

/**
 * Provedores de NFe costumam emitir de forma assincrona.
 * Esta funcao consulta o status ate a nota sair (ou falhar),
 * para so entao disparar o email com o PDF anexado.
 */
export async function aguardarNotaFicarPronta(
  ref: string,
  tentativas = 10,
  intervaloMs = 3000
): Promise<NotaFiscalEmitida> {
  for (let i = 0; i < tentativas; i++) {
    const { data } = await nfeClient.get(`/v2/nfse/${ref}`);

    if (data.status === "autorizado") {
      return {
        id: ref,
        numero: data.numero,
        urlPdf: data.caminho_pdf ?? data.url,
        urlXml: data.caminho_xml_nota_fiscal,
        status: "autorizada",
      };
    }

    if (data.status === "erro_autorizacao") {
      throw new Error(`Falha na emissao da NFe ${ref}: ${data.mensagem_sefaz ?? "erro desconhecido"}`);
    }

    await new Promise((resolve) => setTimeout(resolve, intervaloMs));
  }

  throw new Error(`Timeout aguardando emissao da NFe ${ref}`);
}
