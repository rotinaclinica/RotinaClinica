export const dynamic = "force-dynamic";

export const metadata = { title: "Casos Clínicos · Rotina Clínica" };

export default function CasosPage() {
  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <header className="bg-white border-b border-zinc-200 px-6 sm:px-8 py-6">
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#0f2d4a] mb-1">Casos Clínicos</h1>
        <p className="text-zinc-500 text-sm">Um novo caso toda semana com raciocínio diagnóstico e conduta.</p>
      </header>

      <main className="flex-1 p-6 sm:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-[#e8f4fc] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1a6aad" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
          </div>
          <p className="font-bold text-[#0f2d4a] mb-1">Em breve</p>
          <p className="text-sm text-zinc-400 max-w-xs">Os casos clínicos estão sendo preparados e chegarão em breve.</p>
        </div>
      </main>
    </div>
  );
}
