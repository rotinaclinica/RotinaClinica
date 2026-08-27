"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const SESSION_KEY = "sub_expiry_seen";

export default function SubscriptionExpiryBanner({ expiresAt }: { expiresAt: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(SESSION_KEY)) return;
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      // sessionStorage indisponível
    }
    setVisible(true);
  }, []);

  if (!visible) return null;

  void expiresAt;

  return (
    <div className="mx-4 mt-4 lg:mx-6 lg:mt-6">
      <div className="flex items-center justify-between gap-4 rounded-xl border border-amber-400/30 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-500/20 px-4 py-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-amber-500 text-base shrink-0">⚠️</span>
          <p className="text-sm text-amber-800 dark:text-amber-300 font-medium leading-snug">
            Sua assinatura vai expirar!{" "}
            <Link
              href="/assinatura"
              className="underline underline-offset-2 hover:text-amber-600 dark:hover:text-amber-200 transition-colors"
            >
              Aproveite para renovar e garantir seu acesso →
            </Link>
          </p>
        </div>
        <button
          onClick={() => setVisible(false)}
          aria-label="Fechar aviso"
          className="shrink-0 text-amber-500 hover:text-amber-700 dark:hover:text-amber-200 transition-colors text-xl leading-none"
        >
          ×
        </button>
      </div>
    </div>
  );
}
