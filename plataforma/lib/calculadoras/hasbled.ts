// HAS-BLED — risco de sangramento maior em anticoagulados com FA
export interface HasbledInput {
  hipertensao: boolean;       // H  — HAS não controlada (PA sistólica >160 mmHg)     +1
  disfuncaoRenal: boolean;    // A1 — Disfunção renal (diálise, Cr >2,26 mg/dL)       +1
  disfuncaoHepatica: boolean; // A2 — Disfunção hepática (cirrose ou bili >2×normal)  +1
  avc: boolean;               // S  — Histórico de AVC                                +1
  sangramento: boolean;       // B  — Sangramento prévio ou predisposição             +1
  inrLabil: boolean;          // L  — INR lábil (tempo na faixa terapêutica <60%)     +1
  idadeAcima65: boolean;      // E  — Idade > 65 anos                                 +1
  medicamentos: boolean;      // D1 — Antiagregantes/AINEs (AAS, clopidogrel, AINE)  +1
  alcool: boolean;            // D2 — Uso de álcool (≥8 doses/semana)                +1
}

export interface HasbledResult {
  total: number;
  maxPontos: number;
  grupo: string;
  riscoAnual: string;
  conduta: string;
  cor: "verde" | "amarelo" | "vermelho";
}

export function calcularHasbled(input: HasbledInput): HasbledResult {
  const total =
    (input.hipertensao ? 1 : 0) +
    (input.disfuncaoRenal ? 1 : 0) +
    (input.disfuncaoHepatica ? 1 : 0) +
    (input.avc ? 1 : 0) +
    (input.sangramento ? 1 : 0) +
    (input.inrLabil ? 1 : 0) +
    (input.idadeAcima65 ? 1 : 0) +
    (input.medicamentos ? 1 : 0) +
    (input.alcool ? 1 : 0);

  if (total === 0) return {
    total, maxPontos: 9, grupo: "Baixo",
    riscoAnual: "0,9%",
    conduta: "Anticoagulação deve ser considerada.",
    cor: "verde",
  };
  if (total === 1) return {
    total, maxPontos: 9, grupo: "Baixo",
    riscoAnual: "3,4%",
    conduta: "Anticoagulação deve ser considerada.",
    cor: "verde",
  };
  if (total === 2) return {
    total, maxPontos: 9, grupo: "Moderado",
    riscoAnual: "4,1%",
    conduta: "Anticoagulação pode ser considerada. Revisar fatores modificáveis.",
    cor: "amarelo",
  };
  if (total === 3) return {
    total, maxPontos: 9, grupo: "Alto",
    riscoAnual: "5,8%",
    conduta: "Identificar e corrigir fatores de risco modificáveis antes de anticoagular.",
    cor: "vermelho",
  };
  if (total === 4) return {
    total, maxPontos: 9, grupo: "Alto",
    riscoAnual: "8,9%",
    conduta: "Identificar e corrigir fatores de risco modificáveis antes de anticoagular.",
    cor: "vermelho",
  };
  if (total === 5) return {
    total, maxPontos: 9, grupo: "Alto",
    riscoAnual: "9,1%",
    conduta: "Identificar e corrigir fatores de risco modificáveis antes de anticoagular.",
    cor: "vermelho",
  };
  return {
    total, maxPontos: 9, grupo: "Muito alto",
    riscoAnual: "—",
    conduta: "Risco muito elevado. Identificar e corrigir fatores de risco modificáveis.",
    cor: "vermelho",
  };
}
