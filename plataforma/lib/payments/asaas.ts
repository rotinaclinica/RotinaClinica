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
      value: params.valueCents / 100,
      dueDate,
      description: "Assinatura Rotina Clínica",
      installmentCount: params.installments ?? 1,
      externalReference: params.orderId,
      creditCard: params.card,
      creditCardHolderInfo: {
        name: params.holderInfo.name,
        email: params.holderInfo.email,
        cpfCnpj: params.holderInfo.cpfCnpj,
        phone: params.holderInfo.phone ?? "",
        postalCode: params.holderInfo.postalCode ?? "00000000",
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

export function verifyAsaasWebhook(token: string | null): boolean {
  const expected = process.env.ASAAS_WEBHOOK_TOKEN;
  if (!expected || !token) return false;
  return token === expected;
}
