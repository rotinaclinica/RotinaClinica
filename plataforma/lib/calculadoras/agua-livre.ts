export type Sexo = "masculino" | "feminino";
export type FaixaEtaria = "crianca" | "adulto" | "idoso";

export interface AguaLivreInput {
  sexo: Sexo;
  faixaEtaria: FaixaEtaria;
  peso: number;
  sodioAtual: number;
  sodioDesejado: number;
}

export interface AguaLivreResult {
  deficit: number;
  deficit24h: number;
  tbwFracao: number;
  sodioMeta24h: number;
}

export function getTbwFracao(sexo: Sexo, faixaEtaria: FaixaEtaria): number {
  if (faixaEtaria === "crianca") return 0.6;
  if (faixaEtaria === "adulto") return sexo === "masculino" ? 0.6 : 0.5;
  return sexo === "masculino" ? 0.5 : 0.45;
}

export function calcularAguaLivre(input: AguaLivreInput): AguaLivreResult {
  const tbwFracao = getTbwFracao(input.sexo, input.faixaEtaria);
  const deficit = tbwFracao * input.peso * (input.sodioAtual / input.sodioDesejado - 1);
  const sodioMeta24h = Math.max(input.sodioDesejado, input.sodioAtual - 10);
  const deficit24h = tbwFracao * input.peso * (input.sodioAtual / sodioMeta24h - 1);
  return {
    deficit: Math.max(0, deficit),
    deficit24h: Math.max(0, deficit24h),
    tbwFracao,
    sodioMeta24h,
  };
}
