/** Fixtures for screens that open over any portal (design builds only; never bundled in deployment). */

import type { MicState } from '@/lib/classroom';

import { photos } from './photos';
import { Maple } from '@/constants/maple';

export * as access from './access';

export const copilot = {
  context: 'S3 Mathematics · Quadratic equations',
  suggestions: ['Explain factorising step by step', 'Give me 3 practice questions', 'Where did I go wrong in question 4?'],
  conversation: [
    { from: 'learner', text: 'How do I solve x² − 5x + 6 = 0?' },
    {
      from: 'maple',
      text: 'Look for two numbers that multiply to 6 and add to −5. Which pair works?',
    },
    { from: 'learner', text: '−2 and −3?' },
    {
      from: 'maple',
      text: 'Yes. So (x − 2)(x − 3) = 0, which means x = 2 or x = 3. Want to try one on your own?',
    },
  ],
  note: 'Maple guides you to the answer rather than giving it. Teachers can see what you asked.',
};

function role(name: string): number {
  return photos.roles[name];
}

/** The role and school switcher's modes (design builds; real builds list the person's portals). */
export const contexts = [
  {
    key: 'learner',
    portal: 'learner' as const,
    accountKey: 'student' as const,
    title: 'Learner Mode',
    tagline: 'Student • Daniel Okello (Senior 2)',
    detail: 'Access your lessons, classes, practice, and progress. Continue your personalized learning journey.',
    short: 'Access your lessons, classes, practice, and progress.',
    icon: 'cap' as const,
    tint: Maple.blue,
    tile: role('icon-learner'),
    photo: role('learner'),
  },
  {
    key: 'tutor',
    portal: 'teacher' as const,
    accountKey: 'teacher' as const,
    title: 'Independent Tutor Mode',
    tagline: 'Teacher • Sarah N. (Teach & Earn)',
    detail: 'Create and manage your own classes, students, storefront, and learning resources.',
    short: 'Create and manage your own classes and students.',
    icon: 'person' as const,
    tint: Maple.blue,
    tile: role('icon-tutor'),
    photo: role('tutor'),
  },
  {
    key: 'school-teacher',
    portal: 'teacher' as const,
    accountKey: 'teacher' as const,
    title: 'School Teacher Mode',
    tagline: 'Teacher • Sarah N. (Green Valley School)',
    detail: 'Access your school classes, curriculum, students, assignments, and school resources.',
    short: 'Access your school classes and curriculum.',
    icon: 'school' as const,
    tint: Maple.successText,
    tile: role('icon-teacher'),
    photo: role('teacher'),
  },
  {
    key: 'parent',
    portal: 'parent' as const,
    accountKey: 'parent' as const,
    title: 'Parent Mode',
    tagline: 'Parent • Grace Namukasa (4 Children)',
    detail: "Track your child's progress, attendance, assignments, and learning activities.",
    short: "Track your child's progress and learning activities.",
    icon: 'people' as const,
    tint: '#EC4899',
    tile: role('icon-parent'),
    photo: role('parent'),
  },
  {
    key: 'school',
    portal: 'school' as const,
    accountKey: 'institution' as const,
    title: 'Institution Admin Mode',
    tagline: 'Principal • Dr. James Mukasa (Kampala Hill School)',
    detail: 'Manage school rosters, timetable, attendance monitor, fee collection, academic year, and staff roles.',
    short: 'Manage school rosters, timetable, fees, and staff.',
    icon: 'grid' as const,
    tint: Maple.warning,
  },
  {
    key: 'command',
    portal: 'command' as const,
    accountKey: 'admin' as const,
    title: 'Platform Admin Mode',
    tagline: 'Platform Admin • Amina Kato (Maple Command)',
    detail: 'Oversee platform health, school pipeline, trust & safety queue, revenue reconciliation, and teacher payouts.',
    short: 'Oversee schools, trust & safety, revenue, and ops.',
    icon: 'settings' as const,
    tint: Maple.navy,
  },
];

export type DemoAccountKey = 'student' | 'teacher' | 'parent' | 'institution' | 'admin';

const SHARED_MEMBERSHIPS = [
  {
    institution_id: 1,
    institution_name: 'Maple Online School',
    role: 'headteacher',
    status: 'active' as const,
  },
  {
    institution_id: 2,
    institution_name: 'Green Valley School',
    role: 'class_teacher',
    status: 'active' as const,
  },
  {
    institution_id: 3,
    institution_name: 'Kampala Hill School',
    role: 'headteacher',
    status: 'active' as const,
  },
];

const SHARED_CHILDREN = [
  { user_id: 201, full_name: 'Mary N.', relationship: 'Mother' },
  { user_id: 202, full_name: 'Daniel O.', relationship: 'Mother' },
  { user_id: 203, full_name: 'Grace N.', relationship: 'Mother' },
  { user_id: 204, full_name: 'Samuel N.', relationship: 'Mother' },
];

/** Dummy accounts for all 5 platform roles so every portal can be tested end-to-end. */
export const demoAccounts = {
  student: {
    key: 'student' as const,
    portal: 'learner' as const,
    name: 'Daniel Okello',
    email: 'student@maple.school',
    role: 'Student • Senior 2 · Maple Online School',
    photo: role('daniel'),
    me: {
      id: 101,
      email: 'student@maple.school',
      full_name: 'Daniel Okello',
      role: 'student' as const,
      country_code: 'UG',
      memberships: SHARED_MEMBERSHIPS,
      children: SHARED_CHILDREN,
    },
  },
  teacher: {
    key: 'teacher' as const,
    portal: 'teacher' as const,
    name: 'Sarah N.',
    email: 'teacher@maple.school',
    role: 'Teacher • Mathematics · Green Valley School',
    photo: role('sarah'),
    me: {
      id: 102,
      email: 'teacher@maple.school',
      full_name: 'Sarah N.',
      role: 'teacher' as const,
      country_code: 'UG',
      memberships: SHARED_MEMBERSHIPS,
      children: SHARED_CHILDREN,
    },
  },
  parent: {
    key: 'parent' as const,
    portal: 'parent' as const,
    name: 'Grace Namukasa',
    email: 'parent@maple.school',
    role: 'Parent • 4 Children Across 4 Schools',
    photo: role('parent'),
    me: {
      id: 103,
      email: 'parent@maple.school',
      full_name: 'Grace Namukasa',
      role: 'parent' as const,
      country_code: 'UG',
      memberships: SHARED_MEMBERSHIPS,
      children: SHARED_CHILDREN,
    },
  },
  institution: {
    key: 'institution' as const,
    portal: 'school' as const,
    name: 'Dr. James Mukasa',
    email: 'institution@maple.school',
    role: 'Institution Admin • Kampala Hill School',
    photo: role('teacher'),
    me: {
      id: 104,
      email: 'institution@maple.school',
      full_name: 'Dr. James Mukasa',
      role: 'institution' as const,
      country_code: 'UG',
      memberships: SHARED_MEMBERSHIPS,
      children: SHARED_CHILDREN,
    },
  },
  admin: {
    key: 'admin' as const,
    portal: 'command' as const,
    name: 'Amina Kato',
    email: 'admin@maple.school',
    role: 'Platform Admin • Maple Command Centre',
    photo: role('tutor'),
    me: {
      id: 105,
      email: 'admin@maple.school',
      full_name: 'Amina Kato',
      role: 'admin' as const,
      country_code: 'UG',
      memberships: SHARED_MEMBERSHIPS,
      children: SHARED_CHILDREN,
    },
  },
};

type DemoPortal = 'learner' | 'teacher' | 'parent' | 'school' | 'command';
const DEMO_PORTAL_KEYS: Record<DemoPortal, DemoAccountKey> = {
  learner: 'student',
  teacher: 'teacher',
  parent: 'parent',
  school: 'institution',
  command: 'admin',
};

/** The portal named by `?as=` in a design-build address, so a page can be opened straight in any role. */
export function demoPortalFromSearch(search: string): DemoPortal | null {
  // iOS and Android have no address bar, so there is nothing to read.
  if (!search) return null;
  const as = new URLSearchParams(search).get('as');
  return as && as in DEMO_PORTAL_KEYS ? (as as DemoPortal) : null;
}

const startPortal = demoPortalFromSearch(globalThis.location?.search ?? '');
let activeDemoKey: DemoAccountKey = startPortal ? DEMO_PORTAL_KEYS[startPortal] : 'student';

export function getActiveDemoAccount() {
  return demoAccounts[activeDemoKey];
}

export function setActiveDemoAccount(key: DemoAccountKey) {
  activeDemoKey = key;
  return demoAccounts[activeDemoKey];
}

export function setActiveDemoByPortal(portal: DemoPortal) {
  activeDemoKey = DEMO_PORTAL_KEYS[portal];
  return demoAccounts[activeDemoKey];
}

export function setActiveDemoByEmail(email: string) {
  const lower = email.toLowerCase();
  if (lower.includes('teacher') || lower.includes('sarah') || lower.includes('tutor')) {
    activeDemoKey = 'teacher';
  } else if (lower.includes('parent') || lower.includes('grace') || lower.includes('family') || lower.includes('mary')) {
    activeDemoKey = 'parent';
  } else if (lower.includes('institution') || lower.includes('school') || lower.includes('principal') || lower.includes('james')) {
    activeDemoKey = 'institution';
  } else if (lower.includes('admin') || lower.includes('command') || lower.includes('amina')) {
    activeDemoKey = 'admin';
  } else {
    activeDemoKey = 'student';
  }
  return demoAccounts[activeDemoKey];
}

/** Accounts signed in on this device, for the switcher's "Your Accounts" list. */
export const accounts = [
  {
    key: 'student' as const,
    portal: 'learner' as const,
    name: 'Daniel Okello',
    email: 'student@maple.school',
    role: 'Student • Senior 2 · Maple Online School',
    photo: role('daniel'),
    current: true,
  },
  {
    key: 'teacher' as const,
    portal: 'teacher' as const,
    name: 'Sarah N.',
    email: 'teacher@maple.school',
    role: 'Teacher • Mathematics · Green Valley School',
    photo: role('sarah'),
    current: false,
  },
  {
    key: 'parent' as const,
    portal: 'parent' as const,
    name: 'Grace Namukasa',
    email: 'parent@maple.school',
    role: 'Parent • 4 Children Across 4 Schools',
    photo: role('parent'),
    current: false,
  },
  {
    key: 'institution' as const,
    portal: 'school' as const,
    name: 'Dr. James Mukasa',
    email: 'institution@maple.school',
    role: 'Institution Admin • Kampala Hill School',
    photo: role('teacher'),
    current: false,
  },
  {
    key: 'admin' as const,
    portal: 'command' as const,
    name: 'Amina Kato',
    email: 'admin@maple.school',
    role: 'Platform Admin • Maple Command Centre',
    photo: role('tutor'),
    current: false,
  },
];

export const sync = {
  online: false,
  waiting: 3,
  lastSynced: 'Today 07:42',
};

export const concern = {
  kinds: ['Someone made me feel unsafe', 'Bullying or unkind messages', 'Wrong or harmful content', 'Payment problem', 'Something else'],
  promise: 'A trained person reads every report within 24 hours. Safety reports go to the front of the queue.',
};

export const checkout = {
  item: 'UCE Mathematics: Quadratics Mastery',
  seller: 'Mr. Daniel Ssempala',
  priceUGX: 45000,
  walletUGX: 12000,
  methods: ['MTN MoMo', 'Airtel Money', 'Card', 'Maple wallet'],
  guarantee: 'Your money is held until the lessons are delivered. Full refund within 7 days if you change your mind.',
};

const face = (i: number) => photos.classFaces[i];

/** The live virtual classroom, as in Edwin's reference design. */
export const classroom = {
  slug: 'p7-maths-revision-bootcamp',
  title: 'Primary 7 Mathematics Revision Bootcamp',
  board: 'UNEB · Primary 7',
  students: 82,
  teacher: 'Ms. Sarah Kimani',
  elapsedSeconds: 42 * 60 + 18,
  lengthSeconds: 2 * 3600,
  stage: photos.classStage,
  tiles: [
    { name: 'Ms. Sarah Kimani', photo: photos.classTiles[0], speaking: true },
    { name: 'Daniel Okello', photo: photos.classTiles[1], speaking: false },
    { name: 'Aisha Bello', photo: photos.classTiles[2], speaking: false },
    { name: 'Brian Turyamureba', photo: photos.classTiles[3], speaking: false },
    { name: 'Grace Nambatya', photo: photos.classTiles[4], speaking: false },
  ],
  participants: [
    {
      name: 'Ms. Sarah Kimani',
      role: 'teacher' as const,
      mic: 'on' as MicState,
      hand: false,
      note: 'Teacher, host',
      photo: face(0),
    },
    {
      name: 'Daniel Okello',
      role: 'student' as const,
      mic: 'off' as MicState,
      hand: true,
      note: 'Student',
      photo: face(1),
    },
    {
      name: 'Aisha Bello',
      role: 'student' as const,
      mic: 'on' as MicState,
      hand: false,
      note: 'Student',
      photo: face(2),
    },
    {
      name: 'Brian Turyamureba',
      role: 'student' as const,
      mic: 'muted' as MicState,
      hand: true,
      note: 'Student',
      photo: face(3),
    },
    {
      name: 'Grace Nambatya',
      role: 'student' as const,
      mic: 'muted' as MicState,
      hand: false,
      note: 'Student',
      photo: face(4),
    },
    {
      name: 'Ivan Ssemanda',
      role: 'student' as const,
      mic: 'muted' as MicState,
      hand: true,
      note: 'Student',
      photo: face(5),
    },
  ],
  chat: [
    {
      who: 'Aisha Bello',
      at: '10:23 AM',
      text: 'Thank you teacher, that makes sense! 🙌',
      photo: face(2),
      teacher: false,
    },
    {
      who: 'Daniel Okello',
      at: '10:24 AM',
      text: 'Can we also try one with mixed numbers?',
      photo: face(1),
      teacher: false,
    },
    {
      who: 'Mariam Ndagire',
      at: '10:25 AM',
      text: 'Yes please 🙏',
      photo: face(4),
      teacher: false,
    },
    {
      who: 'Ivan Ssemanda',
      at: '10:25 AM',
      text: 'I still find it hard to get the common denominator.',
      photo: face(5),
      teacher: false,
    },
    {
      who: 'Ms. Sarah Kimani',
      at: '10:26 AM',
      text: "Great question Ivan. Let's do another example together now.",
      photo: face(0),
      teacher: true,
    },
  ],
  chatCount: 12,
  transcript: [
    {
      at: '10:12',
      who: 'Ms. Sarah Kimani',
      text: 'Today we are going to learn how to add and subtract fractions.',
    },
    {
      at: '10:18',
      who: '',
      text: 'First, we need a common denominator. This is the smallest number that both denominators can divide into.',
    },
    {
      at: '10:25',
      who: '',
      text: 'For example, for 3/4 and 2/3, the common denominator is 12.',
    },
    {
      at: '10:31',
      who: '',
      text: 'So we convert 3/4 to 9/12 and 2/3 to 8/12.',
    },
    {
      at: '10:36',
      who: '',
      text: 'Now we add the numerators: 9/12 + 8/12 = 17/12.',
    },
    {
      at: '10:43',
      who: '',
      text: 'Since 17/12 is an improper fraction, we change it to a mixed number: 1 5/12.',
    },
    { at: '10:46', who: '', text: "Let's try another example together." },
  ],
  notes: {
    title: 'Fractions: Adding and Subtracting',
    steps: [
      'Find a common denominator (LCM).',
      'Convert each fraction to the common denominator.',
      'Add or subtract the numerators.',
      'Simplify the answer.',
      'Change to a mixed number if needed.',
    ],
    keyPoint: 'When adding or subtracting fractions, the denominator must be the same.',
    examples: ['3/4 + 2/3 = 17/12 = 1 5/12', '5/6 – 1/4 = 7/12'],
  },
  assignments: [
    {
      title: 'Practice Questions 1',
      kind: 'Homework',
      due: 'Due: Nov 8, 2026 · 11:59 PM',
      tint: Maple.blue,
      soft: Maple.blueSoft,
      status: 'todo' as const,
    },
    {
      title: 'Past Paper Section A',
      kind: 'Past Paper',
      due: 'Due: Nov 10, 2026 · 11:59 PM',
      tint: '#F97316',
      soft: Maple.warningSoft,
      status: 'todo' as const,
    },
    {
      title: 'Fractions Mini Quiz',
      kind: 'Quiz',
      due: 'Due: Nov 8, 2026 · 5:00 PM',
      tint: Maple.blue,
      soft: Maple.blueSoft,
      status: 'todo' as const,
    },
  ],
  resources: [
    { title: 'Fractions revision notes', meta: 'PDF · 1.2 MB' },
    { title: 'PLE 2025 Paper 1', meta: 'PDF · 860 KB' },
    { title: 'Today’s whiteboard', meta: 'Image · 420 KB' },
  ],
  poll: {
    question: 'Which is bigger: 3/4 or 2/3?',
    options: ['3/4', '2/3', 'They are equal'],
    votes: [41, 18, 6],
  },
  rooms: [
    { name: 'Room 1 · Adding fractions', members: 6 },
    { name: 'Room 2 · Mixed numbers', members: 6 },
    { name: 'Room 3 · Word problems', members: 5 },
  ],
  recording: 'This class is being recorded. The recording and transcript appear in your Library about an hour after class.',
};

/** The demo classes, shared by the class list and each class's roster. */
const MOCK_CLASSES = [
  {
    id: 1,
    title: 'O-Level Mathematics',
    class_level: 2,
    class_level_name: 'Senior 2',
    subject_name: 'Mathematics',
    teacher: 102,
    teacher_name: 'Sarah N.',
    institution: 1,
    visibility: 'private',
    is_published: true,
    created_at: '2026-01-10T08:00:00Z',
    student_count: 32,
  },
  {
    id: 2,
    title: 'O-Level Science',
    class_level: 2,
    class_level_name: 'Senior 2',
    subject_name: 'Science',
    teacher: 102,
    teacher_name: 'Sarah N.',
    institution: 1,
    visibility: 'private',
    is_published: true,
    created_at: '2026-01-10T08:00:00Z',
    student_count: 28,
  },
  {
    id: 3,
    title: 'Form 3 Advanced Maths',
    class_level: 3,
    class_level_name: 'Senior 3',
    subject_name: 'Mathematics',
    teacher: 102,
    teacher_name: 'Sarah N.',
    institution: 2,
    visibility: 'private',
    is_published: true,
    created_at: '2026-01-10T08:00:00Z',
    student_count: 24,
  },
  {
    id: 4,
    title: 'Primary 6 Mathematics',
    class_level: 6,
    class_level_name: 'Primary 6',
    subject_name: 'Mathematics',
    teacher: 103,
    teacher_name: 'Mr. Kato',
    institution: 1,
    visibility: 'private',
    is_published: true,
    created_at: '2026-01-10T08:00:00Z',
    student_count: 30,
  },
];

/** A list the way the real API sends it: `{ count, results }`. */
interface SampleMessage {
  id: number;
  author: { id: number; name: string };
  body: string;
  created_at: string;
}

interface SampleSummary {
  id: number;
  subject: string;
  student: { id: number; name: string };
  staff: { id: number; name: string };
  last_message_at: string;
  last_body: string;
  last_author: string;
}

const SAMPLE_THREADS: readonly SampleSummary[] = [
  {
    id: 1,
    subject: 'Mary’s weekly progress',
    student: { id: 201, name: 'Mary N.' },
    staff: { id: 102, name: 'Ms. Sarah N.' },
    last_message_at: '2026-10-26T09:42:00Z',
    last_body: 'Thank you! We are practising 10 minutes of mental maths every evening.',
    last_author: 'Grace Namukasa',
  },
  {
    id: 2,
    subject: 'Science lab preparation',
    student: { id: 202, name: 'Daniel O.' },
    staff: { id: 105, name: 'Mr. Mugisha' },
    last_message_at: '2026-10-25T16:10:00Z',
    last_body: 'Remember to review Chapter 4 before Tuesday’s live lab.',
    last_author: 'Mr. Mugisha',
  },
];

const MARY_MESSAGES: readonly SampleMessage[] = [
  {
    id: 1,
    author: { id: 102, name: 'Ms. Sarah N.' },
    body: 'Mary has been very focused in class this week and is asking great questions. Keep encouraging her!',
    created_at: '2026-10-26T09:30:00Z',
  },
  {
    id: 2,
    author: { id: 301, name: 'Grace Namukasa' },
    body: 'Thank you! We are practising 10 minutes of mental maths every evening.',
    created_at: '2026-10-26T09:42:00Z',
  },
];

const SAMPLE_MESSAGES: Readonly<Record<number, readonly SampleMessage[]>> = {
  1: MARY_MESSAGES,
  2: [
    {
      id: 3,
      author: { id: 105, name: 'Mr. Mugisha' },
      body: 'Remember to review Chapter 4 before Tuesday’s live lab.',
      created_at: '2026-10-25T16:10:00Z',
    },
  ],
};

/** Replies sent in this visit of a design build, by conversation, so a sent message stays on screen. */
const sentReplies = new Map<number, readonly SampleMessage[]>();

/** Conversations started in this visit of a design build, newest first. */
let startedThreads: readonly SampleSummary[] = [];

const SAMPLE_STAFF: Readonly<Record<number, string>> = { 102: 'Ms. Sarah N.', 104: 'Dr. James Mukasa', 105: 'Mr. Mugisha' };

/** Starts a conversation from the New conversation form, with its first message, and returns its id. */
function startSampleThread(sent: { student?: number; staff?: number; subject?: string; body?: string }): number {
  const me = getActiveDemoAccount().me;
  const id = 100 + startedThreads.length + 1;
  const student = SHARED_CHILDREN.find((c) => c.user_id === sent.student) ?? SHARED_CHILDREN[0];
  const staffId = sent.staff ?? 102;
  const first: SampleMessage = { id: Date.now(), author: { id: me.id, name: me.full_name }, body: sent.body ?? '', created_at: new Date().toISOString() };
  const summary: SampleSummary = {
    id,
    subject: sent.subject || 'New conversation',
    student: { id: student.user_id, name: student.full_name },
    staff: { id: staffId, name: SAMPLE_STAFF[staffId] ?? 'Ms. Sarah N.' },
    last_message_at: first.created_at,
    last_body: first.body,
    last_author: me.full_name,
  };
  startedThreads = [summary, ...startedThreads];
  sentReplies.set(id, [first]);
  return id;
}

function sampleThread(id: number) {
  const head = [...startedThreads, ...SAMPLE_THREADS].find((t) => t.id === id) ?? SAMPLE_THREADS[0];
  return { id, subject: head.subject, student: head.student, staff: head.staff, can_reply: true, messages: [...(SAMPLE_MESSAGES[head.id] ?? []), ...(sentReplies.get(id) ?? [])] };
}

function withLatestReply(t: SampleSummary) {
  const latest = sentReplies.get(t.id)?.at(-1);
  return latest ? { ...t, last_message_at: latest.created_at, last_body: latest.body, last_author: latest.author.name } : t;
}

function listResponse(results: readonly unknown[]): Response {
  return jsonResponse({
    count: results.length,
    next: null,
    previous: null,
    results,
  });
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Fallback API responder for design builds (EXPO_PUBLIC_MOCK_DATA=true) when
 * testing with dummy accounts without the Go backend running.
 */
export async function mockApiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
  const method = (init?.method ?? (typeof input === 'object' && 'method' in input ? input.method : 'GET')).toUpperCase();
  const parsed = new URL(url, 'http://localhost:8080');
  const path = parsed.pathname;

  if (path === '/api/v1/auth/token/' || path === '/api/v1/auth/token/refresh/') {
    try {
      const raw = init?.body ? String(init.body) : '';
      if (raw) {
        const parsedBody = JSON.parse(raw) as { email?: string };
        if (parsedBody.email) setActiveDemoByEmail(parsedBody.email);
      }
    } catch {
      // Ignore body parse errors
    }
    return jsonResponse({
      access: 'mock-demo-access-token',
      refresh: 'mock-demo-refresh-token',
    });
  }
  if (path === '/api/v1/auth/logout/') {
    return jsonResponse({ ok: true });
  }
  if (path === '/api/v1/auth/me/') {
    return jsonResponse(getActiveDemoAccount().me);
  }
  if (path === '/api/v1/inbox/summary/') {
    return jsonResponse({ unread: 3 });
  }
  if (path === '/api/v1/inbox/') {
    return listResponse([
      {
        id: 1,
        title: 'Mathematics live class in 2 hours',
        body: 'Ms. Sarah N. scheduled O-Level Mathematics at 3:00 PM.',
        kind: 'lesson',
        read_at: null,
        created_at: '2026-10-26T10:00:00Z',
        link: '/learn/live',
      },
      {
        id: 2,
        title: 'Assignment graded: Fractions test',
        body: 'You scored 92% on End of Topic Test – Fractions.',
        kind: 'grade',
        read_at: null,
        created_at: '2026-10-25T14:20:00Z',
        link: '/learn/assignments',
      },
      {
        id: 3,
        title: 'Voice note from your teacher',
        body: 'Ms. Sarah N. shared a 20-second progress update.',
        kind: 'message',
        read_at: '2026-10-24T18:00:00Z',
        created_at: '2026-10-24T09:15:00Z',
        link: '/messages',
      },
    ]);
  }
  if (path.startsWith('/api/v1/inbox/')) {
    return jsonResponse({ ok: true });
  }
  if (path === '/api/v1/classes/') {
    return listResponse(MOCK_CLASSES);
  }
  if (path.match(/^\/api\/v1\/classes\/\d+\/roster\/$/)) {
    const id = Number(path.split('/')[4]);
    return jsonResponse({
      class: { ...(MOCK_CLASSES.find((c) => c.id === id) ?? MOCK_CLASSES[0]) },
      students: [
        {
          enrollment: 1,
          student: 201,
          student_name: 'Mary N.',
          enrolled_at: '2026-01-12T08:00:00Z',
        },
        {
          enrollment: 2,
          student: 202,
          student_name: 'Daniel O.',
          enrolled_at: '2026-01-12T08:00:00Z',
        },
        {
          enrollment: 3,
          student: 203,
          student_name: 'Grace N.',
          enrolled_at: '2026-01-12T08:00:00Z',
        },
        {
          enrollment: 4,
          student: 204,
          student_name: 'Samuel N.',
          enrolled_at: '2026-01-12T08:00:00Z',
        },
      ],
    });
  }
  if (path === '/api/v1/scheduling/timetable/') {
    return listResponse([
      {
        id: 1,
        day_of_week: 1,
        start_time: '09:00',
        end_time: '10:00',
        class_id: 1,
        class_title: 'O-Level Mathematics',
        room_name: 'Live Room A1',
        teacher_name: 'Sarah N.',
      },
      {
        id: 2,
        day_of_week: 1,
        start_time: '10:30',
        end_time: '11:30',
        class_id: 2,
        class_title: 'O-Level Science',
        room_name: 'Science Lab 2',
        teacher_name: 'Mr. Mugisha',
      },
      {
        id: 3,
        day_of_week: 1,
        start_time: '15:00',
        end_time: '16:00',
        class_id: 3,
        class_title: 'Form 3 Advanced Maths',
        room_name: 'Live Studio B',
        teacher_name: 'Sarah N.',
      },
    ]);
  }
  if (path === '/api/v1/lessons/lesson/') {
    return listResponse([
      {
        id: 1,
        title: 'Quadratic Equations – Solving by Factorization',
        access_mode: 'published',
        scheduled_at: '2026-11-02T12:00:00Z',
        published_at: '2026-10-25T09:00:00Z',
        created_at: '2026-10-20T09:00:00Z',
        parent_class: 1,
        creator: 102,
      },
      {
        id: 2,
        title: 'Fractions and Decimals Mastery',
        access_mode: 'published',
        scheduled_at: '2026-11-03T09:00:00Z',
        published_at: '2026-10-26T09:00:00Z',
        created_at: '2026-10-21T09:00:00Z',
        parent_class: 4,
        creator: 102,
      },
      {
        id: 3,
        title: 'Investigating Soil Types & Conservation',
        access_mode: 'published',
        scheduled_at: '2026-11-04T11:00:00Z',
        published_at: '2026-10-26T09:00:00Z',
        created_at: '2026-10-22T09:00:00Z',
        parent_class: 2,
        creator: 102,
      },
    ]);
  }
  if (path === '/api/v1/live-sessions/live-session/') {
    return listResponse([
      {
        id: 1,
        title: 'Mathematics Live Class',
        scheduled_start: '2026-11-02T15:00:00Z',
        duration_minutes: 60,
        status: 'scheduled',
        host_class: 1,
        join_url: 'https://live.maple.school/maths-s2',
      },
      {
        id: 2,
        title: 'Science Revision Clinic',
        scheduled_start: '2026-11-03T10:00:00Z',
        duration_minutes: 60,
        status: 'scheduled',
        host_class: 2,
        join_url: 'https://live.maple.school/sci-s2',
      },
    ]);
  }
  if (path === '/api/v1/assessments/assessment/') {
    return listResponse([
      {
        id: 1,
        title: 'Quadratic Equations – Problem Set 2',
        description: 'Solve the quadratic equations showing full working.',
        assessment_type: 'assignment',
        due_date: '2026-10-31T23:59:00Z',
        total_marks: 100,
        parent_class: 1,
        is_published: true,
      },
      {
        id: 2,
        title: 'Algebra Worksheet',
        description: 'Complete questions 1–10 on linear and quadratic expressions.',
        assessment_type: 'assignment',
        due_date: '2026-10-28T23:59:00Z',
        total_marks: 100,
        parent_class: 1,
        is_published: true,
      },
      {
        id: 3,
        title: 'Science Lab Report',
        description: 'Write up your findings on soil permeability.',
        assessment_type: 'project',
        due_date: '2026-10-29T23:59:00Z',
        total_marks: 100,
        parent_class: 2,
        is_published: true,
      },
    ]);
  }
  if (path.match(/^\/api\/v1\/assessments\/assessment\/\d+\/$/)) {
    return jsonResponse({
      id: 1,
      title: 'Quadratic Equations – Problem Set 2',
      description: 'Solve the quadratic equations showing full working.',
      assessment_type: 'assignment',
      due_date: '2026-10-31T23:59:00Z',
      total_marks: 100,
      parent_class: 1,
      is_published: true,
    });
  }
  if (path === '/api/v1/assessments/submission/') {
    return listResponse([
      {
        id: 1,
        assessment: 1,
        student: 202,
        student_name: 'Daniel Okello',
        submitted_at: '2026-10-28T09:52:00Z',
        status: 'submitted',
        text_Entry: 'Solved all 5 quadratic equations.',
      },
      {
        id: 2,
        assessment: 2,
        student: 201,
        student_name: 'Mary N.',
        submitted_at: '2026-10-28T08:03:00Z',
        status: 'graded',
        text_Entry: 'Completed worksheet.',
      },
    ]);
  }
  if (path === '/api/v1/grading/records/') {
    return listResponse([
      {
        id: 1,
        submission: 2,
        score: '92',
        max_score: '100',
        feedback: 'Excellent factorization steps!',
        graded_at: '2026-10-28T11:00:00Z',
      },
    ]);
  }
  if (path === '/api/v1/grading/reports/') {
    return listResponse([
      {
        id: 1,
        student: 201,
        student_name: 'Mary N.',
        class_id: 4,
        class_title: 'Primary 6 Mathematics',
        term_name: 'Term 3 2026',
        overall_score: '89.0',
        overall_grade_letter: 'A',
        teacher_comment: 'Mary has been very focused in class this week and is asking great questions.',
        headteacher_comment: 'Exemplary progress.',
        is_published: true,
      },
      {
        id: 2,
        student: 202,
        student_name: 'Daniel O.',
        class_id: 1,
        class_title: 'Senior 2 O-Level',
        term_name: 'Term 3 2026',
        overall_score: '86.0',
        overall_grade_letter: 'A',
        teacher_comment: 'Daniel shows strong analytical thinking in Algebra.',
        headteacher_comment: 'Keep up the strong effort.',
        is_published: true,
      },
    ]);
  }
  if (path.match(/^\/api\/v1\/grading\/reports\/\d+\/$/)) {
    const subject = (id: number, title: string, formative: string, summative: string, total: string, grade: string, remarks: string) => ({
      id,
      student: 201,
      student_name: 'Mary N.',
      assigned_class: 4,
      class_title: title,
      term: 3,
      term_name: 'Term 3 2026',
      formative_score: formative,
      summative_score: summative,
      total_score: total,
      grade_letter: grade,
      descriptor: null,
      teacher_remarks: remarks,
      finalized_by: 102,
      finalized_at: '2026-11-28T10:00:00Z',
    });
    return jsonResponse({
      id: 1,
      institution: 1,
      student: 201,
      student_name: 'Mary N.',
      term: 3,
      term_name: 'Term 3 2026',
      overall_score: '89.00',
      overall_grade_letter: 'A',
      promotion_status: 'Promoted to Primary 7',
      class_teacher_remarks: 'Mary has been very focused in class this term and is asking great questions.',
      headteacher_remarks: 'Exemplary progress across all subjects.',
      is_published: true,
      published_at: '2026-11-29T08:00:00Z',
      generated_at: '2026-11-28T16:00:00Z',
      subjects: [
        subject(1, 'Mathematics', '34.00', '52.00', '86.00', 'A', 'Strong improvement in fractions.'),
        subject(2, 'English', '31.00', '51.00', '82.00', 'A', 'Clear reading comprehension.'),
        subject(3, 'Integrated Science', '30.00', '48.00', '78.00', 'B', 'Active in lab sessions.'),
        subject(4, 'Social Studies', '36.00', '55.00', '91.00', 'A', 'Top of the class.'),
      ],
    });
  }
  if (path === '/api/v1/grading/subjects/') {
    return listResponse([
      {
        id: 1,
        student: 201,
        student_name: 'Mary N.',
        subject_name: 'Mathematics',
        score: '86',
        grade_letter: 'A',
      },
      {
        id: 2,
        student: 202,
        student_name: 'Daniel O.',
        subject_name: 'Mathematics',
        score: '92',
        grade_letter: 'A+',
      },
    ]);
  }
  if (path === '/api/v1/finance/summary/') {
    return jsonResponse({
      school: 1,
      currency: 'UGX',
      billed_minor: 10000000000,
      collected_minor: 7100000000,
      outstanding_minor: 2900000000,
      pending_payments: 3,
    });
  }
  if (path === '/api/v1/finance/invoices/') {
    const invoice = (
      id: number,
      number: string,
      student: number,
      name: string,
      total: number,
      paid: number,
      status: string,
      due: string,
      lines: [string, number][],
    ) => ({
      id,
      school: 1,
      student,
      student_name: name,
      term: 3,
      class: 4,
      number,
      currency: 'UGX',
      total_minor: total,
      paid_minor: paid,
      balance_minor: total - paid,
      status,
      due_date: due,
      created_at: '2026-09-01T08:00:00Z',
      voided_at: null,
      lines: lines.map(([description, amount], i) => ({
        id: id * 10 + i,
        fee_item: i + 1,
        description,
        amount_minor: amount,
      })),
    });
    return listResponse([
      invoice(1, 'INV-2026-00458', 201, 'Mary N.', 57000000, 57000000, 'paid', '2026-10-15', [
        ['Term 3 tuition', 45000000],
        ['Science & virtual lab pack', 12000000],
      ]),
      invoice(2, 'INV-2026-00492', 202, 'Daniel O.', 65000000, 40000000, 'partially_paid', '2026-11-15', [
        ['Term 3 tuition', 53000000],
        ['Science & virtual lab pack', 12000000],
      ]),
      invoice(3, 'INV-2026-00511', 203, 'Grace N.', 45000000, 0, 'issued', '2026-11-30', [['Term 3 tuition', 45000000]]),
    ]);
  }
  if (path === '/api/v1/finance/fee-items/') {
    return listResponse([
      {
        id: 1,
        school: 1,
        name: 'Term 3 tuition',
        amount_minor: 45000000,
        currency: 'UGX',
        term: 3,
        class_level: null,
        created_at: '2026-08-20T08:00:00Z',
      },
      {
        id: 2,
        school: 1,
        name: 'Science & virtual lab pack',
        amount_minor: 12000000,
        currency: 'UGX',
        term: 3,
        class_level: 2,
        created_at: '2026-08-20T08:00:00Z',
      },
    ]);
  }
  if (path === '/api/v1/library/items/' || path === '/api/v1/library/assigned/' || path === '/api/v1/library/continue/') {
    return listResponse([
      {
        id: 1,
        title: 'Our Environment',
        subject_name: 'Social Studies',
        class_level_name: 'Senior 2',
        kind: 'book',
        progress_percent: 68,
        url: 'https://maple.school/library/our-environment.pdf',
      },
      {
        id: 2,
        title: 'Fractions and Decimals',
        subject_name: 'Mathematics',
        class_level_name: 'Primary 6',
        kind: 'book',
        progress_percent: 68,
        url: 'https://maple.school/library/fractions.pdf',
      },
      {
        id: 3,
        title: 'Basic Algebra',
        subject_name: 'Mathematics',
        class_level_name: 'Senior 2',
        kind: 'book',
        progress_percent: 45,
        url: 'https://maple.school/library/basic-algebra.pdf',
      },
    ]);
  }
  if (path === '/api/v1/messages/threads/' && method === 'POST') {
    const raw = init?.body ? String(init.body) : input instanceof Request ? await input.clone().text() : '';
    const sent = JSON.parse(raw || '{}') as { student?: number; staff?: number; subject?: string; body?: string };
    return jsonResponse(sampleThread(startSampleThread(sent)));
  }
  if (path === '/api/v1/messages/threads/') {
    return listResponse([...startedThreads, ...SAMPLE_THREADS].map(withLatestReply));
  }
  const reply = /^\/api\/v1\/messages\/threads\/(\d+)\/messages\/$/.exec(path);
  if (reply && method === 'POST') {
    const id = Number(reply[1]);
    const me = getActiveDemoAccount().me;
    // openapi-fetch sends a Request with the body inside it rather than in init.
    const raw = init?.body ? String(init.body) : input instanceof Request ? await input.clone().text() : '';
    const body = (JSON.parse(raw || '{}') as { body?: string }).body ?? '';
    const sent = { id: Date.now(), author: { id: me.id, name: me.full_name }, body, created_at: new Date().toISOString() };
    sentReplies.set(id, [...(sentReplies.get(id) ?? []), sent]);
    return jsonResponse(sampleThread(id));
  }
  if (path.match(/^\/api\/v1\/messages\/threads\/\d+\/$/)) {
    return jsonResponse(sampleThread(Number(path.split('/')[5]) || 1));
  }
  if (path === '/api/v1/messages/contacts/') {
    return listResponse([
      { id: 102, name: 'Ms. Sarah N.', role: 'Mathematics teacher' },
      { id: 104, name: 'Dr. James Mukasa', role: 'Headteacher' },
    ]);
  }
  if (path.startsWith('/api/v1/curriculum/programmes/')) {
    // The real programme shape: tracks → levels → classes → subjects, plus the track's rules.
    const subject = (id: number, code: string, name: string, compulsory = true) => ({ id, code, name, compulsory });
    const primary = [
      subject(1, 'ENG', 'English'),
      subject(2, 'MTC', 'Mathematics'),
      subject(3, 'SCI', 'Integrated Science'),
      subject(4, 'SST', 'Social Studies'),
      subject(5, 'RE', 'Religious Education', false),
    ];
    const lower = [
      subject(11, 'ENG', 'English'),
      subject(12, 'MTC', 'Mathematics'),
      subject(13, 'BIO', 'Biology'),
      subject(14, 'CHE', 'Chemistry'),
      subject(15, 'PHY', 'Physics'),
      subject(16, 'GEO', 'Geography'),
      subject(17, 'HIS', 'History & Political Education'),
      subject(18, 'ICT', 'ICT', false),
      subject(19, 'AGR', 'Agriculture', false),
    ];
    const cls = (id: number, name: string, grade: number, subjects: ReturnType<typeof subject>[]) => ({ id, name, grade, subjects });
    return jsonResponse({
      country: 'UG',
      tracks: [
        {
          id: 1,
          name: 'Uganda National Curriculum (NCDC)',
          rules: [
            {
              key: 'ple',
              kind: 'exam',
              classes: ['P7'],
              note: 'Primary Leaving Examination in English, Mathematics, Science and Social Studies.',
            },
            {
              key: 'uce',
              kind: 'exam',
              classes: ['S4'],
              note: 'Uganda Certificate of Education: at least 8 subjects, 7 compulsory.',
            },
            {
              key: 'electives',
              kind: 'elective_limit',
              classes: ['S3', 'S4'],
              note: 'Choose 1–2 electives from ICT, Agriculture, Art or a language.',
            },
            {
              key: 'competency',
              kind: 'approach',
              classes: ['S1', 'S2', 'S3', 'S4'],
              note: 'Competency-based: projects and activities of integration count towards the final grade.',
            },
          ],
          levels: [
            {
              id: 1,
              name: 'Upper Primary',
              classes: [cls(5, 'P5', 5, primary), cls(6, 'P6', 6, primary), cls(7, 'P7', 7, primary)],
            },
            {
              id: 2,
              name: 'Lower Secondary',
              classes: [cls(8, 'S1', 8, lower), cls(9, 'S2', 9, lower), cls(10, 'S3', 10, lower), cls(11, 'S4', 11, lower)],
            },
          ],
        },
      ],
    });
  }
  if (path === '/api/v1/attendance/daily/') {
    return listResponse([
      {
        id: 1,
        student: 201,
        student_name: 'Mary N.',
        class_id: 4,
        date: '2026-10-26',
        status: 'present',
        note: 'Active in live class',
      },
      {
        id: 2,
        student: 202,
        student_name: 'Daniel O.',
        class_id: 1,
        date: '2026-10-26',
        status: 'present',
        note: 'Completed warm-up quiz',
      },
      {
        id: 3,
        student: 203,
        student_name: 'Grace N.',
        class_id: 4,
        date: '2026-10-26',
        status: 'present',
        note: '',
      },
      {
        id: 4,
        student: 204,
        student_name: 'Samuel N.',
        class_id: 1,
        date: '2026-10-26',
        status: 'late',
        note: 'Joined 8 mins after start',
      },
    ]);
  }
  if (path.match(/^\/api\/v1\/insights\/classes\/\d+\/learners\/$/)) {
    const id = Number(path.split('/')[5]);
    const cls = MOCK_CLASSES.find((c) => c.id === id) ?? MOCK_CLASSES[0];
    const learner = (
      sid: number,
      name: string,
      level: 'high' | 'medium' | 'ok',
      reasons: string[],
      attended: number,
      done: number,
      avg: number,
    ) => ({
      student: { id: sid, name },
      level,
      reasons,
      days_marked: 20,
      days_attended: attended,
      work_set: 8,
      work_done: done,
      average_pct: avg,
      last_intervention_at: level === 'ok' ? null : '2026-10-26T11:00:00Z',
    });
    return jsonResponse({
      class: { id: cls.id, name: cls.title },
      learners: [
        learner(204, 'Samuel N.', 'high', ['Attendance below 85%', 'Two pieces of work missing'], 17, 6, 68),
        learner(202, 'Daniel O.', 'medium', ['One piece of work missing'], 18, 7, 74),
        learner(201, 'Mary N.', 'ok', [], 19, 8, 89),
        learner(203, 'Grace N.', 'ok', [], 19, 8, 88),
      ],
    });
  }
  if (path === '/api/v1/insights/interventions/') {
    return listResponse([
      {
        id: 1,
        student: 202,
        student_name: 'Daniel O.',
        kind: 'academic',
        note: 'Sent Trigonometry & Equations Intervention Pack (remedial video + 5 practice questions).',
        created_at: '2026-10-26T11:00:00Z',
        author_name: 'Sarah N.',
      },
    ]);
  }
  if (method !== 'GET') {
    return jsonResponse({ id: Date.now(), ok: true, status: 'ok' });
  }
  return listResponse([]);
}
