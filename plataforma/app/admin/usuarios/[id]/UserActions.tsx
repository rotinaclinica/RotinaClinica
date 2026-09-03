"use client";

import { useActionState } from "react";
import { grantAccessToUser, revokeUserSubscription } from "./actions";

const STATUS_COLORS: Record<string, string> = {
  ACTIVE:    "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-red-100 text-red-700",
  EXPIRED:   "bg-zinc-100 text-zinc-600",
  PAST_DUE:  "bg-amber-100 text-amber-700",
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

export function UserActions({ userId, sub }: { userId: string; sub: Sub }) {
  const [grantState, grantAction, grantPending] = useActionState(grantAccessToUser, null);

  return (
    <div className="space-y-6">
      {/* Status atual */}
      <div className="bg-white rounded-xl border border-zinc-200 p-5">
        <h2 className="text-sm font-bold text-zinc-700 uppercase tracking-wide mb-3">Assinatura atual</h2>
        {sub ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <span className={`inline-block px-2.5 py-1 rounded text-xs font-bold uppercase ${STATUS_COLORS[sub.status] ?? "bg-zinc-100 text-zinc-600"}`}>
                {STATUS_LABEL[sub.status] ?? sub.status}
              </span>
              <span className="text-sm text-zinc-600">
                {sub.plan === "ANNUAL" ? "Anual" : sub.plan === "MONTHLY" ? "Mensal" : sub.plan}
              </span>
              {sub.currentPeriodEnd && (
                <span className="text-sm text-zinc-500">
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
                  className="text-sm font-semibold text-red-600 hover:underline"
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
      <div className="bg-white rounded-xl border border-zinc-200 p-5">
        <h2 className="text-sm font-bold text-zinc-700 uppercase tracking-wide mb-3">
          {sub?.status === "ACTIVE" ? "Alterar / renovar acesso" : "Conceder acesso"}
        </h2>

        {grantState?.error && (
          <div className="mb-3 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
            {grantState.error}
          </div>
        )}
        {grantState?.success && (
          <div className="mb-3 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm">
            {grantState.success}
          </div>
        )}

        <form action={grantAction} className="flex flex-wrap items-end gap-3">
          <input type="hidden" name="userId" value={userId} />
          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1">Plano</label>
            <select
              name="plan"
              required
              className="border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
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
