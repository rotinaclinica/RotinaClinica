"use client";

import { useEffect } from "react";

/**
 * Registra a abertura do checkout por quem ainda não tem conta. Antes esse
 * visitante era mandado ao login e não aparecia em nenhum número. Usa um id
 * aleatório do navegador (sem dado pessoal) para contar pessoas, não visitas.
 */
export default function AnonCheckoutTracker() {
  useEffect(() => {
    let visitorId: string | null = null;
    try {
      visitorId = localStorage.getItem("rc_vid");
      if (!visitorId) {
        visitorId = crypto.randomUUID().replace(/-/g, "");
        localStorage.setItem("rc_vid", visitorId);
      }
    } catch {
      visitorId = null;
    }
    if (!visitorId) return;
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: "/checkout-visitante", visitorId }),
      keepalive: true,
    }).catch(() => {});
  }, []);

  return null;
}
