import Link from "next/link";
import AguaLivreCalc from "../AguaLivreCalc";

export const metadata = { title: "Déficit de Água Livre · Rotina Clínica" };

export default function AguaLivrePage() {
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
          Déficit de Água Livre
        </h1>
        <p className="text-[#0f2d4a] dark:text-[#6a8fa5] text-sm">
          Hipernatremia — cálculo do volume de reposição hídrica
        </p>
      </header>

      <main className="flex-1 p-6 sm:p-8">
        <div className="max-w-lg space-y-4">
          <AguaLivreCalc />
          <div className="px-1 space-y-2">
            <p className="text-[11px] text-[#0f2d4a] dark:text-[#3a5a70] leading-relaxed">
              <span className="font-semibold">Fórmula:</span> Déficit de água livre (L) = Fração da água corporal total × Peso (kg) × (Sódio atual / Sódio desejado − 1). A fração da água corporal total varia conforme sexo e faixa etária: homem adulto 60%, mulher adulta 50%, homem idoso 50%, mulher idosa 45%, criança 60%.
            </p>
            <p className="text-[11px] text-[#0f2d4a] dark:text-[#3a5a70] leading-relaxed">
              <span className="font-semibold">Referência:</span> Adrogue HJ, Madias NE. Hypernatremia.{" "}
              <em>N Engl J Med.</em> 2000;342(20):1493–1499.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
