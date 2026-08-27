export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import OrderStatusPoller from "./OrderStatusPoller";

export const metadata = { title: "Seu Pedido" };

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const { orderId } = await params;
  const { status } = await searchParams;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const order = await db.order.findUnique({
    where: { id: orderId, userId: session.user.id },
    include: { items: { include: { product: true } } },
  });

  if (!order) notFound();

  const isPaid = order.status === "PAID";
  const isPending = order.status === "PENDING" && status === "pendente";
  const isDeclined = status === "falha";
  const isProcessing = order.status === "PENDING" && status === "sucesso";

  return (
    <main className="min-h-screen bg-[#f0f4f8] dark:bg-[#0c1117] flex flex-col items-center justify-center px-4 py-12">

      {/* Logo */}
      <div className="mb-8 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-[#0f2d4a] dark:bg-[#3db8d4] flex items-center justify-center">
          <div className="w-4 h-4 rounded-sm bg-[#3db8d4] dark:bg-[#0f2d4a]" />
        </div>
        <span className="text-[#0f2d4a] dark:text-white font-bold text-lg tracking-wide">ROTINA CLÍNICA</span>
      </div>

      <div className="bg-white dark:bg-[#131c2e] border border-[#dde6ef] dark:border-white/8 rounded-2xl p-8 max-w-md w-full text-center shadow-sm">

        {isProcessing ? (
          <>
            <OrderStatusPoller orderId={orderId} />
            <div className="flex justify-center mb-5">
              <div className="w-12 h-12 border-4 border-[#dde6ef] border-t-[#3db8d4] rounded-full animate-spin" />
            </div>
            <h1 className="text-xl font-bold text-[#0f2d4a] dark:text-white mb-2">Confirmando pagamento…</h1>
            <p className="text-[#6a8fa5] dark:text-[#8fa8bd] text-sm mb-2">
              Aguarde enquanto confirmamos seu pagamento. A página atualiza sozinha assim que for aprovado.
            </p>
            <Link href={`/pedido/${orderId}`} className="text-xs text-[#3db8d4] underline">Recarregar agora</Link>
          </>

        ) : isDeclined ? (
          <>
            <div className="text-5xl mb-4">❌</div>
            <h1 className="text-xl font-bold text-[#0f2d4a] dark:text-white mb-2">Cartão não autorizado</h1>
            <p className="text-[#6a8fa5] dark:text-[#8fa8bd] text-sm mb-4 leading-relaxed">
              O banco recusou o pagamento. Isso pode ocorrer por limite insuficiente, cartão bloqueado para compras online ou proteção antifraude.
            </p>
            <div className="bg-[#f0f7ff] dark:bg-[#0f2d4a]/40 border border-[#c8dff5] dark:border-[#3db8d4]/20 rounded-xl p-4 mb-5 text-left">
              <p className="text-sm font-semibold text-[#0f2d4a] dark:text-white mb-1">Tente pagar via PIX</p>
              <p className="text-xs text-[#4a6a80] dark:text-[#8fa8bd] leading-relaxed">
                O PIX é aprovado instantaneamente e sem restrições. Volte à página do produto e selecione Mercado Pago.
              </p>
            </div>
            <div className="border border-[#e8eef4] dark:border-white/8 rounded-xl p-4 mb-5 text-left">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm text-[#0f2d4a] dark:text-zinc-100">
                  <span>{item.product.title}</span>
                  <span className="font-semibold">{formatPrice(item.priceCents, order.currency)}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-3">
              {order.items[0]?.product?.slug && (
                <Link href={`/produtos/${order.items[0].product.slug}`}
                  className="bg-[#3db8d4] text-white py-3 rounded-xl font-semibold hover:bg-[#2da8c4] transition-colors">
                  Tentar com outro método
                </Link>
              )}
              <Link href="/" className="text-sm text-[#6a8fa5] dark:text-[#8fa8bd] hover:underline">Voltar para o início</Link>
            </div>
          </>

        ) : (
          <>
            {!isPaid && <OrderStatusPoller orderId={orderId} />}
            <div className="text-5xl mb-4">
              {isPaid ? "✅" : isPending ? "⏳" : "❌"}
            </div>
            <h1 className="text-xl font-bold text-[#0f2d4a] dark:text-white mb-2">
              {isPaid ? "Pagamento confirmado!" : isPending ? "Aguardando pagamento" : "Pagamento não confirmado"}
            </h1>
            <p className="text-[#6a8fa5] dark:text-[#8fa8bd] text-sm mb-6 leading-relaxed">
              {isPaid
                ? "Seu acesso foi liberado. Clique abaixo para acessar a plataforma."
                : isPending
                ? "Seu PIX está sendo processado. Você receberá acesso assim que o pagamento for confirmado."
                : "Se você completou o pagamento, aguarde alguns minutos e recarregue a página."}
            </p>

            <div className="border border-[#e8eef4] dark:border-white/8 rounded-xl p-4 mb-6 text-left">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm text-[#0f2d4a] dark:text-zinc-100">
                  <span>{item.product.title}</span>
                  <span className="font-semibold">{formatPrice(item.priceCents, order.currency)}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3">
              {isPaid && (
                <Link href="/dashboard"
                  className="bg-[#3db8d4] text-white py-3 rounded-xl font-semibold hover:bg-[#2da8c4] transition-colors">
                  Acessar a plataforma →
                </Link>
              )}
              {!isPaid && (
                <Link href={`/pedido/${orderId}`}
                  className="border border-[#dde6ef] dark:border-white/10 text-[#6a8fa5] dark:text-[#8fa8bd] py-3 rounded-xl text-sm hover:bg-[#f0f4f8] dark:hover:bg-white/5 transition-colors block">
                  Recarregar página
                </Link>
              )}
              <Link href="/" className="text-sm text-[#6a8fa5] dark:text-[#8fa8bd] hover:underline">Voltar para o início</Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
