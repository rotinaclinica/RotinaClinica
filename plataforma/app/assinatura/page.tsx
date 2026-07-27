import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import { Logo } from "@/app/components/Navbar";

const benefits = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
    title: "+200 modelos de prescrição",
    description: "Busca rápida por queixa ou diagnóstico. Prescrições prontas para UBS, PS, UPA e emergência, atualizadas com as diretrizes mais recentes.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
      </svg>
    ),
    title: "Casos clínicos semanais",
    description: "Todo semana um novo caso clínico com discussão aprofundada, raciocínio diagnóstico e conduta. Aprenda com a prática real.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
      </svg>
    ),
    title: "Cursos e videoaulas",
    description: "Conteúdo em vídeo produzido por especialistas em clínica médica. Aprenda no seu ritmo, onde e quando quiser.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      </svg>
    ),
    title: "Ebooks e materiais de apoio",
    description: "Materiais exclusivos para complementar sua prática. Do internato à emergência, tudo em um só lugar.",
  },
];

const planItems = [
  "+200 prescrições prontas",
  "Casos clínicos semanais",
  "Cursos e videoaulas",
  "Ebooks e materiais exclusivos",
  "Cancele quando quiser",
];

const faqs = [
  { q: "Posso cancelar quando quiser?", a: "Sim. No plano mensal você cancela a qualquer momento, sem multa. No plano anual, o acesso se mantém até o fim do período contratado." },
  { q: "O conteúdo é atualizado com frequência?", a: "Sim. Novos casos clínicos toda semana e prescrições revisadas continuamente com base nas diretrizes mais recentes." },
  { q: "Funciona no celular?", a: "Perfeitamente. A plataforma é totalmente responsiva — acesse pelo celular, tablet ou computador, em qualquer lugar." },
  { q: "Como funciona o acesso após o pagamento?", a: "Imediatamente após a confirmação do pagamento você recebe o acesso completo à plataforma." },
];

function Check({ dark = false }: { dark?: boolean }) {
  return (
    <svg className="flex-shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={dark ? "#0f2d4a" : "#3db8d4"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}

export default function AssinaturaPage() {
  return (
    <main className="min-h-screen bg-[#f7fafc]">
      <Navbar />

      {/* Hero */}
      <section className="bg-[#0f2d4a] py-16 sm:py-24 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <span className="inline-block bg-[#3db8d4]/20 text-[#3db8d4] text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full mb-6 border border-[#3db8d4]/30">
            Acesso completo à plataforma
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight mb-5">
            Tudo que você precisa para{" "}
            <span className="text-[#3db8d4]">atender com segurança</span>
          </h1>
          <p className="text-[#9ec4de] text-base sm:text-lg leading-relaxed max-w-xl mx-auto mb-10">
            Prescrições prontas, casos clínicos, videoaulas e materiais de apoio — uma plataforma completa para quem atua na linha de frente.
          </p>
          <a
            href="#planos"
            className="inline-flex items-center gap-2 bg-[#3db8d4] hover:bg-[#2fa8c4] text-[#0f2d4a] font-bold px-8 py-4 rounded-xl transition-all shadow-lg text-base sm:text-lg"
          >
            Ver planos
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none"><path d="M8 3l5 5-5 5M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </a>
        </div>
      </section>

      {/* Números */}
      <section className="bg-white border-b border-zinc-100">
        <div className="max-w-4xl mx-auto px-6 py-8 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { value: "900+", label: "Alunos" },
            { value: "200+", label: "Prescrições" },
            { value: "50k+", label: "Seguidores" },
            { value: "2023", label: "Fundado em" },
          ].map(({ value, label }) => (
            <div key={label}>
              <p className="text-2xl sm:text-3xl font-extrabold text-[#0f2d4a]">{value}</p>
              <p className="text-xs sm:text-sm text-zinc-500 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefícios */}
      <section className="max-w-4xl mx-auto px-6 py-14 sm:py-20">
        <div className="text-center mb-10">
          <span className="text-[#1a6aad] text-sm font-semibold tracking-widest uppercase">O que você recebe</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0f2d4a] mt-2">Tudo em um só lugar</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {benefits.map((b) => (
            <div key={b.title} className="bg-white border border-zinc-200 rounded-2xl p-6 hover:shadow-lg hover:border-[#3db8d4] transition-all">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#3db8d4] to-[#1a6aad] flex items-center justify-center text-white mb-4">
                {b.icon}
              </div>
              <h3 className="font-extrabold text-[#0f2d4a] text-base mb-2">{b.title}</h3>
              <p className="text-zinc-500 text-sm leading-relaxed text-justify">{b.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Planos */}
      <section id="planos" className="bg-[#eaf4f8] py-14 sm:py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-[#1a6aad] text-sm font-semibold tracking-widest uppercase">Escolha seu plano</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0f2d4a] mt-2">Invista na sua carreira</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">

            {/* Mensal — destaque */}
            <div className="relative bg-[#0f2d4a] rounded-3xl p-7 flex flex-col shadow-2xl">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#3db8d4] text-[#0f2d4a] text-xs font-extrabold px-5 py-1.5 rounded-full uppercase tracking-wider shadow-md">
                Mais popular
              </div>
              <p className="text-[#9ec4de] text-sm font-semibold uppercase tracking-wider mb-5 mt-2">Plano Mensal</p>
              <div className="mb-1 flex items-end gap-1">
                <span className="text-5xl font-extrabold text-white leading-none">R$ 39</span>
                <span className="text-white/60 text-2xl pb-1">,90</span>
              </div>
              <p className="text-[#9ec4de] text-sm mb-7">por mês · cancele quando quiser</p>
              <ul className="space-y-3 mb-8 flex-1">
                {planItems.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-white/85">
                    <Check />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/registro"
                className="block text-center bg-white text-[#0f2d4a] font-bold py-4 rounded-2xl hover:bg-[#3db8d4] hover:text-white transition-all shadow text-base"
              >
                Assinar mensal
              </Link>
            </div>

            {/* Anual */}
            <div className="relative bg-white border-2 border-zinc-200 rounded-3xl p-7 flex flex-col shadow-sm hover:shadow-lg hover:border-[#3db8d4] transition-all">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#1a6aad] text-white text-xs font-extrabold px-5 py-1.5 rounded-full uppercase tracking-wider shadow-md">
                Plano Anual
              </div>
              <p className="text-zinc-400 text-sm font-semibold uppercase tracking-wider mb-5 mt-2">Anual</p>
              <div className="mb-1 flex items-end gap-1">
                <span className="text-5xl font-extrabold text-[#0f2d4a] leading-none">R$ 319</span>
              </div>
              <p className="text-zinc-400 text-sm mb-1">≈ R$ 26,58/mês</p>
              <p className="text-[#1a6aad] text-sm font-bold mb-7">Economize R$ 160 por ano</p>
              <ul className="space-y-3 mb-8 flex-1">
                {planItems.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-zinc-600">
                    <Check dark />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/registro"
                className="block text-center bg-[#0f2d4a] text-white font-bold py-4 rounded-2xl hover:bg-[#1a3d5c] transition-all shadow text-base"
              >
                Assinar anual
              </Link>
            </div>

          </div>

          <p className="text-center text-zinc-400 text-xs mt-8">
            Pagamento seguro · Acesso imediato após confirmação
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-2xl mx-auto px-6 py-14 sm:py-20">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0f2d4a]">Dúvidas frequentes</h2>
        </div>
        <div className="space-y-4">
          {faqs.map(({ q, a }) => (
            <div key={q} className="bg-white border border-zinc-200 rounded-2xl p-6">
              <p className="font-bold text-[#0f2d4a] mb-2">{q}</p>
              <p className="text-zinc-500 text-sm leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="bg-[#0f2d4a] py-14 sm:py-20 px-6 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-4">
            Pronto para dar o próximo passo?
          </h2>
          <p className="text-[#9ec4de] mb-8 leading-relaxed">
            Junte-se aos mais de 900 alunos que já estão atendendo com mais segurança e efetividade.
          </p>
          <a
            href="#planos"
            className="inline-flex items-center gap-2 bg-[#3db8d4] hover:bg-[#2fa8c4] text-[#0f2d4a] font-bold px-10 py-4 rounded-xl transition-all shadow-lg text-lg"
          >
            Escolher meu plano
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0f2d4a] border-t border-white/10 text-white">
        <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo variant="light" />
          <div className="flex gap-6 text-sm text-[#9ec4de]">
            <Link href="/termos" className="hover:text-white transition-colors">Termos de Uso</Link>
            <Link href="/privacidade" className="hover:text-white transition-colors">Privacidade</Link>
          </div>
          <p className="text-xs text-[#5a8caa]">© {new Date().getFullYear()} Rotina Clínica</p>
        </div>
      </footer>
    </main>
  );
}
