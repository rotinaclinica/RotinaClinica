export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatPrice } from "@/lib/format";

export const metadata = { title: "Minha Área" };

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const enrollments = await db.enrollment.findMany({
    where: { userId: session.user.id },
    include: { product: { include: { modules: { include: { lessons: true } } } } },
    orderBy: { grantedAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="bg-white border-b border-zinc-200 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg">Plataforma</Link>
        <div className="flex items-center gap-4">
          <span className="text-sm text-zinc-600">{session.user.name}</span>
          <Link href="/api/auth/signout" className="text-sm text-zinc-500 hover:text-zinc-900">
            Sair
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto py-12 px-6">
        <h1 className="text-2xl font-bold mb-8">Minha Área</h1>

        {enrollments.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-zinc-500 mb-4">Você ainda não tem nenhum produto.</p>
            <Link
              href="/"
              className="inline-block bg-violet-600 text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-violet-700 transition-colors"
            >
              Ver produtos
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {enrollments.map(({ product }) => (
              <div key={product.id} className="bg-white rounded-2xl border border-zinc-200 p-6">
                <span className="text-xs font-medium text-violet-600 uppercase tracking-wide">
                  {product.type === "COURSE" ? "Curso" : "Download"}
                </span>
                <h2 className="font-semibold text-lg mt-1 mb-4">{product.title}</h2>

                {product.type === "COURSE" && (
                  <div className="mb-4">
                    <p className="text-sm text-zinc-500 mb-2">
                      {product.modules.reduce((acc, m) => acc + m.lessons.length, 0)} aulas ·{" "}
                      {product.modules.length} módulos
                    </p>
                    <Link
                      href={`/curso/${product.slug}`}
                      className="inline-block bg-violet-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-violet-700 transition-colors"
                    >
                      Continuar curso
                    </Link>
                  </div>
                )}

                {product.type === "DOWNLOAD" && (
                  <a
                    href={`/api/downloads/${product.id}`}
                    className="inline-block bg-zinc-900 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-zinc-700 transition-colors"
                  >
                    Baixar arquivo
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
