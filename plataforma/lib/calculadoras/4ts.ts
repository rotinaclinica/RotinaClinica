export interface QuatroTsResult {
  score: number;
  probabilidade: "baixa" | "intermediaria" | "alta";
  ppv: string;
  label: string;
  cor: "verde" | "amarelo" | "vermelho";
}

export function calcularQuatroTs(respostas: number[]): QuatroTsResult {
  const score = respostas.reduce((a, b) => a + b, 0);
  if (score <= 3) return { score, probabilidade: "baixa",        ppv: "<1%",  label: "Baixa probabilidade",         cor: "verde"    };
  if (score <= 5) return { score, probabilidade: "intermediaria", ppv: "~14%", label: "Probabilidade intermediária",  cor: "amarelo"  };
  return           { score, probabilidade: "alta",          ppv: "~64%", label: "Alta probabilidade",          cor: "vermelho" };
}
