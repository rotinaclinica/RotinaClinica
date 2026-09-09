import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

async function getUserId() {
  const session = await auth();
  return session?.user?.id ?? null;
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { title, content } = await req.json() as { title?: string; content?: string };

  const note = await db.note.updateMany({
    where: { id, userId },
    data: { title: title?.trim() ?? "", content: content?.trim() ?? "" },
  });
  if (note.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await db.note.deleteMany({ where: { id, userId } });
  return NextResponse.json({ ok: true });
}
