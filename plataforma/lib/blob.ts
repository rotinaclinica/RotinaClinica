import { head } from "@vercel/blob";

export async function getEbookDownloadUrl(fileKey: string): Promise<string> {
  const blob = await head(fileKey);
  return blob.downloadUrl;
}
