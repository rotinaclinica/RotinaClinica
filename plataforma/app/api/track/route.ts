import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { checkRateLimit } from "@/lib/rate-limit";
import { CHECKOUT_PATH } from "@/lib/subscription";

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

// Visitante sem conta que abriu o checkout: grava com userId "anon_<id do navegador>".
// Esse id não existe na tabela User, então as consultas que juntam PageView a User
// (comportamento, retenção, uso do teste) não enxergam essas linhas.
const ANON_CHECKOUT_PATH = "/checkout-visitante";
const anonSchema = z.object({
  path: z.literal(ANON_CHECKOUT_PATH),
  visitorId: z.string().regex(/^[a-f0-9]{16,40}$/),
});

async function trackAnonCheckout(req: NextRequest, body: unknown) {
  const parsed = anonSchema.safeParse(body);
  if (!parsed.success) return;
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!checkRateLimit("track-anon", ip, 10, 60_000)) return;
  const userId = `anon_${parsed.data.visitorId}`;
  if (shouldDedup(userId, ANON_CHECKOUT_PATH)) return;
  await db.pageView.create({ data: { userId, path: ANON_CHECKOUT_PATH } }).catch(() => {});
}

// Visita a página de oferta (/black-week) ou ao checkout aberto por ela, com ou
// sem login. Grava em PageView como "/oferta/<slug>[/checkout]?o=<origem>",
// com userId "anon_<id do navegador>" para contar pessoas do mesmo jeito para
// todos (logado ou não). Ler com path startsWith "/oferta/".
const offerSchema = z.object({
  path: z.string().regex(/^\/oferta\/[a-z0-9-]{1,30}(\/checkout)?$/),
  visitorId: z.string().regex(/^[a-f0-9]{16,40}$/),
  origem: z.string().max(300).optional(),
});

async function trackOfferVisit(req: NextRequest, body: unknown) {
  const parsed = offerSchema.safeParse(body);
  if (!parsed.success) return;
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!checkRateLimit("track-offer", ip, 20, 60_000)) return;
  const origem = (parsed.data.origem ?? "direto")
    .toLowerCase()
    .replace(/[^a-z0-9_.\-]/g, "")
    .slice(0, 120) || "direto";
  const userId = `anon_${parsed.data.visitorId}`;
  if (shouldDedup(userId, parsed.data.path)) return;
  await db.pageView
    .create({ data: { userId, path: `${parsed.data.path}?o=${origem}` } })
    .catch(() => {});
}

export async function POST(req: NextRequest) {
  const raw = await req.text().catch(() => "");
  let body: unknown = null;
  try {
    body = raw ? JSON.parse(raw) : null;
  } catch {
    body = null;
  }

  if (typeof (body as { path?: unknown })?.path === "string" && (body as { path: string }).path.startsWith("/oferta/")) {
    await trackOfferVisit(req, body);
    return NextResponse.json({ ok: true });
  }

  const session = await auth();
  if (!session?.user?.id) {
    await trackAnonCheckout(req, body);
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  // Rate limit: no máx. 30 tracks por minuto por usuário. Cliente honesto
  // não passa disso; excedeu, provavelmente é bug de loop.
  if (!checkRateLimit(`track:${session.user.id}`, session.user.id, 30, 60_000)) {
    return NextResponse.json({ ok: true, throttled: true });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: true });

  // Só rastreamos rotas do próprio dashboard, além da abertura do checkout
  // (quem abre e não paga não gera pedido, então não apareceria em lugar nenhum).
  const path = parsed.data.path.split("?")[0].split("#")[0];
  if (!path.startsWith("/dashboard") && !path.startsWith("/curso") && path !== CHECKOUT_PATH) {
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
