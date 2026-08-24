// IMC = peso(kg) / altura(m)²
// Classificação ASMBS — American Society for Metabolic and Bariatric Surgery

export interface ImcInput {
  peso: number;   // kg
  altura: number; // cm
}

export interface ImcResult {
  imc: number;
  label: string;
  cor: "azul" | "verde" | "amarelo" | "laranja" | "vermelho" | "vermelho-escuro";
}

export const IMC_TABELA = [
  { faixa: "< 18,5",       label: "Abaixo do peso (magreza)", cor: "azul"           },
  { faixa: "18,5 – 24,9",  label: "Peso normal (eutrófico)",  cor: "verde"          },
  { faixa: "25 – 29,9",    label: "Sobrepeso",               cor: "amarelo"        },
  { faixa: "30 – 34,9",    label: "Obesidade Grau I",   cor: "laranja"         },
  { faixa: "35 – 39,9",    label: "Obesidade Grau II",  cor: "vermelho"        },
  { faixa: "≥ 40",         label: "Obesidade Grau III", cor: "vermelho-escuro" },
] as const;

export function calcularImc(input: ImcInput): ImcResult {
  const alturaM = input.altura / 100;
  const imc = input.peso / (alturaM * alturaM);

  if (imc < 18.5) return { imc, label: "Abaixo do peso (magreza)", cor: "azul"  };
  if (imc < 25)   return { imc, label: "Peso normal (eutrófico)",   cor: "verde" };
  if (imc < 30)   return { imc, label: "Sobrepeso",                  cor: "amarelo"         };
  if (imc < 35)   return { imc, label: "Obesidade Grau I",   cor: "laranja"         };
  if (imc < 40)   return { imc, label: "Obesidade Grau II",  cor: "vermelho"        };
  return           { imc, label: "Obesidade Grau III",        cor: "vermelho-escuro" };
}
