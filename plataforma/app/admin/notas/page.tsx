export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { formatPrice } from "@/lib/format";
import { nfeConfig } from "@/lib/nfe/config";
import { ProcessAllButton, RetryButton } from "./process-button";

export const metadata = { title: "Notas fiscais · Admin" };

const statusLabel: Record<string, { text: string; color: string }> = {
  PENDING:    { text: "Pendente",       color: "bg-yellow-500/20 text-yellow-300" },
  PROCESSING: { text: "Processando",    color: "bg-blue-500/20 text-blue-300" },
  AUTHORIZED: { text: "Autorizada",     color: "bg-green-500/20 text-green-300" },
  FAILED:     { text: "Falhou",         color: "bg-red-500/20 text-red-300" },
};

function loadInvoices() {
  return db.invoice.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      order: {
        select: {
          provider: true,
          user: { select: { name: true, email: true } },
        },
      },
    },
  });
}

export default async function AdminNotasPage() {
  // Resiliente à janela entre deploy e migração: se a tabela ainda não existe
  // (prisma db push pendente), mostra um aviso em vez de estourar 500.
  let invoices: Awaited<ReturnType<typeof loadInvoices>> = [];
  let grouped: { status: string; _count: number }[] = [];
  let dbReady = true;
  try {
    [invoices, grouped] = await Promise.all([
      loadInvoices(),
      db.invoice.groupBy({ by: ["status"], _count: true }),
    ]);
  } catch {
    dbReady = false;
  }

  const counts: Record<string, number> = {};
  for (const g of grouped) counts[g.status] = g._count;

  // Diagnóstico da configuração fiscal (sem expor segredos).
  const cfg = nfeConfig;
  const fiscalChecks: { label: string; ok: boolean }[] = [
    { label: "CNPJ do emitente", ok: !!cfg.emitente.cnpj },
    { label: "Inscrição municipal", ok: !!cfg.emitente.inscricaoMunicipal },
    { label: "Código do município (IBGE)", ok: !!cfg.emitente.codigoMunicipioIbge },
    { label: "Item da lista de serviço", ok: !!cfg.servico.itemListaServico },
    { label: "Alíquota ISS", ok: cfg.servico.aliquotaIss > 0 },
    {
      label: "Token do provedor",
      ok:
        cfg.provider === "asaas"
          ? !!cfg.asaas.apiKey
          : cfg.provider === "focusnfe"
            ? !!cfg.focusnfe.token
            : false,
    },
  ];
  const fiscalPronto = fiscalChecks.every((c) => c.ok);

  const fmt = (d: Date | null | undefined) =>
    d ? new Date(d).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }) : "—";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Notas fiscais</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Emissão automática de NFS-e após cada pagamento aprovado
          </p>
        </div>
        <ProcessAllButton />
      </div>

      {!dbReady && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5">
          <p className="font-semibold text-red-300 mb-1">Migração do banco pendente</p>
          <p className="text-sm text-red-300">
            A tabela de notas fiscais ainda não existe no banco. Rode{" "}
            <code className="px-1 py-0.5 bg-red-500/20 rounded">npx prisma db push</code> em{" "}
            <code className="px-1 py-0.5 bg-red-500/20 rounded">plataforma/</code> para criá-la.
          </p>
        </div>
      )}

      {/* Status do sistema */}
      <div
        className={`rounded-2xl border p-5 ${
          cfg.enabled
            ? "bg-green-500/10 border-green-500/30"
            : "bg-amber-500/10 border-amber-500/30"
        }`}
      >
        <div className="flex items-center gap-2 mb-3">
          <span
            className={`inline-block w-2.5 h-2.5 rounded-full ${
              cfg.enabled ? "bg-green-500" : "bg-amber-500"
            }`}
          />
          <p className="font-semibold text-zinc-100">
            {cfg.enabled
              ? `Emissão ligada · provedor: ${cfg.provider}`
              : "Emissão desligada (NFE_ENABLED ≠ true)"}
          </p>
        </div>
        {!cfg.enabled && (
          <p className="text-sm text-amber-300 mb-3">
            O sistema está pronto, mas não vai emitir notas até você definir{" "}
            <code className="px-1 py-0.5 bg-amber-500/20 rounded">NFE_ENABLED=true</code> e
            preencher os dados fiscais nas variáveis de ambiente da Vercel.
          </p>
        )}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {fiscalChecks.map((c) => (
            <div key={c.label} className="flex items-center gap-2 text-sm">
              <span className={c.ok ? "text-green-400" : "text-zinc-400"}>
                {c.ok ? "✓" : "○"}
              </span>
              <span className={c.ok ? "text-zinc-400" : "text-zinc-400"}>{c.label}</span>
            </div>
          ))}
        </div>
        {cfg.enabled && !fiscalPronto && (
          <p className="text-sm text-amber-300 mt-3">
            ⚠️ Emissão ligada mas há campos fiscais faltando — as notas vão falhar até
            completar.
          </p>
        )}
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(["AUTHORIZED", "PROCESSING", "PENDING", "FAILED"] as const).map((s) => {
          const meta = statusLabel[s];
          return (
            <div key={s} className="bg-[#161b22] rounded-xl border border-white/10 p-4">
              <p className="text-xs text-zinc-400 mb-1">{meta.text}</p>
              <p className="text-2xl font-bold text-zinc-100">{counts[s] ?? 0}</p>
            </div>
          );
        })}
      </div>

      {/* Tabela */}
      <div className="bg-[#161b22] rounded-2xl border border-white/10 overflow-hidden overflow-x-auto">
        <table className="w-full text-sm min-w-[820px]">
          <thead className="bg-white/5 border-b border-white/10">
            <tr>
              <th className="text-left px-5 py-3 font-medium text-zinc-400">Cliente</th>
              <th className="text-left px-5 py-3 font-medium text-zinc-400">Valor</th>
              <th className="text-left px-5 py-3 font-medium text-zinc-400">Gateway</th>
              <th className="text-left px-5 py-3 font-medium text-zinc-400">Nº</th>
              <th className="text-left px-5 py-3 font-medium text-zinc-400">Status</th>
              <th className="text-left px-5 py-3 font-medium text-zinc-400">PDF</th>
              <th className="text-left px-5 py-3 font-medium text-zinc-400">Criada em</th>
              <th className="text-left px-5 py-3 font-medium text-zinc-400"></th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => {
              const st = statusLabel[inv.status] ?? { text: inv.status, color: "" };
              return (
                <tr key={inv.id} className="border-b border-white/10 last:border-none hover:bg-white/5 align-top">
                  <td className="px-5 py-4">
                    <div className="font-medium text-zinc-100">{inv.customerName}</div>
                    <div className="text-xs text-zinc-400">{inv.customerEmail}</div>
                    {inv.errorMessage && (
                      <div className="text-xs text-red-500 mt-1 max-w-[240px]">{inv.errorMessage}</div>
                    )}
                  </td>
                  <td className="px-5 py-4 font-medium text-zinc-100">
                    {formatPrice(inv.amountCents, "BRL")}
                  </td>
                  <td className="px-5 py-4 text-zinc-400 text-xs">
                    {inv.order?.provider === "MERCADOPAGO" ? "Mercado Pago" : inv.order?.provider === "ASAAS" ? "Asaas" : "Stripe"}
                  </td>
                  <td className="px-5 py-4 text-zinc-400 text-xs">{inv.numero ?? "—"}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${st.color}`}>
                      {st.text}
                    </span>
                    {inv.attempts > 0 && inv.status !== "AUTHORIZED" && (
                      <div className="text-[11px] text-zinc-400 mt-1">{inv.attempts} tentativa{inv.attempts !== 1 ? "s" : ""}</div>
                    )}
                  </td>
                  <td className="px-5 py-4 text-xs">
                    {inv.pdfUrl ? (
                      <a href={inv.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:underline">
                        abrir
                      </a>
                    ) : (
                      <span className="text-zinc-300">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-zinc-400 text-xs">{fmt(inv.createdAt)}</td>
                  <td className="px-5 py-4">
                    {inv.status !== "AUTHORIZED" && <RetryButton invoiceId={inv.id} />}
                  </td>
                </tr>
              );
            })}
            {invoices.length === 0 && (
              <tr>
                <td colSpan={8} className="px-5 py-12 text-center text-zinc-400">
                  Nenhuma nota emitida até o momento.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
