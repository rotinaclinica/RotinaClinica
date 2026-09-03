export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { isAdminRequest } from "@/lib/require-admin";
import { UserActions } from "./UserActions";

export const metadata = { title: "Usuário · Admin · Rotina Clínica" };

const fmt = (d: Date | null | undefined) =>
  d ? new Date(d).toLocaleDateString("pt-BR") : "—";

const fmtBRL = (cents: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await isAdminRequest())) redirect("/dashboard");

  const { id } = await params;

  const user = await db.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      cpf: true,
      phone: true,
      createdAt: true,
      lastSeenAt: true,
      role: true,
      subscription: {
        select: {
          id: true,
          plan: true,
          status: true,
          provider: true,
          providerRef: true,
          currentPeriodStart: true,
          currentPeriodEnd: true,
          cancelledAt: true,
        },
      },
      orders: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          status: true,
          totalCents: true,
          provider: true,
          createdAt: true,
          paidAt: true,
          items: { select: { product: { select: { title: true } } } },
        },
      },
    },
  });

  if (!user) notFound();

  const totalPaid = user.orders
    .filter((o) => o.status === "PAID")
    .reduce((s, o) => s + o.totalCents, 0);

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3 flex-wrap">
        <Link href="/admin/usuarios" className="text-sm text-violet-600 hover:underline">
          ← Usuários
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-extrabold text-zinc-900">{user.name || "Sem nome"}</h1>
        <p className="text-sm text-zinc-500 mt-0.5">{user.email}</p>
      </div>

      {/* Dados pessoais */}
      <div className="bg-white rounded-xl border border-zinc-200 p-5">
        <h2 className="text-sm font-bold text-zinc-700 uppercase tracking-wide mb-4">Dados pessoais</h2>
        <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <dt className="text-xs text-zinc-400 font-medium">CPF</dt>
            <dd className="text-zinc-700 font-mono mt-0.5">
              {user.cpf
                ? user.cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4")
                : <span className="text-red-400">sem CPF</span>}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-400 font-medium">Celular</dt>
            <dd className="text-zinc-700 mt-0.5">{user.phone || <span className="text-zinc-300">—</span>}</dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-400 font-medium">Cadastro</dt>
            <dd className="text-zinc-700 mt-0.5">{fmt(user.createdAt)}</dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-400 font-medium">Último acesso</dt>
            <dd className="text-zinc-700 mt-0.5">{fmt(user.lastSeenAt)}</dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-400 font-medium">Gasto total</dt>
            <dd className="text-zinc-700 font-semibold mt-0.5">
              {totalPaid > 0 ? fmtBRL(totalPaid) : <span className="text-zinc-300 font-normal">—</span>}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-400 font-medium">Perfil</dt>
            <dd className="text-zinc-700 mt-0.5">{user.role}</dd>
          </div>
        </dl>
      </div>

      {/* Ações de assinatura */}
      <UserActions userId={user.id} sub={user.subscription} />

      {/* Pedidos */}
      <div className="bg-white rounded-xl border border-zinc-200 p-5">
        <h2 className="text-sm font-bold text-zinc-700 uppercase tracking-wide mb-4">
          Pedidos ({user.orders.length})
        </h2>
        {user.orders.length === 0 ? (
          <p className="text-sm text-zinc-400">Nenhum pedido.</p>
        ) : (
          <div className="space-y-2">
            {user.orders.map((o) => (
              <div
                key={o.id}
                className="flex items-center justify-between gap-3 py-2 border-b border-zinc-50 last:border-0 text-sm flex-wrap"
              >
                <div className="min-w-0">
                  <p className="text-zinc-700 font-medium">
                    {o.items.map((i) => i.product.title).join(", ") || "—"}
                  </p>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {o.provider} · {fmt(o.paidAt ?? o.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${
                      o.status === "PAID"
                        ? "bg-emerald-100 text-emerald-700"
                        : o.status === "REFUNDED"
                        ? "bg-red-100 text-red-700"
                        : "bg-zinc-100 text-zinc-500"
                    }`}
                  >
                    {o.status === "PAID" ? "Pago" : o.status === "REFUNDED" ? "Reembolsado" : o.status}
                  </span>
                  <span className="font-semibold text-zinc-800">{fmtBRL(o.totalCents)}</span>
                  {o.status === "PAID" && (
                    <Link
                      href={`/admin/reembolsos?orderId=${o.id}`}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Reembolsar
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
