"use client";

import { useState, useTransition } from "react";
import { submitQuiz } from "./actions";
import type { QuizQuestion } from "@/lib/quiz-questions";

type Props = {
  questions: QuizQuestion[];
  dateStr: string;
  existingResult: { score: number; answers: { questionId: number; chosen: number; correct: boolean }[] } | null;
};

export function QuizClient({ questions, dateStr, existingResult }: Props) {
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [answers, setAnswers] = useState<{ questionId: number; chosen: number; correct: boolean }[]>([]);
  const [finished, setFinished] = useState(!!existingResult);
  const [finalScore, setFinalScore] = useState(existingResult?.score ?? 0);
  const [savedAnswers, setSavedAnswers] = useState(existingResult?.answers ?? []);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  if (finished) {
    const displayAnswers = savedAnswers.length > 0 ? savedAnswers : answers;
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-[#131c2e] border border-zinc-200 dark:border-white/8 rounded-2xl p-6 sm:p-8 text-center mb-6">
          <div className="text-5xl mb-3">
            {finalScore === 5 ? "🏆" : finalScore >= 3 ? "💪" : "📚"}
          </div>
          <h2 className="text-2xl font-extrabold text-[#0f2d4a] dark:text-[#e8edf5] mb-2">
            {finalScore === 5
              ? "Perfeito!"
              : finalScore >= 4
                ? "Excelente!"
                : finalScore >= 3
                  ? "Muito bem!"
                  : finalScore >= 2
                    ? "Bom começo!"
                    : "Continue estudando!"}
          </h2>
          <p className="text-lg text-[#0f2d4a] dark:text-[#6a8fa5]">
            Você acertou <span className="font-bold text-[#1a6aad] dark:text-[#3db8d4]">{finalScore}</span> de 5 perguntas
          </p>
          <p className="text-sm text-[#0f2d4a]/50 dark:text-[#6a8fa5] mt-2">
            Volte amanhã para manter sua sequência!
          </p>
        </div>

        {/* Review */}
        <div className="space-y-4">
          {questions.map((q, i) => {
            const ans = displayAnswers.find((a) => a.questionId === q.id);
            const wasCorrect = ans?.correct ?? false;
            return (
              <div
                key={q.id}
                className={`bg-white dark:bg-[#131c2e] border rounded-xl p-5 ${
                  wasCorrect
                    ? "border-emerald-300 dark:border-emerald-700/50"
                    : "border-red-300 dark:border-red-700/50"
                }`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    wasCorrect
                      ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                      : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                  }`}>
                    {wasCorrect ? "✓" : "✗"}
                  </span>
                  <p className="font-semibold text-sm text-[#0f2d4a] dark:text-[#e8edf5]">{q.question}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 ml-9 mb-3">
                  {q.options.map((opt, oi) => {
                    const isCorrectOpt = oi === q.correctIndex;
                    const wasChosen = ans?.chosen === oi;
                    return (
                      <div
                        key={oi}
                        className={`text-xs px-3 py-2 rounded-lg border ${
                          isCorrectOpt
                            ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700/50 text-emerald-800 dark:text-emerald-300 font-semibold"
                            : wasChosen && !isCorrectOpt
                              ? "bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700/50 text-red-800 dark:text-red-300 line-through"
                              : "border-zinc-200 dark:border-white/8 text-[#0f2d4a]/60 dark:text-[#6a8fa5]"
                        }`}
                      >
                        {opt}
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-[#0f2d4a]/70 dark:text-[#6a8fa5] ml-9 leading-relaxed bg-blue-50 dark:bg-blue-900/10 rounded-lg px-3 py-2">
                  {q.explanation}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const q = questions[currentQ];

  function handleSelect(idx: number) {
    if (revealed) return;
    setSelected(idx);
  }

  function handleConfirm() {
    if (selected === null) return;
    setRevealed(true);
  }

  function handleNext() {
    const isCorrect = selected === q.correctIndex;
    const newAnswers = [...answers, { questionId: q.id, chosen: selected!, correct: isCorrect }];
    setAnswers(newAnswers);

    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
      setSelected(null);
      setRevealed(false);
    } else {
      const score = newAnswers.filter((a) => a.correct).length;
      setFinalScore(score);
      setSavedAnswers(newAnswers);
      startTransition(async () => {
        const result = await submitQuiz(dateStr, newAnswers, score);
        if (result.error) setError(result.error);
        setFinished(true);
      });
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <div className="flex items-center gap-2 mb-6">
        {questions.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i < currentQ
                ? "bg-[#3db8d4]"
                : i === currentQ
                  ? "bg-[#1a6aad]"
                  : "bg-zinc-200 dark:bg-white/10"
            }`}
          />
        ))}
      </div>

      <div className="bg-white dark:bg-[#131c2e] border border-zinc-200 dark:border-white/8 rounded-2xl p-6 sm:p-8">
        {/* Category + counter */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold bg-[#3db8d4]/15 dark:bg-[#3db8d4]/20 text-[#1a6aad] dark:text-[#3db8d4] px-2.5 py-1 rounded-xl">
            {q.category}
          </span>
          <span className="text-xs font-semibold text-[#0f2d4a]/50 dark:text-[#6a8fa5]">
            {currentQ + 1} / {questions.length}
          </span>
        </div>

        {/* Question */}
        <h2 className="text-lg font-bold text-[#0f2d4a] dark:text-[#e8edf5] mb-6 leading-snug">
          {q.question}
        </h2>

        {/* Options */}
        <div className="space-y-3 mb-6">
          {q.options.map((opt, i) => {
            const isCorrectOpt = i === q.correctIndex;
            const isSelected = selected === i;

            let cls =
              "w-full text-left px-4 py-3.5 rounded-xl border-2 text-sm font-medium transition-all ";

            if (revealed) {
              if (isCorrectOpt) {
                cls += "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300";
              } else if (isSelected && !isCorrectOpt) {
                cls += "border-red-400 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300";
              } else {
                cls += "border-zinc-200 dark:border-white/8 text-[#0f2d4a]/40 dark:text-[#6a8fa5]/40";
              }
            } else if (isSelected) {
              cls += "border-[#1a6aad] dark:border-[#3db8d4] bg-[#1a6aad]/5 dark:bg-[#3db8d4]/10 text-[#0f2d4a] dark:text-[#e8edf5]";
            } else {
              cls +=
                "border-zinc-200 dark:border-white/10 text-[#0f2d4a] dark:text-[#e8edf5] hover:border-[#3db8d4]/50 dark:hover:border-[#3db8d4]/30 hover:bg-[#3db8d4]/5 dark:hover:bg-[#3db8d4]/5";
            }

            return (
              <button key={i} onClick={() => handleSelect(i)} className={cls} disabled={revealed}>
                <span className="flex items-center gap-3">
                  <span className={`w-7 h-7 flex-shrink-0 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                    revealed && isCorrectOpt
                      ? "border-emerald-400 bg-emerald-400 text-white"
                      : revealed && isSelected && !isCorrectOpt
                        ? "border-red-400 bg-red-400 text-white"
                        : isSelected
                          ? "border-[#1a6aad] dark:border-[#3db8d4] bg-[#1a6aad] dark:bg-[#3db8d4] text-white"
                          : "border-zinc-300 dark:border-white/20 text-[#0f2d4a]/50 dark:text-[#6a8fa5]"
                  }`}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  {opt}
                </span>
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {revealed && (
          <div className={`rounded-xl px-4 py-3 mb-6 text-sm leading-relaxed ${
            selected === q.correctIndex
              ? "bg-emerald-50 dark:bg-emerald-900/10 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/30"
              : "bg-red-50 dark:bg-red-900/10 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800/30"
          }`}>
            <p className="font-bold mb-1">
              {selected === q.correctIndex ? "Correto!" : "Incorreto"}
            </p>
            <p>{q.explanation}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/40 rounded-lg px-4 py-3 text-sm text-red-700 dark:text-red-400 mb-4">
            {error}
          </div>
        )}

        {/* Button */}
        {!revealed ? (
          <button
            onClick={handleConfirm}
            disabled={selected === null}
            className="w-full py-3.5 rounded-xl font-bold text-sm bg-[#1a6aad] text-white hover:bg-[#0f2d4a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Confirmar resposta
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={isPending}
            className="w-full py-3.5 rounded-xl font-bold text-sm bg-[#3db8d4] text-[#0f2d4a] hover:bg-[#2fa8c4] transition-colors disabled:opacity-60"
          >
            {isPending ? "Salvando..." : currentQ < questions.length - 1 ? "Próxima pergunta →" : "Ver resultado"}
          </button>
        )}
      </div>
    </div>
  );
}
