"use client";

import { useState } from "react";

export default function CheckoutButton({ productId }: { productId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handlePay() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/checkout/mercadopago", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao iniciar pagamento");
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro inesperado");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handlePay}
        disabled={loading}
        className="w-full bg-[#009ee3] hover:bg-[#0088cc] disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
      >
        {loading ? (
          <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.517 2.004C6.32 2.004 2 5.92 2 10.756c0 3.254 1.888 6.115 4.76 7.76-.127.46-.813 2.958-.845 3.157 0 0-.018.147.08.203.097.057.209.012.209.012.275-.037 3.185-2.067 3.626-2.36.524.072 1.062.11 1.609.11 5.196 0 9.515-3.917 9.515-8.753 0-4.835-4.319-8.881-9.437-8.881z"/>
          </svg>
        )}
        {loading ? "Redirecionando…" : "Pagar com Mercado Pago"}
      </button>
      {error && <p className="text-red-500 text-xs text-center">{error}</p>}
    </div>
  );
}
