import Link from "next/link";
import HeartScoreCalc from "../HeartScoreCalc";

export const metadata = { title: "HEART Score · Rotina Clínica" };

export default function HeartScorePage() {
  return (
    <div className="flex-1 flex flex-col">
      <header className="bg-white dark:bg-[radial-gradient(700px_220px_at_15%_0%,rgba(61,184,212,0.16),transparent_70%),linear-gradient(180deg,#1a3050_0%,#142540_100%)] border-b border-[#d9e3ec] dark:border-white/12 px-6 sm:px-8 py-6">
        <Link href="/dashboard/calculadoras" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1a6aad] dark:text-[#3db8d4] hover:text-[#0f2d4a] dark:hover:text-white mb-4 transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Calculadoras
        </Link>
        <h1 className="text-xl sm:text-2xl dark:sm:text-3xl font-extrabold text-[#0f2d4a] dark:text-white mb-1">HEART Score</h1>
        <p className="text-[#0f2d4a] dark:text-[#a9bccd] text-sm">Estratificação de risco em dor torácica</p>
      </header>

      <main className="flex-1 p-6 sm:p-8">
        <div className="max-w-lg space-y-4">
          <HeartScoreCalc />

          {/* Gráfico MACE */}
          <div className="bg-white dark:bg-[#172741] rounded-2xl border border-[#d9e3ec] dark:border-white/12 p-5">
            <p className="text-sm font-bold text-[#0f2d4a] dark:text-[#e8edf5] text-center mb-4">
              Eventos cardiovasculares maiores em 6 semanas
            </p>
            {/* Barras */}
            <div className="flex items-end justify-around px-4 border-b border-[#d9e3ec] dark:border-white/15" style={{ height: 160 }}>
              <div className="flex flex-col items-center gap-1">
                <span className="text-xs font-bold text-[#0f2d4a] dark:text-[#a9bccd]">~2%</span>
                <div className="w-14 rounded-t-md bg-emerald-500" style={{ height: 6 }} />
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-xs font-bold text-[#0f2d4a] dark:text-[#a9bccd]">~15%</span>
                <div className="w-14 rounded-t-md bg-yellow-500" style={{ height: 42 }} />
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-xs font-bold text-[#0f2d4a] dark:text-[#a9bccd]">~50%</span>
                <div className="w-14 rounded-t-md bg-red-500" style={{ height: 140 }} />
              </div>
            </div>
            {/* Labels eixo X */}
            <div className="flex justify-around px-4 mt-2">
              <span className="w-14 text-center text-xs font-semibold text-zinc-600 dark:text-[#8aacbc]">≤ 3</span>
              <span className="w-14 text-center text-xs font-semibold text-zinc-600 dark:text-[#8aacbc]">4 a 6</span>
              <span className="w-14 text-center text-xs font-semibold text-zinc-600 dark:text-[#8aacbc]">≥ 7</span>
            </div>
            <div className="mt-4 rounded-lg bg-zinc-100 dark:bg-[#132842] px-3 py-2 text-center">
              <p className="text-[11px] font-semibold text-zinc-600 dark:text-[#8aacbc]">
                Baixo risco = Escore HEART ≤ 3 pontos
              </p>
            </div>
          </div>

          <div className="px-1">
            <p className="text-[11px] text-[#0f2d4a] dark:text-[#3a5a70] leading-relaxed">
              <span className="font-semibold">Referência:</span> Backus BE, et al. A prospective validation of the HEART score for chest pain patients at the emergency department.{" "}
              <em>Int J Cardiol.</em> 2010;168(3):2153–2158.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
