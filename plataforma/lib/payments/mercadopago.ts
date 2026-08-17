import { MercadoPagoConfig, Preference } from "mercadopago";

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN ?? "placeholder",
});

export async function createMpPreference({
  orderId,
  productTitle,
  priceCents,
  customerEmail,
  customerCpf,
  customerName,
  customerPhone,
  customerCreatedAt,
  successUrl,
  failureUrl,
  pendingUrl,
}: {
  orderId: string;
  productTitle: string;
  priceCents: number;
  customerEmail: string;
  customerCpf?: string;
  customerName?: string;
  customerPhone?: string;
  customerCreatedAt?: Date;
  successUrl: string;
  failureUrl: string;
  pendingUrl: string;
}) {
  const preference = new Preference(client);

  const phoneObj = customerPhone
    ? { area_code: customerPhone.slice(0, 2), number: customerPhone.slice(2) }
    : undefined;

  const firstName = customerName?.split(" ")[0];
  const lastName = customerName?.split(" ").slice(1).join(" ") || firstName;

  return preference.create({
    body: {
      items: [
        {
          id: orderId,
          title: productTitle,
          quantity: 1,
          unit_price: priceCents / 100,
          currency_id: "BRL",
          category_id: "education",
        },
      ],
      payer: {
        email: customerEmail,
        ...(firstName && { name: firstName, surname: lastName }),
        ...(customerCpf && { identification: { type: "CPF", number: customerCpf } }),
        ...(phoneObj && { phone: phoneObj }),
      },
      additional_info: {
        items: [
          {
            id: orderId,
            title: productTitle,
            quantity: 1,
            unit_price: priceCents / 100,
            category_id: "education",
          },
        ],
        payer: {
          ...(firstName && { first_name: firstName, last_name: lastName ?? "" }),
          ...(phoneObj && { phone: phoneObj }),
          ...(customerCreatedAt && {
            registration_date: customerCreatedAt.toISOString(),
          }),
        },
      },
      payment_methods: {
        excluded_payment_types: [{ id: "ticket" }],
        excluded_payment_methods: [],
        installments: 12,
      },
      binary_mode: false,
      statement_descriptor: "Rotina Clinica",
      external_reference: orderId,
      back_urls: {
        success: successUrl,
        failure: failureUrl,
        pending: pendingUrl,
      },
      auto_return: "approved",
      notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/mercadopago`,
    },
  });
}
