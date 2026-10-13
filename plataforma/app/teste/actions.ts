"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { TRIAL_DAYS, trialEligibility } from "@/lib/subscription";

export async function activateTrial() {
  const session = await auth();
  if (!session?.user?.id) redirect("/registro?teste=1");

  const elig = await trialEligibility(session.user.id);
  if (!elig.ok) redirect("/teste");

  const now = new Date();
  // updateMany com trialStartedAt null: duplo clique não reinicia o teste
  await db.user.updateMany({
    where: { id: session.user.id, trialStartedAt: null },
    data: { trialStartedAt: now, trialEndsAt: new Date(now.getTime() + TRIAL_DAYS * 86_400_000) },
  });

  redirect("/dashboard?teste=ativado");
}
