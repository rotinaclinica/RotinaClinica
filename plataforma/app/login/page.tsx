"use client";

import { useState, Suspense } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/app/components/Navbar";
import ThemeToggle from "@/app/components/ThemeToggle";

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

const memberBenefits = [
  "+200 prescrições e condutas clínicas",
  "Casos clínicos com raciocínio diagnóstico",
  "Calculadoras clínicas, cursos e videoaulas",
  "Ebooks e modelos de evolução incluídos",
];

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered") === "1";
  const plano = searchParams.get("plano");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("E-mail ou senha incorretos.");
    } else {
      const session = await getSession();
      const role = (session?.user as { role?: string })?.role;
      if (role === "ADMIN") {
        router.push("/admin");
      } else if (plano) {
        router.push(`/checkout?plano=${plano}`);
      } else {
        router.push("/dashboard");
      }
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen flex bg-[#f0f7ff] dark:bg-[#060f1c]">
      {/* Painel esquerdo */}
      <div className="hidden lg:flex flex-col justify-between w-96 bg-[#0f2d4a] dark:bg-[#091526] p-10 border-r border-white/5">
        <Link href="/"><Logo variant="light" /></Link>

        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 bg-[#3db8d4]/15 border border-[#3db8d4]/30 rounded-full px-4 py-1.5 w-fit">
            <span className="w-2 h-2 rounded-full bg-[#3db8d4] animate-pulse" />
            <span className="text-[#3db8d4] text-xs font-bold tracking-wider uppercase">Área do aluno</span>
          </div>

          <div>
            <p className="text-white font-extrabold text-lg leading-snug mb-1">
              Bem-vindo(a) de volta.
            </p>
            <p className="text-[#9ec4de] text-sm leading-relaxed">
              Você tem acesso completo à plataforma. Entre para continuar de onde parou.
            </p>
          </div>

          <ul className="space-y-3">
            {memberBenefits.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#3db8d4]/20 border border-[#3db8d4]/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="#3db8d4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <p className="text-[#9ec4de] text-sm leading-relaxed">{item}</p>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-[#5a8caa] text-xs">© {new Date().getFullYear()} Rotina Clínica</p>
      </div>

      {/* Formulário */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative">
        {/* Toggle de tema — canto superior direito */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium select-none">
            Tema
          </span>
          <ThemeToggle variant="switch" />
        </div>

        <div className="w-full max-w-sm">
          {/* Voltar ao site */}
          <div className="mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:text-[#1a6aad] dark:hover:text-[#3db8d4] transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              Voltar ao site
            </Link>
          </div>

          <div className="mb-8 lg:hidden">
            <Link href="/"><Logo variant="dark" /></Link>
          </div>

          {/* Banner de cadastro concluído */}
          {registered && (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700/40 rounded-2xl px-5 py-4 mb-6 flex items-start gap-3">
              <svg className="flex-shrink-0 mt-0.5" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              <div>
                <p className="text-emerald-800 dark:text-emerald-300 text-sm font-bold">Conta criada com sucesso!</p>
                <p className="text-emerald-700 dark:text-emerald-400 text-xs mt-0.5">Entre com suas credenciais para continuar.</p>
              </div>
            </div>
          )}

          {/* Badge mobile */}
          <div className="lg:hidden inline-flex items-center gap-2 bg-[#0f2d4a]/8 dark:bg-[#3db8d4]/10 border border-[#0f2d4a]/15 dark:border-[#3db8d4]/25 rounded-full px-3 py-1 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3db8d4]" />
            <span className="text-[#0f2d4a] dark:text-[#3db8d4] text-xs font-bold tracking-wider uppercase">Área do aluno</span>
          </div>

          <h1 className="text-2xl font-extrabold text-[#0f2d4a] dark:text-white mb-1">Acesso de membro</h1>
          <p className="text-zinc-700 dark:text-zinc-200 text-sm mb-8">Entre para acessar seu conteúdo exclusivo.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5" htmlFor="email">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="voce@email.com"
                className="w-full border border-zinc-400 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-white bg-white dark:bg-zinc-900 placeholder:text-zinc-500 dark:placeholder:text-zinc-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1a6aad] dark:focus:ring-[#3db8d4] focus:border-transparent"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300" htmlFor="password">
                  Senha
                </label>
                <Link href="/recuperar-senha" className="text-xs text-[#1a6aad] dark:text-[#3db8d4] hover:underline font-medium">
                  Esqueceu a senha?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 pr-11 text-sm text-zinc-900 dark:text-white bg-white dark:bg-zinc-900 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#1a6aad] dark:focus:ring-[#3db8d4] focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/40 rounded-xl px-4 py-2.5">
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1a6aad] hover:bg-[#0f2d4a] dark:hover:bg-[#3db8d4] disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold text-sm transition-all"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <div className="mt-6 space-y-2 text-center">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Ainda não tem conta?{" "}
              <Link href="/registro" className="text-[#1a6aad] dark:text-[#3db8d4] font-semibold hover:underline">
                Criar conta
              </Link>
            </p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Quer conhecer os planos?{" "}
              <Link href="/assinatura" className="text-[#1a6aad] dark:text-[#3db8d4] font-semibold hover:underline">
                Ver planos
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
