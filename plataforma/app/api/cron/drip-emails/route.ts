import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Resend } from "resend";
import { dripHtml2, dripHtml7 } from "@/lib/emails/drip";
import { onboardingD1, onboardingD3, onboardingD6, checkoutRecovery1, checkoutRecovery2, trialD1, trialD5, trialEnded, trialAfter3 } from "@/lib/emails/retencao";
import { logError } from "@/lib/error-logger";

export const maxDuration = 60;

const resend = new Resend(process.env.RESEND_API_KEY ?? "re_placeholder");
const FROM = "Rotina Clínica <contato@rotinaclinica.com>";

const STEPS: { step: number; minHours: number; maxHours: number; subject: string; html: (n: string) => string }[] = [
  {
    step: 2,
    minHours: 48,
    maxHours: 72,
    subject: "Você ainda não explorou o que preparamos para você",
    html: dripHtml2,
  },
  {
    step: 7,
    minHours: 168,
    maxHours: 192,
    subject: "Última mensagem — queremos que você faça parte",
    html: dripHtml7,
  },
];

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = Date.now();
  const results: Record<number, { sent: number; failed: number }> = {};

  for (const { step, minHours, maxHours, subject, html } of STEPS) {
    const from = new Date(now - maxHours * 60 * 60 * 1000);
    const to   = new Date(now - minHours * 60 * 60 * 1000);

    const users = await db.user.findMany({
      where: {
        createdAt: { gte: from, lte: to },
        subscription: null,
        trialStartedAt: null, // quem está/esteve em teste recebe a sequência própria do teste
        // Quem abandonou o checkout já recebe a recuperação (301/303) — não duplica
        emailDrips: { none: { step: { in: [step, 301] } } },
      },
      select: { id: true, email: true, name: true },
    });

    let sent = 0;
    let failed = 0;

    for (const user of users) {
      try {
        await resend.emails.send({
          from: FROM,
          to: user.email,
          subject,
          html: html(user.name ?? ""),
        });
        await db.emailDrip.create({ data: { userId: user.id, step } });
        sent++;
      } catch {
        failed++;
      }
    }

    results[step] = { sent, failed };
  }

  const onboarding = await sendOnboarding(now);
  const recovery = await sendCheckoutRecovery(now);
  const trial = await sendTrialEmails(now);

  return NextResponse.json({ results, onboarding, recovery, trial });
}

// Etapas registradas em EmailDrip (userId+step único → cada uma sai uma vez por usuário)
const ONBOARDING_STEPS = [
  { step: 101, day: 1, subject: "Seu primeiro plantão com o Rotina Clínica" },
  { step: 103, day: 3, subject: "" }, // assunto depende de já ter acessado
  { step: 106, day: 6, subject: "Deixe a plataforma com a sua cara" },
];
const RECOVERY_STEPS = [
  { step: 301, day: 1, subject: "Sua assinatura ficou pela metade" },
  { step: 303, day: 3, subject: "Ainda dá tempo de concluir sua assinatura" },
];

const HOUR = 60 * 60 * 1000;
// Cron diário: janela de 24h centrada no dia-alvo, para nenhum usuário escapar
const dayWindow = (now: number, day: number) => ({
  gte: new Date(now - (day * 24 + 12) * HOUR),
  lt: new Date(now - (day * 24 - 12) * HOUR),
});

const realCustomer = { role: "CUSTOMER" as const, isCourtesy: false, anonymizedAt: null };

// Onboarding de novos assinantes: D1, D3 (com variação p/ quem nunca entrou) e D6
async function sendOnboarding(now: number) {
  const out: Record<number, { sent: number; failed: number }> = {};

  for (const { step, day, subject } of ONBOARDING_STEPS) {
    const orders = await db.order.findMany({
      where: {
        status: "PAID",
        paidAt: dayWindow(now, day),
        items: { some: { product: { type: "SUBSCRIPTION" } } },
        user: { ...realCustomer, emailDrips: { none: { step } } },
      },
      select: { paidAt: true, user: { select: { id: true, email: true, name: true } } },
    });

    let sent = 0;
    let failed = 0;
    const seen = new Set<string>();
    for (const { paidAt, user } of orders) {
      if (seen.has(user.id)) continue;
      seen.add(user.id);
      // Só a primeira assinatura: renovação não recebe "boas-vindas"
      const anteriores = await db.order.count({
        where: { userId: user.id, status: "PAID", paidAt: { lt: paidAt ?? undefined }, items: { some: { product: { type: "SUBSCRIPTION" } } } },
      });
      if (anteriores > 0) continue;
      const firstName = (user.name ?? "").trim().split(/\s+/)[0] ?? "";
      try {
        let html: string;
        let subj = subject;
        if (step === 101) html = onboardingD1(firstName);
        else if (step === 106) html = onboardingD6(firstName);
        else {
          const acessos = await db.pageView.count({ where: { userId: user.id, createdAt: { gte: paidAt ?? undefined } } });
          html = onboardingD3(firstName, acessos > 0);
          subj = acessos > 0 ? "Você ainda não viu tudo o que tem aqui" : "Seu acesso ao Rotina Clínica está esperando por você";
        }
        await resend.emails.send({ from: FROM, to: user.email, subject: subj, html });
        await db.emailDrip.create({ data: { userId: user.id, step } });
        sent++;
      } catch (err) {
        failed++;
        await logError({ route: "/api/cron/drip-emails#onboarding", method: "GET", error: err });
      }
    }
    out[step] = { sent, failed };
  }
  return out;
}

// Checkout de assinatura iniciado e não pago: lembretes em D1 e D3
async function sendCheckoutRecovery(now: number) {
  const out: Record<number, { sent: number; failed: number }> = {};

  for (const { step, day, subject } of RECOVERY_STEPS) {
    const orders = await db.order.findMany({
      where: {
        status: { in: ["PENDING", "EXPIRED", "FAILED"] },
        createdAt: dayWindow(now, day),
        items: { some: { product: { type: "SUBSCRIPTION" } } },
        user: { ...realCustomer, emailDrips: { none: { step } } },
      },
      orderBy: { createdAt: "desc" },
      select: {
        createdAt: true,
        items: { select: { product: { select: { slug: true, type: true } } } },
        user: { select: { id: true, email: true, name: true } },
      },
    });

    let sent = 0;
    let failed = 0;
    const seen = new Set<string>();
    for (const o of orders) {
      if (seen.has(o.user.id)) continue;
      seen.add(o.user.id);

      // Já assinou por outro pedido (ex.: tentou Pix, depois pagou no cartão)?
      const [pagouDepois, vigente] = await Promise.all([
        db.order.count({ where: { userId: o.user.id, status: "PAID", createdAt: { gte: o.createdAt } } }),
        db.subscription.count({ where: { userId: o.user.id, status: "ACTIVE", currentPeriodEnd: { gt: new Date(now) } } }),
      ]);
      if (pagouDepois > 0 || vigente > 0) continue;

      const slug = o.items.find((i) => i.product.type === "SUBSCRIPTION")?.product.slug;
      const plano = slug === "assinatura-anual" ? "anual" : "mensal";
      const firstName = (o.user.name ?? "").trim().split(/\s+/)[0] ?? "";
      try {
        const html = step === 301 ? checkoutRecovery1(firstName, plano) : checkoutRecovery2(firstName, plano);
        await resend.emails.send({ from: FROM, to: o.user.email, subject, html });
        await db.emailDrip.create({ data: { userId: o.user.id, step } });
        sent++;
      } catch (err) {
        failed++;
        await logError({ route: "/api/cron/drip-emails#recovery", method: "GET", error: err });
      }
    }
    out[step] = { sent, failed };
  }
  return out;
}

// Teste grátis: D1 (início), D5 (faltam 2 dias), fim e 3 dias após o fim.
// "from" = referência da janela: início (trialStartedAt) ou fim (trialEndsAt).
const TRIAL_STEPS = [
  { step: 401, from: "start" as const, day: 1, subject: "Seu teste grátis do Rotina Clínica começou", html: trialD1 },
  { step: 405, from: "start" as const, day: 5, subject: "Seu teste grátis termina em 2 dias", html: trialD5 },
  { step: 407, from: "end" as const, day: 0, subject: "Seu teste grátis terminou", html: trialEnded },
  { step: 410, from: "end" as const, day: 3, subject: "Sua aliada na prática clínica continua aqui", html: trialAfter3 },
];

async function sendTrialEmails(now: number) {
  const out: Record<number, { sent: number; failed: number }> = {};

  for (const { step, from, day, subject, html } of TRIAL_STEPS) {
    // "fim" no dia 0: janela das últimas 24h após trialEndsAt
    const window = from === "end" && day === 0
      ? { gte: new Date(now - 24 * HOUR), lt: new Date(now) }
      : dayWindow(now, day);
    const users = await db.user.findMany({
      where: {
        ...realCustomer,
        ...(from === "start" ? { trialStartedAt: window } : { trialEndsAt: window }),
        emailDrips: { none: { step } },
      },
      select: { id: true, email: true, name: true },
    });

    let sent = 0;
    let failed = 0;
    for (const user of users) {
      // Já assinou: para a sequência
      const assinou = await db.subscription.count({ where: { userId: user.id, status: "ACTIVE", currentPeriodEnd: { gt: new Date(now) } } });
      if (assinou > 0) continue;
      const firstName = (user.name ?? "").trim().split(/\s+/)[0] ?? "";
      try {
        await resend.emails.send({ from: FROM, to: user.email, subject, html: html(firstName) });
        await db.emailDrip.create({ data: { userId: user.id, step } });
        sent++;
      } catch (err) {
        failed++;
        await logError({ route: "/api/cron/drip-emails#trial", method: "GET", error: err });
      }
    }
    out[step] = { sent, failed };
  }
  return out;
}
