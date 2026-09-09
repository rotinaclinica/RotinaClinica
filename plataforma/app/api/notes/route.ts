import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

async function getUserId() {
  const session = await auth();
  return session?.user?.id ?? null;
}

export async function GET() {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const notes = await db.note.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true, content: true, createdAt: true, updatedAt: true },
  });
  return NextResponse.json(notes);
}

export async function POST(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, content } = await req.json() as { title?: string; content?: string };
  const count = await db.note.count({ where: { userId } });
  if (count >= 50) {
    return NextResponse.json({ error: "Limite de 50 anotações atingido. Exclua algumas para criar novas." }, { status: 400 });
  }

  const note = await db.note.create({
    data: { userId, title: title?.trim() ?? "", content: content?.trim() ?? "" },
  });
  return NextResponse.json(note, { status: 201 });
}
