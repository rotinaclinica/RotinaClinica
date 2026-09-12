import { redirect } from "next/navigation";
import AdminNav from "./_components/AdminNav";
import { isAdminRequest } from "@/lib/require-admin";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAdminRequest())) redirect("/dashboard");

  return (
    <>
      <style>{`
        @media print {
          body { background: white !important; color: #111 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          aside, nav, .lg\\:hidden, .print\\:hidden { display: none !important; }
          main { padding: 0 !important; background: white !important; }
          .min-h-screen { min-height: auto !important; }
          [class*="bg-[#161b22]"], [class*="bg-[#0d1117]"] { background: #f8f9fa !important; border-color: #dee2e6 !important; }
          [class*="text-zinc-100"], [class*="text-zinc-200"], [class*="text-zinc-300"] { color: #111 !important; }
          [class*="text-zinc-400"], [class*="text-zinc-500"] { color: #555 !important; }
          [class*="text-emerald"], [class*="text-green"] { color: #0a7c42 !important; }
          [class*="text-red"] { color: #c0392b !important; }
          [class*="text-amber"], [class*="text-yellow"] { color: #b8860b !important; }
          [class*="text-violet"] { color: #6c3483 !important; }
          [class*="border-l-emerald"] { border-left-color: #0a7c42 !important; }
          [class*="border-l-red"] { border-left-color: #c0392b !important; }
          [class*="border-l-amber"] { border-left-color: #b8860b !important; }
          [class*="border-white\\/10"] { border-color: #dee2e6 !important; }
          [class*="bg-white\\/5"] { background: #f0f0f0 !important; }
          h1::after { content: " — Rotina Clínica"; font-size: 0.5em; color: #999; font-weight: 400; }
          @page { size: A4; margin: 15mm; }
          section { break-inside: avoid; }
          table { font-size: 11px; }
        }
      `}</style>
      <div className="min-h-screen flex flex-col lg:flex-row">
        <AdminNav />
        <main className="flex-1 min-w-0 bg-[#0d1117] text-zinc-100 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </>
  );
}
