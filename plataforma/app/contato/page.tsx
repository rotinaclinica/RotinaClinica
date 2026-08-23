"use client";
import { useState } from "react";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";

const ASSUNTOS = ["Dúvida", "Sugestão", "Reclamação", "Outro"];

export default function ContatoPage() {
  const [form, setForm] = useState({ nome: "", email: "", assunto: "Dúvida", mensagem: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [erro, setErro] = useState("");

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErro("");
    try {
      const res = await fetch("/api/contato", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setErro(data.error ?? "Erro ao enviar."); setStatus("error"); return; }
      setStatus("ok");
    } catch {
      setErro("Erro ao enviar. Tente novamente."); setStatus("error");
    }
  }

  const inputCls = "w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#3db8d4] focus:border-transparent transition";

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#f8fafc]">
        {/* Header */}
        <div className="bg-[#0f2d4a] px-4 sm:px-6 py-10 sm:py-12">
          <div className="max-w-2xl mx-auto">
            <Link href="/" className="inline-flex items-center gap-1.5 text-[#9ec4de] hover:text-white text-sm mb-6 transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
              Voltar ao site
            </Link>
            <p className="text-[#3db8d4] text-xs font-bold tracking-widest uppercase mb-2">Rotina Clínica</p>
            <h1 className="text-3xl font-extrabold text-white mb-3">Fale conosco</h1>
            <p className="text-[#9ec4de] text-sm leading-relaxed">
              Dúvidas, sugestões ou reclamações — nossa equipe responde pelo e-mail <strong className="text-white">contato@rotinaclinica.com</strong> em até 48 horas.
            </p>
          </div>
        </div>

        {/* Formulário */}
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {status === "ok" ? (
            <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-8 text-center">
              <div className="w-14 h-14 rounded-full bg-[#e8f4fd] flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-[#3db8d4]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <h2 className="text-xl font-bold text-[#0f2d4a] mb-2">Mensagem enviada!</h2>
              <p className="text-zinc-500 text-sm mb-6">Responderemos em breve no e-mail <strong>{form.email}</strong>.</p>
              <button onClick={() => { setStatus("idle"); setForm({ nome: "", email: "", assunto: "Dúvida", mensagem: "" }); }}
                className="text-sm font-semibold text-[#1a6aad] hover:text-[#0f2d4a] transition-colors">
                Enviar outra mensagem
              </button>
            </div>
          ) : (
            <form onSubmit={enviar} className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6 sm:p-8 space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-[#0f2d4a] mb-1.5">Nome</label>
                  <input required value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
                    placeholder="Seu nome" className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0f2d4a] mb-1.5">E-mail</label>
                  <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="seu@email.com" className={inputCls} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0f2d4a] mb-1.5">Assunto</label>
                <select value={form.assunto} onChange={e => setForm(f => ({ ...f, assunto: e.target.value }))} className={inputCls}>
                  {ASSUNTOS.map(a => <option key={a}>{a}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0f2d4a] mb-1.5">Mensagem</label>
                <textarea required rows={6} value={form.mensagem} onChange={e => setForm(f => ({ ...f, mensagem: e.target.value }))}
                  placeholder="Escreva sua mensagem aqui..." className={`${inputCls} resize-none`} />
              </div>

              {erro && <p className="text-red-500 text-sm">{erro}</p>}

              <button type="submit" disabled={status === "loading"}
                className="w-full bg-[#3db8d4] hover:bg-[#2fa8c4] disabled:opacity-60 text-[#0f2d4a] font-bold py-3 rounded-xl transition-all text-sm shadow-md">
                {status === "loading" ? "Enviando..." : "Enviar mensagem"}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
