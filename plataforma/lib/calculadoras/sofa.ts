// SOFA — Sequential Organ Failure Assessment
// Vincent JL, et al. Intensive Care Med. 1996;22(7):707–710.

export interface SofaInput {
  // Respiratório — PaO₂/FiO₂
  pao2: number | null;       // mm Hg
  fio2: number | null;       // 21–100 (%)
  ventMecanica: boolean;
  // Coagulação
  plaquetas: 0 | 1 | 2 | 3 | 4;
  // Neurológico
  glasgow: 0 | 1 | 2 | 3 | 4;
  // Hepático
  bilirrubina: 0 | 1 | 2 | 3 | 4;
  // Cardiovascular
  cardiovascular: 0 | 1 | 2 | 3 | 4;
  // Renal
  renal: 0 | 1 | 2 | 3 | 4;
}

export interface SofaResult {
  total: number;
  respiratorio: number | null; // null = dados insuficientes
  pfRatio: number | null;
  label: string;
  conduta: string;
  cor: "verde" | "amarelo" | "laranja" | "vermelho";
}

export const PLAQUETAS_OPTIONS = [
  { valor: 0 as const, label: "≥ 150.000 /μL" },
  { valor: 1 as const, label: "100.000–149.000 /μL" },
  { valor: 2 as const, label: "50.000–99.000 /μL" },
  { valor: 3 as const, label: "20.000–49.000 /μL" },
  { valor: 4 as const, label: "< 20.000 /μL" },
];

export const GLASGOW_OPTIONS = [
  { valor: 0 as const, label: "15" },
  { valor: 1 as const, label: "13–14" },
  { valor: 2 as const, label: "10–12" },
  { valor: 3 as const, label: "6–9" },
  { valor: 4 as const, label: "< 6" },
];

export const BILIRRUBINA_OPTIONS = [
  { valor: 0 as const, label: "< 1,2 mg/dL" },
  { valor: 1 as const, label: "1,2–1,9 mg/dL" },
  { valor: 2 as const, label: "2,0–5,9 mg/dL" },
  { valor: 3 as const, label: "6,0–11,9 mg/dL" },
  { valor: 4 as const, label: "≥ 12,0 mg/dL" },
];

export const CARDIOVASCULAR_OPTIONS = [
  { valor: 0 as const, label: "Sem hipotensão" },
  { valor: 1 as const, label: "PAM < 70 mmHg" },
  { valor: 2 as const, label: "Dopamina ≤ 5 ou Dobutamina (qualquer dose)" },
  { valor: 3 as const, label: "Dopamina > 5, Epinefrina ≤ 0,1 ou Norepinefrina ≤ 0,1 μg/kg/min" },
  { valor: 4 as const, label: "Dopamina > 15, Epinefrina > 0,1 ou Norepinefrina > 0,1 μg/kg/min" },
];

export const RENAL_OPTIONS = [
  { valor: 0 as const, label: "< 1,2 mg/dL" },
  { valor: 1 as const, label: "1,2–1,9 mg/dL" },
  { valor: 2 as const, label: "2,0–3,4 mg/dL" },
  { valor: 3 as const, label: "3,5–4,9 mg/dL ou DU < 500 mL/dia" },
  { valor: 4 as const, label: "≥ 5,0 mg/dL ou DU < 200 mL/dia" },
];

function calcRespiratorio(pao2: number, fio2: number, mv: boolean): { score: number; pfRatio: number } {
  const ratio = pao2 / (fio2 / 100);
  let score: number;
  if (ratio >= 400)      score = 0;
  else if (ratio >= 300) score = 1;
  else if (ratio >= 200) score = 2;
  else if (ratio >= 100) score = mv ? 3 : 2;
  else                   score = mv ? 4 : 2;
  return { score, pfRatio: Math.round(ratio) };
}

export function calcularSofa(input: SofaInput): SofaResult {
  let respiratorio: number | null = null;
  let pfRatio: number | null = null;

  if (input.pao2 !== null && input.fio2 !== null && input.fio2 > 0) {
    const r = calcRespiratorio(input.pao2, input.fio2, input.ventMecanica);
    respiratorio = r.score;
    pfRatio = r.pfRatio;
  }

  const total =
    (respiratorio ?? 0) +
    input.plaquetas +
    input.glasgow +
    input.bilirrubina +
    input.cardiovascular +
    input.renal;

  const condutaSepse = "SOFA ≥ 2 com aumento agudo em relação ao basal, em paciente com infecção suspeita ou documentada, operacionaliza o diagnóstico de sepse conforme Sepsis-3. O score não é critério isolado — a presença de infecção (confirmada ou suspeita) é indispensável.";

  if (total < 2) return {
    total, respiratorio, pfRatio,
    label: "SOFA < 2 — Abaixo do limiar de disfunção orgânica",
    conduta: "Abaixo do limiar de disfunção orgânica definido pelo Sepsis-3.",
    cor: "verde",
  };
  return { total, respiratorio, pfRatio, label: "SOFA ≥ 2 — ATENÇÃO!", conduta: condutaSepse, cor: "vermelho" };
}
