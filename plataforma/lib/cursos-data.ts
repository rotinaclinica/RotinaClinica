export interface Material {
  id: string;
  titulo: string;
  arquivo: string; // relative to public/cursos/aula-{aulaId}/
  tamanho?: string;
}

export interface Aula {
  id: number;
  titulo: string;
  duracao: string;
  descricao?: string;
  pasta?: string; // folder name inside public/ (e.g. "aulaitu")
  materiais?: Material[];
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
        pasta: "aulaitu",
        descricao: "As infecções do trato urinário (ITUs) estão entre as queixas mais comuns nos serviços de urgência e atenção primária.\n\nNesta aula, você aprenderá uma abordagem prática e sistematizada para avaliar, diagnosticar e tratar esses pacientes com segurança e confiança.\n\nDomine as principais decisões do manejo da ITU e evite as armadilhas mais frequentes do plantão.\n\nAlém da aula, você terá acesso a materiais de apoio exclusivos desenvolvidos para facilitar sua prática clínica:\n\n✅ Material teórico atualizado e baseado em evidências.\n\n✅ Guia de prescrição com orientações práticas para os principais cenários clínicos.\n\n✅ Guia de evolução com modelos prontos para tornar seus atendimentos mais rápidos e eficientes.",
        materiais: [
          { id: "material-teorico", titulo: "Material de Apoio - ITU", arquivo: "Material de Apoio ITU.pdf", tamanho: "1,2 MB" },
          { id: "guia-evolucao", titulo: "Modelo de Evolução - ITU", arquivo: "Modelo de Evolução - ITU.pdf", tamanho: "814 KB" },
          { id: "guia-prescricao", titulo: "Modelo de Prescrição - ITU", arquivo: "Modelo de Prescrição - ITU.pdf", tamanho: "1,3 MB" },
        ],
      },
      {
        id: 3,
        titulo: "Radiografia de tórax no plantão: o essencial para o generalista.",
        duracao: "16:22",
        descricao: "A radiografia de tórax é um dos exames complementares mais solicitados na prática clínica e uma ferramenta fundamental para a tomada de decisão em UPA, Pronto-Socorro e Atenção Primária.\n\nAprenda uma abordagem sistematizada para interpretar radiografias de tórax com rapidez, segurança e confiança.\n\nNesta aula, você verá o passo a passo para analisar os principais achados radiológicos e reconhecer alterações frequentes da prática clínica sem travar diante da imagem.\n\nEsta aula, assim como todas as demais do curso, conta com material de apoio exclusivo:\n\n✅ Material teórico atualizado e baseado em evidências.",
        pasta: "aularaiox",
        materiais: [
          { id: "material-teorico", titulo: "Material de Apoio - Radiografia de Tórax", arquivo: "Material de Apoio Radiografia de tórax.pdf", tamanho: "5,2 MB" },
        ],
      },
      {
        id: 4,
        titulo: "Urticária e Anafilaxia: abordagem prática no plantão.",
        duracao: "13:50",
        descricao: "As reações alérgicas são causas frequentes de atendimento em UPA, Pronto-Socorro e Atenção Primária, exigindo reconhecimento rápido e condutas adequadas.\n\nAprenda uma abordagem sistematizada para avaliar pacientes com urticária e anafilaxia de forma rápida, segura e baseada em evidências.\n\nNesta aula, você verá o passo a passo para diferenciar essas condições, reconhecer sinais de gravidade e conduzir o tratamento adequado sem travar diante da queixa.\n\nEsta aula, assim como todas as demais do curso, conta com materiais de apoio exclusivos:\n\n✅ Material teórico atualizado e baseado em evidências.\n\n✅ Guia de prescrição com orientações práticas para os principais cenários clínicos.\n\n✅ Guia de evolução com modelos prontos para tornar seus atendimentos mais rápidos e eficientes.",
        pasta: "aulaalergias",
        materiais: [
          { id: "material-teorico", titulo: "Material de Apoio - Alergias", arquivo: "Material de Apoio Alergias.pdf", tamanho: "1,3 MB" },
          { id: "guia-evolucao", titulo: "Modelo de Evolução - Alergias", arquivo: "Modelo de Evolução - Alergias.pdf", tamanho: "792 KB" },
          { id: "guia-prescricao", titulo: "Modelo de Prescrição - Alergias", arquivo: "Modelo de Prescrição - Alergias.pdf", tamanho: "521 KB" },
        ],
      },
      {
        id: 5,
        titulo: "Diarreia Aguda: decisões que mudam a conduta.",
        duracao: "14:27",
        descricao: "A diarreia aguda está entre as queixas mais frequentes na Atenção Primária, UPA e Pronto-Socorro, exigindo avaliação criteriosa para identificar sinais de gravidade e definir a melhor conduta.\n\nAprenda uma abordagem sistematizada para avaliar pacientes com diarreia aguda de forma rápida, segura e baseada em evidências.\n\nNesta aula, você verá o passo a passo para estratificar o risco do paciente, reconhecer sinais de alarme, indicar exames quando necessários e conduzir o tratamento adequado sem travar diante da queixa.\n\nEsta aula, assim como todas as demais do curso, conta com materiais de apoio exclusivos:\n\n✅ Material teórico atualizado e baseado em evidências.\n\n✅ Guia de prescrição com orientações práticas para os principais cenários clínicos.\n\n✅ Guia de evolução com modelos prontos para tornar seus atendimentos mais rápidos e eficientes.",
        pasta: "auladiarreia",
        materiais: [
          { id: "material-teorico", titulo: "Material de Apoio - Diarreia Aguda", arquivo: "Material de Apoio Diarreia aguda.pdf", tamanho: "519 KB" },
          { id: "guia-evolucao", titulo: "Modelo de Evolução - Diarreia Aguda", arquivo: "Modelo de Evolução - Diarreia Aguda.pdf", tamanho: "1,1 MB" },
          { id: "guia-prescricao", titulo: "Modelo de Prescrição - Diarreia Aguda", arquivo: "Modelo de Prescrição - Diarreia aguda.pdf", tamanho: "1,1 MB" },
        ],
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
