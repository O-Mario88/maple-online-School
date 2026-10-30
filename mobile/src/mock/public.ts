/** Public web fixtures (design builds only; never bundled in deployment). */

import type { CatalogueItem } from '@/lib/catalogue';
import type { ShortClip } from '@/lib/shorts';

import { photos } from './photos';

export type LiveStatus = 'live' | 'soon';

export const landing = {
  eyebrow: 'Learning without borders',
  heroPhoto: photos.homeHero,
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
    { id: 'lc1', photo: photos.homeLive[0], subject: 'Mathematics Revision', board: 'IGCSE', level: 'Year 10', teacher: 'Mr. Daniel Okello', learners: 128, status: 'live' as LiveStatus, startsIn: '', icon: 'chart' as const },
    { id: 'lc2', photo: photos.homeLive[1], subject: 'English Literature', board: 'A Level', level: 'Cambridge', teacher: 'Ms. Sarah Kim', learners: 94, status: 'live' as LiveStatus, startsIn: '', icon: 'book' as const },
    { id: 'lc3', photo: photos.homeLive[2], subject: 'Biology: Human Systems', board: 'KCSE', level: 'Form 3', teacher: 'Dr. Grace Njeri', learners: 76, status: 'live' as LiveStatus, startsIn: '', icon: 'sparkle' as const },
    { id: 'lc4', photo: photos.homeLive[3], subject: 'Chemistry Practicals', board: 'UNEB', level: 'S5', teacher: 'Mr. Ahmed Hassan', learners: 312, status: 'soon' as LiveStatus, startsIn: '14 min', icon: 'star' as const },
    { id: 'lc5', photo: photos.homeLive[4], subject: 'Introduction to Python', board: 'Beginner', level: 'Programming', teacher: 'Ms. Laila Chen', learners: 245, status: 'soon' as LiveStatus, startsIn: '32 min', icon: 'globe' as const },
  ],
  sampleLesson: {
    title: 'Introduction to the Pythagorean Theorem',
    photo: photos.homeSampleVideo,
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
  trailer: { photo: photos.courseTrailer, length: '2:30', board: ['Fractions', '3/4 + 2/3', '= 9/12 + 8/12', '= 17/12 = 1 5/12'] },
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
    photo: photos.courseTeacher,
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
    { title: 'English for Primary 7', photo: photos.courseRelated[0], meta: 'UNEB · Primary 7', rating: 4.7, reviews: '1.2K', priceUGX: 100000, icon: 'book' as const },
    { title: 'Science for Primary 7', photo: photos.courseRelated[1], meta: 'UNEB · Primary 7', rating: 4.6, reviews: '980', priceUGX: 90000, icon: 'sparkle' as const },
  ],
};

const c = (item: CatalogueEntry): CatalogueEntry => item;

export type CatalogueEntry = CatalogueItem & {
  photo?: number;
  meta: string;
  badge: string;
  hours: string;
  wasUGX?: number;
  startsIn?: string;
  tint: string;
  icon: 'chart' | 'book' | 'sparkle' | 'star' | 'globe' | 'live';
};

export const catalogue: readonly CatalogueEntry[] = [
  c({ id: 'k1', photo: photos.explore[0], kind: 'course', title: 'Mathematics Complete Course', board: 'UNEB', country: 'Uganda', level: 'Upper secondary', subject: 'Mathematics', teacher: 'Mr. James Kato', rating: 4.8, reviews: 2100, priceUGX: 120000, wasUGX: 160000, meta: 'UNEB · S4–S6', badge: 'Bestseller', hours: '32 hours', tint: '#1E3A8A', icon: 'chart' }),
  c({ id: 'k2', photo: photos.explore[1], kind: 'live', title: 'English Literature Analysis', board: 'IGCSE', country: 'International', level: 'Upper secondary', subject: 'English', teacher: 'Ms. Aisha Bello', rating: 4.9, reviews: 980, priceUGX: 45000, meta: 'IGCSE · Paper 1', badge: 'Live', hours: '1.5 hours', startsIn: '1 day', tint: '#7C2D12', icon: 'book' }),
  c({ id: 'k3', photo: photos.explore[2], kind: 'paper', title: 'KCSE Past Papers (2010–2024)', board: 'KCSE', country: 'Kenya', level: 'Upper secondary', subject: 'Mathematics', teacher: 'Maple Editorial Team', rating: 4.7, reviews: 3200, priceUGX: 30000, meta: 'Form 4', badge: 'Past papers', hours: '50 papers', tint: '#475569', icon: 'book' }),
  c({ id: 'k4', photo: photos.explore[3], kind: 'course', title: 'Biology: Human Systems', board: 'WAEC', country: 'West Africa', level: 'Upper secondary', subject: 'Biology', teacher: 'Dr. Grace Njeri', rating: 4.8, reviews: 1100, priceUGX: 90000, meta: 'WAEC · SS2', badge: 'Course', hours: '40 hours', tint: '#0E7490', icon: 'sparkle' }),
  c({ id: 'k5', photo: photos.explore[4], kind: 'bootcamp', title: 'Chemistry Revision Bootcamp', board: 'Cambridge', country: 'International', level: 'A level', subject: 'Chemistry', teacher: 'Dr. Michael Tan', rating: 4.8, reviews: 740, priceUGX: 70000, meta: 'A Level · Cambridge', badge: 'Bootcamp', hours: '30 hours', tint: '#334155', icon: 'star' }),
  c({ id: 'k6', photo: photos.explore[5], kind: 'short', title: 'Introduction to Python', board: 'Any', country: 'International', level: 'Any level', subject: 'Computer Studies', teacher: 'Mr. Daniel Okello', rating: 4.6, reviews: 3400, priceUGX: 0, meta: 'Beginner · All curricula', badge: 'Free', hours: '6 hours', tint: '#111827', icon: 'globe' }),
  c({ id: 'k7', photo: photos.explore[6], kind: 'course', title: 'Physics for Beginners', board: 'KCSE', country: 'Kenya', level: 'Lower secondary', subject: 'Physics', teacher: 'Ms. Linda Akello', rating: 4.7, reviews: 820, priceUGX: 60000, meta: 'KCSE · Form 3', badge: 'Course', hours: '50 hours', tint: '#1F2937', icon: 'sparkle' }),
  c({ id: 'k8', photo: photos.explore[7], kind: 'live', title: 'Maths Problem Solving Class', board: 'UNEB', country: 'Uganda', level: 'Upper secondary', subject: 'Mathematics', teacher: 'Mr. Kato', rating: 4.9, reviews: 810, priceUGX: 35000, meta: 'UNEB · S5', badge: 'Live', hours: '30 hours', tint: '#7F1D1D', icon: 'live' }),
  c({ id: 'k9', photo: photos.explore[2], kind: 'paper', title: 'PLE Mathematics Papers (2015–2025)', board: 'UNEB', country: 'Uganda', level: 'Primary', subject: 'Mathematics', teacher: 'Maple Editorial Team', rating: 4.8, reviews: 2600, priceUGX: 20000, meta: 'Primary 7 · with marking guides', badge: 'Past papers', hours: '11 papers', tint: '#475569', icon: 'book' }),
  c({ id: 'k10', photo: photos.explore[0], kind: 'course', title: 'Complete Mathematics for Primary 7', board: 'UNEB', country: 'Uganda', level: 'Primary', subject: 'Mathematics', teacher: 'Mr. James Kato', rating: 4.8, reviews: 2340, priceUGX: 120000, wasUGX: 160000, meta: 'UNEB · Primary 7', badge: 'Bestseller', hours: '40 hours', tint: '#1E40AF', icon: 'chart' }),
  c({ id: 'k11', photo: photos.explore[4], kind: 'bootcamp', title: 'UCE Biology Revision Bootcamp', board: 'UNEB', country: 'Uganda', level: 'Lower secondary', subject: 'Biology', teacher: 'Ms. Grace Atim', rating: 4.9, reviews: 430, priceUGX: 35000, meta: 'UNEB · S4', badge: 'Bootcamp', hours: '3 hours', startsIn: '8 days', tint: '#065F46', icon: 'sparkle' }),
  c({ id: 'k12', photo: photos.explore[2], kind: 'paper', title: 'WAEC English Past Papers', board: 'WAEC', country: 'West Africa', level: 'Upper secondary', subject: 'English', teacher: 'Maple Editorial Team', rating: 4.6, reviews: 1500, priceUGX: 25000, meta: 'SS3 · with answers', badge: 'Past papers', hours: '30 papers', tint: '#475569', icon: 'book' }),
];

/** The course with a full public page; other cards open it too in design builds. */
export const catalogueCoursePage = 'complete-mathematics-primary-7';

export type ShortEntry = ShortClip & {
  photo?: number;
  meta: string;
  caption: { lead: string; highlight: string; tail: string };
  views: number;
  likes: number;
  comments: number;
  shares: number;
  tint: string;
  emoji: string;
  desc: string;
  teacherTitle: string;
  tags: readonly string[];
};

const s = (e: ShortEntry): ShortEntry => e;

export const shortsFeed = {
  topics: ['For You', 'Mathematics', 'Science', 'English', 'Exam Revision', 'Study Tips', 'Teacher Stories', 'Career & Life Skills', 'Motivation'],
  heroPhoto: photos.shortsHero,
  promises: ['Bite-sized learning', 'Real teachers', 'Curriculum aligned', 'Free to watch'],
  clips: [
    s({ id: 's1', photo: photos.shorts[0], title: 'Multiply Fractions Easily', topic: 'Mathematics', board: 'UNEB', level: 'Primary', subject: 'Mathematics', type: 'Revision tip', language: 'English', teacher: 'Mr. James Kato', teacherTitle: 'Mathematics Teacher', meta: 'UNEB · P7', caption: { lead: 'Multiply', highlight: 'Fractions', tail: 'in 60 Seconds' }, views: 1200000, likes: 34000, comments: 1200, shares: 5400, tint: '#1E3A8A', emoji: '👨🏾‍🏫', desc: 'A quick and simple method to multiply fractions, with examples.', tags: ['UNEB', 'Primary 7', 'Mathematics', 'Fractions'] }),
    s({ id: 's2', photo: photos.shorts[1], title: 'Reading Comprehension Tips', topic: 'English', board: 'KCSE', level: 'Lower secondary', subject: 'English', type: 'Teacher advice', language: 'English', teacher: 'Ms. Aisha Bello', teacherTitle: 'English Teacher', meta: 'KCSE · Form 3', caption: { lead: '5 Techniques', highlight: 'for Better', tail: 'Comprehension' }, views: 856000, likes: 21000, comments: 640, shares: 2100, tint: '#7C2D12', emoji: '👩🏽‍🏫', desc: 'Five habits that help you answer comprehension questions faster.', tags: ['KCSE', 'Form 3', 'English'] }),
    s({ id: 's3', photo: photos.shorts[2], title: 'Parts of a Human Cell', topic: 'Science', board: 'IGCSE', level: 'Lower secondary', subject: 'Biology', type: 'Concept explanation', language: 'English', teacher: 'Dr. Grace Njeri', teacherTitle: 'Biology Teacher', meta: 'IGCSE · Grade 9', caption: { lead: 'The', highlight: 'Human Cell', tail: 'in 60 Seconds' }, views: 1800000, likes: 42000, comments: 1900, shares: 8800, tint: '#0E7490', emoji: '🧫', desc: 'Every organelle you need for the exam, in one minute.', tags: ['IGCSE', 'Grade 9', 'Biology'] }),
    s({ id: 's4', photo: photos.shorts[3], title: 'Balance Equations Fast', topic: 'Science', board: 'WAEC', level: 'Upper secondary', subject: 'Chemistry', type: 'Concept explanation', language: 'English', teacher: 'Dr. Ahmed Hassan', teacherTitle: 'Chemistry Teacher', meta: 'WAEC · SS2', caption: { lead: 'Balancing', highlight: 'Chemical', tail: 'Equations' }, views: 920000, likes: 28000, comments: 870, shares: 3100, tint: '#334155', emoji: '🥽', desc: 'The atom-counting trick that balances any equation.', tags: ['WAEC', 'SS2', 'Chemistry'] }),
    s({ id: 's5', photo: photos.shorts[4], title: 'Study Smarter', topic: 'Study Tips', board: 'Any', level: 'Any level', subject: 'Study skills', type: 'Teacher advice', language: 'English', teacher: 'Ms. Laila Chen', teacherTitle: 'Learning Coach', meta: 'All levels', caption: { lead: 'How to', highlight: 'Study Smarter', tail: 'Not Harder' }, views: 643000, likes: 18000, comments: 520, shares: 4200, tint: '#3F3F46', emoji: '📚', desc: 'Spaced practice and self-testing beat re-reading.', tags: ['Study tips'] }),
    s({ id: 's6', photo: photos.shorts[5], title: "Newton's Three Laws", topic: 'Science', board: 'Cambridge', level: 'A level', subject: 'Physics', type: 'Concept explanation', language: 'English', teacher: 'Dr. Michael Tan', teacherTitle: 'Physics Teacher', meta: 'A Level', caption: { lead: "Newton's", highlight: 'Laws', tail: 'in 60s' }, views: 1100000, likes: 30000, comments: 990, shares: 3600, tint: '#1F2937', emoji: '🍎', desc: 'All three laws with everyday examples.', tags: ['A Level', 'Physics'] }),
    s({ id: 's7', photo: photos.shorts[6], title: 'PLE 2023 Q5 Solution', topic: 'Exam Revision', board: 'UNEB', level: 'Primary', subject: 'Mathematics', type: 'Past paper solution', language: 'English', teacher: 'Mr. Daniel Okello', teacherTitle: 'Mathematics Teacher', meta: 'UNEB · P7', caption: { lead: '2023 PLE', highlight: 'Maths Q5', tail: 'Fully Solved' }, views: 2300000, likes: 55000, comments: 3100, shares: 12000, tint: '#475569', emoji: '📝', desc: 'Step-by-step marking-scheme answer to PLE 2023 question 5.', tags: ['UNEB', 'PLE', 'Past paper'] }),
    s({ id: 's8', photo: photos.shorts[7], title: 'Map Reading Skills', topic: 'Exam Revision', board: 'KCSE', level: 'Upper secondary', subject: 'Geography', type: 'Revision tip', language: 'English', teacher: 'Ms. Sarah Kim', teacherTitle: 'Geography Teacher', meta: 'KCSE · Form 4', caption: { lead: 'Map', highlight: 'Reading', tail: 'Made Easy' }, views: 780000, likes: 19000, comments: 410, shares: 1800, tint: '#065F46', emoji: '🗺️', desc: 'Grid references and scale in under a minute.', tags: ['KCSE', 'Geography'] }),
    s({ id: 's9', photo: photos.shorts[8], title: 'Python for Beginners', topic: 'Career & Life Skills', board: 'Any', level: 'Any level', subject: 'ICT & Coding', type: 'Concept explanation', language: 'English', teacher: 'Mr. David Ouma', teacherTitle: 'Coding Teacher', meta: 'Beginner', caption: { lead: 'Python', highlight: 'Basics', tail: 'in 60 Seconds' }, views: 1500000, likes: 41000, comments: 2200, shares: 9300, tint: '#111827', emoji: '🐍', desc: 'Your first program: variables, print and a loop.', tags: ['Coding', 'Beginner'] }),
    s({ id: 's10', photo: photos.shorts[9], title: 'Keep Going', topic: 'Motivation', board: 'Any', level: 'Any level', subject: 'Study skills', type: 'Student story', language: 'French', teacher: 'Ms. Faith Achieng', teacherTitle: 'Counsellor', meta: 'All learners', caption: { lead: 'Your', highlight: 'Dreams', tail: 'Are Possible' }, views: 980000, likes: 27000, comments: 1500, shares: 6100, tint: '#581C87', emoji: '🌟', desc: 'A former learner on failing a mock and passing the real exam.', tags: ['Motivation'] }),
  ],
  trending: [
    { title: 'Top 10 Algebra Tips', views: 1900000 },
    { title: 'Cell Division Explained', views: 1600000 },
    { title: 'Essay Writing Structure', views: 1400000 },
    { title: 'Organic Chemistry Tips', views: 1200000 },
    { title: 'Time Management for Students', views: 1100000 },
  ],
  courseSlug: 'complete-mathematics-primary-7',
};

export const teacherStorefront = {
  handle: 'sarah-kimani',
  bannerPhoto: photos.teacherBanner,
  avatar: photos.teacherAvatar,
  name: 'Ms. Sarah Kimani',
  title: 'Mathematics Teacher and Curriculum Creator',
  online: true,
  introLength: '1:48',
  quotes: ['Helping students build confidence in Mathematics.', 'Better students. Brighter futures.'],
  badges: [
    { label: 'MSc Education', icon: 'school' as const },
    { label: 'Certified Teacher', icon: 'check' as const },
    { label: '10+ Years Experience', icon: 'clock' as const },
    { label: 'Verified by Maple', icon: 'check' as const },
  ],
  tags: ['Mathematics', 'Exam Preparation', 'Problem Solving', 'STEM', 'Mentoring'],
  stats: [
    { value: '25K+', label: 'Students taught', icon: 'people' as const },
    { value: '96%', label: 'Exam pass rate', icon: 'chart' as const },
    { value: '4.9', label: '2,340 reviews', icon: 'star' as const },
    { value: '15+', label: 'Countries', icon: 'globe' as const },
  ],
  tabs: ['Overview', 'Courses (8)', 'Live Classes', 'Maple Shorts (42)', 'Reviews (2.3K)', 'Achievements', 'About'],
  about: [
    "Hi! I'm Sarah, a Mathematics teacher with over 10 years helping students across East Africa build strong foundations, prepare for exams and solve real problems.",
    "My teaching is practical, engaging and focused on your success. Whether you're preparing for UNEB, KCSE or IGCSE, or just want more confidence, I'm here to help every step of the way.",
  ],
  highlights: ['Clear explanations', 'Step-by-step problem solving', 'Real past paper practice', 'Supportive learning community', 'Interactive lessons', 'Proven results'],
  credentials: [
    { title: 'MSc in Mathematics Education', detail: 'University of Nairobi', icon: 'school' as const },
    { title: 'Certified Teacher', detail: 'Teachers Service Commission (Kenya)', icon: 'check' as const },
    { title: 'Mathematics Specialist', detail: 'Primary and Secondary', icon: 'chart' as const },
    { title: 'Background Checked', detail: 'Verified by Maple', icon: 'lock' as const },
  ],
  booking: {
    modes: [
      { key: 'one', label: '1:1 Tutoring', title: '1:1 Online Tutoring', priceUGX: 25000, minutes: 50 },
      { key: 'group', label: 'Group Class', title: 'Small Group Class (up to 6)', priceUGX: 12000, minutes: 60 },
    ],
    days: [
      { key: 'mon', day: 'Mon', date: 'Nov 3', slots: ['9:00 AM', '11:00 AM', '2:00 PM'] },
      { key: 'tue', day: 'Tue', date: 'Nov 4', slots: ['9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM'] },
      { key: 'wed', day: 'Wed', date: 'Nov 5', slots: ['10:00 AM', '4:00 PM'] },
      { key: 'thu', day: 'Thu', date: 'Nov 6', slots: [] as string[] },
      { key: 'fri', day: 'Fri', date: 'Nov 7', slots: ['9:00 AM', '1:00 PM', '3:00 PM'] },
    ],
  },
  courses: [
    { title: 'Complete Mathematics for Primary 7 (2024 Curriculum)', photo: photos.teacherCourses[0], meta: 'UNEB · Primary 7', rating: 4.9, reviews: '4.9K', lessons: 40, hours: 12, priceUGX: 120000, wasUGX: 160000, badge: 'Bestseller', tint: '#1E3A8A' },
    { title: 'IGCSE Mathematics Exam Preparation', photo: photos.teacherCourses[1], meta: 'IGCSE · Secondary', rating: 4.8, reviews: '660', lessons: 30, hours: 10, priceUGX: 100000, wasUGX: 0, badge: '', tint: '#334155' },
    { title: 'Problem Solving Masterclass', photo: photos.teacherCourses[2], meta: 'All levels', rating: 4.9, reviews: '540', lessons: 36, hours: 10, priceUGX: 70000, wasUGX: 0, badge: '', tint: '#065F46' },
  ],
  shorts: [
    { id: 's1', photo: photos.teacherShorts[0], lead: 'Simplify', highlight: 'Fractions', tail: 'in 60 Seconds', views: '125K', tint: '#7C2D12' },
    { id: 's5', photo: photos.teacherShorts[1], lead: '3 Tips', highlight: 'for Exam', tail: 'Success', views: '98K', tint: '#1E3A8A' },
    { id: 's7', photo: photos.teacherShorts[2], lead: 'Algebra', highlight: 'Made', tail: 'Easy', views: '87K', tint: '#581C87' },
  ],
  reviews: [
    { name: 'Amina N.', where: 'Uganda · Primary 7', text: 'Her explanations are so clear. I improved from 62% to 89%!' },
    { name: 'David O.', where: 'Kenya · IGCSE', text: 'The past paper sessions helped me so much. Highly recommend.' },
    { name: 'Grace L.', where: 'Nigeria · SS2', text: 'I love the short revision clips. They make maths simple and fun.' },
    { name: 'Michael T.', where: 'Ghana · A Level', text: 'Her problem-solving methods are practical and effective.' },
  ],
  rating: 4.9,
  reviewCount: 2340,
  courseSlug: 'complete-mathematics-primary-7',
};

export const liveSession = {
  slug: 'p7-maths-revision-bootcamp',
  photo: photos.liveHero,
  badge: 'Live bootcamp',
  breadcrumb: ['Live Classes', 'UNEB (Uganda)', 'Mathematics'],
  title: { lead: 'Primary 7 Mathematics', accent: 'Revision Bootcamp' },
  sub: 'Master exam techniques, past paper strategies and difficult topics with real-time guidance and practice.',
  // Saturday 7 November 2026, 10:00 EAT (07:00 UTC), for two hours.
  startUTC: Date.UTC(2026, 10, 7, 7, 0, 0),
  minutes: 120,
  when: { day: 'Saturday, Nov 7, 2026', time: '10:00 AM – 12:00 PM EAT' },
  where: { title: 'Live on Maple', detail: 'Interactive Classroom' },
  level: { title: 'Primary 7', detail: 'UNEB (Uganda)' },
  booked: 82,
  capacity: 100,
  priceUGX: 40000,
  wasUGX: 60000,
  access: 'One-time access · Includes recording + materials',
  perks: [
    { label: '30-day access to recording', icon: 'clock' as const },
    { label: 'Downloadable study notes', icon: 'download' as const },
    { label: 'Certificate of participation', icon: 'star' as const },
  ],
  features: [
    { title: 'Past paper practice', detail: 'With marking guidance', icon: 'book' as const },
    { title: 'Exam techniques', detail: 'Tips from expert teachers', icon: 'sparkle' as const },
    { title: 'Live Q&A', detail: 'Ask questions in real time', icon: 'chat' as const },
    { title: 'Lesson recording', detail: 'Available for 30 days', icon: 'play' as const },
    { title: 'Revision materials', detail: 'Downloadable resources', icon: 'download' as const },
  ],
  about: 'This intensive 2-hour revision bootcamp helps Primary 7 learners master the most important Mathematics topics, using real UNEB past paper questions, step-by-step solutions and exam strategies.',
  aboutPoints: ['Focus on frequently tested topics', 'Work through real past paper questions', 'Learn simple and effective exam techniques', 'Get your questions answered live', 'Receive downloadable revision notes', 'Session recording available for 30 days'],
  forWho: 'Primary 7 learners preparing for PLE, teachers supporting revision, and parents who want their children to succeed.',
  syllabus: [
    { title: 'Number operations and problem solving', detail: 'Master key methods and avoid common mistakes.', icon: 'chart' as const, minutes: 20 },
    { title: 'Fractions, decimals and percentages', detail: 'Simplify, compare and solve exam-style questions.', icon: 'star' as const, minutes: 20 },
    { title: 'Measurement and geometry', detail: 'Understand shapes, units and practical questions.', icon: 'map' as const, minutes: 20 },
    { title: 'Data handling', detail: 'Read graphs, tables and charts with confidence.', icon: 'chart' as const, minutes: 15 },
    { title: 'UNEB past paper practice', detail: 'Work through real questions with full solutions.', icon: 'book' as const, minutes: 30 },
    { title: 'Exam tips and time management', detail: 'Proven strategies to score higher.', icon: 'clock' as const, minutes: 15 },
  ],
  teacher: {
    name: 'Ms. Sarah Kimani',
    handle: 'sarah-kimani',
    photo: photos.teacherAvatar,
    title: 'Mathematics Teacher and Curriculum Specialist',
    badges: ['MSc Education', '10+ Years Experience', 'Verified by Maple'],
    stats: [{ value: '25K+', label: 'Students taught' }, { value: '96%', label: 'Average pass rate' }, { value: '4.9', label: '1,240 reviews' }],
    bio: 'Ms. Sarah is a Mathematics teacher with over 10 years helping learners excel in UNEB examinations. Her teaching is practical, engaging and focused on real exam success.',
  },
  more: [
    { title: 'English P7 Revision Bootcamp', when: 'Sat, Nov 14 · 10:00 AM', priceUGX: 40000, seats: 88, status: 'live' as LiveStatus, photo: photos.liveMore[0] },
    { title: 'Science P7 Masterclass', when: 'Sun, Nov 15 · 2:00 PM', priceUGX: 40000, seats: 72, status: 'live' as LiveStatus, photo: photos.liveMore[1] },
    { title: 'Mathematics Exam Techniques', when: 'Sat, Nov 21 · 10:00 AM', priceUGX: 30000, seats: 53, status: 'soon' as LiveStatus, photo: photos.liveMore[2] },
    { title: 'Past Paper Walkthrough (2020–2024)', when: 'Sun, Nov 22 · 3:00 PM', priceUGX: 50000, seats: 91, status: 'live' as LiveStatus, photo: photos.liveMore[3] },
  ],
};

export interface PastPaperEntry {
  board: string;
  subject: string;
  year: string;
  title: string;
  boardName: string;
  exam: string;
  subjectName: string;
  crest: number | null;
  flag: string;
  level: string;
  totalMarks: number;
  duration: string;
  questions: number;
  files: string;
  q1: {
    marks: number;
    parts: readonly { label: string; text: string }[];
    figure: number | null;
    expected: readonly { part: string; value: number; marks: number }[];
    solution: readonly string[];
    hint: string;
  };
  formulae: readonly string[];
}

const paper = (p: PastPaperEntry): PastPaperEntry => p;

export const pastPaperPages = {
  boards: [
    { label: 'UNEB (Uganda)', href: '/past-papers/uneb-uce/mathematics/2025' },
    { label: 'KCSE (Kenya)', href: '/past-papers/kcse/mathematics/2024' },
    { label: 'WAEC (West Africa)', href: '/past-papers/waec/mathematics/2024' },
    { label: 'IGCSE (Cambridge)', href: '/past-papers/igcse/mathematics/2024' },
    { label: "A' Level (UACE)", href: '/past-papers/uneb-uace/mathematics/2024' },
    { label: 'Primary Leaving (PLE)', href: '/past-papers/uneb-ple/mathematics/2025' },
  ],
  subjects: ['Mathematics', 'English', 'Biology', 'Chemistry', 'Physics', 'Geography', 'History', 'Business Studies', 'ICT', 'Literature'],
  benefits: ['Interactive questions (both papers)', 'Auto-marking and detailed solutions', 'Save your progress and revision history', 'Download PDF and marking scheme', 'Exam analysis and topic breakdown', 'Related video lessons for each topic'],
  heroPhoto: photos.paperHero,
  videos: [
    { title: "Pythagoras' Theorem Explained", length: '12:34', meta: 'Mathematics · S4', photo: photos.paperVideos[0] },
    { title: 'Right-Angled Triangles Past Paper Practice', length: '18:21', meta: 'Mathematics · S4', photo: photos.paperVideos[1] },
    { title: 'Geometry Revision (Full Topic)', length: '45:12', meta: 'Mathematics · S4', photo: photos.paperVideos[2] },
  ],
  papers: [
    paper({
      board: 'uneb-uce', subject: 'mathematics', year: '2025', title: 'UNEB UCE Mathematics 2025', boardName: 'Uganda National Examinations Board', exam: 'UCE (S4)', subjectName: 'Mathematics', crest: photos.paperCrest, flag: '🇺🇬', level: 'UCE (S4)', totalMarks: 100, duration: '2 hours 30 minutes', questions: 17, files: 'Paper 1, Paper 2, Marking Scheme',
      q1: {
        marks: 10,
        parts: [
          { label: '(a)', text: 'In the figure below, triangle ABC is such that AB = 6 cm, BC = 8 cm and ∠ABC = 90°. Find the length of AC.' },
          { label: '(b)', text: 'Use your answer in (a) to find the area of triangle ABC.' },
        ],
        figure: photos.paperQ1Figure,
        expected: [{ part: '(a)', value: 10, marks: 5 }, { part: '(b)', value: 24, marks: 5 }],
        solution: ['(a) AC² = AB² + BC² = 6² + 8² = 36 + 64 = 100, so AC = 10 cm.', '(b) Area = ½ × base × height = ½ × 8 × 6 = 24 cm².'],
        hint: 'Angle B is a right angle, so Pythagoras applies: AC² = AB² + BC².',
      },
      formulae: ['Pythagoras: c² = a² + b²', 'Area of a triangle = ½ × base × height', 'Area of a circle = πr²', 'Gradient = (y₂ − y₁) ÷ (x₂ − x₁)'],
    }),
    paper({
      board: 'uneb-ple', subject: 'mathematics', year: '2025', title: 'UNEB PLE Mathematics 2025', boardName: 'Uganda National Examinations Board', exam: 'PLE (P7)', subjectName: 'Mathematics', crest: photos.paperCrest, flag: '🇺🇬', level: 'PLE (P7)', totalMarks: 100, duration: '2 hours 30 minutes', questions: 32, files: 'Question paper, Marking guide',
      q1: { marks: 2, parts: [{ label: '', text: 'Work out: 3/4 + 2/3. Give your answer as a mixed number.' }], figure: null, expected: [{ part: 'Answer', value: 1, marks: 1 }, { part: 'Fraction part', value: 5, marks: 1 }], solution: ['3/4 + 2/3 = 9/12 + 8/12 = 17/12 = 1 5/12.'], hint: 'Find a common denominator first: 12 works for 4 and 3.' },
      formulae: ['Area of a rectangle = length × width', 'Perimeter = sum of all sides', 'Simple interest = P × R × T ÷ 100'],
    }),
    paper({
      board: 'uneb-uace', subject: 'mathematics', year: '2024', title: 'UNEB UACE Mathematics 2024', boardName: 'Uganda National Examinations Board', exam: 'UACE (S6)', subjectName: 'Mathematics', crest: photos.paperCrest, flag: '🇺🇬', level: 'UACE (S6)', totalMarks: 120, duration: '3 hours', questions: 16, files: 'Paper 1, Paper 2, Marking Scheme',
      q1: { marks: 5, parts: [{ label: '', text: 'Solve the equation 2x² − 7x + 3 = 0.' }], figure: null, expected: [{ part: 'x = 3', value: 3, marks: 3 }, { part: 'x = ½', value: 0.5, marks: 2 }], solution: ['(2x − 1)(x − 3) = 0, so x = ½ or x = 3.'], hint: 'Factorise: look for two numbers that multiply to 6 and add to −7.' },
      formulae: ['x = (−b ± √(b² − 4ac)) ÷ 2a', 'd/dx(xⁿ) = nxⁿ⁻¹', '∫xⁿ dx = xⁿ⁺¹ ÷ (n + 1) + C'],
    }),
    paper({
      board: 'kcse', subject: 'mathematics', year: '2024', title: 'KCSE Mathematics 2024', boardName: 'Kenya National Examinations Council', exam: 'KCSE (Form 4)', subjectName: 'Mathematics', crest: null, flag: '🇰🇪', level: 'KCSE (Form 4)', totalMarks: 100, duration: '2 hours 30 minutes', questions: 24, files: 'Paper 1, Paper 2, Marking Scheme',
      q1: { marks: 3, parts: [{ label: '', text: 'Evaluate (−12 ÷ 3 + 8 × 2) ÷ (6 − 2 × 5).' }], figure: null, expected: [{ part: 'Answer', value: -3, marks: 3 }], solution: ['Top: −4 + 16 = 12. Bottom: 6 − 10 = −4. So 12 ÷ −4 = −3.'], hint: 'Work out the top and the bottom separately, using BODMAS.' },
      formulae: ['Area of a trapezium = ½(a + b)h', 'Volume of a cylinder = πr²h', 'Compound interest: A = P(1 + r/100)ⁿ'],
    }),
    paper({
      board: 'waec', subject: 'mathematics', year: '2024', title: 'WAEC Mathematics 2024', boardName: 'West African Examinations Council', exam: 'WASSCE (SS3)', subjectName: 'Mathematics', crest: null, flag: '🌍', level: 'WASSCE (SS3)', totalMarks: 100, duration: '2 hours 30 minutes', questions: 13, files: 'Objective, Theory, Marking Scheme',
      q1: { marks: 4, parts: [{ label: '', text: 'Simplify 2⁵ × 2³ ÷ 2⁴.' }], figure: null, expected: [{ part: 'Answer', value: 16, marks: 4 }], solution: ['2⁵⁺³⁻⁴ = 2⁴ = 16.'], hint: 'When multiplying powers of the same base, add the indices; when dividing, subtract.' },
      formulae: ['aᵐ × aⁿ = aᵐ⁺ⁿ', 'aᵐ ÷ aⁿ = aᵐ⁻ⁿ', 'Sum of angles in a triangle = 180°'],
    }),
    paper({
      board: 'igcse', subject: 'mathematics', year: '2024', title: 'Cambridge IGCSE Mathematics 2024', boardName: 'Cambridge Assessment International Education', exam: 'IGCSE (Extended)', subjectName: 'Mathematics', crest: null, flag: '🇬🇧', level: 'IGCSE (Extended)', totalMarks: 130, duration: '2 hours', questions: 22, files: 'Paper 2, Paper 4, Mark Scheme',
      q1: { marks: 2, parts: [{ label: '', text: 'Write 0.000 4507 in standard form.' }], figure: null, expected: [{ part: 'Number', value: 4.507, marks: 1 }, { part: 'Power', value: -4, marks: 1 }], solution: ['0.000 4507 = 4.507 × 10⁻⁴.'], hint: 'Move the decimal point until there is one non-zero digit before it, and count the moves.' },
      formulae: ['Standard form: a × 10ⁿ, where 1 ≤ a < 10', 'Speed = distance ÷ time', 'sin θ = opposite ÷ hypotenuse'],
    }),
  ] as readonly PastPaperEntry[],
};
