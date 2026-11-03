import { CommandRoute } from '@/features/command/kit/CommandRoute';
import { TaxDesk, TaxPhone } from '@/features/command/views/TaxViews';

/** Maple Command › Finance › Tax & Compliance (`/(command)/finance/tax`). */
export default function TaxScreen() {
  return <CommandRoute desk={TaxDesk} phone={TaxPhone} title="Tax & Compliance" subtitle="VAT, withholding tax and eFRIS" />;
}
