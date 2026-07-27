import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY ?? "re_placeholder");
const FROM = process.env.EMAIL_FROM ?? "noreply@seudominio.com.br";

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
  productType: "COURSE" | "DOWNLOAD" | "EBOOK_FREE";
  dashboardUrl: string;
}) {
  const actionLabel = productType === "COURSE" ? "Acessar curso" : "Baixar arquivo";

  await resend.emails.send({
    from: FROM,
    to,
    subject: `Seu acesso a "${productTitle}" está liberado!`,
    html: `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e4e4e7">
        <tr>
          <td style="background:#7c3aed;padding:32px;text-align:center">
            <p style="margin:0;color:#fff;font-size:22px;font-weight:700">Acesso liberado! ✅</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px">
            <p style="margin:0 0 16px;color:#3f3f46;font-size:16px">Olá, <strong>${customerName}</strong>!</p>
            <p style="margin:0 0 24px;color:#71717a;font-size:15px;line-height:1.6">
              Seu pagamento foi confirmado e o acesso a <strong>${productTitle}</strong> já está disponível na sua área.
            </p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td align="center">
                <a href="${dashboardUrl}"
                   style="display:inline-block;background:#7c3aed;color:#fff;text-decoration:none;
                          padding:14px 32px;border-radius:12px;font-weight:600;font-size:15px">
                  ${actionLabel}
                </a>
              </td></tr>
            </table>
            <p style="margin:32px 0 0;color:#a1a1aa;font-size:13px;text-align:center">
              Em caso de dúvidas, responda este e-mail.
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
