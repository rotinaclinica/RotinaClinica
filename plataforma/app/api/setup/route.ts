import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  // Bloqueia se já existe algum ADMIN
  const existing = await db.user.findFirst({ where: { role: "ADMIN" } });
  if (existing) {
    return NextResponse.json({ error: "Setup já concluído." }, { status: 403 });
  }

  const { email, password, name } = await req.json();

  if (!email || !password || password.length < 8) {
    return NextResponse.json({ error: "Dados inválidos. Senha mínima de 8 caracteres." }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await db.user.create({
    data: {
      email,
      name: name || "Admin",
      passwordHash,
      role: "ADMIN",
    },
  });

  return NextResponse.json({ ok: true });
}

export async function GET() {
  const existing = await db.user.findFirst({ where: { role: "ADMIN" } });
  return NextResponse.json({ available: !existing });
}
