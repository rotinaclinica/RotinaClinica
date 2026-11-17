"use client";

import { useEffect, useState } from "react";

// Contagem regressiva até o fim da oferta. Renderiza traços no servidor e só
// começa a contar no navegador, para não dar diferença de hidratação.
function useLeft(fim: string) {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    const end = new Date(fim).getTime();
    const tick = () => setLeft(Math.max(0, end - Date.now()));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [fim]);
  const s = left === null ? null : Math.floor(left / 1000);
  return [
    { label: "dias", value: s === null ? null : Math.floor(s / 86400) },
    { label: "horas", value: s === null ? null : Math.floor((s % 86400) / 3600) },
    { label: "min", value: s === null ? null : Math.floor((s % 3600) / 60) },
    { label: "seg", value: s === null ? null : s % 60 },
  ];
}

const pad = (v: number | null) => (v === null ? "--" : String(v).padStart(2, "0"));

export default function Countdown({ fim, compact = false }: { fim: string; compact?: boolean }) {
  const parts = useLeft(fim);

  if (compact) {
    return (
      <span className="tabular-nums font-extrabold" role="timer" aria-label="Tempo restante da oferta">
        {pad(parts[0].value)}d {pad(parts[1].value)}h {pad(parts[2].value)}m {pad(parts[3].value)}s
      </span>
    );
  }

  return (
    <div className="flex items-start justify-center gap-1.5 sm:gap-3" role="timer" aria-label="Tempo restante da oferta">
      {parts.map((p, i) => (
        <div key={p.label} className="flex items-start gap-1.5 sm:gap-3">
          <div className="w-[62px] sm:w-[86px]">
            <div className="rounded-xl bg-[#ffd60a] py-2.5 sm:py-3 text-2xl sm:text-4xl font-black tabular-nums text-black shadow-[0_6px_0_#b39400]">
              {pad(p.value)}
            </div>
            <div className="mt-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-white/60">{p.label}</div>
          </div>
          {i < parts.length - 1 && <span className="pt-2 sm:pt-3 text-2xl sm:text-3xl font-black text-[#ffd60a]/60">:</span>}
        </div>
      ))}
    </div>
  );
}
