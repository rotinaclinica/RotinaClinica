// CKD-EPI 2021 (sem raça) — KDIGO 2021
// eGFR = 142 × min(SCr/κ, 1)^α × max(SCr/κ, 1)^−1.200 × 0.9938^Idade × 1.012 [se F]

export type Sexo = "M" | "F";

export interface CkdEpiInput {
  sexo: Sexo;
  idade: number;   // anos, 18–120
  creatinina: number; // mg/dL
}

export interface CkdEpiResult {
  egfr: number;
  estadio: string;
  descricao: string;
  interpretacao: string;
  cor: "verde" | "amarelo-verde" | "amarelo" | "laranja" | "vermelho";
}

export function calcularCkdEpi({ sexo, idade, creatinina }: CkdEpiInput): CkdEpiResult {
  const kappa = sexo === "F" ? 0.7 : 0.9;
  const alpha = sexo === "F" ? -0.241 : -0.302;
  const sexoFator = sexo === "F" ? 1.012 : 1.0;

  const ratio = creatinina / kappa;
  const minTerm = Math.pow(Math.min(ratio, 1.0), alpha);
  const maxTerm = Math.pow(Math.max(ratio, 1.0), -1.200);
  const idadeTerm = Math.pow(0.9938, idade);

  const egfr = Math.round((142 * minTerm * maxTerm * idadeTerm * sexoFator) * 10) / 10;

  return { egfr, ...interpretarEgfr(egfr) };
}

function interpretarEgfr(egfr: number): Omit<CkdEpiResult, "egfr"> {
  if (egfr >= 90) return {
    estadio: "G1",
    descricao: "Normal ou elevado",
    interpretacao: "Função renal normal. Avaliar presença de marcadores de lesão renal (proteinúria, hematúria, alterações morfológicas).",
    cor: "verde",
  };
  if (egfr >= 60) return {
    estadio: "G2",
    descricao: "Levemente reduzido",
    interpretacao: "Redução leve da função renal. Monitorar anualmente com urinálise e pressão arterial.",
    cor: "amarelo-verde",
  };
  if (egfr >= 45) return {
    estadio: "G3a",
    descricao: "Leve a moderadamente reduzido",
    interpretacao: "DRC estabelecida. Encaminhar ao nefrologista se progressão rápida. Ajustar doses de medicamentos.",
    cor: "amarelo",
  };
  if (egfr >= 30) return {
    estadio: "G3b",
    descricao: "Moderada a gravemente reduzido",
    interpretacao: "Referência nefrológica indicada. Avaliar anemia, hiperparatireoidismo e doença cardiovascular.",
    cor: "laranja",
  };
  if (egfr >= 15) return {
    estadio: "G4",
    descricao: "Gravemente reduzido",
    interpretacao: "Preparar para terapia renal substitutiva. Acompanhamento nefrológico obrigatório.",
    cor: "vermelho",
  };
  return {
    estadio: "G5",
    descricao: "Falência renal",
    interpretacao: "Falência renal. Indicação de diálise ou transplante. Encaminhamento urgente ao nefrologista.",
    cor: "vermelho",
  };
}
