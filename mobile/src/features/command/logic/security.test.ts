import {
  advanceAlert,
  buildChain,
  canExport,
  canRelease,
  closeTicket,
  type DataRequest,
  decideRequest,
  deletionPlan,
  dueState,
  escalate,
  maskEmail,
  maskIp,
  runRlsAudit,
  slaState,
  type Ticket,
  verifyChain,
} from './security';

const events = [
  { id: 'e1', at: '2026-10-26T14:31:58Z', user: 'Mary N.', action: 'User profile viewed' },
  { id: 'e2', at: '2026-10-26T14:32:05Z', user: 'Mary N.', action: 'Previous role: Teacher' },
  { id: 'e3', at: '2026-10-26T14:32:18Z', user: 'Mary N.', action: 'Role updated to School Admin' },
];

describe('audit chain', () => {
  test('each record carries the hash of the one before, so the chain verifies', () => {
    const chain = buildChain(events);
    expect(chain[1].prevHash).toBe(chain[0].hash);
    expect(verifyChain(chain)).toEqual({ ok: true });
  });

  test('editing any record breaks the chain from that record on', () => {
    const chain = buildChain(events);
    const tampered = chain.map((e) => (e.id === 'e2' ? { ...e, action: 'Previous role: Student' } : e));
    expect(verifyChain(tampered)).toEqual({ ok: false, brokenAt: 'e2' });
  });
});

describe('masking', () => {
  test('hides most of an email address and the end of an IP address', () => {
    expect(maskEmail('john.doe@greenvalley.ac.ug')).toBe('jo•••@greenvalley.ac.ug');
    expect(maskIp('197.210.12.5')).toBe('197.210.•.•');
  });
});

describe('canExport', () => {
  test('only security and global admins may export, and only with a reason', () => {
    expect(canExport('Support Admin', 'Quarterly review of admin activity').ok).toBe(false);
    expect(canExport('Global Admin', 'short').ok).toBe(false);
    expect(canExport('Global Admin', 'Quarterly review of admin activity').ok).toBe(true);
  });
});

const req = (over: Partial<DataRequest> = {}): DataRequest => ({
  id: 'DRQ-1',
  type: 'Export',
  status: 'Pending',
  minor: false,
  identityVerified: true,
  guardianVerified: false,
  scope: ['Personal Profile', 'Learning Activity'],
  ...over,
});

describe('data requests', () => {
  test('the deadline counts down and shows overdue requests', () => {
    expect(dueState('2026-11-02', '2026-10-26')).toEqual({ days: 7, overdue: false, label: '7 days remaining' });
    expect(dueState('2026-10-25', '2026-10-26')).toEqual({ days: -1, overdue: true, label: '1 day overdue' });
  });

  test("a minor's data needs a verified guardian before release", () => {
    expect(canRelease(req({ minor: true })).ok).toBe(false);
    expect(canRelease(req({ minor: true, guardianVerified: true })).ok).toBe(true);
    expect(canRelease(req({ identityVerified: false })).reason).toMatch(/identity/i);
  });

  test('deletion keeps what the law says must be kept', () => {
    const plan = deletionPlan(['Personal Profile', 'Payment History', 'Exam Results', 'Communications']);
    expect(plan.remove).toEqual(['Personal Profile', 'Communications']);
    expect(plan.retain.map((r) => r.item)).toEqual(['Payment History', 'Exam Results']);
  });

  test('approving an export completes it with a link that expires after 72 hours', () => {
    const r = decideRequest(req(), 'approve', { now: '2026-10-26T14:32:00Z' });
    expect(r.request.status).toBe('Completed');
    expect(r.request.linkExpires).toBe('2026-10-29T14:32:00.000Z');
  });

  test('approving a deletion starts processing and lists what is retained', () => {
    const r = decideRequest(req({ type: 'Deletion', scope: ['Personal Profile', 'Payment History'] }), 'approve', { now: '2026-10-26T14:32:00Z' });
    expect(r.request.status).toBe('Processing');
    expect(r.request.retained).toEqual(['Payment History']);
  });

  test('approval is refused while checks are missing, and rejecting needs a reason', () => {
    expect(decideRequest(req({ minor: true }), 'approve', { now: '2026-10-26T14:32:00Z' }).error).toMatch(/guardian/i);
    expect(decideRequest(req(), 'reject', { now: '2026-10-26T14:32:00Z' }).error).toMatch(/reason/i);
    expect(decideRequest(req(), 'reject', { now: '2026-10-26T14:32:00Z', note: 'Requester is not the account holder' }).request.status).toBe('Rejected');
  });
});

const ticket = (over: Partial<Ticket> = {}): Ticket => ({ id: 'TK-1', status: 'Open', priority: 'High', created: '2026-10-26T14:32:00Z', slaHours: 2, notes: [], ...over });

describe('support tickets', () => {
  test('SLA counts down from creation and shows when it is breached', () => {
    expect(slaState(ticket(), '2026-10-26T15:02:00Z')).toEqual({ minutesLeft: 90, breached: false, label: '1h 30m left' });
    expect(slaState(ticket(), '2026-10-26T17:52:00Z')).toEqual({ minutesLeft: -80, breached: true, label: 'Breached 1h 20m ago' });
  });

  test('escalating moves the ticket up and notes where it went', () => {
    const t = escalate(ticket(), 'Trust & Safety', 'Mary N.');
    expect(t.status).toBe('Escalated');
    expect(t.level).toBe('Trust & Safety');
    expect(t.notes[0]).toMatch(/Escalated to Trust & Safety by Mary N\./);
  });

  test('closing needs a resolution', () => {
    expect(closeTicket(ticket(), '').error).toMatch(/resolution/i);
    expect(closeTicket(ticket(), 'Cleared the stale session; learner rejoined').ticket.status).toBe('Resolved');
  });
});

describe('security dashboard', () => {
  test('an RLS audit fails any table whose policy is off or leaks across tenants', () => {
    const r = runRlsAudit([
      { table: 'students', enforced: true, crossTenantRows: 0 },
      { table: 'payments', enforced: false, crossTenantRows: 0 },
      { table: 'messages', enforced: true, crossTenantRows: 3 },
    ]);
    expect(r.map((x) => x.result)).toEqual(['Pass', 'Fail', 'Fail']);
  });

  test('cross-tenant alerts are contained before they are resolved, and resolving needs a note', () => {
    const open = { id: 'A1', status: 'Open' as const };
    const contained = advanceAlert(open).alert;
    expect(contained.status).toBe('Contained');
    expect(advanceAlert(contained).error).toMatch(/note/i);
    expect(advanceAlert(contained, 'Token revoked; tenant notified').alert.status).toBe('Resolved');
  });
});
