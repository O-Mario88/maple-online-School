/** Sample data for "Bottom-Up" Free School Class Space Manager (/(teacher)/class-spaces). */
import type { IconName } from '@/lib/icons';
import type { TeacherDest } from '@/lib/teacher-home';

import { photos } from './photos';

export interface ClassSpaceRow {
  id: string;
  title: string;
  subtitle: string;
  thumb: number;
  studentsCount: number;
  capacity: number;
  joinCode: string;
  termTitle: string;
  termDates: string;
  status: 'Active' | 'Draft' | 'Archived';
}

export const classSpacesManager = {
  sideNav: [
    { label: 'Class Spaces', icon: 'people' as IconName, go: '/teach/class-spaces' as TeacherDest },
    { label: 'Create Class', icon: 'plus' as IconName, go: '/teach/class-spaces' as TeacherDest },
    { label: 'Class Resources', icon: 'notes' as IconName, go: '/learn/library' as TeacherDest },
    { label: 'Archived Classes', icon: 'folder' as IconName, go: '/teach/class-spaces' as TeacherDest },
    { label: 'Settings', icon: 'settings' as IconName, go: '/teach/class-spaces' as TeacherDest },
  ],
  initialForm: {
    className: 'O-Level Mathematics',
    gradeLevel: 'O-Level',
    subject: 'Mathematics',
    term: 'Term 3 (2026)',
    capacity: 50,
    joinMethod: 'code' as 'code' | 'whatsapp',
  },
  gradeOptions: ['O-Level', 'A-Level', 'Primary 7', 'Form 3', 'Mixed'],
  subjectOptions: ['Mathematics', 'Science', 'English', 'Physics', 'Multiple Subjects'],
  termOptions: ['Term 3 (2026)', 'Term 1 (2027)', 'Holiday 2026'],
  principalBenefits: [
    'School-wide classes and teachers',
    'Official school profile and branding',
    'Advanced analytics and reports',
    'Dedicated support',
  ],
  howStudentsJoin: [
    {
      step: 1,
      title: 'Share the 6-digit code or WhatsApp link',
      subtitle: 'Send it to your students or post in your class group.',
    },
    {
      step: 2,
      title: 'Students join the class space',
      subtitle: 'They enter the code or click the link.',
    },
    {
      step: 3,
      title: 'You approve (optional)',
      subtitle: 'Students are added to your class roster.',
    },
  ],
  sampleJoinCode: '482 915',
  tips: [
    'Create a clear class name (e.g. "O-Level Maths")',
    'Choose the correct grade and subject',
    'Share the join code via WhatsApp or your school group',
    'Keep your roster updated',
    'Invite your principal to upgrade your school for more features.',
  ],
  whatsappIcon: photos.guardianConsent.whatsapp,
  crownIcon: photos.learnerHome.crown,
  activeCount: 4,
  draftsCount: 1,
  archivedCount: 2,
  classes: [
    {
      id: 'cs-1',
      title: 'O-Level Mathematics',
      subtitle: 'O-Level • Mathematics',
      thumb: photos.courseBuilder.thumb,
      studentsCount: 32,
      capacity: 50,
      joinCode: '482 915',
      termTitle: 'Term 3 (2026)',
      termDates: '1 Oct – 20 Dec',
      status: 'Active',
    },
    {
      id: 'cs-2',
      title: 'O-Level Science',
      subtitle: 'O-Level • Science',
      thumb: photos.studio.cover,
      studentsCount: 28,
      capacity: 50,
      joinCode: '713 620',
      termTitle: 'Term 3 (2026)',
      termDates: '1 Oct – 20 Dec',
      status: 'Active',
    },
    {
      id: 'cs-3',
      title: 'Form 3 English',
      subtitle: 'Form 3 • English',
      thumb: photos.library['book'],
      studentsCount: 24,
      capacity: 40,
      joinCode: '695 301',
      termTitle: 'Term 3 (2026)',
      termDates: '1 Oct – 20 Dec',
      status: 'Active',
    },
    {
      id: 'cs-4',
      title: 'Holiday Bootcamp',
      subtitle: 'Mixed • Multiple Subjects',
      thumb: photos.library['c-maps-world'],
      studentsCount: 18,
      capacity: 50,
      joinCode: '901 447',
      termTitle: 'Holiday 2026',
      termDates: '5 Jan – 6 Feb',
      status: 'Active',
    },
  ] as ClassSpaceRow[],
};

export type ClassSpacesManager = typeof classSpacesManager;

