export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { formatPrice } from "@/lib/format";

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

  return (
    <main className="min-h-screen bg-zinc-50 flex items-center justify-center px-4">
      <div className="bg-white border border-zinc-200 rounded-2xl p-8 max-w-md w-full text-center">
        <div className="text-5xl mb-4">{isPaid ? "✅" : isPending ? "⏳" : "❌"}</div>
        <h1 className="text-2xl font-bold mb-2">
          {isPaid
            ? "Pagamento confirmado!"
            : isPending
            ? "Aguardando pagamento"
            : "Pedido pendente"}
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
          <Link href="/" className="text-sm text-zinc-500 hover:underline">
            Voltar para a loja
          </Link>
        </div>
      </div>
    </main>
  );
}
