/** Maple Command › Communications sample data: conversations, announcements and broadcasts. */
import type { Announcement, Group, Message, Thread } from '@/features/command/logic/comms';
import type { IconName } from '@/lib/icons';

import { face, type KpiData, type Photo, type Tone } from './shared';

export const NOW = '2026-10-26T07:40:00Z';
const THUMBS: readonly Photo[] = [
  require('../images/ann-thumb-1.png'),
  require('../images/ann-thumb-2.png'),
  require('../images/ann-thumb-3.png'),
  require('../images/ann-thumb-4.png'),
  require('../images/ann-thumb-5.png'),
  require('../images/ann-thumb-6.png'),
  require('../images/ann-thumb-7.png'),
  require('../images/ann-thumb-8.png'),
  require('../images/ann-thumb-9.png'),
  require('../images/ann-thumb-10.png'),
];
const thumb = (n: number): Photo => THUMBS[(n - 1) % THUMBS.length];
export const hero = require('../images/ann-hero.png') as Photo;

/* ─── Messages ─── */

export const messageStats: readonly KpiData[] = [
  { label: 'Total Messages', value: '12,842', delta: '28%', caption: 'vs. last month', icon: 'chat', tone: 'blue' },
  { label: 'Active Conversations', value: '1,248', delta: '18%', caption: 'with recent activity', icon: 'people', tone: 'blue' },
  { label: 'Announcements Sent', value: '86', delta: '42%', caption: 'reach 42,560 users', icon: 'megaphone', tone: 'red' },
  { label: 'Broadcast Messages', value: '24', delta: '33%', caption: 'avg. open rate 78%', icon: 'send', tone: 'green' },
  { label: 'Pending Responses', value: '187', delta: '15%', caption: 'require action', icon: 'bell', tone: 'orange' },
];

export interface Participant {
  name: string;
  role: string;
  avatar: Photo;
  online: boolean;
}

export interface ThreadRow extends Thread {
  sub: string;
  avatar?: Photo;
  icon?: IconName;
  tone?: Tone;
  verified?: boolean;
  created?: string;
  participants?: readonly Participant[];
  files?: readonly { name: string; meta: string; kind: 'pdf' | 'doc' | 'xls' }[];
}

const M = (id: string, by: string, time: string, text: string, reactions: Record<string, readonly string[]> = {}, file?: Message['file']): Message => ({ id, by, time, text, reactions, mentions: [], file });
const people = (n: number, name: string) => Array.from({ length: n }, (_, i) => `${name}${i}`);

export const threads: readonly ThreadRow[] = [
  {
    id: 't1',
    name: 'Green Valley Academy',
    kind: 'School',
    sub: 'School · 6 members',
    icon: 'people',
    tone: 'blue',
    unread: 3,
    mentions: 0,
    archived: false,
    preview: 'Mary: Please review the new lesson plan...',
    time: '10:24 AM',
    created: 'Created Oct 10, 2026 by Mary N.',
    messages: [
      M('m1', 'Mary N.', '09:12 AM', 'Good morning team! Please review the updated Primary 5 lesson plan.\nLet me know if you have any feedback before we finalize.', { '👍': people(4, 'a'), '❤️': people(2, 'b') }, { name: 'P5_Mathematics_Lesson_Plan.pdf', size: '2.4 MB' }),
      M('m2', 'James Ochieng', '09:28 AM', 'This looks good. I especially like the new activity on fractions.\nI will share with my class tomorrow.', { '👍': people(3, 'c') }),
      M('m3', 'Sarah Namulindwa', '10:05 AM', 'Thank you for keeping us updated. My daughter is excited about the new topic!', { '❤️': people(2, 'd') }),
      M('m4', 'Grace Nanyonga', '10:18 AM', "I've added a few comments on page 3. Overall, it looks great!", { '👍': people(1, 'e') }),
    ],
    participants: [
      { name: 'Mary N. (You)', role: 'Global Administrator', avatar: face.mary, online: true },
      { name: 'James Ochieng', role: 'Teacher', avatar: face.james, online: true },
      { name: 'Sarah Namulindwa', role: 'Parent', avatar: face.sarah, online: true },
      { name: 'Grace Nanyonga', role: 'School Admin', avatar: face.grace, online: true },
      { name: 'Peter Mwangi', role: 'Teacher', avatar: face.okello, online: false },
      { name: 'Lydia Banda', role: 'Parent', avatar: face.esther, online: false },
    ],
    files: [
      { name: 'P5_Mathematics_Lesson_Plan.pdf', meta: '2.4 MB · Oct 26, 2026', kind: 'pdf' },
      { name: 'Assessment_Rubric.docx', meta: '1.1 MB · Oct 24, 2026', kind: 'doc' },
      { name: 'Class_Schedule.xlsx', meta: '520 KB · Oct 20, 2026', kind: 'xls' },
    ],
  },
  { id: 't2', name: 'James Ochieng', kind: 'Teacher', sub: 'Teacher · Mathematics', avatar: face.james, unread: 1, mentions: 1, archived: false, preview: 'Thanks for the update. I will share with the class.', time: '09:18 AM', messages: [M('m1', 'James Ochieng', '09:18 AM', 'Thanks for the update. I will share with the class.')] },
  { id: 't3', name: 'P5 Science (Live Class)', kind: 'Class', sub: 'Class · 28 students', icon: 'people', tone: 'purple', unread: 12, mentions: 0, archived: false, preview: 'Teacher: Homework is now available.', time: '08:45 AM', messages: [M('m1', 'Teacher', '08:45 AM', 'Homework is now available.')] },
  { id: 't4', name: 'Sarah Namulindwa', kind: 'Parent', sub: 'Parent · Hope International', avatar: face.sarah, unread: 1, mentions: 0, archived: false, preview: 'Thank you for the feedback!', time: 'Yesterday', messages: [M('m1', 'Sarah Namulindwa', 'Yesterday', 'Thank you for the feedback!')] },
  { id: 't5', name: 'Curriculum Team', kind: 'Internal', sub: 'Internal · 8 members', icon: 'people', tone: 'blue', unread: 0, mentions: 2, archived: false, preview: 'Samuel: Updated the Primary 5 plan.', time: 'Yesterday', messages: [M('m1', 'Samuel', 'Yesterday', 'Updated the Primary 5 plan. @Mary please sign off.')] },
  { id: 't6', name: 'Maple Support', kind: 'System', sub: 'System', icon: 'headset', tone: 'blue', verified: true, unread: 0, mentions: 0, archived: false, preview: 'Your refund request has been resolved.', time: 'Oct 24', messages: [M('m1', 'Maple Support', 'Oct 24', 'Your refund request has been resolved.')] },
  { id: 't7', name: "St. Mark's College", kind: 'School', sub: 'School · 4 members', icon: 'building', tone: 'blue', unread: 0, mentions: 0, archived: false, preview: 'Budget report has been uploaded.', time: 'Oct 24', messages: [M('m1', 'Bursar', 'Oct 24', 'Budget report has been uploaded.')] },
  { id: 't8', name: 'Daniel Okello', kind: 'Teacher', sub: 'Teacher · English', avatar: face.john, unread: 0, mentions: 0, archived: false, preview: 'Can you confirm the exam schedule?', time: 'Oct 23', messages: [M('m1', 'Daniel Okello', 'Oct 23', 'Can you confirm the exam schedule?')] },
  { id: 't9', name: 'Content & Quality Team', kind: 'Internal', sub: 'Internal · 6 members', icon: 'people', tone: 'blue', unread: 0, mentions: 0, archived: false, preview: 'Grace: The new rubric looks great.', time: 'Oct 23', messages: [M('m1', 'Grace', 'Oct 23', 'The new rubric looks great.')] },
  { id: 't10', name: 'Announcements', kind: 'System Broadcast', sub: 'System Broadcast', icon: 'megaphone', tone: 'orange', unread: 0, mentions: 0, archived: false, preview: 'New feature: AI lesson plan assistant is now live.', time: 'Oct 22', messages: [M('m1', 'Maple', 'Oct 22', 'New feature: AI lesson plan assistant is now live.')] },
  { id: 't11', name: 'Term 2 Exam Committee', kind: 'Internal', sub: 'Internal · 5 members', icon: 'people', tone: 'grey', unread: 0, mentions: 0, archived: true, preview: 'Committee closed for Term 2.', time: 'Aug 30', messages: [M('m1', 'Mary N.', 'Aug 30', 'Committee closed for Term 2.')] },
];

export const threadTabs: readonly { label: 'All Messages' | 'Unread' | 'Mentions' | 'Announcements' | 'Broadcasts' | 'Archived'; base?: number }[] = [
  { label: 'All Messages', base: 1248 },
  { label: 'Unread', base: 24 },
  { label: 'Mentions', base: 18 },
  { label: 'Announcements', base: 86 },
  { label: 'Broadcasts', base: 24 },
  { label: 'Archived' },
];

/* ─── Announcements ─── */

export type Audience = 'Students' | 'All Users' | 'Parents' | 'Teachers';

export interface AnnouncementRow extends Announcement {
  n: number;
  preview: string;
  body: string;
  audience: Audience;
  category: string;
  categoryIcon: IconName;
  date: string;
  reach: number | null;
  engagement: number | null;
  clicks: number | null;
  priority: 'High' | 'Normal';
  thumb: Photo;
  attachment?: { name: string; size: string };
}

const A = (n: number, title: string, preview: string, audience: Audience, category: string, categoryIcon: IconName, status: Announcement['status'], date: string, reach: number | null, engagement: number | null, extra: Partial<AnnouncementRow> = {}): AnnouncementRow => ({
  n,
  id: `ann-${n}`,
  title,
  preview,
  body: `${preview.replace('...', '.')} For any questions, contact our support team.`,
  audience,
  category,
  categoryIcon,
  status,
  date,
  reach,
  engagement,
  clicks: reach && engagement ? Math.round((reach * engagement) / 100) : null,
  priority: 'Normal',
  thumb: thumb(n),
  ...extra,
});

export const announcements: readonly AnnouncementRow[] = [
  A(1, 'Term 3 Registration is Now Open', "Register early to secure your child's place...", 'Students', 'Academic', 'cap', 'Published', 'Oct 24, 2026\n10:00 AM', 12460, 28, {
    body: "Register early to secure your child's place for Term 3. New and returning students can now complete the registration process online. For any questions, contact our support team.",
    priority: 'High',
    clicks: 3520,
    attachment: { name: 'Registration_Guide.pdf', size: '1.8 MB' },
    publishedAt: 'Oct 24, 2026, 10:00 AM by Mary N.',
  }),
  A(2, 'System Maintenance Notice', 'Scheduled maintenance on Sunday...', 'All Users', 'System', 'settings', 'Published', 'Oct 22, 2026\n08:30 AM', 18245, 35),
  A(3, 'New Mathematics Course Available', 'Explore our new interactive course...', 'Students', 'Courses', 'book', 'Published', 'Oct 20, 2026\n02:15 PM', 9876, 22),
  A(4, 'Parent-Teacher Meeting Schedule', 'Find the schedule for Term 2 meetings...', 'Parents', 'Events', 'calendar', 'Scheduled', 'Oct 28, 2026\n09:00 AM', null, null),
  A(5, 'Holiday Break Reminder', 'Schools will be closed from Dec 20...', 'All Users', 'Calendar', 'calendar', 'Published', 'Oct 18, 2026\n11:00 AM', 25430, 42),
  A(6, 'New Feature: Interactive Whiteboard', "We're excited to introduce live whiteboard...", 'Teachers', 'Platform', 'screen', 'Published', 'Oct 15, 2026\n01:20 PM', 6980, 18),
  A(7, 'Student Achievement Spotlight', 'Celebrating our amazing learners this month...', 'All Users', 'Community', 'people', 'Published', 'Oct 12, 2026\n09:00 AM', 14220, 31),
  A(8, 'Updated Fees and Payment Options', 'New flexible payment plans are now available...', 'Parents', 'Finance', 'wallet', 'Draft', '—', null, null),
  A(9, 'Teacher Professional Development', 'Join our upcoming training sessions...', 'Teachers', 'Training', 'cap', 'Published', 'Oct 8, 2026\n03:10 PM', 8540, 26),
  A(10, 'Important Policy Update', 'Please review the updated code of conduct...', 'All Users', 'Policy', 'shield', 'Scheduled', 'Oct 30, 2026\n08:00 AM', null, null),
];

export const announcementStats: readonly KpiData[] = [
  { label: 'Total Announcements', value: '86', delta: '42%', caption: 'vs. last month', icon: 'megaphone', tone: 'blue' },
  { label: 'Published', value: '72', delta: '28%', caption: 'reach 42,560 users', icon: 'send', tone: 'green' },
  { label: 'Drafts', value: '8', caption: 'not published', icon: 'edit', tone: 'grey' },
  { label: 'Scheduled', value: '6', delta: '100%', caption: 'upcoming releases', icon: 'clock', tone: 'grey' },
];

/** Tab totals for the month; they move as items change status. */
export const announcementTotals = { all: 86, Published: 72, Scheduled: 6, Draft: 8, Archived: 0 };

/* ─── Broadcasts ─── */

export type BroadcastStatus = 'Sent' | 'Completed' | 'Scheduled' | 'Sending' | 'Draft' | 'Failed';
export type Channel = 'Email' | 'In-App Notification' | 'SMS' | 'WhatsApp';

export interface BroadcastRow {
  n: number;
  id: string;
  title: string;
  preview: string;
  audience: Audience;
  channels: readonly Channel[];
  status: BroadcastStatus;
  when: string;
  reach: number | null;
  open: number | null;
  click: number | null;
  thumb: Photo;
}

const ALL_CH: readonly Channel[] = ['Email', 'In-App Notification', 'SMS', 'WhatsApp'];
const B = (n: number, title: string, preview: string, audience: Audience, status: BroadcastStatus, when: string, reach: number | null, open: number | null, click: number | null, ch: readonly Channel[] = ALL_CH): BroadcastRow => ({ n, id: `bc-${n}`, title, preview, audience, channels: ch, status, when, reach, open, click, thumb: thumb(n) });

export const broadcasts: readonly BroadcastRow[] = [
  B(1, 'Term 3 Registration is Now Open', "Register early to secure your child's place...", 'Students', 'Sent', 'Oct 24, 2026\n10:00 AM', 12460, 88, 24),
  B(2, 'System Maintenance Notice', 'Scheduled maintenance on Sunday...', 'All Users', 'Completed', 'Oct 22, 2026\n08:30 AM', 18245, 92, 18),
  B(3, 'New Mathematics Course Available', 'Explore our new interactive course...', 'Students', 'Sent', 'Oct 20, 2026\n02:15 PM', 9876, 82, 28),
  B(4, 'Parent-Teacher Meeting Schedule', 'Find the schedule for Term 2 meetings...', 'Parents', 'Sent', 'Oct 18, 2026\n09:00 AM', 25430, 90, 32),
  B(5, 'Holiday Break Reminder', 'Schools will be closed from Dec 20...', 'All Users', 'Scheduled', 'Oct 28, 2026\n09:00 AM', null, null, null, ['Email', 'In-App Notification', 'SMS']),
  B(6, 'New Feature: Interactive Whiteboard', "We're excited to introduce live whiteboard...", 'Teachers', 'Completed', 'Oct 15, 2026\n01:20 PM', 6980, 76, 20),
  B(7, 'Student Achievement Spotlight', 'Celebrating our amazing learners this month...', 'All Users', 'Sent', 'Oct 12, 2026\n09:00 AM', 14220, 84, 26),
  B(8, 'Updated Fees and Payment Options', 'New flexible payment plans are now available...', 'Parents', 'Draft', '—', null, null, null, ['Email', 'In-App Notification', 'SMS']),
  B(9, 'Teacher Professional Development', 'Join our upcoming training sessions...', 'Teachers', 'Sent', 'Oct 8, 2026\n03:10 PM', 8540, 80, 22),
  B(10, 'Important Policy Update', 'Please review the updated code of conduct...', 'All Users', 'Completed', 'Oct 3, 2026\n08:00 AM', 21760, 86, 29),
];

export const broadcastStats: readonly KpiData[] = [
  { label: 'Total Broadcasts', value: '124', delta: '28%', caption: 'vs. last month', icon: 'send', tone: 'green' },
  { label: 'Messages Sent', value: '1.2M', delta: '42%', caption: 'across all channels', icon: 'people', tone: 'orange' },
  { label: 'Average Open Rate', value: '86%', delta: '12%', caption: 'vs. last month', icon: 'chart', tone: 'blue' },
  { label: 'Click Rate', value: '24%', delta: '8%', caption: 'vs. last month', icon: 'link', tone: 'blue' },
];

export const broadcastTotals = { all: 124, Scheduled: 18, Sending: 3, Completed: 95, Failed: 8 };

/** How many people each group has, for reach estimates. */
export const audienceSizes: Readonly<Record<Group, number>> = { Students: 31240, Parents: 18620, Teachers: 3480, 'School Administrators': 412 };
export const schools = ['Green Valley Academy', 'Bright Future School', "St. Mark's College", 'Hope International', 'Sunrise Primary', 'Cornerstone Academy'];
export const templates: readonly { title: string; content: string }[] = [
  { title: 'Term registration open', content: 'Registration for next term is now open. Complete it online before the deadline to keep your place.' },
  { title: 'Fees reminder', content: 'This is a friendly reminder that school fees for this term are due. Pay by Mobile Money, card or bank transfer in the Maple app.' },
  { title: 'Planned maintenance', content: 'Maple will be briefly unavailable on Sunday from 02:00 to 04:00 EAT for planned maintenance.' },
];
