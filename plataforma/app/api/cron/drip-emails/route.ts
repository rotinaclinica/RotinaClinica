import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Resend } from "resend";
import { dripHtml2, dripHtml7 } from "@/lib/emails/drip";

export const maxDuration = 60;

const resend = new Resend(process.env.RESEND_API_KEY ?? "re_placeholder");
const FROM = "Rotina Clínica <contato@rotinaclinica.com>";

const STEPS: { step: number; minHours: number; maxHours: number; subject: string; html: (n: string) => string }[] = [
  {
    step: 2,
    minHours: 48,
    maxHours: 72,
    subject: "Você ainda não explorou o que preparamos para você",
    html: dripHtml2,
  },
  {
    step: 7,
    minHours: 168,
    maxHours: 192,
    subject: "Última mensagem — queremos que você faça parte",
    html: dripHtml7,
  },
];

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = Date.now();
  const results: Record<number, { sent: number; failed: number }> = {};

  for (const { step, minHours, maxHours, subject, html } of STEPS) {
    const from = new Date(now - maxHours * 60 * 60 * 1000);
    const to   = new Date(now - minHours * 60 * 60 * 1000);

    const users = await db.user.findMany({
      where: {
        createdAt: { gte: from, lte: to },
        subscription: null,
        emailDrips: { none: { step } },
      },
      select: { id: true, email: true, name: true },
    });

    let sent = 0;
    let failed = 0;

    for (const user of users) {
      try {
        await resend.emails.send({
          from: FROM,
          to: user.email,
          subject,
          html: html(user.name ?? ""),
        });
        await db.emailDrip.create({ data: { userId: user.id, step } });
        sent++;
      } catch {
        failed++;
      }
    }

    results[step] = { sent, failed };
  }

  return NextResponse.json({ results });
}
