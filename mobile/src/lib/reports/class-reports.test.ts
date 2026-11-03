import { classReportRows, reportCounts } from './class-reports';
import type { Report } from './queries';

const student = (id: number, name: string) => ({ enrollment: id * 10, student: id, student_name: name, enrolled_at: '2026-09-01T08:00:00Z' });

const report = (id: number, studentId: number, published: boolean): Report => ({
  id,
  institution: 1,
  student: studentId,
  student_name: `Student ${studentId}`,
  term: 3,
  term_name: 'Term 3',
  overall_score: '71.5',
  overall_grade_letter: 'B',
  promotion_status: null,
  class_teacher_remarks: null,
  headteacher_remarks: null,
  is_published: published,
  published_at: null,
  generated_at: '2026-11-01T08:00:00Z',
});

describe('classReportRows', () => {
  it('pairs each learner in the class with their report card, by name', () => {
    const rows = classReportRows([student(2, 'Zawadi'), student(1, 'Amani')], [report(9, 2, true), report(8, 5, false)]);
    expect(rows.map((r) => [r.name, r.report?.id ?? null])).toEqual([
      ['Amani', null],
      ['Zawadi', 9],
    ]);
  });
});

describe('reportCounts', () => {
  it('counts learners with no report, a draft, or a published report', () => {
    const rows = classReportRows([student(1, 'A'), student(2, 'B'), student(3, 'C'), student(4, 'D')], [report(1, 1, false), report(2, 2, true), report(3, 3, false)]);
    expect(reportCounts(rows)).toEqual({ missing: 1, draft: 2, published: 1 });
  });
});
