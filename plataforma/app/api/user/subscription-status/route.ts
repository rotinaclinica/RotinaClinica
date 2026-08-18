import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ hasActive: false });
  }

  const sub = await db.subscription.findUnique({
    where: { userId: session.user.id },
    select: { status: true },
  });

  return NextResponse.json({ hasActive: sub?.status === "ACTIVE" });
}
