"use client";

import { useState } from "react";

function maskCpf(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return d.replace(/^(\d{3})(\d{0,3})/, "$1.$2");
  if (d.length <= 9) return d.replace(/^(\d{3})(\d{3})(\d{0,3})/, "$1.$2.$3");
  return d.replace(/^(\d{3})(\d{3})(\d{3})(\d{0,2})/, "$1.$2.$3-$4");
}

function maskPhone(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d.replace(/^(\d{0,2})/, "($1");
  if (d.length <= 7) return d.replace(/^(\d{2})(\d{0,5})/, "($1) $2");
  return d.replace(/^(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
}

export default function CheckoutButton({
  productId,
  userCpf,
  userPhone,
}: {
  productId: string;
  userCpf?: string | null;
  userPhone?: string | null;
}) {
  const [loading, setLoading] = useState<"stripe" | "mp" | null>(null);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [fieldError, setFieldError] = useState("");
  const [cpfSaved, setCpfSaved] = useState(false);
  // Qual gateway disparou o modal — pra continuar no fluxo certo após salvar.
  const [pendingProvider, setPendingProvider] = useState<"stripe" | "mp">("mp");

  // Celular só é exigido pelo Mercado Pago; a Stripe precisa apenas do CPF (p/ a nota fiscal).
  const needsPhone = !userPhone && pendingProvider === "mp";

  function closeModal() {
    setShowModal(false);
    setCpf("");
    setPhone("");
    setFieldError("");
  }

  async function saveAndContinue() {
    const cpfDigits = cpf.replace(/\D/g, "");
    const phoneDigits = phone.replace(/\D/g, "");

    if (cpfDigits.length !== 11) {
      setFieldError("Digite um CPF válido com 11 dígitos.");
      return;
    }
    if (needsPhone && phoneDigits.length < 10) {
      setFieldError("Digite um celular válido.");
      return;
    }

    setSaving(true);
    setFieldError("");

    const res = await fetch("/api/user/cpf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cpf: cpfDigits, ...(needsPhone ? { phone: phoneDigits } : {}) }),
    });

    setSaving(false);

    if (!res.ok) {
      setFieldError("Erro ao salvar dados. Tente novamente.");
      return;
    }

    setCpfSaved(true);
    closeModal();
    await pay(pendingProvider, true);
  }

  async function pay(provider: "stripe" | "mp", hasCpf = false) {
    // CPF é necessário para emitir a nota fiscal — exigido nos dois gateways.
    if (!userCpf && !hasCpf && !cpfSaved) {
      setPendingProvider(provider);
      setShowModal(true);
      return;
    }

    setLoading(provider);
    setError("");

    try {
      const endpoint = provider === "stripe" ? "/api/checkout/stripe" : "/api/checkout/mercadopago";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data?.code === "CPF_REQUIRED") {
          setPendingProvider(provider);
          setShowModal(true);
          return;
        }
        throw new Error(data.error ?? "Erro ao iniciar pagamento");
      }

      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro inesperado");
    } finally {
      setLoading(null);
    }
  }

  return (
    <>
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-4"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-xl space-y-4">
            <div>
              <h2 className="text-base font-bold text-zinc-900 mb-1">Dados para pagamento</h2>
              <p className="text-xs text-zinc-500">
                {pendingProvider === "mp"
                  ? `O Mercado Pago exige CPF${needsPhone ? " e celular" : ""} para processar pagamentos com cartão no Brasil.`
                  : "Precisamos do seu CPF para emitir a nota fiscal do pagamento."}
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">CPF</label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="000.000.000-00"
                  value={cpf}
                  onChange={(e) => setCpf(maskCpf(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#009ee3]"
                />
              </div>

              {needsPhone && (
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Celular</label>
                  <input
                    type="tel"
                    placeholder="(99) 99999-9999"
                    value={phone}
                    onChange={(e) => setPhone(maskPhone(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#009ee3]"
                  />
                </div>
              )}

              {fieldError && <p className="text-red-500 text-xs">{fieldError}</p>}
            </div>

            <button
              onClick={saveAndContinue}
              disabled={saving}
              className="w-full bg-[#009ee3] hover:bg-[#0088cc] disabled:opacity-50 text-white py-3 rounded-xl font-semibold transition-colors text-sm"
            >
              {saving ? "Salvando…" : "Salvar e continuar"}
            </button>
            <button
              onClick={closeModal}
              className="w-full text-zinc-400 hover:text-zinc-600 text-xs py-1 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <button
          onClick={() => pay("stripe")}
          disabled={!!loading}
          className="w-full bg-[#635bff] hover:bg-[#4f46e5] disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
        >
          {loading === "stripe" ? (
            <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
              <line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
          )}
          {loading === "stripe" ? "Redirecionando…" : "Cartão de crédito"}
        </button>
        {error && <p className="text-red-500 text-xs text-center">{error}</p>}
      </div>
    </>
  );
}
