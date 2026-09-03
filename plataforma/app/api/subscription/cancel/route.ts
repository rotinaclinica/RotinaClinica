import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendCancellationNotification } from "@/lib/email";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const sub = await db.subscription.findUnique({ where: { userId: session.user.id } });
  if (!sub || sub.status !== "ACTIVE") {
    return NextResponse.json({ error: "Nenhuma assinatura ativa encontrada" }, { status: 400 });
  }

  await db.subscription.update({
    where: { userId: session.user.id },
    data: { status: "CANCELLED", cancelledAt: new Date() },
  });

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (user?.email) {
    await sendCancellationNotification({
      customerName: user.name ?? "Cliente",
      customerEmail: user.email,
      accessUntil: sub.currentPeriodEnd,
    }).catch(() => {});
  }

  return NextResponse.json({ ok: true });
}
