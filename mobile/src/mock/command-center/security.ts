/**
 * Maple Command › Security sample data: the security dashboard, enterprise audit logs, privacy
 * (data subject) requests and support escalations. People, schools and IPs are illustrative.
 */
import type { DataRequest, RlsPolicy, Ticket } from '@/features/command/logic/security';

import { face, type KpiData, type Photo, wave } from './shared';

/** "Now" for the design build, so countdowns read like the references (Oct 26, 2026, 15:12 EAT). */
export const NOW = '2026-10-26T12:12:00Z';
export const TODAY = '2026-10-26';

/* ─── Audit logs ─── */

export type Severity = 'Critical' | 'High' | 'Medium' | 'Low' | 'Info';

export interface AuditEvent {
  n: number;
  id: string;
  at: string;
  when: string;
  user: string;
  email: string;
  avatar?: Photo;
  role: string;
  tenant: string;
  type: string;
  action: string;
  resource: string;
  ip: string;
  severity: Severity;
}

const E = (n: number, when: string, user: string, email: string, avatar: Photo | undefined, role: string, tenant: string, type: string, action: string, resource: string, ip: string, severity: Severity): AuditEvent => ({
  n,
  id: `log_${n}`,
  at: `2026-10-${when.slice(4, 6).trim().padStart(2, '0')}T${when.slice(-5)}:00+03:00`,
  when,
  user,
  email,
  avatar,
  role,
  tenant,
  type,
  action,
  resource,
  ip,
  severity,
});

const firstEvents: readonly AuditEvent[] = [
  E(1, 'Oct 26, 2026 14:32', 'Mary N.', 'mary.n@maple.com', face.mary, 'Global Admin', '-', 'User Management', 'Updated user role', 'john.doe@greenvalley.ac.ug', '197.210.12.5', 'Critical'),
  E(2, 'Oct 26, 2026 13:18', 'David O.', 'david.o@maple.com', face.michael, 'Support Admin', 'Green Valley Academy', 'Authentication', 'Admin login', '-', '102.90.44.7', 'Info'),
  E(3, 'Oct 26, 2026 12:44', 'James K.', 'james.k@maple.com', face.james, 'Super Admin', 'Bright Future School', 'Data Export', 'Exported user list', 'users.csv', '41.203.56.9', 'High'),
  E(4, 'Oct 26, 2026 11:52', 'Sarah A.', 'sarah.a@brightfuture.sc.ke', face.sarah, 'Tenant Admin', 'Bright Future School', 'Curriculum', 'Deleted class', 'class_7721', '197.210.12.5', 'Medium'),
  E(5, 'Oct 26, 2026 10:21', 'Peter M.', 'peter.m@hope.ng', face.okello, 'Teacher', 'Hope International', 'Class Management', 'Created class', 'class_9912', '102.90.44.7', 'Low'),
  E(6, 'Oct 26, 2026 09:11', 'Grace N.', 'grace.n@greenvalley.ac.ug', face.grace, 'Student', 'Green Valley Academy', 'Authentication', 'Login (student)', '-', '41.203.56.9', 'Info'),
  E(7, 'Oct 26, 2026 08:56', 'System', 'system@maple.com', undefined, '-', '-', 'Security', 'Failed login attempt', '-', '196.223.14.8', 'High'),
  E(8, 'Oct 25, 2026 18:33', 'Robert K.', 'robert.k@stmarks.co.za', face.kato, 'Tenant Admin', "St. Mark's College", 'Payments', 'Approved payout', 'payout_3321', '102.90.44.7', 'Critical'),
  E(9, 'Oct 25, 2026 16:20', 'Agnes N.', 'agnes.n@cornerstone.ac.ke', face.agnes, 'Teacher', 'Cornerstone Academy', 'Content', 'Uploaded material', 'file_8810', '197.210.12.5', 'Low'),
  E(10, 'Oct 25, 2026 14:18', 'Daniel O.', 'daniel.o@brightfuture.sc.ke', face.john, 'Tenant Admin', 'Bright Future School', 'User Management', 'Invited teacher', '-', '102.90.44.7', 'Info'),
  E(11, 'Oct 25, 2026 12:05', 'System', 'system@maple.com', undefined, '-', '-', 'Data Access', 'Bulk data query', '-', '41.203.56.9', 'High'),
  E(12, 'Oct 24, 2026 20:14', 'Florence N.', 'florence.n@maple.com', face.ruth, 'Support Admin', '-', 'Support', 'Viewed support ticket', 'ticket_8821', '197.210.12.5', 'Info'),
  E(13, 'Oct 24, 2026 18:45', 'Admin Bot', 'bot@maple.com', undefined, 'System', '-', 'Security', 'Suspicious activity', '-', '196.223.14.8', 'High'),
  E(14, 'Oct 24, 2026 16:32', 'Samuel W.', 'samuel.w@greenvalley.ac.ug', face.tutorB, 'Teacher', 'Green Valley Academy', 'Student Data', 'Viewed student profile', 'student_772', '102.90.44.7', 'Medium'),
  E(15, 'Oct 24, 2026 14:10', 'Maria L.', 'maria.l@hope.ng', face.esther, 'Tenant Admin', 'Hope International', 'Settings', 'Updated school profile', 'school_228', '41.203.56.9', 'Low'),
];

const ACTORS: readonly [string, string, string, string, Photo | undefined][] = [
  ['Mary N.', 'mary.n@maple.com', 'Global Admin', '-', face.mary],
  ['David O.', 'david.o@maple.com', 'Support Admin', 'Green Valley Academy', face.michael],
  ['Sarah A.', 'sarah.a@brightfuture.sc.ke', 'Tenant Admin', 'Bright Future School', face.sarah],
  ['Peter M.', 'peter.m@hope.ng', 'Teacher', 'Hope International', face.okello],
  ['System', 'system@maple.com', '-', '-', undefined],
];
const KINDS: readonly [string, string, string, Severity][] = [
  ['Authentication', 'Login successful', '-', 'Info'],
  ['Class Management', 'Updated class', 'class_4410', 'Low'],
  ['User Management', 'Reset password', 'user_2210', 'Medium'],
  ['Data Access', 'Viewed student profile', 'student_118', 'Medium'],
  ['Payments', 'Approved refund', 'refund_771', 'High'],
  ['Security', 'Failed login attempt', '-', 'High'],
];
const IPS = ['197.210.12.5', '102.90.44.7', '41.203.56.9', '196.223.14.8'];

/** Older events, so filters and pages have a real list behind them. */
function moreEvents(): readonly AuditEvent[] {
  const out: AuditEvent[] = [];
  for (let n = 16; n <= 300; n++) {
    const [user, email, role, tenant, avatar] = ACTORS[n % ACTORS.length];
    const [type, action, resource, severity] = KINDS[(n * 5) % KINDS.length];
    const day = 24 - Math.floor((n - 16) / 30);
    const h = 23 - (n % 14);
    out.push(E(n, `Oct ${String(Math.max(1, day)).padStart(2, '0')}, 2026 ${String(h).padStart(2, '0')}:${String((n * 7) % 60).padStart(2, '0')}`, user, email, avatar, role, tenant, type, action, resource, IPS[n % IPS.length], severity));
  }
  return out;
}

export const events: readonly AuditEvent[] = [...firstEvents, ...moreEvents()];

export const auditStats: readonly KpiData[] = [
  { label: 'Total Events', value: '24,832', delta: '18%', caption: 'vs. previous month', icon: 'doc', tone: 'blue' },
  { label: 'Critical Events', value: '32', delta: '60%', caption: 'require review', icon: 'shield', tone: 'red' },
  { label: 'Admin Actions', value: '1,248', delta: '12%', caption: 'privileged actions', icon: 'people', tone: 'blue' },
  { label: 'Data Access Events', value: '8,642', delta: '22%', caption: 'across all tenants', icon: 'database', tone: 'green' },
  { label: 'Authentication Events', value: '12,310', delta: '16%', caption: 'logins, 2FA, SSO', icon: 'key', tone: 'purple' },
];

/** Extra detail for the first event (the reference's open record). */
export const eventDetail = {
  time: 'Oct 26, 2026, 14:32:18 (UTC+3)',
  ipPlace: 'Kampala, Uganda',
  change: { field: 'Role', before: 'Teacher', after: 'School Admin' },
  reference: 'log_20261026_143218_8f2a7c',
  agent: 'Chrome 118.0 (Mac OS)',
  details: 'Updated user role and permissions for John Doe. Added access to Classes, Reports and School Settings.',
  timeline: [
    { time: '14:32:18', text: 'Role updated to School Admin', by: 'Mary N. (Global Admin)' },
    { time: '14:32:10', text: 'Permissions updated (5 modules)', by: 'Mary N. (Global Admin)' },
    { time: '14:32:05', text: 'Previous role: Teacher', by: 'Mary N. (Global Admin)' },
    { time: '14:31:58', text: 'User profile viewed', by: 'Mary N. (Global Admin)' },
  ],
  related: [
    { when: 'Oct 26, 2026, 14:20', text: 'User profile viewed', who: 'mary.n@maple.com' },
    { when: 'Oct 26, 2026, 10:12', text: 'User invited', who: 'system' },
    { when: 'Oct 24, 2026, 16:33', text: 'Login successful', who: 'john.doe@greenvalley.ac.ug' },
  ],
};

/* ─── Data requests ─── */

export interface RequestRow extends DataRequest {
  n: number;
  name: string;
  email: string;
  avatar?: Photo;
  subject: string;
  reason: string;
  tenant: string;
  submitted: string;
  due: string;
  requestedBy: string;
  flag: string;
  country: string;
  ip: string;
  reference: string;
  notes: string;
}

const R = (n: number, name: string, email: string, avatar: Photo | undefined, type: DataRequest['type'], subject: string, reason: string, tenant: string, submitted: string, due: string, status: DataRequest['status'], extra: Partial<RequestRow> = {}): RequestRow => ({
  n,
  id: `DRQ-2026${submitted.slice(4, 6).trim() === '26' ? '1026' : submitted.slice(4, 6).trim() === '25' ? '1025' : '1024'}-${String(n).padStart(3, '0')}`,
  name,
  email,
  avatar,
  type,
  subject,
  reason,
  tenant,
  submitted,
  due,
  status,
  minor: /student|child/i.test(subject),
  identityVerified: true,
  guardianVerified: false,
  scope: type === 'Deletion' ? ['Personal Profile', 'Learning Activity', 'Communications', 'Payment History'] : ['Personal Profile', 'Student Data', 'Learning Activity', 'Communications'],
  requestedBy: `${name} (${/parent/i.test(name) ? 'Parent' : /teacher/i.test(name) ? 'Teacher' : 'User'})`,
  flag: 'UG',
  country: 'Uganda',
  ip: '197.210.12.5 (Kampala, Uganda)',
  reference: `support-${8800 + n * 7}`,
  notes: '',
  ...extra,
});

export const requests: readonly RequestRow[] = [
  R(1, 'Sarah Nankya', 'sarah.nankya@gmail.com', face.sarah, 'Export', 'Personal data (all)', 'Account transfer', 'Green Valley Academy', 'Oct 26, 2026 14:32', '2026-11-02', 'Pending', { minor: true, requestedBy: 'Sarah Nankya (Parent)', notes: 'Needs verification of parent identity and relationship to student.' }),
  R(2, 'Daniel Okello', 'daniel.okello@school.ug', face.john, 'Deletion', 'User account', 'Close account', 'Bright Future School', 'Oct 26, 2026 13:18', '2026-11-02', 'Processing'),
  R(3, 'Grace Achieng', 'grace.achieng@gmail.com', face.grace, 'Access', 'School data (children)', 'Verify data', "St. Mark's College", 'Oct 26, 2026 12:44', '2026-11-01', 'Pending', { flag: 'KE', country: 'Kenya', requestedBy: 'Grace Achieng (Parent)' }),
  R(4, 'Parent Request', 'parent@example.com', undefined, 'Export', 'Student data', 'School transfer', 'Hope International', 'Oct 26, 2026 11:52', '2026-11-01', 'Completed', { guardianVerified: true, flag: 'NG', country: 'Nigeria' }),
  R(5, 'James Kato', 'james.kato@gmail.com', face.james, 'Correction', 'Profile information', 'Incorrect details', 'Maple Platform', 'Oct 26, 2026 10:21', '2026-10-31', 'Processing'),
  R(6, 'Teacher Request', 'teacher@school.ug', face.tutorB, 'Access', 'Teaching resources', 'Subject review', 'Cornerstone Academy', 'Oct 26, 2026 09:11', '2026-10-31', 'Pending'),
  R(7, 'Agnes Lumu', 'agnes.lumu@gmail.com', face.agnes, 'Deletion', 'All personal data', 'GDPR right to erasure', 'Maple Platform', 'Oct 25, 2026 18:33', '2026-11-01', 'Under Review'),
  R(8, 'Robert Kimani', 'r.kimani@school.ke', face.kato, 'Export', 'Assessment data', 'Research purpose', 'Sunrise Schools', 'Oct 25, 2026 16:20', '2026-10-31', 'Processing', { flag: 'KE', country: 'Kenya' }),
  R(9, 'Lydia Banda', 'lydia.banda@school.zm', face.esther, 'Access', 'Child safety report', 'Support case', 'Green Valley Academy', 'Oct 25, 2026 14:18', '2026-10-31', 'Pending', { flag: 'ZM', country: 'Zambia' }),
  R(10, 'David Mensah', 'david.mensah@gmail.com', face.michael, 'Export', 'Subject content', 'Academic use', 'Maple Platform', 'Oct 25, 2026 12:05', '2026-10-31', 'Completed', { flag: 'GH', country: 'Ghana' }),
  R(11, 'Maria Lopez', 'maria.lopez@gmail.com', face.aisha, 'Deletion', 'User account', 'Privacy concern', 'Bright Future School', 'Oct 24, 2026 18:45', '2026-10-30', 'Rejected'),
  R(12, 'School Admin', 'admin@school.ug', undefined, 'Export', 'School analytics', 'Internal planning', "St. Mark's College", 'Oct 24, 2026 16:32', '2026-10-30', 'Processing'),
];

export const requestStats: readonly KpiData[] = [
  { label: 'Total Requests', value: '128', delta: '32%', caption: 'vs. previous month', icon: 'doc', tone: 'blue' },
  { label: 'Pending', value: '28', delta: '12%', caption: 'awaiting action', icon: 'clock', tone: 'green' },
  { label: 'Processing', value: '46', delta: '21%', caption: 'in progress', icon: 'check', tone: 'purple' },
  { label: 'Completed', value: '48', delta: '60%', caption: 'this month', icon: 'check', tone: 'green' },
  { label: 'Rejected', value: '6', delta: '50%', down: true, good: true, caption: 'policy / invalid', icon: 'close', tone: 'red' },
];

/** Tab counts from the reference (the full month); the list below is the latest page. */
export const requestTabs: readonly { label: string; count: number; type?: DataRequest['type'] }[] = [
  { label: 'All Requests', count: 128 },
  { label: 'Export Requests', count: 45, type: 'Export' },
  { label: 'Deletion Requests', count: 28, type: 'Deletion' },
  { label: 'Access Requests', count: 22, type: 'Access' },
  { label: 'Correction Requests', count: 18, type: 'Correction' },
  { label: 'Other', count: 15 },
];

export const scopeInfo: Readonly<Record<string, string>> = {
  'Personal Profile': 'Basic account information',
  'Student Data': 'All students linked to this account',
  'Learning Activity': 'Class participation and progress',
  Communications: 'Messages and support tickets',
  'Payment History': 'Invoices, receipts and refunds',
};

/* ─── Support & escalations ─── */

export interface TicketRow extends Ticket {
  n: number;
  subject: string;
  category: string;
  user: string;
  email: string;
  avatar: Photo;
  tenant: string;
  createdLabel: string;
  sla: string;
  assigneeAvatar?: Photo;
  description: string;
  room?: string;
}

const T = (n: number, subject: string, category: string, user: string, avatar: Photo, tenant: string, priority: Ticket['priority'], status: Ticket['status'], createdLabel: string, createdIso: string, sla: string, slaHours: number, assignee: string, assigneeAvatar?: Photo, extra: Partial<TicketRow> = {}): TicketRow => ({
  n,
  id: `TK-2026${createdLabel.startsWith('Oct 26') ? '1026' : '1025'}-${String(n).padStart(3, '0')}`,
  subject,
  category,
  user,
  email: `${user.toLowerCase().replace(' ', '.')}@gmail.com`,
  avatar,
  tenant,
  priority,
  status,
  createdLabel,
  created: createdIso,
  sla,
  slaHours,
  assignee,
  assigneeAvatar,
  notes: [],
  description: `${subject}.`,
  ...extra,
});

export const tickets: readonly TicketRow[] = [
  T(1, 'Cannot join live class', 'Technical Issue', 'Agnes Nakato', face.agnes, 'Green Valley Academy', 'High', 'Open', 'Oct 26, 14:32', '2026-10-26T11:32:00Z', '2h', 2, 'Alex R.', face.tutorD, {
    description: 'Student is unable to join the scheduled live class. Receiving an error message.',
    room: 'Mathematics - P5 (room_8f2a1)',
    notes: ['Checked LiveKit logs: token expired before join.', 'Asked the learner to refresh; still failing.', 'Room healthy, other 27 students connected.'],
  }),
  T(2, 'Payment not reflected', 'Billing & Payments', 'David Ochieng', face.michael, 'Bright Future School', 'Medium', 'In Progress', 'Oct 26, 13:18', '2026-10-26T10:18:00Z', '6h', 6, 'Stella M.', face.ruth),
  T(3, 'AI Copilot incorrect answer', 'AI Copilot', 'Grace Nanyonga', face.grace, 'Hope International', 'Medium', 'Open', 'Oct 26, 12:44', '2026-10-26T09:44:00Z', '4h', 4, 'Unassigned'),
  T(4, 'Account locked', 'Account & Access', 'James Kato', face.james, "St. Mark's College", 'High', 'Escalated', 'Oct 26, 11:52', '2026-10-26T08:52:00Z', '1h', 1, 'Daniel K.', face.john, { level: 'L2' }),
  T(5, 'Report inappropriate content', 'Safety & Policy', 'Sarah Namulindwa', face.sarah, 'Maple Platform', 'High', 'Under Review', 'Oct 26, 10:21', '2026-10-26T07:21:00Z', '1h', 1, 'Maria L.', face.esther),
  T(6, 'Curriculum resource missing', 'Content & Curriculum', 'Peter Mwangi', face.okello, 'Cornerstone Academy', 'Low', 'In Progress', 'Oct 26, 09:11', '2026-10-26T06:11:00Z', '8h', 8, 'Kevin T.', face.tutorB),
  T(7, 'Refund request', 'Billing & Payments', 'Fatima Issa', face.aisha, 'Sunrise Schools', 'Medium', 'Awaiting Customer', 'Oct 25, 18:33', '2026-10-25T15:33:00Z', '12h', 12, 'Ruth N.', face.nakato),
  T(8, 'Student data correction', 'Data Request', 'Robert Kimani', face.kato, 'Green Valley Academy', 'Low', 'Open', 'Oct 25, 16:20', '2026-10-25T13:20:00Z', '24h', 24, 'Unassigned'),
  T(9, 'Unable to upload assignment', 'Technical Issue', 'Lydia Banda', face.esther, 'Bright Future School', 'Medium', 'In Progress', 'Oct 25, 14:18', '2026-10-25T11:18:00Z', '6h', 6, 'Alex R.', face.tutorD),
  T(10, 'Harassment report', 'Safety & Policy', 'Samuel Okello', face.john, 'Maple Platform', 'High', 'Escalated', 'Oct 25, 12:05', '2026-10-25T09:05:00Z', '1h', 1, 'Trust & Safety', undefined, { level: 'Trust & Safety' }),
];

export const supportStats: readonly KpiData[] = [
  { label: 'Total Tickets', value: '342', delta: '28%', caption: 'vs. previous month', icon: 'chat', tone: 'blue' },
  { label: 'Open', value: '48', delta: '15%', caption: 'need attention', icon: 'clock', tone: 'orange' },
  { label: 'Resolved', value: '256', delta: '42%', caption: 'this month', icon: 'check', tone: 'green' },
  { label: 'Escalated', value: '21', delta: '31%', caption: 'to L2 / L3', icon: 'alert', tone: 'red' },
  { label: 'Avg. Response Time', value: '4h 12m', delta: '38%', down: true, good: true, caption: 'vs. last month', icon: 'timer', tone: 'purple' },
  { label: 'Satisfaction (CSAT)', value: '4.7 / 5', delta: '12%', caption: 'from 4.2', icon: 'star', tone: 'orange' },
];

export const volume = {
  labels: ['Oct 1', 'Oct 5', 'Oct 10', 'Oct 15', 'Oct 20', 'Oct 25', 'Oct 31'],
  created: wave(31, 22, 30, 4, 0.3).map((v) => Math.round(v)),
  resolved: wave(31, 12, 17, 3, 1.2).map((v) => Math.round(v)),
  escalated: wave(31, 5, 6, 1.6, 2.1).map((v) => Math.max(1, Math.round(v))),
};

export const categories: readonly { label: string; pct: number; count: number; color: string }[] = [
  { label: 'Technical Issue', pct: 32, count: 109, color: '#1E6BF0' },
  { label: 'Account & Access', pct: 20, count: 68, color: '#22A55A' },
  { label: 'Billing & Payments', pct: 14, count: 48, color: '#F59E0B' },
  { label: 'Content & Curriculum', pct: 12, count: 41, color: '#F472B6' },
  { label: 'AI Copilot', pct: 10, count: 34, color: '#A855F7' },
  { label: 'Safety & Policy', pct: 7, count: 25, color: '#1E3A8A' },
  { label: 'Other', pct: 5, count: 17, color: '#94A3B8' },
];

export const sla = { within: 305, breached: 37 };
export const supportTabs: readonly { label: string; count: number }[] = [
  { label: 'All Tickets', count: 342 },
  { label: 'My Tickets', count: 12 },
  { label: 'Open', count: 48 },
  { label: 'Escalated', count: 21 },
  { label: 'Unassigned', count: 14 },
  { label: 'Awaiting Customer', count: 32 },
  { label: 'Resolved', count: 256 },
];
/** The support agent signed in on the Support page, and who escalates. */
export const supportAgent = 'Alex R.';
export const escalator = 'Mary N.';
/** Who takes tickets escalated to L2. */
export const l2Lead = 'Daniel K.';
/** People offered in the audit log's user filter. */
export const auditUsers = ['Mary N.', 'System', 'David O.', 'James K.'];
export const assignees = ['Alex R.', 'Stella M.', 'Daniel K.', 'Maria L.', 'Kevin T.', 'Ruth N.'];

/* ─── Security dashboard ─── */

export const dashStats: readonly KpiData[] = [
  { label: 'Privileged Admin Actions', value: '1,248', delta: '12%', caption: 'last 30 days', icon: 'key', tone: 'blue' },
  { label: 'Cross-Tenant Alerts', value: '3', caption: 'open now', icon: 'alert', tone: 'red' },
  { label: 'Erasure Requests', value: '28', caption: 'GDPR / deletion pending', icon: 'trash', tone: 'orange' },
  { label: 'Escalated Copilot Tickets', value: '21', delta: '31%', caption: 'to L2 / L3', icon: 'sparkle', tone: 'purple' },
  { label: 'Failed Logins (24h)', value: '412', delta: '9%', down: true, good: true, caption: 'blocked by rate limits', icon: 'lock', tone: 'blue' },
  { label: 'Admin 2FA Coverage', value: '94%', caption: '6 admins without 2FA', icon: 'verified', tone: 'green', progress: 0.94 },
];

export interface CrossTenantAlert {
  id: string;
  title: string;
  detail: string;
  tenants: string;
  when: string;
  status: 'Open' | 'Contained' | 'Resolved';
  severity: 'Critical' | 'High' | 'Medium';
  note?: string;
}

export const alerts: readonly CrossTenantAlert[] = [
  { id: 'CTA-118', title: 'Query returned rows from another tenant', detail: 'messages table: 3 rows from Hope International visible to a Bright Future admin session.', tenants: 'Bright Future → Hope International', when: 'Oct 26, 13:40', status: 'Open', severity: 'Critical' },
  { id: 'CTA-117', title: 'Support admin opened 40 student profiles in 5 minutes', detail: 'Unusual volume across 3 schools. Session kept alive for review.', tenants: '3 tenants', when: 'Oct 26, 11:02', status: 'Open', severity: 'High' },
  { id: 'CTA-116', title: 'API token reused from two countries', detail: 'Tenant integration token seen from Kenya and Germany within 4 minutes.', tenants: "St. Mark's College", when: 'Oct 25, 22:15', status: 'Contained', severity: 'High' },
];

export const policies: readonly RlsPolicy[] = [
  { table: 'students', enforced: true, crossTenantRows: 0 },
  { table: 'classes', enforced: true, crossTenantRows: 0 },
  { table: 'messages', enforced: true, crossTenantRows: 3 },
  { table: 'payments', enforced: true, crossTenantRows: 0 },
  { table: 'report_cards', enforced: true, crossTenantRows: 0 },
  { table: 'attendance', enforced: true, crossTenantRows: 0 },
  { table: 'audit_events', enforced: true, crossTenantRows: 0 },
];

export const failedLogins = { labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', ''], values: wave(24, 14, 18, 6, 0.8).map((v) => Math.round(v)) };

/** Schools offered in the audit log and data request tenant filters. */
export const auditTenants = ['Green Valley Academy', 'Bright Future School', 'Hope International', "St. Mark's College"];
export const requestTenants = ['Green Valley Academy', 'Bright Future School', "St. Mark's College", 'Maple Platform'];
