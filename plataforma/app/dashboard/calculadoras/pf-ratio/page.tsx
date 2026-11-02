import Link from "next/link";
import PfRatioCalc from "../PfRatioCalc";

export const metadata = { title: "Relação P/F · Rotina Clínica" };

export default function PfRatioPage() {
  return (
    <div className="flex-1 flex flex-col">
      <header className="bg-white dark:bg-[radial-gradient(700px_220px_at_15%_0%,rgba(61,184,212,0.16),transparent_70%),linear-gradient(180deg,#1a3050_0%,#142540_100%)] border-b border-[#d9e3ec] dark:border-white/12 px-6 sm:px-8 py-6">
        <Link href="/dashboard/calculadoras" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1a6aad] dark:text-[#3db8d4] hover:text-[#0f2d4a] dark:hover:text-white mb-4 transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Calculadoras
        </Link>
        <h1 className="text-xl sm:text-2xl dark:sm:text-3xl font-extrabold text-[#0f2d4a] dark:text-white mb-1">
          Relação P/F (Índice de Horowitz)
        </h1>
        <p className="text-[#0f2d4a] dark:text-[#a9bccd] text-sm">
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
              <span className="font-semibold">Referências:</span> (1) ARDS Definition Task Force. Acute Respiratory Distress Syndrome — The Berlin Definition. <em>JAMA.</em> 2012;307(23):2526–2533. (2) Calculator: Ratio of arterial oxygen tension to fraction of inspired oxygen (PaO₂/FiO₂ ratio). <em>UpToDate.</em> 2024.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
