/** Sample data for Image 1: Public @teacher Storefront & Growth Promotions Editor (/(teacher)/storefront). */
import type { IconName } from '@/lib/icons';
import type { TeacherDest } from '@/lib/teacher-home';

import { photos } from './photos';

export interface StorefrontSubjectCard {
  id: string;
  title: string;
  previewTitle: string;
  description: string;
  tags: readonly string[];
  color: string;
  bg: string;
  icon: IconName;
  featured: boolean;
}

export interface StorefrontDayHours {
  day: string;
  start: string | null;
  end: string | null;
  compact: string;
}

export const storefrontEditor = {
  growNav: [
    { label: 'Storefront', icon: 'grid' as IconName, go: '/teach/storefront' as TeacherDest },
    { label: 'Promotions', icon: 'send' as IconName, go: '/teach/storefront' as TeacherDest },
    { label: 'Reviews', icon: 'star' as IconName, go: '/teach/storefront' as TeacherDest },
    { label: 'Resources', icon: 'book' as IconName, go: '/teach/library' as TeacherDest },
    { label: 'Settings', icon: 'settings' as IconName, go: '/teach/storefront' as TeacherDest },
  ],
  avatar: photos.teacherHome.sarah,
  videoThumb: photos.teacherHome.live,
  bannerTeacher: photos.teacherHome.sarah,
  displayName: 'Sarah N.',
  username: 'sarahn',
  roleTitle: 'Mathematics Teacher & Online Tutor',
  rating: '4.9',
  reviewsCount: 128,
  bio: 'Passionate about making mathematics simple, engaging, and confident for every learner. I help students from primary to O-Level build strong foundations, improve exam performance, and develop a love for problem solving through clear explanations and practical examples.',
  videoDuration: '02:15',
  timezone: 'East Africa Time (EAT)',
  subjects: [
    {
      id: 'sub-1',
      title: 'O-Level Mathematics',
      previewTitle: 'O-Level Mathematics',
      description: 'Exam preparation, problem solving, and past papers.',
      tags: ['O-Level', 'Exam Prep'],
      color: '#1463F3',
      bg: '#DBEAFE',
      icon: 'chart' as IconName,
      featured: true,
    },
    {
      id: 'sub-2',
      title: 'Lower Secondary Maths',
      previewTitle: 'Lower Secondary...',
      description: 'Build strong foundations with clear explanations.',
      tags: ['Lower Secondary', 'Foundation'],
      color: '#EA580C',
      bg: '#FFEDD5',
      icon: 'grid' as IconName,
      featured: true,
    },
    {
      id: 'sub-3',
      title: 'Primary Mathematics',
      previewTitle: 'Primary Mathematics',
      description: 'Fun and engaging lessons for young learners.',
      tags: ['Primary', 'Concept Building'],
      color: '#16A34A',
      bg: '#DCFCE7',
      icon: 'book' as IconName,
      featured: true,
    },
  ] as StorefrontSubjectCard[],
  tutoringHours: [
    { day: 'Mon', start: '3:00 PM', end: '8:00 PM', compact: '3–8 PM' },
    { day: 'Tue', start: '3:00 PM', end: '8:00 PM', compact: '3–8 PM' },
    { day: 'Wed', start: '3:00 PM', end: '8:00 PM', compact: '3–8 PM' },
    { day: 'Thu', start: '3:00 PM', end: '8:00 PM', compact: '3–8 PM' },
    { day: 'Fri', start: '3:00 PM', end: '8:00 PM', compact: '3–8 PM' },
    { day: 'Sat', start: '9:00 AM', end: '5:00 PM', compact: '9 AM–5 PM' },
    { day: 'Sun', start: null, end: null, compact: 'Unavailable' },
  ] as StorefrontDayHours[],
  promotion: {
    status: 'Active',
    title: '10% Off First Class',
    description:
      "Get 10% off your first 1-on-1 tutoring session. Let's build your confidence in maths!",
    validRange: '1 Oct – 31 Dec 2026',
  },
};

export type StorefrontEditor = typeof storefrontEditor;

