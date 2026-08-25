import Link from "next/link";
import Image from "next/image";
import { AIRTRAQ_TITULO, AIRTRAQ_DESCRICAO, AIRTRAQ_VIDEOS } from "@/lib/airtraq-data";
import CupomBanner from "./CupomBanner";

export const metadata = { title: "Airtraq · Rotina Clínica" };

export default function AirtraqPage() {
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
          <div className="relative shrink-0 rounded-xl overflow-hidden bg-[#0f2d4a] border border-zinc-200 dark:border-white/8 flex items-center justify-center" style={{ width: 64, height: 64 }}>
            <Image
              src="/Airtraq/Imagem gerada pelo Chatgpt.png"
              alt="Airtraq"
              fill
              sizes="64px"
              className="object-contain p-1"
            />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#0f2d4a] dark:text-[#e8edf5]">
                {AIRTRAQ_TITULO}
              </h1>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#1a6aad]/10 dark:bg-[#3db8d4]/10 text-[#1a6aad] dark:text-[#3db8d4]">
                PARCEIRA OFICIAL
              </span>
            </div>
            <p className="text-[#0f2d4a] dark:text-[#6a8fa5] text-sm">
              Garanta segurança na sua intubação!
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 sm:p-8">

        {/* Banner cupom Airtraq */}
        <CupomBanner />

        {/* Sobre o Airtraq */}
        <div className="max-w-2xl mb-6 bg-white dark:bg-[#131c2e] border border-zinc-200 dark:border-white/8 rounded-xl p-5">
          <p className="text-xs font-bold text-[#1a6aad] dark:text-[#3db8d4] uppercase tracking-wider mb-2">Sobre</p>
          <p className="text-sm text-zinc-600 dark:text-[#9ec4de] leading-relaxed">{AIRTRAQ_DESCRICAO}</p>
        </div>

        {/* Lista de vídeos */}
        <div className="max-w-2xl flex flex-col gap-3">
          {AIRTRAQ_VIDEOS.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#1a6aad]/10 dark:bg-[#3db8d4]/10 flex items-center justify-center mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3db8d4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                </svg>
              </div>
              <p className="text-[#0f2d4a] dark:text-[#e8edf5] font-bold text-base mb-1">Em breve</p>
              <p className="text-[#0f2d4a] dark:text-[#6a8fa5] text-sm max-w-xs">
                Os vídeos do Airtraq serão disponibilizados em breve. Fique de olho!
              </p>
            </div>
          ) : (
            AIRTRAQ_VIDEOS.map((video, idx) => (
              <Link
                key={video.id}
                href={`/dashboard/cursos/airtraq/${video.id}`}
                className="flex items-center gap-4 bg-white dark:bg-[#131c2e] border border-zinc-200 dark:border-white/8 rounded-xl p-3 hover:border-[#1a6aad]/40 dark:hover:border-[#3db8d4]/30 transition-colors group"
              >
                <div className="relative shrink-0 rounded-lg overflow-hidden bg-[#0f2d4a]" style={{ width: 60, height: 96 }}>
                  {video.youtubeId && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={`https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`}
                      alt={video.titulo}
                      className="absolute inset-0 w-full h-full object-cover object-center"
                    />
                  )}
                  {video.duracao && (
                    <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                      {video.duracao}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[11px] text-[#0f2d4a] dark:text-[#5a7a8e] font-medium">
                    Vídeo {idx + 1}
                  </span>
                  <p className="text-sm font-semibold text-[#0f2d4a] dark:text-[#d4dce8] leading-snug group-hover:text-[#1a6aad] dark:group-hover:text-[#3db8d4] transition-colors">
                    {video.titulo}
                  </p>
                  {video.descricao && (
                    <p className="text-xs text-[#0f2d4a] dark:text-[#6a8fa5] mt-0.5 leading-snug line-clamp-2">
                      {video.descricao}
                    </p>
                  )}
                </div>
                <svg
                  className="shrink-0 text-zinc-300 dark:text-[#3a5a6e] group-hover:text-[#1a6aad] dark:group-hover:text-[#3db8d4] transition-colors"
                  width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                >
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </Link>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
