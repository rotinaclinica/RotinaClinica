export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { formatPrice } from "@/lib/format";
import { nfeConfig } from "@/lib/nfe/config";
import { ProcessAllButton, RetryButton } from "./process-button";

export const metadata = { title: "Notas fiscais · Admin" };

const statusLabel: Record<string, { text: string; color: string }> = {
  PENDING:    { text: "Pendente",       color: "bg-yellow-100 text-yellow-700" },
  PROCESSING: { text: "Processando",    color: "bg-blue-100 text-blue-700" },
  AUTHORIZED: { text: "Autorizada",     color: "bg-green-100 text-green-700" },
  FAILED:     { text: "Falhou",         color: "bg-red-100 text-red-700" },
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
          <h1 className="text-2xl font-bold text-zinc-900">Notas fiscais</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Emissão automática de NFS-e após cada pagamento aprovado
          </p>
        </div>
        <ProcessAllButton />
      </div>

      {!dbReady && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
          <p className="font-semibold text-red-800 mb-1">Migração do banco pendente</p>
          <p className="text-sm text-red-700">
            A tabela de notas fiscais ainda não existe no banco. Rode{" "}
            <code className="px-1 py-0.5 bg-red-100 rounded">npx prisma db push</code> em{" "}
            <code className="px-1 py-0.5 bg-red-100 rounded">plataforma/</code> para criá-la.
          </p>
        </div>
      )}

      {/* Status do sistema */}
      <div
        className={`rounded-2xl border p-5 ${
          cfg.enabled
            ? "bg-green-50 border-green-200"
            : "bg-amber-50 border-amber-200"
        }`}
      >
        <div className="flex items-center gap-2 mb-3">
          <span
            className={`inline-block w-2.5 h-2.5 rounded-full ${
              cfg.enabled ? "bg-green-500" : "bg-amber-500"
            }`}
          />
          <p className="font-semibold text-zinc-900">
            {cfg.enabled
              ? `Emissão ligada · provedor: ${cfg.provider}`
              : "Emissão desligada (NFE_ENABLED ≠ true)"}
          </p>
        </div>
        {!cfg.enabled && (
          <p className="text-sm text-amber-800 mb-3">
            O sistema está pronto, mas não vai emitir notas até você definir{" "}
            <code className="px-1 py-0.5 bg-amber-100 rounded">NFE_ENABLED=true</code> e
            preencher os dados fiscais nas variáveis de ambiente da Vercel.
          </p>
        )}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {fiscalChecks.map((c) => (
            <div key={c.label} className="flex items-center gap-2 text-sm">
              <span className={c.ok ? "text-green-600" : "text-zinc-400"}>
                {c.ok ? "✓" : "○"}
              </span>
              <span className={c.ok ? "text-zinc-700" : "text-zinc-400"}>{c.label}</span>
            </div>
          ))}
        </div>
        {cfg.enabled && !fiscalPronto && (
          <p className="text-sm text-amber-800 mt-3">
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
            <div key={s} className="bg-white rounded-xl border border-zinc-200 p-4">
              <p className="text-xs text-zinc-500 mb-1">{meta.text}</p>
              <p className="text-2xl font-bold text-zinc-900">{counts[s] ?? 0}</p>
            </div>
          );
        })}
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden overflow-x-auto">
        <table className="w-full text-sm min-w-[820px]">
          <thead className="bg-zinc-50 border-b border-zinc-200">
            <tr>
              <th className="text-left px-5 py-3 font-medium text-zinc-500">Cliente</th>
              <th className="text-left px-5 py-3 font-medium text-zinc-500">Valor</th>
              <th className="text-left px-5 py-3 font-medium text-zinc-500">Gateway</th>
              <th className="text-left px-5 py-3 font-medium text-zinc-500">Nº</th>
              <th className="text-left px-5 py-3 font-medium text-zinc-500">Status</th>
              <th className="text-left px-5 py-3 font-medium text-zinc-500">PDF</th>
              <th className="text-left px-5 py-3 font-medium text-zinc-500">Criada em</th>
              <th className="text-left px-5 py-3 font-medium text-zinc-500"></th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => {
              const st = statusLabel[inv.status] ?? { text: inv.status, color: "" };
              return (
                <tr key={inv.id} className="border-b border-zinc-100 last:border-none hover:bg-zinc-50 align-top">
                  <td className="px-5 py-4">
                    <div className="font-medium text-zinc-900">{inv.customerName}</div>
                    <div className="text-xs text-zinc-400">{inv.customerEmail}</div>
                    {inv.errorMessage && (
                      <div className="text-xs text-red-500 mt-1 max-w-[240px]">{inv.errorMessage}</div>
                    )}
                  </td>
                  <td className="px-5 py-4 font-medium text-zinc-900">
                    {formatPrice(inv.amountCents, "BRL")}
                  </td>
                  <td className="px-5 py-4 text-zinc-500 text-xs">
                    {inv.order?.provider === "MERCADOPAGO" ? "Mercado Pago" : "Stripe"}
                  </td>
                  <td className="px-5 py-4 text-zinc-600 text-xs">{inv.numero ?? "—"}</td>
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
                      <a href={inv.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:underline">
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
