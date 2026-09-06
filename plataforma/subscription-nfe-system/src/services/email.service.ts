import { Resend } from "resend";
import { env } from "../config/env";
import { NotaFiscalEmitida, PagamentoConfirmado } from "../types/domain";

const resend = new Resend(env.email.resendApiKey);

export async function enviarEmailComNota(
  pagamento: PagamentoConfirmado,
  nota: NotaFiscalEmitida
): Promise<void> {
  const valorFormatado = (pagamento.valorEmCentavos / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: pagamento.moeda === "BRL" ? "BRL" : pagamento.moeda,
  });

  await resend.emails.send({
    from: env.email.from,
    to: pagamento.cliente.email,
    subject: `Nota fiscal referente ao pagamento de ${valorFormatado}`,
    html: `
      <p>Ola, ${pagamento.cliente.nome},</p>
      <p>Recebemos seu pagamento de <strong>${valorFormatado}</strong> referente a
      "${pagamento.descricaoServico}".</p>
      <p>A nota fiscal (numero ${nota.numero}) segue anexada a este email.</p>
      <p>Qualquer duvida, e so responder este email.</p>
    `,
    attachments: [
      {
        filename: `nota-fiscal-${nota.numero}.pdf`,
        path: nota.urlPdf,
      },
    ],
  });
}
