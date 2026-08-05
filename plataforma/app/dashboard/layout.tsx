import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardSidebar from "@/app/components/DashboardSidebar";
import DashboardMobileNav from "@/app/components/DashboardMobileNav";
import ThemeToggle from "@/app/components/ThemeToggle";

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

      {/* Botão toggle tema — mobile, topo direito */}
      <ThemeToggle className="lg:hidden fixed top-4 right-4 z-40 w-9 h-9 flex items-center justify-center rounded-full bg-white dark:bg-[#1a2535] text-zinc-500 dark:text-[#9ec4de] shadow-md border border-zinc-200 dark:border-white/10 hover:text-[#0f2d4a] dark:hover:text-white transition-colors" />

      {/* Bottom nav — mobile */}
      <DashboardMobileNav />
    </div>
  );
}
