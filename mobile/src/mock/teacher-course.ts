/** Sample data for the course builder reference: O-Level Mathematics, editing lesson 1.1. */
import type { IconName } from '@/lib/icons';
import type { TeacherDest } from '@/lib/teacher-home';

import { photos } from './photos';

const p = photos.courseBuilder;

export type BlockKind = 'video' | 'text' | 'image' | 'pdf' | 'quiz' | 'interactive' | 'youtube' | 'drive' | 'link' | 'discussion';

export interface BuilderLesson {
  id: string;
  title: string;
  kind: 'lesson' | 'quiz';
}

export interface BuilderModule {
  id: string;
  title: string;
  lessons: BuilderLesson[];
}

export interface ContentBlock {
  id: string;
  kind: BlockKind;
  prefix: string;
  title: string;
  meta?: string;
}

export interface Mark {
  at: number;
  label: string;
  icon: IconName;
  color: string;
}

const lessons = (m: number, titles: readonly string[]): BuilderLesson[] =>
  titles.map((title, i) => ({ id: `${m}.${i + 1}`, title, kind: title === 'Module Quiz' ? 'quiz' : 'lesson' }));

export type BuilderSection = 'setup' | 'content' | 'objectives' | 'quizzes' | 'resources' | 'pricing' | 'completion' | 'publish';

export const courseBuilder = {
  course: {
    title: 'O-Level Mathematics',
    status: 'Draft',
    description: 'Complete syllabus with interactive lessons, past paper practice, quizzes and competency tracking.',
    board: 'O-Level (Cambridge)',
    subject: 'Mathematics',
    /** The reference's headline count; it grows as lessons are added. */
    lessons: 32,
    thumb: p.thumb,
  },
  nav: [
    { key: 'setup', label: 'Course Setup', icon: 'settings' },
    { key: 'content', label: 'Content Builder', icon: 'edit' },
    { key: 'objectives', label: 'Learning Objectives', icon: 'flag' },
    { key: 'quizzes', label: 'Quizzes & Assessments', icon: 'clipboard' },
    { key: 'resources', label: 'Resources & Downloads', icon: 'download' },
    { key: 'pricing', label: 'Pricing & Access', icon: 'lock' },
    { key: 'completion', label: 'Completion Settings', icon: 'check' },
    { key: 'publish', label: 'Preview & Publish', icon: 'eye' },
  ] as { key: BuilderSection; label: string; icon: IconName }[],
  modules: [
    {
      id: 'm1',
      title: 'Number Systems',
      lessons: lessons(1, ['Place Value and Rounding', 'Factors and Multiples', 'Prime Numbers', 'HCF and LCM', 'Indices and Standard Form', 'Surds', 'Problem Solving', 'Module Quiz']),
    },
    {
      id: 'm2',
      title: 'Algebra',
      lessons: lessons(2, ['Algebraic Expressions', 'Expanding Brackets', 'Factorisation', 'Linear Equations', 'Simultaneous Equations', 'Inequalities', 'Quadratic Equations', 'Sequences', 'Functions', 'Module Quiz']),
    },
    {
      id: 'm3',
      title: 'Graphs and Geometry',
      lessons: lessons(3, ['Coordinates', 'Straight-Line Graphs', 'Quadratic Graphs', 'Angles and Polygons', 'Triangles', 'Circle Theorems', 'Pythagoras', 'Trigonometry', 'Transformations', 'Module Quiz']),
    },
  ] as BuilderModule[],
  video: { frame: p.video, length: 755 },
  marks: [
    { at: 0, label: 'Introduction', icon: 'playFill', color: '#1463F3' },
    { at: 80, label: 'Learning objectives', icon: 'flag', color: '#E5484D' },
    { at: 165, label: 'Understanding place value', icon: 'bolt', color: '#F0A000' },
    { at: 310, label: 'Worked example 1', icon: 'check', color: '#1F9D55' },
    { at: 450, label: 'Practice question (Interactive)', icon: 'hand', color: '#7C4DDB' },
    { at: 615, label: 'Common mistakes', icon: 'alert', color: '#F0A000' },
    { at: 700, label: 'Summary & next steps', icon: 'check', color: '#1F9D55' },
  ] as Mark[],
  blocks: [
    { kind: 'video', label: 'Video', icon: p.blocks.video },
    { kind: 'text', label: 'Text / Notes', icon: p.blocks.text },
    { kind: 'image', label: 'Image', icon: p.blocks.image },
    { kind: 'pdf', label: 'PDF / File', icon: p.blocks.pdf },
    { kind: 'quiz', label: 'Quiz Question', icon: p.blocks.quiz },
    { kind: 'interactive', label: 'Interactive\nActivity', icon: p.blocks.interactive },
    { kind: 'youtube', label: 'YouTube Video', icon: p.blocks.youtube },
    { kind: 'drive', label: 'Google Drive', icon: p.blocks.drive },
    { kind: 'link', label: 'Web Link', icon: p.blocks.link },
    { kind: 'discussion', label: 'Discussion\nPrompt', icon: p.blocks.discussion },
  ] as { kind: BlockKind; label: string; icon: number }[],
  /** What a newly added block of each kind starts as. */
  newBlock: {
    video: { prefix: 'Video', title: 'New video', meta: 'Upload pending' },
    text: { prefix: 'Text', title: 'New notes' },
    image: { prefix: 'Image', title: 'New image' },
    pdf: { prefix: 'PDF', title: 'New file', meta: 'Upload pending' },
    quiz: { prefix: 'Quiz', title: 'New question', meta: '1 question' },
    interactive: { prefix: 'Interactive', title: 'New activity' },
    youtube: { prefix: 'YouTube', title: 'Paste a video link' },
    drive: { prefix: 'Google Drive', title: 'Choose a Drive file' },
    link: { prefix: 'Link', title: 'Paste a web link' },
    discussion: { prefix: 'Discussion', title: 'New question for the class' },
  } as Record<BlockKind, Omit<ContentBlock, 'id' | 'kind'>>,
  content: [
    { id: 'c1', kind: 'video', prefix: 'Video', title: 'Place Value and Rounding', meta: '12:35' },
    { id: 'c2', kind: 'text', prefix: 'Text', title: 'Key Concepts and Examples' },
    { id: 'c3', kind: 'pdf', prefix: 'PDF', title: 'Place Value Worksheet', meta: '245 KB' },
    { id: 'c4', kind: 'quiz', prefix: 'Quiz', title: 'Check Your Understanding', meta: '5 questions' },
    { id: 'c5', kind: 'interactive', prefix: 'Interactive', title: 'Drag the numbers to correct place value' },
  ] as ContentBlock[],
  settings: {
    title: 'Video: Place Value and Rounding',
    types: ['Video Lesson', 'Reading', 'Quiz', 'Interactive Activity', 'Live Class'],
    duration: '12 minutes',
    completion: ['Watch at least 80%', 'Watch the whole video', 'Pass the lesson quiz', 'Open the lesson'],
    toggles: [
      { key: 'downloads', label: 'Allow downloads', icon: 'download', on: true },
      { key: 'comments', label: 'Enable comments', icon: 'chat', on: true },
      { key: 'nav', label: 'Show in course navigation', icon: 'list', on: true },
    ] as { key: string; label: string; icon: IconName; on: boolean }[],
  },
  notes: 'Place value tells us what each digit is worth. In 347,892 the 3 is worth 3 hundred thousands, the 4 is worth 4 ten thousands, and so on.\n\nRounding: look at the digit to the right of the place you are rounding to. 5 or more rounds up; 4 or less rounds down.',
  quiz: [
    { q: 'What is the value of 7 in 347,892?', a: '7,000' },
    { q: 'Round 347,892 to the nearest thousand.', a: '348,000' },
    { q: 'Which digit is in the ten thousands place?', a: '4' },
    { q: 'Round 2,451 to the nearest hundred.', a: '2,500' },
    { q: 'Write 300,000 + 40,000 + 7,000 + 800 + 90 + 2 as a number.', a: '347,892' },
  ],
  sections: {
    objectives: [
      'Read and write whole numbers up to millions',
      'State the value of each digit in a number',
      'Round numbers to the nearest 10, 100 and 1,000',
      'Use rounding to estimate answers',
    ],
    resources: [
      { title: 'Place Value Worksheet.pdf', detail: '245 KB · Lesson 1.1', icon: 'notes' },
      { title: 'Factors and Multiples practice.pdf', detail: '310 KB · Lesson 1.2', icon: 'notes' },
      { title: 'Number Systems revision notes.pdf', detail: '1.2 MB · Module 1', icon: 'book' },
      { title: 'Past paper 2023, Paper 1.pdf', detail: '880 KB · Module 3', icon: 'clipboard' },
    ] as { title: string; detail: string; icon: IconName }[],
    pricing: [
      { label: 'Price', options: ['Free for my classes', 'UGX 45,000 one-time', 'UGX 15,000 a month'] },
      { label: 'Access', options: ['Lifetime', 'This term only', '6 months'] },
      { label: 'Who can enrol', options: ['Anyone on Maple', 'Only my classes', 'Invite link only'] },
    ],
    completion: [
      { label: 'A video lesson counts as done when learners', options: ['Watch 80%', 'Watch it all', 'Open it'] },
      { label: 'Module quizzes need', options: ['50% to pass', '60% to pass', '70% to pass'] },
      { label: 'Certificate', options: ['On finishing every module', 'On passing the final quiz', 'No certificate'] },
    ],
    checks: [
      { label: 'Every lesson has a title', done: true },
      { label: 'Cover image added', done: true },
      { label: 'Price and access chosen', done: true },
      { label: '2 lessons have no notes yet', done: false },
    ],
  },
  preview: '/learn/course' as TeacherDest,
};

export type CourseBuilder = typeof courseBuilder;
