import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { canAccessPaidContent } from "@/lib/subscription";

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
