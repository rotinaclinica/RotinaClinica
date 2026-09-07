"use client";

import { removeAmbassador, markCommissionPaid } from "./actions";

export function RemoveButton({ userId }: { userId: string }) {
  return (
    <form action={removeAmbassador.bind(null, userId)}>
      <button type="submit" className="text-[11px] font-semibold px-2 py-0.5 rounded border border-red-200 dark:border-red-900 text-red-400 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600 transition-colors">
        Remover
      </button>
    </form>
  );
}

export function MarkPaidButton({ ambassadorId, pending }: { ambassadorId: string; pending: number }) {
  if (pending === 0) return null;
  return (
    <form action={markCommissionPaid.bind(null, ambassadorId)}>
      <button type="submit" className="text-[11px] font-semibold px-2 py-0.5 rounded border border-green-300 dark:border-green-800 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950 transition-colors">
        Marcar pago
      </button>
    </form>
  );
}
