import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isAdminRequest } from "@/lib/require-admin";
import { anonymizeUser } from "@/lib/anonymize";
import { z } from "zod";

const schema = z.object({
  reason: z.string().max(500).optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const session = await auth();
  const { id } = await params;

  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  const reason = parsed.success ? parsed.data.reason : undefined;

  const result = await anonymizeUser({
    userId: id,
    triggeredBy: session?.user?.id ?? "admin",
    reason,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json(result);
}
