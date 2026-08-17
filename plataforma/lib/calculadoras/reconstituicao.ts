export type TipoFrasco = "po" | "liquido";

export interface ReconstitucaoInput {
  tipo: TipoFrasco;
  mgFrasco: number;
  volReconstituicao: number;
  concentracaoAmpola: number;
  volAmpola: number;
}

export interface EtapaUmResult {
  totalMg: number;
  concentracao: number; // mg/mL
  volFinal: number;     // mL disponíveis
}

export interface DiluicaoResult {
  totalMg: number;
  vol100: number;
  vol250: number;
  vol500: number;
}

export function calcEtapaUm(input: ReconstitucaoInput): EtapaUmResult {
  if (input.tipo === "po") {
    return {
      totalMg: input.mgFrasco,
      concentracao: input.mgFrasco / input.volReconstituicao,
      volFinal: input.volReconstituicao,
    };
  } else {
    return {
      totalMg: input.concentracaoAmpola * input.volAmpola,
      concentracao: input.concentracaoAmpola,
      volFinal: input.volAmpola,
    };
  }
}

export function calcDiluicao(concentracao: number, volDraw: number): DiluicaoResult {
  const totalMg = concentracao * volDraw;
  return {
    totalMg,
    vol100: totalMg / 100,
    vol250: totalMg / 250,
    vol500: totalMg / 500,
  };
}

export function fmt(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(2).replace(/\.?0+$/, "") + " g";
  if (n < 0.01) return n.toFixed(4) + " mg";
  if (n < 1)    return n.toFixed(3).replace(/\.?0+$/, "") + " mg";
  return n.toFixed(2).replace(/\.?0+$/, "") + " mg";
}

export function fmtConc(n: number): string {
  if (n < 0.01) return n.toFixed(4) + " mg/mL";
  if (n < 1)    return n.toFixed(3).replace(/\.?0+$/, "") + " mg/mL";
  return n.toFixed(2).replace(/\.?0+$/, "") + " mg/mL";
}
