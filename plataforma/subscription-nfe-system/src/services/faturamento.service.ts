import { PagamentoConfirmado } from "../types/domain";
import { emitirNotaFiscal, aguardarNotaFicarPronta } from "./nfe.service";
import { enviarEmailComNota } from "./email.service";

/**
 * PONTO CENTRAL DO SISTEMA.
 *
 * Tanto o webhook do Stripe quanto o do Mercado Pago, depois de
 * normalizar o evento recebido, chamam APENAS esta funcao.
 * Ela nao sabe (nem precisa saber) de qual gateway veio o pagamento.
 *
 * Isso evita duplicar a logica de nota fiscal + email em dois lugares
 * e facilita adicionar um terceiro gateway no futuro, se precisar.
 */
export async function processarPagamentoConfirmado(
  pagamento: PagamentoConfirmado
): Promise<void> {
  console.log(
    `[faturamento] processando pagamento ${pagamento.gatewayPaymentId} (${pagamento.gateway})`
  );

  // 1. Idempotencia: evita emitir nota duplicada se o gateway reenviar o webhook
  const jaProcessado = await verificarSeJaProcessado(pagamento.gatewayPaymentId);
  if (jaProcessado) {
    console.log(`[faturamento] pagamento ${pagamento.gatewayPaymentId} ja processado, ignorando`);
    return;
  }

  // 2. Emite a nota fiscal no provedor externo
  const notaSolicitada = await emitirNotaFiscal(pagamento);

  // 3. Aguarda a nota ficar pronta (emissao costuma ser assincrona)
  const nota = await aguardarNotaFicarPronta(notaSolicitada.id);

  // 4. Envia por email com o PDF anexado
  await enviarEmailComNota(pagamento, nota);

  // 5. Marca como processado no seu banco de dados
  await marcarComoProcessado(pagamento, nota);

  console.log(`[faturamento] nota ${nota.numero} emitida e enviada para ${pagamento.cliente.email}`);
}

/**
 * TODO: substituir por consulta real ao seu banco (Postgres/Supabase/etc).
 * Guarde o gatewayPaymentId como chave unica para garantir idempotencia.
 */
async function verificarSeJaProcessado(_gatewayPaymentId: string): Promise<boolean> {
  return false;
}

/**
 * TODO: substituir por insert real no seu banco, salvando:
 * gatewayPaymentId, numero da nota, url do PDF, status, timestamps.
 */
async function marcarComoProcessado(
  _pagamento: PagamentoConfirmado,
  _nota: { numero: string; urlPdf: string }
): Promise<void> {
  // placeholder
}
