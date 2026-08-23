export const dynamic = "force-dynamic";

import Link from "next/link";
import { db } from "@/lib/db";
import { Logo } from "@/app/components/Navbar";
import CopyEmailButton from "@/app/components/CopyEmailButton";
import Navbar from "@/app/components/Navbar";

export default async function HomePage() {
  let products: Awaited<ReturnType<typeof db.product.findMany>> = [];
  try {
    products = await db.product.findMany({
      where: { active: true },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    // banco não configurado
  }

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden min-h-[540px] md:min-h-[600px] flex items-center">
        <img
          src="/images/turma.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a1e30]/95 via-[#0f2d4a]/80 to-[#0f2d4a]/30" />
        <div className="relative max-w-7xl mx-auto px-6 py-14 md:py-20 w-full">
          <div className="max-w-xl">
            <h1 className="text-4xl md:text-5xl lg:text-[3.25rem] font-extrabold text-white leading-tight mb-5">
              Com você em toda a sua{" "}
              <span className="text-[#3db8d4]">trajetória médica</span>
            </h1>
            <p className="text-[#b8d8ee] text-lg leading-relaxed mb-6">
              O <span className="font-semibold text-white">Rotina Clínica</span> acompanha você desde o internato, passando por UBS, plantões em UPA e no PS, até os plantões na emergência.
            </p>
            <ul className="space-y-3 mb-8">
              {[
                "Condutas práticas, baseadas em evidências.",
                "Conteúdo em segundos na palma da sua mão, em qualquer lugar.",
                "Junte-se aos nossos 900+ alunos e adquira segurança e efetividade nos seus atendimentos.",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-[#b8d8ee] text-base">
                  <span className="mt-1 text-[#3db8d4] flex-shrink-0">›</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/assinatura"
                className="inline-flex items-center gap-2 bg-[#3db8d4] hover:bg-[#2fa8c4] text-[#0f2d4a] font-bold px-10 py-4 rounded-xl transition-all shadow-lg text-lg"
              >
                Começar agora
                <svg width="18" height="18" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </Link>
              <Link
                href="/tour"
                className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 border-2 border-white/70 hover:border-white text-white font-bold px-8 py-4 rounded-xl transition-all text-lg backdrop-blur-sm"
              >
                Conhecer a plataforma
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              </Link>
            </div>
            <p className="mt-4 text-base text-[#9ec4de]">
              Já tem conta?{" "}
              <Link href="/login" className="text-[#3db8d4] font-bold hover:underline">
                Entrar →
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* O que você recebe */}
      <section className="py-16 px-6 bg-[#f0f7ff] dark:bg-[#0a1628]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-[#1a6aad] text-sm font-semibold tracking-widest uppercase">Tudo em um só lugar</span>
            <h2 className="text-3xl font-extrabold text-[#0f2d4a] dark:text-[#e8edf5] mt-2">O que está incluído na assinatura</h2>
            <p className="text-zinc-500 dark:text-[#6a8fa5] mt-2 text-base">Uma plataforma completa e projetada para te acompanhar em todos os cenários.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { emoji: "📋", titulo: "Condutas Clínicas", desc: "Prescrições e condutas prontas para PS, UPA, UBS, ambulatório, emergência e internação." },
              { emoji: "🧮", titulo: "Calculadoras Clínicas", desc: "Calculadoras e Escores validados para sua prática clínica." },
              { emoji: "🩺", titulo: "Casos Clínicos", desc: "Casos clínicos em vídeos e séries visuais com raciocínio e condutas detalhadas para você." },
              { emoji: "📝", titulo: "Modelos de Evolução", desc: "Modelos prontos para agilizar seu atendimento." },
              { emoji: "📄", titulo: "Ebooks e Aulas", desc: "Conteúdo prático em PDF, disponível para download e leitura a qualquer hora." },
              { emoji: "🎓", titulo: "Cursos e Aulas Online", desc: "Destravando o Plantão, conteúdos da parceira Docstage e muito mais..." },
              { emoji: "✅", titulo: "Compromisso com a Qualidade", desc: "Conteúdo produzido por especialistas em clínica médica, baseado nas melhores evidências disponíveis, com atualizações e melhorias contínuas na plataforma." },
              { emoji: "📱", titulo: "Acesso em qualquer lugar", desc: "Disponível no celular, tablet ou computador — acesse sua conta a qualquer hora, de onde estiver." },
            ].map((item) => (
              <div key={item.titulo} className="flex gap-4 bg-white dark:bg-[#101c30] rounded-2xl p-5 shadow-sm border border-zinc-100 dark:border-white/8">
                <span className="text-2xl flex-shrink-0 mt-0.5">{item.emoji}</span>
                <div>
                  <p className="font-bold text-[#0f2d4a] dark:text-[#e8edf5] text-sm">{item.titulo}</p>
                  <p className="text-zinc-500 dark:text-[#6a8fa5] text-sm mt-0.5 leading-snug">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <a href="/assinatura" className="inline-flex items-center gap-2 bg-[#1a6aad] hover:bg-[#155d96] text-white font-bold px-8 py-3.5 rounded-xl transition-colors text-sm">
              Ver planos e assinar
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>
          </div>
        </div>
      </section>

      {/* Credenciais e diferenciais */}
      <section className="max-w-5xl mx-auto py-16 px-6">
        <div className="text-center mb-10">
          <span className="text-[#1a6aad] text-sm font-semibold tracking-widest uppercase">Por que o Rotina Clínica?</span>
          <h2 className="text-3xl font-extrabold text-[#0f2d4a] mt-2">Uma comunidade que cresce com você</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Card 1 — Instagram + YouTube */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 hover:shadow-lg hover:border-[#3db8d4] transition-all">
            <div className="flex gap-3 mb-4">
              <a href="https://instagram.com/rotina.clinica" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#833ab4] via-[#e1306c] to-[#fcb045] flex items-center justify-center hover:opacity-80 transition-opacity">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 2H7a5 5 0 0 0-5 5v10a5 5 0 0 0 5 5h10a5 5 0 0 0 5-5V7a5 5 0 0 0-5-5Z"/><circle cx="12" cy="12" r="3"/><circle cx="17.5" cy="6.5" r="1" fill="white" stroke="none"/></svg>
              </a>
              <a href="https://www.youtube.com/@RotinaClinica" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-xl bg-[#ff0000] flex items-center justify-center hover:opacity-80 transition-opacity">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8Z"/><polygon points="9.75,15.5 15.5,12 9.75,8.5" fill="#ff0000"/></svg>
              </a>
              <a href="https://www.tiktok.com/@rotina.clinica" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-xl bg-[#010101] flex items-center justify-center hover:opacity-80 transition-opacity">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06Z"/></svg>
              </a>
            </div>
            <h3 className="text-lg font-extrabold text-[#0f2d4a] mb-2">+50k no Instagram<br />+3k no Youtube</h3>
            <p className="text-zinc-500 text-sm leading-relaxed">Uma comunidade ativa de médicos e estudantes que acompanham conteúdo diário de qualidade. Siga e faça parte.</p>
          </div>

          {/* Card 2 — Fundado em 2023 */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 hover:shadow-lg hover:border-[#3db8d4] transition-all">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1a6aad] to-[#0f2d4a] flex items-center justify-center mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5-10-5Z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
            </div>
            <h3 className="text-lg font-extrabold text-[#0f2d4a] mb-2">Fundado em 2023</h3>
            <p className="text-zinc-500 text-sm leading-relaxed">Desde 2023 formando estudantes, médicas e médicos mais preparados! Mais de 127 alunos já passaram pelos nossos cursos presenciais.</p>
          </div>

          {/* Card 3 — Especialistas */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 hover:shadow-lg hover:border-[#3db8d4] transition-all">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#3db8d4] to-[#1a6aad] flex items-center justify-center mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a5 5 0 1 0 0 10A5 5 0 0 0 12 2Z"/><path d="M2 20c0-4 4-7 10-7s10 3 10 7"/></svg>
            </div>
            <h3 className="text-lg font-extrabold text-[#0f2d4a] mb-2">Conteúdo produzido por especialistas</h3>
            <p className="text-zinc-500 text-sm leading-relaxed">Todo o conteúdo é desenvolvido por especialistas em clínica médica, com foco em aplicação prática e segurança no atendimento.</p>
          </div>

          {/* Card 4 — Conteúdo por cenário */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 hover:shadow-lg hover:border-[#3db8d4] transition-all">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1a6aad] to-[#0f2d4a] flex items-center justify-center mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            </div>
            <h3 className="text-lg font-extrabold text-[#0f2d4a] mb-2">Conteúdo adaptado para sua realidade</h3>
            <p className="text-zinc-500 text-sm leading-relaxed">Do internato à emergência: conteúdo pensado para quem atua na UBS, PS, UPA e emergência. Discussão de casos clínicos reais toda semana.</p>
          </div>
        </div>
      </section>

      {/* Produtos do banco (seção dinâmica) — removida da home */}
      {false && products.length > 0 && (
        <section id="produtos" className="max-w-7xl mx-auto py-20 px-6">
          <div className="text-center mb-12">
            <span className="text-[#1a6aad] text-sm font-semibold tracking-widest uppercase">
              Nossos produtos
            </span>
            <h2 className="text-3xl font-extrabold text-[#0f2d4a] mt-2">
              Escolha seu próximo passo
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/produtos/${product.slug}`}
                className="group bg-white border border-zinc-200 rounded-2xl overflow-hidden hover:shadow-xl hover:border-[#3db8d4] transition-all"
              >
                {product.coverImage ? (
                  <img src={product.coverImage} alt={product.title} className="w-full h-48 object-cover" />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-[#0f2d4a] to-[#1a6aad] flex items-center justify-center">
                    <span className="text-white text-5xl opacity-60">
                      {product.type === "COURSE" ? "🎓" : "📄"}
                    </span>
                  </div>
                )}
                <div className="p-5">
                  <h3 className="font-bold text-[#0f2d4a] text-lg mt-2 mb-1 group-hover:text-[#1a6aad] transition-colors line-clamp-2">
                    {product.title}
                  </h3>
                  <p className="text-zinc-500 text-sm line-clamp-2">{product.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Redes sociais */}
      <section className="py-14 sm:py-20 px-6 bg-[#f7fafc]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-[#1a6aad] text-sm font-semibold tracking-widest uppercase">Nossas redes</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0f2d4a] mt-2">Acompanhe o Rotina Clínica</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">

            {/* Instagram */}
            <a
              href="https://instagram.com/rotina.clinica"
              target="_blank"
              rel="noopener noreferrer"
              className="relative overflow-hidden rounded-3xl p-7 flex flex-col items-center text-center group bg-gradient-to-br from-[#6a0dad] via-[#e1306c] to-[#fcb045] hover:scale-[1.02] transition-transform shadow-lg"
            >
              <div className="w-14 h-14 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center mb-4">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 2H7a5 5 0 0 0-5 5v10a5 5 0 0 0 5 5h10a5 5 0 0 0 5-5V7a5 5 0 0 0-5-5Z"/>
                  <circle cx="12" cy="12" r="3"/>
                  <circle cx="17.5" cy="6.5" r="1.2" fill="white" stroke="none"/>
                </svg>
              </div>
              <p className="text-white/70 text-xs font-bold tracking-widest uppercase mb-1">Instagram</p>
              <h3 className="text-2xl font-extrabold text-white mb-1">@rotina.clinica</h3>
              <p className="text-white/80 text-sm mb-4">Segurança no plantão começa aqui.</p>
              <span className="text-white/60 text-xs mb-5">+50 mil seguidores</span>
              <span className="inline-flex items-center gap-2 bg-white text-[#c13584] font-bold px-5 py-2.5 rounded-xl text-sm shadow group-hover:bg-white/90 transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 2H7a5 5 0 0 0-5 5v10a5 5 0 0 0 5 5h10a5 5 0 0 0 5-5V7a5 5 0 0 0-5-5Z"/>
                  <circle cx="12" cy="12" r="3"/>
                  <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none"/>
                </svg>
                Seguir
              </span>
            </a>

            {/* YouTube */}
            <a
              href="https://www.youtube.com/@RotinaClinica"
              target="_blank"
              rel="noopener noreferrer"
              className="relative overflow-hidden rounded-3xl p-7 flex flex-col items-center text-center group bg-gradient-to-br from-[#c4302b] to-[#ff0000] hover:scale-[1.02] transition-transform shadow-lg"
            >
              <div className="w-14 h-14 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center mb-4">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                  <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8Z"/>
                  <polygon points="9.75,15.5 15.5,12 9.75,8.5" fill="#c4302b"/>
                </svg>
              </div>
              <p className="text-white/70 text-xs font-bold tracking-widest uppercase mb-1">YouTube</p>
              <h3 className="text-2xl font-extrabold text-white mb-1">@RotinaClinica</h3>
              <p className="text-white/80 text-sm mb-4">Videoaulas e casos clínicos em vídeo.</p>
              <span className="text-white/60 text-xs mb-5">+3 mil inscritos</span>
              <span className="inline-flex items-center gap-2 bg-white text-[#c4302b] font-bold px-5 py-2.5 rounded-xl text-sm shadow group-hover:bg-white/90 transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8Z"/>
                  <polygon points="9.75,15.5 15.5,12 9.75,8.5" fill="white"/>
                </svg>
                Inscrever-se
              </span>
            </a>

            {/* TikTok */}
            <a
              href="https://www.tiktok.com/@rotina.clinica"
              target="_blank"
              rel="noopener noreferrer"
              className="relative overflow-hidden rounded-3xl p-7 flex flex-col items-center text-center group bg-gradient-to-br from-[#010101] to-[#1a1a2e] hover:scale-[1.02] transition-transform shadow-lg"
            >
              <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mb-4">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06Z"/>
                </svg>
              </div>
              <p className="text-white/60 text-xs font-bold tracking-widest uppercase mb-1">TikTok</p>
              <h3 className="text-2xl font-extrabold text-white mb-1">@rotina.clinica</h3>
              <p className="text-white/70 text-sm mb-4">Conteúdo clínico em formato curto.</p>
              <span className="text-white/40 text-xs mb-5">&nbsp;</span>
              <span className="inline-flex items-center gap-2 bg-white text-[#010101] font-bold px-5 py-2.5 rounded-xl text-sm shadow group-hover:bg-white/90 transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06Z"/>
                </svg>
                Seguir
              </span>
            </a>

          </div>
        </div>
      </section>

      {/* Contato */}
      <section className="py-16 bg-[#f0f6fb]">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-extrabold text-[#0f2d4a] mb-3">Dúvidas? Fale conosco</h2>
          <p className="text-[#4a6fa5] mb-6">Nossa equipe está disponível para ajudar com suporte, dúvidas sobre a plataforma ou qualquer outra questão.</p>
          <CopyEmailButton email="contato@rotinaclinica.com" />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0f2d4a] text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <Logo variant="light" />
            <div className="flex flex-col md:flex-row items-center gap-4 text-sm text-[#9ec4de]">
              <a href="mailto:contato@rotinaclinica.com" className="hover:text-white transition-colors">contato@rotinaclinica.com</a>
              <span className="hidden md:inline text-white/20">|</span>
              <Link href="/termos" className="hover:text-white transition-colors">Termos de Uso</Link>
              <Link href="/privacidade" className="hover:text-white transition-colors">Privacidade</Link>
            </div>
          </div>
          <div className="border-t border-white/10 mt-8 pt-6 text-center text-xs text-[#5a8caa]">
            © {new Date().getFullYear()} Rotina Clínica — Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </main>
  );
}
