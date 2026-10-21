import { NextRequest, NextResponse } from "next/server";
import { blacklistBrevoContact, verifyUnsubscribeToken } from "@/lib/brevo-queue";
import { logError } from "@/lib/error-logger";

// GET mostra a confirmação (scanners de link não descadastram ninguém);
// POST descadastra — é o que o botão e o "one-click" do Gmail/Yahoo chamam.

function page(title: string, body: string, status = 200) {
  const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} · Rotina Clínica</title></head>
<body style="margin:0;background:#f3f4f6;font-family:Arial,sans-serif;color:#111827">
<div style="max-width:440px;margin:48px auto;padding:32px 24px;background:#fff;border-radius:12px;text-align:center">
<p style="margin:0 0 8px;font-size:13px;color:#6b7280;letter-spacing:.04em;text-transform:uppercase">Rotina Clínica</p>
<h1 style="margin:0 0 16px;font-size:20px">${title}</h1>${body}</div></body></html>`;
  return new NextResponse(html, { status, headers: { "Content-Type": "text/html; charset=utf-8" } });
}

function params(req: NextRequest) {
  const e = (req.nextUrl.searchParams.get("e") ?? "").trim().toLowerCase();
  const t = req.nextUrl.searchParams.get("t") ?? "";
  return { e, t, valid: !!e && !!t && verifyUnsubscribeToken(e, t) };
}

const invalid = () =>
  page("Link inválido", `<p style="color:#4b5563;line-height:1.5">Este link de descadastro não é válido. Responda qualquer email nosso com "descadastrar" que removemos você.</p>`, 400);

export async function GET(req: NextRequest) {
  const { e, t, valid } = params(req);
  if (!valid) return invalid();
  const action = `/api/descadastrar?e=${encodeURIComponent(e)}&t=${t}`;
  return page(
    "Descadastrar emails",
    `<p style="color:#4b5563;line-height:1.5">Você deixará de receber nossas novidades em <strong>${e.replace(/[<>&"]/g, "")}</strong>. Emails da sua conta (senha, pagamentos) continuam chegando.</p>
<form method="post" action="${action}"><button type="submit" style="margin-top:16px;padding:12px 24px;background:#1e3a8a;color:#fff;border:0;border-radius:8px;font-size:15px;cursor:pointer">Confirmar descadastro</button></form>`
  );
}

export async function POST(req: NextRequest) {
  const { e, valid } = params(req);
  if (!valid) return invalid();
  try {
    await blacklistBrevoContact(e);
  } catch (err) {
    await logError({ route: "/api/descadastrar", method: "POST", error: err });
    return page("Algo deu errado", `<p style="color:#4b5563;line-height:1.5">Não conseguimos concluir agora. Responda qualquer email nosso com "descadastrar" que removemos você.</p>`, 500);
  }
  return page("Pronto, você foi descadastrado", `<p style="color:#4b5563;line-height:1.5">Você não vai mais receber nossas novidades por email.</p>`);
}
