"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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

function Modal({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-xl space-y-4">
        {children}
      </div>
    </div>
  );
}

export default function CheckoutButtons({
  productId,
  isLoggedIn,
  userCpf,
  userPhone,
}: {
  productId: string;
  isLoggedIn: boolean;
  userCpf?: string | null;
  userPhone?: string | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<"stripe" | "mp" | null>(null);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [fieldError, setFieldError] = useState("");
  const [cpfSaved, setCpfSaved] = useState(false);

  const needsPhone = !userPhone;

  async function saveAndCheckout() {
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
    setShowModal(false);
    await checkout("mp", cpfDigits);
  }

  async function checkout(provider: "stripe" | "mp", cpfOverride?: string) {
    if (!isLoggedIn) {
      router.push(`/login?next=/produtos/${productId}`);
      return;
    }

    if (provider === "mp" && !userCpf && !cpfOverride && !cpfSaved) {
      setShowModal(true);
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
        setShowModal(true);
        return;
      }
      setError("Erro ao iniciar pagamento. Tente novamente.");
      return;
    }

    const { url } = await res.json();
    if (url) window.location.href = url;
  }

  return (
    <>
      {showModal && (
        <Modal onClose={() => { setShowModal(false); setCpf(""); setPhone(""); setFieldError(""); }}>
          <div>
            <h2 className="text-base font-bold text-zinc-900 mb-1">Dados para pagamento</h2>
            <p className="text-xs text-zinc-500">
              O Mercado Pago exige CPF{needsPhone ? " e celular" : ""} para processar pagamentos com cartão no Brasil.
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
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
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
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
              </div>
            )}

            {fieldError && <p className="text-red-500 text-xs">{fieldError}</p>}
          </div>

          <button
            onClick={saveAndCheckout}
            disabled={saving}
            className="w-full bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white py-3 rounded-xl font-semibold transition-colors text-sm"
          >
            {saving ? "Salvando…" : "Salvar e continuar"}
          </button>
          <button
            onClick={() => { setShowModal(false); setCpf(""); setPhone(""); setFieldError(""); }}
            className="w-full text-zinc-400 hover:text-zinc-600 text-xs py-1 transition-colors"
          >
            Cancelar
          </button>
        </Modal>
      )}

      <div className="space-y-3">
        <button
          onClick={() => checkout("stripe")}
          disabled={!!loading}
          className="w-full bg-[#635bff] hover:bg-[#4f46e5] disabled:opacity-50 text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
        >
          {loading === "stripe" ? (
            <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
          )}
          {loading === "stripe" ? "Aguarde..." : "Cartão de crédito"}
        </button>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      </div>
    </>
  );
}
