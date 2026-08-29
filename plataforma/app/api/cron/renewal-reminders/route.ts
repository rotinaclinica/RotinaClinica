import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Resend } from "resend";
import { escapeHtml } from "@/lib/escape";

export const maxDuration = 60;

const resend = new Resend(process.env.RESEND_API_KEY ?? "re_placeholder");
const FROM = "Rotina Clínica <contato@rotinaclinica.com>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.rotinaclinica.com";

function reminderHtml(name: string, venceEm: string) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0f5f9;font-family:sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;border:1px solid #dde6ef">
        <tr><td style="background:#0f2d4a;padding:28px 32px">
          <p style="margin:0;color:#fff;font-size:20px;font-weight:700">Rotina Clínica</p>
        </td></tr>
        <tr><td style="padding:32px">
          <p style="margin:0 0 12px;color:#0f2d4a;font-size:17px;font-weight:600">Sua assinatura vai expirar</p>
          <p style="margin:0 0 24px;color:#64748b;font-size:15px;line-height:1.6">
            Olá${name ? `, <strong>${escapeHtml(name)}</strong>` : ""}! Sua assinatura do Rotina Clínica vence em <strong>${escapeHtml(venceEm)}</strong>.
            Renove agora para não perder o acesso às condutas, calculadoras, casos e cursos.
          </p>
          <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
            <a href="${APP_URL}/assinatura" style="display:inline-block;background:#3db8d4;color:#fff;text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:600;font-size:15px">
              Renovar assinatura →
            </a>
          </td></tr></table>
          <p style="margin:24px 0 0;color:#94a3b8;font-size:12px;text-align:center">
            Se você já renovou, pode ignorar este e-mail.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function GET(req: NextRequest) {
  // Vercel Cron envia Authorization: Bearer <CRON_SECRET>
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET não configurado" }, { status: 500 });
  }
  if (req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = Date.now();
  // Janela [24h, 48h]: com execução diária, cada assinatura cai na janela uma
  // única vez, dispensando um campo "lembrete enviado" no banco.
  const from = new Date(now + 24 * 60 * 60 * 1000);
  const to = new Date(now + 48 * 60 * 60 * 1000);

  const subs = await db.subscription.findMany({
    where: { status: "ACTIVE", currentPeriodEnd: { gte: from, lte: to } },
    select: { currentPeriodEnd: true, user: { select: { email: true, name: true } } },
  });

  let sent = 0;
  let failed = 0;

  for (const s of subs) {
    if (!s.user?.email) continue;
    const venceEm = new Date(s.currentPeriodEnd).toLocaleDateString("pt-BR");
    try {
      await resend.emails.send({
        from: FROM,
        to: s.user.email,
        subject: "Sua assinatura Rotina Clínica vai expirar",
        html: reminderHtml(s.user.name ?? "", venceEm),
      });
      sent++;
    } catch {
      failed++;
    }
  }

  return NextResponse.json({ candidates: subs.length, sent, failed });
}
