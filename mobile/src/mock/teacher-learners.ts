/** Sample data for Class Mastery Heatmap & 1-Click Intervention Centre (/(teacher)/learners). */
import type { IconName } from '@/lib/icons';
import type { TeacherDest } from '@/lib/teacher-home';

import { photos } from './photos';

export type HeatCellTier = 'darkGreen' | 'lightGreen' | 'yellow' | 'orange' | 'red';

export interface MasteryStudentRow {
  id: string;
  name: string;
  photo: number;
  drawerPhoto?: number;
  scores: readonly [number, number, number, number, number, number, number, number];
  tiers: readonly [
    HeatCellTier,
    HeatCellTier,
    HeatCellTier,
    HeatCellTier,
    HeatCellTier,
    HeatCellTier,
    HeatCellTier,
    HeatCellTier,
  ];
  overall: number;
  status: 'On Track' | 'Needs Support' | 'At Risk';
}

export const masteryHeatmap = {
  course: 'O-Level Mathematics',
  term: 'Term 3',
  studentsCount: 32,
  sideNav: [
    { label: 'All My Students', icon: 'people' as IconName, go: '/teach/learners' as TeacherDest },
    { label: 'Learner Progress', icon: 'chart' as IconName, go: '/teach/learners' as TeacherDest },
    { label: 'Mastery Heatmap', icon: 'grid' as IconName, go: '/teach/learners' as TeacherDest },
    { label: 'Intervention Centre', icon: 'book' as IconName, go: '/teach/learners' as TeacherDest },
    { label: 'Parent Updates', icon: 'chat' as IconName, go: '/teach/learners' as TeacherDest },
    { label: 'Reports', icon: 'clipboard' as IconName, go: '/teach/learners' as TeacherDest },
    { label: 'Notes', icon: 'notes' as IconName, go: '/teach/learners' as TeacherDest },
    { label: 'Groups', icon: 'people' as IconName, go: '/teach/class-spaces' as TeacherDest },
    { label: 'Settings', icon: 'settings' as IconName, go: '/teach/learners' as TeacherDest },
  ],
  myClasses: [
    { id: 'mc-1', title: 'O-Level Mathematics', color: '#1463F3', active: true },
    { id: 'mc-2', title: 'O-Level Science', color: '#16A34A', active: false },
    { id: 'mc-3', title: 'Form 3 Advanced Maths', color: '#F59E0B', active: false },
    { id: 'mc-4', title: 'Holiday Bootcamp', color: '#EF4444', active: false },
  ],
  kpis: [
    { id: 'total', value: '32', label: 'Total Students', icon: 'people' as IconName, color: '#1463F3', bg: '#DBEAFE' },
    { id: 'ontrack', value: '18', label: 'On Track (56%)', icon: 'check' as IconName, color: '#16A34A', bg: '#DCFCE7' },
    { id: 'support', value: '8', label: 'Needs Support (25%)', icon: 'info' as IconName, color: '#F59E0B', bg: '#FEF3C7' },
    { id: 'atrisk', value: '5', label: 'At Risk (16%)', icon: 'alert' as IconName, color: '#EF4444', bg: '#FEE2E2' },
    { id: 'nodata', value: '1', label: 'Not Enough Data (3%)', icon: 'help' as IconName, color: '#64748B', bg: '#F1F5F9' },
  ],
  competencies: [
    { key: 'num', label: 'Number\n& Algebra', singleLine: 'Number & Algebra', avg: 78, avgTone: 'green' as const },
    { key: 'eq', label: 'Equations\n& Inequalities', singleLine: 'Equations & Inequalities', avg: 73, avgTone: 'yellow' as const },
    { key: 'fn', label: 'Functions', singleLine: 'Functions', avg: 79, avgTone: 'green' as const },
    { key: 'gr', label: 'Graphs', singleLine: 'Graphs', avg: 76, avgTone: 'green' as const },
    { key: 'geo', label: 'Geometry\n& Measures', singleLine: 'Geometry & Measures', avg: 74, avgTone: 'yellow' as const },
    { key: 'trig', label: 'Trigonometry', singleLine: 'Trigonometry', avg: 68, avgTone: 'red' as const },
    { key: 'stat', label: 'Statistics', singleLine: 'Statistics', avg: 75, avgTone: 'yellow' as const },
    { key: 'prob', label: 'Problem\nSolving', singleLine: 'Problem Solving', avg: 80, avgTone: 'green' as const },
  ],
  overallAvg: 75,
  students: [
    {
      id: 'm-1',
      name: 'Amina K.',
      photo: photos.teacherHome.aisha,
      scores: [92, 88, 95, 90, 85, 78, 88, 92],
      tiers: ['lightGreen', 'lightGreen', 'darkGreen', 'lightGreen', 'lightGreen', 'yellow', 'lightGreen', 'darkGreen'],
      overall: 87,
      status: 'On Track',
    },
    {
      id: 'm-2',
      name: 'Daniel O.',
      photo: photos.teacherHome.daniel,
      drawerPhoto: photos.teacherHome.sarah,
      scores: [76, 68, 82, 80, 72, 65, 70, 78],
      tiers: ['lightGreen', 'yellow', 'lightGreen', 'lightGreen', 'yellow', 'orange', 'yellow', 'lightGreen'],
      overall: 74,
      status: 'Needs Support',
    },
    {
      id: 'm-3',
      name: 'Grace A.',
      photo: photos.teacherHome.grace,
      scores: [94, 90, 88, 86, 91, 84, 89, 93],
      tiers: ['darkGreen', 'lightGreen', 'lightGreen', 'lightGreen', 'darkGreen', 'lightGreen', 'lightGreen', 'darkGreen'],
      overall: 88,
      status: 'On Track',
    },
    {
      id: 'm-4',
      name: 'James T.',
      photo: photos.teacherHome.emmanuel,
      scores: [62, 58, 70, 68, 60, 55, 63, 71],
      tiers: ['orange', 'red', 'yellow', 'yellow', 'orange', 'red', 'orange', 'yellow'],
      overall: 63,
      status: 'At Risk',
    },
    {
      id: 'm-5',
      name: 'Mary N.',
      photo: photos.classTiles[4],
      scores: [89, 92, 85, 87, 90, 82, 88, 91],
      tiers: ['lightGreen', 'darkGreen', 'lightGreen', 'lightGreen', 'darkGreen', 'lightGreen', 'lightGreen', 'darkGreen'],
      overall: 88,
      status: 'On Track',
    },
    {
      id: 'm-6',
      name: 'Peter K.',
      photo: photos.teacherHome.peter,
      scores: [71, 64, 68, 72, 69, 60, 66, 74],
      tiers: ['yellow', 'orange', 'yellow', 'yellow', 'yellow', 'orange', 'yellow', 'yellow'],
      overall: 68,
      status: 'Needs Support',
    },
    {
      id: 'm-7',
      name: 'Sarah L.',
      photo: photos.classTiles[2],
      scores: [95, 90, 92, 88, 94, 91, 90, 96],
      tiers: ['darkGreen', 'lightGreen', 'darkGreen', 'lightGreen', 'darkGreen', 'darkGreen', 'lightGreen', 'darkGreen'],
      overall: 92,
      status: 'On Track',
    },
    {
      id: 'm-8',
      name: 'David M.',
      photo: photos.classTiles[1],
      scores: [58, 55, 62, 60, 57, 50, 59, 65],
      tiers: ['red', 'red', 'orange', 'orange', 'red', 'red', 'red', 'orange'],
      overall: 58,
      status: 'At Risk',
    },
    {
      id: 'm-9',
      name: 'Esther W.',
      photo: photos.classFaces[2],
      scores: [83, 78, 80, 82, 79, 76, 81, 85],
      tiers: ['lightGreen', 'yellow', 'lightGreen', 'lightGreen', 'lightGreen', 'yellow', 'lightGreen', 'lightGreen'],
      overall: 81,
      status: 'On Track',
    },
    {
      id: 'm-10',
      name: 'Isaac R.',
      photo: photos.classTiles[3],
      scores: [69, 62, 66, 70, 64, 58, 62, 68],
      tiers: ['yellow', 'orange', 'yellow', 'yellow', 'yellow', 'orange', 'orange', 'yellow'],
      overall: 64,
      status: 'Needs Support',
    },
  ] as MasteryStudentRow[],
};

export type MasteryHeatmap = typeof masteryHeatmap;
