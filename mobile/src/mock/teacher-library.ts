/** Sample data for Image 4: Teacher Resource Library & Co-Teaching Collections (/(teacher)/library). */
import type { IconName } from '@/lib/icons';
import type { TeacherDest } from '@/lib/teacher-home';

import { photos } from './photos';
import { Maple } from '@/constants/maple';

export interface LibraryCategoryTile {
  id: string;
  title: string;
  countLabel: string;
  color: string;
  bg: string;
  icon: IconName;
}

export interface LibraryFolderCard {
  id: string;
  title: string;
  filesLabel: string;
  folderColor: string;
  badgeBg: string;
  badgeGlyph: string;
}

export interface LibraryFileCard {
  id: string;
  title: string;
  meta: string;
  date: string;
  kind: 'pdf' | 'pptx' | 'docx' | 'png' | 'mp4' | 'xlsx';
  badgeColor: string;
  badgeText: string;
  videoThumb?: number;
  videoDuration?: string;
}

export interface CoTeachingCollectionCard {
  id: string;
  title: string;
  subtitle: string;
  stats: string;
  color: string;
  icon: IconName;
  faces: readonly number[];
  extraCount?: string;
}

export const teacherLibrary = {
  growNav: [
    { label: 'Storefront', icon: 'grid' as IconName, go: '/teach/storefront' as TeacherDest },
    { label: 'Promotions', icon: 'send' as IconName, go: '/teach/storefront' as TeacherDest },
    { label: 'Reviews', icon: 'star' as IconName, go: '/teach/storefront' as TeacherDest },
    { label: 'Library', icon: 'book' as IconName, go: '/teach/library' as TeacherDest },
    { label: 'Co-Teaching', icon: 'people' as IconName, go: '/teach/library' as TeacherDest },
    { label: 'Settings', icon: 'settings' as IconName, go: '/teach/storefront' as TeacherDest },
  ],
  storageUsed: '3.2 GB of 10 GB used',
  storagePct: 32,
  categories: [
    {
      id: 'all',
      title: 'All Resources',
      countLabel: '248 files',
      color: Maple.blue,
      bg: Maple.blueSelected,
      icon: 'notes' as IconName,
    },
    {
      id: 'worksheets',
      title: 'Worksheets',
      countLabel: '64 files',
      color: Maple.error,
      bg: Maple.errorSoft,
      icon: 'clipboard' as IconName,
    },
    {
      id: 'past-papers',
      title: 'Past Papers',
      countLabel: '52 files',
      color: Maple.blue,
      bg: Maple.blueSelected,
      icon: 'book' as IconName,
    },
    {
      id: 'slides',
      title: 'Slide Decks',
      countLabel: '38 files',
      color: '#EA580C',
      bg: Maple.warningSoft,
      icon: 'screen' as IconName,
    },
    {
      id: 'videos',
      title: 'Videos',
      countLabel: '28 files',
      color: Maple.successText,
      bg: Maple.successSoft,
      icon: 'play' as IconName,
    },
    {
      id: 'docs',
      title: 'Documents',
      countLabel: '42 files',
      color: Maple.blue,
      bg: Maple.blueSelected,
      icon: 'notes' as IconName,
    },
  ] as LibraryCategoryTile[],
  leftFolders: [
    { id: 'lf-1', title: 'My Resources', sub: '12 folders', color: Maple.blue, active: true },
    { id: 'lf-2', title: 'Shared with Me', sub: '5 folders', color: Maple.body, active: false },
    { id: 'lf-3', title: 'School Department', sub: '8 folders', color: Maple.warning, active: false },
    { id: 'lf-4', title: 'Class Resources', sub: '6 folders', color: Maple.warning, active: false },
    { id: 'lf-5', title: 'Co-Teaching Collections', sub: '9 folders', color: Maple.blue, active: false },
    { id: 'lf-6', title: 'Favorites', sub: '0 items', color: Maple.warning, active: false },
  ],
  subFolders: [
    {
      id: 'sf-1',
      title: 'Algebra Worksheets',
      filesLabel: '12 files',
      folderColor: Maple.blue,
      badgeBg: Maple.blue,
      badgeGlyph: '≡',
    },
    {
      id: 'sf-2',
      title: 'Functions Slides',
      filesLabel: '8 files',
      folderColor: '#FCD34D',
      badgeBg: '#EA580C',
      badgeGlyph: '▶',
    },
    {
      id: 'sf-3',
      title: 'Past Papers 2020–2024',
      filesLabel: '24 files',
      folderColor: '#FCD34D',
      badgeBg: Maple.error,
      badgeGlyph: 'PDF',
    },
    {
      id: 'sf-4',
      title: 'Exam Revision',
      filesLabel: '10 files',
      folderColor: '#FCD34D',
      badgeBg: Maple.warning,
      badgeGlyph: '≡',
    },
  ] as LibraryFolderCard[],
  files: [
    {
      id: 'f-1',
      title: 'O-Level Maths\nPast Paper 2023.pdf',
      meta: 'PDF • 2.4 MB',
      date: '12 Oct 2026',
      kind: 'pdf',
      badgeColor: Maple.error,
      badgeText: 'PDF',
    },
    {
      id: 'f-2',
      title: 'Quadratic Functions\nLesson Slides.pptx',
      meta: 'PPTX • 8.1 MB',
      date: '10 Oct 2026',
      kind: 'pptx',
      badgeColor: '#EA580C',
      badgeText: 'P',
    },
    {
      id: 'f-3',
      title: 'Algebra Worksheet\n1.docx',
      meta: 'DOCX • 350 KB',
      date: '8 Oct 2026',
      kind: 'docx',
      badgeColor: Maple.blue,
      badgeText: 'W',
    },
    {
      id: 'f-4',
      title: 'Trigonometry\nSummary.png',
      meta: 'PNG • 1.2 MB',
      date: '6 Oct 2026',
      kind: 'png',
      badgeColor: Maple.successText,
      badgeText: 'IMG',
    },
    {
      id: 'f-5',
      title: 'Solving Equations\nVideo Lesson.mp4',
      meta: 'MP4 • 120 MB',
      date: '5 Oct 2026',
      kind: 'mp4',
      badgeColor: Maple.blue,
      badgeText: '▶',
      videoThumb: photos.teacherHome.live,
      videoDuration: '15:24',
    },
    {
      id: 'f-6',
      title: 'Mock Exam\nMark Scheme.pdf',
      meta: 'PDF • 1.8 MB',
      date: '2 Oct 2026',
      kind: 'pdf',
      badgeColor: Maple.error,
      badgeText: 'PDF',
    },
    {
      id: 'f-7',
      title: 'Coordinate Geometry\nSlides.pptx',
      meta: 'PPTX • 6.3 MB',
      date: '1 Oct 2026',
      kind: 'pptx',
      badgeColor: '#EA580C',
      badgeText: 'P',
    },
    {
      id: 'f-8',
      title: 'Student Practice\nQuestions.xlsx',
      meta: 'XLSX • 420 KB',
      date: '28 Sep 2026',
      kind: 'xlsx',
      badgeColor: Maple.successText,
      badgeText: 'X',
    },
  ] as LibraryFileCard[],
  selectedFile: {
    title: 'Functions Worksheet 3.docx',
    meta: 'DOCX • 420 KB • 8 Oct 2026',
    type: 'Worksheet',
    subject: 'Mathematics',
    level: 'O-Level',
    tags: ['Functions', 'Practice', 'Worksheet'],
    description:
      'Practice questions on functions including graphs, equations, and real-life applications.',
    sharedFaces: [
      photos.teacherHome.sarah,
      photos.teacherHome.daniel,
      photos.teacherHome.aisha,
    ],
    sharedExtra: '+3',
  },
  collections: [
    {
      id: 'col-1',
      title: 'Mathematics Department',
      subtitle: 'Shared collection',
      stats: '124 resources • 6 teachers',
      color: Maple.blue,
      icon: 'people' as IconName,
      faces: [
        photos.teacherHome.sarah,
        photos.teacherHome.daniel,
        photos.teacherHome.grace,
      ],
      extraCount: '+3',
    },
    {
      id: 'col-2',
      title: 'O-Level Exam Prep',
      subtitle: 'Shared collection',
      stats: '48 resources • 4 teachers',
      color: Maple.blue,
      icon: 'book' as IconName,
      faces: [
        photos.teacherHome.sarah,
        photos.teacherHome.emmanuel,
        photos.teacherHome.aisha,
      ],
      extraCount: '+1',
    },
    {
      id: 'col-3',
      title: 'Lower Secondary Schemes',
      subtitle: 'Shared collection',
      stats: '76 resources • 5 teachers',
      color: Maple.successText,
      icon: 'upload' as IconName,
      faces: [
        photos.teacherHome.sarah,
        photos.teacherHome.peter,
        photos.teacherHome.grace,
      ],
      extraCount: '+2',
    },
    {
      id: 'col-4',
      title: 'Holiday Learning Pack',
      subtitle: 'Shared collection',
      stats: '32 resources • 3 teachers',
      color: Maple.warning,
      icon: 'sparkle' as IconName,
      faces: [
        photos.teacherHome.sarah,
        photos.teacherHome.daniel,
        photos.teacherHome.aisha,
      ],
    },
  ] as CoTeachingCollectionCard[],
  popularResources: [
    {
      id: 'pr-1',
      title: 'O-Level Maths Past Paper 2023.pdf',
      meta: '2.4 MB • 12 Oct 2026',
      badgeColor: Maple.error,
      badgeText: 'PDF',
    },
    {
      id: 'pr-2',
      title: 'Algebra Worksheet 1.docx',
      meta: '350 KB • 8 Oct 2026',
      badgeColor: Maple.blue,
      badgeText: 'W',
    },
    {
      id: 'pr-3',
      title: 'Quadratic Functions Slides.pptx',
      meta: '8.1 MB • 10 Oct 2026',
      badgeColor: '#EA580C',
      badgeText: 'P',
    },
    {
      id: 'pr-4',
      title: 'Trigonometry Summary.png',
      meta: '1.2 MB • 6 Oct 2026',
      badgeColor: Maple.successText,
      badgeText: 'IMG',
    },
  ],
};

export type TeacherLibrary = typeof teacherLibrary;

