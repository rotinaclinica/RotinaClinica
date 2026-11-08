"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const VISTAS_KEY = "rc_trial_condutas";
const MOSTROU_KEY = "rc_trial_oferta5";
const META = 5;

function track(path: string) {
  fetch("/api/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path }),
    keepalive: true,
  }).catch(() => {});
}

/**
 * Oferta no pico de uso do teste grátis: ao fechar a 5ª conduta diferente,
 * mostra o convite para o anual (uma vez só). A página de condutas avisa por
 * eventos de janela ("rc:conduta-aberta" / "rc:conduta-fechada").
 */
export default function TrialOffer() {
  const [aberta, setAberta] = useState(false);

  useEffect(() => {
    let pendente = false;
    const ler = (): string[] => {
      try { return JSON.parse(localStorage.getItem(VISTAS_KEY) || "[]"); } catch { return []; }
    };
    const jaMostrou = () => {
      try { return localStorage.getItem(MOSTROU_KEY) === "1"; } catch { return true; }
    };

    const onAberta = (e: Event) => {
      const id = (e as CustomEvent<{ id: string }>).detail?.id;
      if (!id || jaMostrou()) return;
      const vistas = ler();
      if (!vistas.includes(id)) vistas.push(id);
      try { localStorage.setItem(VISTAS_KEY, JSON.stringify(vistas)); } catch { return; }
      if (vistas.length >= META) pendente = true;
    };
    const onFechada = () => {
      if (!pendente || jaMostrou()) return;
      pendente = false;
      try { localStorage.setItem(MOSTROU_KEY, "1"); } catch {}
      track("/dashboard/evento/oferta-5-condutas");
      setAberta(true);
    };

    window.addEventListener("rc:conduta-aberta", onAberta);
    window.addEventListener("rc:conduta-fechada", onFechada);
    return () => {
      window.removeEventListener("rc:conduta-aberta", onAberta);
      window.removeEventListener("rc:conduta-fechada", onFechada);
    };
  }, []);

  if (!aberta) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="oferta5-titulo">
      <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#172741] shadow-2xl overflow-hidden">
        <div className="bg-[#0f2d4a] px-5 py-5">
          <p className="text-[#3db8d4] text-xs font-bold uppercase tracking-wider">Seu teste grátis</p>
          <h2 id="oferta5-titulo" className="text-white text-xl font-extrabold mt-1 leading-snug">
            Você já usou {META} condutas 👏
          </h2>
          <p className="text-[#9ec4de] text-sm mt-1 leading-snug">
            Assine o anual e mantenha tudo no seu plantão, sem interrupção quando o teste acabar.
          </p>
        </div>
        <div className="px-5 py-5 space-y-3">
          <ul className="space-y-1.5 text-sm text-[#0f2d4a] dark:text-[#e8edf5]">
            <li>✓ Condutas, evoluções e calculadoras</li>
            <li>✓ Libera também cursos, casos clínicos e materiais</li>
            <li>✓ R$ 33,33/mês no anual · até 12x</li>
          </ul>
          <Link
            href="/checkout?plano=anual"
            onClick={() => track("/dashboard/evento/oferta-5-condutas-clique")}
            className="block w-full text-center text-sm font-bold bg-[#3db8d4] hover:bg-[#2fa6c2] text-[#0a1626] py-3 rounded-xl transition-colors"
          >
            Assinar o anual →
          </Link>
          <button onClick={() => setAberta(false)}
            className="block w-full text-center text-sm font-semibold text-[#1a6aad] dark:text-[#3db8d4] py-1 hover:underline">
            Continuar no teste
          </button>
        </div>
      </div>
    </div>
  );
}
