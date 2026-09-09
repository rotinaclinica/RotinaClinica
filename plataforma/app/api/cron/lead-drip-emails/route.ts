import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Resend } from "resend";
import { leadDripHtml2, leadDripHtml7 } from "@/lib/emails/lead-drip";

export const maxDuration = 60;

const resend = new Resend(process.env.RESEND_API_KEY ?? "re_placeholder");
const FROM = "Rotina Clínica <contato@rotinaclinica.com>";

const STEPS: { step: number; minHours: number; maxHours: number; subject: string; html: (n: string) => string }[] = [
  {
    step: 2,
    minHours: 48,
    maxHours: 72,
    subject: "Você já conhece a qualidade — veja o que mais te espera",
    html: leadDripHtml2,
  },
  {
    step: 7,
    minHours: 168,
    maxHours: 192,
    subject: "A plataforma vai muito além do que você baixou",
    html: leadDripHtml7,
  },
];

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = Date.now();
  const results: Record<number, { sent: number; failed: number; skipped: number }> = {};

  for (const { step, minHours, maxHours, subject, html } of STEPS) {
    const from = new Date(now - maxHours * 60 * 60 * 1000);
    const to   = new Date(now - minHours * 60 * 60 * 1000);

    const leads = await db.lead.findMany({
      where: {
        createdAt: { gte: from, lte: to },
        leadDrips: { none: { step } },
      },
      select: { id: true, email: true, name: true },
    });

    let sent = 0;
    let failed = 0;
    let skipped = 0;

    for (const lead of leads) {
      // Pula se o email já tem assinatura ativa
      const activeSub = await db.user.findFirst({
        where: { email: lead.email, subscription: { isNot: null } },
        select: { id: true },
      });
      if (activeSub) { skipped++; continue; }

      try {
        await resend.emails.send({
          from: FROM,
          to: lead.email,
          subject,
          html: html(lead.name ?? ""),
        });
        await db.leadDrip.create({ data: { leadId: lead.id, step } });
        sent++;
      } catch {
        failed++;
      }
    }

    results[step] = { sent, failed, skipped };
  }

  return NextResponse.json({ results });
}
