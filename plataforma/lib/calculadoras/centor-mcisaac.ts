export interface CentorMcIsaacInput {
  febre: boolean;
  ausenciaTose: boolean;
  adenopatia: boolean;
  exsudato: boolean;
  faixaEtaria: "3-14" | "15-44" | "45+" | null;
}

export interface CentorResult {
  total: number;
  probabilidade: string;
  conduta: string;
  cor: "verde" | "amarelo" | "vermelho";
}

export function calcularCentorMcIsaac(input: CentorMcIsaacInput): CentorResult {
  const centor = [input.febre, input.ausenciaTose, input.adenopatia, input.exsudato]
    .filter(Boolean).length;
  const idadeAjuste = input.faixaEtaria === "3-14" ? 1 : input.faixaEtaria === "45+" ? -1 : 0;
  const total = centor + idadeAjuste;

  if (total <= 0) return {
    total,
    probabilidade: "1–2,5%",
    conduta: "Não tratar. Probabilidade muito baixa de etiologia bacteriana.",
    cor: "verde",
  };
  if (total === 1) return {
    total,
    probabilidade: "5–10%",
    conduta: "Não tratar. Considerar cultura de secreção de orofaringe se disponível.",
    cor: "verde",
  };
  if (total === 2) return {
    total,
    probabilidade: "11–17%",
    conduta: "Tratar empiricamente ou colher cultura antes de iniciar antibiótico.",
    cor: "amarelo",
  };
  if (total === 3) return {
    total,
    probabilidade: "28–35%",
    conduta: "Tratar empiricamente com antibiótico.",
    cor: "vermelho",
  };
  return {
    total,
    probabilidade: "51–53%",
    conduta: "Tratar empiricamente. Probabilidade muito alta de Streptococcus do grupo A.",
    cor: "vermelho",
  };
}
