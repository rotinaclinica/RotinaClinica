import Link from "next/link";
import CasosContent from "./CasosContent";

export const metadata = { title: "Casos Clínicos · Rotina Clínica" };

export default function CasosPage() {
  return (
    <div className="flex-1 flex flex-col">
      <header className="bg-white dark:bg-[radial-gradient(700px_220px_at_15%_0%,rgba(61,184,212,0.16),transparent_70%),linear-gradient(180deg,#1a3050_0%,#142540_100%)] border-b border-[#d9e3ec] dark:border-white/12 px-6 sm:px-8 py-6">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1a6aad] dark:text-[#3db8d4] hover:text-[#0f2d4a] dark:hover:text-white mb-4 transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Início
        </Link>
        <h1 className="text-xl sm:text-2xl dark:sm:text-3xl font-extrabold text-[#0f2d4a] dark:text-white mb-1">Casos <span className="text-[#1a6aad] dark:text-[#3db8d4]">Clínicos</span></h1>
        <p className="text-[#0f2d4a] dark:text-[#bccbd8] text-sm">Um novo caso toda semana com raciocínio diagnóstico e conduta.</p>
      </header>
      <CasosContent />
    </div>
  );
}
