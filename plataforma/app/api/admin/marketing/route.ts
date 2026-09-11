import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/require-admin";
import { Resend } from "resend";

const BREVO_BASE = "https://api.brevo.com/v3";
const resend = new Resend(process.env.RESEND_API_KEY ?? "re_placeholder");

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

export async function GET() {
  if (!(await isAdminRequest())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [listsData, sentData, draftData, suspendedData, queuedData] = await Promise.all([
    brevo("GET", "/contacts/lists?limit=50"),
    brevo("GET", "/emailCampaigns?limit=20&sort=desc&status=sent").catch(() => ({ campaigns: [] })),
    brevo("GET", "/emailCampaigns?limit=20&sort=desc&status=draft").catch(() => ({ campaigns: [] })),
    brevo("GET", "/emailCampaigns?limit=20&sort=desc&status=suspended").catch(() => ({ campaigns: [] })),
    brevo("GET", "/emailCampaigns?limit=20&sort=desc&status=queued").catch(() => ({ campaigns: [] })),
  ]);

  const allCampaigns = [
    ...(sentData.campaigns ?? []),
    ...(draftData.campaigns ?? []),
    ...(suspendedData.campaigns ?? []),
    ...(queuedData.campaigns ?? []),
  ].sort((a: Record<string, unknown>, b: Record<string, unknown>) => {
    const dateA = String(a.sentDate ?? a.createdAt ?? "");
    const dateB = String(b.sentDate ?? b.createdAt ?? "");
    return dateB.localeCompare(dateA);
  });
  const campaignsData = { campaigns: allCampaigns.slice(0, 20) };

  const rawLists: Record<string, unknown>[] = listsData.lists ?? [];

  // Busca a contagem real de contatos por lista (o campo cacheado da API sempre retorna 0)
  const listsWithCounts = await Promise.all(
    rawLists.map(async (l) => {
      const id = Number(l.id);
      try {
        const data = await brevo("GET", `/contacts?listId=${id}&limit=1`);
        return { id, name: l.name, totalSubscribers: Number(data.count ?? 0) };
      } catch {
        return { id, name: l.name, totalSubscribers: 0 };
      }
    })
  );

  return NextResponse.json({
    lists: listsWithCounts,
    campaigns: campaignsData.campaigns ?? [],
  });
}

export async function POST(req: NextRequest) {
  if (!(await isAdminRequest())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { action } = body;

  if (action === "create_and_send") {
    const { subject, htmlContent, listIds, senderEmail } = body;
    try {
      // Brevo exige o ID numérico do sender verificado
      const targetEmail = senderEmail ?? "contato@rotinaclinica.com";
      const sendersData = await brevo("GET", "/senders");
      const senders: { id: number; name: string; email: string; active: boolean }[] = sendersData.senders ?? [];
      const sender = senders.find((s) => s.email === targetEmail && s.active);
      if (!sender) {
        return NextResponse.json(
          { ok: false, error: `Remetente ${targetEmail} não encontrado ou inativo no Brevo.` },
          { status: 400 }
        );
      }

      const campaign = await brevo("POST", "/emailCampaigns", {
        name: `${subject} — ${new Date().toLocaleDateString("pt-BR")}`,
        subject,
        htmlContent,
        sender: { id: sender.id, name: sender.name, email: sender.email },
        recipients: { listIds },
      });

      await brevo("POST", `/emailCampaigns/${campaign.id}/sendNow`);
      return NextResponse.json({ ok: true, campaignId: campaign.id });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return NextResponse.json({ ok: false, error: msg }, { status: 400 });
    }
  }

  if (action === "test") {
    const { subject, htmlContent, testEmails } = body;
    try {
      await resend.emails.send({
        from: "Rotina Clínica <contato@rotinaclinica.com>",
        to: testEmails as string[],
        subject: `[TESTE] ${subject}`,
        html: htmlContent,
      });
      return NextResponse.json({ ok: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return NextResponse.json({ ok: false, error: msg }, { status: 400 });
    }
  }

  if (action === "delete") {
    await brevo("DELETE", `/emailCampaigns/${body.campaignId}`);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
}
