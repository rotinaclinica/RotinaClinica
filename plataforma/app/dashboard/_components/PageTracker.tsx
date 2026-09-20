"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Componente cliente que dispara /api/track a cada mudança de rota.
 * Deve ser incluído uma vez no layout do dashboard.
 * Falha silenciosa — nunca interrompe a navegação do usuário.
 */
export default function PageTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    // fire-and-forget
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname }),
      keepalive: true,
    }).catch(() => {});
  }, [pathname]);

  return null;
}
