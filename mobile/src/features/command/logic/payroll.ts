/**
 * Rules behind Maple Command › Finance › Corporate Payroll: Uganda PAYE and NSSF (withholding
 * tax for contract staff), payslips, the balanced payroll journal, variance checks against last
 * month, salary history and dual authorisation of each run.
 */

export type Employment = 'Permanent' | 'Contract';

export interface SalaryChange {
  effective: string;
  gross: number;
  reason: string;
}

export interface Staff {
  id: string;
  name: string;
  department: string;
  employment: Employment;
  /** Payroll country; Maple's corporate staff are on Ugandan payroll. */
  country: 'UG';
  gross: number;
  history: readonly SalaryChange[];
}

export interface Payslip {
  gross: number;
  paye: number;
  nssfEmployee: number;
  wht: number;
  deductions: number;
  net: number;
  nssfEmployer: number;
  benefits: number;
  cost: number;
}

/** Uganda monthly rules (residents). */
export const UG = { nssfEmployee: 0.05, nssfEmployer: 0.1, wht: 0.06, benefits: 0.08, surchargeFrom: 10_000_000, surcharge: 0.1 } as const;
const BANDS = [
  { from: 410_000, base: 25_000, rate: 0.3 },
  { from: 335_000, base: 10_000, rate: 0.2 },
  { from: 235_000, base: 0, rate: 0.1 },
] as const;
const VARIANCE_LIMIT = 10;
const RISE_NEEDS_APPROVAL = 20;

export function payeUganda(gross: number): number {
  const band = BANDS.find((b) => gross > b.from);
  if (!band) return 0;
  const tax = band.base + (gross - band.from) * band.rate;
  const extra = gross > UG.surchargeFrom ? (gross - UG.surchargeFrom) * UG.surcharge : 0;
  return Math.round(tax + extra);
}

export function payslip(s: Staff): Payslip {
  const g = s.gross;
  const permanent = s.employment === 'Permanent';
  const paye = permanent ? payeUganda(g) : 0;
  const nssfEmployee = permanent ? Math.round(g * UG.nssfEmployee) : 0;
  const wht = permanent ? 0 : Math.round(g * UG.wht);
  const deductions = paye + nssfEmployee + wht;
  const nssfEmployer = permanent ? Math.round(g * UG.nssfEmployer) : 0;
  const benefits = permanent ? Math.round(g * UG.benefits) : 0;
  return { gross: g, paye, nssfEmployee, wht, deductions, net: g - deductions, nssfEmployer, benefits, cost: g + nssfEmployer + benefits };
}

export function runTotals(list: readonly Staff[]): Payslip & { staff: number } {
  const zero: Payslip = { gross: 0, paye: 0, nssfEmployee: 0, wht: 0, deductions: 0, net: 0, nssfEmployer: 0, benefits: 0, cost: 0 };
  const sum = list.map(payslip).reduce((a, p) => {
    const keys = Object.keys(zero) as (keyof Payslip)[];
    return Object.fromEntries(keys.map((k) => [k, a[k] + p[k]])) as unknown as Payslip;
  }, zero);
  return { ...sum, staff: list.length };
}

/** Statutory amounts due to URA and NSSF for the run. */
export const statutory = (t: Payslip) => ({ paye: t.paye, nssf: t.nssfEmployee + t.nssfEmployer, wht: t.wht, total: t.paye + t.nssfEmployee + t.nssfEmployer + t.wht });

export function payrollJournal(t: Payslip): readonly { account: string; debit: number; credit: number }[] {
  return [
    { account: '6000 Gross Salaries', debit: t.gross, credit: 0 },
    { account: '6010 Employer NSSF', debit: t.nssfEmployer, credit: 0 },
    { account: '6020 Staff Benefits', debit: t.benefits, credit: 0 },
    { account: '2200 PAYE Payable (URA)', debit: 0, credit: t.paye },
    { account: '2210 NSSF Payable', debit: 0, credit: t.nssfEmployee + t.nssfEmployer },
    { account: '2220 WHT Payable (URA)', debit: 0, credit: t.wht },
    { account: '2230 Benefits Payable', debit: 0, credit: t.benefits },
    { account: '2250 Net Salaries Payable', debit: 0, credit: t.net },
  ];
}

/** Staff whose pay moved more than 10% on last month, and anyone new on the payroll. */
export function variance(list: readonly Staff[], previous: Readonly<Record<string, number>>): readonly { id: string; change: number; reason: string }[] {
  return list.flatMap((s) => {
    const before = previous[s.id];
    if (before === undefined) return [{ id: s.id, change: 100, reason: 'New on this payroll' }];
    const change = Math.round(((s.gross - before) / before) * 1000) / 10;
    return Math.abs(change) > VARIANCE_LIMIT ? [{ id: s.id, change, reason: `Pay ${change > 0 ? 'up' : 'down'} ${Math.abs(change).toFixed(1)}% on last month` }] : [];
  });
}

export function changeSalary<T extends Staff>(s: T, gross: number, effective: string, reason: string, approvedBy?: string): { staff?: T; error?: string } {
  if (!reason.trim()) return { error: 'Give the reason for the salary change.' };
  if (!(gross > 0)) return { error: 'Enter the new gross salary.' };
  const rise = ((gross - s.gross) / s.gross) * 100;
  if (rise > RISE_NEEDS_APPROVAL && !approvedBy) return { error: `A rise above ${RISE_NEEDS_APPROVAL}% needs the Finance Director's approval.` };
  return { staff: { ...s, gross, history: [...s.history, { effective, gross, reason: reason.trim() }] } };
}

export interface Run {
  period: string;
  preparedBy: string;
  approvals: readonly string[];
  status: 'Draft' | 'Pending' | 'Approved' | 'Paid';
}

export function approveRun(r: Run, by: string): { run?: Run; error?: string } {
  if (r.status === 'Approved' || r.status === 'Paid') return { error: `${r.period} payroll is already ${r.status.toLowerCase()}.` };
  if (by === r.preparedBy) return { error: 'The person who prepared the payroll cannot approve it.' };
  if (r.approvals.includes(by)) return { error: 'You have approved this run; a second, different approver is needed.' };
  const approvals = [...r.approvals, by];
  return { run: { ...r, approvals, status: approvals.length >= 2 ? 'Approved' : 'Pending' } };
}
