export interface DocstageAula {
  id: number;
  titulo: string;
  duracao: string;
  descricao?: string;
}

export interface DocstageModulo {
  id: string;
  titulo: string;
  descricao: string;
  aulas: DocstageAula[];
}

export const DOCSTAGE_MODULOS: DocstageModulo[] = [
  {
    id: "alem-do-plantao",
    titulo: "Além do Plantão: Construindo uma Carreira Médica Segura e Sustentável",
    descricao:
      "Este módulo especial, apresentado pela Docstage, aborda temas fundamentais para a construção de uma carreira médica sólida.",
    aulas: [
      {
        id: 1,
        titulo: "Primeiros Passos da Vida Profissional Médica",
        duracao: "",
        descricao:
          "Você começou a atuar ou está prestes a ingressar no mercado? Nesta aula, vamos apresentar os principais modelos de contratação médica, os momentos em que a abertura de CNPJ se torna necessária, os cuidados e os impactos tributários de cada escolha.",
      },
      {
        id: 2,
        titulo: "Proteção Jurídica e Segurança na Prática Médica",
        duracao: "",
        descricao:
          "A rotina médica envolve responsabilidades que vão além do atendimento clínico. Nesta aula, abordaremos conceitos importantes sobre ética médica, documentação adequada, comunicação com pacientes, responsabilidade profissional e condutas preventivas que contribuem para uma atuação mais segura nos plantões e demais ambientes assistenciais.",
      },
      {
        id: 3,
        titulo: "Instagram para Médicos: Presença Digital com Ética e Estratégia",
        duracao: "",
        descricao:
          "As redes sociais se tornaram uma importante ferramenta de relacionamento e posicionamento profissional. Nesta aula, você aprenderá boas práticas para utilizar o Instagram de forma ética e estratégica, compreendendo os cuidados necessários com biografia, conteúdos, imagens, marcações, depoimentos e divulgação de informações médicas.",
      },
    ],
  },
];

export function getDocstageModulo(id: string): DocstageModulo | undefined {
  return DOCSTAGE_MODULOS.find((m) => m.id === id);
}

export function getDocstageAula(
  moduloId: string,
  aulaId: number
): DocstageAula | undefined {
  return getDocstageModulo(moduloId)?.aulas.find((a) => a.id === aulaId);
}
