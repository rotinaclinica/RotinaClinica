import crypto from "node:crypto";

const ALGO = "aes-256-gcm";
const VERSION = "v1";

function getKey(): Buffer {
  const raw = process.env.CPF_ENCRYPTION_KEY;
  if (!raw) throw new Error("CPF_ENCRYPTION_KEY não configurada");
  const key = Buffer.from(raw, "base64");
  if (key.length !== 32) throw new Error("CPF_ENCRYPTION_KEY deve ter 32 bytes em base64");
  return key;
}

export function isEncryptedCpf(value: string | null | undefined): boolean {
  return !!value && value.startsWith(`enc:${VERSION}:`);
}

export function encryptCpf(plain: string): string {
  const digits = plain.replace(/\D/g, "");
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, getKey(), iv);
  const enc = Buffer.concat([cipher.update(digits, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `enc:${VERSION}:${iv.toString("base64")}:${tag.toString("base64")}:${enc.toString("base64")}`;
}

export function decryptCpf(stored: string | null | undefined): string | null {
  if (!stored) return null;
  if (!isEncryptedCpf(stored)) return stored.replace(/\D/g, "") || null;
  const parts = stored.split(":");
  if (parts.length !== 5) return null;
  const [, , ivB64, tagB64, encB64] = parts;
  try {
    const iv = Buffer.from(ivB64, "base64");
    const tag = Buffer.from(tagB64, "base64");
    const enc = Buffer.from(encB64, "base64");
    const decipher = crypto.createDecipheriv(ALGO, getKey(), iv);
    decipher.setAuthTag(tag);
    const dec = Buffer.concat([decipher.update(enc), decipher.final()]);
    return dec.toString("utf8");
  } catch {
    return null;
  }
}

export function hashCpf(plain: string): string {
  const digits = plain.replace(/\D/g, "");
  const pepper = process.env.CPF_HASH_PEPPER ?? "";
  return crypto.createHash("sha256").update(digits + pepper).digest("hex");
}

export function formatCpf(digits: string | null | undefined): string {
  if (!digits) return "";
  return digits.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
}
