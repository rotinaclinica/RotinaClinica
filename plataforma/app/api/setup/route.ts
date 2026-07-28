import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export async function GET() {
  const admin = await db.user.findFirst({ where: { role: "ADMIN" } });
  const tester = await db.user.findFirst({ where: { role: "TESTER" } });
  return NextResponse.json({ adminExists: !!admin, testerExists: !!tester });
}

export async function POST(req: NextRequest) {
  const { type, email, password, name } = await req.json();

  if (!email || !password || password.length < 8) {
    return NextResponse.json({ error: "Dados inválidos. Senha mínima de 8 caracteres." }, { status: 400 });
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
}
