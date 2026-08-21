import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { headers } from "next/headers";
import DashboardSidebar from "@/app/components/DashboardSidebar";
import DashboardMobileNav from "@/app/components/DashboardMobileNav";
import ActivityPing from "@/app/components/ActivityPing";

// Rotas acessíveis a qualquer usuário logado, independente de assinatura
const FREE_ROUTES = ["/dashboard/perfil", "/dashboard/pedidos"];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const role = (session.user as { role?: string })?.role;

  // ADMIN e TESTER têm acesso irrestrito
  if (role !== "ADMIN" && role !== "TESTER") {
    const hdrs = await headers();
    const pathname = hdrs.get("x-pathname") ?? "";
    const isExempt = FREE_ROUTES.some((r) => pathname.startsWith(r));

    if (!isExempt) {
      const subscription = await db.subscription.findUnique({
        where: { userId: session.user.id },
        select: { status: true },
      });
      if (!subscription || subscription.status !== "ACTIVE") {
        redirect("/assinatura?motivo=acesso");
      }
    }
  }

  const initials = (session.user.name ?? "U")
    .split(" ")
    .slice(0, 2)
    .map((w: string) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen flex bg-[#f0f5f9] dark:bg-[#0c1117]">
      {/* Sidebar — desktop */}
      <DashboardSidebar
        userName={session.user.name ?? ""}
        userEmail={session.user.email ?? ""}
        initials={initials}
        isAdmin={role === "ADMIN"}
      />

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-0">
        {children}
      </div>

      {/* Bottom nav — mobile */}
      <DashboardMobileNav />

      <ActivityPing />
    </div>
  );
}
