import { requireTrialOrSubscription } from "@/lib/require-subscription";

export default async function EvolucaesLayout({ children }: { children: React.ReactNode }) {
  await requireTrialOrSubscription();
  return <>{children}</>;
}
