// Wells Score para TEP (Tromboembolismo Pulmonar)
// Wells PS, et al. Ann Intern Med. 2001;135(2):98–107.

export interface WellsTepInput {
  sinaisTVP: boolean;              // 3 pts
  diagnosticoAlternativo: boolean; // 3 pts — TEP é o diagnóstico mais (ou igualmente) provável
  fc100: boolean;                  // 1.5 pts
  imobilizacaoOuCirurgia: boolean; // 1.5 pts
  tevPrevio: boolean;              // 1.5 pts
  hemoptise: boolean;              // 1 pt
  neoplasia: boolean;              // 1 pt
}

export interface WellsTepResult {
  total: number;
  probabilidade: "improvavel" | "provavel";
  label: string;
  conduta: string;
  cor: "verde" | "vermelho";
}

export function calcularWellsTep(input: WellsTepInput): WellsTepResult {
  const total =
    (input.sinaisTVP              ? 3   : 0) +
    (input.diagnosticoAlternativo ? 3   : 0) +
    (input.fc100                  ? 1.5 : 0) +
    (input.imobilizacaoOuCirurgia ? 1.5 : 0) +
    (input.tevPrevio              ? 1.5 : 0) +
    (input.hemoptise              ? 1   : 0) +
    (input.neoplasia              ? 1   : 0);

  if (total <= 4) {
    return {
      total,
      probabilidade: "improvavel",
      label: "TEP Improvável",
      conduta: "Considerar D-dímero. Se negativo, TEP excluído.",
      cor: "verde",
    };
  }
  return {
    total,
    probabilidade: "provavel",
    label: "TEP Provável",
    conduta: "Considerar angiotomografia de tórax.",
    cor: "vermelho",
  };
}
