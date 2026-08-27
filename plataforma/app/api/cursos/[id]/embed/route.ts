import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { canAccessPaidContent } from "@/lib/subscription";
import { YOUTUBE_IDS } from "@/lib/cursos-videos";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  if (!(await canAccessPaidContent(session.user.id))) {
    return NextResponse.json({ error: "Assinatura inativa" }, { status: 403 });
  }

  const { id } = await params;
  const youtubeId = YOUTUBE_IDS[Number(id)];
  if (!youtubeId) {
    return NextResponse.json({ error: "Vídeo não disponível" }, { status: 404 });
  }

  return NextResponse.json({ videoId: youtubeId });
}
