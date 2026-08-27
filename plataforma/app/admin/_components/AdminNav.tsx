"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const LINKS = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/usuarios", label: "Usuários" },
  { href: "/admin/pedidos", label: "Pedidos" },
  { href: "/admin/acessos", label: "Acessos" },
  { href: "/admin/leads", label: "Leads" },
  { href: "/admin/reembolsos", label: "Reembolsos" },
  { href: "/admin/broadcast", label: "Enviar email" },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <>
      {LINKS.map((l) => {
        const active = l.exact ? pathname === l.href : pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            onClick={onNavigate}
            className={`text-sm transition-colors py-1.5 px-2 rounded-md ${
              active ? "bg-white/10 text-violet-300 font-semibold" : "text-zinc-300 hover:text-violet-400"
            }`}
          >
            {l.label}
          </Link>
        );
      })}
    </>
  );
}

function FooterLinks() {
  return (
    <div className="flex flex-col gap-2">
      <Link href="/dashboard" className="text-xs text-zinc-400 hover:text-zinc-100 transition-colors">
        Acessar a plataforma →
      </Link>
      <Link href="/" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
        ← Ver site
      </Link>
    </div>
  );
}

export default function AdminNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Fecha o drawer ao trocar de rota
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Sidebar — desktop */}
      <aside className="hidden lg:flex w-56 bg-zinc-900 text-white p-6 flex-col gap-1 sticky top-0 h-screen">
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">Admin</p>
        <NavLinks />
        <div className="mt-auto">
          <FooterLinks />
        </div>
      </aside>

      {/* Topbar — mobile */}
      <div className="lg:hidden sticky top-0 z-30 bg-zinc-900 text-white flex items-center justify-between px-4 py-3">
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Admin</p>
        <button
          onClick={() => setOpen(true)}
          aria-label="Abrir menu"
          className="p-2 -mr-2 text-zinc-300 hover:text-white"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </div>

      {/* Drawer — mobile */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-40" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-64 bg-zinc-900 text-white p-6 flex flex-col gap-1 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Admin</p>
              <button onClick={() => setOpen(false)} aria-label="Fechar menu" className="text-zinc-400 hover:text-white text-xl leading-none">×</button>
            </div>
            <NavLinks onNavigate={() => setOpen(false)} />
            <div className="mt-auto">
              <FooterLinks />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
