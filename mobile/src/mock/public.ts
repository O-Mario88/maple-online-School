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

export type OutlineItemKind = 'video' | 'notes' | 'quiz' | 'live';

export const coursePage = {
  slug: 'complete-mathematics-primary-7',
  breadcrumb: ['Explore', 'Primary', 'UNEB (Uganda)', 'Mathematics'],
  badge: 'Bestseller',
  title: 'Complete Mathematics for Primary 7 (2024 Curriculum)',
  sub: 'Master every key Primary 7 mathematics concept with step-by-step video lessons, practice questions, past papers and live support.',
  rating: 4.8,
  reviews: 2340,
  learners: 12540,
  hours: 40,
  tags: ['UNEB (Uganda)', 'Primary 7', 'Mathematics', 'English', 'Self-paced + Live Classes'],
  trailer: { length: '2:30', board: ['Fractions', '3/4 + 2/3', '= 9/12 + 8/12', '= 17/12 = 1 5/12'] },
  plans: [
    { key: 'self', label: 'Self-paced', priceUGX: 120000, wasUGX: 160000 },
    { key: 'live', label: 'With live classes', priceUGX: 180000, wasUGX: 220000 },
    { key: 'school', label: 'Institution', priceUGX: 95000, wasUGX: 0 },
  ],
  includes: ['Full course access (12 months)', '40+ video lessons', 'Practice questions and past papers', 'Live revision classes (optional)', 'Downloadable notes and worksheets', 'Certificate of completion', 'Access on phone, tablet and web'],
  features: [
    { title: 'Curriculum aligned', detail: 'UNEB 2024', icon: 'map' as const },
    { title: 'Expert teacher', detail: '10+ years experience', icon: 'person' as const },
    { title: 'Live revision classes', detail: 'Join and ask questions', icon: 'live' as const },
    { title: 'Past papers', detail: 'With marking schemes', icon: 'book' as const },
    { title: 'Track your progress', detail: 'See your improvement', icon: 'chart' as const },
  ],
  outcomes: [
    { title: 'Number and place value', detail: 'Work with whole numbers, decimals, fractions and percentages.', icon: 'chart' as const },
    { title: 'Problem solving', detail: 'Apply mathematical ideas to real-world situations.', icon: 'sparkle' as const },
    { title: 'Algebraic thinking', detail: 'Use simple algebra to solve real-life problems.', icon: 'star' as const },
    { title: 'Data handling', detail: 'Collect, organise and interpret data.', icon: 'chart' as const },
    { title: 'Geometry and measurement', detail: 'Solve problems with shapes, angles, area and volume.', icon: 'map' as const },
    { title: 'Exam readiness', detail: 'Practise with past papers and exam techniques.', icon: 'book' as const },
  ],
  outline: [
    {
      title: 'Number Systems and Operations',
      hours: 5,
      lessons: [
        { title: 'Place value to millions', items: [{ title: 'Video: reading big numbers', kind: 'video' as OutlineItemKind, mins: 12 }, { title: 'Notes: place value chart', kind: 'notes' as OutlineItemKind, mins: 5 }, { title: 'Quiz: 10 questions', kind: 'quiz' as OutlineItemKind, mins: 10 }] },
        { title: 'Operations on whole numbers', items: [{ title: 'Video: long division', kind: 'video' as OutlineItemKind, mins: 15 }, { title: 'Quiz: mixed operations', kind: 'quiz' as OutlineItemKind, mins: 10 }] },
      ],
      lessonCount: 12,
    },
    {
      title: 'Fractions, Decimals and Percentages',
      hours: 4,
      lessons: [
        { title: 'Adding unlike fractions', items: [{ title: 'Video: common denominators', kind: 'video' as OutlineItemKind, mins: 14 }, { title: 'Live: Saturday revision', kind: 'live' as OutlineItemKind, mins: 60 }] },
      ],
      lessonCount: 10,
    },
    { title: 'Algebra and Patterns', hours: 4, lessons: [{ title: 'Simple equations', items: [{ title: 'Video: balancing equations', kind: 'video' as OutlineItemKind, mins: 13 }] }], lessonCount: 8 },
    { title: 'Geometry and Measurement', hours: 6, lessons: [{ title: 'Angles in triangles', items: [{ title: 'Video: angle sum', kind: 'video' as OutlineItemKind, mins: 11 }] }], lessonCount: 14 },
    { title: 'PLE Exam Preparation', hours: 8, lessons: [{ title: 'Past paper walkthroughs', items: [{ title: 'PLE 2023 Paper', kind: 'quiz' as OutlineItemKind, mins: 135 }] }], lessonCount: 16 },
  ],
  totals: { modules: 12, lessons: 86, hours: 40 },
  teacher: {
    name: 'Mr. James Kato',
    title: 'Mathematics Teacher and Curriculum Specialist',
    verified: true,
    stats: [{ value: '10+', label: 'Years teaching' }, { value: '24K+', label: 'Learners taught' }, { value: '4.8★', label: 'Course rating' }],
    bio: 'Mr. Kato is a seasoned mathematics teacher for primary and lower secondary. He has helped thousands of learners get excellent results in UNEB examinations.',
  },
  ratingBars: [0.78, 0.16, 0.04, 0.01, 0.01],
  reviewList: [
    { name: 'Nakato Sarah', when: '2 weeks ago', stars: 5, text: 'My daughter went from 52% to 81% in mocks. The fractions videos are so clear.' },
    { name: 'Okello Brian', when: '1 month ago', stars: 5, text: 'The live revision on Saturdays helped me before PLE.' },
  ],
  sample: {
    questions: [
      { text: 'What is 3/4 + 2/3?', options: ['5/7', '17/12', '15/12', '11/12'], answer: 1, why: 'Use 12 as the common denominator: 9/12 + 8/12 = 17/12, or 1 5/12.' },
      { text: 'Write 0.35 as a percentage.', options: ['3.5%', '35%', '0.35%', '350%'], answer: 1, why: 'Multiply by 100: 0.35 × 100 = 35%.' },
      { text: 'What is 25% of UGX 8,000?', options: ['UGX 200', 'UGX 2,000', 'UGX 4,000', 'UGX 800'], answer: 1, why: '25% is a quarter, and a quarter of 8,000 is 2,000.' },
    ],
    minutes: 5,
  },
  related: [
    { title: 'English for Primary 7', meta: 'UNEB · Primary 7', rating: 4.7, reviews: '1.2K', priceUGX: 100000, icon: 'book' as const },
    { title: 'Science for Primary 7', meta: 'UNEB · Primary 7', rating: 4.6, reviews: '980', priceUGX: 90000, icon: 'sparkle' as const },
  ],
};
