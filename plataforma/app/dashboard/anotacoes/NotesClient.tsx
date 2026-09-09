"use client";
import { useState, useRef, useEffect } from "react";

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

const LIMIT = 50;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export default function NotesClient({ initialNotes }: { initialNotes: Note[] }) {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [open, setOpen] = useState<Note | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open !== null && editorRef.current) {
      editorRef.current.innerHTML = open.content;
    }
  }, [open]);

  function openNew() {
    setIsNew(true);
    setTitle("");
    setOpen({ id: "", title: "", content: "", createdAt: "", updatedAt: "" });
  }

  function openNote(note: Note) {
    setIsNew(false);
    setTitle(note.title);
    setOpen(note);
  }

  function closeEditor() {
    setOpen(null);
    setIsNew(false);
  }

  async function save() {
    if (!open) return;
    const content = editorRef.current?.innerHTML ?? "";
    setSaving(true);
    try {
      if (isNew) {
        const res = await fetch("/api/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: title.trim() || "Sem título", content }),
        });
        if (!res.ok) {
          const err = await res.json();
          alert(err.error ?? "Erro ao salvar");
          return;
        }
        const note: Note = await res.json();
        setNotes(prev => [note, ...prev]);
        setOpen(note);
        setTitle(note.title);
        setIsNew(false);
      } else {
        await fetch(`/api/notes/${open.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: title.trim() || "Sem título", content }),
        });
        const updated = { ...open, title: title.trim() || "Sem título", content, updatedAt: new Date().toISOString() };
        setNotes(prev => prev.map(n => n.id === open.id ? updated : n));
        setOpen(updated);
      }
    } finally {
      setSaving(false);
    }
  }

  async function deleteNote(id: string) {
    await fetch(`/api/notes/${id}`, { method: "DELETE" });
    setNotes(prev => prev.filter(n => n.id !== id));
    setDeleteConfirm(null);
    if (open?.id === id) closeEditor();
  }

  async function copyText() {
    const html = `<h2>${title}</h2>${editorRef.current?.innerHTML ?? ""}`;
    const plain = `${title}\n\n${editorRef.current?.innerText ?? ""}`;
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/html": new Blob([html], { type: "text/html" }),
          "text/plain": new Blob([plain], { type: "text/plain" }),
        }),
      ]);
    } catch {
      await navigator.clipboard.writeText(plain);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function printNote() {
    const area = document.getElementById("print-area");
    if (!area) return;
    try {
      const [{ jsPDF }, { default: html2canvas }] = await Promise.all([
        import("jspdf"),
        import("html2canvas"),
      ]);
      const titleEl = document.createElement("h2");
      titleEl.style.cssText = "font-size:18px;font-weight:700;margin-bottom:16px;color:#0f2d4a;font-family:inherit";
      titleEl.textContent = title || "Anotação";
      area.prepend(titleEl);
      const canvas = await html2canvas(area, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
      titleEl.remove();
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const imgW = pageW;
      const imgH = (canvas.height * imgW) / canvas.width;
      let yPos = 0;
      let remaining = imgH;
      let first = true;
      while (remaining > 0) {
        const sliceH = Math.min(pageH, remaining);
        const sc = document.createElement("canvas");
        sc.width = canvas.width;
        sc.height = Math.round((sliceH * canvas.width) / imgW);
        const ctx = sc.getContext("2d")!;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, sc.width, sc.height);
        ctx.drawImage(canvas, 0, Math.round((yPos * canvas.width) / imgW), canvas.width, sc.height, 0, 0, canvas.width, sc.height);
        if (!first) pdf.addPage();
        pdf.addImage(sc.toDataURL("image/png"), "PNG", 0, 0, imgW, sliceH);
        yPos += sliceH;
        remaining -= sliceH;
        first = false;
      }
      pdf.save(`${title || "anotacao"}.pdf`);
    } catch (err) {
      console.error("PDF error:", err);
      alert("Erro ao gerar PDF. Tente novamente.");
    }
  }

  function exec(cmd: string, value?: string) {
    document.execCommand(cmd, false, value ?? undefined);
    editorRef.current?.focus();
  }

  const toolbarBtn = (label: string, cmd: string, value?: string, title?: string) => (
    <button
      type="button"
      onMouseDown={e => { e.preventDefault(); exec(cmd, value); }}
      title={title ?? label}
      className="px-2 py-1 rounded hover:bg-zinc-200 text-zinc-700 text-sm font-medium transition-colors"
    >
      {label}
    </button>
  );

  return (
    <>
<div className="min-h-screen bg-[#f4f8fc]">
        {/* Header */}
        <div className="bg-white border-b border-zinc-200 px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#0f2d4a]">Anotações</h1>
            <p className="text-sm text-zinc-500 mt-0.5">
              {notes.length}/{LIMIT} anotações salvas
            </p>
          </div>
          <button
            onClick={openNew}
            disabled={notes.length >= LIMIT}
            className="flex items-center gap-2 bg-[#1a6aad] hover:bg-[#155d96] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Nova anotação
          </button>
        </div>

        {/* Grid */}
        <div className="max-w-5xl mx-auto px-6 py-8">
          {notes.length === 0 ? (
            <div className="text-center py-20">
              <svg className="mx-auto mb-4 text-zinc-300" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
              <p className="text-zinc-400 font-medium">Nenhuma anotação ainda</p>
              <p className="text-zinc-400 text-sm mt-1">Clique em &quot;Nova anotação&quot; para começar.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {notes.map(note => (
                <div
                  key={note.id}
                  className="group bg-white border border-zinc-200 rounded-2xl p-5 hover:shadow-md hover:border-[#3db8d4] transition-all cursor-pointer relative"
                  onClick={() => openNote(note)}
                >
                  <button
                    onClick={e => { e.stopPropagation(); setDeleteConfirm(note.id); }}
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-zinc-300 hover:text-red-500 transition-all p-1 rounded"
                    title="Excluir"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                  </button>
                  <h3 className="font-bold text-[#0f2d4a] text-sm mb-2 pr-6 line-clamp-2">
                    {note.title || "Sem título"}
                  </h3>
                  <p className="text-zinc-500 text-xs leading-relaxed line-clamp-3 mb-3">
                    {stripHtml(note.content) || "Sem conteúdo"}
                  </p>
                  <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-wide">
                    {formatDate(note.updatedAt)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Editor Modal */}
      {open !== null && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white">
          {/* Modal header */}
          <div className="flex items-center gap-3 px-5 py-3 border-b border-zinc-200 bg-white no-print">
            <button onClick={closeEditor} className="text-zinc-400 hover:text-zinc-700 transition-colors p-1 rounded-lg hover:bg-zinc-100">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            </button>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Título da anotação"
              className="flex-1 text-lg font-bold text-[#0f2d4a] bg-transparent border-none outline-none placeholder-zinc-300"
            />
            <div className="flex items-center gap-2">
              <button
                onClick={copyText}
                className="flex items-center gap-1.5 text-xs font-semibold text-zinc-600 hover:text-[#0f2d4a] border border-zinc-200 hover:border-zinc-400 px-3 py-1.5 rounded-lg transition-all"
              >
                {copied ? (
                  <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Copiado</>
                ) : (
                  <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copiar</>
                )}
              </button>
              <button
                onClick={printNote}
                className="flex items-center gap-1.5 text-xs font-semibold text-zinc-600 hover:text-[#0f2d4a] border border-zinc-200 hover:border-zinc-400 px-3 py-1.5 rounded-lg transition-all"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                Gerar PDF
              </button>
              <button
                onClick={save}
                disabled={saving}
                className="flex items-center gap-1.5 text-xs font-semibold bg-[#1a6aad] hover:bg-[#155d96] disabled:opacity-60 text-white px-4 py-1.5 rounded-lg transition-colors"
              >
                {saving ? "Salvando…" : "Salvar"}
              </button>
            </div>
          </div>

          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-0.5 px-4 py-2 border-b border-zinc-100 bg-zinc-50 no-print text-xs">
            {toolbarBtn("N", "bold", undefined, "Negrito")}
            <button type="button" onMouseDown={e => { e.preventDefault(); exec("italic"); }} title="Itálico" className="px-2 py-1 rounded hover:bg-zinc-200 text-zinc-700 italic text-sm font-medium transition-colors">I</button>
            <button type="button" onMouseDown={e => { e.preventDefault(); exec("underline"); }} title="Sublinhado" className="px-2 py-1 rounded hover:bg-zinc-200 text-zinc-700 underline text-sm font-medium transition-colors">S</button>
            <div className="w-px h-5 bg-zinc-300 mx-1" />
            <select
              onChange={e => exec("fontName", e.target.value)}
              defaultValue=""
              className="text-xs border border-zinc-200 rounded px-1 py-0.5 bg-white text-zinc-700 cursor-pointer"
            >
              <option value="" disabled>Fonte</option>
              <option value="Arial, sans-serif">Sans-serif</option>
              <option value="Georgia, serif">Serif</option>
              <option value="'Courier New', monospace">Mono</option>
            </select>
            <select
              onChange={e => exec("fontSize", e.target.value)}
              defaultValue=""
              className="text-xs border border-zinc-200 rounded px-1 py-0.5 bg-white text-zinc-700 cursor-pointer"
            >
              <option value="" disabled>Tamanho</option>
              <option value="2">Pequeno</option>
              <option value="3">Normal</option>
              <option value="4">Grande</option>
              <option value="5">X-Grande</option>
            </select>
            <div className="w-px h-5 bg-zinc-300 mx-1" />
            <button type="button" onMouseDown={e => { e.preventDefault(); exec("justifyLeft"); }} title="Alinhar à esquerda" className="px-2 py-1 rounded hover:bg-zinc-200 text-zinc-700 transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="18" y2="18"/></svg>
            </button>
            <button type="button" onMouseDown={e => { e.preventDefault(); exec("justifyCenter"); }} title="Centralizar" className="px-2 py-1 rounded hover:bg-zinc-200 text-zinc-700 transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="6" y1="12" x2="18" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
            </button>
            <button type="button" onMouseDown={e => { e.preventDefault(); exec("justifyRight"); }} title="Alinhar à direita" className="px-2 py-1 rounded hover:bg-zinc-200 text-zinc-700 transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="9" y1="12" x2="21" y2="12"/><line x1="6" y1="18" x2="21" y2="18"/></svg>
            </button>
            <button type="button" onMouseDown={e => { e.preventDefault(); exec("justifyFull"); }} title="Justificar" className="px-2 py-1 rounded hover:bg-zinc-200 text-zinc-700 transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            <div className="w-px h-5 bg-zinc-300 mx-1" />
            <button type="button" onMouseDown={e => { e.preventDefault(); exec("insertUnorderedList"); }} title="Lista com marcadores" className="px-2 py-1 rounded hover:bg-zinc-200 text-zinc-700 transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4" cy="6" r="1" fill="currentColor" stroke="none"/><circle cx="4" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="4" cy="18" r="1" fill="currentColor" stroke="none"/></svg>
            </button>
            <button type="button" onMouseDown={e => { e.preventDefault(); exec("insertOrderedList"); }} title="Lista numerada" className="px-2 py-1 rounded hover:bg-zinc-200 text-zinc-700 transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/></svg>
            </button>
          </div>

          {/* Editor area */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-10">
            <div id="print-area">
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                className="max-w-3xl mx-auto min-h-[400px] text-zinc-800 text-base leading-relaxed outline-none"
                style={{ fontFamily: "inherit" }}
                onKeyDown={e => {
                  if ((e.ctrlKey || e.metaKey) && e.key === "s") {
                    e.preventDefault();
                    save();
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="font-bold text-[#0f2d4a] text-base mb-2">Excluir anotação?</h3>
            <p className="text-zinc-500 text-sm mb-5">Esta ação não pode ser desfeita.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 border border-zinc-200 text-zinc-600 font-semibold py-2 rounded-xl text-sm hover:bg-zinc-50 transition-colors">Cancelar</button>
              <button onClick={() => deleteNote(deleteConfirm)} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-xl text-sm transition-colors">Excluir</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
