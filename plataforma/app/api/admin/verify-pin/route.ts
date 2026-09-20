import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { checkRateLimit } from "@/lib/rate-limit";
import { writeAdminPinCookie } from "@/lib/admin-pin";
import { isAdminRequest } from "@/lib/require-admin";

const schema = z.object({
  pin: z.string().regex(/^\d{6}$/, "PIN deve conter 6 dígitos"),
});

export async function POST(req: NextRequest) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  if (!checkRateLimit(`admin-pin:${session.user.id}`, session.user.id, 5, 15 * 60 * 1000)) {
    return NextResponse.json({ error: "Muitas tentativas. Aguarde 15 minutos." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "PIN inválido." }, { status: 400 });
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { adminPinHash: true },
  });

  if (!user?.adminPinHash) {
    return NextResponse.json(
      { error: "PIN admin não configurado. Contate o suporte técnico." },
      { status: 400 }
    );
  }

  const ok = await bcrypt.compare(parsed.data.pin, user.adminPinHash);
  if (!ok) {
    return NextResponse.json({ error: "PIN incorreto." }, { status: 401 });
  }

  await writeAdminPinCookie(session.user.id);
  return NextResponse.json({ ok: true });
}
