export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { CouponForm } from "./CouponForm";
import { ToggleButton, DeleteButton } from "./CouponActions";

export const metadata = { title: "Cupons · Admin Rotina Clínica" };

function brl(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function CuponsPage() {
  const [coupons, products] = await Promise.all([
    db.coupon.findMany({
      include: {
        products: { select: { id: true, title: true, slug: true } },
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.product.findMany({
      where: { active: true, type: { in: ["DOWNLOAD", "COURSE"] } },
      select: { id: true, title: true, slug: true },
      orderBy: { title: "asc" },
    }),
  ]);

  const activeCount = coupons.filter((c) => c.active).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Cupons de desconto</h1>
        <p className="text-sm text-zinc-400 mt-1">
          {coupons.length} cupom{coupons.length !== 1 ? "ns" : ""} · {activeCount} ativo{activeCount !== 1 ? "s" : ""}
        </p>
      </div>

      <CouponForm products={products} />

      {coupons.length === 0 ? (
        <div className="bg-[#161b22] rounded-xl border border-white/10 py-16 text-center">
          <p className="text-zinc-400 font-medium">Nenhum cupom criado ainda.</p>
        </div>
      ) : (
        <div className="bg-[#161b22] rounded-xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400">Código</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400">Desconto</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400">Produtos</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400">Usos</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400">Validade</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => {
                const isExpired = coupon.expiresAt && coupon.expiresAt < new Date();
                const isMaxed = coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses;

                return (
                  <tr key={coupon.id} className="border-b border-white/10 hover:bg-white/5">
                    <td className="px-4 py-3">
                      <span className="inline-block font-mono font-bold text-xs px-2.5 py-1 rounded bg-[#0f2d4a] text-white tracking-widest">
                        {coupon.code}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-zinc-100">
                      {coupon.discountType === "PERCENT"
                        ? `${coupon.discountValue}%`
                        : brl(coupon.discountValue)}
                    </td>
                    <td className="px-4 py-3">
                      {coupon.products.length === 0 ? (
                        <span className="text-xs text-zinc-400">Todos</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {coupon.products.map((p) => (
                            <span key={p.id} className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white/10 text-zinc-300">
                              {p.title.length > 25 ? p.title.slice(0, 25) + "…" : p.title}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-zinc-400">
                      {coupon._count.orders}
                      {coupon.maxUses !== null && (
                        <span className="text-zinc-500"> / {coupon.maxUses}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-400">
                      {coupon.expiresAt
                        ? coupon.expiresAt.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })
                        : "Sem expiração"}
                      {isExpired && (
                        <span className="ml-1.5 text-[10px] font-bold text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">
                          expirado
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {coupon.active && !isExpired && !isMaxed ? (
                        <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">ativo</span>
                      ) : !coupon.active ? (
                        <span className="text-[11px] font-bold text-zinc-500 bg-white/5 px-2 py-0.5 rounded">inativo</span>
                      ) : (
                        <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">esgotado</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <ToggleButton couponId={coupon.id} active={coupon.active} />
                        <DeleteButton couponId={coupon.id} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  );
}
