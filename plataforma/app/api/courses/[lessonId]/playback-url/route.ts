import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { hasAccess } from "@/lib/entitlements";
import { getMuxSignedPlaybackUrl } from "@/lib/mux";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { lessonId } = await params;

  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    include: { module: { include: { product: true } } },
  });

  if (!lesson?.muxPlaybackId) {
    return NextResponse.json({ error: "Aula não encontrada" }, { status: 404 });
  }

  if (!lesson.freePreview) {
    const entitled = await hasAccess(session.user.id, lesson.module.productId);
    if (!entitled) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }
  }

  const url = await getMuxSignedPlaybackUrl(lesson.muxPlaybackId);
  return NextResponse.json({ url });
}
