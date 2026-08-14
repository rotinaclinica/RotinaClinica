"use client";

import { revokeSubscription } from "./actions";

export function RevokeButton({ subscriptionId }: { subscriptionId: string }) {
  return (
    <form action={revokeSubscription.bind(null, subscriptionId)}>
      <button
        type="submit"
        className="text-xs text-red-400 hover:text-red-600"
        onClick={(e) => { if (!confirm("Cancelar assinatura?")) e.preventDefault(); }}
      >
        Cancelar
      </button>
    </form>
  );
}
