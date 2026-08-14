import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import CheckoutButton from "./CheckoutButton";

const PLANS = {
  anual:  { slug: "assinatura-anual",  label: "Plano Anual",   price: "R$ 400/ano",  detail: "R$ 33,30/mês · acesso por 12 meses" },
  mensal: { slug: "assinatura-mensal", label: "Plano Mensal",  price: "R$ 39,90/mês", detail: "Cancele quando quiser" },
} as const;

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ plano?: string }>;
}) {
  const { plano } = await searchParams;
  const plan = PLANS[plano as keyof typeof PLANS];

  if (!plan) redirect("/assinatura");

  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/checkout?plano=${plano}`);
  }

  const product = await db.product.findUnique({
    where: { slug: plan.slug, active: true },
    select: { id: true },
  });

  if (!product) redirect("/assinatura");

  // Usuário já tem assinatura ativa?
  const existing = await db.subscription.findUnique({
    where: { userId: session.user.id },
    select: { status: true },
  });

  if (existing?.status === "ACTIVE") redirect("/dashboard");

  return (
    <div className="min-h-screen bg-[#f0f5f9] flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-[#0f2d4a] px-6 py-5">
          <p className="text-[#9ec4de] text-xs font-semibold uppercase tracking-wider mb-1">{plan.label}</p>
          <p className="text-white text-3xl font-extrabold">{plan.price}</p>
          <p className="text-[#9ec4de] text-sm mt-1">{plan.detail}</p>
        </div>
        <div className="px-6 py-6 space-y-4">
          <p className="text-zinc-500 text-sm text-center">
            Logado como <span className="font-semibold text-zinc-700">{session.user.email}</span>
          </p>
          <CheckoutButton productId={product.id} />
          <p className="text-center text-xs text-zinc-400">
            Pagamento seguro via Mercado Pago · Acesso imediato
          </p>
        </div>
      </div>
    </div>
  );
}
