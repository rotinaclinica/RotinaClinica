// Score de Pádua — Risco de TEV em pacientes clínicos internados
// Barbar S, et al. J Thromb Haemost. 2010;8(11):2450–2457.

export interface PaduaInput {
  cancerAtivo: boolean;          // +3
  tevPrevio: boolean;            // +3
  mobilidadeReduzida: boolean;   // +3
  trombofiliaConhecida: boolean; // +3
  traumaCirurgiaRecente: boolean;// +2
  idade70: boolean;              // +1
  iccOuIr: boolean;              // +1
  iamOuAvc: boolean;             // +1
  infeccaoOuReumatologico: boolean; // +1
  obesidade: boolean;            // +1
  hormonioterapia: boolean;      // +1
}

export interface PaduaResult {
  total: number;
  risco: "baixo" | "alto";
  label: string;
  conduta: string;
  cor: "verde" | "vermelho";
}

export function calcularPadua(input: PaduaInput): PaduaResult {
  let total = 0;
  if (input.cancerAtivo) total += 3;
  if (input.tevPrevio) total += 3;
  if (input.mobilidadeReduzida) total += 3;
  if (input.trombofiliaConhecida) total += 3;
  if (input.traumaCirurgiaRecente) total += 2;
  if (input.idade70) total += 1;
  if (input.iccOuIr) total += 1;
  if (input.iamOuAvc) total += 1;
  if (input.infeccaoOuReumatologico) total += 1;
  if (input.obesidade) total += 1;
  if (input.hormonioterapia) total += 1;

  if (total >= 4) {
    return {
      total,
      risco: "alto",
      label: "Alto Risco de TEV",
      conduta: "Considerar quimioprofilaxia (caso não haja contraindicação).",
      cor: "vermelho",
    };
  }
  return {
    total,
    risco: "baixo",
    label: "Baixo Risco de TEV",
    conduta: "Profilaxia farmacológica NÃO indicada. Considerar profilaxia mecânica.",
    cor: "verde",
  };
}
