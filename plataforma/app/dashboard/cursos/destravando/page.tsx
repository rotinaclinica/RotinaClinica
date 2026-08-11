import Link from "next/link";
import { CURSO_TITULO, MODULOS } from "@/lib/cursos-data";
import ThumbnailImage from "../ThumbnailImage";

export const dynamic = "force-dynamic";
export const metadata = { title: "Destravando o Plantão · Rotina Clínica" };

export default function DestravandoPage() {
  const aulas = MODULOS.flatMap((m) => m.aulas);

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <header className="bg-white dark:bg-[#131c2e] border-b border-zinc-200 dark:border-white/8 px-6 sm:px-8 py-6">
        <Link
          href="/dashboard/cursos"
          className="inline-flex items-center gap-1 text-xs text-zinc-400 dark:text-[#4a6a7e] hover:text-[#1a6aad] dark:hover:text-[#3db8d4] mb-3 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Cursos
        </Link>
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#0f2d4a] dark:text-[#e8edf5] mb-1">
          {CURSO_TITULO}
        </h1>
        <p className="text-zinc-500 dark:text-[#6a8fa5] text-sm">
          Abordagem sistematizada das 10 queixas mais prevalentes do paciente adulto no plantão.
        </p>
      </header>

      <main className="flex-1 p-6 sm:p-8">
        <div className="max-w-2xl flex flex-col gap-2">
          {aulas.map((aula, idx) => (
            <Link
              key={aula.id}
              href={`/dashboard/cursos/${aula.id}`}
              className="flex items-center gap-4 bg-white dark:bg-[#131c2e] border border-zinc-200 dark:border-white/8 rounded-xl p-3 hover:border-[#1a6aad]/40 dark:hover:border-[#3db8d4]/30 transition-colors group"
            >
              <div className="relative shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-[#0f2d4a] to-[#1a6aad]" style={{ width: 120, height: 68 }}>
                <ThumbnailImage aulaId={aula.id} alt={aula.titulo} thumbLocal={aula.thumbLocal} />
                <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                  {aula.duracao}
                </span>
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
      </main>
    </div>
  );
}
