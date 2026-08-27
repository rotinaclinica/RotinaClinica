import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { checkRateLimit } from "@/lib/rate-limit";

const SECRET = process.env.AUTH_SECRET;

function makeToken(email: string, exp: number): string {
  if (!SECRET) throw new Error("AUTH_SECRET not set");
  return createHmac("sha256", SECRET).update(`${email}|${exp}`).digest("hex");
}

export async function POST(req: NextRequest) {
  if (!SECRET) {
    return NextResponse.json({ error: "Configuração inválida." }, { status: 500 });
  }
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!checkRateLimit("redefinir-senha", ip, 5, 15 * 60 * 1000)) {
    return NextResponse.json({ error: "Muitas tentativas. Tente novamente em alguns minutos." }, { status: 429 });
  }

  const { email, exp, token, newPassword } = await req.json();

  if (!email || !exp || !token || !newPassword) {
    return NextResponse.json({ error: "Dados incompletos." }, { status: 400 });
  }
  if (newPassword.length < 8) {
    return NextResponse.json({ error: "Senha mínima de 8 caracteres." }, { status: 400 });
  }

  const expNum = Number(exp);
  if (Math.floor(Date.now() / 1000) > expNum) {
    return NextResponse.json({ error: "Link expirado. Solicite um novo." }, { status: 400 });
  }

  const expected = makeToken(email.toLowerCase(), expNum);
  if (token !== expected) {
    return NextResponse.json({ error: "Link inválido." }, { status: 400 });
  }

  const resetRecord = await db.passwordResetToken.findUnique({ where: { token } });
  if (!resetRecord || resetRecord.usedAt) {
    return NextResponse.json({ error: "Link inválido ou já utilizado." }, { status: 400 });
  }

  const user = await db.user.findUnique({ where: { email: email.toLowerCase() }, select: { id: true } });
  if (!user) {
    return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await db.$transaction([
    db.user.update({ where: { id: user.id }, data: { passwordHash } }),
    db.passwordResetToken.update({ where: { token }, data: { usedAt: new Date() } }),
  ]);

  return NextResponse.json({ ok: true });
}
