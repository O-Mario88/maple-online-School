import { useShell } from '@/components/ui';
import { PricingDesk } from '@/features/access/PricingDesk';
import { PricingPhone } from '@/features/access/PricingPhone';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
import { useAccess } from '@/lib/access/access-context';

/**
 * Pricing: the plans that continue the free month, in the menu for learners, teachers and schools.
 * Once the month has ended the app sends people here.
 */
export default function PricingScreen() {
  const { access } = useAccess();
  const { wide } = useShell();
  if (!access) return <PreviewScreen back title="Pricing">{() => null}</PreviewScreen>;
  return wide ? <PricingDesk /> : <PricingPhone />;
}
