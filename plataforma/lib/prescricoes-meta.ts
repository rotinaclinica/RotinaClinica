// Metadados das prescrições — sem conteúdo completo
export interface PrescricaoMeta {
  id: string;
  titulo: string;
  categoria: string;
  tags: string[];
}

export const prescricoesMeta: PrescricaoMeta[] = [
  {
    "id": "1",
    "titulo": "Introdução à emergência",
    "categoria": "Emergência",
    "tags": [
      "emergência",
      "MOV",
      "ABC",
      "triagem"
    ]
  },
  {
    "id": "2",
    "titulo": "Anafilaxia",
    "categoria": "Emergência",
    "tags": [
      "adrenalina",
      "epinefrina",
      "anti-histamínico",
      "anafilaxia"
    ]
  },
  {
    "id": "3",
    "titulo": "Cetoacidose diabética",
    "categoria": "Emergência",
    "tags": [
      "insulina",
      "CAD",
      "cetoacidose",
      "potássio"
    ]
  },
  {
    "id": "4",
    "titulo": "Hipoglicemia",
    "categoria": "Emergência",
    "tags": [
      "glicose",
      "glucagon",
      "hipoglicemia",
      "diabetes"
    ]
  },
  {
    "id": "5",
    "titulo": "Teste de estresse com furosemida",
    "categoria": "Emergência",
    "tags": [
      "furosemida",
      "rim",
      "diurético",
      "IRA"
    ]
  },
  {
    "id": "6",
    "titulo": "Queimaduras",
    "categoria": "Emergência",
    "tags": [
      "queimadura",
      "curativo",
      "morfina",
      "volemia"
    ]
  },
  {
    "id": "7",
    "titulo": "Sepse",
    "categoria": "Emergência",
    "tags": [
      "antibiótico",
      "sepse",
      "choque séptico",
      "vasopressores"
    ]
  },
  {
    "id": "8",
    "titulo": "DPOC exacerbado",
    "categoria": "Emergência",
    "tags": [
      "DPOC",
      "broncodilatador",
      "salbutamol",
      "corticoide"
    ]
  },
  {
    "id": "9",
    "titulo": "Hemorragia digestiva alta",
    "categoria": "Emergência",
    "tags": [
      "omeprazol",
      "HDA",
      "hemoglobina",
      "endoscopia"
    ]
  },
  {
    "id": "10",
    "titulo": "Crise convulsiva",
    "categoria": "Emergência",
    "tags": [
      "diazepam",
      "convulsão",
      "benzodiazepínico",
      "fenitoína"
    ]
  },
  {
    "id": "11",
    "titulo": "Síndrome coronariana aguda",
    "categoria": "Emergência",
    "tags": [
      "SCA",
      "AAS",
      "heparina",
      "infarto"
    ]
  },
  {
    "id": "12",
    "titulo": "Edema agudo de pulmão",
    "categoria": "Emergência",
    "tags": [
      "furosemida",
      "EAP",
      "morfina",
      "nitrato"
    ]
  },
  {
    "id": "13",
    "titulo": "Fibrilação atrial",
    "categoria": "Emergência",
    "tags": [
      "FA",
      "amiodarona",
      "anticoagulante",
      "digoxina"
    ]
  },
  {
    "id": "14",
    "titulo": "Taquicardia supraventricular paroxística",
    "categoria": "Emergência",
    "tags": [
      "TSVP",
      "adenosina",
      "amiodarona",
      "arritmia"
    ]
  },
  {
    "id": "15",
    "titulo": "Torsades de Pointes",
    "categoria": "Emergência",
    "tags": [
      "magnésio",
      "arritmia",
      "QT longo"
    ]
  },
  {
    "id": "16",
    "titulo": "Drogas vasoativas",
    "categoria": "Emergência",
    "tags": [
      "noradrenalina",
      "dopamina",
      "vasopressor",
      "choque"
    ]
  },
  {
    "id": "17",
    "titulo": "Noradrenalina",
    "categoria": "Emergência",
    "tags": [
      "noradrenalina",
      "vasopressor",
      "choque",
      "BIC"
    ]
  },
  {
    "id": "18",
    "titulo": "Dobutamina",
    "categoria": "Emergência",
    "tags": [
      "dobutamina",
      "inotrópico",
      "choque",
      "BIC"
    ]
  },
  {
    "id": "19",
    "titulo": "Vasopressina",
    "categoria": "Emergência",
    "tags": [
      "vasopressina",
      "choque séptico",
      "vasopressor"
    ]
  },
  {
    "id": "20",
    "titulo": "Ventilação mecânica invasiva",
    "categoria": "Emergência",
    "tags": [
      "ventilação mecânica",
      "VM",
      "intubação",
      "PEEP"
    ]
  },
  {
    "id": "21",
    "titulo": "Dengue grave (grupos C e D)",
    "categoria": "Emergência",
    "tags": [
      "dengue",
      "hidratação EV",
      "cristaloide",
      "grupos C e D"
    ]
  },
  {
    "id": "22",
    "titulo": "Intubação de sequência rápida",
    "categoria": "Emergência",
    "tags": [
      "ISR",
      "IOT",
      "intubação",
      "cetamina"
    ]
  },
  {
    "id": "23",
    "titulo": "Estridor laríngeo",
    "categoria": "Emergência",
    "tags": [
      "estridor",
      "adrenalina inalatória",
      "dexametasona",
      "via aérea"
    ]
  },
  {
    "id": "24",
    "titulo": "Mordedura",
    "categoria": "Emergência",
    "tags": [
      "amoxicilina",
      "mordedura",
      "raiva",
      "tétano"
    ]
  },
  {
    "id": "25",
    "titulo": "Antimicrobianos",
    "categoria": "Antimicrobianos",
    "tags": [
      "antibiótico",
      "amoxicilina",
      "cefalosporina",
      "penicilina"
    ]
  },
  {
    "id": "26",
    "titulo": "Analgésicos",
    "categoria": "Analgesia",
    "tags": [
      "dipirona",
      "morfina",
      "tramadol",
      "analgesia"
    ]
  },
  {
    "id": "27",
    "titulo": "Intoxicação por opioides e benzodiazepínicos",
    "categoria": "Toxicologia",
    "tags": [
      "naloxona",
      "flumazenil",
      "intoxicação",
      "opioide"
    ]
  },
  {
    "id": "28",
    "titulo": "Insônia",
    "categoria": "Outras",
    "tags": [
      "zolpidem",
      "melatonina",
      "insônia",
      "sedativo"
    ]
  },
  {
    "id": "29",
    "titulo": "Intoxicação por metanol",
    "categoria": "Toxicologia",
    "tags": [
      "etanol",
      "fomepizol",
      "metanol",
      "intoxicação"
    ]
  },
  {
    "id": "30",
    "titulo": "Anticoagulantes",
    "categoria": "Anticoagulação",
    "tags": [
      "heparina",
      "warfarina",
      "NOAC",
      "anticoagulante"
    ]
  },
  {
    "id": "31",
    "titulo": "Afecções cutâneas e ungueais",
    "categoria": "Dermatologia",
    "tags": [
      "dermatite",
      "fungo",
      "pele",
      "onicomicose"
    ]
  },
  {
    "id": "32",
    "titulo": "Afecções oculares",
    "categoria": "Oftalmologia",
    "tags": [
      "colírio",
      "conjuntivite",
      "olho",
      "oftalmologia"
    ]
  },
  {
    "id": "33",
    "titulo": "Afecções gastrointestinais",
    "categoria": "Gastroenterologia",
    "tags": [
      "omeprazol",
      "metoclopramida",
      "GI",
      "náusea"
    ]
  },
  {
    "id": "34",
    "titulo": "Reposição de vitamina D e B12",
    "categoria": "Nutrologia",
    "tags": [
      "vitamina D",
      "B12",
      "cobalamina",
      "deficiência"
    ]
  },
  {
    "id": "35",
    "titulo": "Reposição de ferro oral e EV",
    "categoria": "Nutrologia",
    "tags": [
      "ferro",
      "ferritina",
      "anemia",
      "sacarato"
    ]
  },
  {
    "id": "36",
    "titulo": "Cefaleia",
    "categoria": "Neurologia",
    "tags": [
      "sumatriptano",
      "dipirona",
      "cefaleia",
      "enxaqueca"
    ]
  },
  {
    "id": "37",
    "titulo": "Arboviroses",
    "categoria": "Infectologia",
    "tags": [
      "dengue",
      "zika",
      "chikungunya",
      "arbovírus"
    ]
  },
  {
    "id": "38",
    "titulo": "Afecções pulmonares",
    "categoria": "Pneumologia",
    "tags": [
      "pneumonia",
      "amoxicilina",
      "azitromicina",
      "PAC"
    ]
  },
  {
    "id": "39",
    "titulo": "Infecções bacterianas de VAS",
    "categoria": "Infectologia",
    "tags": [
      "faringite",
      "amigdalite",
      "antibiótico",
      "estreptococo"
    ]
  },
  {
    "id": "40",
    "titulo": "IVAS e tosse pós-infecciosa",
    "categoria": "Pneumologia",
    "tags": [
      "IVAS",
      "resfriado",
      "tosse",
      "viral"
    ]
  },
  {
    "id": "41",
    "titulo": "Tosse produtiva e não produtiva",
    "categoria": "Pneumologia",
    "tags": [
      "tosse",
      "guaifenesina",
      "expectorante",
      "mucolítico"
    ]
  },
  {
    "id": "42",
    "titulo": "Afecções urinárias",
    "categoria": "Urologia",
    "tags": [
      "ITU",
      "ciprofloxacino",
      "nitrofurantoína",
      "urina"
    ]
  },
  {
    "id": "43",
    "titulo": "Afecções genitais e anticoncepção de emergência",
    "categoria": "Ginecologia",
    "tags": [
      "DST",
      "levonorgestrel",
      "anticoncepção",
      "profilaxia"
    ]
  },
  {
    "id": "44",
    "titulo": "Dor osteomuscular",
    "categoria": "Ortopedia",
    "tags": [
      "dipirona",
      "ibuprofeno",
      "miorrelaxante",
      "dor"
    ]
  },
  {
    "id": "45",
    "titulo": "Torcicolo",
    "categoria": "Ortopedia",
    "tags": [
      "torcicolo",
      "miorrelaxante",
      "diclofenaco",
      "cervical"
    ]
  },
  {
    "id": "46",
    "titulo": "Doença hemorroidária",
    "categoria": "Gastroenterologia",
    "tags": [
      "hemorroida",
      "diosmina",
      "supositório",
      "proctologia"
    ]
  },
  {
    "id": "47",
    "titulo": "Epistaxe",
    "categoria": "Otorrinolaringologia",
    "tags": [
      "epistaxe",
      "sangramento nasal",
      "tamponamento"
    ]
  },
  {
    "id": "48",
    "titulo": "Ferimento cortocontuso e sutura",
    "categoria": "Cirurgia",
    "tags": [
      "sutura",
      "curativo",
      "ferimento",
      "cicatrização"
    ]
  },
  {
    "id": "49",
    "titulo": "Herpes labial",
    "categoria": "Infectologia",
    "tags": [
      "aciclovir",
      "herpes",
      "valaciclovir",
      "HSV"
    ]
  },
  {
    "id": "50",
    "titulo": "Tontura e vertigem",
    "categoria": "Neurologia",
    "tags": [
      "meclizina",
      "dimenidrinato",
      "vertigem",
      "VPPB"
    ]
  },
  {
    "id": "51",
    "titulo": "Distúrbios eletrolíticos",
    "categoria": "Nefrologia",
    "tags": [
      "potássio",
      "sódio",
      "eletrólito",
      "cálcio"
    ]
  },
  {
    "id": "52",
    "titulo": "Desmame de corticoides",
    "categoria": "Endocrinologia",
    "tags": [
      "prednisona",
      "desmame",
      "corticoide",
      "hidrocortisona"
    ]
  },
  {
    "id": "53",
    "titulo": "Delirium e agitação psicomotora",
    "categoria": "Neurologia",
    "tags": [
      "haloperidol",
      "delirium",
      "agitação",
      "sedação"
    ]
  },
  {
    "id": "54",
    "titulo": "Crise de ansiedade",
    "categoria": "Psiquiatria",
    "tags": [
      "diazepam",
      "alprazolam",
      "ansiedade",
      "pânico"
    ]
  },
  {
    "id": "55",
    "titulo": "Prescrição no paciente internado",
    "categoria": "Medicina Interna",
    "tags": [
      "prescrição",
      "internação",
      "rotina",
      "ordens médicas"
    ]
  }
];

export const categorias = ["Analgesia","Anticoagulação","Antimicrobianos","Cirurgia","Dermatologia","Emergência","Endocrinologia","Gastroenterologia","Ginecologia","Infectologia","Medicina Interna","Nefrologia","Neurologia","Nutrologia","Oftalmologia","Ortopedia","Otorrinolaringologia","Outras","Pneumologia","Psiquiatria","Todos","Toxicologia","Urologia"];