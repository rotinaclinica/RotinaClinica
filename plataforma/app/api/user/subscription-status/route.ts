import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ hasActive: false });
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, subscription: { select: { status: true } } },
  });

  const hasActive = user?.role === "ADMIN" || user?.subscription?.status === "ACTIVE";
  return NextResponse.json({ hasActive });
}
