import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

let cache: Record<string, string> | null = null;

function getContent(): Record<string, string> {
  if (cache) return cache;
  const filePath = join(process.cwd(), "lib", "prescricoes-content.json");
  cache = JSON.parse(readFileSync(filePath, "utf-8"));
  return cache!;
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const content = getContent();
    const conteudo = content[id];
    if (!conteudo) {
      return NextResponse.json({ error: "Prescrição não encontrada." }, { status: 404 });
    }
    return NextResponse.json({ conteudo });
  } catch {
    return NextResponse.json({ error: "Erro ao carregar conteúdo." }, { status: 500 });
  }
}
