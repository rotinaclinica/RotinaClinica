export type Sexo = "masculino" | "feminino";

export interface QtcResult {
  qtc: number;
  rr: number;
  categoria: "normal" | "limítrofe" | "prolongado" | "critico";
  label: string;
  cor: "verde" | "amarelo" | "laranja" | "vermelho";
  descricao: string;
}

export function calcularQtc(qt: number, fc: number, sexo: Sexo): QtcResult {
  const rr = 60 / fc; // RR em segundos
  const qtc = qt / Math.sqrt(rr);

  if (qtc > 500) {
    return { qtc, rr, categoria: "critico", label: "QTc > 500 ms", cor: "vermelho",
      descricao: "Alto risco de Torsades de Pointes — revisar todos os fármacos que prolongam QT e corrigir distúrbios eletrolíticos" };
  }

  if (sexo === "masculino") {
    if (qtc < 460) return  { qtc, rr, categoria: "normal",    label: "Normal",    cor: "verde",
      descricao: "QTc dentro do limite normal para homens (< 460 ms)" };
    if (qtc < 470) return  { qtc, rr, categoria: "limítrofe", label: "Limítrofe", cor: "amarelo",
      descricao: "QTc limítrofe em homens (460–469 ms) — atenção a fármacos e eletrólitos" };
    return                 { qtc, rr, categoria: "prolongado", label: "Prolongado", cor: "laranja",
      descricao: "QTc prolongado em homens (≥ 470 ms) — investigar causa e avaliar risco de arritmia" };
  } else {
    if (qtc < 470) return  { qtc, rr, categoria: "normal",    label: "Normal",    cor: "verde",
      descricao: "QTc dentro do limite normal para mulheres (< 470 ms)" };
    if (qtc < 480) return  { qtc, rr, categoria: "limítrofe", label: "Limítrofe", cor: "amarelo",
      descricao: "QTc limítrofe em mulheres (470–479 ms) — atenção a fármacos e eletrólitos" };
    return                 { qtc, rr, categoria: "prolongado", label: "Prolongado", cor: "laranja",
      descricao: "QTc prolongado em mulheres (≥ 480 ms) — investigar causa e avaliar risco de arritmia" };
  }
}
