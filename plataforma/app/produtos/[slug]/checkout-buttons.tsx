"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CheckoutButtons({
  productId,
  isLoggedIn,
}: {
  productId: string;
  isLoggedIn: boolean;
  userCpf?: string | null;
  userPhone?: string | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function checkout() {
    if (!isLoggedIn) {
      router.push(`/login?next=/produtos/${productId}`);
      return;
    }

    setLoading(true);
    setError("");

    const res = await fetch("/api/checkout/stripe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    });

    setLoading(false);

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
        onClick={checkout}
        disabled={loading}
        className="w-full bg-[#635bff] hover:bg-[#4f46e5] disabled:opacity-50 text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
          </svg>
        )}
        {loading ? "Aguarde..." : "Cartão de crédito"}
      </button>

      {error && <p className="text-red-500 text-sm text-center">{error}</p>}
    </div>
  );
}
