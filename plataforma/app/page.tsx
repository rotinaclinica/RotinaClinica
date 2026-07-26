export const dynamic = "force-dynamic";

import Link from "next/link";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/format";

export default async function HomePage() {
  let products: Awaited<ReturnType<typeof db.product.findMany>> = [];
  try {
    products = await db.product.findMany({
      where: { active: true },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    // Banco não configurado ainda — mostra estado vazio
  }

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="bg-zinc-900 text-white py-24 px-6 text-center">
        <h1 className="text-4xl font-bold mb-4">Aprenda e transforme sua vida</h1>
        <p className="text-zinc-400 text-lg mb-8 max-w-xl mx-auto">
          Cursos online e materiais digitais para você evoluir no seu ritmo.
        </p>
        <Link
          href="#produtos"
          className="inline-block bg-violet-600 hover:bg-violet-700 text-white px-8 py-3 rounded-full font-semibold transition-colors"
        >
          Ver produtos
        </Link>
      </section>

      {/* Produtos */}
      <section id="produtos" className="max-w-6xl mx-auto py-20 px-6">
        <h2 className="text-2xl font-bold mb-10 text-center">Nossos Produtos</h2>
        {products.length === 0 ? (
          <p className="text-center text-zinc-500">Nenhum produto disponível ainda.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/produtos/${product.slug}`}
                className="group border border-zinc-200 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow"
              >
                {product.coverImage ? (
                  <img
                    src={product.coverImage}
                    alt={product.title}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-violet-100 flex items-center justify-center">
                    <span className="text-violet-400 text-5xl">
                      {product.type === "COURSE" ? "🎓" : "📄"}
                    </span>
                  </div>
                )}
                <div className="p-5">
                  <span className="text-xs font-medium text-violet-600 uppercase tracking-wide">
                    {product.type === "COURSE" ? "Curso" : "Download"}
                  </span>
                  <h3 className="font-semibold text-lg mt-1 mb-2 group-hover:text-violet-700 transition-colors">
                    {product.title}
                  </h3>
                  <p className="text-zinc-500 text-sm line-clamp-2">{product.description}</p>
                  <p className="mt-4 text-xl font-bold text-zinc-900">
                    {formatPrice(product.priceCents, product.currency)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 py-8 text-center text-sm text-zinc-500">
        <p>
          <Link href="/termos" className="hover:underline">Termos de Uso</Link>
          {" · "}
          <Link href="/privacidade" className="hover:underline">Privacidade</Link>
        </p>
      </footer>
    </main>
  );
}
