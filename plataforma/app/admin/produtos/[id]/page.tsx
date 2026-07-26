export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ProductEditForm } from "./product-edit-form";
import { ModulesSection } from "./modules-section";

export default async function EditarProdutoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const product = await db.product.findUnique({
    where: { id },
    include: {
      modules: {
        orderBy: { position: "asc" },
        include: { lessons: { orderBy: { position: "asc" } } },
      },
    },
  });

  if (!product) notFound();

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/produtos" className="text-zinc-400 hover:text-zinc-600 text-sm">
          ← Produtos
        </Link>
        <span className="text-zinc-300">/</span>
        <h1 className="text-2xl font-bold truncate">{product.title}</h1>
      </div>

      <div className="space-y-6">
        <ProductEditForm product={product} />

        {product.type === "COURSE" && (
          <ModulesSection product={product} modules={product.modules} />
        )}
      </div>
    </div>
  );
}
