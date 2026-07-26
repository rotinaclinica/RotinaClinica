import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-06-24.dahlia",
});

export async function createStripeCheckoutSession({
  orderId,
  productTitle,
  priceCents,
  currency,
  customerEmail,
  successUrl,
  cancelUrl,
}: {
  orderId: string;
  productTitle: string;
  priceCents: number;
  currency: string;
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
}) {
  return stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: customerEmail,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: currency.toLowerCase(),
          unit_amount: priceCents,
          product_data: { name: productTitle },
        },
      },
    ],
    metadata: { orderId },
    success_url: successUrl,
    cancel_url: cancelUrl,
  });
}
