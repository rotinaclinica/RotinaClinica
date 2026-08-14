"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PixPoller({ orderId }: { orderId: string }) {
  const router = useRouter();

  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 40; // 40 × 5s = 200s (~3 min)

    const interval = setInterval(async () => {
      attempts++;
      try {
        const res = await fetch(`/api/order/${orderId}/status`);
        const data = await res.json();
        if (data.status === "PAID") {
          clearInterval(interval);
          router.replace("/dashboard");
        } else if (data.status === "FAILED" || attempts >= maxAttempts) {
          clearInterval(interval);
        }
      } catch {
        // ignora erros de rede
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [orderId, router]);

  return null;
}
