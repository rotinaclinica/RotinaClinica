import Link from "next/link";
import Image from "next/image";

export const metadata = { title: "Cursos · Rotina Clínica" };

const CURSOS = [
  {
    slug: "destravando",
    titulo: "Destravando o Plantão",
    descricao: "Abordagem prática das 10 queixas mais prevalentes do paciente adulto no plantão.",
    badge: "NOVO",
    imagem: "/images/Formato (600 x 600 px).png",
    imagemFit: "cover" as const,
    imagemBg: "",
  },
  {
    slug: "docstage",
    titulo: "Docstage",
    descricao: "Videoaulas exclusivas da nossa parceira oficial Docstage.",
    badge: "PARCEIRA OFICIAL",
    imagem: "/Docstage/LOGO DOCSTAGE VETORIZADA_page-0001.jpg",
    imagemFit: "contain" as const,
    imagemBg: "bg-white",
  },
];

export default function CursosPage() {
  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <header className="bg-white dark:bg-[#131c2e] border-b border-zinc-200 dark:border-white/8 px-6 sm:px-8 py-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-xs text-zinc-400 dark:text-[#4a6a7e] hover:text-[#1a6aad] dark:hover:text-[#3db8d4] mb-3 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Início
        </Link>
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#0f2d4a] dark:text-[#e8edf5] mb-1">
          Cursos e Videoaulas
        </h1>
        <p className="text-zinc-500 dark:text-[#6a8fa5] text-sm">
          Conteúdo de qualidade, baseado em evidências. Estude no seu ritmo.
        </p>
      </header>

      <main className="flex-1 p-6 sm:p-8">
        <div className="max-w-2xl flex flex-col gap-4">
          {CURSOS.map((curso) => (
            <Link
              key={curso.slug}
              href={`/dashboard/cursos/${curso.slug}`}
              className="flex items-center gap-4 bg-white dark:bg-[#131c2e] border border-zinc-200 dark:border-white/8 rounded-xl p-4 hover:border-[#1a6aad]/40 dark:hover:border-[#3db8d4]/30 transition-colors group"
            >
              {/* Thumbnail */}
              <div className={`relative shrink-0 w-[120px] h-[120px] rounded-xl overflow-hidden bg-gradient-to-br from-[#0f2d4a] to-[#1a6aad] ${curso.imagemBg}`}>
                {curso.imagem && (
                  <Image src={curso.imagem} alt={curso.titulo} fill className={`${curso.imagemFit === "contain" ? "object-contain p-3" : "object-cover"} object-center`} />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-semibold text-[#0f2d4a] dark:text-[#d4dce8] leading-snug group-hover:text-[#1a6aad] dark:group-hover:text-[#3db8d4] transition-colors">
                    {curso.titulo}
                  </p>
                  {curso.badge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#1a6aad]/10 dark:bg-[#3db8d4]/10 text-[#1a6aad] dark:text-[#3db8d4]">
                      {curso.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-500 dark:text-[#6a8fa5] leading-snug">
                  {curso.descricao}
                </p>
              </div>

              <svg
                className="shrink-0 text-zinc-300 dark:text-[#3a5a6e] group-hover:text-[#1a6aad] dark:group-hover:text-[#3db8d4] transition-colors"
                width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
