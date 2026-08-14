"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PixButton({ productId }: { productId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handlePix() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/checkout/pix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao gerar PIX");
      router.push(`/pedido/${data.orderId}/pix`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro inesperado");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handlePix}
        disabled={loading}
        className="w-full bg-[#32bcad] hover:bg-[#28a89a] disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
      >
        {loading ? (
          <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
        ) : (
          <svg width="20" height="20" viewBox="0 0 512 512" fill="currentColor">
            <path d="M242.4 292.5C247.8 287.1 255.1 284.1 262.5 284.1C269.9 284.1 277.2 287.1 282.6 292.5L358.3 368.2C373.6 383.5 383.9 403.3 387.6 424.9C390.4 439.8 384.4 454.8 372 464.7C358.5 475.5 340.4 478.1 324.4 471.6L262.5 447.4L200.6 471.6C184.6 478.1 166.5 475.5 152.9 464.7C140.6 454.8 134.6 439.8 137.4 424.9C141 403.3 151.3 383.5 166.6 368.2L242.4 292.5zM267.2 322.5L191.5 398.2C181.7 408 175.2 420.5 173.2 433.9C172.7 437 174.3 440.1 177.1 441.7C180.3 444.3 184.5 444.9 188.2 443.5L255.6 418.2C259.8 416.6 264.5 416.6 268.7 418.2L336 443.5C339.7 444.9 343.9 444.3 347.2 441.7C349.9 440.1 351.6 437 351 433.9C349 420.5 342.5 408 332.7 398.2L257 322.5C261.1 318.4 267.2 318.4 267.2 322.5zM374.6 150.1C387 162.5 393.1 179.4 391.9 196.6C390.7 213.9 382.3 229.8 368.6 240.7L282.6 307.5C277.2 311.8 269.9 314.1 262.5 314.1C255.1 314.1 247.8 311.8 242.4 307.5L156.4 240.7C142.7 229.8 134.3 213.9 133.1 196.6C131.9 179.4 138 162.5 150.4 150.1L190.5 110C207.2 93.38 230.3 84 254.2 84H270.8C294.7 84 317.8 93.38 334.5 110L374.6 150.1z"/>
          </svg>
        )}
        {loading ? "Gerando PIX…" : "Pagar com PIX"}
      </button>
      {error && <p className="text-red-500 text-xs text-center">{error}</p>}
    </div>
  );
}
