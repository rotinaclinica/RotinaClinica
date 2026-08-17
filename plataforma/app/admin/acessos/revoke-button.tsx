"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { revokeSubscription } from "./actions";

export function RevokeButton({ subscriptionId }: { subscriptionId: string }) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  if (confirming) {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-zinc-500">Confirmar?</span>
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            setError("");
            startTransition(async () => {
              try {
                await revokeSubscription(subscriptionId);
                router.refresh();
              } catch {
                setError("Erro ao cancelar.");
                setConfirming(false);
              }
            });
          }}
          className="text-xs font-semibold text-white bg-red-500 hover:bg-red-600 disabled:opacity-40 px-2 py-0.5 rounded transition-colors"
        >
          {pending ? "Cancelando…" : "Sim, cancelar"}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => setConfirming(false)}
          className="text-xs text-zinc-400 hover:text-zinc-600 transition-colors"
        >
          Não
        </button>
        {error && <span className="text-[10px] text-red-500 w-full">{error}</span>}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="text-xs text-red-400 hover:text-red-600 transition-colors"
    >
      Cancelar
    </button>
  );
}
