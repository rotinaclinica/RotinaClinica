export const dynamic = "force-dynamic";

export const metadata = { title: "Calculadoras · Rotina Clínica" };

export default function CalculadorasPage() {
  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <header className="bg-white border-b border-zinc-200 px-6 sm:px-8 py-6">
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#0f2d4a] mb-1">Calculadoras Clínicas</h1>
        <p className="text-zinc-500 text-sm">Escores, doses e ferramentas interativas para o dia a dia.</p>
      </header>

      <main className="flex-1 p-6 sm:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-[#e8f4fc] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1a6aad" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
            </svg>
          </div>
          <p className="font-bold text-[#0f2d4a] mb-1">Em breve</p>
          <p className="text-sm text-zinc-400 max-w-xs">As calculadoras clínicas estão sendo desenvolvidas.</p>
        </div>
      </main>
    </div>
  );
}
