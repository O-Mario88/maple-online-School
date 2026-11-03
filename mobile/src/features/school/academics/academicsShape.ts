import type { IconName } from '@/lib/icons';
import type { AdminTable, NavItem, SubjectTone } from '@/mock/portal';

/** A configuration table's layout: its title, buttons and columns. Rows come from sample or real data. */
export type AdminTableShape = Omit<AdminTable, 'rows'>;

/** The Academics page's own sidebar. */
export const ACADEMICS_NAV = [
  { label: 'Dashboard', icon: 'home', href: '/' },
  { label: 'Students', icon: 'people', href: '/admin/rosters' },
  { label: 'Teachers', icon: 'people', href: '/admin/rosters' },
  { label: 'Classes', icon: 'columns', href: '/admin/rosters' },
  { label: 'Academics', icon: 'cap', href: '/admin/academics' },
  { label: 'Attendance', icon: 'calendar', href: '/admin/attendance' },
  { label: 'Fees & Billing', icon: 'wallet', href: '/admin/accounting' },
  { label: 'Reports', icon: 'chart', href: '/admin/attendance' },
  { label: 'Communication', icon: 'chat', href: '/messages' },
  { label: 'Settings', icon: 'settings', href: '/admin/settings' },
] as readonly NavItem[];

/** The summary strip's parts; counts come from sample or real data. */
export const ACADEMICS_SECTIONS = [
  { key: 'campuses', label: 'Campuses', body: 'Manage campuses and school branches', icon: 'campus', tone: 'blue', countLabel: 'Campuses' },
  {
    key: 'years',
    label: 'Academic Years',
    body: 'Set academic years and terms',
    icon: 'calendar',
    tone: 'green',
    countLabel: 'Academic Years',
  },
  {
    key: 'terms',
    label: 'Terms / Semesters',
    body: 'Configure term dates and holidays',
    icon: 'book',
    tone: 'purple',
    countLabel: 'Terms',
  },
  {
    key: 'streams',
    label: 'Grade Streams',
    body: 'Manage grades, sections and streams',
    icon: 'people',
    tone: 'green',
    countLabel: 'Grade Levels',
  },
  {
    key: 'subjects',
    label: 'Subjects & Subject Matrix',
    body: 'Configure subjects per grade',
    icon: 'grid',
    tone: 'blue',
    countLabel: 'Subjects',
  },
  {
    key: 'grading',
    label: 'Grading Scales',
    body: 'Set grading systems and descriptors',
    icon: 'star',
    tone: 'blue',
    countLabel: 'Grading Scales',
  },
  {
    key: 'competency',
    label: 'Competency Framework',
    body: 'Manage competency areas and rubrics',
    icon: 'chart',
    tone: 'blue',
    countLabel: 'Competency Areas',
  },
] as readonly { key: string; label: string; body: string; icon: IconName; tone: SubjectTone; countLabel: string }[];

export const ACADEMICS_TABS = [
  { label: 'Overview', icon: 'school' },
  { label: 'Campuses', icon: 'campus' },
  { label: 'Academic Years', icon: 'calendar' },
  { label: 'Terms / Semesters', icon: 'book' },
  { label: 'Grade Streams', icon: 'people' },
  { label: 'Subjects & Matrix', icon: 'grid' },
  { label: 'Grading Scales', icon: 'doc' },
  { label: 'Competency Framework', icon: 'chart' },
] as readonly { label: string; icon: IconName }[];

export const ACADEMICS_QUICK_ACTIONS = [
  { label: 'Add Campus', icon: 'campus' },
  { label: 'New Academic Year', icon: 'calendar' },
  { label: 'Create Term', icon: 'book' },
  { label: 'Import from Template', icon: 'upload' },
] as readonly { label: string; icon: IconName }[];

export const ACADEMICS_TABLES = [
  {
    key: 'campuses',
    title: 'Campuses',
    subtitle: 'Manage your school campuses and branches.',
    icon: 'campus',
    tone: 'blue',
    actions: ['Add Campus'],
    columns: [
      { label: '#', flex: 0.4 },
      { label: 'Campus Name', flex: 2.5 },
      { label: 'Location', flex: 1 },
      { label: 'School Type', flex: 1.3 },
      { label: 'Students', flex: 1 },
      { label: 'Status', flex: 1.15 },
    ],
  },
  {
    key: 'years',
    title: 'Academic Years',
    subtitle: 'Manage academic years and set them as current.',
    icon: 'calendar',
    tone: 'green',
    actions: ['Add Academic Year'],
    columns: [
      { label: '#', flex: 0.45 },
      { label: 'Year', flex: 1.05 },
      { label: 'Start Date', flex: 1.5 },
      { label: 'End Date', flex: 1.5 },
      { label: 'Terms', flex: 1 },
      { label: 'Status', flex: 1.55 },
    ],
  },
  {
    key: 'terms',
    title: 'Terms / Semesters',
    subtitle: 'Configure term dates, holidays and important periods.',
    icon: 'book',
    tone: 'purple',
    actions: ['Add Term'],
    columns: [
      { label: '#', flex: 0.4 },
      { label: 'Term Name', flex: 1.5 },
      { label: 'Academic Year', flex: 1.7 },
      { label: 'Start Date', flex: 1.6 },
      { label: 'End Date', flex: 1.6 },
      { label: 'Status', flex: 1.5 },
    ],
  },
  {
    key: 'streams',
    title: 'Grade Streams',
    subtitle: 'Manage grade levels, sections and streams.',
    icon: 'people',
    tone: 'green',
    actions: ['Add Grade'],
    columns: [
      { label: '#', flex: 0.5 },
      { label: 'Grade Level', flex: 1.5 },
      { label: 'Stream / Section', flex: 2 },
      { label: 'Students', flex: 1.2 },
      { label: 'Status', flex: 1.4 },
    ],
  },
  {
    key: 'subjects',
    title: 'Subjects & Subject Matrix',
    subtitle: 'Configure subjects and assign them to each grade level.',
    icon: 'grid',
    tone: 'blue',
    actions: ['Add Subject', 'Manage Matrix'],
    columns: [
      { label: '#', flex: 0.5 },
      { label: 'Subject Name', flex: 2.1 },
      { label: 'Code', flex: 1 },
      { label: 'Grade Levels', flex: 1.4 },
      { label: 'Type', flex: 1 },
      { label: 'Status', flex: 1.2 },
    ],
  },
  {
    key: 'grading',
    title: 'Grading Scales',
    subtitle: 'Define grading scales and performance descriptors.',
    icon: 'star',
    tone: 'blue',
    actions: ['Add Scale'],
    columns: [
      { label: '#', flex: 0.4 },
      { label: 'Scale Name', flex: 1.5 },
      { label: 'Type', flex: 1.3 },
      { label: 'Used By', flex: 1.2 },
      { label: 'Status', flex: 1.2 },
    ],
  },
  {
    key: 'competency',
    title: 'Competency Framework',
    subtitle: 'Set competency areas and learning standards.',
    icon: 'chart',
    tone: 'blue',
    actions: ['Add Framework'],
    columns: [
      { label: '#', flex: 0.4 },
      { label: 'Framework Name', flex: 2.4 },
      { label: 'Levels', flex: 0.9 },
      { label: 'Status', flex: 1.1 },
    ],
  },
] as readonly AdminTableShape[];

/** Everything the Academics design draws, from sample data (design builds) or the API (real builds). */
export interface AcademicsPage {
  me: { name: string; role: string; avatar?: number; initial: string; notifications: number };
  /** The school the page is for, shown in the top bar's school switcher. */
  school: string;
  /** Subject matrices: the curriculum classes that have subjects assigned. */
  matrices: number;
  nav: readonly NavItem[];
  sections: readonly ((typeof ACADEMICS_SECTIONS)[number] & { count: number })[];
  tabs: typeof ACADEMICS_TABS;
  quickActions: typeof ACADEMICS_QUICK_ACTIONS;
  tables: readonly AdminTable[];
}
