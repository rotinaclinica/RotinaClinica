import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;

  if (!session || role !== "ADMIN") redirect("/dashboard");

  return (
    <div className="min-h-screen flex">
      <aside className="w-56 bg-zinc-900 text-white p-6 flex flex-col gap-2 sticky top-0 h-screen">
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">Admin</p>
        <Link href="/admin" className="text-sm hover:text-violet-400 transition-colors py-1">
          Dashboard
        </Link>
        <Link href="/admin/usuarios" className="text-sm hover:text-violet-400 transition-colors py-1">
          Usuários
        </Link>
        <Link href="/admin/acessos" className="text-sm hover:text-violet-400 transition-colors py-1">
          Acessos
        </Link>
        <Link href="/admin/leads" className="text-sm hover:text-violet-400 transition-colors py-1">
          Leads
        </Link>
        <div className="mt-auto flex flex-col gap-2">
          <Link href="/dashboard" className="text-xs text-zinc-400 hover:text-zinc-100 transition-colors">
            Acessar a plataforma →
          </Link>
          <Link href="/" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
            ← Ver site
          </Link>
        </div>
      </aside>
      <main className="flex-1 bg-zinc-50 p-8">{children}</main>
    </div>
  );
}
