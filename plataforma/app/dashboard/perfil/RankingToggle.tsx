"use client";

import { useState, useTransition } from "react";
import { definirParticipacaoRanking } from "./actions";

export default function RankingToggle({ participa: inicial }: { participa: boolean }) {
  const [participa, setParticipa] = useState(inicial);
  const [pendente, startTransition] = useTransition();
  const [erro, setErro] = useState("");

  function alternar() {
    const novo = !participa;
    setParticipa(novo);
    setErro("");
    startTransition(async () => {
      const ok = await definirParticipacaoRanking(novo);
      if (!ok) {
        setParticipa(!novo);
        setErro("Não foi possível salvar. Tente novamente.");
      }
    });
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[#0f2d4a] dark:text-white">Aparecer no ranking do Desafio Diário</p>
          <p className="text-xs text-[#0f2d4a]/70 dark:text-[#bccbd8] mt-1 leading-relaxed">
            No ranking aparece só o seu primeiro nome e as iniciais dos sobrenomes (ex: Lucas R. D.), com seus acertos e dias de ofensiva.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={participa}
          onClick={alternar}
          disabled={pendente}
          className={`relative shrink-0 w-11 h-6 rounded-full transition-colors disabled:opacity-60 ${
            participa ? "bg-[#1a6aad] dark:bg-[#3db8d4]" : "bg-zinc-300 dark:bg-white/20"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${participa ? "translate-x-5" : ""}`}
          />
        </button>
      </div>
      {erro && <p className="text-xs text-red-500 mt-2">{erro}</p>}
    </div>
  );
}
