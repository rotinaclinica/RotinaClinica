// Envia os e-mails pessoais da campanha de renovação a partir do rascunho em
// marketing/campanha-renovacao-2026-10-15.md (uma seção "## N. Nome · ..." por pessoa).
// O destinatário é resolvido pelo primeiro nome entre as assinaturas vencidas
// e não renovadas (status ACTIVE com fim no passado, sem cortesia).
//
// Uso:
//   node scripts/send-renewal-campaign.mjs                 (dry-run: mostra destinatários e assuntos)
//   node scripts/send-renewal-campaign.mjs --apply         (envia)
//   node scripts/send-renewal-campaign.mjs --apply --skip Angelina

import { readFileSync } from "fs";
import { resolve } from "path";
import pg from "pg";
import { Resend } from "resend";

for (const l of readFileSync(resolve(import.meta.dirname, "../.env"), "utf8").split("\n")) {
  const m = l.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}

const APPLY = process.argv.includes("--apply");
const skipIdx = process.argv.indexOf("--skip");
const SKIP = skipIdx > -1 ? process.argv[skipIdx + 1].split(",") : [];
const FROM = "Lucas e Yan · Rotina Clínica <contato@rotinaclinica.com>";

const md = readFileSync(resolve(import.meta.dirname, "../../marketing/campanha-renovacao-2026-10-15.md"), "utf8");

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const inline = (s) =>
  esc(s)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\[(.+?)\]\((https:\/\/[^)]+)\)/g, '<a href="$2" style="color:#1a6aad;font-weight:700">$1</a>');

function toHtml(body) {
  const paras = body.trim().split(/\n\s*\n/).map((p) => p.trim().split("\n").map(inline).join("<br>"));
  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:24px 16px;background:#ffffff;font-family:Arial,sans-serif">
<div style="max-width:560px;margin:0 auto;color:#0f2d4a;font-size:15px;line-height:1.65">
${paras.map((p) => `<p style="margin:0 0 16px">${p}</p>`).join("\n")}
</div></body></html>`;
}

const toText = (body) => body.trim().replace(/\*\*(.+?)\*\*/g, "$1").replace(/\[(.+?)\]\((https:\/\/[^)]+)\)/g, "$1: $2");

const sections = md
  .split(/\n## /)
  .slice(1)
  .map((sec) => {
    const name = sec.match(/^\d+\.\s+([^\s·]+)/)?.[1];
    const subject = sec.match(/\*\*Assunto:\*\*\s*(.+)/)?.[1]?.trim();
    const body = sec.split(/\*\*Assunto:\*\*.+\n/)[1]?.split(/\n---/)[0] ?? "";
    return { name, subject, body };
  })
  .filter((s) => s.name && s.subject && s.body.trim());

const c = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();
const { rows } = await c.query(`
  select u.email, split_part(u.name, ' ', 1) as first from "Subscription" s join "User" u on u.id = s."userId"
  where s.status = 'ACTIVE' and s."currentPeriodEnd" < now() and u."isCourtesy" = false and u."anonymizedAt" is null`);
await c.end();

const resend = new Resend(process.env.RESEND_API_KEY);
for (const s of sections) {
  if (SKIP.includes(s.name)) { console.log("pulado:", s.name); continue; }
  const matches = rows.filter((r) => r.first === s.name);
  if (matches.length !== 1) { console.log(`ATENÇÃO ${s.name}: ${matches.length} destinatários encontrados, não enviado`); continue; }
  const to = matches[0].email;
  const masked = to.replace(/^(.{2}).*(@.*)$/, "$1***$2");
  if (!APPLY) { console.log(`[dry-run] ${s.name} → ${masked} | ${s.subject}`); continue; }
  const { error } = await resend.emails.send({
    from: FROM,
    to,
    replyTo: "contato@rotinaclinica.com",
    subject: s.subject,
    html: toHtml(s.body),
    text: toText(s.body),
  });
  console.log(error ? `ERRO ${s.name}: ${error.message}` : `enviado: ${s.name} → ${masked}`);
}
