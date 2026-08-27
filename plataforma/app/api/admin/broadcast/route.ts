import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const maxDuration = 120;

const resend = new Resend(process.env.RESEND_API_KEY ?? "re_placeholder");
const FROM = "Rotina Clínica <contato@rotinaclinica.com>";

async function getEmailList(): Promise<string[]> {
  // Une TODOS os cadastros da plataforma (User) + quem baixou ebook grátis (Lead).
  // Assim, cada novo cadastro e cada download entra automaticamente na lista,
  // sem duplicar registros nem exigir campo extra no banco.
  const [leads, users] = await Promise.all([
    db.lead.findMany({ select: { email: true } }),
    db.user.findMany({ select: { email: true } }),
  ]);

  const seen = new Set<string>();
  const result: string[] = [];
  for (const { email } of [...leads, ...users]) {
    const e = email.trim().toLowerCase();
    if (!e || !e.includes("@") || !e.includes(".")) continue;
    if (seen.has(e)) continue;
    seen.add(e);
    result.push(e);
  }
  return result;
}

function buildHtml(subject: string, body: string): string {
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

        <!-- Header -->
        <tr>
          <td style="background:#0f2d4a;padding:36px 40px">
            <p style="margin:0 0 4px;color:#3db8d4;font-size:12px;font-weight:600;letter-spacing:2px;text-transform:uppercase">Rotina Clínica</p>
            <p style="margin:0;color:#ffffff;font-size:20px;font-weight:700;line-height:1.4">${subject}</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 40px">
            ${paragraphs}
            <p style="margin:32px 0 0;color:#94a8b8;font-size:13px;text-align:center;line-height:1.6">
              Dúvidas? Fale com a gente: <a href="mailto:contato@rotinaclinica.com" style="color:#3db8d4;text-decoration:none">contato@rotinaclinica.com</a>
            </p>
          </td>
        </tr>

        <!-- Footer -->
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

export async function GET() {
  const session = await (await import("@/lib/auth")).auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session || role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const emails = await getEmailList();
  return NextResponse.json({ total: emails.length });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session || role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { subject, body } = await req.json() as { subject: string; body: string };
  if (!subject?.trim() || !body?.trim()) {
    return NextResponse.json({ error: "subject e body são obrigatórios" }, { status: 400 });
  }

  const emails = await getEmailList();
  const html = buildHtml(subject, body);
  const BATCH_SIZE = 50;

  let sent = 0;
  let failed = 0;
  const errors: string[] = [];

  for (let i = 0; i < emails.length; i += BATCH_SIZE) {
    const batch = emails.slice(i, i + BATCH_SIZE).map((to) => ({
      from: FROM,
      to,
      subject,
      html,
    }));

    try {
      await resend.batch.send(batch);
      sent += batch.length;
    } catch (err) {
      failed += batch.length;
      errors.push(String(err));
    }

    if (i + BATCH_SIZE < emails.length) {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  return NextResponse.json({ total: emails.length, sent, failed, errors });
}
