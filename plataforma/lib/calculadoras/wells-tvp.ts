// Wells Score para TVP (Trombose Venosa Profunda)
// Wells PS, et al. Lancet. 1997;350(9094):1795–8 (revisado 2003)
// Interpretação: ≤0 = baixa (5%), 1–2 = moderada (17%), ≥3 = alta (17–53%)

export interface WellsTvpInput {
  cancer: boolean;
  repousoOuCirurgia: boolean;
  edemaPanturrilha: boolean;
  veicasColaterais: boolean;
  edemaTotal: boolean;
  dorVeias: boolean;
  edemaDepressivel: boolean;
  paralisiaImobilizacao: boolean;
  tvpPrevia: boolean;
  diagnosticoAlternativo: boolean;
}

export interface WellsTvpResult {
  total: number;
  probabilidade: "baixa" | "moderada" | "alta";
  label: string;
  conduta: string;
  cor: "verde" | "amarelo" | "vermelho";
}

export function calcularWellsTvp(input: WellsTvpInput): WellsTvpResult {
  const total =
    (input.cancer                  ? 1  : 0) +
    (input.repousoOuCirurgia       ? 1  : 0) +
    (input.edemaPanturrilha        ? 1  : 0) +
    (input.veicasColaterais        ? 1  : 0) +
    (input.edemaTotal              ? 1  : 0) +
    (input.dorVeias                ? 1  : 0) +
    (input.edemaDepressivel        ? 1  : 0) +
    (input.paralisiaImobilizacao   ? 1  : 0) +
    (input.tvpPrevia               ? 1  : 0) +
    (input.diagnosticoAlternativo  ? -2 : 0);

  if (total >= 3) {
    return {
      total,
      probabilidade: "alta",
      label: "Alta probabilidade — TVP provável",
      conduta: "Probabilidade pré-teste: 17–53%.\n→ Proceder diretamente ao ultrassom (US) Doppler.\n   • US positivo: tratar TVP.\n   • US negativo: solicitar D-dímero.\n      ↳ D-dímero negativo: TVP excluída.\n      ↳ D-dímero positivo: repetir US em até 1 semana.",
      cor: "vermelho",
    };
  }
  if (total >= 1) {
    return {
      total,
      probabilidade: "moderada",
      label: "Probabilidade moderada",
      conduta: "Probabilidade pré-teste: 17%.\n→ Solicitar D-dímero de alta sensibilidade (sensibilidade moderada não é suficiente).\n   • D-dímero negativo: TVP excluída (pós-teste <1%).\n   • D-dímero positivo: realizar US Doppler.\n      ↳ US negativo: TVP excluída.\n      ↳ US positivo: considerar anticoagulação.",
      cor: "amarelo",
    };
  }
  return {
    total,
    probabilidade: "baixa",
    label: "Baixa probabilidade — TVP improvável",
    conduta: "Probabilidade pré-teste: 5%.\n→ Solicitar D-dímero (sensibilidade moderada ou alta).\n   • D-dímero negativo: pós-teste <1%, sem necessidade de imagem.\n   • D-dímero positivo: realizar US Doppler.\n      ↳ US negativo: TVP excluída.\n      ↳ US positivo: considerar anticoagulação.",
    cor: "verde",
  };
}