"use client";
import { useState } from "react";
import BroadcastTab from "./BroadcastTab";
import MarketingTab from "@/app/admin/marketing/MarketingTab";

const TABS = [
  { id: "broadcast", label: "Broadcast" },
  { id: "brevo", label: "Marketing — Brevo" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function EmailPage() {
  const [tab, setTab] = useState<TabId>("broadcast");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-zinc-100 mb-1">Email</h1>
        <p className="text-xs text-zinc-500">Envio de emails para assinantes e listas externas</p>
      </div>

      {/* Abas */}
      <div className="flex gap-1 border-b border-white/10">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-sm font-semibold transition-colors border-b-2 -mb-px ${
              tab === t.id
                ? "border-violet-500 text-violet-300"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Conteúdo */}
      {tab === "broadcast" && <BroadcastTab />}
      {tab === "brevo" && <MarketingTab />}
    </div>
  );
}
