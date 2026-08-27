import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  // Máx. 2 gravações por minuto por usuário — evita inflar ActivityLog.
  // Ao exceder, responde ok sem gravar (não interrompe o cliente).
  if (!checkRateLimit("ping", session.user.id, 2, 60 * 1000)) {
    return NextResponse.json({ ok: true, throttled: true });
  }

  const now = new Date();

  await Promise.all([
    db.user.update({
      where: { id: session.user.id },
      data: { lastSeenAt: now },
    }),
    db.activityLog.create({ data: {} }),
  ]);

  return NextResponse.json({ ok: true });
}
