"use client";

import { useState } from "react";

interface Props {
  children: React.ReactNode;
}

export default function PreventInfoModal({ children }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div onClick={() => setOpen(true)} className="cursor-pointer">
        {children}
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white dark:bg-[#131c2e] rounded-2xl shadow-2xl w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4 mb-5">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>
              <div>
                <h2 className="font-extrabold text-[#0f2d4a] dark:text-[#e8edf5] text-base leading-tight mb-1">
                  Calculadora PREVENT — AHA 2023
                </h2>
                <span className="text-[10px] font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded uppercase tracking-wide">Em desenvolvimento</span>
              </div>
            </div>

            <p className="text-sm text-zinc-600 dark:text-[#8aaecc] leading-relaxed mb-5">
              Esta calculadora está em processo de desenvolvimento e ainda não está disponível na plataforma.
              Enquanto isso, você pode acessar a versão oficial diretamente pelo site da American Heart Association:
            </p>

            <a
              href="https://professional.heart.org/en/guidelines-and-statements/prevent-calculator"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#1a6aad] hover:bg-[#0f2d4a] text-white text-sm font-bold px-5 py-3 rounded-xl transition-all w-full justify-center mb-3"
            >
              Acessar calculadora PREVENT — AHA
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
            </a>

            <button
              onClick={() => setOpen(false)}
              className="w-full text-center text-xs text-zinc-400 dark:text-[#4a6a7e] hover:text-zinc-600 dark:hover:text-[#7a9ab8] transition-colors py-1"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
