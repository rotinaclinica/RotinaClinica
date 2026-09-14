"use client";

import { useState } from "react";
import { toggleCoupon, deleteCoupon } from "./actions";

export function ToggleButton({ couponId, active }: { couponId: string; active: boolean }) {
  const [loading, setLoading] = useState(false);

  async function handle() {
    setLoading(true);
    await toggleCoupon(couponId);
    setLoading(false);
  }

  return (
    <button
      onClick={handle}
      disabled={loading}
      className={`text-[11px] font-bold px-2.5 py-1 rounded transition-colors disabled:opacity-50 ${
        active
          ? "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
          : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
      }`}
    >
      {loading ? "…" : active ? "Desativar" : "Ativar"}
    </button>
  );
}

export function DeleteButton({ couponId }: { couponId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handle() {
    if (!confirm("Tem certeza que deseja excluir este cupom?")) return;
    setLoading(true);
    setError("");
    const result = await deleteCoupon(couponId);
    setLoading(false);
    if (result?.error) setError(result.error);
  }

  return (
    <span className="inline-flex items-center gap-1">
      <button
        onClick={handle}
        disabled={loading}
        className="text-[11px] font-bold px-2.5 py-1 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
      >
        {loading ? "…" : "Excluir"}
      </button>
      {error && <span className="text-[10px] text-red-400">{error}</span>}
    </span>
  );
}
