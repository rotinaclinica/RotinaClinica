import { requireTrialOrSubscription } from "@/lib/require-subscription";

export default async function PrescricoesLayout({ children }: { children: React.ReactNode }) {
  await requireTrialOrSubscription();
  return <>{children}</>;
}
