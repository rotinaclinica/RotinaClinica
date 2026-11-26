// Ofertas que entram no checkout por link (?oferta=...). O desconto em si é um
// Coupon do banco (validado no servidor em /api/checkout/asaas); aqui fica só o
// que o modelo Coupon não guarda: o slug do link e por quantas cobranças
// recorrentes o desconto vale no plano mensal.

export const OFERTAS = {
  blackweek: {
    couponCode: "BLACKWEEK30",
    // Mensal no cartão: as 12 primeiras cobranças saem com desconto; da 13ª em
    // diante a assinatura no Asaas volta ao preço cheio (webhook do Asaas).
    ciclosMensal: 12,
  },
} as const;

export type OfertaSlug = keyof typeof OFERTAS;

export function ofertaPorSlug(slug: string | undefined | null) {
  return slug && slug in OFERTAS ? { slug: slug as OfertaSlug, ...OFERTAS[slug as OfertaSlug] } : null;
}

// Bônus de sexta da Black Week: o plano anual cujo pedido foi criado em
// 27/11/2026 (00h00–23h59 de Brasília) ganha +2 meses (61 dias), ou seja, 14
// meses de acesso. Vale pela data do pedido, para o Pix confirmado depois da
// meia-noite não perder o bônus. Usado pelos webhooks (Asaas, Mercado Pago,
// Stripe), pelo checkout e pela página /black-week.
export const BONUS_ANUAL = {
  inicio: "2026-11-27T03:00:00Z",
  fim: "2026-11-28T03:00:00Z",
  dias: 61,
} as const;

export function bonusAnualAtivo(agora: Date = new Date()): boolean {
  const t = agora.getTime();
  return t >= Date.parse(BONUS_ANUAL.inicio) && t < Date.parse(BONUS_ANUAL.fim);
}

/** Dias extras do anual para um pedido criado nesta data (0 fora do bônus). */
export function diasBonusAnual(pedidoCriadoEm: Date): number {
  return bonusAnualAtivo(pedidoCriadoEm) ? BONUS_ANUAL.dias : 0;
}

export function ciclosDoCupom(code: string | null | undefined): number | null {
  if (!code) return null;
  const o = Object.values(OFERTAS).find((x) => x.couponCode === code.toUpperCase());
  return o ? o.ciclosMensal : null;
}
