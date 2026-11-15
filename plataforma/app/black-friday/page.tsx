import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import { shareMeta } from "@/lib/seo";

// Black Week 2026 — fase "lista VIP" (até 19/11). Quem chega pelo e-mail
// (utm_campaign=bf_vip_nov26) vê a confirmação; o clique fica registrado no Brevo.
// A pré-venda (20–22/11) e a oferta aberta (23–30/11) entram nesta mesma página depois.

export const metadata = {
  title: "Black Week — anual 30% mais barato",
  description: "De 23 a 30/11, o plano anual do Rotina Clínica sai 30% mais barato: R$ 280 no ano, em até 12x de R$ 23,33.",
  robots: { index: false },
  ...shareMeta(
    "/black-friday",
    "Black Week do Rotina Clínica",
    "De 23 a 30/11, o plano anual sai 30% mais barato: R$ 280 no ano, em até 12x de R$ 23,33."
  ),
};

const FEATURES = [
  { emoji: "📋", title: "Condutas Clínicas", desc: "Mais de 250 temas de emergência, PS/UPA e atenção primária, com dose e forma de prescrever." },
  { emoji: "📝", title: "Modelos de evolução", desc: "Evoluções prontas para copiar e adaptar, ganhando tempo no atendimento." },
  { emoji: "🧮", title: "Calculadoras e escores", desc: "Os cálculos e escores do dia a dia, prontos para usar à beira do leito." },
];

export default async function BlackFridayPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const vip = sp.utm_campaign === "bf_vip_nov26";

  return (
    <main className="min-h-screen bg-[#f7fafc]">
      <Navbar />

      <section className="bg-[#0a1626] py-14 sm:py-20 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <span className="inline-block bg-[#3db8d4]/20 text-[#3db8d4] text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full mb-6 border border-[#3db8d4]/30">
            Black Week · 23 a 30/11
          </span>
          {vip ? (
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight mb-5">
              Pronto, você está na <span className="text-[#3db8d4]">lista VIP</span>
            </h1>
          ) : (
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight mb-5">
              O anual do Rotina Clínica <span className="text-[#3db8d4]">30% mais barato</span>
            </h1>
          )}
          <p className="text-[#a9bccd] text-base sm:text-lg max-w-2xl mx-auto">
            {vip
              ? "No dia 20/11 você recebe por e-mail o acesso à oferta, três dias antes de todo mundo."
              : "De 23 a 30/11, o plano anual sai pelo menor preço que já fizemos."}
          </p>
        </div>
      </section>

      <section className="px-6 -mt-8">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-[#c9d6e3] shadow-[0_4px_20px_rgba(15,45,74,0.08)] p-6 sm:p-8">
          <div className="text-center pb-6 mb-6 border-b border-[#e3ebf2]">
            <p className="text-xs font-bold tracking-widest uppercase text-[#1a6aad] mb-2">Plano anual na Black Week</p>
            <p className="text-[#4d6175] line-through text-sm">R$ 400 no ano</p>
            <p className="text-3xl sm:text-4xl font-extrabold text-[#0f2d4a]">12x de R$ 23,33</p>
            <p className="text-sm text-[#2b3a4a] mt-1">R$ 280 no ano, no cartão, sem juros</p>
          </div>

          <p className="text-xs font-bold tracking-widest uppercase text-[#1a6aad] mb-4">O que a assinatura inclui</p>
          <div className="space-y-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex gap-4">
                <span className="text-2xl leading-none mt-0.5">{f.emoji}</span>
                <div>
                  <p className="font-bold text-[#0f2d4a]">{f.title}</p>
                  <p className="text-sm text-[#2b3a4a] leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-[#e3ebf2] text-center">
            <p className="text-[#0f2d4a] font-semibold mb-1">Quer conhecer antes da Black Week?</p>
            <p className="text-sm text-[#2b3a4a] mb-4">Teste grátis por 7 dias as condutas, os modelos de evolução e as calculadoras.</p>
            <Link
              href="/teste"
              className="inline-block bg-[#3db8d4] hover:bg-[#2fa6c2] text-[#0a1626] font-bold px-6 py-3.5 rounded-xl transition-colors"
            >
              Começar o teste grátis
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 py-12">
        <p className="max-w-3xl mx-auto text-center text-xs text-[#4d6175]">
          Oferta válida de 23 a 30/11/2026 (pré-venda para a lista VIP a partir de 20/11). O plano anual renova pelo preço normal.
        </p>
      </section>
    </main>
  );
}
