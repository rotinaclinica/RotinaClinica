import { Resend } from "resend";
import { escapeHtml } from "@/lib/escape";

const resend = new Resend(process.env.RESEND_API_KEY ?? "re_placeholder");
const FROM = "Rotina Clínica <contato@rotinaclinica.com>";

/**
 * Renovação automática (cartão) que não passou: avisa o assinante com o link da
 * própria cobrança no Asaas, onde ele paga com outro cartão ou Pix sem refazer
 * a assinatura. Antes, esse assinante só perdia o acesso no vencimento.
 */
export async function sendCobrancaRecusada(params: {
  to: string;
  name: string;
  valueCents: number;
  invoiceUrl: string;
  motivo: "recusado" | "vencido";
}) {
  const first = (params.name ?? "").trim().split(/\s+/)[0] ?? "";
  const valor = (params.valueCents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const titulo =
    params.motivo === "recusado"
      ? "Não conseguimos renovar sua assinatura"
      : "A renovação da sua assinatura está pendente";
  const texto =
    params.motivo === "recusado"
      ? `A cobrança de <strong>${valor}</strong> da sua assinatura foi recusada pelo cartão. Isso acontece com cartão vencido, limite ou bloqueio do banco.`
      : `A cobrança de <strong>${valor}</strong> da sua assinatura ainda não foi paga.`;

  await resend.emails.send({
    from: FROM,
    to: params.to,
    subject: titulo,
    html: `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0f5f9;font-family:sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #dde6ef">
        <tr><td style="background:#0f2d4a;padding:28px 32px">
          <p style="margin:0 0 4px;color:#3db8d4;font-size:12px;font-weight:600;letter-spacing:2px;text-transform:uppercase">Rotina Clínica</p>
          <p style="margin:0;color:#fff;font-size:20px;font-weight:700">${titulo}</p>
        </td></tr>
        <tr><td style="padding:32px">
          <p style="margin:0 0 12px;color:#0f2d4a;font-size:16px">Olá${first ? `, <strong>${escapeHtml(first)}</strong>` : ""}!</p>
          <p style="margin:0 0 12px;color:#64748b;font-size:15px;line-height:1.6">${texto}</p>
          <p style="margin:0 0 24px;color:#64748b;font-size:15px;line-height:1.6">Para não perder o acesso às condutas, evoluções e calculadoras, é só pagar pelo link abaixo, com outro cartão ou Pix. Leva menos de um minuto e sua assinatura continua normalmente.</p>
          <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
            <a href="${params.invoiceUrl}" style="display:inline-block;background:#3db8d4;color:#fff;text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:600;font-size:15px">Regularizar pagamento →</a>
          </td></tr></table>
          <p style="margin:24px 0 0;color:#0f2d4a;font-size:14px;line-height:1.6">Um abraço,<br><strong>Lucas e Yan</strong> · Rotina Clínica</p>
          <p style="margin:20px 0 0;color:#94a3b8;font-size:12px;text-align:center">Se você já pagou, pode ignorar este e-mail. Dúvidas: contato@rotinaclinica.com</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  });
}
