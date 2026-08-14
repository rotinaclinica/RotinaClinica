"use client";

import { useActionState } from "react";
import { grantSubscriptionAccess } from "./actions";

export function GrantAccessForm() {
  const [state, action, pending] = useActionState(grantSubscriptionAccess, null);

  return (
    <form action={action} className="space-y-4">
      {state?.error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{state.error}</div>
      )}
      {state?.success && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm">{state.success}</div>
      )}

      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">E-mail do usuário</label>
        <input
          name="email" type="email" required placeholder="usuario@email.com"
          className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">Plano</label>
        <select name="plan" required className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500">
          <option value="">Selecione o plano...</option>
          <option value="MONTHLY">Mensal (30 dias)</option>
          <option value="ANNUAL">Anual (365 dias)</option>
        </select>
      </div>

      <button type="submit" disabled={pending}
        className="bg-violet-600 text-white px-5 py-2 rounded-lg font-semibold text-sm hover:bg-violet-700 transition-colors disabled:opacity-60">
        {pending ? "Liberando..." : "Liberar acesso"}
      </button>
    </form>
  );
}
