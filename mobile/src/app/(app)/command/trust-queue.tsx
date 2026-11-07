import { CommandRoute } from '@/features/command/kit/CommandRoute';
import { TrustQueueDesk, TrustQueuePhone } from '@/features/command/views/TrustQueueViews';

/** Maple Command › AI-assisted Trust, Safety & Teacher Verification Queue (`/(command)/trust-queue`). */
export default function TrustQueueScreen() {
  return <CommandRoute desk={TrustQueueDesk} phone={TrustQueuePhone} title="Verification Queue" subtitle="AI pre-screened teacher applications for human sign-off" />;
}
