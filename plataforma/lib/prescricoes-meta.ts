export const PRESCRICOES_FILTROS = ["Todos", "Emergência", "Intubação", "Guias práticos", "PS/UPA", "UBS/Atenção primária", "Medicamento", "Referências"] as const;
export type PrescricaoFiltro = typeof PRESCRICOES_FILTROS[number];

export interface PrescricaoMeta {
  id: string;
  titulo: string;
  categoria: string;
  tags: string[];
  relacionados?: string[];
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
    ],
    "relacionados": ["226"]
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
    ],
    "relacionados": ["240","54","55","56","57"]
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
    ],
    "relacionados": ["200","204","205","199","203","13"]
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
    ],
    "relacionados": ["212","203","8","191"]
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
    ],
    "relacionados": ["30","171","172","173","174","175"]
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
    ],
    "relacionados": ["17","18","19","216","217"]
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
    ],
    "relacionados": ["216","18","19","16"]
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
    ],
    "relacionados": ["217","17","19","16"]
  },
  {
    "id": "19",
    "titulo": "Vasopressina",
    "categoria": "Emergência",
    "tags": [
      "vasopressina",
      "choque séptico",
      "vasopressor"
    ],
    "relacionados": ["17","18","16"]
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
    ],
    "relacionados": ["65","64","7"]
  },
  {
    "id": "22",
    "titulo": "Intubação de sequência rápida (ISR)",
    "categoria": "Emergência",
    "tags": [
      "ISR",
      "IOT",
      "intubação",
      "cetamina"
    ],
    "relacionados": ["193","194","192","195","210","211"]
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
    "categoria": "Temas PS/UPA",
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
    "categoria": "Temas PS/UPA",
    "tags": [
      "dipirona",
      "morfina",
      "tramadol",
      "analgesia"
    ],
    "relacionados": ["233","148","149","231","232"]
  },
  {
    "id": "27",
    "titulo": "Intoxicação por opioides",
    "categoria": "Temas PS/UPA",
    "tags": [
      "naloxona",
      "intoxicação",
      "opioide",
      "toxicologia"
    ],
    "relacionados": ["162","164","163"]
  },
  {
    "id": "28",
    "titulo": "Insônia",
    "categoria": "Temas PS/UPA",
    "tags": [
      "zolpidem",
      "melatonina",
      "insônia",
      "sedativo"
    ],
    "relacionados": ["166","167","168","169","170"]
  },
  {
    "id": "29",
    "titulo": "Intoxicação por metanol",
    "categoria": "Temas PS/UPA",
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
    "categoria": "Temas PS/UPA",
    "tags": [
      "heparina",
      "warfarina",
      "NOAC",
      "anticoagulante"
    ],
    "relacionados": ["13","171","172","173","174","175"]
  },
  {
    "id": "31",
    "titulo": "Celulite e Erisipela",
    "categoria": "Temas PS/UPA",
    "tags": [
      "dermatite",
      "fungo",
      "pele",
      "onicomicose"
    ],
    "relacionados": ["145","136","128"]
  },
  {
    "id": "32",
    "titulo": "Escabiose",
    "categoria": "Temas PS/UPA",
    "tags": [
      "dermatite",
      "fungo",
      "pele",
      "onicomicose"
    ]
  },
  {
    "id": "33",
    "titulo": "Tinea corporis",
    "categoria": "Temas PS/UPA",
    "tags": [
      "dermatite",
      "fungo",
      "pele",
      "onicomicose"
    ]
  },
  {
    "id": "34",
    "titulo": "Urticária",
    "categoria": "Temas PS/UPA",
    "tags": [
      "urticária"
    ]
  },
  {
    "id": "35",
    "titulo": "Furunculose",
    "categoria": "Temas PS/UPA",
    "tags": [
      "dermatite",
      "fungo",
      "pele",
      "onicomicose"
    ],
    "relacionados": ["36"]
  },
  {
    "id": "36",
    "titulo": "Furunculose de repetição",
    "categoria": "Temas PS/UPA",
    "tags": [
      "dermatite",
      "fungo",
      "pele",
      "onicomicose"
    ],
    "relacionados": ["35","145"]
  },
  {
    "id": "37",
    "titulo": "ABCDE do melanoma",
    "categoria": "Temas PS/UPA",
    "tags": [
      "dermatite",
      "fungo",
      "pele",
      "onicomicose"
    ]
  },
  {
    "id": "38",
    "titulo": "Onicomicose",
    "categoria": "Temas PS/UPA",
    "tags": [
      "dermatite",
      "fungo",
      "pele",
      "onicomicose"
    ],
    "relacionados": ["176","177","178"]
  },
  {
    "id": "39",
    "titulo": "Conjuntivite bacteriana aguda",
    "categoria": "Temas PS/UPA",
    "tags": [
      "colírio",
      "conjuntivite",
      "olho",
      "oftalmologia"
    ],
    "relacionados": ["40","41"]
  },
  {
    "id": "40",
    "titulo": "Conjuntivite viral aguda",
    "categoria": "Temas PS/UPA",
    "tags": [
      "colírio",
      "conjuntivite",
      "olho",
      "oftalmologia"
    ],
    "relacionados": ["39","41"]
  },
  {
    "id": "41",
    "titulo": "Conjuntivite alérgica",
    "categoria": "Temas PS/UPA",
    "tags": [
      "colírio",
      "conjuntivite",
      "olho",
      "oftalmologia"
    ],
    "relacionados": ["39","40"]
  },
  {
    "id": "42",
    "titulo": "Hordéolo e terçol",
    "categoria": "Temas PS/UPA",
    "tags": [
      "colírio",
      "conjuntivite",
      "olho",
      "oftalmologia"
    ]
  },
  {
    "id": "43",
    "titulo": "Xeroftalmia (olho seco)",
    "categoria": "Temas PS/UPA",
    "tags": [
      "colírio",
      "conjuntivite",
      "olho",
      "oftalmologia"
    ]
  },
  {
    "id": "44",
    "titulo": "Constipação intestinal",
    "categoria": "Temas PS/UPA",
    "tags": [
      "omeprazol",
      "metoclopramida",
      "GI",
      "náusea"
    ]
  },
  {
    "id": "45",
    "titulo": "Parasitose intestinal",
    "categoria": "Temas PS/UPA",
    "tags": [
      "albendazol",
      "nitazoxanida",
      "parasitose",
      "verme"
    ]
  },
  {
    "id": "46",
    "titulo": "Antieméticos",
    "categoria": "Temas PS/UPA",
    "tags": [
      "metoclopramida",
      "bromoprida",
      "ondansetrona",
      "dimenidrinato",
      "náusea",
      "vômito"
    ],
    "relacionados": ["234","235","236","237","47"]
  },
  {
    "id": "47",
    "titulo": "Náuseas persistentes",
    "categoria": "Temas PS/UPA",
    "tags": [
      "haloperidol",
      "dexametasona",
      "náusea",
      "vômito"
    ],
    "relacionados": ["237","46","179","180","181","182"]
  },
  {
    "id": "48",
    "titulo": "Reação extrapiramidal",
    "categoria": "Temas PS/UPA",
    "tags": [
      "difenidramina",
      "biperideno",
      "extrapiramidal",
      "metoclopramida",
      "antipsicótico"
    ]
  },
  {
    "id": "49",
    "titulo": "Diverticulite aguda não complicada",
    "categoria": "Temas PS/UPA",
    "tags": [
      "ciprofloxacino",
      "metronidazol",
      "diverticulite",
      "antibiótico"
    ]
  },
  {
    "id": "50",
    "titulo": "Diverticulite aguda complicada",
    "categoria": "Temas PS/UPA",
    "tags": [
      "ciprofloxacino",
      "metronidazol",
      "diverticulite",
      "tramadol",
      "antibiótico"
    ]
  },
  {
    "id": "51",
    "titulo": "Gastroenterite aguda (GECA)",
    "categoria": "Temas PS/UPA",
    "tags": [
      "gastroenterite",
      "diarreia",
      "SRO",
      "loperamida",
      "reidratação"
    ]
  },
  {
    "id": "52",
    "titulo": "Disenteria",
    "categoria": "Temas PS/UPA",
    "tags": [
      "disenteria",
      "diarreia",
      "GI",
      "antibiótico"
    ]
  },
  {
    "id": "53",
    "titulo": "Pancreatite aguda",
    "categoria": "Temas PS/UPA",
    "tags": [
      "pancreatite",
      "dor abdominal",
      "dipirona",
      "tramadol",
      "morfina"
    ]
  },
  {
    "id": "54",
    "titulo": "Doença do refluxo gastroesofágico (DRGE)",
    "categoria": "Temas PS/UPA",
    "tags": [
      "refluxo",
      "DRGE",
      "omeprazol",
      "domperidona",
      "IBP"
    ],
    "relacionados": ["55","56","57","240","9"]
  },
  {
    "id": "55",
    "titulo": "Gastrite",
    "categoria": "Temas PS/UPA",
    "tags": [
      "gastrite",
      "antiácido",
      "hidróxido de alumínio",
      "hidróxido de magnésio"
    ],
    "relacionados": ["54","56","57","240"]
  },
  {
    "id": "56",
    "titulo": "Infecção por Helicobacter pylori",
    "categoria": "Temas PS/UPA",
    "tags": [
      "H. pylori",
      "helicobacter",
      "claritromicina",
      "amoxicilina",
      "omeprazol"
    ],
    "relacionados": ["55","57","54","124"]
  },
  {
    "id": "57",
    "titulo": "Doença ulcerosa péptica",
    "categoria": "Temas PS/UPA",
    "tags": [
      "úlcera péptica",
      "omeprazol",
      "pantoprazol",
      "IBP",
      "lansoprazol"
    ],
    "relacionados": ["56","55","54","240","9"]
  },
  {
    "id": "58",
    "titulo": "Infecção por Clostridium difficile",
    "categoria": "Temas PS/UPA",
    "tags": [
      "C. difficile",
      "vancomicina",
      "metronidazol",
      "diarreia",
      "precaução de contato"
    ]
  },
  {
    "id": "59",
    "titulo": "Gases e distensão abdominal",
    "categoria": "Temas PS/UPA",
    "tags": [
      "simeticona",
      "gases",
      "distensão abdominal",
      "flatulência"
    ]
  },
  {
    "id": "60",
    "titulo": "Intolerância à lactose",
    "categoria": "Temas PS/UPA",
    "tags": [
      "lactose",
      "lactase",
      "intolerância",
      "laticínios"
    ]
  },
  {
    "id": "61",
    "titulo": "Reposição de vitamina D e B12",
    "categoria": "Temas PS/UPA",
    "tags": [
      "vitamina D",
      "B12",
      "cobalamina",
      "deficiência"
    ]
  },
  {
    "id": "183",
    "titulo": "Reposição de vitamina D",
    "categoria": "Temas PS/UPA",
    "tags": [
      "vitamina D",
      "colecalciferol",
      "deficiência",
      "reposição"
    ]
  },
  {
    "id": "184",
    "titulo": "Reposição de vitamina B12",
    "categoria": "Temas PS/UPA",
    "tags": [
      "B12",
      "cobalamina",
      "ácido fólico",
      "cianocobalamina"
    ]
  },
  {
    "id": "62",
    "titulo": "Reposição de ferro oral e EV",
    "categoria": "Temas PS/UPA",
    "tags": [
      "ferro",
      "ferritina",
      "anemia",
      "sacarato"
    ]
  },
  {
    "id": "63",
    "titulo": "Cefaleia",
    "categoria": "Temas PS/UPA",
    "tags": [
      "sumatriptano",
      "dipirona",
      "cefaleia",
      "enxaqueca"
    ],
    "relacionados": ["185","186","187"]
  },
  {
    "id": "64",
    "titulo": "Dengue, Zika e Chikungunya",
    "categoria": "Temas PS/UPA",
    "tags": [
      "dengue",
      "zika",
      "chikungunya",
      "arbovírus"
    ],
    "relacionados": ["65","21","66","67"]
  },
  {
    "id": "65",
    "titulo": "Dengue",
    "categoria": "Temas PS/UPA",
    "tags": [
      "dengue"
    ],
    "relacionados": ["64","21","66"]
  },
  {
    "id": "66",
    "titulo": "Chikungunya (particularidades)",
    "categoria": "Temas PS/UPA",
    "tags": [
      "dengue",
      "zika",
      "chikungunya",
      "arbovírus"
    ],
    "relacionados": ["64","65","67"]
  },
  {
    "id": "67",
    "titulo": "Febre do Oropouche",
    "categoria": "Temas PS/UPA",
    "tags": [
      "dengue",
      "zika",
      "chikungunya",
      "arbovírus"
    ],
    "relacionados": ["64","66"]
  },
  {
    "id": "68",
    "titulo": "Crise de asma",
    "categoria": "Temas PS/UPA",
    "tags": [
      "crise",
      "asma"
    ]
  },
  {
    "id": "69",
    "titulo": "Exacerbação de DPOC",
    "categoria": "Temas PS/UPA",
    "tags": [
      "exacerbação",
      "dpoc"
    ]
  },
  {
    "id": "70",
    "titulo": "Pneumonia comunitária",
    "categoria": "Temas PS/UPA",
    "tags": [
      "pneumonia",
      "comunitária"
    ],
    "relacionados": ["136","120","122","123","201","68","69"]
  },
  {
    "id": "71",
    "titulo": "Faringoamigdalite bacteriana",
    "categoria": "Temas PS/UPA",
    "tags": [
      "faringoamigdalite",
      "bacteriana"
    ],
    "relacionados": ["116","115","146","72","73"]
  },
  {
    "id": "72",
    "titulo": "Sinusite bacteriana",
    "categoria": "Temas PS/UPA",
    "tags": [
      "sinusite",
      "bacteriana"
    ],
    "relacionados": ["116","115","127","120","71","73"]
  },
  {
    "id": "73",
    "titulo": "Otite média aguda bacteriana",
    "categoria": "Temas PS/UPA",
    "tags": [
      "otite",
      "média",
      "aguda"
    ],
    "relacionados": ["116","115","71","72"]
  },
  {
    "id": "74",
    "titulo": "Resfriado e gripe (Influenza)",
    "categoria": "Temas PS/UPA",
    "tags": [
      "resfriado",
      "gripe",
      "influenza"
    ],
    "relacionados": ["206","207","201","208"]
  },
  {
    "id": "75",
    "titulo": "Tosse pós-infecciosa",
    "categoria": "Temas PS/UPA",
    "tags": [
      "tosse",
      "pós-infecciosa"
    ],
    "relacionados": ["76","77","219","209"]
  },
  {
    "id": "76",
    "titulo": "Tosse produtiva",
    "categoria": "Temas PS/UPA",
    "tags": [
      "tosse",
      "produtiva"
    ],
    "relacionados": ["77","75","219"]
  },
  {
    "id": "77",
    "titulo": "Tosse não produtiva",
    "categoria": "Temas PS/UPA",
    "tags": [
      "tosse",
      "produtiva"
    ],
    "relacionados": ["76","75","219"]
  },
  {
    "id": "78",
    "titulo": "ITU: definições",
    "categoria": "Temas PS/UPA",
    "tags": [
      "ITU",
      "ciprofloxacino",
      "nitrofurantoína",
      "urina"
    ],
    "relacionados": ["79","80","81"]
  },
  {
    "id": "79",
    "titulo": "Cistite",
    "categoria": "Temas PS/UPA",
    "tags": [
      "ITU",
      "ciprofloxacino",
      "nitrofurantoína",
      "urina"
    ],
    "relacionados": ["80","81","134","119","126","78"]
  },
  {
    "id": "80",
    "titulo": "Pielonefrite",
    "categoria": "Temas PS/UPA",
    "tags": [
      "ITU",
      "ciprofloxacino",
      "nitrofurantoína",
      "urina"
    ],
    "relacionados": ["79","81","136","118","78"]
  },
  {
    "id": "81",
    "titulo": "ITU recorrente ou ITU de repetição",
    "categoria": "Temas PS/UPA",
    "tags": [
      "ITU",
      "ciprofloxacino",
      "nitrofurantoína",
      "urina"
    ],
    "relacionados": ["79","80","134","119","126","78"]
  },
  {
    "id": "82",
    "titulo": "Cólica nefrética",
    "categoria": "Temas PS/UPA",
    "tags": [
      "ITU",
      "ciprofloxacino",
      "nitrofurantoína",
      "urina"
    ]
  },
  {
    "id": "83",
    "titulo": "Retenção urinária",
    "categoria": "Temas PS/UPA",
    "tags": [
      "ITU",
      "ciprofloxacino",
      "nitrofurantoína",
      "urina"
    ]
  },
  {
    "id": "84",
    "titulo": "Candidíase vaginal",
    "categoria": "Temas PS/UPA",
    "tags": [
      "DST",
      "levonorgestrel",
      "anticoncepção",
      "profilaxia"
    ],
    "relacionados": ["132","133","87"]
  },
  {
    "id": "85",
    "titulo": "Sífilis primária",
    "categoria": "Temas PS/UPA",
    "tags": [
      "DST",
      "levonorgestrel",
      "anticoncepção",
      "profilaxia"
    ],
    "relacionados": ["146","86","89","90"]
  },
  {
    "id": "86",
    "titulo": "Uretrite",
    "categoria": "Temas PS/UPA",
    "tags": [
      "DST",
      "levonorgestrel",
      "anticoncepção",
      "profilaxia"
    ],
    "relacionados": ["85","87","88","91","118","123"]
  },
  {
    "id": "87",
    "titulo": "Vaginose bacteriana",
    "categoria": "Temas PS/UPA",
    "tags": [
      "DST",
      "levonorgestrel",
      "anticoncepção",
      "profilaxia"
    ],
    "relacionados": ["84","88","124","86"]
  },
  {
    "id": "88",
    "titulo": "Tricomoníase vaginal",
    "categoria": "Temas PS/UPA",
    "tags": [
      "DST",
      "levonorgestrel",
      "anticoncepção",
      "profilaxia"
    ],
    "relacionados": ["87","124","86"]
  },
  {
    "id": "89",
    "titulo": "Cancro mole",
    "categoria": "Temas PS/UPA",
    "tags": [
      "DST",
      "levonorgestrel",
      "anticoncepção",
      "profilaxia"
    ],
    "relacionados": ["123","85","90"]
  },
  {
    "id": "90",
    "titulo": "Linfogranuloma venéreo",
    "categoria": "Temas PS/UPA",
    "tags": [
      "DST",
      "levonorgestrel",
      "anticoncepção",
      "profilaxia"
    ],
    "relacionados": ["123","89","85"]
  },
  {
    "id": "91",
    "titulo": "Herpes genital",
    "categoria": "Temas PS/UPA",
    "tags": [
      "DST",
      "levonorgestrel",
      "anticoncepção",
      "profilaxia"
    ],
    "relacionados": ["99","129","130","86"]
  },
  {
    "id": "92",
    "titulo": "Anticoncepção de emergência",
    "categoria": "Temas PS/UPA",
    "tags": [
      "DST",
      "levonorgestrel",
      "anticoncepção",
      "profilaxia"
    ]
  },
  {
    "id": "93",
    "titulo": "Profilaxias",
    "categoria": "Temas PS/UPA",
    "tags": [
      "DST",
      "levonorgestrel",
      "anticoncepção",
      "profilaxia"
    ]
  },
  {
    "id": "94",
    "titulo": "Dor osteomuscular/Dor mecânica",
    "categoria": "Temas PS/UPA",
    "tags": [
      "dipirona",
      "ibuprofeno",
      "miorrelaxante",
      "dor"
    ]
  },
  {
    "id": "95",
    "titulo": "Torcicolo",
    "categoria": "Temas PS/UPA",
    "tags": [
      "torcicolo",
      "miorrelaxante",
      "diclofenaco",
      "cervical"
    ]
  },
  {
    "id": "96",
    "titulo": "Doença hemorroidária",
    "categoria": "Temas PS/UPA",
    "tags": [
      "hemorroida",
      "diosmina",
      "supositório",
      "proctologia"
    ]
  },
  {
    "id": "97",
    "titulo": "Epistaxe",
    "categoria": "Temas PS/UPA",
    "tags": [
      "epistaxe",
      "sangramento nasal",
      "tamponamento"
    ]
  },
  {
    "id": "98",
    "titulo": "Ferimento cortocontuso e sutura",
    "categoria": "Temas PS/UPA",
    "tags": [
      "sutura",
      "curativo",
      "ferimento",
      "cicatrização"
    ]
  },
  {
    "id": "99",
    "titulo": "Herpes labial",
    "categoria": "Temas PS/UPA",
    "tags": [
      "aciclovir",
      "herpes",
      "valaciclovir",
      "HSV"
    ],
    "relacionados": ["91","129","130"]
  },
  {
    "id": "100",
    "titulo": "Tontura e vertigem",
    "categoria": "Temas PS/UPA",
    "tags": [
      "meclizina",
      "dimenidrinato",
      "vertigem",
      "VPPB"
    ]
  },
  {
    "id": "101",
    "titulo": "Hipocalemia",
    "categoria": "Temas PS/UPA",
    "tags": [
      "potássio",
      "sódio",
      "eletrólito",
      "cálcio"
    ],
    "relacionados": ["102","105"]
  },
  {
    "id": "102",
    "titulo": "Hipercalemia",
    "categoria": "Temas PS/UPA",
    "tags": [
      "potássio",
      "sódio",
      "eletrólito",
      "cálcio"
    ],
    "relacionados": ["101"]
  },
  {
    "id": "103",
    "titulo": "Hiponatremia",
    "categoria": "Temas PS/UPA",
    "tags": [
      "potássio",
      "sódio",
      "eletrólito",
      "cálcio"
    ],
    "relacionados": ["104"]
  },
  {
    "id": "104",
    "titulo": "Hipernatremia",
    "categoria": "Temas PS/UPA",
    "tags": [
      "potássio",
      "sódio",
      "eletrólito",
      "cálcio"
    ],
    "relacionados": ["103"]
  },
  {
    "id": "105",
    "titulo": "Hipomagnesemia",
    "categoria": "Temas PS/UPA",
    "tags": [
      "potássio",
      "sódio",
      "eletrólito",
      "cálcio"
    ],
    "relacionados": ["106","101"]
  },
  {
    "id": "106",
    "titulo": "Hipermagnesemia",
    "categoria": "Temas PS/UPA",
    "tags": [
      "potássio",
      "sódio",
      "eletrólito",
      "cálcio"
    ],
    "relacionados": ["105"]
  },
  {
    "id": "107",
    "titulo": "Hipofosfatemia",
    "categoria": "Temas PS/UPA",
    "tags": [
      "potássio",
      "sódio",
      "eletrólito",
      "cálcio"
    ],
    "relacionados": ["108"]
  },
  {
    "id": "108",
    "titulo": "Hiperfosfatemia",
    "categoria": "Temas PS/UPA",
    "tags": [
      "potássio",
      "sódio",
      "eletrólito",
      "cálcio"
    ],
    "relacionados": ["107"]
  },
  {
    "id": "109",
    "titulo": "Hipocalcemia",
    "categoria": "Temas PS/UPA",
    "tags": [
      "potássio",
      "sódio",
      "eletrólito",
      "cálcio"
    ],
    "relacionados": ["110"]
  },
  {
    "id": "110",
    "titulo": "Hipercalcemia",
    "categoria": "Temas PS/UPA",
    "tags": [
      "potássio",
      "sódio",
      "eletrólito",
      "cálcio"
    ],
    "relacionados": ["109"]
  },
  {
    "id": "111",
    "titulo": "Desmame de corticoides",
    "categoria": "Temas PS/UPA",
    "tags": [
      "prednisona",
      "desmame",
      "corticoide",
      "hidrocortisona"
    ]
  },
  {
    "id": "112",
    "titulo": "Delirium e agitação psicomotora",
    "categoria": "Temas PS/UPA",
    "tags": [
      "haloperidol",
      "delirium",
      "agitação"
    ],
    "relacionados": ["113","188"]
  },
  {
    "id": "113",
    "titulo": "Crise de ansiedade",
    "categoria": "Temas PS/UPA",
    "tags": [
      "diazepam",
      "alprazolam",
      "ansiedade",
      "pânico"
    ],
    "relacionados": ["168","112","28"]
  },
  {
    "id": "114",
    "titulo": "Prescrição no paciente internado",
    "categoria": "Temas PS/UPA",
    "tags": [
      "prescrição",
      "internação",
      "rotina",
      "ordens médicas"
    ]
  },
  { "id": "115", "titulo": "Amoxicilina+Clavulanato", "categoria": "Temas PS/UPA", "tags": ["amoxicilina", "clavulanato", "antimicrobiano", "antibiótico", "penicilina"] },
  { "id": "116", "titulo": "Amoxicilina", "categoria": "Temas PS/UPA", "tags": ["amoxicilina", "antimicrobiano", "antibiótico", "penicilina"] },
  { "id": "117", "titulo": "Cefalexina", "categoria": "Temas PS/UPA", "tags": ["cefalexina", "antimicrobiano", "antibiótico", "cefalosporina"] },
  { "id": "118", "titulo": "Ciprofloxacino", "categoria": "Temas PS/UPA", "tags": ["ciprofloxacino", "antimicrobiano", "antibiótico", "fluoroquinolona"] },
  { "id": "119", "titulo": "Norfloxacino", "categoria": "Temas PS/UPA", "tags": ["norfloxacino", "antimicrobiano", "antibiótico", "fluoroquinolona"] },
  { "id": "120", "titulo": "Levofloxacino", "categoria": "Temas PS/UPA", "tags": ["levofloxacino", "antimicrobiano", "antibiótico", "fluoroquinolona"] },
  { "id": "121", "titulo": "Azitromicina", "categoria": "Temas PS/UPA", "tags": ["azitromicina", "antimicrobiano", "antibiótico", "macrolídeo"] },
  { "id": "122", "titulo": "Claritromicina", "categoria": "Temas PS/UPA", "tags": ["claritromicina", "antimicrobiano", "antibiótico", "macrolídeo"] },
  { "id": "123", "titulo": "Doxiciclina", "categoria": "Temas PS/UPA", "tags": ["doxiciclina", "antimicrobiano", "antibiótico", "tetraciclina"] },
  { "id": "124", "titulo": "Metronidazol", "categoria": "Temas PS/UPA", "tags": ["metronidazol", "antimicrobiano", "antibiótico", "anaeróbios"] },
  { "id": "125", "titulo": "Sulfametoxazol+Trimetoprima", "categoria": "Temas PS/UPA", "tags": ["sulfametoxazol", "trimetoprima", "SMX-TMP", "antimicrobiano", "antibiótico"] },
  { "id": "126", "titulo": "Fosfomicina trometamol", "categoria": "Temas PS/UPA", "tags": ["fosfomicina", "antimicrobiano", "antibiótico", "ITU"] },
  { "id": "127", "titulo": "Axetilcefuroxima", "categoria": "Temas PS/UPA", "tags": ["axetilcefuroxima", "cefuroxima", "antimicrobiano", "antibiótico", "cefalosporina"] },
  { "id": "128", "titulo": "Clindamicina", "categoria": "Temas PS/UPA", "tags": ["clindamicina", "antimicrobiano", "antibiótico"] },
  { "id": "129", "titulo": "Valaciclovir", "categoria": "Temas PS/UPA", "tags": ["valaciclovir", "antiviral", "herpes"] },
  { "id": "130", "titulo": "Aciclovir", "categoria": "Temas PS/UPA", "tags": ["aciclovir", "antiviral", "herpes"] },
{ "id": "132", "titulo": "Fluconazol", "categoria": "Temas PS/UPA", "tags": ["fluconazol", "antifúngico", "candidíase"] },
  { "id": "133", "titulo": "Nistatina", "categoria": "Temas PS/UPA", "tags": ["nistatina", "antifúngico", "candidíase", "oral"] },
  { "id": "134", "titulo": "Nitrofurantoína", "categoria": "Temas PS/UPA", "tags": ["nitrofurantoína", "antimicrobiano", "antibiótico", "ITU"] },
  { "id": "135", "titulo": "Vancomicina", "categoria": "Temas PS/UPA", "tags": ["vancomicina", "antimicrobiano", "antibiótico", "MRSA", "Clostridium difficile"] },
  { "id": "136", "titulo": "Ceftriaxona", "categoria": "Temas PS/UPA", "tags": ["ceftriaxona", "antimicrobiano", "antibiótico", "cefalosporina"] },
  { "id": "137", "titulo": "Cefepime", "categoria": "Temas PS/UPA", "tags": ["cefepime", "antimicrobiano", "antibiótico", "cefalosporina"] },
  { "id": "138", "titulo": "Piperacilina+Tazobactam", "categoria": "Temas PS/UPA", "tags": ["piperacilina", "tazobactam", "pip-tazo", "antimicrobiano", "antibiótico"] },
  { "id": "139", "titulo": "Meropenem", "categoria": "Temas PS/UPA", "tags": ["meropenem", "antimicrobiano", "antibiótico", "carbapenêmico"] },
  { "id": "140", "titulo": "Cefazolina", "categoria": "Temas PS/UPA", "tags": ["cefazolina", "antimicrobiano", "antibiótico", "cefalosporina"] },
  { "id": "141", "titulo": "Ceftazidima", "categoria": "Temas PS/UPA", "tags": ["ceftazidima", "antimicrobiano", "antibiótico", "cefalosporina", "Pseudomonas"] },
  { "id": "142", "titulo": "Linezolida", "categoria": "Temas PS/UPA", "tags": ["linezolida", "antimicrobiano", "antibiótico", "MRSA"] },
  { "id": "143", "titulo": "Daptomicina", "categoria": "Temas PS/UPA", "tags": ["daptomicina", "antimicrobiano", "antibiótico", "MRSA"] },
  { "id": "144", "titulo": "Amicacina", "categoria": "Temas PS/UPA", "tags": ["amicacina", "antimicrobiano", "antibiótico", "aminoglicosídeo"] },
  { "id": "145", "titulo": "Oxacilina", "categoria": "Temas PS/UPA", "tags": ["oxacilina", "antimicrobiano", "antibiótico", "MSSA", "penicilina"] },
  { "id": "146", "titulo": "Penicilina G Benzatina", "categoria": "Temas PS/UPA", "tags": ["penicilina", "benzatina", "antimicrobiano", "antibiótico", "sífilis"] },
  { "id": "147", "titulo": "Ertapenem", "categoria": "Temas PS/UPA", "tags": ["ertapenem", "antimicrobiano", "antibiótico", "carbapenêmico"] },
  { "id": "148", "titulo": "Dipirona", "categoria": "Temas PS/UPA", "tags": ["dipirona", "metamizol", "analgésico", "antitérmico", "antiespasmódico"] },
  { "id": "149", "titulo": "Paracetamol", "categoria": "Temas PS/UPA", "tags": ["paracetamol", "acetaminofeno", "analgésico", "antitérmico"] },
  { "id": "150", "titulo": "Ibuprofeno", "categoria": "Temas PS/UPA", "tags": ["ibuprofeno", "anti-inflamatório", "AINE", "analgésico"] },
  { "id": "151", "titulo": "Nimesulida", "categoria": "Temas PS/UPA", "tags": ["nimesulida", "anti-inflamatório", "AINE", "analgésico"] },
  { "id": "152", "titulo": "Cetoprofeno", "categoria": "Temas PS/UPA", "tags": ["cetoprofeno", "anti-inflamatório", "AINE", "analgésico"] },
  { "id": "153", "titulo": "Diclofenaco sódico", "categoria": "Temas PS/UPA", "tags": ["diclofenaco", "anti-inflamatório", "AINE", "analgésico"] },
  { "id": "154", "titulo": "Naproxeno sódico", "categoria": "Temas PS/UPA", "tags": ["naproxeno", "anti-inflamatório", "AINE", "analgésico"] },
  { "id": "155", "titulo": "Indometacina", "categoria": "Temas PS/UPA", "tags": ["indometacina", "anti-inflamatório", "AINE", "analgésico"] },
  { "id": "156", "titulo": "Cetorolaco trometamol", "categoria": "Temas PS/UPA", "tags": ["cetorolaco", "ketorolac", "anti-inflamatório", "AINE", "analgésico"] },
  { "id": "157", "titulo": "Meloxicam", "categoria": "Temas PS/UPA", "tags": ["meloxicam", "anti-inflamatório", "AINE", "COX-2", "analgésico"] },
  { "id": "158", "titulo": "Piroxicam", "categoria": "Temas PS/UPA", "tags": ["piroxicam", "anti-inflamatório", "AINE", "analgésico"] },
  { "id": "159", "titulo": "Celecoxibe", "categoria": "Temas PS/UPA", "tags": ["celecoxibe", "anti-inflamatório", "AINE", "COX-2", "analgésico"] },
  { "id": "160", "titulo": "Codeína", "categoria": "Temas PS/UPA", "tags": ["codeína", "opioide", "opioide fraco", "analgésico", "receita C1"] },
  { "id": "161", "titulo": "Tramadol", "categoria": "Temas PS/UPA", "tags": ["tramadol", "opioide", "opioide fraco", "analgésico", "receita C1"] },
  { "id": "162", "titulo": "Morfina", "categoria": "Temas PS/UPA", "tags": ["morfina", "opioide", "opioide forte", "analgésico", "receita A1"] },
  { "id": "163", "titulo": "Intoxicação por benzodiazepínicos", "categoria": "Temas PS/UPA", "tags": ["flumazenil", "benzodiazepínico", "BZD", "intoxicação", "toxicologia"] },
  { "id": "164", "titulo": "Naloxona", "categoria": "Temas PS/UPA", "tags": ["naloxona", "antagonista opioide", "intoxicação", "opioide", "toxicologia"] },
  { "id": "165", "titulo": "Flumazenil", "categoria": "Temas PS/UPA", "tags": ["flumazenil", "antagonista BZD", "benzodiazepínico", "intoxicação", "toxicologia"] },
  { "id": "166", "titulo": "Trazodona", "categoria": "Temas PS/UPA", "tags": ["trazodona", "insônia", "hipnótico", "antidepressivo", "sono"] },
  { "id": "167", "titulo": "Mirtazapina", "categoria": "Temas PS/UPA", "tags": ["mirtazapina", "insônia", "hipnótico", "antidepressivo", "sono"] },
  { "id": "168", "titulo": "Alprazolam", "categoria": "Temas PS/UPA", "tags": ["alprazolam", "benzodiazepínico", "BZD", "insônia", "ansiedade", "receita B1"] },
  { "id": "169", "titulo": "Eszopiclona", "categoria": "Temas PS/UPA", "tags": ["eszopiclona", "droga Z", "hipnótico", "insônia", "sono", "receita B1"] },
  { "id": "170", "titulo": "Zolpidem", "categoria": "Temas PS/UPA", "tags": ["zolpidem", "droga Z", "hipnótico", "insônia", "sono", "receita B1"] },
  { "id": "171", "titulo": "Enoxaparina", "categoria": "Temas PS/UPA", "tags": ["enoxaparina", "HBPM", "heparina", "anticoagulante", "TEV", "trombose", "profilaxia"] },
  { "id": "172", "titulo": "Heparina não fracionada", "categoria": "Temas PS/UPA", "tags": ["heparina", "HNF", "anticoagulante", "profilaxia", "TEV", "trombose"] },
  { "id": "173", "titulo": "Rivaroxabana", "categoria": "Temas PS/UPA", "tags": ["rivaroxabana", "NOAC", "anticoagulante oral", "TEV", "fibrilação atrial", "FA"] },
  { "id": "174", "titulo": "Apixabana", "categoria": "Temas PS/UPA", "tags": ["apixabana", "NOAC", "anticoagulante oral", "TEV", "fibrilação atrial", "FA"] },
  { "id": "175", "titulo": "Warfarina", "categoria": "Temas PS/UPA", "tags": ["warfarina", "cumarínico", "anticoagulante", "INR", "prótese valvar", "FA"] },
  { "id": "176", "titulo": "Ciclopirox Olamina", "categoria": "Temas PS/UPA", "tags": ["ciclopirox", "olamina", "antifúngico", "onicomicose", "esmalte", "tópico"] },
  { "id": "177", "titulo": "Amorolfina", "categoria": "Temas PS/UPA", "tags": ["amorolfina", "antifúngico", "onicomicose", "esmalte", "tópico"] },
  { "id": "178", "titulo": "Tioconazol", "categoria": "Temas PS/UPA", "tags": ["tioconazol", "antifúngico", "onicomicose", "solução", "tópico"] },
  { "id": "179", "titulo": "Bromoprida", "categoria": "Temas PS/UPA", "tags": ["bromoprida", "antiemético", "náusea", "vômito"] },
  { "id": "180", "titulo": "Metoclopramida", "categoria": "Temas PS/UPA", "tags": ["metoclopramida", "antiemético", "náusea", "vômito"] },
  { "id": "181", "titulo": "Ondansetrona", "categoria": "Temas PS/UPA", "tags": ["ondansetrona", "antiemético", "náusea", "vômito"] },
  { "id": "182", "titulo": "Dimenidrinato", "categoria": "Temas PS/UPA", "tags": ["dimenidrinato", "piridoxina", "antiemético", "náusea", "vômito", "Dramin"] }
,
  {
    "id": "185",
    "titulo": "Cefaleia tensional",
    "categoria": "Temas PS/UPA",
    "tags": ["cefaleia","dipirona","ibuprofeno","amitriptilina"],
    "relacionados": ["91","99","129"]
  },
  {
    "id": "186",
    "titulo": "Migrânea / Enxaqueca",
    "categoria": "Temas PS/UPA",
    "tags": ["migrânea","enxaqueca","sumatriptano","cefaleia"],
    "relacionados": ["63","185","187"]
  },
  {
    "id": "187",
    "titulo": "Cefaleia em salvas",
    "categoria": "Temas PS/UPA",
    "tags": ["cefaleia","salvas","verapamil","sumatriptano"],
    "relacionados": ["63","185","186"]
  },
  {
    "id": "188",
    "titulo": "Agitação psicomotora",
    "categoria": "Temas PS/UPA",
    "tags": ["agitação","psicomotora","save","clonazepam","benzodiazepínico"]
  },
  {
    "id": "189",
    "titulo": "Insuficiência Respiratória",
    "categoria": "IOT, Sedação e VM",
    "tags": ["insuficiência respiratória","hipoxemia","hipercapnia","SDRA","IRpA"],
    "relacionados": ["190","191","22","196"]
  },
  {
    "id": "190",
    "titulo": "Oxigenoterapia",
    "categoria": "IOT, Sedação e VM",
    "tags": ["oxigenoterapia","O2","HFNC","cateter nasal","máscara","Venturi"],
    "relacionados": ["189","191"]
  },
  {
    "id": "191",
    "titulo": "Ventilação Não Invasiva (VNI)",
    "categoria": "IOT, Sedação e VM",
    "tags": ["VNI","CPAP","BIPAP","ventilação não invasiva","DPOC","EAP"],
    "relacionados": ["189","190","196","197","198","12"]
  },
  {
    "id": "192",
    "titulo": "Materiais para Intubação",
    "categoria": "IOT, Sedação e VM",
    "tags": ["intubação","laringoscópio","TOT","bougie","cuff","IOT","lâmina"],
    "relacionados": ["22","193","194"]
  },
  {
    "id": "193",
    "titulo": "Os 7 Ps da Intubação",
    "categoria": "IOT, Sedação e VM",
    "tags": ["7 Ps","intubação","ISR","sequência rápida","pré-oxigenação","posicionamento"],
    "relacionados": ["22","192","194"]
  },
  {
    "id": "194",
    "titulo": "Medicações da ISR",
    "categoria": "IOT, Sedação e VM",
    "tags": ["ISR","fentanil","etomidato","quetamina","midazolam","propofol","succinilcolina","rocurônio"],
    "relacionados": ["22","193","195","210","211"]
  },
  {
    "id": "195",
    "titulo": "Sedação Pós-Intubação e Bloqueadores Neuromusculares em BIC",
    "categoria": "IOT, Sedação e VM",
    "tags": ["sedação","pós-intubação","BIC","dexmedetomidina","propofol","midazolam","fentanil","rocurônio","cisatracúrio"],
    "relacionados": ["194","210","211","22"]
  },
  {
    "id": "196",
    "titulo": "Ventilação Mecânica: Fundamentos e Modos",
    "categoria": "IOT, Sedação e VM",
    "tags": ["ventilação mecânica","PEEP","VCV","PCV","PSV","driving pressure","parâmetros"],
    "relacionados": ["191","197","198","220","221","20"]
  },
  {
    "id": "197",
    "titulo": "VM em Distúrbios Obstrutivos e Restritivos",
    "categoria": "IOT, Sedação e VM",
    "tags": ["ventilação mecânica","DPOC","asma","SDRA","obstrutivo","restritivo","auto-PEEP","recrutamento"],
    "relacionados": ["196","198","220","221","8","69"]
  },
  {
    "id": "198",
    "titulo": "Síndrome do Desconforto Respiratório Agudo (SDRA)",
    "categoria": "IOT, Sedação e VM",
    "tags": ["SDRA","Critérios de Berlim","hipoxemia","PaO2/FiO2","insuficiência respiratória aguda","edema pulmonar"],
    "relacionados": ["196","197","191","7"]
  },
  {
    "id": "199",
    "titulo": "Crises Hipertensivas",
    "categoria": "Temas PS/UPA",
    "tags": ["crise hipertensiva","urgência hipertensiva","emergência hipertensiva","hidralazina","captopril","clonidina","nitroprussiato","nitroglicerina"],
    "relacionados": ["202","203","13","11"]
  },
  {
    "id": "200",
    "titulo": "Dor Torácica/SCA",
    "categoria": "Temas PS/UPA",
    "tags": ["dor torácica","SCA","infarto","MONABCH","NAO","nitrato","AAS","clopidogrel","nitroglicerina"],
    "relacionados": ["11","204","205","13","199"]
  },
  {
    "id": "201",
    "titulo": "Infecções Respiratórias",
    "categoria": "Temas PS/UPA",
    "tags": ["resfriado","gripe","pneumonia","sinusite","faringoamigdalite","oseltamivir","paxlovid","IVAS","infecção respiratória"],
    "relacionados": ["70","71","72","73","74","208"]
  },
  {
    "id": "202",
    "titulo": "PA muito elevada sem lesão de órgão-alvo",
    "categoria": "Temas PS/UPA",
    "tags": ["urgência hipertensiva","PA elevada","hidralazina","clonidina","captopril","crise hipertensiva","uso oral"],
    "relacionados": ["199","203"]
  },
  {
    "id": "203",
    "titulo": "Emergência Hipertensiva",
    "categoria": "Temas PS/UPA",
    "tags": ["emergência hipertensiva","PA elevada","lesão de órgão-alvo","nitroglicerina","nitroprussiato","isossorbida","parenteral"],
    "relacionados": ["199","202","12","212"]
  },
  {
    "id": "204",
    "titulo": "Infarto com supra de ST",
    "categoria": "Temas PS/UPA",
    "tags": ["infarto","IAMCSST","supra de ST","AAS","clopidogrel","cateterismo","antiagregação","SCA"],
    "relacionados": ["205","11","200"]
  },
  {
    "id": "205",
    "titulo": "Infarto sem supra de ST",
    "categoria": "Temas PS/UPA",
    "tags": ["infarto","IAMSSST","sem supra de ST","AAS","clopidogrel","antiagregação","SCA"],
    "relacionados": ["204","11","200"]
  },
  {
    "id": "206",
    "titulo": "Oseltamivir",
    "categoria": "Temas PS/UPA",
    "tags": ["oseltamivir","tamiflu","influenza","gripe","antiviral","SRAG"]
  },
  {
    "id": "207",
    "titulo": "Paxlovid",
    "categoria": "Temas PS/UPA",
    "tags": ["paxlovid","nirmatrelvir","ritonavir","covid-19","antiviral","covid grave"]
  },
  {
    "id": "208",
    "titulo": "Infecções Respiratórias: Isolamento e Testagem",
    "categoria": "Temas PS/UPA",
    "tags": ["isolamento","testagem","covid-19","influenza","resfriado","RT-PCR","swab"],
    "relacionados": ["74","201","206","207"]
  },
  {
    "id": "209",
    "titulo": "Tosse Persistente ou Refratária",
    "categoria": "Temas PS/UPA",
    "tags": ["tosse","codeína","tosse persistente","antitussígeno","receita C1","opioide"],
    "relacionados": ["219","75","218"]
  },
  {
    "id": "210",
    "titulo": "Bloqueadores Neuromusculares em BIC",
    "categoria": "IOT, Sedação e VM",
    "tags": ["bloqueador neuromuscular","BIC","rocurônio","cisatracúrio","BNM","infusão contínua","paralisia","sedação","intubação"],
    "relacionados": ["195","211","194"]
  },
  {
    "id": "211",
    "titulo": "Sedação de Manutenção Pós-Intubação",
    "categoria": "IOT, Sedação e VM",
    "tags": ["sedação","pós-intubação","RASS","fentanil","midazolam","quetamina","propofol","dexmedetomidina","BIC","manutenção","infusão contínua"],
    "relacionados": ["195","210","194"]
  },
  {
    "id": "212",
    "titulo": "Edema Agudo de Pulmão",
    "categoria": "Temas PS/UPA",
    "tags": ["EAP","edema agudo de pulmão","furosemida","nitroglicerina","nitroprussiato","VNI","BiPAP","tridil","nipride","morfina"],
    "relacionados": ["12","203","191"]
  },
  {
    "id": "214",
    "titulo": "Taquicardia Supraventricular Paroxística",
    "categoria": "Temas PS/UPA",
    "tags": ["TSVP","adenosina","metoprolol","cardioversão","taquicardia supraventricular","manobra vagal","Valsalva"]
  },
  {
    "id": "215",
    "titulo": "Torsades de Pointes",
    "categoria": "Temas PS/UPA",
    "tags": ["torsades de pointes","sulfato de magnésio","desfibrilação","taquicardia ventricular","QT longo"]
  },
  {
    "id": "216",
    "titulo": "Noradrenalina (BIC)",
    "categoria": "Temas PS/UPA",
    "tags": ["noradrenalina","norepinefrina","vasopressor","choque séptico","BIC","droga vasoativa","levophed","hyponor"],
    "relacionados": ["17","217","16"]
  },
  {
    "id": "217",
    "titulo": "Dobutamina (BIC)",
    "categoria": "Temas PS/UPA",
    "tags": ["dobutamina","choque cardiogênico","BIC","droga vasoativa","inotrópico","insuficiência cardíaca","IC perfil C"],
    "relacionados": ["18","216","16"]
  },
  {
    "id": "218",
    "titulo": "Tosse Pós-Infecciosa",
    "categoria": "Temas PS/UPA",
    "tags": ["tosse pós-infecciosa","tosse pós-viral","dexclorfeniramina","prednisona","budesonida","codeína","IVAS"],
    "relacionados": ["75","219","209"]
  },
  {
    "id": "219",
    "titulo": "Tosse Produtiva e Não Produtiva",
    "categoria": "Temas PS/UPA",
    "tags": ["tosse produtiva","tosse seca","acetilcisteína","ambroxol","acebrofilina","codeína","dextrometorfano","mucolítico","antitussígeno"],
    "relacionados": ["76","77","218","209"]
  },
  {
    "id": "220",
    "titulo": "VCV — Ventilação Controlada a Volume",
    "categoria": "IOT, Sedação e VM",
    "tags": ["VCV","ventilação controlada a volume","volume corrente","pressão de pico","pressão de platô","driving pressure","parâmetros ventilatórios","barotrauma"],
    "relacionados": ["221","196"]
  },
  {
    "id": "221",
    "titulo": "PCV — Ventilação Controlada a Pressão",
    "categoria": "IOT, Sedação e VM",
    "tags": ["PCV","ventilação controlada a pressão","pressão inspiratória","Pinsp","volume corrente variável","barotrauma","parâmetros ventilatórios"],
    "relacionados": ["220","196"]
  },
  {
    "id": "222",
    "titulo": "Referências — IOT, Sedação e VM",
    "categoria": "IOT, Sedação e VM",
    "tags": ["referências","bibliografia","IOT","sedação","ventilação mecânica","fontes","UpToDate","JAMA","ERS","ATS"]
  },
  {
    "id": "223",
    "titulo": "Referências — Prescrições e Condutas",
    "categoria": "Emergência",
    "tags": ["referências","bibliografia","prescrições","condutas","UpToDate","FMUSP","Whitebook","Ministério da Saúde","SBC","Sepse","IDSA"]
  },
  {
    "id": "224",
    "titulo": "Meta de LDL conforme risco cardiovascular",
    "categoria": "Clínica Médica",
    "tags": ["LDL","colesterol","risco cardiovascular","estatina","dislipidemia","prevenção","PREVENT","AHA","ACC"],
    "relacionados": ["227","239"]
  },
  {
    "id": "225",
    "titulo": "Estadiamento da Doença Renal Crônica",
    "categoria": "Clínica Médica",
    "tags": ["DRC","doença renal crônica","TFG","KDIGO","estadiamento","albuminúria","GFR","CKD","rim","nefrologia"],
    "relacionados": ["226","238"]
  },
  {
    "id": "226",
    "titulo": "Lesão ou Injúria Renal Aguda (IRA)",
    "categoria": "Temas PS/UPA",
    "tags": ["IRA","AKI","injúria renal aguda","lesão renal aguda","KDIGO","creatinina","diurese","biomarcador","estadiamento","rim","urgência"],
    "relacionados": ["225","5","7"]
  },
  {
    "id": "227",
    "titulo": "Sinvastatina",
    "categoria": "Clínica Médica",
    "tags": ["sinvastatina","estatina","colesterol","LDL","dislipidemia","HMG-CoA","cardiovascular","prevenção","hiperlipidemia"],
    "relacionados": ["239","238","224"]
  },
  {
    "id": "228",
    "titulo": "Xerodermia (pele seca)",
    "categoria": "UBS/Atenção primária",
    "tags": ["xerodermia","pele seca","hidratante","loção","ressecamento","xerose","cuidados com a pele"]
  },
  {
    "id": "229",
    "titulo": "Dipirona (Metamizol)",
    "categoria": "Temas PS/UPA",
    "tags": ["dipirona","metamizol","analgésico","antipirético","AINE","anti-inflamatório","dor","febre","analgesia"],
    "relacionados": ["230","231","233","26"]
  },
  {
    "id": "230",
    "titulo": "Paracetamol (Acetaminofeno)",
    "categoria": "Temas PS/UPA",
    "tags": ["paracetamol","acetaminofeno","analgésico","antipirético","dor","febre","analgesia","hepatotoxicidade"],
    "relacionados": ["229","231","233","26"]
  },
  {
    "id": "231",
    "titulo": "Opioides Fracos",
    "categoria": "Temas PS/UPA",
    "tags": ["opioide","tramadol","codeína","analgésico","dor","opioide fraco","cloridrato de tramadol","fosfato de codeína"],
    "relacionados": ["232","229","230","233","26"]
  },
  {
    "id": "232",
    "titulo": "Sulfato de Morfina",
    "categoria": "Temas PS/UPA",
    "tags": ["morfina","sulfato de morfina","opioide","analgésico","dor","dor crônica","opioide forte"],
    "relacionados": ["231","162","233"]
  },
  {
    "id": "233",
    "titulo": "Racional da analgesia",
    "categoria": "Temas PS/UPA",
    "tags": ["analgesia","dor","escada analgésica","opioide","AINE","dor leve","dor moderada","dor intensa","racional"],
    "relacionados": ["26","229","230","231","232"]
  },
  {
    "id": "234",
    "titulo": "Antieméticos (Anti-histamínicos H1 e receptores muscarínicos)",
    "categoria": "Temas PS/UPA",
    "tags": ["antiemético","dimenidrato","dramin","náusea","vômito","anti-histamínico","receptor muscarínico","piridoxina"],
    "relacionados": ["235","236","237","182"]
  },
  {
    "id": "235",
    "titulo": "Antieméticos (Antagonistas dopaminérgicos D2)",
    "categoria": "Temas PS/UPA",
    "tags": ["antiemético","bromoprida","digesan","metoclopramida","plasil","náusea","vômito","antagonista dopaminérgico","D2"],
    "relacionados": ["234","236","237","179","180"]
  },
  {
    "id": "236",
    "titulo": "Antieméticos (Antagonistas Serotoninérgicos 5HT)",
    "categoria": "Temas PS/UPA",
    "tags": ["antiemético","ondansetrona","vonau","náusea","vômito","antagonista serotoninérgico","5HT","5-HT3"],
    "relacionados": ["234","235","237","181"]
  },
  {
    "id": "237",
    "titulo": "Abordagem direcionada de náuseas e vômitos",
    "categoria": "Temas PS/UPA",
    "tags": ["náusea","vômito","antiemético","ondansetrona","metoclopramida","bromoprida","dimenidrato","escopolamina","domperidona","gestante","cinetose","gastroparesia","quimioterapia","pós operatório"],
    "relacionados": ["234","235","236","46","47"]
  },
  {
    "id": "238",
    "titulo": "DM2 — Abordagem Prática na UBS",
    "categoria": "UBS/Atenção primária",
    "tags": ["dm2","diabetes","diabetes mellitus tipo 2","metformina","gliclazida","dapagliflozina","insulina NPH","insulina regular","glicemia","hba1c","TOTG","rastreio","pré-diabetes","hiperglicemia","ajuste renal","atenção básica","UBS","referenciamento"],
    "relacionados": ["227","239","240","225"]
  },
  {
    "id": "239",
    "titulo": "Ezetimibe",
    "categoria": "Medicamento",
    "tags": ["ezetimibe","colesterol","LDL","dislipidemia","hiperlipidemia","hipercolesterolemia","NPC1L1","lipídios","prevenção cardiovascular","redução LDL"],
    "relacionados": ["227","224"]
  },
  {
    "id": "240",
    "titulo": "Omeprazol",
    "categoria": "Medicamento",
    "tags": ["omeprazol","IBP","bomba de prótons","DRGE","refluxo","dispepsia","gastrite","úlcera","antiácido","esôfago","estômago"],
    "relacionados": ["9","54","55","56","57"]
  },
  {
    "id": "241",
    "titulo": "Effects of lipid-lowering drugs on serum lipid levels",
    "categoria": "Guias práticos",
    "tags": ["estatina","ezetimibe","PCSK9","hipolipemiante","LDL","HDL","triglicerídeos","lipídios","dislipidemia","colesterol","fibrato","ômega-3","colesevelam","ácido bempedóico","sinvastatina","atorvastatina","rosuvastatina"],
    "relacionados": ["224","227","239"]
  }
];
export const categorias = ["Todos", "Emergência", "Temas PS/UPA", "IOT, Sedação e VM"];

export const intubacaoIds = new Set(["20","22","189","190","191","192","193","194","195","196","197","198","210","211","220","221","222"]);

export const emergenciaIds = new Set(["1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16","17","18","19","20","21","22","23","24","101","102","103","104","105","106","107","108","109","110","189","190","191","192","193","194","195","196","197","198","200","204","205","210","211","212","214","215","216","217","220","221"]);

export const evidenciaIds = new Set(["189","190","191","192","193","194","195","196","197","198","210","211","220","221","229","230","231","232","233","234","235","236","237","241"]);

export const ubsIds = new Set(["32","35","36","37","39","40","41","42","43","45","51","54","55","56","57","59","60","61","63","64","65","66","67","68","69","70","71","72","73","74","75","76","77","78","79","81","84","85","86","87","88","89","90","91","92","94","95","96","99","100","111","113","183","184","185","186","187","224","225","228","233","237","238","241"]);

export const medicamentoIds = new Set([
  "18",
  "115","116","117","118","119","120","121","122","123","124","125","126","127","128","129",
  "130","132","133","134","135","136","137","138","139","140","141","142","143","144",
  "145","146","147","148","149","150","151","152","153","154","155","156","157","158","159",
  "160","161","162","164","165","166","167","168","169","170",
  "171","172","173","174","175",
  "176","177","178",
  "179","180","181","182",
  "206","207","216","217",
  "227","229","230","231","232","234","235","236","239","240"
]);

export const bibliografiaIds = new Set(["222","223"]);
