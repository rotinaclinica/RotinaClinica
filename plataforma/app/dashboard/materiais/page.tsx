export const dynamic = "force-dynamic";

export const metadata = { title: "Materiais · Rotina Clínica" };

export default function MateriaisPage() {
  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <header className="bg-white border-b border-zinc-200 px-6 sm:px-8 py-6">
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#0f2d4a] mb-1">Ebooks e Materiais</h1>
        <p className="text-zinc-500 text-sm">PDFs e materiais de apoio para baixar e consultar offline.</p>
      </header>

      <main className="flex-1 p-6 sm:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-[#e8f4fc] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1a6aad" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
            </svg>
          </div>
          <p className="font-bold text-[#0f2d4a] mb-1">Em breve</p>
          <p className="text-sm text-zinc-400 max-w-xs">Os ebooks e materiais de apoio chegarão em breve.</p>
        </div>
      </main>
    </div>
  );
}
