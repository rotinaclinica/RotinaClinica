import { db } from "@/lib/db";

export async function hasAccess(
  userId: string,
  productId: string
): Promise<boolean> {
  const enrollment = await db.enrollment.findUnique({
    where: { userId_productId: { userId, productId } },
  });
  return enrollment !== null;
}

export async function grantAccess(
  userId: string,
  productId: string,
  sourceOrderId: string
): Promise<void> {
  await db.enrollment.upsert({
    where: { userId_productId: { userId, productId } },
    create: { userId, productId, sourceOrderId },
    update: {},
  });
}
