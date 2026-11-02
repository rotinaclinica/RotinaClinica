export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { canAccessPaidContent } from "@/lib/subscription";
import { getDailyQuestions, getTodayDateStr, getQuizDateUTC } from "@/lib/quiz-questions";
import { QuizClient } from "./QuizClient";
import RankingQuiz from "./RankingQuiz";
import { calcStreakAndFreezes, getQuizRankings, MAX_FREEZES, FREEZE_EARN_INTERVAL } from "@/lib/quiz-ranking";
import Link from "next/link";

export const metadata = { title: "Quiz Diário · Rotina Clínica" };

export default async function QuizPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, rankingOptOut: true },
  });
  const isAdmin = user?.role === "ADMIN";
  const isTester = user?.role === "TESTER";
  if (!isAdmin && !isTester && !(await canAccessPaidContent(session.user.id))) {
    redirect("/assinatura?motivo=acesso");
  }

  const todayStr = getTodayDateStr();
  const quizDate = getQuizDateUTC(todayStr);

  const [todayAttempt, allAttempts, totalAttempts, rankings] = await Promise.all([
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
    getQuizRankings(session.user.id),
  ]);

  const { streak, freezes } = calcStreakAndFreezes(allAttempts);
  const totalCorrect = allAttempts.reduce((s, a) => s + a.score, 0);
  const avgScore = totalAttempts > 0 ? Math.round((totalCorrect / (totalAttempts * 5)) * 100) : 0;

  const questions = getDailyQuestions(todayStr);
  const nomeMes = new Date(`${todayStr}T12:00:00`).toLocaleDateString("pt-BR", { month: "long" });
  const nomeMesCap = nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1);

  const todayResult = todayAttempt
    ? {
        score: todayAttempt.score,
        answers: JSON.parse(todayAttempt.answers) as { questionId: number; chosen: number; correct: boolean }[],
      }
    : null;

  return (
    <div className="flex-1 flex flex-col">
      <header className="bg-white dark:bg-[radial-gradient(700px_220px_at_15%_0%,rgba(61,184,212,0.16),transparent_70%),linear-gradient(180deg,#1a3050_0%,#142540_100%)] border-b border-[#d9e3ec] dark:border-white/12 px-6 sm:px-8 py-5">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-sm text-[#1a6aad] dark:text-[#3db8d4] hover:underline">
            ← Voltar
          </Link>
        </div>
        <div className="flex items-center justify-between mt-3 flex-wrap gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl dark:sm:text-3xl font-extrabold text-[#0f2d4a] dark:text-white">
              Desafio Clínico <span className="text-[#1a6aad] dark:text-[#3db8d4]">Diário</span>
            </h1>
            <p className="text-sm text-[#0f2d4a]/60 dark:text-[#bccbd8] mt-0.5">
              3 perguntas novas todo dia. Teste seu conhecimento!
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
          <a href="#ranking" className="flex items-center gap-2 bg-[#e8f4fc] dark:bg-[#3db8d4]/15 border border-[#1a6aad]/25 dark:border-[#3db8d4]/40 rounded-full px-3.5 py-1.5 hover:bg-[#d3e9f7] dark:hover:bg-[#3db8d4]/25 transition-colors">
            <span className="text-lg leading-none">🏆</span>
            <span className="text-sm font-bold text-[#1a6aad] dark:text-[#3db8d4]">Ranking</span>
          </a>
        </div>

        <p className="text-xs text-[#0f2d4a]/50 dark:text-[#bccbd8] mt-3">
          🛡️ <strong>Escudos</strong> protegem sua sequência se pular 1 dia. Ganhe 1 a cada 5 dias consecutivos (máx 3).
        </p>
      </header>

      <main className="flex-1 p-6 sm:p-8">
        <QuizClient
          questions={questions}
          dateStr={todayStr}
          existingResult={todayResult}
        />
        <RankingQuiz
          mensal={rankings.mensal}
          geral={rankings.geral}
          participa={user?.role === "CUSTOMER" && !user.rankingOptOut}
          equipe={isAdmin || isTester}
          nomeMes={nomeMesCap}
        />
      </main>
    </div>
  );
}
