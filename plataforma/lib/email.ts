import { Resend } from "resend";
import { escapeHtml } from "@/lib/escape";

const resend = new Resend(process.env.RESEND_API_KEY ?? "re_placeholder");
const FROM = "Rotina Clínica <contato@rotinaclinica.com>";

export async function sendPurchaseConfirmation({
  to,
  customerName,
  productTitle,
  productType,
  dashboardUrl,
}: {
  to: string;
  customerName: string;
  productTitle: string;
  productType: "COURSE" | "DOWNLOAD" | "EBOOK_FREE" | "SUBSCRIPTION";
  dashboardUrl: string;
}) {
  const isSubscription = productType === "SUBSCRIPTION";
  const subject = isSubscription
    ? "Bem-vindo ao Rotina Clínica — sua assinatura está ativa!"
    : `Seu acesso a "${productTitle}" está liberado!`;

  const headline = isSubscription ? "Assinatura ativa ✅" : "Acesso liberado ✅";
  const body = isSubscription
    ? `Seu pagamento foi confirmado e você já tem acesso completo à plataforma Rotina Clínica — prescrições, calculadoras, cursos e materiais à disposição.`
    : `Seu pagamento foi confirmado e o acesso a <strong>${escapeHtml(productTitle)}</strong> já está disponível na sua área.`;

  const actionLabel = isSubscription ? "Acessar a plataforma" : productType === "COURSE" ? "Acessar curso" : "Baixar arquivo";

  await resend.emails.send({
    from: FROM,
    to,
    subject,
    html: `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #dde6ef">

        <!-- Header -->
        <tr>
          <td style="background:#0f2d4a;padding:36px 40px">
            <p style="margin:0 0 4px;color:#3db8d4;font-size:12px;font-weight:600;letter-spacing:2px;text-transform:uppercase">Rotina Clínica</p>
            <p style="margin:0;color:#ffffff;font-size:22px;font-weight:700">${headline}</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 40px">
            <p style="margin:0 0 16px;color:#0f2d4a;font-size:16px">Olá, <strong>${escapeHtml(customerName)}</strong>!</p>
            <p style="margin:0 0 28px;color:#4a6a80;font-size:15px;line-height:1.7">
              ${body}
            </p>

            <!-- CTA Button -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td align="center">
                <a href="${dashboardUrl}"
                   style="display:inline-block;background:#3db8d4;color:#ffffff;text-decoration:none;
                          padding:14px 36px;border-radius:12px;font-weight:600;font-size:15px">
                  ${actionLabel} →
                </a>
              </td></tr>
            </table>

            <p style="margin:32px 0 0;color:#94a8b8;font-size:13px;text-align:center;line-height:1.6">
              Em caso de dúvidas, entre em contato pelo <a href="mailto:contato@rotinaclinica.com" style="color:#3db8d4;text-decoration:none">contato@rotinaclinica.com</a>
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f0f4f8;padding:20px 40px;text-align:center">
            <p style="margin:0;color:#94a8b8;font-size:12px">
              © ${new Date().getFullYear()} Rotina Clínica · <a href="https://www.rotinaclinica.com/privacidade" style="color:#94a8b8">Política de Privacidade</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
  });
}

export async function sendNewSubscriberNotification({
  customerName,
  customerEmail,
  paymentMethod,
  subscriptionPeriod = "Anual (1 ano)",
}: {
  customerName: string;
  customerEmail: string;
  paymentMethod: "stripe" | "mercadopago";
  subscriptionPeriod?: string;
}) {
  const gateway = paymentMethod === "stripe" ? "Stripe (cartão de crédito)" : "Mercado Pago";
  await resend.emails.send({
    from: FROM,
    to: "rotinaclinica77@gmail.com",
    subject: "Novo Assinante!",
    html: `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #dde6ef">
        <tr>
          <td style="background:#0f2d4a;padding:36px 40px">
            <p style="margin:0 0 4px;color:#3db8d4;font-size:12px;font-weight:600;letter-spacing:2px;text-transform:uppercase">Rotina Clínica — Admin</p>
            <p style="margin:0;color:#ffffff;font-size:22px;font-weight:700">Novo Assinante! 🎉</p>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 40px">
            <p style="margin:0 0 20px;color:#4a6a80;font-size:15px;line-height:1.7">
              Um novo assinante acaba de assinar a plataforma Rotina Clínica. Confira os dados abaixo:
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;border-radius:12px;margin-bottom:24px">
              <tr><td style="padding:20px 24px">
                <p style="margin:0 0 10px;color:#0f2d4a;font-size:15px"><strong>Nome:</strong> ${escapeHtml(customerName)}</p>
                <p style="margin:0 0 10px;color:#0f2d4a;font-size:15px"><strong>E-mail:</strong> ${escapeHtml(customerEmail)}</p>
                <p style="margin:0 0 10px;color:#0f2d4a;font-size:15px"><strong>Período:</strong> ${escapeHtml(subscriptionPeriod)}</p>
                <p style="margin:0;color:#0f2d4a;font-size:15px"><strong>Método de pagamento:</strong> ${gateway}</p>
              </td></tr>
            </table>
            <p style="margin:0;color:#94a8b8;font-size:13px;text-align:center">
              Acesse o <a href="https://rotina-clinica.vercel.app/admin/usuarios" style="color:#3db8d4;text-decoration:none">painel admin</a> para ver todos os assinantes.
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#f0f4f8;padding:20px 40px;text-align:center">
            <p style="margin:0;color:#94a8b8;font-size:12px">© ${new Date().getFullYear()} Rotina Clínica</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  });
}

/**
 * Envia a nota fiscal (NFS-e) autorizada com o PDF anexado.
 * Chamado pelo cron de emissão, após a nota ser autorizada pelo provedor.
 */
export async function sendNotaFiscal({
  to,
  customerName,
  numero,
  pdfUrl,
  amountCents,
}: {
  to: string;
  customerName: string;
  numero: string;
  pdfUrl: string;
  amountCents: number;
}) {
  const valorFormatado = (amountCents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  await resend.emails.send({
    from: FROM,
    to,
    subject: `Sua nota fiscal — Rotina Clínica (nº ${numero})`,
    attachments: [{ filename: `nota-fiscal-${numero}.pdf`, path: pdfUrl }],
    html: `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #dde6ef">
        <tr>
          <td style="background:#0f2d4a;padding:36px 40px">
            <p style="margin:0 0 4px;color:#3db8d4;font-size:12px;font-weight:600;letter-spacing:2px;text-transform:uppercase">Rotina Clínica</p>
            <p style="margin:0;color:#ffffff;font-size:22px;font-weight:700">Nota fiscal emitida 🧾</p>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 40px">
            <p style="margin:0 0 16px;color:#0f2d4a;font-size:16px">Olá, <strong>${escapeHtml(customerName)}</strong>!</p>
            <p style="margin:0 0 20px;color:#4a6a80;font-size:15px;line-height:1.7">
              Segue em anexo a nota fiscal de serviço referente ao seu pagamento de
              <strong>${valorFormatado}</strong>.
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;border-radius:12px;margin-bottom:8px">
              <tr><td style="padding:16px 20px;color:#4a6a80;font-size:14px">
                Nota fiscal nº <strong style="color:#0f2d4a">${escapeHtml(numero)}</strong><br>
                Arquivo PDF anexado a este email.
              </td></tr>
            </table>
            <p style="margin:24px 0 0;color:#94a8b8;font-size:13px;text-align:center;line-height:1.6">
              Em caso de dúvidas, entre em contato pelo <a href="mailto:contato@rotinaclinica.com" style="color:#3db8d4;text-decoration:none">contato@rotinaclinica.com</a>
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#f0f4f8;padding:20px 40px;text-align:center">
            <p style="margin:0;color:#94a8b8;font-size:12px">
              © ${new Date().getFullYear()} Rotina Clínica · <a href="https://www.rotinaclinica.com/privacidade" style="color:#94a8b8">Política de Privacidade</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  });
}
