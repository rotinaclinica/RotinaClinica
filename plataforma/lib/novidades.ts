// Novidades exibidas no dashboard e selo "Novo" nas seções.
// Ao adicionar conteúdo na plataforma, registre aqui (uma entrada por item).
// Cada item fica em destaque por NOVIDADE_DIAS a partir de `data`; depois vira conteúdo normal.
// Itens da mesma seção no mesmo dia são agrupados num único card ("10 novas condutas").

export const NOVIDADE_DIAS = 7;

export type SecaoNovidade = "condutas" | "evolucoes" | "calculadoras" | "casos" | "cursos" | "materiais";

export interface Novidade {
  secao: SecaoNovidade;
  titulo: string;
  /** Link direto para o item. Condutas: /dashboard/prescricoes?id=ID · Vídeos de casos: /dashboard/casos?video=YOUTUBE_ID */
  href: string;
  /** Data de publicação, AAAA-MM-DD (horário de Brasília) */
  data: string;
}

export const NOVIDADES: Novidade[] = [
  { secao: "casos", titulo: "IAM com supra de ST: por que repetir o ECG", href: "/dashboard/casos?video=BfoV7wLByHI", data: "2026-10-20" },
];

export const SECOES_NOVIDADE: Record<SecaoNovidade, { label: string; singular: string; plural: string; rota: string; acao: string }> = {
  condutas: { label: "Condutas clínicas", singular: "Nova conduta", plural: "novas condutas", rota: "/dashboard/prescricoes", acao: "Abrir" },
  evolucoes: { label: "Modelos de evolução", singular: "Novo modelo de evolução", plural: "novos modelos de evolução", rota: "/dashboard/evolucoes", acao: "Abrir" },
  calculadoras: { label: "Calculadoras", singular: "Nova calculadora", plural: "novas calculadoras", rota: "/dashboard/calculadoras", acao: "Abrir" },
  casos: { label: "Casos clínicos · Vídeo", singular: "Novo vídeo", plural: "novos vídeos de casos clínicos", rota: "/dashboard/casos", acao: "Assistir" },
  cursos: { label: "Cursos e videoaulas", singular: "Nova aula", plural: "novas aulas", rota: "/dashboard/cursos", acao: "Assistir" },
  materiais: { label: "Ebooks e materiais", singular: "Novo material", plural: "novos materiais", rota: "/dashboard/materiais", acao: "Abrir" },
};

const DIA_MS = 86_400_000;

function inicioDoDia(data: string) {
  return new Date(`${data}T00:00:00-03:00`).getTime();
}

export function novidadeAtiva(n: Novidade, agora = Date.now()) {
  const inicio = inicioDoDia(n.data);
  return agora >= inicio && agora < inicio + NOVIDADE_DIAS * DIA_MS;
}

/** Selo "Novo" nas seções: true enquanto o item estiver no período de destaque. */
export function isNovo(href: string, agora = Date.now()) {
  return NOVIDADES.some((n) => n.href === href && novidadeAtiva(n, agora));
}

export interface GrupoNovidade {
  chave: string;
  secao: SecaoNovidade;
  data: string;
  itens: { titulo: string; href: string }[];
}

/** Novidades ativas agrupadas por seção + dia, mais recentes primeiro. */
export function gruposNovidades(agora = Date.now()): GrupoNovidade[] {
  const grupos = new Map<string, GrupoNovidade>();
  for (const n of NOVIDADES) {
    if (!novidadeAtiva(n, agora)) continue;
    const chave = `${n.secao}|${n.data}`;
    const g = grupos.get(chave) ?? { chave, secao: n.secao, data: n.data, itens: [] };
    g.itens.push({ titulo: n.titulo, href: n.href });
    grupos.set(chave, g);
  }
  return [...grupos.values()].sort((a, b) => b.data.localeCompare(a.data));
}
