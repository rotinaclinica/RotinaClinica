import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import { Logo } from "@/app/components/Navbar";

const PAID_PRODUCTS = [
  {
    title: "Manual de Prescrições",
    description: "Nunca mais trave na hora de prescrever! Consulte mais de 200 modelos de prescrições prontas em segundos - da UBS à emergência.",
    image: "/images/ebook-manual.png",
    tag: "E-book",
    price: "R$ 97",
    hotmart: "https://pay.hotmart.com/X103386000T?off=93hk0q5o&checkoutMode=10",
  },
  {
    title: "Sedação, IOT e VM",
    description: "Prepare-se para ACABAR com o medo da intubação orotraqueal e adquirir SEGURANÇA e EFETIVIDADE!",
    image: "/images/ebook-iot.png",
    tag: "E-book",
    price: "R$ 47",
    hotmart: "https://pay.hotmart.com/F93057611I?off=fpgutvut&checkoutMode=10",
  },
  {
    title: "Destravando o Plantão",
    description: "Domine as 10 principais queixas do paciente adulto no PS. A faculdade te ensinou a teoria, mas a realidade do plantão exige decisões rápidas, raciocínio clínico e condutas efetivas. Foi exatamente para encurtar essa distância entre a teoria e a prática que nasceu o Destravando o Plantão.",
    image: "/images/curso-plantao.png",
    tag: "Curso Online",
    price: "R$ 397",
    hotmart: "https://pay.hotmart.com/T106092708E?checkoutMode=10",
  },
];

const FREE_EBOOKS = [
  {
    slug: "racional-prescricao",
    title: "O Racional da Prescrição Médica",
    description: "Entenda a lógica por trás de cada prescrição. Gratuito para você.",
    image: "/images/ebook-gratis-racional.png",
  },
  {
    slug: "manual-prescricoes-gratis",
    title: "Manual de Prescrições (Amostra)",
    description: "Amostra gratuita do nosso e-book mais acessado. Baixe agora.",
    image: "/images/ebook-gratis-manual.jpg",
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

      {/* Produtos pagos */}
      <section className="max-w-5xl mx-auto px-6 py-14">
        <h2 className="text-2xl font-extrabold text-[#0f2d4a] mb-8">Produtos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {PAID_PRODUCTS.map((p) => (
            <a
              key={p.title}
              href={p.hotmart}
              target="_blank"
              rel="noopener noreferrer"
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
                <p className="text-zinc-500 text-sm flex-1 mb-4">{p.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-extrabold text-[#0f2d4a]">{p.price}</span>
                  <span className="text-sm font-semibold text-[#3db8d4] group-hover:text-[#0f2d4a] transition-colors">
                    Comprar →
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* E-books gratuitos */}
      <section className="bg-[#e8f4fc] py-14 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-extrabold text-[#0f2d4a] mb-2">E-books Gratuitos</h2>
          <p className="text-zinc-500 mb-8 text-sm">
            Preencha um breve questionário e faça o download imediatamente.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {FREE_EBOOKS.map((e) => (
              <Link
                key={e.slug}
                href={`/download/${e.slug}`}
                className="group bg-white rounded-2xl overflow-hidden border border-zinc-200 hover:shadow-xl hover:border-[#3db8d4] transition-all flex flex-col"
              >
                <div className="relative bg-white flex items-center justify-center h-60 overflow-hidden border-b border-zinc-100">
                  <img
                    src={e.image}
                    alt={e.title}
                    className="h-full w-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-3 left-3 bg-[#3db8d4] text-[#0f2d4a] text-xs font-bold px-3 py-1 rounded-full">
                    Gratuito
                  </span>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-bold text-[#0f2d4a] text-lg mb-1 group-hover:text-[#1a6aad] transition-colors">
                    {e.title}
                  </h3>
                  <p className="text-zinc-500 text-sm flex-1 mb-4">{e.description}</p>
                  <span className="text-sm font-semibold text-[#3db8d4] group-hover:text-[#0f2d4a] transition-colors">
                    Baixar grátis →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0f2d4a] text-white mt-0">
        <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <Logo variant="light" />
          <p className="text-xs text-[#5a8caa]">
            © {new Date().getFullYear()} Rotina Clínica — Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </main>
  );
}
