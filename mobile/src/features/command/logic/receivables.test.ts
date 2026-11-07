import { agingBucket, agingSummary, balance, type Commitment, commitmentStatus, nextAction, promise, type Receivable, recordCollection } from './receivables';

const TODAY = '2026-10-31';
const rec = (over: Partial<Receivable> = {}): Receivable => ({ id: 'CON-2026-0143', institution: 'Hope Valley Schools', contractValue: 420_000_000, invoiced: 140_000_000, paid: 44_000_000, oldestDue: '2026-07-15', ...over });

describe('aging', () => {
  test('buckets by days past the oldest unpaid due date', () => {
    expect(agingBucket(rec({ oldestDue: '2026-10-20' }), TODAY)).toBe('Current');
    expect(agingBucket(rec({ oldestDue: '2026-09-20' }), TODAY)).toBe('31 – 60 Days');
    expect(agingBucket(rec({ oldestDue: '2026-08-20' }), TODAY)).toBe('61 – 90 Days');
    expect(agingBucket(rec(), TODAY)).toBe('> 90 Days');
    expect(agingBucket(rec({ paid: 140_000_000 }), TODAY)).toBe('Current');
  });

  test('summary of balances by bucket with shares', () => {
    const s = agingSummary([rec(), rec({ id: 'b', invoiced: 100, paid: 0, oldestDue: '2026-10-25' })], TODAY);
    expect(s.total).toBe(96_000_100);
    expect(s.buckets.find((b) => b.bucket === '> 90 Days')?.amount).toBe(96_000_000);
    expect(s.buckets.find((b) => b.bucket === 'Current')?.amount).toBe(100);
  });
});

describe('collections', () => {
  test('the next action follows the age and any promise', () => {
    expect(nextAction('Current', undefined)).toBe('—');
    expect(nextAction('31 – 60 Days', undefined)).toBe('Send Reminder');
    expect(nextAction('31 – 60 Days', 'On Track')).toBe('Agree Payment');
    expect(nextAction('61 – 90 Days', 'On Track')).toBe('Send Reminder');
    expect(nextAction('> 90 Days', 'On Track')).toBe('Follow Up');
    expect(nextAction('> 90 Days', 'At Risk')).toBe('Collection Plan');
  });

  test('a collection reduces the balance and cannot exceed it', () => {
    expect(balance(rec())).toBe(96_000_000);
    expect(recordCollection(rec(), 0).error).toMatch(/above zero/i);
    expect(recordCollection(rec(), 100_000_000).error).toMatch(/balance/i);
    expect(balance(recordCollection(rec(), 40_000_000).receivable)).toBe(56_000_000);
  });

  test('promises must be in the future and within the balance; their status follows the date', () => {
    expect(promise(rec(), 10_000_000, '2026-10-20', TODAY).error).toMatch(/future/i);
    expect(promise(rec(), 200_000_000, '2026-11-10', TODAY).error).toMatch(/balance/i);
    const c = promise(rec(), 50_000_000, '2026-11-10', TODAY).commitment as Commitment;
    expect(c).toMatchObject({ amount: 50_000_000, due: '2026-11-10' });
    expect(commitmentStatus(c, TODAY)).toBe('On Track');
    expect(commitmentStatus({ ...c, brokenBefore: true }, TODAY)).toBe('At Risk');
    expect(commitmentStatus({ ...c, due: '2026-10-20' }, TODAY)).toBe('Overdue');
    expect(commitmentStatus({ ...c, kept: true }, TODAY)).toBe('Kept');
  });
});
