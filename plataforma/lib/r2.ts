import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const r2 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT ?? "https://placeholder.r2.cloudflarestorage.com",
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID ?? "placeholder",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? "placeholder",
  },
});

export async function getDownloadUrl(fileKey: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: fileKey,
  });
  return getSignedUrl(r2, command, { expiresIn: 300 });
}

export async function getUploadUrl(fileKey: string, contentType: string): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: fileKey,
    ContentType: contentType,
  });
  return getSignedUrl(r2, command, { expiresIn: 300 });
}
