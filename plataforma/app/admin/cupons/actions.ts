"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createCoupon(fd: FormData) {
  const code = (fd.get("code") as string)?.trim().toUpperCase();
  const discountValue = Number(fd.get("discountValue"));
  const expiresIn = fd.get("expiresIn") as string;
  const maxUses = fd.get("maxUses") ? Number(fd.get("maxUses")) : null;
  const productIds = (fd.get("productIds") as string)?.split(",").filter(Boolean) ?? [];

  if (!code || code.length < 2) return { error: "Código deve ter pelo menos 2 caracteres." };
  if (!discountValue || discountValue < 1 || discountValue > 100) return { error: "Desconto deve ser entre 1% e 100%." };

  const existing = await db.coupon.findUnique({ where: { code } });
  if (existing) return { error: "Já existe um cupom com este código." };

  let expiresAt: Date | null = null;
  if (expiresIn && expiresIn !== "unlimited") {
    const days = Number(expiresIn);
    if (days > 0) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + days);
    }
  }

  await db.coupon.create({
    data: {
      code,
      discountType: "PERCENT",
      discountValue,
      expiresAt,
      maxUses,
      active: true,
      ...(productIds.length > 0
        ? { products: { connect: productIds.map((id) => ({ id })) } }
        : {}),
    },
  });

  revalidatePath("/admin/cupons");
  return { success: true };
}

export async function toggleCoupon(couponId: string) {
  const coupon = await db.coupon.findUnique({ where: { id: couponId }, select: { active: true } });
  if (!coupon) return { error: "Cupom não encontrado." };

  await db.coupon.update({
    where: { id: couponId },
    data: { active: !coupon.active },
  });

  revalidatePath("/admin/cupons");
  return { success: true };
}

export async function deleteCoupon(couponId: string) {
  const coupon = await db.coupon.findUnique({
    where: { id: couponId },
    select: { _count: { select: { orders: true } } },
  });
  if (!coupon) return { error: "Cupom não encontrado." };
  if (coupon._count.orders > 0) return { error: "Este cupom já foi usado em pedidos e não pode ser excluído. Desative-o." };

  await db.coupon.delete({ where: { id: couponId } });
  revalidatePath("/admin/cupons");
  return { success: true };
}
