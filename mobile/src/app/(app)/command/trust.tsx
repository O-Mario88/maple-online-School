import { CommandRoute } from '@/features/command/kit/CommandRoute';
import { TrustHubDesk, TrustHubPhone } from '@/features/command/views/TrustHubViews';

/** Maple Command › Trust & Safety: teacher verification, course quality, copyright, safeguarding, reports and appeals (inventory 72). */
export default function TrustScreen() {
  return <CommandRoute desk={TrustHubDesk} phone={TrustHubPhone} title="Trust and safety" subtitle="Everything that needs a person, with the AI's first read" />;
}
