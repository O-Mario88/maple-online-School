/** Sample data for Image 1: Assignment & AI Rubric Builder (/(teacher)/assignments/new). */
import type { IconName } from '@/lib/icons';
import type { TeacherDest } from '@/lib/teacher-home';

import { photos } from './photos';
import { Maple } from '@/constants/maple';

export type AssessmentTypeKey =
  | 'quiz'
  | 'homework'
  | 'project'
  | 'essay'
  | 'presentation'
  | 'practical'
  | 'discussion'
  | 'viva';

export interface AssessmentTypeOption {
  key: AssessmentTypeKey;
  title: string;
  subtitle: string;
  icon: IconName;
  tint: string;
  bg: string;
}

export interface RubricCriterionRow {
  id: string;
  criteria: string;
  description: string;
  weight: number;
  levels: string;
}

export interface AssignClassItem {
  id: string;
  title: string;
  subtitle: string;
  thumb: number;
  selected: boolean;
}

export const assignmentBuilder = {
  sideNav: [
    { label: 'Create Assignment', icon: 'notes' as IconName, go: '/teach/assignments/new' as TeacherDest },
    { label: 'My Assignments', icon: 'clipboard' as IconName, go: '/teach/assignments/new' as TeacherDest },
    { label: 'Drafts', icon: 'book' as IconName, go: '/teach/assignments/new' as TeacherDest },
    { label: 'Scheduled', icon: 'clock' as IconName, go: '/teach/calendar' as TeacherDest },
    { label: 'Submitted Work', icon: 'folder' as IconName, go: '/teach/grading' as TeacherDest },
    { label: 'Grading & Feedback', icon: 'chart' as IconName, go: '/teach/grading' as TeacherDest },
    { label: 'Question Bank', icon: 'help' as IconName, go: '/teach/assignments/new' as TeacherDest },
    { label: 'Rubrics', icon: 'grid' as IconName, go: '/teach/assignments/new' as TeacherDest },
    { label: 'AI Tools', icon: 'sparkle' as IconName, go: '/teach/studio' as TeacherDest },
    { label: 'Settings', icon: 'settings' as IconName, go: '/teach/assignments/new' as TeacherDest },
  ],
  assessmentTypes: [
    {
      key: 'quiz',
      title: 'Quiz',
      subtitle: 'Auto-graded\nMCQ, T/F, short answer',
      icon: 'list',
      tint: Maple.successText,
      bg: Maple.successSoft,
    },
    {
      key: 'homework',
      title: 'Homework',
      subtitle: 'Written responses,\nproblem sets',
      icon: 'home',
      tint: Maple.blue,
      bg: Maple.blueSelected,
    },
    {
      key: 'project',
      title: 'Project',
      subtitle: 'Research or creative\nprojects',
      icon: 'folder',
      tint: Maple.warning,
      bg: Maple.warningSoft,
    },
    {
      key: 'essay',
      title: 'Essay',
      subtitle: 'Long-form writing\nwith rubric',
      icon: 'edit',
      tint: '#DB2777',
      bg: '#FCE7F3',
    },
    {
      key: 'presentation',
      title: 'Presentation',
      subtitle: 'Slides, video or live',
      icon: 'screen',
      tint: Maple.blueHover,
      bg: Maple.blueSelected,
    },
    {
      key: 'practical',
      title: 'Practical / Lab',
      subtitle: 'Hands-on work with\nevidence',
      icon: 'sparkle',
      tint: Maple.blue,
      bg: Maple.blueSelected,
    },
    {
      key: 'discussion',
      title: 'Discussion',
      subtitle: 'Forum posts & replies',
      icon: 'chat',
      tint: '#EA580C',
      bg: Maple.warningSoft,
    },
    {
      key: 'viva',
      title: 'Viva (Oral)',
      subtitle: 'AI + teacher assessed\noral responses',
      icon: 'mic',
      tint: Maple.error,
      bg: Maple.errorSoft,
    },
  ] as AssessmentTypeOption[],
  initialTitle: 'Quadratic Equations – Problem Set 2',
  initialInstructions:
    'Solve the following quadratic equations. Show your working clearly and upload a photo or PDF of your solutions. You may also submit a short video explanation (optional).',
  attachment: {
    filename: 'Quadratic_Practice_Set_2.pdf',
    meta: 'PDF • 1.2 MB',
  },
  dueDate: 'Fri, 31 Oct 2026',
  dueTime: '11:59 PM',
  classes: [
    {
      id: 'c1',
      title: 'O-Level Mathematics',
      subtitle: 'Term 3 • 32 students',
      thumb: photos.courseBuilder.thumb,
      selected: true,
    },
    {
      id: 'c2',
      title: 'O-Level Science',
      subtitle: 'Term 3 • 28 students',
      thumb: photos.studio.cover,
      selected: true,
    },
    {
      id: 'c3',
      title: 'Form 3 Advanced Maths',
      subtitle: 'Term 3 • 24 students',
      thumb: photos.teacherCourses[0],
      selected: false,
    },
  ] as AssignClassItem[],
  rubric: [
    {
      id: 'r1',
      criteria: 'Correctness',
      description: 'Accurate solutions and\nfinal answers.',
      weight: 40,
      levels: '4 levels',
    },
    {
      id: 'r2',
      criteria: 'Working\nand Method',
      description: 'Clear and logical\nworking steps.',
      weight: 25,
      levels: '4 levels',
    },
    {
      id: 'r3',
      criteria: 'Communication',
      description: 'Clear explanation and\nmathematical notation.',
      weight: 20,
      levels: '4 levels',
    },
    {
      id: 'r4',
      criteria: 'Presentation',
      description: 'Neat, organized and\neasy to follow.',
      weight: 10,
      levels: '4 levels',
    },
    {
      id: 'r5',
      criteria: '60-Second Viva\n(Oral)',
      description: 'Explains one selected\nquestion in 60 seconds.',
      weight: 5,
      levels: '4 levels',
    },
  ] as RubricCriterionRow[],
};

export type AssignmentBuilder = typeof assignmentBuilder;

