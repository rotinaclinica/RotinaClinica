import Link from "next/link";
import PreventInfoModal from "./PreventInfoModal";

export const dynamic = "force-dynamic";
export const metadata = { title: "Calculadoras · Rotina Clínica" };

const HeartIcon = () => (
  <img src="/images/calculadoras/coracao.png" alt="coração" className="w-full h-full object-contain scale-[2.0]" />
);

const LungIcon = () => (
  <img src="/images/calculadoras/pulmao.png" alt="pulmão" className="w-full h-full object-contain scale-[2.0]" />
);

const TevIcon = () => (
  <img src="/images/calculadoras/trombo.png" alt="trombose" className="w-full h-full object-contain scale-[1.3]" />
);

const NeuroIcon = () => (
  <img src="/images/calculadoras/cerebro.png" alt="cérebro" className="w-full h-full object-contain scale-[1.3]" />
);

const SepsisIcon = () => (
  <img src="/images/calculadoras/sepsis.png" alt="sepse" className="w-full h-full object-contain scale-[1.4]" />
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
  <img src="/images/calculadoras/isr.png" alt="ISR" className="w-full h-full object-contain scale-[1.3]" />
);

const CentorIcon = () => (
  <img src="/images/calculadoras/faringite.png" alt="faringite" className="w-full h-full object-contain scale-[1.2]" />
);

const CALCULADORAS = [
  // — Cardiologia (ícone coração) —
  {
    slug: "prevent",
    nome: "PREVENT — AHA 2023",
    descricao: "Risco cardiovascular total em 10 anos",
    especialidade: "Cardiologia",
    iconBg: "bg-[#0a1628]",
    icon: <HeartIcon />,
    beta: true,
  },
  {
    slug: "chadsvasc",
    nome: "CHA₂DS₂-VA",
    descricao: "Risco de AVC em fibrilação atrial",
    especialidade: "Cardiologia",
    iconBg: "bg-[#0a1628]",
    icon: <HeartIcon />,
  },
  {
    slug: "hasbled",
    nome: "HAS-BLED",
    descricao: "Risco de sangramento maior em anticoagulados",
    especialidade: "Cardiologia",
    iconBg: "bg-[#0a1628]",
    icon: <HeartIcon />,
  },
  {
    slug: "heart-score",
    nome: "HEART Score",
    descricao: "Estratificação de risco em dor torácica",
    especialidade: "Emergência",
    iconBg: "bg-[#0a1628]",
    icon: <HeartIcon />,
  },
  // — Pneumologia (ícone pulmão) —
  {
    slug: "curb-65",
    nome: "CURB-65",
    descricao: "Gravidade da pneumonia adquirida na comunidade",
    especialidade: "Pneumologia",
    iconBg: "bg-[#0a1628]",
    icon: <LungIcon />,
  },
  {
    slug: "psi-port",
    nome: "PSI/PORT",
    descricao: "Pneumonia Severity Index — avaliação completa",
    especialidade: "Pneumologia",
    iconBg: "bg-[#0a1628]",
    icon: <LungIcon />,
  },
  {
    slug: "crb-65",
    nome: "CRB-65",
    descricao: "Gravidade da pneumonia — sem exame laboratorial",
    especialidade: "Pneumologia",
    iconBg: "bg-[#0a1628]",
    icon: <LungIcon />,
  },
  {
    slug: "wells-tep",
    nome: "Wells TEP",
    descricao: "Probabilidade pré-teste de tromboembolismo pulmonar",
    especialidade: "Emergência",
    iconBg: "bg-[#0a1628]",
    icon: <LungIcon />,
  },
  // — Sepse / Hemodinâmica (ícone sepse) —
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
    slug: "indice-choque",
    nome: "Índice de Choque",
    descricao: "FC ÷ PAS — triagem rápida de instabilidade hemodinâmica",
    especialidade: "Emergência",
    iconBg: "bg-[#0a1628]",
    icon: <SepsisIcon />,
  },
  // — Tromboembolismo Venoso (ícone trombo) —
  {
    slug: "wells-tvp",
    nome: "Wells TVP",
    descricao: "Probabilidade pré-teste de trombose venosa profunda",
    especialidade: "Clínica Médica",
    iconBg: "bg-[#0a1628]",
    icon: <TevIcon />,
  },
  {
    slug: "padua",
    nome: "Score de Pádua",
    descricao: "Risco de TEV em pacientes clínicos internados",
    especialidade: "Clínica Médica",
    iconBg: "bg-[#0a1628]",
    icon: <TevIcon />,
  },
  // — Neurologia (ícone cérebro) —
  {
    slug: "glasgow",
    nome: "Glasgow",
    descricao: "Avaliação do nível de consciência",
    especialidade: "Urgência/Emergência",
    iconBg: "bg-[#0a1628]",
    icon: <NeuroIcon />,
  },
  // — Emergência / Drogas (ícones ISR, dobutamina, noradrenalina) —
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
    slug: "reconstituicao",
    nome: "Reconstituição e Diluição",
    descricao: "Saiba a concentração após reconstituição e diluição de qualquer medicação",
    especialidade: "Clínica Médica/Emergência",
    iconBg: "bg-[#0a1628]",
    icon: <NoraIcon />,
  },
  // — Infectologia (ícone faringite) —
  {
    slug: "centor-mcisaac",
    nome: "Centor / McIsaac",
    descricao: "Probabilidade de faringite bacteriana por Streptococcus A",
    especialidade: "Infectologia",
    iconBg: "bg-[#0a1628]",
    icon: <CentorIcon />,
  },
  // — Nefrologia —
  {
    slug: "ckd-epi",
    nome: "CKD-EPI 2021",
    descricao: "Taxa de Filtração Glomerular estimada (TFGe)",
    especialidade: "Nefrologia",
    iconBg: "bg-[#0a1628]",
    icon: <img src="/images/calculadoras/ckd-epi.png" alt="rim" className="w-full h-full object-contain scale-[2.0]" />,
  },
  // — Clínica Geral / Nutricional —
  {
    slug: "imc",
    nome: "IMC",
    descricao: "Índice de Massa Corporal — peso, altura e categoria nutricional",
    especialidade: "Clínica Geral",
    iconBg: "bg-[#0a1628]",
    icon: <img src="/images/calculadoras/imc.png" alt="IMC" className="w-full h-full object-contain" />,
  },
  // — Gastroenterologia / Hepatologia (ícone fígado) —
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
    <div className="flex-1 flex flex-col">
      <header className="bg-white dark:bg-[#131c2e] border-b border-zinc-200 dark:border-white/8 px-6 sm:px-8 py-6">
        <Link href="/dashboard" className="inline-flex items-center gap-1 text-xs text-[#0f2d4a] dark:text-[#4a6a7e] hover:text-[#1a6aad] dark:hover:text-[#3db8d4] mb-3 transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Início
        </Link>
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#0f2d4a] dark:text-[#e8edf5] mb-1">Calculadoras Clínicas</h1>
        <p className="text-[#0f2d4a] dark:text-[#6a8fa5] text-sm">Os escores e calculadoras mais utilizados na prática clínica.</p>
        <p className="text-xs text-[#0f2d4a] dark:text-[#4a6a7e] mt-1 font-medium">{CALCULADORAS.length} calculadoras</p>
      </header>

      <main className="flex-1 p-6 sm:p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-4xl">
          {CALCULADORAS.map((calc) => {
            const cardContent = (
              <div className="group flex items-stretch h-[88px] bg-white dark:bg-[#131c2e] rounded-2xl border border-zinc-200 dark:border-white/8 hover:border-[#3db8d4]/50 dark:hover:border-[#3db8d4]/40 transition-all overflow-hidden w-full">
                {/* Thumbnail */}
                <div className={`w-[88px] shrink-0 flex items-center justify-center overflow-hidden rounded-l-2xl ${calc.iconBg}`}>
                  {calc.icon}
                </div>
                {/* Texto */}
                <div className="flex-1 min-w-0 flex items-center gap-2 px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <p className="font-bold text-sm text-[#0f2d4a] dark:text-[#e8edf5] line-clamp-1">{calc.nome}</p>
                      {"beta" in calc && calc.beta && (
                        <span className="shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 uppercase tracking-wide">Beta</span>
                      )}
                    </div>
                    <p className="text-xs text-[#0f2d4a] dark:text-[#5a7a8e] line-clamp-2 leading-snug">{calc.descricao}</p>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-300 dark:text-[#3a5a70] group-hover:text-[#3db8d4] transition-colors shrink-0">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </div>
              </div>
            );

            if (calc.slug === "prevent") {
              return <PreventInfoModal key={calc.slug}>{cardContent}</PreventInfoModal>;
            }
            return (
              <Link key={calc.slug} href={`/dashboard/calculadoras/${calc.slug}`}>
                {cardContent}
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
