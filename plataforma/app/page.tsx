export const dynamic = "force-dynamic";

import Link from "next/link";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/format";
import Navbar, { Logo } from "@/app/components/Navbar";

function StethoscopeHero() {
  return (
    <svg viewBox="0 0 220 220" width="220" height="220" fill="none" aria-hidden="true" className="opacity-20">
      <defs>
        <linearGradient id="hero-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3db8d4" />
          <stop offset="100%" stopColor="#ffffff" />
        </linearGradient>
      </defs>
      <circle cx="110" cy="155" r="38" stroke="url(#hero-grad)" strokeWidth="10" />
      <circle cx="110" cy="155" r="15" fill="url(#hero-grad)" />
      <path d="M110 117 L110 80" stroke="url(#hero-grad)" strokeWidth="10" strokeLinecap="round" />
      <path d="M110 80 Q110 38 60 38" stroke="url(#hero-grad)" strokeWidth="10" fill="none" strokeLinecap="round" />
      <path d="M110 80 Q110 38 160 38" stroke="url(#hero-grad)" strokeWidth="10" fill="none" strokeLinecap="round" />
      <circle cx="60" cy="38" r="12" fill="url(#hero-grad)" />
      <circle cx="160" cy="38" r="12" fill="url(#hero-grad)" />
    </svg>
  );
}

export default async function HomePage() {
  let products: Awaited<ReturnType<typeof db.product.findMany>> = [];
  try {
    products = await db.product.findMany({
      where: { active: true },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    // banco não configurado — mostra estado vazio
  }

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="relative bg-[#0f2d4a] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f2d4a] via-[#163d61] to-[#1a6aad] opacity-100" />
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/4">
          <StethoscopeHero />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-32">
          <div className="max-w-2xl">
            <span className="inline-block text-[#3db8d4] text-sm font-semibold tracking-widest uppercase mb-4">
              Educação em saúde
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
              Eleve sua prática{" "}
              <span className="text-[#3db8d4]">clínica</span>
            </h1>
            <p className="text-[#9ec4de] text-lg md:text-xl leading-relaxed mb-10 max-w-xl">
              Cursos online e materiais digitais desenvolvidos para profissionais e estudantes da área da saúde. Aprenda no seu ritmo, com qualidade.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="#produtos"
                className="inline-flex items-center gap-2 bg-[#3db8d4] hover:bg-[#2fa8c4] text-[#0f2d4a] font-bold px-8 py-3.5 rounded-xl transition-all shadow-lg"
              >
                Ver cursos
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </Link>
              <Link
                href="/registro"
                className="inline-flex items-center gap-2 border border-white/30 hover:border-white text-white font-semibold px-8 py-3.5 rounded-xl transition-all backdrop-blur-sm"
              >
                Criar conta grátis
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Diferenciais */}
      <section className="bg-[#0a2240]">
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 sm:grid-cols-3 gap-8">
          {[
            { icon: "🎓", value: "Cursos especializados", label: "para profissionais da saúde" },
            { icon: "📱", value: "Acesso 24/7", label: "em qualquer dispositivo" },
            { icon: "🏅", value: "Conteúdo atualizado", label: "com as melhores práticas" },
          ].map((item) => (
            <div key={item.value} className="flex items-center gap-4">
              <span className="text-3xl">{item.icon}</span>
              <div>
                <p className="font-bold text-white text-sm">{item.value}</p>
                <p className="text-[#9ec4de] text-sm">{item.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Produtos */}
      <section id="produtos" className="max-w-7xl mx-auto py-20 px-6">
        <div className="text-center mb-12">
          <span className="text-[#1a6aad] text-sm font-semibold tracking-widest uppercase">
            Nossos produtos
          </span>
          <h2 className="text-3xl font-extrabold text-[#0f2d4a] mt-2">
            Escolha seu próximo passo
          </h2>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20 text-zinc-400">
            <span className="text-5xl mb-4 block">🩺</span>
            <p>Nenhum produto disponível ainda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/produtos/${product.slug}`}
                className="group bg-white border border-zinc-200 rounded-2xl overflow-hidden hover:shadow-xl hover:border-[#3db8d4] transition-all"
              >
                {product.coverImage ? (
                  <img
                    src={product.coverImage}
                    alt={product.title}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-[#0f2d4a] to-[#1a6aad] flex items-center justify-center">
                    <span className="text-white text-5xl opacity-60">
                      {product.type === "COURSE" ? "🎓" : "📄"}
                    </span>
                  </div>
                )}
                <div className="p-5">
                  <span className="inline-block text-xs font-bold text-[#1a6aad] bg-[#e8f4fc] px-2.5 py-1 rounded-full uppercase tracking-wide">
                    {product.type === "COURSE" ? "Curso" : "Download"}
                  </span>
                  <h3 className="font-bold text-[#0f2d4a] text-lg mt-2 mb-1 group-hover:text-[#1a6aad] transition-colors line-clamp-2">
                    {product.title}
                  </h3>
                  <p className="text-zinc-500 text-sm line-clamp-2">{product.description}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-2xl font-extrabold text-[#0f2d4a]">
                      {formatPrice(product.priceCents, product.currency)}
                    </p>
                    <span className="text-sm font-semibold text-[#1a6aad] group-hover:text-[#0f2d4a] transition-colors flex items-center gap-1">
                      Ver detalhes
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

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
