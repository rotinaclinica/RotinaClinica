export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { canAccessPaidContent } from "@/lib/subscription";
import { getDailyQuestions, getTodayDateStr, getQuizDateUTC } from "@/lib/quiz-questions";
import { QuizClient } from "./QuizClient";
import Link from "next/link";

export const metadata = { title: "Quiz Diário · Rotina Clínica" };

const MAX_FREEZES = 3;
const FREEZE_EARN_INTERVAL = 5;

function prevDay(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function calcStreakAndFreezes(attempts: { quizDate: Date }[]): { streak: number; freezes: number } {
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

export default async function QuizPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  const isAdmin = user?.role === "ADMIN";
  const isTester = user?.role === "TESTER";
  if (!isAdmin && !isTester && !(await canAccessPaidContent(session.user.id))) {
    redirect("/assinatura?motivo=acesso");
  }

  const todayStr = getTodayDateStr();
  const quizDate = getQuizDateUTC(todayStr);

  const [todayAttempt, allAttempts, totalAttempts] = await Promise.all([
    db.quizAttempt.findUnique({
      where: { userId_quizDate: { userId: session.user.id, quizDate } },
    }),
    db.quizAttempt.findMany({
      where: { userId: session.user.id },
      select: { quizDate: true, score: true },
      orderBy: { quizDate: "desc" },
      take: 90,
    }),
    db.quizAttempt.count({ where: { userId: session.user.id } }),
  ]);

  const { streak, freezes } = calcStreakAndFreezes(allAttempts);
  const totalCorrect = allAttempts.reduce((s, a) => s + a.score, 0);
  const avgScore = totalAttempts > 0 ? Math.round((totalCorrect / (totalAttempts * 5)) * 100) : 0;

  const questions = getDailyQuestions(todayStr);

  const todayResult = todayAttempt
    ? {
        score: todayAttempt.score,
        answers: JSON.parse(todayAttempt.answers) as { questionId: number; chosen: number; correct: boolean }[],
      }
    : null;

  return (
    <div className="flex-1 flex flex-col">
      <header className="bg-white dark:bg-[#131c2e] border-b border-zinc-200 dark:border-white/8 px-6 sm:px-8 py-5">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-sm text-[#1a6aad] dark:text-[#3db8d4] hover:underline">
            ← Dashboard
          </Link>
        </div>
        <div className="flex items-center justify-between mt-3 flex-wrap gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#0f2d4a] dark:text-[#e8edf5]">
              Desafio Clínico Diário
            </h1>
            <p className="text-sm text-[#0f2d4a]/60 dark:text-[#6a8fa5] mt-0.5">
              5 perguntas novas todo dia. Teste seu conhecimento!
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 mt-4 flex-wrap">
          <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40 rounded-full px-3.5 py-1.5">
            <span className="text-lg leading-none">🔥</span>
            <span className="text-sm font-bold text-amber-700 dark:text-amber-400">{streak} dia{streak !== 1 ? "s" : ""}</span>
          </div>
          <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/40 rounded-full px-3.5 py-1.5">
            <span className="text-lg leading-none">🎯</span>
            <span className="text-sm font-bold text-blue-700 dark:text-blue-400">{avgScore}% acerto</span>
          </div>
          <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700/40 rounded-full px-3.5 py-1.5">
            <span className="text-lg leading-none">📊</span>
            <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">{totalAttempts} quiz{totalAttempts !== 1 ? "zes" : ""}</span>
          </div>
          <div className="flex items-center gap-2 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-700/40 rounded-full px-3.5 py-1.5" title={`Bloqueio de ofensiva: protege sua sequência se pular 1 dia. Ganhe 1 a cada ${FREEZE_EARN_INTERVAL} dias consecutivos (máx ${MAX_FREEZES}).`}>
            <span className="text-lg leading-none">🛡️</span>
            <span className="text-sm font-bold text-violet-700 dark:text-violet-400">{freezes} escudo{freezes !== 1 ? "s" : ""}</span>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 sm:p-8">
        <QuizClient
          questions={questions}
          dateStr={todayStr}
          existingResult={todayResult}
        />
      </main>
    </div>
  );
}
