"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { SECOES_NOVIDADE, type GrupoNovidade } from "@/lib/novidades";

// Grupos que o usuário já abriu ou dispensou (só neste navegador)
const STORAGE_KEY = "rc_novidades_vistas";
const EVENTO = "rc-novidades-vistas";

function lerRaw(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? "[]";
  } catch {
    return "[]";
  }
}

function parse(raw: string): string[] {
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

function salvarVista(chave: string, notificar = false) {
  try {
    const atuais = parse(lerRaw());
    if (!atuais.includes(chave)) localStorage.setItem(STORAGE_KEY, JSON.stringify([...atuais, chave].slice(-100)));
    if (notificar) window.dispatchEvent(new Event(EVENTO));
  } catch {}
}

function assinar(cb: () => void) {
  window.addEventListener(EVENTO, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENTO, cb);
    window.removeEventListener("storage", cb);
  };
}

function quando(data: string) {
  const hoje = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
  const ref = new Date(`${data}T00:00:00`);
  const dias = Math.round((new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()).getTime() - ref.getTime()) / 86_400_000);
  if (dias <= 0) return "hoje";
  if (dias === 1) return "ontem";
  return `há ${dias} dias`;
}

type Grupo = GrupoNovidade & { bloqueado: boolean };

export default function NovidadesCard({ grupos }: { grupos: Grupo[] }) {
  // No servidor não há localStorage: renderiza nada e mostra só no navegador (evita piscar para quem já viu)
  const raw = useSyncExternalStore(assinar, lerRaw, () => null);
  // Abrir "Ver todas" marca como visto, mas o grupo só some na próxima visita
  const [vistosNaSessao] = useState(() => new Set<string>());
  const [aberto, setAberto] = useState<string | null>(null);

  if (raw === null) return null;
  const ocultos = parse(raw);
  const visiveis = grupos.filter((g) => !ocultos.includes(g.chave) || vistosNaSessao.has(g.chave)).slice(0, 3);
  if (visiveis.length === 0) return null;

  const marcarVisto = (chave: string) => {
    vistosNaSessao.add(chave);
    salvarVista(chave);
  };
  const dispensar = (chave: string) => {
    vistosNaSessao.delete(chave);
    salvarVista(chave, true);
  };

  return (
    <section className="mb-8 bg-white dark:bg-[#131c2e] border border-[#3db8d4]/50 rounded-2xl p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-3">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1a6aad" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="dark:stroke-[#3db8d4]">
          <path d="M12 3l1.9 5.8L20 10l-6.1 1.2L12 17l-1.9-5.8L4 10l6.1-1.2z" />
        </svg>
        <h2 className="text-sm sm:text-base font-extrabold text-[#0f2d4a] dark:text-white">Novidades na plataforma</h2>
      </div>

      <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5 items-start">
        {visiveis.map((g) => {
          const s = SECOES_NOVIDADE[g.secao];
          const varios = g.itens.length > 1;
          const titulo = varios
            ? `${g.itens.length} ${s.plural}`
            : g.itens[0].titulo;
          const resumo = varios
            ? g.itens.slice(0, 3).map((i) => i.titulo).join(", ") + (g.itens.length > 3 ? ` e mais ${g.itens.length - 3}` : "")
            : null;
          const destino = g.bloqueado ? "/assinatura?motivo=teste" : varios ? s.rota : g.itens[0].href;

          return (
            <li key={g.chave} className="rounded-xl border border-zinc-200 dark:border-white/8 bg-[#f8fbfd] dark:bg-white/[0.03] px-3.5 py-3">
              <div className="flex items-start gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#3db8d4]/15 dark:bg-[#3db8d4]/20 text-[#1a6aad] dark:text-[#3db8d4]">Novo</span>
                    <span className="text-[11px] text-[#4a6a7e] dark:text-[#8aa3b8]">{s.label} · {quando(g.data)}</span>
                    {g.bloqueado && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-white/10 text-zinc-600 dark:text-[#a9bccd]">🔒 Para assinantes</span>
                    )}
                  </div>
                  <p className="text-sm font-bold text-[#0f2d4a] dark:text-[#e8edf5] leading-snug">{titulo}</p>
                  {resumo && aberto !== g.chave && <p className="text-xs text-[#4a6a7e] dark:text-[#8aa3b8] mt-0.5 leading-relaxed">{resumo}</p>}
                </div>
                <button
                  onClick={() => dispensar(g.chave)}
                  aria-label="Dispensar novidade"
                  className="-mr-1 -mt-1 w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg text-[#7f9db5] hover:text-[#0f2d4a] dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/8"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
              </div>

              {varios && !g.bloqueado && aberto === g.chave && (
                <ul className="mt-2 flex flex-col gap-0.5">
                  {g.itens.map((i) => (
                    <li key={i.href}>
                      <Link href={i.href} onClick={() => marcarVisto(g.chave)} className="block py-1.5 text-[13px] font-semibold text-[#1a6aad] dark:text-[#3db8d4] hover:underline">
                        {i.titulo} →
                      </Link>
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-2">
                {varios && !g.bloqueado ? (
                  <button
                    onClick={() => { setAberto(aberto === g.chave ? null : g.chave); marcarVisto(g.chave); }}
                    className="inline-flex items-center text-xs font-bold text-[#1a6aad] dark:text-[#3db8d4] py-1.5 hover:underline"
                  >
                    {aberto === g.chave ? "Fechar lista" : `Ver todas (${g.itens.length}) →`}
                  </button>
                ) : (
                  <Link
                    href={destino}
                    onClick={() => marcarVisto(g.chave)}
                    className="inline-flex items-center text-xs font-bold text-[#1a6aad] dark:text-[#3db8d4] py-1.5 hover:underline"
                  >
                    {g.bloqueado ? "Conhecer a assinatura" : s.acao} →
                  </Link>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
