export const dynamic = "force-dynamic";
export const metadata = { title: "CID-10 · Rotina Clínica" };

import Link from "next/link";
import CidSearch from "./CidSearch";

export default function CidPage() {
  return (
    <div className="flex-1 flex flex-col">
      <header className="bg-white dark:bg-[#131c2e] border-b border-zinc-200 dark:border-white/8 px-6 sm:px-8 py-6">
        <Link href="/dashboard" className="inline-flex items-center gap-1 text-xs text-[#0f2d4a] dark:text-[#4a6a7e] hover:text-[#1a6aad] dark:hover:text-[#3db8d4] mb-3 transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Início
        </Link>
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#0f2d4a] dark:text-[#e8edf5]">CID-10</h1>
        <p className="text-[#0f2d4a] dark:text-[#6a8fa5] text-sm mt-0.5">
          Busque por código ou nome da doença — {new Intl.NumberFormat("pt-BR").format(12451)} diagnósticos da Classificação Internacional de Doenças.
        </p>
      </header>

      <main className="flex-1 p-6 sm:p-8 max-w-3xl">
        <CidSearch />
      </main>
    </div>
  );
}
