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

function maskCard(v: string) {
  return v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
}

function maskExpiry(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 6);
  if (d.length <= 2) return d;
  return `${d.slice(0, 2)}/${d.slice(2)}`;
}

function formatCents(cents: number, currency: string) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency }).format(cents / 100);
}

const PIX_ICON = (
  <svg width="20" height="20" viewBox="0 0 512 512" fill="currentColor">
    <path d="M242.4 292.5C247.8 287.1 255.1 284.1 262.5 284.1C269.9 284.1 277.2 287.1 282.6 292.5L358.3 368.2C373.6 383.5 383.9 403.3 387.6 424.9C390.4 439.8 384.4 454.8 372 464.7C358.5 475.5 340.4 478.1 324.4 471.6L262.5 447.4L200.6 471.6C184.6 478.1 166.5 475.5 152.9 464.7C140.6 454.8 134.6 439.8 137.4 424.9C141 403.3 151.3 383.5 166.6 368.2L242.4 292.5zM267.2 322.5L191.5 398.2C181.7 408 175.2 420.5 173.2 433.9C172.7 437 174.3 440.1 177.1 441.7C180.3 444.3 184.5 444.9 188.2 443.5L255.6 418.2C259.8 416.6 264.5 416.6 268.7 418.2L336 443.5C339.7 444.9 343.9 444.3 347.2 441.7C349.9 440.1 351.6 437 351 433.9C349 420.5 342.5 408 332.7 398.2L257 322.5C261.1 318.4 267.2 318.4 267.2 322.5zM374.6 150.1C387 162.5 393.1 179.4 391.9 196.6C390.7 213.9 382.3 229.8 368.6 240.7L282.6 307.5C277.2 311.8 269.9 314.1 262.5 314.1C255.1 314.1 247.8 311.8 242.4 307.5L156.4 240.7C142.7 229.8 134.3 213.9 133.1 196.6C131.9 179.4 138 162.5 150.4 150.1L190.5 110C207.2 93.38 230.3 84 254.2 84H270.8C294.7 84 317.8 93.38 334.5 110L374.6 150.1z"/>
  </svg>
);

const CARD_ICON = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
  </svg>
);

export default function EbookCheckoutClient({
  productId,
  priceCents,
  currency,
  maxInstallments,
  userCpf,
  userPhone,
}: {
  productId: string;
  priceCents: number;
  currency: string;
  maxInstallments: number;
  userCpf?: string | null;
  userPhone?: string | null;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<"pix" | "card">("card");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // CPF modal
  const [showCpfModal, setShowCpfModal] = useState(false);
  const [cpf, setCpf] = useState("");
  const [saving, setSaving] = useState(false);
  const [fieldError, setFieldError] = useState("");
  const [cpfSaved, setCpfSaved] = useState(false);
  const [pendingMethod, setPendingMethod] = useState<"pix" | "card">("pix");

  // Card fields
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [installments, setInstallments] = useState(1);

  // Ambassador
  const [ambassadorCode, setAmbassadorCode] = useState("");
  const [showAmbassador, setShowAmbassador] = useState(false);

  function closeCpfModal() {
    setShowCpfModal(false);
    setCpf("");
    setFieldError("");
  }

  async function saveCpfAndContinue() {
    const cpfDigits = cpf.replace(/\D/g, "");
    if (cpfDigits.length !== 11) { setFieldError("Digite um CPF válido com 11 dígitos."); return; }
    setSaving(true);
    setFieldError("");
    const res = await fetch("/api/user/cpf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cpf: cpfDigits }),
    });
    setSaving(false);
    if (!res.ok) { setFieldError("Erro ao salvar dados. Tente novamente."); return; }
    setCpfSaved(true);
    closeCpfModal();
    await pay(pendingMethod, true);
  }

  async function pay(method: "pix" | "card", hasCpf = false) {
    const hasCpfNow = !!userCpf || hasCpf || cpfSaved;
    if (!hasCpfNow) {
      setPendingMethod(method);
      setShowCpfModal(true);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const code = ambassadorCode.trim().toUpperCase() || undefined;

      if (method === "pix") {
        const res = await fetch("/api/checkout/asaas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId, method: "pix", ambassadorCode: code }),
        });
        const data = await res.json();
        if (!res.ok) {
          if (data?.code === "CPF_REQUIRED") { setPendingMethod(method); setShowCpfModal(true); return; }
          throw new Error(data.error ?? "Erro ao gerar PIX");
        }
        router.push(`/pedido/${data.orderId}/pix`);
        return;
      }

      const [expMonth, expYear] = cardExpiry.split("/");
      const res = await fetch("/api/checkout/asaas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          method: "card",
          ambassadorCode: code,
          installments,
          card: {
            holderName: cardName.trim(),
            number: cardNumber.replace(/\s/g, ""),
            expiryMonth: expMonth?.trim().padStart(2, "0"),
            expiryYear: expYear?.trim().length === 2 ? `20${expYear.trim()}` : expYear?.trim(),
            ccv: cardCvv.trim(),
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data?.code === "CPF_REQUIRED") { setPendingMethod(method); setShowCpfModal(true); return; }
        throw new Error(data.error ?? "Pagamento recusado");
      }
      if (data.status === "confirmed") {
        router.push(`/pedido/${data.orderId}?status=sucesso`);
      } else {
        router.push(`/pedido/${data.orderId}`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro inesperado");
    } finally {
      setLoading(false);
    }
  }

  const installmentOptions = Array.from({ length: maxInstallments }, (_, i) => i + 1);

  return (
    <>
      {/* Modal CPF */}
      {showCpfModal && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-4"
          onClick={(e) => { if (e.target === e.currentTarget) closeCpfModal(); }}
        >
          <div className="w-full max-w-sm bg-white dark:bg-[#131c2e] rounded-2xl p-6 shadow-xl space-y-4">
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-white mb-1">CPF para nota fiscal</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Precisamos do seu CPF para emitir a nota fiscal do pagamento.
              </p>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#0f2d4a] dark:text-zinc-200 mb-1">CPF</label>
              <input
                type="text" inputMode="numeric" placeholder="000.000.000-00"
                value={cpf} onChange={(e) => setCpf(maskCpf(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-[#0d1525] text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#0f2d4a]/40"
              />
            </div>
            {fieldError && <p className="text-red-500 text-xs">{fieldError}</p>}
            <button onClick={saveCpfAndContinue} disabled={saving}
              className="w-full bg-[#0f2d4a] hover:bg-[#1a4a6e] disabled:opacity-50 text-white py-3 rounded-xl font-semibold transition-colors text-sm">
              {saving ? "Salvando…" : "Salvar e continuar"}
            </button>
            <button onClick={closeCpfModal} className="w-full text-zinc-400 hover:text-zinc-600 text-xs py-1 transition-colors">Cancelar</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {/* Método de pagamento */}
        <div className="flex items-center gap-3 mb-1">
          <div className="w-1 h-5 rounded-full bg-[#32bcad]" />
          <p className="text-sm font-bold text-[#0f2d4a] dark:text-white uppercase tracking-wider">Forma de pagamento</p>
        </div>

        {/* Card option */}
        <button
          onClick={() => setSelected("card")}
          className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-all text-left ${
            selected === "card" ? "border-[#0f2d4a] bg-[#f0f5f9] dark:bg-[#0f2d4a]/30 dark:border-[#3db8d4]" : "border-zinc-300 dark:border-zinc-600 bg-white dark:bg-[#0d1525] hover:border-[#0f2d4a]/40"
          }`}
        >
          <span className={selected === "card" ? "text-[#0f2d4a] dark:text-[#3db8d4]" : "text-zinc-500"}>{CARD_ICON}</span>
          <span className="min-w-0">
            <span className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-white">
              Cartão de crédito
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#0f2d4a] text-white dark:bg-[#3db8d4] dark:text-[#0f2d4a]">Recomendado</span>
            </span>
            {maxInstallments > 1 && <span className="block text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">Até {maxInstallments}x sem juros</span>}
          </span>
          <span className={`ml-auto w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
            selected === "card" ? "border-[#0f2d4a] dark:border-[#3db8d4]" : "border-zinc-400"
          }`}>
            {selected === "card" && <span className="w-2 h-2 rounded-full bg-[#0f2d4a] dark:bg-[#3db8d4]" />}
          </span>
        </button>

        {/* PIX option */}
        <button
          onClick={() => setSelected("pix")}
          className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-all text-left ${
            selected === "pix" ? "border-[#32bcad] bg-[#f0fdfb] dark:bg-[#32bcad]/10 dark:border-[#32bcad]" : "border-zinc-300 dark:border-zinc-600 bg-white dark:bg-[#0d1525] hover:border-[#32bcad]/40"
          }`}
        >
          <span className={selected === "pix" ? "text-[#32bcad]" : "text-zinc-500"}>{PIX_ICON}</span>
          <span className="text-sm font-semibold text-zinc-900 dark:text-white">PIX</span>
          <span className={`ml-auto w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
            selected === "pix" ? "border-[#32bcad]" : "border-zinc-400"
          }`}>
            {selected === "pix" && <span className="w-2 h-2 rounded-full bg-[#32bcad]" />}
          </span>
        </button>

        {/* Card form */}
        {selected === "card" && (
          <div className="space-y-3 pt-1">
            <div>
              <label className="block text-xs font-bold text-[#0f2d4a] dark:text-zinc-200 mb-1">Número do cartão</label>
              <input
                type="text" inputMode="numeric" placeholder="0000 0000 0000 0000"
                value={cardNumber} onChange={(e) => setCardNumber(maskCard(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-400 dark:border-zinc-600 bg-white dark:bg-[#0d1525] text-sm font-mono tracking-widest text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#0f2d4a] focus:ring-1 focus:ring-[#0f2d4a]/30 placeholder:text-zinc-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#0f2d4a] dark:text-zinc-200 mb-1">Nome no cartão</label>
              <input
                type="text" placeholder="Como aparece no cartão"
                value={cardName} onChange={(e) => setCardName(e.target.value.toUpperCase())}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-400 dark:border-zinc-600 bg-white dark:bg-[#0d1525] text-sm uppercase text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#0f2d4a] focus:ring-1 focus:ring-[#0f2d4a]/30 placeholder:text-zinc-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#0f2d4a] dark:text-zinc-200 mb-1">Validade</label>
                <input
                  type="text" inputMode="numeric" placeholder="MM/AAAA"
                  value={cardExpiry} onChange={(e) => setCardExpiry(maskExpiry(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-400 dark:border-zinc-600 bg-white dark:bg-[#0d1525] text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#0f2d4a] focus:ring-1 focus:ring-[#0f2d4a]/30 placeholder:text-zinc-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#0f2d4a] dark:text-zinc-200 mb-1">CVV</label>
                <input
                  type="text" inputMode="numeric" placeholder="123"
                  value={cardCvv} onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-400 dark:border-zinc-600 bg-white dark:bg-[#0d1525] text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#0f2d4a] focus:ring-1 focus:ring-[#0f2d4a]/30 placeholder:text-zinc-500"
                />
              </div>
            </div>
            {maxInstallments > 1 && (
              <div>
                <label className="block text-xs font-bold text-[#0f2d4a] dark:text-zinc-200 mb-1">Parcelas</label>
                <select
                  value={installments}
                  onChange={(e) => setInstallments(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-400 dark:border-zinc-600 bg-white dark:bg-[#0d1525] text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#0f2d4a] focus:ring-1 focus:ring-[#0f2d4a]/30 [&>option]:bg-white [&>option]:dark:bg-[#0d1525] [&>option]:text-zinc-900 [&>option]:dark:text-zinc-100"
                >
                  {installmentOptions.map((n) => (
                    <option key={n} value={n}>
                      {n}x de {formatCents(Math.ceil(priceCents / n), currency)} sem juros
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {error && <p className="text-red-500 text-xs text-center">{error}</p>}

        {/* Ambassador code */}
        <div>
          <button
            type="button"
            onClick={() => setShowAmbassador((v) => !v)}
            className="text-xs text-zinc-600 dark:text-zinc-400 font-medium hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors underline underline-offset-2"
          >
            {showAmbassador ? "▲ Ocultar código" : "Tenho um código de embaixador"}
          </button>
          {showAmbassador && (
            <input
              type="text"
              placeholder="Ex: ALUNO10"
              value={ambassadorCode}
              onChange={(e) => setAmbassadorCode(e.target.value.toUpperCase())}
              className="mt-2 w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-600 bg-white dark:bg-[#0d1525] text-sm text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-500 uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-[#0f2d4a]/30"
              maxLength={20}
            />
          )}
        </div>

        {/* Pay button */}
        <button
          onClick={() => pay(selected)}
          disabled={loading}
          className={`w-full ${
            selected === "pix"
              ? "bg-[#32bcad] hover:bg-[#28a89a]"
              : "bg-[#0f2d4a] hover:bg-[#1a4a6e]"
          } disabled:opacity-60 text-white font-extrabold py-5 rounded-xl transition-all text-base shadow-lg tracking-wide`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              {selected === "card" ? "Processando…" : "Aguarde…"}
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
              {`Pagar ${formatCents(priceCents, currency)} com ${selected === "pix" ? "PIX" : "cartão"}`}
            </span>
          )}
        </button>

        {/* Guarantee */}
        <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700/40 rounded-xl px-4 py-3">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
          <div>
            <p className="text-xs font-bold text-emerald-800 dark:text-emerald-400">Garantia de 7 dias</p>
            <p className="text-xs text-emerald-700 dark:text-emerald-500">Se não gostar, devolvemos 100% do valor. Sem perguntas.</p>
          </div>
        </div>
      </div>
    </>
  );
}
