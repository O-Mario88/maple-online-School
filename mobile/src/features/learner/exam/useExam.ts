import { useEffect, useState } from 'react';

import { type AnswerSheet, domainIdentifiers, tally } from '@/lib/exam';
import type { MockData } from '@/mock';

export type Exam = MockData['learner']['examSimulator'];
export type Question = Exam['questions'][number];

const TICK_MS = 1000;

/** The simulator's live state: the countdown, the answer sheet, flags, the open question and submission. */
export function useExam(exam: Exam) {
  const [left, setLeft] = useState(exam.secondsLeft);
  const [current, setCurrent] = useState(exam.start.current);
  const [answers, setAnswers] = useState<Readonly<Record<number, number>>>(exam.start.answers);
  const [flagged, setFlagged] = useState<readonly number[]>(exam.start.flagged);
  const [section, setSection] = useState(exam.sections[0].key);
  const [submitted, setSubmitted] = useState(false);
  const done = submitted || left <= 0;

  useEffect(() => {
    if (done) return;
    const id = setInterval(() => setLeft((s) => Math.max(0, s - 1)), TICK_MS);
    return () => clearInterval(id);
  }, [done]);

  const total = exam.questions.length;
  const q = exam.questions[current - 1];
  const sheet: AnswerSheet = { current, answers, flagged };
  return {
    left,
    done,
    q,
    total,
    sheet,
    section,
    setSection,
    marks: tally(exam.questions, answers),
    domains: domainIdentifiers(exam.questions, answers),
    go: (n: number) => setCurrent(Math.min(total, Math.max(1, n))),
    choose: (option: number) => {
      if (!done) setAnswers((a) => ({ ...a, [current]: option }));
    },
    toggleFlag: () => setFlagged((f) => (f.includes(current) ? f.filter((n) => n !== current) : [...f, current])),
    submit: () => setSubmitted(true),
  };
}

export type ExamState = ReturnType<typeof useExam>;
