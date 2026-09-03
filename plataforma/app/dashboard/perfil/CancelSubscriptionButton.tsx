"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CancelSubscriptionButton({ accessUntil }: { accessUntil: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const router = useRouter();

  async function handleCancel() {
    setLoading(true);
    try {
      const res = await fetch("/api/subscription/cancel", { method: "POST" });
      if (res.ok) {
        setDone(true);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-4">
        Assinatura cancelada. Seu acesso permanece ativo até <strong>{accessUntil}</strong>.
      </p>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="mt-4 text-sm text-red-500 hover:text-red-600 font-semibold transition-colors underline underline-offset-2"
      >
        Cancelar assinatura
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white dark:bg-[#131c2e] rounded-2xl border border-zinc-200 dark:border-white/10 p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-base font-extrabold text-[#0f2d4a] dark:text-[#e8edf5] mb-2">
              Cancelar assinatura?
            </h3>
            <p className="text-sm text-[#4a6a80] dark:text-[#6a8fa5] leading-relaxed mb-6">
              Seu acesso à plataforma continuará ativo até <strong className="text-[#0f2d4a] dark:text-[#d4dce8]">{accessUntil}</strong>. Após essa data, o acesso será encerrado automaticamente.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setOpen(false)}
                disabled={loading}
                className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-white/10 text-sm font-semibold text-[#0f2d4a] dark:text-[#d4dce8] hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors"
              >
                Manter assinatura
              </button>
              <button
                onClick={handleCancel}
                disabled={loading}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition-colors disabled:opacity-60"
              >
                {loading ? "Cancelando..." : "Confirmar cancelamento"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
