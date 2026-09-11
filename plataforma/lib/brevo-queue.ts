import { createHash } from "crypto";
import { db } from "@/lib/db";

const BREVO_BASE = "https://api.brevo.com/v3";
export const BREVO_DAILY_CAP = 200;

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
      const data = await brevo("GET", `/contacts?listId=${listId}&limit=${limit}&offset=${offset}`);
      const contacts: { email?: string }[] = data.contacts ?? [];
      for (const c of contacts) {
        const email = c.email?.toLowerCase().trim();
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
  const contacts = await fetchBrevoContacts(listIds);
  const already = await db.brevoQueueSent.findMany({ where: { campaignId }, select: { email: true } });
  const sentSet = new Set(already.map((x) => x.email));
  const pending = contacts.filter((e) => !sentSet.has(e));
  const toSend = pending.slice(0, cap);

  let sent = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const email of toSend) {
    try {
      await brevo("POST", "/smtp/email", {
        to: [{ email }],
        sender: { name: "Rotina Clínica", email: "contato@rotinaclinica.com" },
        subject,
        htmlContent,
        headers: {
          "List-Unsubscribe": "<mailto:contato@rotinaclinica.com?subject=descadastrar>",
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
