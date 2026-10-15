import { db } from "@/lib/db";

/**
 * Métricas para acompanhar os ajustes de retenção de 15/10/2026 (aviso p/
 * avulsos, renovação antecipada, e-mail de reativação, anual parcelado no
 * cartão e mensal no cartão só recorrente).
 *
 * Tudo é derivado dos pedidos PAID de assinatura: a Subscription guarda só o
 * período atual, então o histórico de ciclos é reconstruído pedido a pedido,
 * com a mesma regra do webhook (novo período soma ao fim do vigente).
 */

const DAY = 86_400_000;
const PIX_METHODS = new Set(["pix", "bank_transfer"]);
const RENEWAL_WINDOW_DAYS = 30; // pagamento até 30 dias após vencer conta como renovação
const GRACE_DAYS = 7; // venceu há menos que isso e sem pagamento: ainda "aguardando"
const INACTIVE_STEP = 501;

export type MixKey = "mensalCartao" | "mensalPix" | "anualCartao" | "anualPix";

export type RetentionPeriod = {
  key: string;
  label: string;
  avulsosRenovados: number;
  avulsosExpirados: number;
  avulsosAguardando: number;
  migracoes: number;
  novas: Record<MixKey, number>;
  reativacaoEnviados: number;
  reativacaoVoltaram: number;
};

const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

// Mês no fuso de Brasília (UTC-3, sem horário de verão)
function monthKey(d: Date) {
  const br = new Date(d.getTime() - 3 * 3_600_000);
  return `${br.getUTCFullYear()}-${String(br.getUTCMonth() + 1).padStart(2, "0")}`;
}

function emptyPeriod(key: string, label: string): RetentionPeriod {
  return {
    key,
    label,
    avulsosRenovados: 0,
    avulsosExpirados: 0,
    avulsosAguardando: 0,
    migracoes: 0,
    novas: { mensalCartao: 0, mensalPix: 0, anualCartao: 0, anualPix: 0 },
    reativacaoEnviados: 0,
    reativacaoVoltaram: 0,
  };
}

export async function getRetentionMetrics(excludedEmails: string[], now = new Date()) {
  const notTest = { email: { notIn: excludedEmails } };

  const [orders, drips] = await Promise.all([
    db.order.findMany({
      where: {
        status: "PAID",
        paidAt: { not: null },
        user: notTest,
        items: { some: { product: { type: "SUBSCRIPTION" } } },
      },
      orderBy: { paidAt: "asc" },
      select: {
        userId: true,
        paidAt: true,
        paymentMethod: true,
        items: { select: { product: { select: { slug: true, type: true } } } },
      },
    }),
    db.emailDrip.findMany({
      where: { step: INACTIVE_STEP, user: notTest },
      select: { sentAt: true, user: { select: { lastSeenAt: true } } },
    }),
  ]);

  const last30 = new Date(now.getTime() - 30 * DAY);
  const periods = new Map<string, RetentionPeriod>();
  const recent = emptyPeriod("30d", "Últimos 30 dias");

  // Ponto de partida da série: mês do primeiro dado registrado
  const firstDate = [orders[0]?.paidAt, ...drips.map((d) => d.sentAt)]
    .filter((d): d is Date => !!d)
    .reduce((a, b) => (b < a ? b : a), now);
  for (let k = monthKey(firstDate); k <= monthKey(now); ) {
    const [y, m] = k.split("-").map(Number);
    periods.set(k, emptyPeriod(k, `${MONTHS[m - 1]}/${String(y).slice(2)}`));
    k = m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, "0")}`;
  }

  // Aplica a métrica ao mês do evento e, se cair nos últimos 30 dias, ao recorte recente
  function bump(date: Date, fn: (p: RetentionPeriod) => void) {
    const p = periods.get(monthKey(date));
    if (p) fn(p);
    if (date >= last30 && date <= now) fn(recent);
  }

  type Cycle = { paidAt: Date; end: Date; annual: boolean; pix: boolean };
  const byUser = new Map<string, Cycle[]>();
  for (const o of orders) {
    const product = o.items.find((i) => i.product.type === "SUBSCRIPTION")?.product;
    if (!product || !o.paidAt) continue;
    const annual = product.slug === "assinatura-anual";
    const cycles = byUser.get(o.userId) ?? [];
    const prev = cycles[cycles.length - 1];
    const base = prev && prev.end > o.paidAt ? prev.end : o.paidAt;
    cycles.push({
      paidAt: o.paidAt,
      end: new Date(base.getTime() + (annual ? 365 : 30) * DAY),
      annual,
      pix: PIX_METHODS.has(o.paymentMethod ?? ""),
    });
    byUser.set(o.userId, cycles);
  }

  for (const cycles of byUser.values()) {
    cycles.forEach((c, i) => {
      const next = cycles[i + 1];

      // 3) Mix das novas assinaturas: primeira compra do usuário
      if (i === 0) {
        const key: MixKey = c.annual
          ? c.pix ? "anualPix" : "anualCartao"
          : c.pix ? "mensalPix" : "mensalCartao";
        bump(c.paidAt, (p) => p.novas[key]++);
      }

      // 2) Migração Pix → cartão: primeiro pagamento no cartão depois de um Pix
      if (next && c.pix && !next.pix && cycles.slice(0, i + 1).every((x) => x.pix)) {
        bump(next.paidAt, (p) => p.migracoes++);
      }

      // 1) Renovação dos avulsos (Pix/transferência ou anual parcelado — sem
      // cobrança automática). Mensal no cartão é recorrente: fica de fora.
      const avulso = c.pix || c.annual;
      if (!avulso || c.end > now) return;
      const renewed = next && next.paidAt.getTime() <= c.end.getTime() + RENEWAL_WINDOW_DAYS * DAY;
      if (renewed) bump(c.end, (p) => p.avulsosRenovados++);
      else if (now.getTime() - c.end.getTime() < GRACE_DAYS * DAY) bump(c.end, (p) => p.avulsosAguardando++);
      else bump(c.end, (p) => p.avulsosExpirados++);
    });
  }

  // 4) Reativação: recebeu o e-mail de inatividade e acessou depois do envio
  for (const d of drips) {
    const voltou = !!d.user.lastSeenAt && d.user.lastSeenAt > d.sentAt;
    bump(d.sentAt, (p) => {
      p.reativacaoEnviados++;
      if (voltou) p.reativacaoVoltaram++;
    });
  }

  return {
    recent,
    months: [...periods.values()].reverse(),
  };
}
