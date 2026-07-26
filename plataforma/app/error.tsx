"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen bg-zinc-50 flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="text-5xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold text-zinc-900 mb-2">Algo deu errado</h1>
        <p className="text-zinc-500 text-sm mb-8">
          Ocorreu um erro inesperado. Tente novamente ou volte para o início.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="bg-violet-600 text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-violet-700 transition-colors"
          >
            Tentar novamente
          </button>
          <Link
            href="/"
            className="border border-zinc-300 text-zinc-700 px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-zinc-50 transition-colors"
          >
            Ir para o início
          </Link>
        </div>
      </div>
    </main>
  );
}
