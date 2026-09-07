export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { AmbassadorForm } from "./AmbassadorForm";
import { RemoveButton, MarkPaidButton } from "./AmbassadorActions";

export const metadata = { title: "Embaixadores · Admin Rotina Clínica" };

function fmt(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function EmbaixadoresPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await db.user.findUnique({ where: { id: session.user.id }, select: { role: true } });
  if (user?.role !== "ADMIN") redirect("/dashboard");

  const ambassadors = await db.user.findMany({
    where: { isAmbassador: true },
    select: {
      id: true,
      name: true,
      email: true,
      ambassadorCode: true,
      referralsGiven: {
        select: { id: true, paymentAmountCents: true, commissionCents: true, paidOut: true, createdAt: true, referredUser: { select: { name: true, email: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex-1 flex flex-col">
      <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-white/8 px-6 sm:px-8 py-6">
        <h1 className="text-xl font-extrabold text-zinc-800 dark:text-zinc-100">Embaixadores</h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-0.5">{ambassadors.length} embaixador{ambassadors.length !== 1 ? "es" : ""} ativo{ambassadors.length !== 1 ? "s" : ""}</p>
      </header>

      <main className="flex-1 p-6 sm:p-8 space-y-8">
        <AmbassadorForm />

        {ambassadors.length === 0 ? (
          <div className="py-12 text-center text-zinc-400">
            <p className="text-lg font-medium">Nenhum embaixador ainda</p>
          </div>
        ) : (
          <div className="space-y-4 max-w-4xl">
            {ambassadors.map((amb) => {
              const totalReferrals = amb.referralsGiven.length;
              const pendingCents = amb.referralsGiven.filter(r => !r.paidOut).reduce((s, r) => s + r.commissionCents, 0);
              const paidCents = amb.referralsGiven.filter(r => r.paidOut).reduce((s, r) => s + r.commissionCents, 0);
              const bonusMonths = Math.floor(totalReferrals / 2);

              return (
                <div key={amb.id} className="bg-white dark:bg-zinc-800/60 border border-zinc-200 dark:border-white/8 rounded-xl overflow-hidden">
                  {/* Cabeçalho do embaixador */}
                  <div className="flex items-start justify-between gap-4 px-5 py-4">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-zinc-800 dark:text-zinc-100">{amb.name ?? "Sem nome"}</span>
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#0f2d4a] text-white tracking-widest">{amb.ambassadorCode}</span>
                      </div>
                      <p className="text-xs text-zinc-500 mt-0.5">{amb.email}</p>
                    </div>
                    <RemoveButton userId={amb.id} />
                  </div>

                  {/* Estatísticas */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-zinc-100 dark:bg-white/6 border-t border-b border-zinc-100 dark:border-white/6">
                    {[
                      { label: "Indicações", value: String(totalReferrals) },
                      { label: "Meses bônus", value: String(bonusMonths) },
                      { label: "Pendente", value: fmt(pendingCents), highlight: pendingCents > 0 },
                      { label: "Já pago", value: fmt(paidCents) },
                    ].map(({ label, value, highlight }) => (
                      <div key={label} className="bg-white dark:bg-zinc-800/60 px-4 py-3 text-center">
                        <p className="text-[11px] text-zinc-400 uppercase tracking-wide">{label}</p>
                        <p className={`text-base font-extrabold mt-0.5 ${highlight ? "text-amber-600 dark:text-amber-400" : "text-zinc-800 dark:text-zinc-100"}`}>{value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Ações e lista de indicações */}
                  <div className="px-5 py-3 flex items-center justify-between gap-2">
                    <p className="text-xs text-zinc-500">Comissão pendente de repasse</p>
                    <MarkPaidButton ambassadorId={amb.id} pending={pendingCents} />
                  </div>

                  {amb.referralsGiven.length > 0 && (
                    <div className="border-t border-zinc-100 dark:border-white/6">
                      {amb.referralsGiven.map((r) => (
                        <div key={r.id} className="flex items-center justify-between px-5 py-2.5 text-xs border-b border-zinc-50 dark:border-white/4 last:border-0">
                          <div>
                            <span className="font-semibold text-zinc-700 dark:text-zinc-200">{r.referredUser.name ?? r.referredUser.email}</span>
                            <span className="text-zinc-400 ml-2">{r.createdAt.toLocaleDateString("pt-BR")}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-zinc-500">{fmt(r.paymentAmountCents)}</span>
                            <span className="font-semibold text-zinc-700 dark:text-zinc-200">comissão: {fmt(r.commissionCents)}</span>
                            {r.paidOut
                              ? <span className="text-green-600 dark:text-green-400 font-semibold">✓ pago</span>
                              : <span className="text-amber-600 dark:text-amber-400 font-semibold">pendente</span>
                            }
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
