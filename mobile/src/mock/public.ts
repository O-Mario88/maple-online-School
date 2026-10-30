/** Public web fixtures (design builds only; never bundled in deployment). */

export const landing = {
  headline: 'Learn anything your exams ask, from the best teachers in Africa',
  sub: 'Live classes, past papers and lessons that work offline. Try a question now, no account needed.',
  boards: ['UNEB', 'KCSE', 'WAEC', 'IGCSE', 'IB', 'Common Core'],
  liveNow: ['S4 Chemistry with Dr. Namusoke · 112 learners', 'P7 Maths with Mr. Wasswa · 86 learners', 'S6 Economics with Ms. Kemigisha · 40 learners'],
  stats: [{ value: '34,500', label: 'learners' }, { value: '93', label: 'schools' }, { value: '1,200+', label: 'past papers' }],
  tryQuestion: { text: 'A boda-boda fare rises from UGX 2,000 to UGX 2,500. What is the percentage increase?', options: ['20%', '25%', '50%'], answer: 1 },
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
