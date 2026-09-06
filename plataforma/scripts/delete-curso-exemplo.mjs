import { PrismaClient } from "../app/generated/prisma/index.js";
const db = new PrismaClient();

const product = await db.product.findFirst({
  where: { title: { contains: "Exemplo" } },
  include: { _count: { select: { enrollments: true } } },
});

if (!product) { console.log("Produto não encontrado."); process.exit(0); }

console.log("Produto encontrado:", product.title, "| id:", product.id);
console.log("Enrollments vinculados:", product._count.enrollments);

if (product._count.enrollments > 0) {
  await db.enrollment.deleteMany({ where: { productId: product.id } });
  console.log("Enrollments removidos.");
}

// Remove order items e orders vinculados
const orders = await db.order.findMany({ where: { productId: product.id }, select: { id: true } });
for (const o of orders) {
  await db.orderItem.deleteMany({ where: { orderId: o.id } });
}
if (orders.length > 0) {
  await db.order.deleteMany({ where: { productId: product.id } });
  console.log(`${orders.length} order(s) removida(s).`);
}

await db.product.delete({ where: { id: product.id } });
console.log("Produto deletado com sucesso.");
await db.$disconnect();
