import { requireTrialOrSubscription } from "@/lib/require-subscription";

export default async function CalculadorasLayout({ children }: { children: React.ReactNode }) {
  await requireTrialOrSubscription();
  return <>{children}</>;
}
