# Sistema de Assinaturas + NFe automática

Fluxo: cliente assina (Pix via Mercado Pago **ou** cartão via Stripe) → webhook confirma
pagamento → nota fiscal é emitida via provedor externo → PDF é enviado por email.

## Arquitetura

```
Stripe webhook  ──┐
                   ├──▶ normaliza para PagamentoConfirmado ──▶ faturamento.service.ts ──▶ NFe + Email
MP webhook      ──┘
```

Os dois gateways convergem para **um único ponto** (`services/faturamento.service.ts`),
que não sabe nem precisa saber de qual gateway veio o pagamento. Isso evita duplicar a
lógica de nota fiscal em dois lugares.

## Setup

1. `npm install`
2. Copie `.env.example` para `.env` e preencha:
   - Chaves do Stripe (modo live) e o `STRIPE_WEBHOOK_SECRET` (gerado ao criar o endpoint no dashboard do Stripe)
   - Access Token do Mercado Pago
   - Credenciais do provedor de NFe escolhido (Focus NFe, NFe.io ou PlugNotas — o código usa Focus NFe como exemplo, ajuste `nfe.service.ts` se usar outro)
   - Chave da Resend (ou troque por outro provedor de email)
3. `npm run dev` para rodar localmente

## O que ainda precisa ser feito antes de produção

Este é o esqueleto arquitetural — a parte de integração está pronta, mas faltam pontos
que dependem das suas escolhas específicas:

1. **Banco de dados**: `verificarSeJaProcessado` e `marcarComoProcessado` em
   `faturamento.service.ts` estão como placeholder. Sem isso, um reenvio de webhook
   (comum tanto no Stripe quanto no MP) pode gerar nota fiscal duplicada.
2. **Cadastro de CPF/CNPJ do cliente**: o Stripe não pede documento por padrão — você
   precisa capturar isso no checkout e salvar em `customer.metadata`. O código já lê
   de lá, mas o formulário de captura fica por sua conta.
3. **Ajustar payload da NFe ao seu provedor e município**: o formato usado em
   `nfe.service.ts` é baseado na Focus NFe. Se usar NFe.io ou PlugNotas, os campos
   mudam. Se for NFS-e (serviço), as regras variam por prefeitura.
4. **Testar webhooks localmente**: use `stripe listen --forward-to localhost:3000/webhooks/stripe`
   para o Stripe. Para o Mercado Pago, use um túnel (ngrok) e cadastre a URL no
   painel de desenvolvedores.
5. **Fila de retry para o Mercado Pago**: como o webhook do MP responde 200 antes de
   processar, um erro na emissão da nota não é reenviado automaticamente. Vale considerar
   uma fila (ex: BullMQ) para reprocessar falhas.

## Estrutura de arquivos

```
src/
  config/env.ts              → variáveis de ambiente centralizadas
  types/domain.ts            → contrato comum (PagamentoConfirmado) entre os gateways
  webhooks/
    stripe.webhook.ts        → recebe e valida eventos do Stripe, normaliza
    mercadopago.webhook.ts   → recebe e valida eventos do MP, normaliza
  services/
    faturamento.service.ts   → ponto central: chama NFe + email
    nfe.service.ts           → integração com provedor de nota fiscal
    email.service.ts         → envio do email com PDF anexado
  server.ts                  → Express, registra as duas rotas de webhook
```
