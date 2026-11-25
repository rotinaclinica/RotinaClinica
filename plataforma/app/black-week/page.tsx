import Link from "next/link";
import { shareMeta } from "@/lib/seo";
import Countdown from "./Countdown";
import OfferVisitTracker from "@/app/_components/OfferVisitTracker";
import PrescricaoContent from "@/app/dashboard/prescricoes/PrescricaoContent";
import { prescricoesMeta } from "@/lib/prescricoes-meta";
import { readFileSync } from "fs";
import { join } from "path";

// Prova logo no topo: um trecho real de conduta, renderizado igual à plataforma
const PREVIEW_ID = "2"; // Anafilaxia (mesma prévia do /tour)
function previewConduta(): string {
  try {
    const all: Record<string, string> = JSON.parse(
      readFileSync(join(process.cwd(), "lib", "prescricoes-content.json"), "utf-8")
    );
    return all[PREVIEW_ID] ?? "";
  } catch {
    return "";
  }
}

// Black Week 2026 — página da oferta (pré-venda VIP 20/11, aberta 23–30/11).
// Fica fora do sitemap e sem links no site até a divulgação. Os botões levam ao
// checkout com ?oferta=blackweek, que aplica o cupom BLACKWEEK30 (lib/promocoes.ts).
// Só conteúdo real: depoimentos e "+900 alunos" vêm do checkout; currículos, de /conheca.

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
const Y = "#ffd60a";

const FEATURES = [
  { emoji: "📋", title: "Condutas clínicas", desc: "Mais de 250 temas de emergência, PS/UPA e atenção primária, com dose e forma de prescrever." },
  { emoji: "📝", title: "Modelos de evolução", desc: "Evoluções prontas para copiar e adaptar, ganhando tempo no atendimento." },
  { emoji: "🎓", title: "Curso Destravando o Plantão", desc: "Aulas práticas do que mais aparece no plantão, do diagnóstico à prescrição." },
  { emoji: "🧮", title: "Calculadoras e escores", desc: "Os cálculos e escores do dia a dia, prontos para usar à beira do leito." },
  { emoji: "📚", title: "E-books e materiais", desc: "Manual de prescrições, sedação, intubação e ventilação mecânica e outros PDFs para baixar." },
  { emoji: "🩺", title: "Casos clínicos", desc: "Casos novos toda semana para treinar o raciocínio." },
];

const INCLUSOS = [
  { title: "Destravando o Plantão (curso online)", price: "R$ 397", img: "/images/destravando-plantao.png" },
  { title: "Manual Prático de Prescrições: Da UBS à Emergência", price: "R$ 97", img: "/images/ebook-manual.png" },
  { title: "Sedação, Intubação e Ventilação Mecânica", price: "R$ 47", img: "/images/ebook-iot.png" },
];

const TESTIMONIALS = [
  { name: "Joana", text: "Melhor aquisição possível! Está sendo meu amigo fiel em todos os plantões. Não deixa ninguém passar sufoco." },
  { name: "Anna", text: "Indico para todos os médicos recém formados que querem manejar seus pacientes com mais rapidez e com prescrições baseadas em evidências. Vai ser o seu melhor amigo de plantão." },
  { name: "Leticia", text: "Indispensável para os plantões. Atualizado, claro e objetivo. Muito prático e com ótimas referências. Realmente facilita e otimiza os atendimentos." },
  { name: "Mateus", text: "Produto excelente. O conteúdo é confiável, baseado em evidências, completo e reúne todos os principais tópicos da prática do generalista. Recomendo bastante!" },
  { name: "Ruth", text: "Pensado exatamente para o que é mais necessário na prática clínica — seja no pronto-socorro, na enfermaria ou nos ambulatórios. As referências são de fontes sérias e atualizadas." },
  { name: "Felipe", text: "Muito completo! Tem tudo que a gente precisa. O material descomplica esse assunto. Muito bom mesmo!" },
];

const PARA_QUEM = [
  "Recém-formado que vai encarar os primeiros plantões",
  "Quem dá plantão em PS, UPA ou enfermaria e quer prescrever com segurança",
  "Quem atende na UBS e quer condutas rápidas e baseadas em evidências",
  "Estudante no internato que quer chegar preparado",
];

const FAQ = [
  { q: "O desconto do mensal vale por quanto tempo?", a: "As 12 primeiras mensalidades saem por R$ 27,93, enquanto a assinatura seguir ativa. Da 13ª em diante, a mensalidade volta para R$ 39,90. Se cancelar e assinar de novo depois, vale o preço da época." },
  { q: "O anual renova sozinho?", a: "Não. O plano anual é um pagamento único (Pix ou cartão em até 12x sem juros) que libera 12 meses de acesso. Perto do vencimento avisamos por e-mail." },
  { q: "Já sou assinante. Posso aproveitar?", a: "Se você paga por período (Pix ou anual), sim: o novo período anual soma ao que você já tem, sem perder nenhum dia." },
  { q: "E se eu não gostar?", a: "Você tem 7 dias de garantia: se pedir o reembolso nesse prazo, devolvemos o valor total." },
  { q: "O acesso é imediato?", a: "Sim. No cartão, assim que o pagamento é aprovado; no Pix, logo após a confirmação." },
  { q: "Funciona no celular?", a: "Sim. A plataforma funciona no celular, no tablet e no computador, e dá para instalar na tela inicial do celular." },
];

function Check({ color = Y }: { color?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function Stars() {
  return <span className="text-sm tracking-[0.15em]" style={{ color: Y }} aria-label="5 estrelas">★★★★★</span>;
}

function CtaPrincipal({ children = "Garantir meus 30% off" }: { children?: React.ReactNode }) {
  return (
    <Link
      href="#planos"
      className="group inline-flex items-center justify-center gap-2 rounded-2xl px-6 sm:px-8 py-4 sm:py-5 text-[15px] sm:text-lg font-black uppercase tracking-wide text-black transition-transform hover:-translate-y-0.5 active:translate-y-0.5"
      style={{ background: Y, boxShadow: "0 6px 0 #b39400, 0 0 40px rgba(255,214,10,0.35)" }}
    >
      {children} <span className="transition-transform group-hover:translate-x-1">→</span>
    </Link>
  );
}

const TICKER = ["BLACK WEEK", "-30% OFF", "ANUAL R$ 280", "MENSAL R$ 27,93", "SÓ ATÉ 30/11", "O MENOR PREÇO DO ANO"];

export default function BlackWeekPage() {
  const encerrada = new Date() >= new Date(FIM);
  const conduta = encerrada ? "" : previewConduta();
  const totalCondutas = prescricoesMeta.length;

  if (encerrada) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center px-4 text-center">
        <div>
          <img src="/images/logo-branco-web.png" alt="Rotina Clínica" className="mx-auto h-9 w-auto mb-10" />
          <h1 className="text-3xl sm:text-5xl font-black mb-4">A Black Week terminou</h1>
          <p className="text-white/70 max-w-xl mx-auto mb-8">Obrigado a todos que aproveitaram. Os planos seguem disponíveis pelo preço normal.</p>
          <Link href="/assinatura" className="inline-block rounded-xl px-6 py-3.5 font-bold text-black" style={{ background: Y }}>
            Ver planos
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white pb-24 sm:pb-0 overflow-x-hidden">
      <OfferVisitTracker slug="blackweek" />
      <style>{`
        @keyframes bw-marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }
        @keyframes bw-pulse { 0%,100% { transform: scale(1) } 50% { transform: scale(1.04) } }
        .bw-marquee { animation: bw-marquee 30s linear infinite; }
        .bw-pulse { animation: bw-pulse 2.4s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .bw-marquee, .bw-pulse { animation: none; } }
      `}</style>

      {/* Barra de urgência fixa */}
      <div className="sticky top-0 z-50 text-black" style={{ background: Y }}>
        <div className="mx-auto flex max-w-6xl items-center justify-center gap-2 sm:gap-4 px-4 py-2 text-[12px] sm:text-sm font-bold">
          <span className="hidden sm:inline">🔥 BLACK WEEK: 30% OFF termina em</span>
          <span className="sm:hidden">🔥 30% OFF acaba em</span>
          <span className="rounded-md bg-black px-2 py-0.5" style={{ color: Y }}>
            <Countdown fim={FIM} compact />
          </span>
        </div>
      </div>

      {/* Cabeçalho */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 py-4">
        <Link href="/" aria-label="Rotina Clínica">
          <img src="/images/logo-branco-web.png" alt="Rotina Clínica" className="h-7 sm:h-8 w-auto" />
        </Link>
        <Link href="#planos" className="rounded-lg border border-white/20 px-4 py-2 text-xs sm:text-sm font-bold hover:bg-white/10">
          Ver oferta
        </Link>
      </header>

      {/* Hero */}
      <section className="relative px-4 sm:px-6 pt-6 pb-14 sm:pt-10 sm:pb-20 text-center">
        <div className="pointer-events-none absolute left-1/2 top-10 h-[420px] w-[700px] max-w-[150vw] -translate-x-1/2 rounded-full blur-[130px] opacity-25" style={{ background: Y }} />
        <div className="relative mx-auto max-w-5xl">
          <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.35em] text-white/60">Só até 30 de novembro</p>

          <h1 className="mt-4 font-black uppercase leading-[0.85] tracking-tight">
            <span className="block text-[17vw] sm:text-[150px]">Black</span>
            <span className="block text-[17vw] sm:text-[150px]" style={{ color: Y, WebkitTextStroke: "0" }}>
              Week
            </span>
          </h1>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-5">
            <span className="bw-pulse rounded-2xl bg-[#e11d48] px-5 py-2 text-3xl sm:text-5xl font-black shadow-[0_6px_0_#9f1239]">-30%</span>
            <span className="text-center sm:text-left text-lg sm:text-2xl font-bold leading-tight">
              no Rotina Clínica:
              <br />
              <span className="text-white/60">o menor preço que já fizemos</span>
            </span>
          </div>

          <div className="mx-auto mt-10 max-w-md rounded-3xl border-2 bg-white/[0.03] p-6" style={{ borderColor: Y }}>
            <p className="text-sm text-white/60">
              Plano anual de <span className="line-through">R$ 400</span> por
            </p>
            <p className="mt-1 flex items-baseline justify-center gap-2">
              <span className="text-lg font-bold text-white/80">12x</span>
              <span className="text-6xl sm:text-7xl font-black tracking-tight" style={{ color: Y }}>
                R$ 23,33
              </span>
            </p>
            <p className="mt-1 text-sm text-white/70">
              ou R$ 280 à vista no Pix · <strong className="text-white">menos de R$ 0,77 por dia</strong>
            </p>
          </div>

          <div className="mt-8">
            <CtaPrincipal />
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs sm:text-sm text-white/70">
            <span className="flex items-center gap-1.5"><Check />+900 alunos</span>
            <span className="flex items-center gap-1.5"><Check />Garantia de 7 dias</span>
            <span className="flex items-center gap-1.5"><Check />Acesso imediato</span>
          </div>
        </div>
      </section>

      {/* Prova: conduta real por dentro */}
      {conduta && (
        <section className="px-4 sm:px-6 pb-14 sm:pb-20">
          <div className="mx-auto grid max-w-5xl items-center gap-8 md:grid-cols-[1fr_1.1fr]">
            <div className="text-center md:text-left">
              <p className="text-xs font-bold uppercase tracking-[0.25em]" style={{ color: Y }}>Veja por dentro</p>
              <h2 className="mt-3 text-3xl sm:text-4xl font-black uppercase leading-tight">
                A conduta pronta, <span style={{ color: Y }}>com dose e diluição</span>
              </h2>
              <p className="mt-4 text-white/70 leading-relaxed">
                Este é um trecho real da conduta de Anafilaxia, do jeito que aparece na plataforma. São{" "}
                <strong className="text-white">{totalCondutas} condutas</strong> assim, de emergência, PS/UPA e UBS, para abrir no celular no meio do plantão.
              </p>
              <div className="mt-6 hidden md:block">
                <CtaPrincipal>Quero acesso com 30% off</CtaPrincipal>
              </div>
            </div>
            <div className="relative mx-auto w-full max-w-md overflow-hidden rounded-3xl border-4 border-white/15 bg-white text-left shadow-[0_0_60px_-15px_rgba(255,214,10,0.4)]">
              <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-red-500">Emergência</span>
                  <p className="text-base font-extrabold leading-tight text-[#0f2d4a]">Anafilaxia</p>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Rotina Clínica</span>
              </div>
              <div data-theme="light" className="pointer-events-none max-h-[380px] overflow-hidden px-5 py-4 text-zinc-900" aria-hidden="true">
                <PrescricaoContent conteudo={conduta} />
              </div>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-white via-white/90 to-transparent" />
              <p className="absolute inset-x-0 bottom-3 text-center text-xs font-bold text-[#1a6aad]">
                + {totalCondutas - 1} condutas na plataforma
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Faixa animada */}
      <div className="-rotate-1 overflow-hidden py-3 text-black" style={{ background: Y }} aria-hidden="true">
        <div className="bw-marquee flex w-max whitespace-nowrap text-sm sm:text-base font-black tracking-[0.15em]">
          {[0, 1].map((k) => (
            <div key={k} className="flex">
              {[...TICKER, ...TICKER].map((t, i) => (
                <span key={i} className="mx-5 flex items-center gap-10">
                  {t} <span>✦</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Contagem grande */}
      <section className="px-4 sm:px-6 pt-16 pb-6 text-center">
        <p className="mb-5 text-sm font-bold uppercase tracking-[0.25em] text-white/60">O desconto acaba em</p>
        <Countdown fim={FIM} />
        <p className="mt-6 text-sm text-white/60">Depois de 30/11 às 23h59, o anual volta para R$ 400.</p>
      </section>

      {/* Planos */}
      <section id="planos" className="scroll-mt-14 px-4 sm:px-6 py-12 sm:py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl sm:text-5xl font-black uppercase leading-tight">
            Escolha seu plano com <span style={{ color: Y }}>30% off</span>
          </h2>

          <div className="mt-10 grid items-stretch gap-6 md:grid-cols-[1.15fr_1fr]">
            {/* Anual */}
            <div className="relative flex flex-col rounded-3xl border-[3px] bg-[#0d0d0d] p-6 sm:p-8" style={{ borderColor: Y, boxShadow: "0 0 70px -15px rgba(255,214,10,0.45)" }}>
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-black uppercase tracking-wider text-black" style={{ background: Y }}>
                ⭐ Melhor valor
              </span>
              <div className="mt-2 flex items-center justify-between">
                <p className="text-lg font-black uppercase">Plano anual</p>
                <span className="rounded-lg bg-[#e11d48] px-2.5 py-1 text-sm font-black">-30%</span>
              </div>
              <p className="mt-5 text-base text-white/50">
                de <span className="line-through">R$ 400</span> por
              </p>
              <p className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-white/80">12x</span>
                <span className="text-6xl sm:text-7xl font-black tracking-tight" style={{ color: Y }}>R$ 23,33</span>
              </p>
              <p className="mt-1 text-white/80">
                ou <strong className="text-white">R$ 280 à vista</strong> no Pix
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-lg bg-emerald-500/15 px-3 py-1.5 text-sm font-bold text-emerald-400">Economia de R$ 120</span>
                <span className="rounded-lg bg-white/10 px-3 py-1.5 text-sm font-bold text-white/90">R$ 0,77 por dia</span>
              </div>
              <ul className="mt-6 flex-1 space-y-3 text-[15px] text-white/90">
                <li className="flex gap-2.5"><Check />12 meses de acesso a tudo</li>
                <li className="flex gap-2.5"><Check />Curso, e-books, condutas, evoluções e calculadoras</li>
                <li className="flex gap-2.5"><Check />Pix à vista ou cartão em até 12x sem juros</li>
                <li className="flex gap-2.5"><Check />Sem renovação automática</li>
                <li className="flex gap-2.5"><Check />Garantia de 7 dias</li>
              </ul>
              <Link
                href={ANUAL}
                className="mt-8 block rounded-2xl px-6 py-5 text-center text-lg font-black uppercase tracking-wide text-black transition-transform hover:-translate-y-0.5 active:translate-y-0.5"
                style={{ background: Y, boxShadow: "0 6px 0 #b39400" }}
              >
                Quero o anual com 30% off →
              </Link>
              <p className="mt-3 text-center text-xs text-white/50">Pagamento seguro · Acesso liberado na hora no cartão</p>
            </div>

            {/* Mensal */}
            <div className="flex flex-col rounded-3xl border border-white/15 bg-[#0d0d0d] p-6 sm:p-8">
              <div className="mt-2 flex items-center justify-between">
                <p className="text-lg font-black uppercase">Plano mensal</p>
                <span className="rounded-lg bg-[#e11d48] px-2.5 py-1 text-sm font-black">-30%</span>
              </div>
              <p className="mt-5 text-base text-white/50">
                de <span className="line-through">R$ 39,90</span> por
              </p>
              <p className="flex items-baseline gap-2">
                <span className="text-6xl font-black tracking-tight">R$ 27,93</span>
                <span className="text-lg font-bold text-white/60">/mês</span>
              </p>
              <p className="mt-1 text-white/80">
                nos <strong className="text-white">12 primeiros meses</strong>
              </p>
              <div className="mt-4">
                <span className="rounded-lg bg-emerald-500/15 px-3 py-1.5 text-sm font-bold text-emerald-400">R$ 11,97 a menos todo mês</span>
              </div>
              <ul className="mt-6 flex-1 space-y-3 text-[15px] text-white/90">
                <li className="flex gap-2.5"><Check color="#ffffff" />Acesso completo enquanto assinar</li>
                <li className="flex gap-2.5"><Check color="#ffffff" />No cartão, com renovação automática</li>
                <li className="flex gap-2.5"><Check color="#ffffff" />Desconto mantido por 12 meses com a assinatura ativa</li>
                <li className="flex gap-2.5"><Check color="#ffffff" />Cancele quando quiser</li>
              </ul>
              <Link
                href={MENSAL}
                className="mt-8 block rounded-2xl border-2 border-white px-6 py-4 text-center text-base font-black uppercase tracking-wide transition-colors hover:bg-white hover:text-black"
              >
                Quero o mensal com 30% off
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Ancoragem de valor */}
      <section className="px-4 sm:px-6 py-12 sm:py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-3xl sm:text-4xl font-black uppercase leading-tight">
            Tudo isso <span style={{ color: Y }}>já vem incluso</span>
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {INCLUSOS.map((p) => (
              <div key={p.title} className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <div className="flex h-40 items-center justify-center overflow-hidden rounded-xl bg-white/[0.04]">
                  <img src={p.img} alt={p.title} className="max-h-full w-auto object-contain" loading="lazy" />
                </div>
                <p className="mt-4 flex-1 text-sm font-bold leading-snug">{p.title}</p>
                <p className="mt-2 text-sm text-white/50">
                  Vendido separado por <span className="font-bold text-white/80 line-through">{p.price}</span>
                </p>
              </div>
            ))}
          </div>

          <div className="mx-auto mt-8 max-w-md overflow-hidden rounded-2xl border border-white/10">
            <div className="flex items-center justify-between bg-white/[0.04] px-5 py-3 text-sm">
              <span className="text-white/70">Comprando separado</span>
              <span className="font-bold text-white/60 line-through">R$ 541</span>
            </div>
            <div className="flex items-center justify-between border-t border-white/10 bg-white/[0.04] px-5 py-3 text-sm">
              <span className="text-white/70">Anual pelo preço normal</span>
              <span className="font-bold text-white/60 line-through">R$ 400</span>
            </div>
            <div className="flex items-center justify-between px-5 py-4 text-black" style={{ background: Y }}>
              <span className="font-black uppercase">Na Black Week</span>
              <span className="text-2xl font-black">R$ 280</span>
            </div>
          </div>
          <p className="mt-3 text-center text-sm text-white/60">E ainda leva condutas, evoluções, calculadoras e casos clínicos.</p>
        </div>
      </section>

      {/* O que tem dentro */}
      <section className="px-4 sm:px-6 py-12 sm:py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl sm:text-4xl font-black uppercase leading-tight">
            Tudo o que você usa no plantão, <span style={{ color: Y }}>em um só lugar</span>
          </h2>
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition-colors hover:border-[#ffd60a]/60">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl text-2xl" style={{ background: "rgba(255,214,10,0.12)" }}>{f.emoji}</span>
                <p className="mt-4 font-bold">{f.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-white/60">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Depoimentos */}
      <section className="px-4 sm:px-6 py-12 sm:py-16 bg-white/[0.03] border-y border-white/10">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl sm:text-4xl font-black uppercase leading-tight">
            Quem usa, <span style={{ color: Y }}>recomenda</span>
          </h2>
          <p className="mt-3 text-center text-white/60">Mais de 900 alunos já estudam com o Rotina Clínica.</p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <figure key={t.name} className="flex flex-col rounded-2xl border border-white/10 bg-black p-5">
                <Stars />
                <blockquote className="mt-3 flex-1 text-[15px] leading-relaxed text-white/85">“{t.text}”</blockquote>
                <figcaption className="mt-4 text-sm font-bold text-white/60">— {t.name}</figcaption>
              </figure>
            ))}
          </div>
          <div className="mt-10 text-center">
            <CtaPrincipal>Quero entrar com 30% off</CtaPrincipal>
          </div>
        </div>
      </section>

      {/* Para quem é */}
      <section className="px-4 sm:px-6 py-12 sm:py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-3xl sm:text-4xl font-black uppercase leading-tight">
            É para <span style={{ color: Y }}>você</span> se...
          </h2>
          <ul className="mt-8 space-y-3">
            {PARA_QUEM.map((p) => (
              <li key={p} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-base">
                <Check />
                {p}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Quem faz */}
      <section className="px-4 sm:px-6 py-12 sm:py-16">
        <div className="mx-auto grid max-w-5xl items-center gap-8 md:grid-cols-2">
          <div className="overflow-hidden rounded-3xl border border-white/10">
            <img src="/images/FOTO%20LUCAS%20E%20YAN.jpg" alt="Lucas e Yan, fundadores do Rotina Clínica" className="h-full w-full object-cover" loading="lazy" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em]" style={{ color: Y }}>Quem está por trás</p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-black uppercase leading-tight">Lucas e Yan</h2>
            <p className="mt-4 text-white/70 leading-relaxed">
              Especialistas em Clínica Médica pelo HUCAM/UFES, com atuação em PS, UPA, enfermaria, emergência e UTI.
              O Rotina Clínica reúne o que eles usam e ensinam no dia a dia do plantão.
            </p>
            <ul className="mt-5 space-y-2.5 text-[15px] text-white/85">
              <li className="flex gap-2.5"><Check />Lucas: residente de Geriatria e professor universitário</li>
              <li className="flex gap-2.5"><Check />Yan: residente de Endocrinologia, concursado no PS do HUCAM (EBSERH)</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Garantia */}
      <section className="px-4 sm:px-6 py-12">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 rounded-3xl border-2 border-dashed border-emerald-400/50 bg-emerald-400/[0.06] p-6 sm:flex-row sm:p-8 text-center sm:text-left">
          <div className="flex h-24 w-24 flex-shrink-0 flex-col items-center justify-center rounded-full border-4 border-emerald-400 text-emerald-400">
            <span className="text-3xl font-black leading-none">7</span>
            <span className="text-[10px] font-bold uppercase">dias</span>
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black">Risco zero: garantia de 7 dias</h3>
            <p className="mt-2 text-white/70 leading-relaxed">
              Assine, explore tudo e, se não for para você, peça o reembolso em até 7 dias. Devolvemos o valor total, sem perguntas.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 sm:px-6 py-12 sm:py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-3xl font-black uppercase mb-8">Dúvidas frequentes</h2>
          <div className="space-y-2">
            {FAQ.map(({ q, a }) => (
              <details key={q} className="group rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 open:border-[#ffd60a]/50">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-bold">
                  {q}
                  <span className="text-2xl leading-none transition-transform group-open:rotate-45" style={{ color: Y }}>+</span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-white/70">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Fechamento */}
      <section className="px-4 sm:px-6 pb-16 sm:pb-24">
        <div className="mx-auto max-w-4xl rounded-[32px] p-[3px]" style={{ background: `linear-gradient(135deg, ${Y}, #e11d48)` }}>
          <div className="rounded-[29px] bg-black px-6 py-12 sm:px-12 text-center">
            <h2 className="text-3xl sm:text-5xl font-black uppercase leading-tight">
              Última chance de pagar <span style={{ color: Y }}>30% menos</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-white/70">
              Depois de 30/11, o anual volta para R$ 400 e o mensal para R$ 39,90. Garanta agora o menor preço do ano.
            </p>
            <div className="mt-8">
              <Countdown fim={FIM} />
            </div>
            <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href={ANUAL}
                className="w-full sm:w-auto rounded-2xl px-8 py-5 text-lg font-black uppercase text-black transition-transform hover:-translate-y-0.5"
                style={{ background: Y, boxShadow: "0 6px 0 #b39400" }}
              >
                Anual: 12x de R$ 23,33
              </Link>
              <Link href={MENSAL} className="w-full sm:w-auto rounded-2xl border-2 border-white px-8 py-4 text-base font-black uppercase hover:bg-white hover:text-black transition-colors">
                Mensal: R$ 27,93
              </Link>
            </div>
          </div>
        </div>
        <p className="mx-auto mt-8 max-w-3xl text-center text-xs leading-relaxed text-white/40">
          Oferta válida até 30/11/2026 às 23h59 (horário de Brasília). No mensal, o desconto vale para as 12 primeiras
          mensalidades; depois, R$ 39,90/mês. O plano anual não renova automaticamente. Rotina Clínica.
        </p>
      </section>

      {/* Barra fixa no celular */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-black/95 px-4 py-3 backdrop-blur sm:hidden">
        <Link href={ANUAL} className="flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-black" style={{ background: Y }}>
          <span className="text-left leading-tight">
            <span className="block text-[11px] font-black uppercase tracking-wider opacity-70">Anual -30% · Black Week</span>
            <span className="block text-lg font-black">12x de R$ 23,33</span>
          </span>
          <span className="text-sm font-black uppercase">Garantir →</span>
        </Link>
      </div>
    </main>
  );
}
