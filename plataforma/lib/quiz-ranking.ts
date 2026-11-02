import { db } from "@/lib/db";
import { getTodayDateStr, getQuizDateUTC } from "@/lib/quiz-questions";

export const MAX_FREEZES = 3;
export const FREEZE_EARN_INTERVAL = 5;
const TOP = 5;

function prevDay(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function calcStreakAndFreezes(attempts: { quizDate: Date }[]): { streak: number; freezes: number } {
  if (attempts.length === 0) return { streak: 0, freezes: 0 };

  const dateSet = new Set(
    attempts.map((a) => {
      const d = new Date(a.quizDate);
      return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
    })
  );
  const sortedDates = [...dateSet].sort().reverse();

  const today = getTodayDateStr();
  const yesterday = prevDay(today);

  if (sortedDates[0] !== today && sortedDates[0] !== yesterday) return { streak: 0, freezes: 0 };

  let streak = 0;
  let freezesEarned = 0;
  let freezesUsed = 0;
  let cursor = sortedDates[0] === today ? today : yesterday;

  while (true) {
    if (dateSet.has(cursor)) {
      streak++;
      if (streak > 0 && streak % FREEZE_EARN_INTERVAL === 0) {
        freezesEarned = Math.min(freezesEarned + 1, MAX_FREEZES + freezesUsed);
      }
      cursor = prevDay(cursor);
    } else {
      if (freezesEarned > freezesUsed) {
        freezesUsed++;
        streak++;
        cursor = prevDay(cursor);
      } else {
        break;
      }
    }
  }

  const freezesAvailable = Math.max(0, freezesEarned - freezesUsed);
  return { streak, freezes: freezesAvailable };
}

const PARTICULAS = new Set(["de", "da", "do", "das", "dos", "e", "di", "du"]);

/** "Lucas Rodrigues da Silva" → "Lucas R. S." (primeiro nome + iniciais dos sobrenomes) */
export function nomeRanking(nome: string | null): string {
  const partes = (nome ?? "").trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return "Assinante";
  const primeiro = partes[0].charAt(0).toUpperCase() + partes[0].slice(1).toLowerCase();
  const iniciais = partes
    .slice(1)
    .filter((p) => !PARTICULAS.has(p.toLowerCase()))
    .map((p) => `${p.charAt(0).toUpperCase()}.`);
  return [primeiro, ...iniciais].join(" ");
}

export type LinhaRanking = { posicao: number; nome: string; acertos: number; ofensiva: number; souEu: boolean };
export type Ranking = { top: LinhaRanking[]; eu: LinhaRanking | null };

/**
 * Rankings do Desafio Diário (mês corrente e todos os tempos): acertos somados,
 * desempate pela ofensiva atual. Fora do ranking: admins, contas de teste,
 * contas anonimizadas e quem desativou no perfil.
 */
export async function getQuizRankings(userId: string): Promise<{ mensal: Ranking; geral: Ranking }> {
  const todayStr = getTodayDateStr();
  const inicioMes = getQuizDateUTC(`${todayStr.slice(0, 7)}-01`);
  const janelaOfensiva = getQuizDateUTC(todayStr);
  janelaOfensiva.setUTCDate(janelaOfensiva.getUTCDate() - 120);

  const elegiveis = { role: "CUSTOMER" as const, rankingOptOut: false, anonymizedAt: null };

  const [usuarios, geral, mensal, recentes] = await Promise.all([
    db.user.findMany({ where: { ...elegiveis, quizAttempts: { some: {} } }, select: { id: true, name: true } }),
    db.quizAttempt.groupBy({ by: ["userId"], where: { user: elegiveis }, _sum: { score: true } }),
    db.quizAttempt.groupBy({ by: ["userId"], where: { user: elegiveis, quizDate: { gte: inicioMes } }, _sum: { score: true } }),
    db.quizAttempt.findMany({ where: { user: elegiveis, quizDate: { gte: janelaOfensiva } }, select: { userId: true, quizDate: true } }),
  ]);

  const nomes = new Map(usuarios.map((u) => [u.id, u.name]));
  const datasPorUsuario = new Map<string, { quizDate: Date }[]>();
  for (const r of recentes) {
    const lista = datasPorUsuario.get(r.userId) ?? [];
    lista.push({ quizDate: r.quizDate });
    datasPorUsuario.set(r.userId, lista);
  }
  const ofensivas = new Map<string, number>();
  const ofensiva = (id: string) => {
    if (!ofensivas.has(id)) ofensivas.set(id, calcStreakAndFreezes(datasPorUsuario.get(id) ?? []).streak);
    return ofensivas.get(id)!;
  };

  function montar(linhas: { userId: string; _sum: { score: number | null } }[]): Ranking {
    const ordenado = linhas
      .filter((l) => nomes.has(l.userId) && (l._sum.score ?? 0) > 0)
      .map((l) => ({ userId: l.userId, acertos: l._sum.score ?? 0, ofensiva: ofensiva(l.userId) }))
      .sort((a, b) => b.acertos - a.acertos || b.ofensiva - a.ofensiva);
    const linhasRanking = ordenado.map((l, i) => ({
      posicao: i + 1,
      nome: nomeRanking(nomes.get(l.userId) ?? null),
      acertos: l.acertos,
      ofensiva: l.ofensiva,
      souEu: l.userId === userId,
    }));
    return { top: linhasRanking.slice(0, TOP), eu: linhasRanking.find((l) => l.souEu) ?? null };
  }

  return { mensal: montar(mensal), geral: montar(geral) };
}
