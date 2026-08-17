import Link from "next/link";
import PreventCalc from "../PreventCalc";

export const metadata = { title: "PREVENT · Rotina Clínica" };

const METAS_LDL = [
  {
    risco: "Baixo",
    meta: "< 130 mg/dL",
    cor: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    border: "border-emerald-200 dark:border-emerald-700/40",
    definicao: "Sem fatores de risco ou com apenas 1 fator de risco isolado.",
  },
  {
    risco: "Moderado",
    meta: "< 100 mg/dL",
    cor: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-900/20",
    border: "border-blue-200 dark:border-blue-700/40",
    definicao: "2 ou mais fatores de risco; risco cardiovascular calculado entre 5–20%.",
  },
  {
    risco: "Alto",
    meta: "< 70 mg/dL",
    cor: "text-yellow-600 dark:text-yellow-400",
    bg: "bg-yellow-50 dark:bg-yellow-900/20",
    border: "border-yellow-200 dark:border-yellow-700/40",
    definicao: "Aterosclerose subclínica, DM com lesão de órgão-alvo, doença renal crônica estágio 3–4.",
  },
  {
    risco: "Muito alto",
    meta: "< 50 mg/dL",
    cor: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-50 dark:bg-orange-900/20",
    border: "border-orange-200 dark:border-orange-700/40",
    definicao: "Doença aterosclerótica estabelecida (IAM, AVC, DAP) ou DM de alto risco.",
  },
  {
    risco: "Extremo",
    meta: "< 40 mg/dL",
    cor: "text-red-600 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-900/20",
    border: "border-red-200 dark:border-red-700/40",
    definicao: "Múltiplos eventos cardiovasculares (ex: AVC + IAM), ou 1 evento CV + ≥2 condições de alto risco (diabetes, tabagismo, doença renal crônica).",
  },
];

export default function PreventPage() {
  return (
    <div className="flex-1 flex flex-col">
      <header className="bg-white dark:bg-[#131c2e] border-b border-zinc-200 dark:border-white/8 px-6 sm:px-8 py-6">
        <Link href="/dashboard/calculadoras" className="inline-flex items-center gap-1 text-xs text-zinc-400 dark:text-[#4a6a7e] hover:text-[#1a6aad] dark:hover:text-[#3db8d4] mb-3 transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Calculadoras
        </Link>
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#0f2d4a] dark:text-[#e8edf5] mb-1">PREVENT — AHA 2023</h1>
        <p className="text-zinc-500 dark:text-[#6a8fa5] text-sm">Risco cardiovascular total em 10 anos — pacientes 30–79 anos sem DCV conhecida</p>
      </header>

      <main className="flex-1 p-6 sm:p-8">
        <div className="max-w-lg space-y-5">

          {/* Metas de LDL */}
          <div className="bg-white dark:bg-[#131c2e] rounded-2xl border border-zinc-200 dark:border-white/8 overflow-hidden">
            <div className="px-5 py-3 border-b border-zinc-100 dark:border-white/8 flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1a6aad" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <p className="text-xs font-bold text-zinc-500 dark:text-[#6a8fa5] uppercase tracking-wide">Metas de LDL por risco cardiovascular</p>
            </div>
            <div className="divide-y divide-zinc-100 dark:divide-white/6">
              {METAS_LDL.map((row) => (
                <div key={row.risco} className={`px-5 py-3.5 ${row.bg}`}>
                  <div className="flex items-center gap-3 mb-1">
                    <span className={`text-xs font-extrabold w-20 shrink-0 ${row.cor}`}>{row.risco}</span>
                    <span className={`text-sm font-extrabold ${row.cor}`}>{row.meta}</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-[#6a8fa5] leading-relaxed">{row.definicao}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Calculadora PREVENT */}
          <PreventCalc />

          <div className="px-1">
            <p className="text-[11px] text-zinc-400 dark:text-[#3a5a70] leading-relaxed">
              <span className="font-semibold">Referência:</span> Khan SS, et al. Novel Prediction Equations for Absolute Risk Assessment of Total Cardiovascular Disease Incorporating Cardiovascular-Kidney-Metabolic Health.{" "}
              <em>Circulation.</em> 2023;148(24):1982–2004.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
