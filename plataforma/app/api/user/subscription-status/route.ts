import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { canAccessPaidContent, getActiveTrialEnd, trialEligibility } from "@/lib/subscription";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ hasActive: false, inTrial: false, canTrial: false });
  }

  const hasActive = await canAccessPaidContent(session.user.id);
  if (hasActive) return NextResponse.json({ hasActive, inTrial: false, canTrial: false });

  const inTrial = (await getActiveTrialEnd(session.user.id)) !== null;
  const canTrial = !inTrial && (await trialEligibility(session.user.id)).ok;
  return NextResponse.json({ hasActive, inTrial, canTrial });
}
