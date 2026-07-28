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
    try {
      const res = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Erro ao alterar senha."); return; }
      setSuccess(true);
      setCurrent(""); setNext(""); setConfirm("");
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
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
            <label className="block text-sm font-semibold text-zinc-700 mb-1.5">{label}</label>
            <input
              type="password"
              value={val}
              onChange={(e) => set(e.target.value)}
              required
              minLength={i === 0 ? 1 : 8}
              placeholder="••••••••"
              className="w-full border border-zinc-300 rounded-xl px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#1a6aad] focus:border-transparent"
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
