import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { canAccessPaidContent } from "@/lib/subscription";
import { db } from "@/lib/db";
import { YOUTUBE_IDS } from "@/lib/cursos-videos";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const hasSubscription = await canAccessPaidContent(session.user.id);
  if (!hasSubscription) {
    const hasCourseEnrollment = await db.enrollment.findFirst({
      where: { userId: session.user.id, product: { type: "COURSE" } },
      select: { id: true },
    });
    if (!hasCourseEnrollment) {
      return NextResponse.json({ error: "Acesso não autorizado" }, { status: 403 });
    }
  }

  const { id } = await params;
  const youtubeId = YOUTUBE_IDS[Number(id)];
  if (!youtubeId) {
    return NextResponse.json({ error: "Vídeo não disponível" }, { status: 404 });
  }

  return NextResponse.json({ videoId: youtubeId });
}
