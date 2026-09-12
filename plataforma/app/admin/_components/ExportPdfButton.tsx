"use client";

export function ExportPdfButton({ label }: { label?: string }) {
  return (
    <button
      onClick={() => window.print()}
      className="bg-white/5 border border-white/10 text-zinc-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors print:hidden"
    >
      {label ?? "Exportar PDF"}
    </button>
  );
}
