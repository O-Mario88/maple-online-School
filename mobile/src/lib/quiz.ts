/** Scores a multiple-choice quiz; an unanswered question counts as wrong. */
export function scoreQuiz(questions: readonly { answer: number }[], picks: readonly (number | null)[]): { correct: number; total: number } {
  const correct = questions.filter((q, i) => picks[i] === q.answer).length;
  return { correct, total: questions.length };
}
