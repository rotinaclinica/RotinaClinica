export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatPrice } from "@/lib/format";

export const metadata = { title: "Meus Ebooks · Rotina Clínica" };

export default async function MeusEbooksPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const enrollments = await db.enrollment.findMany({
    where: { userId: session.user.id },
    include: {
      product: {
        select: { id: true, title: true, description: true, coverImage: true, priceCents: true, currency: true, type: true },
      },
    },
    orderBy: { grantedAt: "desc" },
  });

  const ebooks = enrollments.filter((e) => e.product.type === "DOWNLOAD");

  return (
    <div className="flex-1 flex flex-col">
      <header className="bg-white dark:bg-[#131c2e] border-b border-zinc-200 dark:border-white/8 px-6 sm:px-8 py-5">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-sm text-[#1a6aad] dark:text-[#3db8d4] hover:underline">
            ← Voltar
          </Link>
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#0f2d4a] dark:text-[#e8edf5] mt-3">
          Meus Ebooks
        </h1>
        <p className="text-sm text-[#0f2d4a]/60 dark:text-[#6a8fa5] mt-0.5">
          Ebooks que você comprou. Baixe sempre que precisar.
        </p>
      </header>

      <main className="flex-1 p-6 sm:p-8">
        {ebooks.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <div className="text-5xl">📚</div>
            <h2 className="text-lg font-bold text-[#0f2d4a] dark:text-white">Nenhum ebook comprado ainda</h2>
            <p className="text-sm text-[#6a8fa5] max-w-md mx-auto">
              Quando você comprar um ebook, ele aparecerá aqui para download sempre que precisar.
            </p>
            <Link
              href="/produtos"
              className="inline-flex items-center gap-2 bg-[#0f2d4a] hover:bg-[#1a4a6e] text-white font-semibold text-sm px-6 py-3 rounded-xl transition-colors mt-2"
            >
              Ver ebooks disponíveis →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {ebooks.map((enrollment) => {
              const p = enrollment.product;
              return (
                <div
                  key={enrollment.id}
                  className="bg-white dark:bg-[#131c2e] rounded-2xl border border-zinc-200 dark:border-white/8 overflow-hidden flex flex-col"
                >
                  {p.coverImage && (
                    <div className="bg-zinc-50 dark:bg-[#0d1525] flex items-center justify-center h-48 overflow-hidden border-b border-zinc-100 dark:border-white/5">
                      <img src={p.coverImage} alt={p.title} className="h-full w-full object-contain p-4" />
                    </div>
                  )}
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-bold text-[#0f2d4a] dark:text-white text-base mb-1">{p.title}</h3>
                    <p className="text-[#334e68] dark:text-[#8fa8bd] text-sm flex-1 mb-4 line-clamp-2">{p.description}</p>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs text-[#6a8fa5]">
                        Comprado em {new Date(enrollment.grantedAt).toLocaleDateString("pt-BR")}
                      </span>
                      <a
                        href={`/api/downloads/${p.id}`}
                        className="inline-flex items-center gap-2 bg-[#0f2d4a] hover:bg-[#1a4a6e] dark:bg-[#3db8d4] dark:hover:bg-[#32bcad] dark:text-[#0f2d4a] text-white font-semibold text-sm px-4 py-2 rounded-xl transition-colors"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                          <polyline points="7 10 12 15 17 10"/>
                          <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                        Baixar
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
