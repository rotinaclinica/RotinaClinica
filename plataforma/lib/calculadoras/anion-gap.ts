export interface AnionGapResult {
  ag: number;
  agCorrigido: number | null;
  categoria: "normal" | "elevado";
  label: string;
  cor: "verde" | "laranja";
  descricao: string;
}

export function calcularAnionGap(
  na: number,
  cl: number,
  hco3: number,
  albumina?: number,
): AnionGapResult {
  const ag = na - (cl + hco3);
  const agCorrigido = albumina != null
    ? ag + 2.5 * (4.5 - albumina)
    : null;

  const agRef = agCorrigido ?? ag;

  if (agRef <= 12) {
    return { ag, agCorrigido, categoria: "normal", label: "Normal", cor: "verde",
      descricao: "Ânion gap dentro do intervalo de referência (10 ± 2 mEq/L)" };
  }
  return { ag, agCorrigido, categoria: "elevado", label: "Elevado", cor: "laranja",
    descricao: "Ânion gap elevado — considerar acidose metabólica com AG elevado (MUDPILES)" };
}
