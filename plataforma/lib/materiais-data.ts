export type Aula = {
  id: string;
  titulo: string;
  descricao: string;
  tamanho: string;
};

export type Tema = {
  id: string;
  nome: string;
  descricao: string;
  logo: string;
  aulas: Aula[];
};

export const AULAS_TEMAS: Tema[] = [
  {
    id: "gastro-hepato",
    nome: "Gastroenterologia/Hepatologia",
    descricao: "Aulas sobre o aparelho digestivo e o fígado.",
    logo: "/logos-temas/gastro-hepato.png",
    aulas: [
      { id: "diarreia-cronica", titulo: "Diarreia Crônica", descricao: "Material de apoio sobre a abordagem da diarreia crônica.", tamanho: "1,3 MB" },
      { id: "enzimas-hepaticas", titulo: "Enzimas Hepáticas, Icterícia e Cirrose Hepática", descricao: "Material de apoio sobre enzimas hepáticas, icterícia e cirrose hepática.", tamanho: "2,1 MB" },
      { id: "hepatites-virais", titulo: "Hepatites Virais", descricao: "Material de apoio sobre as hepatites virais.", tamanho: "1,6 MB" },
      { id: "pancreatite", titulo: "Pancreatite Aguda e Crônica", descricao: "Material de apoio sobre pancreatite aguda e crônica.", tamanho: "2,0 MB" },
      { id: "constipacao-intestinal", titulo: "Abordagem da Constipação Intestinal", descricao: "Material de apoio com abordagem prática e baseada em evidências para o manejo da constipação intestinal.", tamanho: "2,3 MB" },
      { id: "nauseas-vomitos", titulo: "Abordagem de Náuseas e Vômitos", descricao: "Material de apoio com abordagem sistematizada para avaliar e tratar náuseas e vômitos no plantão.", tamanho: "2,9 MB" },
      { id: "drge", titulo: "DRGE e suas complicações — o essencial para o generalista", descricao: "Diagnóstico e tratamento da doença do refluxo gastroesofágico e suas principais complicações.", tamanho: "4,4 MB" },
    ],
  },
  {
    id: "disturbios-eletroliticos",
    nome: "Distúrbios Eletrolíticos",
    descricao: "Aulas sobre distúrbios dos eletrólitos.",
    logo: "/logos-temas/disturbios-eletroliticos.png",
    aulas: [
      { id: "disturbios-potassio", titulo: "Distúrbios do Potássio", descricao: "Abordagem sistemática da hipocalemia e hipercalemia: causas, diagnóstico e conduta clínica.", tamanho: "1,0 MB" },
      { id: "disturbios-sodio", titulo: "Distúrbios do Sódio", descricao: "Manejo prático da hiponatremia e hipernatremia, com critérios de correção e cuidados essenciais.", tamanho: "10,6 MB" },
    ],
  },
  {
    id: "arboviroses",
    nome: "Arboviroses",
    descricao: "Aulas sobre doenças transmitidas por artrópodes.",
    logo: "/logos-temas/arboviroses.png",
    aulas: [
      { id: "dengue", titulo: "Dengue", descricao: "Abordagem prática da dengue no plantão: classificação de risco, sinais de alarme e manejo clínico.", tamanho: "1,4 MB" },
    ],
  },
  {
    id: "prescricao",
    nome: "Prescrição",
    descricao: "Aulas sobre prescrição e manejo terapêutico.",
    logo: "/logos-temas/prescricao.png",
    aulas: [
      { id: "dor-analgesia", titulo: "Dor e Analgesia", descricao: "Material de apoio com estratégias práticas de avaliação e manejo da dor no paciente adulto.", tamanho: "3,0 MB" },
      { id: "prescricao-racional", titulo: "Prescrição Racional", descricao: "Princípios e estratégias de prescrição racional de medicamentos para a prática clínica diária.", tamanho: "6,3 MB" },
    ],
  },
];

export const AULAS_MATERIAIS: Aula[] = [];

export const EBOOKS = [
  {
    id: "guia-prescricoes",
    titulo: "Manual prático de prescrições: da UBS à emergência",
    descricao: "Prescrições práticas e condutas clínicas organizadas por tema, com doses, diluições e orientações para o dia a dia no plantão.",
    paginas: "500 páginas",
    formato: "PDF",
    capa: "/images/ebook-manual-transparent.png",
  },
  {
    id: "guia-intubacao",
    titulo: "Guia de intubação orotraqueal, sedação e ventilação mecânica",
    descricao: "Abordagem prática e baseada em evidências para intubação orotraqueal, sedação e ventilação mecânica no paciente adulto em situações de urgência.",
    paginas: "Guia prático",
    formato: "PDF",
    capa: "/images/ebook-iot.png",
  },
];
