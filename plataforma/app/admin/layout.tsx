import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminNav from "./_components/AdminNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;

  if (!session || role !== "ADMIN") redirect("/dashboard");

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <AdminNav />
      <main className="flex-1 min-w-0 bg-zinc-50 p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
