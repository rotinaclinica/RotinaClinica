"use client";
import { useState, useEffect } from "react";

type Template = { name: string; subject: string; body: string };

const LAUNCH_BODY = `Chegou o momento de estar presente na sua rotina de forma completa.

Na faculdade, no internato, nos plantões de UPA e PS, na UBS, na emergência ou até na UTI — estamos construindo algo que vai te acompanhar em cada cenário.

O que vem por aí:

✦ Aulas do nosso curso Destravando o Plantão
✦ Condutas práticas e prescrições prontas para o atendimento
✦ Modelos de evolução para cada cenário clínico
✦ Ebooks e materiais em PDF para baixar e ler quando quiser
✦ Calculadoras, escores e muito mais 📲

Ainda não podemos contar tudo. Mas anote a data: 01/09/2026.

Em breve, mais detalhes.

Obrigado por confiarem na gente. 🤝`;

const NURTURE_BODY = `Você criou sua conta no Rotina Clínica, mas ainda não ativou o acesso à plataforma.

Queria entender se ficou alguma dúvida ou se posso ajudar em alguma coisa.

Enquanto isso, deixa eu te lembrar o que está te esperando lá dentro:

✦ Prescrições prontas para PS, UPA, UBS e emergência — busca por queixa ou diagnóstico, em segundos
✦ Mais de 224 temas clínicos organizados e atualizados com as diretrizes mais recentes
✦ Calculadoras e escores validados para sua prática clínica diária
✦ Modelos de evolução prontos para agilizar o atendimento
✦ Casos clínicos com raciocínio diagnóstico e conduta detalhada
✦ Cursos e videoaulas — incluindo o Destravando o Plantão

Tudo isso no celular, disponível em qualquer lugar.

O plano mensal começa em R$ 39,90/mês. Se preferir o anual, sai por R$ 33,30/mês (equivale a 2 meses grátis).

E se por algum motivo não gostar, devolvemos 100% em até 7 dias — sem burocracia.

Para ativar o seu acesso: https://rotinaclinica.com.br/assinatura

Qualquer dúvida, é só responder este email.

Lucas e Yan
Rotina Clínica`;

// Modelos embutidos (sempre disponíveis)
const BUILTIN_TEMPLATES: Template[] = [
  { name: "Lançamento — 01/09", subject: "🗓️ Algo grande está chegando — 01/09/2026", body: LAUNCH_BODY },
  { name: "Cadastrou mas não assinou", subject: "Ainda dá tempo de ativar seu acesso", body: NURTURE_BODY },
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

  const [individualEmails, setIndividualEmails] = useState("");
  const [individualStatus, setIndividualStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [individualResult, setIndividualResult] = useState<{ sent: number; failed: number; total: number; errors?: string[] } | null>(null);

  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [result, setResult] = useState<{ sentThisRun: number; remaining: number; alreadySent: number; total: number; done: boolean; errors?: string[] } | null>(null);
  const [campaign, setCampaign] = useState<{ subject: string; alreadySent: number; remaining: number } | null>(null);
  const [cancelConfirm, setCancelConfirm] = useState(false);

  function loadStatus() {
    fetch("/api/admin/broadcast")
      .then((r) => r.json())
      .then((d) => { setTotal(d.total); setCampaign(d.campaign ?? null); })
      .catch(() => {});
  }

  useEffect(() => {
    loadStatus();
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

  async function handleIndividual() {
    const list = individualEmails.split(/[,;\s\n]+/).map((s) => s.trim()).filter(Boolean);
    if (list.length === 0 || !subject.trim() || !body.trim()) return;
    const plural = list.length === 1 ? "1 email" : `${list.length} emails`;
    if (!window.confirm(`Enviar "${subject}" para ${plural} específico(s)?\n\n${list.join("\n")}`)) return;
    setIndividualStatus("sending");
    setIndividualResult(null);
    try {
      const res = await fetch("/api/admin/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, body, individualEmails: list }),
      });
      const data = await res.json();
      setIndividualResult(data);
      setIndividualStatus(res.ok && !data.error ? "done" : "error");
    } catch {
      setIndividualStatus("error");
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
      loadStatus();
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  }

  async function handleCancel() {
    if (!cancelConfirm) { setCancelConfirm(true); return; }
    setCancelConfirm(false);
    try {
      await fetch("/api/admin/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel" }),
      });
      loadStatus();
    } catch {
      // ignora
    }
  }

  const isCustomSelected = selected && !BUILTIN_TEMPLATES.some((t) => t.name === selected);
  const locked = status !== "idle";

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-extrabold text-zinc-100 mb-1">Enviar email</h1>
      <p className="text-sm text-zinc-400 mb-6">
        Envio para lista de{" "}
        <strong className="text-zinc-400">{total !== null ? total : "..."} destinatários</strong>{" "}
        via <code className="bg-white/10 px-1 rounded">contato@rotinaclinica.com</code>
      </p>

      {/* Campanha automática ativa */}
      {campaign && (
        <div className="mb-5 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-bold text-emerald-300">📣 Campanha automática em andamento</p>
              <p className="text-sm text-emerald-300 mt-0.5 truncate">&ldquo;{campaign.subject}&rdquo;</p>
              <p className="text-xs text-emerald-300 mt-1">
                <strong>{campaign.alreadySent}</strong> de <strong>{campaign.alreadySent + campaign.remaining}</strong> enviados ·{" "}
                <strong>{campaign.remaining}</strong> restantes
              </p>
              <p className="text-[11px] text-emerald-400 mt-1">
                Os próximos lotes (~50/dia) são enviados automaticamente todo dia. Você não precisa fazer nada.
              </p>
            </div>
            {!cancelConfirm ? (
              <button
                onClick={handleCancel}
                className="shrink-0 text-xs font-semibold text-red-400 hover:underline"
              >
                Cancelar
              </button>
            ) : (
              <div className="shrink-0 flex flex-col items-end gap-1">
                <p className="text-[11px] text-red-300 font-semibold">Tem certeza?</p>
                <div className="flex gap-2">
                  <button onClick={handleCancel} className="text-xs font-bold text-red-400 hover:underline">Sim, cancelar</button>
                  <button onClick={() => setCancelConfirm(false)} className="text-xs text-zinc-400 hover:underline">Não</button>
                </div>
              </div>
            )}
          </div>
          {/* Barra de progresso */}
          <div className="mt-3 h-2 rounded-full bg-emerald-500/20 overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all"
              style={{ width: `${Math.round((campaign.alreadySent / Math.max(1, campaign.alreadySent + campaign.remaining)) * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Modelos */}
      <div className="flex flex-wrap items-end gap-2 mb-5 p-4 bg-white/5 rounded-xl border border-white/10">
        <div className="flex-1 min-w-[180px]">
          <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wide mb-1">Modelo</label>
          <select
            value={selected}
            onChange={(e) => applyTemplate(e.target.value)}
            disabled={locked}
            className="w-full border border-white/10 rounded-lg px-3 py-2 text-sm bg-[#161b22] text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-50"
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
          className="px-3 py-2 rounded-lg text-xs font-semibold bg-[#161b22] border border-white/10 text-zinc-400 hover:border-violet-400 disabled:opacity-40 transition-colors"
        >
          Salvar como modelo
        </button>
        {isCustomSelected && (
          <button
            onClick={deleteTemplate}
            disabled={locked}
            className="px-3 py-2 rounded-lg text-xs font-semibold bg-[#161b22] border border-red-500/30 text-red-400 hover:border-red-400 disabled:opacity-40 transition-colors"
          >
            Excluir modelo
          </button>
        )}
      </div>

      <div className="flex flex-col gap-5">
        <div>
          <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wide mb-1">Assunto</label>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            disabled={locked}
            placeholder="Assunto do email"
            className="w-full border border-white/10 rounded-lg px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-50"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wide mb-1">
            Corpo do email{" "}
            <span className="font-normal text-zinc-400 normal-case">(texto simples — parágrafo por linha)</span>
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            disabled={locked}
            rows={18}
            placeholder="Escreva o conteúdo do email aqui…"
            className="w-full border border-white/10 rounded-lg px-4 py-3 text-sm text-zinc-100 font-mono focus:outline-none focus:ring-2 focus:ring-violet-500 resize-y disabled:opacity-50"
          />
        </div>

        {/* Envio de teste */}
        <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-100">
          <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wide mb-1">
            Enviar teste primeiro{" "}
            <span className="font-normal text-zinc-400 normal-case">(até 5 emails, separados por vírgula)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            <input
              value={testEmails}
              onChange={(e) => setTestEmails(e.target.value)}
              disabled={locked}
              placeholder="voce@email.com, outro@email.com"
              className="flex-1 min-w-[200px] border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
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
            <p className="mt-2 text-sm text-green-300">
              ✓ Teste enviado: {testResult.sent} enviado(s) · 0 falhas.
              {" "}Cheque a caixa de entrada (e o spam).
            </p>
          )}
          {testStatus === "done" && testResult && testResult.failed > 0 && (
            <div className="mt-2 text-sm text-red-300">
              <p className="font-semibold">✗ {testResult.failed} falha(s) — nada foi entregue.</p>
              {testResult.errors?.length ? (
                <p className="mt-1 text-xs break-words">Motivo: {testResult.errors[0]}</p>
              ) : null}
            </div>
          )}
          {testStatus === "error" && (
            <p className="mt-2 text-sm text-red-300">
              Falha no teste{(testResult as { error?: string })?.error ? `: ${(testResult as { error?: string }).error}` : testResult?.errors?.length ? `: ${testResult.errors[0]}` : "."}
            </p>
          )}
        </div>

        {/* Envio direcionado */}
        <div className="p-4 bg-violet-50/60 rounded-xl border border-violet-100">
          <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wide mb-1">
            Envio direcionado{" "}
            <span className="font-normal text-zinc-400 normal-case">(emails individuais ou pequenos grupos — um por linha ou separados por vírgula)</span>
          </label>
          <textarea
            value={individualEmails}
            onChange={(e) => setIndividualEmails(e.target.value)}
            disabled={locked}
            rows={4}
            placeholder={"medico@email.com\noutro@email.com, terceiro@email.com"}
            className="w-full border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-100 font-mono focus:outline-none focus:ring-2 focus:ring-violet-400 disabled:opacity-50 resize-y mb-2"
          />
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handleIndividual}
              disabled={locked || individualStatus === "sending" || !individualEmails.trim() || !subject.trim() || !body.trim()}
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-violet-600 hover:bg-violet-700 text-white disabled:opacity-40 transition-colors"
            >
              {individualStatus === "sending" ? "Enviando…" : "Enviar para esses emails"}
            </button>
            {individualStatus === "done" && individualResult && individualResult.failed === 0 && (
              <p className="text-sm text-green-300">✓ {individualResult.sent} de {individualResult.total} enviado(s) com sucesso.</p>
            )}
            {individualStatus === "done" && individualResult && individualResult.failed > 0 && (
              <p className="text-sm text-amber-300">⚠ {individualResult.sent} enviados · {individualResult.failed} falha(s){individualResult.errors?.length ? `: ${individualResult.errors[0]}` : "."}</p>
            )}
            {individualStatus === "error" && (
              <p className="text-sm text-red-300">Falha no envio. Verifique os emails e tente novamente.</p>
            )}
          </div>
        </div>

        {status === "idle" && (
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="w-4 h-4 mt-0.5 accent-violet-600"
            />
            <span className="text-sm text-zinc-400">
              Confirmo que quero iniciar o envio deste email para toda a lista.
              <span className="block text-xs text-zinc-400 mt-0.5">
                O 1º lote (~50) sai agora; o restante é enviado automaticamente ~50/dia até terminar.
              </span>
            </span>
          </label>
        )}

        {status === "idle" && (
          <button
            onClick={handleSend}
            disabled={!confirmed || !subject.trim() || !body.trim()}
            className="self-start bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold px-8 py-3 rounded-xl text-sm transition-colors"
          >
            Iniciar campanha →
          </button>
        )}

        {status === "sending" && (
          <div className="flex items-center gap-3 text-sm text-zinc-400">
            <svg className="animate-spin w-5 h-5 text-violet-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            Enviando o 1º lote… não feche a página.
          </div>
        )}

        {status === "done" && result && (
          <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-5">
            <p className="font-bold text-green-300 mb-1">
              {result.done ? "✓ Campanha concluída — todos receberam!" : "✓ 1º lote enviado!"}
            </p>
            <p className="text-sm text-green-300">
              {result.sentThisRun} enviados agora · {result.alreadySent} de {result.total} no total ·{" "}
              {result.remaining} restantes
            </p>
            {!result.done && (
              <p className="text-xs text-green-400 mt-2">
                Os próximos lotes (~50/dia) serão enviados <strong>automaticamente todo dia</strong>.
                Você não precisa voltar aqui — pode acompanhar o progresso na barra acima.
              </p>
            )}
            {result.errors?.length ? (
              <p className="text-xs text-amber-400 mt-2 break-words">Obs: {result.errors[0]}</p>
            ) : null}
          </div>
        )}

        {status === "error" && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-5">
            <p className="font-bold text-red-300">Erro ao iniciar. Verifique o console e tente novamente.</p>
          </div>
        )}
      </div>
    </div>
  );
}
