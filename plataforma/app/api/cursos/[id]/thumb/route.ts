import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { YOUTUBE_IDS } from "@/lib/cursos-videos";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse(null, { status: 401 });
  }

  const { id } = await params;
  const youtubeId = YOUTUBE_IDS[Number(id)];
  if (!youtubeId) {
    return new NextResponse(null, { status: 404 });
  }

  const res = await fetch(`https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`);
  if (!res.ok) {
    return new NextResponse(null, { status: 404 });
  }

  const buffer = await res.arrayBuffer();
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
