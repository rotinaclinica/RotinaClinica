import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import { Logo } from "@/app/components/Navbar";

const benefits = [
  { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>, title: "Condutas Clínicas", description: "Prescrições e condutas prontas para PS, UPA, UBS, ambulatório, emergência e internação." },
  { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="8" x2="16" y2="8"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="8" y1="16" x2="12" y2="16"/></svg>, title: "Calculadoras Clínicas", description: "Calculadoras e Escores validados para sua prática clínica." },
  { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2a10 10 0 0 1 0 20"/><path d="M12 2a10 10 0 0 0 0 20"/><line x1="12" y1="9" x2="12" y2="2"/><line x1="12" y1="15" x2="12" y2="22"/></svg>, title: "Casos Clínicos", description: "Casos clínicos em vídeos e séries visuais com raciocínio e condutas detalhadas." },
  { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>, title: "Modelos de Evolução", description: "Modelos prontos para agilizar seus registros no atendimento." },
  { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>, title: "Ebooks e Materiais", description: "Conteúdo prático em PDF, disponível para download e leitura a qualquer hora." },
  { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>, title: "Cursos e Aulas Online", description: "Destravando o Plantão, conteúdos das parceiras Docstage e Airtraq e muito mais." },
  { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>, title: "CID-10", description: "Busca rápida por diagnóstico ou código para atestados, laudos e AIH — tabela completa DATASUS." },
  { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>, title: "Anotações", description: "Bloco de notas clínico salvo na sua conta — acessível em qualquer dispositivo, exportável em PDF." },
];

const monthlyItems = [
  "Condutas Clínicas e prescrições prontas",
  "Casos clínicos em imagem e vídeo",
  "Cursos e aulas online",
  "Ebooks e materiais em PDF",
  "Cancele quando quiser",
];

const annualItems = [
  "Tudo do plano mensal incluído",
  "Acesso garantido por 12 meses",
  "Equivale a 2 meses grátis",
  "Economize R$ 79 por ano",
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

export default function AssinaturaPage({
  searchParams,
}: {
  searchParams?: { motivo?: string };
}) {
  const semAcesso = searchParams?.motivo === "acesso";
  return (
    <main className="min-h-screen bg-[#f7fafc]">
      <Navbar />
      {semAcesso && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 text-center">
          <p className="text-amber-800 text-sm font-medium">
            Sua conta não possui uma assinatura ativa.{" "}
            <span className="font-bold">Assine um plano para acessar a plataforma.</span>
          </p>
        </div>
      )}

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
        <div className="max-w-4xl mx-auto px-6 py-8 grid grid-cols-3 gap-6 text-center">
          {[
            { value: "900+", label: "Alunos" },
            { value: "50k+", label: "Seguidores" },
            { value: "2023", label: "Fundado em" },
          ].map(({ value, label }) => (
            <div key={label}>
              <p className="text-2xl sm:text-3xl font-extrabold text-[#0f2d4a]">{value}</p>
              <p className="text-xs sm:text-sm text-[#334e68] mt-1 font-medium">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefícios */}
      <section className="py-16 px-6 bg-[#f4f8fc] dark:bg-[#0a1628]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-[#1a6aad] text-sm font-semibold tracking-widest uppercase">O que você recebe</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0f2d4a] dark:text-[#e8edf5] mt-2">Tudo em um só lugar</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {benefits.map((b) => (
              <div key={b.title} className="flex gap-4 bg-white dark:bg-[#101c30] rounded-2xl p-5 shadow-sm border border-zinc-100 dark:border-white/[0.08]">
                <span className="text-[#1a6aad] flex-shrink-0 mt-0.5">{b.icon}</span>
                <div>
                  <p className="font-bold text-[#0f2d4a] dark:text-[#e8edf5] text-sm">{b.title}</p>
                  <p className="text-[#334e68] dark:text-[#6a8fa5] text-sm mt-0.5 leading-snug">{b.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Depoimentos */}
      <section className="bg-white border-b border-zinc-100 py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <span className="text-[#1a6aad] text-sm font-semibold tracking-widest uppercase">Quem conhece, confia</span>
            <p className="text-[#334e68] text-base mt-2">Os ebooks e cursos que fazem parte da plataforma já foram avaliados por centenas de alunos.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { nome: "Ruth", texto: "Pensado exatamente para o que é mais necessário na prática clínica — seja no pronto-socorro, na enfermaria ou nos ambulatórios. As referências são de fontes sérias e atualizadas." },
              { nome: "Felipe", texto: "Muito completo! Tem tudo que a gente precisa. O material descomplica esse assunto. Muito bom mesmo!" },
              { nome: "José", texto: "Muito bom." },
              { nome: "Leticia", texto: "Material super completo. Atualizado, claro e objetivo. Muito prático e com ótimas referências. Indispensável para os plantões, realmente facilita e otimiza os atendimentos. Excelente!!" },
            ].map(({ nome, texto }) => (
              <div key={nome} className="bg-zinc-50/60 border border-zinc-100 rounded-2xl p-5 flex flex-col gap-3">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  ))}
                </div>
                <p className="text-sm text-[#334e68] leading-relaxed flex-1">&ldquo;{texto}&rdquo;</p>
                <p className="text-xs font-bold text-[#0f2d4a] uppercase tracking-wide">{nome}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="text-xs text-zinc-400 font-medium mr-1">Também avaliaram com 5 estrelas:</span>
            {["Cinthia", "Amanda", "Marlon", "Beatriz", "Susanna", "Larissa", "Mariza"].map((nome) => (
              <span key={nome} className="inline-flex items-center gap-1 bg-zinc-50 border border-zinc-200 rounded-full px-3 py-1 text-xs text-zinc-600 font-medium">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="#f59e0b" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                {nome}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Planos */}
      <section id="planos" className="bg-[#0a1e30] py-14 sm:py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-[#3db8d4] text-sm font-semibold tracking-widest uppercase">Escolha seu plano</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">Invista na sua carreira</h2>
          </div>

          <div className="flex flex-col gap-6">

            {/* Anual — destaque principal */}
            <div className="relative bg-[#163558] rounded-3xl p-8 flex flex-col shadow-2xl ring-1 ring-white/10">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#3db8d4] text-[#0f2d4a] text-xs font-extrabold px-5 py-1.5 rounded-full uppercase tracking-wider shadow-md whitespace-nowrap">
                ⭐ Recomendado — Melhor valor
              </div>
              <p className="text-[#9ec4de] text-sm font-semibold uppercase tracking-wider mb-5 mt-2">Plano Anual</p>
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-2">
                <div>
                  <div className="flex items-end gap-1 mb-1">
                    <span className="text-zinc-400 text-lg font-semibold leading-none pb-1">R$</span>
                    <span className="text-6xl font-extrabold text-white leading-none">33</span>
                    <span className="text-white text-3xl font-extrabold leading-none pb-0.5">,30</span>
                    <span className="text-[#9ec4de] text-lg pb-1.5 ml-1">/mês</span>
                  </div>
                  <p className="text-[#9ec4de] text-sm">cobrado anualmente · R$ 400/ano</p>
                </div>
                <div className="flex flex-wrap gap-2 sm:justify-end">
                  <span className="bg-[#3db8d4]/20 border border-[#3db8d4]/40 text-[#3db8d4] text-xs font-bold px-3 py-1.5 rounded-full">
                    Economize R$ 79/ano
                  </span>
                  <span className="bg-white/10 text-white/80 text-xs font-semibold px-3 py-1.5 rounded-full">
                    2 meses grátis
                  </span>
                </div>
              </div>
              <div className="border-t border-white/10 mt-5 pt-5 mb-6">
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                  {annualItems.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-white/85">
                      <Check />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                href="/checkout?plano=anual"
                className="block text-center bg-[#3db8d4] text-[#0f2d4a] font-bold py-4 rounded-2xl hover:bg-[#2fa8c4] transition-all shadow text-base"
              >
                Assinar agora — R$ 33,30/mês
              </Link>
              <p className="flex items-center justify-center gap-2 mt-3 text-xs text-white/70">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                Garantia de 7 dias — se não gostar, devolvemos 100%
              </p>
            </div>

            {/* Mensal — secundário */}
            <div className="relative bg-white border-2 border-zinc-200 rounded-3xl p-7 flex flex-col sm:flex-row sm:items-center gap-6 shadow-sm">
              <span className="absolute -top-3 left-6 bg-zinc-700 text-white text-xs font-semibold px-3 py-1 rounded-full">Sem compromisso</span>
              <div className="sm:flex-1">
                <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-3">Plano Mensal</p>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-4xl font-extrabold text-[#0f2d4a] leading-none">R$ 39</span>
                  <span className="text-[#0f2d4a]/70 text-xl pb-0.5">,90</span>
                  <span className="text-zinc-500 text-sm pb-1 ml-1">/mês</span>
                </div>
                <p className="text-zinc-500 text-sm">cancele quando quiser</p>
              </div>
              <div className="sm:flex-1">
                <ul className="space-y-2 mb-5 sm:mb-0">
                  {monthlyItems.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-[#334e68]">
                      <Check dark />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="sm:w-44 flex-shrink-0">
                <Link
                  href="/checkout?plano=mensal"
                  className="block text-center bg-[#0f2d4a] text-white font-bold py-3.5 rounded-2xl hover:bg-[#1a3d5c] transition-all shadow text-sm"
                >
                  Assinar mensal
                </Link>
              </div>
            </div>

          </div>

          <p className="text-center text-[#9ec4de] text-xs mt-8 font-medium">
            Pagamento seguro · Acesso imediato após confirmação
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-2xl mx-auto px-6 py-14 sm:py-20">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0f2d4a]">Dúvidas frequentes</h2>
        </div>
        <div className="space-y-3">
          {faqs.map(({ q, a }) => (
            <details key={q} className="group bg-white border border-zinc-200 rounded-2xl overflow-hidden">
              <summary className="flex items-center justify-between px-6 py-5 cursor-pointer font-bold text-[#0f2d4a] list-none select-none">
                {q}
                <svg className="flex-shrink-0 ml-4 transition-transform duration-200 group-open:rotate-180" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
              </summary>
              <div className="px-6 pb-5">
                <p className="text-[#334e68] text-sm leading-relaxed">{a}</p>
              </div>
            </details>
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
          <p className="text-xs text-[#5a8caa]">© {new Date().getFullYear()} Rotina Clínica<br />Rotina Clinica Educação Médica Ltda. · CNPJ 65.937.147/0001-58</p>
        </div>
      </footer>
    </main>
  );
}
