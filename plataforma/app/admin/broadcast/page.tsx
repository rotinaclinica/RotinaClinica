"use client";
import { useState, useEffect } from "react";

const DEFAULT_SUBJECT = "🗓️ Algo grande está chegando — 01/09/2026";
const DEFAULT_BODY = `Chegou o momento de estar presente na sua rotina de forma completa.

Na faculdade, no internato, nos plantões de UPA e PS, na UBS, na emergência ou até na UTI — estamos construindo algo que vai te acompanhar em cada cenário.

O que vem por aí:

✦ Aulas do nosso curso Destravando o Plantão
✦ Condutas práticas e prescrições prontas para o atendimento
✦ Modelos de evolução para cada cenário clínico
✦ Conteúdos para acessar mesmo offline — ebooks e aulas em PDF
✦ Calculadoras, escores e muito mais 📲

Ainda não podemos contar tudo. Mas anote a data: 01/09/2026.

Em breve, mais detalhes.

Obrigado por confiarem na gente. 🤝`;

export default function BroadcastPage() {
  const [subject, setSubject] = useState(DEFAULT_SUBJECT);
  const [body, setBody] = useState(DEFAULT_BODY);
  const [total, setTotal] = useState<number | null>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [result, setResult] = useState<{ sent: number; failed: number; total: number } | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    fetch("/api/admin/broadcast")
      .then((r) => r.json())
      .then((d) => setTotal(d.total))
      .catch(() => {});
  }, []);

  async function handleSend() {
    if (!confirmed) return;
    setStatus("sending");
    try {
      const res = await fetch("/api/admin/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, body }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro desconhecido");
      setResult(data);
      setStatus("done");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-extrabold text-zinc-900 mb-1">Enviar email</h1>
      <p className="text-sm text-zinc-500 mb-8">
        Envio para lista de{" "}
        <strong className="text-zinc-700">{total !== null ? total : "..."} destinatários</strong>{" "}
        via <code className="bg-zinc-100 px-1 rounded">contato@rotinaclinica.com</code>
      </p>

      <div className="flex flex-col gap-5">
        <div>
          <label className="block text-xs font-bold text-zinc-600 uppercase tracking-wide mb-1">
            Assunto
          </label>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            disabled={status !== "idle"}
            className="w-full border border-zinc-300 rounded-lg px-4 py-2.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-50"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-zinc-600 uppercase tracking-wide mb-1">
            Corpo do email{" "}
            <span className="font-normal text-zinc-400 normal-case">(texto simples — parágrafo por linha)</span>
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            disabled={status !== "idle"}
            rows={18}
            className="w-full border border-zinc-300 rounded-lg px-4 py-3 text-sm text-zinc-900 font-mono focus:outline-none focus:ring-2 focus:ring-violet-500 resize-y disabled:opacity-50"
          />
        </div>

        {status === "idle" && (
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="w-4 h-4 accent-violet-600"
            />
            <span className="text-sm text-zinc-700">
              Confirmo que quero enviar este email para toda a lista
            </span>
          </label>
        )}

        {status === "idle" && (
          <button
            onClick={handleSend}
            disabled={!confirmed || !subject.trim() || !body.trim()}
            className="self-start bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold px-8 py-3 rounded-xl text-sm transition-colors"
          >
            Enviar para lista →
          </button>
        )}

        {status === "sending" && (
          <div className="flex items-center gap-3 text-sm text-zinc-600">
            <svg className="animate-spin w-5 h-5 text-violet-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            Enviando em batches… isso pode levar 1 a 2 minutos, não feche a página.
          </div>
        )}

        {status === "done" && result && (
          <div className="rounded-xl border border-green-200 bg-green-50 p-5">
            <p className="font-bold text-green-800 mb-1">✓ Envio concluído</p>
            <p className="text-sm text-green-700">
              {result.sent} enviados · {result.failed} falhas · {result.total} total
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5">
            <p className="font-bold text-red-800">Erro ao enviar. Verifique o console e tente novamente.</p>
          </div>
        )}
      </div>
    </div>
  );
}
