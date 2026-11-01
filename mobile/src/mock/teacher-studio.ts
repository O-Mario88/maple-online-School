/** Sample data for the AI course studio reference: an O-Level Mathematics course built from a syllabus. */
import type { IconName } from '@/lib/icons';
import type { TeacherDest } from '@/lib/teacher-home';

import { photos } from './photos';

const p = photos.studio;

export type SourceKey = 'file' | 'youtube' | 'classroom' | 'text' | 'paper';
export type LevelTone = 'green' | 'blue' | 'purple';

export interface StudioLesson {
  title: string;
  kind: string;
  minutes: number;
}

export interface StudioLevel {
  name: string;
  tag: string;
  tone: LevelTone;
  lessons: number;
  quizzes: number;
  items: StudioLesson[];
}

export const studioNew = {
  sources: [
    { key: 'file', label: 'Upload File', icon: 'upload', color: '#1463F3' },
    { key: 'youtube', label: 'YouTube Playlist', short: 'YouTube', icon: 'playFill', color: '#E5484D' },
    { key: 'classroom', label: 'Google Classroom', icon: 'people', color: '#22A35A' },
    { key: 'text', label: 'Text / Paste', icon: 'notes', color: '#1463F3' },
    { key: 'paper', label: 'Past Paper', icon: 'clipboard', color: '#7C4DDB' },
  ] as { key: SourceKey; label: string; short?: string; icon: IconName; color: string }[],
  sampleFile: 'O-Level Mathematics syllabus (Cambridge 4024).pdf',
  supported: [
    { label: 'PDF\nSyllabus', icon: 'notes', color: '#E5484D' },
    { label: 'Past Exam\nPapers', icon: 'clipboard', color: '#1463F3' },
    { label: 'Worksheets', icon: 'notes', color: '#1463F3' },
    { label: 'Textbooks', icon: 'book', color: '#22A35A' },
    { label: 'Images', icon: 'gallery', color: '#F08C00' },
  ] as { label: string; icon: IconName; color: string }[],
  linkSources: [
    { label: 'YouTube\nPlaylist', icon: 'playFill', color: '#E5484D' },
    { label: 'Google\nClassroom', icon: 'people', color: '#22A35A' },
  ] as { label: string; icon: IconName; color: string }[],
  steps: [
    { label: 'Reading and analysing content...', phone: 'Analysing content...', at: 2 },
    { label: 'Identifying key topics and competencies...', phone: 'Identifying key topics...', at: 8 },
    { label: 'Generating 3-level course structure...', phone: 'Generating course structure...', at: 18 },
    { label: 'Creating interactive quizzes...', phone: 'Creating quizzes...', at: 32 },
    { label: 'Adding learning objectives and tags...', phone: 'Adding competency tags...', at: 45 },
    { label: 'Almost ready...', phone: 'Done!', at: 58 },
  ],
  course: {
    title: 'O-Level Mathematics',
    status: 'Draft',
    description: 'Complete syllabus with interactive lessons, past paper practice, quizzes and competency tracking.',
    lessons: 32,
    board: 'O-Level (Cambridge)',
    subject: 'Mathematics',
    cover: p.cover,
  },
  objectives: [
    'Understand and apply key mathematical concepts',
    'Solve examination-style questions',
    'Develop problem-solving and reasoning skills',
    'Build confidence through guided practice',
  ],
  levels: [
    {
      name: 'Level 1: Foundation',
      tag: 'Beginner',
      tone: 'green',
      lessons: 10,
      quizzes: 8,
      items: [
        { title: 'Number Systems and Place Value', kind: 'Video + Quiz', minutes: 25 },
        { title: 'Four Operations', kind: 'Video + Practice', minutes: 30 },
        { title: 'Fractions, Decimals and Percentages', kind: 'Video + Quiz', minutes: 35 },
      ],
    },
    {
      name: 'Level 2: Core Concepts',
      tag: 'Intermediate',
      tone: 'blue',
      lessons: 12,
      quizzes: 10,
      items: [
        { title: 'Algebraic Expressions', kind: 'Video + Quiz', minutes: 35 },
        { title: 'Equations and Inequalities', kind: 'Video + Practice', minutes: 40 },
        { title: 'Functions', kind: 'Video + Quiz', minutes: 30 },
      ],
    },
    {
      name: 'Level 3: Exam Mastery',
      tag: 'Advanced',
      tone: 'purple',
      lessons: 10,
      quizzes: 6,
      items: [
        { title: 'Graphs and Coordinate Geometry', kind: 'Video + Quiz', minutes: 40 },
        { title: 'Trigonometry', kind: 'Video + Practice', minutes: 45 },
        { title: 'Past Paper Practice and Exam Strategies', kind: 'Past Papers + Quiz', minutes: 60 },
      ],
    },
  ] as StudioLevel[],
  lesson: { title: '3.1 Fractions, Decimals and Percentages', length: '12:35', video: p.video },
  quiz: { kind: 'Multiple Choice', marks: '1 mark', question: 'Convert ¾ to a percentage.', options: ['25%', '50%', '75%', '100%'], answer: 2 },
  competencies: [
    { code: 'MA.N1', name: 'Number sense and place value', level: 1 },
    { code: 'MA.N2', name: 'Fractions, decimals and percentages', level: 1 },
    { code: 'MA.A1', name: 'Algebraic manipulation', level: 2 },
    { code: 'MA.A2', name: 'Solving equations and inequalities', level: 2 },
    { code: 'MA.F1', name: 'Functions and their graphs', level: 2 },
    { code: 'MA.G1', name: 'Coordinate geometry', level: 3 },
    { code: 'MA.T1', name: 'Trigonometry', level: 3 },
    { code: 'MA.E1', name: 'Exam technique and timing', level: 3 },
  ],
  resources: [
    { title: 'O-Level Mathematics syllabus (Cambridge 4024).pdf', detail: 'Source file · 48 pages', icon: 'notes' },
    { title: 'Past paper 2023, Paper 1', detail: 'Matched to Level 3 · 25 questions', icon: 'clipboard' },
    { title: 'Fractions worksheet', detail: 'Matched to Level 1 · printable', icon: 'notes' },
    { title: 'Algebra revision notes', detail: 'Generated · 6 pages', icon: 'book' },
  ] as { title: string; detail: string; icon: IconName }[],
  settings: [
    { label: 'Who can see it', options: ['Only me (draft)', 'My classes', 'Everyone on Maple'] },
    { label: 'Price', options: ['Free for my classes', 'UGX 25,000', 'UGX 50,000'] },
    { label: 'Pass mark for each quiz', options: ['50%', '60%', '70%'] },
  ],
  nav: [
    { label: 'Create New', icon: 'edit', go: '/teach/studio' },
    { label: 'My Courses', icon: 'book', go: '/teach/course-editor' },
    { label: 'Imported Content', icon: 'upload', go: '/learn/library' },
    { label: 'Question Bank', icon: 'clipboard', go: '/teach/studio' },
    { label: 'AI Tools', icon: 'sparkle', go: '/copilot' },
    { label: 'Templates', icon: 'columns', go: '/teach/studio' },
    { label: 'Competency Tags', icon: 'flag', go: '/teach/studio' },
    { label: 'Drafts', icon: 'notes', go: '/teach/course-editor' },
    { label: 'Published Courses', icon: 'check', go: '/teach/storefront' },
    { label: 'Settings', icon: 'settings', go: '/teach/studio' },
  ] as { label: string; icon: IconName; go: TeacherDest }[],
  templates: [
    { title: 'Past-paper bootcamp', detail: '4 weeks · timed papers with walkthroughs' },
    { title: 'Full-term syllabus course', detail: '3 levels · lessons, quizzes and tags' },
    { title: 'Revision sprint', detail: '10 short lessons · daily quizzes' },
  ],
  promo: {
    title: 'Turn any content\ninto an interactive\ncourse in 60 seconds.',
    points: ['PDF, Word, PPT, Images', 'Past papers & worksheets', 'YouTube playlists', 'Google Classroom links', 'Auto quizzes & tags'],
    robot: p.robot,
    spark: p.spark,
  },
};

export type StudioNew = typeof studioNew;
