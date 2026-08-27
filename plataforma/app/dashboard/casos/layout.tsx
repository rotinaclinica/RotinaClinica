import { requireSubscription } from "@/lib/require-subscription";

export default async function CasosLayout({ children }: { children: React.ReactNode }) {
  await requireSubscription();
  return <>{children}</>;
}
