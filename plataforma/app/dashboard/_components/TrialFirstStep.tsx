"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Atalhos para condutas de alta procura no plantão (IDs de lib/prescricoes-meta.ts)
const ATALHOS = [
  { label: "Dor torácica", id: "200" },
  { label: "Crise hipertensiva", id: "199" },
  { label: "Sepse", id: "7" },
];

/**
 * Primeira sessão do teste grátis: em vez de um painel para explorar, uma tarefa.
 * A pessoa digita o último caso que atendeu e cai direto na busca de condutas.
 */
export default function TrialFirstStep() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // Foco automático só no computador: no celular abriria o teclado sem a pessoa pedir
  useEffect(() => {
    if (window.matchMedia("(min-width: 1024px) and (pointer: fine)").matches) inputRef.current?.focus();
  }, []);

  function buscar(e: React.FormEvent) {
    e.preventDefault();
    const q = inputRef.current?.value.trim();
    router.push(q ? `/dashboard/prescricoes?q=${encodeURIComponent(q)}` : "/dashboard/prescricoes");
  }

  return (
    <section className="mb-8 rounded-2xl border-2 border-[#3db8d4]/60 bg-white dark:bg-[#172741] p-5 sm:p-6">
      <p className="text-xs font-bold uppercase tracking-wider text-[#1a6aad] dark:text-[#3db8d4]">Comece por aqui</p>
      <h2 className="mt-1 text-lg sm:text-xl font-extrabold text-[#0f2d4a] dark:text-white leading-snug">
        Qual foi o último caso que você atendeu?
      </h2>
      <p className="mt-1 text-sm text-[#0f2d4a]/85 dark:text-[#bccbd8]">
        Digite a queixa, o diagnóstico ou o medicamento e veja a conduta pronta em segundos.
      </p>

      <form onSubmit={buscar} className="mt-4 flex flex-col sm:flex-row gap-2 max-w-xl">
        <div className="relative flex-1">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0f2d4a] dark:text-[#9fb5c7]" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            ref={inputRef}
            type="search"
            enterKeyHint="search"
            aria-label="Buscar conduta"
            placeholder="Ex: pneumonia, cefaleia, amoxicilina..."
            className="w-full pl-11 pr-4 py-3 border border-zinc-300 dark:border-white/15 rounded-2xl text-sm text-zinc-900 dark:text-[#e8edf5] placeholder:text-zinc-400 dark:placeholder:text-[#9fb5c7] focus:outline-none focus:ring-2 focus:ring-[#1a6aad] dark:focus:ring-[#3db8d4] focus:border-transparent bg-[#f8fafc] dark:bg-[#112036]"
          />
        </div>
        <button type="submit" className="shrink-0 text-sm font-bold bg-[#3db8d4] hover:bg-[#2fa6c2] text-[#0a1626] px-5 py-3 rounded-2xl transition-colors">
          Ver conduta
        </button>
      </form>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-[#0f2d4a]/80 dark:text-[#bccbd8]">Ou veja agora:</span>
        {ATALHOS.map((a) => (
          <Link
            key={a.id}
            href={`/dashboard/prescricoes?id=${a.id}`}
            className="text-xs font-bold px-3 py-1.5 rounded-full border border-[#1a6aad]/30 dark:border-[#3db8d4]/40 text-[#1a6aad] dark:text-[#3db8d4] hover:bg-[#e8f6fa] dark:hover:bg-white/5 transition-colors"
          >
            {a.label}
          </Link>
        ))}
      </div>
    </section>
  );
}
