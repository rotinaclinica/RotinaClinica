// MELD-Na Score — priorização em transplante hepático
// Biggins SW, et al. Gastroenterology. 2006;130(6):1652–1660.
// Kim WR, et al. Hepatology. 2008;47(5):1407–1417.

export interface MeldNaInput {
  bilirrubina: number; // mg/dL
  inr: number;
  creatinina: number;  // mg/dL
  sodio: number;       // mEq/L
  dialise: boolean;    // creatinina → 4,0 se em diálise (≥2x/semana)
}

export interface MeldNaResult {
  meld: number;
  meldNa: number;
  label: string;
  cor: "verde" | "amarelo" | "laranja" | "vermelho";
}

export function calcularMeldNa(input: MeldNaInput): MeldNaResult {
  const bili  = Math.max(input.bilirrubina, 1);
  const inr   = Math.max(input.inr, 1);
  const creat = input.dialise ? 4.0 : Math.min(Math.max(input.creatinina, 1), 4.0);
  const na    = Math.min(Math.max(input.sodio, 125), 137);

  // OPTN: compute in "small" form, round to 1 decimal, then ×10
  const meldSmallRaw = 0.957 * Math.log(creat) + 0.378 * Math.log(bili) + 1.120 * Math.log(inr) + 0.643;
  const meldSmall    = Math.round(meldSmallRaw * 10) / 10;   // round to 1 decimal place
  const meldI        = Math.round(meldSmall * 10);            // ×10 → integer
  const meld         = Math.max(meldI, 6);

  // Na correction only when MELD(i) > 11 (OPTN policy Jan 2016)
  const meldNaRaw = meld > 11
    ? meld + 1.32 * (137 - na) - 0.033 * meld * (137 - na)
    : meld;
  const meldNa    = Math.round(Math.min(Math.max(meldNaRaw, 6), 40));

  if (meldNa < 10) return { meld, meldNa, label: "MELD-Na < 10",  cor: "verde" };
  if (meldNa < 20) return { meld, meldNa, label: "MELD-Na 10–19", cor: "amarelo" };
  if (meldNa < 30) return { meld, meldNa, label: "MELD-Na 20–29", cor: "laranja" };
  return                  { meld, meldNa, label: "MELD-Na ≥ 30",  cor: "vermelho" };
}
