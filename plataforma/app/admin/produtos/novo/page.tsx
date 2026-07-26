"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { createProduct } from "../actions";
import Link from "next/link";

export default function NovoProdutoPage() {
  const [state, action, pending] = useActionState(createProduct, null);
  const router = useRouter();

  function handleTitleBlur(e: React.FocusEvent<HTMLInputElement>) {
    const slugInput = document.getElementById("slug") as HTMLInputElement;
    if (!slugInput.value) {
      slugInput.value = e.target.value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/produtos" className="text-zinc-400 hover:text-zinc-600 text-sm">
          ← Produtos
        </Link>
        <span className="text-zinc-300">/</span>
        <h1 className="text-2xl font-bold">Novo produto</h1>
      </div>

      {state?.error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {state.error}
        </div>
      )}

      <form action={action} className="bg-white rounded-2xl border border-zinc-200 p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Título</label>
          <input
            name="title"
            required
            onBlur={handleTitleBlur}
            className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            placeholder="Ex: Curso de Pilates"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Slug (URL)</label>
          <input
            id="slug"
            name="slug"
            className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-violet-500"
            placeholder="curso-de-pilates"
          />
          <p className="text-xs text-zinc-400 mt-1">Deixe em branco para gerar automaticamente do título.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Descrição</label>
          <textarea
            name="description"
            required
            rows={4}
            className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
            placeholder="Descreva o produto..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Tipo</label>
            <select
              name="type"
              required
              className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="COURSE">Curso online</option>
              <option value="DOWNLOAD">Download digital</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Preço (R$)</label>
            <input
              name="price"
              type="number"
              min="0"
              step="0.01"
              required
              className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="97.00"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">
            Chave do arquivo (somente para Download)
          </label>
          <input
            name="fileKey"
            className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-violet-500"
            placeholder="arquivos/meu-ebook.pdf"
          />
          <p className="text-xs text-zinc-400 mt-1">Caminho do arquivo no Cloudflare R2.</p>
        </div>

        <div className="flex items-center gap-2">
          <input
            id="active"
            name="active"
            type="checkbox"
            defaultChecked
            className="w-4 h-4 accent-violet-600"
          />
          <label htmlFor="active" className="text-sm font-medium text-zinc-700">
            Publicar imediatamente
          </label>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={pending}
            className="bg-violet-600 text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-violet-700 transition-colors disabled:opacity-60"
          >
            {pending ? "Criando..." : "Criar produto"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/produtos")}
            className="border border-zinc-300 text-zinc-700 px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-zinc-50 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
