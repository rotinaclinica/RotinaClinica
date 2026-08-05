export interface EvolucaoMeta {
  id: string;
  titulo: string;
  tags: string[];
}

export const evolucoesMeta: EvolucaoMeta[] = [
  {
    id: "1",
    titulo: "Urticária",
    tags: ["urticária", "prurido", "rash", "angioedema", "alergia"],
  },
  {
    id: "10",
    titulo: "Anafilaxia",
    tags: ["anafilaxia", "adrenalina", "choque", "epinefrina", "alergia grave"],
  },
  {
    id: "2",
    titulo: "Cefaleia do tipo Tensional",
    tags: ["cefaleia", "tensional", "dor de cabeça", "opressão", "holocraniana"],
  },
  {
    id: "11",
    titulo: "Cefaleia do tipo Migrânea ou Enxaqueca",
    tags: ["cefaleia", "migrânea", "enxaqueca", "pulsátil", "fotofobia", "fonofobia"],
  },
  {
    id: "12",
    titulo: "Cefaleia em Salvas",
    tags: ["cefaleia", "salvas", "cluster", "lacrimejamento", "ptose", "sumatriptano"],
  },
  {
    id: "13",
    titulo: "Cefaleia Secundária",
    tags: ["cefaleia", "secundária", "red flag", "sinal de alarme", "tc crânio"],
  },
  {
    id: "14",
    titulo: "PA Muito Elevada sem Lesão de Órgão-Alvo",
    tags: ["hipertensão", "pressão alta", "urgência hipertensiva", "HAS", "PA elevada", "sem lesão"],
  },
  {
    id: "15",
    titulo: "Emergência Hipertensiva",
    tags: ["hipertensão", "emergência hipertensiva", "pressão alta", "HAS", "IAM", "AVC", "dissecção de aorta", "SCA"],
  },
  {
    id: "4",
    titulo: "Diarreia Aguda",
    tags: ["diarreia", "gastroenterite", "fezes líquidas", "vômito", "desidratação", "GEA"],
  },
  {
    id: "5",
    titulo: "Dor Torácica",
    tags: ["dor torácica", "angina", "infarto", "IAM", "dispneia", "SCA", "dor no peito"],
  },
  {
    id: "6",
    titulo: "Infecção do Trato Urinário (ITU)",
    tags: ["itu", "cistite", "pielonefrite", "disúria", "polaciúria", "urinária", "urocultura"],
  },
  {
    id: "7",
    titulo: "Arboviroses",
    tags: ["arbovirose", "dengue", "zika", "chikungunya", "febre", "exantema", "mialgia", "artralgia"],
  },
  {
    id: "8",
    titulo: "Crise de Asma",
    tags: ["asma", "broncoespasmo", "sibilância", "dispneia", "obstrução", "salbutamol"],
  },
  {
    id: "9",
    titulo: "Infecções Respiratórias",
    tags: ["ivas", "pneumonia", "bronquite", "gripe", "resfriado", "respiratório", "tosse", "sinusite"],
  },
];
