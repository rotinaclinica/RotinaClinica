// CURB-65 e CRB-65 — gravidade da pneumonia adquirida na comunidade

export interface Curb65Input {
  confusao: boolean;
  ureia: boolean;
  frequenciaResp: boolean;
  pressaoArterial: boolean;
  idade65: boolean;
}

export interface Crb65Input {
  confusao: boolean;
  frequenciaResp: boolean;
  pressaoArterial: boolean;
  idade65: boolean;
}

export interface ScoreResult {
  total: number;
  maxPontos: number;
  label: string;
  conduta: string;
  cor: "verde" | "amarelo" | "vermelho";
}

export function calcularCurb65(input: Curb65Input): ScoreResult {
  const total = [input.confusao, input.ureia, input.frequenciaResp, input.pressaoArterial, input.idade65]
    .filter(Boolean).length;

  if (total <= 1) return {
    total, maxPontos: 5,
    label: "Baixo Risco",
    conduta: "Considerar tratamento ambulatorial.",
    cor: "verde",
  };
  if (total === 2) return {
    total, maxPontos: 5,
    label: "Risco Moderado",
    conduta: "Considerar internação em enfermaria.",
    cor: "amarelo",
  };
  return {
    total, maxPontos: 5,
    label: "Alto Risco",
    conduta: "Internação (incluindo até UTI, se maior gravidade).",
    cor: "vermelho",
  };
}

export function calcularCrb65(input: Crb65Input): ScoreResult {
  const total = [input.confusao, input.frequenciaResp, input.pressaoArterial, input.idade65]
    .filter(Boolean).length;

  if (total === 0) return {
    total, maxPontos: 4,
    label: "Baixo Risco",
    conduta: "Considerar tratamento ambulatorial.",
    cor: "verde",
  };
  if (total <= 2) return {
    total, maxPontos: 4,
    label: "Risco Moderado",
    conduta: "Considerar internação em enfermaria.",
    cor: "amarelo",
  };
  return {
    total, maxPontos: 4,
    label: "Alto Risco",
    conduta: "Internação (incluindo até UTI, se maior gravidade).",
    cor: "vermelho",
  };
}
