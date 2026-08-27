import { requireSubscription } from "@/lib/require-subscription";

export default async function EvolucaesLayout({ children }: { children: React.ReactNode }) {
  await requireSubscription();
  return <>{children}</>;
}
