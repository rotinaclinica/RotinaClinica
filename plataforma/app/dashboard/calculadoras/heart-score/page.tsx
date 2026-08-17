import Link from "next/link";
import HeartScoreCalc from "../HeartScoreCalc";

export const metadata = { title: "HEART Score · Rotina Clínica" };

export default function HeartScorePage() {
  return (
    <div className="flex-1 flex flex-col">
      <header className="bg-white dark:bg-[#131c2e] border-b border-zinc-200 dark:border-white/8 px-6 sm:px-8 py-6">
        <Link href="/dashboard/calculadoras" className="inline-flex items-center gap-1 text-xs text-zinc-400 dark:text-[#4a6a7e] hover:text-[#1a6aad] dark:hover:text-[#3db8d4] mb-3 transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Calculadoras
        </Link>
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#0f2d4a] dark:text-[#e8edf5] mb-1">HEART Score</h1>
        <p className="text-zinc-500 dark:text-[#6a8fa5] text-sm">Estratificação de risco em dor torácica</p>
      </header>

      <main className="flex-1 p-6 sm:p-8">
        <div className="max-w-lg space-y-4">
          <HeartScoreCalc />

          {/* Gráfico MACE */}
          <div className="bg-white dark:bg-[#131c2e] rounded-2xl border border-zinc-200 dark:border-white/8 p-5">
            <p className="text-sm font-bold text-[#0f2d4a] dark:text-[#e8edf5] text-center mb-4">
              Eventos cardiovasculares maiores em 6 semanas
            </p>
            {/* Barras */}
            <div className="flex items-end justify-around px-4 border-b border-zinc-200 dark:border-white/10" style={{ height: 160 }}>
              <div className="flex flex-col items-center gap-1">
                <span className="text-xs font-bold text-zinc-500 dark:text-[#6a8fa5]">~2%</span>
                <div className="w-14 rounded-t-md bg-emerald-500" style={{ height: 6 }} />
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-xs font-bold text-zinc-500 dark:text-[#6a8fa5]">~15%</span>
                <div className="w-14 rounded-t-md bg-yellow-500" style={{ height: 42 }} />
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-xs font-bold text-zinc-500 dark:text-[#6a8fa5]">~50%</span>
                <div className="w-14 rounded-t-md bg-red-500" style={{ height: 140 }} />
              </div>
            </div>
            {/* Labels eixo X */}
            <div className="flex justify-around px-4 mt-2">
              <span className="w-14 text-center text-xs font-semibold text-zinc-600 dark:text-[#8aacbc]">≤ 3</span>
              <span className="w-14 text-center text-xs font-semibold text-zinc-600 dark:text-[#8aacbc]">4 a 6</span>
              <span className="w-14 text-center text-xs font-semibold text-zinc-600 dark:text-[#8aacbc]">≥ 7</span>
            </div>
            <div className="mt-4 rounded-lg bg-zinc-100 dark:bg-[#0f1e30] px-3 py-2 text-center">
              <p className="text-[11px] font-semibold text-zinc-600 dark:text-[#8aacbc]">
                Baixo risco = Escore HEART ≤ 3 pontos
              </p>
            </div>
          </div>

          <div className="px-1">
            <p className="text-[11px] text-zinc-400 dark:text-[#3a5a70] leading-relaxed">
              <span className="font-semibold">Referência:</span> Backus BE, et al. A prospective validation of the HEART score for chest pain patients at the emergency department.{" "}
              <em>Int J Cardiol.</em> 2010;168(3):2153–2158.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
