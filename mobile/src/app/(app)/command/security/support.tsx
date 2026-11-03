import { CommandRoute } from '@/features/command/kit/CommandRoute';
import { SupportDesk, SupportPhone } from '@/features/command/views/SupportViews';

/** Maple Command › Security › Support & Escalations (`/(command)/security/support`). */
export default function SupportScreen() {
  return <CommandRoute desk={SupportDesk} phone={SupportPhone} title="Support & Escalations" subtitle="Tickets, SLAs and escalations" />;
}
