"use client";

import { useActionState } from "react";
import { addCost } from "./actions";

const CATEGORIES = [
  { value: "fixo", label: "Fixo mensal" },
  { value: "trafego", label: "Tráfego pago" },
  { value: "parceria", label: "Parceria" },
  { value: "software", label: "Software/Ferramenta" },
  { value: "outros", label: "Outros" },
];

export function CostForm() {
  const [state, action, pending] = useActionState(addCost, null);

  const now = new Date();
  const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  return (
    <form action={action} className="bg-[#161b22] rounded-xl border border-white/10 p-5 space-y-4">
      <h3 className="text-sm font-semibold text-zinc-100">Adicionar custo</h3>

      {state?.error && (
        <p className="text-xs text-red-400">{state.error}</p>
      )}
      {state?.success && (
        <p className="text-xs text-green-400">Custo adicionado.</p>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-zinc-400 mb-1">Nome</label>
          <input
            name="name"
            required
            placeholder="Ex: Google Ads"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>
        <div>
          <label className="block text-xs text-zinc-400 mb-1">Valor (R$)</label>
          <input
            name="amount"
            required
            placeholder="344,50"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs text-zinc-400 mb-1">Categoria</label>
          <select
            name="category"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-zinc-400 mb-1">Mês referência</label>
          <input
            name="month"
            type="month"
            defaultValue={defaultMonth}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>
        <div className="flex items-end pb-1">
          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input type="checkbox" name="recurring" className="accent-violet-600 w-4 h-4" />
            Recorrente
          </label>
        </div>
      </div>

      <div>
        <label className="block text-xs text-zinc-400 mb-1">Observação (opcional)</label>
        <input
          name="note"
          placeholder="Campanha Black Friday, parceria com X..."
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="bg-violet-600 text-white px-5 py-2 rounded-lg font-semibold text-sm hover:bg-violet-700 transition-colors disabled:opacity-60"
      >
        {pending ? "Adicionando..." : "+ Adicionar custo"}
      </button>
    </form>
  );
}
