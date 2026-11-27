"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";

function maskCpf(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return d.replace(/^(\d{3})(\d{0,3})/, "$1.$2");
  if (d.length <= 9) return d.replace(/^(\d{3})(\d{3})(\d{0,3})/, "$1.$2.$3");
  return d.replace(/^(\d{3})(\d{3})(\d{3})(\d{0,2})/, "$1.$2.$3-$4");
}

function maskCep(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 8);
  return d.length <= 5 ? d : `${d.slice(0, 5)}-${d.slice(5)}`;
}

// Dígitos verificadores: evita que o erro de CPF só apareça no Asaas, na hora de cobrar
function cpfValido(d: string) {
  if (!/^\d{11}$/.test(d) || /^(\d)\1{10}$/.test(d)) return false;
  for (const n of [9, 10]) {
    let s = 0;
    for (let i = 0; i < n; i++) s += Number(d[i]) * (n + 1 - i);
    if (((s * 10) % 11) % 10 !== Number(d[n])) return false;
  }
  return true;
}

/**
 * Cadastro curto dentro do checkout, para quem chega sem conta (anúncio, bio, e-mail).
 * Nome, e-mail, senha, CPF e CEP numa tela só: CPF e CEP (nota fiscal) vinham numa
 * janela surpresa depois do clique em "Pagar"; agora o próximo passo já é pagar.
 */
export default function QuickSignup({ plano, oferta }: { plano: "mensal" | "anual"; oferta?: string }) {
  const of = oferta ? `&oferta=${oferta}` : "";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [cpf, setCpf] = useState("");
  const [cep, setCep] = useState("");
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
    const cpfDigits = cpf.replace(/\D/g, "");
    const cepDigits = cep.replace(/\D/g, "");
    if (!cpfValido(cpfDigits)) {
      setError("CPF inválido. Confira os 11 dígitos.");
      return;
    }
    if (cepDigits.length !== 8) {
      setError("CEP inválido. Digite os 8 dígitos.");
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
      body: JSON.stringify({ quick: true, name, email, password, cpf: cpfDigits, cep: cepDigits, utmSource, utmMedium, utmCampaign, utmContent, referrerUrl }),
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
        {plano === "mensal"
          ? "Leva 30 segundos. Em seguida você paga no cartão e já entra na plataforma."
          : "Leva 30 segundos. Em seguida você escolhe cartão ou Pix e já entra na plataforma."}
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

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="qs-cpf" className="block text-xs font-bold text-[#0f2d4a] mb-1">CPF</label>
            <input id="qs-cpf" type="text" inputMode="numeric" autoComplete="off" required
              value={cpf} onChange={(e) => setCpf(maskCpf(e.target.value))} placeholder="000.000.000-00" className={inputClass} />
          </div>
          <div>
            <label htmlFor="qs-cep" className="block text-xs font-bold text-[#0f2d4a] mb-1">CEP</label>
            <input id="qs-cep" type="text" inputMode="numeric" autoComplete="postal-code" required
              value={cep} onChange={(e) => setCep(maskCep(e.target.value))} placeholder="00000-000" className={inputClass} />
          </div>
        </div>
        <p className="text-[11px] text-zinc-500 -mt-1">CPF e CEP são exigidos para emitir a nota fiscal.</p>

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

        <button type="submit" disabled={loading}
          className="w-full bg-[#0d9488] hover:bg-[#0f766e] disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold text-sm transition-colors">
          {loading ? "Criando conta…" : "Continuar para o pagamento"}
        </button>
        <p className="text-[11px] text-zinc-500 text-center leading-relaxed">
          Ao continuar, você concorda com os{" "}
          <Link href="/termos" target="_blank" className="text-[#1a6aad] font-medium hover:underline">Termos de Uso</Link>{" "}
          e a{" "}
          <Link href="/privacidade" target="_blank" className="text-[#1a6aad] font-medium hover:underline">Política de Privacidade</Link>.
        </p>
      </form>

      <p className="text-center text-sm text-zinc-700">
        Já tem conta?{" "}
        <Link href={loginHref} className="font-semibold text-[#1a6aad] hover:underline">Entrar</Link>
      </p>
    </div>
  );
}
