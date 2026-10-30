/** Public web fixtures (design builds only; never bundled in deployment). */

export type LiveStatus = 'live' | 'soon';

export const landing = {
  eyebrow: 'Learning without borders',
  headline: { lead: 'A global online school', pre: 'for a ', accent: 'brighter future.' },
  sub: 'World-class education. Live classes, self-paced courses, certified teachers and recognised curricula, anytime, anywhere in the world.',
  curricula: [
    { code: 'UNEB', region: 'Uganda', flag: '🇺🇬' },
    { code: 'KCSE', region: 'Kenya', flag: '🇰🇪' },
    { code: 'WAEC', region: 'West Africa', flag: '🌍' },
    { code: 'IGCSE', region: 'Cambridge', flag: '🇬🇧' },
    { code: 'IB', region: 'International', flag: '🌐' },
    { code: 'Common Core', region: 'USA', flag: '🇺🇸' },
  ],
  trust: ['Live and recorded classes', 'Certified teachers', 'Recognised certificates', 'Learn at your own pace'],
  stats: [
    { value: '1M+', label: 'Active learners', icon: 'people' as const, tint: 'green' as const },
    { value: '10K+', label: 'Expert teachers', icon: 'person' as const, tint: 'blue' as const },
    { value: '500+', label: 'Partner schools', icon: 'school' as const, tint: 'amber' as const },
    { value: '150+', label: 'Countries', icon: 'globe' as const, tint: 'purple' as const },
  ],
  teachers: ['Grace Atim', 'Daniel Okello', 'Sarah Kim', 'Ruth Namusoke'],
  liveClasses: [
    { id: 'lc1', subject: 'Mathematics Revision', board: 'IGCSE', level: 'Year 10', teacher: 'Mr. Daniel Okello', learners: 128, status: 'live' as LiveStatus, startsIn: '', icon: 'chart' as const },
    { id: 'lc2', subject: 'English Literature', board: 'A Level', level: 'Cambridge', teacher: 'Ms. Sarah Kim', learners: 94, status: 'live' as LiveStatus, startsIn: '', icon: 'book' as const },
    { id: 'lc3', subject: 'Biology: Human Systems', board: 'KCSE', level: 'Form 3', teacher: 'Dr. Grace Njeri', learners: 76, status: 'live' as LiveStatus, startsIn: '', icon: 'sparkle' as const },
    { id: 'lc4', subject: 'Chemistry Practicals', board: 'UNEB', level: 'S5', teacher: 'Mr. Ahmed Hassan', learners: 312, status: 'soon' as LiveStatus, startsIn: '14 min', icon: 'star' as const },
    { id: 'lc5', subject: 'Introduction to Python', board: 'Beginner', level: 'Programming', teacher: 'Ms. Laila Chen', learners: 245, status: 'soon' as LiveStatus, startsIn: '32 min', icon: 'globe' as const },
  ],
  sampleLesson: {
    title: 'Introduction to the Pythagorean Theorem',
    teacher: 'Mr. Daniel Ssempala',
    duration: '4:32',
    questions: [
      { text: 'In a right triangle, if a = 3 and b = 4, what is the value of c?', options: ['5', '6', '7', '12'], answer: 0 },
      { text: 'A ladder 13 m long reaches 12 m up a wall. How far is its foot from the wall?', options: ['1 m', '5 m', '25 m', '7 m'], answer: 1 },
      { text: 'Which set of sides makes a right triangle?', options: ['2, 3, 4', '5, 12, 13', '4, 5, 6', '6, 7, 8'], answer: 1 },
    ],
    results: ['See your score', 'Find your strengths', 'Get recommended courses', 'Keep learning with a free account'],
  },
};

export const liveEvent = {
  title: 'UCE Biology revision bootcamp',
  teacher: 'Ms. Grace Atim',
  when: 'Saturday 7 Nov · 10:00–13:00 EAT',
  seatsLeft: 38,
  seats: 150,
  priceUGX: 35000,
  syllabus: ['Genetics in 40 minutes', 'Ecology essay questions', 'Paper 2 practicals', 'Live past-paper walkthrough'],
};

export const digest = {
  child: 'Amina Nakato',
  week: '26 Oct – 30 Oct',
  attendance: '4 of 5 days (1 excused)',
  mastered: ['Factorising quadratics', 'Formal letters'],
  voiceFrom: 'Mr. Daniel Ssempala',
  balanceUGX: 450000,
  expires: 'Link works until Sun 8 Nov',
};

export const payLink = {
  school: 'Kampala Hill School',
  learner: 'Amina Nakato',
  invoice: 'INV-000123',
  items: [{ name: 'Tuition, Term 3', ugx: 550000 }, { name: 'Lunch', ugx: 100000 }],
  paidUGX: 200000,
};

export const credential = {
  id: 'CERT-7F3K-21',
  holder: 'Amina Nakato',
  title: 'Algebra Foundations',
  issuer: 'Maple Online School',
  issued: '14 Aug 2026',
  signature: 'Ed25519 · valid',
  competencies: ['Expanding brackets', 'Factorising', 'Quadratic equations'],
};

export const help = [
  { topic: 'Getting started', articles: ['Set up Maple on a low-cost phone', 'Use Maple with very little data', 'Join your school’s class'] },
  { topic: 'Paying', articles: ['Pay school fees with MTN or Airtel', 'Get a receipt', 'Refunds'] },
  { topic: 'Safety', articles: ['Report a concern', 'How we protect children', 'Privacy for parents'] },
];

export const status = [
  { service: 'App and API', state: 'Working' },
  { service: 'Live classes', state: 'Working' },
  { service: 'Mobile money', state: 'Airtel slow (provider)' },
];

export const getStarted = {
  roles: ['Learner', 'Parent', 'Teacher', 'School leader'],
  curricula: ['Uganda NCDC (UNEB)', 'Kenya CBC (KNEC)', 'Cambridge IGCSE', 'IB Diploma'],
  levels: ['P5', 'P6', 'P7', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6'],
  goals: ['Pass my exams', 'Catch up on missed topics', 'Get ahead of class', 'Practise past papers'],
  subjects: ['Mathematics', 'English', 'Biology', 'Chemistry', 'Physics', 'Geography', 'History', 'CRE'],
};

export const qrSignIn = {
  device: 'Classroom laptop · Kampala Hill School',
  code: 'MPL-4K7Q',
  expiresInSeconds: 90,
};

export const consent = {
  child: 'Joseph Nakato',
  age: 11,
  school: 'Mengo Primary School',
  asks: [
    { label: 'Join live classes with video off by default', on: true },
    { label: 'Message teachers (you can read every message)', on: true },
    { label: 'Appear on class leaderboards', on: false },
    { label: 'Use the AI study helper', on: true },
  ],
};

export const claimChild = {
  code: '7KQ2-M9XA',
  match: { name: 'Amina Nakato', cls: 'S3 East', school: 'Kampala Hill School', adm: 'KHS/24/118' },
};
