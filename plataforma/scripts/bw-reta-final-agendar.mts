import { readFileSync } from "fs";
import { db } from "../lib/db";
import { unsubscribeUrl } from "../lib/brevo-queue";
import { getExcludedEmails, ADMIN_TEST_EMAILS } from "../app/admin/_lib/excluded-emails";
const MODE = process.argv[2] ?? "dry"; // dry | test | schedule
// Uso: npx tsx --env-file=.env --env-file=.env.local scripts/bw-reta-final-agendar.mts <dry|test|schedule> <1|2|3>
const EMAILS = {
  "1": { subject: "Até domingo, e amanhã tem um bônus", at: "2026-11-26T09:00:00-03:00", campaign: "bw_reta_final_email1_2026-11-26", file: "email-bw-1-quinta-nov26.html", leads: 200, skip: [] as string[] },
  "2": { subject: "Só hoje: 14 meses pelo preço de 12", at: "2026-11-27T08:00:00-03:00", campaign: "bw_reta_final_email2_2026-11-27", file: "email-bw-2-sexta-bonus-nov26.html", leads: 225, skip: ["bw_reta_final_email1_2026-11-26"] },
} as const;
const CFG = EMAILS[(process.argv[3] ?? "1") as keyof typeof EMAILS];
const SUBJECT = CFG.subject, AT = CFG.at, CAMPAIGN = CFG.campaign, LEADS = CFG.leads;
const K = process.env.BREVO_API_KEY!;
const brevo = async (m: string, p: string, b?: unknown) => {
  const r = await fetch("https://api.brevo.com/v3" + p, { method: m, headers: { "api-key": K, "content-type": "application/json", accept: "application/json" }, body: b ? JSON.stringify(b) : undefined });
  const t = await r.text(); return { ok: r.ok, status: r.status, data: t ? JSON.parse(t) : {} };
};
const html = readFileSync(`../marketing/${CFG.file}`, "utf8").replace(/<!--[\s\S]*?-->\n?/, "");
const now = new Date();
const excl = new Set([...(await getExcludedEmails()), ...ADMIN_TEST_EMAILS].map(e => e.toLowerCase()));
const users = await db.user.findMany({ select: { email: true, trialEndsAt: true, subscription: { select: { status: true, currentPeriodEnd: true } } } });
const allUser = new Set(users.map(u => u.email.toLowerCase()));
const quentes = users.filter(u => !(u.subscription?.status === "ACTIVE" && u.subscription.currentPeriodEnd > now) && !(u.trialEndsAt && u.trialEndsAt > now)).map(u => u.email.toLowerCase());
const leadsRaw = await db.lead.findMany({ orderBy: { createdAt: "desc" }, select: { email: true } });
const seen = new Set<string>(); const leads: string[] = [];
for (const l of leadsRaw) { const e = l.email.trim().toLowerCase(); if (!e.includes("@") || allUser.has(e) || seen.has(e)) continue; seen.add(e); leads.push(e); }
async function blocked(e: string) { const r = await brevo("GET", `/contacts/${encodeURIComponent(e)}`); return r.ok && r.data.emailBlacklisted === true; }
const out: string[] = []; let bl = 0, ex = 0;
for (const e of quentes) { if (excl.has(e)) { ex++; continue; } if (await blocked(e)) { bl++; continue; } out.push(e); }
const nQ = out.length;
// Leads que já receberam um toque anterior ficam para o próximo lote (os quentes recebem todos)
const skipLeads = new Set((await db.brevoQueueSent.findMany({ where: { campaignId: { in: [...CFG.skip] } }, select: { email: true } })).map(x => x.email));
for (const e of leads) { if (skipLeads.has(e)) continue; if (out.length - nQ >= LEADS) break; if (excl.has(e)) { ex++; continue; } if (await blocked(e)) { bl++; continue; } out.push(e); }
const already = new Set((await db.brevoQueueSent.findMany({ where: { campaignId: CAMPAIGN }, select: { email: true } })).map(x => x.email));
const todo = out.filter(e => !already.has(e));
console.log({ quentes: nQ, leads: out.length - nQ, total: out.length, excluidos: ex, descadastrados: bl, jaAgendados: already.size, aAgendar: todo.length });
const send = async (to: string, scheduledAt?: string) => {
  const unsub = unsubscribeUrl(to);
  return brevo("POST", "/smtp/email", {
    to: [{ email: to }], sender: { name: "Lucas e Yan | Rotina Clínica", email: "contato@rotinaclinica.com" },
    replyTo: { email: "contato@rotinaclinica.com", name: "Lucas e Yan" }, subject: SUBJECT,
    htmlContent: html.replaceAll("{{unsubscribe}}", unsub), tags: [CAMPAIGN],
    headers: { "List-Unsubscribe": `<${unsub}>, <mailto:contato@rotinaclinica.com?subject=descadastrar>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" },
    ...(scheduledAt ? { scheduledAt } : {}),
  });
};
if (MODE === "test") { const r = await send("contato@rotinaclinica.com"); console.log("teste:", r.status, JSON.stringify(r.data)); }
if (MODE === "schedule") {
  let ok = 0, fail = 0; const errs = new Set<string>();
  for (const e of todo) {
    const r = await send(e, AT);
    if (r.ok) { await db.brevoQueueSent.create({ data: { campaignId: CAMPAIGN, email: e } }); ok++; } else { fail++; errs.add(r.data.message ?? String(r.status)); }
    await new Promise(r => setTimeout(r, 100));
  }
  console.log({ agendados: ok, falhas: fail, erros: [...errs] });
}
process.exit(0);
