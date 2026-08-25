import Link from "next/link";
import { AIRTRAQ_VIDEOS } from "@/lib/airtraq-data";
import { notFound } from "next/navigation";

export default async function AirtraqAulaPage({
  params,
}: {
  params: Promise<{ aulaId: string }>;
}) {
  const { aulaId } = await params;
  const video = AIRTRAQ_VIDEOS.find((v) => v.id === aulaId);
  if (!video) notFound();

  const idx = AIRTRAQ_VIDEOS.indexOf(video);
  const prev = AIRTRAQ_VIDEOS[idx - 1];
  const next = AIRTRAQ_VIDEOS[idx + 1];

  return (
    <div className="flex-1 flex flex-col">
      <header className="bg-white dark:bg-[#131c2e] border-b border-zinc-200 dark:border-white/8 px-6 sm:px-8 py-4">
        <Link
          href="/dashboard/cursos/airtraq"
          className="inline-flex items-center gap-1 text-xs text-[#0f2d4a] dark:text-[#4a6a7e] hover:text-[#1a6aad] dark:hover:text-[#3db8d4] mb-2 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Airtraq
        </Link>
        <h1 className="text-base sm:text-lg font-extrabold text-[#0f2d4a] dark:text-[#e8edf5] leading-snug">
          {video.titulo}
        </h1>
        <p className="text-xs text-[#0f2d4a] dark:text-[#5a7a8e] mt-0.5">Vídeo {idx + 1} de {AIRTRAQ_VIDEOS.length}</p>
      </header>

      <main className="flex-1 p-4 sm:p-6 flex flex-col items-center">
        {/* Player YouTube */}
        {video.youtubeId && (
          <div className="w-full max-w-sm sm:max-w-md">
            <div className="relative w-full rounded-2xl overflow-hidden bg-black shadow-lg" style={{ aspectRatio: "9/16" }}>
              <iframe
                src={`https://www.youtube.com/embed/${video.youtubeId}?rel=0&modestbranding=1`}
                title={video.titulo}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            </div>
          </div>
        )}

        {/* Navegação */}
        <div className="w-full max-w-sm sm:max-w-md flex items-center justify-between mt-6 gap-3">
          {prev ? (
            <Link
              href={`/dashboard/cursos/airtraq/${prev.id}`}
              className="flex items-center gap-1.5 text-sm font-semibold text-[#1a6aad] dark:text-[#3db8d4] hover:underline"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              Anterior
            </Link>
          ) : <span />}
          {next && (
            <Link
              href={`/dashboard/cursos/airtraq/${next.id}`}
              className="flex items-center gap-1.5 text-sm font-semibold text-[#1a6aad] dark:text-[#3db8d4] hover:underline"
            >
              Próximo
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}
