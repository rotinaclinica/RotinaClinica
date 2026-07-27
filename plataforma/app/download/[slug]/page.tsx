"use client";

import { use, useState } from "react";
import Link from "next/link";
import { Logo } from "@/app/components/Navbar";

const ESTADOS = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS",
  "MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC",
  "SP","SE","TO",
];

const SLUGS: Record<string, { title: string; productId: string }> = {
  "racional-prescricao": {
    title: "O Racional da Prescrição Médica",
    productId: "ebook-free-racional",
  },
  "manual-prescricoes-gratis": {
    title: "Manual de Prescrições (Amostra)",
    productId: "ebook-free-manual",
  },
};

export default function DownloadPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const meta = SLUGS[slug];

  const [form, setForm] = useState({
    name: "", email: "", phone: "", age: "", profile: "",
    doePlantoes: "", state: "", university: "", contentWish: "",
    contentFormat: "", contentFormatOther: "", previousPurchase: "",
    whatsappOptIn: false,
  });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  function set(field: string, value: string | boolean) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const required = ["name","email","phone","age","profile","doePlantoes","state","university","contentWish","contentFormat","previousPurchase"];
    const missing = required.filter((k) => !(form as Record<string,unknown>)[k]);
    if (missing.length) { setError("Por favor, preencha todos os campos obrigatórios."); return; }

    if (form.contentFormat === "outro" && !form.contentFormatOther) {
      setError("Especifique o formato de conteúdo preferido."); return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, productId: meta?.productId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao enviar");
      setDone(true);
      if (data.downloadUrl) {
        const a = document.createElement("a");
        a.href = data.downloadUrl;
        a.download = "";
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao enviar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  if (!meta) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-zinc-500">E-book não encontrado.</p>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen bg-[#f7fafc] flex flex-col items-center justify-center px-6 text-center">
        <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full">
          <div className="text-5xl mb-4">📥</div>
          <h2 className="text-2xl font-extrabold text-[#0f2d4a] mb-2">Download iniciado!</h2>
          <p className="text-zinc-500 mb-6">
            Obrigado pelas respostas. Seu e-book <strong>{meta.title}</strong> está sendo baixado.
          </p>
          <Link href="/produtos" className="text-sm text-[#1a6aad] hover:underline">
            ← Voltar para Ebooks e Cursos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7fafc]">
      {/* Header */}
      <header className="bg-[#0f2d4a] px-6 py-4">
        <div className="max-w-2xl mx-auto">
          <Link href="/"><Logo variant="light" /></Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-8">
          <span className="text-xs font-bold text-[#3db8d4] uppercase tracking-widest">Download gratuito</span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#0f2d4a] mt-1 mb-2">{meta.title}</h1>
          <p className="text-zinc-500">Preencha o questionário abaixo para liberar seu download.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6 md:p-8 space-y-6">

          {/* Nome */}
          <div>
            <label className="block text-sm font-semibold text-[#0f2d4a] mb-1.5">Nome completo *</label>
            <input
              type="text" required
              value={form.name} onChange={(e) => set("name", e.target.value)}
              className="w-full border border-zinc-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3db8d4] focus:border-transparent"
              placeholder="Seu nome"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-[#0f2d4a] mb-1.5">E-mail *</label>
            <input
              type="email" required
              value={form.email} onChange={(e) => set("email", e.target.value)}
              className="w-full border border-zinc-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3db8d4] focus:border-transparent"
              placeholder="seu@email.com"
            />
          </div>

          {/* Celular */}
          <div>
            <label className="block text-sm font-semibold text-[#0f2d4a] mb-1.5">Celular com DDD *</label>
            <input
              type="tel" required
              value={form.phone} onChange={(e) => set("phone", e.target.value)}
              className="w-full border border-zinc-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3db8d4] focus:border-transparent"
              placeholder="(11) 99999-9999"
            />
          </div>

          {/* Idade */}
          <fieldset>
            <legend className="text-sm font-semibold text-[#0f2d4a] mb-2">Qual sua idade? *</legend>
            <div className="space-y-2">
              {["18 a 25 anos","26 a 35 anos","36 a 45 anos","46 ou mais"].map((opt) => (
                <label key={opt} className="flex items-center gap-3 cursor-pointer">
                  <input type="radio" name="age" value={opt} required
                    checked={form.age === opt} onChange={() => set("age", opt)}
                    className="accent-[#3db8d4] w-4 h-4" />
                  <span className="text-sm text-zinc-700">{opt}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* Perfil */}
          <fieldset>
            <legend className="text-sm font-semibold text-[#0f2d4a] mb-2">Você é: *</legend>
            <div className="space-y-2">
              {[
                "Médico ou médica recém formado",
                "Estudante de medicina no internato",
                "Estudante de medicina no ciclo básico ou ciclo clínico",
                "Médico(a) formado há mais de 2 anos",
              ].map((opt) => (
                <label key={opt} className="flex items-center gap-3 cursor-pointer">
                  <input type="radio" name="profile" value={opt} required
                    checked={form.profile === opt} onChange={() => set("profile", opt)}
                    className="accent-[#3db8d4] w-4 h-4" />
                  <span className="text-sm text-zinc-700">{opt}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* Plantões */}
          <fieldset>
            <legend className="text-sm font-semibold text-[#0f2d4a] mb-2">Você já faz plantões? *</legend>
            <div className="space-y-2">
              {[
                "Ainda não",
                "Sim, ocasionalmente (menos de 2 plantões por semana)",
                "Sim, frequentemente (mais de 2 plantões por semana)",
              ].map((opt) => (
                <label key={opt} className="flex items-center gap-3 cursor-pointer">
                  <input type="radio" name="doePlantoes" value={opt} required
                    checked={form.doePlantoes === opt} onChange={() => set("doePlantoes", opt)}
                    className="accent-[#3db8d4] w-4 h-4" />
                  <span className="text-sm text-zinc-700">{opt}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* Universidade */}
          <div>
            <label className="block text-sm font-semibold text-[#0f2d4a] mb-1.5">Em qual universidade você estuda ou se formou? *</label>
            <input
              type="text" required
              value={form.university} onChange={(e) => set("university", e.target.value)}
              className="w-full border border-zinc-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3db8d4] focus:border-transparent"
              placeholder="Nome da universidade"
            />
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-semibold text-[#0f2d4a] mb-1.5">Em qual estado você mora? *</label>
            <select
              required
              value={form.state} onChange={(e) => set("state", e.target.value)}
              className="w-full border border-zinc-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3db8d4] focus:border-transparent bg-white"
            >
              <option value="">Selecione o estado</option>
              {ESTADOS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Assunto */}
          <div>
            <label className="block text-sm font-semibold text-[#0f2d4a] mb-1.5">
              Qual assunto da clínica médica você gostaria que o Rotina Clínica ensinasse mais? *
            </label>
            <textarea
              required rows={3}
              value={form.contentWish} onChange={(e) => set("contentWish", e.target.value)}
              className="w-full border border-zinc-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3db8d4] focus:border-transparent resize-none"
              placeholder="Ex: emergências clínicas, prescrição, condutas em UPA..."
            />
          </div>

          {/* Formato preferido */}
          <fieldset>
            <legend className="text-sm font-semibold text-[#0f2d4a] mb-2">Qual formato de conteúdo você prefere? *</legend>
            <div className="space-y-2">
              {["Carrossel","Caso clínico","Vídeo curto","Aula completa com vídeo longo","Outro"].map((opt) => (
                <label key={opt} className="flex items-center gap-3 cursor-pointer">
                  <input type="radio" name="contentFormat" value={opt.toLowerCase().replace(/ /g,"-")} required
                    checked={form.contentFormat === opt.toLowerCase().replace(/ /g,"-")}
                    onChange={() => set("contentFormat", opt.toLowerCase().replace(/ /g,"-"))}
                    className="accent-[#3db8d4] w-4 h-4" />
                  <span className="text-sm text-zinc-700">{opt}</span>
                </label>
              ))}
            </div>
            {form.contentFormat === "outro" && (
              <input
                type="text"
                value={form.contentFormatOther} onChange={(e) => set("contentFormatOther", e.target.value)}
                className="mt-2 w-full border border-zinc-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3db8d4]"
                placeholder="Qual formato?"
              />
            )}
          </fieldset>

          {/* Compra anterior */}
          <fieldset>
            <legend className="text-sm font-semibold text-[#0f2d4a] mb-2">Você já adquiriu algum ebook ou curso do Rotina Clínica? *</legend>
            <div className="space-y-2">
              {[
                ["ebook", "Sim, ebook"],
                ["curso-presencial", "Sim, curso presencial"],
                ["curso-online", "Sim, curso online"],
                ["ebook-e-curso", "Sim, ebook e curso online ou presencial"],
                ["nenhum", "Ainda não adquiri"],
              ].map(([val, label]) => (
                <label key={val} className="flex items-center gap-3 cursor-pointer">
                  <input type="radio" name="previousPurchase" value={val} required
                    checked={form.previousPurchase === val} onChange={() => set("previousPurchase", val)}
                    className="accent-[#3db8d4] w-4 h-4" />
                  <span className="text-sm text-zinc-700">{label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* WhatsApp opt-in */}
          <fieldset>
            <legend className="text-sm font-semibold text-[#0f2d4a] mb-2">
              Você gostaria de receber materiais gratuitos e ofertas exclusivas pelo WhatsApp? *
            </legend>
            <div className="space-y-2">
              {[["true","Sim"],["false","Não"]].map(([val, label]) => (
                <label key={val} className="flex items-center gap-3 cursor-pointer">
                  <input type="radio" name="whatsappOptIn" value={val} required
                    checked={form.whatsappOptIn === (val === "true")}
                    onChange={() => set("whatsappOptIn", val === "true")}
                    className="accent-[#3db8d4] w-4 h-4" />
                  <span className="text-sm text-zinc-700">{label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {error && (
            <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>
          )}

          <button
            type="submit" disabled={loading}
            className="w-full bg-[#3db8d4] hover:bg-[#2fa8c4] disabled:opacity-60 text-[#0f2d4a] font-bold py-4 rounded-xl transition-all shadow-md text-base"
          >
            {loading ? "Enviando..." : "Baixar e-book gratuitamente →"}
          </button>
        </form>
      </main>
    </div>
  );
}
