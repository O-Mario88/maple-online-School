import { type Application, blockers, bulkApprove, caseDecide, type CaseItem, countByStatus, decide, filterApps, overallRisk } from './trust';

const app = (over: Partial<Application> = {}): Application => ({
  id: 'APP-1',
  name: 'Sarah Namubiru',
  country: 'Uganda',
  subjects: 'Mathematics',
  checks: [
    { label: 'Identity Verified', state: 'ok' },
    { label: 'Documents Clear', state: 'ok' },
  ],
  safeguarding: 'clear',
  status: 'ready',
  history: [],
  ...over,
});

describe('blockers', () => {
  test('a clean application has nothing blocking approval', () => {
    expect(blockers(app())).toEqual([]);
  });

  test('a failed check or a safeguarding alert blocks approval', () => {
    const a = app({ checks: [{ label: 'Identity Mismatch', state: 'fail' }], safeguarding: 'alert' });
    expect(blockers(a)).toEqual(['Identity Mismatch', 'Safeguarding alert open']);
  });
});

describe('decide', () => {
  test('approving a clean application activates it and records who did it', () => {
    const r = decide(app(), { action: 'approve', by: 'Mary N.' });
    expect(r.error).toBeUndefined();
    expect(r.app.status).toBe('approved');
    expect(r.app.history[0]).toMatchObject({ action: 'approve', by: 'Mary N.' });
  });

  test('a blocked application cannot be approved without an override reason', () => {
    const blocked = app({ checks: [{ label: 'Document Issue', state: 'fail' }] });
    expect(decide(blocked, { action: 'approve', by: 'Mary N.' }).error).toMatch(/Document Issue/);
    const r = decide(blocked, { action: 'approve', by: 'Mary N.', note: 'Original certificate seen in person' });
    expect(r.app.status).toBe('approved');
    expect(r.app.history[0].note).toBe('Original certificate seen in person');
  });

  test('rejecting or blocking needs a reason', () => {
    expect(decide(app(), { action: 'reject', by: 'Mary N.' }).error).toMatch(/reason/i);
    expect(decide(app(), { action: 'block', by: 'Mary N.', note: 'Forged licence' }).app.status).toBe('blocked');
  });

  test('asking for more information and escalating move the application on', () => {
    expect(decide(app(), { action: 'requestInfo', by: 'Mary N.' }).app.status).toBe('info');
    expect(decide(app(), { action: 'escalate', by: 'Mary N.' }).app.status).toBe('escalated');
  });

  test('a decided application cannot be decided again', () => {
    const done = decide(app(), { action: 'approve', by: 'Mary N.' }).app;
    expect(decide(done, { action: 'reject', by: 'Mary N.', note: 'x' }).error).toMatch(/already/i);
  });
});

describe('bulkApprove', () => {
  test('approves the selected clean applications and skips blocked ones', () => {
    const list = [app({ id: 'A' }), app({ id: 'B', safeguarding: 'alert' }), app({ id: 'C' })];
    const r = bulkApprove(list, new Set(['A', 'B']), 'Mary N.');
    expect(r.approved).toEqual(['A']);
    expect(r.skipped).toEqual(['B']);
    expect(r.apps.find((x) => x.id === 'C')?.status).toBe('ready');
  });
});

describe('counts and filters', () => {
  const list = [app({ id: 'A' }), app({ id: 'B', status: 'review' }), app({ id: 'C', status: 'flagged', name: 'Grace Achieng' }), app({ id: 'D', status: 'info' })];

  test('pending counts treat "more info requested" as in review', () => {
    expect(countByStatus(list)).toMatchObject({ all: 4, ready: 1, review: 2, flagged: 1 });
  });

  test('filters by tab and by search text', () => {
    expect(filterApps(list, 'review', '').map((a) => a.id)).toEqual(['B', 'D']);
    expect(filterApps(list, 'all', 'grace').map((a) => a.id)).toEqual(['C']);
  });
});

describe('overallRisk', () => {
  test('any failed check is high risk, any warning medium, otherwise low', () => {
    expect(overallRisk([{ label: 'a', state: 'ok' }])).toBe('Low');
    expect(overallRisk([{ label: 'a', state: 'warn' }])).toBe('Medium');
    expect(overallRisk([{ label: 'a', state: 'warn' }, { label: 'b', state: 'fail' }])).toBe('High');
  });
});


describe('caseDecide', () => {
  const item = (over: Partial<CaseItem> = {}): CaseItem => ({ id: 'IP-1', title: 'Past papers', risk: 'High', status: 'Needs Review', ...over });

  test('removing content needs a reason and closes the case as removed', () => {
    expect(caseDecide(item(), 'remove').error).toMatch(/reason/i);
    expect(caseDecide(item(), 'remove', 'KNEC papers sold without a licence').item.status).toBe('Removed');
  });

  test('dismissing a high-risk case needs a reason, a low-risk one does not', () => {
    expect(caseDecide(item(), 'dismiss').error).toMatch(/reason/i);
    expect(caseDecide(item({ risk: 'Low' }), 'dismiss').item.status).toBe('Resolved');
  });

  test('escalating puts the case under investigation, and closed cases stay closed', () => {
    expect(caseDecide(item(), 'escalate').item.status).toBe('Under Investigation');
    const closed = caseDecide(item(), 'overturn', 'Drafts predate the source').item;
    expect(closed.status).toBe('Overturned');
    expect(caseDecide(closed, 'escalate').error).toMatch(/closed/i);
  });
});
