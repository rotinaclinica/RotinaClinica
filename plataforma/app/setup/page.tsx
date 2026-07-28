"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/app/components/Navbar";

type Step = "loading" | "done-all" | "admin" | "tester" | "complete";

function Field({ label, hint, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-zinc-700 mb-1.5">
        {label} {hint && <span className="text-zinc-400 font-normal">{hint}</span>}
      </label>
      <input
        {...props}
        className="w-full border border-zinc-300 rounded-xl px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#1a6aad] focus:border-transparent"
      />
    </div>
  );
}

export default function SetupPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("loading");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/setup")
      .then((r) => {
        if (!r.ok) throw new Error("api_error");
        return r.json();
      })
      .then((d) => {
        if (d.adminExists && d.testerExists) setStep("done-all");
        else if (d.adminExists) setStep("tester");
        else setStep("admin");
      })
      .catch(() => setStep("admin"));
  }, []);

  function resetForm() {
    setName(""); setEmail(""); setPassword(""); setConfirm(""); setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirm) { setError("As senhas não coincidem."); return; }
    if (password.length < 8) { setError("Senha mínima de 8 caracteres."); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: step, name, email, password }),
      });

      if (!res.ok) {
        let msg = "Erro ao criar conta.";
        try { const d = await res.json(); msg = d.error ?? msg; } catch {}
        setError(msg);
        return;
      }

      if (step === "admin") { resetForm(); setStep("tester"); }
      else { setStep("complete"); setTimeout(() => router.push("/login"), 2500); }
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  const mismatch = confirm.length > 0 && confirm !== password;

  if (step === "loading") return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f7ff]">
      <div className="w-6 h-6 border-2 border-[#1a6aad] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen flex bg-[#f0f7ff]">
      {/* Painel esquerdo */}
      <div className="hidden lg:flex flex-col justify-between w-96 bg-[#0f2d4a] p-10">
        <Link href="/"><Logo variant="light" /></Link>
        <div className="space-y-4">
          <div className="w-10 h-10 rounded-xl bg-[#3db8d4]/20 border border-[#3db8d4]/30 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3db8d4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <div>
            <p className="text-white font-extrabold text-lg">Configuração inicial</p>
            <p className="text-[#9ec4de] text-sm leading-relaxed mt-1">
              {step === "admin" && "Passo 1 de 2 — crie a conta de administrador com acesso total à plataforma."}
              {step === "tester" && "Passo 2 de 2 — crie a conta de testes para validar a plataforma sem assinar."}
              {(step === "done-all" || step === "complete") && "Setup concluído. Acesse com suas credenciais."}
            </p>
          </div>
          {/* Progress */}
          <div className="flex gap-2 mt-2">
            <div className="h-1.5 flex-1 rounded-full bg-[#3db8d4]" />
            <div className={`h-1.5 flex-1 rounded-full ${step === "tester" || step === "complete" || step === "done-all" ? "bg-[#3db8d4]" : "bg-white/20"}`} />
          </div>
        </div>
        <p className="text-[#5a8caa] text-xs">© {new Date().getFullYear()} Rotina Clínica</p>
      </div>

      {/* Formulário */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Link href="/"><Logo variant="dark" /></Link>
          </div>

          {(step === "done-all" || step === "complete") ? (
            <div className="text-center">
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <h1 className="text-xl font-extrabold text-[#0f2d4a] mb-2">
                {step === "complete" ? "Tudo pronto!" : "Setup já concluído"}
              </h1>
              <p className="text-zinc-500 text-sm mb-6">
                {step === "complete" ? "Redirecionando para o login..." : "As contas já foram criadas anteriormente."}
              </p>
              {step === "done-all" && (
                <Link href="/login" className="inline-flex items-center gap-2 bg-[#1a6aad] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#0f2d4a] transition-all">
                  Ir para o login
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className="mb-2">
                <span className="text-xs font-bold text-[#3db8d4] uppercase tracking-wider">
                  {step === "admin" ? "Passo 1 de 2" : "Passo 2 de 2"}
                </span>
              </div>
              <h1 className="text-2xl font-extrabold text-[#0f2d4a] mb-1">
                {step === "admin" ? "Conta de administrador" : "Conta de testes"}
              </h1>
              <p className="text-zinc-500 text-sm mb-8">
                {step === "admin"
                  ? "Acesso total à plataforma e ao painel admin."
                  : "Acessa a plataforma sem assinatura. Sem poderes de admin."}
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Field label="Nome" type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder={step === "admin" ? "Lucas" : "Tester"} />
                <Field label="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="voce@email.com" />
                <Field label="Senha" hint="(mín. 8 caracteres)" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} placeholder="••••••••" />
                <div>
                  <Field label="Confirmar senha" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required placeholder="Repita a senha" />
                  {mismatch && <p className="text-red-500 text-xs mt-1">As senhas não coincidem.</p>}
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || mismatch}
                  className="w-full bg-[#1a6aad] hover:bg-[#0f2d4a] disabled:opacity-40 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold text-sm transition-all"
                >
                  {loading ? "Criando..." : step === "admin" ? "Criar admin e continuar →" : "Criar conta de testes"}
                </button>

                {step === "tester" && (
                  <button type="button" onClick={() => router.push("/login")} className="w-full text-zinc-400 hover:text-zinc-600 text-sm py-2 transition-colors">
                    Pular — criar depois
                  </button>
                )}
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
