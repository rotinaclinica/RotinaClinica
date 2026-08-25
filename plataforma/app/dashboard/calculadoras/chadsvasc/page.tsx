import Link from "next/link";
import ChadsvascCalc from "../ChadsvascCalc";

export const metadata = { title: "CHA₂DS₂-VA · Rotina Clínica" };

const INTERPRETACAO = [
  { pontos: "0",  risco: "Muito baixo", conduta: "Anticoagulação não recomendada",          cor: "text-emerald-600 dark:text-emerald-400" },
  { pontos: "1",  risco: "Baixo",       conduta: "Avaliar individualmente",                  cor: "text-yellow-600 dark:text-yellow-400"  },
  { pontos: "2",  risco: "Moderado",    conduta: "Anticoagulação oral recomendada",           cor: "text-red-500 dark:text-red-400"         },
  { pontos: "3",  risco: "Moderado",    conduta: "Anticoagulação oral recomendada",           cor: "text-red-500 dark:text-red-400"         },
  { pontos: "4",  risco: "Alto",        conduta: "Anticoagulação oral recomendada",           cor: "text-red-600 dark:text-red-400"         },
  { pontos: "5",  risco: "Alto",        conduta: "Anticoagulação oral recomendada",           cor: "text-red-600 dark:text-red-400"         },
  { pontos: "≥6", risco: "Muito alto",  conduta: "Anticoagulação fortemente recomendada",     cor: "text-red-700 dark:text-red-300"         },
];

export default function ChadsvascPage() {
  return (
    <div className="flex-1 flex flex-col">
      <header className="bg-white dark:bg-[#131c2e] border-b border-zinc-200 dark:border-white/8 px-6 sm:px-8 py-6">
        <Link href="/dashboard/calculadoras" className="inline-flex items-center gap-1 text-xs text-[#0f2d4a] dark:text-[#4a6a7e] hover:text-[#1a6aad] dark:hover:text-[#3db8d4] mb-3 transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Calculadoras
        </Link>
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#0f2d4a] dark:text-[#e8edf5] mb-1">CHA₂DS₂-VA</h1>
        <p className="text-[#0f2d4a] dark:text-[#6a8fa5] text-sm">Risco de AVC em pacientes com fibrilação atrial</p>
      </header>

      <main className="flex-1 p-6 sm:p-8">
        <div className="max-w-lg space-y-4">
          <ChadsvascCalc />

          {/* Tabela de interpretação */}
          <div className="bg-white dark:bg-[#131c2e] rounded-2xl border border-zinc-200 dark:border-white/8 overflow-hidden">
            <div className="px-5 py-3 border-b border-zinc-100 dark:border-white/8">
              <p className="text-xs font-bold text-[#0f2d4a] dark:text-[#6a8fa5] uppercase tracking-wide">Interpretação da pontuação</p>
            </div>
            <div className="divide-y divide-zinc-100 dark:divide-white/6">
              {INTERPRETACAO.map((row) => (
                <div key={row.pontos} className="flex items-center gap-3 px-5 py-3">
                  <span className="w-8 text-center font-extrabold text-sm text-[#0f2d4a] dark:text-[#e8edf5] shrink-0">{row.pontos}</span>
                  <span className={`w-24 text-xs font-semibold shrink-0 ${row.cor}`}>{row.risco}</span>
                  <span className="text-xs text-[#0f2d4a] dark:text-[#6a8fa5]">{row.conduta}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="px-1">
            <p className="text-[11px] text-[#0f2d4a] dark:text-[#3a5a70] leading-relaxed">
              <span className="font-semibold">Referência:</span> Lip GYH, et al. Refining clinical risk stratification for predicting stroke and thromboembolism in atrial fibrillation using a novel risk factor-based approach.{" "}
              <em>Chest.</em> 2010;137(2):263–272.
            </p>
          </div>

        </div>
      </main>
    </div>
  );
}
