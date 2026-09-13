export type QuizQuestion = {
  id: number;
  question: string;
  options: [string, string, string, string];
  correctIndex: number; // 0-3
  explanation: string;
  category: string;
};

export const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: "Qual a dose de Dipirona EV para adultos no manejo da dor aguda?",
    options: ["500mg", "1g", "2g", "3g"],
    correctIndex: 1,
    explanation: "Dipirona 1g EV é a dose padrão para adultos no manejo da dor aguda.",
    category: "Analgesia",
  },
  {
    id: 2,
    question: "Qual cristaloide é preferencial na reposição volêmica inicial do choque séptico?",
    options: ["SF 0,9%", "Ringer Lactato", "SG 5%", "Albumina 5%"],
    correctIndex: 1,
    explanation: "O Ringer Lactato é preferencial por ser uma solução balanceada, com menor risco de acidose hiperclorêmica.",
    category: "Emergência",
  },
  {
    id: 3,
    question: "Qual o antídoto para intoxicação por benzodiazepínicos?",
    options: ["Naloxona", "Flumazenil", "N-acetilcisteína", "Atropina"],
    correctIndex: 1,
    explanation: "Flumazenil é o antagonista competitivo dos receptores GABA-A, revertendo os efeitos dos benzodiazepínicos.",
    category: "Toxicologia",
  },
  {
    id: 4,
    question: "Qual a dose de ataque de Amiodarona na PCR com FV/TV sem pulso?",
    options: ["150mg", "300mg", "450mg", "600mg"],
    correctIndex: 1,
    explanation: "Amiodarona 300mg EV em bolus é a dose de ataque na PCR refratária (FV/TVSP). Dose adicional de 150mg pode ser feita.",
    category: "PCR/ACLS",
  },
  {
    id: 5,
    question: "No tratamento da anafilaxia, qual a via preferencial para Adrenalina?",
    options: ["Endovenosa", "Intramuscular", "Subcutânea", "Inalatória"],
    correctIndex: 1,
    explanation: "Adrenalina IM (face anterolateral da coxa) é a via preferencial na anafilaxia. EV é reservada para choque refratário com monitorização.",
    category: "Emergência",
  },
  {
    id: 6,
    question: "Qual a saturação de O2 alvo na DPOC exacerbada?",
    options: ["94-98%", "88-92%", "80-85%", "96-100%"],
    correctIndex: 1,
    explanation: "Na DPOC, a meta de SpO2 é 88-92% para evitar supressão do drive hipóxico.",
    category: "Pneumologia",
  },
  {
    id: 7,
    question: "Qual antibiótico é primeira linha para pneumonia adquirida na comunidade (PAC) leve?",
    options: ["Ceftriaxona", "Amoxicilina", "Azitromicina", "Levofloxacino"],
    correctIndex: 1,
    explanation: "Amoxicilina é primeira linha para PAC leve em pacientes sem comorbidades, conforme diretrizes brasileiras.",
    category: "Infectologia",
  },
  {
    id: 8,
    question: "Qual o volume de SF 0,9% para expansão volêmica rápida no adulto em choque?",
    options: ["250mL", "500mL", "1000mL", "2000mL"],
    correctIndex: 1,
    explanation: "Reposição inicial de 500mL em bolus rápido (pode repetir até 30mL/kg nas primeiras 3h no choque séptico).",
    category: "Emergência",
  },
  {
    id: 9,
    question: "Qual a dose de Ondansetrona EV para náuseas/vômitos no adulto?",
    options: ["2mg", "4mg", "8mg", "16mg"],
    correctIndex: 2,
    explanation: "Ondansetrona 8mg EV é a dose mais usada para náuseas e vômitos no adulto no PS.",
    category: "Sintomáticos",
  },
  {
    id: 10,
    question: "Qual a primeira medida no manejo da hipoglicemia sintomática com acesso venoso?",
    options: ["Glucagon IM", "Glicose 50% 40mL EV", "SG 10% 500mL", "Alimentação oral"],
    correctIndex: 1,
    explanation: "Glicose 50% 40mL (20g de glicose) EV em bolus é a primeira medida no paciente com acesso venoso.",
    category: "Endocrinologia",
  },
  {
    id: 11,
    question: "Qual medicamento é contraindicado no IAM com supradesnível de ST inferior com envolvimento de VD?",
    options: ["AAS", "Nitroglicerina", "Morfina", "Clopidogrel"],
    correctIndex: 1,
    explanation: "Nitrato é contraindicado no IAM de VD por causar vasodilatação e redução da pré-carga, piorando o choque.",
    category: "Cardiologia",
  },
  {
    id: 12,
    question: "Qual a dose de Metilprednisolona no tratamento do broncoespasmo grave?",
    options: ["20mg EV", "40mg EV", "125mg EV", "500mg EV"],
    correctIndex: 2,
    explanation: "Metilprednisolona 125mg EV (ou equivalente) é a dose no broncoespasmo grave/asma quase-fatal.",
    category: "Pneumologia",
  },
  {
    id: 13,
    question: "No manejo da cetoacidose diabética, qual a reposição de potássio inicial se K+ entre 3,3-5,3 mEq/L?",
    options: ["Não repor", "10 mEq/L de soro", "20-40 mEq/L de soro", "Cloreto de potássio VO"],
    correctIndex: 2,
    explanation: "Com K+ entre 3,3-5,3 mEq/L, repor 20-40 mEq/L em cada litro de SF. Se K+ < 3,3, corrigir antes da insulina.",
    category: "Endocrinologia",
  },
  {
    id: 14,
    question: "Qual a dose de Ceftriaxona para meningite bacteriana no adulto?",
    options: ["1g 12/12h", "2g 12/12h", "1g 24h", "4g 24h"],
    correctIndex: 1,
    explanation: "Ceftriaxona 2g EV 12/12h é o esquema padrão para meningite bacteriana no adulto.",
    category: "Infectologia",
  },
  {
    id: 15,
    question: "Qual o tempo máximo de porta-agulha na terapia trombolítica do IAM com supra de ST?",
    options: ["10 minutos", "30 minutos", "60 minutos", "90 minutos"],
    correctIndex: 1,
    explanation: "O tempo porta-agulha ideal é de até 30 minutos para trombólise no IAMCSST.",
    category: "Cardiologia",
  },
  {
    id: 16,
    question: "Qual a concentração de Adrenalina usada na nebulização para laringite (crupe)?",
    options: ["1:100", "1:1000", "1:10000", "1:100000"],
    correctIndex: 1,
    explanation: "Adrenalina 1:1000 (1mg/mL) 3-5mL em nebulização é o tratamento do crupe moderado a grave.",
    category: "Pediatria",
  },
  {
    id: 17,
    question: "Qual a dose de Diazepam EV no estado de mal epiléptico no adulto?",
    options: ["5mg", "10mg", "20mg", "40mg"],
    correctIndex: 1,
    explanation: "Diazepam 10mg EV (velocidade máxima 5mg/min), podendo repetir uma vez após 5-10 minutos.",
    category: "Neurologia",
  },
  {
    id: 18,
    question: "Qual o exame de imagem de escolha para avaliação inicial de abdome agudo?",
    options: ["Raio-X de abdome", "TC de abdome com contraste", "USG de abdome", "RM de abdome"],
    correctIndex: 2,
    explanation: "TC de abdome com contraste é o exame mais sensível e específico para avaliação do abdome agudo no PS.",
    category: "Cirurgia",
  },
  {
    id: 19,
    question: "Qual a velocidade máxima de infusão de Potássio EV pelo acesso periférico?",
    options: ["10 mEq/h", "20 mEq/h", "40 mEq/h", "60 mEq/h"],
    correctIndex: 1,
    explanation: "Pelo acesso periférico, a velocidade máxima segura é 20 mEq/h. Acesso central permite até 40 mEq/h com monitorização.",
    category: "Distúrbios eletrolíticos",
  },
  {
    id: 20,
    question: "Qual o tempo de janela para trombólise no AVC isquêmico com Alteplase?",
    options: ["3 horas", "4,5 horas", "6 horas", "12 horas"],
    correctIndex: 1,
    explanation: "Alteplase pode ser administrada até 4,5 horas do início dos sintomas no AVC isquêmico.",
    category: "Neurologia",
  },
  {
    id: 21,
    question: "Qual a dose de Sulfato de Magnésio na eclâmpsia (esquema Zuspan)?",
    options: ["2g EV em bolus", "4g EV em 20min + 1g/h manutenção", "6g EV em 20min + 2g/h manutenção", "8g IM"],
    correctIndex: 1,
    explanation: "Esquema Zuspan: MgSO4 4g EV em 20 minutos (ataque) + 1g/h em bomba de infusão (manutenção por 24h).",
    category: "Obstetrícia",
  },
  {
    id: 22,
    question: "Qual antiemético deve ser evitado em pacientes com doença de Parkinson?",
    options: ["Ondansetrona", "Metoclopramida", "Dimenidrinato", "Dexametasona"],
    correctIndex: 1,
    explanation: "Metoclopramida é antagonista dopaminérgico e piora os sintomas parkinsonianos. Preferir Ondansetrona.",
    category: "Neurologia",
  },
  {
    id: 23,
    question: "Qual a dose de Hidrocortisona no choque séptico refratário a vasopressores?",
    options: ["50mg 6/6h", "100mg 8/8h", "200mg em bolus", "500mg 12/12h"],
    correctIndex: 0,
    explanation: "Hidrocortisona 50mg EV 6/6h (200mg/dia) é o esquema recomendado no choque séptico refratário.",
    category: "Emergência",
  },
  {
    id: 24,
    question: "Qual o antídoto para intoxicação por paracetamol?",
    options: ["Flumazenil", "Naloxona", "N-acetilcisteína", "Desferoxamina"],
    correctIndex: 2,
    explanation: "N-acetilcisteína (NAC) é o antídoto, devendo ser iniciada em até 8h da ingestão para máxima eficácia.",
    category: "Toxicologia",
  },
  {
    id: 25,
    question: "Qual a frequência de compressões torácicas recomendada na RCP do adulto?",
    options: ["60-80/min", "80-100/min", "100-120/min", "120-140/min"],
    correctIndex: 2,
    explanation: "A frequência ideal de compressões é 100-120/min com profundidade de 5-6cm, permitindo retorno completo do tórax.",
    category: "PCR/ACLS",
  },
  {
    id: 26,
    question: "Qual a droga de escolha para taquicardia supraventricular (TSV) estável?",
    options: ["Amiodarona", "Adenosina", "Verapamil", "Lidocaína"],
    correctIndex: 1,
    explanation: "Adenosina 6mg EV em bolus rápido (seguido de flush) é a primeira escolha. Pode repetir 12mg se necessário.",
    category: "Cardiologia",
  },
  {
    id: 27,
    question: "No trauma, qual a classificação de choque hemorrágico com perda de 30-40% da volemia?",
    options: ["Classe I", "Classe II", "Classe III", "Classe IV"],
    correctIndex: 2,
    explanation: "Classe III: perda de 30-40% (1500-2000mL), com taquicardia, hipotensão, taquipneia e rebaixamento do nível de consciência.",
    category: "Trauma",
  },
  {
    id: 28,
    question: "Qual a dose de Furosemida EV no edema agudo de pulmão?",
    options: ["10mg", "20-40mg", "80mg", "200mg"],
    correctIndex: 1,
    explanation: "Furosemida 20-40mg EV (0,5-1mg/kg) em bolus. Pode repetir se necessário conforme resposta clínica.",
    category: "Cardiologia",
  },
  {
    id: 29,
    question: "Qual o soro de manutenção padrão para adultos internados sem restrições?",
    options: ["SF 0,9% 500mL 8/8h", "SG 5% 500mL + NaCl 20% 10mL + KCl 19,1% 5mL", "Ringer Lactato 1000mL 12/12h", "SG 10% 500mL 8/8h"],
    correctIndex: 1,
    explanation: "O soro de manutenção padrão é SG 5% 500mL + NaCl 20% 10mL + KCl 19,1% 5mL (ou 10mL) a cada 8h.",
    category: "Prescrição hospitalar",
  },
  {
    id: 30,
    question: "Qual a dose de Tramadol EV para dor moderada a intensa no adulto?",
    options: ["25mg", "50-100mg", "150mg", "200mg"],
    correctIndex: 1,
    explanation: "Tramadol 50-100mg EV (diluído, infusão lenta em 15-30min). Dose máxima diária: 400mg.",
    category: "Analgesia",
  },
  {
    id: 31,
    question: "Qual a principal complicação do uso de Succinilcolina na intubação?",
    options: ["Broncoespasmo", "Hipercalemia", "Hipotensão", "Bradicardia persistente"],
    correctIndex: 1,
    explanation: "Hipercalemia é a complicação mais temida, especialmente em queimados, rabdomiólise, doenças neuromusculares e lesão medular.",
    category: "IOT/VM",
  },
  {
    id: 32,
    question: "Qual o tempo mínimo de jejum para líquidos claros antes de uma sedação/procedimento?",
    options: ["1 hora", "2 horas", "4 horas", "6 horas"],
    correctIndex: 1,
    explanation: "Líquidos claros: 2 horas. Leite materno: 4h. Refeição leve: 6h. Refeição completa: 8h.",
    category: "Anestesia",
  },
  {
    id: 33,
    question: "Qual a dose de Dexametasona no tratamento da laringite viral (crupe)?",
    options: ["0,15 mg/kg", "0,3 mg/kg", "0,6 mg/kg", "1 mg/kg"],
    correctIndex: 2,
    explanation: "Dexametasona 0,6 mg/kg (dose única, VO ou IM, máx 10mg) é o corticoide de escolha no crupe.",
    category: "Pediatria",
  },
  {
    id: 34,
    question: "Qual medicamento reduz a mortalidade na insuficiência cardíaca com fração de ejeção reduzida (ICFEr)?",
    options: ["Digoxina", "Furosemida", "Carvedilol", "Amlodipina"],
    correctIndex: 2,
    explanation: "Betabloqueadores (Carvedilol, Bisoprolol, Metoprolol succinato) reduzem mortalidade na ICFEr.",
    category: "Cardiologia",
  },
  {
    id: 35,
    question: "Qual a relação compressão:ventilação na RCP de adulto com via aérea não avançada (2 socorristas)?",
    options: ["15:2", "30:2", "15:1", "Compressões contínuas"],
    correctIndex: 1,
    explanation: "30:2 é a relação padrão para adultos. Com via aérea avançada, compressões contínuas + 1 ventilação a cada 6 segundos.",
    category: "PCR/ACLS",
  },
  {
    id: 36,
    question: "Qual a dose de Cetamina para indução em sequência rápida (ISR)?",
    options: ["0,5 mg/kg", "1-2 mg/kg", "3-4 mg/kg", "5 mg/kg"],
    correctIndex: 1,
    explanation: "Cetamina 1-2 mg/kg EV é a dose para ISR. É a droga de escolha no broncoespasmo grave e no choque.",
    category: "IOT/VM",
  },
  {
    id: 37,
    question: "Qual o eletrólito mais importante a monitorar durante a correção de cetoacidose diabética?",
    options: ["Sódio", "Potássio", "Cálcio", "Magnésio"],
    correctIndex: 1,
    explanation: "Potássio: a insulina causa shift intracelular de K+. Se K+ < 3,3, corrigir ANTES de iniciar insulina.",
    category: "Endocrinologia",
  },
  {
    id: 38,
    question: "Qual a escala usada para avaliar o nível de consciência no trauma?",
    options: ["NIHSS", "Glasgow", "RASS", "Cincinnati"],
    correctIndex: 1,
    explanation: "Escala de Coma de Glasgow (3-15): Abertura ocular (1-4) + Resposta verbal (1-5) + Resposta motora (1-6).",
    category: "Trauma",
  },
  {
    id: 39,
    question: "Qual a dose de Heparina não fracionada (HNF) em bolus para TEP maciço?",
    options: ["5.000 UI", "10.000 UI", "80 UI/kg", "150 UI/kg"],
    correctIndex: 2,
    explanation: "HNF 80 UI/kg EV em bolus, seguida de infusão contínua de 18 UI/kg/h, com ajuste pelo TTPa.",
    category: "Cardiologia",
  },
  {
    id: 40,
    question: "Qual a principal causa de parada cardiorrespiratória em crianças?",
    options: ["Arritmia cardíaca", "Insuficiência respiratória", "Trauma", "Intoxicação"],
    correctIndex: 1,
    explanation: "Em crianças, a PCR é mais comumente causada por insuficiência respiratória progressiva (hipóxia), diferente dos adultos onde predominam causas cardíacas.",
    category: "Pediatria",
  },
  {
    id: 41,
    question: "Qual a posição ideal para punção lombar?",
    options: ["Decúbito dorsal", "Decúbito lateral com flexão", "Sentado ereto", "Trendelenburg"],
    correctIndex: 1,
    explanation: "Decúbito lateral com flexão (posição fetal) é a posição padrão. Sentado é alternativa para pacientes obesos.",
    category: "Procedimentos",
  },
  {
    id: 42,
    question: "Qual antibiótico é primeira linha para ITU não complicada na mulher?",
    options: ["Ciprofloxacino", "Amoxicilina + Clavulanato", "Nitrofurantoína", "Cefalexina"],
    correctIndex: 2,
    explanation: "Nitrofurantoína 100mg 12/12h por 5 dias é primeira linha para cistite não complicada.",
    category: "Infectologia",
  },
  {
    id: 43,
    question: "Qual a dose de Epinefrina na PCR do adulto?",
    options: ["0,5mg EV a cada 3-5min", "1mg EV a cada 3-5min", "2mg EV a cada 5min", "1mg EV dose única"],
    correctIndex: 1,
    explanation: "Epinefrina 1mg EV/IO a cada 3-5 minutos durante toda a PCR. Na FV/TVSP, após o 2º choque.",
    category: "PCR/ACLS",
  },
  {
    id: 44,
    question: "Qual o critério de SIRS que NÃO faz parte da definição?",
    options: ["FC > 90bpm", "FR > 20irpm", "PAS < 90mmHg", "Temperatura > 38°C ou < 36°C"],
    correctIndex: 2,
    explanation: "Os critérios de SIRS são: T>38°C ou <36°C, FC>90, FR>20 ou PaCO2<32, Leucócitos>12.000 ou <4.000. Hipotensão não é critério de SIRS.",
    category: "Emergência",
  },
  {
    id: 45,
    question: "Qual o tratamento de escolha para crise hipertensiva com edema agudo de pulmão?",
    options: ["Captopril VO", "Nitroglicerina EV", "Nitroprussiato EV", "Clonidina VO"],
    correctIndex: 1,
    explanation: "Nitroglicerina EV é preferida no EAP hipertensivo por reduzir pré-carga e pós-carga, com efeito vasodilatador coronariano.",
    category: "Cardiologia",
  },
  {
    id: 46,
    question: "Qual a dose de Rocurônio para intubação em sequência rápida?",
    options: ["0,3 mg/kg", "0,6 mg/kg", "1,2 mg/kg", "2 mg/kg"],
    correctIndex: 2,
    explanation: "Rocurônio 1,2 mg/kg EV para ISR (onset ~60s). Dose de 0,6 mg/kg é para bloqueio de rotina (onset ~90s).",
    category: "IOT/VM",
  },
  {
    id: 47,
    question: "Qual a complicação mais comum da ventilação mecânica invasiva?",
    options: ["Barotrauma", "Pneumonia associada à ventilação (PAV)", "Atelectasia", "Toxicidade por oxigênio"],
    correctIndex: 1,
    explanation: "PAV é a infecção nosocomial mais comum em UTI, ocorrendo em 10-20% dos pacientes ventilados por > 48h.",
    category: "IOT/VM",
  },
  {
    id: 48,
    question: "Qual o tempo ideal de antibioticoprofilaxia cirúrgica antes da incisão?",
    options: ["15 minutos", "30-60 minutos", "2 horas", "No momento da incisão"],
    correctIndex: 1,
    explanation: "O antibiótico deve ser administrado 30-60 minutos antes da incisão para atingir concentração tecidual adequada.",
    category: "Cirurgia",
  },
  {
    id: 49,
    question: "Qual a dose de Propofol para indução anestésica no adulto?",
    options: ["0,5-1 mg/kg", "1-2,5 mg/kg", "3-4 mg/kg", "5 mg/kg"],
    correctIndex: 1,
    explanation: "Propofol 1-2,5 mg/kg EV para indução. Reduzir dose em idosos e pacientes instáveis hemodinamicamente.",
    category: "IOT/VM",
  },
  {
    id: 50,
    question: "Qual exame confirma o diagnóstico de TEP?",
    options: ["D-dímero", "Raio-X de tórax", "Angiotomografia de tórax", "Ecocardiograma"],
    correctIndex: 2,
    explanation: "Angiotomografia (AngioTC) de tórax é o exame confirmatório padrão-ouro para TEP na prática clínica.",
    category: "Pneumologia",
  },
];

export function getDailyQuestions(dateStr: string): QuizQuestion[] {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = ((hash << 5) - hash + dateStr.charCodeAt(i)) | 0;
  }
  hash = Math.abs(hash);

  const indices: number[] = [];
  const total = quizQuestions.length;
  let attempt = 0;
  while (indices.length < 5 && attempt < 100) {
    const idx = ((hash + attempt * 7 + attempt * attempt * 13) % total + total) % total;
    if (!indices.includes(idx)) indices.push(idx);
    attempt++;
  }

  return indices.map((i) => quizQuestions[i]);
}

export function getTodayDateStr(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export function getQuizDateUTC(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}
