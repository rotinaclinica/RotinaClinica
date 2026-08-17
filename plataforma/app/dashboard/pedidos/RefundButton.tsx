"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function RefundButton({ orderId, daysLeft }: { orderId: string; daysLeft: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleRefund() {
    if (
      !confirm(
        `Deseja solicitar o reembolso? Você tem ${daysLeft} dia(s) restantes no prazo de 7 dias. O acesso será removido imediatamente.`
      )
    )
      return;

    setLoading(true);
    setError("");

    const res = await fetch("/api/refund", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data?.error ?? "Erro ao processar reembolso.");
      return;
    }

    setDone(true);
    router.refresh();
  }

  if (done) {
    return <span className="text-xs text-emerald-600 font-semibold">Reembolso solicitado</span>;
  }

  return (
    <div className="space-y-1">
      <button
        onClick={handleRefund}
        disabled={loading}
        className="text-xs text-red-400 hover:text-red-600 disabled:opacity-40 transition-colors"
      >
        {loading ? "Processando…" : `Reembolso (${daysLeft}d)`}
      </button>
      {error && <p className="text-[10px] text-red-500">{error}</p>}
    </div>
  );
}
