import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * Confere se o usuário atual é ADMIN lendo a role do BANCO (não do JWT).
 * Importante com sessões longas (30 dias): o JWT guarda a role do login e não
 * reflete um rebaixamento até o próximo login. Para ações sensíveis, checamos
 * a fonte da verdade (o banco).
 */
export async function isAdminRequest(): Promise<boolean> {
  const session = await auth();
  const id = (session?.user as { id?: string })?.id;
  if (!id) return false;
  const user = await db.user.findUnique({ where: { id }, select: { role: true } });
  return user?.role === "ADMIN";
}
