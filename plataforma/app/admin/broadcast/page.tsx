"use client";
import { useState, useEffect } from "react";

type Template = { name: string; subject: string; body: string };

const LAUNCH_BODY = `Chegou o momento de estar presente na sua rotina de forma completa.

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

// Modelos embutidos (sempre disponíveis)
const BUILTIN_TEMPLATES: Template[] = [
  { name: "Lançamento — 01/09", subject: "🗓️ Algo grande está chegando — 01/09/2026", body: LAUNCH_BODY },
];

const STORAGE_KEY = "broadcast_templates";

export default function BroadcastPage() {
  // Campos começam EM BRANCO ao abrir a página
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [total, setTotal] = useState<number | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const [customTemplates, setCustomTemplates] = useState<Template[]>([]);
  const [selected, setSelected] = useState("");

  const [testEmails, setTestEmails] = useState("lucasrdiniz10@gmail.com, rotinaclinica77@gmail.com");
  const [testStatus, setTestStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [testResult, setTestResult] = useState<{ sent: number; failed: number; errors?: string[] } | null>(null);

  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [result, setResult] = useState<{ sent: number; failed: number; total: number; errors?: string[] } | null>(null);

  useEffect(() => {
    fetch("/api/admin/broadcast").then((r) => r.json()).then((d) => setTotal(d.total)).catch(() => {});
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setCustomTemplates(JSON.parse(raw));
    } catch {
      // localStorage indisponível
    }
  }, []);

  const allTemplates = [...BUILTIN_TEMPLATES, ...customTemplates];

  function applyTemplate(name: string) {
    setSelected(name);
    const t = allTemplates.find((x) => x.name === name);
    if (t) {
      setSubject(t.subject);
      setBody(t.body);
    }
  }

  function saveAsTemplate() {
    if (!subject.trim() && !body.trim()) return;
    const name = window.prompt("Nome do modelo:")?.trim();
    if (!name) return;
    const next = [...customTemplates.filter((t) => t.name !== name), { name, subject, body }];
    setCustomTemplates(next);
    setSelected(name);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignora
    }
  }

  function deleteTemplate() {
    if (!selected || BUILTIN_TEMPLATES.some((t) => t.name === selected)) return;
    if (!window.confirm(`Excluir o modelo "${selected}"?`)) return;
    const next = customTemplates.filter((t) => t.name !== selected);
    setCustomTemplates(next);
    setSelected("");
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignora
    }
  }

  async function handleTest() {
    const list = testEmails.split(/[,;\s]+/).map((s) => s.trim()).filter(Boolean);
    if (list.length === 0 || !subject.trim() || !body.trim()) return;
    setTestStatus("sending");
    setTestResult(null);
    try {
      const res = await fetch("/api/admin/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, body, testEmails: list }),
      });
      const data = await res.json();
      setTestResult(data);
      setTestStatus(res.ok && !data.error ? "done" : "error");
    } catch {
      setTestStatus("error");
    }
  }

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

  const isCustomSelected = selected && !BUILTIN_TEMPLATES.some((t) => t.name === selected);
  const locked = status !== "idle";

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-extrabold text-zinc-900 mb-1">Enviar email</h1>
      <p className="text-sm text-zinc-500 mb-6">
        Envio para lista de{" "}
        <strong className="text-zinc-700">{total !== null ? total : "..."} destinatários</strong>{" "}
        via <code className="bg-zinc-100 px-1 rounded">contato@rotinaclinica.com</code>
      </p>

      {/* Modelos */}
      <div className="flex flex-wrap items-end gap-2 mb-5 p-4 bg-zinc-100/60 rounded-xl border border-zinc-200">
        <div className="flex-1 min-w-[180px]">
          <label className="block text-xs font-bold text-zinc-600 uppercase tracking-wide mb-1">Modelo</label>
          <select
            value={selected}
            onChange={(e) => applyTemplate(e.target.value)}
            disabled={locked}
            className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm bg-white text-zinc-900 focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-50"
          >
            <option value="">— Selecione um modelo —</option>
            {allTemplates.map((t) => (
              <option key={t.name} value={t.name}>{t.name}</option>
            ))}
          </select>
        </div>
        <button
          onClick={saveAsTemplate}
          disabled={locked || (!subject.trim() && !body.trim())}
          className="px-3 py-2 rounded-lg text-xs font-semibold bg-white border border-zinc-300 text-zinc-700 hover:border-violet-400 disabled:opacity-40 transition-colors"
        >
          Salvar como modelo
        </button>
        {isCustomSelected && (
          <button
            onClick={deleteTemplate}
            disabled={locked}
            className="px-3 py-2 rounded-lg text-xs font-semibold bg-white border border-red-200 text-red-600 hover:border-red-400 disabled:opacity-40 transition-colors"
          >
            Excluir modelo
          </button>
        )}
      </div>

      <div className="flex flex-col gap-5">
        <div>
          <label className="block text-xs font-bold text-zinc-600 uppercase tracking-wide mb-1">Assunto</label>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            disabled={locked}
            placeholder="Assunto do email"
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
            disabled={locked}
            rows={18}
            placeholder="Escreva o conteúdo do email aqui…"
            className="w-full border border-zinc-300 rounded-lg px-4 py-3 text-sm text-zinc-900 font-mono focus:outline-none focus:ring-2 focus:ring-violet-500 resize-y disabled:opacity-50"
          />
        </div>

        {/* Envio de teste */}
        <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-100">
          <label className="block text-xs font-bold text-zinc-600 uppercase tracking-wide mb-1">
            Enviar teste primeiro{" "}
            <span className="font-normal text-zinc-400 normal-case">(até 5 emails, separados por vírgula)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            <input
              value={testEmails}
              onChange={(e) => setTestEmails(e.target.value)}
              disabled={locked}
              placeholder="voce@email.com, outro@email.com"
              className="flex-1 min-w-[200px] border border-zinc-300 rounded-lg px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
            />
            <button
              onClick={handleTest}
              disabled={locked || testStatus === "sending" || !testEmails.trim() || !subject.trim() || !body.trim()}
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 transition-colors"
            >
              {testStatus === "sending" ? "Enviando…" : "Enviar teste"}
            </button>
          </div>
          {testStatus === "done" && testResult && testResult.failed === 0 && (
            <p className="mt-2 text-sm text-green-700">
              ✓ Teste enviado: {testResult.sent} enviado(s) · 0 falhas.
              {" "}Cheque a caixa de entrada (e o spam).
            </p>
          )}
          {testStatus === "done" && testResult && testResult.failed > 0 && (
            <div className="mt-2 text-sm text-red-700">
              <p className="font-semibold">✗ {testResult.failed} falha(s) — nada foi entregue.</p>
              {testResult.errors?.length ? (
                <p className="mt-1 text-xs break-words">Motivo: {testResult.errors[0]}</p>
              ) : null}
            </div>
          )}
          {testStatus === "error" && (
            <p className="mt-2 text-sm text-red-700">
              Falha no teste{(testResult as { error?: string })?.error ? `: ${(testResult as { error?: string }).error}` : testResult?.errors?.length ? `: ${testResult.errors[0]}` : "."}
            </p>
          )}
        </div>

        {status === "idle" && (
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="w-4 h-4 accent-violet-600"
            />
            <span className="text-sm text-zinc-700">Confirmo que quero enviar este email para toda a lista</span>
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
            {result.failed > 0 && result.errors?.length ? (
              <p className="text-xs text-red-600 mt-2 break-words">Erro: {result.errors[0]}</p>
            ) : null}
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
