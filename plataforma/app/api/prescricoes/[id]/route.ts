import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

function getContent(): Record<string, string> {
  const filePath = join(process.cwd(), "lib", "prescricoes-content.json");
  return JSON.parse(readFileSync(filePath, "utf-8"));
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const role = (session.user as { role?: string })?.role;
  if (role !== "ADMIN" && role !== "TESTER") {
    const sub = await db.subscription.findUnique({
      where: { userId: session.user.id },
      select: { status: true },
    });
    if (sub?.status !== "ACTIVE") {
      return NextResponse.json({ error: "Assinatura necessária." }, { status: 403 });
    }
  }

  const { id } = await params;
  try {
    const entry = getContent()[id];
    if (entry == null) {
      return NextResponse.json({ error: "Prescrição não encontrada." }, { status: 404 });
    }
    return NextResponse.json({ conteudo: entry });
  } catch {
    return NextResponse.json({ error: "Erro ao carregar conteúdo." }, { status: 500 });
  }
}
