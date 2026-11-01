/** Sample data for the Maple Live Teacher Host Console reference (/(teacher)/live-host/[sessionId]). */
import type { IconName } from '@/lib/icons';

import { photos } from './photos';

export type HostToolKey =
  | 'Whiteboard'
  | 'Slides / PDF'
  | 'Screen Share'
  | 'Media (Video)'
  | 'Activities'
  | 'Pulse Quiz'
  | 'Breakout Rooms'
  | 'Class Tools'
  | 'Settings';

export interface HostMaterial {
  id: string;
  title: string;
  kind: 'pdf' | 'pro' | 'video';
  color: string;
}

export interface HostStudentTile {
  id: string;
  name: string;
  photo: number;
  muted?: boolean;
}

export interface HostQuizOption {
  letter: 'A' | 'B' | 'C' | 'D';
  formula: string;
  correct?: boolean;
}

export interface HostChatMsg {
  id: string;
  name: string;
  time: string;
  text: string;
  photo: number;
}

export const teacherHost = {
  sessionId: 'olevel-maths-quadratics',
  course: 'O-Level Mathematics',
  topic: 'Quadratic Equations – Solving by Factorization',
  elapsedSeconds: 32 * 60 + 15, // 00:32:15
  studentsCount: 28,
  coTeachersCount: 2,
  teacherVideo: photos.teacherHost.teacher,
  nav: [
    { label: 'Whiteboard' as HostToolKey, icon: 'edit' as IconName },
    { label: 'Slides / PDF' as HostToolKey, icon: 'notes' as IconName },
    { label: 'Screen Share' as HostToolKey, icon: 'screen' as IconName },
    { label: 'Media (Video)' as HostToolKey, icon: 'video' as IconName },
    { label: 'Activities' as HostToolKey, icon: 'clipboard' as IconName },
    { label: 'Pulse Quiz' as HostToolKey, icon: 'heart' as IconName },
    { label: 'Breakout Rooms' as HostToolKey, icon: 'people' as IconName },
    { label: 'Class Tools' as HostToolKey, icon: 'code' as IconName },
    { label: 'Settings' as HostToolKey, icon: 'settings' as IconName },
  ],
  materials: [
    { id: 'm1', title: 'Lesson Slides.pdf', kind: 'pdf', color: '#EC4899' },
    { id: 'm2', title: 'Quadratic Worksheet.pdf', kind: 'pro', color: '#F97316' },
    { id: 'm3', title: 'Practice Questions.pdf', kind: 'pdf', color: '#E11D48' },
    { id: 'm4', title: 'Example Video.mp4', kind: 'video', color: '#1463F3' },
  ] as HostMaterial[],
  pdf: {
    filename: 'Quadratic Equations.pdf',
    page: 12,
    totalPages: 24,
    heading: 'Example 1',
    prompt: 'Solve by factorization:',
    equation: 'x² − 5x + 6 = 0',
    steps: [
      'Find two numbers that multiply to 6 and add to −5.',
      'Factorize the quadratic.',
      'Set each factor to zero.',
      'Solve for x.',
    ],
  },
  studentTiles: [
    { id: 's1', name: 'John M.', photo: photos.teacherHost.john },
    { id: 's2', name: 'Grace A.', photo: photos.teacherHost.grace },
    { id: 's3', name: 'Daniel O.', photo: photos.teacherHost.daniel },
    { id: 's4', name: 'Mary N.', photo: photos.teacherHost.mary },
    { id: 's5', name: 'Peter K.', photo: photos.teacherHost.peter },
    { id: 's6', name: 'Sarah L.', photo: photos.teacherHost.sarah },
    { id: 's7', name: 'Amina K.', photo: photos.teacherHost.amina, muted: true },
    { id: 's8', name: 'James T.', photo: photos.teacherHost.james },
  ] as HostStudentTile[],
  othersCount: 19,
  pulseQuiz: {
    durationSeconds: 15,
    question: 'Which equation has roots x = 2 and x = 3?',
    options: [
      { letter: 'A', formula: 'x² + 5x + 6 = 0' },
      { letter: 'B', formula: 'x² − 5x + 6 = 0', correct: true },
      { letter: 'C', formula: 'x² − 6x + 5 = 0' },
      { letter: 'D', formula: 'x² + 6x + 5 = 0' },
    ] as HostQuizOption[],
  },
  comprehension: {
    percent: 78,
    legend: [
      { label: 'Strong (18)', color: '#22C55E' },
      { label: 'Good (6)', color: '#4ADE80' },
      { label: 'Needs Help (4)', color: '#F59E0B' },
      { label: 'Stuck (0)', color: '#EF4444' },
    ],
    bars: [
      { h: 0.72, color: '#16A34A' },
      { h: 0.9, color: '#16A34A' },
      { h: 0.82, color: '#22C55E' },
      { h: 0.42, color: '#EF4444' },
      { h: 0.65, color: '#4ADE80' },
      { h: 0.95, color: '#16A34A' },
      { h: 0.78, color: '#22C55E' },
      { h: 0.54, color: '#F59E0B' },
      { h: 0.36, color: '#EF4444' },
      { h: 0.6, color: '#4ADE80' },
      { h: 0.88, color: '#16A34A' },
      { h: 0.7, color: '#22C55E' },
      { h: 0.46, color: '#EF4444' },
      { h: 0.58, color: '#F59E0B' },
      { h: 0.82, color: '#16A34A' },
      { h: 0.64, color: '#F59E0B' },
      { h: 0.86, color: '#16A34A' },
      { h: 0.74, color: '#22C55E' },
      { h: 0.48, color: '#F59E0B' },
      { h: 0.62, color: '#4ADE80' },
    ],
  },
  breakoutRooms: [
    { id: 'r1', name: 'Room 1', students: 5 },
    { id: 'r2', name: 'Room 2', students: 5 },
    { id: 'r3', name: 'Room 3', students: 5 },
  ],
  chat: [
    { id: 'c1', name: 'Amina K.', time: '10:21 AM', text: 'I understand now! 🙌', photo: photos.teacherHost.chatAmina },
    { id: 'c2', name: 'Daniel O.', time: '10:21 AM', text: 'Can you explain step 2 again?', photo: photos.teacherHost.chatDaniel },
    { id: 'c3', name: 'Sarah L.', time: '10:22 AM', text: 'This makes sense 👍', photo: photos.teacherHost.chatSarah },
  ] as HostChatMsg[],
};

export type TeacherHost = typeof teacherHost;
