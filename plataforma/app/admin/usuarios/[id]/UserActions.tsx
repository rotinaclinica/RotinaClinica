"use client";

import { useActionState } from "react";
import { grantAccessToUser, revokeUserSubscription, toggleCourtesy } from "./actions";

const STATUS_COLORS: Record<string, string> = {
  ACTIVE:    "bg-emerald-500/20 text-emerald-300",
  CANCELLED: "bg-red-500/20 text-red-300",
  EXPIRED:   "bg-white/10 text-zinc-400",
  PAST_DUE:  "bg-amber-500/20 text-amber-300",
};

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Ativo", CANCELLED: "Cancelado", EXPIRED: "Expirado", PAST_DUE: "Em atraso",
};

type Sub = {
  id: string;
  plan: string;
  status: string;
  currentPeriodEnd: Date | null;
} | null;

export function UserActions({ userId, sub, isCourtesy }: { userId: string; sub: Sub; isCourtesy: boolean }) {
  const [grantState, grantAction, grantPending] = useActionState(grantAccessToUser, null);
  const [courtesyState, courtesyAction, courtesyPending] = useActionState(toggleCourtesy, null);

  return (
    <div className="space-y-6">
      {/* Cortesia */}
      <div className="bg-[#161b22] rounded-xl border border-white/10 p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wide">Cortesia</h2>
            <p className="text-xs text-zinc-400 mt-1">
              Usuários cortesia não entram na contabilidade financeira (MRR, DRE, relatórios).
            </p>
          </div>
          <form action={courtesyAction}>
            <input type="hidden" name="userId" value={userId} />
            <input type="hidden" name="value" value={isCourtesy ? "false" : "true"} />
            <button
              type="submit"
              disabled={courtesyPending}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isCourtesy ? "bg-amber-500" : "bg-white/10"
              } ${courtesyPending ? "opacity-60" : ""}`}
            >
              <span
                className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                  isCourtesy ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </form>
        </div>
        {isCourtesy && (
          <div className="mt-3 bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2 text-xs text-amber-300 font-medium">
            Este usuário está marcado como cortesia — não conta no financeiro.
          </div>
        )}
        {courtesyState?.error && (
          <div className="mt-3 bg-red-500/10 border border-red-500/30 text-red-300 rounded-lg px-3 py-2 text-xs">
            {courtesyState.error}
          </div>
        )}
      </div>

      {/* Status atual */}
      <div className="bg-[#161b22] rounded-xl border border-white/10 p-5">
        <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wide mb-3">Assinatura atual</h2>
        {sub ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <span className={`inline-block px-2.5 py-1 rounded text-xs font-bold uppercase ${STATUS_COLORS[sub.status] ?? "bg-white/10 text-zinc-400"}`}>
                {STATUS_LABEL[sub.status] ?? sub.status}
              </span>
              <span className="text-sm text-zinc-400">
                {sub.plan === "ANNUAL" ? "Anual" : sub.plan === "MONTHLY" ? "Mensal" : sub.plan}
              </span>
              {sub.currentPeriodEnd && (
                <span className="text-sm text-zinc-400">
                  · vence {new Date(sub.currentPeriodEnd).toLocaleDateString("pt-BR")}
                </span>
              )}
            </div>
            {sub.status === "ACTIVE" && (
              <form
                action={async () => {
                  if (!window.confirm("Cancelar a assinatura deste usuário?")) return;
                  await revokeUserSubscription(userId);
                }}
              >
                <button
                  type="submit"
                  className="text-sm font-semibold text-red-400 hover:underline"
                >
                  Cancelar assinatura
                </button>
              </form>
            )}
          </div>
        ) : (
          <p className="text-sm text-zinc-400">Sem assinatura ativa.</p>
        )}
      </div>

      {/* Conceder acesso */}
      <div className="bg-[#161b22] rounded-xl border border-white/10 p-5">
        <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wide mb-3">
          {sub?.status === "ACTIVE" ? "Alterar / renovar acesso" : "Conceder acesso"}
        </h2>

        {grantState?.error && (
          <div className="mb-3 bg-red-500/10 border border-red-500/30 text-red-300 rounded-lg px-4 py-3 text-sm">
            {grantState.error}
          </div>
        )}
        {grantState?.success && (
          <div className="mb-3 bg-green-500/10 border border-green-500/30 text-green-300 rounded-lg px-4 py-3 text-sm">
            {grantState.success}
          </div>
        )}

        <form action={grantAction} className="flex flex-wrap items-end gap-3">
          <input type="hidden" name="userId" value={userId} />
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Plano</label>
            <select
              name="plan"
              required
              className="border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="">Selecione...</option>
              <option value="ANNUAL">Anual (365 dias)</option>
              <option value="MONTHLY">Mensal (30 dias)</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={grantPending}
            className="bg-violet-600 text-white px-5 py-2 rounded-lg font-semibold text-sm hover:bg-violet-700 transition-colors disabled:opacity-60"
          >
            {grantPending ? "Salvando..." : "Liberar acesso"}
          </button>
        </form>
      </div>
    </div>
  );
}
