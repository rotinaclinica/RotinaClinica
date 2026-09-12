"use client";

import { deleteCost } from "./actions";

export function DeleteCostButton({ id }: { id: string }) {
  return (
    <button
      onClick={() => {
        if (confirm("Excluir este custo?")) deleteCost(id);
      }}
      className="text-xs text-red-400 hover:text-red-300"
    >
      Excluir
    </button>
  );
}
