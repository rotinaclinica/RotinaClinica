import Link from "next/link";
import AnionGapCalc from "../AnionGapCalc";

export const metadata = { title: "Ânion Gap · Rotina Clínica" };

export default function AnionGapPage() {
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
          Ânion Gap Sérico
        </h1>
        <p className="text-[#0f2d4a] dark:text-[#6a8fa5] text-sm">
          Avaliação de acidose metabólica com ou sem correção pela albumina
        </p>
      </header>

      <main className="flex-1 p-6 sm:p-8">
        <div className="max-w-lg space-y-4">
          <AnionGapCalc />
          <div className="px-1 space-y-2">
            <p className="text-[11px] text-[#0f2d4a] dark:text-[#3a5a70] leading-relaxed">
              <span className="font-semibold">Fórmulas:</span> AG = Na⁺ − (Cl⁻ + HCO₃⁻) &nbsp;·&nbsp; AG corrigido = AG + 2,5 × (4,5 − albumina g/dL)
            </p>
            <p className="text-[11px] text-[#0f2d4a] dark:text-[#3a5a70] leading-relaxed">
              <span className="font-semibold">Nota:</span> O intervalo de referência é 10 ± 2 mEq/L (8–12). Pode variar conforme o analisador — laboratórios com eletrodos íon-seletivos tendem a reportar valores menores.
            </p>
            <p className="text-[11px] text-[#0f2d4a] dark:text-[#3a5a70] leading-relaxed">
              <span className="font-semibold">Referência:</span> Serum anion gap in conditions other than metabolic acidosis. <em>UpToDate.</em> 2024.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
