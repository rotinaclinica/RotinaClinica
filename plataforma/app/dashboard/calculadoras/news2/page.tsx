import Link from "next/link";
import News2Calc from "../News2Calc";

export const metadata = { title: "NEWS2 · Rotina Clínica" };

export default function News2Page() {
  return (
    <div className="flex-1 flex flex-col">
      <header className="bg-white dark:bg-[#131c2e] border-b border-zinc-200 dark:border-white/8 px-6 sm:px-8 py-6">
        <Link href="/dashboard/calculadoras" className="inline-flex items-center gap-1 text-xs text-[#0f2d4a] dark:text-[#4a6a7e] hover:text-[#1a6aad] dark:hover:text-[#3db8d4] mb-3 transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Calculadoras
        </Link>
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#0f2d4a] dark:text-[#e8edf5] mb-1">
          NEWS2
        </h1>
        <p className="text-[#0f2d4a] dark:text-[#6a8fa5] text-sm">
          National Early Warning Score 2 — estratificação de gravidade na doença aguda em adultos
        </p>
      </header>

      <main className="flex-1 p-6 sm:p-8">
        <div className="max-w-lg space-y-4">
          <News2Calc />
          <div className="px-1 space-y-2">
            <p className="text-[11px] text-[#0f2d4a] dark:text-[#3a5a70] leading-relaxed">
              <span className="font-semibold">Nota:</span> Em pacientes com falência respiratória hipercápnica (ex: DPOC), utilizar a Escala 2 para SpO₂, com alvo de 88–92%.
            </p>
            <p className="text-[11px] text-[#0f2d4a] dark:text-[#3a5a70] leading-relaxed">
              <span className="font-semibold">Referências:</span> Royal College of Physicians. National Early Warning Score (NEWS) 2. London: RCP, 2017. Calculator: National Early Warning Score (NEWS2) for acute illness in adults. <em>UpToDate.</em> 2024.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
