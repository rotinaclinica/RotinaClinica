export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import OrderStatusPoller from "./OrderStatusPoller";
import PixelPurchase from "./PixelPurchase";

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
        <img src="/images/logo-azul.png" alt="Rotina Clínica" className="h-8 w-auto dark:hidden" />
        <img src="/images/logo-branco.png" alt="Rotina Clínica" className="h-8 w-auto hidden dark:block" />
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
            {isPaid && <PixelPurchase orderId={orderId} valueCents={order.totalCents} currency={order.currency} />}
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
              {isPaid && order.items.some((item) => item.product.type === "DOWNLOAD") && (
                <div className="flex flex-col gap-2">
                  {order.items.filter((item) => item.product.type === "DOWNLOAD").map((item) => (
                    <a
                      key={item.id}
                      href={`/api/downloads/${item.product.id}`}
                      className="flex items-center justify-center gap-2 bg-[#0f2d4a] text-white py-3 rounded-xl font-semibold hover:bg-[#1a4a6e] transition-colors"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                      Baixar {item.product.title}
                    </a>
                  ))}
                </div>
              )}
              {isPaid && order.items.some((item) => item.product.type === "COURSE") && (
                <Link href="/dashboard/cursos/destravando"
                  className="flex items-center justify-center gap-2 bg-[#0f2d4a] text-white py-3 rounded-xl font-semibold hover:bg-[#1a4a6e] transition-colors">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                    <circle cx="12" cy="12" r="10"/>
                  </svg>
                  Acessar o curso
                </Link>
              )}
              {isPaid && (
                <Link href="/dashboard"
                  className="bg-[#3db8d4] text-white py-3 rounded-xl font-semibold hover:bg-[#2da8c4] transition-colors text-center">
                  Acessar a plataforma →
                </Link>
              )}
              {!isPaid && (
                <Link href={`/pedido/${orderId}`}
                  className="border border-[#dde6ef] dark:border-white/10 text-[#6a8fa5] dark:text-[#8fa8bd] py-3 rounded-xl text-sm hover:bg-[#f0f4f8] dark:hover:bg-white/5 transition-colors block">
                  Recarregar página
                </Link>
              )}
              {isPaid && order.items.some((item) => item.product.type === "DOWNLOAD") && (
                <Link href="/dashboard/meus-ebooks" className="text-sm text-[#3db8d4] hover:underline">
                  Ver em Meus Ebooks →
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
