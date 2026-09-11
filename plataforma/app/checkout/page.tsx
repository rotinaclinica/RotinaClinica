import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import CheckoutButton from "./CheckoutButton";

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
    <div className="min-h-screen relative flex items-center justify-center px-4">
      <img src="/images/turma.jpg" alt="" aria-hidden="true" className="fixed inset-0 w-full h-full object-cover -z-10" />
      <div className="fixed inset-0 bg-[#0f2d4a]/75 -z-10" />
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl border border-zinc-200 overflow-hidden my-8">
        <div className="bg-[#0f2d4a] px-6 py-6">
          <p className="text-[#9ec4de] text-xs font-semibold uppercase tracking-wider mb-1">{plan.label}</p>
          <p className="text-white text-3xl font-extrabold">{plan.price}</p>
          <p className="text-[#9ec4de] text-sm mt-1">{plan.detail}</p>
          <ul className="mt-4 space-y-1.5">
            {[
              "Modelos de evolução e de condutas prontas",
              "Curso Destravando o Plantão",
              "Discussão de casos clínicos novos toda semana",
              "Calculadoras e escores clínicos",
              "Acesso imediato em qualquer dispositivo",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-white/90">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#32bcad" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="px-6 py-6 space-y-4">
          <p className="text-zinc-700 text-xs text-center">
            Logado como <span className="font-semibold text-zinc-900">{session.user.email}</span>
          </p>
          <CheckoutButton productId={product.id} userCpf={userProfile?.cpf} userPhone={userProfile?.phone} />
          <div className="text-center">
            <Link href="/assinatura" className="text-xs text-zinc-800 hover:text-zinc-600 hover:underline transition-colors">
              ← Ver outros planos
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
