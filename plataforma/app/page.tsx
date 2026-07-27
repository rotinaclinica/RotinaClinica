export const dynamic = "force-dynamic";

import Link from "next/link";
import { db } from "@/lib/db";
import { Logo } from "@/app/components/Navbar";
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
            <Link
              href="/assinatura"
              className="inline-flex items-center gap-2 bg-[#3db8d4] hover:bg-[#2fa8c4] text-[#0f2d4a] font-bold px-10 py-4 rounded-xl transition-all shadow-lg text-lg"
            >
              Seja nosso aluno
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </Link>
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
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#3db8d4] to-[#1a6aad] flex items-center justify-center mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 2H7a5 5 0 0 0-5 5v10a5 5 0 0 0 5 5h10a5 5 0 0 0 5-5V7a5 5 0 0 0-5-5Z"/><circle cx="12" cy="12" r="3"/><circle cx="17.5" cy="6.5" r="1" fill="white" stroke="none"/></svg>
            </div>
            <h3 className="text-lg font-extrabold text-[#0f2d4a] mb-2">+50k no Instagram · +3k no YouTube</h3>
            <p className="text-zinc-500 text-sm leading-relaxed">Uma comunidade ativa de médicos e estudantes que acompanham conteúdo diário de qualidade. Siga e faça parte.</p>
          </div>

          {/* Card 2 — Fundado em 2023 */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 hover:shadow-lg hover:border-[#3db8d4] transition-all">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1a6aad] to-[#0f2d4a] flex items-center justify-center mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5-10-5Z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
            </div>
            <h3 className="text-lg font-extrabold text-[#0f2d4a] mb-2">Fundado em 2023 · +127 alunos presenciais</h3>
            <p className="text-zinc-500 text-sm leading-relaxed">Desde 2023 formando médicos mais seguros e efetivos. Mais de 127 alunos já passaram pelos nossos cursos presenciais.</p>
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

      {/* Footer */}
      <footer className="bg-[#0f2d4a] text-white mt-16">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <Logo variant="light" />
            <div className="flex gap-6 text-sm text-[#9ec4de]">
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
