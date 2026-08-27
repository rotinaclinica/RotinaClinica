import { requireSubscription } from "@/lib/require-subscription";

export default async function PrescricoesLayout({ children }: { children: React.ReactNode }) {
  await requireSubscription();
  return <>{children}</>;
}
