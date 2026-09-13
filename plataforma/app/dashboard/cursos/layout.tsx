import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { canAccessPaidContent } from "@/lib/subscription";
import { db } from "@/lib/db";

export default async function CursosLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const hasSubscription = await canAccessPaidContent(session.user.id);
  if (hasSubscription) return <>{children}</>;

  const hasCourseEnrollment = await db.enrollment.findFirst({
    where: {
      userId: session.user.id,
      product: { type: "COURSE" },
    },
    select: { id: true },
  });

  if (hasCourseEnrollment) return <>{children}</>;

  redirect("/assinatura?motivo=acesso");
}
