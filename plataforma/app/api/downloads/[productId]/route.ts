import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { hasAccess } from "@/lib/entitlements";
import { getDownloadUrl } from "@/lib/r2";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { productId } = await params;

  const product = await db.product.findUnique({
    where: { id: productId, type: "DOWNLOAD", active: true },
  });
  if (!product?.fileKey) {
    return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
  }

  const entitled = await hasAccess(session.user.id, productId);
  if (!entitled) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const url = await getDownloadUrl(product.fileKey);
  return NextResponse.redirect(url);
}
