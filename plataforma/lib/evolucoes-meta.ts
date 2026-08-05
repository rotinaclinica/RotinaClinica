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
    titulo: "Cefaleia",
    tags: ["cefaleia", "dor de cabeça", "enxaqueca", "tensional", "migrânea", "meningite"],
  },
  {
    id: "3",
    titulo: "Crises Hipertensivas",
    tags: ["hipertensão", "crise hipertensiva", "pressão alta", "urgência hipertensiva", "emergência hipertensiva", "HAS"],
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
