import { requireSubscription } from "@/lib/require-subscription";

export default async function CalculadorasLayout({ children }: { children: React.ReactNode }) {
  await requireSubscription();
  return <>{children}</>;
}
