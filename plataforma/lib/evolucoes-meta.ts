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
    titulo: "Gastroenterite Viral Aguda",
    tags: ["diarreia", "gastroenterite", "fezes líquidas", "vômito", "desidratação", "GEA", "viral"],
  },
  {
    id: "16",
    titulo: "Disenteria",
    tags: ["disenteria", "diarreia com sangue", "muco", "febre", "ciprofloxacino", "bacteriana"],
  },
  {
    id: "5",
    titulo: "Síndrome Coronariana Aguda",
    tags: ["dor torácica", "angina", "infarto", "IAM", "SCA", "dor no peito", "síndrome coronariana"],
  },
  {
    id: "6",
    titulo: "Cistite",
    tags: ["itu", "cistite", "disúria", "polaciúria", "urinária", "urocultura", "ITU baixa"],
  },
  {
    id: "17",
    titulo: "Pielonefrite",
    tags: ["itu", "pielonefrite", "febre", "dor lombar", "punho-percussão", "urinária", "ITU alta"],
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
    titulo: "IVAS",
    tags: ["ivas", "resfriado", "gripe", "congestão nasal", "rinorreia", "odinofagia", "tosse", "espirros", "respiratório"],
  },
  {
    id: "18",
    titulo: "Sinusite",
    tags: ["sinusite", "rinossinusite", "congestão nasal", "rinorreia purulenta", "dor facial", "plenitude facial"],
  },
  {
    id: "19",
    titulo: "Faringoamigdalite",
    tags: ["faringite", "amigdalite", "faringoamigdalite", "odinofagia", "dor de garganta", "exsudato tonsilar"],
  },
  {
    id: "20",
    titulo: "Pneumonia Comunitária",
    tags: ["pneumonia", "PAC", "tosse", "febre", "expectoração", "crepitações", "dor pleurítica"],
  },
  {
    id: "21",
    titulo: "Apendicite Aguda",
    tags: ["apendicite", "dor abdominal", "fossa ilíaca direita", "FID", "descompressão brusca", "abdome agudo", "cirurgia"],
  },
];
