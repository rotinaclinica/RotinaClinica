import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { canAccessPaidContent } from "@/lib/subscription";

export const dynamic = "force-dynamic";
export const metadata = { title: "Cursos · Rotina Clínica" };

const ALL_CURSOS = [
  {
    slug: "destravando",
    titulo: "Destravando o Plantão",
    descricao: "Abordagem prática das 10 queixas mais prevalentes do paciente adulto no plantão.",
    badge: "NOVO",
    imagem: "/images/destravando-plantao.png",
    imagemFit: "cover" as const,
    imagemBg: "",
    thumbW: 120,
    thumbH: 120,
    subscriberOnly: false,
  },
  {
    slug: "docstage",
    titulo: "Docstage",
    descricao: "Videoaulas exclusivas da nossa parceira oficial Docstage.",
    badge: "PARCEIRA OFICIAL",
    imagem: "/Docstage/LOGO DOCSTAGE VETORIZADA_page-0001.jpg",
    imagemFit: "contain" as const,
    imagemBg: "bg-white",
    thumbW: 120,
    thumbH: 120,
    subscriberOnly: true,
  },
  {
    slug: "airtraq",
    titulo: "Airtraq Safetech Medical",
    descricao: "Um nível acima na abordagem para intubação de pacientes com via aérea difícil.",
    badge: "PARCEIRA OFICIAL",
    imagem: "/Airtraq/airtraq-portrait.png",
    imagemFit: "cover" as const,
    imagemBg: "bg-[#0f2d4a]",
    thumbW: 107,
    thumbH: 120,
    subscriberOnly: true,
  },
];

export default async function CursosPage() {
  const session = await auth();
  const isSubscriber = session?.user?.id ? await canAccessPaidContent(session.user.id) : false;

  const cursos = isSubscriber ? ALL_CURSOS : ALL_CURSOS.filter((c) => !c.subscriberOnly);

  return (
    <div className="flex-1 flex flex-col">
      <header className="bg-white dark:bg-[radial-gradient(700px_220px_at_15%_0%,rgba(61,184,212,0.16),transparent_70%),linear-gradient(180deg,#1a3050_0%,#142540_100%)] border-b border-[#d9e3ec] dark:border-white/12 px-6 sm:px-8 py-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1a6aad] dark:text-[#3db8d4] hover:text-[#0f2d4a] dark:hover:text-white mb-4 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Início
        </Link>
        <h1 className="text-xl sm:text-2xl dark:sm:text-3xl font-extrabold text-[#0f2d4a] dark:text-white mb-1">
          Cursos e <span className="text-[#1a6aad] dark:text-[#3db8d4]">Videoaulas</span>
        </h1>
        <p className="text-[#0f2d4a] dark:text-[#a9bccd] text-sm">
          Conteúdo de qualidade, baseado em evidências. Estude no seu ritmo.
        </p>
      </header>

      <main className="flex-1 p-6 sm:p-8">
        <div className="max-w-4xl flex flex-col gap-4">
          {cursos.map((curso) => (
            <Link
              key={curso.slug}
              href={`/dashboard/cursos/${curso.slug}`}
              className="flex items-center gap-4 bg-white dark:bg-[#172741] border border-zinc-300 dark:border-white/15 shadow-sm rounded-xl p-4 sm:p-5 hover:border-[#1a6aad]/60 hover:shadow-md dark:hover:border-[#3db8d4]/30 transition-colors group"
            >
              {/* Thumbnail */}
              <div
                className={`relative shrink-0 rounded-xl overflow-hidden ${curso.imagemBg || "bg-gradient-to-br from-[#0f2d4a] to-[#1a6aad]"}`}
                style={{ width: curso.thumbW, height: curso.thumbH }}
              >
                {curso.imagem && (
                  <Image src={curso.imagem} alt={curso.titulo} fill sizes="240px" className={`${curso.imagemFit === "contain" ? "object-contain" : "object-cover"}`} />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <p className="text-base sm:text-lg font-bold text-[#0f2d4a] dark:text-white leading-snug group-hover:text-[#1a6aad] dark:group-hover:text-[#3db8d4] transition-colors">
                    {curso.titulo}
                  </p>
                  {curso.badge && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#1a6aad]/10 dark:bg-[#3db8d4]/10 text-[#1a6aad] dark:text-[#3db8d4]">
                      {curso.badge}
                    </span>
                  )}
                </div>
                <p className="text-sm sm:text-[15px] text-[#0f2d4a]/80 dark:text-[#a9bccd] leading-relaxed">
                  {curso.descricao}
                </p>
              </div>

              <svg
                className="shrink-0 text-zinc-400 dark:text-[#8fa9bd] group-hover:text-[#1a6aad] dark:group-hover:text-[#3db8d4] transition-colors"
                width="20" height="20" viewBox="0 0 24 24" fill="none"
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
