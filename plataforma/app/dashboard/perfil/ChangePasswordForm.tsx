"use client";

import { useState } from "react";

export default function ChangePasswordForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const mismatch = confirm.length > 0 && confirm !== next;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setSuccess(false);
    if (next !== confirm) { setError("As senhas não coincidem."); return; }
    if (next.length < 8) { setError("Nova senha mínima de 8 caracteres."); return; }

    setLoading(true);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const res = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
        signal: controller.signal,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data.error ?? "Erro ao alterar senha."); return; }
      setSuccess(true);
      setCurrent(""); setNext(""); setConfirm("");
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        setError("Tempo limite excedido. Tente novamente.");
      } else {
        setError("Erro de conexão. Tente novamente.");
      }
    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {["Senha atual", "Nova senha", "Confirmar nova senha"].map((label, i) => {
        const val = [current, next, confirm][i];
        const set = [setCurrent, setNext, setConfirm][i];
        return (
          <div key={label}>
            <label className="block text-sm font-semibold text-zinc-700 dark:text-[#c8dce8] mb-1.5">{label}</label>
            <input
              type="password"
              value={val}
              onChange={(e) => set(e.target.value)}
              required
              minLength={i === 0 ? 1 : 8}
              placeholder="••••••••"
              className="w-full border border-zinc-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-[#e8edf5] bg-white dark:bg-[#1a2d45] placeholder:text-zinc-400 dark:placeholder:text-[#4a6a7e] focus:outline-none focus:ring-2 focus:ring-[#1a6aad] dark:focus:ring-[#3db8d4] focus:border-transparent"
            />
          </div>
        );
      })}

      {mismatch && <p className="text-red-500 text-xs">As senhas não coincidem.</p>}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5">
          <p className="text-emerald-700 text-sm font-medium">Senha alterada com sucesso!</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || mismatch}
        className="w-full sm:w-auto bg-[#1a6aad] hover:bg-[#0f2d4a] disabled:opacity-40 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all"
      >
        {loading ? "Salvando..." : "Alterar senha"}
      </button>
    </form>
  );
}
