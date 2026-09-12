"use client";

import { useState } from "react";

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  profile: string | null;
  state: string | null;
  university: string | null;
  doePlantoes: string | null;
  whatsappOptIn: boolean;
  productTitle: string | null;
  createdAt: string;
  converted: boolean;
}

function Detail({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div>
      <span className="text-[10px] uppercase tracking-wider text-zinc-500">{label}</span>
      <p className="text-sm text-zinc-300">{value}</p>
    </div>
  );
}

export default function LeadRow({ lead }: { lead: Lead }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <tr
        onClick={() => setOpen(!open)}
        className="border-b border-white/5 last:border-0 hover:bg-white/5 cursor-pointer transition-colors"
      >
        <td className="px-4 py-3">
          <div className="font-medium text-zinc-100 leading-tight">{lead.name || "—"}</div>
          <div className="text-xs text-zinc-500 mt-0.5">{lead.email}</div>
        </td>
        <td className="px-4 py-3 text-zinc-400 text-sm hidden sm:table-cell">{lead.profile || "—"}</td>
        <td className="px-4 py-3 text-zinc-400 text-xs hidden md:table-cell">{lead.productTitle || "—"}</td>
        <td className="px-4 py-3 text-zinc-400 text-xs whitespace-nowrap hidden lg:table-cell">{lead.createdAt}</td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            {lead.converted && (
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                Convertido
              </span>
            )}
            {lead.whatsappOptIn && (
              <span className="bg-green-500/20 text-green-300 text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                WhatsApp
              </span>
            )}
          </div>
        </td>
        <td className="px-2 py-3 text-zinc-500">
          <svg
            className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </td>
      </tr>
      {open && (
        <tr className="bg-white/[0.02]">
          <td colSpan={6} className="px-4 py-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              <Detail label="Telefone" value={lead.phone} />
              <Detail label="Estado" value={lead.state} />
              <Detail label="Universidade" value={lead.university} />
              <Detail label="Faz plantão" value={lead.doePlantoes} />
              <Detail label="WhatsApp opt-in" value={lead.whatsappOptIn ? "Sim" : "Não"} />
              <Detail label="Produto" value={lead.productTitle} />
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
