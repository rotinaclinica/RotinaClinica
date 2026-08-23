"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export function Logo({ variant = "dark" }: { variant?: "dark" | "light" }) {
  return (
    <img
      src={variant === "light" ? "/images/logo-branco.png" : "/images/logo-azul.png"}
      alt="Rotina Clínica"
      className="h-7 sm:h-9 w-auto"
    />
  );
}

function PersonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { data: session, status } = useSession();
  const [hasActive, setHasActive] = useState<boolean | null>(null);

  useEffect(() => {
    if (!session?.user?.id) {
      setHasActive(null);
      return;
    }
    fetch("/api/user/subscription-status")
      .then((r) => r.json())
      .then((d) => setHasActive(d.hasActive))
      .catch(() => setHasActive(false));
  }, [session?.user?.id]);

  // Enquanto carrega a sessão não renderiza ações para evitar flash
  const authLoading = status === "loading" || (!!session && hasActive === null);

  function NavActions({ mobile = false }: { mobile?: boolean }) {
    const btnBase = mobile
      ? "inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold rounded-lg transition-all"
      : "inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all";
    const btnOutline = `${btnBase} text-white border border-white/30 hover:border-white hover:bg-white/10`;
    const btnPrimary = `${btnBase} text-[#0f2d4a] bg-[#3db8d4] hover:bg-[#5CC8E8] shadow-md`;
    const iconBtn = "inline-flex items-center justify-center w-9 h-9 rounded-lg text-white border border-white/30 hover:border-white hover:bg-white/10 transition-all";

    if (authLoading) return null;

    // Não cadastrado / não logado
    if (!session) {
      return (
        <>
          <Link href="/assinatura" onClick={() => setOpen(false)} className={btnPrimary}>
            Ver planos
          </Link>
          <Link href="/login" onClick={() => setOpen(false)} className={btnOutline}>
            Entrar
          </Link>
        </>
      );
    }

    // Assinante ativo
    if (hasActive) {
      return (
        <>
          <Link href="/dashboard" onClick={() => setOpen(false)} className={btnPrimary}>
            Minha Área
          </Link>
          {!mobile && (
            <Link href="/dashboard/perfil" onClick={() => setOpen(false)} title="Meu perfil" className={iconBtn}>
              <PersonIcon />
            </Link>
          )}
          {mobile && (
            <Link href="/dashboard/perfil" onClick={() => setOpen(false)} className={btnOutline}>
              Meu perfil
            </Link>
          )}
        </>
      );
    }

    // Logado sem assinatura ativa
    return (
      <>
        <Link href="/assinatura" onClick={() => setOpen(false)} className={btnPrimary}>
          Ver planos
        </Link>
        {!mobile && (
          <Link href="/dashboard/perfil" onClick={() => setOpen(false)} title="Meu perfil" className={iconBtn}>
            <PersonIcon />
          </Link>
        )}
        {mobile && (
          <Link href="/dashboard/perfil" onClick={() => setOpen(false)} className={btnOutline}>
            Meu perfil
          </Link>
        )}
      </>
    );
  }

  return (
    <header className="sticky top-0 z-50 bg-[#0f2d4a] border-b border-white/10 shadow-lg">
      <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex-shrink-0">
          <Logo variant="light" />
        </Link>

        {/* Links desktop */}
        <div className="hidden md:flex items-center gap-3 text-sm font-bold">
          <Link href="/" className="text-white hover:text-[#3db8d4] transition-colors px-3 py-1.5">Início</Link>
          <Link href="/produtos" className="text-white hover:text-[#3db8d4] transition-colors px-3 py-1.5">Ebooks e Cursos</Link>
          <Link href="/conheca" className="text-white hover:text-[#3db8d4] transition-colors px-3 py-1.5">Conheça o Rotina Clínica</Link>
          <Link href="/tour" className="text-white hover:text-[#3db8d4] transition-colors px-3 py-1.5">Conhecer a plataforma</Link>
        </div>

        {/* Ações desktop */}
        <div className="hidden md:flex items-center gap-2">
          <NavActions />
        </div>

        {/* Botão hambúrguer (mobile) */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
          className="md:hidden inline-flex items-center justify-center w-10 h-10 -mr-2 text-white rounded-lg hover:bg-white/10 transition-colors"
        >
          {open ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          )}
        </button>
      </nav>

      {/* Menu mobile */}
      {open && (
        <div className="md:hidden border-t border-white/10 bg-[#0f2d4a] px-6 py-4 space-y-1">
          <Link href="/" onClick={() => setOpen(false)} className="block text-white hover:text-[#3db8d4] transition-colors py-3 text-base font-bold">Início</Link>
          <Link href="/produtos" onClick={() => setOpen(false)} className="block text-white hover:text-[#3db8d4] transition-colors py-3 text-base font-bold">Ebooks e Cursos</Link>
          <Link href="/conheca" onClick={() => setOpen(false)} className="block text-white hover:text-[#3db8d4] transition-colors py-3 text-base font-bold">Conheça o Rotina Clínica</Link>
          <Link href="/tour" onClick={() => setOpen(false)} className="block text-white hover:text-[#3db8d4] transition-colors py-3 text-base font-bold">Conhecer a plataforma</Link>
          <div className="pt-3 flex flex-col gap-3">
            <NavActions mobile />
          </div>
        </div>
      )}
    </header>
  );
}
