"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/app/components/Navbar";
import ThemeToggle from "@/app/components/ThemeToggle";

const navItems = [
  {
    href: "/dashboard",
    label: "Início",
    exact: true,
    icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  },
  {
    href: "/dashboard/evolucoes",
    label: "Modelos de evolução",
    icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
  },
  {
    href: "/dashboard/prescricoes",
    label: "Condutas Clínicas",
    icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  },
  {
    href: "/dashboard/casos",
    label: "Casos Clínicos",
    icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  },
  {
    href: "/dashboard/cursos",
    label: "Cursos",
    icon: "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  {
    href: "/dashboard/materiais",
    label: "Materiais",
    icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
  },
  {
    href: "/dashboard/calculadoras",
    label: "Calculadoras",
    icon: "M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z",
  },
  {
    href: "/dashboard/pedidos",
    label: "Meus pedidos",
    icon: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z",
  },
];

interface Props {
  userName: string;
  userEmail: string;
  initials: string;
  isAdmin?: boolean;
  hasAccess?: boolean;
}

export default function DashboardSidebar({ userName, userEmail, initials, isAdmin, hasAccess = true }: Props) {
  const pathname = usePathname();

  function isActive(item: typeof navItems[number]) {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  }

  return (
    <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-[#0f2d4a] dark:bg-[#080e1a] flex-shrink-0">
      {/* Logo + toggle */}
      <div className="px-5 py-5 border-b border-white/10 flex items-center justify-between gap-2">
        <Link href="/" className="flex-shrink-0 min-w-0"><Logo variant="light" /></Link>
        <ThemeToggle className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-[#9ec4de] hover:text-white hover:bg-white/10 transition-colors" />
      </div>

      {/* User */}
      <div className="px-5 py-4 border-b border-white/10 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-[#3db8d4] flex items-center justify-center text-[#0f2d4a] font-bold text-sm flex-shrink-0">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="text-white text-sm font-semibold truncate">{userName}</p>
          <p className="text-[#5a8caa] text-xs truncate">{userEmail}</p>
        </div>
      </div>

      {/* Nav — oculto para quem não tem acesso pago (só perfil/voltar/sair) */}
      <nav className="px-3 py-4 space-y-0.5">
        {hasAccess && navItems.filter((item) => !(isAdmin && item.href === "/dashboard/pedidos")).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              isActive(item)
                ? "bg-white/10 text-white font-semibold"
                : "text-[#9ec4de] hover:text-white hover:bg-white/8"
            }`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d={item.icon} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Perfil + Sair */}
      <div className="px-3 pb-5 space-y-0.5">
        {isAdmin && (
          <Link
            href="/admin"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#3db8d4] hover:text-white hover:bg-white/8 text-sm font-medium transition-all"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Admin
          </Link>
        )}
        <Link
          href="/dashboard/perfil"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#9ec4de] hover:text-white hover:bg-white/8 text-sm font-medium transition-all"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Meu perfil
        </Link>
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#5a8caa] hover:text-white hover:bg-white/8 text-sm font-medium transition-all"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M3 12l9-9 9 9M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Voltar ao site
        </Link>
        <Link
          href="/api/auth/signout"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#5a8caa] hover:text-white hover:bg-white/8 text-sm font-medium transition-all"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Sair
        </Link>
      </div>
    </aside>
  );
}
