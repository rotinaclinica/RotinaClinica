export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { AmbassadorForm } from "./AmbassadorForm";
import { RemoveButton, MarkPaidButton } from "./AmbassadorActions";

export const metadata = { title: "Embaixadores · Admin Rotina Clínica" };

function brl(cents: number | null | undefined) {
  return ((cents ?? 0) / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
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
        select: {
          id: true,
          paymentAmountCents: true,
          commissionCents: true,
          paidOut: true,
          createdAt: true,
          referredUser: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Embaixadores</h1>
          <p className="text-sm text-zinc-400 mt-1">
            {ambassadors.length} embaixador{ambassadors.length !== 1 ? "es" : ""} ativo{ambassadors.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <AmbassadorForm />

      {ambassadors.length === 0 ? (
        <div className="bg-[#161b22] rounded-xl border border-white/10 py-16 text-center">
          <p className="text-zinc-400 font-medium">Nenhum embaixador cadastrado ainda.</p>
        </div>
      ) : (
        <div className="bg-[#161b22] rounded-xl border border-white/10 overflow-hidden">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400">Embaixador</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400">Código</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400">Indicações</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400">Meses bônus</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400">Comissão pendente</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400">Já pago</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {ambassadors.map((amb) => {
                const total = amb.referralsGiven.length;
                const pendingCents = amb.referralsGiven.filter(r => !r.paidOut).reduce((s, r) => s + r.commissionCents, 0);
                const paidCents = amb.referralsGiven.filter(r => r.paidOut).reduce((s, r) => s + r.commissionCents, 0);
                const bonusMonths = Math.floor(total / 2);

                return (
                  <>
                    <tr key={amb.id} className="border-b border-white/10 hover:bg-white/5">
                      <td className="px-4 py-3">
                        <p className="font-medium text-zinc-100">{amb.name ?? "Sem nome"}</p>
                        <p className="text-xs text-zinc-400">{amb.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-block font-mono font-bold text-xs px-2.5 py-1 rounded bg-[#0f2d4a] text-white tracking-widest">
                          {amb.ambassadorCode}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-zinc-400 font-semibold">{total}</td>
                      <td className="px-4 py-3 text-zinc-400">{bonusMonths > 0 ? `+${bonusMonths} mês${bonusMonths !== 1 ? "es" : ""}` : "—"}</td>
                      <td className="px-4 py-3">
                        {pendingCents > 0
                          ? <span className="font-semibold text-amber-400">{brl(pendingCents)}</span>
                          : <span className="text-zinc-400">—</span>}
                      </td>
                      <td className="px-4 py-3 text-zinc-400">{paidCents > 0 ? brl(paidCents) : "—"}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 justify-end">
                          <MarkPaidButton ambassadorId={amb.id} pending={pendingCents} />
                          <RemoveButton userId={amb.id} />
                        </div>
                      </td>
                    </tr>
                    {amb.referralsGiven.length > 0 && amb.referralsGiven.map((r) => (
                      <tr key={r.id} className="border-b border-white/5 last:border-0 bg-white/5/60">
                        <td className="pl-10 pr-4 py-2" colSpan={2}>
                          <p className="text-xs text-zinc-400 font-medium">{r.referredUser.name ?? r.referredUser.email}</p>
                          <p className="text-[11px] text-zinc-400">{r.referredUser.email}</p>
                        </td>
                        <td className="px-4 py-2 text-xs text-zinc-400" colSpan={2}>
                          {r.createdAt.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                        </td>
                        <td className="px-4 py-2 text-xs font-semibold text-zinc-400">
                          comissão: {brl(r.commissionCents)}
                        </td>
                        <td className="px-4 py-2" colSpan={2}>
                          {r.paidOut
                            ? <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">✓ pago</span>
                            : <span className="text-[11px] font-bold text-amber-400 bg-amber-50 px-2 py-0.5 rounded">pendente</span>}
                        </td>
                      </tr>
                    ))}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
