export const dynamic = "force-dynamic";

export const metadata = { title: "Cursos · Rotina Clínica" };

export default function CursosPage() {
  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <header className="bg-white border-b border-zinc-200 px-6 sm:px-8 py-6">
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#0f2d4a] mb-1">Cursos e Videoaulas</h1>
        <p className="text-zinc-500 text-sm">Conteúdo em vídeo por especialistas. Aprenda no seu ritmo.</p>
      </header>

      <main className="flex-1 p-6 sm:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-[#e8f4fc] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1a6aad" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
              <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <p className="font-bold text-[#0f2d4a] mb-1">Em breve</p>
          <p className="text-sm text-zinc-400 max-w-xs">As videoaulas estão sendo produzidas e chegarão em breve.</p>
        </div>
      </main>
    </div>
  );
}
