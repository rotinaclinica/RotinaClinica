import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  cpf: z.string().regex(/^\d{11}$/, "CPF deve conter 11 dígitos"),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "CPF inválido" }, { status: 400 });
  }

  await db.user.update({
    where: { id: session.user.id },
    data: { cpf: parsed.data.cpf },
  });

  return NextResponse.json({ ok: true });
}
