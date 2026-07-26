export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/app/components/Navbar";

export const metadata = { title: "Minha Área" };

function SidebarIcon({ path }: { path: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d={path} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const enrollments = await db.enrollment.findMany({
    where: { userId: session.user.id },
    include: { product: { include: { modules: { include: { lessons: true } } } } },
    orderBy: { grantedAt: "desc" },
  });

  const initials = (session.user.name ?? "U")
    .split(" ")
    .slice(0, 2)
    .map((w: string) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen flex bg-[#f0f5f9]">
      {/* Sidebar */}
      <aside className="w-64 min-h-screen bg-[#0f2d4a] flex flex-col flex-shrink-0">
        {/* Logo area */}
        <div className="px-5 py-5 border-b border-white/10">
          <Link href="/">
            <Logo variant="light" />
          </Link>
        </div>

        {/* User */}
        <div className="px-5 py-5 border-b border-white/10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#3db8d4] flex items-center justify-center text-[#0f2d4a] font-bold text-sm flex-shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-semibold truncate">{session.user.name}</p>
            <p className="text-[#5a8caa] text-xs truncate">{session.user.email}</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white bg-white/10 text-sm font-semibold"
          >
            <SidebarIcon path="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            Minhas compras
          </Link>
          <Link
            href="/perfil"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#9ec4de] hover:text-white hover:bg-white/10 text-sm font-medium transition-all"
          >
            <SidebarIcon path="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            Meu perfil
          </Link>
        </nav>

        {/* Logout */}
        <div className="px-3 pb-5">
          <Link
            href="/api/auth/signout"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#5a8caa] hover:text-white hover:bg-white/10 text-sm font-medium transition-all w-full"
          >
            <SidebarIcon path="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            Sair
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-zinc-200 px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#0f2d4a]">Minhas compras</h1>
            <p className="text-zinc-500 text-sm">
              {enrollments.length === 0
                ? "Nenhum produto adquirido ainda"
                : `${enrollments.length} produto${enrollments.length > 1 ? "s" : ""} adquirido${enrollments.length > 1 ? "s" : ""}`}
            </p>
          </div>
          <Link
            href="/"
            className="text-sm font-semibold text-[#1a6aad] hover:text-[#0f2d4a] flex items-center gap-1.5 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12l7-7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Ver mais cursos
          </Link>
        </header>

        <main className="flex-1 p-8">
          {enrollments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 bg-[#e8f4fc] rounded-2xl flex items-center justify-center mb-6">
                <span className="text-4xl">🩺</span>
              </div>
              <h2 className="text-lg font-bold text-[#0f2d4a] mb-2">Nenhum produto ainda</h2>
              <p className="text-zinc-500 text-sm mb-6 max-w-xs">
                Explore nosso catálogo e comece sua jornada de aprendizado.
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 bg-[#1a6aad] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#0f2d4a] transition-all"
              >
                Explorar cursos
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {enrollments.map(({ product }) => (
                <div key={product.id} className="bg-white rounded-2xl border border-zinc-200 overflow-hidden hover:shadow-md transition-shadow">
                  {product.coverImage ? (
                    <img
                      src={product.coverImage}
                      alt={product.title}
                      className="w-full h-36 object-cover"
                    />
                  ) : (
                    <div className="w-full h-36 bg-gradient-to-br from-[#0f2d4a] to-[#1a6aad] flex items-center justify-center">
                      <span className="text-white text-4xl opacity-50">
                        {product.type === "COURSE" ? "🎓" : "📄"}
                      </span>
                    </div>
                  )}

                  <div className="p-5">
                    <span className="inline-block text-xs font-bold text-[#1a6aad] bg-[#e8f4fc] px-2.5 py-1 rounded-full uppercase tracking-wide">
                      {product.type === "COURSE" ? "Curso" : "Download"}
                    </span>
                    <h2 className="font-bold text-[#0f2d4a] text-base mt-2 mb-1 line-clamp-2">
                      {product.title}
                    </h2>

                    {product.type === "COURSE" && (
                      <div className="mt-3">
                        <p className="text-xs text-zinc-400 mb-3">
                          {product.modules.reduce((acc, m) => acc + m.lessons.length, 0)} aulas · {product.modules.length} módulos
                        </p>
                        <Link
                          href={`/curso/${product.slug}`}
                          className="inline-flex items-center gap-2 bg-[#1a6aad] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#0f2d4a] transition-all w-full justify-center"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" fill="currentColor"/><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2"/></svg>
                          Acessar curso
                        </Link>
                      </div>
                    )}

                    {product.type === "DOWNLOAD" && (
                      <div className="mt-3">
                        <a
                          href={`/api/downloads/${product.id}`}
                          className="inline-flex items-center gap-2 bg-[#0f2d4a] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#1a6aad] transition-all w-full justify-center"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          Baixar arquivo
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
