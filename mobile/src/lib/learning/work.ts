import type { Assessment, Grade, Submission } from './types';

export type WorkState = 'todo' | 'submitted' | 'graded';

export interface WorkItem {
  assessmentId: number;
  title: string;
  state: WorkState;
  maxScore: string;
  score?: string;
  feedback?: string | null;
}

const ORDER: Record<WorkState, number> = { todo: 0, submitted: 1, graded: 2 };

/** "18.00" -> "18", "17.50" -> "17.5" */
export function trimDecimal(value: string): string {
  return value.includes('.') ? value.replace(/\.?0+$/, '') : value;
}

/** A student's assignments with where each one stands, work still to do first. */
export function studentWork(assessments: Assessment[], submissions: Submission[], grades: Grade[]): WorkItem[] {
  const subByAssessment = new Map(submissions.map((s) => [s.assessment, s]));
  const gradeBySubmission = new Map(grades.map((g) => [g.submission, g]));

  const items = assessments.map((a): WorkItem => {
    const sub = subByAssessment.get(a.id);
    const grade = sub ? gradeBySubmission.get(sub.id) : undefined;
    const base = { assessmentId: a.id, title: a.title, maxScore: trimDecimal(a.max_score) };
    if (grade) {
      return { ...base, state: 'graded', score: trimDecimal(grade.score), feedback: grade.teacher_feedback };
    }
    if (sub) {
      return { ...base, state: 'submitted' };
    }
    return { ...base, state: 'todo' };
  });

  return [...items].sort((x, y) => ORDER[x.state] - ORDER[y.state]);
}

/** Submissions a teacher still has to mark, oldest first. */
export function toMark(submissions: Submission[], grades: Grade[]): Submission[] {
  const graded = new Set(grades.map((g) => g.submission));
  return submissions
    .filter((s) => !graded.has(s.id))
    .sort((a, b) => (a.submitted_at ?? '').localeCompare(b.submitted_at ?? ''));
}

/** The longest written answer the API accepts. */
export const MAX_ANSWER = 20_000;

/** The written answer a learner sent, or '' when the submission has none. */
export function submittedAnswer(submission: Submission): string {
  const essay = (submission.answers_data as { essay?: unknown }).essay;
  return typeof essay === 'string' ? essay : '';
}

/** Why an answer can't be sent yet, or null when it can. */
export function answerProblem(answer: string): string | null {
  if (answer.trim() === '') return 'Write your answer first.';
  if (answer.length > MAX_ANSWER) return 'Your answer is too long. Please shorten it.';
  return null;
}
