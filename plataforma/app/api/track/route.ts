import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { checkRateLimit } from "@/lib/rate-limit";

const schema = z.object({
  path: z.string().min(1).max(512),
});

// Dedup em memória por 5s — evita gravar múltiplas entradas da mesma
// navegação (double-render, retry, prefetch).
const lastByUser = new Map<string, { path: string; at: number }>();

function shouldDedup(userId: string, path: string): boolean {
  const last = lastByUser.get(userId);
  const now = Date.now();
  if (last && last.path === path && now - last.at < 5_000) return true;
  lastByUser.set(userId, { path, at: now });
  if (lastByUser.size > 5_000) {
    // Cleanup — remove entradas antigas
    const cutoff = now - 60_000;
    for (const [k, v] of lastByUser) {
      if (v.at < cutoff) lastByUser.delete(k);
    }
  }
  return false;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  // Rate limit: no máx. 30 tracks por minuto por usuário. Cliente honesto
  // não passa disso; excedeu, provavelmente é bug de loop.
  if (!checkRateLimit(`track:${session.user.id}`, session.user.id, 30, 60_000)) {
    return NextResponse.json({ ok: true, throttled: true });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: true });

  // Só rastreamos rotas do próprio dashboard.
  const path = parsed.data.path.split("?")[0].split("#")[0];
  if (!path.startsWith("/dashboard") && !path.startsWith("/curso")) {
    return NextResponse.json({ ok: true });
  }

  if (shouldDedup(session.user.id, path)) {
    return NextResponse.json({ ok: true, deduped: true });
  }

  await db.pageView.create({
    data: { userId: session.user.id, path },
  }).catch(() => {}); // Nunca falhar por erro de gravação

  return NextResponse.json({ ok: true });
}
