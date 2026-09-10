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

function maskCard(v: string) {
  return v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
}

function maskExpiry(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 6);
  if (d.length <= 2) return d;
  return `${d.slice(0, 2)}/${d.slice(2)}`;
}

type Method = "pix" | "card" | "mp";

function trackFb(event: string, data?: Record<string, unknown>) {
  if (typeof window !== "undefined") {
    const w = window as unknown as { fbq?: (...args: unknown[]) => void };
    w.fbq?.("track", event, data);
  }
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

const MP_ICON = (
  <svg width="20" height="20" viewBox="0 0 48 48" fill="currentColor">
    <path d="M24 4C12.95 4 4 12.95 4 24s8.95 20 20 20 20-8.95 20-20S35.05 4 24 4zm0 36c-8.82 0-16-7.18-16-16S15.18 8 24 8s16 7.18 16 16-7.18 16-16 16zm-2-22h-3v12h3V18zm7 0h-3v12h3V18z"/>
  </svg>
);

const PRIMARY_METHODS: { id: "pix" | "card"; label: string; sub: string; badge?: string; icon: React.ReactNode }[] = [
  { id: "pix", label: "PIX", sub: "Aprovação imediata · Sem taxas extras", badge: "Recomendado", icon: PIX_ICON },
  { id: "card", label: "Cartão de crédito", sub: "Parcelamento em até 12x · Débito imediato", icon: CARD_ICON },
];

const ACCENT: Record<"pix" | "card", string> = {
  pix:  "border-[#32bcad] bg-[#f0fdfb]",
  card: "border-[#0f2d4a] bg-[#f0f5f9]",
};

const BTN_COLOR: Record<"pix" | "card", string> = {
  pix:  "bg-[#32bcad] hover:bg-[#28a89a]",
  card: "bg-[#0f2d4a] hover:bg-[#1a4a6e]",
};

export default function CheckoutButton({
  productId,
  userCpf,
  userPhone,
}: {
  productId: string;
  userCpf?: string | null;
  userPhone?: string | null;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<"pix" | "card">("pix");
  const [loading, setLoading] = useState(false);
  const [mpLoading, setMpLoading] = useState(false);
  const [error, setError] = useState("");
  const [ambassadorCode, setAmbassadorCode] = useState("");
  const [showAmbassador, setShowAmbassador] = useState(false);

  // CPF modal (para quem não tem)
  const [showCpfModal, setShowCpfModal] = useState(false);
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [fieldError, setFieldError] = useState("");
  const [cpfSaved, setCpfSaved] = useState(false);
  const [pendingMethod, setPendingMethod] = useState<Method>("pix");


  // Cartão inline
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [installments, setInstallments] = useState(1);

  const needsPhone = !userPhone && pendingMethod === "mp";

  function closeCpfModal() {
    setShowCpfModal(false);
    setCpf("");
    setPhone("");
    setFieldError("");
  }

  async function saveCpfAndContinue() {
    const cpfDigits = cpf.replace(/\D/g, "");
    const phoneDigits = phone.replace(/\D/g, "");
    if (cpfDigits.length !== 11) { setFieldError("Digite um CPF válido com 11 dígitos."); return; }
    if (needsPhone && phoneDigits.length < 10) { setFieldError("Digite um celular válido."); return; }
    setSaving(true);
    setFieldError("");
    const res = await fetch("/api/user/cpf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cpf: cpfDigits, ...(needsPhone ? { phone: phoneDigits } : {}) }),
    });
    setSaving(false);
    if (!res.ok) { setFieldError("Erro ao salvar dados. Tente novamente."); return; }
    setCpfSaved(true);
    closeCpfModal();
    if (pendingMethod === "mp") {
      await payMp();
    } else {
      await pay(pendingMethod as "pix" | "card", true);
    }
  }

  async function pay(method: "pix" | "card", hasCpf = false) {
    const hasCpfNow = !!userCpf || hasCpf || cpfSaved;

    if (!hasCpfNow) {
      setPendingMethod(method);
      setShowCpfModal(true);
      return;
    }

    trackFb("InitiateCheckout", { content_type: "product", content_ids: [productId] });

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

      if (method === "card") {
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
        return;
      }

    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro inesperado");
    } finally {
      setLoading(false);
    }
  }

  async function payMp() {
    const hasCpfNow = !!userCpf || cpfSaved;
    if (!hasCpfNow) {
      setPendingMethod("mp");
      setShowCpfModal(true);
      return;
    }
    trackFb("InitiateCheckout", { content_type: "product", content_ids: [productId] });
    setMpLoading(true);
    setError("");
    try {
      const code = ambassadorCode.trim().toUpperCase() || undefined;
      const res = await fetch("/api/checkout/mercadopago", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, ambassadorCode: code }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data?.code === "CPF_REQUIRED") { setPendingMethod("mp"); setShowCpfModal(true); return; }
        throw new Error(data.error ?? "Erro ao iniciar pagamento");
      }
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro inesperado");
    } finally {
      setMpLoading(false);
    }
  }

  return (
    <>
      {/* Modal CPF */}
      {showCpfModal && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-4"
          onClick={(e) => { if (e.target === e.currentTarget) closeCpfModal(); }}
        >
          <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-xl space-y-4">
            <div>
              <h2 className="text-base font-bold text-zinc-900 mb-1">Dados para pagamento</h2>
              <p className="text-xs text-zinc-500">
                {pendingMethod === "mp"
                  ? `O Mercado Pago exige CPF${needsPhone ? " e celular" : ""} para processar pagamentos.`
                  : "Precisamos do seu CPF para emitir a nota fiscal do pagamento."}
              </p>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">CPF</label>
                <input
                  type="text" inputMode="numeric" placeholder="000.000.000-00"
                  value={cpf} onChange={(e) => setCpf(maskCpf(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2d4a]/40"
                />
              </div>
              {needsPhone && (
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Celular</label>
                  <input
                    type="tel" placeholder="(99) 99999-9999"
                    value={phone} onChange={(e) => setPhone(maskPhone(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2d4a]/40"
                  />
                </div>
              )}
              {fieldError && <p className="text-red-500 text-xs">{fieldError}</p>}
            </div>
            <button onClick={saveCpfAndContinue} disabled={saving}
              className="w-full bg-[#0f2d4a] hover:bg-[#1a4a6e] disabled:opacity-50 text-white py-3 rounded-xl font-semibold transition-colors text-sm">
              {saving ? "Salvando…" : "Salvar e continuar"}
            </button>
            <button onClick={closeCpfModal} className="w-full text-zinc-400 hover:text-zinc-600 text-xs py-1 transition-colors">Cancelar</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <p className="text-xs font-bold text-zinc-700 uppercase tracking-wider">Forma de pagamento</p>

        {PRIMARY_METHODS.map((m) => (
          <button
            key={m.id}
            onClick={() => setSelected(m.id)}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-all text-left ${
              selected === m.id ? ACCENT[m.id] : "border-zinc-200 bg-white hover:border-zinc-300"
            }`}
          >
            <span className={`flex-shrink-0 ${
              selected === m.id
                ? m.id === "pix" ? "text-[#32bcad]" : "text-[#0f2d4a]"
                : "text-zinc-400"
            }`}>
              {m.icon}
            </span>
            <span className="min-w-0">
              <span className="flex items-center gap-2 text-sm font-semibold text-zinc-800">
                {m.label}
                {m.badge && (
                  <span className="text-[10px] font-semibold bg-[#dcfdf7] text-[#0f7b6c] px-2 py-0.5 rounded-full">
                    {m.badge}
                  </span>
                )}
              </span>
              <span className="block text-xs text-zinc-500 mt-0.5">{m.sub}</span>
            </span>
            <span className={`ml-auto w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
              selected === m.id
                ? m.id === "pix" ? "border-[#32bcad]" : "border-[#0f2d4a]"
                : "border-zinc-300"
            }`}>
              {selected === m.id && (
                <span className={`w-2 h-2 rounded-full ${m.id === "pix" ? "bg-[#32bcad]" : "bg-[#0f2d4a]"}`} />
              )}
            </span>
          </button>
        ))}

        {/* Mercado Pago — alternativa */}
        <div className="flex items-center gap-2 py-0.5">
          <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-700" />
          <span className="text-xs text-zinc-400">ou pague via</span>
          <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-700" />
        </div>
        <button
          onClick={payMp}
          disabled={mpLoading}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-zinc-200 bg-white hover:border-zinc-300 transition-all text-left disabled:opacity-60"
        >
          <span className="flex-shrink-0 text-[#009ee3]">{MP_ICON}</span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-zinc-800">Mercado Pago</span>
            <span className="block text-xs text-zinc-400 mt-0.5">Redireciona para o app do Mercado Pago</span>
          </span>
          {mpLoading ? (
            <span className="ml-auto w-4 h-4 border-2 border-zinc-300 border-t-[#009ee3] rounded-full animate-spin" />
          ) : (
            <svg className="ml-auto text-zinc-400 flex-shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          )}
        </button>

        {/* Formulário de cartão (inline, aparece quando selecionado) */}
        {selected === "card" && (
          <div className="space-y-3 pt-1">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Número do cartão</label>
              <input
                type="text" inputMode="numeric" placeholder="0000 0000 0000 0000"
                value={cardNumber} onChange={(e) => setCardNumber(maskCard(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-[#0f2d4a]/40"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Nome no cartão</label>
              <input
                type="text" placeholder="Como aparece no cartão"
                value={cardName} onChange={(e) => setCardName(e.target.value.toUpperCase())}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-[#0f2d4a]/40"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Validade</label>
                <input
                  type="text" inputMode="numeric" placeholder="MM/AAAA"
                  value={cardExpiry} onChange={(e) => setCardExpiry(maskExpiry(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2d4a]/40"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">CVV</label>
                <input
                  type="text" inputMode="numeric" placeholder="123"
                  value={cardCvv} onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2d4a]/40"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Parcelas</label>
              <select
                value={installments}
                onChange={(e) => setInstallments(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2d4a]/40 bg-white"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
                  <option key={n} value={n}>{n}x sem juros</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {error && <p className="text-red-500 text-xs text-center">{error}</p>}

        {/* Código de embaixador */}
        <div>
          <button
            type="button"
            onClick={() => setShowAmbassador((v) => !v)}
            className="text-xs text-zinc-800 font-medium hover:text-zinc-600 transition-colors underline underline-offset-2"
          >
            {showAmbassador ? "▲ Ocultar código" : "Tenho um código de embaixador"}
          </button>
          {showAmbassador && (
            <input
              type="text"
              placeholder="Ex: ALUNO10"
              value={ambassadorCode}
              onChange={(e) => setAmbassadorCode(e.target.value.toUpperCase())}
              className="mt-2 w-full px-3 py-2 rounded-lg border border-zinc-200 text-sm text-zinc-800 placeholder:text-zinc-400 uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-[#0f2d4a]/30"
              maxLength={20}
            />
          )}
        </div>

        <button
          onClick={() => pay(selected)}
          disabled={loading}
          className={`w-full ${BTN_COLOR[selected]} disabled:opacity-60 text-white font-bold py-4 rounded-xl transition-all text-sm mt-1`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              {selected === "card" ? "Processando…" : "Aguarde…"}
            </span>
          ) : (
            `Pagar com ${selected === "pix" ? "PIX" : "cartão de crédito"}`
          )}
        </button>
      </div>
    </>
  );
}
