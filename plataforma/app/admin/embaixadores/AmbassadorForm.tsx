"use client";

import { useState } from "react";
import { makeAmbassador } from "./actions";

export function AmbassadorForm() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<{ type: "error" | "success"; msg: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    const fd = new FormData();
    fd.append("email", email);
    fd.append("code", code);
    const result = await makeAmbassador(fd);
    setLoading(false);
    if (result?.error) setStatus({ type: "error", msg: result.error });
    else { setStatus({ type: "success", msg: "Embaixador ativado com sucesso!" }); setEmail(""); setCode(""); }
  }

  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-6 max-w-lg">
      <h2 className="text-sm font-bold text-zinc-900 mb-4">Adicionar embaixador</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-zinc-500 mb-1.5">E-mail do usuário</label>
          <input
            type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="medico@email.com"
            className="w-full text-sm px-3 py-2 rounded-lg border border-zinc-200 bg-white text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-zinc-500 mb-1.5">Código do embaixador</label>
          <input
            type="text" required value={code} onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
            placeholder="Ex: DRJOAO" maxLength={20}
            className="w-full text-sm px-3 py-2 rounded-lg border border-zinc-200 bg-white text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300 uppercase tracking-widest font-mono"
          />
          <p className="text-[11px] text-zinc-400 mt-1">Somente letras e números, sem espaços (3–20 caracteres).</p>
        </div>
        {status && (
          <p className={`text-xs font-medium ${status.type === "error" ? "text-red-500" : "text-emerald-600"}`}>{status.msg}</p>
        )}
        <button type="submit" disabled={loading}
          className="px-4 py-2 text-sm font-semibold bg-zinc-900 text-white rounded-lg hover:bg-zinc-700 transition-colors disabled:opacity-50">
          {loading ? "Salvando…" : "Adicionar embaixador"}
        </button>
      </form>
    </div>
  );
}
