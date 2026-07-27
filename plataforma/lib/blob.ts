import { get } from "@vercel/blob";

export async function getPrivateBlob(fileKey: string) {
  return get(fileKey, { access: "private" });
}
