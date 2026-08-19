// Índice de Choque = FC / PAS
// Allgöwer M, Burri C. Dtsch Med Wochenschr. 1967;92(43):1947–50.
// Mutschler et al. Crit Care. 2013. Cannon et al. J Trauma. 2009.
// Normal aceito: 0,5–0,7. SI ≥ 0,9 associado a mortalidade >2× maior.

export interface IndiceChoqueInput {
  fc: number;  // Frequência cardíaca (bpm)
  pas: number; // Pressão arterial sistólica (mmHg)
}

export interface IndiceChoqueResult {
  indice: number;
  label: string;
  conduta: string;
  cor: "verde" | "amarelo" | "laranja" | "vermelho";
}

export function calcularIndiceChoque(input: IndiceChoqueInput): IndiceChoqueResult {
  if (input.pas <= 0) throw new Error("PAS inválida");
  const indice = input.fc / input.pas;

  if (indice < 0.7) {
    return {
      indice,
      label: "Normal",
      conduta: "Sem sinais de instabilidade hemodinâmica pelo índice de choque.",
      cor: "verde",
    };
  }
  if (indice < 0.9) {
    return {
      indice,
      label: "Atenção — borderline",
      conduta: "Valores até 0,9 podem ser aceitáveis em alguns contextos. Monitorizar sinais vitais e avaliar o quadro clínico.",
      cor: "amarelo",
    };
  }
  if (indice < 1.0) {
    return {
      indice,
      label: "Elevado — risco aumentado",
      conduta: "Pacientes com IC > 0,9 apresentaram mortalidade significativamente maior (15,9%) em comparação com pacientes com IC normal (6,3%).",
      cor: "laranja",
    };
  }
  return {
    indice,
    label: "Instabilidade hemodinâmica — choque provável",
    conduta: "IC ≥ 1,0 indica choque estabelecido.",
    cor: "vermelho",
  };
}