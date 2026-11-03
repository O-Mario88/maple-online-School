import { canUseFeed, ingest, maskSecret, MAX_ATTEMPTS, nextRetry, resolveException, rotationDue, webhookHealth } from './integrations';

describe('imports are idempotent', () => {
  test('a transaction seen before is skipped, never posted twice', () => {
    const seen = new Set(['mtn:MM-784532']);
    const r = ingest(
      [
        { provider: 'mtn', ref: 'MM-784532', amount: 50_000 },
        { provider: 'mtn', ref: 'MM-784533', amount: 75_000 },
        { provider: 'mtn', ref: 'MM-784533', amount: 75_000 },
        { provider: 'airtel', ref: 'MM-784532', amount: 20_000 },
      ],
      seen,
    );
    expect(r.accepted.map((t) => `${t.provider}:${t.ref}`)).toEqual(['mtn:MM-784533', 'airtel:MM-784532']);
    expect(r.duplicates).toBe(2);
    expect([...r.seen]).toContain('mtn:MM-784533');
    expect(seen.has('mtn:MM-784533')).toBe(false);
  });
});

describe('retry queue', () => {
  test('backs off exponentially and moves to exceptions after the last attempt', () => {
    expect(nextRetry(1)).toEqual({ status: 'Retrying', waitMinutes: 1 });
    expect(nextRetry(3)).toEqual({ status: 'Retrying', waitMinutes: 4 });
    expect(nextRetry(MAX_ATTEMPTS)).toEqual({ status: 'Exception', waitMinutes: 0 });
  });
});

describe('credentials and audit', () => {
  test('secrets are never shown in full; keys older than 90 days are due for rotation', () => {
    expect(maskSecret('sk_demo_51HxQpL2eZvKYlo2C1234')).toBe('sk_demo_••••••••1234');
    expect(maskSecret('abc')).toBe('••••');
    expect(rotationDue('2026-07-01', '2026-10-31')).toBe(true);
    expect(rotationDue('2026-09-01', '2026-10-31')).toBe(false);
  });

  test('resolving an exception needs a note and is logged', () => {
    const ex = { id: 'EX-1', status: 'Open' as const, log: [] as readonly string[] };
    expect(resolveException(ex, 'resolve', '', 'Denis Okello', '10:00').error).toMatch(/note/i);
    const r = resolveException(ex, 'resolve', 'Matched to INV-4410', 'Denis Okello', '10:00').exception;
    expect(r).toMatchObject({ status: 'Resolved', log: ['10:00 Denis Okello resolved: Matched to INV-4410'] });
    expect(resolveException(ex, 'review', '', 'Denis Okello', '10:01').exception?.status).toBe('In Progress');
    expect(resolveException(ex, 'retry', '', 'Denis Okello', '10:02').exception?.status).toBe('Retrying');
  });
});

describe('hybrid accounting (Option C)', () => {
  test('schools upload statements; only Maple corporate uses live feeds', () => {
    expect(canUseFeed('corporate')).toBe(true);
    expect(canUseFeed('school')).toBe(false);
  });

  test('webhook health', () => {
    expect(webhookHealth([{ healthy: true, ms: 200, success: 0.999 }, { healthy: false, ms: 400, success: 0.98 }])).toEqual({ healthy: 1, total: 2, avgMs: 300, successRate: 98.95 });
  });
});
