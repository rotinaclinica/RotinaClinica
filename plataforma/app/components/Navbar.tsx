"use client";

import Link from "next/link";
import { useState } from "react";
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

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();

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
        </div>

        {/* Ações desktop */}
        <div className="hidden md:flex items-center gap-3">
          {session ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center px-4 py-2 text-sm font-semibold text-[#0f2d4a] bg-[#3db8d4] rounded-lg hover:bg-[#5CC8E8] transition-all shadow-md"
            >
              Minha Área
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white border border-white/30 rounded-lg hover:border-white hover:bg-white/10 transition-all"
              >
                Entrar
              </Link>
              <Link
                href="/registro"
                className="inline-flex items-center px-4 py-2 text-sm font-semibold text-[#0f2d4a] bg-[#3db8d4] rounded-lg hover:bg-[#5CC8E8] transition-all shadow-md"
              >
                Começar agora
              </Link>
            </>
          )}
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
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="block text-white hover:text-[#3db8d4] transition-colors py-3 text-base font-bold"
          >
            Início
          </Link>
          <Link
            href="/produtos"
            onClick={() => setOpen(false)}
            className="block text-white hover:text-[#3db8d4] transition-colors py-3 text-base font-bold"
          >
            Ebooks e Cursos
          </Link>
          <Link
            href="/conheca"
            onClick={() => setOpen(false)}
            className="block text-white hover:text-[#3db8d4] transition-colors py-3 text-base font-bold"
          >
            Conheça o Rotina Clínica
          </Link>
          <div className="pt-3 flex flex-col gap-3">
            {session ? (
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-[#0f2d4a] bg-[#3db8d4] rounded-lg hover:bg-[#5CC8E8] transition-all shadow-md"
              >
                Minha Área
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-white border border-white/30 rounded-lg hover:border-white hover:bg-white/10 transition-all"
                >
                  Entrar
                </Link>
                <Link
                  href="/registro"
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-[#0f2d4a] bg-[#3db8d4] rounded-lg hover:bg-[#5CC8E8] transition-all shadow-md"
                >
                  Começar agora
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
