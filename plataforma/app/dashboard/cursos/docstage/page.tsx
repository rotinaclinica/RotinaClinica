import Link from "next/link";
import Image from "next/image";
import { DOCSTAGE_MODULOS } from "@/lib/docstage-data";

export const metadata = { title: "Docstage · Rotina Clínica" };

export default function DocStagePage() {
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

        <div className="flex items-center gap-4">
          <div className="relative shrink-0 w-[64px] h-[64px] rounded-xl overflow-hidden bg-white border border-zinc-200 dark:border-white/8 flex items-center justify-center">
            <Image
              src="/Docstage/LOGO DOCSTAGE VETORIZADA_page-0001.jpg"
              alt="Docstage"
              fill
              className="object-contain p-1"
            />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#0f2d4a] dark:text-[#e8edf5]">
                Docstage
              </h1>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#1a6aad]/10 dark:bg-[#3db8d4]/10 text-[#1a6aad] dark:text-[#3db8d4]">
                PARCEIRA OFICIAL
              </span>
            </div>
            <p className="text-zinc-500 dark:text-[#6a8fa5] text-sm">
              Videoaulas exclusivas da nossa parceira oficial.
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 sm:p-8">
        <div className="max-w-2xl flex flex-col gap-3">
          {DOCSTAGE_MODULOS.map((modulo) => (
            <Link
              key={modulo.id}
              href={`/dashboard/cursos/docstage/${modulo.id}`}
              className="flex items-center gap-4 bg-white dark:bg-[#131c2e] border border-zinc-200 dark:border-white/8 rounded-xl p-5 hover:border-[#1a6aad]/40 dark:hover:border-[#3db8d4]/30 transition-colors group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#e8f4fc] to-[#dceef9] dark:from-[#1a2d45] dark:to-[#162438] flex items-center justify-center flex-shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1a6aad" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                  <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[#0f2d4a] dark:text-[#d4dce8] leading-snug group-hover:text-[#1a6aad] dark:group-hover:text-[#3db8d4] transition-colors">
                  {modulo.titulo}
                </p>
                <p className="text-xs text-zinc-500 dark:text-[#6a8fa5] mt-0.5 leading-relaxed">
                  {modulo.descricao}
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
