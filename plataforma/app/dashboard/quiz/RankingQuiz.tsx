"use client";

import { useState } from "react";
import Link from "next/link";
import type { LinhaRanking, Ranking } from "@/lib/quiz-ranking";

type Aba = "mensal" | "geral";

const MEDALHAS = ["🥇", "🥈", "🥉"];

function Linha({ l }: { l: LinhaRanking }) {
  return (
    <li
      className={`flex items-center gap-3 px-3 sm:px-4 py-2.5 rounded-xl ${
        l.souEu
          ? "bg-[#e8f4fc] dark:bg-[#3db8d4]/15 ring-1 ring-[#1a6aad]/25 dark:ring-[#3db8d4]/40"
          : "bg-[#f5f8fb] dark:bg-white/5"
      }`}
    >
      <span className="w-7 text-center text-base font-extrabold text-[#1a6aad] dark:text-[#3db8d4] shrink-0">
        {MEDALHAS[l.posicao - 1] ?? `${l.posicao}º`}
      </span>
      <span className="flex-1 min-w-0 truncate text-sm font-semibold text-[#0f2d4a] dark:text-white">
        {l.nome}
        {l.souEu && <span className="ml-1.5 text-xs font-bold text-[#1a6aad] dark:text-[#3db8d4]">(você)</span>}
      </span>
      <span className="text-sm font-bold text-[#0f2d4a] dark:text-[#e8edf5] tabular-nums shrink-0" title="Acertos">
        🎯 {l.acertos}
      </span>
      <span className="w-14 text-right text-sm font-bold text-amber-700 dark:text-amber-400 tabular-nums shrink-0" title="Dias de ofensiva">
        🔥 {l.ofensiva}
      </span>
    </li>
  );
}

export default function RankingQuiz({
  mensal,
  geral,
  participa,
  equipe,
  nomeMes,
}: {
  mensal: Ranking;
  geral: Ranking;
  participa: boolean;
  equipe: boolean;
  nomeMes: string;
}) {
  const [aba, setAba] = useState<Aba>("mensal");
  const r = aba === "mensal" ? mensal : geral;
  const euForaDoTop = r.eu && r.eu.posicao > r.top.length;

  return (
    <section
      id="ranking"
      className="scroll-mt-6 max-w-2xl mx-auto mt-10 bg-white dark:bg-[#172741] border border-[#d9e3ec] dark:border-white/12 rounded-2xl p-4 sm:p-6"
    >
      <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
        <h2 className="text-base sm:text-lg font-extrabold text-[#0f2d4a] dark:text-white">🏆 Ranking do Desafio</h2>
        <div className="flex gap-1 bg-[#eef3f8] dark:bg-white/8 rounded-xl p-1">
          {(["mensal", "geral"] as const).map((a) => (
            <button
              key={a}
              onClick={() => setAba(a)}
              className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                aba === a
                  ? "bg-white dark:bg-[#1e3654] text-[#0f2d4a] dark:text-white shadow-sm"
                  : "text-[#0f2d4a]/70 dark:text-[#bccbd8] hover:text-[#0f2d4a] dark:hover:text-white"
              }`}
            >
              {a === "mensal" ? nomeMes : "Todos os tempos"}
            </button>
          ))}
        </div>
      </div>

      {r.top.length === 0 ? (
        <p className="text-sm text-[#0f2d4a]/70 dark:text-[#bccbd8] py-6 text-center">
          Ninguém pontuou ainda{aba === "mensal" ? " neste mês" : ""}. Responda o desafio de hoje e saia na frente!
        </p>
      ) : (
        <ol className="space-y-2">
          {r.top.map((l) => (
            <Linha key={l.posicao} l={l} />
          ))}
          {euForaDoTop && r.eu && (
            <>
              <li className="text-center text-[#0f2d4a]/40 dark:text-[#9fb5c7] leading-none select-none" aria-hidden>⋯</li>
              <Linha l={r.eu} />
            </>
          )}
        </ol>
      )}

      <p className="text-xs text-[#0f2d4a]/60 dark:text-[#a3b8c9] mt-4">
        {aba === "mensal"
          ? "Soma dos acertos no mês; zera todo dia 1º. Empate: maior ofensiva."
          : "Soma de todos os acertos desde o primeiro desafio. Empate: maior ofensiva."}{" "}
        {equipe ? (
          "Contas da equipe não entram no ranking."
        ) : participa ? (
          <>
            Não quer aparecer?{" "}
            <Link href="/dashboard/perfil#ranking" className="font-semibold text-[#1a6aad] dark:text-[#3db8d4] hover:underline">
              Ajuste no perfil
            </Link>
            .
          </>
        ) : (
          <>
            Você não está aparecendo no ranking.{" "}
            <Link href="/dashboard/perfil#ranking" className="font-semibold text-[#1a6aad] dark:text-[#3db8d4] hover:underline">
              Mudar no perfil
            </Link>
            .
          </>
        )}
      </p>
    </section>
  );
}
