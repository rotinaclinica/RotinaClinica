import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/require-admin";
import { db } from "@/lib/db";
import {
  queueCampaignId,
  sendBrevoQueueBatch,
  fetchBrevoContacts,
  BREVO_DAILY_CAP,
} from "@/lib/brevo-queue";
import { buildHtml } from "@/lib/broadcast";

export const maxDuration = 120;

export async function GET() {
  if (!(await isAdminRequest())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const active = await db.brevoQueueCampaign.findFirst({
    where: { status: "active" },
    orderBy: { createdAt: "desc" },
  });
  if (!active) return NextResponse.json({ campaign: null });

  const listIds: number[] = JSON.parse(active.listIds);
  const [contacts, sentCount] = await Promise.all([
    fetchBrevoContacts(listIds),
    db.brevoQueueSent.count({ where: { campaignId: active.id } }),
  ]);

  return NextResponse.json({
    campaign: {
      id: active.id,
      name: active.name,
      subject: active.subject,
      total: contacts.length,
      alreadySent: sentCount,
      remaining: Math.max(0, contacts.length - sentCount),
    },
  });
}

export async function POST(req: NextRequest) {
  if (!(await isAdminRequest())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { action } = body;

  if (action === "cancel") {
    await db.brevoQueueCampaign.updateMany({ where: { status: "active" }, data: { status: "cancelled" } });
    return NextResponse.json({ cancelled: true });
  }

  if (action === "start") {
    const { subject, bodyText, listIds, name } = body as {
      subject: string;
      bodyText: string;
      listIds: number[];
      name: string;
    };

    if (!subject?.trim() || !bodyText?.trim() || !listIds?.length) {
      return NextResponse.json({ error: "subject, bodyText e listIds são obrigatórios" }, { status: 400 });
    }

    const htmlContent = buildHtml(subject, bodyText);
    const campaignId = queueCampaignId(subject, htmlContent, listIds);

    // Cancela qualquer campanha ativa diferente
    await db.brevoQueueCampaign.updateMany({
      where: { status: "active", NOT: { id: campaignId } },
      data: { status: "cancelled" },
    });

    await db.brevoQueueCampaign.upsert({
      where: { id: campaignId },
      create: { id: campaignId, name: name || subject, subject, htmlContent, listIds: JSON.stringify(listIds), status: "active" },
      update: { name: name || subject, subject, htmlContent, listIds: JSON.stringify(listIds), status: "active" },
    });

    try {
      const result = await sendBrevoQueueBatch(campaignId, subject, htmlContent, listIds, BREVO_DAILY_CAP);
      if (result.done) {
        await db.brevoQueueCampaign.update({ where: { id: campaignId }, data: { status: "completed" } });
      }
      return NextResponse.json({ ok: true, ...result });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return NextResponse.json({ ok: false, error: msg }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
}
