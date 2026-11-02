import Link from "next/link";
import { CURSO_TITULO, MODULOS } from "@/lib/cursos-data";
import ThumbnailImage from "../ThumbnailImage";

export const dynamic = "force-dynamic";
export const metadata = { title: "Destravando o Plantão · Rotina Clínica" };

export default function DestravandoPage() {
  const aulas = MODULOS.flatMap((m) => m.aulas);

  return (
    <div className="flex-1 flex flex-col">
      <header className="bg-white dark:bg-[radial-gradient(700px_220px_at_15%_0%,rgba(61,184,212,0.16),transparent_70%),linear-gradient(180deg,#1a3050_0%,#142540_100%)] border-b border-[#d9e3ec] dark:border-white/12 px-6 sm:px-8 py-6">
        <Link
          href="/dashboard/cursos"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1a6aad] dark:text-[#3db8d4] hover:text-[#0f2d4a] dark:hover:text-white mb-4 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Cursos
        </Link>
        <h1 className="text-xl sm:text-2xl dark:sm:text-3xl font-extrabold text-[#0f2d4a] dark:text-white mb-1">
          {CURSO_TITULO}
        </h1>
        <p className="text-[#0f2d4a] dark:text-[#a9bccd] text-sm">
          Abordagem sistematizada das 10 queixas mais prevalentes do paciente adulto no plantão.
        </p>
      </header>

      <main className="flex-1 p-6 sm:p-8">
        <div className="max-w-2xl flex flex-col gap-2">
          {aulas.map((aula, idx) => (
            <Link
              key={aula.id}
              href={`/dashboard/cursos/${aula.id}`}
              className="flex items-center gap-4 bg-white dark:bg-[#172741] border border-[#d9e3ec] dark:border-white/12 rounded-xl p-3 hover:border-[#1a6aad]/40 dark:hover:border-[#3db8d4]/30 transition-colors group"
            >
              <div className="relative shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-[#0f2d4a] to-[#1a6aad]" style={{ width: 120, height: 68 }}>
                <ThumbnailImage aulaId={aula.id} alt={aula.titulo} thumbLocal={aula.thumbLocal} />
                <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                  {aula.duracao}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <span className="text-[11px] text-[#0f2d4a] dark:text-[#8fa9bd] font-medium">
                  Aula {idx + 1}
                </span>
                <p className="text-sm font-semibold text-[#0f2d4a] dark:text-[#e8edf5] leading-snug group-hover:text-[#1a6aad] dark:group-hover:text-[#3db8d4] transition-colors">
                  {aula.titulo}
                </p>
              </div>

              <svg
                className="shrink-0 text-zinc-300 dark:text-[#5a7a8e] group-hover:text-[#1a6aad] dark:group-hover:text-[#3db8d4] transition-colors"
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
