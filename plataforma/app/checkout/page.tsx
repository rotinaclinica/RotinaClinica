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

  const isMensal = plano === "mensal";

  const faq = [
    { q: "O acesso é imediato após o pagamento?", a: "Sim. Assim que o pagamento for confirmado, você já pode acessar toda a plataforma." },
    { q: "Funciona no celular?", a: "Sim. A plataforma funciona em qualquer dispositivo — celular, tablet ou computador." },
    ...(isMensal ? [{ q: "Posso cancelar quando quiser?", a: "Sim. Você pode cancelar sua assinatura a qualquer momento diretamente pela plataforma, sem burocracia." }] : []),
    { q: "Os e-books funcionam offline?", a: "Sim. Os e-books e materiais em PDF podem ser baixados e consultados sem conexão com a internet." },
    { q: "Para quem é a plataforma?", a: "Para médicos e estudantes de medicina que desejam evoluir na sua prática clínica através de conteúdos baseados em evidências e desenvolvidos por especialistas em Clínica Médica." },
    { q: "Novos conteúdos são adicionados?", a: "Sim. A plataforma está em constante evolução — novas prescrições, calculadoras, aulas e materiais são adicionados continuamente." },
  ];

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-start px-4 py-8">
      <img src="/images/turma.jpg" alt="" aria-hidden="true" className="fixed inset-0 w-full h-full object-cover -z-10" />
      <div className="fixed inset-0 bg-[#0f2d4a]/75 -z-10" />

      {/* Card principal de checkout */}
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl border border-zinc-200 overflow-hidden">
        <div className="bg-[#0f2d4a] px-6 py-6">
          <p className="text-[#9ec4de] text-xs font-semibold uppercase tracking-wider mb-1">{plan.label}</p>
          <p className="text-white text-3xl font-extrabold">{plan.price}</p>
          <p className="text-[#9ec4de] text-sm mt-1">{plan.detail}</p>
          <ul className="mt-4 space-y-1.5">
            {[
              "Prescrições e condutas clínicas prontas",
              "Curso Destravando o Plantão",
              "Calculadoras e escores clínicos",
              "E-books e materiais em PDF para download",
              "Casos clínicos novos toda semana",
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
          <div className="mt-5 border-t border-white/10 pt-4 space-y-1.5">
            {[
              { title: "Manual Prático de Prescrições: Da UBS à Emergência", price: "R$ 97" },
              { title: "Sedação, Intubação e Ventilação Mecânica", price: "R$ 47" },
              { title: "Destravando o Plantão (Curso Online)", price: "R$ 397" },
            ].map((p) => (
              <div key={p.title} className="flex items-center justify-between gap-2 text-white/90 text-xs">
                <span>{p.title}</span>
                <span className="font-semibold">{p.price}</span>
              </div>
            ))}
            <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-white/10">
              <span className="text-xs text-white/70">Separado custaria</span>
              <span className="text-xs font-bold text-white/70 line-through">R$ 541</span>
            </div>
          </div>
        </div>
        <div className="px-6 py-6 space-y-4">
          <p className="text-zinc-700 text-xs text-center">
            Logado como <span className="font-semibold text-zinc-900">{session.user.email}</span>
          </p>
          <CheckoutButton productId={product.id} userCpf={userProfile?.cpf} userPhone={userProfile?.phone} />
          <div className="text-center">
            <Link href="/assinatura" className="text-xs text-zinc-500 hover:text-zinc-700 hover:underline transition-colors">
              ← Ver outros planos
            </Link>
          </div>
        </div>
      </div>

      {/* Bloco de confiança rápida */}
      <div className="relative w-full max-w-sm mt-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 px-5 py-4">
        <ul className="space-y-2">
          {[
            { icon: "M13 2L3 14h9l-1 8 10-12h-9l1-8z", text: "Acesso imediato após confirmação do pagamento" },
            ...(isMensal ? [{ icon: "M18 6L6 18M6 6l12 12", text: "Cancele quando quiser, direto pela plataforma" }] : []),
            { icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z", text: "Garantia de 7 dias — reembolso total sem perguntas" },
            { icon: "M4 4h16v16H4z M9 9h6M9 13h6", text: "Plataforma em constante atualização com novos conteúdos" },
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-white">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#32bcad" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5">
                <path d={item.icon}/>
              </svg>
              {item.text}
            </li>
          ))}
        </ul>
      </div>

      {/* FAQ */}
      <div className="relative w-full max-w-sm mt-4 bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden mb-2">
        <div className="px-6 py-5">
          <h2 className="text-sm font-bold text-[#0f2d4a] uppercase tracking-wider mb-4">Dúvidas frequentes</h2>
          <div className="space-y-0 divide-y divide-zinc-100">
            {faq.map(({ q, a }) => (
              <details key={q} className="group py-3 cursor-pointer">
                <summary className="flex items-center justify-between gap-3 text-sm font-semibold text-zinc-800 list-none select-none">
                  {q}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 text-zinc-400 transition-transform group-open:rotate-180">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </summary>
                <p className="mt-2 text-xs text-zinc-800 leading-relaxed">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
