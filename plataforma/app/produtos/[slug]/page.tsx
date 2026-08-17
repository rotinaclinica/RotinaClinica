export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { hasAccess } from "@/lib/entitlements";
import { formatPrice } from "@/lib/format";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import CheckoutButtons from "./checkout-buttons";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await db.product.findUnique({ where: { slug, active: true } });
  return { title: product?.title ?? "Produto" };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await auth();

  const product = await db.product.findUnique({
    where: { slug, active: true },
    include: { modules: { include: { lessons: true }, orderBy: { position: "asc" } } },
  });

  if (!product) notFound();

  const [alreadyOwned, userProfile] = await Promise.all([
    session?.user?.id ? hasAccess(session.user.id, product.id) : Promise.resolve(false),
    session?.user?.id
      ? db.user.findUnique({ where: { id: session.user.id }, select: { cpf: true, phone: true } })
      : Promise.resolve(null),
  ]);

  return (
    <main className="min-h-screen">
      <header className="bg-white border-b border-zinc-200 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg">Plataforma</Link>
        {session ? (
          <Link href="/dashboard" className="text-sm text-zinc-600 hover:text-zinc-900">
            Minha Área
          </Link>
        ) : (
          <Link href="/login" className="text-sm text-violet-600 font-semibold hover:underline">
            Entrar
          </Link>
        )}
      </header>

      <div className="max-w-4xl mx-auto py-16 px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="md:col-span-2">
            <span className="text-xs font-medium text-violet-600 uppercase tracking-wide">
              {product.type === "COURSE" ? "Curso Online" : "Produto Digital"}
            </span>
            <h1 className="text-3xl font-bold mt-2 mb-4">{product.title}</h1>
            <p className="text-zinc-600 leading-relaxed whitespace-pre-wrap">
              {product.description}
            </p>

            {product.type === "COURSE" && product.modules.length > 0 && (
              <div className="mt-10">
                <h2 className="font-semibold text-lg mb-4">Conteúdo do curso</h2>
                <div className="space-y-3">
                  {product.modules.map((mod) => (
                    <div key={mod.id} className="border border-zinc-200 rounded-xl p-4">
                      <h3 className="font-medium mb-2">{mod.title}</h3>
                      <ul className="space-y-1">
                        {mod.lessons.map((lesson) => (
                          <li key={lesson.id} className="flex items-center gap-2 text-sm text-zinc-600">
                            <span>{lesson.freePreview ? "▶️" : "🔒"}</span>
                            {lesson.title}
                            {lesson.freePreview && (
                              <span className="text-xs text-violet-500 font-medium">(prévia)</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="md:col-span-1">
            <div className="bg-white border border-zinc-200 rounded-2xl p-6 sticky top-6">
              {product.coverImage && (
                <img
                  src={product.coverImage}
                  alt={product.title}
                  className="w-full h-40 object-cover rounded-xl mb-4"
                />
              )}
              <p className="text-3xl font-bold mb-6">
                {formatPrice(product.priceCents, product.currency)}
              </p>

              {alreadyOwned ? (
                <Link
                  href={product.type === "COURSE" ? `/curso/${product.slug}` : `/api/downloads/${product.id}`}
                  className="block text-center w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors"
                >
                  {product.type === "COURSE" ? "Acessar curso" : "Baixar arquivo"}
                </Link>
              ) : (
                <CheckoutButtons
                  productId={product.id}
                  isLoggedIn={!!session}
                  userCpf={userProfile?.cpf}
                  userPhone={userProfile?.phone}
                />
              )}

              <p className="text-xs text-zinc-400 text-center mt-3">
                Compra segura com Stripe ou Mercado Pago
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
