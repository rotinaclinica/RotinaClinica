import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdminRequest } from "@/lib/require-admin";
import { getEmailList, buildHtml, sendBatches, sendCampaignBatch, campaignIdOf } from "@/lib/broadcast";

export const maxDuration = 120;

export async function GET() {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const emails = await getEmailList();
  const active = await db.broadcastCampaign.findFirst({
    where: { status: "active" },
    orderBy: { createdAt: "desc" },
  });
  let campaign = null;
  if (active) {
    const sentCount = await db.broadcastSent.count({ where: { campaignId: active.id } });
    campaign = {
      subject: active.subject,
      alreadySent: sentCount,
      remaining: Math.max(0, emails.length - sentCount),
    };
  }
  return NextResponse.json({ total: emails.length, campaign });
}

export async function POST(req: NextRequest) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { subject, body, testEmails, action } = await req.json() as {
    subject?: string;
    body?: string;
    testEmails?: string[];
    action?: string;
  };

  // ── Cancelar a campanha automática ativa ──
  if (action === "cancel") {
    await db.broadcastCampaign.updateMany({ where: { status: "active" }, data: { status: "cancelled" } });
    return NextResponse.json({ cancelled: true });
  }

  if (!subject?.trim() || !body?.trim()) {
    return NextResponse.json({ error: "subject e body são obrigatórios" }, { status: 400 });
  }

  // ── Envio de teste: só para os emails informados, não conta na campanha ──
  if (Array.isArray(testEmails) && testEmails.length > 0) {
    const seen = new Set<string>();
    const list = testEmails
      .map((e) => String(e).trim().toLowerCase())
      .filter((e) => {
        if (!e || !e.includes("@") || !e.includes(".") || seen.has(e)) return false;
        seen.add(e);
        return true;
      })
      .slice(0, 5);
    if (list.length === 0) {
      return NextResponse.json({ error: "Nenhum email de teste válido." }, { status: 400 });
    }
    const r = await sendBatches(list, subject, buildHtml(subject, body));
    return NextResponse.json({ test: true, total: list.length, sent: r.sent, failed: r.failed, errors: r.errors });
  }

  // ── Iniciar campanha automática: registra e envia o 1º lote agora.
  // Os lotes seguintes são enviados automaticamente pelo cron diário. ──
  const campaignId = campaignIdOf(subject, body);

  // Só uma campanha ativa por vez.
  await db.broadcastCampaign.updateMany({
    where: { status: "active", NOT: { id: campaignId } },
    data: { status: "cancelled" },
  });
  await db.broadcastCampaign.upsert({
    where: { id: campaignId },
    create: { id: campaignId, subject, body, status: "active" },
    update: { subject, body, status: "active" },
  });

  const result = await sendCampaignBatch(subject, body);
  if (result.done) {
    await db.broadcastCampaign.update({ where: { id: campaignId }, data: { status: "completed" } });
  }
  return NextResponse.json(result);
}
