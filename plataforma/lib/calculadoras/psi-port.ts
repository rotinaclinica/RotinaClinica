// PSI/PORT — Pneumonia Severity Index
// Fine MJ, et al. NEJM. 1997;336(4):243-250.

export type SexoPSI = "M" | "F";

export interface PsiPortInput {
  sexo: SexoPSI;
  idade: number;
  asilo: boolean;
  neoplasia: boolean;
  hepatopatia: boolean;
  icc: boolean;
  doencaCerebrovascular: boolean;
  doencaRenal: boolean;
  sensorioAlterado: boolean;
  fr30: boolean;
  pas90: boolean;
  tempAnormal: boolean; // < 35°C ou > 39,9°C
  fc125: boolean;
  phArterial: boolean;  // < 7,35
  ureia78: boolean;     // > 78 mg/dL
  sodio130: boolean;    // < 130 mEq/L
  glicose250: boolean;  // ≥ 250 mg/dL
  hematocrito30: boolean;
  pao260: boolean;
  derrameEleural: boolean;
}

export interface PsiPortResult {
  total: number;
  risco: "muito-baixo" | "baixo" | "baixo-moderado" | "moderado" | "alto";
  label: string;
  conduta: string;
  mortalidade: string;
  cor: "verde" | "amarelo" | "laranja" | "vermelho";
}

export function calcularPsiPort(input: PsiPortInput): PsiPortResult {
  // Step 1: triagem para Classe I (pacientes de baixíssimo risco, sem necessidade de pontuação)
  const step1_falhou =
    input.idade > 50 ||
    input.neoplasia || input.hepatopatia || input.icc ||
    input.doencaCerebrovascular || input.doencaRenal ||
    input.sensorioAlterado || input.fc125 || input.fr30 ||
    input.pas90 || input.tempAnormal;

  if (!step1_falhou) {
    return {
      total: 0,
      risco: "muito-baixo",
      label: "Classe I — Baixo Risco",
      conduta: "Considerar tratamento ambulatorial.",
      mortalidade: "0,1%",
      cor: "verde",
    };
  }

  // Step 2: cálculo por pontos (Classes II–V)
  let pontos = input.sexo === "M" ? input.idade : input.idade - 10;

  if (input.asilo) pontos += 10;
  if (input.neoplasia) pontos += 30;
  if (input.hepatopatia) pontos += 20;
  if (input.icc) pontos += 10;
  if (input.doencaCerebrovascular) pontos += 10;
  if (input.doencaRenal) pontos += 10;
  if (input.sensorioAlterado) pontos += 20;
  if (input.fr30) pontos += 20;
  if (input.pas90) pontos += 20;
  if (input.tempAnormal) pontos += 15;
  if (input.fc125) pontos += 10;
  if (input.phArterial) pontos += 30;
  if (input.ureia78) pontos += 20;
  if (input.sodio130) pontos += 20;
  if (input.glicose250) pontos += 10;
  if (input.hematocrito30) pontos += 10;
  if (input.pao260) pontos += 10;
  if (input.derrameEleural) pontos += 10;

  const total = Math.max(0, pontos);

  if (total <= 70) return {
    total, risco: "baixo", label: "Classe II — Baixo Risco",
    conduta: "Considerar tratamento ambulatorial.",
    mortalidade: "0,6%",
    cor: "verde",
  };
  if (total <= 90) return {
    total, risco: "baixo-moderado", label: "Classe III — Baixo Risco",
    conduta: "Considerar breve internação para observação.",
    mortalidade: "2,8%",
    cor: "amarelo",
  };
  if (total <= 130) return {
    total, risco: "moderado", label: "Classe IV — Risco Moderado",
    conduta: "Considerar internação hospitalar.",
    mortalidade: "8,2%",
    cor: "laranja",
  };
  return {
    total, risco: "alto", label: "Classe V — Alto Risco",
    conduta: "Considerar internação hospitalar (incluindo UTI, se maior gravidade).",
    mortalidade: "29,2%",
    cor: "vermelho",
  };
}
