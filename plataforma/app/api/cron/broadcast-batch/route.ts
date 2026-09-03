import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendCampaignBatch } from "@/lib/broadcast";
import { logError } from "@/lib/error-logger";

export const maxDuration = 120;

export async function GET(req: NextRequest) {
  // Vercel Cron envia Authorization: Bearer <CRON_SECRET>
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET não configurado" }, { status: 500 });
  }
  if (req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const active = await db.broadcastCampaign.findFirst({
      where: { status: "active" },
      orderBy: { createdAt: "desc" },
    });
    if (!active) {
      return NextResponse.json({ ok: true, message: "Nenhuma campanha ativa." });
    }

    const result = await sendCampaignBatch(active.subject, active.body);
    if (result.done) {
      await db.broadcastCampaign.update({ where: { id: active.id }, data: { status: "completed" } });
    }

    return NextResponse.json({ ok: true, campaign: active.subject, ...result });
  } catch (err) {
    await logError({ route: "/api/cron/broadcast-batch", method: "GET", error: err });
    return NextResponse.json({ error: "Erro no cron de broadcast." }, { status: 500 });
  }
}
