// Dose de Noradrenalina via BIC
// Fórmula: dose (mcg/kg/min) = [concentração (mcg/mL) × vazão (mL/h)] / [peso (kg) × 60]

export type SolucaoNora = "padrao" | "concentrada";

export const SOLUCOES: Record<SolucaoNora, { label: string; concentracao: number; descricao: string }> = {
  padrao:      { label: "Solução Padrão",      concentracao: 64,  descricao: "16 mg em 250 mL · 64 mcg/mL" },
  concentrada: { label: "Solução Concentrada", concentracao: 128, descricao: "32 mg em 250 mL · 128 mcg/mL" },
};

export interface NoradrenalinaInput {
  vazao:   number;       // mL/h
  peso:    number;       // kg
  solucao: SolucaoNora;
}

export interface NoradrenalinaResult {
  dose: number;          // mcg/kg/min (3 decimais)
  cor: "verde" | "amarelo" | "laranja" | "vermelho";
}

export function calcularNoradrenalina(input: NoradrenalinaInput): NoradrenalinaResult {
  const { vazao, peso, solucao } = input;
  const concentracao = SOLUCOES[solucao].concentracao;
  const dose = (concentracao * vazao) / (peso * 60);

  let cor: NoradrenalinaResult["cor"];
  if (dose <= 0.25)      cor = "verde";
  else if (dose <= 0.5)  cor = "amarelo";
  else if (dose <= 1.0)  cor = "laranja";
  else                   cor = "vermelho";

  return { dose: Math.round(dose * 1000) / 1000, cor };
}
