import Link from "next/link";
import ChildPughCalc from "../ChildPughCalc";

export const metadata = { title: "Child-Pugh · Rotina Clínica" };

export default function ChildPughPage() {
  return (
    <div className="flex-1 flex flex-col">
      <header className="bg-white dark:bg-[#131c2e] border-b border-zinc-200 dark:border-white/8 px-6 sm:px-8 py-6">
        <Link href="/dashboard/calculadoras" className="inline-flex items-center gap-1 text-xs text-zinc-400 dark:text-[#4a6a7e] hover:text-[#1a6aad] dark:hover:text-[#3db8d4] mb-3 transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Calculadoras
        </Link>
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#0f2d4a] dark:text-[#e8edf5] mb-1">Child-Pugh</h1>
        <p className="text-zinc-500 dark:text-[#6a8fa5] text-sm">Gravidade da cirrose hepática</p>
      </header>

      <main className="flex-1 p-6 sm:p-8">
        <div className="max-w-lg space-y-4">
          <ChildPughCalc />
          <div className="px-1">
            <p className="text-[11px] text-zinc-400 dark:text-[#3a5a70] leading-relaxed">
              <span className="font-semibold">Referência:</span> Pugh RN, et al. Transection of the oesophagus for bleeding oesophageal varices.{" "}
              <em>Br J Surg.</em> 1973;60(8):646–649.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
