"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";

const SESSION_KEY = "sub_expiry_dismissed";

// Aviso para assinantes sem renovação automática (Pix/avulso) nos últimos 7 dias:
// convida a ativar o cartão recorrente. Some até o fim da sessão se for fechado.
const noopSubscribe = () => () => {};
function readDismissed() {
  try {
    return sessionStorage.getItem(SESSION_KEY) === "1";
  } catch {
    return false; // sessionStorage indisponível
  }
}

export default function SubscriptionExpiryBanner({
  dateLabel,
  daysLeft,
  plano,
}: {
  dateLabel: string;
  daysLeft: number;
  plano: "mensal" | "anual";
}) {
  const dismissedEarlier = useSyncExternalStore(noopSubscribe, readDismissed, () => false);
  const [closed, setClosed] = useState(false);

  if (closed || dismissedEarlier) return null;

  function dismiss() {
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      // sessionStorage indisponível
    }
    setClosed(true);
  }

  const quando =
    daysLeft <= 0 ? "vence hoje" : daysLeft === 1 ? "vence amanhã" : `vence em ${daysLeft} dias`;

  return (
    <div className="mx-4 mt-4 lg:mx-6 lg:mt-6">
      <div className="relative flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 rounded-xl border border-amber-400/40 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-500/25 px-4 py-3 pr-10">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <span className="text-amber-500 text-base shrink-0 mt-0.5">⏳</span>
          <p className="text-sm text-amber-900 dark:text-amber-200 leading-snug">
            <strong>Sua assinatura {quando}</strong> ({dateLabel}).{" "}
            Ative a renovação automática no cartão e não perca o acesso no meio de um plantão.
          </p>
        </div>
        <Link
          href={`/checkout?plano=${plano}`}
          className="shrink-0 self-start sm:self-auto bg-[#0f2d4a] hover:bg-[#1a6aad] text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors"
        >
          Ativar renovação automática
        </Link>
        <button
          onClick={dismiss}
          aria-label="Fechar aviso"
          className="absolute top-2 right-3 text-amber-500 hover:text-amber-700 dark:hover:text-amber-200 transition-colors text-xl leading-none"
        >
          ×
        </button>
      </div>
    </div>
  );
}
