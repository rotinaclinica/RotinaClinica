import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

type Entry = { c: string; d: string };

let cache: Entry[] | null = null;

function getEntries(): Entry[] {
  if (!cache) {
    const raw = readFileSync(join(process.cwd(), "lib", "cid10.json"), "utf-8");
    cache = JSON.parse(raw);
  }
  return cache!;
}

function formatCode(c: string): string {
  if (c.length === 4) return `${c.slice(0, 3)}.${c.slice(3)}`;
  return c;
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim().toUpperCase() ?? "";
  if (q.length < 2) return NextResponse.json([]);

  const entries = getEntries();
  const isCode = /^[A-Z]\d/.test(q);
  const results: { code: string; descricao: string }[] = [];

  for (const e of entries) {
    if (results.length >= 50) break;
    const code = formatCode(e.c);
    const desc = e.d.toUpperCase();
    if (isCode) {
      if (code.startsWith(q) || e.c.startsWith(q.replace(".", ""))) {
        results.push({ code, descricao: e.d });
      }
    } else {
      if (desc.includes(q)) {
        results.push({ code, descricao: e.d });
      }
    }
  }

  return NextResponse.json(results);
}
