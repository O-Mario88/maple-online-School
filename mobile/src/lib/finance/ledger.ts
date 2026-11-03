import { localToday } from '@/lib/school/attendance';

import type { Invoice } from './fees';

export interface StudentBalance {
  student: number;
  name: string;
  billed: number;
  paid: number;
  balance: number;
  invoices: Invoice[];
}

/** Each learner's billed, paid and outstanding totals (voided invoices left out), most owed first. */
export function studentBalances(invoices: readonly Invoice[]): StudentBalance[] {
  const rows = new Map<number, StudentBalance>();
  for (const inv of invoices) {
    if (inv.status === 'void') continue;
    const r = rows.get(inv.student) ?? { student: inv.student, name: inv.student_name, billed: 0, paid: 0, balance: 0, invoices: [] };
    rows.set(inv.student, {
      ...r,
      billed: r.billed + inv.total_minor,
      paid: r.paid + inv.paid_minor,
      balance: r.balance + inv.balance_minor,
      invoices: [...r.invoices, inv],
    });
  }
  return [...rows.values()].sort((a, b) => b.balance - a.balance || a.name.localeCompare(b.name));
}

/** "st-mary-s-kitende-journal-2026-11-03.csv": the school's name made safe for a file name. */
export function exportFileName(school: string, day = new Date()): string {
  const slug = school
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${slug || 'school'}-journal-${localToday(day)}.csv`;
}
