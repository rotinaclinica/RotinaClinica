import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { canAccessPaidContent } from "@/lib/subscription";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ hasActive: false });
  }

  const hasActive = await canAccessPaidContent(session.user.id);
  return NextResponse.json({ hasActive });
}
