import { CommunityDesk, CommunityPhone } from '@/features/school/community/CommunityViews';
import { AdminRoute } from '@/features/school/kit/AdminRoute';

/** School Community (`/(school-admin)/community`): the school's own moderated feed, groups, announcements and events. */
export default function AdminCommunityScreen() {
  return <AdminRoute desk={CommunityDesk} phone={CommunityPhone} title="School Community" subtitle="Your school's moderated space for learning and announcements" />;
}
