import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export async function GET() {
  return NextResponse.json({ ok: true });
}

export async function POST(req: NextRequest) {
  const setupSecret = process.env.SETUP_SECRET;
  if (!setupSecret) {
    return NextResponse.json({ error: "Setup desabilitado." }, { status: 403 });
  }
  const authHeader = req.headers.get("x-setup-secret");
  if (authHeader !== setupSecret) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const { type, email, password, name } = await req.json();

    if (!email || !password || password.length < 8) {
      return NextResponse.json({ error: "Dados inválidos. Senha mínima de 8 caracteres." }, { status: 400 });
    }

    // Verificar se o e-mail já está em uso
    const emailInUse = await db.user.findUnique({ where: { email } });
    if (emailInUse) {
      return NextResponse.json({ error: "Este e-mail já está cadastrado. Use outro e-mail." }, { status: 409 });
    }

    if (type === "tester") {
      const admin = await db.user.findFirst({ where: { role: "ADMIN" } });
      if (!admin) {
        return NextResponse.json({ error: "Crie o admin primeiro." }, { status: 400 });
      }
      const existing = await db.user.findFirst({ where: { role: "TESTER" } });
      if (existing) {
        return NextResponse.json({ error: "Conta de testes já criada." }, { status: 403 });
      }
      const passwordHash = await bcrypt.hash(password, 12);
      await db.user.create({ data: { email, name: name || "Tester", passwordHash, role: "TESTER" } });
      return NextResponse.json({ ok: true });
    }

    // Padrão: admin
    const existing = await db.user.findFirst({ where: { role: "ADMIN" } });
    if (existing) {
      return NextResponse.json({ error: "Setup já concluído." }, { status: 403 });
    }
    const passwordHash = await bcrypt.hash(password, 12);
    await db.user.create({ data: { email, name: name || "Admin", passwordHash, role: "ADMIN" } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erro interno. Tente novamente." }, { status: 500 });
  }
}
