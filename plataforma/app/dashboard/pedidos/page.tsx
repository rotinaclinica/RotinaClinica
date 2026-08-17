export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { RefundButton } from "./RefundButton";

export const metadata = { title: "Meus Pedidos · Rotina Clínica" };

const REFUND_WINDOW_DAYS = 7;

function formatCents(cents: number, currency: string) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: currency || "BRL",
  }).format(cents / 100);
}

const statusLabel: Record<string, { label: string; cls: string }> = {
  PAID:     { label: "Pago",       cls: "bg-green-100 text-green-700" },
  PENDING:  { label: "Pendente",   cls: "bg-amber-100 text-amber-700" },
  FAILED:   { label: "Recusado",   cls: "bg-red-100 text-red-600" },
  EXPIRED:  { label: "Expirado",   cls: "bg-zinc-100 text-zinc-500" },
  REFUNDED: { label: "Reembolsado",cls: "bg-blue-100 text-blue-600" },
};

export default async function PedidosPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const orders = await db.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { items: { include: { product: { select: { title: true, slug: true } } } } },
  });

  return (
    <div className="flex-1 flex flex-col">
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
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#0f2d4a] dark:text-[#e8edf5]">Meus Pedidos</h1>
        <p className="text-zinc-500 dark:text-[#6a8fa5] text-sm mt-1">
          Compras realizadas na plataforma. Reembolso disponível em até 7 dias após a compra.
        </p>
      </header>

      <main className="flex-1 p-6 sm:p-8">
        {orders.length === 0 ? (
          <div className="text-center py-20 text-zinc-400 dark:text-[#4a6a7e]">
            <p className="text-lg font-medium mb-2">Nenhum pedido ainda</p>
            <p className="text-sm">Suas compras aparecerão aqui.</p>
          </div>
        ) : (
          <div className="max-w-2xl space-y-4">
            {orders.map((order) => {
              const st = statusLabel[order.status] ?? { label: order.status, cls: "bg-zinc-100 text-zinc-500" };
              const daysLeft = order.paidAt
                ? Math.max(0, REFUND_WINDOW_DAYS - Math.floor((Date.now() - order.paidAt.getTime()) / (1000 * 60 * 60 * 24)))
                : 0;
              const canRefund = order.status === "PAID" && daysLeft > 0;

              return (
                <div
                  key={order.id}
                  className="bg-white dark:bg-[#131c2e] rounded-2xl border border-zinc-200 dark:border-white/8 p-5 space-y-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-0.5">
                      {order.items.map((item) => (
                        <p key={item.id} className="font-semibold text-[#0f2d4a] dark:text-[#e8edf5] text-sm leading-snug">
                          {item.product.title}
                        </p>
                      ))}
                      <p className="text-xs text-zinc-400 dark:text-[#4a6a7e]">
                        {new Date(order.createdAt).toLocaleDateString("pt-BR", {
                          day: "2-digit", month: "long", year: "numeric",
                        })}
                        {" · "}
                        {order.provider === "STRIPE" ? "Stripe" : "Mercado Pago"}
                      </p>
                    </div>
                    <div className="text-right shrink-0 space-y-1">
                      <p className="font-bold text-[#0f2d4a] dark:text-[#e8edf5] text-sm">
                        {formatCents(order.totalCents, order.currency)}
                      </p>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${st.cls}`}>
                        {st.label}
                      </span>
                    </div>
                  </div>

                  {canRefund && (
                    <div className="border-t border-zinc-100 dark:border-white/6 pt-3">
                      <RefundButton orderId={order.id} daysLeft={daysLeft} />
                    </div>
                  )}

                  {order.status === "REFUNDED" && (
                    <div className="border-t border-zinc-100 dark:border-white/6 pt-3">
                      <p className="text-xs text-blue-500">Reembolso processado. O acesso foi removido.</p>
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
