import { get, head } from "@vercel/blob";

export async function getPrivateBlob(fileKey: string) {
  return get(fileKey, { access: "private" });
}

/** Baixa os bytes de um blob privado (usa BLOB_READ_WRITE_TOKEN do ambiente). */
export async function getBlobBytes(url: string): Promise<Buffer> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  const info = await head(url, { token });
  const res = await fetch(info.downloadUrl, {
    headers: token ? { authorization: `Bearer ${token}` } : undefined,
  });
  if (!res.ok) throw new Error(`Blob fetch falhou: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}
