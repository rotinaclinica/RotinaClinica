import { NextRequest, NextResponse } from "next/server";
import { createHmac, randomBytes } from "crypto";
import { db } from "@/lib/db";
import { Resend } from "resend";
import { checkRateLimit } from "@/lib/rate-limit";
import { escapeHtml } from "@/lib/escape";

const resend = new Resend(process.env.RESEND_API_KEY ?? "");
const FROM = "Rotina Clínica <contato@rotinaclinica.com>";
const SECRET = process.env.AUTH_SECRET;
const BASE_URL = process.env.NEXTAUTH_URL ?? "https://www.rotinaclinica.com";
const TTL = 60 * 60; // 1 hora em segundos

function makeToken(email: string, exp: number): string {
  if (!SECRET) throw new Error("AUTH_SECRET not set");
  return createHmac("sha256", SECRET).update(`${email}|${exp}`).digest("hex");
}

export async function POST(req: NextRequest) {
  if (!SECRET) {
    return NextResponse.json({ error: "Configuração inválida." }, { status: 500 });
  }
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!checkRateLimit("recuperar-senha", ip, 3, 15 * 60 * 1000)) {
    return NextResponse.json({ error: "Muitas tentativas. Tente novamente em alguns minutos." }, { status: 429 });
  }

  const { email } = await req.json();
  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "E-mail inválido." }, { status: 400 });
  }

  const user = await db.user.findUnique({ where: { email: email.toLowerCase() }, select: { id: true, name: true } });

  // Sempre retorna sucesso para não revelar se o e-mail existe
  if (!user) {
    return NextResponse.json({ ok: true });
  }

  const exp = Math.floor(Date.now() / 1000) + TTL;
  const token = makeToken(email.toLowerCase(), exp);

  await db.passwordResetToken.create({
    data: {
      email: email.toLowerCase(),
      token,
      expiresAt: new Date(exp * 1000),
    },
  });

  const link = `${BASE_URL}/redefinir-senha?email=${encodeURIComponent(email.toLowerCase())}&exp=${exp}&token=${token}`;

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Redefinir senha — Rotina Clínica",
    html: `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0f5f9;font-family:sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;border:1px solid #dde6ef">
        <tr>
          <td style="background:#0f2d4a;padding:28px 32px">
            <p style="margin:0;color:#fff;font-size:20px;font-weight:700">Rotina Clínica</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px">
            <p style="margin:0 0 12px;color:#0f2d4a;font-size:17px;font-weight:600">Redefinir sua senha</p>
            <p style="margin:0 0 24px;color:#64748b;font-size:15px;line-height:1.6">
              Olá${user.name ? `, <strong>${escapeHtml(user.name)}</strong>` : ""}! Recebemos uma solicitação para redefinir a senha da sua conta.<br>
              Clique no botão abaixo para criar uma nova senha. O link expira em <strong>1 hora</strong>.
            </p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td align="center">
                <a href="${link}" style="display:inline-block;background:#3db8d4;color:#fff;text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:600;font-size:15px">
                  Redefinir senha →
                </a>
              </td></tr>
            </table>
            <p style="margin:24px 0 0;color:#94a3b8;font-size:12px;text-align:center">
              Se você não solicitou a redefinição, ignore este e-mail. Sua senha não será alterada.
            </p>
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
