import { redirect } from "next/navigation";
import AdminNav from "./_components/AdminNav";
import { isAdminRequest } from "@/lib/require-admin";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAdminRequest())) redirect("/dashboard");

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <AdminNav />
      <main className="flex-1 min-w-0 bg-zinc-50 p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
