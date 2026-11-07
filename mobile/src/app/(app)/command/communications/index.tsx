import { CommandRoute } from '@/features/command/kit/CommandRoute';
import { MessagesDesk, MessagesPhone } from '@/features/command/views/CommsMessages';

/** Maple Command › Communications › Messages (`/(command)/communications`). */
export default function CommunicationsScreen() {
  return <CommandRoute desk={MessagesDesk} phone={MessagesPhone} title="Communications" subtitle="Conversations across Maple" />;
}
