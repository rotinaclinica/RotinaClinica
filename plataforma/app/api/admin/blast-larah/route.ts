import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Resend } from "resend";
import { dripHtml0 } from "@/lib/emails/drip";

const resend = new Resend(process.env.RESEND_API_KEY ?? "re_placeholder");
const FROM = "Rotina Clínica <contato@rotinaclinica.com>";

export const dynamic = "force-dynamic";

export async function GET() {
  const userId = "cmtlarkct000004l2702k0ls0";
  const name = "Larah";
  const email = "larahcarvalhobarbosa1@gmail.com";

  const already = await db.emailDrip.findUnique({ where: { userId_step: { userId, step: 0 } } });
  if (already) return NextResponse.json({ skipped: true });

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Bem-vindo à plataforma do Rotina Clínica!",
    html: dripHtml0(name),
  });

  await db.emailDrip.create({ data: { userId, step: 0 } });

  return NextResponse.json({ sent: true, to: email });
}
