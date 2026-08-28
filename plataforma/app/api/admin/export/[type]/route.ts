import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

function csvCell(v: unknown): string {
  let s = v == null ? "" : String(v);
  // Mitiga CSV/formula injection: valores começando com = + - @ (ou tab/CR)
  // podem ser executados como fórmula pelo Excel/Sheets. Prefixa com aspa simples.
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return `"${s.replace(/"/g, '""')}"`;
}

function toCsv(headers: string[], rows: unknown[][]): string {
  const lines = [headers.map(csvCell).join(",")];
  for (const row of rows) lines.push(row.map(csvCell).join(","));
  // BOM para o Excel reconhecer UTF-8 (acentos)
  return "﻿" + lines.join("\r\n");
}

const fmtDate = (d: Date | null | undefined) =>
  d ? new Date(d).toLocaleDateString("pt-BR") : "";
const brl = (cents: number | null | undefined) =>
  ((cents ?? 0) / 100).toFixed(2).replace(".", ",");

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session || role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { type } = await params;
  let csv: string;
  let filename: string;

  if (type === "usuarios") {
    const users = await db.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        name: true, email: true, cpf: true, phone: true, createdAt: true, lastSeenAt: true,
        subscription: { select: { plan: true, status: true, currentPeriodEnd: true } },
        orders: { where: { status: "PAID" }, select: { totalCents: true } },
      },
    });
    csv = toCsv(
      ["Nome", "E-mail", "CPF", "Telefone", "Cadastro", "Último acesso", "Plano", "Status", "Gasto total (R$)", "Vence em"],
      users.map((u) => [
        u.name, u.email, u.cpf, u.phone, fmtDate(u.createdAt), fmtDate(u.lastSeenAt),
        u.subscription?.plan ?? "", u.subscription?.status ?? "",
        brl(u.orders.reduce((s, o) => s + o.totalCents, 0)),
        fmtDate(u.subscription?.currentPeriodEnd),
      ])
    );
    filename = "usuarios";
  } else if (type === "leads") {
    const leads = await db.lead.findMany({
      orderBy: { createdAt: "desc" },
      include: { product: { select: { title: true } } },
    });
    csv = toCsv(
      ["Nome", "E-mail", "Telefone", "Perfil", "Estado", "Faz plantão", "WhatsApp", "Produto", "Data"],
      leads.map((l) => [
        l.name, l.email, l.phone, l.profile, l.state, l.doePlantoes,
        l.whatsappOptIn ? "Sim" : "Não", l.product?.title ?? "", fmtDate(l.createdAt),
      ])
    );
    filename = "leads";
  } else if (type === "pedidos") {
    const orders = await db.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { email: true, name: true } },
        items: { include: { product: { select: { title: true } } } },
      },
    });
    csv = toCsv(
      ["Cliente", "E-mail", "Produto(s)", "Valor (R$)", "Gateway", "Status", "Data"],
      orders.map((o) => [
        o.user.name, o.user.email, o.items.map((i) => i.product.title).join(" + "),
        brl(o.totalCents), o.provider, o.status, fmtDate(o.createdAt),
      ])
    );
    filename = "pedidos";
  } else {
    return NextResponse.json({ error: "Tipo inválido" }, { status: 404 });
  }

  const date = new Date().toISOString().slice(0, 10);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
