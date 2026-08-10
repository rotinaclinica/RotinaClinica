"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const mobileItems = [
  { href: "/dashboard", label: "Início", exact: true, icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { href: "/dashboard/evolucoes", label: "Evoluções", icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" },
  { href: "/dashboard/prescricoes", label: "Condutas", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
  { href: "/dashboard/casos", label: "Casos", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
  { href: "/dashboard/cursos", label: "Cursos", icon: "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
  { href: "/dashboard/materiais", label: "Materiais", icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" },
  { href: "/dashboard/calculadoras", label: "Calculadoras", icon: "M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" },
  { href: "/dashboard/perfil", label: "Perfil", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
];

export default function DashboardMobileNav() {
  const pathname = usePathname();

  function isActive(item: typeof mobileItems[number]) {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  }

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#0f2d4a] border-t border-white/10 z-50">
      <div className="flex items-center justify-around px-2 py-2 safe-area-pb">
        {mobileItems.map((item) => (
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

      </div>
    </nav>
  );
}
