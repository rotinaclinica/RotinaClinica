import { db } from "@/lib/db";

export async function logError({
  route,
  method,
  error,
  userId,
}: {
  route: string;
  method?: string;
  error: unknown;
  userId?: string;
}) {
  try {
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? (error.stack ?? null) : null;
    await db.errorLog.create({
      data: { route, method: method ?? "UNKNOWN", message, stack, userId: userId ?? null },
    });
  } catch {
    // não deixar o logger derrubar a rota original
  }
}
