import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { DOCSTAGE_YOUTUBE_IDS } from "@/lib/docstage-videos";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ moduloId: string; aulaId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  const isPrivileged = user?.role === "ADMIN" || user?.role === "TESTER";

  if (!isPrivileged) {
    const sub = await db.subscription.findUnique({ where: { userId: session.user.id } });
    if (!sub || sub.status !== "ACTIVE") {
      return NextResponse.json({ error: "Assinatura inativa" }, { status: 403 });
    }
  }

  const { moduloId, aulaId } = await params;
  const youtubeId = DOCSTAGE_YOUTUBE_IDS[moduloId]?.[Number(aulaId)];
  if (!youtubeId) {
    return NextResponse.json({ error: "Vídeo não disponível" }, { status: 404 });
  }

  return NextResponse.json({ videoId: youtubeId });
}
