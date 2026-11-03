import type { Report } from './queries';

export interface RosterStudent {
  student: number;
  student_name: string;
}

export interface ClassReportRow {
  student: number;
  name: string;
  report: Report | null;
}

/** Each learner in the class with their report card for the term (or none yet), by name. */
export function classReportRows(students: readonly RosterStudent[], reports: readonly Report[]): ClassReportRow[] {
  const byStudent = new Map(reports.map((r) => [r.student, r]));
  return students
    .map((s) => ({ student: s.student, name: s.student_name, report: byStudent.get(s.student) ?? null }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export interface ReportCounts {
  missing: number;
  draft: number;
  published: number;
}

export function reportCounts(rows: readonly ClassReportRow[]): ReportCounts {
  return {
    missing: rows.filter((r) => r.report === null).length,
    draft: rows.filter((r) => r.report !== null && !r.report.is_published).length,
    published: rows.filter((r) => r.report?.is_published).length,
  };
}
