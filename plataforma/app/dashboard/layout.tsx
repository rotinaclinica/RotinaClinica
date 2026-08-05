import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardSidebar from "@/app/components/DashboardSidebar";
import DashboardMobileNav from "@/app/components/DashboardMobileNav";
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

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
      />

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-0">
        {children}
      </div>

      {/* Bottom nav — mobile */}
      <DashboardMobileNav />
    </div>
  );
}
