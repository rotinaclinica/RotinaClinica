// Dose de Dobutamina via BIC
// Fórmula: dose (mcg/kg/min) = [concentração (mcg/mL) × vazão (mL/h)] / [peso (kg) × 60]

export type SolucaoDobu = "padrao" | "concentrada";

export const SOLUCOES_DOBU: Record<SolucaoDobu, { label: string; concentracao: number; descricao: string }> = {
  padrao:      { label: "Solução Padrão",      concentracao: 2000, descricao: "500 mg (2 ampolas) em 250 mL · 2000 mcg/mL" },
  concentrada: { label: "Solução Concentrada", concentracao: 4000, descricao: "1000 mg (4 ampolas) em 250 mL · 4000 mcg/mL" },
};

export interface DobutaminaInput {
  vazao:   number;       // mL/h
  peso:    number;       // kg
  solucao: SolucaoDobu;
}

export interface DobutaminaResult {
  dose: number;          // mcg/kg/min (3 decimais)
  cor: "verde" | "amarelo" | "laranja" | "vermelho";
}

export function calcularDobutamina(input: DobutaminaInput): DobutaminaResult {
  const { vazao, peso, solucao } = input;
  const concentracao = SOLUCOES_DOBU[solucao].concentracao;
  const dose = (concentracao * vazao) / (peso * 60);

  let cor: DobutaminaResult["cor"];
  if (dose <= 5)       cor = "verde";
  else if (dose <= 10) cor = "amarelo";
  else if (dose <= 15) cor = "laranja";
  else                 cor = "vermelho";

  return { dose: Math.round(dose * 1000) / 1000, cor };
}
