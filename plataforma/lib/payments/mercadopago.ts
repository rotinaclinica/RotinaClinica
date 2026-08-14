import { MercadoPagoConfig, Preference } from "mercadopago";

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN ?? "placeholder",
});

export async function createMpPreference({
  orderId,
  productTitle,
  priceCents,
  customerEmail,
  successUrl,
  failureUrl,
  pendingUrl,
}: {
  orderId: string;
  productTitle: string;
  priceCents: number;
  customerEmail: string;
  successUrl: string;
  failureUrl: string;
  pendingUrl: string;
}) {
  const preference = new Preference(client);

  return preference.create({
    body: {
      items: [
        {
          id: orderId,
          title: productTitle,
          quantity: 1,
          unit_price: priceCents / 100,
          currency_id: "BRL",
        },
      ],
      payer: { email: customerEmail },
      payment_methods: {
        excluded_payment_types: [{ id: "ticket" }],
        installments: 12,
      },
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
