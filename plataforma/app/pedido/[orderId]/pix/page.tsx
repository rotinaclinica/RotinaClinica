export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { MercadoPagoConfig, Payment } from "mercadopago";
import Link from "next/link";
import CopyButton from "./CopyButton";
import PixPoller from "./PixPoller";

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN ?? "placeholder",
});

export const metadata = { title: "Pagar com PIX" };

export default async function PixPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const order = await db.order.findUnique({
    where: { id: orderId, userId: session.user.id },
    include: { items: { include: { product: true } } },
  });

  if (!order) notFound();
  if (order.status === "PAID") redirect("/dashboard");

  const paymentApi = new Payment(client);
  const paymentData = await paymentApi.get({ id: order.providerRef });

  const txData = paymentData.point_of_interaction?.transaction_data;
  const qrBase64 = txData?.qr_code_base64;
  const qrCode = txData?.qr_code;

  if (!qrCode) redirect(`/pedido/${orderId}?status=falha`);

  const product = order.items[0]?.product;

  return (
    <main className="min-h-screen bg-[#f0f5f9] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-[#0f2d4a] px-6 py-5 text-center">
          <p className="text-[#9ec4de] text-xs font-semibold uppercase tracking-wider mb-1">
            Pagamento via PIX
          </p>
          <p className="text-white text-lg font-bold">
            {product?.title ?? "Assinatura"}
          </p>
        </div>

        <div className="px-6 py-6 space-y-5">
          <p className="text-center text-sm text-zinc-500">
            Escaneie o QR code ou copie o código PIX
          </p>

          {qrBase64 && (
            <div className="flex justify-center">
              <img
                src={`data:image/png;base64,${qrBase64}`}
                alt="QR Code PIX"
                className="w-52 h-52 rounded-xl border border-zinc-100"
              />
            </div>
          )}

          <div className="space-y-2">
            <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">
              PIX Copia e Cola
            </p>
            <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3 max-h-24 overflow-y-auto">
              <p className="text-xs text-zinc-600 break-all font-mono leading-relaxed">
                {qrCode}
              </p>
            </div>
            <CopyButton code={qrCode!} />
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
            <p className="text-amber-700 text-xs font-medium">
              ⏳ Aguardando pagamento — você será redirecionado automaticamente após confirmar
            </p>
          </div>

          <p className="text-center text-xs text-zinc-400">
            O acesso é liberado imediatamente após o pagamento
          </p>

          <div className="text-center">
            <Link
              href="/assinatura"
              className="text-xs text-zinc-400 hover:text-zinc-600 hover:underline transition-colors"
            >
              ← Escolher outro método de pagamento
            </Link>
          </div>
        </div>
      </div>

      <PixPoller orderId={orderId} />
    </main>
  );
}
