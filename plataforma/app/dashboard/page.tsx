export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import ThemeToggle from "@/app/components/ThemeToggle";
import { calcularTier, formatarSince } from "@/lib/tier";
import { canAccessPaidContent } from "@/lib/subscription";

export const metadata = { title: "Dashboard · Rotina Clínica" };

const sections = [
  {
    href: "/dashboard/evolucoes",
    label: "Modelos de evolução",
    description: "Modelos de evolução prontos para facilitar o atendimento.",
    badge: "Agilidade no atendimento",
    color: "from-[#0f2d4a] to-[#1a6aad]",
    icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
  },
  {
    href: "/dashboard/prescricoes",
    label: "Condutas Clínicas",
    description: "Busque por queixa, diagnóstico, medicamento ou tema.",
    badge: "Atualizações constantes",
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
    description: "Conteúdo de qualidade, baseado em evidências. Estude no seu ritmo.",
    badge: "Abordagem prática e sistematizada",
    color: "from-[#3db8d4] to-[#2fa8c4]",
    icon: "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  {
    href: "/dashboard/materiais",
    label: "Ebooks e Materiais",
    description: "PDFs e materiais de apoio para baixar e consultar offline.",
    badge: "Utilize offline em qualquer dispositivo",
    color: "from-[#0f2d4a] to-[#3db8d4]",
    icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
  },
  {
    href: "/dashboard/calculadoras",
    label: "Calculadoras Clínicas",
    description: "Escores, doses e ferramentas interativas para o dia a dia.",
    badge: "Agilidade e praticidade",
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
  if (!isAdmin && !isTester && !(await canAccessPaidContent(session.user.id))) {
    redirect("/assinatura?motivo=acesso");
  }

  const subscription =
    user && !isAdmin && !isTester
      ? await db.subscription.findUnique({ where: { userId: user.id } })
      : null;

  const firstName = (session.user.name ?? "").split(" ")[0];

  const planLabel = isAdmin ? "Administrador" : isTester ? "Conta de testes" : subscription?.plan === "ANNUAL" ? "Plano Anual" : "Plano Mensal";
  const isActive = isAdmin || isTester || subscription?.status === "ACTIVE";
  const expiresAt = subscription?.currentPeriodEnd;

  // Tier de gamificação: usa data da assinatura ou, para admin/tester, a data de criação da conta
  const sinceDate = subscription?.createdAt ?? (isAdmin || isTester ? user?.createdAt : null) ?? null;
  const tier = sinceDate ? calcularTier(sinceDate) : null;

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-[#131c2e] border-b border-zinc-200 dark:border-white/8 px-6 sm:px-8 py-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[#0f2d4a] dark:text-[#5a7a8e] text-sm">{greeting()},</p>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#0f2d4a] dark:text-[#e8edf5] leading-tight">{firstName}</h1>
          </div>

          {/* Status da assinatura */}
          {(isAdmin || isTester || subscription) ? (
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${
              isAdmin
                ? "bg-[#0f2d4a] text-[#3db8d4] border border-[#3db8d4]/30"
                : isTester
                  ? "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-700/40"
                  : isActive
                    ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700/40"
                    : "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-700/40"
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

        {tier && sinceDate && (
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <span className="text-lg leading-none">{tier.emoji}</span>
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${tier.badge}`}>
              {tier.nome}
            </span>
            <span className="text-xs font-medium text-[#0f2d4a] dark:text-[#e8edf5]">
              Assinante desde {formatarSince(sinceDate)}
            </span>
          </div>
        )}

        {expiresAt && isActive && (
          <p className="text-xs text-[#0f2d4a] dark:text-[#5a7a8e] mt-1">
            Acesso até {expiresAt.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
          </p>
        )}
      </header>

      {/* Content */}
      <main className="flex-1 p-6 sm:p-8">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-[#0f2d4a] dark:text-[#4a6a7e] uppercase tracking-wider">O que você quer acessar?</p>
          <ThemeToggle variant="switch" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {sections.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="group bg-white dark:bg-[#131c2e] border border-zinc-200 dark:border-white/8 rounded-2xl overflow-hidden hover:shadow-lg hover:border-[#3db8d4] dark:hover:border-[#3db8d4]/60 transition-all"
            >
              {/* Color strip */}
              <div className={`h-2 bg-gradient-to-r ${s.color}`} />

              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#e8f4fc] to-[#dceef9] dark:from-[#1a2d45] dark:to-[#162438] flex items-center justify-center flex-shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1a6aad" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d={s.icon} />
                    </svg>
                  </div>
                  {s.badge && (
                    <span className="text-[10px] font-bold bg-[#3db8d4]/15 dark:bg-[#3db8d4]/20 text-[#1a6aad] dark:text-[#3db8d4] px-2.5 py-1 rounded-xl leading-tight text-right max-w-[130px]">
                      {s.badge}
                    </span>
                  )}
                </div>
                <h2 className="font-extrabold text-[#0f2d4a] dark:text-[#e8edf5] text-base mb-1 group-hover:text-[#1a6aad] dark:group-hover:text-[#3db8d4] transition-colors">
                  {s.label}
                </h2>
                <p className="text-[#0f2d4a] dark:text-[#6a8fa5] text-sm leading-relaxed">{s.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
