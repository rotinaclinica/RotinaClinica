"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

/**
 * Consulta /api/order/[id]/status a cada 4s enquanto o pedido está processando.
 * Ao confirmar (PAID) ou falhar (FAILED/EXPIRED), atualiza a página via router.refresh().
 * Para após ~2 min para não consultar indefinidamente.
 */
export default function OrderStatusPoller({ orderId }: { orderId: string }) {
  const router = useRouter();
  const attemptsRef = useRef(0);

  useEffect(() => {
    const MAX_ATTEMPTS = 30; // 30 × 4s ≈ 2 min
    let stopped = false;

    const interval = setInterval(async () => {
      if (stopped) return;
      attemptsRef.current += 1;

      try {
        const res = await fetch(`/api/order/${orderId}/status`, { cache: "no-store" });
        if (res.ok) {
          const { status } = (await res.json()) as { status?: string };
          if (status && status !== "PENDING") {
            stopped = true;
            clearInterval(interval);
            router.refresh();
            return;
          }
        }
      } catch {
        // ignora erro de rede transitório e tenta de novo no próximo tick
      }

      if (attemptsRef.current >= MAX_ATTEMPTS) {
        stopped = true;
        clearInterval(interval);
      }
    }, 4000);

    return () => {
      stopped = true;
      clearInterval(interval);
    };
  }, [orderId, router]);

  return null;
}
