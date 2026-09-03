import { Resend } from "resend";
import { createHash } from "crypto";
import { db } from "@/lib/db";

const resend = new Resend(process.env.RESEND_API_KEY ?? "re_placeholder");
const FROM = "Rotina Clínica <contato@rotinaclinica.com>";

// Limite diário de broadcast. Reserva 50 envios para emails transacionais
// (recuperação de senha, confirmação de compra, notificação de novo assinante).
export const BROADCAST_DAILY_CAP = 50;

export function campaignIdOf(subject: string, body: string): string {
  return createHash("sha256").update(`${subject}\n${body}`).digest("hex").slice(0, 32);
}

export function buildHtml(subject: string, body: string): string {
  const paragraphs = body
    .split("\n")
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p style="margin:0 0 18px;color:#4a6a80;font-size:15px;line-height:1.8">${p}</p>`)
    .join("\n");

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #dde6ef">
        <tr>
          <td style="background:#0f2d4a;padding:36px 40px">
            <p style="margin:0 0 4px;color:#3db8d4;font-size:12px;font-weight:600;letter-spacing:2px;text-transform:uppercase">Rotina Clínica</p>
            <p style="margin:0;color:#ffffff;font-size:20px;font-weight:700;line-height:1.4">${subject}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 40px">
            ${paragraphs}
            <p style="margin:32px 0 0;color:#94a8b8;font-size:13px;text-align:center;line-height:1.6">
              Dúvidas? Fale com a gente: <a href="mailto:contato@rotinaclinica.com" style="color:#3db8d4;text-decoration:none">contato@rotinaclinica.com</a>
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#f0f4f8;padding:20px 40px;text-align:center">
            <p style="margin:0;color:#94a8b8;font-size:12px">
              © ${new Date().getFullYear()} Rotina Clínica ·
              <a href="https://www.rotinaclinica.com" style="color:#94a8b8;text-decoration:none">rotinaclinica.com</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function getEmailList(): Promise<string[]> {
  // Une TODOS os cadastros (User) + quem baixou ebook grátis (Lead), deduplicado.
  const [leads, users] = await Promise.all([
    db.lead.findMany({ select: { email: true } }),
    db.user.findMany({ select: { email: true } }),
  ]);
  const seen = new Set<string>();
  const result: string[] = [];
  for (const { email } of [...leads, ...users]) {
    const e = email.trim().toLowerCase();
    if (!e || !e.includes("@") || !e.includes(".") || seen.has(e)) continue;
    seen.add(e);
    result.push(e);
  }
  return result;
}

function isQuotaError(msg: string): boolean {
  return /quota|daily|limit|exceed/i.test(msg);
}

/** Envia uma lista já filtrada, em sub-lotes de 50, registrando os enviados. */
export async function sendBatches(emails: string[], subject: string, html: string, campaignId?: string) {
  const BATCH_SIZE = 50;
  let sent = 0;
  let failed = 0;
  let quotaHit = false;
  const errors: string[] = [];

  for (let i = 0; i < emails.length; i += BATCH_SIZE) {
    const slice = emails.slice(i, i + BATCH_SIZE);
    const batch = slice.map((to) => ({
      from: FROM,
      to,
      subject,
      html,
      headers: {
        "List-Unsubscribe": "<mailto:contato@rotinaclinica.com?subject=descadastrar>",
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    }));

    try {
      const { error } = await resend.batch.send(batch);
      if (error) {
        failed += slice.length;
        const msg = error.message ?? JSON.stringify(error);
        errors.push(msg);
        if (isQuotaError(msg)) {
          quotaHit = true;
          break;
        }
      } else {
        sent += slice.length;
        if (campaignId) {
          await db.broadcastSent.createMany({
            data: slice.map((email) => ({ campaignId, email })),
            skipDuplicates: true,
          });
        }
      }
    } catch (err) {
      failed += slice.length;
      errors.push(err instanceof Error ? err.message : String(err));
    }

    if (i + BATCH_SIZE < emails.length) {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  return { sent, failed, errors, quotaHit };
}

export type BatchResult = {
  total: number;
  alreadySent: number;
  sentThisRun: number;
  failed: number;
  remaining: number;
  done: boolean;
  quotaHit: boolean;
  errors: string[];
};

/**
 * Envia o próximo lote (até `cap`) de uma campanha, pulando quem já recebeu.
 * Usado tanto pelo painel (1º lote) quanto pelo cron diário (lotes seguintes).
 */
export async function sendCampaignBatch(subject: string, body: string, cap = BROADCAST_DAILY_CAP): Promise<BatchResult> {
  const campaignId = campaignIdOf(subject, body);
  const html = buildHtml(subject, body);
  const emails = await getEmailList();

  const already = await db.broadcastSent.findMany({ where: { campaignId }, select: { email: true } });
  const sentSet = new Set(already.map((x) => x.email));
  const pending = emails.filter((e) => !sentSet.has(e));
  const toSend = pending.slice(0, cap);

  if (toSend.length === 0) {
    return {
      total: emails.length, alreadySent: sentSet.size, sentThisRun: 0,
      failed: 0, remaining: 0, done: true, quotaHit: false, errors: [],
    };
  }

  const r = await sendBatches(toSend, subject, html, campaignId);
  const remaining = pending.length - r.sent;
  return {
    total: emails.length,
    alreadySent: sentSet.size + r.sent,
    sentThisRun: r.sent,
    failed: r.failed,
    remaining,
    done: remaining === 0,
    quotaHit: r.quotaHit,
    errors: r.errors,
  };
}
