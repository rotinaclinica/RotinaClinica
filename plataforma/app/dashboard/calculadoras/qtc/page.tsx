import Link from "next/link";
import QtcCalc from "../QtcCalc";

export const metadata = { title: "QTc · Rotina Clínica" };

export default function QtcPage() {
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
          QTc — Intervalo QT Corrigido
        </h1>
        <p className="text-[#0f2d4a] dark:text-[#6a8fa5] text-sm">
          Correção do intervalo QT pela frequência cardíaca pela Fórmula de Bazett
        </p>
      </header>

      <main className="flex-1 p-6 sm:p-8">
        <div className="max-w-lg space-y-4">
          <QtcCalc />
          <div className="px-1 space-y-2">
            <p className="text-[11px] text-[#0f2d4a] dark:text-[#3a5a70] leading-relaxed">
              <span className="font-semibold">Fórmula de Bazett:</span> QTc = QT (ms) ÷ √RR (s), onde RR (s) = 60 ÷ FC (bpm).
            </p>
            <p className="text-[11px] text-[#0f2d4a] dark:text-[#3a5a70] leading-relaxed">
              <span className="font-semibold">Atenção:</span> A fórmula de Bazett tende a supercorrigir em FC elevadas e subcorrigir em FC baixas.
            </p>
            <p className="text-[11px] text-[#0f2d4a] dark:text-[#3a5a70] leading-relaxed">
              <span className="font-semibold">Referências:</span> (1) Bazett HC. An analysis of the time-relations of electrocardiograms. <em>Heart.</em> 1920;7:353–370. (2) ECG tutorial: Basic principles of electrocardiography analysis. <em>UpToDate.</em> 2024.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
