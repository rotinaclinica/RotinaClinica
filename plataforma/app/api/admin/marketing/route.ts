import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/require-admin";

const BREVO_BASE = "https://api.brevo.com/v3";

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

  const [listsData, campaignsData] = await Promise.all([
    brevo("GET", "/contacts/lists?limit=50"),
    brevo("GET", "/emailCampaigns?limit=20&sort=desc"),
  ]);

  return NextResponse.json({
    lists: listsData.lists ?? [],
    campaigns: campaignsData.campaigns ?? [],
  });
}

export async function POST(req: NextRequest) {
  if (!(await isAdminRequest())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { action } = body;

  if (action === "create_and_send") {
    const { subject, htmlContent, listIds, senderName, senderEmail } = body;

    const campaign = await brevo("POST", "/emailCampaigns", {
      name: `${subject} — ${new Date().toLocaleDateString("pt-BR")}`,
      subject,
      htmlContent,
      sender: { name: senderName ?? "Rotina Clínica", email: senderEmail ?? "contato@rotinaclinica.com" },
      recipients: { listIds },
    });

    await brevo("POST", `/emailCampaigns/${campaign.id}/sendNow`);
    return NextResponse.json({ ok: true, campaignId: campaign.id });
  }

  if (action === "test") {
    const { subject, htmlContent, testEmails } = body;
    await brevo("POST", "/smtp/email", {
      sender: { name: "Rotina Clínica", email: "contato@rotinaclinica.com" },
      to: testEmails.map((e: string) => ({ email: e })),
      subject,
      htmlContent,
    });
    return NextResponse.json({ ok: true });
  }

  if (action === "delete") {
    await brevo("DELETE", `/emailCampaigns/${body.campaignId}`);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
}
