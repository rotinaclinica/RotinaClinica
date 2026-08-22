"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/app/components/Navbar";

function RedefinirSenhaForm() {
  const params = useSearchParams();
  const router = useRouter();
  const email = params.get("email") ?? "";
  const exp = params.get("exp") ?? "";
  const token = params.get("token") ?? "";

  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    if (!email || !exp || !token) { setExpired(true); return; }
    if (Math.floor(Date.now() / 1000) > Number(exp)) setExpired(true);
  }, [email, exp, token]);

  const mismatch = confirm.length > 0 && confirm !== newPassword;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirm) { setError("As senhas não coincidem."); return; }
    if (newPassword.length < 8) { setError("Mínimo de 8 caracteres."); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/redefinir-senha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, exp, token, newPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data.error ?? "Erro ao redefinir senha."); return; }
      setSuccess(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f0f5f9] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-4">
          <Link href="/"><Logo /></Link>
          <span className="text-xs font-bold uppercase tracking-widest text-[#1a6aad] bg-[#e8f4fd] px-3 py-1 rounded-full border border-blue-100">
            Nova senha
          </span>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-8">
          {expired ? (
            <div className="text-center">
              <p className="text-zinc-700 font-semibold mb-2">Link expirado ou inválido</p>
              <p className="text-zinc-500 text-sm mb-5">Solicite um novo link de recuperação.</p>
              <Link href="/recuperar-senha" className="inline-block bg-[#1a6aad] text-white px-6 py-2.5 rounded-xl font-bold text-sm">
                Recuperar senha
              </Link>
            </div>
          ) : success ? (
            <div className="text-center">
              <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
              </div>
              <h2 className="text-lg font-extrabold text-[#0f2d4a] mb-2">Senha redefinida!</h2>
              <p className="text-zinc-500 text-sm">Redirecionando para o login...</p>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-extrabold text-[#0f2d4a] mb-1">Criar nova senha</h1>
              <p className="text-zinc-500 text-sm mb-6">Escolha uma senha com pelo menos 8 caracteres.</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {[
                  { label: "Nova senha", val: newPassword, set: setNewPassword },
                  { label: "Confirmar nova senha", val: confirm, set: setConfirm },
                ].map(({ label, val, set }) => (
                  <div key={label}>
                    <label className="block text-sm font-semibold text-zinc-700 mb-1.5">{label}</label>
                    <input
                      type="password"
                      value={val}
                      onChange={(e) => set(e.target.value)}
                      required
                      minLength={8}
                      placeholder="••••••••"
                      className="w-full border border-zinc-300 rounded-xl px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#1a6aad] focus:border-transparent"
                    />
                  </div>
                ))}

                {mismatch && <p className="text-red-500 text-xs">As senhas não coincidem.</p>}

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || mismatch}
                  className="w-full bg-[#1a6aad] hover:bg-[#0f2d4a] disabled:opacity-40 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all"
                >
                  {loading ? "Salvando..." : "Salvar nova senha"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RedefinirSenhaPage() {
  return (
    <Suspense>
      <RedefinirSenhaForm />
    </Suspense>
  );
}
