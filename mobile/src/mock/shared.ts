/** Fixtures for screens that open over any portal (design builds only; never bundled in deployment). */

import type { MicState } from '@/lib/classroom';

import { photos } from './photos';

export const copilot = {
  context: 'S3 Mathematics · Quadratic equations',
  suggestions: ['Explain factorising step by step', 'Give me 3 practice questions', 'Where did I go wrong in question 4?'],
  conversation: [
    { from: 'learner', text: 'How do I solve x² − 5x + 6 = 0?' },
    { from: 'maple', text: 'Look for two numbers that multiply to 6 and add to −5. Which pair works?' },
    { from: 'learner', text: '−2 and −3?' },
    { from: 'maple', text: 'Yes. So (x − 2)(x − 3) = 0, which means x = 2 or x = 3. Want to try one on your own?' },
  ],
  note: 'Maple guides you to the answer rather than giving it. Teachers can see what you asked.',
};

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
    { name: 'Ms. Sarah Kimani', role: 'teacher' as const, mic: 'on' as MicState, hand: false, note: 'Teacher, host', photo: face(0) },
    { name: 'Daniel Okello', role: 'student' as const, mic: 'off' as MicState, hand: true, note: 'Student', photo: face(1) },
    { name: 'Aisha Bello', role: 'student' as const, mic: 'on' as MicState, hand: false, note: 'Student', photo: face(2) },
    { name: 'Brian Turyamureba', role: 'student' as const, mic: 'muted' as MicState, hand: true, note: 'Student', photo: face(3) },
    { name: 'Grace Nambatya', role: 'student' as const, mic: 'muted' as MicState, hand: false, note: 'Student', photo: face(4) },
    { name: 'Ivan Ssemanda', role: 'student' as const, mic: 'muted' as MicState, hand: true, note: 'Student', photo: face(5) },
  ],
  chat: [
    { who: 'Aisha Bello', at: '10:23 AM', text: 'Thank you teacher, that makes sense! 🙌', photo: face(2), teacher: false },
    { who: 'Daniel Okello', at: '10:24 AM', text: 'Can we also try one with mixed numbers?', photo: face(1), teacher: false },
    { who: 'Mariam Ndagire', at: '10:25 AM', text: 'Yes please 🙏', photo: face(4), teacher: false },
    { who: 'Ivan Ssemanda', at: '10:25 AM', text: 'I still find it hard to get the common denominator.', photo: face(5), teacher: false },
    { who: 'Ms. Sarah Kimani', at: '10:26 AM', text: "Great question Ivan. Let's do another example together now.", photo: face(0), teacher: true },
  ],
  chatCount: 12,
  transcript: [
    { at: '10:12', who: 'Ms. Sarah Kimani', text: 'Today we are going to learn how to add and subtract fractions.' },
    { at: '10:18', who: '', text: 'First, we need a common denominator. This is the smallest number that both denominators can divide into.' },
    { at: '10:25', who: '', text: 'For example, for 3/4 and 2/3, the common denominator is 12.' },
    { at: '10:31', who: '', text: 'So we convert 3/4 to 9/12 and 2/3 to 8/12.' },
    { at: '10:36', who: '', text: 'Now we add the numerators: 9/12 + 8/12 = 17/12.' },
    { at: '10:43', who: '', text: 'Since 17/12 is an improper fraction, we change it to a mixed number: 1 5/12.' },
    { at: '10:46', who: '', text: "Let's try another example together." },
  ],
  notes: {
    title: 'Fractions: Adding and Subtracting',
    steps: ['Find a common denominator (LCM).', 'Convert each fraction to the common denominator.', 'Add or subtract the numerators.', 'Simplify the answer.', 'Change to a mixed number if needed.'],
    keyPoint: 'When adding or subtracting fractions, the denominator must be the same.',
    examples: ['3/4 + 2/3 = 17/12 = 1 5/12', '5/6 – 1/4 = 7/12'],
  },
  assignments: [
    { title: 'Practice Questions 1', kind: 'Homework', due: 'Due: Nov 8, 2026 · 11:59 PM', tint: '#2F6BFF', soft: '#EAF1FF', status: 'todo' as const },
    { title: 'Past Paper Section A', kind: 'Past Paper', due: 'Due: Nov 10, 2026 · 11:59 PM', tint: '#F97316', soft: '#FFEDD5', status: 'todo' as const },
    { title: 'Fractions Mini Quiz', kind: 'Quiz', due: 'Due: Nov 8, 2026 · 5:00 PM', tint: '#8B5CF6', soft: '#EFEBFF', status: 'todo' as const },
  ],
};
