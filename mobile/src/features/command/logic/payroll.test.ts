import { approveRun, changeSalary, payeUganda, payrollJournal, payslip, type Run, runTotals, type Staff, variance } from './payroll';

const staff = (over: Partial<Staff> = {}): Staff => ({ id: 'MPL-0012', name: 'Naome Auma', department: 'Product & Technology', employment: 'Permanent', country: 'UG', gross: 12_500_000, history: [{ effective: '2026-01-01', gross: 12_500_000, reason: 'Annual review' }], ...over });

describe('Uganda payroll rules', () => {
  test('monthly PAYE bands for residents, with the 10% surcharge above 10M', () => {
    expect(payeUganda(200_000)).toBe(0);
    expect(payeUganda(300_000)).toBe(6_500);
    expect(payeUganda(400_000)).toBe(23_000);
    expect(payeUganda(1_000_000)).toBe(202_000);
    expect(payeUganda(12_500_000)).toBe(3_902_000);
  });

  test('payslip for permanent staff: PAYE and 5% NSSF off gross; employer adds 10% NSSF and benefits', () => {
    expect(payslip(staff())).toEqual({ gross: 12_500_000, paye: 3_902_000, nssfEmployee: 625_000, wht: 0, deductions: 4_527_000, net: 7_973_000, nssfEmployer: 1_250_000, benefits: 1_000_000, cost: 14_750_000 });
  });

  test('contract staff have 6% withholding tax instead of PAYE and NSSF', () => {
    expect(payslip(staff({ employment: 'Contract', gross: 7_500_000 }))).toEqual({ gross: 7_500_000, paye: 0, nssfEmployee: 0, wht: 450_000, deductions: 450_000, net: 7_050_000, nssfEmployer: 0, benefits: 0, cost: 7_500_000 });
  });

  test('the payroll journal balances', () => {
    const t = runTotals([staff(), staff({ id: 'b', employment: 'Contract', gross: 7_500_000 })]);
    const lines = payrollJournal(t);
    const dr = lines.reduce((s, l) => s + l.debit, 0);
    const cr = lines.reduce((s, l) => s + l.credit, 0);
    expect(dr).toBe(cr);
    expect(dr).toBe(t.cost);
    expect(lines.find((l) => l.account.startsWith('2250'))?.credit).toBe(15_023_000);
  });
});

describe('controls', () => {
  test('variance check flags pay changes above 10% and new joiners', () => {
    const v = variance([staff(), staff({ id: 'MPL-0021', gross: 10_800_000 }), staff({ id: 'MPL-0099', gross: 5_000_000 })], { 'MPL-0012': 12_500_000, 'MPL-0021': 9_000_000 });
    expect(v).toEqual([
      { id: 'MPL-0021', change: 20, reason: 'Pay up 20.0% on last month' },
      { id: 'MPL-0099', change: 100, reason: 'New on this payroll' },
    ]);
  });

  test('salary changes need a reason; rises above 20% need an approver; history keeps every change', () => {
    expect(changeSalary(staff(), 13_000_000, '2026-11-01', ' ').error).toMatch(/reason/i);
    expect(changeSalary(staff(), 16_000_000, '2026-11-01', 'Promotion').error).toMatch(/approv/i);
    const r = changeSalary(staff(), 13_000_000, '2026-11-01', 'Annual review').staff as Staff;
    expect([r.gross, r.history.length, r.history.at(-1)?.reason]).toEqual([13_000_000, 2, 'Annual review']);
  });

  test('dual authorisation: two different approvers, never the preparer', () => {
    const run: Run = { period: 'Nov 2026', preparedBy: 'Grace Nankya', approvals: [], status: 'Draft' };
    expect(approveRun(run, 'Grace Nankya').error).toMatch(/prepared/i);
    const one = approveRun(run, 'Denis Okello').run as Run;
    expect(one.status).toBe('Pending');
    expect(approveRun(one, 'Denis Okello').error).toMatch(/second/i);
    expect(approveRun(one, 'Samuel Mugisha').run?.status).toBe('Approved');
  });
});
