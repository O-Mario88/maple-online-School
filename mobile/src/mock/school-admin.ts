/**
 * Sample data for the school-admin reference pages (November 2026): Roster Manager, Timetable,
 * Report Cards, Library, Fees & Finance, Student Ledger, Accounting, Settings and Attendance & QR.
 * Names, dates and figures are illustrative, copied from Edwin's references.
 */
import type { IconName } from '@/lib/icons';

type Photo = number;
type Tone = 'blue' | 'red' | 'orange' | 'purple' | 'green' | 'grey';

const face = {
  mary: require('./images/pp-mary.png') as Photo,
  daniel: require('./images/pp-daniel.png') as Photo,
  grace: require('./images/pp-grace.png') as Photo,
  samuel: require('./images/pp-samuel.png') as Photo,
  sarah: require('./images/pp-sarah.png') as Photo,
  okello: require('./images/pp-okello.png') as Photo,
  nakato: require('./images/pp-nakato.png') as Photo,
  kato: require('./images/pp-kato.png') as Photo,
  john: require('./images/pp-john.png') as Photo,
  esther: require('./images/pp-esther.png') as Photo,
};

export const me = { name: 'Mary N.', role: 'School Administrator', avatar: face.mary, initial: 'A', notifications: 3 };
export const years = ['2026', '2025'];
export const terms = ['Term 1', 'Term 2', 'Term 3'];
export const campuses = ['Main Campus', 'West Campus', 'North Campus'];

/* ─── Roster Manager ─── */

export type RosterStatus = 'Ready' | 'Missing email' | 'Duplicate';
export interface RosterRow {
  n: number;
  first: string;
  last: string;
  cls: string;
  dob: string;
  gender: string;
  phone: string;
  email: string;
  status: RosterStatus;
}

export const roster = {
  file: { name: 'Primary 1 Students.csv', size: '12,450 KB', rows: 320 },
  steps: [
    { title: 'Upload File', body: 'CSV or Excel' },
    { title: 'Map Columns', body: 'Match your columns' },
    { title: 'Review & Fix', body: 'Check for errors' },
    { title: 'Import', body: 'Add to your school' },
  ],
  fields: ['First Name', 'Last Name', 'Date of Birth', 'Gender', 'Class / Grade', 'Parent Phone', 'Parent Email', 'Admission No.', 'Skip this column'],
  mapping: [
    ['First Name', 'First Name'],
    ['Last Name', 'Last Name'],
    ['Date of Birth', 'Date of Birth'],
    ['Gender', 'Gender'],
    ['Class', 'Class / Grade'],
    ['Parent Phone', 'Parent Phone'],
    ['Parent Email', 'Parent Email'],
  ] as const,
  summary: { total: 320, ready: 280, review: 32, duplicates: 8, missing: 0 },
  templates: ['Student Roster Template (CSV)', 'Teacher Roster Template (CSV)', 'Parent Roster Template (CSV)'],
  rows: [
    { n: 1, first: 'Daniel', last: 'Okello', cls: 'P1A', dob: '2018-03-12', gender: 'Male', phone: '+256 772 123 456', email: 'daniel.okello@gmail.com', status: 'Ready' },
    { n: 2, first: 'Mary', last: 'Atim', cls: 'P1A', dob: '2018-07-21', gender: 'Female', phone: '+256 704 987 321', email: 'mary.atim@gmail.com', status: 'Ready' },
    { n: 3, first: 'John', last: 'Achieng', cls: 'P1B', dob: '2018-11-05', gender: 'Male', phone: '+256 701 234 567', email: '', status: 'Missing email' },
    { n: 4, first: 'Sarah', last: 'Nabwire', cls: 'P1B', dob: '2018-01-30', gender: 'Female', phone: '+256 783 456 789', email: 'sarah.nabwire@gmail.com', status: 'Ready' },
    { n: 5, first: 'Peter', last: 'Opio', cls: 'P1C', dob: '2017-09-14', gender: 'Male', phone: '+256 700 112 233', email: 'peter.opio@gmail.com', status: 'Duplicate' },
    { n: 6, first: 'Grace', last: 'Akol', cls: 'P1C', dob: '2018-06-18', gender: 'Female', phone: '+256 778 998 877', email: 'grace.akol@gmail.com', status: 'Ready' },
    { n: 7, first: 'James', last: 'Otim', cls: 'P1A', dob: '2018-04-10', gender: 'Male', phone: '+256 705 667 788', email: '', status: 'Missing email' },
  ] as RosterRow[],
  recent: [
    { name: 'Primary 1 Students.csv', when: 'Today, 10:24 AM', status: 'Completed', detail: '120 records' },
    { name: 'New Admissions.csv', when: 'Oct 25, 2026', status: 'Completed', detail: '45 records' },
    { name: 'Student Updates.csv', when: 'Oct 20, 2026', status: 'Completed (with errors)', detail: '3 errors' },
  ],
};

/* ─── Timetable ─── */

export type Subject = 'English' | 'Mathematics' | 'Science' | 'C.R.E.' | 'Social Studies' | 'ICT' | 'Art' | 'Music' | 'P.E.' | 'Guidance' | 'Library' | 'Literacy';

/** Each subject's colour on the grid. */
export const SUBJECT_TONE: Readonly<Record<Subject, Tone>> = {
  English: 'blue',
  Mathematics: 'green',
  Science: 'purple',
  'C.R.E.': 'orange',
  'Social Studies': 'red',
  ICT: 'blue',
  Art: 'orange',
  Music: 'purple',
  'P.E.': 'green',
  Guidance: 'green',
  Library: 'purple',
  Literacy: 'purple',
};

export interface Lesson {
  subject: Subject;
  label?: string;
  room: string;
  teacher: string;
}

const L = (subject: Subject, room: string, teacher: string, label?: string): Lesson => ({ subject, room, teacher, label });

export type Slot = { time: string; lessons: readonly Lesson[] } | { time: string; label: string };

export const timetable = {
  range: 'Mar 10 – Mar 14, 2026',
  days: [
    { dow: 'Mon', date: 'Mar 10' },
    { dow: 'Tue', date: 'Mar 11' },
    { dow: 'Wed', date: 'Mar 12' },
    { dow: 'Thu', date: 'Mar 13' },
    { dow: 'Fri', date: 'Mar 14' },
  ],
  views: ['Weekly View', 'List View', 'Teacher View', 'Room View'],
  sections: ['Primary', 'Secondary'],
  grades: ['Primary 1', 'Primary 2', 'Primary 3'],
  classes: ['Primary 1A', 'Primary 1B', 'Primary 1C'],
  slots: [
    { time: '8:00 – 8:40', lessons: [L('English', 'Room 1', 'Mrs. A. Namaganda'), L('Mathematics', 'Room 1', 'Mr. J. Ochieng'), L('English', 'Room 1', 'Mrs. A. Namaganda'), L('Science', 'Lab 1', 'Mr. P. Otim'), L('Mathematics', 'Room 1', 'Mr. J. Ochieng')] },
    { time: '8:40 – 9:20', lessons: [L('Mathematics', 'Room 1', 'Mr. J. Ochieng'), L('English', 'Room 1', 'Mrs. A. Namaganda'), L('Mathematics', 'Room 1', 'Mr. J. Ochieng'), L('English', 'Room 1', 'Mrs. A. Namaganda'), L('Science', 'Lab 1', 'Mr. P. Otim')] },
    { time: '9:20 – 10:00', lessons: [L('C.R.E.', 'Room 1', 'Mrs. S. Akello'), L('Science', 'Lab 1', 'Mr. P. Otim'), L('Social Studies', 'Room 1', 'Mrs. L. Atim'), L('Mathematics', 'Room 1', 'Mr. J. Ochieng'), L('English', 'Room 1', 'Mrs. A. Namaganda')] },
    { time: '10:00 – 10:20', label: 'Break' },
    { time: '10:20 – 11:00', lessons: [L('Science', 'Lab 1', 'Mr. P. Otim'), L('C.R.E.', 'Room 1', 'Mrs. S. Akello'), L('Science', 'Lab 1', 'Mr. P. Otim'), L('Social Studies', 'Room 1', 'Mrs. L. Atim'), L('ICT', 'Computer Lab', 'Mr. D. Kato')] },
    { time: '11:00 – 11:40', lessons: [L('Social Studies', 'Room 1', 'Mrs. L. Atim'), L('ICT', 'Computer Lab', 'Mr. D. Kato'), L('ICT', 'Computer Lab', 'Mr. D. Kato'), L('C.R.E.', 'Room 1', 'Mrs. S. Akello'), L('C.R.E.', 'Room 1', 'Mrs. S. Akello')] },
    { time: '11:40 – 12:20', lessons: [L('ICT', 'Computer Lab', 'Mr. D. Kato'), L('Literacy', 'Room 1', 'Mrs. L. Atim'), L('C.R.E.', 'Room 1', 'Mrs. S. Akello'), L('ICT', 'Computer Lab', 'Mr. D. Kato'), L('Social Studies', 'Room 1', 'Mrs. L. Atim')] },
    { time: '12:20 – 1:00', label: 'Lunch' },
    { time: '1:00 – 1:40', lessons: [L('Art', 'Room 2', 'Mrs. P. Nambi', 'Art & Craft'), L('Music', 'Room 2', 'Mr. S. Kato'), L('Art', 'Room 2', 'Mrs. P. Nambi', 'Art & Craft'), L('Music', 'Room 2', 'Mr. S. Kato'), L('Library', 'Room 1', 'Mrs. A. Namaganda')] },
    { time: '1:40 – 2:20', lessons: [L('P.E.', 'Playground', 'Mr. T. Mugisha', 'Physical Education'), L('Library', 'Room 1', 'Mrs. A. Namaganda'), L('P.E.', 'Playground', 'Mr. T. Mugisha', 'Physical Education'), L('Guidance', 'Room 1', 'Mrs. L. Atim'), L('P.E.', 'Playground', 'Mr. T. Mugisha', 'Physical Education')] },
  ] as readonly Slot[],
  unscheduled: [
    { subject: 'Art' as Subject, label: 'Art', cls: 'Primary 1A', periods: '2 periods/week' },
    { subject: 'Guidance' as Subject, label: 'Guidance', cls: 'Primary 1A', periods: '1 period/week' },
    { subject: 'Music' as Subject, label: 'Computing', cls: 'Primary 1A', periods: '1 period/week' },
  ],
  conflicts: [{ title: 'Mr. P. Otim is double-booked', body: 'Wed 10:20 – Science for P1A and P2B, both in Lab 1' }],
  substitutes: [
    { name: 'Mr. D. Kato', subjects: 'ICT, Mathematics', free: 'Free Mon 8:00 – 9:20' },
    { name: 'Mrs. L. Atim', subjects: 'English, Social Studies', free: 'Free Mon 8:00 – 8:40' },
  ],
  faces: { 'Mrs. A. Namaganda': face.nakato, 'Mr. J. Ochieng': face.okello, 'Mr. P. Otim': face.kato, 'Mr. D. Kato': face.john, 'Mrs. L. Atim': face.esther, 'Mrs. S. Akello': face.sarah } as Readonly<Record<string, Photo>>,
  rooms: ['All Rooms', 'Room 1', 'Room 2', 'Lab 1', 'Computer Lab', 'Playground'],
};

/* ─── Report Cards ─── */

export type MarkStatus = 'Submitted' | 'Needs Review' | 'Pending';
export interface MarkRow {
  n: number;
  name: string;
  adm: string;
  cls: string;
  marks: number;
  grade: string;
  status: MarkStatus;
}

export const reportCards = {
  steps: [
    { title: 'Marks Entry', body: 'Collect and review marks' },
    { title: 'Moderation', body: 'Apply school moderation' },
    { title: 'Approval', body: 'Head teacher approval' },
    { title: 'Publish', body: 'Issue to parents' },
  ],
  grades: ['Primary 1', 'Primary 2', 'Primary 3'],
  classes: ['Primary 1A', 'Primary 1B'],
  subjects: ['Mathematics', 'English', 'Science', 'Social Studies'],
  tabs: ['Marks Entry', 'Moderation', 'Approval', 'Publish', 'Learning Passport'],
  marks: [
    { n: 1, name: 'Daniel Okello', adm: 'P1A-001', cls: 'P1A', marks: 86, grade: 'A', status: 'Submitted' },
    { n: 2, name: 'Sarah Nabwire', adm: 'P1A-002', cls: 'P1A', marks: 78, grade: 'B', status: 'Submitted' },
    { n: 3, name: 'James Opio', adm: 'P1A-003', cls: 'P1A', marks: 92, grade: 'A+', status: 'Submitted' },
    { n: 4, name: 'Grace Akol', adm: 'P1A-004', cls: 'P1A', marks: 65, grade: 'C', status: 'Submitted' },
    { n: 5, name: 'Peter Atim', adm: 'P1A-005', cls: 'P1A', marks: 48, grade: 'D', status: 'Needs Review' },
    { n: 6, name: 'Mary Achieng', adm: 'P1A-006', cls: 'P1A', marks: 73, grade: 'B', status: 'Submitted' },
    { n: 7, name: 'John Otim', adm: 'P1A-007', cls: 'P1A', marks: 58, grade: 'C', status: 'Pending' },
    { n: 8, name: 'Ruth Adong', adm: 'P1A-008', cls: 'P1A', marks: 90, grade: 'A', status: 'Submitted' },
  ] as MarkRow[],
  moderation: [
    { title: 'Subject Moderation', body: 'Adjust marks and add remarks', status: 'In Progress', tone: 'blue' as Tone, icon: 'check' as IconName, iconTone: 'green' as Tone },
    { title: 'Class Teacher Approval', body: 'Confirm all marks', status: 'Pending', tone: 'orange' as Tone, icon: 'alert' as IconName, iconTone: 'orange' as Tone },
    { title: 'Head Teacher Approval', body: 'Final review and sign-off', status: 'Pending', tone: 'orange' as Tone, icon: 'alert' as IconName, iconTone: 'orange' as Tone },
  ],
  publish: [
    { title: 'Generate Report Cards', body: 'Create PDF reports for all students', icon: 'doc' as IconName },
    { title: 'Maple Learning Passport', body: 'Issue cryptographically signed transcripts', icon: 'shield' as IconName },
    { title: 'Notify Parents', body: 'Send via app, email or SMS', icon: 'bell' as IconName },
  ],
  preview: {
    school: 'Maple Global Online School',
    title: 'TERM 1 REPORT CARD',
    year: 'ACADEMIC YEAR 2026',
    student: [
      ['Student Name:', 'Daniel Okello'],
      ['Admission No:', 'P1A-001'],
      ['Class:', 'Primary 1A'],
      ['Term:', 'Term 1, 2026'],
    ] as const,
    rows: [
      ['English', '84', 'A', 'Very good progress'],
      ['Mathematics', '86', 'A', 'Consistent and strong'],
      ['Science', '78', 'B', 'Good understanding'],
      ['Social Studies', '80', 'A', 'Shows great interest'],
      ['Christian Religious Ed.', '92', 'A', 'Excellent'],
      ['Creative Arts', '76', 'B', 'Good effort'],
    ] as const,
    average: ['83', 'A'] as const,
    position: '3 / 42',
    comment: 'Daniel has shown excellent effort and steady improvement this term. Keep up the great work!',
    teacher: { name: 'Mrs. A. Namaganda', date: 'Oct 18, 2026', sig: require('./images/rc-sig-teacher.png') as Photo },
    head: { name: 'Mr. K. Tumusiime', date: 'Oct 18, 2026', sig: require('./images/rc-sig-head.png') as Photo },
    seal: require('./images/rc-seal.png') as Photo,
    qr: require('./images/rc-qr.png') as Photo,
    verification: 'MLP-2026-T1-P1A-001',
  },
  activity: [
    { title: 'Primary 1A marks submitted', when: 'Today, 10:24 AM', icon: 'check' as IconName, tone: 'green' as Tone },
    { title: 'Moderation completed', when: 'Today, 3:15 PM', icon: 'check' as IconName, tone: 'green' as Tone },
    { title: 'Reports published', when: 'Oct 18, 2026, 9:00 AM', icon: 'megaphone' as IconName, tone: 'purple' as Tone },
  ],
};

/* ─── Library ─── */

export type ResourceKind = 'Textbook' | 'Past Paper' | 'Lesson Plan' | 'Scheme of Work' | 'Video' | 'Question Bank';
export interface Resource {
  id: string;
  title: string;
  format: string;
  size: string;
  kind: ResourceKind;
  cover: Photo;
  owner?: string;
}

const covers = [
  require('./images/lib-cover-1.png') as Photo,
  require('./images/lib-cover-2.png') as Photo,
  require('./images/lib-cover-3.png') as Photo,
  require('./images/lib-cover-4.png') as Photo,
  require('./images/lib-cover-5.png') as Photo,
  require('./images/lib-cover-6.png') as Photo,
  require('./images/lib-cover-7.png') as Photo,
  require('./images/lib-cover-8.png') as Photo,
];

export interface LibraryRequest {
  id: string;
  direction: 'incoming' | 'outgoing';
  resource: string;
  kind: ResourceKind;
  school: string;
  status: 'With Maple Admin' | 'Awaiting your reply' | 'Approved' | 'Declined';
  when: string;
  thread: readonly { from: string; text: string; when: string }[];
}

export const library = {
  school: 'Kampala Hill School',
  stats: [
    { value: '1,842', label: 'Total Resources', icon: 'book' as IconName, tone: 'blue' as Tone },
    { value: '432', label: 'Textbooks', icon: 'book' as IconName, tone: 'purple' as Tone },
    { value: '1,248', label: 'Past Papers', icon: 'doc' as IconName, tone: 'green' as Tone },
    { value: '356', label: 'Lesson Plans', icon: 'clipboard' as IconName, tone: 'orange' as Tone },
    { value: '128', label: 'Schemes of Work', icon: 'calendar' as IconName, tone: 'red' as Tone },
    { value: '213', label: 'Department Resources', icon: 'folder' as IconName, tone: 'blue' as Tone },
  ],
  folders: [
    { name: 'Primary', count: '6 folders', tone: 'blue' as Tone },
    { name: 'Lower Secondary', count: '8 folders', tone: 'blue' as Tone },
    { name: 'Upper Secondary', count: '6 folders', tone: 'blue' as Tone },
    { name: 'Past Papers', count: '12 folders', tone: 'red' as Tone },
    { name: 'Lesson Plans', count: '8 folders', tone: 'orange' as Tone },
    { name: 'Schemes of Work', count: '5 folders', tone: 'red' as Tone },
    { name: 'Department', count: '7 folders', tone: 'blue' as Tone },
    { name: 'Teacher Resources', count: '4 folders', tone: 'blue' as Tone },
  ],
  resources: [
    { id: 'r1', title: 'Primary 5 Mathematics Learner’s Book', format: 'PDF', size: '12.5 MB', kind: 'Textbook', cover: covers[0] },
    { id: 'r2', title: 'P7 English Past Paper 2024', format: 'PDF', size: '4.2 MB', kind: 'Past Paper', cover: covers[1] },
    { id: 'r3', title: 'LS Science Textbook Form 1', format: 'PDF', size: '18.3 MB', kind: 'Textbook', cover: covers[2] },
    { id: 'r4', title: 'Primary 3 English Lesson Plan - Term 1', format: 'DOC', size: '1.1 MB', kind: 'Lesson Plan', cover: covers[3] },
    { id: 'r5', title: 'O’Level Mathematics Past Papers (2020-2024)', format: 'PDF', size: '28.4 MB', kind: 'Past Paper', cover: covers[4] },
    { id: 'r6', title: 'Primary School Schemes of Work', format: 'XLSX', size: '2.3 MB', kind: 'Scheme of Work', cover: covers[5] },
    { id: 'r7', title: 'A’Level Biology Student’s Book', format: 'PDF', size: '16.7 MB', kind: 'Textbook', cover: covers[6] },
    { id: 'r8', title: 'CRE Lesson Plans Primary 1 – 7', format: 'PDF', size: '3.6 MB', kind: 'Lesson Plan', cover: covers[7] },
  ] as Resource[],
  /** Maple's public library: free resources any school can recommend to its learners. */
  publicResources: [
    { id: 'p1', title: 'UNEB PLE Mathematics Revision Pack', format: 'PDF', size: '9.8 MB', kind: 'Question Bank', cover: covers[1], owner: 'Maple Public Library' },
    { id: 'p2', title: 'Fractions Made Simple (Video Series)', format: 'MP4', size: '12 videos', kind: 'Video', cover: covers[0], owner: 'Maple Public Library' },
    { id: 'p3', title: 'O’Level Chemistry Practicals', format: 'PDF', size: '14.1 MB', kind: 'Textbook', cover: covers[2], owner: 'Maple Public Library' },
    { id: 'p4', title: 'A’Level Biology Past Papers 2018–2025', format: 'PDF', size: '31.2 MB', kind: 'Past Paper', cover: covers[6], owner: 'Maple Public Library' },
  ] as Resource[],
  /** Resources other Maple schools hold; this school can ask to use them. */
  networkResources: [
    { id: 'n1', title: 'S4 Physics Revision Videos', format: 'MP4', size: '24 videos', kind: 'Video', cover: covers[2], owner: 'Kisubi High School' },
    { id: 'n2', title: 'P7 Mock Examinations 2025', format: 'PDF', size: '6.4 MB', kind: 'Past Paper', cover: covers[1], owner: 'Green Valley School' },
    { id: 'n3', title: 'Lower Secondary Literature Set Books', format: 'PDF', size: '22.0 MB', kind: 'Textbook', cover: covers[4], owner: 'Sunrise Secondary' },
    { id: 'n4', title: 'S6 Economics Question Bank', format: 'PDF', size: '5.1 MB', kind: 'Question Bank', cover: covers[3], owner: 'St. Mary’s College' },
  ] as Resource[],
  requests: [
    {
      id: 'q1',
      direction: 'outgoing',
      resource: 'S4 Physics Revision Videos',
      kind: 'Video',
      school: 'Kisubi High School',
      status: 'With Maple Admin',
      when: 'Oct 21, 2026',
      thread: [
        { from: 'Kampala Hill School', text: 'We would like our S4 classes to use your Physics revision videos this term.', when: 'Oct 21, 10:02 AM' },
        { from: 'Maple Admin', text: 'Thanks. I’ve asked Kisubi High School to confirm the licence terms for 12 months.', when: 'Oct 21, 2:40 PM' },
        { from: 'Kisubi High School', text: 'Happy to share for this academic year, view-only for learners.', when: 'Oct 22, 9:15 AM' },
      ],
    },
    {
      id: 'q2',
      direction: 'incoming',
      resource: 'O’Level Mathematics Past Papers (2020-2024)',
      kind: 'Past Paper',
      school: 'Sunrise Secondary',
      status: 'Awaiting your reply',
      when: 'Oct 23, 2026',
      thread: [
        { from: 'Sunrise Secondary', text: 'Could our S3 and S4 learners access your O’Level Mathematics past papers?', when: 'Oct 23, 8:30 AM' },
        { from: 'Maple Admin', text: 'Forwarding this request. You can approve it with an end date, or decline.', when: 'Oct 23, 11:00 AM' },
      ],
    },
    {
      id: 'q3',
      direction: 'outgoing',
      resource: 'P7 Mock Examinations 2025',
      kind: 'Past Paper',
      school: 'Green Valley School',
      status: 'Approved',
      when: 'Oct 12, 2026',
      thread: [
        { from: 'Kampala Hill School', text: 'Requesting P7 mock papers for our candidate classes.', when: 'Oct 12, 9:00 AM' },
        { from: 'Maple Admin', text: 'Approved by Green Valley School until Dec 18, 2026.', when: 'Oct 13, 4:10 PM' },
      ],
    },
  ] as LibraryRequest[],
  storage: { used: '3.4 GB', total: '5 GB', percent: 68 },
  sharing: [
    { title: 'All Teachers', body: 'Share with all teachers', icon: 'people' as IconName, tone: 'blue' as Tone },
    { title: 'By Department', body: 'Mathematics, Science, English...', icon: 'folder' as IconName, tone: 'orange' as Tone },
    { title: 'Specific Teachers', body: 'Select individual teachers', icon: 'person' as IconName, tone: 'green' as Tone },
    { title: 'Students (Read Only)', body: 'Share with specific classes', icon: 'people' as IconName, tone: 'blue' as Tone },
    { title: 'Parents (Read Only)', body: 'Share learning resources', icon: 'people' as IconName, tone: 'purple' as Tone },
  ],
  phoneMenu: [
    { title: 'Textbooks', count: '432 resources', icon: 'book' as IconName, tone: 'purple' as Tone },
    { title: 'Past Papers', count: '1,248 resources', icon: 'doc' as IconName, tone: 'blue' as Tone },
    { title: 'Lesson Plans', count: '356 resources', icon: 'clipboard' as IconName, tone: 'green' as Tone },
    { title: 'Schemes of Work', count: '128 resources', icon: 'calendar' as IconName, tone: 'blue' as Tone },
    { title: 'Department Resources', count: '213 resources', icon: 'folder' as IconName, tone: 'orange' as Tone },
    { title: 'Multimedia', count: '89 resources', icon: 'play' as IconName, tone: 'red' as Tone },
    { title: 'My Uploads', count: '67 resources', icon: 'upload' as IconName, tone: 'blue' as Tone },
    { title: 'Shared with Teachers', count: '412 resources', icon: 'people' as IconName, tone: 'blue' as Tone },
  ],
  recommendTo: ['Primary 5A', 'Primary 5B', 'S1 East', 'S4 West'],
};

/* ─── Fees & Finance ─── */

export const fees = {
  stats: [
    { value: 'UGX 185,600,000', short: 'UGX 185.6M', label: 'Total Collected', sub: '78% of target', subTone: 'green' as Tone, icon: 'wallet' as IconName, tone: 'green' as Tone, progress: 0.78 },
    { value: 'UGX 41,200,000', short: 'UGX 41.2M', label: 'Outstanding', sub: '17% of target', subTone: 'red' as Tone, icon: 'doc' as IconName, tone: 'red' as Tone, progress: 0.17 },
    { value: '213', short: '213', label: 'Students with Arrears', sub: '17%', subTone: 'orange' as Tone, icon: 'person' as IconName, tone: 'orange' as Tone, progress: 0.17 },
    { value: '1,248', short: '1,248', label: 'Total Students', sub: '100%', subTone: 'blue' as Tone, icon: 'people' as IconName, tone: 'blue' as Tone, progress: 1 },
  ],
  tabs: ['Overview', 'Fee Structures', 'Scholarships & Bursaries', 'Payments', 'Arrears', 'Reports'],
  trend: { labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], collected: [18, 26, 30, 34, 38, 44], outstanding: [10, 9, 10, 11, 9, 12] },
  status: { full: 975, partial: 60, arrears: 213 },
  quick: [
    { label: 'Configure Fee Structures', icon: 'settings' as IconName },
    { label: 'Manage Scholarships', icon: 'cap' as IconName },
    { label: 'Set Installment Deadlines', icon: 'calendar' as IconName },
    { label: 'Send Arrears Reminders', icon: 'chat' as IconName },
    { label: 'Record Manual Payment', icon: 'wallet' as IconName },
    { label: 'Generate Fee Statements', icon: 'doc' as IconName },
  ],
  structures: [
    { n: 1, item: 'Tuition Fee', grade: 'Primary 1', amount: 450000, freq: 'Termly', to: 'All Students' },
    { n: 2, item: 'Boarding Fee', grade: 'Secondary 1', amount: 1200000, freq: 'Termly', to: 'Boarding Students' },
    { n: 3, item: 'Lunch Fee', grade: 'Primary 1', amount: 150000, freq: 'Termly', to: 'All Students' },
    { n: 4, item: 'Examination Fee', grade: 'Primary 7', amount: 200000, freq: 'Termly', to: 'All Students' },
    { n: 5, item: 'Development Fee', grade: 'All Grades', amount: 100000, freq: 'Termly', to: 'All Students' },
    { n: 6, item: 'ICT Fee', grade: 'Secondary', amount: 250000, freq: 'Termly', to: 'All Students' },
  ],
  scholarships: [
    { name: 'Bright Futures Bursary', covers: '50% tuition', learners: 24, budget: 'UGX 5,400,000' },
    { name: 'Sports Scholarship', covers: '100% tuition', learners: 8, budget: 'UGX 3,600,000' },
    { name: 'Sibling Discount', covers: '10% all fees', learners: 61, budget: 'UGX 4,120,000' },
  ],
  installments: [
    { n: 1, title: 'First Installment', due: 'Due: Jan 15, 2026', pct: '40%', tone: 'red' as Tone },
    { n: 2, title: 'Second Installment', due: 'Due: Feb 28, 2026', pct: '30%', tone: 'orange' as Tone },
    { n: 3, title: 'Third Installment', due: 'Due: Apr 15, 2026', pct: '20%', tone: 'purple' as Tone },
    { n: 4, title: 'Final Installment', due: 'Due: May 31, 2026', pct: '10%', tone: 'blue' as Tone },
  ],
  payments: [
    { n: 1, date: 'Oct 10, 2026', name: 'Daniel Okello', grade: 'P1A', amount: 450000, method: 'Mobile Money', ref: 'MTN123456', when: 'Today, 10:24 AM', cls: 'Primary 1A' },
    { n: 2, date: 'Oct 10, 2026', name: 'Sarah Nabwire', grade: 'P3', amount: 320000, method: 'Bank Transfer', ref: 'UTB789012', when: 'Today, 9:15 AM', cls: 'Primary 3' },
    { n: 3, date: 'Oct 09, 2026', name: 'James Opio', grade: 'P5', amount: 600000, method: 'Mobile Money', ref: 'AIRTEL34567', when: 'Yesterday', cls: 'Primary 5' },
    { n: 4, date: 'Oct 08, 2026', name: 'Grace Akol', grade: 'S2', amount: 1200000, method: 'Bank Transfer', ref: 'UTB888901', when: 'Oct 08', cls: 'Senior 2' },
    { n: 5, date: 'Oct 08, 2026', name: 'Peter Atim', grade: 'P4', amount: 300000, method: 'Cash', ref: 'RCPT-00452', when: 'Oct 08', cls: 'Primary 4' },
  ],
  arrears: [
    { n: 1, name: 'Ruth Adong', grade: 'P2', amount: 450000, days: 45, level: 'High' },
    { n: 2, name: 'John Otim', grade: 'P6', amount: 300000, days: 32, level: 'High' },
    { n: 3, name: 'Mary Achieng', grade: 'S1', amount: 600000, days: 28, level: 'Medium' },
    { n: 4, name: 'Grace Akol', grade: 'P4', amount: 200000, days: 20, level: 'Medium' },
    { n: 5, name: 'James Opio', grade: 'P5', amount: 150000, days: 15, level: 'Low' },
  ],
  phoneMenu: [
    { title: 'Fee Structures', body: 'Set tuition, boarding, exams, etc.', icon: 'settings' as IconName, tone: 'blue' as Tone },
    { title: 'Scholarships & Bursaries', body: 'Manage student financial support', icon: 'cap' as IconName, tone: 'green' as Tone },
    { title: 'Installment Schedules', body: 'Set payment deadlines', icon: 'calendar' as IconName, tone: 'purple' as Tone },
    { title: 'Payment Records', body: 'View and manage all payments', icon: 'wallet' as IconName, tone: 'orange' as Tone },
    { title: 'Automated Reminders', body: 'WhatsApp, SMS and Email', icon: 'chat' as IconName, tone: 'blue' as Tone },
    { title: 'Reports', body: 'Collections, arrears, ledgers', icon: 'chart' as IconName, tone: 'blue' as Tone },
  ],
};

/* ─── Student Fee Ledger ─── */

export interface LedgerTx {
  n: number;
  date: string;
  desc: string;
  type: 'Balance' | 'Invoice' | 'Adjustment' | 'Payment' | 'Reversal';
  method: string;
  ref: string;
  debit: number;
  credit: number;
  balance: number;
  by: string;
}

export const ledger = {
  student: { name: 'Daniel Okello', adm: 'P1A-001', code: 'ADM00123', cls: 'Primary 1A', type: 'Day Scholar', avatar: face.daniel },
  totals: { fees: 1200000, paid: 920000, outstanding: 280000, adjusted: 100000, refunded: 0 },
  tabs: ['Ledger', 'Invoices & Receipts', 'Payments', 'Adjustments', 'Statements', 'Reconciliation', 'Audit Log'],
  breakdown: [
    { n: 1, item: 'Tuition Fee', amount: 450000, paid: 450000, status: 'Paid' },
    { n: 2, item: 'Boarding Fee', amount: 0, paid: 0, status: 'N/A' },
    { n: 3, item: 'Lunch Fee', amount: 150000, paid: 150000, status: 'Paid' },
    { n: 4, item: 'Examination Fee', amount: 200000, paid: 120000, status: 'Partial' },
    { n: 5, item: 'Development Fee', amount: 100000, paid: 100000, status: 'Paid' },
    { n: 6, item: 'ICT Fee', amount: 250000, paid: 100000, status: 'Partial' },
    { n: 7, item: 'Activity Fee', amount: 50000, paid: 0, status: 'Unpaid' },
  ],
  trend: { labels: ['Aug', 'Sep', 'Oct', 'Nov', 'Dec'], payments: [130, 280, 360, 420, 420], outstanding: [200, 190, 260, 280, 190] },
  transactions: [
    { n: 1, date: 'Aug 1, 2026', desc: 'Opening Balance', type: 'Balance', method: '-', ref: '-', debit: 0, credit: 0, balance: 0, by: 'System' },
    { n: 2, date: 'Sep 1, 2026', desc: 'Invoice INV-001 (Term 1)', type: 'Invoice', method: '-', ref: 'INV-001', debit: 1200000, credit: 0, balance: -1200000, by: 'System' },
    { n: 3, date: 'Sep 5, 2026', desc: 'Partial Scholarship', type: 'Adjustment', method: '-', ref: 'ADJ-001', debit: 0, credit: 100000, balance: -1100000, by: 'Bursar' },
    { n: 4, date: 'Oct 5, 2026', desc: 'Bank Transfer Payment', type: 'Payment', method: 'Bank Transfer', ref: 'UTB789012', debit: 0, credit: 300000, balance: -800000, by: 'System' },
    { n: 5, date: 'Oct 10, 2026', desc: 'Mobile Money Payment', type: 'Payment', method: 'MTN Mobile Money', ref: 'MTN123456', debit: 0, credit: 450000, balance: -350000, by: 'System' },
    { n: 6, date: 'Oct 15, 2026', desc: 'ICT Fee Payment', type: 'Payment', method: 'Card (VISA)', ref: 'VISA998877', debit: 0, credit: 100000, balance: -250000, by: 'System' },
    { n: 7, date: 'Oct 20, 2026', desc: 'Examination Fee Payment', type: 'Payment', method: 'Airtel Money', ref: 'AIRTEL34567', debit: 0, credit: 120000, balance: -130000, by: 'Bursar' },
  ] as LedgerTx[],
  phoneRecent: [
    { title: 'Mobile Money Payment', body: 'MTN • Ref: MTN123456', when: 'Oct 10, 2026', amount: '+ 450,000', type: 'Payment', tone: 'orange' as Tone, icon: 'wallet' as IconName },
    { title: 'Bank Transfer', body: 'UTB789012', when: 'Oct 5, 2026', amount: '+ 300,000', type: 'Payment', tone: 'green' as Tone, icon: 'doc' as IconName },
    { title: 'Invoice INV-001', body: 'Term 1 Tuition', when: 'Sep 1, 2026', amount: '- 1,200,000', type: 'Invoice', tone: 'blue' as Tone, icon: 'doc' as IconName },
    { title: 'Adjustment', body: 'Partial scholarship', when: 'Sep 1, 2026', amount: '- 100,000', type: 'Adjustment', tone: 'purple' as Tone, icon: 'megaphone' as IconName },
  ],
};

/* ─── Accounting ─── */

export const accounting = {
  tabs: ['Overview', 'Chart of Accounts', 'Journal Entries', 'Accounts Payable', 'Bank Reconciliation', 'Financial Reports'],
  stats: [
    { value: 'UGX 185,600,000', short: 'UGX 185.6M', label: 'Total Income', sub: '↑ 12% from last term', subTone: 'green' as Tone, icon: 'plus' as IconName, tone: 'green' as Tone },
    { value: 'UGX 123,400,000', short: 'UGX 123.4M', label: 'Total Expenses', sub: '↑ 5% from last term', subTone: 'red' as Tone, icon: 'minus' as IconName, tone: 'red' as Tone },
    { value: 'UGX 62,200,000', short: 'UGX 62.2M', label: 'Surplus / Deficit', sub: '↑ 28% from last term', subTone: 'green' as Tone, icon: 'chart' as IconName, tone: 'blue' as Tone },
    { value: '92%', short: '92%', label: 'Budget Utilization', sub: 'On Track', subTone: 'green' as Tone, icon: 'timer' as IconName, tone: 'green' as Tone, progress: 0.92 },
  ],
  trend: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
    income: [120, 210, 170, 230, 200, 240, 250, 190, 230, 210],
    expenses: [90, 110, 120, 100, 130, 110, 120, 130, 110, 120],
  },
  balances: [
    { label: 'Current Assets', pct: 38, color: '#22A55A' },
    { label: 'Fixed Assets', pct: 42, color: '#1E6BF0' },
    { label: 'Current Liabilities', pct: 12, color: '#F7A21B' },
    { label: 'Long-term Liabilities', pct: 5, color: '#8B3CF0' },
    { label: 'Equity', pct: 3, color: '#5B45D8' },
  ],
  accounts: [
    { code: '1000', name: 'Cash & Bank', type: 'Asset', balance: 24500000 },
    { code: '1100', name: 'Fees Receivable', type: 'Asset', balance: 41200000 },
    { code: '1500', name: 'Buildings & Equipment', type: 'Asset', balance: 202600000 },
    { code: '2000', name: 'Accounts Payable', type: 'Liability', balance: 9700000 },
    { code: '3000', name: 'Accumulated Fund', type: 'Equity', balance: 14500000 },
    { code: '4000', name: 'Tuition Income', type: 'Income', balance: 151200000 },
    { code: '5000', name: 'Salaries & Wages', type: 'Expense', balance: 78400000 },
  ],
  journal: [
    { id: 'JE-1023', date: 'Oct 10, 2026', desc: 'School Fees Collection', debit: 450000, credit: 450000, status: 'Posted' },
    { id: 'JE-1022', date: 'Oct 09, 2026', desc: 'Stationery Purchase', debit: 1200000, credit: 1200000, status: 'Posted' },
    { id: 'JE-1021', date: 'Oct 08, 2026', desc: 'Bank Transfer', debit: 3000000, credit: 3000000, status: 'Posted' },
    { id: 'JE-1020', date: 'Oct 07, 2026', desc: 'Utility Bill (UMEME)', debit: 850000, credit: 850000, status: 'Posted' },
    { id: 'JE-1019', date: 'Oct 06, 2026', desc: 'Petty Cash Replenishment', debit: 200000, credit: 200000, status: 'Posted' },
  ],
  bills: [
    { id: 'B-0013', vendor: 'ABC Stationery', amount: 2500000, due: 'Oct 15, 2026', status: 'Pending' },
    { id: 'B-0012', vendor: 'UMEME', amount: 850000, due: 'Oct 18, 2026', status: 'Pending' },
    { id: 'B-0011', vendor: 'Safe Water Ltd', amount: 1200000, due: 'Oct 20, 2026', status: 'Approved' },
    { id: 'B-0010', vendor: 'School Meals Co.', amount: 3400000, due: 'Oct 25, 2026', status: 'Pending' },
    { id: 'B-0009', vendor: 'ICT Solutions', amount: 1750000, due: 'Oct 28, 2026', status: 'Draft' },
  ],
  reports: [
    { title: 'Trial Balance', body: 'All accounts summary', icon: 'doc' as IconName, tone: 'blue' as Tone },
    { title: 'Income & Expenditure', body: 'Revenue and expense report', icon: 'megaphone' as IconName, tone: 'purple' as Tone },
    { title: 'Balance Sheet', body: 'Assets, liabilities and equity', icon: 'doc' as IconName, tone: 'green' as Tone },
    { title: 'General Ledger', body: 'Detailed account activity', icon: 'doc' as IconName, tone: 'orange' as Tone },
    { title: 'Cash Flow Statement', body: 'Money in and out', icon: 'plus' as IconName, tone: 'red' as Tone },
    { title: 'Budget vs Actual', body: 'Compare with budget', icon: 'doc' as IconName, tone: 'blue' as Tone },
  ],
  bank: { accounts: ['Stanbic Bank – Main Account', 'Centenary Bank – Fees Account'], months: ['Oct, 2026', 'Sep, 2026'], bank: 24500000, book: 24200000, unreconciled: 300000, pct: 95 },
  phoneTiles: [
    { label: 'Chart of Accounts', icon: 'plus' as IconName, tone: 'blue' as Tone },
    { label: 'Journal Entries', icon: 'doc' as IconName, tone: 'blue' as Tone },
    { label: 'Accounts Payable', icon: 'wallet' as IconName, tone: 'purple' as Tone },
    { label: 'Bank Reconciliation', icon: 'campus' as IconName, tone: 'green' as Tone },
    { label: 'Income & Expenditure', icon: 'chart' as IconName, tone: 'orange' as Tone },
    { label: 'Trial Balance', icon: 'doc' as IconName, tone: 'blue' as Tone },
    { label: 'Balance Sheet', icon: 'doc' as IconName, tone: 'green' as Tone },
    { label: 'All Reports', icon: 'doc' as IconName, tone: 'purple' as Tone },
  ],
  recent: [
    { title: 'School Fees Collection', body: 'P1A – Daniel Okello', when: 'Oct 10, 2026', amount: '+ UGX 450,000', in: true, icon: 'arrowRight' as IconName },
    { title: 'Supplier Payment', body: 'ABC Stationery', when: 'Oct 9, 2026', amount: '- UGX 1,200,000', in: false, icon: 'arrowLeft' as IconName },
    { title: 'Bank Transfer', body: 'Stanbic Bank', when: 'Oct 8, 2026', amount: '+ UGX 3,000,000', in: true, icon: 'swap' as IconName },
    { title: 'Utility Bill Payment', body: 'UMEME', when: 'Oct 7, 2026', amount: '- UGX 850,000', in: false, icon: 'bolt' as IconName },
  ],
  approvals: [
    { title: '5 Vendor Bills', body: 'Total: UGX 7,450,000', icon: 'clock' as IconName, tone: 'orange' as Tone },
    { title: '3 Journal Adjustments', body: 'Total: UGX 1,200,000', icon: 'plus' as IconName, tone: 'red' as Tone },
  ],
};

/* ─── Settings ─── */

export type RoleName = 'Principal' | 'Deputy Head (DOS)' | 'Bursar' | 'Teacher' | 'Safeguarding Lead' | 'Accounts Assistant' | 'Administrative Staff';

export const ROLE_TONE: Readonly<Record<RoleName, Tone>> = {
  Principal: 'blue',
  'Deputy Head (DOS)': 'red',
  Bursar: 'purple',
  Teacher: 'blue',
  'Safeguarding Lead': 'red',
  'Accounts Assistant': 'red',
  'Administrative Staff': 'grey',
};

export const settings = {
  tabs: ['Users & Roles', 'Permissions', 'Subscription & Billing', 'Audit Log', 'School Profile', 'System Settings'],
  users: [
    { n: 1, name: 'Mary Namaganda', email: 'mary@mapleschool.ac.ug', role: 'Principal' as RoleName, status: 'Active', last: 'Today, 10:24 AM', avatar: face.mary as Photo | null },
    { n: 2, name: 'Peter Okello', email: 'peter@mapleschool.ac.ug', role: 'Deputy Head (DOS)' as RoleName, status: 'Active', last: 'Today, 9:15 AM', avatar: face.okello as Photo | null },
    { n: 3, name: 'Ruth Achieng', email: 'ruth@mapleschool.ac.ug', role: 'Bursar' as RoleName, status: 'Active', last: 'Today, 8:30 AM', avatar: face.esther as Photo | null },
    { n: 4, name: 'John Otim', email: 'john@mapleschool.ac.ug', role: 'Teacher' as RoleName, status: 'Active', last: 'Today, 8:12 AM', avatar: face.john as Photo | null },
    { n: 5, name: 'Sarah Nabwire', email: 'sarah@mapleschool.ac.ug', role: 'Safeguarding Lead' as RoleName, status: 'Active', last: 'Oct 18, 2026', avatar: face.sarah as Photo | null },
    { n: 6, name: 'Daniel Atim', email: 'daniel@mapleschool.ac.ug', role: 'Teacher' as RoleName, status: 'Active', last: 'Oct 18, 2026', avatar: face.kato as Photo | null },
    { n: 7, name: 'Grace Akol', email: 'grace@mapleschool.ac.ug', role: 'Teacher' as RoleName, status: 'Active', last: 'Oct 17, 2026', avatar: face.nakato as Photo | null },
    { n: 8, name: 'James Opio', email: 'james@mapleschool.ac.ug', role: 'Accounts Assistant' as RoleName, status: 'Active', last: 'Oct 17, 2026', avatar: null as Photo | null },
    { n: 9, name: 'Peter Ajok', email: 'peter.ajok@mapleschool.ac.ug', role: 'Teacher' as RoleName, status: 'Pending', last: 'Oct 15, 2026', avatar: null as Photo | null },
    { n: 10, name: 'Annette Lanyero', email: 'annette@mapleschool.ac.ug', role: 'Administrative Staff' as RoleName, status: 'Active', last: 'Oct 15, 2026', avatar: face.grace as Photo | null },
  ],
  roles: ['Bursar', 'Principal', 'Deputy Head (DOS)', 'Teacher', 'Safeguarding Lead', 'Accounts Assistant'],
  /** People offered in the activity log's user filter. */
  activityUsers: ['Mary N.', 'Bursar'],
  permissionAreas: ['Academic', 'Finance', 'Students', 'Reports', 'Communication', 'Settings'],
  permissions: {
    Finance: [
      ['View fee structures and collection reports', true],
      ['Record and confirm student payments', true],
      ['Process refunds and adjustments', true],
      ['Manage vendor payments (accounts payable)', true],
      ['Access accounting reports', true],
      ['Manage bank reconciliation', true],
      ['Edit chart of accounts', false],
      ['Manage staff payroll', false],
    ],
    Academic: [
      ['View marks and report cards', true],
      ['Moderate and approve marks', false],
      ['Edit the timetable', false],
      ['Publish report cards', false],
    ],
    Students: [
      ['View student profiles', true],
      ['Edit student records', false],
      ['Import rosters', false],
    ],
    Reports: [
      ['View finance reports', true],
      ['Export reports', true],
    ],
    Communication: [
      ['Send fee reminders to parents', true],
      ['Send school announcements', false],
    ],
    Settings: [
      ['Manage users', false],
      ['Change school subscription', false],
    ],
  } as Readonly<Record<string, readonly (readonly [string, boolean])[]>>,
  plan: {
    name: 'Maple Growth',
    until: 'Renews Dec 10, 2026',
    price: 'UGX 3,500,000 / term',
    students: 486,
    limit: 700,
    features: ['Up to 700 learners (486 used)', 'Complete digital school, live classes and library', 'Full double-entry accounting', 'Admissions campaigns & analytics', 'School Network listing', 'Priority support'],
    next: 'Dec 10, 2026',
    amount: 'UGX 3,500,000',
    method: 'MTN Mobile Money (****3456)',
  },
  log: [
    { n: 1, when: 'Oct 18, 10:24 AM', user: 'Mary N.', action: 'Updated student record', detail: 'Daniel Okello (P1A)', ip: '41.220.15.8' },
    { n: 2, when: 'Oct 18, 09:15 AM', user: 'Peter O.', action: 'Created new class', detail: 'Primary 2B', ip: '41.220.15.8' },
    { n: 3, when: 'Oct 18, 08:30 AM', user: 'Bursar', action: 'Approved payment', detail: 'Supplier: ABC Stationery', ip: '41.220.15.8' },
    { n: 4, when: 'Oct 17, 04:12 PM', user: 'John O.', action: 'Updated timetable', detail: 'Classroom 3A', ip: '41.220.15.8' },
    { n: 5, when: 'Oct 17, 02:11 PM', user: 'Sarah N.', action: 'Generated report', detail: 'Term 1 attendance', ip: '41.220.15.8' },
    { n: 6, when: 'Oct 17, 11:05 AM', user: 'Grace A.', action: 'Added new user', detail: 'Teacher - Peter Ajok', ip: '41.220.15.8' },
    { n: 7, when: 'Oct 16, 03:45 PM', user: 'James O.', action: 'Exported ledger', detail: 'Oct 2026 CSV', ip: '41.220.15.8' },
    { n: 8, when: 'Oct 16, 10:20 AM', user: 'System', action: 'Login successful', detail: 'Mary N.', ip: '41.220.15.8' },
  ],
  phoneMenu: [
    { title: 'Users & Roles', body: 'Manage staff, roles and permissions', icon: 'people' as IconName, tone: 'blue' as Tone },
    { title: 'Subscription & Billing', body: 'View plan, billing and payment method', icon: 'wallet' as IconName, tone: 'green' as Tone },
    { title: 'Audit Log', body: 'Track all user activities', icon: 'doc' as IconName, tone: 'purple' as Tone },
    { title: 'School Profile', body: 'Update school details and preferences', icon: 'columns' as IconName, tone: 'blue' as Tone },
    { title: 'Academic Settings', body: 'Years, terms, grades and grading', icon: 'cap' as IconName, tone: 'green' as Tone },
    { title: 'Notification Settings', body: 'Email, SMS and WhatsApp preferences', icon: 'megaphone' as IconName, tone: 'red' as Tone },
    { title: 'Integrations', body: 'Connect payment, accounting and more', icon: 'sync' as IconName, tone: 'blue' as Tone },
  ],
  activity: [
    { title: 'Mary N. updated a student record', when: 'Today, 10:24 AM', icon: 'people' as IconName, tone: 'blue' as Tone },
    { title: 'John A. created a new class', when: 'Today, 9:15 AM', icon: 'people' as IconName, tone: 'purple' as Tone },
    { title: 'Bursar approved a supplier payment', when: 'Today, 8:30 AM', icon: 'doc' as IconName, tone: 'green' as Tone },
  ],
};

/* ─── Attendance & QR ─── */

export type ScanResult = 'ok' | 'late' | 'denied';
export type ScanMode = 'Gate Entry' | 'Gate Exit' | 'Lesson Check';
export interface ScanPerson {
  id: string;
  name: string;
  detail: string;
  kind: 'Student' | 'Teacher';
  avatar: Photo;
  result: ScanResult;
  message: string;
}

export const attendance = {
  date: 'Tue, Mar 10, 2026',
  stats: [
    { value: '1,248', label: 'Students', sub: 'Present: 1,181 (94.6%)', short: '94.6% present', subTone: 'green' as Tone, icon: 'people' as IconName, tone: 'green' as Tone },
    { value: '87', label: 'Teachers', sub: 'Present: 85 (97.7%)', short: '97.7% present', subTone: 'green' as Tone, icon: 'person' as IconName, tone: 'blue' as Tone },
    { value: '28', label: 'Late Arrivals', sub: 'Students: 23 | Teachers: 5', short: '23 pupils, 5 staff', icon: 'clock' as IconName, tone: 'orange' as Tone },
    { value: '5', label: 'Absent', sub: 'Students: 5 | Teachers: 0', short: '5 pupils, 0 staff', icon: 'alert' as IconName, tone: 'red' as Tone },
    { value: '1,258', label: 'Total Check-ins', sub: 'Gate + Lessons + Exit', short: 'Gate, lesson, exit', icon: 'bolt' as IconName, tone: 'purple' as Tone },
    { value: '99.2%', label: 'Gate Check-in Rate', sub: '↑ +1.4% vs last week', short: '↑ +1.4% this week', subTone: 'green' as Tone, icon: 'shield' as IconName, tone: 'green' as Tone },
  ],
  overview: { present: 1181, late: 23, absent: 5, total: 1248, rate: '94.6%' },
  trend: { labels: ['Feb 10', 'Feb 17', 'Feb 24', 'Mar 3', 'Mar 10'], students: [94.4, 94.9, 95.2, 94.6, 95.1], teachers: [97.5, 97.8, 98.0, 97.6, 97.7] },
  punctuality: [
    { who: 'Students', pct: 95.8, delta: '↑ +2.1%', tone: 'green' as Tone, icon: 'person' as IconName },
    { who: 'Teachers', pct: 98.3, delta: '↑ +0.8%', tone: 'blue' as Tone, icon: 'person' as IconName },
  ],
  byClass: [
    { grade: 'Primary 1', enrolled: 162, present: 156, late: 4, absent: 2, rate: '96.3%' },
    { grade: 'Primary 2', enrolled: 148, present: 140, late: 6, absent: 2, rate: '94.6%' },
    { grade: 'Primary 3', enrolled: 155, present: 147, late: 5, absent: 3, rate: '94.8%' },
    { grade: 'Primary 4', enrolled: 142, present: 137, late: 3, absent: 2, rate: '96.5%' },
    { grade: 'Primary 5', enrolled: 138, present: 129, late: 6, absent: 3, rate: '93.5%' },
    { grade: 'Senior 1', enrolled: 220, present: 208, late: 7, absent: 5, rate: '94.5%' },
  ],
  teachers: [
    { status: 'Present (On Time)', count: 80, pct: '92.0%', value: 0.92, tone: 'green' as Tone, icon: 'check' as IconName },
    { status: 'Present (Late)', count: 5, pct: '5.7%', value: 0.057, tone: 'orange' as Tone, icon: 'clock' as IconName },
    { status: 'Absent', count: 0, pct: '0.0%', value: 0, tone: 'red' as Tone, icon: 'close' as IconName },
    { status: 'On Leave', count: 2, pct: '2.3%', value: 0.023, tone: 'grey' as Tone, icon: 'minus' as IconName },
  ],
  gate: [
    { label: 'Gate Entries (In)', value: '1,258', icon: 'arrowRight' as IconName, tone: 'green' as Tone },
    { label: 'Gate Exits (Out)', value: '1,246', icon: 'arrowLeft' as IconName, tone: 'red' as Tone },
    { label: 'On Campus Now', value: '1,201', icon: 'people' as IconName, tone: 'green' as Tone },
    { label: 'Bus Arrivals', value: '12', icon: 'bolt' as IconName, tone: 'orange' as Tone },
    { label: 'Bus Departures', value: '12', icon: 'bolt' as IconName, tone: 'blue' as Tone },
  ],
  live: [
    { name: 'Daniel Okello', detail: 'Primary 4A • Student', time: '7:18 AM', status: 'In', avatar: face.daniel },
    { name: 'Mr. James Otim', detail: 'Mathematics Teacher', time: '7:16 AM', status: 'In', avatar: face.okello },
    { name: 'Grace Akol', detail: 'Primary 3B • Student', time: '7:15 AM', status: 'Late', avatar: face.grace },
  ],
  alerts: [
    { title: '23 students arrived late this morning', body: 'Most from Primary 2 (6) and Primary 5 (5)', when: '7:30 AM', icon: 'clock' as IconName, tone: 'red' as Tone },
    { title: 'Grace Akol – Late (3rd time this week)', body: 'Auto alert sent to parent', when: '7:15 AM', icon: 'alert' as IconName, tone: 'orange' as Tone },
    { title: 'Mr. Henry Ochan – No lesson check-in (P.2)', body: 'Reminder sent to teacher', when: '9:45 AM', icon: 'clock' as IconName, tone: 'blue' as Tone },
    { title: '2 teachers on approved leave today', body: 'Mrs. Nambooze, Mr. Lwanyaga', when: '6:00 AM', icon: 'calendar' as IconName, tone: 'purple' as Tone },
  ],
  insights: [
    { label: 'Lesson Attendance', value: '98.1%', delta: '↑ +1.3%', icon: 'check' as IconName, tone: 'blue' as Tone },
    { label: 'Daily Commute', value: '97.7%', delta: '↑ +0.9%', icon: 'bolt' as IconName, tone: 'orange' as Tone },
    { label: 'Clocked Out (Evening)', value: '98.9%', delta: '↑ +1.1%', icon: 'arrowRight' as IconName, tone: 'green' as Tone },
    { label: 'Leave & Absence', value: '2 (On Leave)', delta: '5 (Absent)', icon: 'calendar' as IconName, tone: 'red' as Tone },
    { label: 'Discipline & Conduct', value: '0 Incidents', delta: '↓ -100%', icon: 'shield' as IconName, tone: 'green' as Tone },
    { label: 'Health & Wellness', value: '0 Reports', delta: 'On Track', icon: 'heart' as IconName, tone: 'red' as Tone },
  ],
  comms: [
    { title: 'Parent Notifications', body: '28 sent today', icon: 'mail' as IconName, tone: 'orange' as Tone },
    { title: 'Teacher Reminders', body: '5 sent', icon: 'phone' as IconName, tone: 'blue' as Tone },
    { title: 'Announcements', body: 'Attendance update sent', icon: 'megaphone' as IconName, tone: 'orange' as Tone },
  ],
  quick: [
    { label: 'Scan QR (Gate)', icon: 'qr' as IconName },
    { label: 'Generate QR IDs', icon: 'grid' as IconName },
    { label: 'Mark Attendance', icon: 'check' as IconName },
    { label: 'Attendance Reports', icon: 'doc' as IconName },
    { label: 'Notify Parents', icon: 'bell' as IconName },
  ],
  qrFrame: require('./images/att-qr-frame.png') as Photo,
  modes: ['Gate Entry', 'Gate Exit', 'Lesson Check'] as readonly ScanMode[],
  /** The people the design scanner "reads", in turn: on time, late, then a revoked badge. */
  scanQueue: [
    { id: 's1', name: 'Daniel Okello', detail: 'Primary 4A • Adm P4A-018', kind: 'Student', avatar: face.daniel, result: 'ok', message: 'On time • Parent notified' },
    { id: 's2', name: 'Grace Akol', detail: 'Primary 3B • Adm P3B-007', kind: 'Student', avatar: face.grace, result: 'late', message: 'Late by 12 min • 3rd time this week • Parent alerted' },
    { id: 's3', name: 'Samuel Kato', detail: 'Senior 2 • Adm S2-044', kind: 'Student', avatar: face.samuel, result: 'denied', message: 'Badge revoked on Mar 2 • Send to the front office' },
    { id: 's4', name: 'Mr. James Otim', detail: 'Mathematics Teacher • Staff 0042', kind: 'Teacher', avatar: face.okello, result: 'ok', message: 'Reported 7:16 AM • Due 7:30 AM' },
    { id: 's5', name: 'Mrs. A. Nakato', detail: 'English Teacher • Staff 0031', kind: 'Teacher', avatar: face.nakato, result: 'late', message: 'P5 English started 8:46 (6 min late)' },
  ] as ScanPerson[],
  lessonNow: { cls: 'Primary 5A', subject: 'English', teacher: 'Mrs. A. Nakato', room: 'Room 4', due: '8:40 AM' },
};

/** The school's books for the Chart of Accounts and Journal Entries pages. */
export * as books from './school-books';
export { comparison, institutionPricing, planCards, planVersions, subscription } from './institution-plans';
export { schoolGrowth } from './school-growth';
export { admissionsHub } from './school-admissions';
export { schoolProfile } from './school-profile';
export { schoolCommunity } from './school-community';
