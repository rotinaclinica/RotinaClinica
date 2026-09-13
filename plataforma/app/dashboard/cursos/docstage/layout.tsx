import { requireSubscription } from "@/lib/require-subscription";

export default async function DocstageLayout({ children }: { children: React.ReactNode }) {
  await requireSubscription();
  return <>{children}</>;
}
