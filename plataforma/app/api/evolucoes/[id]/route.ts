import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";
import { auth } from "@/lib/auth";

function getContent(): Record<string, string> {
  const filePath = join(process.cwd(), "lib", "evolucoes-content.json");
  return JSON.parse(readFileSync(filePath, "utf-8"));
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { id } = await params;
  try {
    const entry = getContent()[id];
    if (entry == null) {
      return NextResponse.json({ error: "Modelo não encontrado." }, { status: 404 });
    }
    return NextResponse.json({ conteudo: entry });
  } catch {
    return NextResponse.json({ error: "Erro ao carregar conteúdo." }, { status: 500 });
  }
}
