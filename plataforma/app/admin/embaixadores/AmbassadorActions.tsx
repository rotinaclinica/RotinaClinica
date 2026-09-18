"use client";

import { removeAmbassador, markCommissionPaid, grantBonusMonth } from "./actions";

export function RemoveButton({ userId }: { userId: string }) {
  return (
    <form action={removeAmbassador.bind(null, userId)}>
      <button type="submit" className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors">
        Remover
      </button>
    </form>
  );
}

export function MarkPaidButton({ ambassadorId, pending }: { ambassadorId: string; pending: number }) {
  if (pending === 0) return null;
  return (
    <form action={markCommissionPaid.bind(null, ambassadorId)}>
      <button type="submit" className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-emerald-300 text-emerald-700 hover:bg-emerald-50 transition-colors">
        Marcar como pago
      </button>
    </form>
  );
}

export function GrantBonusMonthButton({ ambassadorId }: { ambassadorId: string }) {
  return (
    <form action={grantBonusMonth.bind(null, ambassadorId)}>
      <button type="submit" className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-[#3db8d4]/40 text-[#3db8d4] hover:bg-[#3db8d4]/10 transition-colors">
        +1 mês bônus
      </button>
    </form>
  );
}
