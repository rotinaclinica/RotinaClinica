import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const order = await db.order.findUnique({
    where: { id, userId: session.user.id },
    select: { status: true },
  });

  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ status: order.status });
}
