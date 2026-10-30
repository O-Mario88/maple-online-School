/** School admin fixtures (design builds only; never bundled in deployment). */

export const onboarding = {
  steps: ['School profile', 'Curriculum', 'Rosters', 'Plan'],
  current: 2,
  profile: { name: 'Kampala Hill School', motto: 'Wisdom and service', colour: '#B4402A', campuses: 1 },
  curricula: ['Uganda NCDC (UNEB)', 'Kenya CBC (KNEC)', 'Cambridge IGCSE', 'IB Diploma'],
};

export const leadership = {
  studentAttendance: 0.93,
  teacherAttendance: 0.97,
  syllabusCoverage: 0.68,
  feeCollection: 0.71,
  byClass: [
    { class: 'S1 East', attendance: 0.95, coverage: 0.72, mastery: 0.66 },
    { class: 'S2 East', attendance: 0.94, coverage: 0.7, mastery: 0.63 },
    { class: 'S3 East', attendance: 0.9, coverage: 0.65, mastery: 0.61 },
    { class: 'S4 East', attendance: 0.92, coverage: 0.74, mastery: 0.69 },
    { class: 'S5 Sci', attendance: 0.96, coverage: 0.6, mastery: 0.58 },
    { class: 'S6 Sci', attendance: 0.97, coverage: 0.81, mastery: 0.7 },
  ],
};

export const academics = {
  year: '2026',
  terms: [
    { name: 'Term 1', dates: '2 Feb – 1 May', current: false },
    { name: 'Term 2', dates: '25 May – 21 Aug', current: false },
    { name: 'Term 3', dates: '14 Sep – 4 Dec', current: true },
  ],
  streams: ['East', 'West', 'Sci', 'Arts'],
  grading: [
    { band: 'D1', from: 80 }, { band: 'D2', from: 75 }, { band: 'C3', from: 70 }, { band: 'C4', from: 65 },
    { band: 'C5', from: 60 }, { band: 'C6', from: 55 }, { band: 'P7', from: 50 }, { band: 'P8', from: 45 }, { band: 'F9', from: 0 },
  ],
};

export type RosterIssue = 'ok' | 'duplicate' | 'missing';

export const rosterImport = {
  file: 'S1 intake 2027.xlsx',
  mapping: [
    { column: 'Full Name', field: 'Learner name' },
    { column: 'Adm No', field: 'Admission number' },
    { column: 'DOB', field: 'Date of birth' },
    { column: 'Parent Phone', field: 'Parent phone' },
    { column: 'Stream', field: 'Class' },
  ],
  rows: [
    { name: 'Nalubega Sharon', adm: 'KHS/27/001', parent: '0772 114 221', cls: 'S1 East', issue: 'ok' as RosterIssue },
    { name: 'Ochieng Samuel', adm: 'KHS/27/002', parent: '0701 998 320', cls: 'S1 East', issue: 'ok' as RosterIssue },
    { name: 'Nalubega Sharon', adm: 'KHS/27/001', parent: '0772 114 221', cls: 'S1 East', issue: 'duplicate' as RosterIssue },
    { name: 'Tumusiime Eric', adm: 'KHS/27/004', parent: '', cls: 'S1 West', issue: 'missing' as RosterIssue },
    { name: 'Akello Brenda', adm: 'KHS/27/005', parent: '0754 220 118', cls: 'S1 West', issue: 'ok' as RosterIssue },
  ],
  total: 184,
};

export const timetable = {
  days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  periods: ['08:00', '08:40', '09:20', '10:20', '11:00', '11:40'],
  cls: 'S3 East',
  grid: [
    ['Maths · Ssempala', 'English · Akello', 'Biology · Atim', 'Chemistry · Namusoke', 'Geography · Opio', 'HPE · Nantongo'],
    ['Physics · Mugisha', 'Maths · Ssempala', 'English · Akello', 'Kiswahili · Wekesa', 'Entrepreneurship · Kasozi', 'PE'],
    ['Maths · Ssempala', 'Biology · Atim', 'Chemistry · Namusoke', 'ICT · Lubega', 'English · Akello', 'RE · Fr. Ouma'],
    ['English · Akello', 'Physics · Mugisha', 'Maths · Ssempala', 'Geography · Opio', 'HPE · Nantongo', 'Art · Birungi'],
    ['Maths · Ssempala', 'Chemistry · Namusoke', 'Biology · Atim', 'English · Akello', 'Physics · Mugisha', 'Clubs'],
  ],
  clash: { day: 2, period: 3, detail: 'Mr. Lubega is also booked for S2 West ICT' },
};

export const attendanceMonitor = {
  date: 'Fri 30 Oct 2026',
  classes: [
    { class: 'S1 East', present: 41, total: 44 },
    { class: 'S2 East', present: 39, total: 42 },
    { class: 'S3 East', present: 36, total: 40 },
    { class: 'S4 East', present: 38, total: 41 },
    { class: 'S5 Sci', present: 27, total: 28 },
    { class: 'S6 Sci', present: 25, total: 26 },
  ],
  chronic: [
    { name: 'Moses Tumwine', class: 'S3 East', missed: '7 of 20 days' },
    { name: 'Esther Auma', class: 'S1 East', missed: '6 of 20 days' },
  ],
  adjustments: [
    { when: 'Thu 29 Oct 09:12', by: 'Mr. Ssempala', change: 'Peter Kato: absent → late', reason: 'Arrived after register' },
  ],
};

export const audit = [
  { when: '30 Oct 10:21', who: 'Head Teacher Akello', action: 'Invited 2 class teachers' },
  { when: '30 Oct 09:02', who: 'Registrar Mukasa', action: 'Approved a parent link for Amina Nakato' },
  { when: '29 Oct 16:44', who: 'Registrar Mukasa', action: 'Recorded cash payment RCT-000045' },
  { when: '29 Oct 08:10', who: 'Mr. Ssempala', action: 'Changed one attendance mark' },
];

export const roles = [
  { role: 'Headteacher', people: 1, can: 'Everything' },
  { role: 'Director of Studies', people: 1, can: 'Classes, marks, report cards' },
  { role: 'Registrar (bursar)', people: 1, can: 'Fees, admissions, family links' },
  { role: 'Class teacher', people: 12, can: 'Their classes, register, marking' },
  { role: 'Safeguarding lead', people: 1, can: 'Read every family conversation' },
];

export const accounting = {
  trialBalance: [
    { code: '1000', account: 'Cash at hand', debit: 4200000, credit: 0 },
    { code: '1010', account: 'Bank', debit: 61800000, credit: 0 },
    { code: '1020', account: 'Mobile money clearing', debit: 3150000, credit: 0 },
    { code: '1100', account: 'Student fees receivable', debit: 38400000, credit: 0 },
    { code: '2000', account: 'Suppliers payable', debit: 0, credit: 7550000 },
    { code: '4000', account: 'Fee income', debit: 0, credit: 100000000 },
  ],
};
