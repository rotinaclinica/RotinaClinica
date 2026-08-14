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
  // MP retornou sucesso mas webhook ainda não processou
  const isProcessing = order.status === "PENDING" && status === "sucesso";

  return (
    <main className="min-h-screen bg-zinc-50 flex items-center justify-center px-4">
      <div className="bg-white border border-zinc-200 rounded-2xl p-8 max-w-md w-full text-center">
        {isProcessing ? (
          <>
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Confirmando pagamento…</h1>
            <p className="text-zinc-500 text-sm mb-6">
              Aguarde enquanto confirmamos seu pagamento. Isso leva alguns segundos.
            </p>
            <OrderStatusPoller orderId={orderId} />
          </>
        ) : (
          <>
            <div className="text-5xl mb-4">{isPaid ? "✅" : isPending ? "⏳" : "❌"}</div>
            <h1 className="text-2xl font-bold mb-2">
              {isPaid
                ? "Pagamento confirmado!"
                : isPending
                ? "Aguardando pagamento"
                : "Pagamento não confirmado"}
            </h1>
            <p className="text-zinc-500 text-sm mb-6">
              {isPaid
                ? "Seu acesso foi liberado. Acesse sua área."
                : isPending
                ? "Seu PIX/boleto está sendo processado. Você receberá acesso assim que o pagamento for confirmado."
                : "Se você completou o pagamento, aguarde alguns minutos e recarregue a página."}
            </p>

            <div className="border border-zinc-100 rounded-xl p-4 mb-6 text-left">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.product.title}</span>
                  <span className="font-medium">{formatPrice(item.priceCents, order.currency)}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3">
              {isPaid && (
                <Link
                  href="/dashboard"
                  className="bg-violet-600 text-white py-3 rounded-xl font-semibold hover:bg-violet-700 transition-colors"
                >
                  Ir para Minha Área
                </Link>
              )}
              {!isPaid && (
                <Link
                  href={`/pedido/${orderId}`}
                  className="border border-zinc-200 text-zinc-600 py-3 rounded-xl text-sm hover:bg-zinc-50 transition-colors block"
                >
                  Recarregar página
                </Link>
              )}
              <Link href="/" className="text-sm text-zinc-500 hover:underline">
                Voltar para a loja
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
