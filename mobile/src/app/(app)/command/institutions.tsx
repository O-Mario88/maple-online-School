import { CommandRoute } from '@/features/command/kit/CommandRoute';
import { InstitutionsDesk, InstitutionsPhone } from '@/features/command/views/InstitutionsViews';

/** Maple Command › Institutional Tenants & School Onboarding Pipeline (`/(command)/institutions`). */
export default function InstitutionsScreen() {
  return <CommandRoute desk={InstitutionsDesk} phone={InstitutionsPhone} title="Schools" subtitle="Registered schools, bottom-up opportunities, contracts and tenant quotas" />;
}
