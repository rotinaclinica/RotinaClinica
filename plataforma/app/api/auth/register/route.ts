import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { checkRateLimit } from "@/lib/rate-limit";
import { logError } from "@/lib/error-logger";
import { Resend } from "resend";
import { dripHtml0 } from "@/lib/emails/drip";

const resend = new Resend(process.env.RESEND_API_KEY ?? "re_placeholder");
const FROM = "Rotina Clínica <contato@rotinaclinica.com>";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().min(10),
  cpf: z.string().length(11),
  cep: z.string().length(8).optional(),
  momentoProfissional: z.string().optional(),
  ambienteTrabalho: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!checkRateLimit("register", ip, 10, 10 * 60 * 1000)) {
    return NextResponse.json({ error: "Muitas tentativas. Tente novamente em alguns minutos." }, { status: 429 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    const fieldMessages: Record<string, string> = {
      name: "Nome deve ter pelo menos 2 caracteres.",
      email: "E-mail inválido.",
      password: "A senha deve ter pelo menos 8 caracteres.",
      phone: "Telefone inválido. Digite DDD + número.",
      cpf: "CPF inválido. Digite os 11 dígitos.",
    };
    const msg = fieldMessages[first?.path?.[0] as string] ?? "Dados inválidos.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const { name, password, phone, cpf, cep, momentoProfissional, ambienteTrabalho } = parsed.data;
  const email = parsed.data.email.toLowerCase();

  try {
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "E-mail já cadastrado" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await db.user.create({ data: { name, email, passwordHash, phone, cpf, cep, momentoProfissional, ambienteTrabalho } });

    // Drip email 0 — boas-vindas (fire and forget)
    resend.emails.send({
      from: FROM,
      to: email,
      subject: "Bem-vindo à plataforma do Rotina Clínica!",
      html: dripHtml0(name),
    }).then(() => db.emailDrip.create({ data: { userId: user.id, step: 0 } })).catch(() => {});

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    await logError({ route: "/api/auth/register", method: "POST", error: err });
    return NextResponse.json({ error: "Erro ao criar conta." }, { status: 500 });
  }
}
