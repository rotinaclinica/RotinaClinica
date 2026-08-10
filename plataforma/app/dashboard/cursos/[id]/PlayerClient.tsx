"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MODULOS,
  getAllAulas,
  getAulaById,
  getModuloByAulaId,
  CURSO_TITULO,
  type Aula,
} from "@/lib/cursos-data";

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

const STORAGE_KEY = "destravando-completed";

function MaterialDownloadButton({
  aulaId,
  materialId,
  titulo,
  tamanho,
}: {
  aulaId: number;
  materialId: string;
  titulo: string;
  tamanho?: string;
}) {
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/cursos/${aulaId}/material/${materialId}`);
      if (!res.ok) throw new Error("Falha no download");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const match = disposition.match(/filename\*=UTF-8''(.+)/);
      a.download = match ? decodeURIComponent(match[1]) : `${titulo}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // silently ignore
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/8 hover:border-[#3db8d4]/30 transition-colors text-left w-full disabled:opacity-60"
    >
      <div className="w-9 h-9 rounded-lg bg-[#1a2d45] flex items-center justify-center shrink-0">
        {loading ? (
          <svg className="animate-spin text-[#3db8d4]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3db8d4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 15V3" /><path d="M7 10l5 5 5-5" /><path d="M3 21h18" />
          </svg>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{titulo}</p>
        {tamanho && <p className="text-xs text-[#5a8caa]">PDF · {tamanho}</p>}
      </div>
      <svg className="shrink-0 text-[#5a8caa]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    </button>
  );
}

function useCompleted() {
  const [completed, setCompleted] = useState<Set<number>>(new Set());

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setCompleted(new Set(JSON.parse(raw) as number[]));
    } catch {}
  }, []);

  const toggle = useCallback((id: number) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      return next;
    });
  }, []);

  const markCompleted = useCallback((id: number) => {
    setCompleted((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      return next;
    });
  }, []);

  return { completed, toggle, markCompleted };
}

export default function PlayerClient({ lessonId }: { lessonId: number }) {
  const router = useRouter();
  const allAulas = useMemo(() => getAllAulas(), []);
  const aula = getAulaById(lessonId)!;
  const modulo = getModuloByAulaId(lessonId)!;

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"descricao" | "materiais">("descricao");
  const { completed, toggle, markCompleted } = useCompleted();

  // Fetch videoId from authenticated API
  const [videoId, setVideoId] = useState<string | null>(null);
  const [videoLoading, setVideoLoading] = useState(true);

  useEffect(() => {
    setVideoId(null);
    setVideoLoading(true);
    fetch(`/api/cursos/${lessonId}/embed`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setVideoId(data?.videoId ?? null))
      .catch(() => setVideoId(null))
      .finally(() => setVideoLoading(false));
  }, [lessonId]);

  // YouTube IFrame API player
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const ytPlayerRef = useRef<{ destroy(): void } | null>(null);

  useEffect(() => {
    if (!videoId || !playerContainerRef.current) return;

    const container = playerContainerRef.current;

    function createPlayer() {
      if (!container) return;
      if (ytPlayerRef.current) {
        ytPlayerRef.current.destroy();
        ytPlayerRef.current = null;
      }
      container.innerHTML = "";
      const div = document.createElement("div");
      container.appendChild(div);

      div.style.width = "100%";
      div.style.height = "100%";

      ytPlayerRef.current = new window.YT.Player(div, {
        videoId: videoId!,
        playerVars: { rel: 0, modestbranding: 1, autoplay: 1 },
        events: {
          onStateChange: (e: { data: number }) => {
            if (e.data === window.YT.PlayerState.ENDED) {
              markCompleted(lessonId);
            }
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

    return () => {
      if (ytPlayerRef.current) {
        ytPlayerRef.current.destroy();
        ytPlayerRef.current = null;
      }
    };
  }, [videoId, lessonId, markCompleted]);

  const currentIdx = allAulas.findIndex((a) => a.id === lessonId);
  const prevAula = currentIdx > 0 ? allAulas[currentIdx - 1] : null;
  const nextAula = currentIdx < allAulas.length - 1 ? allAulas[currentIdx + 1] : null;

  const filteredAulas = search.trim()
    ? modulo.aulas.filter((a) =>
        a.titulo.toLowerCase().includes(search.toLowerCase())
      )
    : modulo.aulas;

  const completedInModule = modulo.aulas.filter((a) => completed.has(a.id)).length;
  const progress = Math.round((completedInModule / modulo.aulas.length) * 100);

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-[#0c1117]">
      {/* Top bar */}
      <header className="flex items-center gap-3 px-4 py-3 bg-[#0f1923] border-b border-white/8 shrink-0">
        <Link
          href="/dashboard/cursos"
          className="flex items-center gap-1.5 text-[#5a8caa] hover:text-white transition-colors text-sm shrink-0"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Voltar
        </Link>

        <div className="flex-1 min-w-0">
          <p className="text-[11px] text-[#5a8caa] truncate hidden sm:block">{CURSO_TITULO}</p>
          <p className="text-sm font-semibold text-white truncate">{aula.titulo}</p>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => prevAula && router.push(`/dashboard/cursos/${prevAula.id}`)}
            disabled={!prevAula}
            title="Aula anterior"
            className="p-2 rounded-lg text-[#5a8caa] hover:text-white hover:bg-white/8 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="19 20 9 12 19 4 19 20" /><line x1="5" y1="19" x2="5" y2="5" />
            </svg>
          </button>
          <button
            onClick={() => nextAula && router.push(`/dashboard/cursos/${nextAula.id}`)}
            disabled={!nextAula}
            title="Próxima aula"
            className="p-2 rounded-lg text-[#5a8caa] hover:text-white hover:bg-white/8 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 4 15 12 5 20 5 4" /><line x1="19" y1="5" x2="19" y2="19" />
            </svg>
          </button>
        </div>

        <button
          onClick={() => setSidebarOpen((v) => !v)}
          className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg text-[#5a8caa] hover:text-white hover:bg-white/8 text-sm transition-colors shrink-0"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" /><line x1="9" y1="3" x2="9" y2="21" />
          </svg>
          {sidebarOpen ? "Ocultar lista" : "Mostrar lista"}
        </button>
      </header>

      {/* Body */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Video area */}
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
                <div className="w-16 h-16 rounded-2xl bg-[#1a2d45] flex items-center justify-center">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3db8d4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-[#5a8caa] text-sm">Vídeo em breve</p>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="bg-[#0f1923] border-t border-white/8 shrink-0">
            <div className="flex border-b border-white/8 px-4">
              {(["descricao", "materiais"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab
                      ? "border-[#3db8d4] text-[#3db8d4]"
                      : "border-transparent text-[#5a8caa] hover:text-white"
                  }`}
                >
                  {tab === "descricao" ? "Descrição" : "Materiais"}
                </button>
              ))}
            </div>
            <div className="p-5">
              {activeTab === "descricao" ? (
                <div className="flex flex-col gap-4">
                  {aula.descricao ? (
                    <div className="flex flex-col gap-3">
                      {aula.descricao.split("\n\n").map((p, i) => (
                        <p key={i} className="text-sm text-[#8aabb8] leading-relaxed">{p}</p>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-[#5a8caa]">Nenhuma descrição disponível para esta aula.</p>
                  )}
                  <button
                    onClick={() => toggle(lessonId)}
                    className={`self-start inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                      completed.has(lessonId)
                        ? "bg-green-600/20 text-green-400 hover:bg-green-600/30"
                        : "bg-[#1a6aad]/20 text-[#3db8d4] hover:bg-[#1a6aad]/30"
                    }`}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {completed.has(lessonId) ? "Concluída" : "Marcar como concluída"}
                  </button>
                </div>
              ) : aula.materiais && aula.materiais.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {aula.materiais.map((mat) => (
                    <MaterialDownloadButton
                      key={mat.id}
                      aulaId={lessonId}
                      materialId={mat.id}
                      titulo={mat.titulo}
                      tamanho={mat.tamanho}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#5a8caa]">Nenhum material disponível para esta aula.</p>
              )}
            </div>
          </div>

          {/* Mobile lesson list */}
          <div className="lg:hidden border-t border-white/8 bg-[#0f1923]">
            <div className="px-4 py-3 border-b border-white/8">
              <p className="text-xs font-bold text-white uppercase tracking-wider">{modulo.titulo}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-[#3db8d4] rounded-full transition-all" style={{ width: `${progress}%` }} />
                </div>
                <span className="text-[11px] text-[#5a8caa] shrink-0">{progress}%</span>
              </div>
            </div>
            {modulo.aulas.map((a) => (
              <AulaItem key={a.id} aula={a} lessonId={lessonId} completed={completed} />
            ))}
          </div>
        </div>

        {/* Sidebar — desktop */}
        {sidebarOpen && (
          <aside className="hidden lg:flex flex-col w-[360px] shrink-0 bg-[#0f1923] border-l border-white/8 overflow-hidden">
            <div className="p-3 border-b border-white/8 shrink-0">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar conteúdo"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-[#0c1117] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-[#4a6a7e] pr-8 outline-none focus:border-[#3db8d4]/40"
                />
                <svg className="absolute right-2.5 top-2.5 text-[#4a6a7e]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
            </div>

            <div className="px-4 py-3 border-b border-white/8 shrink-0 flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-[#1a2d45] flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5">
                {modulo.id}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white">{modulo.titulo}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-[#3db8d4] rounded-full transition-all" style={{ width: `${progress}%` }} />
                  </div>
                  <span className="text-[11px] text-[#5a8caa] shrink-0">{progress}%</span>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredAulas.map((a) => (
                <AulaItem key={a.id} aula={a} lessonId={lessonId} completed={completed} />
              ))}
              {filteredAulas.length === 0 && (
                <p className="text-xs text-[#5a8caa] px-4 py-6 text-center">Nenhuma aula encontrada.</p>
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

function AulaItem({
  aula,
  lessonId,
  completed,
}: {
  aula: Aula;
  lessonId: number;
  completed: Set<number>;
}) {
  const isActive = aula.id === lessonId;
  const isDone = completed.has(aula.id);

  return (
    <Link
      href={`/dashboard/cursos/${aula.id}`}
      className={`flex items-center gap-3 px-3 py-3 border-b border-white/5 transition-colors ${
        isActive ? "bg-white/8" : "hover:bg-white/5"
      }`}
    >
      <div className="relative shrink-0 w-[90px] h-[51px] rounded-md overflow-hidden bg-gradient-to-br from-[#0f2d4a] to-[#1a6aad]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/api/cursos/${aula.id}/thumb`}
          alt={aula.titulo}
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
        {isActive && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-[9px] font-bold text-white bg-[#1a6aad] px-1.5 py-0.5 rounded">
              Tocando agora
            </span>
          </div>
        )}
        <span className="absolute bottom-0.5 right-0.5 bg-black/80 text-white text-[9px] font-bold px-1 py-0.5 rounded">
          {aula.duracao}
        </span>
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
