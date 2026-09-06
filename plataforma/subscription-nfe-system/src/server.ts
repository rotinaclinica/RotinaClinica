import express from "express";
import { env } from "./config/env";
import { stripeWebhookHandler } from "./webhooks/stripe.webhook";
import { mercadoPagoWebhookHandler } from "./webhooks/mercadopago.webhook";

const app = express();

// O Stripe exige o body RAW (nao parseado) para validar a assinatura do webhook,
// entao essa rota tem que vir ANTES do express.json() global.
app.post("/webhooks/stripe", express.raw({ type: "application/json" }), stripeWebhookHandler);

// A partir daqui, JSON normal para as demais rotas
app.use(express.json());

app.post("/webhooks/mercadopago", mercadoPagoWebhookHandler);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(env.port, () => {
  console.log(`Servidor rodando na porta ${env.port}`);
  console.log(`Webhook Stripe:       POST /webhooks/stripe`);
  console.log(`Webhook Mercado Pago: POST /webhooks/mercadopago`);
});
