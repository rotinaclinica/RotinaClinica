import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Resend } from "resend";
import { escapeHtml } from "@/lib/escape";
import { logError } from "@/lib/error-logger";

export const maxDuration = 60;

const resend = new Resend(process.env.RESEND_API_KEY ?? "re_placeholder");
const FROM = "Rotina Clínica <contato@rotinaclinica.com>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.rotinaclinica.com";
const TZ = "America/Sao_Paulo";

// Sequência de lembretes para assinaturas SEM renovação automática (Pix /
// pagamento avulso). Chave = dias até o vencimento (no calendário de Brasília);
// negativo = dias após vencer. Com o cron diário, cada assinatura passa por
// cada etapa uma única vez — dispensa um campo "lembrete enviado" no banco.
const STEPS: Record<number, { subject: string; title: string; body: (venceEm: string) => string; cta: string }> = {
  7: {
    subject: "Sua assinatura Rotina Clínica vence em 7 dias",
    title: "Faltam 7 dias para sua assinatura vencer",
    body: (d) =>
      `Sua assinatura vence em <strong>${d}</strong>. Renove com antecedência para não perder o acesso às prescrições, calculadoras, evoluções e cursos no meio de um plantão.`,
    cta: "Renovar assinatura →",
  },
  1: {
    subject: "Sua assinatura Rotina Clínica vence amanhã",
    title: "Sua assinatura vence amanhã",
    body: (d) =>
      `Amanhã (<strong>${d}</strong>) seu acesso ao Rotina Clínica expira. A renovação leva menos de um minuto.`,
    cta: "Renovar agora →",
  },
  0: {
    subject: "Sua assinatura Rotina Clínica vence hoje",
    title: "Último dia de acesso",
    body: () =>
      `Sua assinatura vence <strong>hoje</strong>. Renove agora para continuar com tudo o que você usa no dia a dia, sem interrupção.`,
    cta: "Renovar agora →",
  },
  [-3]: {
    subject: "Sentimos sua falta no Rotina Clínica",
    title: "Seu acesso expirou",
    body: (d) =>
      `Sua assinatura venceu em <strong>${d}</strong> e o acesso foi pausado. Seus dados e anotações continuam salvos — é só renovar para voltar de onde parou.`,
    cta: "Reativar meu acesso →",
  },
};

function reminderHtml(name: string, step: (typeof STEPS)[number], venceEm: string) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0f5f9;font-family:sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #dde6ef">
        <tr><td style="background:#0f2d4a;padding:28px 32px">
          <p style="margin:0 0 4px;color:#3db8d4;font-size:12px;font-weight:600;letter-spacing:2px;text-transform:uppercase">Rotina Clínica</p>
          <p style="margin:0;color:#fff;font-size:20px;font-weight:700">${step.title}</p>
        </td></tr>
        <tr><td style="padding:32px">
          <p style="margin:0 0 12px;color:#0f2d4a;font-size:16px">Olá${name ? `, <strong>${escapeHtml(name)}</strong>` : ""}!</p>
          <p style="margin:0 0 24px;color:#64748b;font-size:15px;line-height:1.6">${step.body(escapeHtml(venceEm))}</p>
          <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
            <a href="${APP_URL}/assinatura" style="display:inline-block;background:#3db8d4;color:#fff;text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:600;font-size:15px">
              ${step.cta}
            </a>
          </td></tr></table>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;background:#f0f5f9;border-radius:12px">
            <tr><td style="padding:14px 18px;color:#4a6a80;font-size:13px;line-height:1.6">
              💡 <strong>Dica:</strong> no cartão a renovação é automática — você não precisa lembrar todo mês.
              E no plano anual você paga 10 meses e usa 12.
            </td></tr>
          </table>
          <p style="margin:24px 0 0;color:#0f2d4a;font-size:14px;line-height:1.6">
            Um abraço,<br><strong>Lucas e Yan</strong> · Rotina Clínica
          </p>
          <p style="margin:20px 0 0;color:#94a3b8;font-size:12px;text-align:center">
            Se você já renovou, pode ignorar este e-mail.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// "YYYY-MM-DD" no fuso de Brasília
function brDay(d: Date) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(d);
}

function daysBetween(fromDay: string, toDay: string) {
  return Math.round((Date.parse(toDay) - Date.parse(fromDay)) / 86_400_000);
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

  const now = new Date();
  const today = brDay(now);

  // Exclui quem tem renovação automática (Asaas recorrente), quem cancelou,
  // cortesias e contas internas.
  const subs = await db.subscription.findMany({
    where: {
      status: { in: ["ACTIVE", "EXPIRED", "PAST_DUE"] },
      asaasSubscriptionId: null,
      currentPeriodEnd: {
        gte: new Date(now.getTime() - 5 * 86_400_000),
        lte: new Date(now.getTime() + 9 * 86_400_000),
      },
      user: { role: "CUSTOMER", isCourtesy: false, anonymizedAt: null },
    },
    select: { currentPeriodEnd: true, user: { select: { email: true, name: true } } },
  });

  const sent: Record<string, number> = {};
  let failed = 0;

  for (const s of subs) {
    if (!s.user?.email) continue;
    const endDay = brDay(s.currentPeriodEnd);
    const diff = daysBetween(today, endDay);
    const step = STEPS[diff];
    if (!step) continue;

    const venceEm = s.currentPeriodEnd.toLocaleDateString("pt-BR", { timeZone: TZ });
    const firstName = (s.user.name ?? "").trim().split(/\s+/)[0] ?? "";
    try {
      await resend.emails.send({
        from: FROM,
        to: s.user.email,
        subject: step.subject,
        html: reminderHtml(firstName, step, venceEm),
      });
      const label = `D${diff >= 0 ? "-" : "+"}${Math.abs(diff)}`;
      sent[label] = (sent[label] ?? 0) + 1;
    } catch (err) {
      failed++;
      await logError({ route: "/api/cron/renewal-reminders", method: "GET", error: err });
    }
  }

  return NextResponse.json({ candidates: subs.length, sent, failed });
}
