/** Sample data for marked work: Assignment 3 (an Activity of Integration), Fraction Word Problems, scored 8 / 10 with RACE. */
import { photos } from './photos';

const f = (n: string): number => photos.feedback[n];

export const assignmentFeedback = {
  id: 'a5',
  crumbs: ['Assignments', 'Mathematics', 'Fraction Word Problems', 'Feedback'],
  phoneCrumbs: ['Assignments', 'Fraction Word Problems'],
  title: 'Assignment 3: Fraction Word Problems',
  submitted: 'Submitted: Fri, 24 Oct 2026 • 11:59 PM',
  graded: 'Graded: Sun, 26 Oct 2026 • 3:24 PM',
  kind: 'Activity of Integration • Counts toward Continuous Assessment (20%)',
  verdict: 'Great work!',
  verdictText: 'You apply fractions well to real-life problems. Next: check your units and show every conversion step.',
  // Scored with RACE (NCDC): Relevance, Accuracy, Coherence 0–3 and Excellence 0–1.
  race: { relevance: 3, accuracy: 2, coherence: 3, excellence: 0 },
  raceNotes: {
    relevance: 'Every answer solves the real-life question asked.',
    accuracy: 'Q2 is missing its unit (m). In Q4, show 7/8 = 14/16 first.',
    coherence: 'Your steps lead clearly from the question to the answer.',
    excellence: 'Explain why you change to sixteenths to earn this mark.',
  },
  skillsSeen: [
    { key: 'computation' as const, id: 3 as const },
    { key: 'critical' as const, id: 3 as const },
    { key: 'communication' as const, id: 2 as const },
  ],
  valuesSeen: ['Honesty', 'Hard work for self-reliance'],
  teacher: {
    name: 'Ms. Achieng',
    role: 'Mathematics Teacher',
    graded: 'Graded on Sun, 26 Oct 2026',
    phoneGraded: 'Sun, 26 Oct 2026 • 3:24 PM',
    photo: f('teacher'),
    voiceSeconds: 204,
    comment: 'Overall, this is a strong submission! You’ve used the correct methods and shown your working clearly. Listen to my feedback above for specific tips, especially on Question 4.',
  },
  pages: [
    { image: f('page-1'), thumb: f('thumb-1'), note: null },
    { image: f('thumb-2'), thumb: f('thumb-2'), note: 'Page 2 • rough working, no corrections' },
    { image: f('thumb-3'), thumb: f('thumb-3'), note: 'Page 3 • rough working, no corrections' },
  ],
  video: {
    frame: f('video'),
    seconds: 258,
    chapters: [
      { at: 0, title: 'Overall feedback' },
      { at: 42, title: 'Question 1 – What you did well' },
      { at: 88, title: 'Question 2 – Small improvement' },
      { at: 135, title: 'Question 3 – Good method!' },
      { at: 182, title: 'Question 4 – How to fix it' },
      { at: 225, title: 'Next steps and practice' },
    ],
    transcript: [
      { at: 0, text: 'Hi Daniel, well done on this assignment. Your methods were right on every question.' },
      { at: 42, text: 'In question 1 you multiplied 2/3 by 3 and simplified 6/3 to 2 cups. Perfect.' },
      { at: 88, text: 'Question 2 is correct. Remember to write the unit, metres, with your final answer.' },
      { at: 135, text: 'Question 3: changing 3/4 to 6/8 before subtracting was exactly the right move.' },
      { at: 182, text: 'Question 4: show the step 7/8 = 14/16 before you add, so a reader can follow you.' },
      { at: 225, text: 'Try the five practice questions on adding and subtracting fractions next.' },
    ],
  },
  next: [
    { key: 'practice', title: 'Start Remedial Practice', sub: '5 practice questions on adding and subtracting fractions', action: 'Practice Now', icon: f('next-practice') },
    { key: 'chat', title: 'Ask a Follow-up Question', sub: 'Get clarification from Ms. Achieng', action: 'Open Chat', icon: f('next-chat') },
    { key: 'tutor', title: 'Book a 15-Min Tutor Session', sub: 'Get 1-on-1 help on this topic', action: 'Book Session', icon: f('next-tutor') },
  ],
  practice: [
    { text: 'Work out 1/4 + 2/4.', options: ['3/8', '3/4', '2/4', '1/2'], answer: 1 },
    { text: 'Work out 5/6 − 1/3.', options: ['1/2', '4/3', '2/3', '4/6'], answer: 0 },
    { text: 'Work out 2/5 + 3/10.', options: ['5/15', '5/10', '7/10', '1/2'], answer: 2 },
    { text: 'Work out 7/8 − 1/4.', options: ['6/4', '3/4', '6/8', '5/8'], answer: 3 },
    { text: 'Work out 3/4 + 1/8.', options: ['7/8', '4/12', '4/8', '1'], answer: 0 },
  ],
};
