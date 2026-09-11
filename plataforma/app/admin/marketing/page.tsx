"use client";
import { useState, useEffect, useCallback } from "react";

type BrevoList = { id: number; name: string; totalSubscribers: number };
type Campaign = {
  id: number;
  name: string;
  subject: string;
  status: string;
  statistics?: { globalStats?: { opens?: number; clickers?: number; delivered?: number } };
  sentDate?: string;
};
type Template = { name: string; subject: string; body: string };

const TEMPLATES: Template[] = [
  {
    name: "Lançamento — plataforma",
    subject: "🗓️ Algo grande está chegando — 01/09/2026",
    body: `Chegou o momento de estar presente na sua rotina de forma completa.

Na faculdade, no internato, nos plantões de UPA e PS, na UBS, na emergência ou até na UTI — estamos construindo algo que vai te acompanhar em cada cenário.

O que vem por aí:

✦ Aulas do nosso curso Destravando o Plantão
✦ Condutas práticas e prescrições prontas para o atendimento
✦ Modelos de evolução para cada cenário clínico
✦ Ebooks e materiais em PDF para baixar e ler quando quiser
✦ Calculadoras, escores e muito mais 📲

Ainda não podemos contar tudo. Mas anote a data: 01/09/2026.

Em breve, mais detalhes.

Obrigado por confiarem na gente. 🤝

Lucas e Yan
Rotina Clínica`,
  },
  {
    name: "Cadastrou mas não assinou",
    subject: "Ainda dá tempo de ativar seu acesso",
    body: `Você criou sua conta no Rotina Clínica, mas ainda não ativou o acesso à plataforma.

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

Para ativar o seu acesso: https://rotinaclinica.com/assinatura

Qualquer dúvida, é só responder este email.

Lucas e Yan
Rotina Clínica`,
  },
  {
    name: "Compradores Hotmart — apresentar plataforma",
    subject: "Você comprou o manual — agora tem acesso a muito mais",
    body: `Olá!

Obrigado por ter confiado no nosso material. Se você comprou o Manual Prático de Prescrições, já sabe que tentamos deixar o conteúdo o mais direto e aplicável possível para o dia a dia do plantão.

Criamos a plataforma Rotina Clínica justamente para ir além do ebook: prescrições interativas, calculadoras clínicas, videoaulas e materiais atualizados — tudo em um só lugar, no celular ou no computador.

O que está disponível para você agora:

✦ Mais de 224 temas de prescrição organizados por queixa e diagnóstico
✦ Calculadoras e escores clínicos validados
✦ Modelos de evolução prontos para UPA, PS e internação
✦ Curso Destravando o Plantão com aulas práticas
✦ Materiais e ebooks para baixar

Como você já faz parte da nossa comunidade, o acesso começa em R$ 39,90/mês ou R$ 399,00/ano (equivale a 2 meses grátis).

Acesse agora: https://rotinaclinica.com

Qualquer dúvida, é só responder este email.

Lucas e Yan
Rotina Clínica`,
  },
];

const DEFAULT_SENDER = "Lucas e Yan\nRotina Clínica";

function toHtml(text: string) {
  const escaped = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.7;color:#1a1a1a;max-width:600px;margin:0 auto;padding:24px 16px">
${escaped.split(/\n\n+/).map((p) => `<p style="margin:0 0 16px">${p.replace(/\n/g, "<br/>")}</p>`).join("")}
<hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0"/>
<p style="font-size:12px;color:#9ca3af">Você está recebendo este email por ter adquirido um produto da Rotina Clínica.<br/>
Para se descadastrar, <a href="{{unsubscribe}}" style="color:#6b7280">clique aqui</a>.</p>
</div>`;
}

export default function MarketingPage() {
  const [lists, setLists] = useState<BrevoList[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [selectedLists, setSelectedLists] = useState<number[]>([]);
  const [testEmail, setTestEmail] = useState("lucasrdiniz10@gmail.com, rotinaclinica77@gmail.com");

  const [testStatus, setTestStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [testError, setTestError] = useState("");
  const [sendStatus, setSendStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [confirmed, setConfirmed] = useState(false);
  const [sendError, setSendError] = useState("");

  // Queue Brevo (envio em lotes 200/dia)
  type QueueCampaign = { id: string; name: string; subject: string; total: number; alreadySent: number; remaining: number };
  const [queueCampaign, setQueueCampaign] = useState<QueueCampaign | null>(null);
  const [queueStatus, setQueueStatus] = useState<"idle" | "starting" | "done" | "error">("idle");
  const [queueResult, setQueueResult] = useState<{ sentThisRun: number; remaining: number; done: boolean } | null>(null);
  const [queueConfirmed, setQueueConfirmed] = useState(false);
  const [queueError, setQueueError] = useState("");
  const [cancelQueueConfirm, setCancelQueueConfirm] = useState(false);

  const loadQueue = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/marketing/queue");
      const data = await res.json();
      setQueueCampaign(data.campaign ?? null);
    } catch { /* ignora */ }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [mktRes] = await Promise.all([
        fetch("/api/admin/marketing"),
        loadQueue(),
      ]);
      const data = await mktRes.json();
      setLists(data.lists ?? []);
      setCampaigns(data.campaigns ?? []);
    } finally {
      setLoading(false);
    }
  }, [loadQueue]);

  useEffect(() => { load(); }, [load]);

  function applyTemplate(name: string) {
    setSelectedTemplate(name);
    const t = TEMPLATES.find((x) => x.name === name);
    if (t) { setSubject(t.subject); setBody(t.body); }
  }

  function toggleList(id: number) {
    setSelectedLists((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  }

  async function handleTest() {
    const emails = testEmail.split(/[,;\s]+/).map((s) => s.trim()).filter(Boolean);
    if (!emails.length || !subject.trim() || !body.trim()) return;
    setTestStatus("sending");
    setTestError("");
    try {
      const res = await fetch("/api/admin/marketing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "test", subject, htmlContent: toHtml(body), testEmails: emails }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setTestStatus("done");
      } else {
        setTestError(data.error ?? "Erro desconhecido");
        setTestStatus("error");
      }
    } catch {
      setTestStatus("error");
    }
  }

  async function handleSend() {
    if (!confirmed || !subject.trim() || !body.trim() || !selectedLists.length) return;
    setSendStatus("sending");
    setSendError("");
    try {
      const res = await fetch("/api/admin/marketing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create_and_send", subject, htmlContent: toHtml(body), listIds: selectedLists }),
      });
      const data = await res.json();
      if (!res.ok) { setSendError(data.error ?? "Erro desconhecido"); setSendStatus("error"); return; }
      setSendStatus("done");
      setConfirmed(false);
      setTimeout(load, 3000);
    } catch {
      setSendStatus("error");
    }
  }

  async function handleStartQueue() {
    if (!queueConfirmed || !subject.trim() || !body.trim() || !selectedLists.length) return;
    setQueueStatus("starting");
    setQueueError("");
    setQueueResult(null);
    try {
      const res = await fetch("/api/admin/marketing/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start", subject, bodyText: body, listIds: selectedLists, name: subject }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) { setQueueError(data.error ?? "Erro ao iniciar"); setQueueStatus("error"); return; }
      setQueueResult({ sentThisRun: data.sentThisRun, remaining: data.remaining, done: data.done });
      setQueueStatus("done");
      setQueueConfirmed(false);
      loadQueue();
    } catch {
      setQueueStatus("error");
    }
  }

  async function handleCancelQueue() {
    if (!cancelQueueConfirm) { setCancelQueueConfirm(true); return; }
    setCancelQueueConfirm(false);
    await fetch("/api/admin/marketing/queue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "cancel" }),
    });
    loadQueue();
  }

  const totalRecipients = lists.filter((l) => selectedLists.includes(l.id)).reduce((s, l) => s + l.totalSubscribers, 0);
  const locked = sendStatus === "sending";

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-zinc-100 mb-1">Email Marketing — Brevo</h1>
        <p className="text-sm text-zinc-400">Campanhas para compradores Hotmart e listas externas via Brevo. Limite: 300 emails/dia no plano gratuito.</p>
      </div>

      {/* Listas */}
      <div className="p-4 bg-white/5 rounded-xl border border-white/10">
        <p className="text-xs font-bold text-zinc-300 uppercase tracking-wide mb-3">Listas de destinatários</p>
        {loading ? (
          <p className="text-sm text-zinc-500">Carregando listas…</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {lists.map((l) => (
              <button
                key={l.id}
                onClick={() => toggleList(l.id)}
                disabled={locked}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors disabled:opacity-50 ${
                  selectedLists.includes(l.id)
                    ? "bg-violet-600 border-violet-500 text-white"
                    : "bg-white/5 border-white/10 text-zinc-300 hover:border-violet-400"
                }`}
              >
                {l.name}
              </button>
            ))}
          </div>
        )}
        <p className="mt-3 text-xs text-zinc-500">
          A contagem de contatos por lista pode levar algumas horas para atualizar no Brevo após importação. Os envios funcionam normalmente.
        </p>
      </div>

      {/* Modelos */}
      <div className="p-4 bg-white/5 rounded-xl border border-white/10">
        <p className="text-xs font-bold text-zinc-300 uppercase tracking-wide mb-2">Modelo</p>
        <select
          value={selectedTemplate}
          onChange={(e) => applyTemplate(e.target.value)}
          disabled={locked}
          className="w-full border border-white/10 rounded-lg px-3 py-2 text-sm bg-[#161b22] text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-50"
        >
          <option value="">— Selecione um modelo ou escreva do zero —</option>
          {TEMPLATES.map((t) => (
            <option key={t.name} value={t.name}>{t.name}</option>
          ))}
        </select>
      </div>

      {/* Composer */}
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wide mb-1">Assunto</label>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            disabled={locked}
            placeholder="Assunto do email"
            className="w-full border border-white/10 rounded-lg px-4 py-2.5 text-sm text-zinc-100 bg-transparent focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-50"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wide mb-1">
            Corpo <span className="font-normal normal-case text-zinc-400">(texto simples — parágrafo por linha em branco)</span>
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            disabled={locked}
            rows={16}
            placeholder={`Olá!\n\nEscreva o conteúdo aqui...\n\n${DEFAULT_SENDER}`}
            className="w-full border border-white/10 rounded-lg px-4 py-3 text-sm text-zinc-100 font-mono bg-transparent focus:outline-none focus:ring-2 focus:ring-violet-500 resize-y disabled:opacity-50"
          />
        </div>
      </div>

      {/* Teste */}
      <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
        <p className="text-xs font-bold text-zinc-300 uppercase tracking-wide mb-2">Enviar teste</p>
        <div className="flex flex-wrap gap-2">
          <input
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="email@teste.com, outro@email.com"
            className="flex-1 min-w-[220px] border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-100 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={handleTest}
            disabled={testStatus === "sending" || !testEmail.trim() || !subject.trim() || !body.trim()}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 transition-colors"
          >
            {testStatus === "sending" ? "Enviando…" : "Enviar teste"}
          </button>
        </div>
        {testStatus === "done" && <p className="mt-2 text-sm text-green-300">✓ Teste enviado. Verifique a caixa de entrada.</p>}
        {testStatus === "error" && <p className="mt-2 text-sm text-red-300">✗ {testError || "Falha no envio do teste."}</p>}
      </div>

      {/* Envio */}
      <div className="space-y-3">
        {sendStatus === "idle" && (
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="w-4 h-4 mt-0.5 accent-violet-600"
            />
            <span className="text-sm text-zinc-400">
              Confirmo que quero enviar esta campanha para{" "}
              <strong className="text-zinc-200">
                {selectedLists.length === 0
                  ? "nenhuma lista selecionada"
                  : totalRecipients > 0
                  ? `${totalRecipients} destinatários`
                  : `${selectedLists.length} lista${selectedLists.length > 1 ? "s" : ""} selecionada${selectedLists.length > 1 ? "s" : ""} (contagem pendente de sync)`}
              </strong>.
            </span>
          </label>
        )}

        {sendStatus === "idle" && (
          <button
            onClick={handleSend}
            disabled={!confirmed || !subject.trim() || !body.trim() || !selectedLists.length}
            className="bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold px-8 py-3 rounded-xl text-sm transition-colors"
          >
            Enviar campanha →
          </button>
        )}

        {sendStatus === "sending" && (
          <div className="flex items-center gap-3 text-sm text-zinc-400">
            <svg className="animate-spin w-5 h-5 text-violet-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            Criando e enviando campanha no Brevo…
          </div>
        )}

        {sendStatus === "done" && (
          <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4">
            <p className="font-bold text-green-300">✓ Campanha enviada com sucesso!</p>
            <p className="text-sm text-green-300 mt-1">O Brevo está processando o envio. Acompanhe os resultados abaixo em alguns minutos.</p>
            <button onClick={() => setSendStatus("idle")} className="mt-3 text-xs text-green-400 hover:underline">Criar nova campanha</button>
          </div>
        )}

        {sendStatus === "error" && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
            <p className="font-bold text-red-300">✗ Erro ao enviar campanha</p>
            {sendError && <p className="text-sm text-red-300 mt-1">{sendError}</p>}
            <button onClick={() => setSendStatus("idle")} className="mt-2 text-xs text-red-400 hover:underline">Tentar novamente</button>
          </div>
        )}
      </div>

      {/* Queue Brevo — envio em lotes 200/dia */}
      <div className="p-5 bg-white/5 rounded-2xl border border-white/10 space-y-4">
        <div>
          <p className="text-sm font-bold text-zinc-100">Envio em lotes — 200/dia (recomendado)</p>
          <p className="text-xs text-zinc-400 mt-0.5">Envia diretamente via API transacional do Brevo, 200 por dia, sem atingir o limite do plano gratuito. O cron roda às 08h todo dia.</p>
        </div>

        {/* Campanha ativa */}
        {queueCampaign && (
          <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-bold text-emerald-300">📣 Campanha em andamento</p>
                <p className="text-sm text-emerald-300 mt-0.5 truncate">&ldquo;{queueCampaign.subject}&rdquo;</p>
                <p className="text-xs text-emerald-300 mt-1">
                  <strong>{queueCampaign.alreadySent}</strong> de <strong>{queueCampaign.total}</strong> enviados ·{" "}
                  <strong>{queueCampaign.remaining}</strong> restantes
                </p>
              </div>
              {!cancelQueueConfirm ? (
                <button onClick={handleCancelQueue} className="shrink-0 text-xs font-semibold text-red-400 hover:underline">Cancelar</button>
              ) : (
                <div className="shrink-0 flex flex-col items-end gap-1">
                  <p className="text-[11px] text-red-300 font-semibold">Tem certeza?</p>
                  <div className="flex gap-2">
                    <button onClick={handleCancelQueue} className="text-xs font-bold text-red-400 hover:underline">Sim</button>
                    <button onClick={() => setCancelQueueConfirm(false)} className="text-xs text-zinc-400 hover:underline">Não</button>
                  </div>
                </div>
              )}
            </div>
            <div className="mt-3 h-2 rounded-full bg-emerald-500/20 overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all"
                style={{ width: `${Math.round((queueCampaign.alreadySent / Math.max(1, queueCampaign.total)) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Iniciar nova */}
        {queueStatus === "idle" && (
          <div className="space-y-3">
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={queueConfirmed}
                onChange={(e) => setQueueConfirmed(e.target.checked)}
                className="w-4 h-4 mt-0.5 accent-violet-600"
              />
              <span className="text-sm text-zinc-400">
                Confirmo que quero iniciar o envio em lotes para{" "}
                <strong className="text-zinc-200">
                  {selectedLists.length === 0 ? "nenhuma lista selecionada" :
                    totalRecipients > 0 ? `~${totalRecipients} destinatários` :
                    `${selectedLists.length} lista${selectedLists.length > 1 ? "s" : ""} selecionada${selectedLists.length > 1 ? "s" : ""}`}
                </strong>{" "}(200/dia até terminar).
              </span>
            </label>
            <button
              onClick={handleStartQueue}
              disabled={!queueConfirmed || !subject.trim() || !body.trim() || !selectedLists.length}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-colors"
            >
              Iniciar envio em lotes →
            </button>
          </div>
        )}

        {queueStatus === "starting" && (
          <div className="flex items-center gap-3 text-sm text-zinc-400">
            <svg className="animate-spin w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            Buscando contatos e enviando 1º lote…
          </div>
        )}

        {queueStatus === "done" && queueResult && (
          <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4">
            <p className="font-bold text-green-300">
              {queueResult.done ? "✓ Campanha concluída — todos receberam!" : `✓ 1º lote enviado (${queueResult.sentThisRun} emails)!`}
            </p>
            {!queueResult.done && (
              <p className="text-xs text-green-400 mt-1">
                {queueResult.remaining} restantes — serão enviados automaticamente às 08h todo dia.
              </p>
            )}
            <button onClick={() => setQueueStatus("idle")} className="mt-2 text-xs text-green-400 hover:underline">Nova campanha</button>
          </div>
        )}

        {queueStatus === "error" && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
            <p className="font-bold text-red-300">✗ Erro ao iniciar</p>
            {queueError && <p className="text-sm text-red-300 mt-1">{queueError}</p>}
            <button onClick={() => setQueueStatus("idle")} className="mt-2 text-xs text-red-400 hover:underline">Tentar novamente</button>
          </div>
        )}
      </div>

      {/* Histórico */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold text-zinc-300 uppercase tracking-wide">Campanhas anteriores</p>
          <button onClick={load} className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">↻ Atualizar</button>
        </div>
        {loading ? (
          <p className="text-sm text-zinc-500">Carregando…</p>
        ) : campaigns.length === 0 ? (
          <p className="text-sm text-zinc-500">Nenhuma campanha enviada ainda.</p>
        ) : (
          <div className="space-y-2">
            {campaigns.map((c) => {
              const stats = c.statistics?.globalStats;
              const delivered = stats?.delivered ?? 0;
              const opens = stats?.opens ?? 0;
              const clicks = stats?.clickers ?? 0;
              const openRate = delivered > 0 ? Math.round((opens / delivered) * 100) : null;
              const clickRate = delivered > 0 ? Math.round((clicks / delivered) * 100) : null;
              return (
                <div key={c.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-zinc-100 truncate">{c.subject}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {c.sentDate ? new Date(c.sentDate).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    {delivered > 0 && (
                      <>
                        <span className="text-xs text-zinc-400">{delivered} entregues</span>
                        {openRate !== null && <span className="text-xs font-semibold text-emerald-400">{openRate}% abertos</span>}
                        {clickRate !== null && <span className="text-xs font-semibold text-blue-400">{clickRate}% cliques</span>}
                      </>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      c.status === "sent" ? "bg-green-500/20 text-green-300" :
                      c.status === "draft" ? "bg-zinc-500/20 text-zinc-400" :
                      "bg-yellow-500/20 text-yellow-300"
                    }`}>
                      {c.status === "sent" ? "Enviado" : c.status === "draft" ? "Rascunho" : c.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
