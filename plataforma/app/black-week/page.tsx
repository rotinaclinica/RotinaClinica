import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import { shareMeta } from "@/lib/seo";
import Countdown from "./Countdown";

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
const FIM = "2026-12-01T03:00:00Z";

const ANUAL = "/checkout?plano=anual&oferta=blackweek";
const MENSAL = "/checkout?plano=mensal&oferta=blackweek";

const FEATURES = [
  { emoji: "📋", title: "Condutas clínicas", desc: "Mais de 250 temas de emergência, PS/UPA e atenção primária, com dose e forma de prescrever." },
  { emoji: "📝", title: "Modelos de evolução", desc: "Evoluções prontas para copiar e adaptar, ganhando tempo no atendimento." },
  { emoji: "🎓", title: "Curso Destravando o Plantão", desc: "Aulas práticas do que mais aparece no plantão, do diagnóstico à prescrição." },
  { emoji: "🧮", title: "Calculadoras e escores", desc: "Os cálculos e escores do dia a dia, prontos para usar à beira do leito." },
  { emoji: "📚", title: "E-books e materiais", desc: "Manual de prescrições, sedação, intubação e ventilação mecânica e outros PDFs para baixar." },
  { emoji: "🩺", title: "Casos clínicos", desc: "Casos novos toda semana para treinar o raciocínio." },
];

const INCLUSOS = [
  { title: "Manual Prático de Prescrições: Da UBS à Emergência", price: "R$ 97" },
  { title: "Sedação, Intubação e Ventilação Mecânica", price: "R$ 47" },
  { title: "Destravando o Plantão (curso online)", price: "R$ 397" },
];

const FAQ = [
  { q: "O desconto do mensal vale por quanto tempo?", a: "As 12 primeiras mensalidades saem por R$ 27,93, enquanto a assinatura seguir ativa. Da 13ª em diante, a mensalidade volta para R$ 39,90. Se cancelar e assinar de novo depois, vale o preço da época." },
  { q: "O anual renova sozinho?", a: "Não. O plano anual é um pagamento único (Pix ou cartão em até 12x sem juros) que libera 12 meses de acesso. Perto do vencimento avisamos por e-mail." },
  { q: "Já sou assinante. Posso aproveitar?", a: "Se você paga por período (Pix ou anual), sim: o novo período anual soma ao que você já tem, sem perder nenhum dia." },
  { q: "E se eu não gostar?", a: "Você tem 7 dias de garantia: se pedir o reembolso nesse prazo, devolvemos o valor total." },
  { q: "O acesso é imediato?", a: "Sim. No cartão, assim que o pagamento é aprovado; no Pix, logo após a confirmação." },
];

function Check({ color = "#3db8d4" }: { color?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

const TICKER = ["BLACK WEEK", "30% OFF", "ANUAL POR R$ 280", "MENSAL POR R$ 27,93", "ATÉ 30/11"];

export default function BlackWeekPage() {
  const encerrada = new Date() >= new Date(FIM);

  if (encerrada) {
    return (
      <main className="min-h-screen bg-[#050a12] text-white">
        <Navbar />
        <section className="px-4 py-24 text-center">
          <h1 className="text-3xl sm:text-5xl font-extrabold mb-4">A Black Week terminou</h1>
          <p className="text-[#a9bccd] max-w-xl mx-auto mb-8">
            Obrigado a todos que aproveitaram. Os planos seguem disponíveis pelo preço normal.
          </p>
          <Link href="/assinatura" className="inline-block bg-[#3db8d4] hover:bg-[#5fcbe3] text-[#050a12] font-bold px-6 py-3.5 rounded-xl transition-colors">
            Ver planos
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050a12] text-white pb-24 sm:pb-0">
      <style>{`
        @keyframes bw-marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }
        @keyframes bw-glow { 0%,100% { opacity: .55 } 50% { opacity: .9 } }
        .bw-marquee { animation: bw-marquee 28s linear infinite; }
        .bw-glow { animation: bw-glow 6s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .bw-marquee, .bw-glow { animation: none; } }
      `}</style>
      <Navbar />

      {/* Faixa animada */}
      <div className="overflow-hidden border-y border-[#3db8d4]/20 bg-[#3db8d4] text-[#050a12]" aria-hidden="true">
        <div className="bw-marquee flex w-max whitespace-nowrap py-2 text-[11px] sm:text-xs font-extrabold tracking-[0.2em]">
          {[0, 1].map((k) => (
            <div key={k} className="flex">
              {[...TICKER, ...TICKER].map((t, i) => (
                <span key={i} className="mx-4 flex items-center gap-8">
                  {t} <span className="opacity-50">✦</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden px-4 sm:px-6 pt-14 pb-10 sm:pt-20 sm:pb-14 text-center">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "48px 48px", maskImage: "radial-gradient(ellipse at 50% 30%, #000 20%, transparent 70%)", WebkitMaskImage: "radial-gradient(ellipse at 50% 30%, #000 20%, transparent 70%)" }}
        />
        <div className="bw-glow pointer-events-none absolute left-1/2 top-[-140px] h-[460px] w-[760px] max-w-[140vw] -translate-x-1/2 rounded-full bg-[#3db8d4]/25 blur-[110px]" />
        <div className="pointer-events-none absolute right-[-120px] top-[220px] h-[320px] w-[320px] rounded-full bg-[#7c3aed]/20 blur-[100px]" />

        <div className="relative max-w-4xl mx-auto">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#3db8d4]/40 bg-[#3db8d4]/10 px-4 py-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] text-[#3db8d4]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#3db8d4]" />
            Black Week Rotina Clínica
          </span>

          <h1 className="mt-6 font-extrabold leading-[0.9] tracking-tight">
            <span className="block bg-gradient-to-b from-white via-[#bfeaf5] to-[#3db8d4] bg-clip-text text-[26vw] sm:text-[170px] text-transparent">
              30<span className="text-[0.55em] align-top">%</span>
            </span>
            <span className="block text-3xl sm:text-5xl text-white -mt-1 sm:-mt-3">
              OFF no menor preço que já fizemos
            </span>
          </h1>

          <p className="mt-5 text-[#a9bccd] text-base sm:text-lg max-w-2xl mx-auto">
            Condutas, evoluções, calculadoras, curso e e-books em um só lugar. Anual no Pix ou no cartão,
            ou mensal com o desconto mantido por 12 meses.
          </p>

          <div className="mt-8">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#7f93a8]">A oferta termina em</p>
            <Countdown fim={FIM} />
          </div>
        </div>
      </section>

      {/* Planos */}
      <section id="planos" className="relative px-4 sm:px-6 pb-6 scroll-mt-6">
        <div className="max-w-4xl mx-auto grid gap-5 sm:grid-cols-2 items-stretch">
          {/* Anual */}
          <div className="relative rounded-3xl bg-gradient-to-b from-[#3db8d4] via-[#3db8d4]/40 to-[#3db8d4]/10 p-[1.5px] shadow-[0_0_60px_-10px_rgba(61,184,212,0.55)]">
            <div className="relative flex h-full flex-col rounded-[22px] bg-[#0a1626] p-6 sm:p-7">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#3db8d4]">Plano anual</p>
                <span className="rounded-full bg-[#3db8d4] px-3 py-1 text-[11px] font-extrabold text-[#050a12]">MELHOR VALOR</span>
              </div>
              <p className="mt-5 text-sm text-[#7f93a8] line-through">de R$ 400 no ano</p>
              <p className="mt-1 flex items-baseline gap-2">
                <span className="text-sm font-semibold text-[#a9bccd]">12x de</span>
                <span className="text-5xl sm:text-6xl font-extrabold tracking-tight text-white">R$ 23,33</span>
              </p>
              <p className="mt-2 text-sm text-[#a9bccd]">
                ou <strong className="text-white">R$ 280 à vista</strong> no Pix
              </p>
              <span className="mt-4 inline-flex w-fit items-center rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-xs font-bold text-emerald-300">
                Você economiza R$ 120
              </span>
              <ul className="mt-6 flex-1 space-y-2.5 text-sm text-[#d5e0ea]">
                <li className="flex gap-2"><Check />12 meses de acesso completo</li>
                <li className="flex gap-2"><Check />Pix à vista ou cartão em até 12x sem juros</li>
                <li className="flex gap-2"><Check />Sem renovação automática</li>
                <li className="flex gap-2"><Check />Garantia de 7 dias</li>
              </ul>
              <Link
                href={ANUAL}
                className="mt-7 block rounded-xl bg-[#3db8d4] px-6 py-4 text-center text-base font-extrabold text-[#050a12] transition-all hover:bg-[#5fcbe3] hover:shadow-[0_0_30px_rgba(61,184,212,0.6)]"
              >
                Quero o anual com 30% off
              </Link>
            </div>
          </div>

          {/* Mensal */}
          <div className="flex flex-col rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:p-7 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#a9bccd]">Plano mensal</p>
              <span className="rounded-full border border-white/20 px-3 py-1 text-[11px] font-bold text-white">30% OFF</span>
            </div>
            <p className="mt-5 text-sm text-[#7f93a8] line-through">de R$ 39,90/mês</p>
            <p className="mt-1 flex items-baseline gap-2">
              <span className="text-5xl sm:text-6xl font-extrabold tracking-tight text-white">R$ 27,93</span>
              <span className="text-sm font-semibold text-[#a9bccd]">/mês</span>
            </p>
            <p className="mt-2 text-sm text-[#a9bccd]">
              nos <strong className="text-white">12 primeiros meses</strong>
            </p>
            <span className="mt-4 inline-flex w-fit items-center rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-xs font-bold text-emerald-300">
              R$ 11,97 a menos todo mês
            </span>
            <ul className="mt-6 flex-1 space-y-2.5 text-sm text-[#d5e0ea]">
              <li className="flex gap-2"><Check />Acesso completo enquanto assinar</li>
              <li className="flex gap-2"><Check />No cartão, com renovação automática</li>
              <li className="flex gap-2"><Check />Desconto mantido por 12 meses com a assinatura ativa</li>
              <li className="flex gap-2"><Check />Cancele quando quiser</li>
            </ul>
            <Link
              href={MENSAL}
              className="mt-7 block rounded-xl border border-white/25 bg-white/10 px-6 py-4 text-center text-base font-extrabold text-white transition-colors hover:bg-white/20"
            >
              Quero o mensal com 30% off
            </Link>
          </div>
        </div>

        <div className="max-w-4xl mx-auto mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-[#a9bccd]">
          <span className="flex items-center gap-1.5"><Check color="#34d399" />Garantia de 7 dias</span>
          <span className="flex items-center gap-1.5"><Check color="#34d399" />Acesso imediato</span>
          <span className="flex items-center gap-1.5"><Check color="#34d399" />Funciona no celular</span>
        </div>
      </section>

      {/* O que inclui */}
      <section className="px-4 sm:px-6 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-center text-2xl sm:text-3xl font-extrabold">
            Tudo o que você usa no plantão, <span className="text-[#3db8d4]">em um só lugar</span>
          </h2>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition-colors hover:border-[#3db8d4]/50">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#3db8d4]/15 text-2xl">{f.emoji}</span>
                <p className="mt-4 font-bold text-white">{f.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-[#a9bccd]">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Valor incluso */}
      <section className="px-4 sm:px-6 pb-12 sm:pb-16">
        <div className="max-w-2xl mx-auto rounded-3xl border border-[#3db8d4]/25 bg-gradient-to-b from-[#0d1f33] to-[#0a1626] p-6 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#3db8d4]">Já vem na assinatura</p>
          <div className="mt-4 divide-y divide-white/10">
            {INCLUSOS.map((p) => (
              <div key={p.title} className="flex items-center justify-between gap-4 py-3 text-sm">
                <span className="text-[#d5e0ea]">{p.title}</span>
                <span className="whitespace-nowrap font-semibold text-[#7f93a8] line-through">{p.price}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-col gap-1 rounded-2xl bg-white/[0.06] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm text-[#a9bccd]">
              Separado custaria <span className="font-bold text-white line-through">R$ 541</span>
            </span>
            <span className="text-lg font-extrabold text-white">
              Na Black Week: <span className="text-[#3db8d4]">12x de R$ 23,33</span>
            </span>
          </div>
          <Link
            href="#planos"
            className="mt-5 block rounded-xl bg-[#3db8d4] px-6 py-3.5 text-center font-extrabold text-[#050a12] transition-colors hover:bg-[#5fcbe3]"
          >
            Escolher meu plano
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 sm:px-6 pb-14">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-center text-2xl font-extrabold mb-6">Dúvidas frequentes</h2>
          <div className="space-y-2">
            {FAQ.map(({ q, a }) => (
              <details key={q} className="group rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 open:border-[#3db8d4]/40">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm sm:text-base font-semibold text-white">
                  {q}
                  <span className="text-[#3db8d4] text-xl leading-none transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-[#a9bccd]">{a}</p>
              </details>
            ))}
          </div>
          <p className="mt-8 text-center text-xs leading-relaxed text-[#7f93a8]">
            Oferta válida até 30/11/2026 às 23h59 (horário de Brasília). No mensal, o desconto vale para as 12 primeiras
            mensalidades; depois, R$ 39,90/mês. O plano anual não renova automaticamente.
          </p>
        </div>
      </section>

      {/* Barra fixa no celular */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#050a12]/95 px-4 py-3 backdrop-blur sm:hidden">
        <Link href={ANUAL} className="flex items-center justify-between gap-3 rounded-xl bg-[#3db8d4] px-4 py-3 text-[#050a12]">
          <span className="text-left leading-tight">
            <span className="block text-[11px] font-bold uppercase tracking-wider opacity-70">Anual com 30% off</span>
            <span className="block text-base font-extrabold">12x de R$ 23,33</span>
          </span>
          <span className="text-sm font-extrabold">Assinar →</span>
        </Link>
      </div>
    </main>
  );
}
