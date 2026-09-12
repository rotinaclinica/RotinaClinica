"use client";

import { useTransition } from "react";
import { processarNotasAgora, reprocessarNota, reenviarEmailNota } from "./actions";

export function ProcessAllButton() {
  const [pending, start] = useTransition();
  return (
    <button
      onClick={() => start(() => processarNotasAgora())}
      disabled={pending}
      className="px-4 py-2 rounded-lg text-sm font-semibold bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50 transition-colors"
    >
      {pending ? "Processando…" : "Processar agora"}
    </button>
  );
}

export function RetryButton({ invoiceId }: { invoiceId: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      onClick={() => start(() => reprocessarNota(invoiceId))}
      disabled={pending}
      className="px-2.5 py-1 rounded-md text-xs font-semibold border border-white/10 text-zinc-400 hover:border-violet-400 hover:text-violet-400 disabled:opacity-50 transition-colors"
    >
      {pending ? "…" : "Reprocessar"}
    </button>
  );
}

export function ResendEmailButton({ invoiceId }: { invoiceId: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      onClick={() => start(() => reenviarEmailNota(invoiceId))}
      disabled={pending}
      className="px-2.5 py-1 rounded-md text-xs font-semibold border border-white/10 text-zinc-400 hover:border-emerald-400 hover:text-emerald-400 disabled:opacity-50 transition-colors"
    >
      {pending ? "…" : "Reenviar email"}
    </button>
  );
}
