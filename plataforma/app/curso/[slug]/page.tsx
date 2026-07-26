export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { hasAccess } from "@/lib/entitlements";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await db.product.findUnique({ where: { slug, active: true } });
  return { title: product?.title ?? "Curso" };
}

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const product = await db.product.findUnique({
    where: { slug, active: true, type: "COURSE" },
    include: {
      modules: {
        orderBy: { position: "asc" },
        include: { lessons: { orderBy: { position: "asc" } } },
      },
    },
  });

  if (!product) notFound();

  const entitled = await hasAccess(session.user.id, product.id);
  if (!entitled) redirect(`/produtos/${slug}`);

  const firstLesson = product.modules[0]?.lessons[0];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-zinc-900 text-white px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="text-sm text-zinc-400 hover:text-white">
          ← Minha Área
        </Link>
        <span className="font-semibold">{product.title}</span>
        <span className="text-sm text-zinc-400">{session.user.name}</span>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-72 bg-zinc-50 border-r border-zinc-200 p-6 overflow-y-auto">
          <h2 className="font-semibold mb-4 text-sm uppercase tracking-wide text-zinc-500">
            Conteúdo
          </h2>
          <nav className="space-y-4">
            {product.modules.map((mod) => (
              <div key={mod.id}>
                <p className="font-medium text-sm mb-2">{mod.title}</p>
                <ul className="space-y-1">
                  {mod.lessons.map((lesson) => (
                    <li key={lesson.id}>
                      <Link
                        href={`/curso/${slug}/aula/${lesson.id}`}
                        className="block text-sm text-zinc-600 hover:text-violet-700 hover:bg-violet-50 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        {lesson.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        {/* Main */}
        <main className="flex-1 p-10 flex flex-col items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Bem-vindo ao curso!</h1>
            <p className="text-zinc-500 mb-6">Selecione uma aula no menu ao lado para começar.</p>
            {firstLesson && (
              <Link
                href={`/curso/${slug}/aula/${firstLesson.id}`}
                className="inline-block bg-violet-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-violet-700 transition-colors"
              >
                Começar primeira aula
              </Link>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
