"use client";

import { useActionState } from "react";
import { grantSubscriptionAccess } from "./actions";

export function GrantAccessForm({ defaultEmail = "" }: { defaultEmail?: string }) {
  const [state, action, pending] = useActionState(grantSubscriptionAccess, null);

  return (
    <form action={action} className="space-y-4">
      {state?.error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-lg px-4 py-3 text-sm">{state.error}</div>
      )}
      {state?.success && (
        <div className="bg-green-500/10 border border-green-500/30 text-green-300 rounded-lg px-4 py-3 text-sm">{state.success}</div>
      )}

      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-1">E-mail do usuário</label>
        <input
          name="email" type="email" required placeholder="usuario@email.com" defaultValue={defaultEmail}
          className="w-full bg-[#0d1525] text-zinc-100 border border-white/10 rounded-lg px-3 py-2 text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-1">Plano</label>
        <select name="plan" required className="w-full bg-[#0d1525] text-zinc-100 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 [&>option]:bg-[#0d1525] [&>option]:text-zinc-100">
          <option value="">Selecione o plano...</option>
          <option value="MONTHLY">Mensal (30 dias)</option>
          <option value="ANNUAL">Anual (365 dias)</option>
        </select>
      </div>

      <label className="flex items-center gap-3 cursor-pointer">
        <input type="checkbox" name="courtesy" value="true"
          className="w-4 h-4 rounded border-white/20 bg-[#0d1525] text-amber-500 focus:ring-amber-500 focus:ring-offset-0"
        />
        <span className="text-sm text-zinc-300">
          Cortesia <span className="text-zinc-500">(não conta no financeiro — MRR, DRE, relatórios)</span>
        </span>
      </label>

      <button type="submit" disabled={pending}
        className="bg-violet-600 text-white px-5 py-2 rounded-lg font-semibold text-sm hover:bg-violet-700 transition-colors disabled:opacity-60">
        {pending ? "Liberando..." : "Liberar acesso"}
      </button>
    </form>
  );
}
