/** Learner fixtures (design builds only; never bundled in deployment). */

import { photos } from './photos';

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
  { id: 'a5', title: 'Assignment 3: Fraction Word Problems', subject: 'Mathematics', due: 'Fri 24 Oct · 23:59', state: 'due' as AssignmentState, max: 20 },
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

const dash = (n: string): number => photos.dashboard[n];

/** The learner home dashboard ("Your Next 20 Minutes"), built to its reference. */
export const dashboard = {
  name: 'Daniel',
  hero: dash('hero'),
  avatar: dash('avatar'),
  resume: { title: 'Fractions and Decimals', meta: 'Mathematics • Primary 7', progress: 0.6, course: 'fractions-and-decimals' },
  stats: [
    { icon: dash('fire'), value: '12', label: 'Day Streak', note: 'Keep going!', sub: 'You’re on fire! 🔥', phoneNote: 'Keep going!' },
    { icon: dash('target'), value: '3/5', label: 'Tasks Today', note: '2 remaining', sub: 'You can do it!', phoneNote: '' },
    { icon: dash('trophy'), value: '75%', label: 'Weekly Goal', note: 'Great progress', sub: 'You’re ahead! 🎉', phoneNote: '' },
  ],
  subjects: [
    { name: 'Mathematics', short: 'Maths', detail: 'Continue learning', icon: dash('subj-maths') },
    { name: 'English', short: 'English', detail: 'Read & practice', icon: dash('subj-english') },
    { name: 'Science', short: 'Science', detail: 'Explore & discover', icon: dash('subj-science') },
    { name: 'Social Studies', short: 'Social', detail: 'Learn about the world', icon: dash('subj-social') },
  ],
  plan: [
    { at: '10:00 AM', title: 'Live Class', detail: 'Mathematics with Ms. Achieng', tag: 'Live in 5 min', live: true, icon: dash('plan-1') },
    { at: '11:30 AM', title: 'Fractions Practice', detail: 'Complete 10 questions', tag: '20 min', live: false, icon: dash('plan-2') },
    { at: '2:00 PM', title: 'Read Chapter 3', detail: 'English', tag: '15 min', live: false, icon: dash('plan-3') },
    { at: '4:00 PM', title: 'Science Video', detail: 'Watch and take notes', tag: '20 min', live: false, icon: dash('plan-4') },
    { at: '6:00 PM', title: 'Daily Reflection', detail: 'How did you do today?', tag: '5 min', live: false, icon: dash('plan-5') },
  ],
  live: { subject: 'Mathematics', when: 'Today • 10:00 AM – 10:40 AM', phoneWhen: 'Today • 10:00 AM', teacher: 'Ms. Achieng', photo: dash('teacher'), art: dash('laptop'), slug: 'p7-maths-revision-bootcamp' },
  urgent: [
    { title: 'Fractions Quiz', due: 'Due today • 11:59 PM', action: 'Start', primary: true, icon: dash('assign-1') },
    { title: 'English Essay', due: 'Due tomorrow', action: 'View', primary: false, icon: dash('assign-2') },
  ],
  continue: [
    { title: 'Fractions and Decimals', meta: 'Mathematics • Primary 7', progress: 0.6, color: '#16A34A', photo: dash('thumb-1') },
    { title: 'Reading Comprehension', meta: 'English • Primary 7', progress: 0.3, color: '#16A34A', photo: dash('thumb-2') },
    { title: 'Living Things', meta: 'Science • Primary 7', progress: 0.25, color: '#1463F3', photo: dash('thumb-3') },
  ],
  activity: [
    { title: 'Completed: Ecosystems Video', at: '2 hours ago', icon: dash('activity-1') },
    { title: 'Scored 90% in English Practice', at: '1 day ago', icon: dash('activity-2') },
    { title: 'Joined Science Live Class', at: '1 day ago', icon: dash('activity-3') },
  ],
};

const co = (n: string): number => photos.courseOverview[n];

/** Course overview and 3-tap module map (Fractions and Decimals), built to its reference. */
export const courseOverview = {
  id: 'fractions-and-decimals',
  subject: 'Mathematics',
  level: 'Primary 7',
  subjectIcon: co('subject'),
  title: 'Fractions and Decimals',
  sub: 'Build a strong understanding of fractions and decimals and learn how to use them in real life.',
  progress: 0.6,
  hero: co('hero'),
  heroPhone: co('hero-phone'),
  stats: [
    { icon: co('stat-lessons'), value: '12', label: 'Lessons' },
    { icon: co('stat-time'), value: '3h 20m', label: 'Total time' },
    { icon: co('stat-trophy'), value: '75%', label: 'Class average' },
    { icon: co('stat-ends'), value: 'Ends in', label: '6 weeks' },
  ],
  modules: [
    { n: 1, title: 'Understanding Fractions', progress: 1, icon: co('module-1') },
    { n: 2, title: 'Equivalent Fractions', progress: 0.6, icon: co('module-2') },
    { n: 3, title: 'Adding and Subtracting Fractions', progress: 0, icon: co('module-3') },
    { n: 4, title: 'Decimals and Place Value', progress: 0, icon: co('module-4') },
    { n: 5, title: 'Operations with Decimals', progress: 0, icon: co('module-5') },
    { n: 6, title: 'Real-Life Problem Solving', progress: 0, icon: co('module-6') },
  ],
  current: {
    title: 'Module 2: Equivalent Fractions',
    sub: 'Learn how to identify, create, and compare equivalent fractions. This helps you simplify fractions and solve real-life problems.',
    size: '120 MB • 4 lessons',
    // NCDC learning outcomes, written with the syllabus verbs (know/understand, able to, appreciate).
    outcomes: [
      'Understand that equivalent fractions name the same amount of a whole',
      'Be able to find, compare and simplify equivalent fractions',
      'Appreciate fair sharing when dividing things into equal parts',
    ],
    skills: ['computation', 'critical'] as const,
    lessons: [
      { title: '1. What are Equivalent Fractions?', kind: 'Video lesson', length: '12 min', status: 'done' as const, thumb: co('lesson-1'), domain: 'knowledge' as const },
      { title: '2. Finding Equivalent Fractions', kind: 'Video lesson', length: '15 min', status: 'current' as const, thumb: co('lesson-2'), domain: 'skills' as const },
      { title: '3. Simplifying Fractions', kind: 'Video lesson', length: '14 min', status: 'todo' as const, thumb: co('lesson-3'), domain: 'skills' as const },
      { title: '4. Practice and Real-Life Examples', kind: 'Practice', length: '10 questions', status: 'todo' as const, thumb: co('lesson-4'), domain: 'values' as const },
    ],
  },
  resources: [
    { title: 'Module Notes', meta: 'PDF • 2 MB', icon: co('file-1') },
    { title: 'Workbook', meta: 'PDF • 4 MB', icon: co('file-2') },
    { title: 'Practice Questions', meta: 'PDF • 1 MB', icon: co('file-3') },
    { title: 'Key Points', meta: 'PDF • 1 MB', icon: co('file-4') },
  ],
  progressBreakdown: { completed: 4, inProgress: 2, notStarted: 6 },
  squad: { learners: 12, faces: co('squad'), more: 7 },
  badges: [
    { title: 'Lesson Streak', detail: '3 days', icon: co('badge-1') },
    { title: 'Quick Learner', detail: 'Completed 2 lessons', icon: co('badge-2') },
    { title: 'Top Performer', detail: 'Top 20%', icon: co('badge-3') },
  ],
};

export { examSimulator } from './exam';
export { liveHub } from './live-hub';
export { assignmentWork } from './assignment-work';
export { assignmentFeedback } from './assignment-feedback';
export { learnerHome } from './learner-home';
export { projectsPage } from './projects';
export { libraryHub } from './library-hub';
export { progressMap } from './progress-map';
export { squadRoom } from './squad-room';
export { billingHub } from './billing-hub';
export { learnerAccount } from './learner-account';
