import crypto from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "admin_pin";
const TTL_MS = 4 * 60 * 60 * 1000; // 4 horas

function getSecret(): string {
  const s = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  if (!s) throw new Error("AUTH_SECRET não configurado");
  return s;
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", getSecret()).update(payload).digest("hex");
}

/**
 * Verifica o cookie assinado. Retorna userId se válido e não expirado.
 */
export async function readAdminPinCookie(): Promise<{ userId: string; expiresAt: number } | null> {
  const jar = await cookies();
  const raw = jar.get(COOKIE_NAME)?.value;
  if (!raw) return null;
  const parts = raw.split(":");
  if (parts.length !== 3) return null;
  const [userId, expiresAtStr, sig] = parts;
  const expiresAt = Number(expiresAtStr);
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return null;
  const expected = sign(`${userId}:${expiresAtStr}`);
  const a = Buffer.from(sig, "hex");
  const b = Buffer.from(expected, "hex");
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  return { userId, expiresAt };
}

export async function writeAdminPinCookie(userId: string): Promise<void> {
  const expiresAt = Date.now() + TTL_MS;
  const sig = sign(`${userId}:${expiresAt}`);
  const jar = await cookies();
  jar.set({
    name: COOKIE_NAME,
    value: `${userId}:${expiresAt}:${sig}`,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/admin",
    maxAge: Math.floor(TTL_MS / 1000),
  });
}

export async function clearAdminPinCookie(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}
