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
  conduta: string;
  cor: "verde" | "amarelo" | "laranja" | "vermelho";
}

export function calcularMeldNa(input: MeldNaInput): MeldNaResult {
  const bili  = Math.max(input.bilirrubina, 1);
  const inr   = Math.max(input.inr, 1);
  const creat = input.dialise ? 4.0 : Math.min(Math.max(input.creatinina, 1), 4.0);
  const na    = Math.min(Math.max(input.sodio, 125), 137);

  const meldRaw = 3.78 * Math.log(bili) + 11.2 * Math.log(inr) + 9.57 * Math.log(creat) + 6.43;
  const meld    = Math.round(Math.max(meldRaw, 6));

  const meldNaRaw = meld + 1.32 * (137 - na) - 0.033 * meld * (137 - na);
  const meldNa    = Math.round(Math.min(Math.max(meldNaRaw, 6), 40));

  if (meldNa < 10) return { meld, meldNa, label: "MELD-Na < 10",  conduta: "Disfunção hepática leve. Acompanhamento ambulatorial.", cor: "verde" };
  if (meldNa < 20) return { meld, meldNa, label: "MELD-Na 10–19", conduta: "Disfunção hepática moderada. Considerar avaliação para transplante.", cor: "amarelo" };
  if (meldNa < 30) return { meld, meldNa, label: "MELD-Na 20–29", conduta: "Disfunção hepática grave. Considerar encaminhamento para transplante hepático.", cor: "laranja" };
  return                  { meld, meldNa, label: "MELD-Na ≥ 30",  conduta: "Disfunção hepática muito grave. Alta prioridade em lista de transplante.", cor: "vermelho" };
}
