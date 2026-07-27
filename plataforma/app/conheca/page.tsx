import Navbar from "@/app/components/Navbar";
import { Logo } from "@/app/components/Navbar";

export default function ConhecaPage() {
  return (
    <main className="min-h-screen bg-[#f7fafc]">
      <Navbar />

      {/* Hero */}
      <section className="bg-[#0f2d4a] py-20 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-extrabold text-white mb-4">Conheça o Rotina Clínica</h1>
          <p className="text-[#9ec4de] text-lg leading-relaxed">
            Nosso objetivo é encurtar a distância entre a teoria e a prática médica. Conheça a história, a missão e os valores de quem está com você no plantão.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 py-14 space-y-8">

        {/* Missão */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3db8d4] to-[#1a6aad] flex items-center justify-center flex-shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
            </div>
            <h2 className="text-xl font-extrabold text-[#0f2d4a]">Nossa Missão</h2>
          </div>
          <p className="text-zinc-600 leading-relaxed">
            Promover a educação médica através de casos clínicos reais, embasamento teórico com referências consolidadas e atuais, além da experiência clínica do dia a dia.
          </p>
        </div>

        {/* Valores */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-8">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1a6aad] to-[#0f2d4a] flex items-center justify-center flex-shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            </div>
            <h2 className="text-xl font-extrabold text-[#0f2d4a]">Nossos Valores</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {["Inovação","Eficiência","Qualidade","Comprometimento","Integridade"].map((v) => (
              <span key={v} className="bg-[#e8f4fc] text-[#1a6aad] text-sm font-semibold px-4 py-2 rounded-full">
                {v}
              </span>
            ))}
          </div>
          <p className="text-zinc-500 text-sm mt-4 leading-relaxed">
            Esses são os pilares que guiam cada conteúdo, cada curso e cada interação com a nossa comunidade.
          </p>
        </div>

        {/* Conexão com o aluno */}
        <div className="bg-[#0f2d4a] rounded-2xl p-8 text-center">
          <div className="w-10 h-10 rounded-xl bg-[#3db8d4]/20 border border-[#3db8d4]/40 flex items-center justify-center mx-auto mb-4">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3db8d4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <h2 className="text-xl font-extrabold text-white mb-3">Nós já estivemos no seu lugar</h2>
          <p className="text-[#9ec4de] leading-relaxed max-w-xl mx-auto">
            Sabemos exatamente quais dúvidas e dificuldades fazem parte da sua rotina. Conte com a gente para te ajudar nessa!
          </p>
        </div>

      </div>

      {/* Footer */}
      <footer className="bg-[#0f2d4a] text-white mt-6">
        <div className="max-w-5xl mx-auto px-6 py-10 flex items-center justify-between">
          <Logo variant="light" />
          <p className="text-xs text-[#5a8caa]">© {new Date().getFullYear()} Rotina Clínica</p>
        </div>
      </footer>
    </main>
  );
}
