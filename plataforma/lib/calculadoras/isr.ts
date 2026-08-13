// ISR — Intubação em Sequência Rápida

export interface ISRApresentacao {
  label: string;    // exibido no seletor
  conc: number;     // mg/mL ou mcg/mL
  nota?: string;    // informação adicional sobre a apresentação
}

export interface ISRMed {
  nome: string;
  doseMin: number;
  doseMax: number | null;
  unidade: "mg/kg" | "mcg/kg";
  unidadeConc: string;
  apresentacoes: ISRApresentacao[];
}

export interface ISRCategoria {
  nome: string;
  medicamentos: ISRMed[];
}

export const ISR_CATEGORIAS: ISRCategoria[] = [
  {
    nome: "Analgesia",
    medicamentos: [
      {
        nome: "Fentanil",
        doseMin: 1, doseMax: 3, unidade: "mcg/kg", unidadeConc: "mcg/mL",
        apresentacoes: [
          { label: "50 mcg/mL", conc: 50, nota: "amp. 10 mL = 500 mcg" },
        ],
      },
    ],
  },
  {
    nome: "Sedação",
    medicamentos: [
      {
        nome: "Etomidato",
        doseMin: 0.3, doseMax: null, unidade: "mg/kg", unidadeConc: "mg/mL",
        apresentacoes: [
          { label: "2 mg/mL", conc: 2, nota: "amp. 10 mL = 20 mg" },
        ],
      },
      {
        nome: "Midazolam",
        doseMin: 0.2, doseMax: null, unidade: "mg/kg", unidadeConc: "mg/mL",
        apresentacoes: [
          { label: "5 mg/mL", conc: 5 },
          { label: "1 mg/mL", conc: 1 },
        ],
      },
      {
        nome: "Quetamina",
        doseMin: 1, doseMax: 2, unidade: "mg/kg", unidadeConc: "mg/mL",
        apresentacoes: [
          { label: "50 mg/mL", conc: 50, nota: "amp. 10 mL = 500 mg" },
        ],
      },
      {
        nome: "Propofol",
        doseMin: 1.5, doseMax: null, unidade: "mg/kg", unidadeConc: "mg/mL",
        apresentacoes: [
          { label: "10 mg/mL (1%)", conc: 10, nota: "amp. 20 mL = 200 mg" },
          { label: "20 mg/mL (2%)", conc: 20, nota: "amp. 50 mL = 1000 mg" },
        ],
      },
    ],
  },
  {
    nome: "Bloqueio neuromuscular",
    medicamentos: [
      {
        nome: "Succinilcolina",
        doseMin: 1.5, doseMax: null, unidade: "mg/kg", unidadeConc: "mg/mL",
        apresentacoes: [
          { label: "10 mg/mL", conc: 10, nota: "01 fr. 100 mg + 10 mL SF 0,9%" },
        ],
      },
      {
        nome: "Rocurônio",
        doseMin: 1, doseMax: null, unidade: "mg/kg", unidadeConc: "mg/mL",
        apresentacoes: [
          { label: "10 mg/mL", conc: 10, nota: "fr. 5 mL = 50 mg" },
        ],
      },
    ],
  },
];

function fmt(n: number): string {
  if (Number.isInteger(n)) return String(n);
  const s = n.toFixed(1);
  return s.replace(".", ",");
}

export interface ISRDoseCalc {
  doseStr: string;
  volStr: string;
}

export function calcularDoseISR(med: ISRMed, peso: number, conc: number): ISRDoseCalc {
  const doseMin = Math.round(med.doseMin * peso);
  const doseMax = med.doseMax !== null ? Math.round(med.doseMax * peso) : null;
  const volMin  = Math.round((doseMin / conc) * 10) / 10;
  const volMax  = doseMax !== null ? Math.round((doseMax / conc) * 10) / 10 : null;

  const unid    = med.unidade === "mcg/kg" ? "mcg" : "mg";
  const doseStr = doseMax !== null
    ? `${fmt(doseMin)}–${fmt(doseMax)} ${unid}`
    : `${fmt(doseMin)} ${unid}`;

  const volStr  = volMax !== null
    ? `~${fmt(volMin)}–${fmt(volMax)} mL`
    : `~${fmt(volMin)} mL`;

  return { doseStr, volStr };
}
