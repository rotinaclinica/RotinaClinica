export default function EvolucoesPag() {
  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <header className="bg-white dark:bg-[#131c2e] border-b border-zinc-200 dark:border-white/8 px-6 sm:px-8 py-6">
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#0f2d4a] dark:text-[#e8edf5] mb-1">Modelos de evolução</h1>
        <p className="text-zinc-500 dark:text-[#6a8fa5] text-sm">Modelos de registro para evolução clínica no prontuário.</p>
      </header>

      <main className="flex-1 p-6 sm:p-8 flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center max-w-sm">
          <div className="w-16 h-16 bg-zinc-100 dark:bg-[#1a2535] rounded-2xl flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <p className="font-bold text-zinc-500 dark:text-[#7d96ad]">Em breve</p>
          <p className="text-sm text-zinc-400 dark:text-[#5a7a8e]">Os modelos de evolução clínica estarão disponíveis em breve.</p>
        </div>
      </main>
    </div>
  );
}
