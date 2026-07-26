export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { hasAccess } from "@/lib/entitlements";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import LessonPlayer from "./lesson-player";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string; lessonId: string }>;
}) {
  const { slug, lessonId } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    include: {
      module: {
        include: {
          product: {
            include: {
              modules: {
                orderBy: { position: "asc" },
                include: { lessons: { orderBy: { position: "asc" } } },
              },
            },
          },
        },
      },
    },
  });

  if (!lesson || lesson.module.product.slug !== slug) notFound();

  if (!lesson.freePreview) {
    const entitled = await hasAccess(session.user.id, lesson.module.productId);
    if (!entitled) redirect(`/produtos/${slug}`);
  }

  const product = lesson.module.product;

  const allLessons = product.modules.flatMap((m) => m.lessons);
  const currentIndex = allLessons.findIndex((l) => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  return (
    <div className="min-h-screen flex flex-col bg-zinc-900">
      <header className="bg-zinc-900 border-b border-zinc-800 text-white px-6 py-4 flex items-center justify-between">
        <Link href={`/curso/${slug}`} className="text-sm text-zinc-400 hover:text-white">
          ← {product.title}
        </Link>
        <span className="text-sm text-zinc-400">{session.user.name}</span>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-72 bg-zinc-900 border-r border-zinc-800 p-6 overflow-y-auto hidden lg:block">
          <nav className="space-y-4">
            {product.modules.map((mod) => (
              <div key={mod.id}>
                <p className="font-medium text-sm text-zinc-400 mb-2">{mod.title}</p>
                <ul className="space-y-1">
                  {mod.lessons.map((l) => (
                    <li key={l.id}>
                      <Link
                        href={`/curso/${slug}/aula/${l.id}`}
                        className={`block text-sm px-3 py-1.5 rounded-lg transition-colors ${
                          l.id === lessonId
                            ? "bg-violet-600 text-white"
                            : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                        }`}
                      >
                        {l.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        {/* Player */}
        <main className="flex-1 flex flex-col">
          {lesson.muxPlaybackId ? (
            <LessonPlayer lessonId={lesson.id} title={lesson.title} />
          ) : (
            <div className="flex-1 flex items-center justify-center text-zinc-500">
              Vídeo não disponível ainda.
            </div>
          )}
          <div className="flex items-center justify-between px-6 py-4 bg-zinc-900 border-t border-zinc-800">
            {prevLesson ? (
              <Link
                href={`/curso/${slug}/aula/${prevLesson.id}`}
                className="text-sm text-zinc-400 hover:text-white transition-colors"
              >
                ← Aula anterior
              </Link>
            ) : (
              <span />
            )}
            <span className="text-xs text-zinc-600">
              {currentIndex + 1} / {allLessons.length}
            </span>
            {nextLesson ? (
              <Link
                href={`/curso/${slug}/aula/${nextLesson.id}`}
                className="text-sm bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors"
              >
                Próxima aula →
              </Link>
            ) : (
              <Link
                href={`/curso/${slug}`}
                className="text-sm bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Concluir curso ✓
              </Link>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
