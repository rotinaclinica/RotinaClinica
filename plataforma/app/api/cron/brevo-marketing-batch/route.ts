import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendBrevoQueueBatch, BREVO_DAILY_CAP } from "@/lib/brevo-queue";
import { logError } from "@/lib/error-logger";

export const maxDuration = 120;

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Várias ativas ao mesmo tempo = teste A/B: o limite diário é dividido entre elas
    const active = await db.brevoQueueCampaign.findMany({
      where: { status: "active" },
      orderBy: { createdAt: "asc" },
    });
    if (active.length === 0) {
      return NextResponse.json({ ok: true, message: "Nenhuma campanha Brevo ativa." });
    }

    const cap = Math.floor(BREVO_DAILY_CAP / active.length);
    const results = [];
    for (const c of active) {
      const listIds: number[] = JSON.parse(c.listIds);
      const result = await sendBrevoQueueBatch(c.id, c.subject, c.htmlContent, listIds, cap);
      if (result.done) {
        await db.brevoQueueCampaign.update({ where: { id: c.id }, data: { status: "completed" } });
      }
      results.push({ campaign: c.name, ...result });
    }

    return NextResponse.json({ ok: true, results });
  } catch (err) {
    await logError({ route: "/api/cron/brevo-marketing-batch", method: "GET", error: err });
    return NextResponse.json({ error: "Erro no cron Brevo." }, { status: 500 });
  }
}
