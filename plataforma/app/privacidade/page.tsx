import Link from "next/link";
import Navbar from "@/app/components/Navbar";

export const metadata = { title: "Política de Privacidade · Rotina Clínica" };

const sections = [
  {
    titulo: "Dados coletados",
    icone: (
      <svg className="w-5 h-5 text-[#3db8d4]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    ),
    itens: [
      "Nome e e-mail para criação de conta",
      "Histórico de compras para controle de acesso",
      "Dados de pagamento processados de forma segura pelos gateways Stripe e Mercado Pago",
    ],
  },
  {
    titulo: "Compartilhamento",
    icone: (
      <svg className="w-5 h-5 text-[#3db8d4]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
      </svg>
    ),
    texto: "Não vendemos ou compartilhamos seus dados com terceiros, exceto os gateways de pagamento para processamento da transação.",
  },
  {
    titulo: "Seus direitos (LGPD)",
    icone: (
      <svg className="w-5 h-5 text-[#3db8d4]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    itens: [
      "Acesso aos dados que coletamos sobre você",
      "Correção de dados incorretos ou desatualizados",
      "Exclusão dos seus dados pessoais",
      "Portabilidade dos dados, quando aplicável",
    ],
  },
  {
    titulo: "Contato",
    icone: (
      <svg className="w-5 h-5 text-[#3db8d4]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
      </svg>
    ),
    texto: "Para exercer seus direitos ou tirar dúvidas sobre privacidade, entre em contato pelo e-mail: contato@rotinaclinica.com",
  },
];

export default function PrivacidadePage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#f8fafc]">
        {/* Header */}
        <div className="bg-[#0f2d4a] px-6 py-12">
          <div className="max-w-3xl mx-auto">
            <Link href="/" className="inline-flex items-center gap-1.5 text-[#9ec4de] hover:text-white text-sm mb-6 transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
              Voltar ao site
            </Link>
            <p className="text-[#3db8d4] text-xs font-bold tracking-widest uppercase mb-2">Rotina Clínica</p>
            <h1 className="text-3xl font-extrabold text-white mb-3">Política de Privacidade</h1>
            <p className="text-[#9ec4de] text-sm leading-relaxed max-w-xl">
              Esta plataforma coleta apenas os dados necessários para a prestação do serviço. Seus dados são tratados com segurança e em conformidade com a LGPD.
            </p>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="max-w-3xl mx-auto px-6 py-12 space-y-4">
          {sections.map((s) => (
            <div key={s.titulo} className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-[#e8f4fd] flex items-center justify-center shrink-0">
                  {s.icone}
                </div>
                <h2 className="text-base font-bold text-[#0f2d4a]">{s.titulo}</h2>
              </div>
              {s.itens && (
                <ul className="space-y-2">
                  {s.itens.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-zinc-600 text-sm leading-relaxed">
                      <svg className="w-4 h-4 text-[#3db8d4] mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              )}
              {s.texto && <p className="text-zinc-600 text-sm leading-relaxed">{s.texto}</p>}
            </div>
          ))}

          <p className="text-center text-zinc-400 text-xs pt-4">
            Última atualização: agosto de 2026
          </p>
        </div>
      </div>
    </>
  );
}
