import { createHash } from "crypto";
import { cookies, headers } from "next/headers";
import { after } from "next/server";
import { ADMIN_TEST_EMAILS } from "@/app/admin/_lib/excluded-emails";
import { db } from "@/lib/db";

// Conversions API da Meta: envia compra e início de teste pelo servidor, para o sinal
// não depender do navegador (bloqueador, Pix pago no celular, aba fechada). O navegador
// dispara os mesmos eventos com o mesmo event_id, e a Meta deduplica.
// Sem META_CAPI_TOKEN é no-op. Nunca lança erro: medição não pode quebrar pagamento.

const PIXEL_ID = "1052043933951264";
const GRAPH_URL = `https://graph.facebook.com/v22.0/${PIXEL_ID}/events`;

type BrowserContext = {
  fbp?: string;
  fbc?: string;
  ip?: string;
  userAgent?: string;
};

type CapiEvent = {
  name: "Purchase" | "StartTrial";
  eventId: string;
  user: { id: string; email: string; phone: string | null };
  browser?: BrowserContext;
  sourcePath: string;
  customData: { value: number; currency: string };
};

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function normalizePhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits.length === 10 || digits.length === 11 ? `55${digits}` : digits;
}

async function sendEvent(
  { name, eventId, user, browser, sourcePath, customData }: CapiEvent,
  testCode = process.env.META_CAPI_TEST_CODE,
) {
  const token = process.env.META_CAPI_TOKEN;
  if (!token) return { configured: false as const };

  // A Meta exige user agent em eventos "website". O webhook de pagamento não vê o
  // navegador do comprador, então a compra vai como evento gerado pelo sistema.
  const fromBrowser = Boolean(browser?.userAgent);

  const body = {
    data: [
      {
        event_name: name,
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        action_source: fromBrowser ? "website" : "system_generated",
        ...(fromBrowser ? { event_source_url: `${process.env.NEXT_PUBLIC_APP_URL}${sourcePath}` } : {}),
        user_data: {
          em: [sha256(user.email.trim().toLowerCase())],
          external_id: [sha256(user.id)],
          ...(user.phone ? { ph: [sha256(normalizePhone(user.phone))] } : {}),
          ...(browser?.fbp ? { fbp: browser.fbp } : {}),
          ...(browser?.fbc ? { fbc: browser.fbc } : {}),
          ...(browser?.ip ? { client_ip_address: browser.ip } : {}),
          ...(browser?.userAgent ? { client_user_agent: browser.userAgent } : {}),
        },
        custom_data: customData,
      },
    ],
    ...(testCode ? { test_event_code: testCode } : {}),
    access_token: token,
  };

  try {
    const res = await fetch(GRAPH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(5000),
    });
    const response: unknown = await res.json().catch(() => null);
    if (!res.ok) console.error(`[capi] ${name} ${eventId}: HTTP ${res.status}`, response);
    return { configured: true as const, status: res.status, response };
  } catch (err) {
    const error = err instanceof Error ? err.message : "erro";
    console.error(`[capi] ${name} ${eventId}: ${error}`);
    return { configured: true as const, status: 0, response: { error } };
  }
}

/** Teste do painel admin: os eventos só aparecem em "Eventos de Teste" e não contam nos dados reais. */
export async function sendCapiTestEvents(testCode: string, user: { id: string; email: string }) {
  const stamp = Date.now();
  const target = { ...user, phone: null };
  const [purchase, startTrial] = await Promise.all([
    sendEvent(
      {
        name: "Purchase",
        eventId: `test_purchase_${stamp}`,
        user: target,
        sourcePath: "/pedido/teste",
        customData: { value: 39.9, currency: "BRL" },
      },
      testCode,
    ),
    sendEvent(
      {
        name: "StartTrial",
        eventId: `test_trial_${stamp}`,
        user: target,
        browser: { userAgent: "capi-test" },
        sourcePath: "/dashboard",
        customData: { value: 0, currency: "BRL" },
      },
      testCode,
    ),
  ]);
  return { purchase, startTrial };
}

async function loadMeasurableUser(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, phone: true, role: true, isCourtesy: true, anonymizedAt: true },
  });
  if (!user?.email || user.role !== "CUSTOMER" || user.isCourtesy || user.anonymizedAt) return null;
  if (ADMIN_TEST_EMAILS.includes(user.email.toLowerCase())) return null;
  return user;
}

/** Primeira compra ou pagamento avulso, chamado pelos webhooks. Renovação automática não entra. */
export function trackPurchase(orderId: string) {
  after(async () => {
    try {
      const order = await db.order.findUnique({
        where: { id: orderId },
        select: { userId: true, totalCents: true, currency: true },
      });
      if (!order || order.totalCents <= 0) return;

      const user = await loadMeasurableUser(order.userId);
      if (!user) return;

      await sendEvent({
        name: "Purchase",
        eventId: `purchase_${orderId}`,
        user,
        sourcePath: `/pedido/${orderId}`,
        customData: { value: order.totalCents / 100, currency: order.currency },
      });
    } catch (err) {
      console.error(`[capi] Purchase ${orderId}: ${err instanceof Error ? err.message : "erro"}`);
    }
  });
}

/** Ativação do teste grátis, chamada dentro da requisição do próprio usuário. */
export async function trackTrialStart(userId: string) {
  const [cookieStore, hdrs] = await Promise.all([cookies(), headers()]);
  const browser: BrowserContext = {
    fbp: cookieStore.get("_fbp")?.value,
    fbc: cookieStore.get("_fbc")?.value,
    ip: hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() || undefined,
    userAgent: hdrs.get("user-agent") ?? undefined,
  };

  after(async () => {
    try {
      const user = await loadMeasurableUser(userId);
      if (!user) return;

      await sendEvent({
        name: "StartTrial",
        eventId: `trial_${userId}`,
        user,
        browser,
        sourcePath: "/dashboard",
        customData: { value: 0, currency: "BRL" },
      });
    } catch (err) {
      console.error(`[capi] StartTrial: ${err instanceof Error ? err.message : "erro"}`);
    }
  });
}
