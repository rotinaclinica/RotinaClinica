import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import { shareMeta } from "@/lib/seo";

// Black Week 2026 — página da oferta (pré-venda VIP 20/11, aberta 23–30/11).
// Fica fora do sitemap e sem links no site até a divulgação. Os botões levam ao
// checkout com ?oferta=blackweek, que aplica o cupom BLACKWEEK30 (lib/promocoes.ts).

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Black Week — 30% off no Rotina Clínica",
  description: "Anual por R$ 280 (12x de R$ 23,33) no Pix ou cartão, ou mensal por R$ 27,93 nos 12 primeiros meses.",
  robots: { index: false, follow: false },
  ...shareMeta(
    "/black-week",
    "Black Week do Rotina Clínica: 30% off",
    "Anual por R$ 280 (12x de R$ 23,33) ou mensal por R$ 27,93 nos 12 primeiros meses. Até 30/11."
  ),
};

// Fim da oferta: 30/11/2026, 23h59 de Brasília (o cupom expira no mesmo horário)
const FIM = new Date("2026-12-01T03:00:00Z");

const FEATURES = [
  { emoji: "📋", title: "Condutas clínicas", desc: "Mais de 250 temas de emergência, PS/UPA e atenção primária, com dose e forma de prescrever." },
  { emoji: "📝", title: "Modelos de evolução", desc: "Evoluções prontas para copiar e adaptar, ganhando tempo no atendimento." },
  { emoji: "🎓", title: "Curso Destravando o Plantão", desc: "Aulas práticas do que mais aparece no plantão, do diagnóstico à prescrição." },
  { emoji: "🧮", title: "Calculadoras e escores", desc: "Os cálculos e escores do dia a dia, prontos para usar à beira do leito." },
  { emoji: "📚", title: "E-books e materiais", desc: "Manual de prescrições, sedação, intubação e ventilação mecânica e outros PDFs para baixar." },
  { emoji: "🩺", title: "Casos clínicos", desc: "Casos novos toda semana para treinar o raciocínio." },
];

const FAQ = [
  { q: "O desconto do mensal vale por quanto tempo?", a: "As 12 primeiras mensalidades saem por R$ 27,93, enquanto a assinatura seguir ativa. Da 13ª em diante, a mensalidade volta para R$ 39,90. Se cancelar e assinar de novo depois, vale o preço da época." },
  { q: "O anual renova sozinho?", a: "Não. O plano anual é um pagamento único (Pix ou cartão em até 12x sem juros) que libera 12 meses de acesso. Perto do vencimento avisamos por e-mail." },
  { q: "Já sou assinante. Posso aproveitar?", a: "Se você paga por período (Pix ou anual), sim: o novo período anual soma ao que você já tem, sem perder nenhum dia." },
  { q: "E se eu não gostar?", a: "Você tem 7 dias de garantia: se pedir o reembolso nesse prazo, devolvemos o valor total." },
  { q: "O acesso é imediato?", a: "Sim. No cartão, assim que o pagamento é aprovado; no Pix, logo após a confirmação." },
];

function Check() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export default function BlackWeekPage() {
  const encerrada = new Date() >= FIM;

  return (
    <main className="min-h-screen bg-[#f7fafc]">
      <Navbar />

      <section className="bg-[#0a1626] pt-12 pb-20 sm:pt-20 sm:pb-28 px-4 sm:px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <span className="inline-block bg-[#3db8d4]/20 text-[#3db8d4] text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full mb-6 border border-[#3db8d4]/30">
            Black Week · até 30/11
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight mb-5">
            {encerrada ? (
              "A Black Week terminou"
            ) : (
              <>
                <span className="text-[#3db8d4]">30% off</span> no Rotina Clínica
              </>
            )}
          </h1>
          <p className="text-[#a9bccd] text-base sm:text-lg max-w-2xl mx-auto">
            {encerrada
              ? "Obrigado a todos que aproveitaram. Os planos seguem disponíveis pelo preço normal."
              : "O menor preço que já fizemos: no anual, no Pix ou no cartão, e no mensal, por 12 meses."}
          </p>
        </div>
      </section>

      {encerrada ? (
        <section className="px-4 sm:px-6 -mt-10 pb-16 text-center">
          <Link href="/assinatura" className="inline-block bg-[#3db8d4] hover:bg-[#2fa6c2] text-[#0a1626] font-bold px-6 py-3.5 rounded-xl transition-colors">
            Ver planos
          </Link>
        </section>
      ) : (
        <>
          <section className="px-4 sm:px-6 -mt-12 sm:-mt-16">
            <div className="max-w-3xl mx-auto grid gap-4 sm:grid-cols-2">
              {/* Anual */}
              <div className="relative bg-white rounded-2xl border-2 border-[#0d9488] shadow-[0_8px_30px_rgba(15,45,74,0.12)] p-6 flex flex-col">
                <span className="absolute -top-3 left-6 rounded-full bg-[#3db8d4] px-3 py-1 text-[11px] font-bold text-[#0a1626]">
                  Melhor valor
                </span>
                <p className="text-xs font-bold tracking-widest uppercase text-[#1a6aad] mb-3">Plano anual</p>
                <p className="text-[#4d6175] line-through text-sm">R$ 400 no ano</p>
                <p className="text-3xl font-extrabold text-[#0f2d4a] leading-tight">12x de R$ 23,33</p>
                <p className="text-sm text-[#2b3a4a] mt-1">R$ 280 no ano · economia de R$ 120</p>
                <ul className="mt-5 space-y-2 text-sm text-[#2b3a4a] flex-1">
                  <li className="flex gap-2"><Check />Pix à vista ou cartão em até 12x sem juros</li>
                  <li className="flex gap-2"><Check />12 meses de acesso completo</li>
                  <li className="flex gap-2"><Check />Garantia de 7 dias</li>
                </ul>
                <Link
                  href="/checkout?plano=anual&oferta=blackweek"
                  className="mt-6 block text-center bg-[#0d9488] hover:bg-[#0f766e] text-white font-bold px-6 py-3.5 rounded-xl transition-colors"
                >
                  Quero o anual com 30% off
                </Link>
              </div>

              {/* Mensal */}
              <div className="bg-white rounded-2xl border border-[#c9d6e3] shadow-[0_4px_20px_rgba(15,45,74,0.08)] p-6 flex flex-col">
                <p className="text-xs font-bold tracking-widest uppercase text-[#1a6aad] mb-3">Plano mensal</p>
                <p className="text-[#4d6175] line-through text-sm">R$ 39,90/mês</p>
                <p className="text-3xl font-extrabold text-[#0f2d4a] leading-tight">R$ 27,93/mês</p>
                <p className="text-sm text-[#2b3a4a] mt-1">nos 12 primeiros meses</p>
                <ul className="mt-5 space-y-2 text-sm text-[#2b3a4a] flex-1">
                  <li className="flex gap-2"><Check />No cartão, renovação automática</li>
                  <li className="flex gap-2"><Check />Desconto mantido por 12 meses enquanto a assinatura seguir ativa</li>
                  <li className="flex gap-2"><Check />Cancele quando quiser</li>
                </ul>
                <Link
                  href="/checkout?plano=mensal&oferta=blackweek"
                  className="mt-6 block text-center bg-[#0f2d4a] hover:bg-[#1a4a6e] text-white font-bold px-6 py-3.5 rounded-xl transition-colors"
                >
                  Quero o mensal com 30% off
                </Link>
              </div>
            </div>
            <p className="max-w-3xl mx-auto text-center text-xs text-[#4d6175] mt-4">
              Garantia de 7 dias: se não gostar, devolvemos o valor total.
            </p>
          </section>

          <section className="px-4 sm:px-6 py-12">
            <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-[#c9d6e3] p-6 sm:p-8">
              <p className="text-xs font-bold tracking-widest uppercase text-[#1a6aad] mb-5">O que a assinatura inclui</p>
              <div className="grid gap-5 sm:grid-cols-2">
                {FEATURES.map((f) => (
                  <div key={f.title} className="flex gap-3">
                    <span className="text-2xl leading-none mt-0.5">{f.emoji}</span>
                    <div>
                      <p className="font-bold text-[#0f2d4a]">{f.title}</p>
                      <p className="text-sm text-[#2b3a4a] leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="px-4 sm:px-6 pb-12">
            <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-[#c9d6e3] p-6 sm:p-8">
              <h2 className="text-sm font-bold text-[#0f2d4a] uppercase tracking-wider mb-2">Dúvidas frequentes</h2>
              <div className="divide-y divide-[#e3ebf2]">
                {FAQ.map(({ q, a }) => (
                  <details key={q} className="group py-3">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-[#0f2d4a]">
                      {q}
                      <span className="text-[#4d6175] transition-transform group-open:rotate-180">▾</span>
                    </summary>
                    <p className="mt-2 text-sm text-[#2b3a4a] leading-relaxed">{a}</p>
                  </details>
                ))}
              </div>
            </div>
            <p className="max-w-3xl mx-auto text-center text-xs text-[#4d6175] mt-6">
              Oferta válida até 30/11/2026 às 23h59 (horário de Brasília). No mensal, o desconto vale para as 12 primeiras
              mensalidades; depois, R$ 39,90/mês. O plano anual não renova automaticamente.
            </p>
          </section>
        </>
      )}
    </main>
  );
}
