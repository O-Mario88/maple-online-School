import { acv, advanceStage, type Contract, contractStatus, createContract, daysToEnd, lifecycle, renew, setDiscount, terminate } from './contracts';

const TODAY = '2026-10-31';
const con = (over: Partial<Contract> = {}): Contract => ({
  id: 'CON-2026-0143',
  institution: 'Hope Valley Schools',
  type: 'Enterprise',
  value: 1_200_000_000,
  discount: 10,
  commissionRate: 3,
  start: '2026-01-01',
  end: '2028-12-31',
  billing: 'Annual',
  stage: 'Signed',
  ...over,
});

describe('contract figures', () => {
  test('annual value spreads the contract over its term', () => {
    expect(acv(con())).toBe(400_000_000);
    expect(acv(con({ start: '2026-02-01', end: '2027-01-31', value: 360_000_000 }))).toBe(360_000_000);
  });

  test('status follows the stage and the days left', () => {
    expect(daysToEnd(con({ end: '2026-11-30' }), TODAY)).toBe(30);
    expect(contractStatus(con(), TODAY)).toBe('Active');
    expect(contractStatus(con({ end: '2027-01-14' }), TODAY)).toBe('Renewal Due');
    expect(contractStatus(con({ end: '2026-11-30' }), TODAY)).toBe('Expiring');
    expect(contractStatus(con({ end: '2026-10-01' }), TODAY)).toBe('Expired');
    expect(contractStatus(con({ stage: 'Draft' }), TODAY)).toBe('Draft');
    expect(contractStatus(con({ stage: 'Terminated' }), TODAY)).toBe('Terminated');
  });

  test('lifecycle counts: Active is every contract in force; Renewal Due is those ending within 90 days', () => {
    const l = lifecycle([con(), con({ stage: 'Draft' }), con({ end: '2026-11-30' }), con({ end: '2026-01-01' })], TODAY);
    expect(l).toEqual({ Draft: 1, Negotiation: 0, Active: 2, 'Renewal Due': 1, Expired: 1 });
  });
});

describe('changing contracts', () => {
  test('a new contract is validated and starts as a draft', () => {
    expect(createContract({ institution: '', type: 'Enterprise', value: 1, discount: 0, start: '2026-11-01', years: 1, billing: 'Annual' }, 'CON-1').error).toMatch(/institution/i);
    expect(createContract({ institution: 'A', type: 'Enterprise', value: 0, discount: 0, start: '2026-11-01', years: 1, billing: 'Annual' }, 'CON-1').error).toMatch(/value/i);
    expect(createContract({ institution: 'A', type: 'Enterprise', value: 10, discount: 40, start: '2026-11-01', years: 1, billing: 'Annual' }, 'CON-1').error).toMatch(/discount/i);
    const c = createContract({ institution: 'A', type: 'Service', value: 100, discount: 5, start: '2026-11-01', years: 2, billing: 'Milestone' }, 'CON-1').contract as Contract;
    expect(c).toMatchObject({ stage: 'Draft', end: '2028-10-31', commissionRate: 4 });
  });

  test('stages move Draft → Negotiation → Signed', () => {
    expect(advanceStage(con({ stage: 'Draft' })).stage).toBe('Negotiation');
    expect(advanceStage(con({ stage: 'Negotiation' })).stage).toBe('Signed');
    expect(advanceStage(con()).stage).toBe('Signed');
  });

  test('a discount above 15% needs director approval and above 25% is refused', () => {
    expect(setDiscount(con(), 12, false).contract?.discount).toBe(12);
    expect(setDiscount(con(), 20, false).error).toMatch(/approval/i);
    expect(setDiscount(con(), 20, true).contract?.discount).toBe(20);
    expect(setDiscount(con(), 30, true).error).toMatch(/25%/);
  });

  test('renewal extends from the end date with an uplift on the annual value', () => {
    const r = renew(con({ start: '2025-10-01', end: '2026-09-30', value: 180_000_000 }), 1, 5);
    expect(r).toMatchObject({ start: '2026-10-01', end: '2027-09-30', value: 189_000_000, stage: 'Signed' });
  });

  test('termination needs a reason', () => {
    expect(terminate(con(), ' ').error).toMatch(/reason/i);
    expect(terminate(con(), 'School merged').contract?.stage).toBe('Terminated');
  });
});
