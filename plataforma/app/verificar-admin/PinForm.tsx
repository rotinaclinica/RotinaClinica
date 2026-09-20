"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PinForm({ nextPath }: { nextPath: string }) {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pin.length !== 6 || loading) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/verify-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "PIN incorreto.");
        setPin("");
        inputRef.current?.focus();
        return;
      }
      router.push(nextPath);
      router.refresh();
    } catch {
      setError("Erro de conexão.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        ref={inputRef}
        type="password"
        inputMode="numeric"
        pattern="\d{6}"
        maxLength={6}
        autoComplete="one-time-code"
        value={pin}
        onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
        placeholder="••••••"
        className="w-full text-center font-mono text-2xl tracking-[0.5em] bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
        disabled={loading}
      />
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
          <p className="text-red-300 text-xs text-center">{error}</p>
        </div>
      )}
      <button
        type="submit"
        disabled={pin.length !== 6 || loading}
        className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm py-3 rounded-xl transition-colors"
      >
        {loading ? "Verificando..." : "Entrar no admin"}
      </button>
      <p className="text-[10px] text-zinc-500 text-center">
        A verificação vale por 4 horas neste navegador.
      </p>
    </form>
  );
}
