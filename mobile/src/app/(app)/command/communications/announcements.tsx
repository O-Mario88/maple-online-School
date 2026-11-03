import { CommandRoute } from '@/features/command/kit/CommandRoute';
import { AnnouncementsDesk, AnnouncementsPhone } from '@/features/command/views/CommsAnnouncements';

/** Maple Command › Communications › Announcements (`/(command)/communications/announcements`). */
export default function AnnouncementsScreen() {
  return <CommandRoute desk={AnnouncementsDesk} phone={AnnouncementsPhone} title="Announcements" subtitle="News for teachers, learners and parents" />;
}
