export interface BradenResult {
  score: number;
  categoria: "minimo" | "baixo" | "moderado" | "alto";
  label: string;
  cor: "verde" | "amarelo" | "laranja" | "vermelho";
  descricao: string;
}

export function calcularBraden(respostas: number[]): BradenResult {
  const score = respostas.reduce((a, b) => a + b, 0);

  if (score >= 17) return { score, categoria: "minimo",   label: "Risco mínimo",    cor: "verde",
    descricao: "Risco mínimo de lesão por pressão (17–23 pontos)" };
  if (score >= 15) return { score, categoria: "baixo",    label: "Risco baixo",     cor: "amarelo",
    descricao: "Risco baixo de lesão por pressão (15–16 pontos)" };
  if (score >= 13) return { score, categoria: "moderado", label: "Risco moderado",  cor: "laranja",
    descricao: "Risco moderado de lesão por pressão (13–14 pontos)" };
  return              { score, categoria: "alto",     label: "Risco alto",      cor: "vermelho",
    descricao: "Risco alto de lesão por pressão (6–12 pontos)" };
}
