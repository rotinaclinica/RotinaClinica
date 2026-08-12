// HEART Score — estratificação de risco em dor torácica
// Backus BE, et al. Neth Heart J. 2010;18(9):422-428.

export interface HeartScoreInput {
  historia: 0 | 1 | 2;
  ecg: 0 | 1 | 2;
  idade: 0 | 1 | 2;
  fatoresRisco: 0 | 1 | 2;
  troponina: 0 | 1 | 2;
}

export interface HeartScoreResult {
  total: number;
  risco: "baixo" | "moderado" | "alto";
  label: string;
  mace: string;
  conduta: string;
  cor: "verde" | "amarelo" | "vermelho";
}

export function calcularHeartScore(input: HeartScoreInput): HeartScoreResult {
  const total = input.historia + input.ecg + input.idade + input.fatoresRisco + input.troponina;

  if (total <= 3) {
    return {
      total,
      risco: "baixo",
      label: "Baixo Risco",
      mace: "~2%",
      conduta: "Alta precoce com segurança. Acompanhamento ambulatorial.",
      cor: "verde",
    };
  }
  if (total <= 6) {
    return {
      total,
      risco: "moderado",
      label: "Risco Moderado",
      mace: "~15%",
      conduta: "Internação para observação e realização de estratificação não invasiva (ecocardiograma de estresse, teste ergométrico, angiotomografia das artérias coronárias).",
      cor: "amarelo",
    };
  }
  return {
    total,
    risco: "alto",
    label: "Alto Risco",
    mace: "~50%",
    conduta: "Internação e realização de estratégia invasiva precoce (em até 24h).",
    cor: "vermelho",
  };
}
