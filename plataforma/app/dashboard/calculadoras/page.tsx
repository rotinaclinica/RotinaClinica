import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata = { title: "Calculadoras · Rotina Clínica" };

const HeartIcon = () => (
  <img src="/images/calculadoras/coracao.png" alt="coração" className="w-full h-full object-contain" />
);

const LungIcon = () => (
  <img src="/images/calculadoras/pulmao.png" alt="pulmão" className="w-full h-full object-contain" />
);

const TevIcon = () => (
  <img src="/images/calculadoras/trombo.png" alt="trombose" className="w-full h-full object-contain" />
);

const NeuroIcon = () => (
  <img src="/images/calculadoras/cerebro.png" alt="cérebro" className="w-full h-full object-contain" />
);

const SepsisIcon = () => (
  <img src="/images/calculadoras/sepsis.png" alt="sepse" className="w-full h-full object-contain" />
);

const FigadoIcon = () => (
  <img src="/images/calculadoras/figado.png" alt="fígado" className="w-full h-full object-contain" />
);

const NoraIcon = () => (
  <img src="/images/calculadoras/noradrenalina.png" alt="noradrenalina" className="w-full h-full object-contain" />
);

const DobuIcon = () => (
  <img src="/images/calculadoras/dobutamina.png" alt="dobutamina" className="w-full h-full object-contain" />
);

const IsrIcon = () => (
  <img src="/images/calculadoras/isr.png" alt="ISR" className="w-full h-full object-contain" />
);

const CALCULADORAS = [
  {
    slug: "isr",
    nome: "Intubação em Sequência Rápida",
    descricao: "Doses de analgesia, sedação e BNM pelo peso",
    especialidade: "Emergência",
    iconBg: "bg-[#0a1628]",
    icon: <IsrIcon />,
  },
  {
    slug: "dobutamina",
    nome: "Dobutamina",
    descricao: "Dose em mcg/kg/min a partir da vazão em mL/h",
    especialidade: "Emergência",
    iconBg: "bg-[#0a1628]",
    icon: <DobuIcon />,
  },
  {
    slug: "noradrenalina",
    nome: "Noradrenalina",
    descricao: "Dose em mcg/kg/min a partir da vazão em mL/h",
    especialidade: "Emergência",
    iconBg: "bg-[#0a1628]",
    icon: <NoraIcon />,
  },
  {
    slug: "ckd-epi",
    nome: "CKD-EPI 2021",
    descricao: "Taxa de Filtração Glomerular estimada (TFGe)",
    especialidade: "Nefrologia",
    iconBg: "bg-[#0a1628]",
    icon: <img src="/images/calculadoras/ckd-epi.png" alt="rim" className="w-full h-full object-contain" />,
  },
  {
    slug: "heart-score",
    nome: "HEART Score",
    descricao: "Estratificação de risco em dor torácica",
    especialidade: "Emergência",
    iconBg: "bg-[#0a1628]",
    icon: <HeartIcon />,
  },
  {
    slug: "curb-65",
    nome: "CURB-65",
    descricao: "Gravidade da pneumonia adquirida na comunidade",
    especialidade: "Pneumologia",
    iconBg: "bg-[#1a5276]",
    icon: <LungIcon />,
  },
  {
    slug: "psi-port",
    nome: "PSI/PORT",
    descricao: "Pneumonia Severity Index — avaliação completa",
    especialidade: "Pneumologia",
    iconBg: "bg-[#1a5276]",
    icon: <LungIcon />,
  },
  {
    slug: "crb-65",
    nome: "CRB-65",
    descricao: "Gravidade da pneumonia — sem exame laboratorial",
    especialidade: "Pneumologia",
    iconBg: "bg-[#1a5276]",
    icon: <LungIcon />,
  },
  {
    slug: "padua",
    nome: "Score de Pádua",
    descricao: "Risco de TEV em pacientes clínicos internados",
    especialidade: "Clínica Médica",
    iconBg: "bg-[#0a1628]",
    icon: <TevIcon />,
  },
  {
    slug: "glasgow",
    nome: "Glasgow",
    descricao: "Avaliação do nível de consciência",
    especialidade: "Urgência/Emergência",
    iconBg: "bg-[#0a1628]",
    icon: <NeuroIcon />,
  },
  {
    slug: "wells-tep",
    nome: "Wells TEP",
    descricao: "Probabilidade pré-teste de tromboembolismo pulmonar",
    especialidade: "Emergência",
    iconBg: "bg-[#1a5276]",
    icon: <LungIcon />,
  },
  {
    slug: "qsofa",
    nome: "qSOFA",
    descricao: "Triagem rápida de sepse à beira-leito",
    especialidade: "Emergência",
    iconBg: "bg-[#0a1628]",
    icon: <SepsisIcon />,
  },
  {
    slug: "sofa",
    nome: "SOFA",
    descricao: "Avaliação sequencial de disfunção orgânica em sepse",
    especialidade: "Emergência",
    iconBg: "bg-[#0a1628]",
    icon: <SepsisIcon />,
  },
  {
    slug: "child-pugh",
    nome: "Child-Pugh",
    descricao: "Determina gravidade e sobrevida em 1 e 2 anos",
    especialidade: "Gastroenterologia",
    iconBg: "bg-[#0a1628]",
    icon: <FigadoIcon />,
  },
  {
    slug: "meld-na",
    nome: "MELD-Na",
    descricao: "Priorização em transplante hepático",
    especialidade: "Gastroenterologia",
    iconBg: "bg-[#0a1628]",
    icon: <FigadoIcon />,
  },
];

export default function CalculadorasPage() {
  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <header className="bg-white dark:bg-[#131c2e] border-b border-zinc-200 dark:border-white/8 px-6 sm:px-8 py-6">
        <Link href="/dashboard" className="inline-flex items-center gap-1 text-xs text-zinc-400 dark:text-[#4a6a7e] hover:text-[#1a6aad] dark:hover:text-[#3db8d4] mb-3 transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Início
        </Link>
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#0f2d4a] dark:text-[#e8edf5] mb-1">Calculadoras Clínicas</h1>
        <p className="text-zinc-500 dark:text-[#6a8fa5] text-sm">Os escores e calculadoras mais utilizados na prática clínica.</p>
      </header>

      <main className="flex-1 p-6 sm:p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-4xl">
          {CALCULADORAS.map((calc) => (
            <Link
              key={calc.slug}
              href={`/dashboard/calculadoras/${calc.slug}`}
              className="group flex items-stretch bg-white dark:bg-[#131c2e] rounded-2xl border border-zinc-200 dark:border-white/8 hover:border-[#3db8d4]/50 dark:hover:border-[#3db8d4]/40 transition-all overflow-hidden"
            >
              {/* Thumbnail */}
              <div className={`w-24 shrink-0 flex items-center justify-center overflow-hidden rounded-l-2xl ${calc.iconBg}`}>
                {calc.icon}
              </div>
              {/* Texto */}
              <div className="flex-1 min-w-0 flex items-center gap-3 px-4 py-4">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-[#0f2d4a] dark:text-[#e8edf5]">{calc.nome}</p>
                  <p className="text-xs text-zinc-400 dark:text-[#5a7a8e] mt-0.5">{calc.descricao}</p>
                  <span className="inline-block mt-1.5 px-2 py-0.5 rounded-md bg-[#e8f4fc] dark:bg-[#1a2d45] text-[10px] font-semibold text-[#3db8d4]">
                    {calc.especialidade}
                  </span>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-300 dark:text-[#3a5a70] group-hover:text-[#3db8d4] transition-colors shrink-0">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
