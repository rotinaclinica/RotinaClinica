export interface Aula {
  id: number;
  titulo: string;
  duracao: string;
  descricao?: string;
  // youtubeId is server-only — see lib/cursos-videos.ts
}

export interface Modulo {
  id: number;
  titulo: string;
  aulas: Aula[];
}

export const CURSO_TITULO = "Destravando o Plantão";

export const MODULOS: Modulo[] = [
  {
    id: 1,
    titulo: "Destravando o plantão",
    aulas: [
      {
        id: 1,
        titulo: "Bem-vindo (a) ao Destravando o Plantão!",
        duracao: "15:10",
        descricao: "Bem-vindo ao Destravando o Plantão.\n\nSe você já se sentiu inseguro diante de um paciente, teve dúvidas sobre qual exame solicitar, qual medicação prescrever ou qual conduta adotar, este curso foi feito para você.\n\nAqui, você aprenderá um passo a passo prático para conduzir as 10 queixas mais prevalentes do paciente adulto nos serviços de urgência e atenção primária, sempre com foco naquilo que realmente importa na prática clínica.\n\nAo final do curso, você terá mais confiança para avaliar, diagnosticar e tratar seus pacientes, além de acesso a materiais de apoio desenvolvidos para facilitar sua rotina de atendimentos.\n\nAgora é hora de começar. Vamos destravar o plantão!",
      },
      {
        id: 2,
        titulo: "Infecções do trato urinário: o que todo plantonista precisa dominar.",
        duracao: "27:46",
      },
      {
        id: 3,
        titulo: "Radiografia de tórax no plantão: o essencial para o generalista.",
        duracao: "16:22",
      },
      {
        id: 4,
        titulo: "Urticária e Anafilaxia: abordagem prática no plantão.",
        duracao: "13:50",
      },
      {
        id: 5,
        titulo: "Diarreia Aguda: decisões que mudam a conduta.",
        duracao: "14:27",
      },
      {
        id: 6,
        titulo: "Infecções respiratórias: o que realmente importa no atendimento.",
        duracao: "30:12",
      },
      {
        id: 7,
        titulo: "ECG no plantão: o essencial para o generalista.",
        duracao: "23:13",
      },
    ],
  },
];

export function getAllAulas(): Aula[] {
  return MODULOS.flatMap((m) => m.aulas);
}

export function getAulaById(id: number): Aula | undefined {
  return getAllAulas().find((a) => a.id === id);
}

export function getModuloByAulaId(id: number): Modulo | undefined {
  return MODULOS.find((m) => m.aulas.some((a) => a.id === id));
}
