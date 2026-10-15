import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { checkSubscriptionAccess, getActiveTrialEnd, isTrialRoute } from "@/lib/subscription";
import { headers } from "next/headers";
import DashboardSidebar from "@/app/components/DashboardSidebar";
import DashboardMobileNav from "@/app/components/DashboardMobileNav";
import ActivityPing from "@/app/components/ActivityPing";
import SubscriptionExpiryBanner from "@/app/components/SubscriptionExpiryBanner";
import PageTracker from "./_components/PageTracker";
import TrialBanner from "./_components/TrialBanner";

// Rotas acessíveis a qualquer usuário logado, independente de assinatura
const FREE_ROUTES = ["/dashboard/perfil", "/dashboard/pedidos", "/dashboard/meus-ebooks", "/dashboard/cursos"];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const role = (session.user as { role?: string })?.role;

  let expiring: { dateLabel: string; daysLeft: number; plano: "mensal" | "anual" } | null = null;
  let hasAccess = role === "ADMIN" || role === "TESTER";
  let trialEndsAt: Date | null = null;

  if (!hasAccess) {
    const hdrs = await headers();
    const pathname = hdrs.get("x-pathname");
    const isExempt = pathname != null && FREE_ROUTES.some((r) => pathname.startsWith(r));

    const { canAccess, expiresAt, autoRenew, plan } = await checkSubscriptionAccess(session.user.id);
    hasAccess = canAccess;
    if (!canAccess) trialEndsAt = await getActiveTrialEnd(session.user.id);

    // Teste grátis: início do painel + Condutas, Evoluções e Calculadoras
    const trialOk = trialEndsAt != null && pathname != null && (pathname === "/dashboard" || isTrialRoute(pathname));

    // Rotas pagas: bloqueia não-assinante (rotas livres seguem acessíveis)
    if (!canAccess && !isExempt && !trialOk) {
      redirect(trialEndsAt ? "/assinatura?motivo=teste" : "/assinatura?motivo=acesso");
    }

    // Pagamento avulso (Pix/transferência) nos últimos 7 dias: aviso para ativar o
    // cartão recorrente. Quem já renova automaticamente não vê aviso.
    const msLeft = expiresAt ? expiresAt.getTime() - Date.now() : Infinity;
    if (canAccess && !autoRenew && expiresAt && msLeft <= 7 * 24 * 60 * 60 * 1000) {
      expiring = {
        dateLabel: expiresAt.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", timeZone: "America/Sao_Paulo" }),
        daysLeft: Math.max(0, Math.ceil(msLeft / 86_400_000)),
        plano: plan === "ANNUAL" ? "anual" : "mensal",
      };
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
        hasAccess={hasAccess}
        isTrial={trialEndsAt != null}
      />

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-0 lg:border-l lg:border-white/5">
        {expiring && <SubscriptionExpiryBanner {...expiring} />}
        {trialEndsAt && <TrialBanner endsAt={trialEndsAt.toISOString()} />}
        {children}
      </div>

      {/* Bottom nav — mobile */}
      <DashboardMobileNav hasAccess={hasAccess || trialEndsAt != null} isAdmin={role === "ADMIN"} />

      <ActivityPing />
      <PageTracker />
    </div>
  );
}
