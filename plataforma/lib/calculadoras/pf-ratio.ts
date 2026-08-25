export interface PfRatioResult {
  pf: number;
  categoria: "normal" | "leve" | "moderada" | "grave";
  label: string;
  cor: "verde" | "amarelo" | "laranja" | "vermelho";
  descricao: string;
}

export function calcularPfRatio(pao2: number, fio2Percent: number): PfRatioResult {
  const fio2 = fio2Percent / 100;
  const pf = pao2 / fio2;

  if (pf > 300)
    return { pf, categoria: "normal",   label: "Normal / Sem hipoxemia",   cor: "verde",    descricao: "Relação P/F acima do limiar de hipoxemia" };
  if (pf > 200)
    return { pf, categoria: "leve",     label: "SDRA Leve",                cor: "amarelo",  descricao: "200 < P/F ≤ 300 com PEEP ou CPAP ≥5 cmH₂O" };
  if (pf > 100)
    return { pf, categoria: "moderada", label: "SDRA Moderada",            cor: "laranja",  descricao: "100 < P/F ≤ 200 com PEEP ≥5 cmH₂O" };
  return   { pf, categoria: "grave",   label: "SDRA Grave",               cor: "vermelho", descricao: "P/F ≤ 100 com PEEP ≥5 cmH₂O" };
}
