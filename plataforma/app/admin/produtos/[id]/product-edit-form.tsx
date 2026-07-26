"use client";

import { useActionState } from "react";
import { updateProduct, deleteProduct } from "../actions";
import type { Product } from "@/app/generated/prisma/client";

export function ProductEditForm({ product }: { product: Product }) {
  const [state, action, pending] = useActionState(updateProduct, null);

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 p-6">
      <h2 className="text-base font-semibold mb-5">Informações do produto</h2>

      {state?.error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {state.error}
        </div>
      )}
      {state?.success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm">
          Produto atualizado.
        </div>
      )}

      <form action={action} className="space-y-4">
        <input type="hidden" name="id" value={product.id} />

        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Título</label>
          <input
            name="title"
            required
            defaultValue={product.title}
            className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Slug (URL)</label>
          <input
            name="slug"
            required
            defaultValue={product.slug}
            className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Descrição</label>
          <textarea
            name="description"
            required
            rows={4}
            defaultValue={product.description}
            className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Tipo</label>
            <input
              value={product.type === "COURSE" ? "Curso online" : "Download digital"}
              readOnly
              className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm bg-zinc-50 text-zinc-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Preço (R$)</label>
            <input
              name="price"
              type="number"
              min="0"
              step="0.01"
              required
              defaultValue={(product.priceCents / 100).toFixed(2)}
              className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
        </div>

        {product.type === "DOWNLOAD" && (
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Chave do arquivo (R2)</label>
            <input
              name="fileKey"
              defaultValue={product.fileKey ?? ""}
              className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="arquivos/meu-ebook.pdf"
            />
          </div>
        )}

        <div className="flex items-center gap-2">
          <input
            id="active"
            name="active"
            type="checkbox"
            defaultChecked={product.active}
            className="w-4 h-4 accent-violet-600"
          />
          <label htmlFor="active" className="text-sm font-medium text-zinc-700">
            Produto publicado
          </label>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={pending}
              className="bg-violet-600 text-white px-5 py-2 rounded-lg font-semibold text-sm hover:bg-violet-700 transition-colors disabled:opacity-60"
            >
              {pending ? "Salvando..." : "Salvar"}
            </button>
            <a
              href={`/produtos/${product.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-zinc-300 text-zinc-700 px-5 py-2 rounded-lg font-semibold text-sm hover:bg-zinc-50 transition-colors"
            >
              Ver página ↗
            </a>
          </div>
        </div>
      </form>

      <form action={deleteProduct.bind(null, product.id)} className="mt-4 pt-4 border-t border-zinc-100 flex justify-end">
        <button
          type="submit"
          className="text-red-500 hover:text-red-700 text-sm font-medium"
          onClick={(e) => { if (!confirm("Excluir este produto?")) e.preventDefault(); }}
        >
          Excluir produto
        </button>
      </form>
    </div>
  );
}
