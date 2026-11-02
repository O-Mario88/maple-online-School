/** Sample data for Image 2: Post-Class Attendance & Engagement Register (/(teacher)/attendance/[sessionId]). */
import type { IconName } from '@/lib/icons';
import type { TeacherDest } from '@/lib/teacher-home';

import { photos } from './photos';

export type AttendanceStatusKey =
  | 'Present Engaged'
  | 'Present Passive'
  | 'Partial'
  | 'Absent'
  | 'Late'
  | 'Excused';

export type EngagementLevelKey = 'High' | 'Medium' | 'Low' | 'None';

export interface AttendanceRow {
  id: string;
  num: number;
  name: string;
  cohort: string;
  photo: number;
  status: AttendanceStatusKey;
  engagementLevel: EngagementLevelKey;
  engagementPct: number | null;
  joinTime: string;
  leaveTime: string;
  duration: string;
  reasonCode?: string;
  overrideNotes?: string;
}

export interface RecordingChapter {
  id: string;
  timestamp: string;
  title: string;
  duration: string;
  thumb: number;
}

export const attendanceRegister = {
  sessionId: 'olevel-maths-29-oct',
  course: 'O-Level Mathematics',
  topic: 'Quadratic Equations –\nSolving by Factorization',
  courseThumb: photos.courseBuilder.thumb,
  videoThumb: photos.teacherHome.live,
  dateLabel: 'Thu, 29 Oct 2026',
  timeLabel: '10:00 AM – 11:00 AM',
  sideNav: [
    { label: 'Class Overview', icon: 'chart' as IconName, go: '/teach/attendance' as TeacherDest },
    { label: 'Attendance & Engagement', icon: 'people' as IconName, go: '/teach/attendance' as TeacherDest },
    { label: 'Recording & Chapters', icon: 'video' as IconName, go: '/teach/attendance' as TeacherDest },
    { label: 'Student Feedback', icon: 'chat' as IconName, go: '/teach/attendance' as TeacherDest },
    { label: 'Quiz Results', icon: 'clipboard' as IconName, go: '/teach/attendance' as TeacherDest },
    { label: 'Chat & Questions', icon: 'chat' as IconName, go: '/teach/attendance' as TeacherDest },
    { label: 'Resources Shared', icon: 'book' as IconName, go: '/teach/attendance' as TeacherDest },
    { label: 'Class Analytics', icon: 'chart' as IconName, go: '/teach/attendance' as TeacherDest },
    { label: 'Manage Students', icon: 'people' as IconName, go: '/teach/class-spaces' as TeacherDest },
    { label: 'Session Settings', icon: 'settings' as IconName, go: '/teach/attendance' as TeacherDest },
  ],
  kpis: [
    { id: 'total', value: '28', label: 'Total Students', icon: null, color: '#0F172A', bg: '#F1F5F9' },
    { id: 'present', value: '24', label: 'Present (86%)', icon: 'people' as IconName, color: '#16A34A', bg: '#DCFCE7' },
    { id: 'engaged', value: '18', label: 'Engaged (64%)', icon: 'chart' as IconName, color: '#1463F3', bg: '#DBEAFE' },
    { id: 'partial', value: '4', label: 'Partial (14%)', icon: 'clock' as IconName, color: '#D97706', bg: '#FEF3C7' },
    { id: 'absent', value: '2', label: 'Absent (7%)', icon: 'person' as IconName, color: '#EF4444', bg: '#FEE2E2' },
    { id: 'late', value: '1', label: 'Late (4%)', icon: 'clock' as IconName, color: '#7E22CE', bg: '#F3E8FF' },
    { id: 'excused', value: '1', label: 'Excused (4%)', icon: 'flag' as IconName, color: '#475569', bg: '#F1F5F9' },
  ],
  students: [
    {
      id: 'st-1',
      num: 1,
      name: 'Amina K.',
      cohort: 'Term 3 Cohort A',
      photo: photos.teacherHome.aisha,
      status: 'Present Engaged',
      engagementLevel: 'High',
      engagementPct: 92,
      joinTime: '09:59',
      leaveTime: '11:00',
      duration: '1h 01m',
    },
    {
      id: 'st-2',
      num: 2,
      name: 'Daniel O.',
      cohort: 'Term 3 Cohort A',
      photo: photos.teacherHome.daniel,
      status: 'Present Passive',
      engagementLevel: 'Medium',
      engagementPct: 58,
      joinTime: '10:00',
      leaveTime: '11:00',
      duration: '1h 00m',
    },
    {
      id: 'st-3',
      num: 3,
      name: 'Grace A.',
      cohort: 'Term 3 Cohort A',
      photo: photos.teacherHome.grace,
      status: 'Present Engaged',
      engagementLevel: 'High',
      engagementPct: 88,
      joinTime: '09:58',
      leaveTime: '11:00',
      duration: '1h 02m',
    },
    {
      id: 'st-4',
      num: 4,
      name: 'James T.',
      cohort: 'Term 3 Cohort A',
      photo: photos.teacherHome.emmanuel,
      status: 'Partial',
      engagementLevel: 'Low',
      engagementPct: 34,
      joinTime: '10:22',
      leaveTime: '11:00',
      duration: '38m',
      reasonCode: 'Technical Issue',
      overrideNotes: 'Lost internet connection at 10:20 but rejoined at 10:40',
    },
    {
      id: 'st-5',
      num: 5,
      name: 'Mary N.',
      cohort: 'Term 3 Cohort A',
      photo: photos.classTiles[4],
      status: 'Present Engaged',
      engagementLevel: 'High',
      engagementPct: 79,
      joinTime: '10:01',
      leaveTime: '11:00',
      duration: '59m',
    },
    {
      id: 'st-6',
      num: 6,
      name: 'Peter K.',
      cohort: 'Term 3 Cohort A',
      photo: photos.teacherHome.peter,
      status: 'Late',
      engagementLevel: 'Medium',
      engagementPct: 61,
      joinTime: '10:08',
      leaveTime: '11:00',
      duration: '52m',
    },
    {
      id: 'st-7',
      num: 7,
      name: 'Sarah L.',
      cohort: 'Term 3 Cohort A',
      photo: photos.classTiles[2],
      status: 'Present Passive',
      engagementLevel: 'Medium',
      engagementPct: 52,
      joinTime: '10:00',
      leaveTime: '11:00',
      duration: '1h 00m',
    },
    {
      id: 'st-8',
      num: 8,
      name: 'David M.',
      cohort: 'Term 3 Cohort A',
      photo: photos.classTiles[1],
      status: 'Absent',
      engagementLevel: 'None',
      engagementPct: null,
      joinTime: '—',
      leaveTime: '—',
      duration: '0m',
    },
    {
      id: 'st-9',
      num: 9,
      name: 'Esther W.',
      cohort: 'Term 3 Cohort A',
      photo: photos.classFaces[2],
      status: 'Excused',
      engagementLevel: 'None',
      engagementPct: null,
      joinTime: '—',
      leaveTime: '—',
      duration: '0m',
    },
    {
      id: 'st-10',
      num: 10,
      name: 'Isaac R.',
      cohort: 'Term 3 Cohort A',
      photo: photos.classTiles[3],
      status: 'Partial',
      engagementLevel: 'Low',
      engagementPct: 28,
      joinTime: '10:18',
      leaveTime: '10:55',
      duration: '37m',
    },
  ] as AttendanceRow[],
  chapters: [
    {
      id: 'ch-1',
      timestamp: '00:00',
      title: 'Introduction & Learning\nObjectives',
      duration: '2:15',
      thumb: photos.teacherHome.live,
    },
    {
      id: 'ch-2',
      timestamp: '02:15',
      title: 'Reviewing Quadratic\nEquations',
      duration: '5:30',
      thumb: photos.teacherHome.live,
    },
    {
      id: 'ch-3',
      timestamp: '07:45',
      title: 'Factorization Method',
      duration: '12:40',
      thumb: photos.teacherHome.live,
    },
    {
      id: 'ch-4',
      timestamp: '20:25',
      title: 'Worked Example 1',
      duration: '15:10',
      thumb: photos.teacherHome.live,
    },
    {
      id: 'ch-5',
      timestamp: '35:35',
      title: 'Worked Example 2',
      duration: '14:20',
      thumb: photos.teacherHome.live,
    },
    {
      id: 'ch-6',
      timestamp: '50:10',
      title: 'Practice Questions & Q&A',
      duration: '9:50',
      thumb: photos.teacherHome.live,
    },
  ] as RecordingChapter[],
  reasonCodes: [
    'Technical Issue',
    'Power Outage',
    'Medical Excuse',
    'School Event',
    'Guardian Note',
  ],
};

export type AttendanceRegister = typeof attendanceRegister;

