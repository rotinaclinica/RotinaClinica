import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendBrevoQueueBatch } from "@/lib/brevo-queue";
import { logError } from "@/lib/error-logger";

export const maxDuration = 120;

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const active = await db.brevoQueueCampaign.findFirst({
      where: { status: "active" },
      orderBy: { createdAt: "desc" },
    });
    if (!active) {
      return NextResponse.json({ ok: true, message: "Nenhuma campanha Brevo ativa." });
    }

    const listIds: number[] = JSON.parse(active.listIds);
    const result = await sendBrevoQueueBatch(active.id, active.subject, active.htmlContent, listIds);

    if (result.done) {
      await db.brevoQueueCampaign.update({ where: { id: active.id }, data: { status: "completed" } });
    }

    return NextResponse.json({ ok: true, campaign: active.name, ...result });
  } catch (err) {
    await logError({ route: "/api/cron/brevo-marketing-batch", method: "GET", error: err });
    return NextResponse.json({ error: "Erro no cron Brevo." }, { status: 500 });
  }
}
