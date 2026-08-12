// Escala de Coma de Glasgow (GCS)
// Teasdale G, Jennett B. Lancet. 1974;2(7872):81–84.

export type GCSValor = number | null; // null = NT (não testável)

export interface GlasgowInput {
  ocular: GCSValor; // 1-4 ou null
  verbal: GCSValor; // 1-5 ou null
  motor:  GCSValor; // 1-6 ou null
}

export interface GlasgowResult {
  total: number | null; // null se algum componente for NT
  label_score: string;  // ex: "E3VNTm6"
  gravidade: "leve" | "moderado" | "grave" | "indeterminado";
  label: string;
  conduta: string;
  cor: "verde" | "amarelo" | "vermelho" | "zinc";
}

export const OCULAR_OPTIONS: { valor: GCSValor; label: string }[] = [
  { valor: 4, label: "Espontânea" },
  { valor: 3, label: "À voz" },
  { valor: 2, label: "À dor" },
  { valor: 1, label: "Sem abertura ocular" },
  { valor: null, label: "Não testável (NT)" },
];

export const VERBAL_OPTIONS: { valor: GCSValor; label: string }[] = [
  { valor: 5, label: "Orientado" },
  { valor: 4, label: "Confuso" },
  { valor: 3, label: "Palavras inapropriadas" },
  { valor: 2, label: "Sons incompreensíveis" },
  { valor: 1, label: "Sem resposta verbal" },
  { valor: null, label: "Não testável / intubado (NT)" },
];

export const MOTOR_OPTIONS: { valor: GCSValor; label: string }[] = [
  { valor: 6, label: "Obedece a comandos" },
  { valor: 5, label: "Localiza a dor" },
  { valor: 4, label: "Retirada à dor (flexão normal)" },
  { valor: 3, label: "Flexão anormal à dor (decorticação)" },
  { valor: 2, label: "Extensão anormal à dor (descerebração)" },
  { valor: 1, label: "Sem resposta motora" },
  { valor: null, label: "Não testável (NT)" },
];

export function calcularGlasgow(input: GlasgowInput): GlasgowResult {
  const { ocular, verbal, motor } = input;

  const e = ocular ?? 0;
  const v = verbal ?? 0;
  const m = motor   ?? 0;

  const temNT = ocular === null || verbal === null || motor === null;
  const total = temNT ? null : e + v + m;

  const labelE = ocular === null ? "NT" : `E${ocular}`;
  const labelV = verbal === null ? "NT" : `V${verbal}`;
  const labelM = motor  === null ? "NT" : `M${motor}`;
  const label_score = `${labelE} ${labelV} ${labelM}`;

  // Usa total calculável ou soma dos componentes testáveis para orientar conduta
  const soma = e + v + m;

  if (temNT) return {
    total: null, label_score,
    gravidade: "indeterminado",
    label: "Score com NT",
    conduta: "Um ou mais componentes não testáveis. Avalie clínicamente cada componente.",
    cor: "zinc",
  };
  if (soma >= 13) return {
    total, label_score,
    gravidade: "leve",
    label: "TCE / Rebaixamento Leve",
    conduta: "",
    cor: "verde",
  };
  if (soma >= 9) return {
    total, label_score,
    gravidade: "moderado",
    label: "TCE / Rebaixamento Moderado",
    conduta: "",
    cor: "amarelo",
  };
  return {
    total, label_score,
    gravidade: "grave",
    label: "TCE / Rebaixamento Grave",
    conduta: "",
    cor: "vermelho",
  };
}
