import { db } from "../lib/db";

async function main() {
  const product = await db.product.findFirst({
    where: { title: { contains: "Exemplo" } },
    include: { _count: { select: { enrollments: true } } },
  });

  if (!product) { console.log("Produto não encontrado."); return; }
  console.log("Encontrado:", product.title, "| enrollments:", product._count.enrollments);

  if (product._count.enrollments > 0)
    await db.enrollment.deleteMany({ where: { productId: product.id } });

  const orders = await db.order.findMany({ where: { productId: product.id }, select: { id: true } });
  for (const o of orders) await db.orderItem.deleteMany({ where: { orderId: o.id } });
  if (orders.length) await db.order.deleteMany({ where: { productId: product.id } });

  await db.product.delete({ where: { id: product.id } });
  console.log("Deletado com sucesso.");
  await db.$disconnect();
}

main();
