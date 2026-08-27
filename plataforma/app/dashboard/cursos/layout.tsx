import { requireSubscription } from "@/lib/require-subscription";

export default async function CursosLayout({ children }: { children: React.ReactNode }) {
  await requireSubscription();
  return <>{children}</>;
}
