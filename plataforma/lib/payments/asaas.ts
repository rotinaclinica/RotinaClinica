function base(): string {
  return process.env.ASAAS_BASE_URL ?? "https://api.asaas.com/v3";
}

function headers(): Record<string, string> {
  return {
    access_token: process.env.ASAAS_API_KEY ?? "",
    "Content-Type": "application/json",
  };
}

async function firstError(res: Response, fallback: string): Promise<string> {
  const body = await res.json().catch(() => ({}));
  return body?.errors?.[0]?.description ?? body?.message ?? `${fallback} (HTTP ${res.status})`;
}

export async function createAsaasCustomer(params: {
  name: string;
  email: string;
  cpfCnpj: string;
  externalReference: string;
}): Promise<string> {
  const res = await fetch(`${base()}/customers`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error(await firstError(res, "Erro ao criar cliente no Asaas"));
  const data = await res.json();
  return data.id as string;
}

export async function createAsaasPixPayment(params: {
  customerId: string;
  orderId: string;
  valueCents: number;
}): Promise<{ paymentId: string; qrCodeBase64: string; pixCode: string }> {
  const dueDate = new Date().toISOString().slice(0, 10);
  const res = await fetch(`${base()}/payments`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      customer: params.customerId,
      billingType: "PIX",
      value: params.valueCents / 100,
      dueDate,
      description: "Assinatura Rotina Clínica",
      externalReference: params.orderId,
    }),
  });
  if (!res.ok) throw new Error(await firstError(res, "Erro ao criar pagamento PIX"));
  const payment = await res.json();

  const qrRes = await fetch(`${base()}/payments/${payment.id}/pixQrCode`, {
    headers: headers(),
  });
  if (!qrRes.ok) throw new Error("Erro ao obter QR code PIX");
  const qr = await qrRes.json();

  return {
    paymentId: payment.id as string,
    qrCodeBase64: qr.encodedImage as string,
    pixCode: qr.payload as string,
  };
}

export async function createAsaasCardPayment(params: {
  customerId: string;
  orderId: string;
  valueCents: number;
  installments?: number;
  card: {
    holderName: string;
    number: string;
    expiryMonth: string;
    expiryYear: string;
    ccv: string;
  };
  holderInfo: {
    name: string;
    email: string;
    cpfCnpj: string;
    phone?: string;
    postalCode?: string;
    addressNumber?: string;
  };
  remoteIp: string;
}): Promise<{ paymentId: string; status: string; failReason?: string }> {
  const dueDate = new Date().toISOString().slice(0, 10);
  const res = await fetch(`${base()}/payments`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      customer: params.customerId,
      billingType: "CREDIT_CARD",
      dueDate,
      description: "Assinatura Rotina Clínica",
      // Parcelado: o Asaas divide o totalValue e acerta os centavos (ex.: R$ 400 em
      // 12x não fecha em parcelas iguais, e installmentValue arredondado perderia centavos).
      ...((params.installments ?? 1) > 1
        ? { installmentCount: params.installments, totalValue: params.valueCents / 100 }
        : { value: params.valueCents / 100 }),
      externalReference: params.orderId,
      creditCard: params.card,
      creditCardHolderInfo: {
        name: params.holderInfo.name,
        email: params.holderInfo.email,
        cpfCnpj: params.holderInfo.cpfCnpj,
        phone: params.holderInfo.phone ?? "",
        ...(params.holderInfo.postalCode ? { postalCode: params.holderInfo.postalCode } : {}),
        addressNumber: params.holderInfo.addressNumber ?? "0",
      },
      remoteIp: params.remoteIp,
    }),
  });
  if (!res.ok) throw new Error(await firstError(res, "Erro ao processar cartão"));
  const payment = await res.json();
  return {
    paymentId: payment.id as string,
    status: payment.status as string,
    failReason: payment.creditCard?.creditCardNumber ? undefined : payment.failReason,
  };
}

export async function getAsaasPixQrCode(
  paymentId: string
): Promise<{ qrCodeBase64: string; pixCode: string } | null> {
  const res = await fetch(`${base()}/payments/${paymentId}/pixQrCode`, {
    headers: headers(),
  });
  if (!res.ok) return null;
  const qr = await res.json();
  return { qrCodeBase64: qr.encodedImage as string, pixCode: qr.payload as string };
}

export async function createAsaasSubscription(params: {
  customerId: string;
  orderId: string;
  valueCents: number;
  cycle: "MONTHLY" | "YEARLY";
  card: {
    holderName: string;
    number: string;
    expiryMonth: string;
    expiryYear: string;
    ccv: string;
  };
  holderInfo: {
    name: string;
    email: string;
    cpfCnpj: string;
    phone?: string;
    postalCode?: string;
    addressNumber?: string;
  };
  remoteIp: string;
}): Promise<{ subscriptionId: string; status: string; failReason?: string }> {
  const nextDueDate = new Date().toISOString().slice(0, 10);
  const res = await fetch(`${base()}/subscriptions`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      customer: params.customerId,
      billingType: "CREDIT_CARD",
      value: params.valueCents / 100,
      nextDueDate,
      cycle: params.cycle,
      description: "Assinatura Rotina Clínica",
      externalReference: params.orderId,
      creditCard: params.card,
      creditCardHolderInfo: {
        name: params.holderInfo.name,
        email: params.holderInfo.email,
        cpfCnpj: params.holderInfo.cpfCnpj,
        phone: params.holderInfo.phone ?? "",
        ...(params.holderInfo.postalCode ? { postalCode: params.holderInfo.postalCode } : {}),
        addressNumber: params.holderInfo.addressNumber ?? "0",
      },
      remoteIp: params.remoteIp,
    }),
  });
  if (!res.ok) throw new Error(await firstError(res, "Erro ao criar assinatura recorrente"));
  const data = await res.json();
  return {
    subscriptionId: data.id as string,
    status: data.status as string,
    failReason: data.creditCard?.creditCardNumber ? undefined : data.failReason,
  };
}

/**
 * Mensal no Pix com cobrança recorrente: o Asaas gera uma cobrança Pix por mês e
 * avisa o cliente; antes, o mensal no Pix era um pagamento avulso de 30 dias que
 * quase nunca era renovado. Ligado só com ASAAS_PIX_MENSAL=1 (ver pixMensalRecorrente).
 * Devolve o QR da 1ª cobrança, que o Asaas cria junto com a assinatura.
 */
export async function createAsaasPixSubscription(params: {
  customerId: string;
  orderId: string;
  valueCents: number;
}): Promise<{ subscriptionId: string; paymentId: string; qrCodeBase64: string; pixCode: string }> {
  const nextDueDate = new Date().toISOString().slice(0, 10);
  const res = await fetch(`${base()}/subscriptions`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      customer: params.customerId,
      billingType: "PIX",
      value: params.valueCents / 100,
      nextDueDate,
      cycle: "MONTHLY",
      description: "Assinatura Rotina Clínica",
      externalReference: params.orderId,
    }),
  });
  if (!res.ok) throw new Error(await firstError(res, "Erro ao criar assinatura Pix"));
  const sub = await res.json();

  const payRes = await fetch(`${base()}/subscriptions/${sub.id}/payments`, { headers: headers() });
  if (!payRes.ok) throw new Error(await firstError(payRes, "Erro ao obter a cobrança da assinatura Pix"));
  const first = (await payRes.json())?.data?.[0];
  if (!first?.id) throw new Error("Assinatura Pix criada sem cobrança inicial");

  const qr = await getAsaasPixQrCode(first.id);
  if (!qr) throw new Error("Erro ao obter QR code PIX");
  return { subscriptionId: sub.id as string, paymentId: first.id as string, ...qr };
}

export function pixMensalRecorrente(): boolean {
  return process.env.ASAAS_PIX_MENSAL === "1";
}

// Muda o valor das próximas cobranças da assinatura (inclusive a já gerada e
// ainda pendente), usada quando termina o período com desconto.
export async function updateAsaasSubscriptionValue(subscriptionId: string, valueCents: number): Promise<void> {
  const res = await fetch(`${base()}/subscriptions/${subscriptionId}`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ value: valueCents / 100, updatePendingPayments: true }),
  });
  if (!res.ok) throw new Error(await firstError(res, "Erro ao atualizar valor da assinatura"));
}

export async function cancelAsaasSubscription(subscriptionId: string): Promise<void> {
  await fetch(`${base()}/subscriptions/${subscriptionId}`, {
    method: "DELETE",
    headers: headers(),
  });
}

export function verifyAsaasWebhook(token: string | null): boolean {
  const expected = process.env.ASAAS_WEBHOOK_TOKEN;
  if (!expected || !token) return false;
  return token === expected;
}
