"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getDocstageModulo, getDocstageAula, type DocstageAula } from "@/lib/docstage-data";

declare global {
  interface Window {
    YT: {
      Player: new (
        el: HTMLElement,
        opts: {
          videoId: string;
          playerVars?: Record<string, number | string>;
          events?: {
            onReady?: () => void;
            onStateChange?: (e: { data: number }) => void;
          };
        }
      ) => { destroy(): void };
      PlayerState: { ENDED: number };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

const STORAGE_KEY = "docstage-completed";

function useCompleted() {
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setCompleted(new Set(JSON.parse(raw) as string[]));
    } catch {}
  }, []);

  const toggle = useCallback((key: string) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      return next;
    });
  }, []);

  const markCompleted = useCallback((key: string) => {
    setCompleted((prev) => {
      if (prev.has(key)) return prev;
      const next = new Set(prev);
      next.add(key);
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      return next;
    });
  }, []);

  return { completed, toggle, markCompleted };
}

export default function DocstagePlayerClient({
  moduloId,
  aulaId,
}: {
  moduloId: string;
  aulaId: number;
}) {
  const router = useRouter();
  const modulo = getDocstageModulo(moduloId)!;
  const aula = getDocstageAula(moduloId, aulaId)!;
  const completedKey = `${moduloId}-${aulaId}`;

  const { completed, toggle, markCompleted } = useCompleted();

  const [videoId, setVideoId] = useState<string | null>(null);
  const [videoLoading, setVideoLoading] = useState(true);

  useEffect(() => {
    setVideoId(null);
    setVideoLoading(true);
    fetch(`/api/docstage/${moduloId}/${aulaId}/embed`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setVideoId(data?.videoId ?? null))
      .catch(() => setVideoId(null))
      .finally(() => setVideoLoading(false));
  }, [moduloId, aulaId]);

  const playerContainerRef = useRef<HTMLDivElement>(null);
  const ytPlayerRef = useRef<{ destroy(): void } | null>(null);

  useEffect(() => {
    if (!videoId || !playerContainerRef.current) return;
    const container = playerContainerRef.current;

    function createPlayer() {
      if (!container) return;
      if (ytPlayerRef.current) { ytPlayerRef.current.destroy(); ytPlayerRef.current = null; }
      container.innerHTML = "";
      const div = document.createElement("div");
      div.style.width = "100%";
      div.style.height = "100%";
      container.appendChild(div);

      ytPlayerRef.current = new window.YT.Player(div, {
        videoId: videoId!,
        playerVars: { rel: 0, modestbranding: 1, autoplay: 1 },
        events: {
          onStateChange: (e: { data: number }) => {
            if (e.data === window.YT.PlayerState.ENDED) markCompleted(completedKey);
          },
        },
      });
    }

    if (window.YT?.Player) {
      createPlayer();
    } else {
      window.onYouTubeIframeAPIReady = createPlayer;
      if (!document.getElementById("yt-iframe-api")) {
        const s = document.createElement("script");
        s.id = "yt-iframe-api";
        s.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(s);
      }
    }

    return () => { if (ytPlayerRef.current) { ytPlayerRef.current.destroy(); ytPlayerRef.current = null; } };
  }, [videoId, completedKey, markCompleted]);

  const currentIdx = modulo.aulas.findIndex((a) => a.id === aulaId);
  const prevAula = currentIdx > 0 ? modulo.aulas[currentIdx - 1] : null;
  const nextAula = currentIdx < modulo.aulas.length - 1 ? modulo.aulas[currentIdx + 1] : null;

  const completedCount = modulo.aulas.filter((a) => completed.has(`${moduloId}-${a.id}`)).length;
  const progress = Math.round((completedCount / modulo.aulas.length) * 100);

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-[#0c1117]">
      {/* Top bar */}
      <header className="flex items-center gap-3 px-4 py-3 bg-[#0f1923] border-b border-white/8 shrink-0">
        <Link
          href={`/dashboard/cursos/docstage/${moduloId}`}
          className="flex items-center gap-1.5 text-[#5a8caa] hover:text-white transition-colors text-sm shrink-0"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Voltar
        </Link>

        <div className="flex-1 min-w-0">
          <p className="text-[11px] text-[#5a8caa] truncate hidden sm:block">Docstage</p>
          <p className="text-sm font-semibold text-white line-clamp-2 leading-snug">{aula.titulo}</p>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => prevAula && router.push(`/dashboard/cursos/docstage/${moduloId}/${prevAula.id}`)}
            disabled={!prevAula}
            title="Aula anterior"
            className="p-2 rounded-lg text-[#5a8caa] hover:text-white hover:bg-white/8 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="19 20 9 12 19 4 19 20" /><line x1="5" y1="19" x2="5" y2="5" />
            </svg>
          </button>
          <button
            onClick={() => nextAula && router.push(`/dashboard/cursos/docstage/${moduloId}/${nextAula.id}`)}
            disabled={!nextAula}
            title="Próxima aula"
            className="p-2 rounded-lg text-[#5a8caa] hover:text-white hover:bg-white/8 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 4 15 12 5 20 5 4" /><line x1="19" y1="5" x2="19" y2="19" />
            </svg>
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Video */}
          <div className="relative w-full bg-black" style={{ paddingBottom: "56.25%" }}>
            {videoLoading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-[#0a1220]">
                <svg className="animate-spin text-[#3db8d4]" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
              </div>
            ) : videoId ? (
              <div ref={playerContainerRef} className="absolute inset-0" style={{ width: "100%", height: "100%" }} />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a1220] gap-3">
                <p className="text-[#5a8caa] text-sm">Vídeo em breve</p>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="bg-[#0f1923] border-t border-white/8 p-5 flex flex-col gap-4">
            {aula.descricao ? (
              <div className="flex flex-col gap-3">
                {aula.descricao.split("\n\n").map((p, i) => (
                  <p key={i} className="text-sm text-[#8aabb8] leading-relaxed">{p}</p>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#5a8caa]">Nenhuma descrição disponível.</p>
            )}
            <button
              onClick={() => toggle(completedKey)}
              className={`self-start inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                completed.has(completedKey)
                  ? "bg-green-600/20 text-green-400 hover:bg-green-600/30"
                  : "bg-[#1a6aad]/20 text-[#3db8d4] hover:bg-[#1a6aad]/30"
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {completed.has(completedKey) ? "Concluída" : "Marcar como concluída"}
            </button>
          </div>

          {/* Mobile lesson list */}
          <div className="lg:hidden border-t border-white/8 bg-[#0f1923]">
            <div className="px-4 py-3 border-b border-white/8">
              <p className="text-xs font-bold text-white uppercase tracking-wider line-clamp-2">{modulo.titulo}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-[#3db8d4] rounded-full transition-all" style={{ width: `${progress}%` }} />
                </div>
                <span className="text-[11px] text-[#5a8caa] shrink-0">{progress}%</span>
              </div>
            </div>
            {modulo.aulas.map((a) => (
              <AulaItem key={a.id} aula={a} moduloId={moduloId} aulaId={aulaId} completed={completed} />
            ))}
          </div>
        </div>

        {/* Sidebar — desktop */}
        <aside className="hidden lg:flex flex-col w-[320px] shrink-0 bg-[#0f1923] border-l border-white/8 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/8 shrink-0">
            <p className="text-sm font-bold text-white leading-snug">{modulo.titulo}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-[#3db8d4] rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
              <span className="text-[11px] text-[#5a8caa] shrink-0">{progress}%</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {modulo.aulas.map((a) => (
              <AulaItem key={a.id} aula={a} moduloId={moduloId} aulaId={aulaId} completed={completed} />
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

function AulaItem({
  aula,
  moduloId,
  aulaId,
  completed,
}: {
  aula: DocstageAula;
  moduloId: string;
  aulaId: number;
  completed: Set<string>;
}) {
  const isActive = aula.id === aulaId;
  const isDone = completed.has(`${moduloId}-${aula.id}`);

  return (
    <Link
      href={`/dashboard/cursos/docstage/${moduloId}/${aula.id}`}
      className={`flex items-center gap-3 px-4 py-3 border-b border-white/5 transition-colors ${
        isActive ? "bg-white/8" : "hover:bg-white/5"
      }`}
    >
      <div className="w-7 h-7 rounded-full bg-[#1a2d45] flex items-center justify-center text-xs font-bold text-[#5a8caa] shrink-0">
        {aula.id}
      </div>
      <p className={`flex-1 text-xs leading-snug line-clamp-3 ${isActive ? "text-white font-semibold" : "text-[#8aabb8]"}`}>
        {aula.titulo}
      </p>
      {isDone && (
        <div className="shrink-0 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
      )}
    </Link>
  );
}
