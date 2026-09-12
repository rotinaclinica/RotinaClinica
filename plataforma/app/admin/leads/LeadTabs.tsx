"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

const TABS = [
  { id: "all", label: "Todos" },
  { id: "converted", label: "Convertidos" },
  { id: "whatsapp", label: "WhatsApp opt-in" },
] as const;

export default function LeadTabs({ counts }: { counts: { all: number; converted: number; whatsapp: number } }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get("tab") || "all";

  function setTab(tab: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (tab === "all") params.delete("tab");
    else params.set("tab", tab);
    params.delete("page");
    router.replace(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex gap-1 border-b border-white/10">
      {TABS.map((t) => (
        <button
          key={t.id}
          onClick={() => setTab(t.id)}
          className={`px-4 py-2.5 text-sm font-semibold transition-colors border-b-2 -mb-px ${
            current === t.id
              ? "border-violet-500 text-violet-300"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          {t.label}
          <span className="ml-1.5 text-xs font-normal text-zinc-500">
            {counts[t.id]}
          </span>
        </button>
      ))}
    </div>
  );
}
