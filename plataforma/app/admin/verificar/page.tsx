export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { readAdminPinCookie } from "@/lib/admin-pin";
import PinForm from "./PinForm";

export const metadata = { title: "Verificação · Admin · Rotina Clínica" };

export default async function VerificarPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (user?.role !== "ADMIN") redirect("/dashboard");

  const existing = await readAdminPinCookie();
  const { next } = await searchParams;
  const nextPath = next && next.startsWith("/admin") ? next : "/admin";

  if (existing && existing.userId === session.user.id) {
    redirect(nextPath);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d1117] px-4">
      <div className="w-full max-w-sm bg-[#161b22] rounded-2xl border border-white/10 p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-full bg-violet-500/10 flex items-center justify-center">
            <svg className="w-6 h-6 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0h-2m6-6a6 6 0 10-12 0v2a2 2 0 002 2h8a2 2 0 002-2v-2z" />
            </svg>
          </div>
          <h1 className="text-lg font-bold text-zinc-100">Verificação admin</h1>
          <p className="text-xs text-zinc-400">
            Digite seu PIN de 6 dígitos para entrar no painel administrativo.
          </p>
        </div>
        <PinForm nextPath={nextPath} />
      </div>
    </div>
  );
}
