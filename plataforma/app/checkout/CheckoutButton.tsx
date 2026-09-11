"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const TESTIMONIALS = [
  { name: "Joana", text: "Melhor aquisição possível! Está sendo meu amigo fiel em todos os plantões. Não deixa ninguém passar sufoco." },
  { name: "Anna", text: "Indico para todos os médicos recém formados que querem manejar seus pacientes com mais rapidez e com prescrições baseadas em evidências. Vai ser o seu melhor amigo de plantão." },
  { name: "Leticia", text: "Indispensável para os plantões. Atualizado, claro e objetivo. Muito prático e com ótimas referências. Realmente facilita e otimiza os atendimentos." },
  { name: "Mateus", text: "Produto excelente. O conteúdo é confiável, baseado em evidências, completo e reúne todos os principais tópicos da prática do generalista. Recomendo bastante!" },
  { name: "Ruth", text: "Pensado exatamente para o que é mais necessário na prática clínica — seja no pronto-socorro, na enfermaria ou nos ambulatórios. As referências são de fontes sérias e atualizadas." },
  { name: "Felipe", text: "Muito completo! Tem tudo que a gente precisa. O material descomplica esse assunto. Muito bom mesmo!" },
];

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
  { id: "card", label: "Cartão de crédito", sub: "Até 12x sem juros · Acesso sempre garantido", badge: "Recomendado", icon: CARD_ICON },
  { id: "pix", label: "PIX", sub: "", icon: PIX_ICON },
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
  const [selected, setSelected] = useState<"pix" | "card">("card");
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


  const [testimonialIdx, setTestimonialIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTestimonialIdx((i) => (i + 1) % TESTIMONIALS.length), 15000);
    return () => clearInterval(t);
  }, []);

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
        <p className="text-xs font-bold text-[#0f2d4a] uppercase tracking-wider">Forma de pagamento</p>

        {PRIMARY_METHODS.map((m) => (
          <button
            key={m.id}
            onClick={() => setSelected(m.id)}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-all text-left ${
              selected === m.id ? ACCENT[m.id] : "border-zinc-300 bg-white hover:border-[#0f2d4a]/40"
            }`}
          >
            <span className={`flex-shrink-0 ${
              selected === m.id
                ? m.id === "pix" ? "text-[#32bcad]" : "text-[#0f2d4a]"
                : "text-zinc-500"
            }`}>
              {m.icon}
            </span>
            <span className="min-w-0">
              <span className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
                {m.label}
                {m.badge && (
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    m.id === "card"
                      ? "bg-[#0f2d4a] text-white"
                      : "bg-[#32bcad] text-white"
                  }`}>
                    {m.badge}
                  </span>
                )}
              </span>
              {m.sub && <span className="block text-xs text-zinc-600 mt-0.5">{m.sub}</span>}
            </span>
            <span className={`ml-auto w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
              selected === m.id
                ? m.id === "pix" ? "border-[#32bcad]" : "border-[#0f2d4a]"
                : "border-zinc-400"
            }`}>
              {selected === m.id && (
                <span className={`w-2 h-2 rounded-full ${m.id === "pix" ? "bg-[#32bcad]" : "bg-[#0f2d4a]"}`} />
              )}
            </span>
          </button>
        ))}

        {/* Mercado Pago — alternativa */}
        <div className="flex items-center gap-2 py-0.5">
          <div className="flex-1 h-px bg-zinc-300" />
          <span className="text-xs text-zinc-500 font-medium">ou pague via</span>
          <div className="flex-1 h-px bg-zinc-300" />
        </div>
        <button
          onClick={payMp}
          disabled={mpLoading}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-zinc-300 bg-white hover:border-[#0f2d4a]/40 transition-all text-left disabled:opacity-60"
        >
          <span className="flex-shrink-0 text-[#009ee3]">{MP_ICON}</span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-zinc-900">Mercado Pago</span>
            <span className="block text-xs text-zinc-600 mt-0.5">Redireciona para o app do Mercado Pago</span>
          </span>
          {mpLoading ? (
            <span className="ml-auto w-4 h-4 border-2 border-zinc-300 border-t-[#009ee3] rounded-full animate-spin" />
          ) : (
            <svg className="ml-auto text-zinc-500 flex-shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
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
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 text-sm font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-[#0f2d4a]/40 placeholder:text-zinc-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Nome no cartão</label>
              <input
                type="text" placeholder="Como aparece no cartão"
                value={cardName} onChange={(e) => setCardName(e.target.value.toUpperCase())}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-[#0f2d4a]/40 placeholder:text-zinc-600"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Validade</label>
                <input
                  type="text" inputMode="numeric" placeholder="MM/AAAA"
                  value={cardExpiry} onChange={(e) => setCardExpiry(maskExpiry(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2d4a]/40 placeholder:text-zinc-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">CVV</label>
                <input
                  type="text" inputMode="numeric" placeholder="123"
                  value={cardCvv} onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2d4a]/40 placeholder:text-zinc-600"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Parcelas</label>
              <select
                value={installments}
                onChange={(e) => setInstallments(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2d4a]/40 bg-white text-zinc-800"
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

        {/* Depoimento rotativo */}
        <div className="bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3">
          <div className="flex gap-0.5 mb-1.5">
            {[...Array(5)].map((_, i) => (
              <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill="#f59e0b"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            ))}
          </div>
          <p className="text-xs text-zinc-700 leading-relaxed italic">"{TESTIMONIALS[testimonialIdx].text}"</p>
          <p className="text-xs font-semibold text-zinc-600 mt-1.5">— {TESTIMONIALS[testimonialIdx].name}, Aluno(a) do Rotina Clínica</p>
        </div>

        {/* Botão principal */}
        <button
          onClick={() => pay(selected)}
          disabled={loading}
          className={`w-full ${BTN_COLOR[selected]} disabled:opacity-60 text-white font-bold py-4 rounded-xl transition-all text-sm`}
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

        {/* Garantia em destaque */}
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
          <div>
            <p className="text-xs font-bold text-emerald-800">Garantia de 7 dias</p>
            <p className="text-xs text-emerald-700">Se não gostar, devolvemos 100% do valor. Sem perguntas.</p>
          </div>
        </div>

        {/* Selos de confiança */}
        <div className="flex items-center justify-center gap-4 pt-1 pb-0.5">
          <span className="flex items-center gap-1.5 text-[11px] text-zinc-700 font-medium">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0f2d4a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
            Pagamento seguro
          </span>
          <span className="text-zinc-400">|</span>
          <span className="flex items-center gap-1.5 text-[11px] text-zinc-700 font-medium">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#32bcad" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
            Acesso imediato
          </span>
          <span className="text-zinc-400">|</span>
          <span className="flex items-center gap-1.5 text-[11px] text-zinc-700 font-medium">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#32bcad" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            +900 alunos
          </span>
        </div>
      </div>
    </>
  );
}
