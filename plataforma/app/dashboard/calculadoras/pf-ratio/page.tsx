import Link from "next/link";
import PfRatioCalc from "../PfRatioCalc";

export const metadata = { title: "Relação P/F · Rotina Clínica" };

export default function PfRatioPage() {
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
          Relação P/F (Índice de Horowitz)
        </h1>
        <p className="text-[#0f2d4a] dark:text-[#6a8fa5] text-sm">
          Classificação da Síndrome do Desconforto Respiratório Agudo (SDRA)
        </p>
      </header>

      <main className="flex-1 p-6 sm:p-8">
        <div className="max-w-lg space-y-4">
          <PfRatioCalc />
          <div className="px-1 space-y-2">
            <p className="text-[11px] text-[#0f2d4a] dark:text-[#3a5a70] leading-relaxed">
              <span className="font-semibold">Fórmula:</span> P/F = PaO₂ (mmHg) ÷ FiO₂ (fração). Todos os limiares de SDRA requerem PEEP ou CPAP ≥5 cmH₂O.
            </p>
            <p className="text-[11px] text-[#0f2d4a] dark:text-[#3a5a70] leading-relaxed">
              <span className="font-semibold">Referência:</span> ARDS Definition Task Force. Acute Respiratory Distress Syndrome — The Berlin Definition. <em>JAMA.</em> 2012;307(23):2526–2533.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
