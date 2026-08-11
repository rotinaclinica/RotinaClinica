import Link from "next/link";
import { DOCSTAGE_MODULOS } from "@/lib/docstage-data";
import { notFound } from "next/navigation";

export const metadata = { title: "Docstage · Rotina Clínica" };

export default async function DocstageModuloPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const modulo = DOCSTAGE_MODULOS.find((m) => m.id === id);
  if (!modulo) notFound();

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <header className="bg-white dark:bg-[#131c2e] border-b border-zinc-200 dark:border-white/8 px-6 sm:px-8 py-6">
        <Link
          href="/dashboard/cursos/docstage"
          className="inline-flex items-center gap-1 text-xs text-zinc-400 dark:text-[#4a6a7e] hover:text-[#1a6aad] dark:hover:text-[#3db8d4] mb-3 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Docstage
        </Link>
        <h1 className="text-lg sm:text-xl font-extrabold text-[#0f2d4a] dark:text-[#e8edf5] leading-snug mb-1">
          {modulo.titulo}
        </h1>
        <p className="text-zinc-500 dark:text-[#6a8fa5] text-sm leading-relaxed">
          {modulo.descricao}
        </p>
      </header>

      <main className="flex-1 p-6 sm:p-8">
        {modulo.aulas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center max-w-xs mx-auto gap-3">
            <div className="w-16 h-16 rounded-2xl bg-[#1a2d45]/10 dark:bg-[#1a2d45] flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3db8d4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <p className="text-sm font-semibold text-[#0f2d4a] dark:text-[#d4dce8]">Em breve</p>
            <p className="text-xs text-zinc-500 dark:text-[#6a8fa5] leading-relaxed">
              As videoaulas deste módulo estão sendo preparadas.
            </p>
          </div>
        ) : (
          <div className="max-w-2xl flex flex-col gap-2">
            {modulo.aulas.map((aula, idx) => (
              <Link
                key={aula.id}
                href={`/dashboard/cursos/docstage/${id}/${aula.id}`}
                className="flex items-center gap-4 bg-white dark:bg-[#131c2e] border border-zinc-200 dark:border-white/8 rounded-xl p-3 hover:border-[#1a6aad]/40 dark:hover:border-[#3db8d4]/30 transition-colors group"
              >
                <div className="relative shrink-0 w-[120px] h-[68px] rounded-lg overflow-hidden bg-gradient-to-br from-[#0f2d4a] to-[#1a6aad] flex items-center justify-center">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-60">
                    <path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                    <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  {aula.duracao && (
                    <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                      {aula.duracao}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[11px] text-zinc-400 dark:text-[#5a7a8e] font-medium">
                    Aula {idx + 1}
                  </span>
                  <p className="text-sm font-semibold text-[#0f2d4a] dark:text-[#d4dce8] leading-snug group-hover:text-[#1a6aad] dark:group-hover:text-[#3db8d4] transition-colors">
                    {aula.titulo}
                  </p>
                </div>
                <svg
                  className="shrink-0 text-zinc-300 dark:text-[#3a5a6e] group-hover:text-[#1a6aad] dark:group-hover:text-[#3db8d4] transition-colors"
                  width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                >
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
