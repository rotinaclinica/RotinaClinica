"use client";

import { deleteProduct } from "@/app/admin/acessos/actions";

export function DeleteProductButton({ productId, title }: { productId: string; title: string }) {
  return (
    <form action={deleteProduct.bind(null, productId)}>
      <button
        type="submit"
        className="text-xs text-red-400 hover:text-red-600"
        onClick={(e) => { if (!confirm(`Deletar "${title}"?`)) e.preventDefault(); }}
      >
        Deletar
      </button>
    </form>
  );
}
