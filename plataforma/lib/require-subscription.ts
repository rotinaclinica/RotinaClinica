import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { canAccessPaidContent, canAccessTrialContent } from "@/lib/subscription";

/**
 * Chame no topo de qualquer page.tsx de conteúdo pago.
 * Roda a cada navegação server-side (diferente do layout, que é cacheado).
 */
export async function requireSubscription() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (!(await canAccessPaidContent(session.user.id))) redirect("/assinatura?motivo=acesso");
  return session;
}

/** Para as seções liberadas no teste grátis (Condutas, Evoluções, Calculadoras). */
export async function requireTrialOrSubscription() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (!(await canAccessTrialContent(session.user.id))) redirect("/assinatura?motivo=acesso");
  return session;
}
