import { readFileSync } from "fs";
import { join } from "path";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import { prescricoesMeta } from "@/lib/prescricoes-meta";
import { evolucoesMeta } from "@/lib/evolucoes-meta";
import TourPrescricaoModal from "./TourPrescricaoModal";
import TourEvolucaoModal from "./TourEvolucaoModal";
import TourCasosMockup from "./TourCasosMockup";

function getPrescricaoContent(id: string): string {
  const filePath = join(process.cwd(), "lib", "prescricoes-content.json");
  const all: Record<string, string> = JSON.parse(readFileSync(filePath, "utf-8"));
  return all[id] ?? "";
}

function getEvolucaoContent(id: string): string {
  const filePath = join(process.cwd(), "lib", "evolucoes-content.json");
  const all: Record<string, string> = JSON.parse(readFileSync(filePath, "utf-8"));
  return all[id] ?? "";
}

export const metadata = { title: "Conheça a Plataforma · Rotina Clínica" };

const prescricoesEmergencia = [
  "Anafilaxia", "Cetoacidose diabética", "Hipoglicemia", "Sepse",
  "DPOC exacerbado", "Hemorragia digestiva alta", "Crise convulsiva",
  "Síndrome coronariana aguda", "Edema agudo de pulmão", "Fibrilação atrial",
  "Taquicardia supraventricular paroxística", "Drogas vasoativas",
  "Noradrenalina", "Dobutamina", "Vasopressina", "Dengue grave (grupos C e D)",
  "Intubação de sequência rápida (ISR)", "Queimaduras",
];

const prescricoesPsUpa = [
  "Antimicrobianos", "Analgésicos", "Anticoagulantes", "Celulite e Erisipela",
  "Urticária", "Dor torácica", "Cefaleia", "Crise de asma",
  "Crises hipertensivas", "Arboviroses / Dengue", "Diarreia aguda",
  "Infecções respiratórias", "Insônia", "Escabiose", "Tinea corporis",
];


const iotTopicos = [
  "Insuficiência Respiratória", "Oxigenoterapia",
  "Ventilação Não Invasiva (VNI)", "Materiais para Intubação",
  "Os 7 Ps da Intubação", "Medicações da ISR",
  "Sedação Pós-Intubação e BNM em BIC",
  "VM: Fundamentos e Modos Ventilatórios",
  "VM em Distúrbios Obstrutivos e Restritivos",
  "Síndrome do Desconforto Respiratório Agudo (SDRA)",
  "VCV — Ventilação Controlada a Volume",
  "PCV — Ventilação Controlada a Pressão",
  "Sedação de Manutenção Pós-Intubação",
];

const calculadoras = [
  { nome: "Glasgow", desc: "Nível de consciência" },
  { nome: "SOFA", desc: "Sepse" },
  { nome: "qSOFA", desc: "Triagem de sepse" },
  { nome: "CURB-65", desc: "Pneumonia" },
  { nome: "CRB-65", desc: "Pneumonia (sem ureia)" },
  { nome: "PSI/PORT", desc: "Pneumonia" },
  { nome: "Wells TEP", desc: "Tromboembolismo pulmonar" },
  { nome: "Wells TVP", desc: "Trombose venosa profunda" },
  { nome: "HEART Score", desc: "Risco cardiovascular" },
  { nome: "PREVENT — AHA 2023", desc: "Risco cardiovascular" },
  { nome: "CHA₂DS₂-VA", desc: "Fibrilação atrial" },
  { nome: "HAS-BLED", desc: "Risco de sangramento" },
  { nome: "Índice de Choque", desc: "Instabilidade hemodinâmica" },
  { nome: "MELD-Na", desc: "Hepatopatia" },
  { nome: "Child-Pugh", desc: "Cirrose hepática" },
  { nome: "CKD-EPI 2021", desc: "Função renal / TFG" },
  { nome: "Score de Pádua", desc: "TEV em internados" },
  { nome: "Centor / McIsaac", desc: "Faringite" },
  { nome: "ISR", desc: "Intubação em sequência rápida" },
  { nome: "Reconstituição e Diluição", desc: "Medicamentos EV" },
  { nome: "Dobutamina", desc: "Droga vasoativa" },
  { nome: "Noradrenalina", desc: "Droga vasoativa" },
];

const aulasDestravando = [
  "Bem-vindo (a) ao Destravando o Plantão!",
  "Infecções do trato urinário: o que todo plantonista precisa dominar.",
  "Radiografia de tórax no plantão: o essencial para o generalista.",
  "Urticária e Anafilaxia: abordagem prática no plantão.",
  "Diarreia Aguda: decisões que mudam a conduta.",
  "Infecções respiratórias: o que realmente importa no atendimento.",
  "ECG no plantão: o essencial para o generalista.",
  "Dor torácica: decisões que salvam vidas.",
  "Cefaleia: o que não pode passar despercebido.",
  "Crise de asma: reconhecimento rápido e condutas que mudam desfechos.",
  "Crises hipertensivas: decisões rápidas e condutas seguras.",
  "Arboviroses: entre a queixa simples e o paciente grave.",
];

const bonusDestravando = [
  "Bônus: Abordagem de Queimaduras",
  "Bônus: Infecções de Pele e Partes Moles",
  "Bônus: Infecções Sexualmente Transmissíveis e Profilaxias",
];

function CheckItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-3 text-sm text-[#0f2d4a]">
      <span className="w-5 h-5 rounded-full bg-[#3db8d4]/20 text-[#1a6aad] flex items-center justify-center flex-shrink-0 mt-0.5">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </span>
      {text}
    </li>
  );
}

function WindowBar({ label }: { label: string }) {
  return (
    <div className="bg-[#0f2d4a] px-4 py-3 flex items-center gap-2 flex-shrink-0">
      <div className="w-3 h-3 rounded-full bg-red-400/60" />
      <div className="w-3 h-3 rounded-full bg-yellow-400/60" />
      <div className="w-3 h-3 rounded-full bg-green-400/60" />
      <span className="ml-3 text-[#6a9ab8] text-xs font-mono">{label}</span>
    </div>
  );
}

const PREVIEW_TOPICS: Record<string, { id: string; categoria: string }> = {
  "Anafilaxia": { id: "2", categoria: "Emergência" },
  "Hipoglicemia": { id: "4", categoria: "Emergência" },
};

const PREVIEW_EVOLUCOES: Record<string, string> = {
  "Urticária": "1",
  "Anafilaxia": "10",
};

const previewEvolucaoContents: Record<string, string> = Object.fromEntries(
  Object.entries(PREVIEW_EVOLUCOES).map(([titulo, id]) => [titulo, getEvolucaoContent(id)])
);

const previewContents: Record<string, string> = Object.fromEntries(
  Object.entries(PREVIEW_TOPICS).map(([titulo, { id }]) => [titulo, getPrescricaoContent(id)])
);

export default function TourPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#0a1e30] via-[#0f2d4a] to-[#1a4a6e] py-20 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <span className="inline-block bg-[#3db8d4]/20 text-[#3db8d4] text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full mb-6 border border-[#3db8d4]/30">
            Tour da plataforma
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-5">
            Veja o que está dentro{" "}
            <span className="text-[#3db8d4]">da nossa plataforma</span>
          </h1>
          <p className="text-[#b8d8ee] text-lg leading-relaxed mb-8">
            Conteúdo completo: prescrições prontas, calculadoras clínicas validadas, curso em vídeo e conteúdos offline — tudo para estudantes e para quem atua na linha de frente.
          </p>
          <Link
            href="/assinatura"
            className="inline-flex items-center gap-2 bg-[#3db8d4] hover:bg-[#2fa8c4] text-[#0f2d4a] font-bold px-10 py-4 rounded-xl transition-all shadow-lg text-lg"
          >
            Assine agora
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </Link>
        </div>
      </section>

      {/* Seção 0 — Modelos de Evolução */}
      <section className="py-20 px-6 bg-[#f0f7ff]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-14 items-start">
          {/* Mockup */}
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-xl overflow-hidden order-2 md:order-1">
            <WindowBar label={`Modelos de Evolução · ${evolucoesMeta.length} modelos`} />
            <div className="p-4 space-y-1">
              {evolucoesMeta.slice(0, 8).map((e) => {
                const hasPreview = e.titulo in PREVIEW_EVOLUCOES;
                const row = (
                  <div className={`flex items-center justify-between border rounded-xl px-3 py-2.5 transition-colors ${hasPreview ? "bg-[#fff8f0] border-[#3db8d4]/40 hover:border-[#3db8d4] hover:bg-[#f0fbff]" : "bg-[#f8fafc] border-zinc-100"}`}>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-md bg-[#3db8d4]/15 flex items-center justify-center flex-shrink-0">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#3db8d4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </div>
                      <span className="text-xs font-medium text-[#0f2d4a]">{e.titulo}</span>
                    </div>
                    {hasPreview && (
                      <span className="text-[9px] font-bold text-[#3db8d4] border border-[#3db8d4]/40 px-1.5 py-0.5 rounded-full">Ver prévia</span>
                    )}
                  </div>
                );
                return hasPreview ? (
                  <TourEvolucaoModal key={e.id} titulo={e.titulo} conteudo={previewEvolucaoContents[e.titulo]}>
                    {row}
                  </TourEvolucaoModal>
                ) : (
                  <div key={e.id}>{row}</div>
                );
              })}
              <div className="text-center pt-1">
                <span className="text-xs text-zinc-400">+ mais {evolucoesMeta.length - 8} modelos disponíveis</span>
              </div>
            </div>
          </div>

          <div className="order-1 md:order-2">
            <span className="inline-flex items-center gap-1.5 text-[#1a6aad] text-xs font-bold tracking-widest uppercase">
              Modelos de Evolução
              <span className="bg-[#3db8d4] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full tracking-normal normal-case">NOVO</span>
            </span>
            <h2 className="text-3xl font-extrabold text-[#0f2d4a] mt-2 mb-4 leading-tight">
              {`${evolucoesMeta.length} modelos de evolução prontos para usar`}
            </h2>
            <p className="text-[#0f2d4a] leading-relaxed mb-6">
              Modelos de evolução médica para as queixas mais comuns do PS e UPA —
              estruturados, editáveis e prontos para facilitar o atendimento na linha de frente.
            </p>
            <ul className="space-y-3">
              {[
                "Urticária, Anafilaxia e alergias",
                "Cefaleia tensional, migrânea e em salvas",
                "Crises hipertensivas e urgências",
                "Síndrome Coronariana Aguda",
                "Infecções respiratórias: IVAS, Sinusite, Pneumonia",
                "Diarreia aguda, Gastroenterite e Disenteria",
                "Arboviroses e Dengue",
              ].map((item) => <CheckItem key={item} text={item} />)}
            </ul>
          </div>
        </div>
      </section>

      {/* Seção 1 — Prescrições */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-14 items-start">
          <div>
            <span className="text-[#1a6aad] text-xs font-bold tracking-widest uppercase">Condutas clínicas</span>
            <h2 className="text-3xl font-extrabold text-[#0f2d4a] mt-2 mb-4 leading-tight">
              {`Mais de ${prescricoesMeta.length} modelos de prescrição e conteúdos práticos`}
            </h2>
            <p className="text-zinc-500 leading-relaxed mb-6">
              Busque por queixa, diagnóstico ou medicamento e acesse prescrições completas com doses, vias,
              diluições e instruções — organizadas por cenário clínico e sempre atualizadas.
            </p>
            <div className="flex flex-wrap gap-2 mb-6">
              {[
                { label: "Emergência", color: "bg-red-50 text-red-600 border-red-100" },
                { label: "Guias práticos", color: "bg-[#e8f4fd] text-[#1a6aad] border-blue-100" },
                { label: "PS/UPA", color: "bg-teal-50 text-teal-700 border-teal-100" },
                { label: "UBS/Atenção primária", color: "bg-emerald-50 text-emerald-700 border-emerald-100" },
                { label: "Medicamento", color: "bg-violet-50 text-violet-700 border-violet-100" },
                { label: "Referências", color: "bg-zinc-100 text-zinc-600 border-zinc-200" },
              ].map((b) => (
                <span key={b.label} className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${b.color}`}>
                  {b.label}
                </span>
              ))}
            </div>
          </div>

          {/* Mockup */}
          <div className="bg-[#f8fafc] rounded-2xl border border-zinc-200 shadow-xl overflow-hidden">
            <WindowBar label={`Condutas Clínicas · ${prescricoesMeta.length} temas`} />
            <div className="p-4">
              <div className="flex items-center gap-2 bg-white border border-zinc-200 rounded-xl px-4 py-2.5 mb-3 shadow-sm">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                <span className="text-zinc-400 text-sm">Buscar por diagnóstico, queixa...</span>
              </div>

              {/* Emergência */}
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1 mb-1">Emergência</p>
              <div className="space-y-1 mb-3">
                {prescricoesEmergencia.slice(0, 5).map((t) => {
                  const preview = PREVIEW_TOPICS[t];
                  const row = (
                    <div className={`flex items-center justify-between border rounded-lg px-3 py-2 transition-colors ${preview ? "bg-[#fff8f0] border-[#3db8d4]/40 hover:border-[#3db8d4] hover:bg-[#f0fbff]" : "bg-white border-zinc-100"}`}>
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-md bg-red-50 flex items-center justify-center flex-shrink-0">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg>
                        </div>
                        <span className="text-xs font-medium text-[#0f2d4a]">{t}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {preview && (
                          <span className="text-[9px] font-bold text-[#3db8d4] border border-[#3db8d4]/40 px-1.5 py-0.5 rounded-full">Ver prévia</span>
                        )}
                        <span className="text-[9px] font-semibold text-red-600 bg-red-50 px-1.5 py-0.5 rounded-full">Emergência</span>
                      </div>
                    </div>
                  );
                  return preview ? (
                    <TourPrescricaoModal key={t} titulo={t} categoria={preview.categoria} conteudo={previewContents[t]}>
                      {row}
                    </TourPrescricaoModal>
                  ) : (
                    <div key={t}>{row}</div>
                  );
                })}
              </div>

              {/* PS/UPA */}
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1 mb-1">Temas PS/UPA</p>
              <div className="space-y-1 mb-3">
                {prescricoesPsUpa.slice(0, 5).map((t) => (
                  <div key={t} className="flex items-center justify-between bg-white border border-zinc-100 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-md bg-[#e8f4fd] flex items-center justify-center flex-shrink-0">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#1a6aad" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg>
                      </div>
                      <span className="text-xs font-medium text-[#0f2d4a]">{t}</span>
                    </div>
                    <span className="text-[9px] font-semibold text-[#1a6aad] bg-[#e8f4fd] px-1.5 py-0.5 rounded-full">PS/UPA</span>
                  </div>
                ))}
              </div>
              <div className="text-center pt-1">
                <span className="text-xs text-zinc-400">+ mais {prescricoesMeta.length - 10} condutas disponíveis</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seção 2 — Casos Clínicos */}
      <section className="py-20 px-6 bg-[#f0f7ff]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-14 items-start">
          <div>
            <span className="inline-flex items-center gap-1.5 text-[#1a6aad] text-xs font-bold tracking-widest uppercase">
              Casos Clínicos
              <span className="bg-[#1a6aad] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full tracking-normal normal-case">SEMANAL</span>
            </span>
            <h2 className="text-3xl font-extrabold text-[#0f2d4a] mt-2 mb-4 leading-tight">
              Um novo caso toda semana com raciocínio diagnóstico e conduta
            </h2>
            <p className="text-zinc-500 leading-relaxed mb-6">
              Sequências de slides e vídeos semanais cobrindo temas práticos do plantão —
              desde condutas gerais até casos clínicos completos com raciocínio e discussão.
            </p>
            <ul className="space-y-3">
              {[
                "Sequências de slides com casos comentados",
                "Vídeos de casos com raciocínio diagnóstico",
                "Temas atualizados semanalmente",
                "Dicas práticas para o dia a dia do plantão",
              ].map((item) => <CheckItem key={item} text={item} />)}
            </ul>
          </div>

          {/* Mockup */}
          <TourCasosMockup />
        </div>
      </section>

      {/* Seção 3 — Cursos e Videoaulas (Destravando o Plantão) */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-14 items-start">
          {/* Mockup */}
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-xl overflow-hidden order-2 md:order-1">
            <div className="bg-gradient-to-r from-[#0f2d4a] to-[#1a6aad] p-5">
              <span className="text-[10px] text-[#3db8d4] font-bold tracking-widest uppercase block mb-1">Curso em vídeo</span>
              <h3 className="text-white font-extrabold text-lg leading-tight">Destravando o Plantão</h3>
            </div>
            <div className="p-4 space-y-1.5 max-h-[360px] overflow-y-auto">
              {aulasDestravando.map((aula, i) => (
                <div key={aula} className="flex items-start gap-3 bg-[#f8fafc] border border-zinc-100 rounded-xl px-3 py-2.5">
                  <div className="w-6 h-6 rounded-md bg-[#1a6aad]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="#1a6aad"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  </div>
                  <p className="text-xs text-[#0f2d4a] leading-snug">{aula}</p>
                  <span className="text-[10px] text-zinc-300 font-mono ml-auto flex-shrink-0 pt-0.5">{String(i + 1).padStart(2, "0")}</span>
                </div>
              ))}
              <div className="pt-1">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1 mb-1.5">Bônus</p>
                {bonusDestravando.map((b) => (
                  <div key={b} className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5 mb-1.5">
                    <span className="text-amber-500 text-xs mt-0.5">★</span>
                    <p className="text-xs text-[#0f2d4a] leading-snug">{b}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="order-1 md:order-2">
            <span className="inline-flex items-center gap-1.5 text-[#1a6aad] text-xs font-bold tracking-widest uppercase">
              Cursos em vídeo
              <span className="bg-[#3db8d4] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full tracking-normal normal-case">NOVO</span>
            </span>
            <h2 className="text-3xl font-extrabold text-[#0f2d4a] mt-2 mb-4 leading-tight">
              Destravando o Plantão
            </h2>
            <p className="text-zinc-500 leading-relaxed mb-6">
              Curso completo com 12 aulas em vídeo + 3 módulos bônus, cobrindo as queixas mais comuns do PS, UBS e UPA.
              Cada aula acompanha material de apoio, modelo de evolução e modelo de prescrição em PDF.
            </p>
            <ul className="space-y-3 mb-6">
              {[
                "12 aulas em vídeo + 3 módulos bônus",
                "Material de apoio em PDF por aula",
                "Modelo de evolução e prescrição por tema",
                "Diretrizes para download (SBC, Ministério da Saúde)",
                "Acesso a qualquer hora, em qualquer dispositivo",
              ].map((item) => <CheckItem key={item} text={item} />)}
            </ul>
          </div>
        </div>
      </section>

      {/* Seção 4 — Ebooks e Materiais */}
      <section className="py-20 px-6 bg-[#f0f7ff]">
        <div className="max-w-6xl mx-auto">
          <div className="mb-10">
            <span className="text-[#1a6aad] text-xs font-bold tracking-widest uppercase">Ebooks e Materiais</span>
            <h2 className="text-3xl font-extrabold text-[#0f2d4a] mt-2 mb-4 leading-tight">
              Guias práticos para download
            </h2>
            <p className="text-zinc-500 leading-relaxed max-w-2xl">
              Arquivos em PDF disponíveis dentro da plataforma — para estudar offline, imprimir ou consultar a qualquer hora, direto pelo celular ou computador.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {[
              {
                titulo: "Manual prático de prescrições: da UBS à emergência",
                paginas: "500 páginas · PDF",
                capa: "/images/ebook-manual-transparent.png",
              },
              {
                titulo: "Guia de intubação orotraqueal, sedação e ventilação mecânica",
                paginas: "Guia prático · PDF",
                capa: "/images/ebook-iot.png",
              },
            ].map((eb) => (
              <div key={eb.titulo} className="bg-white rounded-2xl border border-zinc-200 shadow-md overflow-hidden flex flex-col">
                <div
                  className="h-52"
                  style={{
                    backgroundImage: `url('${eb.capa}')`,
                    backgroundSize: "contain",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    backgroundColor: "#0a1220",
                  }}
                />
                <div className="p-4 flex flex-col gap-1">
                  <p className="text-xs font-bold text-[#0f2d4a] leading-snug">{eb.titulo}</p>
                  <p className="text-[11px] text-zinc-400">{eb.paginas}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Seção 5 — Calculadoras */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-14 items-start">
          {/* Mockup dark — espelha o app real */}
          <div className="rounded-2xl overflow-hidden shadow-2xl order-2 md:order-1 bg-[#0a1220]">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.07]">
              <span className="text-xs font-bold text-[#e8edf5]">Calculadoras Clínicas</span>
              <span className="text-[10px] font-semibold bg-[#1a3a52] text-[#3db8d4] px-2 py-0.5 rounded-full">22 disponíveis</span>
            </div>
            <div className="p-3 grid grid-cols-3 gap-2">
              {[
                { nome: "Glasgow", chip: "Emergência", img: "/images/calculadoras/cerebro.png" },
                { nome: "SOFA", chip: "Emergência", img: "/images/calculadoras/sepsis.png" },
                { nome: "CURB-65", chip: "Pneumologia", img: "/images/calculadoras/pulmao.png" },
                { nome: "HEART Score", chip: "Cardiologia", img: "/images/calculadoras/coracao.png" },
                { nome: "Wells TEP", chip: "Emergência", img: "/images/calculadoras/trombo.png" },
                { nome: "CKD-EPI 2021", chip: "Nefrologia", img: "/images/calculadoras/ckd-epi.png" },
                { nome: "Dobutamina", chip: "Emergência", img: "/images/calculadoras/dobutamina.png" },
                { nome: "Centor / McIsaac", chip: "Infectologia", img: "/images/calculadoras/faringite.png" },
                { nome: "Child-Pugh", chip: "Gastro", img: "/images/calculadoras/figado.png" },
              ].map((c) => (
                <div key={c.nome} className="bg-[#131c2e] rounded-xl border border-white/[0.07] overflow-hidden flex flex-col">
                  <div className="w-full h-14 bg-[#0a1628] overflow-hidden flex items-center justify-center">
                    <img src={c.img} alt={c.nome} className="w-10 h-10 object-contain scale-[2.0]" />
                  </div>
                  <div className="px-2 py-1.5">
                    <p className="text-[8px] font-bold text-[#e8edf5] leading-tight">{c.nome}</p>
                    <span className="text-[7px] bg-[#1a3a52] text-[#3db8d4] px-1 py-0.5 rounded-full mt-1 inline-block">{c.chip}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="order-1 md:order-2">
            <span className="text-[#1a6aad] text-xs font-bold tracking-widest uppercase">Calculadoras e Escores</span>
            <h2 className="text-3xl font-extrabold text-[#0f2d4a] mt-2 mb-4 leading-tight">
              22 calculadoras clínicas validadas
            </h2>
            <p className="text-zinc-500 leading-relaxed mb-6">
              Os principais escores da prática clínica e calculadoras de infusão de drogas vasoativas —
              integrados na plataforma, sem precisar de apps separados.
            </p>
            <ul className="space-y-3">
              {[
                "Escores de sepse: SOFA, qSOFA",
                "Pneumonia: CURB-65, CRB-65, PSI/PORT",
                "Tromboembolismo: Wells TEP e Wells TVP",
                "Cardio: HEART Score, PREVENT AHA 2023, CHA₂DS₂-VA, HAS-BLED",
                "Hepatologia: MELD-Na, Child-Pugh",
                "Drogas vasoativas: Dobutamina e Noradrenalina",
                "Reconstituição e diluição de medicamentos EV",
              ].map((item) => <CheckItem key={item} text={item} />)}
            </ul>
          </div>
        </div>
      </section>


      {/* CTA final */}
      <section className="py-20 px-6 bg-gradient-to-br from-[#0a1e30] via-[#0f2d4a] to-[#1a4a6e] text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
            Pronto para atender com mais segurança?
          </h2>
          <p className="text-[#b8d8ee] text-lg mb-8">
            Acesse tudo isso por menos de R$1,20 por dia com a assinatura anual.
          </p>
          <Link
            href="/assinatura"
            className="inline-flex items-center gap-2 bg-[#3db8d4] hover:bg-[#2fa8c4] text-[#0f2d4a] font-bold px-10 py-4 rounded-xl transition-all shadow-lg text-lg"
          >
            Ver planos e assinar
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </Link>
          <p className="text-[#6a9ab8] text-sm mt-4">Garantia de 7 dias — reembolso total se não gostar.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0f2d4a] text-white">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[#9ec4de] text-sm font-bold">Rotina Clínica</p>
            <div className="flex gap-6 text-sm text-[#9ec4de]">
              <Link href="/termos" className="hover:text-white transition-colors">Termos de Uso</Link>
              <Link href="/privacidade" className="hover:text-white transition-colors">Privacidade</Link>
              <Link href="/assinatura" className="hover:text-white transition-colors">Planos</Link>
            </div>
          </div>
          <div className="border-t border-white/10 mt-6 pt-5 text-center text-xs text-[#5a8caa]">
            © {new Date().getFullYear()} Rotina Clínica — Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </main>
  );
}
