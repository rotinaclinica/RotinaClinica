// Child-Pugh Score — gravidade da cirrose hepática
// Pugh RN, et al. Br J Surg. 1973;60(8):646–649.

export interface ChildPughInput {
  bilirrubina: 1 | 2 | 3;    // mg/dL
  albumina: 1 | 2 | 3;       // g/dL
  inr: 1 | 2 | 3;
  ascite: 1 | 2 | 3;
  encefalopatia: 1 | 2 | 3;
}

export interface ChildPughResult {
  total: number;
  classe: "A" | "B" | "C";
  label: string;
  descricao: string;
  sobrevida1ano: string;
  sobrevida2anos: string;
  cor: "verde" | "amarelo" | "vermelho";
}

export const BILIRRUBINA_CP = [
  { valor: 1 as const, label: "< 2 mg/dL" },
  { valor: 2 as const, label: "2–3 mg/dL" },
  { valor: 3 as const, label: "> 3 mg/dL" },
];

export const ALBUMINA_CP = [
  { valor: 1 as const, label: "> 3,5 g/dL" },
  { valor: 2 as const, label: "2,8–3,5 g/dL" },
  { valor: 3 as const, label: "< 2,8 g/dL" },
];

export const INR_CP = [
  { valor: 1 as const, label: "< 1,7" },
  { valor: 2 as const, label: "1,7–2,3" },
  { valor: 3 as const, label: "> 2,3" },
];

export const ASCITE_CP = [
  { valor: 1 as const, label: "Ausente" },
  { valor: 2 as const, label: "Leve" },
  { valor: 3 as const, label: "Moderada" },
];

export const ENCEFALOPATIA_CP = [
  { valor: 1 as const, label: "Ausente" },
  { valor: 2 as const, label: "Grau 1–2" },
  { valor: 3 as const, label: "Grau 3–4" },
];

export function calcularChildPugh(input: ChildPughInput): ChildPughResult {
  const total =
    input.bilirrubina +
    input.albumina +
    input.inr +
    input.ascite +
    input.encefalopatia;

  if (total <= 6) return { total, classe: "A", label: "Child-Pugh Classe A", descricao: "Doença bem compensada",                     sobrevida1ano: "100%", sobrevida2anos: "85%", cor: "verde" };
  if (total <= 9) return { total, classe: "B", label: "Child-Pugh Classe B", descricao: "Comprometimento funcional significativo",     sobrevida1ano: "80%",  sobrevida2anos: "60%", cor: "amarelo" };
  return             { total, classe: "C", label: "Child-Pugh Classe C", descricao: "Doença descompensada",                        sobrevida1ano: "45%",  sobrevida2anos: "35%", cor: "vermelho" };
}
