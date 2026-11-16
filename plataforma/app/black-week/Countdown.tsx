"use client";

import { useEffect, useState } from "react";

// Contagem regressiva até o fim da oferta. Renderiza traços no servidor e só
// começa a contar no navegador, para não dar diferença de hidratação.
export default function Countdown({ fim }: { fim: string }) {
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    const end = new Date(fim).getTime();
    const tick = () => setLeft(Math.max(0, end - Date.now()));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [fim]);

  const s = left === null ? null : Math.floor(left / 1000);
  const parts = [
    { label: "dias", value: s === null ? null : Math.floor(s / 86400) },
    { label: "horas", value: s === null ? null : Math.floor((s % 86400) / 3600) },
    { label: "min", value: s === null ? null : Math.floor((s % 3600) / 60) },
    { label: "seg", value: s === null ? null : s % 60 },
  ];

  return (
    <div className="flex items-start justify-center gap-2 sm:gap-3" role="timer" aria-label="Tempo restante da oferta">
      {parts.map((p, i) => (
        <div key={p.label} className="flex items-start gap-2 sm:gap-3">
          <div className="w-[64px] sm:w-[84px]">
            <div className="rounded-xl border border-white/10 bg-white/[0.06] py-2.5 sm:py-3 text-2xl sm:text-4xl font-extrabold tabular-nums text-white backdrop-blur-sm">
              {p.value === null ? "--" : String(p.value).padStart(2, "0")}
            </div>
            <div className="mt-1.5 text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-[#7f93a8]">{p.label}</div>
          </div>
          {i < parts.length - 1 && <span className="pt-2 sm:pt-3 text-2xl sm:text-3xl font-bold text-white/25">:</span>}
        </div>
      ))}
    </div>
  );
}
