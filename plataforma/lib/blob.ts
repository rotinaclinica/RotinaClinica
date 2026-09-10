import { get, head } from "@vercel/blob";

export async function getPrivateBlob(fileKey: string) {
  return get(fileKey, { access: "private" });
}

/**
 * Baixa os bytes de um blob privado usando o SDK oficial (get com access:private),
 * que resolve a autenticação internamente via BLOB_READ_WRITE_TOKEN.
 * Aceita URL completa ou pathname (ex.: "ebooks/manual-prescricoes.pdf").
 */
export async function getBlobBytes(urlOrPathname: string): Promise<Buffer> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  const result = await get(urlOrPathname, { access: "private", token });
  if (!result) {
    throw new Error(`Blob get retornou null (não encontrado): ${urlOrPathname}`);
  }
  if (result.statusCode !== 200 || !result.stream) {
    throw new Error(`Blob get statusCode ${result.statusCode}: ${urlOrPathname}`);
  }
  const reader = result.stream.getReader();
  const chunks: Uint8Array[] = [];
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }
  return Buffer.concat(chunks);
}

// mantido para diagnóstico/compat: metadados de um blob privado
export async function getBlobHead(url: string) {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  return head(url, { token });
}
