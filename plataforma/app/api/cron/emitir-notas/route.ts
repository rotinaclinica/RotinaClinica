import { NextRequest, NextResponse } from "next/server";
import { processInvoiceBatch } from "@/lib/nfe";
import { logError } from "@/lib/error-logger";

export const maxDuration = 120;

/**
 * Cron de emissão de NFS-e. Roda periodicamente (ver vercel.json) e conduz o
 * ciclo de vida das notas: emite as PENDENTES, consulta as EM PROCESSAMENTO e
 * entrega o PDF por email quando autorizadas. Se NFE_ENABLED != true, no-op.
 *
 * Também aceita chamada manual autenticada (mesmo CRON_SECRET) — usado pelo
 * botão "Processar agora" do painel admin.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET não configurado" }, { status: 500 });
  }
  if (req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await processInvoiceBatch(30);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    await logError({ route: "/api/cron/emitir-notas", method: "GET", error: err });
    return NextResponse.json({ error: "Erro no cron de notas fiscais." }, { status: 500 });
  }
}
