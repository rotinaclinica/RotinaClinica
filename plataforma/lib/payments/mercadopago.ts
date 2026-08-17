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
      payer: {
        email: customerEmail,
        ...(customerName && {
          name: customerName.split(" ")[0],
          surname: customerName.split(" ").slice(1).join(" ") || customerName.split(" ")[0],
        }),
        ...(customerCpf && {
          identification: { type: "CPF", number: customerCpf },
        }),
      },
      payment_methods: {
        excluded_payment_types: [{ id: "ticket" }],
        installments: 12,
      },
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
