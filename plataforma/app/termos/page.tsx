import Link from "next/link";
import Navbar from "@/app/components/Navbar";

export const metadata = { title: "Termos de Uso · Rotina Clínica" };

const sections = [
  {
    numero: "1",
    titulo: "Uso pessoal",
    texto: "Os produtos digitais adquiridos são de uso pessoal e intransferível. É vedada a redistribuição, revenda ou compartilhamento não autorizado do conteúdo.",
  },
  {
    numero: "2",
    titulo: "Acesso",
    texto: "O acesso ao conteúdo é concedido imediatamente após a confirmação do pagamento. Para PIX e boleto, o prazo pode ser de até 3 dias úteis.",
  },
  {
    numero: "3",
    titulo: "Reembolso",
    texto: "Solicitações de reembolso devem ser feitas em até 7 dias corridos após a compra, conforme o Código de Defesa do Consumidor. Entre em contato pelo e-mail contato@rotinaclinica.com.",
  },
  {
    numero: "4",
    titulo: "Propriedade intelectual",
    texto: "Todo o conteúdo da plataforma — textos, imagens, vídeos e materiais — é de propriedade exclusiva da Rotina Clínica e protegido por direitos autorais.",
  },
  {
    numero: "5",
    titulo: "Contato",
    texto: "Dúvidas sobre estes termos? Entre em contato pelo e-mail contato@rotinaclinica.com.",
  },
];

export default function TermosPage() {
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
            <h1 className="text-3xl font-extrabold text-white mb-3">Termos de Uso</h1>
            <p className="text-[#9ec4de] text-sm leading-relaxed max-w-xl">
              Ao adquirir qualquer produto nesta plataforma, você concorda com os termos abaixo.
            </p>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="max-w-3xl mx-auto px-6 py-12 space-y-4">
          {sections.map((s) => (
            <div key={s.numero} className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6">
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-xl bg-[#e8f4fd] flex items-center justify-center shrink-0">
                  <span className="text-sm font-extrabold text-[#1a6aad]">{s.numero}</span>
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#0f2d4a] mb-2">{s.titulo}</h2>
                  <p className="text-zinc-600 text-sm leading-relaxed">{s.texto}</p>
                </div>
              </div>
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
