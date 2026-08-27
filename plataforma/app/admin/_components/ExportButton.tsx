export default function ExportButton({ type }: { type: "usuarios" | "leads" | "pedidos" }) {
  return (
    <a
      href={`/api/admin/export/${type}`}
      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-white border border-zinc-200 text-zinc-600 hover:border-violet-400 hover:text-violet-600 transition-colors"
    >
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      Exportar CSV
    </a>
  );
}
