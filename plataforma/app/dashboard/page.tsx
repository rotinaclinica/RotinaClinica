export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata = { title: "Dashboard · Rotina Clínica" };

const sections = [
  {
    href: "/dashboard/prescricoes",
    label: "Prescrições",
    description: "+250 modelos prontos. Busque por queixa, diagnóstico ou medicamento.",
    badge: "250+",
    color: "from-[#0f2d4a] to-[#1a6aad]",
    icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  },
  {
    href: "/dashboard/casos",
    label: "Casos Clínicos",
    description: "Um novo caso toda semana com raciocínio diagnóstico e conduta.",
    badge: "Semanal",
    color: "from-[#1a6aad] to-[#3db8d4]",
    icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  },
  {
    href: "/dashboard/cursos",
    label: "Cursos e Videoaulas",
    description: "Conteúdo em vídeo por especialistas. Aprenda no seu ritmo.",
    badge: "Novo",
    color: "from-[#3db8d4] to-[#2fa8c4]",
    icon: "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  {
    href: "/dashboard/materiais",
    label: "Ebooks e Materiais",
    description: "PDFs e materiais de apoio para baixar e consultar offline.",
    badge: null,
    color: "from-[#0f2d4a] to-[#3db8d4]",
    icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
  },
  {
    href: "/dashboard/calculadoras",
    label: "Calculadoras Clínicas",
    description: "Escores, doses e ferramentas interativas para o dia a dia.",
    badge: null,
    color: "from-[#1a6aad] to-[#0f2d4a]",
    icon: "M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z",
  },
];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

// MARKER_RC_2026_07_28
export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
  });

  const isAdmin = user?.role === "ADMIN";
  const isTester = user?.role === "TESTER";

  const subscription =
    user && !isAdmin && !isTester
      ? await db.subscription.findUnique({ where: { userId: user.id } })
      : null;

  const firstName = (session.user.name ?? "").split(" ")[0];

  const planLabel = isAdmin ? "Administrador" : isTester ? "Conta de testes" : subscription?.plan === "ANNUAL" ? "Plano Anual" : "Plano Mensal";
  const isActive = isAdmin || isTester || subscription?.status === "ACTIVE";
  const expiresAt = subscription?.currentPeriodEnd;

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 px-6 sm:px-8 py-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-zinc-400 text-sm">{greeting()},</p>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#0f2d4a] leading-tight">{firstName}</h1>
          </div>

          {/* Status da assinatura */}
          {(isAdmin || isTester || subscription) ? (
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${
              isAdmin
                ? "bg-[#0f2d4a] text-[#3db8d4] border border-[#3db8d4]/30"
                : isTester
                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                  : isActive
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-red-50 text-red-700 border border-red-200"
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isAdmin ? "bg-[#3db8d4]" : isTester ? "bg-amber-500" : isActive ? "bg-emerald-500" : "bg-red-500"}`} />
              {planLabel}
            </div>
          ) : (
            <Link
              href="/assinatura"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[#0f2d4a] text-white hover:bg-[#1a6aad] transition-colors"
            >
              Assinar agora
            </Link>
          )}
        </div>

        {expiresAt && isActive && (
          <p className="text-xs text-zinc-400 mt-1">
            Acesso até {expiresAt.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
          </p>
        )}
      </header>

      {/* Content */}
      <main className="flex-1 p-6 sm:p-8">
        <p className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">O que você quer acessar?</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {sections.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="group bg-white border border-zinc-200 rounded-2xl overflow-hidden hover:shadow-lg hover:border-[#3db8d4] transition-all"
            >
              {/* Color strip */}
              <div className={`h-2 bg-gradient-to-r ${s.color}`} />

              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#e8f4fc] to-[#dceef9] flex items-center justify-center flex-shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1a6aad" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d={s.icon} />
                    </svg>
                  </div>
                  {s.badge && (
                    <span className="text-[10px] font-extrabold bg-[#3db8d4]/15 text-[#1a6aad] px-2 py-0.5 rounded-full uppercase tracking-wide flex-shrink-0">
                      {s.badge}
                    </span>
                  )}
                </div>
                <h2 className="font-extrabold text-[#0f2d4a] text-base mb-1 group-hover:text-[#1a6aad] transition-colors">
                  {s.label}
                </h2>
                <p className="text-zinc-500 text-sm leading-relaxed">{s.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
