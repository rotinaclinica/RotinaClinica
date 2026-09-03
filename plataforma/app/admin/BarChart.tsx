"use client";

type Bar = { label: string; value: number; current?: boolean };

function fmtBRL(cents: number) {
  if (cents === 0) return "R$0";
  if (cents >= 100000) return `R$${(cents / 100000).toFixed(1).replace(".", ",")}k`;
  return `R$${Math.round(cents / 100)}`;
}

export function BarChart({ title, bars }: { title: string; bars: Bar[] }) {
  const max = Math.max(...bars.map((b) => b.value), 1);
  const W = 480;
  const H = 140;
  const PAD_L = 4;
  const PAD_R = 4;
  const PAD_TOP = 28;
  const PAD_BOT = 22;
  const chartH = H - PAD_TOP - PAD_BOT;
  const n = bars.length;
  const barW = Math.floor((W - PAD_L - PAD_R) / n);
  const gap = Math.max(2, Math.floor(barW * 0.18));
  const bw = barW - gap;

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-4 col-span-full">
      <p className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider mb-3">{title}</p>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
        {bars.map((bar, i) => {
          const x = PAD_L + i * barW + gap / 2;
          const barH = Math.max(2, Math.round((bar.value / max) * chartH));
          const y = PAD_TOP + chartH - barH;
          const color = bar.current ? "#6366f1" : "#a5b4fc";
          const labelY = y - 4;
          return (
            <g key={i}>
              <rect x={x} y={y} width={bw} height={barH} rx={3} fill={color} />
              {bar.value > 0 && (
                <text
                  x={x + bw / 2}
                  y={labelY}
                  textAnchor="middle"
                  fontSize="9"
                  fill={bar.current ? "#4f46e5" : "#6b7280"}
                  fontWeight={bar.current ? "700" : "400"}
                >
                  {fmtBRL(bar.value)}
                </text>
              )}
              <text
                x={x + bw / 2}
                y={H - 6}
                textAnchor="middle"
                fontSize="9"
                fill={bar.current ? "#4f46e5" : "#9ca3af"}
                fontWeight={bar.current ? "700" : "400"}
              >
                {bar.label}
              </text>
            </g>
          );
        })}
      </svg>
      <p className="text-[10px] text-zinc-400 mt-1">Barra roxa = mês atual</p>
    </div>
  );
}
