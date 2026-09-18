import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import { Logo } from "@/app/components/Navbar";
import { prescricoesMeta } from "@/lib/prescricoes-meta";

export const metadata = {
  title: "Ebooks e Cursos",
  description:
    "Ebooks e cursos práticos para o plantão: Manual de Prescrições da UBS à emergência, Guia de Intubação e Ventilação Mecânica e o curso Destravando o Plantão.",
};

const PAID_PRODUCTS = [
  {
    title: "Manual de Prescrições",
    description: `Nunca mais trave na hora de prescrever! Consulte mais de ${prescricoesMeta.length} modelos de prescrições prontas em segundos - da UBS à emergência.`,
    image: "/images/ebook-manual.png",
    tag: "E-book",
    price: "R$ 97",
    href: "/checkout/ebook/manual-prescricoes",
    hotmart: "https://pay.hotmart.com/X103386000T?off=93hk0q5o&checkoutMode=10",
  },
  {
    title: "Sedação, IOT e VM",
    description: "Prepare-se para ACABAR com o medo da intubação orotraqueal e adquirir SEGURANÇA e EFETIVIDADE!",
    image: "/images/ebook-iot.png",
    tag: "E-book",
    price: "R$ 47",
    href: "/checkout/ebook/sedacao-iot-vm",
    hotmart: "https://pay.hotmart.com/F93057611I?off=fpgutvut&checkoutMode=10",
  },
  {
    title: "Destravando o Plantão",
    description: "Domine as 10 principais queixas do paciente adulto no PS. A faculdade te ensinou a teoria, mas a realidade do plantão exige decisões rápidas, raciocínio clínico e condutas efetivas. Foi exatamente para encurtar essa distância entre a teoria e a prática que nasceu o Destravando o Plantão.",
    image: "/images/curso-plantao.png",
    tag: "Curso Online",
    price: "R$ 397",
    href: "/checkout/curso/destravando-o-plantao",
    hotmart: "https://pay.hotmart.com/T106092708E?checkoutMode=10",
  },
];

const FREE_EBOOKS_LIST = [
  {
    title: "O Racional da Prescrição Médica",
    description: "Entenda a lógica por trás de cada prescrição médica.",
  },
  {
    title: "Manual de Prescrições (Amostra)",
    description: "Mais de 224 prescrições prontas, da UBS à emergência.",
  },
  {
    title: "Abordagem da HAS e DM2 na Atenção Primária",
    description: "Condutas para as doenças mais prevalentes na UBS.",
  },
];

export default function ProdutosPage() {
  return (
    <main className="min-h-screen bg-[#f7fafc]">
      <Navbar />

      {/* Header */}
      <section className="bg-[#0f2d4a] py-14 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3">
            Ebooks e Cursos
          </h1>
          <p className="text-[#9ec4de] text-lg">
            Materiais desenvolvidos para médicos e estudantes que querem ir além.
          </p>
        </div>
      </section>

      {/* Gratuitos — destaque no topo */}
      <section className="max-w-5xl mx-auto px-6 pt-14 pb-6">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-2xl font-extrabold text-[#0f2d4a]">Comece por aqui — grátis</h2>
          <span className="bg-[#3db8d4]/15 text-[#1a6aad] text-xs font-bold px-3 py-1 rounded-full border border-[#3db8d4]/30">Sem custo</span>
        </div>

        {/* Banner unificado dos 3 ebooks */}
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Imagem */}
            <div className="md:w-2/5 bg-[#f0f7fa] flex items-center justify-center p-6 md:p-8 border-b md:border-b-0 md:border-r border-zinc-100">
              <img
                src="/images/ebooks-gratuitos-bundle.png"
                alt="3 ebooks gratuitos do Rotina Clínica"
                className="w-full max-w-xs md:max-w-none object-contain"
              />
            </div>

            {/* Conteúdo */}
            <div className="md:w-3/5 p-7 md:p-10 flex flex-col justify-center">
              <span className="text-xs font-bold text-[#3db8d4] uppercase tracking-widest mb-2">Download gratuito</span>
              <h3 className="text-xl md:text-2xl font-extrabold text-[#0f2d4a] mb-3 leading-tight">
                Faça o download gratuito de materiais que irão impactar grandemente na sua prática clínica
              </h3>
              <p className="text-sm text-zinc-500 mb-5">
                Preencha um único cadastro e baixe os 3 ebooks de uma vez.
              </p>

              {/* Lista dos 3 ebooks */}
              <ul className="space-y-3 mb-7">
                {FREE_EBOOKS_LIST.map((e, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-[#3db8d4]/20 text-[#1a6aad] text-xs font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <div>
                      <span className="text-sm font-semibold text-[#0f2d4a]">{e.title}</span>
                      <span className="text-xs text-zinc-500 ml-1">— {e.description}</span>
                    </div>
                  </li>
                ))}
              </ul>

              <Link
                href="/download/ebooks-gratuitos"
                className="inline-block bg-[#3db8d4] hover:bg-[#2fa8c4] text-[#0f2d4a] font-bold px-8 py-4 rounded-xl text-base transition-colors shadow-md text-center"
              >
                Baixar os 3 ebooks gratuitamente →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Divisor */}
      <div className="max-w-5xl mx-auto px-6">
        <hr className="border-zinc-200" />
      </div>

      {/* O que produzimos */}
      <section className="max-w-5xl mx-auto px-6 py-10 pb-14">
        <h2 className="text-2xl font-extrabold text-[#0f2d4a] mb-8">O que produzimos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {PAID_PRODUCTS.map((p) => (
            <div
              key={p.title}
              className="group bg-white rounded-2xl overflow-hidden border border-zinc-200 hover:shadow-xl hover:border-[#3db8d4] transition-all flex flex-col"
            >
              <div className="relative bg-white flex items-center justify-center h-60 overflow-hidden border-b border-zinc-100">
                <img
                  src={p.image}
                  alt={p.title}
                  className="h-full w-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-3 left-3 bg-[#0f2d4a] text-white text-xs font-bold px-3 py-1 rounded-full">
                  {p.tag}
                </span>
              </div>
              <div className="p-5 flex flex-col flex-1">
                <h3 className="font-bold text-[#0f2d4a] text-lg mb-1 group-hover:text-[#1a6aad] transition-colors">
                  {p.title}
                </h3>
                <p className="text-[#334e68] text-sm flex-1 mb-4">{p.description}</p>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl font-extrabold text-[#0f2d4a]">{p.price}</span>
                </div>
                <div className="flex flex-col gap-2">
                  {p.href ? (
                    <>
                      <Link
                        href={p.href}
                        className="w-full text-center bg-[#0f2d4a] hover:bg-[#1a4a6e] text-white font-semibold text-sm py-2.5 rounded-xl transition-colors"
                      >
                        Comprar →
                      </Link>
                      <a
                        href={p.hotmart}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full text-center text-xs text-[#6a8fa5] hover:text-[#0f2d4a] transition-colors underline underline-offset-2"
                      >
                        Ou comprar via Hotmart
                      </a>
                    </>
                  ) : (
                    <a
                      href={p.hotmart}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full text-center bg-[#0f2d4a] hover:bg-[#1a4a6e] text-white font-semibold text-sm py-2.5 rounded-xl transition-colors"
                    >
                      Comprar →
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

      </section>

      {/* Footer */}
      <footer className="bg-[#0f2d4a] text-white mt-0">
        <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <Logo variant="light" />
          <p className="text-xs text-[#5a8caa]">
            © {new Date().getFullYear()} Rotina Clínica — Todos os direitos reservados.
            <br />
            Rotina Clinica Educação Médica Ltda. · CNPJ 65.937.147/0001-58
          </p>
        </div>
      </footer>
    </main>
  );
}
