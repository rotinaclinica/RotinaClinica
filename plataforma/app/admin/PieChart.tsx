"use client";

type Slice = { label: string; value: number; color: string };

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function slicePath(cx: number, cy: number, r: number, start: number, end: number) {
  if (end - start >= 360) end = start + 359.999;
  const s = polarToCartesian(cx, cy, r, start);
  const e = polarToCartesian(cx, cy, r, end);
  const large = end - start > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y} Z`;
}

export function PieChart({ title, slices }: { title: string; slices: Slice[] }) {
  const total = slices.reduce((s, sl) => s + sl.value, 0);
  if (total === 0) {
    return (
      <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-4">
        <p className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider mb-3">{title}</p>
        <p className="text-sm text-zinc-400 text-center py-6">Sem dados</p>
      </div>
    );
  }

  let angle = 0;
  const paths = slices
    .filter((sl) => sl.value > 0)
    .map((sl) => {
      const deg = (sl.value / total) * 360;
      const path = slicePath(60, 60, 54, angle, angle + deg);
      angle += deg;
      return { ...sl, path };
    });

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-4">
      <p className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider mb-3">{title}</p>
      <div className="flex flex-col items-center gap-3">
        <svg viewBox="0 0 120 120" className="w-20 h-20 flex-shrink-0">
          {paths.map((sl, i) => (
            <path key={i} d={sl.path} fill={sl.color} stroke="white" strokeWidth="1.5" />
          ))}
          <circle cx="60" cy="60" r="28" fill="white" className="dark:fill-zinc-800" />
          <text x="60" y="63" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#374151" className="dark:fill-zinc-200">
            {total}
          </text>
        </svg>
        <div className="w-full flex flex-col gap-1.5">
          {slices.filter((sl) => sl.value > 0).map((sl, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: sl.color }} />
              <span className="text-xs text-zinc-600 dark:text-zinc-300 flex-1">{sl.label}</span>
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-100 flex-shrink-0">
                {sl.value} <span className="text-zinc-400 font-normal">({Math.round((sl.value / total) * 100)}%)</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
