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

export function ciclosDoCupom(code: string | null | undefined): number | null {
  if (!code) return null;
  const o = Object.values(OFERTAS).find((x) => x.couponCode === code.toUpperCase());
  return o ? o.ciclosMensal : null;
}
