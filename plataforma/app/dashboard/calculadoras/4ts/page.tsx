import Link from "next/link";
import QuatroTsCalc from "../QuatroTsCalc";

export const metadata = { title: "4Ts Score — TIH · Rotina Clínica" };

export default function QuatroTsPage() {
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
          4Ts Score
        </h1>
        <p className="text-[#0f2d4a] dark:text-[#6a8fa5] text-sm">
          Probabilidade de Trombocitopenia Induzida por Heparina (TIH)
        </p>
      </header>

      <main className="flex-1 p-6 sm:p-8">
        <div className="max-w-lg space-y-4">
          <div className="rounded-xl border border-amber-200 dark:border-amber-700/40 bg-amber-50 dark:bg-amber-900/10 px-4 py-3 text-xs text-[#0f2d4a] dark:text-[#c4d4df] leading-relaxed">
            <span className="font-semibold">Instrução:</span> Para calcular a queda percentual de plaquetas, use o valor mais alto imediatamente antes da queda relacionada à heparina. Considere o dia 0 como o primeiro dia de exposição — a queda começa a ser contada a partir do dia seguinte.
          </div>

          <QuatroTsCalc />

          <div className="px-1 space-y-2">
            <p className="text-[11px] text-[#0f2d4a] dark:text-[#3a5a70] leading-relaxed">
              <span className="font-semibold">Interpretação:</span> ≤3 pts = baixa probabilidade (risco &lt;1%); 4–5 pts = probabilidade intermediária (risco ~10%); 6–8 pts = alta probabilidade (risco ~50%).
            </p>
            <p className="text-[11px] text-[#0f2d4a] dark:text-[#3a5a70] leading-relaxed">
              <span className="font-semibold">Referência:</span> Lo GK, et al. J Thromb Haemost. 2006;4(4):759–765. Warkentin TE. Clinical presentation and diagnosis of heparin-induced thrombocytopenia. <em>UpToDate.</em> 2024. Diretrizes ASH 2018.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
