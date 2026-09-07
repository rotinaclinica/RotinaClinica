"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const mobileItems = [
  { href: "/dashboard", label: "Início", exact: true, icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
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
