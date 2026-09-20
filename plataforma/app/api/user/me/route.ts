import { NextRequest, NextResponse } from "next/server";
import { auth, signOut } from "@/lib/auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { anonymizeUser } from "@/lib/anonymize";
import { checkRateLimit } from "@/lib/rate-limit";

const schema = z.object({
  password: z.string().min(1),
  reason: z.string().max(500).optional(),
});

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  // Rate limit — 3 tentativas por hora por usuário
  if (!checkRateLimit(`anonymize:${session.user.id}`, session.user.id, 3, 60 * 60 * 1000)) {
    return NextResponse.json({ error: "Muitas tentativas. Tente novamente em 1 hora." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Senha obrigatória." }, { status: 400 });
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { passwordHash: true, anonymizedAt: true },
  });

  if (!user) return NextResponse.json({ error: "Conta não encontrada." }, { status: 404 });
  if (user.anonymizedAt) return NextResponse.json({ error: "Conta já foi apagada." }, { status: 400 });
  if (!user.passwordHash) return NextResponse.json({ error: "Confirmação por senha indisponível para esta conta." }, { status: 400 });

  const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!ok) return NextResponse.json({ error: "Senha incorreta." }, { status: 401 });

  const result = await anonymizeUser({
    userId: session.user.id,
    triggeredBy: "self",
    reason: parsed.data.reason,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  // Sessão fica órfã (deletamos Session no service); força logout do lado do cliente.
  await signOut({ redirect: false }).catch(() => {});

  return NextResponse.json({ ok: true, hadSubscription: result.hadSubscription });
}
