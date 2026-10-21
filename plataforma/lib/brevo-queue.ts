import { createHash, createHmac, timingSafeEqual } from "crypto";
import { db } from "@/lib/db";
import { getExcludedEmails, ADMIN_TEST_EMAILS } from "@/app/admin/_lib/excluded-emails";

const BREVO_BASE = "https://api.brevo.com/v3";
export const BREVO_DAILY_CAP = 200;

// Listas mantidas automaticamente pela plataforma
export const BREVO_LIST_LEADS = 10; // downloads gratuitos e leads (não assinantes)
export const BREVO_LIST_TRIAL_EXPIRED = 11; // teste grátis encerrado sem assinar

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.rotinaclinica.com";

export function unsubscribeToken(email: string): string {
  return createHmac("sha256", process.env.AUTH_SECRET ?? "")
    .update(`unsub:${email.toLowerCase()}`)
    .digest("hex")
    .slice(0, 32);
}

export function verifyUnsubscribeToken(email: string, token: string): boolean {
  const expected = Buffer.from(unsubscribeToken(email));
  const given = Buffer.from(token);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

export function unsubscribeUrl(email: string): string {
  const e = email.toLowerCase();
  return `${APP_URL}/api/descadastrar?e=${encodeURIComponent(e)}&t=${unsubscribeToken(e)}`;
}

// Descadastro: bloqueia o contato para marketing no Brevo
export async function blacklistBrevoContact(email: string) {
  await brevo("PUT", `/contacts/${encodeURIComponent(email.toLowerCase())}`, { emailBlacklisted: true });
}

// Adiciona (ou cria) o contato em uma lista. Nunca reativa quem se descadastrou.
export async function addToBrevoList(email: string, listId: number, name?: string | null) {
  const e = email.trim().toLowerCase();
  if (!process.env.BREVO_API_KEY || ADMIN_TEST_EMAILS.includes(e)) return;
  const firstName = (name ?? "").trim().split(/\s+/)[0] || undefined;
  try {
    await brevo("POST", "/contacts", {
      email: e,
      listIds: [listId],
      updateEnabled: false,
      ...(firstName ? { attributes: { FIRSTNAME: firstName } } : {}),
    });
  } catch {
    // Já existe: só inclui na lista
    await brevo("POST", `/contacts/lists/${listId}/contacts/add`, { emails: [e] });
  }
}

async function brevo(method: string, path: string, body?: unknown) {
  const res = await fetch(`${BREVO_BASE}${path}`, {
    method,
    headers: {
      "api-key": process.env.BREVO_API_KEY ?? "",
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) throw new Error(data.message ?? `Brevo error ${res.status}`);
  return data;
}

export function queueCampaignId(subject: string, htmlContent: string, listIds: number[]): string {
  const key = `brevo:${subject}\n${listIds.sort().join(",")}\n${htmlContent}`;
  return createHash("sha256").update(key).digest("hex").slice(0, 32);
}

export async function fetchBrevoContacts(listIds: number[]): Promise<string[]> {
  const seen = new Set<string>();
  const emails: string[] = [];
  const limit = 500;

  for (const listId of listIds) {
    let offset = 0;
    while (true) {
      // /contacts?listId= ignora o filtro e devolve a conta inteira — usar o endpoint da lista
      const data = await brevo("GET", `/contacts/lists/${listId}/contacts?limit=${limit}&offset=${offset}`);
      const contacts: { email?: string; emailBlacklisted?: boolean }[] = data.contacts ?? [];
      for (const c of contacts) {
        const email = c.email?.toLowerCase().trim();
        // Descadastrados: o envio transacional (/smtp/email) não respeita o bloqueio de marketing
        if (c.emailBlacklisted) continue;
        if (email && email.includes("@") && !seen.has(email)) {
          seen.add(email);
          emails.push(email);
        }
      }
      if (contacts.length < limit) break;
      offset += limit;
    }
  }

  return emails;
}

// Usa o placeholder {{unsubscribe}} do HTML; sem ele, acrescenta um rodapé com o link
function withUnsubscribe(html: string, url: string): string {
  if (html.includes("{{unsubscribe}}")) return html.replaceAll("{{unsubscribe}}", url);
  const footer = `<p style="font-family:Arial,sans-serif;font-size:12px;color:#9ca3af;text-align:center;margin:16px 0">Não quer mais receber nossos emails? <a href="${url}" style="color:#6b7280">Descadastrar</a></p>`;
  return html.includes("</body>") ? html.replace("</body>", `${footer}</body>`) : html + footer;
}

export type QueueBatchResult = {
  total: number;
  alreadySent: number;
  sentThisRun: number;
  failed: number;
  remaining: number;
  done: boolean;
  errors: string[];
};

export async function sendBrevoQueueBatch(
  campaignId: string,
  subject: string,
  htmlContent: string,
  listIds: number[],
  cap = BREVO_DAILY_CAP
): Promise<QueueBatchResult> {
  const listed = await fetchBrevoContacts(listIds);
  // Fora da campanha: assinantes vigentes e quem está no meio do teste grátis
  // (esses já recebem os emails próprios do onboarding/teste)
  const now = new Date();
  const excludedUsers = await db.user.findMany({
    where: {
      email: { in: listed, mode: "insensitive" },
      OR: [
        { subscription: { status: "ACTIVE", currentPeriodEnd: { gt: now } } },
        { trialEndsAt: { gt: now } },
      ],
    },
    select: { email: true },
  });
  const excluded = new Set([
    ...excludedUsers.map((u) => u.email.toLowerCase()),
    ...(await getExcludedEmails()).map((e) => e.toLowerCase()), // fundadores, testes, embaixadores, cortesias
  ]);
  const contacts = listed.filter((e) => !excluded.has(e));
  const already = await db.brevoQueueSent.findMany({ where: { campaignId }, select: { email: true } });
  const sentSet = new Set(already.map((x) => x.email));
  const pending = contacts.filter((e) => !sentSet.has(e));
  const toSend = pending.slice(0, cap);

  let sent = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const email of toSend) {
    try {
      const unsub = unsubscribeUrl(email);
      await brevo("POST", "/smtp/email", {
        to: [{ email }],
        sender: { name: "Lucas e Yan | Rotina Clínica", email: "contato@rotinaclinica.com" },
        replyTo: { email: "contato@rotinaclinica.com", name: "Lucas e Yan" },
        subject,
        htmlContent: withUnsubscribe(htmlContent, unsub),
        headers: {
          "List-Unsubscribe": `<${unsub}>, <mailto:contato@rotinaclinica.com?subject=descadastrar>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
      });
      await db.brevoQueueSent.create({ data: { campaignId, email } });
      sent++;
    } catch (err) {
      failed++;
      const msg = err instanceof Error ? err.message : String(err);
      if (!errors.includes(msg)) errors.push(msg);
    }
    // Pequena pausa para não sobrecarregar a API
    await new Promise((r) => setTimeout(r, 100));
  }

  const remaining = pending.length - sent;
  return {
    total: contacts.length,
    alreadySent: sentSet.size + sent,
    sentThisRun: sent,
    failed,
    remaining,
    done: remaining === 0 && failed === 0,
    errors,
  };
}
