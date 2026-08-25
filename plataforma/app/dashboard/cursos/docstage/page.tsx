import Link from "next/link";
import Image from "next/image";
import { DOCSTAGE_MODULOS } from "@/lib/docstage-data";

export const metadata = { title: "Docstage · Rotina Clínica" };

export default function DocStagePage() {
  return (
    <div className="flex-1 flex flex-col">
      <header className="bg-white dark:bg-[#131c2e] border-b border-zinc-200 dark:border-white/8 px-6 sm:px-8 py-6">
        <Link
          href="/dashboard/cursos"
          className="inline-flex items-center gap-1 text-xs text-[#0f2d4a] dark:text-[#4a6a7e] hover:text-[#1a6aad] dark:hover:text-[#3db8d4] mb-3 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Cursos
        </Link>

        <div className="flex items-center gap-4">
          <div className="relative shrink-0 rounded-xl overflow-hidden bg-white border border-zinc-200 dark:border-white/8 flex items-center justify-center" style={{ width: 64, height: 64 }}>
            <Image
              src="/Docstage/LOGO DOCSTAGE VETORIZADA_page-0001.jpg"
              alt="Docstage"
              fill
              sizes="64px"
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
            <p className="text-[#0f2d4a] dark:text-[#6a8fa5] text-sm">
              Videoaulas exclusivas da nossa parceira oficial.
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 sm:p-8">

        {/* Banner cupom Docstage */}
        <div className="max-w-2xl mb-6 rounded-2xl bg-gradient-to-br from-[#0f2d4a] to-[#1a4a7a] border border-[#3db8d4]/30 overflow-hidden">
          <div className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-11 h-11 rounded-xl bg-[#3db8d4]/20 border border-[#3db8d4]/40 flex items-center justify-center flex-shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3db8d4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>
                </svg>
              </div>
              <div>
                <p className="text-white font-extrabold text-sm leading-tight">Utilize nosso cupom e ganhe 50% de desconto na 1ª mensalidade</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:flex-shrink-0">
              <div className="flex items-center gap-2 bg-white/10 border border-[#3db8d4]/50 rounded-lg px-4 py-2">
                <span className="text-[#9ec4de] text-xs font-semibold uppercase tracking-wide">Cupom:</span>
                <span className="font-mono font-extrabold text-[#3db8d4] tracking-widest text-sm">ROTINACLINICA</span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href="https://docstage.com.br"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 bg-[#3db8d4] hover:bg-[#2fa8c4] text-[#0f2d4a] font-bold text-xs px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
                >
                  Site oficial
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                </a>
                <a
                  href="https://www.instagram.com/docstage/"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="@docstage no Instagram"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg transition-opacity hover:opacity-90 flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, #833AB4, #FD1D1D, #FCAF45)" }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                  </svg>
                  <span className="text-white font-bold text-xs">Instagram</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-2xl flex flex-col gap-3">
          {DOCSTAGE_MODULOS.map((modulo) => (
            <Link
              key={modulo.id}
              href={`/dashboard/cursos/docstage/${modulo.id}`}
              className="flex items-center gap-4 bg-white dark:bg-[#131c2e] border border-zinc-200 dark:border-white/8 rounded-xl p-5 hover:border-[#1a6aad]/40 dark:hover:border-[#3db8d4]/30 transition-colors group"
            >
              <div className="relative shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-[#0f2d4a] to-[#1a6aad]" style={{ width: 100, height: 58 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/docstage/${modulo.id}/${modulo.aulas[0]?.id}/thumb`}
                  alt={modulo.titulo}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[#0f2d4a] dark:text-[#d4dce8] leading-snug group-hover:text-[#1a6aad] dark:group-hover:text-[#3db8d4] transition-colors">
                  {modulo.titulo}
                </p>
                <p className="text-xs text-[#0f2d4a] dark:text-[#6a8fa5] mt-0.5 leading-relaxed">
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
