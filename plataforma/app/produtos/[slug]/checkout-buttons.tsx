"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function formatCpf(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  return d
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

export default function CheckoutButtons({
  productId,
  isLoggedIn,
  userCpf,
}: {
  productId: string;
  isLoggedIn: boolean;
  userCpf?: string | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<"stripe" | "mp" | null>(null);
  const [error, setError] = useState("");

  // CPF flow
  const [showCpf, setShowCpf] = useState(false);
  const [cpf, setCpf] = useState("");
  const [cpfSaving, setCpfSaving] = useState(false);
  const [cpfError, setCpfError] = useState("");

  async function saveCpfAndCheckout() {
    const digits = cpf.replace(/\D/g, "");
    if (digits.length !== 11) {
      setCpfError("Digite um CPF válido com 11 dígitos.");
      return;
    }
    setCpfSaving(true);
    setCpfError("");
    const res = await fetch("/api/user/cpf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cpf: digits }),
    });
    setCpfSaving(false);
    if (!res.ok) {
      setCpfError("Erro ao salvar CPF. Tente novamente.");
      return;
    }
    setShowCpf(false);
    await checkout("mp", digits);
  }

  async function checkout(provider: "stripe" | "mp", cpfOverride?: string) {
    if (!isLoggedIn) {
      router.push(`/login?next=/produtos/${productId}`);
      return;
    }

    // MP sem CPF: exibir formulário
    if (provider === "mp" && !userCpf && !cpfOverride) {
      setShowCpf(true);
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
      const data = await res.json().catch(() => ({}));
      if (data?.code === "CPF_REQUIRED") {
        setShowCpf(true);
        return;
      }
      setError("Erro ao iniciar pagamento. Tente novamente.");
      return;
    }

    const { url } = await res.json();
    if (url) window.location.href = url;
  }

  if (showCpf) {
    return (
      <div className="space-y-3">
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <p className="text-sm font-semibold text-amber-800 mb-0.5">CPF obrigatório para cartão</p>
          <p className="text-xs text-amber-700">
            O Mercado Pago exige o CPF do titular para processar pagamentos com cartão de crédito no Brasil.
            Seu CPF será salvo no seu cadastro.
          </p>
        </div>
        <input
          type="text"
          inputMode="numeric"
          placeholder="000.000.000-00"
          value={cpf}
          onChange={(e) => setCpf(formatCpf(e.target.value))}
          className="w-full px-4 py-3 rounded-xl border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
        />
        {cpfError && <p className="text-red-500 text-xs">{cpfError}</p>}
        <button
          onClick={saveCpfAndCheckout}
          disabled={cpfSaving}
          className="w-full bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white py-3 rounded-xl font-semibold transition-colors text-sm"
        >
          {cpfSaving ? "Salvando…" : "Salvar CPF e continuar"}
        </button>
        <button
          onClick={() => { setShowCpf(false); setCpf(""); setCpfError(""); }}
          className="w-full text-zinc-400 hover:text-zinc-600 text-xs py-1 transition-colors"
        >
          Cancelar
        </button>
      </div>
    );
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
