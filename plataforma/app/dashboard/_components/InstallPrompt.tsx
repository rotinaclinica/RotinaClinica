"use client";

import { useEffect, useState } from "react";

type BIPEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };
type Modo = "nativo" | "ios" | "android" | "inapp";

const DISMISS_KEY = "rc_install_dismissed";
const PAUSA_DIAS = 14;
const ATRASO_MS = 20_000; // só depois de a pessoa ver algo útil

function track(path: string) {
  fetch("/api/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path }),
    keepalive: true,
  }).catch(() => {});
}

/**
 * Aviso no celular para salvar a plataforma na tela inicial: o ícone no aparelho
 * é o que faz a pessoa lembrar dela no próximo plantão. No Android usa o prompt
 * nativo de instalação; no iPhone e nos navegadores sem prompt, mostra o passo a passo.
 */
export default function InstallPrompt() {
  const [modo, setModo] = useState<Modo | null>(null);
  const [evento, setEvento] = useState<BIPEvent | null>(null);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    const celular = window.matchMedia("(max-width: 1023px) and (pointer: coarse)").matches;
    if (standalone || !celular) return;

    try {
      const t = Number(localStorage.getItem(DISMISS_KEY) || 0);
      if (t && Date.now() - t < PAUSA_DIAS * 86_400_000) return;
    } catch {}

    const ua = navigator.userAgent;
    const inApp = /Instagram|FBAN|FBAV|FB_IAB|Line\/|TikTok/i.test(ua);
    const ios = /iPhone|iPad|iPod/i.test(ua);
    let bip: BIPEvent | null = null;

    const onBip = (e: Event) => {
      e.preventDefault();
      bip = e as BIPEvent;
      setEvento(bip);
    };
    const onInstalled = () => {
      track("/dashboard/evento/app-instalado");
      setModo(null);
    };
    window.addEventListener("beforeinstallprompt", onBip);
    window.addEventListener("appinstalled", onInstalled);

    const timer = setTimeout(() => {
      setModo(inApp ? "inapp" : bip ? "nativo" : ios ? "ios" : "android");
    }, ATRASO_MS);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("beforeinstallprompt", onBip);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  // O prompt nativo pode chegar depois do aviso aberto
  const modoAtual: Modo | null = modo && modo !== "inapp" && evento ? "nativo" : modo;

  function fechar() {
    try { localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch {}
    setModo(null);
  }

  async function instalar() {
    if (!evento) return;
    await evento.prompt();
    const { outcome } = await evento.userChoice;
    setEvento(null);
    if (outcome === "accepted") setModo(null);
    else fechar();
  }

  if (!modoAtual) return null;

  return (
    <div className="lg:hidden fixed left-3 right-3 bottom-[76px] z-40" role="dialog" aria-label="Salvar na tela inicial">
      <div className="rounded-2xl border border-[#3db8d4]/50 bg-white dark:bg-[#172741] shadow-xl p-4">
        <div className="flex items-start gap-3">
          <img src="/icon-192.png" alt="" width={44} height={44} className="w-11 h-11 rounded-xl flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-extrabold text-[#0f2d4a] dark:text-white leading-snug">
              Tenha o Rotina Clínica na tela inicial
            </p>
            <p className="text-xs text-[#0f2d4a]/85 dark:text-[#bccbd8] mt-0.5 leading-snug">
              {modoAtual === "nativo" && "No próximo plantão ele abre com um toque, como um aplicativo."}
              {modoAtual === "ios" && (
                <>Toque em <strong>Compartilhar</strong> <span aria-hidden>(□↑)</span> na barra do Safari e depois em <strong>Adicionar à Tela de Início</strong>.</>
              )}
              {modoAtual === "android" && (
                <>Toque no menu <strong>⋮</strong> do navegador e depois em <strong>Adicionar à tela inicial</strong>.</>
              )}
              {modoAtual === "inapp" && (
                <>Você está no navegador do Instagram. Toque em <strong>⋯</strong> e em <strong>Abrir no navegador</strong> para salvar a plataforma na tela inicial.</>
              )}
            </p>
          </div>
          <button onClick={fechar} aria-label="Fechar" className="-mr-1 -mt-1 p-1 text-[#0f2d4a]/60 dark:text-[#9fb5c7] hover:text-[#0f2d4a] dark:hover:text-white">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        {modoAtual === "nativo" && (
          <button onClick={instalar}
            className="mt-3 w-full text-sm font-bold bg-[#3db8d4] hover:bg-[#2fa6c2] text-[#0a1626] py-2.5 rounded-xl transition-colors">
            Adicionar à tela inicial
          </button>
        )}
      </div>
    </div>
  );
}
