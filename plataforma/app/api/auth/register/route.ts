import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { checkRateLimit } from "@/lib/rate-limit";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().min(10),
  cpf: z.string().length(11),
  momentoProfissional: z.string().optional(),
  ambienteTrabalho: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!checkRateLimit("register", ip, 5, 10 * 60 * 1000)) {
    return NextResponse.json({ error: "Muitas tentativas. Tente novamente em alguns minutos." }, { status: 429 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const { name, password, phone, cpf, momentoProfissional, ambienteTrabalho } = parsed.data;
  const email = parsed.data.email.toLowerCase();

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "E-mail já cadastrado" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await db.user.create({ data: { name, email, passwordHash, phone, cpf, momentoProfissional, ambienteTrabalho } });

  return NextResponse.json({ ok: true }, { status: 201 });
}
