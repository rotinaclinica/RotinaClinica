import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false }, { status: 401 });
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
