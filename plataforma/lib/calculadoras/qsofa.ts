// qSOFA — quick Sequential Organ Failure Assessment
// Singer M, et al. JAMA. 2016;315(8):801–810. (Sepsis-3)

export interface QsofaInput {
  statusMental: boolean; // GCS < 15
  fr22: boolean;         // FR ≥ 22 irpm
  pas100: boolean;       // PAS ≤ 100 mmHg
}

export interface QsofaResult {
  total: number;
  risco: "baixo" | "alto";
  label: string;
  conduta: string;
  cor: "verde" | "vermelho";
}

export function calcularQsofa(input: QsofaInput): QsofaResult {
  const total =
    (input.statusMental ? 1 : 0) +
    (input.fr22         ? 1 : 0) +
    (input.pas100       ? 1 : 0);

  if (total >= 2) {
    return {
      total,
      risco: "alto",
      label: "Alto Risco (qSOFA ≥ 2)",
      conduta: "Considerar investigação para sepse. Avaliar disfunção orgânica com SOFA completo.",
      cor: "vermelho",
    };
  }
  return {
    total,
    risco: "baixo",
    label: "Baixo Risco (qSOFA < 2)",
    conduta: "Se sepse ainda suspeita, continuar monitorização e reavaliações seriadas.",
    cor: "verde",
  };
}
