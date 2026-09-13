"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getQuizDateUTC } from "@/lib/quiz-questions";
import { revalidatePath } from "next/cache";

export async function submitQuiz(
  dateStr: string,
  answers: { questionId: number; chosen: number; correct: boolean }[],
  score: number
) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Não autenticado" };

  const quizDate = getQuizDateUTC(dateStr);

  const existing = await db.quizAttempt.findUnique({
    where: { userId_quizDate: { userId: session.user.id, quizDate } },
  });
  if (existing) return { error: "Você já respondeu o quiz de hoje." };

  await db.quizAttempt.create({
    data: {
      userId: session.user.id,
      quizDate,
      score,
      answers: JSON.stringify(answers),
    },
  });

  revalidatePath("/dashboard/quiz");
  return { success: true };
}
