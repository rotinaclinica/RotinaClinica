import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { hasBlockingSubscription } from "@/lib/subscription";
import { redirect } from "next/navigation";
import Link from "next/link";
import CheckoutButton from "./CheckoutButton";
import PageTracker from "@/app/dashboard/_components/PageTracker";
import QuickSignup from "./QuickSignup";
import AnonCheckoutTracker from "./AnonCheckoutTracker";
import OfferVisitTracker from "@/app/_components/OfferVisitTracker";
import OfferCountdown from "./OfferCountdown";
import { ofertaPorSlug } from "@/lib/promocoes";

const brl = (cents: number) =>
  (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const PLANS = {
  anual:  { slug: "assinatura-anual",  label: "Plano Anual",   price: "R$ 33,33/mês",  detail: "R$ 400/ano · acesso por 12 meses" },
  mensal: { slug: "assinatura-mensal", label: "Plano Mensal",  price: "R$ 39,90/mês", detail: "Cancele quando quiser" },
} as const;

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ plano?: string; oferta?: string }>;
}) {
  const { plano, oferta: ofertaParam } = await searchParams;
  const plan = PLANS[plano as keyof typeof PLANS];

  if (!plan) redirect("/assinatura");

  // Visitante sem conta não é mais mandado ao login: cria a conta aqui mesmo
  // (nome, e-mail e senha) e a página recarrega já logada, com o pagamento.
  const session = await auth();
  const userId = session?.user?.id ?? null;

  const [product, userProfile, existing] = await Promise.all([
    db.product.findUnique({ where: { slug: plan.slug, active: true }, select: { id: true, priceCents: true } }),
    userId ? db.user.findUnique({ where: { id: userId }, select: { cpf: true, phone: true, cep: true } }) : null,
    userId ? db.subscription.findUnique({ where: { userId }, select: { status: true, asaasSubscriptionId: true, currentPeriodEnd: true } }) : null,
  ]);

  if (!product) redirect("/assinatura");

  // Oferta por link (?oferta=blackweek): só vale com o cupom ativo, no prazo e
  // válido para este produto. O desconto de verdade é recalculado no servidor.
  const oferta = ofertaPorSlug(ofertaParam);
  const coupon = oferta
    ? await db.coupon.findUnique({
        where: { code: oferta.couponCode },
        select: { active: true, expiresAt: true, discountType: true, discountValue: true, maxUses: true, usedCount: true, products: { select: { id: true } } },
      })
    : null;
  const promo =
    oferta && coupon && coupon.active &&
    (!coupon.expiresAt || coupon.expiresAt > new Date()) &&
    (!coupon.maxUses || coupon.usedCount < coupon.maxUses) &&
    (coupon.products.length === 0 || coupon.products.some((p) => p.id === product.id))
      ? { oferta, coupon }
      : null;
  const descontoDe = (cents: number) =>
    !promo ? 0 : Math.min(cents, promo.coupon.discountType === "PERCENT" ? Math.round((cents * promo.coupon.discountValue) / 100) : promo.coupon.discountValue);
  const finalCents = product.priceCents - descontoDe(product.priceCents);
  const ofQs = promo ? `&oferta=${promo.oferta.slug}` : "";
  const pct = promo?.coupon.discountType === "PERCENT" ? promo.coupon.discountValue : null;
  if (userId) {
    // Recorrente no cartão já renova sozinho; avulso pode renovar a qualquer momento
    if (existing?.status === "ACTIVE" && existing.asaasSubscriptionId) redirect("/dashboard");
    if (await hasBlockingSubscription(userId, plano === "anual" ? "ANNUAL" : "MONTHLY")) redirect("/dashboard");
  }

  const isMensal = plano === "mensal";
  const ciclos = promo?.oferta.ciclosMensal ?? 0;
  const head = !promo
    ? { label: plan.label, price: plan.price, detail: plan.detail, de: null as string | null }
    : isMensal
      ? { label: "Plano Mensal · Black Week", price: `${brl(finalCents)}/mês`, de: `${brl(product.priceCents)}/mês`,
          detail: `${pct ? `${pct}% off` : "Desconto"} nas ${ciclos} primeiras mensalidades, enquanto a assinatura seguir ativa` }
      : { label: "Plano Anual · Black Week", price: `12x de ${brl(finalCents / 12)}`, de: `${brl(product.priceCents)} no ano`,
          detail: `${brl(finalCents)} no ano · Pix ou cartão em até 12x` };
  const anualFinal = 40000 - descontoDe(40000);
  const mensalFinal = 3990 - descontoDe(3990);

  // Renovação antecipada de quem paga avulso: o novo período soma ao fim do atual
  // (mesma regra dos webhooks), então mostramos as duas datas para evitar compra
  // duplicada por engano.
  const renewal =
    existing?.status === "ACTIVE" && existing.currentPeriodEnd > new Date()
      ? (() => {
          const novoFim = new Date(existing.currentPeriodEnd);
          novoFim.setDate(novoFim.getDate() + (isMensal ? 30 : 365));
          const fmt = (d: Date) => d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "America/Sao_Paulo" });
          return { atual: fmt(existing.currentPeriodEnd), novo: fmt(novoFim) };
        })()
      : null;

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
      {userId ? <PageTracker /> : <AnonCheckoutTracker />}
      {promo && <OfferVisitTracker slug={promo.oferta.slug} step="checkout" />}
      {/* No celular a foto quase não aparece e só pesa: fundo liso; foto a partir do tablet */}
      <img src="/images/turma.jpg" alt="" aria-hidden="true" className="hidden sm:block fixed inset-0 w-full h-full object-cover -z-10" />
      <div className={`fixed inset-0 -z-10 ${promo ? "bg-[#111111] sm:bg-[#111111]/85" : "bg-[#0f2d4a] sm:bg-[#0f2d4a]/75"}`} />

      {/* Card principal de checkout */}
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl border border-zinc-200 overflow-hidden">
        {/* Oferta: mesma identidade preta/amarela do anúncio e da página, com prazo */}
        {promo && (
          <div className="bg-[#ffd60a] px-4 py-2 flex items-center justify-between gap-2 text-[#111111]">
            <span className="text-[11px] font-extrabold uppercase tracking-widest">Black Week · {pct ? `${pct}% off` : "Oferta"}</span>
            <span className="text-[11px] font-bold tabular-nums">
              {promo.coupon.expiresAt
                ? <OfferCountdown endsAt={promo.coupon.expiresAt.toISOString()} fallback="Até 30/11 às 23h59" />
                : "Por tempo limitado"}
            </span>
          </div>
        )}
        <div className={`${promo ? "bg-[#111111]" : "bg-[#0f2d4a]"} px-6 py-5`}>
          <p className={`${promo ? "text-[#ffd60a]" : "text-[#9ec4de]"} text-xs font-semibold uppercase tracking-wider mb-1`}>{head.label}</p>
          {head.de && <p className="text-white/60 text-sm line-through">{head.de}</p>}
          <p className={`${promo ? "text-[#ffd60a]" : "text-white"} text-3xl font-extrabold`}>{head.price}</p>
          <p className={`${promo ? "text-white/75" : "text-[#9ec4de]"} text-sm mt-1`}>{head.detail}</p>
          {/* Quem chegou aqui já decidiu: 3 pontos-chave e o resto recolhido, para o pagamento subir */}
          <ul className="mt-3 space-y-1.5">
            {["+250 condutas com dose e prescrição", "Modelos de evolução prontos", "Curso Destravando o Plantão"].map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-white/90">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={promo ? "#ffd60a" : "#32bcad"} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                {item}
              </li>
            ))}
          </ul>
          <details className="group mt-3">
            <summary className="flex items-center gap-1.5 text-xs font-semibold text-white/80 cursor-pointer list-none select-none hover:text-white">
              Ver tudo o que está incluído
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-open:rotate-180">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </summary>
            <ul className="mt-3 space-y-1.5">
              {[
                "Calculadoras e escores clínicos",
                "E-books e materiais em PDF para download",
                "Casos clínicos novos toda semana",
                "Acesso imediato em qualquer dispositivo",
                "E muito mais — plataforma em constante atualização",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-white/90">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={promo ? "#ffd60a" : "#32bcad"} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-4 bg-white/10 rounded-xl px-4 py-3 space-y-1.5">
              <p className={`${promo ? "text-[#ffd60a]" : "text-[#32bcad]"} text-[10px] font-bold uppercase tracking-widest mb-2`}>Tudo isso está incluído</p>
              {[
                { title: "Manual Prático de Prescrições: Da UBS à Emergência", price: "R$ 97" },
                { title: "Sedação, Intubação e Ventilação Mecânica", price: "R$ 47" },
                { title: "Destravando o Plantão (Curso Online)", price: "R$ 397" },
              ].map((p) => (
                <div key={p.title} className="flex items-center justify-between gap-2 text-white/90 text-xs">
                  <span>{p.title}</span>
                  <span className="font-semibold whitespace-nowrap">{p.price}</span>
                </div>
              ))}
              <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-white/20">
                <span className="text-xs text-white/90">Separado custaria</span>
                <span className="text-xs font-bold text-white/90 line-through">R$ 541</span>
              </div>
            </div>
          </details>
        </div>
        <div className="px-6 py-6 space-y-4">
          {userId && (
            <p className="text-zinc-700 text-xs text-center">
              Logado como <span className="font-semibold text-zinc-900">{session?.user?.email}</span>
            </p>
          )}
          {renewal && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 leading-snug">
              Você já tem acesso até <strong>{renewal.atual}</strong>. Este pagamento estende seu acesso até{" "}
              <strong>{renewal.novo}</strong>, sem perder nenhum dia.
              <span className="block mt-1 text-xs text-emerald-800">
                No cartão, a renovação passa a ser automática e você não precisa mais se preocupar com o vencimento.
              </span>
            </div>
          )}
          {/* Troca de plano no próprio checkout: o anual fica sempre à vista */}
          <div className="grid grid-cols-2 gap-2">
            {[
              promo
                ? { id: "anual", nome: "Anual", valor: `${brl(anualFinal / 12)}/mês`, nota: `${brl(anualFinal)} no ano · Pix ou até 12x`, selo: pct ? `${pct}% off` : "Oferta" }
                : { id: "anual", nome: "Anual", valor: "R$ 33,33/mês", nota: "Economize R$ 79 · até 12x", selo: "Melhor valor" },
              promo
                ? { id: "mensal", nome: "Mensal", valor: `${brl(mensalFinal)}/mês`, nota: `Nos ${ciclos} primeiros meses · cartão`, selo: pct ? `${pct}% off` : "Oferta" }
                : { id: "mensal", nome: "Mensal", valor: "R$ 39,90/mês", nota: "Renova no cartão", selo: null },
            ].map((p) => {
              const ativo = p.id === plano;
              return (
                <Link
                  key={p.id}
                  href={`/checkout?plano=${p.id}${ofQs}`}
                  aria-current={ativo ? "true" : undefined}
                  className={`relative block rounded-xl border-2 px-3 pb-3 pt-4 transition-colors ${
                    ativo ? "border-[#0d9488] bg-[#f0fdfa]" : "border-zinc-300 bg-white hover:border-[#0f2d4a]/40"
                  }`}
                >
                  {p.selo && (
                    <span className={`absolute -top-2 left-3 rounded-full ${promo ? "bg-[#ffd60a] text-[#111111]" : "bg-[#3db8d4] text-[#0f2d4a]"} px-2 py-0.5 text-[10px] font-bold`}>
                      {p.selo}
                    </span>
                  )}
                  <span className="block text-xs font-semibold text-zinc-700">{p.nome}</span>
                  <span className="block text-sm font-extrabold text-[#0f2d4a]">{p.valor}</span>
                  <span className="block text-[11px] leading-tight text-zinc-700 mt-0.5">{p.nota}</span>
                </Link>
              );
            })}
          </div>
          {/* Quem está no mensal: mostrar quanto economiza no anual (e que o Pix fica lá) */}
          {isMensal && (
            <Link
              href={`/checkout?plano=anual${ofQs}`}
              className={`block rounded-xl px-4 py-2.5 text-xs leading-snug transition-colors ${
                promo ? "bg-[#fff8d6] text-[#111111] hover:bg-[#fff1b0]" : "bg-[#f0fdfa] text-[#0f2d4a] hover:bg-[#e0f7f3]"
              }`}
            >
              💡 No <strong>anual</strong> você paga <strong>{brl(anualFinal / 12)}/mês</strong> e economiza{" "}
              <strong>{brl(mensalFinal * 12 - anualFinal)}</strong> no ano.{" "}
              <span className="font-bold underline underline-offset-2">Trocar para o anual</span>
            </Link>
          )}
          {userId ? (
            <CheckoutButton
              key={plano}
              productId={product.id}
              userCpf={userProfile?.cpf}
              userPhone={userProfile?.phone}
              userHasCep={!!userProfile?.cep}
              plano={isMensal ? "mensal" : "anual"}
              priceCents={finalCents}
              couponCode={promo?.oferta.couponCode}
              cardOnly={isMensal}
              mensalNote={
                promo && isMensal
                  ? `Cobrança de ${brl(finalCents)} por mês nos ${ciclos} primeiros meses, renovada automaticamente; depois, ${brl(product.priceCents)} por mês.`
                  : undefined
              }
            />
          ) : (
            <QuickSignup plano={isMensal ? "mensal" : "anual"} oferta={promo?.oferta.slug} />
          )}
          <div className="text-center">
            <Link href="/assinatura" className="text-xs text-zinc-700 hover:text-zinc-900 hover:underline transition-colors">
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
            // Renovação não tem garantia de 7 dias pelo site (só a primeira assinatura)
            ...(renewal ? [] : [{ icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z", text: "Garantia de 7 dias — reembolso total sem perguntas" }]),
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
