export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { hasAccess } from "@/lib/entitlements";
import { formatPrice } from "@/lib/format";
import { Logo } from "@/app/components/Navbar";
import EbookCheckoutClient from "./EbookCheckoutClient";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await db.product.findUnique({ where: { slug, type: "DOWNLOAD", active: true }, select: { title: true } });
  return { title: product ? `${product.title} · Comprar` : "Ebook não encontrado" };
}

export default async function EbookCheckoutPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const product = await db.product.findUnique({
    where: { slug, type: "DOWNLOAD", active: true },
    select: { id: true, title: true, description: true, priceCents: true, currency: true, coverImage: true },
  });

  if (!product) notFound();

  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/checkout/ebook/${slug}`);
  }

  const [userProfile, alreadyOwns] = await Promise.all([
    db.user.findUnique({ where: { id: session.user.id }, select: { cpf: true, phone: true } }),
    hasAccess(session.user.id, product.id),
  ]);

  if (alreadyOwns) redirect("/dashboard/meus-ebooks");

  const maxInstallments = product.priceCents >= 9000 ? 6 : product.priceCents >= 4000 ? 3 : 1;

  return (
    <div className="min-h-screen bg-[#f0f4f8] dark:bg-[#0c1117]">
      {/* Header */}
      <header className="bg-[#0f2d4a] py-4 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/"><Logo variant="light" /></Link>
          <Link href="/produtos" className="text-sm text-[#9ec4de] hover:text-white transition-colors">
            ← Voltar aos produtos
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">

          {/* Coluna esquerda — produto */}
          <div className="space-y-6">
            {product.coverImage && (
              <div className="bg-white dark:bg-[#131c2e] rounded-2xl border border-zinc-200 dark:border-white/8 p-6 flex items-center justify-center">
                <img src={product.coverImage} alt={product.title} className="max-h-72 w-auto object-contain" />
              </div>
            )}

            <div>
              <span className="inline-block bg-[#0f2d4a] text-white text-xs font-bold px-3 py-1 rounded-full mb-3">E-book</span>
              <h1 className="text-2xl md:text-3xl font-extrabold text-[#0f2d4a] dark:text-white">{product.title}</h1>
              <p className="text-[#334e68] dark:text-[#8fa8bd] mt-2 leading-relaxed">{product.description}</p>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[#0f2d4a] dark:text-white">{formatPrice(product.priceCents, product.currency)}</span>
              {maxInstallments > 1 && (
                <span className="text-sm text-[#6a8fa5]">
                  ou {maxInstallments}x de {formatPrice(Math.ceil(product.priceCents / maxInstallments), product.currency)}
                </span>
              )}
            </div>

            {/* Cross-sell assinatura */}
            <div className="bg-gradient-to-br from-[#0f2d4a] to-[#1a4a6e] rounded-2xl p-5 text-white">
              <div className="flex items-center gap-2 mb-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#32bcad" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                </svg>
                <span className="text-sm font-bold text-[#32bcad] uppercase tracking-wider">Dica</span>
              </div>
              <p className="text-sm font-bold mb-1">Assine e tenha acesso a tudo!</p>
              <p className="text-xs text-white/80 leading-relaxed mb-3">
                Com a assinatura do Rotina Clínica, você tem acesso a este e todos os outros ebooks,
                além de prescrições, calculadoras, cursos, casos clínicos e muito mais
                — por apenas <strong className="text-[#32bcad]">R$ 33,30/mês</strong> no plano anual.
              </p>
              <Link
                href="/assinatura"
                className="inline-flex items-center gap-2 bg-[#32bcad] hover:bg-[#28a89a] text-[#0f2d4a] font-bold text-sm px-5 py-2.5 rounded-xl transition-colors"
              >
                Ver planos de assinatura →
              </Link>
            </div>

            {/* O que inclui */}
            <div className="bg-white dark:bg-[#131c2e] rounded-2xl border border-zinc-200 dark:border-white/8 p-5">
              <h3 className="text-sm font-bold text-[#0f2d4a] dark:text-white mb-3">O que você recebe:</h3>
              <ul className="space-y-2">
                {[
                  "Ebook completo em PDF para download",
                  "Acesso permanente — baixe quando quiser",
                  "Nota fiscal automática",
                  "Garantia de 7 dias",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-[#334e68] dark:text-[#8fa8bd]">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#32bcad" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Coluna direita — pagamento */}
          <div className="md:sticky md:top-8">
            <div className="bg-white dark:bg-[#131c2e] rounded-2xl border border-zinc-200 dark:border-white/8 shadow-sm overflow-hidden">
              <div className="bg-[#0f2d4a] px-6 py-4">
                <p className="text-white text-sm font-bold">Finalizar compra</p>
                <p className="text-[#9ec4de] text-xs mt-0.5">
                  Logado como {session.user.email}
                </p>
              </div>
              <div className="px-6 py-6">
                <EbookCheckoutClient
                  productId={product.id}
                  priceCents={product.priceCents}
                  currency={product.currency}
                  maxInstallments={maxInstallments}
                  userCpf={userProfile?.cpf}
                  userPhone={userProfile?.phone}
                />
              </div>
            </div>

            {/* Selos de confiança */}
            <div className="flex items-center justify-center gap-4 mt-4 px-2">
              <span className="flex items-center gap-1.5 text-[11px] text-[#6a8fa5] font-medium">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0f2d4a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                Pagamento seguro
              </span>
              <span className="text-zinc-300 dark:text-zinc-600">|</span>
              <span className="flex items-center gap-1.5 text-[11px] text-[#6a8fa5] font-medium">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#32bcad" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                Download imediato
              </span>
              <span className="text-zinc-300 dark:text-zinc-600">|</span>
              <span className="flex items-center gap-1.5 text-[11px] text-[#6a8fa5] font-medium">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#32bcad" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
                7 dias de garantia
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#0f2d4a] text-white mt-12">
        <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <Logo variant="light" />
          <p className="text-xs text-[#5a8caa]">
            © {new Date().getFullYear()} Rotina Clínica — Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
