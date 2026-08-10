export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import ChangePasswordForm from "./ChangePasswordForm";

export const metadata = { title: "Meu Perfil · Rotina Clínica" };

const roleLabel: Record<string, string> = {
  ADMIN: "Administrador",
  TESTER: "Conta de testes",
  CUSTOMER: "Assinante",
};

const planLabel: Record<string, string> = {
  MONTHLY: "Plano Mensal",
  ANNUAL: "Plano Anual",
};

const statusLabel: Record<string, { text: string; color: string }> = {
  ACTIVE: { text: "Ativa", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  CANCELLED: { text: "Cancelada", color: "bg-zinc-100 text-zinc-500 border-zinc-200" },
  EXPIRED: { text: "Expirada", color: "bg-red-50 text-red-600 border-red-200" },
  PAST_DUE: { text: "Pagamento pendente", color: "bg-amber-50 text-amber-700 border-amber-200" },
};

export default async function PerfilPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: { subscription: true },
  });

  if (!user) redirect("/login");

  const initials = (user.name ?? user.email)
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

  const isAdmin = user.role === "ADMIN";
  const isTester = user.role === "TESTER";
  const sub = user.subscription;

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <header className="bg-white dark:bg-[#131c2e] border-b border-zinc-200 dark:border-white/8 px-6 sm:px-8 py-6">
        <Link href="/dashboard" className="inline-flex items-center gap-1 text-xs text-zinc-400 dark:text-[#4a6a7e] hover:text-[#1a6aad] dark:hover:text-[#3db8d4] mb-3 transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Início
        </Link>
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#0f2d4a] dark:text-[#e8edf5]">Meu perfil</h1>
        <p className="text-zinc-500 dark:text-[#6a8fa5] text-sm mt-0.5">Suas informações e configurações de conta.</p>
      </header>

      <main className="flex-1 p-6 sm:p-8 space-y-6 max-w-2xl">

        {/* Dados do usuário */}
        <section className="bg-white dark:bg-[#131c2e] border border-zinc-200 dark:border-white/8 rounded-2xl p-6">
          <h2 className="text-sm font-bold text-zinc-400 dark:text-[#4a6a7e] uppercase tracking-wider mb-5">Dados da conta</h2>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-full bg-[#3db8d4] flex items-center justify-center text-[#0f2d4a] font-extrabold text-lg flex-shrink-0">
              {initials}
            </div>
            <div>
              <p className="font-extrabold text-[#0f2d4a] dark:text-[#e8edf5] text-base">{user.name ?? "—"}</p>
              <p className="text-zinc-500 dark:text-[#6a8fa5] text-sm">{user.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-zinc-50 dark:bg-white/5 rounded-xl px-4 py-3">
              <p className="text-xs text-zinc-400 dark:text-[#4a6a7e] font-medium mb-0.5">Nome</p>
              <p className="text-sm font-semibold text-zinc-800 dark:text-[#d4dce8]">{user.name ?? "—"}</p>
            </div>
            <div className="bg-zinc-50 dark:bg-white/5 rounded-xl px-4 py-3">
              <p className="text-xs text-zinc-400 dark:text-[#4a6a7e] font-medium mb-0.5">E-mail</p>
              <p className="text-sm font-semibold text-zinc-800 dark:text-[#d4dce8] truncate">{user.email}</p>
            </div>
            <div className="bg-zinc-50 dark:bg-white/5 rounded-xl px-4 py-3">
              <p className="text-xs text-zinc-400 dark:text-[#4a6a7e] font-medium mb-0.5">Tipo de conta</p>
              <p className="text-sm font-semibold text-zinc-800 dark:text-[#d4dce8]">{roleLabel[user.role] ?? user.role}</p>
            </div>
            <div className="bg-zinc-50 dark:bg-white/5 rounded-xl px-4 py-3">
              <p className="text-xs text-zinc-400 dark:text-[#4a6a7e] font-medium mb-0.5">Membro desde</p>
              <p className="text-sm font-semibold text-zinc-800 dark:text-[#d4dce8]">
                {user.createdAt.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
              </p>
            </div>
          </div>
        </section>

        {/* Plano / assinatura */}
        <section className="bg-white dark:bg-[#131c2e] border border-zinc-200 dark:border-white/8 rounded-2xl p-6">
          <h2 className="text-sm font-bold text-zinc-400 dark:text-[#4a6a7e] uppercase tracking-wider mb-5">Assinatura</h2>

          {isAdmin && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-[#0f2d4a]">
              <span className="w-2 h-2 rounded-full bg-[#3db8d4]" />
              <p className="text-[#3db8d4] font-bold text-sm">Acesso de administrador — todos os conteúdos liberados.</p>
            </div>
          )}

          {isTester && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <p className="text-amber-700 dark:text-amber-400 font-bold text-sm">Conta de testes — acesso completo sem cobrança.</p>
            </div>
          )}

          {!isAdmin && !isTester && !sub && (
            <div className="flex flex-col gap-4 p-4 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/8">
              <p className="text-zinc-500 dark:text-[#6a8fa5] text-sm">Você não possui uma assinatura ativa.</p>
              <a
                href="/assinatura"
                className="self-start bg-[#1a6aad] hover:bg-[#0f2d4a] text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
              >
                Ver planos
              </a>
            </div>
          )}

          {!isAdmin && !isTester && sub && (() => {
            const s = statusLabel[sub.status] ?? { text: sub.status, color: "bg-zinc-100 text-zinc-500 border-zinc-200" };
            return (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-zinc-50 dark:bg-white/5 rounded-xl px-4 py-3">
                    <p className="text-xs text-zinc-400 dark:text-[#4a6a7e] font-medium mb-0.5">Plano</p>
                    <p className="text-sm font-bold text-zinc-800 dark:text-[#d4dce8]">{planLabel[sub.plan] ?? sub.plan}</p>
                  </div>
                  <div className="bg-zinc-50 dark:bg-white/5 rounded-xl px-4 py-3">
                    <p className="text-xs text-zinc-400 dark:text-[#4a6a7e] font-medium mb-0.5">Status</p>
                    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${s.color}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {s.text}
                    </span>
                  </div>
                  <div className="bg-zinc-50 dark:bg-white/5 rounded-xl px-4 py-3">
                    <p className="text-xs text-zinc-400 dark:text-[#4a6a7e] font-medium mb-0.5">Início do período</p>
                    <p className="text-sm font-semibold text-zinc-800 dark:text-[#d4dce8]">
                      {sub.currentPeriodStart.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
                    </p>
                  </div>
                  <div className="bg-zinc-50 dark:bg-white/5 rounded-xl px-4 py-3">
                    <p className="text-xs text-zinc-400 dark:text-[#4a6a7e] font-medium mb-0.5">Acesso até</p>
                    <p className="text-sm font-semibold text-zinc-800 dark:text-[#d4dce8]">
                      {sub.currentPeriodEnd.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })()}
        </section>

        {/* Alterar senha */}
        <section className="bg-white dark:bg-[#131c2e] border border-zinc-200 dark:border-white/8 rounded-2xl p-6">
          <h2 className="text-sm font-bold text-zinc-400 dark:text-[#4a6a7e] uppercase tracking-wider mb-5">Alterar senha</h2>
          <ChangePasswordForm />
        </section>

        {/* Sair — visível apenas no mobile onde a sidebar fica oculta */}
        <section className="lg:hidden bg-white dark:bg-[#131c2e] border border-zinc-200 dark:border-white/8 rounded-2xl p-6">
          <h2 className="text-sm font-bold text-zinc-400 dark:text-[#4a6a7e] uppercase tracking-wider mb-4">Sessão</h2>
          <Link
            href="/api/auth/signout"
            className="flex items-center gap-3 text-red-600 font-semibold text-sm hover:text-red-700 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sair da conta
          </Link>
        </section>

      </main>
    </div>
  );
}
