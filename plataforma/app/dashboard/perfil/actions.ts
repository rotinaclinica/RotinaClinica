"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

/** Liga/desliga a exibição do usuário no ranking do Desafio Diário. */
export async function definirParticipacaoRanking(participa: boolean): Promise<boolean> {
  const session = await auth();
  if (!session?.user?.id) return false;
  await db.user.update({
    where: { id: session.user.id },
    data: { rankingOptOut: !participa },
  });
  revalidatePath("/dashboard/quiz");
  return true;
}
