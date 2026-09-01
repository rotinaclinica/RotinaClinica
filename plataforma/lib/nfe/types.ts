/**
 * Contrato agnóstico de provedor de NFS-e.
 *
 * Trocar de provedor (Focus NFe → NFe.io → PlugNotas) deve exigir mudar
 * SOMENTE um arquivo em lib/nfe/providers/. O resto do sistema (webhooks,
 * cron, admin) fala apenas com esta interface.
 */

export type NfeStatus = "processing" | "authorized" | "error";

export interface NfeEmitInput {
  /** Chave de idempotência única (usamos `nfe_<orderId>`). */
  ref: string;
  valorCents: number;
  discriminacao: string;
  tomador: {
    nome: string;
    email: string;
    documento?: string; // CPF ou CNPJ (só dígitos)
    tipoDocumento?: "CPF" | "CNPJ";
  };
}

export interface NfeConsultaResult {
  status: NfeStatus;
  numero?: string;
  pdfUrl?: string;
  xmlUrl?: string;
  externalId?: string;
  error?: string;
}

export interface NfeProvider {
  readonly nome: string;
  /** Solicita a emissão. Retorna o status inicial (quase sempre "processing"). */
  emitir(input: NfeEmitInput): Promise<{ status: NfeStatus; error?: string }>;
  /** Consulta o status atual da nota pela `ref`. */
  consultar(ref: string): Promise<NfeConsultaResult>;
}
