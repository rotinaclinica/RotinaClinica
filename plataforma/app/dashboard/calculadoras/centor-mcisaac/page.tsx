import Link from "next/link";
import CentorMcIsaacCalc from "../CentorMcIsaacCalc";
import CalcDisclaimer from "../CalcDisclaimer";

export const metadata = { title: "Centor / McIsaac · Rotina Clínica" };

export default function CentorMcIsaacPage() {
  return (
    <div className="flex-1 flex flex-col">
      <header className="bg-white dark:bg-[#131c2e] border-b border-zinc-200 dark:border-white/8 px-6 sm:px-8 py-6">
        <Link href="/dashboard/calculadoras" className="inline-flex items-center gap-1 text-xs text-zinc-400 dark:text-[#4a6a7e] hover:text-[#1a6aad] dark:hover:text-[#3db8d4] mb-3 transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Calculadoras
        </Link>
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#0f2d4a] dark:text-[#e8edf5] mb-1">Centor / McIsaac</h1>
        <p className="text-zinc-500 dark:text-[#6a8fa5] text-sm">Probabilidade de faringite bacteriana por Streptococcus do grupo A</p>
      </header>

      <main className="flex-1 p-6 sm:p-8">
        <div className="max-w-lg space-y-4">
          <CentorMcIsaacCalc />

          {/* Racional */}
          <div className="bg-white dark:bg-[#131c2e] rounded-2xl border border-zinc-200 dark:border-white/8 p-5">
            <p className="text-sm text-zinc-700 dark:text-[#c8dce8] leading-relaxed">
              <span className="font-bold text-[#0f2d4a] dark:text-[#e8edf5]">Racional:</span>{" "}
              quanto <span className="font-bold">maior</span> for a pontuação,{" "}
              <span className="font-bold">maior</span> a probabilidade de a etiologia ser bacteriana (Streptococcus do grupo A).
            </p>
          </div>

          <div className="px-1">
            <p className="text-[11px] text-zinc-400 dark:text-[#3a5a70] leading-relaxed">
              <span className="font-semibold">Referência:</span> McIsaac WJ, et al. A clinical score to reduce unnecessary antibiotic use in patients with sore throat.{" "}
              <em>CMAJ.</em> 1998;158(1):75–83.
            </p>
          </div>

          <CalcDisclaimer />
        </div>
      </main>
    </div>
  );
}
