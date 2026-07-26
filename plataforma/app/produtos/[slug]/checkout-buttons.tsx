"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CheckoutButtons({
  productId,
  isLoggedIn,
}: {
  productId: string;
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<"stripe" | "mp" | null>(null);
  const [error, setError] = useState("");

  async function checkout(provider: "stripe" | "mp") {
    if (!isLoggedIn) {
      router.push(`/login?next=/produtos/${productId}`);
      return;
    }

    setLoading(provider);
    setError("");

    const endpoint =
      provider === "stripe" ? "/api/checkout/stripe" : "/api/checkout/mercadopago";

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    });

    setLoading(null);

    if (!res.ok) {
      setError("Erro ao iniciar pagamento. Tente novamente.");
      return;
    }

    const { url } = await res.json();
    if (url) window.location.href = url;
  }

  return (
    <div className="space-y-3">
      <button
        onClick={() => checkout("stripe")}
        disabled={!!loading}
        className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white py-3 rounded-xl font-semibold transition-colors"
      >
        {loading === "stripe" ? "Aguarde..." : "💳 Cartão Internacional (Stripe)"}
      </button>
      <button
        onClick={() => checkout("mp")}
        disabled={!!loading}
        className="w-full bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white py-3 rounded-xl font-semibold transition-colors"
      >
        {loading === "mp" ? "Aguarde..." : "🇧🇷 PIX / Boleto / Cartão BR"}
      </button>
      {error && <p className="text-red-500 text-sm text-center">{error}</p>}
    </div>
  );
}
