"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Logo } from "@/app/components/Navbar";

const planInfo = {
  mensal: { label: "Plano Mensal", price: "R$ 39,90/mês", color: "bg-[#1a6aad]" },
  anual:  { label: "Plano Anual",  price: "R$ 319/ano · economize R$ 160", color: "bg-[#3db8d4] text-[#0f2d4a]" },
};

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

function PasswordInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        minLength={6}
        placeholder={placeholder}
        className="w-full border border-zinc-300 rounded-xl px-4 py-2.5 pr-11 text-sm text-zinc-900 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#1a6aad] focus:border-transparent"
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
        aria-label={show ? "Ocultar senha" : "Mostrar senha"}
      >
        <EyeIcon open={show} />
      </button>
    </div>
  );
}

function RegistroForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const plano = searchParams.get("plano") as keyof typeof planInfo | null;
  const plan = plano ? planInfo[plano] : null;

  // Cadastros desativados temporariamente
  if (process.env.NEXT_PUBLIC_REGISTRATION_OPEN !== "true") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f7ff] px-6">
        <div className="w-full max-w-sm text-center">
          <Link href="/"><Logo variant="dark" /></Link>
          <div className="mt-10 bg-white border border-zinc-200 rounded-2xl p-8 shadow-sm">
            <div className="w-14 h-14 bg-[#e8f4fc] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1a6aad" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <h1 className="text-xl font-extrabold text-[#0f2d4a] mb-2">Em breve</h1>
            <p className="text-zinc-500 text-sm leading-relaxed mb-6">
              Os cadastros serão abertos em breve. Se já tem conta,{" "}
              <Link href="/login" className="text-[#1a6aad] font-semibold hover:underline">entre por aqui</Link>.
            </p>
            <Link href="/" className="inline-flex items-center gap-2 bg-[#0f2d4a] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#1a6aad] transition-all">
              Voltar ao início
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [cpf, setCpf] = useState("");
  const [cep, setCep] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [momentoProfissional, setMomentoProfissional] = useState("");
  const [ambientesTrabalho, setAmbientesTrabalho] = useState<string[]>([]);
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordMismatch = confirm.length > 0 && confirm !== password;

  function maskPhone(v: string) {
    const d = v.replace(/\D/g, "").slice(0, 11);
    if (d.length <= 2) return d.replace(/^(\d{0,2})/, "($1");
    if (d.length <= 7) return d.replace(/^(\d{2})(\d{0,5})/, "($1) $2");
    return d.replace(/^(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
  }

  function maskCep(v: string) {
    const d = v.replace(/\D/g, "").slice(0, 8);
    if (d.length <= 5) return d;
    return d.replace(/^(\d{5})(\d{0,3})/, "$1-$2");
  }

  function maskCpf(v: string) {
    const d = v.replace(/\D/g, "").slice(0, 11);
    if (d.length <= 3) return d;
    if (d.length <= 6) return d.replace(/^(\d{3})(\d{0,3})/, "$1.$2");
    if (d.length <= 9) return d.replace(/^(\d{3})(\d{3})(\d{0,3})/, "$1.$2.$3");
    return d.replace(/^(\d{3})(\d{3})(\d{3})(\d{0,2})/, "$1.$2.$3-$4");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }

    const cpfDigits = cpf.replace(/\D/g, "");
    const phoneDigits = phone.replace(/\D/g, "");

    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, phone: phoneDigits, cpf: cpfDigits, cep: cep.replace(/\D/g, "") || undefined, momentoProfissional: momentoProfissional || undefined, ambienteTrabalho: ambientesTrabalho.length ? ambientesTrabalho.join(", ") : undefined }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Erro ao criar conta.");
      return;
    }

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      router.push(plano ? `/login?registered=1&plano=${plano}` : "/login?registered=1");
      return;
    }

    router.push(plano ? `/checkout?plano=${plano}` : "/assinatura");
  }

  return (
    <div className="min-h-screen flex bg-[#f0f7ff]">
      {/* Painel esquerdo */}
      <div className="hidden lg:flex flex-col justify-between w-96 h-screen self-start sticky top-0 bg-[#0f2d4a] p-10 overflow-y-auto border-r border-white/5">
        <Link href="/"><Logo variant="light" /></Link>

        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 bg-[#3db8d4]/15 border border-[#3db8d4]/30 rounded-full px-4 py-1.5 w-fit">
            <span className="w-2 h-2 rounded-full bg-[#3db8d4] animate-pulse" />
            <span className="text-[#3db8d4] text-xs font-bold tracking-wider uppercase">Novo membro</span>
          </div>

          <div>
            <p className="text-white font-extrabold text-lg leading-snug mb-1">
              Comece sua jornada.
            </p>
            <p className="text-[#9ec4de] text-sm leading-relaxed">
              Tudo que você precisa no plantão, em um só lugar.
            </p>
          </div>

          {plan && (
            <div className={`${plan.color} rounded-2xl px-5 py-4`}>
              <p className="text-xs font-bold uppercase tracking-wider opacity-70 mb-1">{plan.label}</p>
              <p className="font-extrabold text-lg leading-tight">{plan.price}</p>
            </div>
          )}

          <ul className="space-y-3">
            {[
              "Prescrições e condutas para sua prática clínica",
              "Casos clínicos com raciocínio diagnóstico",
              "Calculadoras clínicas, cursos e videoaulas",
              "Ebooks e modelos de evolução incluídos",
            ].map((text) => (
              <li key={text} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#3db8d4]/20 border border-[#3db8d4]/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="#3db8d4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <p className="text-[#9ec4de] text-sm leading-relaxed">{text}</p>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-[#5a8caa] text-xs text-center">© {new Date().getFullYear()} Rotina Clínica<br />Rotina Clinica Educação Médica Ltda. · CNPJ 65.937.147/0001-58</p>
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
          <p className="text-[#334e68] text-sm mb-8">
            {plan ? "Crie sua conta para finalizar a assinatura." : "Leva menos de 1 minuto."}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#0f2d4a] mb-1.5">Nome completo</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Seu nome"
                className="w-full border border-zinc-300 rounded-xl px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#1a6aad] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#0f2d4a] mb-1.5">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="voce@email.com"
                className="w-full border border-zinc-300 rounded-xl px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#1a6aad] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#0f2d4a] mb-1.5">Celular</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(maskPhone(e.target.value))}
                required
                placeholder="(99) 99999-9999"
                className="w-full border border-zinc-300 rounded-xl px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#1a6aad] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#0f2d4a] mb-1.5">CPF <span className="text-zinc-500 font-normal">(necessário para emitir nota fiscal)</span></label>
              <input
                type="text"
                value={cpf}
                onChange={(e) => setCpf(maskCpf(e.target.value))}
                required
                placeholder="000.000.000-00"
                className="w-full border border-zinc-300 rounded-xl px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#1a6aad] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#0f2d4a] mb-1.5">CEP <span className="text-zinc-500 font-normal">(necessário para emitir nota fiscal)</span></label>
              <input
                type="text"
                value={cep}
                onChange={(e) => setCep(maskCep(e.target.value))}
                placeholder="00000-000"
                className="w-full border border-zinc-300 rounded-xl px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#1a6aad] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#0f2d4a] mb-1.5">Senha</label>
              <PasswordInput value={password} onChange={setPassword} placeholder="Mínimo 6 caracteres" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#0f2d4a] mb-1.5">Confirme sua senha</label>
              <div className="relative">
                <PasswordInput value={confirm} onChange={setConfirm} placeholder="Repita a senha" />
              </div>
              {passwordMismatch && (
                <p className="text-red-500 text-xs mt-1">As senhas não coincidem.</p>
              )}
            </div>

            {/* Momento profissional */}
            <div>
              <p className="text-sm font-semibold text-[#0f2d4a] mb-2">
                Qual é o seu momento profissional? <span className="text-zinc-500 font-normal">(opcional)</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {["Estudante", "Recém-formado(a)", "Formado(a) há mais de 5 anos"].map((op) => (
                  <button
                    key={op}
                    type="button"
                    onClick={() => setMomentoProfissional(momentoProfissional === op ? "" : op)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      momentoProfissional === op
                        ? "bg-[#1a6aad] text-white border-[#1a6aad]"
                        : "bg-white text-zinc-600 border-zinc-300 hover:border-[#1a6aad] hover:text-[#1a6aad]"
                    }`}
                  >
                    {op}
                  </button>
                ))}
              </div>
            </div>

            {/* Ambiente de trabalho */}
            <div>
              <p className="text-sm font-semibold text-[#0f2d4a] mb-2">
                Em qual ambiente você trabalha? <span className="text-zinc-500 font-normal">(opcional)</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {["UBS", "UPA ou PS", "Emergência", "Enfermaria", "UTI", "Ambulatório/Consultório", "Outro"].map((op) => (
                  <button
                    key={op}
                    type="button"
                    onClick={() => setAmbientesTrabalho((prev) => prev.includes(op) ? prev.filter((v) => v !== op) : [...prev, op])}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      ambientesTrabalho.includes(op)
                        ? "bg-[#1a6aad] text-white border-[#1a6aad]"
                        : "bg-white text-zinc-600 border-zinc-300 hover:border-[#1a6aad] hover:text-[#1a6aad]"
                    }`}
                  >
                    {op}
                  </button>
                ))}
              </div>
            </div>

            {/* Termos de uso */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={terms}
                onChange={(e) => setTerms(e.target.checked)}
                required
                className="mt-0.5 w-4 h-4 rounded border-zinc-300 text-[#1a6aad] accent-[#1a6aad] flex-shrink-0"
              />
              <span className="text-xs text-zinc-600 leading-relaxed">
                Ao criar sua conta, você concorda com os{" "}
                <Link href="/termos" className="text-[#1a6aad] hover:underline font-medium" target="_blank">
                  Termos de Uso
                </Link>{" "}
                e a{" "}
                <Link href="/privacidade" className="text-[#1a6aad] hover:underline font-medium" target="_blank">
                  Política de Privacidade
                </Link>
                .
              </span>
            </label>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || passwordMismatch || !terms}
              className="w-full bg-[#1a6aad] hover:bg-[#0f2d4a] disabled:opacity-40 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold text-sm transition-all"
            >
              {loading ? "Criando conta..." : plan ? "Criar conta e continuar" : "Criar conta grátis"}
            </button>
          </form>

          <p className="mt-6 text-sm text-[#334e68] text-center">
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
