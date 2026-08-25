import Link from "next/link";
import HasbledCalc from "../HasbledCalc";

export const metadata = { title: "HAS-BLED · Rotina Clínica" };

const INTERPRETACAO = [
  { pontos: "0", grupo: "Baixo",     risco: "0,9%",  conduta: "Anticoagulação deve ser considerada",    cor: "text-emerald-600 dark:text-emerald-400" },
  { pontos: "1", grupo: "Baixo",     risco: "3,4%",  conduta: "Anticoagulação deve ser considerada",    cor: "text-emerald-600 dark:text-emerald-400" },
  { pontos: "2", grupo: "Moderado",  risco: "4,1%",  conduta: "Anticoagulação pode ser considerada",    cor: "text-yellow-600 dark:text-yellow-400"  },
  { pontos: "3", grupo: "Alto",      risco: "5,8%",  conduta: "Corrigir fatores modificáveis",          cor: "text-red-500 dark:text-red-400"         },
  { pontos: "4", grupo: "Alto",      risco: "8,9%",  conduta: "Corrigir fatores modificáveis",          cor: "text-red-600 dark:text-red-400"         },
  { pontos: "5", grupo: "Alto",      risco: "9,1%",  conduta: "Corrigir fatores modificáveis",          cor: "text-red-600 dark:text-red-400"         },
  { pontos: ">5",grupo: "Muito alto", risco: "—",    conduta: "Corrigir fatores modificáveis",          cor: "text-red-700 dark:text-red-300"         },
];

export default function HasbledPage() {
  return (
    <div className="flex-1 flex flex-col">
      <header className="bg-white dark:bg-[#131c2e] border-b border-zinc-200 dark:border-white/8 px-6 sm:px-8 py-6">
        <Link href="/dashboard/calculadoras" className="inline-flex items-center gap-1 text-xs text-[#0f2d4a] dark:text-[#4a6a7e] hover:text-[#1a6aad] dark:hover:text-[#3db8d4] mb-3 transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Calculadoras
        </Link>
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#0f2d4a] dark:text-[#e8edf5] mb-1">HAS-BLED</h1>
        <p className="text-[#0f2d4a] dark:text-[#6a8fa5] text-sm">Risco de sangramento maior em pacientes anticoagulados com FA</p>
      </header>

      <main className="flex-1 p-6 sm:p-8">
        <div className="max-w-lg space-y-4">
          <HasbledCalc />

          {/* Alerta importante */}
          <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40 rounded-2xl px-4 py-3.5">
            <svg className="shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
              <span className="font-bold">Importante:</span> pontuação elevada no HAS-BLED <span className="font-semibold">não contraindica a anticoagulação</span>. Deve ser usado para identificar e corrigir fatores de risco modificáveis (HAS não controlada, INR lábil, uso de AINEs, álcool).
            </p>
          </div>

          {/* Tabela de interpretação */}
          <div className="bg-white dark:bg-[#131c2e] rounded-2xl border border-zinc-200 dark:border-white/8 overflow-hidden">
            <div className="px-5 py-3 border-b border-zinc-100 dark:border-white/8">
              <p className="text-xs font-bold text-[#0f2d4a] dark:text-[#6a8fa5] uppercase tracking-wide">Interpretação da pontuação</p>
            </div>
            <div className="divide-y divide-zinc-100 dark:divide-white/6">
              {INTERPRETACAO.map((row) => (
                <div key={row.pontos} className="flex items-center gap-3 px-5 py-3">
                  <span className="w-7 text-center font-extrabold text-sm text-[#0f2d4a] dark:text-[#e8edf5] shrink-0">{row.pontos}</span>
                  <span className={`w-20 text-xs font-semibold shrink-0 ${row.cor}`}>{row.grupo}</span>
                  <span className="w-10 text-xs text-[#0f2d4a] dark:text-[#5a7a8e] shrink-0">{row.risco}</span>
                  <span className="text-xs text-[#0f2d4a] dark:text-[#6a8fa5]">{row.conduta}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="px-1">
            <p className="text-[11px] text-[#0f2d4a] dark:text-[#3a5a70] leading-relaxed">
              <span className="font-semibold">Referência:</span> Pisters R, et al. A Novel User-Friendly Score (HAS-BLED) To Assess 1-Year Risk of Major Bleeding in Patients With Atrial Fibrillation.{" "}
              <em>Chest.</em> 2010;138(5):1093–1100.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
