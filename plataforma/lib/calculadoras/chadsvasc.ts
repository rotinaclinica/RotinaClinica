// CHA₂DS₂-VA — risco de AVC em fibrilação atrial (sem critério sexo)
export interface ChadsvascInput {
  insuficienciaCardiaca: boolean;  // C  — +1
  hipertensao: boolean;            // H  — +1
  idade75: boolean;                // A2 — +2
  diabetes: boolean;               // D  — +1
  avcOuTia: boolean;               // S2 — +2
  doencaVascular: boolean;         // V  — +1
  idade65a74: boolean;             // A  — +1
}

export interface ChadsvascResult {
  total: number;
  maxPontos: number;
  riscoAnual: string;
  conduta: string;
  cor: "verde" | "amarelo" | "vermelho";
}

export function calcularChadsvasc(input: ChadsvascInput): ChadsvascResult {
  const total =
    (input.insuficienciaCardiaca ? 1 : 0) +
    (input.hipertensao ? 1 : 0) +
    (input.idade75 ? 2 : 0) +
    (input.diabetes ? 1 : 0) +
    (input.avcOuTia ? 2 : 0) +
    (input.doencaVascular ? 1 : 0) +
    (input.idade65a74 ? 1 : 0);

  if (total === 0) return {
    total, maxPontos: 8,
    riscoAnual: "Muito baixo",
    conduta: "Anticoagulação não recomendada.",
    cor: "verde",
  };
  if (total === 1) return {
    total, maxPontos: 8,
    riscoAnual: "Baixo",
    conduta: "Usar julgamento clínico para avaliar riscos e benefícios da anticoagulação.",
    cor: "amarelo",
  };
  return {
    total, maxPontos: 8,
    riscoAnual: total <= 3 ? "Moderado" : total <= 5 ? "Alto" : "Muito alto",
    conduta: "Anticoagulação oral recomendada para reduzir risco de AVC. Considerar avaliar risco de sangramento (HAS-BLED).",
    cor: "vermelho",
  };
}
