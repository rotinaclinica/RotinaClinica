import Link from "next/link";
import { auth } from "@/lib/auth";
import DownloadButton from "./DownloadButton";

export const dynamic = "force-dynamic";
export const metadata = { title: "Ebooks e Materiais · Rotina Clínica" };

const EBOOKS = [
  {
    id: "guia-prescricoes",
    titulo: "Manual prático de prescrições: da UBS à emergência",
    descricao:
      "Prescrições práticas e condutas clínicas organizadas por tema, com doses, diluições e orientações para o dia a dia no plantão.",
    paginas: "500 páginas",
    formato: "PDF",
  },
];

export default async function MateriaisPage() {
  const session = await auth();
  const email = session?.user?.email ?? "";

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
          Ebooks e Materiais
        </h1>
        <p className="text-zinc-500 dark:text-[#6a8fa5] text-sm">
          PDFs exclusivos para assinantes — baixe e consulte offline.
        </p>
      </header>

      <main className="flex-1 p-6 sm:p-8">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl">
          {EBOOKS.map((ebook) => (
            <div
              key={ebook.id}
              className="bg-white dark:bg-[#131c2e] border border-zinc-200 dark:border-white/8 rounded-2xl overflow-hidden flex flex-col"
            >
              {/* Cover */}
              <div
                className="rounded-t-2xl h-64"
                style={{
                  backgroundImage: "url('/images/ebook-manual-transparent.png')",
                  backgroundSize: "contain",
                  backgroundPosition: "center center",
                  backgroundRepeat: "no-repeat",
                  backgroundColor: "#0a1220",
                }}
              />

              {/* Info */}
              <div className="p-5 flex flex-col flex-1 gap-3">
                <div>
                  <h2 className="font-bold text-[#0f2d4a] dark:text-[#d4dce8] text-sm leading-snug mb-1">
                    {ebook.titulo}
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-[#6a8fa5] leading-relaxed">
                    {ebook.descricao}
                  </p>
                </div>

                <div className="flex gap-3 text-[11px] text-zinc-400 dark:text-[#5a7a8e]">
                  <span>{ebook.paginas}</span>
                  <span>·</span>
                  <span>{ebook.formato}</span>
                </div>

                {/* Watermark notice */}
                <div className="flex items-start gap-2 bg-[#f0f7ff] dark:bg-[#0f1e30] rounded-xl px-3 py-2.5">
                  <svg className="shrink-0 mt-0.5" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1a6aad" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <p className="text-[11px] text-[#1a6aad] dark:text-[#3db8d4] leading-relaxed">
                    O arquivo será vinculado ao seu e-mail{email ? ` (${email})` : ""} em cada página.
                  </p>
                </div>

                <DownloadButton
                  ebookId={ebook.id}
                  filename={`${ebook.titulo}.pdf`}
                />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
