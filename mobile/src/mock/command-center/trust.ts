/**
 * Maple Command › Trust & Safety sample data: the teacher Verification Queue (AI pre-screened KYC,
 * quality, copyright and safeguarding) and the Trust & Safety hub's case tabs.
 */
import type { Application, Check, Risk } from '@/features/command/logic/trust';

import { face, type KpiData, type Photo } from './shared';

export interface QueueApp extends Application {
  n: number;
  flag: string;
  level: string;
  avatar?: Photo;
  score: number;
  submitted: string;
  time: string;
}

const ok = (label: string): Check => ({ label, state: 'ok' });
const CLEAN = [ok('Identity Verified'), ok('Documents Clear'), ok('Qualifications Valid')];

const first: readonly QueueApp[] = [
  { n: 1, id: 'APP-2026-00123', name: 'Sarah Namubiru', country: 'Uganda', flag: 'UG', subjects: 'Mathematics', level: 'Primary, Lower Sec', avatar: face.sarah, checks: CLEAN, score: 92, safeguarding: 'clear', status: 'ready', submitted: 'Oct 18, 2026', time: '10:24 AM', history: [] },
  { n: 2, id: 'APP-2026-00122', name: 'James Okello', country: 'Uganda', flag: 'UG', subjects: 'English', level: "Lower Sec, A'Level", avatar: face.james, checks: CLEAN, score: 88, safeguarding: 'clear', status: 'ready', submitted: 'Oct 18, 2026', time: '09:15 AM', history: [] },
  {
    n: 3,
    id: 'APP-2026-00121',
    name: 'Grace Achieng',
    country: 'Kenya',
    flag: 'KE',
    subjects: 'Sciences',
    level: 'Primary, Lower Sec',
    avatar: face.grace,
    checks: [{ label: 'Identity Mismatch', state: 'fail' }, { label: 'Additional Review', state: 'warn' }, ok('Qualifications Valid')],
    score: 76,
    safeguarding: 'alert',
    status: 'flagged',
    submitted: 'Oct 17, 2026',
    time: '06:42 PM',
    history: [],
  },
  { n: 4, id: 'APP-2026-00120', name: 'Peter Atim', country: 'Uganda', flag: 'UG', subjects: 'History', level: "Lower Sec, A'Level", avatar: face.okello, checks: CLEAN, score: 85, safeguarding: 'clear', status: 'ready', submitted: 'Oct 17, 2026', time: '02:11 PM', history: [] },
  { n: 5, id: 'APP-2026-00119', name: 'Ruth Kato', country: 'Uganda', flag: 'UG', subjects: 'Art & Design', level: 'Primary, Lower Sec', avatar: face.ruth, checks: CLEAN, score: 81, safeguarding: 'clear', status: 'ready', submitted: 'Oct 16, 2026', time: '11:03 AM', history: [] },
  { n: 6, id: 'APP-2026-00118', name: 'Daniel Mugisha', country: 'Rwanda', flag: 'RW', subjects: 'ICT & Computing', level: "Lower Sec, A'Level", avatar: face.michael, checks: CLEAN, score: 79, safeguarding: 'clear', status: 'review', submitted: 'Oct 16, 2026', time: '09:48 AM', history: [] },
  {
    n: 7,
    id: 'APP-2026-00117',
    name: 'Mary Wanjiku',
    country: 'Kenya',
    flag: 'KE',
    subjects: 'Business Studies',
    level: "Lower Sec, A'Level",
    avatar: face.esther,
    checks: [ok('Identity Verified'), ok('Documents Clear'), { label: 'Qualifications Pending', state: 'warn' }],
    score: 68,
    safeguarding: 'clear',
    status: 'review',
    submitted: 'Oct 15, 2026',
    time: '04:27 PM',
    history: [],
  },
  {
    n: 8,
    id: 'APP-2026-00116',
    name: 'Ahmed Ibrahim',
    country: 'Tanzania',
    flag: 'TZ',
    subjects: 'Physics',
    level: "A'Level",
    avatar: face.kato,
    checks: [ok('Identity Verified'), { label: 'Document Issue', state: 'fail' }, ok('Qualifications Valid')],
    score: 72,
    safeguarding: 'clear',
    status: 'flagged',
    submitted: 'Oct 15, 2026',
    time: '01:18 PM',
    history: [],
  },
  { n: 9, id: 'APP-2026-00115', name: 'Esther Adong', country: 'Uganda', flag: 'UG', subjects: 'Primary Education', level: 'Primary', avatar: face.nakato, checks: CLEAN, score: 90, safeguarding: 'clear', status: 'ready', submitted: 'Oct 14, 2026', time: '03:55 PM', history: [] },
  { n: 10, id: 'APP-2026-00114', name: 'Samuel Tesfaye', country: 'Ethiopia', flag: 'ET', subjects: 'Chemistry', level: "Lower Sec, A'Level", avatar: face.john, checks: CLEAN, score: 83, safeguarding: 'clear', status: 'ready', submitted: 'Oct 14, 2026', time: '11:21 AM', history: [] },
];

const NAMES = ['Brian Ssali', 'Joy Atuhaire', 'Moses Kiprop', 'Halima Juma', 'Patrick Obi', 'Agatha Mensah', 'Collins Otieno', 'Faith Uwase', 'Isaac Mwita', 'Lilian Achan', 'Noah Byaruhanga', 'Winnie Chebet', 'Yusuf Bakari', 'Abena Owusu', 'Kevin Mutua', 'Rose Nabirye'];
const PLACES: readonly [string, string][] = [['Uganda', 'UG'], ['Kenya', 'KE'], ['Tanzania', 'TZ'], ['Rwanda', 'RW'], ['Nigeria', 'NG'], ['Ghana', 'GH']];
const SUBJECTS: readonly [string, string][] = [['Mathematics', 'Primary, Lower Sec'], ['English', "Lower Sec, A'Level"], ['Biology', "A'Level"], ['Geography', 'Lower Sec'], ['Kiswahili', 'Primary'], ['Computer Studies', "Lower Sec, A'Level"]];

/** Fills the queue to the reference's counts (47 ready, 60 in review, 25 flagged) plus decided history, so tabs and pages are real. */
function generated(): readonly QueueApp[] {
  const plan: readonly [QueueApp['status'], number][] = [['ready', 41], ['review', 58], ['flagged', 23], ['approved', 342], ['rejected', 18]];
  const out: QueueApp[] = [];
  let n = 11;
  for (const [status, count] of plan) {
    for (let i = 0; i < count; i++, n++) {
      const [country, flag] = PLACES[n % PLACES.length];
      const [subjects, level] = SUBJECTS[n % SUBJECTS.length];
      const day = 14 - (Math.floor(n / 9) % 13);
      const flagged = status === 'flagged';
      out.push({
        n,
        id: `APP-2026-${String(200 + n).padStart(5, '0')}`,
        name: NAMES[n % NAMES.length],
        country,
        flag,
        subjects,
        level,
        checks: flagged ? [ok('Identity Verified'), { label: 'Document Issue', state: 'fail' }, ok('Qualifications Valid')] : status === 'review' ? [ok('Identity Verified'), ok('Documents Clear'), { label: 'Qualifications Pending', state: 'warn' }] : CLEAN,
        score: 64 + ((n * 7) % 31),
        safeguarding: 'clear',
        status,
        submitted: `Oct ${Math.max(1, day)}, 2026`,
        time: `${String(8 + (n % 9)).padStart(2, '0')}:${String((n * 13) % 60).padStart(2, '0')} ${n % 9 > 3 ? 'PM' : 'AM'}`,
        history: [],
      });
    }
  }
  return out;
}

export const queue: readonly QueueApp[] = [...first, ...generated()];

export const queueStats: readonly (KpiData & { bars: 'blue' | 'green' | 'orange' | 'red' })[] = [
  { label: 'Total Applications', value: '132', delta: '18% from last month', icon: 'people', tone: 'blue', bars: 'blue' },
  { label: 'Ready for Review', value: '47', caption: '36% of total', icon: 'check', tone: 'green', bars: 'green' },
  { label: 'In Review', value: '60', caption: '45% of total', icon: 'clock', tone: 'orange', bars: 'orange' },
  { label: 'Flagged', value: '25', delta: '19% of total', icon: 'alert', tone: 'red', bars: 'red' },
];

/** The AI read and documents for the applicant open in the side panel (Sarah's from the reference; others get a generated read). */
export const summary = {
  confidence: 'High Confidence',
  rows: [
    { label: 'Identity Verification', result: 'Verified', pct: 98 },
    { label: 'Document Authenticity', result: 'Clear', pct: 95 },
    { label: 'Qualification Verification', result: 'Valid', pct: 92 },
    { label: 'Course Content Quality', result: 'Good', pct: 88 },
    { label: 'Copyright & Plagiarism Check', result: 'Clean', pct: 94 },
    { label: 'Safeguarding Screening', result: 'Clear', pct: 96 },
  ],
  fit: [
    { label: 'Subject Expertise', value: 94 },
    { label: 'Teaching Experience', value: 90 },
    { label: 'Course Content Quality', value: 88 },
    { label: 'Student Reviews (external)', value: 91 },
  ],
  documents: [
    { title: 'National ID / Passport', file: 'id.pdf' },
    { title: 'Academic Certificates', file: 'degree_certificate.pdf' },
    { title: 'Teaching License (if required)', file: 'teaching_license.pdf' },
    { title: 'Police Clearance / Background Check', file: 'police_clearance.pdf' },
  ],
};

/* ─── Trust & Safety hub ─── */

export const hubStats: readonly KpiData[] = [
  { label: 'Teacher Applications', value: '124', delta: '24%', caption: 'pending review', icon: 'people', tone: 'blue' },
  { label: 'Auto-Approved (Low Risk)', value: '86', delta: '18%', caption: 'this month', icon: 'verified', tone: 'green' },
  { label: 'Needs Human Review', value: '28', delta: '33%', caption: 'AI flagged', icon: 'clock', tone: 'orange' },
  { label: 'High Risk / Blocked', value: '10', delta: '150%', caption: 'serious concerns', icon: 'alert', tone: 'red' },
  { label: 'Course Quality Flags', value: '17', delta: '41%', caption: 'copyright / quality', icon: 'cap', tone: 'purple' },
  { label: 'Minor-Safeguarding Alerts', value: '5', delta: '67%', caption: 'under investigation', icon: 'shield', tone: 'red' },
];

export interface HubTeacher extends Application {
  n: number;
  email: string;
  flag: string;
  qualification: string;
  avatar: Photo;
  risk: Risk;
  date: string;
  time: string;
  appId: string;
  city: string;
  /** The AI's results for the review panel. */
  results: readonly { label: string; text: string; state: Check['state']; view?: boolean }[];
  aiSummary: string;
}

const results = (over: Partial<Record<string, [string, Check['state']]>> = {}) =>
  (
    [
      ['Identity Verification', 'Match found (NIN/Passport)', 'ok', false],
      ['Academic Credentials', 'Verified with issuer', 'ok', true],
      ['Teaching Experience', 'Looks valid', 'ok', true],
      ['Criminal Record Check', 'No record found', 'ok', true],
      ['Sanctions & Watchlists', 'No match found', 'ok', false],
      ['Face Match (ID vs Selfie)', 'Match: 98%', 'ok', false],
      ['Document Authenticity', 'Authentic', 'ok', false],
      ['Biography & References', 'No major issues', 'ok', false],
    ] as const
  ).map(([label, text, state, view]) => {
    const o = over[label];
    return { label, text: o ? o[0] : text, state: o ? o[1] : state, view };
  });

const hubRow = (
  n: number,
  name: string,
  email: string,
  flag: string,
  qualification: string,
  subjects: string,
  risk: Risk,
  date: string,
  time: string,
  status: Application['status'],
  avatar: Photo,
  over: Partial<Record<string, [string, Check['state']]>> = {},
  aiSummary = 'All checks passed. The documents, identity and references are consistent.',
): HubTeacher => {
  const r = results(over);
  return {
    n,
    id: `TCH-${n}`,
    appId: `TCH-2026-00${4320 + n}`,
    name,
    email,
    country: flag,
    flag,
    qualification,
    subjects,
    risk,
    date,
    time,
    status,
    avatar,
    city: flag === 'KE' ? 'Nairobi, Kenya' : flag === 'TZ' ? 'Dar es Salaam, Tanzania' : flag === 'ZM' ? 'Lusaka, Zambia' : 'Kampala, Uganda',
    safeguarding: 'clear',
    checks: r.slice(0, 3).map((x) => ({ label: x.label, state: x.state })),
    results: r,
    aiSummary,
    history: [],
  };
};

const hubFirst: readonly HubTeacher[] = [
  hubRow(1, 'Agnes Nakato', 'agnes.nakato@gmail.com', 'UG', 'B.Ed (Hons)', 'Mathematics\nPhysics', 'Low', 'Oct 26, 2026', '14:32', 'ready', face.agnes),
  hubRow(2, 'David Ochieng', 'david.ochieng@gmail.com', 'KE', 'M.Sc Education', 'Chemistry\nBiology', 'Medium', 'Oct 26, 2026', '13:18', 'review', face.michael, { 'Teaching Experience': ['Dates overlap with another post', 'fail'] }, 'Two teaching posts overlap by eight months. Everything else checks out.'),
  hubRow(3, 'Grace Nanyonga', 'grace.nanyonga@gmail.com', 'UG', 'Diploma (Primary)', 'Primary (P1–P7)', 'Low', 'Oct 26, 2026', '12:44', 'ready', face.grace, { 'Academic Credentials': ['Issuer slow to reply', 'warn'] }),
  hubRow(
    4,
    'James Kato',
    'james.kato@gmail.com',
    'UG',
    'B.Ed (Hons)',
    'English\nLiterature',
    'High',
    'Oct 26, 2026',
    '11:52',
    'escalated',
    face.james,
    { 'Academic Credentials': ['Potential mismatch', 'warn'], 'Criminal Record Check': ['Flagged (requires review)', 'fail'], 'Document Authenticity': ['Needs manual review', 'warn'] },
    "The applicant's academic document shows inconsistencies in the issuer format. Criminal record check returned a potential match that requires human verification.",
  ),
  hubRow(5, 'Sarah Namulindwa', 'sarah.namulindwa@gmail.com', 'UG', 'M.Ed', 'Geography\nHistory', 'Medium', 'Oct 26, 2026', '10:21', 'review', face.sarah, { 'Biography & References': ['One reference unreachable', 'warn'] }),
  hubRow(6, 'Peter Mwangi', 'peter.mwangi@gmail.com', 'KE', 'B.Sc Education', 'ICT\nComputer Science', 'Low', 'Oct 26, 2026', '09:11', 'ready', face.okello),
  hubRow(7, 'Fatima Issa', 'fatima.issa@gmail.com', 'TZ', 'Diploma (Secondary)', 'Business\nAccounting', 'High', 'Oct 25, 2026', '18:33', 'blocked', face.aisha, { 'Document Authenticity': ['Certificate altered', 'fail'] }, 'The certificate image has been edited: fonts and seal do not match the issuer.'),
  hubRow(8, 'Robert Kimani', 'robert.kimani@gmail.com', 'KE', 'B.Ed (Hons)', 'Mathematics\nEconomics', 'Medium', 'Oct 25, 2026', '16:20', 'review', face.kato, { 'Face Match (ID vs Selfie)': ['Match: 81% (low light)', 'warn'] }),
  hubRow(9, 'Lydia Banda', 'lydia.banda@gmail.com', 'ZM', 'Certificate', 'Primary (P1–P7)', 'Low', 'Oct 25, 2026', '14:18', 'ready', face.esther),
  hubRow(10, 'Samuel Okello', 'samuel.okello@gmail.com', 'UG', 'M.Sc Education', 'Physics\nMathematics', 'Medium', 'Oct 25, 2026', '12:05', 'review', face.john, { 'Teaching Experience': ['Needs a second reference', 'warn'] }),
];

const QUALS = ['B.Ed (Hons)', 'M.Sc Education', 'Diploma (Primary)', 'B.Sc Education', 'M.Ed', 'Certificate'];
const HUB_PHOTOS = [face.agnes, face.michael, face.grace, face.james, face.sarah, face.okello, face.aisha, face.kato, face.esther, face.john, face.ruth, face.nakato];

/** The rest of the 124 applications, so the hub's filters, sorting and pages work on a full list. */
function hubMore(): readonly HubTeacher[] {
  const out: HubTeacher[] = [];
  for (let n = 11; n <= 124; n++) {
    const name = NAMES[n % NAMES.length];
    const [, flag] = PLACES[n % 4];
    const [subject] = SUBJECTS[n % SUBJECTS.length];
    const risk: Risk = n % 11 === 0 ? 'High' : n % 3 === 0 ? 'Medium' : 'Low';
    const status: Application['status'] = risk === 'High' ? (n % 2 ? 'escalated' : 'blocked') : risk === 'Medium' ? 'review' : 'ready';
    const day = 25 - Math.floor((n - 11) / 9);
    out.push(
      hubRow(
        n,
        name,
        `${name.toLowerCase().replace(' ', '.')}${n}@gmail.com`,
        flag,
        QUALS[n % QUALS.length],
        subject,
        risk,
        `Oct ${Math.max(1, day)}, 2026`,
        `${String(8 + (n % 10)).padStart(2, '0')}:${String((n * 7) % 60).padStart(2, '0')}`,
        status,
        HUB_PHOTOS[n % HUB_PHOTOS.length],
        risk === 'High' ? { 'Criminal Record Check': ['Flagged (requires review)', 'fail'] } : risk === 'Medium' ? { 'Academic Credentials': ['Issuer slow to reply', 'warn'] } : {},
        risk === 'High' ? 'A background check returned a possible match. A person must confirm before anything else happens.' : risk === 'Medium' ? 'Waiting on the issuer to confirm one certificate.' : undefined,
      ),
    );
  }
  return out;
}

export const hubTeachers: readonly HubTeacher[] = [...hubFirst, ...hubMore()];

export interface HubCase {
  n: number;
  id: string;
  title: string;
  owner: string;
  flag: string;
  signal: string;
  risk: Risk;
  reported: string;
  status: 'Open' | 'Needs Review' | 'Under Investigation' | 'Resolved' | 'Removed' | 'Upheld' | 'Overturned';
  ai: string;
  /** The reviewer's reason, once decided. */
  note?: string;
}

/** The other hub tabs: one list of cases each. */
export const hubCases: Readonly<Record<string, readonly HubCase[]>> = {
  'Course Quality': [
    { n: 1, id: 'CQ-1042', title: 'S3 Chemistry: Organic Basics', owner: 'Brian Ssali', flag: 'UG', signal: 'Quality score 61 • 4 broken videos', risk: 'Medium', reported: 'Oct 26, 09:40', status: 'Needs Review', ai: 'Four lesson videos fail to load and two quizzes have no answers set.' },
    { n: 2, id: 'CQ-1041', title: 'P7 Mathematics Revision Pack', owner: 'Joy Atuhaire', flag: 'UG', signal: 'Outdated syllabus (2019)', risk: 'Low', reported: 'Oct 25, 17:12', status: 'Open', ai: 'Follows the 2019 PLE syllabus; three topics moved in 2024.' },
    { n: 3, id: 'CQ-1040', title: "A'Level Economics Masterclass", owner: 'Moses Kiprop', flag: 'KE', signal: 'Refund rate 18%', risk: 'Medium', reported: 'Oct 25, 11:03', status: 'Needs Review', ai: 'Refunds cluster on week 2, where lessons are 9 minutes on average against the promised 40.' },
  ],
  'Copyright & IP': [
    { n: 1, id: 'IP-0311', title: 'KCSE Biology Past Papers 2015–2023', owner: 'Collins Otieno', flag: 'KE', signal: '96% match: KNEC copyrighted papers', risk: 'High', reported: 'Oct 26, 10:12', status: 'Under Investigation', ai: 'Exact copies of KNEC papers sold without a licence.' },
    { n: 2, id: 'IP-0310', title: 'Primary English Story Book', owner: 'Faith Uwase', flag: 'RW', signal: '72% match: published textbook', risk: 'Medium', reported: 'Oct 25, 15:44', status: 'Needs Review', ai: 'Several chapters match a commercial textbook; may be fair use with citation.' },
  ],
  'Minor Safeguarding': [
    { n: 1, id: 'SG-0091', title: 'Private message requests to a P6 learner', owner: 'Teacher #T-2281', flag: 'UG', signal: 'Off-platform contact request', risk: 'High', reported: 'Oct 26, 14:05', status: 'Under Investigation', ai: 'Asked a learner for a WhatsApp number twice. Account restricted pending review.' },
    { n: 2, id: 'SG-0090', title: 'Live class camera left on after class', owner: 'Teacher #T-1907', flag: 'KE', signal: 'Session ran 40 min past end', risk: 'Medium', reported: 'Oct 25, 19:20', status: 'Open', ai: 'Recording shows the room empty; likely an accident. Confirm with the teacher.' },
  ],
  'Reported Content': [
    { n: 1, id: 'RC-0507', title: 'Comment on S2 History lesson', owner: 'Learner #L-88213', flag: 'NG', signal: 'Bullying language (reported 3×)', risk: 'Medium', reported: 'Oct 26, 08:51', status: 'Open', ai: 'Insults aimed at another learner. Suggest hiding the comment and warning the account.' },
    { n: 2, id: 'RC-0506', title: 'Short video: "Easy fractions"', owner: 'Teacher #T-3120', flag: 'UG', signal: 'Spam links in description', risk: 'Low', reported: 'Oct 25, 13:30', status: 'Needs Review', ai: 'Description links to a betting site. Video itself is fine.' },
  ],
  Appeals: [
    { n: 1, id: 'AP-0044', title: 'Appeal: rejected application', owner: 'Halima Juma', flag: 'TZ', signal: 'New certificate uploaded', risk: 'Low', reported: 'Oct 26, 07:15', status: 'Open', ai: 'The new certificate verifies with the issuer. Original rejection reason no longer applies.' },
    { n: 2, id: 'AP-0043', title: 'Appeal: removed course', owner: 'Patrick Obi', flag: 'NG', signal: 'Says content is original', risk: 'Medium', reported: 'Oct 24, 16:02', status: 'Needs Review', ai: 'Author shows drafts dated before the matched source. Needs a human call.' },
  ],
};

export const hubTabs = ['Teacher Verification', 'Course Quality', 'Copyright & IP', 'Minor Safeguarding', 'Reported Content', 'Appeals'];
