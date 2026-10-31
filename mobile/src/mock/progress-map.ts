/**
 * Sample data for the learner's Learning Progress page: seven subjects, each with a skill tree
 * (root, branch topics with key skills, capstone), plus learning time, goals and achievements.
 * Tree colours are worked out by lib/progress.ts from the counts, accuracy and prerequisites.
 */
import type { Leaf, SkillTree } from '@/lib/progress';

import { photos } from './photos';

const p = (n: string): number => photos.progress[n];
const m = (id: string, name: string, extra: Partial<Leaf> = {}): Leaf => ({ id, name, mastered: true, ...extra });
const o = (id: string, name: string, extra: Partial<Leaf> = {}): Leaf => ({ id, name, mastered: false, ...extra });

const maths: SkillTree = {
  root: { id: 'root', name: 'Numbers & Number Systems', done: 8, total: 8 },
  topics: [
    { id: 'fractions', name: 'Fractions & Decimals', done: 6, total: 6, accuracy: 88, prereq: ['root'], leaves: [m('equiv', 'Equivalent Fractions'), m('ops', 'Operations with Fractions'), m('decimals', 'Decimals'), m('word', 'Fraction Word Problems', { due: true })] },
    { id: 'percentages', name: 'Percentages', done: 4, total: 6, accuracy: 52, prereq: ['root'], leaves: [o('pct-calc', 'Percentage Calculations', { started: true, accuracy: 72 }), o('real-life', 'Real-life Applications', { after: 'pct-calc' })] },
    { id: 'ratio', name: 'Ratio & Proportion', done: 3, total: 6, accuracy: 74, prereq: ['root'], leaves: [] },
    { id: 'algebra', name: 'Algebra Basics', done: 0, total: 8, accuracy: 0, prereq: ['root', 'percentages'], leaves: [o('expr', 'Expressions & Simplification'), o('linear', 'Linear Equations'), o('ineq', 'Inequalities'), o('functions', 'Functions')] },
  ],
  capstone: { id: 'advanced', name: 'Algebra Advanced', done: 0, total: 12, prereq: ['algebra', 'ratio'] },
};

const english: SkillTree = {
  root: { id: 'root', name: 'Reading Foundations', done: 6, total: 6 },
  topics: [
    { id: 'grammar', name: 'Grammar & Usage', done: 6, total: 6, accuracy: 86, prereq: ['root'], leaves: [m('tenses', 'Tenses'), m('punctuation', 'Punctuation'), o('letters', 'Letter Writing', { started: true, accuracy: 50 })] },
    { id: 'comprehension', name: 'Comprehension', done: 4, total: 6, accuracy: 70, prereq: ['root'], leaves: [o('main-idea', 'Finding the Main Idea', { started: true, accuracy: 74 }), o('inference', 'Inference', { after: 'main-idea' })] },
    { id: 'composition', name: 'Composition', done: 2, total: 6, accuracy: 55, prereq: ['root'], leaves: [] },
    { id: 'literature', name: 'Literature', done: 0, total: 6, accuracy: 0, prereq: ['root', 'comprehension'], leaves: [o('poetry', 'Poetry'), o('novels', 'Novels & Plays')] },
  ],
  capstone: { id: 'advanced', name: 'Advanced Writing', done: 0, total: 8, prereq: ['composition', 'literature'] },
};

const science: SkillTree = {
  root: { id: 'root', name: 'Scientific Skills', done: 6, total: 6 },
  topics: [
    { id: 'living', name: 'Living Things', done: 5, total: 5, accuracy: 84, prereq: ['root'], leaves: [m('cells', 'Cells'), m('classification', 'Classification', { due: true }), o('digestion', 'Digestion', { started: true, accuracy: 55 })] },
    { id: 'matter', name: 'Matter & Energy', done: 3, total: 6, accuracy: 68, prereq: ['root'], leaves: [o('states', 'States of Matter', { started: true, accuracy: 70 }), o('heat', 'Heat Transfer', { after: 'states' })] },
    { id: 'body', name: 'Human Body', done: 2, total: 5, accuracy: 52, prereq: ['root'], leaves: [] },
    { id: 'forces', name: 'Forces & Machines', done: 0, total: 6, accuracy: 0, prereq: ['root', 'matter'], leaves: [o('levers', 'Levers'), o('pulleys', 'Pulleys')] },
  ],
  capstone: { id: 'advanced', name: 'Electricity', done: 0, total: 10, prereq: ['forces', 'body'] },
};

const social: SkillTree = {
  root: { id: 'root', name: 'Location of Uganda', done: 5, total: 5 },
  topics: [
    { id: 'features', name: 'Physical Features', done: 5, total: 5, accuracy: 82, prereq: ['root'], leaves: [m('relief', 'Relief'), m('drainage', 'Drainage'), o('ethnic', 'Ethnic Groups', { started: true, accuracy: 54 })] },
    { id: 'climate', name: 'Climate', done: 3, total: 6, accuracy: 64, prereq: ['root'], leaves: [o('weather', 'Weather Instruments', { started: true, accuracy: 66 }), o('zones', 'Climate Zones', { after: 'weather' })] },
    { id: 'people', name: 'People & Culture', done: 2, total: 5, accuracy: 58, prereq: ['root'], leaves: [] },
    { id: 'economy', name: 'Economic Activities', done: 0, total: 6, accuracy: 0, prereq: ['root', 'climate'], leaves: [o('farming', 'Farming'), o('trade', 'Trade')] },
  ],
  capstone: { id: 'advanced', name: 'East African Community', done: 0, total: 8, prereq: ['economy', 'people'] },
};

const ict: SkillTree = {
  root: { id: 'root', name: 'Computer Basics', done: 6, total: 6 },
  topics: [
    { id: 'word', name: 'Word Processing', done: 4, total: 4, accuracy: 90, prereq: ['root'], leaves: [m('format', 'Formatting'), m('tables', 'Tables'), o('formulas', 'Formulas', { started: true, accuracy: 45 })] },
    { id: 'safety', name: 'Internet Safety', done: 3, total: 5, accuracy: 80, prereq: ['root'], leaves: [m('passwords', 'Strong Passwords'), o('privacy', 'Privacy Settings', { started: true, accuracy: 78 })] },
    { id: 'sheets', name: 'Spreadsheets', done: 2, total: 6, accuracy: 50, prereq: ['root'], leaves: [] },
    { id: 'coding', name: 'Coding Basics', done: 0, total: 6, accuracy: 0, prereq: ['root', 'sheets'], leaves: [o('blocks', 'Block Coding'), o('loops', 'Loops')] },
  ],
  capstone: { id: 'advanced', name: 'Building Websites', done: 0, total: 8, prereq: ['coding', 'safety'] },
};

const exam: SkillTree = {
  root: { id: 'root', name: 'Reading the Paper', done: 4, total: 4 },
  topics: [
    { id: 'time', name: 'Time Management', done: 4, total: 4, accuracy: 85, prereq: ['root'], leaves: [m('planning', 'Planning Answers'), m('pacing', 'Pacing', { due: true }), o('paper1', 'Paper 1 Practice', { started: true, accuracy: 70 })] },
    { id: 'answering', name: 'Answering Techniques', done: 3, total: 6, accuracy: 56, prereq: ['root'], leaves: [o('command', 'Command Words', { started: true, accuracy: 58 }), o('structure', 'Structuring Answers', { after: 'command' })] },
    { id: 'papers', name: 'Past Papers', done: 1, total: 8, accuracy: 70, prereq: ['root'], leaves: [] },
    { id: 'revision', name: 'Revision Strategy', done: 0, total: 6, accuracy: 0, prereq: ['root', 'answering'], leaves: [o('spaced', 'Spaced Revision'), o('mindmaps', 'Mind Maps')] },
  ],
  capstone: { id: 'advanced', name: 'Mock Exam Ready', done: 0, total: 4, prereq: ['revision', 'papers'] },
};

const life: SkillTree = {
  root: { id: 'root', name: 'Self-Awareness', done: 5, total: 5 },
  topics: [
    { id: 'health', name: 'Healthy Habits', done: 5, total: 5, accuracy: 88, prereq: ['root'], leaves: [m('nutrition', 'Nutrition'), m('hygiene', 'Hygiene'), o('saving', 'Saving', { started: true, accuracy: 68 })] },
    { id: 'communication', name: 'Communication', done: 4, total: 6, accuracy: 76, prereq: ['root'], leaves: [m('listening', 'Active Listening'), o('speaking', 'Public Speaking', { started: true, accuracy: 72 })] },
    { id: 'money', name: 'Money & Me', done: 2, total: 5, accuracy: 66, prereq: ['root'], leaves: [] },
    { id: 'decisions', name: 'Decision Making', done: 0, total: 5, accuracy: 0, prereq: ['root', 'communication'], leaves: [o('choices', 'Weighing Choices'), o('peer', 'Peer Pressure')] },
  ],
  capstone: { id: 'advanced', name: 'Leadership', done: 0, total: 6, prereq: ['decisions', 'money'] },
};

export const progressMap = {
  learner: 'Daniel',
  termMastered: 32,
  monthGain: 12,
  curricula: ['O-Level Curriculum', 'UNEB UCE Syllabus', 'Cambridge IGCSE'],
  subjects: [
    { name: 'Mathematics', short: 'Mathematics', done: 24, total: 48, color: '#1463F3', icon: p('subj-maths'), tree: maths },
    { name: 'English', short: 'English', done: 18, total: 42, color: '#16A34A', icon: p('subj-english'), tree: english },
    { name: 'Science', short: 'Science', done: 16, total: 44, color: '#7C3AED', icon: p('subj-science'), tree: science },
    { name: 'Social Studies', short: 'Social Studies', done: 12, total: 38, color: '#F97316', icon: p('subj-social'), tree: social },
    { name: 'ICT', short: 'ICT', done: 10, total: 32, color: '#3B82F6', icon: p('subj-ict'), tree: ict },
    { name: 'Exam Skills', short: 'Exam Skills', done: 8, total: 28, color: '#EF4444', icon: p('subj-exam'), tree: exam },
    { name: 'Life Skills', short: 'Life Skills', done: 14, total: 36, color: '#F5B800', icon: p('subj-life'), tree: life },
  ],
  /** Hours per day: video lessons, practice questions, assignments, live classes, reading. */
  activity: {
    categories: [
      { label: 'Video Lessons', color: '#3B82F6' },
      { label: 'Practice Questions', color: '#A855F7' },
      { label: 'Assignments', color: '#22A45D' },
      { label: 'Live Classes', color: '#F97316' },
      { label: 'Reading', color: '#F5B800' },
    ],
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    week: [
      [0.8, 0.4, 0.4, 0.4, 0.1],
      [1.1, 0.6, 0.4, 0.5, 0.1],
      [0.9, 0.3, 0.1, 0.5, 0.2],
      [0.7, 0.8, 0, 0.1, 0],
      [0.5, 0.4, 0.3, 0.2, 0.1],
      [0.4, 0.3, 0, 0, 0],
      [0.9, 0.5, 0, 0.8, 0.1],
    ],
    month: [
      [0.7, 0.5, 0.3, 0.4, 0.2],
      [0.9, 0.5, 0.4, 0.4, 0.1],
      [0.8, 0.4, 0.2, 0.4, 0.2],
      [0.6, 0.6, 0.2, 0.2, 0.1],
      [0.6, 0.4, 0.3, 0.3, 0.1],
      [0.5, 0.3, 0.1, 0, 0.3],
      [0.8, 0.4, 0.1, 0.6, 0.2],
    ],
  },
  goals: [
    { title: 'Master Algebra Basics', done: 0, total: 8, unit: 'skills', icon: p('subj-science'), subject: 0, node: 'algebra' },
    { title: 'Improve Exam Skills', done: 8, total: 20, unit: 'skills', icon: p('subj-exam'), subject: 5, node: 'answering' },
    { title: 'Read 2 Books This Month', done: 1, total: 2, unit: 'books', icon: p('subj-english'), subject: -1, node: '' },
  ],
  achievements: [
    { title: 'Fractions Mastery', sub: 'Completed 5 skills', when: '2 days ago', icon: p('badge-1') },
    { title: 'Consistent Learner', sub: '7 days in a row', when: '1 week ago', icon: p('badge-2') },
    { title: 'Top 10%', sub: 'In Mathematics', when: '2 weeks ago', icon: p('badge-3') },
    { title: 'Reading Champion', sub: 'Completed 10 books', when: '2 weeks ago', icon: p('badge-4') },
  ],
  history: [
    { when: 'Today, 4:10 PM', subject: 'Mathematics', title: 'Percentage Calculations', score: '7 / 10', minutes: 18 },
    { when: 'Yesterday, 6:45 PM', subject: 'Mathematics', title: 'Fraction Word Problems', score: '8 / 10', minutes: 22 },
    { when: 'Thu, 29 Oct', subject: 'English', title: 'Finding the Main Idea', score: '6 / 8', minutes: 15 },
    { when: 'Wed, 28 Oct', subject: 'Science', title: 'Digestion Quiz', score: '5 / 10', minutes: 12 },
    { when: 'Mon, 26 Oct', subject: 'Exam Skills', title: 'Command Words', score: '9 / 15', minutes: 25 },
  ],
  trophy: p('trophy'),
  milestoneIcon: p('milestone'),
};
export type ProgressMap = typeof progressMap;
