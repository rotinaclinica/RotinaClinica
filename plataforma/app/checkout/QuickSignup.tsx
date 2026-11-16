"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";

/**
 * Cadastro curto dentro do checkout, para quem chega sem conta (anúncio, bio, e-mail).
 * Só nome, e-mail e senha: CPF e CEP, necessários para a nota fiscal, são pedidos
 * na própria tela de pagamento, logo antes de cobrar.
 */
export default function QuickSignup({ plano, oferta }: { plano: "mensal" | "anual"; oferta?: string }) {
  const of = oferta ? `&oferta=${oferta}` : "";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState("");
  const [emailExists, setEmailExists] = useState(false);
  const [loading, setLoading] = useState(false);

  const loginHref = `/login?plano=${plano}${of}`;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setEmailExists(false);
    if (password.length < 8) {
      setError("A senha deve ter pelo menos 8 caracteres.");
      return;
    }
    setLoading(true);

    // Mesma origem de tráfego que o cadastro completo grava (cookie rc_utm)
    let utmSource: string | undefined;
    let utmMedium: string | undefined;
    let utmCampaign: string | undefined;
    let utmContent: string | undefined;
    let referrerUrl: string | undefined;
    try {
      const match = document.cookie.match(/rc_utm=([^;]+)/);
      if (match) {
        const parts = decodeURIComponent(match[1]).split("|").map(decodeURIComponent);
        utmSource = parts[0] || undefined;
        utmMedium = parts[1] || undefined;
        utmCampaign = parts[2] || undefined;
        referrerUrl = parts[3] || undefined;
        utmContent = parts[4] || undefined;
      }
    } catch {}

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quick: true, name, email, password, utmSource, utmMedium, utmCampaign, utmContent, referrerUrl }),
    }).catch(() => null);

    if (!res || !res.ok) {
      setLoading(false);
      if (res?.status === 409) {
        setEmailExists(true);
        return;
      }
      const data = res ? await res.json().catch(() => null) : null;
      setError(data?.error ?? "Erro ao criar conta. Tente novamente.");
      return;
    }

    try {
      const w = window as unknown as { fbq?: (...args: unknown[]) => void };
      w.fbq?.("track", "CompleteRegistration");
    } catch {}

    const result = await signIn("credentials", { email, password, redirect: false });
    if (result?.error) {
      // Conta criada, mas o login automático falhou: segue pelo login, que volta ao checkout
      window.location.assign(`/login?registered=1&plano=${plano}${of}`);
      return;
    }
    // Recarrega o checkout já logado, com as formas de pagamento
    window.location.assign(`/checkout?plano=${plano}${of}`);
  }

  const inputClass =
    "w-full px-4 py-2.5 rounded-xl border border-zinc-300 text-sm text-zinc-900 bg-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#0f2d4a]/40";

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-1 h-5 rounded-full bg-[#0d9488]" />
        <p className="text-sm font-bold text-[#0f2d4a] uppercase tracking-wider">Crie sua conta para assinar</p>
      </div>
      <p className="text-xs text-zinc-700 leading-snug">
        Leva 20 segundos. Em seguida você escolhe cartão ou Pix e já entra na plataforma.
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="qs-name" className="block text-xs font-bold text-[#0f2d4a] mb-1">Nome completo</label>
          <input id="qs-name" type="text" autoComplete="name" required minLength={2}
            value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" className={inputClass} />
        </div>
        <div>
          <label htmlFor="qs-email" className="block text-xs font-bold text-[#0f2d4a] mb-1">E-mail</label>
          <input id="qs-email" type="email" autoComplete="email" required
            value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@email.com" className={inputClass} />
        </div>
        <div>
          <label htmlFor="qs-password" className="block text-xs font-bold text-[#0f2d4a] mb-1">Crie uma senha</label>
          <div className="relative">
            <input id="qs-password" type={showPassword ? "text" : "password"} autoComplete="new-password" required minLength={8}
              value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 8 caracteres" className={`${inputClass} pr-16`} />
            <button type="button" onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-zinc-500 hover:text-zinc-800">
              {showPassword ? "Ocultar" : "Mostrar"}
            </button>
          </div>
        </div>

        <label className="flex items-start gap-2.5 cursor-pointer">
          <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} required
            className="mt-0.5 w-4 h-4 rounded border-zinc-300 accent-[#0f2d4a] flex-shrink-0" />
          <span className="text-xs text-zinc-700 leading-relaxed">
            Concordo com os{" "}
            <Link href="/termos" target="_blank" className="text-[#1a6aad] font-medium hover:underline">Termos de Uso</Link>{" "}
            e a{" "}
            <Link href="/privacidade" target="_blank" className="text-[#1a6aad] font-medium hover:underline">Política de Privacidade</Link>.
          </span>
        </label>

        {emailExists && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-900">
            Este e-mail já tem conta.{" "}
            <Link href={loginHref} className="font-bold underline">Entre aqui</Link> e você volta direto para o pagamento.
          </div>
        )}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <button type="submit" disabled={loading || !terms}
          className="w-full bg-[#0d9488] hover:bg-[#0f766e] disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold text-sm transition-colors">
          {loading ? "Criando conta…" : "Continuar para o pagamento"}
        </button>
      </form>

      <p className="text-center text-sm text-zinc-700">
        Já tem conta?{" "}
        <Link href={loginHref} className="font-semibold text-[#1a6aad] hover:underline">Entrar</Link>
      </p>
    </div>
  );
}
