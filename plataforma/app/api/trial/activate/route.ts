import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { activateTrial } from "@/lib/subscription";

// Chamado pelo login/cadastro quando a pessoa veio do caminho do teste (?teste=1)
export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }
  const activated = await activateTrial(session.user.id);
  return NextResponse.json({ activated });
}
