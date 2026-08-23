import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { checkRateLimit } from "@/lib/rate-limit";

const resend = new Resend(process.env.RESEND_API_KEY ?? "");
const FROM = process.env.EMAIL_FROM ?? "noreply@rotinaclinica.com";
const TO = "contato@rotinaclinica.com";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!checkRateLimit("contato", ip, 3, 60 * 60 * 1000)) {
    return NextResponse.json({ error: "Muitas tentativas. Tente novamente em 1 hora." }, { status: 429 });
  }

  const { nome, email, assunto, mensagem } = await req.json();

  if (!nome || !email || !assunto || !mensagem) {
    return NextResponse.json({ error: "Preencha todos os campos." }, { status: 400 });
  }
  if (typeof mensagem !== "string" || mensagem.length > 3000) {
    return NextResponse.json({ error: "Mensagem muito longa." }, { status: 400 });
  }

  await resend.emails.send({
    from: FROM,
    to: TO,
    replyTo: email,
    subject: `[${assunto}] Contato de ${nome}`,
    html: `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f0f5f9;font-family:sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;border:1px solid #dde6ef">
        <tr>
          <td style="background:#0f2d4a;padding:24px 32px">
            <p style="margin:0;color:#fff;font-size:18px;font-weight:700">Rotina Clínica — Contato</p>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 32px">
            <p style="margin:0 0 4px;color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:.05em">Assunto</p>
            <p style="margin:0 0 16px;color:#0f2d4a;font-size:15px;font-weight:600">${assunto}</p>

            <p style="margin:0 0 4px;color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:.05em">De</p>
            <p style="margin:0 0 4px;color:#0f2d4a;font-size:14px;font-weight:600">${nome}</p>
            <p style="margin:0 0 16px;color:#1a6aad;font-size:13px">${email}</p>

            <p style="margin:0 0 4px;color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:.05em">Mensagem</p>
            <p style="margin:0;color:#334155;font-size:14px;line-height:1.7;white-space:pre-wrap">${mensagem.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  });

  return NextResponse.json({ ok: true });
}
