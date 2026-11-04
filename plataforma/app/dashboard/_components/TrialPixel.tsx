"use client";

import { useEffect } from "react";

/**
 * Dispara StartTrial no pixel quando o usuário chega de uma ativação de teste
 * (/dashboard?teste=ativado). O event ID é o mesmo do envio pelo servidor (lib/meta/capi.ts),
 * para a Meta contar uma vez só. Falha silenciosa.
 */
export default function TrialPixel({ userId }: { userId: string }) {
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("teste") !== "ativado") return;

    // O script do pixel pode ainda não ter carregado na primeira renderização
    let attempts = 0;
    const timer = setInterval(() => {
      attempts++;
      try {
        const key = `fbq_trial_${userId}`;
        const w = window as unknown as { fbq?: (...args: unknown[]) => void };
        if (sessionStorage.getItem(key)) {
          clearInterval(timer);
        } else if (w.fbq) {
          w.fbq("track", "StartTrial", { value: 0, currency: "BRL" }, { eventID: `trial_${userId}` });
          sessionStorage.setItem(key, "1");
          clearInterval(timer);
        } else if (attempts >= 10) {
          clearInterval(timer);
        }
      } catch {
        // fbq indisponível ou storage bloqueado — ignora
        clearInterval(timer);
      }
    }, 500);

    return () => clearInterval(timer);
  }, [userId]);

  return null;
}
