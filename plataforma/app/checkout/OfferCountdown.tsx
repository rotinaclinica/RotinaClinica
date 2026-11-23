"use client";

import { useSyncExternalStore } from "react";

// Relógio compartilhado que avisa a cada 30s. No servidor não há hora "agora"
// (getServerSnapshot = null), então o HTML inicial mostra o prazo fixo e o
// cliente troca pela contagem sem divergir na hidratação.
function subscribe(cb: () => void) {
  const t = setInterval(cb, 30_000);
  return () => clearInterval(t);
}
const minuteNow = () => Math.floor(Date.now() / 30_000) * 30_000;

export default function OfferCountdown({ endsAt, fallback }: { endsAt: string; fallback: string }) {
  const now = useSyncExternalStore<number | null>(subscribe, minuteNow, () => null);

  if (now === null) return <>{fallback}</>;
  const ms = new Date(endsAt).getTime() - now;
  if (ms <= 0) return <>Oferta encerrada</>;

  const min = Math.floor(ms / 60_000);
  const d = Math.floor(min / 1440);
  const h = Math.floor((min % 1440) / 60);
  const m = min % 60;
  const partes = d > 0 ? `${d}d ${h}h ${m}min` : `${h}h ${String(m).padStart(2, "0")}min`;
  return <>Termina em {partes}</>;
}
