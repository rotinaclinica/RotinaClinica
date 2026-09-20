import crypto from "node:crypto";
import { db } from "@/lib/db";
import { decryptCpf } from "./cpf";

const ALGO = "aes-256-gcm";
const VERSION = "v1";

function getKey(): Buffer {
  const raw = process.env.CPF_ENCRYPTION_KEY;
  if (!raw) throw new Error("CPF_ENCRYPTION_KEY não configurada");
  const key = Buffer.from(raw, "base64");
  if (key.length !== 32) throw new Error("CPF_ENCRYPTION_KEY deve ter 32 bytes em base64");
  return key;
}

export type BuyerSnapshot = {
  name: string | null;
  email: string | null;
  cpf: string | null;
  cep: string | null;
  phone: string | null;
  capturedAt: string;
};

export function encryptBuyerSnapshot(data: BuyerSnapshot): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, getKey(), iv);
  const enc = Buffer.concat([cipher.update(JSON.stringify(data), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `enc:${VERSION}:${iv.toString("base64")}:${tag.toString("base64")}:${enc.toString("base64")}`;
}

/**
 * Lê o User e retorna o snapshot fiscal criptografado (para gravar em
 * Order.buyerSnapshot). Retorna null se o User não existir.
 */
export async function captureBuyerSnapshot(userId: string): Promise<string | null> {
  const u = await db.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true, cpf: true, cep: true, phone: true },
  });
  if (!u) return null;
  return encryptBuyerSnapshot({
    name: u.name,
    email: u.email,
    cpf: decryptCpf(u.cpf),
    cep: u.cep,
    phone: u.phone,
    capturedAt: new Date().toISOString(),
  });
}

export function decryptBuyerSnapshot(stored: string | null | undefined): BuyerSnapshot | null {
  if (!stored) return null;
  const parts = stored.split(":");
  if (parts.length !== 5 || parts[0] !== "enc" || parts[1] !== VERSION) return null;
  try {
    const iv = Buffer.from(parts[2], "base64");
    const tag = Buffer.from(parts[3], "base64");
    const enc = Buffer.from(parts[4], "base64");
    const decipher = crypto.createDecipheriv(ALGO, getKey(), iv);
    decipher.setAuthTag(tag);
    const dec = Buffer.concat([decipher.update(enc), decipher.final()]);
    return JSON.parse(dec.toString("utf8")) as BuyerSnapshot;
  } catch {
    return null;
  }
}
