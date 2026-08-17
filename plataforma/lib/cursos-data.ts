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
  thumbLocal?: string; // path relative to public/ for lessons without YouTube video
  semVideo?: boolean; // true for PDF-only bonus lessons — hides video player
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
        descricao: "Segundo UpToDate, Amoxicilina 500 mg de 8/8h por 10 dias é a recomendação para Faringite Estreptocóccica.\n\nAs infecções respiratórias estão entre os motivos mais frequentes de atendimento na Atenção Primária, UPA e Pronto-Socorro, exigindo do médico uma avaliação criteriosa para diferenciar quadros autolimitados de situações que demandam investigação e tratamento específicos.\n\nAprenda uma abordagem sistematizada para avaliar pacientes com infecções respiratórias de forma rápida, segura e baseada em evidências.\n\nNesta aula, você verá o passo a passo para conduzir os principais quadros respiratórios do adulto, reconhecer sinais de gravidade, indicar exames quando necessários e definir a melhor conduta sem travar diante da queixa.\n\nEsta aula, assim como todas as demais do curso, conta com materiais de apoio exclusivos:\n\n✅ Material teórico atualizado e baseado em evidências.\n\n✅ Guia de prescrição com orientações práticas para os principais cenários clínicos.\n\n✅ Guia de evolução com modelos prontos para tornar seus atendimentos mais rápidos e eficientes.",
        pasta: "aularesp",
        materiais: [
          { id: "material-teorico", titulo: "Material de Apoio - Infecções Respiratórias", arquivo: "Material de Apoio Infecções Respiratórias.pdf", tamanho: "3,2 MB" },
          { id: "guia-evolucao", titulo: "Modelo de Evolução - Infecções Respiratórias", arquivo: "Modelo de Evolução Infecções Respiratórias.pdf", tamanho: "1,1 MB" },
          { id: "guia-prescricao", titulo: "Modelo de Prescrição - Infecções Respiratórias", arquivo: "Modelo de Prescrição Infecções Respiratórias.pdf", tamanho: "2,5 MB" },
        ],
      },
      {
        id: 7,
        titulo: "ECG no plantão: o essencial para o generalista.",
        duracao: "23:13",
        descricao: "O eletrocardiograma está entre os exames mais solicitados no plantão médico e interpretar seus achados com segurança pode fazer diferença em situações críticas e decisões urgentes.\n\nAprenda uma abordagem sistematizada para interpretar ECG de forma rápida, prática e sem decorar padrões aleatórios.\n\nNesta aula, você verá o passo a passo para analisar um eletrocardiograma, identificar alterações importantes e reconhecer os principais padrões encontrados no dia a dia do plantão, ganhando mais segurança para tomar decisões e conduzir seus pacientes sem travar diante do exame.\n\nEsta aula, assim como todas as demais do curso, conta com material de apoio exclusivo:\n\n✅ Material teórico atualizado e baseado em evidências.\n\n⚠️ Correção: no tempo 16:52 do vídeo, o correto é que, por se tratar de um homem com mais de 40 anos, um supradesnivelamento ≥ 2 mm (e não 2,5 mm) já é suficiente para ser considerado.",
        pasta: "aulaecg",
        materiais: [
          { id: "material-teorico", titulo: "Material de Apoio - ECG", arquivo: "Material de Apoio ECG.pdf", tamanho: "3,8 MB" },
        ],
      },
      {
        id: 8,
        titulo: "Dor torácica: decisões que salvam vidas.",
        duracao: "21:10",
        descricao: "A dor torácica está entre as queixas mais frequentes e desafiadoras do plantão médico, podendo variar desde causas benignas até condições potencialmente fatais que exigem reconhecimento imediato.\n\nAprenda uma abordagem sistematizada para avaliar pacientes com dor torácica de forma rápida, segura e baseada em evidências.\n\nNesta aula, você verá o passo a passo para conduzir a investigação inicial, reconhecer sinais de gravidade, diferenciar os principais diagnósticos e tomar decisões com mais segurança, sem travar diante da queixa.\n\nEsta aula, assim como todas as demais do curso, conta com materiais de apoio exclusivos:\n\n✅ Material teórico atualizado e baseado em evidências.\n\n✅ Guia de prescrição com orientações práticas para os principais cenários clínicos.\n\n✅ Guia de evolução com modelos prontos para tornar seus atendimentos mais rápidos e eficientes.",
        pasta: "auladortoracica",
        materiais: [
          { id: "material-teorico", titulo: "Material de Apoio - Dor Torácica", arquivo: "Material de Apoio Dor torácica.pdf", tamanho: "1,7 MB" },
          { id: "guia-evolucao", titulo: "Modelo de Evolução - Dor Torácica", arquivo: "Modelo de Evolução - Dor toracica.pdf", tamanho: "353 KB" },
          { id: "guia-prescricao", titulo: "Modelo de Prescrição - Dor Torácica", arquivo: "Modelo de Prescrição - Dor torácica.pdf", tamanho: "762 KB" },
          { id: "diretriz-sbc-2025", titulo: "Diretriz SBC — Dor Torácica na Emergência 2025", arquivo: "Diretriz Brasileira de Atendimento à Dor Torácica na Unidade de Emergência 2025 SBC.pdf", tamanho: "4,1 MB" },
          { id: "diretriz-iamsst-2021", titulo: "Diretriz SBC — Angina Instável e IAM sem Supra 2021", arquivo: "Diretrizes da Sociedade Brasileira de Cardiologia sobre Angina instável e Infarto do miocárdio sem supradesnível do segmento ST - 2021.pdf", tamanho: "2,2 MB" },
        ],
      },
      {
        id: 9,
        titulo: "Cefaleia: o que não pode passar despercebido.",
        duracao: "25:59",
        descricao: "A cefaleia está entre as queixas mais frequentes do plantão médico, variando desde causas benignas até condições potencialmente graves que exigem reconhecimento imediato.\n\nAprenda uma abordagem sistematizada para avaliar pacientes com cefaleia de forma rápida, segura e baseada em evidências.\n\nNesta aula, você verá o passo a passo para diferenciar cefaleias primárias e secundárias, reconhecer sinais de alerta, identificar situações que exigem investigação imediata e conduzir seus pacientes com mais segurança, sem travar diante da queixa.\n\nEsta aula, assim como todas as demais do curso, conta com materiais de apoio exclusivos:\n\n✅ Material teórico atualizado e baseado em evidências.\n\n✅ Guia de prescrição com orientações práticas para os principais cenários clínicos.\n\n✅ Guia de evolução com modelos prontos para tornar seus atendimentos mais rápidos e eficientes.",
        pasta: "aulacefaleia",
        materiais: [
          { id: "material-teorico", titulo: "Material de Apoio - Cefaleia", arquivo: "Material de Apoio Cefaleia.pdf", tamanho: "613 KB" },
          { id: "guia-evolucao", titulo: "Modelo de Evolução - Cefaleia", arquivo: "Modelo de Evolução - Cefaleia.pdf", tamanho: "1,1 MB" },
          { id: "guia-prescricao", titulo: "Modelo de Prescrição - Cefaleia", arquivo: "Modelo de Prescrição - Cefaleia.pdf", tamanho: "1,7 MB" },
        ],
      },
      {
        id: 10,
        titulo: "Crise de asma: reconhecimento rápido e condutas que mudam desfechos.",
        duracao: "30:41",
        descricao: "A crise de asma é uma causa frequente de atendimento em UPA e Pronto-Socorro, podendo variar desde quadros leves até situações potencialmente graves que exigem reconhecimento e intervenção imediata.\n\nAprenda uma abordagem sistematizada para avaliar pacientes com crise asmática de forma rápida, segura e baseada em evidências.\n\nNesta aula, você verá o passo a passo para classificar a gravidade, reconhecer sinais de alerta, iniciar o tratamento adequado e tomar decisões com mais segurança, sem travar diante da queixa.\n\nEsta aula, assim como todas as demais do curso, conta com materiais de apoio exclusivos:\n\n✅ Material teórico atualizado e baseado em evidências.\n\n✅ Guia de prescrição com orientações práticas para os principais cenários clínicos.\n\n✅ Guia de evolução com modelos prontos para tornar seus atendimentos mais rápidos e eficientes.",
        pasta: "aulaasma",
        materiais: [
          { id: "material-teorico", titulo: "Material de Apoio - Crise de Asma", arquivo: "Material de Apoio Crise de Asma.pdf", tamanho: "1,9 MB" },
          { id: "guia-evolucao", titulo: "Modelo de Evolução - Crise de Asma", arquivo: "Modelo de Evolução Crise de Asma.pdf", tamanho: "720 KB" },
          { id: "guia-prescricao", titulo: "Modelo de Prescrição - Crise de Asma + Bônus DPOC", arquivo: "Modelo de Prescrição Crise de Asma+Bônus DPOC exacerbado.pdf", tamanho: "3,4 MB" },
          { id: "peak-flow", titulo: "Peak Flow — CFF", arquivo: "Peak Flow CFF.pdf", tamanho: "4,0 MB" },
        ],
      },
      {
        id: 11,
        titulo: "Crises hipertensivas: decisões rápidas e condutas seguras.",
        duracao: "17:30",
        descricao: "As crises hipertensivas estão entre as situações frequentes no atendimento em UPA, Pronto-Socorro e Atenção Primária, exigindo avaliação rápida, identificação de sinais de gravidade e tomada de decisão segura.\n\nAprenda uma abordagem sistematizada para reconhecer situações que exigem intervenção imediata e conduzir o paciente de forma prática e baseada em evidências.\n\nNesta aula, você verá o passo a passo para avaliar o paciente, evitar erros comuns e definir a conduta adequada sem travar diante do paciente com pressão arterial elevada no seu plantão.\n\nEsta aula, assim como todas as demais do curso, conta com materiais de apoio exclusivos:\n\n✅ Material teórico atualizado e baseado em evidências.\n\n✅ Guia de prescrição com orientações práticas para os principais cenários clínicos.\n\n✅ Guia de evolução com modelos prontos para tornar seus atendimentos mais rápidos e eficientes.",
        pasta: "aulacrisehipertensiva",
        materiais: [
          { id: "material-teorico", titulo: "Material de Apoio - Crises Hipertensivas", arquivo: "Material de Apoio Crises hipertensivas.pdf", tamanho: "1,9 MB" },
          { id: "guia-evolucao", titulo: "Modelo de Evolução - Crises Hipertensivas", arquivo: "Modelo de Evolução - Crises hipertensivas.pdf", tamanho: "623 KB" },
          { id: "guia-prescricao", titulo: "Modelo de Prescrição - Crises Hipertensivas", arquivo: "Modelo de Prescrição - Crises hipertensivas.pdf", tamanho: "525 KB" },
        ],
      },
      {
        id: 12,
        titulo: "Arboviroses: entre a queixa simples e o paciente grave.",
        duracao: "45:28",
        descricao: "As arboviroses estão entre as causas mais frequentes de atendimento em UPA, Pronto-Socorro e Atenção Primária, podendo variar desde quadros leves até situações com risco de complicações graves.\n\nAprenda uma abordagem sistematizada para avaliar pacientes com suspeita de arboviroses, identificar sinais de alerta, reconhecer critérios de gravidade e conduzir o atendimento de forma rápida, segura e baseada em evidências.\n\nNesta aula, você verá o passo a passo para diferenciar os principais cenários clínicos, evitar erros frequentes e tomar decisões com mais segurança diante do paciente com suspeita de arbovirose no plantão.\n\nEsta aula, assim como todas as demais do curso, conta com materiais de apoio exclusivos:\n\n✅ Material teórico atualizado e baseado em evidências.\n\n✅ Guia de prescrição com orientações práticas para os principais cenários clínicos.\n\n✅ Guia de evolução com modelos prontos para tornar seus atendimentos mais rápidos e eficientes.",
        pasta: "aulaarboviroses",
        materiais: [
          { id: "material-teorico", titulo: "Material de Apoio - Arboviroses", arquivo: "Material de Apoio Arboviroses.pdf", tamanho: "2,4 MB" },
          { id: "guia-evolucao", titulo: "Modelo de Evolução - Arboviroses", arquivo: "Modelo de Evolução Arboviroses.pdf", tamanho: "770 KB" },
          { id: "guia-prescricao", titulo: "Modelo de Prescrição - Arboviroses", arquivo: "Modelo de Prescrição Arboviroses.pdf", tamanho: "1,8 MB" },
          { id: "cartaz-dengue", titulo: "Cartaz — Suspeita de Dengue (Ministério da Saúde)", arquivo: "Cartaz Suspeita de Dengue - Ministério da Saúde.pdf", tamanho: "178 KB" },
        ],
      },
      {
        id: 13,
        titulo: "Bônus: Abordagem de Queimaduras.",
        duracao: "",
        semVideo: true,
        thumbLocal: "aulasbonus/Abordagem de queimaduras.png",
        pasta: "aulasbonus",
        materiais: [
          { id: "bonus-queimaduras", titulo: "Bônus — Abordagem de Queimaduras", arquivo: "Bônus Abordagem de queimaduras.pdf", tamanho: "2,1 MB" },
        ],
      },
      {
        id: 14,
        titulo: "Bônus: Infecções de Pele e Partes Moles.",
        duracao: "",
        semVideo: true,
        thumbLocal: "aulasbonus/Infecção de pele e partes moles.png",
        pasta: "aulasbonus",
        materiais: [
          { id: "bonus-ippm", titulo: "Bônus — Infecções de Pele e Partes Moles", arquivo: "Bônus Infecções de pele e partes moles.pdf", tamanho: "5,2 MB" },
        ],
      },
      {
        id: 15,
        titulo: "Bônus: Infecções Sexualmente Transmissíveis e Profilaxias.",
        duracao: "",
        semVideo: true,
        thumbLocal: "aulasbonus/ISTs e profilaxias.png",
        pasta: "aulasbonus",
        materiais: [
          { id: "bonus-ists", titulo: "Bônus — ISTs e Profilaxias", arquivo: "Bônus Infecções sexualmente transmissíveis e profilaxias.pdf", tamanho: "1,3 MB" },
        ],
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
