export type Consciencia = "alert" | "cvpu";

export interface News2Input {
  fr: number;                   // breaths/min
  hipercapnia: boolean;         // Scale 2?
  o2suplementar: boolean;
  spo2: number;                 // %
  pas: number;                  // mmHg
  fc: number;                   // bpm
  consciencia: Consciencia;
  temperatura: number;          // °C
}

export interface News2Pontos {
  fr: number;
  spo2: number;
  o2: number;
  pas: number;
  fc: number;
  consciencia: number;
  temperatura: number;
}

export interface News2Result {
  total: number;
  pontos: News2Pontos;
  temItemTres: boolean;
  risco: "baixo" | "baixo-medio" | "medio" | "alto";
  label: string;
  resposta: string;
  cor: "verde" | "amarelo" | "laranja" | "vermelho";
}

function pontFr(fr: number): number {
  if (fr <= 8)  return 3;
  if (fr <= 11) return 1;
  if (fr <= 20) return 0;
  if (fr <= 24) return 2;
  return 3;
}

function pontSpo2(spo2: number, hipercapnia: boolean, o2: boolean): number {
  if (!hipercapnia) {
    if (spo2 <= 91) return 3;
    if (spo2 <= 93) return 2;
    if (spo2 <= 95) return 1;
    return 0;
  }
  // Scale 2
  if (spo2 <= 83) return 3;
  if (spo2 <= 85) return 2;
  if (spo2 <= 87) return 1;
  if (spo2 <= 92) return 0;
  if (spo2 <= 94) return o2 ? 1 : 0;
  if (spo2 <= 96) return o2 ? 2 : 0;
  return o2 ? 3 : 0;
}

function pontPas(pas: number): number {
  if (pas <= 90)  return 3;
  if (pas <= 100) return 2;
  if (pas <= 110) return 1;
  if (pas <= 219) return 0;
  return 3;
}

function pontFc(fc: number): number {
  if (fc <= 40)  return 3;
  if (fc <= 50)  return 1;
  if (fc <= 90)  return 0;
  if (fc <= 110) return 1;
  if (fc <= 130) return 2;
  return 3;
}

function pontTemp(t: number): number {
  if (t <= 35.0) return 3;
  if (t <= 36.0) return 1;
  if (t <= 38.0) return 0;
  if (t <= 39.0) return 1;
  return 2;
}

export function calcularNews2(input: News2Input): News2Result {
  const pontos: News2Pontos = {
    fr:          pontFr(input.fr),
    spo2:        pontSpo2(input.spo2, input.hipercapnia, input.o2suplementar),
    o2:          input.o2suplementar ? 2 : 0,
    pas:         pontPas(input.pas),
    fc:          pontFc(input.fc),
    consciencia: input.consciencia === "cvpu" ? 3 : 0,
    temperatura: pontTemp(input.temperatura),
  };

  const total = Object.values(pontos).reduce((a, b) => a + b, 0);
  const temItemTres = Object.values(pontos).some((p) => p === 3);

  let risco: News2Result["risco"];
  let label: string;
  let resposta: string;
  let cor: News2Result["cor"];

  if (total >= 7) {
    risco = "alto"; label = "Risco clínico alto"; cor = "vermelho";
    resposta = "Avaliação emergencial pela equipe clínica ou UTI; geralmente é necessária transferência para nível mais alto de cuidado/suporte (exemplo: leito de UTI)";
  } else if (total >= 5) {
    risco = "medio"; label = "Risco clínico médio"; cor = "laranja";
    resposta = "Revisão urgente pelo médico ou enfermeiro; avaliar necessidade de encaminhar paciente para leito de UTI.";
  } else if (temItemTres) {
    risco = "baixo-medio"; label = "Risco clínico baixo-médio"; cor = "amarelo";
    resposta = "Revisão urgente pelo médico da enfermaria; reavaliar frequência de monitorização ou escalonamento de cuidado";
  } else {
    risco = "baixo"; label = "Risco clínico baixo"; cor = "verde";
    resposta = "Avaliação por enfermeiro; monitorar a cada 12h (score 0) ou a cada 4–6h (score 1–4)";
  }

  return { total, pontos, temItemTres, risco, label, resposta, cor };
}
