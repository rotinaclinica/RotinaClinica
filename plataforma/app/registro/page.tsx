"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/app/components/Navbar";

const planInfo = {
  mensal: { label: "Plano Mensal", price: "R$ 39,90/mês", color: "bg-[#1a6aad]" },
  anual:  { label: "Plano Anual",  price: "R$ 319/ano · economize R$ 160", color: "bg-[#3db8d4] text-[#0f2d4a]" },
};

function RegistroForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const plano = searchParams.get("plano") as keyof typeof planInfo | null;
  const plan = plano ? planInfo[plano] : null;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password !== confirm) {
      setError("As senhas não coincidem.");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Erro ao criar conta.");
      return;
    }

    const next = plano ? `/login?registered=1&plano=${plano}` : "/login?registered=1";
    router.push(next);
  }

  return (
    <div className="min-h-screen flex bg-[#f0f7ff]">
      {/* Painel esquerdo */}
      <div className="hidden lg:flex flex-col justify-between w-96 bg-[#0f2d4a] p-10">
        <Link href="/">
          <Logo variant="light" />
        </Link>

        <div className="space-y-4">
          {plan && (
            <div className={`${plan.color} rounded-2xl px-5 py-4 mb-6`}>
              <p className="text-xs font-bold uppercase tracking-wider opacity-70 mb-1">{plan.label}</p>
              <p className="font-extrabold text-lg leading-tight">{plan.price}</p>
            </div>
          )}
          {[
            "+200 prescrições prontas para usar",
            "Casos clínicos semanais com especialistas",
            "Cursos e videoaulas em qualquer dispositivo",
            "Ebooks e materiais de apoio incluídos",
          ].map((text) => (
            <div key={text} className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-[#3db8d4] flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="#0f2d4a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p className="text-[#9ec4de] text-sm leading-relaxed">{text}</p>
            </div>
          ))}
        </div>

        <p className="text-[#5a8caa] text-xs">© {new Date().getFullYear()} Rotina Clínica</p>
      </div>

      {/* Formulário */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Link href="/"><Logo variant="dark" /></Link>
          </div>

          {/* Banner do plano (mobile) */}
          {plan && (
            <div className={`${plan.color} rounded-2xl px-5 py-3 mb-6 lg:hidden`}>
              <p className="text-xs font-bold uppercase tracking-wider opacity-70">{plan.label}</p>
              <p className="font-extrabold text-base">{plan.price}</p>
            </div>
          )}

          <h1 className="text-2xl font-extrabold text-[#0f2d4a] mb-1">Crie sua conta</h1>
          <p className="text-zinc-500 text-sm mb-8">
            {plan ? "Crie sua conta para finalizar a assinatura." : "É grátis e leva menos de 1 minuto."}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Nome completo</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Seu nome"
                className="w-full border border-zinc-300 rounded-xl px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#1a6aad] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1.5">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="voce@email.com"
                className="w-full border border-zinc-300 rounded-xl px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#1a6aad] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Mínimo 6 caracteres"
                className="w-full border border-zinc-300 rounded-xl px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#1a6aad] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Confirme sua senha</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                minLength={6}
                placeholder="Repita a senha"
                className={`w-full border rounded-xl px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#1a6aad] focus:border-transparent ${
                  confirm && confirm !== password ? "border-red-400 bg-red-50" : "border-zinc-300"
                }`}
              />
              {confirm && confirm !== password && (
                <p className="text-red-500 text-xs mt-1">As senhas não coincidem.</p>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1a6aad] hover:bg-[#0f2d4a] disabled:opacity-50 text-white py-3 rounded-xl font-bold text-sm transition-all"
            >
              {loading ? "Criando conta..." : plan ? "Criar conta e continuar" : "Criar conta grátis"}
            </button>
          </form>

          <p className="mt-6 text-sm text-zinc-500 text-center">
            Já tem conta?{" "}
            <Link
              href={plano ? `/login?plano=${plano}` : "/login"}
              className="text-[#1a6aad] font-semibold hover:underline"
            >
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegistroPage() {
  return (
    <Suspense>
      <RegistroForm />
    </Suspense>
  );
}
