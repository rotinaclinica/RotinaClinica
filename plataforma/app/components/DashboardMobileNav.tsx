"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const mobileItems = [
  { href: "/dashboard", label: "Início", exact: true, icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { href: "/dashboard/evolucoes", label: "Evoluções", icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" },
  { href: "/dashboard/prescricoes", label: "Condutas", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
  { href: "/dashboard/casos", label: "Casos", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
  { href: "/dashboard/cursos", label: "Cursos", icon: "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
  { href: "/dashboard/materiais", label: "Materiais", icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" },
  { href: "/dashboard/calculadoras", label: "Calculadoras", icon: "M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" },
];

const PROFILE_ICON = "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z";

export default function DashboardMobileNav({ hasAccess = true, isAdmin = false }: { hasAccess?: boolean; isAdmin?: boolean }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  // Fecha o menu ao trocar de rota
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  function isActive(item: typeof mobileItems[number]) {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  }

  const profileActive = pathname.startsWith("/dashboard/perfil");

  // Sem acesso pago: nenhum item de conteúdo (só o botão de perfil abaixo)
  const items = hasAccess ? mobileItems : [];

  return (
    <>
      {/* Backdrop + sheet do menu de perfil */}
      {menuOpen && (
        <div className="lg:hidden fixed inset-0 z-50" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMenuOpen(false)} />
          <div className="absolute bottom-[64px] left-0 right-0 bg-white dark:bg-[#111a26] rounded-t-2xl shadow-2xl p-2 pb-3 safe-area-pb">
            <div className="w-10 h-1 rounded-full bg-zinc-300 dark:bg-zinc-600 mx-auto my-2" />

            <Link
              href="/dashboard/perfil"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/5"
            >
              <MenuIcon d={PROFILE_ICON} />
              Meu perfil
            </Link>

            {isAdmin && (
              <Link
                href="/admin"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-[#0f6b86] dark:text-[#3db8d4] hover:bg-zinc-100 dark:hover:bg-white/5"
              >
                <MenuIcon d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                Painel admin
              </Link>
            )}

            <Link
              href="/"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/5"
            >
              <MenuIcon d="M3 12l9-9 9 9M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9" />
              Voltar ao site
            </Link>

            <Link
              href="/api/auth/signout"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
            >
              <MenuIcon d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              Sair
            </Link>
          </div>
        </div>
      )}

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#0f2d4a] border-t border-white/10 z-50">
        <div className="flex items-center justify-around px-2 py-2 safe-area-pb">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all min-w-0 ${
                isActive(item) ? "text-white" : "text-[#5a8caa]"
              }`}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d={item.icon} stroke="currentColor" strokeWidth={isActive(item) ? "2.5" : "2"} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className={`text-[10px] font-medium leading-none truncate ${isActive(item) ? "text-white" : "text-[#5a8caa]"}`}>
                {item.label}
              </span>
            </Link>
          ))}

          {/* Botão de perfil abre o menu (perfil / admin / voltar / sair) */}
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menu do perfil"
            aria-expanded={menuOpen}
            className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all min-w-0 ${
              profileActive || menuOpen ? "text-white" : "text-[#5a8caa]"
            }`}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d={PROFILE_ICON} stroke="currentColor" strokeWidth={profileActive || menuOpen ? "2.5" : "2"} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className={`text-[10px] font-medium leading-none truncate ${profileActive || menuOpen ? "text-white" : "text-[#5a8caa]"}`}>
              Perfil
            </span>
          </button>
        </div>
      </nav>
    </>
  );
}

function MenuIcon({ d }: { d: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="flex-shrink-0">
      <path d={d} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
