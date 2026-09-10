"use client";

import { useEffect } from "react";

export default function PixelPurchase({
  orderId,
  valueCents,
  currency,
}: {
  orderId: string;
  valueCents: number;
  currency: string;
}) {
  useEffect(() => {
    try {
      const key = `fbq_purchase_${orderId}`;
      if (sessionStorage.getItem(key)) return;
      const w = window as unknown as { fbq?: (...args: unknown[]) => void };
      if (w.fbq) {
        w.fbq("track", "Purchase", { value: valueCents / 100, currency });
        sessionStorage.setItem(key, "1");
      }
    } catch {
      // fbq indisponível ou storage bloqueado — ignora
    }
  }, [orderId, valueCents, currency]);

  return null;
}
