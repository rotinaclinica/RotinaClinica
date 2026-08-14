"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OrderStatusPoller({ orderId }: { orderId: string }) {
  const router = useRouter();

  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 20; // 20 × 3s = 60s máximo

    const interval = setInterval(async () => {
      attempts++;
      try {
        const res = await fetch(`/api/order/${orderId}/status`);
        const data = await res.json();
        if (data.status === "PAID") {
          clearInterval(interval);
          router.replace(`/pedido/${orderId}?status=pago`);
        } else if (data.status === "FAILED" || attempts >= maxAttempts) {
          clearInterval(interval);
          router.replace(`/pedido/${orderId}`);
        }
      } catch {
        // ignora erros de rede, tenta de novo
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [orderId, router]);

  return null;
}
