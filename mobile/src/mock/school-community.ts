/**
 * Sample data for School Community: Riverside High School's own moderated space — posts, groups,
 * announcements and events. Only the school's own learners, staff and parents take part. Illustrative.
 */
import type { Member, Post } from '@/features/school/community/community';
import type { IconName } from '@/lib/icons';

import { photos } from './photos';

type Photo = number;
const hub = photos.schoolHub;

export interface CommunityPost extends Post {
  author: string;
  badge: string;
  context: string;
  ago: string;
  avatar: Photo;
  title: string;
  body: string;
  file?: { name: string; size: string };
  images: readonly Photo[];
  comments: number;
  saved: boolean;
}

const posts: readonly CommunityPost[] = [
  {
    id: 'p1',
    authorId: 't-diana',
    author: 'Ms. Diana Nanyonga',
    badge: 'Teacher',
    context: 'Science Department',
    ago: '2 hours ago',
    avatar: require('./images/pp-grace.png') as Photo,
    category: 'Academic',
    at: '2026-11-05T08:00:00Z',
    title: 'S.4 Practicals: Photosynthesis Experiment',
    body: 'A reminder to all S.4 learners that the Biology practical on Photosynthesis will take place this Friday in the science laboratory. Please review the experiment guide and come prepared with your lab coat.',
    file: { name: 'Photosynthesis Practical Guide.pdf', size: '1.2 MB' },
    images: [hub.leaf],
    likes: 56,
    likedBy: [],
    comments: 18,
    saved: false,
    status: 'published',
  },
  {
    id: 'p2',
    authorId: 'l-brian',
    author: 'Brian Mugisha',
    badge: 'Learner (S.5)',
    context: 'STEM Club',
    ago: '5 hours ago',
    avatar: require('./images/pp-samuel.png') as Photo,
    category: 'Achievements',
    at: '2026-11-05T05:00:00Z',
    title: 'Our STEM Club Project: Smart Irrigation System',
    body: 'We’re excited to share progress on our smart irrigation system project! It uses a soil moisture sensor to conserve water and improve plant growth. Here are some photos from today’s build session.',
    images: hub.stem,
    likes: 92,
    likedBy: ['admin-kato'],
    comments: 24,
    saved: false,
    status: 'published',
  },
  {
    id: 'p3',
    authorId: 'l-amina',
    author: 'Amina Nakato',
    badge: 'Learner (S.3)',
    context: 'Debate Society',
    ago: '1 hour ago',
    avatar: require('./images/pp-nakato.png') as Photo,
    category: 'Events',
    at: '2026-11-05T09:00:00Z',
    title: 'Debate practice moved to Thursday',
    body: 'Hi everyone, debate practice is moving to Thursday after classes in the Assembly Hall.',
    images: [],
    likes: 4,
    likedBy: [],
    comments: 1,
    saved: false,
    status: 'pending',
  },
];

export const schoolCommunity = {
  me: { id: 'admin-kato', role: 'admin', minor: false } as Member,
  meAvatar: require('./images/pp-kato.png') as Photo,
  cover: photos.schoolNetwork.campus.riverside,
  title: 'Riverside High School Community',
  tabs: ['Home (Feed)', 'Groups', 'Announcements', 'Events', 'Polls', 'Achievements', 'Moderation'],
  tabIcons: ['home', 'cap', 'megaphone', 'calendar', 'chart', 'trophy', 'shield'] as readonly IconName[],
  nav: [
    { label: 'Feed', icon: 'home' as IconName, count: 0 },
    { label: 'My Groups', icon: 'people' as IconName, count: 6 },
    { label: 'Announcements', icon: 'megaphone' as IconName, count: 3 },
    { label: 'Events', icon: 'calendar' as IconName, count: 0 },
    { label: 'Polls', icon: 'chart' as IconName, count: 0 },
    { label: 'Achievements', icon: 'trophy' as IconName, count: 0 },
    { label: 'Saved Posts', icon: 'bookmark' as IconName, count: 0 },
  ],
  groups: [
    { id: 'g1', name: 'S.4 Physics', members: 128, photo: hub.groups[0], moderated: true },
    { id: 'g2', name: 'STEM Club', members: 93, photo: hub.groups[1], moderated: false },
    { id: 'g3', name: 'Debate Society', members: 67, photo: hub.groups[2], moderated: true },
    { id: 'g4', name: 'ICT & Innovation', members: 104, photo: hub.groups[3], moderated: true },
  ],
  posts,
  announcements: [
    { id: 'a1', title: 'Term 3 Examinations Timetable', sub: 'Exams start on Nov 23, 2026.', icon: 'calendar' as IconName, isNew: true },
    { id: 'a2', title: 'Parent–Teacher Meeting', sub: 'Fri, Nov 13, 2026 at 2:00 PM.', icon: 'people' as IconName, isNew: false },
    { id: 'a3', title: 'School Closure – Public Holiday', sub: 'School will be closed on Wed, Dec 9, 2026.', icon: 'info' as IconName, isNew: false },
  ],
  events: [
    { id: 'e1', month: 'Nov', day: '18', title: 'Science Innovation Fair', time: '9:00 AM – 4:00 PM', place: 'Main Hall' },
    { id: 'e2', month: 'Nov', day: '27', title: 'Inter-Class Debate Finals', time: '2:00 PM – 5:00 PM', place: 'Assembly Hall' },
  ],
  guidelines: 'A safe, respectful and inclusive space for learning and school collaboration.',
};
