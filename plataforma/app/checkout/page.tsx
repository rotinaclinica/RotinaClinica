import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import CheckoutButton from "./CheckoutButton";
import PixButton from "./PixButton";

const PLANS = {
  anual:  { slug: "assinatura-anual",  label: "Plano Anual",   price: "R$ 33,30/mês",  detail: "R$ 400/ano · acesso por 12 meses" },
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

  const [product, userProfile, existing] = await Promise.all([
    db.product.findUnique({ where: { slug: plan.slug, active: true }, select: { id: true } }),
    db.user.findUnique({ where: { id: session.user.id }, select: { cpf: true, phone: true } }),
    db.subscription.findUnique({ where: { userId: session.user.id }, select: { status: true } }),
  ]);

  if (!product) redirect("/assinatura");
  if (existing?.status === "ACTIVE") redirect("/dashboard");

  return (
    <div className="min-h-screen bg-[#c8d8e8] flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-zinc-200 overflow-hidden">
        <div className="bg-[#0f2d4a] px-6 py-5">
          <p className="text-[#9ec4de] text-xs font-semibold uppercase tracking-wider mb-1">{plan.label}</p>
          <p className="text-white text-3xl font-extrabold">{plan.price}</p>
          <p className="text-[#9ec4de] text-sm mt-1">{plan.detail}</p>
        </div>
        <div className="px-6 py-6 space-y-4">
          <p className="text-zinc-500 text-sm text-center">
            Logado como <span className="font-semibold text-zinc-700">{session.user.email}</span>
          </p>
          <PixButton productId={product.id} />
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-zinc-100" />
            <span className="text-xs text-zinc-500">ou pague com cartão de crédito</span>
            <div className="flex-1 h-px bg-zinc-100" />
          </div>
          <CheckoutButton productId={product.id} userCpf={userProfile?.cpf} userPhone={userProfile?.phone} />
          <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-600 font-medium">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
            Pagamento seguro · Acesso imediato após confirmação
          </div>
          <div className="text-center">
            <Link href="/assinatura" className="text-xs text-zinc-500 hover:text-zinc-700 hover:underline transition-colors">
              ← Ver outros planos
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
