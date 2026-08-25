import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY ?? "re_placeholder");
const FROM = process.env.EMAIL_FROM ?? "noreply@rotinaclinica.com";

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
    : `Seu pagamento foi confirmado e o acesso a <strong>${productTitle}</strong> já está disponível na sua área.`;

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
            <p style="margin:0 0 16px;color:#0f2d4a;font-size:16px">Olá, <strong>${customerName}</strong>!</p>
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
