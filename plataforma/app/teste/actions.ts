"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { activateTrial } from "@/lib/subscription";

export async function activateTrialAction() {
  const session = await auth();
  if (!session?.user?.id) redirect("/registro?teste=1");

  if (!(await activateTrial(session.user.id))) redirect("/teste");
  redirect("/dashboard?teste=ativado");
}
