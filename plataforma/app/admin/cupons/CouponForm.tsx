"use client";

import { useState } from "react";
import { createCoupon } from "./actions";

type ProductOption = { id: string; title: string; slug: string };

export function CouponForm({ products }: { products: ProductOption[] }) {
  const [code, setCode] = useState("");
  const [discountValue, setDiscountValue] = useState("10");
  const [expiresIn, setExpiresIn] = useState("30");
  const [maxUses, setMaxUses] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [status, setStatus] = useState<{ type: "error" | "success"; msg: string } | null>(null);
  const [loading, setLoading] = useState(false);

  function toggleProduct(id: string) {
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    const fd = new FormData();
    fd.append("code", code);
    fd.append("discountValue", discountValue);
    fd.append("expiresIn", expiresIn);
    if (maxUses) fd.append("maxUses", maxUses);
    fd.append("productIds", selectedProducts.join(","));
    const result = await createCoupon(fd);
    setLoading(false);
    if (result?.error) {
      setStatus({ type: "error", msg: result.error });
    } else {
      setStatus({ type: "success", msg: "Cupom criado com sucesso!" });
      setCode("");
      setDiscountValue("10");
      setExpiresIn("30");
      setMaxUses("");
      setSelectedProducts([]);
    }
  }

  return (
    <div className="bg-[#161b22] rounded-xl border border-white/10 p-6">
      <h2 className="text-sm font-bold text-zinc-100 mb-4">Criar novo cupom</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Código do cupom</label>
            <input
              type="text" required value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Ex: DESCONTO20"
              maxLength={30}
              className="w-full text-sm px-3 py-2 rounded-lg border border-white/10 bg-[#161b22] text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 uppercase tracking-widest font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Desconto (%)</label>
            <input
              type="number" required min={1} max={100} value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              className="w-full text-sm px-3 py-2 rounded-lg border border-white/10 bg-[#161b22] text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Validade</label>
            <select
              value={expiresIn}
              onChange={(e) => setExpiresIn(e.target.value)}
              className="w-full text-sm px-3 py-2 rounded-lg border border-white/10 bg-[#161b22] text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500/50 [&>option]:bg-[#161b22]"
            >
              <option value="7">7 dias</option>
              <option value="15">15 dias</option>
              <option value="30">30 dias</option>
              <option value="60">60 dias</option>
              <option value="90">90 dias</option>
              <option value="365">1 ano</option>
              <option value="unlimited">Sem expiração</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Limite de usos (opcional)</label>
            <input
              type="number" min={1} value={maxUses}
              onChange={(e) => setMaxUses(e.target.value)}
              placeholder="Sem limite"
              className="w-full text-sm px-3 py-2 rounded-lg border border-white/10 bg-[#161b22] text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-2">Produtos válidos</label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedProducts([])}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                selectedProducts.length === 0
                  ? "bg-violet-600 border-violet-500 text-white font-semibold"
                  : "border-white/10 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Todos os produtos
            </button>
            {products.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => toggleProduct(p.id)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                  selectedProducts.includes(p.id)
                    ? "bg-violet-600 border-violet-500 text-white font-semibold"
                    : "border-white/10 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {p.title}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-zinc-500 mt-1.5">
            {selectedProducts.length === 0
              ? "O cupom valerá para todos os ebooks e o curso."
              : `Válido para ${selectedProducts.length} produto${selectedProducts.length !== 1 ? "s" : ""} selecionado${selectedProducts.length !== 1 ? "s" : ""}.`}
          </p>
        </div>

        {status && (
          <p className={`text-xs font-medium ${status.type === "error" ? "text-red-500" : "text-emerald-400"}`}>
            {status.msg}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2 text-sm font-semibold bg-violet-600 text-white rounded-lg hover:bg-violet-500 transition-colors disabled:opacity-50"
        >
          {loading ? "Criando…" : "Criar cupom"}
        </button>
      </form>
    </div>
  );
}
