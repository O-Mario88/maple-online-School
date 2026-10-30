/** Learner fixtures (design builds only; never bundled in deployment). */

export type LessonKind = 'video' | 'notes' | 'quiz' | 'live';

export interface MockCourse {
  id: string;
  title: string;
  subject: string;
  level: string;
  board: string;
  teacher: string;
  rating: number;
  learners: number;
  priceUGX: number;
  progress: number;
  summary: string;
  outcomes: string[];
  modules: { title: string; downloaded: boolean; lessons: { id: string; title: string; minutes: number; kind: LessonKind; done: boolean }[] }[];
}

export interface MockQuestion {
  n: number;
  text: string;
  options: string[];
  answer: number;
  marks: number;
  walkthrough: string;
}

export const courses: MockCourse[] = [
  {
    id: 'c-math-s3',
    title: 'S3 Mathematics: Algebra and Functions',
    subject: 'Mathematics',
    level: 'S3',
    board: 'UNEB UCE',
    teacher: 'Mr. Daniel Ssempala',
    rating: 4.8,
    learners: 1240,
    priceUGX: 45000,
    progress: 0.42,
    summary: 'Quadratics, simultaneous equations and functions, taught through Kampala market and boda-boda problems.',
    outcomes: ['Factorise and solve quadratic equations', 'Solve simultaneous equations three ways', 'Sketch and read linear and quadratic graphs'],
    modules: [
      {
        title: 'Expressions and factorisation',
        downloaded: true,
        lessons: [
          { id: 'l1', title: 'Expanding brackets', minutes: 12, kind: 'video', done: true },
          { id: 'l2', title: 'Common factors and grouping', minutes: 14, kind: 'video', done: true },
          { id: 'l3', title: 'Check your understanding', minutes: 8, kind: 'quiz', done: true },
        ],
      },
      {
        title: 'Quadratic equations',
        downloaded: true,
        lessons: [
          { id: 'l4', title: 'Solving by factorising', minutes: 16, kind: 'video', done: true },
          { id: 'l5', title: 'Completing the square', minutes: 18, kind: 'video', done: false },
          { id: 'l6', title: 'The quadratic formula', minutes: 15, kind: 'notes', done: false },
          { id: 'l7', title: 'Live revision with Mr. Ssempala', minutes: 45, kind: 'live', done: false },
        ],
      },
      {
        title: 'Simultaneous equations',
        downloaded: false,
        lessons: [
          { id: 'l8', title: 'Elimination', minutes: 14, kind: 'video', done: false },
          { id: 'l9', title: 'Substitution', minutes: 13, kind: 'video', done: false },
          { id: 'l10', title: 'Word problems from the market', minutes: 20, kind: 'quiz', done: false },
        ],
      },
    ],
  },
  {
    id: 'c-bio-s4',
    title: 'S4 Biology: Genetics and Evolution',
    subject: 'Biology',
    level: 'S4',
    board: 'UNEB UCE',
    teacher: 'Ms. Grace Atim',
    rating: 4.9,
    learners: 980,
    priceUGX: 0,
    progress: 0.15,
    summary: 'Inheritance, variation and natural selection with field examples from Queen Elizabeth National Park.',
    outcomes: ['Explain monohybrid crosses', 'Interpret pedigree charts', 'Describe natural selection'],
    modules: [
      { title: 'Cells and chromosomes', downloaded: false, lessons: [{ id: 'b1', title: 'DNA and genes', minutes: 15, kind: 'video', done: true }, { id: 'b2', title: 'Mitosis and meiosis', minutes: 18, kind: 'video', done: false }] },
      { title: 'Inheritance', downloaded: false, lessons: [{ id: 'b3', title: 'Monohybrid crosses', minutes: 20, kind: 'video', done: false }, { id: 'b4', title: 'Sex linkage', minutes: 14, kind: 'notes', done: false }] },
    ],
  },
  {
    id: 'c-chem-s5',
    title: 'S5 Chemistry: Physical Chemistry Bootcamp',
    subject: 'Chemistry',
    level: 'S5',
    board: 'UNEB UACE',
    teacher: 'Dr. Ruth Namusoke',
    rating: 4.7,
    learners: 410,
    priceUGX: 80000,
    progress: 0,
    summary: 'Moles, energetics and kinetics for A-Level, with past-paper drills every week.',
    outcomes: ['Master mole calculations', 'Use Hess’s law', 'Read rate graphs'],
    modules: [{ title: 'The mole', downloaded: false, lessons: [{ id: 'k1', title: 'Moles and mass', minutes: 16, kind: 'video', done: false }] }],
  },
  {
    id: 'c-eng-p7',
    title: 'P7 English: PLE Composition and Comprehension',
    subject: 'English',
    level: 'P7',
    board: 'UNEB PLE',
    teacher: 'Mrs. Harriet Akello',
    rating: 4.8,
    learners: 2310,
    priceUGX: 30000,
    progress: 0.6,
    summary: 'Letters, compositions and comprehension the way PLE examiners mark them.',
    outcomes: ['Write a formal letter', 'Answer comprehension in full sentences', 'Plan a composition in five minutes'],
    modules: [{ title: 'Letters', downloaded: true, lessons: [{ id: 'e1', title: 'Formal letters', minutes: 12, kind: 'video', done: true }] }],
  },
];

export const nextUp = {
  courseId: 'c-math-s3',
  lessonId: 'l5',
  title: 'Completing the square',
  subject: 'Mathematics',
  minutes: 18,
  reason: 'Next in Quadratic equations · you got 2 of 3 right on the last quiz',
};

export const streak = { days: 12, minutesToday: 34, goalMinutes: 40 };

export const pastPapers = [
  {
    id: 'pp-uce-math-2025',
    board: 'UNEB',
    exam: 'UCE',
    subject: 'Mathematics',
    year: 2025,
    paper: 'Paper 1',
    minutes: 150,
    attempts: 3412,
    questions: [
      { n: 1, text: 'Factorise completely: 6x² − 13x + 6', options: ['(2x − 3)(3x − 2)', '(6x − 1)(x − 6)', '(3x + 2)(2x + 3)', '(2x + 3)(3x − 2)'], answer: 0, marks: 3, walkthrough: '2 min · Mr. Ssempala' },
      { n: 2, text: 'Solve 2x + 3y = 12 and x − y = 1', options: ['x = 3, y = 2', 'x = 2, y = 3', 'x = 4, y = 3', 'x = 3, y = 1'], answer: 0, marks: 4, walkthrough: '2 min · Mr. Ssempala' },
      { n: 3, text: 'A boda-boda fare rises from UGX 2,000 to UGX 2,500. Find the percentage increase.', options: ['20%', '25%', '50%', '12.5%'], answer: 1, marks: 2, walkthrough: '1 min · Mr. Ssempala' },
      { n: 4, text: 'Find the gradient of the line through (1, 2) and (4, 11)', options: ['2', '3', '9', '1/3'], answer: 1, marks: 2, walkthrough: '1 min · Mr. Ssempala' },
    ] as MockQuestion[],
  },
  { id: 'pp-uce-bio-2025', board: 'UNEB', exam: 'UCE', subject: 'Biology', year: 2025, paper: 'Paper 1', minutes: 150, attempts: 2210, questions: [] as MockQuestion[] },
  { id: 'pp-ple-sci-2025', board: 'UNEB', exam: 'PLE', subject: 'Integrated Science', year: 2025, paper: 'Paper 1', minutes: 135, attempts: 5120, questions: [] as MockQuestion[] },
  { id: 'pp-uace-chem-2024', board: 'UNEB', exam: 'UACE', subject: 'Chemistry', year: 2024, paper: 'Paper 2', minutes: 180, attempts: 860, questions: [] as MockQuestion[] },
];

export const shorts = [
  { id: 's1', title: 'Completing the square in 60 seconds', teacher: 'Mr. Daniel Ssempala', subject: 'Mathematics', seconds: 58, likes: 1820 },
  { id: 's2', title: 'Why leaves are green: chlorophyll', teacher: 'Ms. Grace Atim', subject: 'Biology', seconds: 47, likes: 960 },
  { id: 's3', title: 'PLE composition: the perfect opening line', teacher: 'Mrs. Harriet Akello', subject: 'English', seconds: 55, likes: 2410 },
  { id: 's4', title: 'Moles made easy', teacher: 'Dr. Ruth Namusoke', subject: 'Chemistry', seconds: 60, likes: 740 },
];

export const live = [
  { id: 'lv1', title: 'S3 Maths: Simultaneous equations', teacher: 'Mr. Daniel Ssempala', when: 'Today · 16:00', kind: 'school' as const, seats: '28 of 40', status: 'soon' as const },
  { id: 'lv2', title: 'UCE Biology revision bootcamp', teacher: 'Ms. Grace Atim', when: 'Sat · 10:00', kind: 'bootcamp' as const, seats: '112 of 150', status: 'booked' as const },
  { id: 'lv3', title: 'Homework rescue: Physics', teacher: 'Mr. Isaac Mugisha', when: 'Available now · 15 min', kind: 'rescue' as const, seats: '1 to 1', status: 'open' as const },
  { id: 'lv4', title: 'Homework rescue: Chemistry', teacher: 'Dr. Ruth Namusoke', when: 'Available now · 15 min', kind: 'rescue' as const, seats: '1 to 1', status: 'open' as const },
];

export const classroom = {
  title: 'S3 Maths: Simultaneous equations',
  teacher: 'Mr. Daniel Ssempala',
  participants: 28,
  poll: { question: 'Which method is quicker here?', options: ['Elimination', 'Substitution'], votes: [19, 7] },
  chat: [
    { name: 'Amina N.', text: 'Can we use elimination for question 2?' },
    { name: 'Brian O.', text: 'I got x = 3, y = 2' },
    { name: 'Mr. Ssempala', text: 'Correct, Brian. Amina, yes: multiply the second equation by 3 first.' },
  ],
};

export type AssignmentState = 'due' | 'draft' | 'submitted' | 'graded';

export const assignments = [
  { id: 'a1', title: 'Quadratics practice set', subject: 'Mathematics', due: 'Tomorrow · 08:00', state: 'due' as AssignmentState, max: 20 },
  { id: 'a2', title: 'Genetics crosses worksheet', subject: 'Biology', due: 'Fri', state: 'draft' as AssignmentState, max: 30 },
  { id: 'a3', title: 'Formal letter to the headteacher', subject: 'English', due: 'Submitted Mon', state: 'submitted' as AssignmentState, max: 25 },
  {
    id: 'a4',
    title: 'Expanding brackets',
    subject: 'Mathematics',
    due: 'Marked last week',
    state: 'graded' as AssignmentState,
    max: 20,
    score: 17,
    feedback: 'Strong work. Watch the sign when you expand −(x − 3).',
    rubric: [
      { criterion: 'Method', score: 8, max: 8 },
      { criterion: 'Accuracy', score: 6, max: 8 },
      { criterion: 'Presentation', score: 3, max: 4 },
    ],
  },
];

export type MasteryState = 'mastered' | 'review' | 'locked';

export const mastery = [
  { subject: 'Mathematics', skills: [{ name: 'Expanding', state: 'mastered' as MasteryState }, { name: 'Factorising', state: 'mastered' as MasteryState }, { name: 'Quadratics', state: 'review' as MasteryState }, { name: 'Simultaneous eqns', state: 'locked' as MasteryState }, { name: 'Functions', state: 'locked' as MasteryState }] },
  { subject: 'Biology', skills: [{ name: 'Cells', state: 'mastered' as MasteryState }, { name: 'DNA', state: 'review' as MasteryState }, { name: 'Inheritance', state: 'locked' as MasteryState }] },
  { subject: 'English', skills: [{ name: 'Letters', state: 'mastered' as MasteryState }, { name: 'Comprehension', state: 'mastered' as MasteryState }, { name: 'Composition', state: 'review' as MasteryState }] },
];

export type SyncState = 'saved' | 'syncing' | 'backed_up';

export const offline = {
  usedMB: 412,
  limitMB: 2048,
  items: [
    { id: 'o1', title: 'Quadratic equations (4 lessons)', kind: 'Videos', sizeMB: 310, state: 'backed_up' as SyncState },
    { id: 'o2', title: 'UCE Mathematics 2025 Paper 1', kind: 'Past paper', sizeMB: 4, state: 'backed_up' as SyncState },
    { id: 'o3', title: 'Genetics crosses worksheet (your draft)', kind: 'Homework', sizeMB: 2, state: 'saved' as SyncState },
    { id: 'o4', title: 'Formal letter (submitted)', kind: 'Homework', sizeMB: 1, state: 'syncing' as SyncState },
  ],
};

export const squad = {
  name: 'Kampala Hill Algebra Squad',
  goal: { label: '6 hours of maths this week', done: 4.5, target: 6 },
  members: [
    { name: 'Amina Nakato', streak: 12, minutes: 95 },
    { name: 'Brian Okello', streak: 9, minutes: 80 },
    { name: 'Joan Nalwoga', streak: 15, minutes: 70 },
    { name: 'Peter Kato', streak: 3, minutes: 30 },
    { name: 'Ruth Achieng', streak: 6, minutes: 25 },
  ],
  chat: [
    { name: 'Joan', text: 'Who wants to do the past paper together at 7?' },
    { name: 'Brian', text: 'Me! Question 2 was tricky.' },
  ],
};

export const passport = {
  learner: 'Amina Nakato',
  id: 'MLP-UG-2026-004812',
  records: [
    { term: 'Term 2, 2026', school: 'Kampala Hill School', class: 'S3 East', average: 78, verified: true },
    { term: 'Term 1, 2026', school: 'Kampala Hill School', class: 'S3 East', average: 74, verified: true },
    { term: 'Term 3, 2025', school: 'Kampala Hill School', class: 'S2 East', average: 71, verified: true },
  ],
  selfStudy: [
    { title: 'S4 Biology: Genetics and Evolution', hours: 6, completed: false },
    { title: 'P7 English: PLE Composition', hours: 9, completed: true },
  ],
  certificates: [
    { title: 'Algebra Foundations', issuer: 'Maple Online School', date: 'Aug 2026', credential: 'CERT-7F3K-21' },
    { title: 'National Science Fair: Silver', issuer: 'Uganda National Science Week', date: 'Jul 2026', credential: 'CERT-9QW2-08' },
  ],
};

export const billing = {
  passes: [{ name: 'S3 Mathematics course', renews: 'Lifetime access', priceUGX: 45000 }],
  creditsMinutes: 45,
  methods: [{ label: 'MTN Mobile Money · 0772 *** 481', primary: true }, { label: 'Airtel Money · 0752 *** 220', primary: false }],
  receipts: [
    { id: 'RCT-000412', item: 'S3 Mathematics course', amountUGX: 45000, date: '12 Oct 2026' },
    { id: 'RCT-000388', item: 'Homework rescue · 30 min', amountUGX: 10000, date: '28 Sep 2026' },
  ],
};
