import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isAdminRequest } from "@/lib/require-admin";
import { sendCapiTestEvents } from "@/lib/meta/capi";

// Envia eventos à área "Eventos de Teste" da Meta para conferir o token. Não afeta dados reais.
export async function POST(req: NextRequest) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { testCode } = (await req.json()) as { testCode?: string };
  if (typeof testCode !== "string" || !/^TEST[A-Za-z0-9]+$/.test(testCode)) {
    return NextResponse.json({ error: "Código de teste inválido" }, { status: 400 });
  }

  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await sendCapiTestEvents(testCode, { id: session.user.id, email: session.user.email });
  return NextResponse.json(result);
}
