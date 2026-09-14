"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/admin/metricas", label: "Visão geral", exact: true },
  { href: "/admin/metricas/aquisicao", label: "Aquisição" },
];

export default function MetricasTabs() {
  const pathname = usePathname();
  return (
    <div className="flex gap-1 bg-white/5 rounded-lg p-1 mb-6 w-fit">
      {TABS.map((t) => {
        const active = t.exact ? pathname === t.href : pathname.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              active
                ? "bg-violet-500/20 text-violet-300"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}
