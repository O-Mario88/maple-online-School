import type { Assessment, Grade, Submission } from './types';
import { answerProblem, scoreProblem, studentWork, submittedAnswer, toMark } from './work';

const assignment = (id: number, title: string): Assessment =>
  ({
    id,
    title,
    instructions: 'Do it',
    type: 'assignment',
    source: 'manual_school_test',
    max_score: '20.00',
    is_published: true,
    created_at: `2026-10-${10 + id}T08:00:00Z`,
    created_by: 1,
    questions: [],
  }) as Assessment;

const submission = (id: number, assessment: number, status: 'submitted' | 'graded' = 'submitted'): Submission =>
  ({
    id,
    assessment,
    student: 9,
    status,
    submitted_at: '2026-10-20T08:00:00Z',
    answers_data: {},
    total_score: null,
    assessment_title: `Assignment ${assessment}`,
    student_name: 'Amina',
  }) as Submission;

const grade = (id: number, sub: number, score: string, feedback: string | null = null): Grade =>
  ({ id, submission: sub, score, teacher_feedback: feedback, graded_at: '2026-10-21T08:00:00Z' }) as Grade;

describe('studentWork', () => {
  it('marks each assignment as to do, submitted or graded', () => {
    const items = studentWork(
      [assignment(1, 'Essay'), assignment(2, 'Quiz'), assignment(3, 'Poem')],
      [submission(10, 2), submission(11, 3, 'graded')],
      [grade(100, 11, '18.00', 'Lovely rhythm')],
    );

    expect(items.map((i) => [i.title, i.state])).toEqual([
      ['Essay', 'todo'],
      ['Quiz', 'submitted'],
      ['Poem', 'graded'],
    ]);
    expect(items[2]).toMatchObject({ score: '18', maxScore: '20', feedback: 'Lovely rhythm' });
  });

  it('puts work still to do first', () => {
    const items = studentWork([assignment(1, 'Done'), assignment(2, 'Open')], [submission(10, 1)], []);
    expect(items[0].title).toBe('Open');
  });
});

describe('toMark', () => {
  it('lists submissions that have no grade yet, oldest first', () => {
    const subs = [
      { ...submission(10, 1), submitted_at: '2026-10-22T08:00:00Z' },
      { ...submission(11, 1), submitted_at: '2026-10-20T08:00:00Z' },
      submission(12, 2),
    ];
    const pending = toMark(subs, [grade(1, 12, '5.00')]);
    expect(pending.map((s) => s.id)).toEqual([11, 10]);
  });
});

describe('submittedAnswer', () => {
  it('reads the written answer a learner sent', () => {
    expect(submittedAnswer({ ...submission(10, 1), answers_data: { essay: 'x = 2 or x = 3' } })).toBe('x = 2 or x = 3');
  });

  it('says so when the answer has no written part', () => {
    expect(submittedAnswer({ ...submission(10, 1), answers_data: {} })).toBe('');
    expect(submittedAnswer({ ...submission(10, 1), answers_data: { essay: 42 } })).toBe('');
  });
});

describe('answerProblem', () => {
  it('accepts an answer with some words in it', () => {
    expect(answerProblem('Half of 6 is 3, so add 9.')).toBeNull();
  });

  it('asks for an answer, and for a shorter one when it is too long', () => {
    expect(answerProblem('   ')).toBe('Write your answer first.');
    expect(answerProblem('a'.repeat(20_001))).toBe('Your answer is too long. Please shorten it.');
  });
});

describe('scoreProblem', () => {
  it('accepts a mark from 0 up to the maximum, decimals included', () => {
    expect(scoreProblem('0', '10.00')).toBeNull();
    expect(scoreProblem('7.5', '10.00')).toBeNull();
    expect(scoreProblem('10', '10.00')).toBeNull();
  });

  it('asks for a number in range', () => {
    expect(scoreProblem('', '10.00')).toBe('Enter a mark.');
    expect(scoreProblem('11', '10.00')).toBe('Enter a number from 0 to 10.');
    expect(scoreProblem('-1', '10.00')).toBe('Enter a number from 0 to 10.');
    expect(scoreProblem('seven', '10.00')).toBe('Enter a number from 0 to 10.');
  });
});
